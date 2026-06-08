'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  MapPin,
  SlidersHorizontal,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface City {
  slug: string;
  name: string;
  country: string;
  emoji: string;
  continent: string;
  cost: {
    monthly_total: number;
    rent: number;
    food: number;
    transport: number;
    coworking: number;
    other: number;
  };
  weather: {
    avg_temp: number;
    avg_humidity: number;
  };
  spaces: {
    total: number;
    coworking: number;
  };
  nomad_score: number;
}

type SortKey =
  | 'monthly_total'
  | 'rent'
  | 'food'
  | 'coworking'
  | 'avg_temp'
  | 'nomad_score';
type SortDir = 'asc' | 'desc';

const CONTINENTS = [
  'All',
  'Asia',
  'Europe',
  'South America',
  'North America',
  'Africa',
] as const;

const BUDGET_MIN = 500;
const BUDGET_MAX = 5000;
const BUDGET_STEP = 50;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtCurrency(n: number) {
  return '$' + n.toLocaleString('en-US');
}

function scoreBadgeClasses(score: number) {
  if (score >= 70)
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400';
  if (score >= 50)
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400';
  return 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400';
}

function getSortValue(city: City, key: SortKey): number {
  switch (key) {
    case 'monthly_total':
      return city.cost.monthly_total;
    case 'rent':
      return city.cost.rent;
    case 'food':
      return city.cost.food;
    case 'coworking':
      return city.cost.coworking;
    case 'avg_temp':
      return city.weather.avg_temp;
    case 'nomad_score':
      return city.nomad_score;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CostOfLivingPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [budget, setBudget] = useState<number | null>(null); // null = no filter
  const [continent, setContinent] = useState<string>('All');

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>('monthly_total');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  /* ---- Fetch ---- */
  useEffect(() => {
    fetch('/nomad-cities.json')
      .then((r) => r.json())
      .then((data: City[]) => {
        setCities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* ---- Derived data ---- */
  const filtered = useMemo(() => {
    let list = cities;
    if (continent !== 'All') list = list.filter((c) => c.continent === continent);
    return list;
  }, [cities, continent]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const va = getSortValue(a, sortKey);
      const vb = getSortValue(b, sortKey);
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const inBudget = useMemo(() => {
    if (budget === null) return sorted.length;
    return sorted.filter((c) => c.cost.monthly_total <= budget).length;
  }, [sorted, budget]);

  const stats = useMemo(() => {
    if (filtered.length === 0)
      return { cheapest: null, expensive: null, avg: 0 };

    const costs = filtered.map((c) => c.cost.monthly_total);
    const min = Math.min(...costs);
    const max = Math.max(...costs);
    const avg = Math.round(costs.reduce((s, v) => s + v, 0) / costs.length);

    return {
      cheapest: filtered.find((c) => c.cost.monthly_total === min) ?? null,
      expensive: filtered.find((c) => c.cost.monthly_total === max) ?? null,
      avg,
    };
  }, [filtered]);

  /* ---- Sort handler ---- */
  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
    },
    [sortKey],
  );

  /* ---- Column header helper ---- */
  const SortHeader = ({
    label,
    sortField,
    className = '',
  }: {
    label: string;
    sortField: SortKey;
    className?: string;
  }) => (
    <button
      onClick={() => toggleSort(sortField)}
      className={`group inline-flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors ${className}`}
    >
      {label}
      {sortKey === sortField ? (
        sortDir === 'asc' ? (
          <ArrowUp className="h-3 w-3 text-zinc-900 dark:text-zinc-100" />
        ) : (
          <ArrowDown className="h-3 w-3 text-zinc-900 dark:text-zinc-100" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      )}
    </button>
  );

  /* ---- Budget slider thumb position ---- */
  const budgetPercent =
    budget !== null
      ? ((budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100
      : 100;

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="h-screen overflow-y-auto bg-[#fafafa] dark:bg-black selection:bg-primary/10 transition-colors duration-200 flex flex-col">
      <Header />
      <main
        id="main-content"
        className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 lg:py-24 pb-32 flex-1"
      >
        {/* ---- Heading ---- */}
        <div className="flex flex-col mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4 transition-colors">
            Cost of Living
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 transition-colors max-w-3xl">
            Compare monthly costs across 95 digital nomad cities. Filter by
            budget, sort by rent, food, coworking — find your next base.
          </p>
        </div>

        {loading ? (
          /* ---- Loading spinner ---- */
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <>
            {/* ---- Budget Slider ---- */}
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <SlidersHorizontal className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Budget Filter
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  I have{' '}
                  <span className="text-2xl tabular-nums">
                    {budget !== null ? fmtCurrency(budget) : '—'}
                  </span>
                  <span className="text-zinc-500 font-normal text-base">
                    /month
                  </span>
                </p>

                <div className="flex-1 flex items-center gap-3">
                  <span className="text-xs text-zinc-400 tabular-nums">
                    {fmtCurrency(BUDGET_MIN)}
                  </span>
                  <div className="relative flex-1">
                    <input
                      type="range"
                      min={BUDGET_MIN}
                      max={BUDGET_MAX}
                      step={BUDGET_STEP}
                      value={budget ?? BUDGET_MAX}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setBudget(v === BUDGET_MAX ? null : v);
                      }}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer
                        bg-zinc-200 dark:bg-zinc-800
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-zinc-900 [&::-webkit-slider-thumb]:dark:bg-white
                        [&::-webkit-slider-thumb]:shadow-md
                        [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                        [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5
                        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0
                        [&::-moz-range-thumb]:bg-zinc-900 [&::-moz-range-thumb]:dark:bg-white
                        [&::-moz-range-thumb]:shadow-md"
                      style={{
                        background: `linear-gradient(to right, #18181b ${budgetPercent}%, #e4e4e7 ${budgetPercent}%)`,
                      }}
                      aria-label="Monthly budget"
                    />
                  </div>
                  <span className="text-xs text-zinc-400 tabular-nums">
                    {fmtCurrency(BUDGET_MAX)}
                  </span>
                </div>

                {budget !== null && (
                  <button
                    onClick={() => setBudget(null)}
                    className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-2 transition-colors whitespace-nowrap"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>

            {/* ---- Continent Filter ---- */}
            <div className="flex flex-wrap gap-2 mb-6">
              {CONTINENTS.map((c) => (
                <button
                  key={c}
                  onClick={() => setContinent(c)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    continent === c
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* ---- Summary Stats ---- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={<TrendingDown className="h-4 w-4" />}
                label="Cheapest city"
                value={
                  stats.cheapest
                    ? fmtCurrency(stats.cheapest.cost.monthly_total) + '/mo'
                    : '—'
                }
                sub={
                  stats.cheapest
                    ? `${stats.cheapest.emoji} ${stats.cheapest.name}`
                    : undefined
                }
                accentClass="text-emerald-600 dark:text-emerald-400"
              />
              <StatCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="Most expensive"
                value={
                  stats.expensive
                    ? fmtCurrency(stats.expensive.cost.monthly_total) + '/mo'
                    : '—'
                }
                sub={
                  stats.expensive
                    ? `${stats.expensive.emoji} ${stats.expensive.name}`
                    : undefined
                }
                accentClass="text-red-600 dark:text-red-400"
              />
              <StatCard
                icon={<BarChart3 className="h-4 w-4" />}
                label="Average cost"
                value={fmtCurrency(stats.avg) + '/mo'}
                accentClass="text-blue-600 dark:text-blue-400"
              />
              <StatCard
                icon={<MapPin className="h-4 w-4" />}
                label="Cities in budget"
                value={`${inBudget}/${filtered.length}`}
                sub={budget !== null ? `≤ ${fmtCurrency(budget)}/mo` : 'No filter'}
                accentClass="text-violet-600 dark:text-violet-400"
              />
            </div>

            {/* ---- Table ---- */}
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl overflow-hidden">
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800/50">
                      <th className="text-left px-5 py-4">
                        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          #
                        </span>
                      </th>
                      <th className="text-left px-5 py-4">
                        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          City
                        </span>
                      </th>
                      <th className="text-left px-5 py-4">
                        <SortHeader label="Monthly" sortField="monthly_total" />
                      </th>
                      <th className="text-left px-5 py-4">
                        <SortHeader label="Rent" sortField="rent" />
                      </th>
                      <th className="text-left px-5 py-4">
                        <SortHeader label="Food" sortField="food" />
                      </th>
                      <th className="text-left px-5 py-4">
                        <SortHeader label="Cowork" sortField="coworking" />
                      </th>
                      <th className="text-left px-5 py-4">
                        <SortHeader label="Temp" sortField="avg_temp" />
                      </th>
                      <th className="text-left px-5 py-4">
                        <SortHeader label="Score" sortField="nomad_score" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((city, i) => {
                      const dimmed =
                        budget !== null &&
                        city.cost.monthly_total > budget;
                      return (
                        <Link
                          key={city.slug}
                          href={`/nomad/${city.slug}`}
                          className={`table-row hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer border-b border-zinc-100 dark:border-zinc-800/30 last:border-0 ${
                            dimmed ? 'opacity-35' : ''
                          }`}
                        >
                          <td className="px-5 py-3.5 text-zinc-400 tabular-nums">
                            {i + 1}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                            <span className="mr-2">{city.emoji}</span>
                            {city.name}
                            <span className="text-zinc-400 dark:text-zinc-500 font-normal ml-1.5">
                              {city.country}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                            {fmtCurrency(city.cost.monthly_total)}
                          </td>
                          <td className="px-5 py-3.5 tabular-nums text-zinc-600 dark:text-zinc-400">
                            {fmtCurrency(city.cost.rent)}
                          </td>
                          <td className="px-5 py-3.5 tabular-nums text-zinc-600 dark:text-zinc-400">
                            {fmtCurrency(city.cost.food)}
                          </td>
                          <td className="px-5 py-3.5 tabular-nums text-zinc-600 dark:text-zinc-400">
                            {fmtCurrency(city.cost.coworking)}
                          </td>
                          <td className="px-5 py-3.5 tabular-nums text-zinc-600 dark:text-zinc-400">
                            {Math.round(city.weather.avg_temp)}°C
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${scoreBadgeClasses(city.nomad_score)}`}
                            >
                              {city.nomad_score}
                            </span>
                          </td>
                        </Link>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile table */}
              <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800/30">
                {/* Mobile sort controls */}
                <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <DollarSign className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-xs text-zinc-400 mr-1">Sort:</span>
                  {(
                    [
                      ['monthly_total', 'Cost'],
                      ['nomad_score', 'Score'],
                      ['avg_temp', 'Temp'],
                    ] as [SortKey, string][]
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => toggleSort(key)}
                      className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                        sortKey === key
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-medium'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      {label}
                      {sortKey === key &&
                        (sortDir === 'asc' ? ' ↑' : ' ↓')}
                    </button>
                  ))}
                </div>

                {sorted.map((city, i) => {
                  const dimmed =
                    budget !== null && city.cost.monthly_total > budget;
                  return (
                    <Link
                      key={city.slug}
                      href={`/nomad/${city.slug}`}
                      className={`flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer ${
                        dimmed ? 'opacity-35' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs text-zinc-400 tabular-nums w-5 shrink-0">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            <span className="mr-1.5">{city.emoji}</span>
                            {city.name}
                          </div>
                          <div className="text-xs text-zinc-400 dark:text-zinc-500">
                            {city.country}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                          {fmtCurrency(city.cost.monthly_total)}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${scoreBadgeClasses(city.nomad_score)}`}
                        >
                          {city.nomad_score}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {sorted.length === 0 && (
                <div className="text-center py-16 text-zinc-400">
                  No cities match your filters.
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  icon,
  label,
  value,
  sub,
  accentClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accentClass: string;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={accentClass}>{icon}</div>
        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{sub}</p>
      )}
    </div>
  );
}
