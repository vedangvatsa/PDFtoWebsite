import { Metadata } from 'next';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
export const metadata: Metadata = {
  title: 'Climate Finder — Best Weather for Digital Nomads by Month',
  description: 'Filter 95 digital nomad cities by temperature, humidity, and rainfall. Find your ideal climate for any month of the year.',
  keywords: ['digital nomad climate', 'best weather nomad', 'temperature by city', 'weather finder'],
  alternates: { canonical: `${siteUrl}/climate` },
  openGraph: { title: 'Climate Finder', description: 'Find cities with your ideal weather.', url: `${siteUrl}/climate`, siteName: 'CVin.Bio', type: 'website' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
