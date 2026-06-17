import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'Compare Cities for Digital Nomads',
  description:
    'Side-by-side comparison of cost of living, weather, coworking spaces, and nomad scores across 100 cities. Find your ideal digital nomad destination.',
  alternates: { canonical: `${siteUrl}/compare` },
  openGraph: {
    title: 'Compare Cities for Digital Nomads',
    description:
      'Side-by-side comparison of cost of living, weather, coworking spaces, and nomad scores across 100 cities.',
    url: `${siteUrl}/compare`,
    siteName: 'CVin.Bio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare Cities for Digital Nomads',
    description:
      'Side-by-side comparison of cost of living, weather, coworking spaces, and nomad scores across 100 cities.',
    creator: '@cvinbio',
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
