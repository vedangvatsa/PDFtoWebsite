import type { Metadata } from 'next';
import JobsClient from '@/components/jobs-client';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Open Fellowships at NASA, IISc, ERA, Anthropic & More',
    description:
      'Browse open fellowships and postdoc programs from NASA, IISc, ERA, Anthropic, Apple, Horizon, GovAI, and more. Filter by program, location, and company. Updated daily.',
    keywords: [
      'fellowships',
      'AI fellowships',
      'postdoc fellowships',
      'research fellowships',
      'NASA fellowship',
      'tech fellowships',
    ],
    openGraph: {
      title: 'Open Fellowships',
      description:
        'Search open fellowships and postdoc programs at NASA, IISc, ERA, Anthropic, Apple, and more. Updated daily.',
      url: `${siteUrl}/fellowships`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Open Fellowships',
      description: 'Search open fellowships at NASA, IISc, ERA, Anthropic, and more. Updated daily.',
    },
    alternates: { canonical: `${siteUrl}/fellowships` },
  };
}

export default function FellowshipsPage() {
  return <JobsClient mode="fellowships" />;
}
