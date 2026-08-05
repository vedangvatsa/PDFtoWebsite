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

/** Same-company open roles for internal linking (excludes current job). */
export async function fetchRelatedJobs(
  job: JobRow,
  limit = 6
): Promise<RelatedJobCard[]> {
  const company = job.company;
  if (!company) return [];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  try {
    const result = await withTimeoutFallback(
      supabaseAdmin
        .from('jobs')
        .select('id, title, company, location, external_id, description, published_at, created_at')
        .eq('company', company)
        .neq('id', job.id)
        .gt('created_at', thirtyDaysAgo)
        .or(`published_at.is.null,published_at.gt.${thirtyDaysAgo}`)
        .order('created_at', { ascending: false })
        .limit(Math.min(40, limit * 5)),
      DB_BUDGET.fast,
      { data: null, error: { message: 'timeout' } } as any,
      `related-jobs:${companyToSlug(company)}`
    );
    const rows = (result.data || []) as JobRow[];
    const cards: RelatedJobCard[] = [];
    for (const row of rows) {
      // Prefer indexable bodies; fall back so thin pages still get some links
      if (!isJobDescriptionIndexable(row.description) && cards.length >= 2) continue;
      const path = jobPublicPath(row);
      cards.push({
        id: row.id,
        title: cleanPublishText(row.title),
        location: cleanPublishText(normalizeLocation(row.location || '')),
        href: path,
      });
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
function parseBaseSalary(salary: string | null | undefined): Record<string, unknown> | undefined {
  if (!salary) return undefined;
  const s = salary.replace(/,/g, '').trim();
  // $120000-$180000 / $120k–$180k / 120000 - 180000 USD
  const range = s.match(
    /\$?\s*(\d{2,3}(?:\.\d+)?)\s*k?\s*[-–—to]+\s*\$?\s*(\d{2,3}(?:\.\d+)?)\s*k?/i
  );
  const single = s.match(/\$?\s*(\d{2,3}(?:\.\d+)?)\s*k\b/i) || s.match(/\$\s*(\d{5,7})\b/);
  const currency = /\b(eur|€)\b/i.test(s) ? 'EUR' : /\b(gbp|£)\b/i.test(s) ? 'GBP' : 'USD';
  const toNum = (raw: string, hadK: boolean) => {
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return null;
    if (hadK || n < 1000) return Math.round(n * 1000);
    return Math.round(n);
  };
  if (range) {
    const hadK = /k/i.test(s);
    const min = toNum(range[1], hadK || parseFloat(range[1]) < 1000);
    const max = toNum(range[2], hadK || parseFloat(range[2]) < 1000);
    if (min && max) {
      return {
        '@type': 'MonetaryAmount',
        currency,
        value: {
          '@type': 'QuantitativeValue',
          minValue: Math.min(min, max),
          maxValue: Math.max(min, max),
          unitText: /hour|hr\b|\/hr/i.test(s) ? 'HOUR' : 'YEAR',
        },
      };
    }
  }
  if (single) {
    const hadK = /k/i.test(single[0]);
    const val = toNum(single[1], hadK);
    if (val) {
      return {
        '@type': 'MonetaryAmount',
        currency,
        value: {
          '@type': 'QuantitativeValue',
          value: val,
          unitText: /hour|hr\b|\/hr/i.test(s) ? 'HOUR' : 'YEAR',
        },
      };
    }
  }
  return undefined;
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

  if (detail.location && !remote) {
    jsonLd.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: detail.location,
      },
    };
  } else if (detail.location && remote) {
    // Hybrid remote + city string still useful as jobLocation
    jsonLd.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: detail.location,
      },
    };
  }

  const salary = parseBaseSalary(job.salary);
  if (salary) jsonLd.baseSalary = salary;

  return jsonLd;
}

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
