/**
 * Shared loaders for job detail pages (/jobs/{id} and /{company}/{jobSlug}).
 * Public path is cache-first + hard-timeout (see job-snapshots.ts).
 */
import { cookies } from 'next/headers';
import { createAnonFromCookieStore } from '@/utils/supabase/anon';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { normalizeLocation } from '@/lib/normalize-location';
import { companyDisplayName } from '@/lib/company-directory';
import {
  formatJobDescription,
  jobDescriptionExcerpt,
  jobDescriptionPlainText,
  jobDescriptionWordCount,
  isJobDescriptionIndexable,
  isJobId,
  isShortJobSlug,
  companyToSlug,
  shortJobSlug,
  jobStoredSlug,
  jobPublicPath,
  jobTypeLabel,
  cleanJobTitle,
  cleanSalaryDisplay,
  looksLikeFellowship,
  JOB_INDEXABLE_MIN_WORDS,
} from '@/lib/job-description';
import { cleanPublishText } from '@/lib/noslop';
import { companyAboutForJob } from '@/lib/company-about';
import {
  assembleJobPage,
  looksLikeOwnedJobCopy,
  looksLikeRawAts,
} from '@/lib/job-assemble';
import type { JobDetail, RelatedJobCard } from '@/app/jobs/[id]/job-detail-client';
import {
  getCachedJobById,
  getCachedJobByCompanyAndSlug,
} from '@/lib/job-snapshots';
import { withTimeoutFallback, DB_BUDGET } from '@/lib/db-timeout';
import { isJobExpired } from '@/lib/job-age';
import { isBannedJobTitle } from '@/lib/banned-jobs.mjs';
import { filterMeaningfulSkillTags } from '@/lib/job-skill-tags';
import { shouldListJobOnBoard } from '@/lib/job-apply-source';
import {
  isTrustedCompanyDomain,
  primaryCompanyLogoUrl,
  trustedCompanyWebsiteUrl,
} from '@/lib/company-logo';

export type JobRow = {
  id: string;
  title: string;
  company: string;
  company_logo: string | null;
  location: string | null;
  job_type: string | null;
  salary: string | null;
  tags: string[] | null;
  apply_url: string;
  category: string | null;
  source: string;
  published_at: string | null;
  created_at: string | null;
  description: string | null;
  external_id: string | null;
  slug: string | null;
};

export async function fetchJobById(id: string): Promise<JobRow | null> {
  if (!isJobId(id)) return null;
  return getCachedJobById(id);
}

/** Resolve `/google/mkt` via external_id = google_mkt + company match. */
export async function fetchJobByCompanyAndSlug(
  companySlug: string,
  jobSlug: string
): Promise<JobRow | null> {
  if (!companySlug || !isShortJobSlug(jobSlug)) return null;
  return getCachedJobByCompanyAndSlug(companySlug, jobSlug);
}

export async function toJobDetail(job: JobRow): Promise<JobDetail> {
  const location = cleanPublishText(normalizeLocation(job.location || ''));
  const published = await publishSafeDescription(job, location);
  const title = cleanJobTitle(job.title);
  const company = companyDisplayName(cleanPublishText(job.company), job.apply_url);
  const salary =
    cleanSalaryDisplay(job.salary) ||
    cleanSalaryDisplay(extractSalaryFromText(job.description || published.plain));
  return {
    id: job.id,
    title,
    company,
    company_logo: job.company_logo,
    location,
    job_type: job.job_type,
    salary,
    tags: job.tags || [],
    apply_url: job.apply_url,
    category: job.category,
    source: job.source,
    published_at: job.published_at,
    created_at: job.created_at,
    description_html: published.html,
    description_plain: published.plain,
    has_description: true,
    description_kind: published.kind === 'company' ? 'company' : 'job',
    excerpt: published.indexable
      ? jobDescriptionExcerpt(published.plain, 200, {
          title,
          company,
        })
      : published.plain
        ? published.plain.slice(0, 200)
        : `${title} at ${company}.${location ? ` ${location}.` : ''}`,
    description_word_count: published.wordCount,
    is_indexable: published.indexable,
    company_slug: companyToSlug(job.company),
    job_slug: jobStoredSlug(job) ?? shortJobSlug(job.company, job.external_id),
    public_path: jobPublicPath(job),
    expired: isJobExpired(job.published_at, job.created_at),
  };
}

/**
 * Trusted curated paraphrases publish as-is (owned headings, no raw ATS).
 * Otherwise a factual stub: listing metadata + owned company about.
 * Never invent duties. Never publish raw ATS.
 */
export type PublishedDescription = {
  isCurated: boolean;
  kind: 'curated' | 'assembled' | 'company';
  html: string;
  plain: string;
  wordCount: number;
  indexable: boolean;
};

async function companyAboutFallback(job: JobRow, location: string): Promise<PublishedDescription> {
  const rawCompany = cleanPublishText(job.company);
  const company = companyDisplayName(rawCompany, job.apply_url);
  const title = cleanJobTitle(job.title);
  const about = await companyAboutForJob(company, {
    title,
    location,
    slug: companyToSlug(job.company),
  });
  const html = formatJobDescription(about, location, {
    title,
    company,
    rawCompany,
    applyUrl: job.apply_url,
    isFellowship: looksLikeFellowship(job),
  });
  const plain = jobDescriptionPlainText(about);
  return {
    isCurated: false,
    kind: 'company',
    html,
    plain,
    wordCount: jobDescriptionWordCount(about),
    indexable: false,
  };
}

