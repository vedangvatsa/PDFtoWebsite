import { Metadata } from 'next';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
export const metadata: Metadata = {
  title: 'City Rankings | Internet, Safety & Walkability',
  description: 'Rank and compare digital nomad cities by internet speed, safety scores, and walkability. Data-driven rankings across 95+ cities.',
  keywords: ['city rankings', 'digital nomad', 'internet speed', 'safety', 'walkability', 'remote work'],
  alternates: { canonical: `${siteUrl}/rankings` },
  openGraph: {
    title: 'City Rankings | Internet, Safety & Walkability',
    description: 'Rank and compare digital nomad cities by internet speed, safety scores, and walkability. Data-driven rankings across 95+ cities.',
    url: `${siteUrl}/rankings`,
    siteName: 'CVin.Bio',
    type: 'website',
    images: [{ url: `${siteUrl}/nomad/opengraph-image`, width: 1200, height: 630 }],
  },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
