import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import { ArrowLeft, Shield, AlertTriangle, Info, BarChart3 } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Safety scores                                                      */
/* ------------------------------------------------------------------ */

const SAFETY: Record<string, number> = {
  'tokyo': 9.2, 'singapore': 9.1, 'taipei': 9.0, 'seoul': 8.5, 'reykjavik': 9.0,
  'copenhagen': 8.8, 'vienna': 8.7, 'zurich': 8.8, 'stockholm': 8.5, 'helsinki': 8.7,
  'prague': 8.3, 'tallinn': 8.2, 'ljubljana': 8.4, 'budapest': 7.8,
  'lisbon': 7.5, 'porto': 7.8, 'barcelona': 6.8, 'berlin': 7.2, 'amsterdam': 7.3,
  'dublin': 7.5, 'split': 8.0, 'dubrovnik': 8.2, 'tbilisi': 7.5, 'bansko': 8.0,
  'bucharest': 7.0, 'belgrade': 7.2, 'chiang-mai': 8.0, 'bangkok': 7.0,
  'bali': 7.2, 'bali-cangguubud': 7.3, 'canggu': 7.2, 'ubud': 7.5,
  'kuala-lumpur': 6.8, 'ho-chi-minh-city': 6.5, 'da-nang': 7.5, 'hanoi': 6.8,
  'manila': 5.5, 'buenos-aires': 5.8, 'medellin': 5.5, 'bogota': 4.8,
  'mexico-city': 5.0, 'playa-del-carmen': 5.5, 'lima': 5.0, 'santiago': 6.0,
  'cartagena': 5.5, 'dubai': 8.5, 'istanbul': 6.5, 'antalya': 7.5,
  'cape-town': 4.5, 'nairobi': 4.0, 'accra': 5.5, 'marrakech': 5.8,
  'cairo': 5.0, 'bangalore': 5.5, 'mumbai': 5.0, 'delhi': 4.5, 'goa': 6.5,
  'antigua': 6.5, 'las-palmas': 8.0, 'tenerife': 8.0, 'malaga': 7.5,
  'valencia': 7.3, 'palma-de-mallorca': 7.8, 'koh-phangan': 7.0,
  'koh-samui': 7.2, 'phuket': 6.8, 'chiang-rai': 8.2, 'pai': 8.0,
  'florence': 7.5, 'rome': 6.5, 'milan': 7.0, 'athens': 6.8,
  'new-york': 6.0, 'san-francisco': 5.5, 'austin': 7.0, 'denver': 7.0,
  'miami': 6.0, 'montreal': 7.5, 'vancouver': 7.3, 'toronto': 7.0,
  'london': 6.5, 'paris': 6.0, 'johor-bahru': 6.5, 'johor': 6.5, 'penang': 7.0,
  'cebu': 5.8, 'siargao': 7.0, 'jakarta': 5.5, 'yogyakarta': 7.0,
  'siem-reap': 6.5, 'phnom-penh': 5.5, 'vientiane': 7.0, 'luang-prabang': 7.5,
  'kathmandu': 5.5, 'pokhara': 7.0, 'colombo': 6.0, 'batumi': 7.0,
  'yerevan': 7.5, 'tashkent': 6.5, 'almaty': 6.5,
  'gran-canaria-las-palmas': 8.0, 'sofia': 7.0, 'dahab': 7.0,
  'santa-marta': 5.0, 'kilifi': 5.0, 'florianopolis': 6.0,
  'rio-de-janeiro': 4.5, 'roatan': 5.5, 'guadalajara': 5.0,
  'montevideo': 6.5, 'kas': 7.5, 'madeira-funchal': 8.5, 'ericeira': 7.8,
  'krakow': 8.0, 'florianopolis-2': 6.0, 'cusco': 5.5,
  'sao-paulo': 4.5, 'palermo': 6.5, 'thessaloniki': 7.0,
  'vilnius': 8.0, 'shanghai': 7.5, 'riga': 7.5, 'valparaiso': 5.0,
  'hoi-an': 7.5, 'tulum': 5.5, 'oaxaca': 5.5, 'zanzibar': 5.5, 'lagos': 4.0,
  'warsaw': 7.5, 'komoro': 6.0,
};

