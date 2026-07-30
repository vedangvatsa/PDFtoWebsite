import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  fetchJobByCompanyAndSlug,
  toJobDetail,
  getViewerJobContext,
  buildJobMetadata,
  buildJobJsonLd,
} from '@/lib/job-detail-data';
import { isShortJobSlug } from '@/lib/job-description';
import JobDetailClient from '@/app/jobs/[id]/job-detail-client';

export const revalidate = 300;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

type PageProps = {
  params: Promise<{ slug: string; jobSlug: string }>;
};

/**
 * Company-scoped job pages: /google/mkt, /google/swe, …
 * Resolved via jobs.external_id = `{companySlug}_{jobSlug}`.
 */
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

  const job = await fetchJobByCompanyAndSlug(slug, jobSlug);
  if (!job) notFound();

  const detail = toJobDetail(job);
  const viewer = await getViewerJobContext();
  const jsonLd = buildJobJsonLd(job, detail, siteUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JobDetailClient
        job={detail}
        userSkills={viewer.userSkills}
        profileComplete={viewer.profileComplete}
        isAuthenticated={viewer.isAuthenticated}
      />
    </>
  );
}
