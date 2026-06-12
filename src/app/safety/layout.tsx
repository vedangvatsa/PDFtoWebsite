import { Metadata } from 'next';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
export const metadata: Metadata = {
  title: 'City Safety Rankings — Safest Cities for Digital Nomads',
  description: 'Safety scores and rankings for 95 digital nomad cities worldwide. Compare overall safety, women\'s safety, and nighttime safety.',
  keywords: ['safest cities nomads', 'city safety ranking', 'digital nomad safety', 'safe travel'],
  alternates: { canonical: `${siteUrl}/safety` },
  openGraph: { title: 'City Safety Rankings', description: 'Safety scores for 95 nomad cities.', url: `${siteUrl}/safety`, siteName: 'CVin.Bio', type: 'website' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
