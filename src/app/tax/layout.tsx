import { Metadata } from 'next';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
export const metadata: Metadata = {
  title: 'Nomad Tax Comparison — Tax Rates by Country for Remote Workers',
  description: 'Compare tax rates across 35+ countries for digital nomads and freelancers. See effective rates, take-home pay, and DN visa tax benefits.',
  keywords: ['nomad tax', 'digital nomad taxes', 'tax comparison', 'freelancer tax rates', 'tax residency'],
  alternates: { canonical: `${siteUrl}/tax` },
  openGraph: { title: 'Nomad Tax Comparison', description: 'Tax rates across 35+ countries for remote workers.', url: `${siteUrl}/tax`, siteName: 'CVin.Bio', type: 'website' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