export async function publishSafeDescription(job: JobRow, location: string): Promise<PublishedDescription> {
  const title = cleanJobTitle(job.title);
  const rawCompany = cleanPublishText(job.company);
  const company = companyDisplayName(rawCompany, job.apply_url);
  const isFellowship = looksLikeFellowship(job);
  const isCurated = Array.isArray(job.tags) && job.tags.includes('curated-jd');
  const raw = job.description;

  // Any owned rewrite (not raw ATS) publishes after the shared sanitizer.
  // Indexability uses the cleaned body so padding/leaks cannot inflate SEO.
  if (
    raw &&
    looksLikeOwnedJobCopy(raw) &&
    !looksLikeRawAts(raw) &&
    !/\[placeholder\]|lorem ipsum/i.test(raw)
  ) {
    const html = formatJobDescription(raw, location, {
      title,
      company,
      rawCompany,
      applyUrl: job.apply_url,
      isFellowship,
    });
    const plain = jobDescriptionPlainText(html);
    const wordCount = jobDescriptionWordCount(plain);
    if (wordCount >= 40) {
      return {
        isCurated,
        kind: 'curated',
        html,
        plain,
        wordCount,
        indexable: isCurated && wordCount >= JOB_INDEXABLE_MIN_WORDS,
      };
    }
  }

  const assembled = await assembleJobPage({ ...job, location });
  if (assembled.ok) {
    return {
      isCurated: false,
      kind: 'assembled',
      html: assembled.html,
      plain: assembled.plain,
      wordCount: assembled.wordCount,
      indexable: false,
    };
  }

  return await companyAboutFallback(job, location);
}

const TITLE_STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'for', 'in', 'on', 'at', 'by', 'with',
  'senior', 'junior', 'staff', 'principal', 'lead', 'sr', 'jr', 'i', 'ii', 'iii',
  'iv', 'remote', 'hybrid', 'full', 'time', 'part', 'contract', 'intern', 'internship',
  'fellow', 'fellowship', 'fellows',
]);

