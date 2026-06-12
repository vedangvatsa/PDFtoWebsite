import { Metadata } from 'next';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import { ArrowLeft, Wifi, ArrowDown, ArrowUp, Clock, Activity, Info } from 'lucide-react';
import { CITY_IMAGES, getCitySlug } from '@/lib/utils';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'Internet Speeds by City — Digital Nomad WiFi Rankings',
  description: 'Compare fixed broadband internet speeds across 95 digital nomad cities. Download, upload, and latency data from Ookla Speedtest.',
  keywords: ['internet speed', 'wifi speed', 'digital nomad', 'broadband', 'remote work', 'nomad wifi'],
  alternates: { canonical: `${siteUrl}/internet-speeds` },
  openGraph: {
    title: 'Internet Speeds — Digital Nomad WiFi Rankings',
    description: 'Compare broadband speeds across 95 nomad cities worldwide.',
    url: `${siteUrl}/internet-speeds`,
    siteName: 'CVin.Bio',
    type: 'website',
    images: [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: 'Internet Speeds by City' }],
  },
};

interface CityInternet {
  slug: string;
  name: string;
  country: string;
  emoji: string;
  internet: {
    download_mbps: number;
    upload_mbps: number;
    latency_ms: number;
    test_count: number;
    quarter: string;
  };
  nomad_score: number;
  cost: { monthly_total: number };
}

function loadCities(): CityInternet[] {
  const filePath = path.join(process.cwd(), 'public', 'nomad-cities.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const cities = JSON.parse(raw);
  return cities
    .filter((c: any) => c.internet && c.internet.download_mbps > 0)
    .sort((a: any, b: any) => b.internet.download_mbps - a.internet.download_mbps);
}

function speedTier(mbps: number): { label: string; color: string; bg: string } {
  if (mbps >= 100) return { label: 'Blazing', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' };
  if (mbps >= 50) return { label: 'Fast', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500' };
  if (mbps >= 25) return { label: 'Good', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500' };
  if (mbps >= 10) return { label: 'Moderate', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500' };
  return { label: 'Slow', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500' };
}

function latencyTier(ms: number): { color: string } {
  if (ms <= 15) return { color: 'text-emerald-600 dark:text-emerald-400' };
  if (ms <= 30) return { color: 'text-green-600 dark:text-green-400' };
  if (ms <= 50) return { color: 'text-yellow-600 dark:text-yellow-400' };
  return { color: 'text-red-600 dark:text-red-400' };
}

export default function InternetSpeedsPage() {
  const cities = loadCities();
  const maxDownload = cities.length > 0 ? cities[0].internet.download_mbps : 1;
  const quarter = cities.length > 0 ? cities[0].internet.quarter : '';

  // Summary stats
  const avgDownload = cities.length > 0 ? Math.round(cities.reduce((s, c) => s + c.internet.download_mbps, 0) / cities.length) : 0;
  const avgUpload = cities.length > 0 ? Math.round(cities.reduce((s, c) => s + c.internet.upload_mbps, 0) / cities.length) : 0;
  const avgLatency = cities.length > 0 ? Math.round(cities.reduce((s, c) => s + c.internet.latency_ms, 0) / cities.length) : 0;
  const fastCount = cities.filter(c => c.internet.download_mbps >= 50).length;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black selection:bg-primary/10 transition-colors duration-200 flex flex-col">
      <Header />
      <main id="main-content" className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 lg:py-24 pb-32 flex-1">
        {/* Back link */}
        <Link
          href="/nomad"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3 transition-colors">
            Internet Speeds by City
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 transition-colors max-w-3xl">
            Fixed broadband download, upload, and latency across {cities.length} digital nomad cities.
            Ranked by download speed.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <ArrowDown className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Avg Download</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{avgDownload} <span className="text-sm font-normal text-zinc-400">Mbps</span></div>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <ArrowUp className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Avg Upload</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{avgUpload} <span className="text-sm font-normal text-zinc-400">Mbps</span></div>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Avg Latency</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{avgLatency} <span className="text-sm font-normal text-zinc-400">ms</span></div>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Fast Cities</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{fastCount} <span className="text-sm font-normal text-zinc-400">/ {cities.length}</span></div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">50+ Mbps download</div>
          </div>
        </div>

        {/* Speed Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium">Speed tiers:</span>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Blazing (100+)</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /> Fast (50-99)</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Good (25-49)</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Moderate (10-24)</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Slow (&lt;10)</div>
        </div>

        {/* Rankings Table */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl overflow-hidden transition-colors">
          {/* Table Header */}
          <div className="grid grid-cols-[3rem_1fr_6rem_6rem_5rem_5rem] md:grid-cols-[3rem_1fr_8rem_7rem_6rem_6rem] gap-2 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800/50 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <div className="text-center">#</div>
            <div>City</div>
            <div className="text-right">Download</div>
            <div className="text-right hidden md:block">Upload</div>
            <div className="text-right">Latency</div>
            <div className="text-right">Tests</div>
          </div>

          {/* Rows */}
          {cities.map((city, idx) => {
            const tier = speedTier(city.internet.download_mbps);
            const latTier = latencyTier(city.internet.latency_ms);
            const barWidth = (city.internet.download_mbps / maxDownload) * 100;

            return (
              <Link
                key={city.slug}
                href={`/${city.slug}`}
                className="grid grid-cols-[3rem_1fr_6rem_6rem_5rem_5rem] md:grid-cols-[3rem_1fr_8rem_7rem_6rem_6rem] gap-2 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/30 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors items-center group"
              >
                {/* Rank */}
                <div className="text-center text-sm font-mono text-zinc-400 dark:text-zinc-500">
                  {idx + 1}
                </div>

                {/* City Name + Speed Bar */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-primary transition-colors truncate">
                      {city.emoji} {city.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0">{city.country}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${tier.bg} transition-all duration-500`}
                      style={{ width: `${barWidth}%`, opacity: 0.7 }}
                    />
                  </div>
                </div>

                {/* Download */}
                <div className="text-right">
                  <span className={`text-sm font-bold font-mono ${tier.color}`}>
                    {city.internet.download_mbps}
                  </span>
                  <span className="text-xs text-zinc-400 ml-0.5">Mbps</span>
                </div>

                {/* Upload */}
                <div className="text-right hidden md:block">
                  <span className="text-sm font-mono text-zinc-600 dark:text-zinc-300">
                    {city.internet.upload_mbps}
                  </span>
                  <span className="text-xs text-zinc-400 ml-0.5">Mbps</span>
                </div>

                {/* Latency */}
                <div className="text-right">
                  <span className={`text-sm font-mono ${latTier.color}`}>
                    {city.internet.latency_ms}
                  </span>
                  <span className="text-xs text-zinc-400 ml-0.5">ms</span>
                </div>

                {/* Tests */}
                <div className="text-right text-xs font-mono text-zinc-400 dark:text-zinc-500">
                  {city.internet.test_count >= 1000
                    ? `${(city.internet.test_count / 1000).toFixed(0)}K`
                    : city.internet.test_count.toLocaleString()}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Data Source */}
        <div className="mt-8 flex items-start gap-2 text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed max-w-2xl">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Data from <a href="https://github.com/teamookla/ookla-open-data" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Ookla Open Data</a> ({quarter}).
            Fixed broadband speeds aggregated within 15km of each city center.
            Licensed under CC BY-NC-SA 4.0.
          </p>
        </div>
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
