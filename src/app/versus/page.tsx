'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import {
  ArrowLeft, ArrowLeftRight, Loader2, Trophy, DollarSign,
  Wifi, Thermometer, Droplets, Star, Info,
} from 'lucide-react';

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
  internet: { download_mbps: number };
  weather: {
    avg_temp: number;
    avg_humidity: number;
  };
}

function fmtCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

function winnerColor(isWinner: boolean): string {
  return isWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400';
}

export default function VersusPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [slugA, setSlugA] = useState('chiang-mai');
  const [slugB, setSlugB] = useState('lisbon');

  useEffect(() => {
    fetch('/nomad-cities.json')
      .then(r => r.json())
      .then((data: City[]) => {
        setCities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cityA = useMemo(() => cities.find(c => c.slug === slugA), [cities, slugA]);
  const cityB = useMemo(() => cities.find(c => c.slug === slugB), [cities, slugB]);

  const metrics = useMemo(() => {
    if (!cityA || !cityB) return [];
    return [
      {
        label: 'Nomad Score',
        icon: <Star className="w-4 h-4" />,
        valueA: cityA.nomad_score,
        valueB: cityB.nomad_score,
        formatA: `${cityA.nomad_score}/100`,
        formatB: `${cityB.nomad_score}/100`,
        higherWins: true,
      },
      {
        label: 'Monthly Cost',
        icon: <DollarSign className="w-4 h-4" />,
        valueA: cityA.cost.monthly_total,
        valueB: cityB.cost.monthly_total,
        formatA: fmtCurrency(cityA.cost.monthly_total),
        formatB: fmtCurrency(cityB.cost.monthly_total),
        higherWins: false,
      },
      {
        label: 'WiFi Speed',
        icon: <Wifi className="w-4 h-4" />,
        valueA: cityA.internet?.download_mbps ?? 0,
        valueB: cityB.internet?.download_mbps ?? 0,
        formatA: `${cityA.internet?.download_mbps ?? 0} Mbps`,
        formatB: `${cityB.internet?.download_mbps ?? 0} Mbps`,
        higherWins: true,
      },
      {
        label: 'Avg Temperature',
        icon: <Thermometer className="w-4 h-4" />,
        valueA: cityA.weather.avg_temp,
        valueB: cityB.weather.avg_temp,
        formatA: `${cityA.weather.avg_temp}°C`,
        formatB: `${cityB.weather.avg_temp}°C`,
        higherWins: null, // neutral — no winner
      },
      {
        label: 'Humidity',
        icon: <Droplets className="w-4 h-4" />,
        valueA: cityA.weather.avg_humidity,
        valueB: cityB.weather.avg_humidity,
        formatA: `${cityA.weather.avg_humidity}%`,
        formatB: `${cityB.weather.avg_humidity}%`,
        higherWins: false,
      },
    ];
  }, [cityA, cityB]);

  const verdictCounts = useMemo(() => {
    let winsA = 0, winsB = 0, ties = 0;
    metrics.forEach(m => {
      if (m.higherWins === null) { ties++; return; }
      const aWins = m.higherWins ? m.valueA > m.valueB : m.valueA < m.valueB;
      const bWins = m.higherWins ? m.valueB > m.valueA : m.valueB < m.valueA;
      if (aWins) winsA++;
      else if (bWins) winsB++;
      else ties++;
    });
    return { winsA, winsB, ties };
  }, [metrics]);

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
            City vs City
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 transition-colors max-w-3xl">
            Side-by-side comparison of digital nomad cities. Pick two cities and see which one wins on cost, internet, weather, and more.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <>
            {/* City Pickers */}
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4 md:p-6 mb-8">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 md:gap-6 items-center">
                {/* City A */}
                <div>
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">City A</label>
                  <select
                    value={slugA}
                    onChange={e => setSlugA(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                  >
                    {cities.map(c => (
                      <option key={c.slug} value={c.slug}>{c.emoji} {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* VS */}
                <div className="flex flex-col items-center pt-5">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <ArrowLeftRight className="w-4 h-4 text-zinc-400" />
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 font-semibold uppercase">VS</span>
                </div>

                {/* City B */}
                <div>
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">City B</label>
                  <select
                    value={slugB}
                    onChange={e => setSlugB(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                  >
                    {cities.map(c => (
                      <option key={c.slug} value={c.slug}>{c.emoji} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {cityA && cityB && (
              <>
                {/* Comparison Cards */}
                <div className="space-y-3 mb-8">
                  {metrics.map(m => {
                    let aWins = false, bWins = false;
                    if (m.higherWins !== null) {
                      aWins = m.higherWins ? m.valueA > m.valueB : m.valueA < m.valueB;
                      bWins = m.higherWins ? m.valueB > m.valueA : m.valueB < m.valueA;
                    }

                    return (
                      <div
                        key={m.label}
                        className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4"
                      >
                        {/* Metric label */}
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <span className="text-zinc-400">{m.icon}</span>
                          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{m.label}</span>
                        </div>

                        {/* Values */}
                        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                          <div className={`text-right ${aWins ? '' : ''}`}>
                            <span className={`text-xl md:text-2xl font-bold tabular-nums ${winnerColor(aWins)}`}>
                              {m.formatA}
                            </span>
                            {aWins && <Trophy className="w-4 h-4 text-emerald-500 inline ml-2" />}
                          </div>
                          <div className="text-xs text-zinc-300 dark:text-zinc-600 font-medium">vs</div>
                          <div>
                            {bWins && <Trophy className="w-4 h-4 text-emerald-500 inline mr-2" />}
                            <span className={`text-xl md:text-2xl font-bold tabular-nums ${winnerColor(bWins)}`}>
                              {m.formatB}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Verdict */}
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Verdict</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className={`text-3xl font-bold ${verdictCounts.winsA > verdictCounts.winsB ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                        {verdictCounts.winsA}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">{cityA.emoji} {cityA.name}</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-zinc-300 dark:text-zinc-600">{verdictCounts.ties}</div>
                      <div className="text-xs text-zinc-500 mt-1">Neutral</div>
                    </div>
                    <div>
                      <div className={`text-3xl font-bold ${verdictCounts.winsB > verdictCounts.winsA ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                        {verdictCounts.winsB}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">{cityB.emoji} {cityB.name}</div>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {verdictCounts.winsA > verdictCounts.winsB
                      ? `${cityA.emoji} ${cityA.name} wins on ${verdictCounts.winsA} out of ${metrics.length} metrics.`
                      : verdictCounts.winsB > verdictCounts.winsA
                      ? `${cityB.emoji} ${cityB.name} wins on ${verdictCounts.winsB} out of ${metrics.length} metrics.`
                      : `It's a tie! Both cities win on ${verdictCounts.winsA} metrics each.`
                    }
                  </p>

                  <div className="flex items-center justify-center gap-3 mt-4">
                    <Link href={`/${cityA.slug}`} className="px-4 py-2 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                      View {cityA.name} →
                    </Link>
                    <Link href={`/${cityB.slug}`} className="px-4 py-2 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                      View {cityB.name} →
                    </Link>
                  </div>
                </div>
              </>
            )}

            {/* Disclaimer */}
            <div className="mt-8 flex items-start gap-2 text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed max-w-2xl">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Comparison uses average annual data. Individual experience may vary by season,
                neighborhood, and personal preferences. WiFi speeds from Ookla Open Data.
              </p>
            </div>
          </>
        )}
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
