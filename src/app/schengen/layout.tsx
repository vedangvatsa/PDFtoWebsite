import { Metadata } from 'next';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
export const metadata: Metadata = {
  title: 'Schengen Calculator | 90/180 Day Rule Tracker',
  description: 'Track your Schengen zone days. Add your trips and see how many days you have left in the rolling 180-day window. Plan ahead and avoid overstays.',
  keywords: ['schengen calculator', '90/180 rule', 'schengen visa', 'europe travel', 'overstay calculator'],
  alternates: { canonical: `${siteUrl}/schengen` },
  openGraph: { title: 'Schengen 90/180 Day Calculator', description: 'Track your Schengen days and avoid overstays.', url: `${siteUrl}/schengen`, siteName: 'CVin.Bio', type: 'website' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
