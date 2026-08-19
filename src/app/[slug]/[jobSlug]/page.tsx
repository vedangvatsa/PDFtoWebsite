import { notFound, permanentRedirect, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  fetchJobByCompanyAndSlug,
  fetchJobById,
  toJobDetail,
  getViewerJobContext,
  buildJobMetadata,
  buildJobJsonLd,
  buildJobBreadcrumbJsonLd,
  buildJobFaqJsonLd,
  fetchRelatedJobs,
} from '@/lib/job-detail-data';
import {
  isShortJobSlug,
  jobPublicPath,
  jobStoredSlug,
  jobMatchesLegacySlugHint,
} from '@/lib/job-description';
import { canonicalCompanyHub, companyHubAliasPrefixes } from '@/lib/company-directory';
import {
  companyKeyEqualityValues,
  companyNameEqualityValues,
  jobBelongsToCompanyHub,
} from '@/lib/company-hub-query';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withTimeoutFallback, DB_BUDGET } from '@/lib/db-timeout';
import { gonePrettyJobPath } from '@/lib/seo-fallbacks';
import { isPublicJobPage, liveUncuratedApplyUrl } from '@/lib/job-apply-source';
import JobDetailClient from '@/app/jobs/[id]/job-detail-client';

// Longer ISR: job snapshots revalidate in loaders (900s); page can stay warm longer.
export const revalidate = 1800;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

type PageProps = {
  params: Promise<{ slug: string; jobSlug: string }>;
};

/**
 * Company-scoped job pages: /google/mkt, /google/swe, …
 * Resolved via jobs.slug / jobs.external_id = `{companySlug}_{jobSlug}`.
 */

/**
 * Legacy / stale URL fallback. Earlier builds minted short slugs from the title
 * (e.g. /iit-bombay/foreign) for jobs whose pretty slug is multi-token. Those
 * URLs were 404 once the real slug column was used. Resolve any job in the
 * company whose minted/legacy slug equals the requested one and redirect to its
 * canonical path so old links and stale caches never dead-end.
 *
 * Returns the resolved job when the legacy URL is ALREADY the canonical path
 * (minted-from-title equals the requested segment, e.g. /indian-army/data where
 * the job's stored slug is null and the pretty slug is minted on read) — the
 * caller renders it in place instead of redirecting into a self-loop.
 */
type LegacyResolution =
  | { kind: 'redirect'; path: string }
  | { kind: 'render'; job: Awaited<ReturnType<typeof fetchJobById>> };

const LEGACY_JOB_COLS =
  'id,title,company,company_key,external_id,slug,published_at,created_at,tags,description,apply_url,category,source';

