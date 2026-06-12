import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import { ArrowLeft, Footprints, Train, Bike, Info, BarChart3 } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Walkability data                                                   */
/* ------------------------------------------------------------------ */

interface WalkData {
  walk: number;
  transit: number;
  bike: number;
  carFree: 'Yes' | 'Mostly' | 'Difficult' | 'No';
}

const WALKABILITY: Record<string, WalkData> = {
  // Highly walkable (8-10)
  'tokyo': { walk: 9.2, transit: 9.5, bike: 8.5, carFree: 'Yes' },
  'barcelona': { walk: 9.0, transit: 8.5, bike: 7.5, carFree: 'Yes' },
  'lisbon': { walk: 8.5, transit: 7.8, bike: 6.0, carFree: 'Yes' },
  'prague': { walk: 8.8, transit: 8.5, bike: 7.0, carFree: 'Yes' },
  'budapest': { walk: 8.5, transit: 8.2, bike: 7.2, carFree: 'Yes' },
  'vienna': { walk: 9.0, transit: 9.2, bike: 8.8, carFree: 'Yes' },
  'paris': { walk: 9.0, transit: 9.0, bike: 8.0, carFree: 'Yes' },
  'berlin': { walk: 8.5, transit: 8.8, bike: 9.0, carFree: 'Yes' },
  'amsterdam': { walk: 8.8, transit: 8.0, bike: 9.5, carFree: 'Yes' },
  'copenhagen': { walk: 8.5, transit: 8.0, bike: 9.5, carFree: 'Yes' },
  'stockholm': { walk: 8.2, transit: 8.5, bike: 7.5, carFree: 'Yes' },
  'singapore': { walk: 8.5, transit: 9.0, bike: 6.0, carFree: 'Yes' },
  'taipei': { walk: 8.0, transit: 8.8, bike: 7.0, carFree: 'Yes' },
  'london': { walk: 8.8, transit: 9.5, bike: 7.5, carFree: 'Yes' },
  'rome': { walk: 8.5, transit: 7.0, bike: 5.5, carFree: 'Yes' },
  'florence': { walk: 9.0, transit: 6.5, bike: 7.0, carFree: 'Yes' },
  // Walkable (6-8)
  'seoul': { walk: 7.8, transit: 9.0, bike: 7.0, carFree: 'Mostly' },
  'bangkok': { walk: 6.5, transit: 7.5, bike: 4.0, carFree: 'Mostly' },
  'buenos-aires': { walk: 7.5, transit: 7.8, bike: 6.5, carFree: 'Mostly' },
  'istanbul': { walk: 7.0, transit: 7.5, bike: 4.0, carFree: 'Mostly' },
  'porto': { walk: 7.8, transit: 7.0, bike: 5.5, carFree: 'Mostly' },
  'split': { walk: 7.5, transit: 5.5, bike: 5.0, carFree: 'Mostly' },
  'dubrovnik': { walk: 8.0, transit: 5.0, bike: 4.0, carFree: 'Mostly' },
  'tbilisi': { walk: 6.8, transit: 6.5, bike: 4.5, carFree: 'Mostly' },
  'chiang-mai': { walk: 6.0, transit: 5.0, bike: 6.5, carFree: 'Mostly' },
  'ho-chi-minh-city': { walk: 6.0, transit: 5.5, bike: 7.0, carFree: 'Mostly' },
  'marrakech': { walk: 7.0, transit: 4.0, bike: 4.0, carFree: 'Mostly' },
  'tallinn': { walk: 7.5, transit: 7.0, bike: 6.0, carFree: 'Mostly' },
  'athens': { walk: 7.2, transit: 7.0, bike: 5.0, carFree: 'Mostly' },
  'milan': { walk: 7.8, transit: 8.0, bike: 7.5, carFree: 'Mostly' },
  'valencia': { walk: 7.5, transit: 7.0, bike: 8.0, carFree: 'Mostly' },
  'malaga': { walk: 7.5, transit: 6.5, bike: 6.0, carFree: 'Mostly' },
  'hanoi': { walk: 6.5, transit: 5.0, bike: 7.0, carFree: 'Mostly' },
  'da-nang': { walk: 6.0, transit: 4.5, bike: 7.0, carFree: 'Mostly' },
  'Ljubljana': { walk: 8.0, transit: 6.0, bike: 8.0, carFree: 'Mostly' },
  // Moderate (4-6)
  'bali': { walk: 4.0, transit: 2.5, bike: 5.0, carFree: 'Difficult' },
  'bali-cangguubud': { walk: 4.0, transit: 2.5, bike: 5.0, carFree: 'Difficult' },
  'canggu': { walk: 4.5, transit: 2.0, bike: 5.5, carFree: 'Difficult' },
  'kuala-lumpur': { walk: 5.5, transit: 7.0, bike: 3.5, carFree: 'Difficult' },
  'dubai': { walk: 4.0, transit: 6.5, bike: 3.0, carFree: 'Difficult' },
  'manila': { walk: 5.0, transit: 5.5, bike: 3.0, carFree: 'Difficult' },
  'mexico-city': { walk: 6.0, transit: 7.0, bike: 5.0, carFree: 'Difficult' },
  'lima': { walk: 5.0, transit: 5.5, bike: 3.5, carFree: 'Difficult' },
  'bogota': { walk: 5.5, transit: 6.5, bike: 6.0, carFree: 'Difficult' },
  'santiago': { walk: 6.0, transit: 7.5, bike: 5.0, carFree: 'Difficult' },
  'cape-town': { walk: 4.5, transit: 4.0, bike: 4.0, carFree: 'Difficult' },
  'mumbai': { walk: 5.5, transit: 6.5, bike: 3.0, carFree: 'Difficult' },
  'delhi': { walk: 5.0, transit: 6.0, bike: 3.0, carFree: 'Difficult' },
  'jakarta': { walk: 4.0, transit: 5.0, bike: 3.0, carFree: 'Difficult' },
  // Car-dependent (2-4)
  'phuket': { walk: 3.0, transit: 2.5, bike: 3.0, carFree: 'No' },
  'koh-phangan': { walk: 3.5, transit: 2.0, bike: 3.5, carFree: 'No' },
  'playa-del-carmen': { walk: 5.0, transit: 3.0, bike: 4.5, carFree: 'Difficult' },
  'tulum': { walk: 4.0, transit: 2.0, bike: 5.0, carFree: 'No' },
};

