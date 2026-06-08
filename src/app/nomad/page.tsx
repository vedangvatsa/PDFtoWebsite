import { Metadata } from 'next';
import { NomadMapWrapper } from '@/components/nomad-map-wrapper';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'Digital Nomad Directory',
  description: 'Interactive directory of 4,400+ coliving houses, hostels, apartments, and guesthouses across 95 digital nomad cities in 52 countries. Quality-scored, open-source data.',
  keywords: ['digital nomad', 'coliving', 'remote work', 'nomad directory', 'hostel', 'apartment'],
  alternates: { canonical: `${siteUrl}/nomad` },
  openGraph: {
    title: 'Digital Nomad Directory',
    description: '4,400+ coliving, hostels, and apartments across 95 cities in 52 countries.',
    url: `${siteUrl}/nomad`,
    siteName: 'CVin.Bio',
    type: 'website',
    images: [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: 'CVin.Bio Digital Nomad Directory' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Nomad Directory',
    description: '4,400+ coliving, hostels, and apartments across 95 cities in 52 countries.',
    images: [`${siteUrl}/opengraph-image`],
    creator: '@cvinbio',
  },
};

export default function NomadMapPage() {
  return (
    <div className="h-screen overflow-y-auto bg-[#fafafa] dark:bg-black selection:bg-primary/10 transition-colors duration-200 flex flex-col">
      <Header />
      {/* Preload the data file so it starts downloading immediately */}
      <link rel="preload" href="/nomad-data-v2.json" as="fetch" crossOrigin="anonymous" />
      <main id="main-content" className="w-full max-w-screen-2xl mx-auto px-6 py-12 md:py-20 pb-32 flex-1">
        <div className="flex flex-col mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4 transition-colors">
            Digital Nomad Directory
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 transition-colors max-w-3xl">
            4,400+ coliving houses, hostels, apartments, and guesthouses across 95 cities in 52 countries.
          </p>
        </div>

        <NomadMapWrapper />
      </main>
      <MicroFooter />
    </div>
  );
}
