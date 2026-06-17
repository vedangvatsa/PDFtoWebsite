import { PAGE_CONTAINER , PAGE_TITLE } from '@/lib/utils';
import { Metadata } from 'next';
import Link from 'next/link';
import { NomadMapWrapper } from '@/components/nomad-map-wrapper';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

import {
  Coins, GitCompare, ShieldCheck, Wifi, Globe, Bookmark,
  CloudSun, Shield, Footprints, Clock, Stamp, Map,
  DollarSign, Receipt, Flame, HeartPulse, Compass,
} from 'lucide-react';

const iconClass = 'h-4 w-4 text-zinc-400 group-hover:text-primary transition-colors shrink-0';

const ALL_TOOLS = {
  'City Research': [
    { href: '/costs', icon: <Coins className={iconClass} />, title: 'Cost of Living', desc: 'Compare living costs abroad' },
    { href: '/compare', icon: <GitCompare className={iconClass} />, title: 'Compare Cities', desc: 'Side-by-side city comparison with verdict' },
    { href: '/discover', icon: <Compass className={iconClass} />, title: 'Discover', desc: 'Find hidden gem cities' },
    { href: '/safety', icon: <Shield className={iconClass} />, title: 'Safety', desc: 'City safety rankings' },
    { href: '/climate', icon: <CloudSun className={iconClass} />, title: 'Climate', desc: 'Weather & climate finder' },
    { href: '/walkability', icon: <Footprints className={iconClass} />, title: 'Walkability', desc: 'Walk & transit scores' },
    { href: '/wifi', icon: <Wifi className={iconClass} />, title: 'Internet Speeds', desc: 'WiFi speed rankings' },
  ],
  'Travel & Visas': [
    { href: '/visas', icon: <ShieldCheck className={iconClass} />, title: 'Nomad Visas', desc: 'Digital nomad visa options' },
    { href: '/visa-checker', icon: <Stamp className={iconClass} />, title: 'Visa Checker', desc: 'Do you need a visa?' },
    { href: '/passport', icon: <Globe className={iconClass} />, title: 'Passport Index', desc: 'How strong is your passport' },
    { href: '/schengen', icon: <Map className={iconClass} />, title: 'Schengen Tracker', desc: 'Track your 90-day limit' },
  ],
  'Money & Planning': [
    { href: '/salary', icon: <DollarSign className={iconClass} />, title: 'Salary', desc: 'How far your salary goes' },
    { href: '/tax', icon: <Receipt className={iconClass} />, title: 'Tax Rates', desc: 'Tax rates by city' },
    { href: '/fire', icon: <Flame className={iconClass} />, title: 'FIRE Calculator', desc: 'Retirement runway planner' },
    { href: '/insurance', icon: <HeartPulse className={iconClass} />, title: 'Insurance', desc: 'Travel insurance guide' },
    { href: '/resources', icon: <Bookmark className={iconClass} />, title: 'Resources', desc: 'Best nomad tools & links' },
  ],
};

const TOOLS = [
  {
    href: '/costs',
    icon: <Coins className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors shrink-0" />,
    title: 'Cost of Living',
    desc: 'Compare costs across 95 cities',
  },
  {
    href: '/compare',
    icon: <GitCompare className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors shrink-0" />,
    title: 'Compare Cities',
    desc: 'Side-by-side city comparison',
  },
  {
    href: '/visas',
    icon: <ShieldCheck className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors shrink-0" />,
    title: 'Nomad Visas',
    desc: 'Explore active digital nomad visas',
  },
  {
    href: '/wifi',
    icon: <Wifi className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors shrink-0" />,
    title: 'Internet Speeds',
    desc: 'WiFi speed rankings by city',
  },
  {
    href: '/passport',
    icon: <Globe className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors shrink-0" />,
    title: 'Visa Checker',
    desc: 'Visa requirements by passport',
  },
  {
    href: '/resources',
    icon: <Bookmark className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors shrink-0" />,
    title: 'Resources',
    desc: 'Insurance, banking, eSIM & more',
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
    images: [{ url: `${siteUrl}/nomad/opengraph-image`, width: 1200, height: 630, alt: 'Digital Nomad Directory — 95 Cities in 52 Countries' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Nomad Directory',
    description: 'Coliving, coworking spaces, hostels, and apartments across 95 cities in 52 countries.',
    images: [`${siteUrl}/nomad/opengraph-image`],
    creator: '@cvinbio',
  },
};

export default function NomadMapPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-primary/10 transition-colors duration-200 flex flex-col">
      <Header />
      {/* Preload the data file so it starts downloading immediately */}
      <link rel="preload" href="/nomad-data-v2.json" as="fetch" crossOrigin="anonymous" />
      <main id="main-content" className={PAGE_CONTAINER}>
        <div className="flex flex-col mb-10">
          <h1 className={PAGE_TITLE}>
            Digital Nomad Directory
          </h1>
          <p className="text-xl text-zinc-600 transition-colors max-w-3xl">
            Coliving houses, coworking spaces, hostels, apartments, and guesthouses across 95 cities in 52 countries.
          </p>
        </div>

        {/* Tools Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex items-center gap-3 px-4 py-3 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 hover:shadow-sm transition-all group"
            >
              {tool.icon}
              <div>
                <div className="text-sm font-semibold text-zinc-900 group-hover:text-primary transition-colors">{tool.title}</div>
                <div className="text-xs text-zinc-500">{tool.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        <div id="map">
          <NomadMapWrapper />
        </div>

        {/* All Nomad Tools */}
        <section className="mt-16 mb-10">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">All Nomad Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.entries(ALL_TOOLS).map(([category, tools]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">{category}</h3>
                <div className="space-y-1">
                  {tools.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200 transition-all group"
                    >
                      {tool.icon}
                      <div>
                        <div className="text-sm font-medium text-zinc-900 group-hover:text-primary transition-colors">{tool.title}</div>
                        <div className="text-xs text-zinc-400">{tool.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