const DEFAULT_WALK: WalkData = { walk: 5.5, transit: 5.0, bike: 4.5, carFree: 'Difficult' };

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

interface City {
  slug: string;
  name: string;
  country: string;
  emoji: string;
  nomad_score: number;
  cost: { monthly_total: number };
}

function getWalk(slug: string): WalkData {
  return WALKABILITY[slug] ?? DEFAULT_WALK;
}

function walkColor(s: number): string {
  if (s >= 8) return 'text-emerald-600 dark:text-emerald-400';
  if (s >= 6) return 'text-blue-600 dark:text-blue-400';
  if (s >= 4) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function walkBg(s: number): string {
  if (s >= 8) return 'bg-emerald-500';
  if (s >= 6) return 'bg-blue-500';
  if (s >= 4) return 'bg-amber-500';
  return 'bg-red-500';
}

function carFreeColor(cf: string): string {
  if (cf === 'Yes') return 'text-emerald-600 dark:text-emerald-400';
  if (cf === 'Mostly') return 'text-blue-600 dark:text-blue-400';
  if (cf === 'Difficult') return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function loadCities(): City[] {
  const filePath = path.join(process.cwd(), 'public', 'nomad-cities.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

export default function WalkabilityPage() {
  const cities = loadCities();

  const ranked = cities
    .map(city => ({
      ...city,
      ...getWalk(city.slug),
    }))
    .sort((a, b) => b.walk - a.walk);

  const avgWalk = ranked.length > 0
    ? (ranked.reduce((s, c) => s + c.walk, 0) / ranked.length).toFixed(1)
    : '0';
  const highlyWalkable = ranked.filter(c => c.walk >= 8).length;
  const carFreeCount = ranked.filter(c => c.carFree === 'Yes').length;
  const bikeFriendly = ranked.filter(c => c.bike >= 7).length;

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
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-zinc-900 dark:text-zinc-50 mb-3 transition-colors">
            Walkability Scores
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 transition-colors max-w-3xl">
            Walk, transit, and bike scores for {ranked.length} digital nomad cities. Find cities where you can live car-free.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <Footprints className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Avg Walk Score</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{avgWalk}<span className="text-sm font-normal text-zinc-400">/10</span></div>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <Footprints className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Highly Walkable</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{highlyWalkable}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">score 8.0+</div>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <Train className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Car-Free OK</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{carFreeCount}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">don&apos;t need a car</div>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <Bike className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Bike Friendly</span>
            </div>
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">{bikeFriendly}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">bike score 7.0+</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium">Walk score tiers:</span>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Highly walkable (8+)</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Walkable (6-8)</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate (4-6)</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Car-dependent (&lt;4)</div>
        </div>

        {/* Rankings Table */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl overflow-hidden transition-colors">
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800/50">
                  <th className="text-left px-5 py-4"><span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">#</span></th>
                  <th className="text-left px-5 py-4"><span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">City</span></th>
                  <th className="text-right px-5 py-4"><span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Walk</span></th>
                  <th className="text-right px-5 py-4"><span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Transit</span></th>
                  <th className="text-right px-5 py-4"><span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Bike</span></th>
                  <th className="text-center px-5 py-4"><span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Car-Free?</span></th>
                  <th className="text-right px-5 py-4"><span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Nomad Score</span></th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((city, i) => {
                  const walkBar = (city.walk / 10) * 100;
                  return (
                    <tr key={city.slug} className="border-b border-zinc-100 dark:border-zinc-800/30 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3.5 text-zinc-400 tabular-nums">{i + 1}</td>
                      <td className="px-5 py-3.5">
                        <Link href={`/${city.slug}`} className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">
                          {city.emoji} {city.name}
                        </Link>
                        <span className="text-zinc-400 dark:text-zinc-500 font-normal ml-1.5 text-xs">{city.country}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-14 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
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
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${
                          city.nomad_score >= 70
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : city.nomad_score >= 50
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                        }`}>
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
          <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800/30">
            {ranked.map((city, i) => (
              <Link
                key={city.slug}
                href={`/${city.slug}`}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-zinc-400 tabular-nums w-5 shrink-0">{i + 1}</span>
                  <div className="min-w-0">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {city.emoji} {city.name}
                    </div>
                    <div className="text-xs text-zinc-400 dark:text-zinc-500">
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
        <div className="mt-8 flex items-start gap-2 text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed max-w-2xl">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Walkability scores are based on pedestrian infrastructure, public transit availability,
            cycling infrastructure, and digital nomad community feedback. Scores are subjective estimates.
            Last updated June 2026.
          </p>
        </div>
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
