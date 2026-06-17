import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'Visas & Travel | Nomad Visas, Visa Checker & Requirements',
  description: 'Explore active digital nomad visas across 50+ countries, and check visa-free access for 199 destinations by passport. Income thresholds, fees, tax details, and world map.',
  keywords: ['digital nomad visa', 'remote work visa', 'visa checker', 'visa-free countries', 'passport index', 'nomad visas'],
  alternates: { canonical: `${siteUrl}/visas` },
  openGraph: {
    title: 'Visas & Travel | Nomad Visas & Visa Checker',
    description: 'Explore nomad visas and check visa-free access for 199 destinations.',
    url: `${siteUrl}/visas`,
    siteName: 'CVin.Bio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visas & Travel | Nomad Visas & Visa Checker',
    description: 'Explore nomad visas and check visa-free access for 199 destinations.',
    creator: '@cvinbio',
  },
};

export default function VisasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
