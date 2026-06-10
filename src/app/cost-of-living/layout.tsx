import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'Cost of Living for Digital Nomads · 95 Cities Compared',
  description:
    'Compare cost of living across 95 digital nomad cities. Filter by budget, sort by rent, food, coworking costs. Find your perfect affordable destination.',
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
  alternates: { canonical: `${siteUrl}/cost-of-living` },
  openGraph: {
    title: 'Cost of Living for Digital Nomads · 95 Cities Compared',
    description:
      'Compare cost of living across 95 digital nomad cities. Filter by budget, sort by rent, food, coworking costs.',
    url: `${siteUrl}/cost-of-living`,
    siteName: 'CVin.Bio',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Cost of Living for Digital Nomads',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cost of Living for Digital Nomads · 95 Cities Compared',
    description:
      'Compare cost of living across 95 digital nomad cities. Filter by budget, sort by rent, food, coworking costs.',
    images: [`${siteUrl}/opengraph-image`],
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
