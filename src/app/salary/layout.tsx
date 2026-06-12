import { Metadata } from 'next';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
export const metadata: Metadata = {
  title: 'Purchasing Power Calculator — What Does Your Salary Buy?',
  description: 'See what your monthly income buys across 95 digital nomad cities. Compare purchasing power, remaining budget, and lifestyle quality worldwide.',
  keywords: ['purchasing power', 'salary calculator', 'cost of living', 'digital nomad', 'remote work salary'],
  alternates: { canonical: `${siteUrl}/salary` },
  openGraph: { title: 'Purchasing Power Calculator', description: 'What does your salary buy in 95 nomad cities?', url: `${siteUrl}/salary`, siteName: 'CVin.Bio', type: 'website' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
