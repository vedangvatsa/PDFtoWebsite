import type { Metadata } from 'next';
import { PLATFORM_JOBS_DISPLAY } from '@/lib/platform-job-count';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const countStr = PLATFORM_JOBS_DISPLAY;

  return {
    title: `Browse ${countStr} Open Roles at Top Companies`,
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
    alternates: { canonical: `${siteUrl}/jobs` },
  };
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
