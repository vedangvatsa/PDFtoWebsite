import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'City vs City — Compare Digital Nomad Destinations',
  description:
    'Side-by-side comparison of digital nomad cities. Compare cost of living, internet speed, nomad score, weather, and more.',
  keywords: [
    'city comparison', 'digital nomad', 'cost of living comparison',
    'best city for remote work', 'nomad city vs city',
  ],
  alternates: { canonical: `${siteUrl}/versus` },
  openGraph: {
    title: 'City vs City — Compare Nomad Destinations',
    description: 'Side-by-side comparison of digital nomad cities.',
    url: `${siteUrl}/versus`,
    siteName: 'CVin.Bio',
    type: 'website',
  },
};

export default function VersusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
