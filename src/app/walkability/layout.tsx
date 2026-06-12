import { Metadata } from 'next';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
export const metadata: Metadata = {
  title: 'Walkability & Transit Scores — Car-Free Cities for Nomads',
  description: 'Walk, transit, and bike scores for 95 digital nomad cities. Find where you can live car-free and explore on foot.',
  keywords: ['walkability score', 'walkable cities', 'car free cities', 'transit score', 'bike friendly'],
  alternates: { canonical: `${siteUrl}/walkability` },
  openGraph: { title: 'Walkability & Transit Scores', description: 'Walk, transit, and bike scores for 95 nomad cities.', url: `${siteUrl}/walkability`, siteName: 'CVin.Bio', type: 'website' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
