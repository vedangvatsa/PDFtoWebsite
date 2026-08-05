/**
 * Shared loaders for job detail pages (/jobs/{id} and /{company}/{jobSlug}).
 * Public path is cache-first + hard-timeout (see job-snapshots.ts).
 */
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { normalizeLocation } from '@/lib/normalize-location';
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
  jobPublicPath,
  jobTypeLabel,
} from '@/lib/job-description';
import { cleanPublishText } from '@/lib/noslop';
import type { JobDetail, RelatedJobCard } from '@/app/jobs/[id]/job-detail-client';
import {
  getCachedJobById,
  getCachedJobByCompanyAndSlug,
} from '@/lib/job-snapshots';
import { withTimeoutFallback, DB_BUDGET } from '@/lib/db-timeout';

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

export function toJobDetail(job: JobRow): JobDetail {
  const descriptionHtml = formatJobDescription(job.description);
  const wordCount = jobDescriptionWordCount(job.description);
  return {
    id: job.id,
    title: cleanPublishText(job.title),
    company: cleanPublishText(job.company),
    company_logo: job.company_logo,
    location: cleanPublishText(normalizeLocation(job.location || '')),
    job_type: job.job_type,
    salary: job.salary ? cleanPublishText(job.salary) : job.salary,
    tags: job.tags || [],
    apply_url: job.apply_url,
    category: job.category,
    source: job.source,
    published_at: job.published_at,
    created_at: job.created_at,
    description_html: descriptionHtml,
    has_description: descriptionHtml.length > 40,
    excerpt: jobDescriptionExcerpt(job.description, 200),
    description_word_count: wordCount,
    is_indexable: isJobDescriptionIndexable(job.description),
    company_slug: companyToSlug(job.company),
    job_slug: shortJobSlug(job.company, job.external_id),
    public_path: jobPublicPath(job),
  };
}

const TITLE_STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'for', 'in', 'on', 'at', 'by', 'with',
  'senior', 'junior', 'staff', 'principal', 'lead', 'sr', 'jr', 'i', 'ii', 'iii',
  'iv', 'remote', 'hybrid', 'full', 'time', 'part', 'contract', 'intern', 'internship',
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
    title: cleanPublishText(row.title),
    location: cleanPublishText(normalizeLocation(row.location || '')),
    href: jobPublicPath(row),
  };
}

