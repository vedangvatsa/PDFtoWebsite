import type { Metadata } from 'next';
import { PLATFORM_JOBS_DISPLAY } from '@/lib/platform-job-count';
import JobsClient from '@/components/jobs-client';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const revalidate = 3600;

const MAX_CRAWL_PAGES = 50;

function crawlPageNumber(page: string | undefined): number {
  return Math.max(1, Math.min(MAX_CRAWL_PAGES, parseInt(page || '1', 10) || 1));
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const countStr = PLATFORM_JOBS_DISPLAY;
  const params = await searchParams;
  const pageNum = crawlPageNumber(params.page);

  return {
    title:
      pageNum > 1
        ? `Browse ${countStr} curated tech jobs — Page ${pageNum}`
        : `Browse ${countStr} curated tech jobs`,
    description: `Browse ${countStr} tech job openings at top companies including OpenAI, Stripe, Cloudflare, Anthropic and more. Filter by role, location, and company. Updated daily.`,
    keywords: ['tech jobs', 'software engineer jobs', 'AI jobs', 'remote tech jobs', 'startup jobs', 'engineering careers'],
    openGraph: {
      title: `Browse ${countStr} Jobs at Top Companies`,
      description: `Search open roles at OpenAI, Stripe, Cloudflare, Anthropic, Databricks, and hundreds of top tech companies. Updated daily.`,
      url: `${siteUrl}/jobs`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Browse ${countStr} Jobs`,
      description: 'Search open roles at top tech companies. Updated daily.',
    },
    alternates:
      pageNum > 1
        ? { canonical: `${siteUrl}/jobs?page=${pageNum}` }
        : { canonical: `${siteUrl}/jobs` },
  };
}

/**
 * /jobs?page=N is a real paginated series for crawlers — emit rel=next /
 * rel=prev so AI crawlers traverse beyond page one (React 19 hoists these
 * into <head>). Next 16 removed next/prev from the metadata API.
 */
function CrawlDepthLinks({ pageNum }: { pageNum: number }) {
  return (
    <>
      {pageNum < MAX_CRAWL_PAGES && <link rel="next" href={`${siteUrl}/jobs?page=${pageNum + 1}`} />}
      {pageNum > 1 && <link rel="prev" href={`${siteUrl}/jobs?page=${pageNum - 1}`} />}
    </>
  );
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <CrawlDepthLinks pageNum={crawlPageNumber(params.page)} />
      <JobsClient />
    </>
  );
}