const DEFAULT_SAFETY = 6.0;

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

function getSafety(slug: string): number {
  return SAFETY[slug] ?? DEFAULT_SAFETY;
}

function safetyColor(s: number): string {
  if (s >= 8) return 'text-emerald-600 dark:text-emerald-400';
  if (s >= 6) return 'text-blue-600 dark:text-blue-400';
  if (s >= 4) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
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

function loadCities(): City[] {
  const filePath = path.join(process.cwd(), 'public', 'nomad-cities.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

export default function SafetyPage() {
  const cities = loadCities();

  // Sort by safety score descending
  const ranked = cities
    .map(city => ({
      ...city,
      safety: getSafety(city.slug),
    }))
    .sort((a, b) => b.safety - a.safety);

  const safest = ranked[0];
  const avgSafety = ranked.length > 0
    ? (ranked.reduce((s, c) => s + c.safety, 0) / ranked.length).toFixed(1)
    : '0';
  const verySafeCount = ranked.filter(c => c.safety >= 8).length;
  const cautionCount = ranked.filter(c => c.safety < 5).length;

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
            Safety Rankings
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 transition-colors max-w-3xl">
            Safety scores for {ranked.length} digital nomad cities, ranked from safest to least safe.
            Scores factor in crime rates, political stability, and traveler safety reports.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Safest City</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{safest?.safety}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{safest?.emoji} {safest?.name}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Average</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{avgSafety}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">across all cities</div>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Very Safe</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{verySafeCount}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">score 8.0+</div>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Use Caution</span>
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{cautionCount}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">score below 5.0</div>
          </div>
        </div>

        {/* Safety Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium">Safety tiers:</span>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Very Safe (8+)</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Safe (6-8)</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Caution (4-6)</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> High Risk (&lt;4)</div>
        </div>

        {/* Rankings Table */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl overflow-hidden transition-colors">
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800/50">
                  <th className="text-left px-5 py-4">
                    <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">#</span>
                  </th>
                  <th className="text-left px-5 py-4">
                    <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">City</span>
                  </th>
                  <th className="text-right px-5 py-4">
                    <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Safety Score</span>
                  </th>
                  <th className="text-left px-5 py-4">
                    <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Rating</span>
                  </th>
                  <th className="text-right px-5 py-4">
                    <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Monthly Cost</span>
                  </th>
                  <th className="text-right px-5 py-4">
                    <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Nomad Score</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((city, i) => {
                  const barWidth = (city.safety / 10) * 100;
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
                          <div className="w-16 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div className={`h-full rounded-full ${safetyBg(city.safety)}`} style={{ width: `${barWidth}%`, opacity: 0.7 }} />
                          </div>
                          <span className={`font-bold tabular-nums ${safetyColor(city.safety)}`}>{city.safety.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-zinc-500 dark:text-zinc-400">{safetyLabel(city.safety)}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                        ${city.cost.monthly_total.toLocaleString()}<span className="text-xs text-zinc-400">/mo</span>
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
                    <div className="text-xs text-zinc-400 dark:text-zinc-500">{city.country}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-right">
                    <span className={`text-sm font-bold tabular-nums ${safetyColor(city.safety)}`}>
                      {city.safety.toFixed(1)}
                    </span>
                    <div className="text-[10px] text-zinc-400">{safetyLabel(city.safety)}</div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                    city.nomad_score >= 70
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                      : city.nomad_score >= 50
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                  }`}>
                    {city.nomad_score}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Data Source */}
        <div className="mt-8 flex items-start gap-2 text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed max-w-2xl">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Safety scores are composite ratings based on crime indices, political stability, healthcare quality,
            and traveler safety reports. Scores are subjective estimates and should be used as general guidance only.
            Always check current travel advisories before visiting. Last updated June 2026.
          </p>
        </div>
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
