import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'Digital Nomad Visas Guide | Requirements & Income Thresholds',
  description: 'Compare active digital nomad visas across 22 top countries. Filter by minimum monthly income, stay duration, application fees, and tax details.',
  keywords: ['digital nomad visa', 'remote work visa', 'nomad visas', 'travel guide', 'income requirement'],
  alternates: { canonical: `${siteUrl}/visas` },
  openGraph: {
    title: 'Digital Nomad Visas Guide',
    description: 'Compare active digital nomad visas across 22 top countries.',
    url: `${siteUrl}/visas`,
    siteName: 'CVin.Bio',
    type: 'website',
    images: [{ url: `${siteUrl}/nomad/opengraph-image`, width: 1200, height: 630, alt: 'CVin.Bio Nomad Visas Directory' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Nomad Visas Guide',
    description: 'Compare active digital nomad visas across 22 top countries.',
    images: [`${siteUrl}/nomad/opengraph-image`],
    creator: '@cvinbio',
  },
};

export default function VisasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
