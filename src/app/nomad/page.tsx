import { Metadata } from 'next';
import Link from 'next/link';
import { NomadMapWrapper } from '@/components/nomad-map-wrapper';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

import { Coins, GitCompare, ShieldCheck } from 'lucide-react';

const TOOLS = [
  {
    href: '/nomad/cost-of-living',
    icon: <Coins className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors shrink-0" />,
    title: 'Cost of Living',
    desc: 'Compare costs across 95 cities',
  },
  {
    href: '/nomad/compare',
    icon: <GitCompare className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors shrink-0" />,
    title: 'Compare Cities',
    desc: 'Side-by-side city comparison',
  },
  {
    href: '/nomad/schengen',
    icon: <ShieldCheck className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors shrink-0" />,
    title: 'Visa Calculator',
    desc: 'Schengen 90/180 day tracker',
  },
];

export const metadata: Metadata = {
  title: 'Digital Nomad Directory',
  description: 'Interactive directory of coliving houses, coworking spaces, hostels, apartments, and guesthouses across 95 digital nomad cities in 52 countries. Quality-scored, open-source data.',
  keywords: ['digital nomad', 'coliving', 'coworking', 'remote work', 'nomad directory', 'hostel', 'apartment'],
  alternates: { canonical: `${siteUrl}/nomad` },
  openGraph: {
    title: 'Digital Nomad Directory',
    description: 'Coliving, coworking spaces, hostels, and apartments across 95 cities in 52 countries.',
    url: `${siteUrl}/nomad`,
    siteName: 'CVin.Bio',
    type: 'website',
    images: [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: 'CVin.Bio Digital Nomad Directory' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Nomad Directory',
    description: 'Coliving, coworking spaces, hostels, and apartments across 95 cities in 52 countries.',
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
            Coliving houses, coworking spaces, hostels, apartments, and guesthouses across 95 cities in 52 countries.
          </p>
        </div>

        {/* Tools Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm dark:hover:shadow-white/5 transition-all group"
            >
              {tool.icon}
              <div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-primary transition-colors">{tool.title}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{tool.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        <NomadMapWrapper />
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