/** Extract searchable tokens from a job title for related-role matching. */
export function titleSearchTokens(title: string, max = 4): string[] {
  const raw = String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s/-]/g, ' ')
    .split(/[\s/|,–—-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !TITLE_STOP.has(t) && !/^\d+$/.test(t));
  const out: string[] = [];
  const seen = new Set<string>();
  for (const t of raw) {
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

function rowToRelatedCard(row: JobRow): RelatedJobCard {
  return {
    id: row.id,
    title: cleanJobTitle(row.title),
    location: cleanPublishText(normalizeLocation(row.location || '')),
    href: jobPublicPath(row),
  };
}

function scoreRelated(row: JobRow, job: JobRow, titleTokens: string[]): number {
  let s = 0;
  const sameCompany =
    !!row.company &&
    !!job.company &&
    row.company.toLowerCase() === job.company.toLowerCase();
  if (sameCompany) s += 50;
  const rt = (row.title || '').toLowerCase();
  let titleHits = 0;
  for (const t of titleTokens) {
    if (rt.includes(t)) {
      s += 12;
      titleHits += 1;
    }
  }
  const jobTags = new Set(
    filterMeaningfulSkillTags(job.tags || [], { companyName: job.company }).map((t) =>
      t.toLowerCase()
    )
  );
  for (const t of filterMeaningfulSkillTags(row.tags || [], { companyName: row.company })) {
    if (jobTags.has(String(t).toLowerCase())) s += 8;
  }
  if (isJobDescriptionIndexable(row.description)) s += 5;
  // Other-company "related" needs a real title overlap — shared "AI"/"fellowship"
  // tags otherwise dump Google fellowships onto a Constellation page.
  if (!sameCompany && titleHits === 0) return 0;
  return s;
}

const RELATED_NON_ENGLISH =
  /\b(und|oder|für|mit|bei|gmbh|ingénieur|développeur|responsable|ingeniero|desarrollador|medewerker)\b|[äöüßñç]{2,}/i;

/**
 * Related open roles for internal linking:
 * 1) same company  2) similar title tokens  3) shared tags
 */
export async function fetchRelatedJobs(
  job: JobRow,
  limit = 6
): Promise<RelatedJobCard[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const titleTokens = titleSearchTokens(job.title, 4);
  const selectCols =
    'id, title, company, location, external_id, slug, description, published_at, created_at, tags, apply_url';

  try {
    const queries: PromiseLike<{ data: any }>[] = [];

    // Same company
    if (job.company) {
      queries.push(
        withTimeoutFallback(
          supabaseAdmin
            .from('jobs')
            .select(selectCols)
            .contains('tags', ['curated-jd'])
            .eq('company', job.company)
            .neq('id', job.id)
            .gt('created_at', thirtyDaysAgo)
            .or(`published_at.is.null,published_at.gt.${thirtyDaysAgo}`)
            .order('created_at', { ascending: false })
            .limit(24),
          DB_BUDGET.fast,
          { data: null } as any,
          `related-co:${companyToSlug(job.company)}`
        )
      );
    }

    // Similar titles (top 2 tokens as ILIKE or-filter). created_at window only —
    // chaining multiple .or() breaks PostgREST filters.
    if (titleTokens.length) {
      const orTitle = titleTokens
        .slice(0, 2)
        .map((t) => `title.ilike.%${t.replace(/[%_,.()]/g, '')}%`)
        .join(',');
      if (orTitle) {
        queries.push(
          withTimeoutFallback(
              supabaseAdmin
                .from('jobs')
                .select(selectCols)
                .contains('tags', ['curated-jd'])
                .or(orTitle)
              .neq('id', job.id)
              .gt('created_at', thirtyDaysAgo)
              .order('created_at', { ascending: false })
              .limit(30),
            DB_BUDGET.fast,
            { data: null } as any,
            `related-title:${titleTokens.slice(0, 2).join('-')}`
          )
        );
      }
    }

    // Shared tag (first meaningful skill — skip "fellowship"/"AI" noise)
    const tag = filterMeaningfulSkillTags(job.tags || [], { companyName: job.company }).find(
      (t) => t && String(t).length >= 2 && String(t).length <= 32
    );
    if (tag) {
      queries.push(
        withTimeoutFallback(
          supabaseAdmin
            .from('jobs')
            .select(selectCols)
            .contains('tags', ['curated-jd', tag])
            .neq('id', job.id)
            .gt('created_at', thirtyDaysAgo)
            .order('created_at', { ascending: false })
            .limit(20),
          DB_BUDGET.fast,
          { data: null } as any,
          `related-tag:${String(tag).slice(0, 20)}`
        )
      );
    }

    const results = await Promise.all(queries);
    const byId = new Map<string, JobRow>();
    for (const r of results) {
      for (const row of (r.data || []) as JobRow[]) {
        if (!row?.id || row.id === job.id) continue;
        if (!byId.has(row.id)) byId.set(row.id, row);
      }
    }

    const ranked = [...byId.values()]
      .filter((row) => {
        if (!shouldListJobOnBoard(row)) return false;
        if (RELATED_NON_ENGLISH.test(row.title || '')) return false;
        return true;
      })
      .map((row) => ({ row, score: scoreRelated(row, job, titleTokens) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    const cards: RelatedJobCard[] = [];
    for (const { row } of ranked) {
      cards.push(rowToRelatedCard(row));
      if (cards.length >= limit) break;
    }
    return cards;
  } catch {
    return [];
  }
}

export async function getViewerJobContext(): Promise<{
  userSkills: string[];
  profileComplete: boolean;
  isAuthenticated: boolean;
}> {
  const empty = {
    userSkills: [] as string[],
    profileComplete: false,
    isAuthenticated: false,
  };
  // Auth must not block job page render when Supabase is slow.
  return withTimeoutFallback(
    (async () => {
      try {
        const cookieStore = await cookies();
        const anonClient = createAnonFromCookieStore(cookieStore);
        const {
          data: { user },
        } = await anonClient.auth.getUser();
        if (!user) return empty;

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('skills, about')
          .eq('id', user.id)
          .single();

        if (!profile) {
          return { ...empty, isAuthenticated: true };
        }
        const userSkills = (profile.skills || [])
          .map((s: string) => s.trim())
          .filter(Boolean);
        return {
          userSkills,
          profileComplete: !!profile.about && userSkills.length > 0,
          isAuthenticated: true,
        };
      } catch {
        return empty;
      }
    })(),
    DB_BUDGET.fast,
    empty,
    'viewer-job-context'
  );
}

export async function buildJobMetadata(job: JobRow, siteUrl: string) {
  const location = cleanPublishText(normalizeLocation(job.location || ''));
  const type = jobTypeLabel(job.job_type, job);
  const jobTitle = cleanJobTitle(job.title);
  const company = companyDisplayName(cleanPublishText(job.company), job.apply_url);
  const expired = isJobExpired(job.published_at, job.created_at);
  const title = expired
    ? `${jobTitle} at ${company} (closed)`
    : `${jobTitle} at ${company}${type ? ` (${type})` : ''}`;
  const locationSuffix = location ? `${location}. ` : '';
  const fallback = expired
    ? `${jobTitle} at ${company}. ${locationSuffix}This posting is closed.`
    : `${jobTitle} at ${company}. ${locationSuffix}Apply on CVin.Bio.`;
  // Raw scraped bodies are never used in meta (plagiarism guard) — only
  // curated rewritten bodies. Uncurated pages use company about when we have it.
  const published = await publishSafeDescription(job, location);
  const excerpt = published.indexable
    ? jobDescriptionExcerpt(published.plain, 140, { title: jobTitle, company })
    : published.plain && published.plain.length > 40
      ? published.plain.slice(0, 140)
      : '';
  const description = excerpt || fallback;
  const canonical = `${siteUrl}${jobPublicPath(job)}`;
  // Closed is not a noindex reason. Thin bodies stay noindex. See docs/JOB_PAGE_RULES.md.
  const indexable = published.indexable;

  return {
    title,
    description: description.slice(0, 160),
    alternates: { canonical },
    openGraph: {
      type: 'website' as const,
      url: canonical,
      title,
      description: description.slice(0, 160),
      siteName: 'CVin.Bio',
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description: description.slice(0, 160),
    },
    // Thin / meta-seed JDs: follow for equity, noindex until body is enriched
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  full_time: 'FULL_TIME',
  'full-time': 'FULL_TIME',
  'full time': 'FULL_TIME',
  part_time: 'PART_TIME',
  'part-time': 'PART_TIME',
  'part time': 'PART_TIME',
  contract: 'CONTRACTOR',
  contractor: 'CONTRACTOR',
  internship: 'INTERN',
  intern: 'INTERN',
  freelance: 'OTHER',
  temporary: 'TEMPORARY',
  fellowship: 'OTHER',
  volunteer: 'VOLUNTEER',
};

/** Google applicantLocationRequirements examples use names like "USA", not "US". */
const GOOGLE_COUNTRY_NAME: Record<string, string> = {
  US: 'USA', GB: 'United Kingdom', DE: 'Germany', FR: 'France', CA: 'Canada',
  IN: 'India', AU: 'Australia', NL: 'Netherlands', SG: 'Singapore', IE: 'Ireland',
  ES: 'Spain', IT: 'Italy', BR: 'Brazil', JP: 'Japan', MX: 'Mexico', PL: 'Poland',
  SE: 'Sweden', CH: 'Switzerland', PT: 'Portugal', IL: 'Israel', KR: 'South Korea',
  HK: 'Hong Kong', NZ: 'New Zealand', AE: 'United Arab Emirates', AT: 'Austria',
  BE: 'Belgium', DK: 'Denmark', FI: 'Finland', NO: 'Norway', CZ: 'Czech Republic',
  RO: 'Romania', HU: 'Hungary', PH: 'Philippines', MY: 'Malaysia', ID: 'Indonesia',
  VN: 'Vietnam', TH: 'Thailand', TW: 'Taiwan', AR: 'Argentina', CO: 'Colombia',
  CL: 'Chile', ZA: 'South Africa', PK: 'Pakistan', NG: 'Nigeria', KE: 'Kenya',
  BD: 'Bangladesh', UA: 'Ukraine', TR: 'Turkey',
};

function isRemoteLocation(location: string | null | undefined): boolean {
  if (!location) return false;
  return /\bremote\b|work from home|\bwfh\b|distributed|anywhere|fully remote|remote-first|remote first/i.test(
    location
  );
}

function isHybridLocation(location: string | null | undefined): boolean {
  return /\bhybrid\b/i.test(String(location || ''));
}

/** ISO 3166-1 alpha-2, or null. Never "Worldwide" — Google rejects that as a Country. */
function isoCountryCode(value: string | null | undefined): string | null {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  if (/^(worldwide|global|anywhere|earth|remote)$/i.test(raw)) return null;
  const aliased = COUNTRY_ALIASES[raw.toLowerCase()];
  if (aliased) return aliased;
  const up = raw.toUpperCase();
  if (up === 'UK') return 'GB';
  if (/^[A-Z]{2}$/.test(up) && !US_STATE_ABBR.has(up)) return up;
  return null;
}

function countryRequirementName(iso: string): string {
  return GOOGLE_COUNTRY_NAME[iso] || iso;
}

function inferCountryFromLocation(location: string | null | undefined): string | null {
  const s = String(location || '');
  if (!s) return null;
  const tagged = s.match(
    /\b(?:remote|hybrid)\s*[-–—,:(]?\s*(USA|US|UK|GB|CA|IN|DE|AU|NL|SG|IE|FR|ES|IT|BR|JP|MX)\b/i
  );
  if (tagged?.[1]) return isoCountryCode(tagged[1]);
  const trailing = s.match(/[,(\s](USA|UK|US|GB|CA|IN|DE|AU|NL|SG|IE|FR)\s*\)?\s*$/i);
  if (trailing?.[1]) return isoCountryCode(trailing[1]);
  for (const [alias, iso] of Object.entries(COUNTRY_ALIASES)) {
    // Skip 2-letter codes ("in", "us") — they match English words.
    if (alias.length < 3) continue;
    const re = new RegExp(`(?:^|[^a-z])${alias.replace(/\./g, '\\.')}(?:[^a-z]|$)`, 'i');
    if (re.test(s)) return iso;
  }
  return null;
}

function inferEmploymentType(job: JobRow): string | undefined {
  const key = (job.job_type || '').toLowerCase().replace(/-/g, '_');
  const mapped =
    EMPLOYMENT_TYPE_MAP[job.job_type || ''] ||
    EMPLOYMENT_TYPE_MAP[key] ||
    EMPLOYMENT_TYPE_MAP[(job.job_type || '').toLowerCase()];
  if (mapped) return mapped;
  if (looksLikeFellowship(job)) return 'OTHER';
  const blob = `${job.job_type || ''} ${job.title || ''} ${(job.tags || []).join(' ')} ${job.category || ''}`.toLowerCase();
  if (/\bintern(ship)?s?\b/.test(blob)) return 'INTERN';
  if (/\bpart[\s_-]*time\b/.test(blob)) return 'PART_TIME';
  if (/\bcontract(or|ing)?\b/.test(blob)) return 'CONTRACTOR';
  if (/\bfreelance\b/.test(blob)) return 'OTHER';
  if (/\btemp(orary)?\b/.test(blob)) return 'TEMPORARY';
  if (/\bfull[\s_-]*time\b/.test(blob)) return 'FULL_TIME';
  return undefined;
}

/** Best-effort parse of free-text salary into schema.org MonetaryAmount. */
export function parseBaseSalary(salary: string | null | undefined): Record<string, unknown> | undefined {
  if (!salary) return undefined;
  let s = salary.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  // Normalize "120-180k" and "USD 120000"
  s = s.replace(/(\d)\s*k\b/gi, '$1k');
  const currency = /\b(eur|€)\b/i.test(s)
    ? 'EUR'
    : /\b(gbp|£|pound)\b/i.test(s)
      ? 'GBP'
      : /\b(inr|₹|rs\.?)\b/i.test(s)
        ? 'INR'
        : /\b(cad|c\$)\b/i.test(s)
          ? 'CAD'
          : /\b(aud|a\$)\b/i.test(s)
            ? 'AUD'
            : 'USD';
  const unitText = /hour|\/\s*hr|hourly|per hour/i.test(s)
    ? 'HOUR'
    : /month|\/\s*mo|monthly/i.test(s)
      ? 'MONTH'
      : 'YEAR';

  const toNum = (raw: string, forceK?: boolean) => {
    const cleaned = raw.replace(/[^\d.]/g, '');
    const n = parseFloat(cleaned);
    if (!Number.isFinite(n) || n <= 0) return null;
    if (forceK || /k$/i.test(raw.trim()) || (n > 0 && n < 1000 && unitText === 'YEAR')) {
      return Math.round(n * 1000);
    }
    return Math.round(n);
  };

  // Ranges: $120k-$180k | 120000-180000 | $120,000 – $180,000 | 120k to 180k
  const range = s.match(
    /([€$£₹]?\s*\d+(?:\.\d+)?k?)\s*(?:[-–—]|to)\s*([€$£₹]?\s*\d+(?:\.\d+)?k?)/i
  );
  if (range) {
    const min = toNum(range[1], /k/i.test(range[1]));
    const max = toNum(range[2], /k/i.test(range[2]));
    if (min && max && min < max * 5 && max > min) {
      return {
        '@type': 'MonetaryAmount',
        currency,
        value: {
          '@type': 'QuantitativeValue',
          minValue: Math.min(min, max),
          maxValue: Math.max(min, max),
          unitText,
        },
      };
    }
  }

  // Single: $150k | USD 150000 | 150000/year
  const single =
    s.match(/[€$£₹]\s*(\d+(?:\.\d+)?)\s*k\b/i) ||
    s.match(/\b(\d+(?:\.\d+)?)\s*k\b/i) ||
    s.match(/[€$£₹]\s*(\d{4,7})\b/) ||
    s.match(/\b(\d{5,7})\b/);
  if (single) {
    const val = toNum(single[0].includes('k') || single[0].includes('K') ? `${single[1]}k` : single[1]);
    if (val && val >= 1000) {
      return {
        '@type': 'MonetaryAmount',
        currency,
        value: {
          '@type': 'QuantitativeValue',
          value: val,
          unitText,
        },
      };
    }
  }
  return undefined;
}

const US_STATE_ABBR = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]);

const COUNTRY_ALIASES: Record<string, string> = {
  usa: 'US', us: 'US', 'u.s.': 'US', 'u.s.a.': 'US',
  'united states': 'US', 'united states of america': 'US',
  uk: 'GB', 'u.k.': 'GB', 'united kingdom': 'GB', 'great britain': 'GB', england: 'GB',
  scotland: 'GB', wales: 'GB',
  germany: 'DE', deutschland: 'DE', france: 'FR', canada: 'CA', india: 'IN',
  australia: 'AU', netherlands: 'NL', 'the netherlands': 'NL', singapore: 'SG', ireland: 'IE', spain: 'ES',
  italy: 'IT', brazil: 'BR', japan: 'JP', mexico: 'MX', poland: 'PL', sweden: 'SE',
  switzerland: 'CH', portugal: 'PT', israel: 'IL', 'south korea': 'KR', korea: 'KR',
  'hong kong': 'HK', 'new zealand': 'NZ', uae: 'AE', 'united arab emirates': 'AE',
  austria: 'AT', belgium: 'BE', denmark: 'DK', finland: 'FI', norway: 'NO',
  'czech republic': 'CZ', czechia: 'CZ', romania: 'RO', hungary: 'HU',
  philippines: 'PH', malaysia: 'MY', indonesia: 'ID', vietnam: 'VN', thailand: 'TH',
  taiwan: 'TW', argentina: 'AR', colombia: 'CO', chile: 'CL',
  'south africa': 'ZA', pakistan: 'PK', nigeria: 'NG', kenya: 'KE',
  bangladesh: 'BD', ukraine: 'UA', turkey: 'TR',
};

/** Known city → country ISO, from the site's own curated city dataset. */
const CITY_COUNTRY: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  try {
    const cities = require('./nomad-cities.json') as Array<{ name: string; countryCode: string }>;
    for (const c of cities) {
      if (c.name && c.countryCode) out[c.name.toLowerCase()] = String(c.countryCode).toUpperCase();
    }
  } catch {
    /* optional dataset */
  }
  return out;
})();

/**
 * Parse free-text location into PostalAddress for JobPosting.
 * Uses RAW ATS location (do not collapse via display normalizeLocation — that maps
 * "San Francisco" → "USA" and destroys city-level Google Jobs structure).
 * Extracts streetAddress and postalCode when the raw text carries them, and
 * infers country from known city names — all real data, never invented.
 */
export function parseJobLocationAddress(
  location: string | null | undefined
): Record<string, unknown> | undefined {
  if (!location) return undefined;
  // Light clean only — keep city/region tokens for schema
  const loc = cleanPublishText(
    String(location)
      .replace(/\s+/g, ' ')
      .replace(/\s*\((?:hybrid|remote|onsite|on-site|in-office|office)[^)]*\)/gi, ' ')
      .replace(/\b(remote|hybrid|onsite|on-site)\b/gi, (m) => m)
      .trim()
  );
  if (!loc) return undefined;

  // Strip leading "Remote - " / "Remote," wrappers for address parts
  const stripped = loc
    .replace(/^(remote|hybrid)\s*[-–—:,|]\s*/i, '')
    .replace(/\s*[-–—|,]\s*(remote|hybrid)\s*$/i, '')
    .trim() || loc;

  let parts = stripped
    .split(',')
    .map((p) => p.replace(/\s*\((?:hybrid|remote|onsite|on-site)[^)]*\)/gi, '').trim())
    .filter(Boolean)
    .filter((p) => !/^(remote|hybrid|onsite|on-site)$/i.test(p));

  if (!parts.length) return undefined;

  const address: Record<string, unknown> = { '@type': 'PostalAddress' };

  // --- postalCode: real postcodes embedded in the raw location text ---
  const POSTAL_RES = [
    /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i, // UK
    /\b\d{5}(?:-\d{4})?\b/, // US / 5-digit
    /\b[A-Z]\d[A-Z]\s*\d[A-Z]\d\b/i, // CA
    /\b\d{4}\s?[A-Z]{2}\b/i, // NL
  ];
  for (const re of POSTAL_RES) {
    const pm = stripped.match(re);
    if (pm) {
      address.postalCode = pm[0].replace(/\s+/g, ' ').toUpperCase();
      parts = parts.map((p) => p.replace(re, '').trim()).filter(Boolean);
      break;
    }
  }

  // --- streetAddress: a part that starts with a house number ---
  const streetIdx = parts.findIndex((p) => /^\d{1,5}[a-zA-Z]?\s+[A-Za-z]/.test(p) && p.length >= 8 && p.length <= 80);
  if (streetIdx >= 0) {
    address.streetAddress = parts[streetIdx];
    parts.splice(streetIdx, 1);
  }
  if (!parts.length) return address;

  const last = parts[parts.length - 1];
  const lastLower = last.toLowerCase();
  const lastCountry = COUNTRY_ALIASES[lastLower] || (/^[A-Z]{2}$/i.test(last) && !US_STATE_ABBR.has(last.toUpperCase()) ? last.toUpperCase() : null);

  if (parts.length >= 3) {
    address.addressLocality = parts[0];
    // middle may be state
    const mid = parts[1];
    if (US_STATE_ABBR.has(mid.toUpperCase()) || mid.length <= 20) {
      address.addressRegion = US_STATE_ABBR.has(mid.toUpperCase()) ? mid.toUpperCase() : mid;
    } else {
      address.addressRegion = mid;
    }
    address.addressCountry = lastCountry || isoCountryCode(last);
  } else if (parts.length === 2) {
    address.addressLocality = parts[0];
    const regionRaw = parts[1].replace(/\s*\([^)]*\)/g, '').trim();
    const regionState = regionRaw.toUpperCase();
    if (lastCountry) {
      address.addressCountry = lastCountry;
      if (!US_STATE_ABBR.has(regionState) && !isoCountryCode(regionRaw)) {
        address.addressRegion = regionRaw;
      } else if (US_STATE_ABBR.has(regionState)) {
        address.addressRegion = regionState;
      }
    } else if (US_STATE_ABBR.has(regionState)) {
      address.addressRegion = regionState;
      address.addressCountry = 'US';
    } else {
      address.addressRegion = regionRaw;
    }
  } else {
    const one = parts[0];
    if (COUNTRY_ALIASES[one.toLowerCase()]) {
      address.addressCountry = COUNTRY_ALIASES[one.toLowerCase()];
    } else if (US_STATE_ABBR.has(one.toUpperCase())) {
      address.addressRegion = one.toUpperCase();
      address.addressCountry = 'US';
    } else {
      address.addressLocality = one;
      const knownCity = CITY_COUNTRY[one.toLowerCase()];
      if (knownCity) {
        address.addressCountry = knownCity;
      } else if (/^(london|manchester|edinburgh|birmingham)$/i.test(one)) address.addressCountry = 'GB';
      else if (/^(berlin|munich|münchen|hamburg)$/i.test(one)) address.addressCountry = 'DE';
      else if (/^(paris|lyon|marseille)$/i.test(one)) address.addressCountry = 'FR';
      else if (/^(toronto|vancouver|montreal|ottawa)$/i.test(one)) address.addressCountry = 'CA';
      else if (/^(bangalore|bengaluru|mumbai|delhi|hyderabad|chennai|pune)$/i.test(one)) {
        address.addressCountry = 'IN';
      } else if (/^(singapore)$/i.test(one)) address.addressCountry = 'SG';
      else if (
        /^(san francisco|new york|nyc|seattle|austin|boston|chicago|los angeles|denver|atlanta|miami)$/i.test(
          one
        )
      ) {
        address.addressCountry = 'US';
      }
    }
    const inferred = !address.addressCountry ? inferCountryFromLocation(stripped) : null;
    if (inferred) address.addressCountry = inferred;
  }

  if (!address.addressCountry) {
    const fromLoc = inferCountryFromLocation(stripped) || inferCountryFromLocation(loc);
    if (fromLoc) address.addressCountry = fromLoc;
  }
  if (!address.addressCountry && address.addressLocality) {
    const city = String(address.addressLocality).toLowerCase();
    if (CITY_COUNTRY[city]) address.addressCountry = CITY_COUNTRY[city];
  }
  if (!address.addressCountry && US_STATE_ABBR.has(String(address.addressRegion || '').toUpperCase())) {
    address.addressCountry = 'US';
  }
  const countryIso = isoCountryCode(address.addressCountry as string);
  if (countryIso) address.addressCountry = countryIso;
  else delete address.addressCountry;

  return address;
}

