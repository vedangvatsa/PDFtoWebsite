import { notFound, permanentRedirect, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  fetchJobById,
  toJobDetail,
  getViewerJobContext,
  buildJobMetadata,
  buildJobJsonLd,
  buildJobBreadcrumbJsonLd,
  buildJobFaqJsonLd,
  fetchRelatedJobs,
} from '@/lib/job-detail-data';
import { jobPublicPath, isJobId } from '@/lib/job-description';
import { goneUuidJobPath } from '@/lib/seo-fallbacks';
import { isPublicJobPage, liveUncuratedApplyUrl } from '@/lib/job-apply-source';
import JobDetailClient from './job-detail-client';

export const revalidate = 1800;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await fetchJobById(id);
  if (!job || !isPublicJobPage(job)) {
    return { title: 'Job not found', robots: { index: false, follow: true } };
  }
  return await buildJobMetadata(job, siteUrl);
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isJobId(id)) notFound();

  const job = await fetchJobById(id);
  if (!job || !isPublicJobPage(job)) {
    const apply = job ? liveUncuratedApplyUrl(job) : null;
    if (apply) redirect(apply);
    // Missing, expired, or enrich-queue without apply → jobs board (not a public page).
    permanentRedirect(goneUuidJobPath());
  }

  // Prefer short company-scoped URL when available
  const pretty = jobPublicPath(job);
  if (pretty !== `/jobs/${job.id}`) {
    permanentRedirect(pretty);
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
