'use client';

import { useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BlogCTA from '@/components/blog-cta';
import { NomadPageShell } from '@/components/nomad/nomad-page-shell';
import { useNomadCities } from '@/hooks/use-nomad-cities';
import {
  ArrowDown, ArrowUp, Clock, Activity,
  Shield, AlertTriangle, BarChart3,
  Footprints, Train, Bike,
  Info, Wifi,
} from 'lucide-react';
import { PAGE_DISCLAIMER } from '@/lib/utils';
import {
  SAFETY, DEFAULT_SAFETY, WALKABILITY, DEFAULT_WALK, type WalkData,
} from '@/lib/nomad-rankings-data';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface City {
  slug: string;
  name: string;
  country: string;
  emoji: string;
  nomad_score: number;
  cost: { monthly_total: number };
  internet?: {
    download_mbps: number;
    upload_mbps: number;
    latency_ms: number;
    test_count: number;
    quarter: string;
  };
}

type TabKey = 'internet' | 'safety' | 'walkability';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'internet', label: 'Internet' },
  { key: 'safety', label: 'Safety' },
  { key: 'walkability', label: 'Walkability' },
];

/* ------------------------------------------------------------------ */
/*  Helper functions                                                   */
/* ------------------------------------------------------------------ */

// Internet helpers
function speedTier(mbps: number): { label: string; color: string; bg: string } {
  if (mbps >= 100) return { label: 'Blazing', color: 'text-emerald-600', bg: 'bg-emerald-500' };
  if (mbps >= 50) return { label: 'Fast', color: 'text-green-600', bg: 'bg-green-500' };
  if (mbps >= 25) return { label: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-500' };
  if (mbps >= 10) return { label: 'Moderate', color: 'text-orange-600', bg: 'bg-orange-500' };
  return { label: 'Slow', color: 'text-red-600', bg: 'bg-red-500' };
}

function latencyTier(ms: number): { color: string } {
  if (ms <= 15) return { color: 'text-emerald-600' };
  if (ms <= 30) return { color: 'text-green-600' };
  if (ms <= 50) return { color: 'text-yellow-600' };
  return { color: 'text-red-600' };
}

// Safety helpers
function getSafety(slug: string): number {
  return SAFETY[slug] ?? DEFAULT_SAFETY;
}

function safetyColor(s: number): string {
  if (s >= 8) return 'text-emerald-600';
  if (s >= 6) return 'text-blue-600';
  if (s >= 4) return 'text-amber-600';
  return 'text-red-600';
}

function safetyBg(s: number): string {
  if (s >= 8) return 'bg-emerald-500';
  if (s >= 6) return 'bg-blue-500';
  if (s >= 4) return 'bg-amber-500';
  return 'bg-red-500';
}

function safetyLabel(s: number): string {
  if (s >= 8.5) return 'Very Safe';
  if (s >= 7.5) return 'Safe';
  if (s >= 6.5) return 'Moderate';
  if (s >= 5) return 'Caution';
  return 'Exercise Care';
}

// Walk helpers
function getWalk(slug: string): WalkData {
  return WALKABILITY[slug] ?? DEFAULT_WALK;
}

function walkColor(s: number): string {
  if (s >= 8) return 'text-emerald-600';
  if (s >= 6) return 'text-blue-600';
  if (s >= 4) return 'text-amber-600';
  return 'text-red-600';
}

function walkBg(s: number): string {
  if (s >= 8) return 'bg-emerald-500';
  if (s >= 6) return 'bg-blue-500';
  if (s >= 4) return 'bg-amber-500';
  return 'bg-red-500';
}

function carFreeColor(cf: string): string {
  if (cf === 'Yes') return 'text-emerald-600';
  if (cf === 'Mostly') return 'text-blue-600';
  if (cf === 'Difficult') return 'text-amber-600';
  return 'text-red-600';
}

// Nomad score badge
function nomadBadge(score: number): string {
  if (score >= 70) return 'bg-emerald-50 text-emerald-700';
  if (score >= 50) return 'bg-amber-50 text-amber-700';
  return 'bg-red-50 text-red-700';
}

/* ------------------------------------------------------------------ */
/*  Tab content components                                             */
/* ------------------------------------------------------------------ */

function InternetTab({ cities }: { cities: City[] }) {
  const filtered = cities
    .filter((c) => c.internet && c.internet.download_mbps > 0)
    .sort((a, b) => b.internet!.download_mbps - a.internet!.download_mbps);

  const maxDownload = filtered.length > 0 ? filtered[0].internet!.download_mbps : 1;
  const quarter = filtered.length > 0 ? filtered[0].internet!.quarter : '';

  const avgDownload = filtered.length > 0 ? Math.round(filtered.reduce((s, c) => s + c.internet!.download_mbps, 0) / filtered.length) : 0;
  const avgUpload = filtered.length > 0 ? Math.round(filtered.reduce((s, c) => s + c.internet!.upload_mbps, 0) / filtered.length) : 0;
  const avgLatency = filtered.length > 0 ? Math.round(filtered.reduce((s, c) => s + c.internet!.latency_ms, 0) / filtered.length) : 0;
  const fastCount = filtered.filter(c => c.internet!.download_mbps >= 50).length;

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <ArrowDown className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Avg Download</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">{avgDownload} <span className="text-sm font-normal text-zinc-400">Mbps</span></div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <ArrowUp className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Avg Upload</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">{avgUpload} <span className="text-sm font-normal text-zinc-400">Mbps</span></div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Avg Latency</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">{avgLatency} <span className="text-sm font-normal text-zinc-400">ms</span></div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Fast Cities</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{fastCount} <span className="text-sm font-normal text-zinc-400">/ {filtered.length}</span></div>
          <div className="text-xs text-zinc-500 mt-0.5">50+ Mbps download</div>
        </div>
      </div>

      {/* Speed Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-xs text-zinc-500">
        <span className="font-medium">Speed tiers:</span>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Blazing (100+)</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /> Fast (50-99)</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Good (25-49)</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Moderate (10-24)</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Slow (&lt;10)</div>
      </div>

      {/* Rankings Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden transition-colors">
        {/* Table Header */}
        <div className="grid grid-cols-[2.5rem_1fr_4.5rem_3.5rem_3.5rem] md:grid-cols-[3rem_1fr_8rem_7rem_6rem_6rem] gap-2 px-4 py-3 border-b border-zinc-200 text-xs font-medium uppercase tracking-wider text-zinc-500">
          <div className="text-center">#</div>
          <div>City</div>
          <div className="text-right">Download</div>
          <div className="text-right hidden md:block">Upload</div>
          <div className="text-right">Latency</div>
          <div className="text-right">Tests</div>
        </div>

        {/* Rows */}
        {filtered.map((city, idx) => {
          const tier = speedTier(city.internet!.download_mbps);
          const latTier = latencyTier(city.internet!.latency_ms);
          const barWidth = (city.internet!.download_mbps / maxDownload) * 100;

          return (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className="grid grid-cols-[2.5rem_1fr_4.5rem_3.5rem_3.5rem] md:grid-cols-[3rem_1fr_8rem_7rem_6rem_6rem] gap-2 px-4 py-3 border-b border-zinc-100 hover:bg-zinc-50 transition-colors items-center group"
            >
              {/* Rank */}
              <div className="text-center text-sm font-mono text-zinc-400">
                {idx + 1}
              </div>

              {/* City Name + Speed Bar */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-zinc-900 group-hover:text-primary transition-colors truncate">
                    {city.emoji} {city.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 shrink-0">{city.country}</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${tier.bg} transition-all duration-500`}
                    style={{ width: `${barWidth}%`, opacity: 0.7 }}
                  />
                </div>
              </div>

              {/* Download */}
              <div className="text-right">
                <span className={`text-sm font-bold font-mono ${tier.color}`}>
                  {city.internet!.download_mbps}
                </span>
                <span className="text-xs text-zinc-400 ml-0.5">Mbps</span>
              </div>

              {/* Upload */}
              <div className="text-right hidden md:block">
                <span className="text-sm font-mono text-zinc-600">
                  {city.internet!.upload_mbps}
                </span>
                <span className="text-xs text-zinc-400 ml-0.5">Mbps</span>
              </div>

              {/* Latency */}
              <div className="text-right">
                <span className={`text-sm font-mono ${latTier.color}`}>
                  {city.internet!.latency_ms}
                </span>
                <span className="text-xs text-zinc-400 ml-0.5">ms</span>
              </div>

              {/* Tests */}
              <div className="text-right text-xs font-mono text-zinc-400">
                {city.internet!.test_count >= 1000
                  ? `${(city.internet!.test_count / 1000).toFixed(0)}K`
                  : city.internet!.test_count.toLocaleString()}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Data Source */}
      <div className={PAGE_DISCLAIMER}>
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Data from <a href="https://github.com/teamookla/ookla-open-data" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-600 transition-colors">Ookla Open Data</a> ({quarter}).
          Fixed broadband speeds aggregated within 15km of each city center.
          Licensed under CC BY-NC-SA 4.0.
        </p>
      </div>
    </>
  );
}

function SafetyTab({ cities }: { cities: City[] }) {
  const ranked = cities
    .map(city => ({ ...city, safety: getSafety(city.slug) }))
    .sort((a, b) => b.safety - a.safety);

  const safest = ranked[0];
  const avgSafety = ranked.length > 0
    ? (ranked.reduce((s, c) => s + c.safety, 0) / ranked.length).toFixed(1)
    : '0';
  const verySafeCount = ranked.filter(c => c.safety >= 8).length;
  const cautionCount = ranked.filter(c => c.safety < 5).length;

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Safest City</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{safest?.safety}</div>
          <div className="text-xs text-zinc-500 mt-0.5">{safest?.emoji} {safest?.name}</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Average</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">{avgSafety}</div>
          <div className="text-xs text-zinc-500 mt-0.5">across all cities</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Very Safe</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{verySafeCount}</div>
          <div className="text-xs text-zinc-500 mt-0.5">score 8.0+</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Use Caution</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{cautionCount}</div>
          <div className="text-xs text-zinc-500 mt-0.5">score below 5.0</div>
        </div>
      </div>

      {/* Safety Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-xs text-zinc-500">
        <span className="font-medium">Safety tiers:</span>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Very Safe (8+)</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Safe (6-8)</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Caution (4-6)</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> High Risk (&lt;4)</div>
      </div>

      {/* Rankings Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden transition-colors">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left px-5 py-4"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">#</span></th>
                <th className="text-left px-5 py-4"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">City</span></th>
                <th className="text-right px-5 py-4"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Safety Score</span></th>
                <th className="text-left px-5 py-4"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Rating</span></th>
                <th className="text-right px-5 py-4"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Monthly Cost</span></th>
                <th className="text-right px-5 py-4"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nomad Score</span></th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((city, i) => {
                const barWidth = (city.safety / 10) * 100;
                return (
                  <tr key={city.slug} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3.5 text-zinc-400 tabular-nums">{i + 1}</td>
                    <td className="px-5 py-3.5">
                      <Link href={`/${city.slug}`} className="font-medium text-zinc-900 hover:text-blue-600 transition-colors whitespace-nowrap">
                        {city.emoji} {city.name}
                      </Link>
                      <span className="text-zinc-400 font-normal ml-1.5 text-xs">{city.country}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                          <div className={`h-full rounded-full ${safetyBg(city.safety)}`} style={{ width: `${barWidth}%`, opacity: 0.7 }} />
                        </div>
                        <span className={`font-bold tabular-nums ${safetyColor(city.safety)}`}>{city.safety.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-500">{safetyLabel(city.safety)}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-zinc-600">
                      ${city.cost.monthly_total.toLocaleString()}<span className="text-xs text-zinc-400">/mo</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${nomadBadge(city.nomad_score)}`}>
                        {city.nomad_score}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-zinc-100">
          {ranked.map((city, i) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs text-zinc-400 tabular-nums w-5 shrink-0">{i + 1}</span>
                <div className="min-w-0">
                  <div className="font-medium text-zinc-900 truncate">
                    {city.emoji} {city.name}
                  </div>
                  <div className="text-xs text-zinc-400">{city.country}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <div className="text-right">
                  <span className={`text-sm font-bold tabular-nums ${safetyColor(city.safety)}`}>
                    {city.safety.toFixed(1)}
                  </span>
                  <div className="text-[10px] text-zinc-400">{safetyLabel(city.safety)}</div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${nomadBadge(city.nomad_score)}`}>
                  {city.nomad_score}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Data Source */}
      <div className={PAGE_DISCLAIMER}>
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Safety scores are composite ratings based on crime indices, political stability, healthcare quality,
          and traveler safety reports. Scores are subjective estimates and should be used as general guidance only.
          Always check current travel advisories before visiting. Last updated June 2026.
        </p>
      </div>
    </>
  );
}

function WalkabilityTab({ cities }: { cities: City[] }) {
  const ranked = cities
    .map(city => ({ ...city, ...getWalk(city.slug) }))
    .sort((a, b) => b.walk - a.walk);

  const avgWalk = ranked.length > 0
    ? (ranked.reduce((s, c) => s + c.walk, 0) / ranked.length).toFixed(1)
    : '0';
  const highlyWalkable = ranked.filter(c => c.walk >= 8).length;
  const carFreeCount = ranked.filter(c => c.carFree === 'Yes').length;
  const bikeFriendly = ranked.filter(c => c.bike >= 7).length;

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <Footprints className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Avg Walk Score</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">{avgWalk}<span className="text-sm font-normal text-zinc-400">/10</span></div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <Footprints className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Highly Walkable</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{highlyWalkable}</div>
          <div className="text-xs text-zinc-500 mt-0.5">score 8.0+</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <Train className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Car-Free OK</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{carFreeCount}</div>
          <div className="text-xs text-zinc-500 mt-0.5">don&apos;t need a car</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <Bike className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Bike Friendly</span>
          </div>
          <div className="text-2xl font-bold text-violet-600">{bikeFriendly}</div>
          <div className="text-xs text-zinc-500 mt-0.5">bike score 7.0+</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-xs text-zinc-500">
        <span className="font-medium">Walk score tiers:</span>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Highly walkable (8+)</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Walkable (6-8)</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate (4-6)</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Car-dependent (&lt;4)</div>
      </div>

      {/* Rankings Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden transition-colors">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left px-5 py-4"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">#</span></th>
                <th className="text-left px-5 py-4"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">City</span></th>
                <th className="text-right px-5 py-4"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Walk</span></th>
                <th className="text-right px-5 py-4"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Transit</span></th>
                <th className="text-right px-5 py-4"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Bike</span></th>
                <th className="text-center px-5 py-4"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Car-Free?</span></th>
                <th className="text-right px-5 py-4"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nomad Score</span></th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((city, i) => {
                const walkBar = (city.walk / 10) * 100;
                return (
                  <tr key={city.slug} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3.5 text-zinc-400 tabular-nums">{i + 1}</td>
                    <td className="px-5 py-3.5">
                      <Link href={`/${city.slug}`} className="font-medium text-zinc-900 hover:text-blue-600 transition-colors whitespace-nowrap">
                        {city.emoji} {city.name}
                      </Link>
                      <span className="text-zinc-400 font-normal ml-1.5 text-xs">{city.country}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-14 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                          <div className={`h-full rounded-full ${walkBg(city.walk)}`} style={{ width: `${walkBar}%`, opacity: 0.7 }} />
                        </div>
                        <span className={`font-bold tabular-nums ${walkColor(city.walk)}`}>{city.walk.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`tabular-nums ${walkColor(city.transit)}`}>{city.transit.toFixed(1)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`tabular-nums ${walkColor(city.bike)}`}>{city.bike.toFixed(1)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-xs font-medium ${carFreeColor(city.carFree)}`}>{city.carFree}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${nomadBadge(city.nomad_score)}`}>
                        {city.nomad_score}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-zinc-100">
          {ranked.map((city, i) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs text-zinc-400 tabular-nums w-5 shrink-0">{i + 1}</span>
                <div className="min-w-0">
                  <div className="font-medium text-zinc-900 truncate">
                    {city.emoji} {city.name}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {city.country} · <span className={carFreeColor(city.carFree)}>Car-free: {city.carFree}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Footprints className="w-3 h-3 text-zinc-400" />
                    <span className={`text-sm font-bold tabular-nums ${walkColor(city.walk)}`}>{city.walk.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                    <span>🚇 {city.transit.toFixed(1)}</span>
                    <span>🚲 {city.bike.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Data Source */}
      <div className={PAGE_DISCLAIMER}>
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Walkability scores are based on pedestrian infrastructure, public transit availability,
          cycling infrastructure, and digital nomad community feedback. Scores are subjective estimates.
          Last updated June 2026.
        </p>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page (with Suspense boundary for useSearchParams)             */
/* ------------------------------------------------------------------ */

function RankingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabKey | null;
  const activeTab: TabKey = tabParam && TABS.some(t => t.key === tabParam) ? tabParam : 'internet';
  const { cities, loading } = useNomadCities<City>();

  const setTab = useCallback((key: TabKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', key);
    router.push(`/rankings?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  return (
    <NomadPageShell
      title="City Rankings"
      subtitle="Compare digital nomad cities by internet speed, safety, and walkability."
      footer={<BlogCTA />}
    >

        {/* Tab Bar */}
        <div className="bg-zinc-100 rounded-lg p-1 inline-flex gap-1 mb-10">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white shadow-sm text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-zinc-400">Loading data…</div>
        ) : (
          <>
            {activeTab === 'internet' && <InternetTab cities={cities} />}
            {activeTab === 'safety' && <SafetyTab cities={cities} />}
            {activeTab === 'walkability' && <WalkabilityTab cities={cities} />}
          </>
        )}
    </NomadPageShell>
  );
}

export default function RankingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center text-zinc-400">
        Loading…
      </div>
    }>
      <RankingsContent />
    </Suspense>
  );
}
