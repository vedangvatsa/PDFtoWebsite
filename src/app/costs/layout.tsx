import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'Cost of Living for Digital Nomads | 100 Cities Compared',
  description:
    'Compare cost of living across 100 digital nomad cities. Filter by budget, sort by rent, food, coworking costs. Find your perfect affordable destination.',
  keywords: [
    'cost of living',
    'digital nomad',
    'budget',
    'rent',
    'coworking',
    'remote work',
    'affordable cities',
    'nomad budget',
  ],
  alternates: { canonical: `${siteUrl}/costs` },
  openGraph: {
    title: 'Cost of Living for Digital Nomads | 100 Cities Compared',
    description:
      'Compare cost of living across 100 digital nomad cities. Filter by budget, sort by rent, food, coworking costs.',
    url: `${siteUrl}/costs`,
    siteName: 'CVin.Bio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cost of Living for Digital Nomads | 100 Cities Compared',
    description:
      'Compare cost of living across 100 digital nomad cities. Filter by budget, sort by rent, food, coworking costs.',
    creator: '@cvinbio',
  },
};

export default function CostOfLivingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