/** Pull compensation from JD body when salary column empty. */
export function extractSalaryFromText(text: string | null | undefined): string | null {
  if (!text) return null;
  const plain = jobDescriptionPlainText(text).slice(0, 4000);
  const patterns = [
    /(?:salary|compensation|pay|base)\s*(?:range)?\s*[:\-]?\s*(\$?\s*\d[\d,]*(?:\.\d+)?\s*k?\s*(?:USD|EUR|GBP|CAD|AUD)?\s*[-–—to]+\s*\$?\s*\d[\d,]*(?:\.\d+)?\s*k?\s*(?:USD|EUR|GBP|CAD|AUD)?)/i,
    /(\$\s*\d{2,3}\s*k\s*[-–—to]+\s*\$?\s*\d{2,3}\s*k)/i,
    /(\$\s*\d{5,7}\s*[-–—to]+\s*\$?\s*\d{5,7})/i,
    /(\d{2,3},\d{3}(?:\.\d+)?\s*(?:USD|EUR|GBP|CAD|AUD)\s*(?:[-–—]|to)\s*\d{2,3},\d{3}(?:\.\d+)?\s*(?:USD|EUR|GBP|CAD|AUD)?)/i,
    /(?:salary|compensation|pay)\s*[:\-]?\s*(\$\s*\d[\d,]*(?:\.\d+)?\s*k?)/i,
  ];
  for (const re of patterns) {
    const m = plain.match(re);
    if (m?.[1]) return m[1].replace(/\s+/g, ' ').trim();
  }
  return null;
}

