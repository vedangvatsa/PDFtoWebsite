import { Metadata } from 'next';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
export const metadata: Metadata = {
  title: 'FIRE Calculator — How Long Will Your Savings Last?',
  description: 'Calculate how many months your savings will last in 95 digital nomad cities. Find where to stretch your runway the furthest.',
  keywords: ['FIRE calculator', 'financial independence', 'retire early', 'savings runway', 'digital nomad budget'],
  alternates: { canonical: `${siteUrl}/fire` },
  openGraph: { title: 'FIRE Calculator — Savings Runway by City', description: 'How long will your savings last in 95 nomad cities?', url: `${siteUrl}/fire`, siteName: 'CVin.Bio', type: 'website', images: [{ url: `${siteUrl}/nomad/opengraph-image`, width: 1200, height: 630 }] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
