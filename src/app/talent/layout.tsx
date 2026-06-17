import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'The Remote Talent Report 2026 | Remote Work and Hiring Data',
  description: '34 million Americans work remotely. This report examines the data: remote hiring trends, compensation premiums, RTO mandates, and productivity research heading into 2027.',
  keywords: ['remote work report', 'remote talent 2026', 'work from home statistics', 'remote job trends', 'remote work salary', 'RTO mandate data'],
  openGraph: {
    title: 'The Remote Talent Report 2026',
    description: '34 million Americans work remotely. The data on hiring, compensation, RTO mandates, and what comes next.',
    url: `${siteUrl}/talent`,
    type: 'article',
    images: [{ url: `${siteUrl}/talent/opengraph-image`, width: 1200, height: 630, alt: 'Remote Talent Report 2026' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Remote Talent Report 2026',
    description: 'Remote work data: hiring trends, salary premiums, and productivity research.',
    images: [`${siteUrl}/talent/opengraph-image`],
  },
  alternates: { canonical: `${siteUrl}/talent` },
};

export default function RemoteTalentReportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