/**
 * Convert published plain-text job copy into the HTML format Google requires
 * for JobPosting.description (paragraph breaks via <p>; Google recognizes
 * <p>, <ul>, <li>). Never wraps scraped HTML — input is always plain text.
 */
function escapeHtmlText(s: string): string {
  return s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function bulletText(line: string): string | null {
  const m = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.+)$/);
  return m ? m[1].trim() : null;
}

function blockToHtml(block: string): string {
  const lines = block.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return '';
  const out: string[] = [];
  let pending: string[] = [];
  const flushP = () => {
    if (!pending.length) return;
    out.push(`<p>${escapeHtmlText(pending.join(' '))}</p>`);
    pending = [];
  };
  let lis: string[] = [];
  const flushUl = () => {
    if (!lis.length) return;
    out.push(`<ul>${lis.map((b) => `<li>${escapeHtmlText(b)}</li>`).join('')}</ul>`);
    lis = [];
  };
  for (const line of lines) {
    const b = bulletText(line);
    if (b) {
      flushP();
      lis.push(b);
    } else {
      flushUl();
      pending.push(line);
    }
  }
  flushUl();
  flushP();
  return out.join('');
}

function plainToHtmlDescription(plain: string): string {
  const text = String(plain || '').trim();
  if (!text) return '';
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length === 0) return `<p>${escapeHtmlText(text)}</p>`;
  return blocks.map(blockToHtml).join('');
}