async function resolveLegacySlugPath(
  companySlug: string,
  jobSlug: string
): Promise<LegacyResolution | null> {
  if (!canonicalCompanyHub(companySlug) || !isShortJobSlug(jobSlug)) return null;
  const want = jobSlug.toLowerCase();
  const keys = companyKeyEqualityValues(companySlug);
  const names = companyNameEqualityValues(companySlug);
  const prefixes = companyHubAliasPrefixes(companySlug);

  type Cand = {
    id: string;
    title: string;
    company: string;
    company_key?: string | null;
    external_id: string | null;
    slug: string | null;
    published_at?: string | null;
    created_at?: string | null;
    tags?: unknown;
    description?: string | null;
    apply_url?: string | null;
    category?: string | null;
    source?: string | null;
  };

  const batches: Cand[][] = [];

  const run = async (query: any, label: string) => {
    const result = await withTimeoutFallback(
      query,
      DB_BUDGET.fast,
      { data: [] } as any,
      label
    );
    batches.push((result.data || []) as Cand[]);
  };

  for (const prefix of prefixes) {
    const pattern = `${prefix}_${want}%`;
    await run(
      supabaseAdmin
        .from('jobs')
        .select(LEGACY_JOB_COLS)
        .like('slug', pattern)
        .order('created_at', { ascending: false })
        .limit(40),
      `legacy-slug-prefix:${pattern}`
    );
    await run(
      supabaseAdmin
        .from('jobs')
        .select(LEGACY_JOB_COLS)
        .like('external_id', pattern)
        .order('created_at', { ascending: false })
        .limit(40),
      `legacy-ext-prefix:${pattern}`
    );
  }

  if (keys.length) {
    await run(
      supabaseAdmin.from('jobs').select(LEGACY_JOB_COLS).in('company_key', keys).limit(200),
      `legacy-slug-keys:${keys.join(',')}`
    );
  }
  if (names.length) {
    await run(
      supabaseAdmin.from('jobs').select(LEGACY_JOB_COLS).in('company', names).limit(200),
      `legacy-slug-names:${names.slice(0, 6).join(',')}`
    );
  }

  const seen = new Set<string>();
  const matches: Cand[] = [];
  const consider = (job: Cand) => {
    if (!job?.id || seen.has(job.id)) return;
    if (!jobBelongsToCompanyHub(job, companySlug)) return;
    if (!jobMatchesLegacySlugHint(job, want)) return;
    seen.add(job.id);
    matches.push(job);
  };
  for (const batch of batches) {
    for (const job of batch) consider(job);
  }

  const publicMatches = matches.filter((j) => isPublicJobPage(j));
  if (!publicMatches.length) return null;

  const exact = publicMatches.find((j) => (jobStoredSlug(j) || '').toLowerCase() === want);
  const winner = exact || publicMatches[0];
  const resolved = jobPublicPath(winner);
  if (resolved.toLowerCase() === `/${companySlug}/${jobSlug}`.toLowerCase()) {
    return { kind: 'render', job: await fetchJobById(winner.id) };
  }
  return { kind: 'redirect', path: resolved };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, jobSlug } = await params;
  if (!isShortJobSlug(jobSlug)) {
    return { title: 'Job not found', robots: { index: false, follow: false } };
  }
  let job = await fetchJobByCompanyAndSlug(slug, jobSlug);
  if (!job) {
    const legacy = await resolveLegacySlugPath(slug, jobSlug);
    if (legacy?.kind === 'render') job = legacy.job;
  }
  if (!job || !isPublicJobPage(job)) {
    // Page will 308 to company hub / jobs — keep noindex until redirect lands.
    return { title: 'Job not found', robots: { index: false, follow: true } };
  }
  return await buildJobMetadata(job, siteUrl);
}

export default async function CompanyJobPage({ params }: PageProps) {
  const { slug, jobSlug } = await params;
  if (!isShortJobSlug(jobSlug)) notFound();

  let job = await fetchJobByCompanyAndSlug(slug, jobSlug);
  if (!job) {
    const legacy = await resolveLegacySlugPath(slug, jobSlug);
    if (legacy?.kind === 'render') {
      job = legacy.job;
    } else if (legacy?.kind === 'redirect') {
      permanentRedirect(legacy.path);
    }
  }
  if (!job || !isPublicJobPage(job)) {
    const apply = job ? liveUncuratedApplyUrl(job) : null;
    if (apply) redirect(apply);
    // Expired / deleted / reminted: soft-land on company hub (or /jobs).
    permanentRedirect(await gonePrettyJobPath(canonicalCompanyHub(slug) || slug));
  }

  const canonical = jobPublicPath(job);
  if (canonical.toLowerCase() !== `/${slug}/${jobSlug}`.toLowerCase()) {
    permanentRedirect(canonical);
  }

  const detail = await toJobDetail(job);

  const [viewer, relatedJobs] = await Promise.all([
    getViewerJobContext(),
    fetchRelatedJobs(job, 6),
  ]);
  const jsonLd = buildJobJsonLd(job, detail, siteUrl);
  const breadcrumbLd = buildJobBreadcrumbJsonLd(detail, siteUrl);
  const faqLd = buildJobFaqJsonLd(job, detail);

  return (
    <>
      {jsonLd ? (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <JobDetailClient
        job={detail}
        userSkills={viewer.userSkills}
        profileComplete={viewer.profileComplete}
        isAuthenticated={viewer.isAuthenticated}
        relatedJobs={relatedJobs}
      />
    </>
  );
}
