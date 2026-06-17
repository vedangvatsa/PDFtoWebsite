import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'Compare Cities for Digital Nomads',
  description:
    'Side-by-side comparison of cost of living, weather, coworking spaces, and nomad scores across 100 cities. Find your ideal digital nomad destination.',
  alternates: { canonical: `${siteUrl}/compare` },
  openGraph: {
    title: 'Compare Cities for Digital Nomads | CVin.Bio',
    description:
      'Side-by-side comparison of cost of living, weather, coworking spaces, and nomad scores across 100 cities.',
    url: `${siteUrl}/compare`,
    siteName: 'CVin.Bio',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/nomad/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Compare Nomad Cities',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare Cities for Digital Nomads',
    description:
      'Side-by-side comparison of cost of living, weather, coworking spaces, and nomad scores across 100 cities.',
    images: [`${siteUrl}/nomad/opengraph-image`],
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