function schemaDescriptionSource(job: JobRow, detail: JobDetail): string {
  const raw = job.description || '';
  if (raw && looksLikeOwnedJobCopy(raw) && !looksLikeRawAts(raw)) {
    return String(raw)
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/[ \t]+\n/g, '\n')
      .trim();
  }
  return (
    detail.description_plain ||
    (Array.isArray(job.tags) && job.tags.includes('curated-jd')
      ? jobDescriptionPlainText(job.description)
      : '')
  );
}

export function buildJobJsonLd(
  job: JobRow,
  detail: JobDetail,
  siteUrl: string
): Record<string, unknown> | null {
  // Live Google Jobs only. Closed pages stay in regular search without JobPosting.
  if (!detail.is_indexable || detail.expired) return null;
  // Never emit JobPosting for low-level / service / hourly titles.
  if (isBannedJobTitle(detail.title) || isBannedJobTitle(job.title)) return null;

  const datePosted =
    job.published_at || job.created_at || new Date().toISOString().slice(0, 10);
  const postedMs = new Date(datePosted).getTime();
  // Garbage date strings fall back to today — never omit validThrough.
  const validThrough = new Date((Number.isFinite(postedMs) ? postedMs : Date.now()) + 30 * 24 * 60 * 60 * 1000).toISOString();

  const plain = schemaDescriptionSource(job, detail);
  // Google requires an HTML description that is a complete representation of
  // the job (responsibilities, qualifications, etc.) — never the thin fallback
  // string, which is a "description same as title" violation. When no real body
  // exists, skip JobPosting entirely instead of emitting weak markup.
  if (plain.length <= 80) return null;
  const description = plainToHtmlDescription(plain.slice(0, 8000));

  const rawLoc = job.location || detail.location || '';
  const hybrid = isHybridLocation(rawLoc) || isHybridLocation(detail.location);
  const remote =
    !hybrid && (isRemoteLocation(job.location) || isRemoteLocation(detail.location));
  const employmentType = inferEmploymentType(job);

  const org: Record<string, unknown> = {
    '@type': 'Organization',
    name: detail.company,
  };
  const officialSite = trustedCompanyWebsiteUrl(detail.company, detail.company_slug || undefined);
  if (officialSite) {
    org.sameAs = officialSite;
    org.url = officialSite;
  }
  const storedLogo = job.company_logo || '';
  const storedLogoOk =
    /^https?:\/\//i.test(storedLogo) && !/licdn\.com|linkedin\.com/i.test(storedLogo);
  if (storedLogoOk) org.logo = storedLogo;
  else if (isTrustedCompanyDomain(detail.company)) {
    org.logo = primaryCompanyLogoUrl(detail.company, null, 128);
  }

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    // Apple-documented page-level signal: content is free to read (no paywall),
    // so Applebot may use it for Siri/Spotlight answers and suggestions.
    isAccessibleForFree: true,
    title: detail.title,
    description,
    datePosted: typeof datePosted === 'string' ? datePosted.slice(0, 10) : datePosted,
    validThrough,
    hiringOrganization: org,
    identifier: {
      '@type': 'PropertyValue',
      name: detail.company,
      value: job.id,
    },
    url: `${siteUrl}${detail.public_path}`,
    directApply: false,
  };

  if (employmentType) jsonLd.employmentType = employmentType;

  // Prefer RAW job.location for schema (display may collapse cities → "USA")
  const address = parseJobLocationAddress(job.location) || parseJobLocationAddress(detail.location);
  const countryIso =
    isoCountryCode(address?.addressCountry as string) || inferCountryFromLocation(rawLoc);
  if (address && countryIso) address.addressCountry = countryIso;
  else if (address && !isoCountryCode(address.addressCountry as string)) {
    delete address.addressCountry;
  }

  if (remote) {
    jsonLd.jobLocationType = 'TELECOMMUTE';
    if (countryIso) {
      jsonLd.applicantLocationRequirements = {
        '@type': 'Country',
        name: countryRequirementName(countryIso),
      };
    }
  }

  if (address) {
    const hasCity = Boolean(address.addressLocality);
    const hasRegion = Boolean(address.addressRegion);
    const hasCountry = Boolean(isoCountryCode(address.addressCountry as string));
    if (hasCountry && (hasCity || hasRegion || remote || !hybrid)) {
      jsonLd.jobLocation = { '@type': 'Place', address };
    } else if (!remote && (hasCity || hasRegion) && countryIso) {
      address.addressCountry = countryIso;
      jsonLd.jobLocation = { '@type': 'Place', address };
    }
  }

  if (!jsonLd.jobLocation && !remote && countryIso) {
    const locality = cleanPublishText(rawLoc).replace(/\b(hybrid|onsite|on-site)\b/gi, '').replace(/\s+/g, ' ').trim();
    jsonLd.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        ...(locality ? { addressLocality: locality.slice(0, 80) } : {}),
        addressCountry: countryIso,
      },
    };
  }

  if (!jsonLd.jobLocation && !(jsonLd.jobLocationType === 'TELECOMMUTE' && jsonLd.applicantLocationRequirements)) {
    // Google requires jobLocation, or TELECOMMUTE plus a real applicant country.
    return null;
  }

  const salaryRaw = job.salary || extractSalaryFromText(job.description) || extractSalaryFromText(plain);
  const salary = parseBaseSalary(salaryRaw);
  if (salary) jsonLd.baseSalary = salary;

  const occ = String(job.category || '').trim();
  if (occ && occ.length >= 3 && occ.length < 60 && !/^https?:/i.test(occ)) {
    jsonLd.occupationalCategory = occ;
  }

  return jsonLd;
}

export {
  validateJobPostingJsonLd,
  summarizeJobPostingValidation,
} from '@/lib/job-posting-validate';

/** BreadcrumbList for job detail pages. */
export function buildJobBreadcrumbJsonLd(detail: JobDetail, siteUrl: string) {
  const items: { name: string; item: string }[] = [
    { name: 'Jobs', item: `${siteUrl}/jobs` },
  ];
  if (detail.company_slug) {
    items.push({
      name: detail.company,
      item: `${siteUrl}/${detail.company_slug}`,
    });
  }
  items.push({
    name: detail.title,
    item: `${siteUrl}${detail.public_path}`,
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };
}
