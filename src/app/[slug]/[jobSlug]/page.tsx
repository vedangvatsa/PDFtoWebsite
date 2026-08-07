import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  fetchJobByCompanyAndSlug,
  toJobDetail,
  getViewerJobContext,
  buildJobMetadata,
  buildJobJsonLd,
  buildJobBreadcrumbJsonLd,
  fetchRelatedJobs,
} from '@/lib/job-detail-data';
import {
  isShortJobSlug,
  mintPrettyJobSlug,
  shortJobSlug,
  jobPublicPath,
} from '@/lib/job-description';
import { toCompanyKey } from '@/lib/company-directory';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withTimeoutFallback, DB_BUDGET } from '@/lib/db-timeout';
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
 */
async function resolveLegacySlugPath(
  companySlug: string,
  jobSlug: string
): Promise<string | null> {
  const companyKey = toCompanyKey(companySlug);
  if (!companyKey || !isShortJobSlug(jobSlug)) return null;
  const { data } = await withTimeoutFallback(
    supabaseAdmin
      .from('jobs')
      .select('id,title,company,external_id,slug')
      .eq('company_key', companyKey)
      .limit(100),
    DB_BUDGET.fast,
    { data: [] } as any,
    `legacy-slug:${companyKey}`
  );
  const want = jobSlug.toLowerCase();
  for (const job of (data || []) as Array<{
    id: string;
    title: string;
    company: string;
    external_id: string | null;
    slug: string | null;
  }>) {
    if (!job.id || !job.title) continue;
    const minted = mintPrettyJobSlug(job.title, job.id).toLowerCase();
    const short = shortJobSlug(job.company, job.external_id)?.toLowerCase();
    if (minted === want || short === want) {
      const resolved = jobPublicPath(job);
      // Never redirect a URL back to itself — that is an infinite 308 loop.
      if (
        resolved.toLowerCase() ===
        `/${companySlug}/${jobSlug}`.toLowerCase()
      ) {
        return null;
      }
      return resolved;
    }
  }
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, jobSlug } = await params;
  if (!isShortJobSlug(jobSlug)) {
    return { title: 'Job not found', robots: { index: false, follow: false } };
  }
  const job = await fetchJobByCompanyAndSlug(slug, jobSlug);
  if (!job) {
    return { title: 'Job not found', robots: { index: false, follow: false } };
  }
  return buildJobMetadata(job, siteUrl);
}

export default async function CompanyJobPage({ params }: PageProps) {
  const { slug, jobSlug } = await params;
  if (!isShortJobSlug(jobSlug)) notFound();

  let job = await fetchJobByCompanyAndSlug(slug, jobSlug);
  if (!job) {
    const legacyPath = await resolveLegacySlugPath(slug, jobSlug);
    if (legacyPath) permanentRedirect(legacyPath);
    notFound();
  }

  const detail = toJobDetail(job);

  const [viewer, relatedJobs] = await Promise.all([
    getViewerJobContext(),
    fetchRelatedJobs(job, 6),
  ]);
  const jsonLd = buildJobJsonLd(job, detail, siteUrl);
  const breadcrumbLd = buildJobBreadcrumbJsonLd(detail, siteUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
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
