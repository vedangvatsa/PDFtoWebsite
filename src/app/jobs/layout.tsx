import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

// Revalidate metadata layout every hour so job counts stay dynamic
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const supabase = supabaseAdmin;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch job count
  const { count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .gt('created_at', thirtyDaysAgo)
    .not('company', 'ilike', '%Gopuff%');

  let countStr = '24,000+';
  if (count) {
    countStr = count.toLocaleString();
  }

  return {
    title: `Browse ${countStr} Open Roles at Top Companies`,
    description: `Browse ${countStr} tech job openings at top companies including OpenAI, Stripe, Cloudflare, Anthropic and more. Filter by role, location, and company. Updated daily.`,
    keywords: ['tech jobs', 'software engineer jobs', 'AI jobs', 'remote tech jobs', 'startup jobs', 'engineering careers'],
    openGraph: {
      title: `Browse ${countStr} Jobs at Top Companies`,
      description: `Search open roles at OpenAI, Stripe, Cloudflare, Anthropic, Databricks, and hundreds of top tech companies. Updated daily.`,
      url: `${siteUrl}/jobs`,
      type: 'website',
      // Next.js will automatically use opengraph-image.tsx
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
