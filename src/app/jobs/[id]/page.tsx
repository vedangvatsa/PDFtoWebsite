import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  fetchJobById,
  toJobDetail,
  getViewerJobContext,
  buildJobMetadata,
  buildJobJsonLd,
} from '@/lib/job-detail-data';
import { jobPublicPath, isJobId } from '@/lib/job-description';
import JobDetailClient from './job-detail-client';

export const revalidate = 300;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await fetchJobById(id);
  if (!job) {
    return { title: 'Job not found', robots: { index: false, follow: false } };
  }
  return buildJobMetadata(job, siteUrl);
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isJobId(id)) notFound();

  const job = await fetchJobById(id);
  if (!job) notFound();

  // Prefer short company-scoped URL when available
  const pretty = jobPublicPath(job);
  if (pretty !== `/jobs/${job.id}`) {
    permanentRedirect(pretty);
  }

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
