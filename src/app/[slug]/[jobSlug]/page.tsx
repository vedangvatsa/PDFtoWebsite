import { notFound, permanentRedirect, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  fetchJobByCompanyAndSlug,
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
} from '@/lib/job-description';
import { canonicalCompanyHub } from '@/lib/company-directory';
import { gonePrettyJobPath } from '@/lib/seo-fallbacks';
import { canRenderJobPage, liveUncuratedApplyUrl } from '@/lib/job-apply-source';
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, jobSlug } = await params;
  if (!isShortJobSlug(jobSlug)) {
    return { title: 'Job not found', robots: { index: false, follow: false } };
  }
  const job = await fetchJobByCompanyAndSlug(slug, jobSlug);
  if (!job || !canRenderJobPage(job)) {
    // Page will 308 to company hub / jobs — keep noindex until redirect lands.
    return { title: 'Job not found', robots: { index: false, follow: true } };
  }
  return await buildJobMetadata(job, siteUrl);
}

export default async function CompanyJobPage({ params }: PageProps) {
  const { slug, jobSlug } = await params;
  if (!isShortJobSlug(jobSlug)) notFound();

  const job = await fetchJobByCompanyAndSlug(slug, jobSlug);
  if (!job || !canRenderJobPage(job)) {
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