function scoreRelated(row: JobRow, job: JobRow, titleTokens: string[]): number {
  let s = 0;
  if (row.company && job.company && row.company.toLowerCase() === job.company.toLowerCase()) {
    s += 50;
  }
  const rt = (row.title || '').toLowerCase();
  for (const t of titleTokens) {
    if (rt.includes(t)) s += 12;
  }
  // Shared tags / skills-ish labels
  const jobTags = new Set((job.tags || []).map((t) => t.toLowerCase()));
  for (const t of row.tags || []) {
    if (jobTags.has(String(t).toLowerCase())) s += 8;
  }
  if (isJobDescriptionIndexable(row.description)) s += 5;
  return s;
}

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
    'id, title, company, location, external_id, description, published_at, created_at, tags';

  try {
    const queries: PromiseLike<{ data: any }>[] = [];

    // Same company
    if (job.company) {
      queries.push(
        withTimeoutFallback(
          supabaseAdmin
            .from('jobs')
            .select(selectCols)
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

    // Shared tag (first meaningful tag)
    const tag = (job.tags || []).find((t) => t && String(t).length >= 2 && String(t).length <= 32);
    if (tag) {
      queries.push(
        withTimeoutFallback(
          supabaseAdmin
            .from('jobs')
            .select(selectCols)
            .contains('tags', [tag])
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
      .map((row) => ({ row, score: scoreRelated(row, job, titleTokens) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    const cards: RelatedJobCard[] = [];
    for (const { row } of ranked) {
      if (!isJobDescriptionIndexable(row.description) && cards.length >= 3) continue;
      cards.push(rowToRelatedCard(row));
      if (cards.length >= limit) break;
    }
    // Fall back: any same-company even if thin
    if (cards.length < Math.min(3, limit)) {
      for (const { row } of ranked) {
        if (cards.some((c) => c.id === row.id)) continue;
        cards.push(rowToRelatedCard(row));
        if (cards.length >= limit) break;
      }
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
        const anonClient = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll: () => cookieStore.getAll(),
            },
          }
        );
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

export function buildJobMetadata(job: JobRow, siteUrl: string) {
  const location = cleanPublishText(normalizeLocation(job.location || '') || 'Remote');
  const type = jobTypeLabel(job.job_type);
  const jobTitle = cleanPublishText(job.title);
  const company = cleanPublishText(job.company);
  const title = `${jobTitle} at ${company}${type ? ` (${type})` : ''}`;
  const excerpt = jobDescriptionExcerpt(job.description, 140);
  const description =
    excerpt || `${jobTitle} at ${company}. ${location}. Apply on CVin.Bio.`;
  const canonical = `${siteUrl}${jobPublicPath(job)}`;
  const indexable = isJobDescriptionIndexable(job.description);

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

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
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
};

function isRemoteLocation(location: string | null | undefined): boolean {
  if (!location) return false;
  return /\bremote\b|work from home|\bwfh\b|distributed|anywhere|fully remote|remote-first|remote first/i.test(
    location
  );
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

/** Parse free-text location into PostalAddress fields for JobPosting. */
export function parseJobLocationAddress(
  location: string | null | undefined
): Record<string, unknown> | undefined {
  if (!location) return undefined;
  const loc = cleanPublishText(normalizeLocation(location) || location).trim();
  if (!loc) return undefined;

  const remote = isRemoteLocation(loc);
  // "San Francisco, CA, United States" | "London, UK" | "Berlin, Germany"
  const parts = loc
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const address: Record<string, unknown> = { '@type': 'PostalAddress' };

  const countryAliases: Record<string, string> = {
    usa: 'US',
    us: 'US',
    'united states': 'US',
    'united states of america': 'US',
    uk: 'GB',
    'united kingdom': 'GB',
    'great britain': 'GB',
    england: 'GB',
    germany: 'DE',
    deutschland: 'DE',
    france: 'FR',
    canada: 'CA',
    india: 'IN',
    australia: 'AU',
    netherlands: 'NL',
    singapore: 'SG',
    ireland: 'IE',
    spain: 'ES',
    italy: 'IT',
    brazil: 'BR',
    japan: 'JP',
    'remote': 'Worldwide',
    worldwide: 'Worldwide',
    global: 'Worldwide',
    anywhere: 'Worldwide',
  };

  if (parts.length >= 3) {
    address.addressLocality = parts[0];
    address.addressRegion = parts[1];
    const c = countryAliases[parts[parts.length - 1].toLowerCase()] || parts[parts.length - 1];
    address.addressCountry = c;
  } else if (parts.length === 2) {
    address.addressLocality = parts[0];
    const maybeCountry = countryAliases[parts[1].toLowerCase()];
    if (maybeCountry) address.addressCountry = maybeCountry;
    else if (/^[A-Z]{2}$/i.test(parts[1]) && parts[1].length === 2) {
      address.addressRegion = parts[1].toUpperCase();
      address.addressCountry = 'US'; // common US state abbreviation pair
    } else {
      address.addressRegion = parts[1];
    }
  } else {
    address.addressLocality = parts[0] || loc;
    if (remote) address.addressCountry = 'Worldwide';
  }

  return address;
}

export function buildJobJsonLd(job: JobRow, detail: JobDetail, siteUrl: string) {
  const datePosted =
    job.published_at || job.created_at || new Date().toISOString().slice(0, 10);
  const postedMs = new Date(datePosted).getTime();
  const validThrough = Number.isFinite(postedMs)
    ? new Date(postedMs + 30 * 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  const plain = jobDescriptionPlainText(job.description);
  // Google wants a real description; use full plain body when available (cap size)
  const description =
    plain.length > 80
      ? plain.slice(0, 8000)
      : detail.excerpt || `${detail.title} at ${detail.company}. ${detail.location || 'Remote'}.`;

  const remote = isRemoteLocation(job.location) || isRemoteLocation(detail.location);
  const employmentKey = (job.job_type || '').toLowerCase().replace(/-/g, '_');
  const employmentType =
    EMPLOYMENT_TYPE_MAP[job.job_type || ''] ||
    EMPLOYMENT_TYPE_MAP[employmentKey] ||
    EMPLOYMENT_TYPE_MAP[(job.job_type || '').toLowerCase()] ||
    undefined;

  const org: Record<string, unknown> = {
    '@type': 'Organization',
    name: detail.company,
  };
  if (job.company_logo) org.logo = job.company_logo;
  if (detail.company_slug) {
    org.sameAs = `${siteUrl}/${detail.company_slug}`;
    org.url = `${siteUrl}/${detail.company_slug}`;
  }

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: detail.title,
    description,
    datePosted: typeof datePosted === 'string' ? datePosted.slice(0, 10) : datePosted,
    validThrough,
    hiringOrganization: org,
    identifier: {
      '@type': 'PropertyValue',
      name: 'CVin.Bio',
      value: job.id,
    },
    url: `${siteUrl}${detail.public_path}`,
    directApply: false,
  };

  if (employmentType) jsonLd.employmentType = employmentType;

  if (remote) {
    jsonLd.jobLocationType = 'TELECOMMUTE';
    // Google recommends applicantLocationRequirements for fully remote roles
    jsonLd.applicantLocationRequirements = {
      '@type': 'Country',
      name: 'Worldwide',
    };
  }

  const address = parseJobLocationAddress(job.location || detail.location);
  if (address) {
    jsonLd.jobLocation = {
      '@type': 'Place',
      address,
    };
  }

  const salary = parseBaseSalary(job.salary);
  if (salary) jsonLd.baseSalary = salary;

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
