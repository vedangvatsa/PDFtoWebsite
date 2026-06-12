import { Metadata } from 'next';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
export const metadata: Metadata = {
  title: 'Nomad Insurance Comparison — Best Travel Insurance for Digital Nomads',
  description: 'Compare the top 6 insurance providers for digital nomads. SafetyWing, Genki, World Nomads, and more — coverage, costs, and features.',
  keywords: ['nomad insurance', 'travel insurance', 'digital nomad insurance', 'SafetyWing', 'Genki'],
  alternates: { canonical: `${siteUrl}/insurance` },
  openGraph: { title: 'Nomad Insurance Comparison', description: 'Compare top 6 insurance providers for digital nomads.', url: `${siteUrl}/insurance`, siteName: 'CVin.Bio', type: 'website' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
