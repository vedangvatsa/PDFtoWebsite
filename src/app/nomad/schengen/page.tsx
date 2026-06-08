'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CalendarDays,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plane,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Trip {
  id: string;
  entry: string; // ISO date string yyyy-mm-dd
  exit: string;
}

type Preset = 'schengen' | 'thailand' | 'uk';

interface PresetConfig {
  label: string;
  maxDays: number;
  windowDays: number;
  description: string;
}

const PRESETS: Record<Preset, PresetConfig> = {
  schengen: {
    label: 'Schengen (90/180)',
    maxDays: 90,
    windowDays: 180,
    description: '90 days in any rolling 180-day window',
  },
  thailand: {
    label: 'Thailand (60-day)',
    maxDays: 60,
    windowDays: 60,
    description: '60 days per entry',
  },
  uk: {
    label: 'UK (180/365)',
    maxDays: 180,
    windowDays: 365,
    description: '180 days in any rolling 12-month window',
  },
};

/* ------------------------------------------------------------------ */
/*  Date helpers                                                       */
/* ------------------------------------------------------------------ */

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Inclusive day count: both entry and exit days count */
function daysBetween(a: Date, b: Date): number {
  const ms = Math.abs(b.getTime() - a.getTime());
  return Math.floor(ms / 86_400_000) + 1;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/* ------------------------------------------------------------------ */
/*  Core calculator – rolling window                                   */
/* ------------------------------------------------------------------ */

/**
 * For the Schengen rolling-window rule:
 * On any given day D, look back `windowDays` days (D − windowDays + 1 … D).
 * Count how many of those days fall inside a trip.
 * Return that count.
 */
function daysUsedOnDate(
  trips: Trip[],
  checkDate: Date,
  windowDays: number
): number {
  const windowStart = addDays(checkDate, -(windowDays - 1));
  let count = 0;

  for (const trip of trips) {
    const tEntry = parseDate(trip.entry);
    const tExit = parseDate(trip.exit);
    // Overlap between [windowStart, checkDate] and [tEntry, tExit]
    const overlapStart = tEntry > windowStart ? tEntry : windowStart;
    const overlapEnd = tExit < checkDate ? tExit : checkDate;
    if (overlapStart <= overlapEnd) {
      count += daysBetween(overlapStart, overlapEnd);
    }
  }

  return count;
}

/**
 * Find the worst (maximum) days-used value across all days from today
 * going backwards through the window. This is the "current" usage.
 */
function currentUsage(trips: Trip[], preset: PresetConfig): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return daysUsedOnDate(trips, today, preset.windowDays);
}

/**
 * Find the next date (starting from tomorrow) when the user can enter
 * without exceeding maxDays. We scan up to 365 days out.
 */
function nextAvailableDate(
  trips: Trip[],
  preset: PresetConfig
): Date | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i <= 365; i++) {
    const d = addDays(today, i);
    const used = daysUsedOnDate(trips, d, preset.windowDays);
    if (used < preset.maxDays) return d;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  localStorage persistence                                           */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'schengen-calc-trips';

function loadTrips(): Trip[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveTrips(trips: Trip[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function SchengenCalculatorPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [preset, setPreset] = useState<Preset>('schengen');
  const [entryDate, setEntryDate] = useState('');
  const [exitDate, setExitDate] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setTrips(loadTrips());
    setMounted(true);
  }, []);

  // Save whenever trips change
  useEffect(() => {
    if (mounted) saveTrips(trips);
  }, [trips, mounted]);

  const config = PRESETS[preset];

  const addTrip = useCallback(() => {
    setError('');
    if (!entryDate || !exitDate) {
      setError('Please select both entry and exit dates.');
      return;
    }
    const entry = parseDate(entryDate);
    const exit = parseDate(exitDate);
    if (exit < entry) {
      setError('Exit date must be on or after the entry date.');
      return;
    }
    const newTrip: Trip = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      entry: entryDate,
      exit: exitDate,
    };
    setTrips((prev) =>
      [...prev, newTrip].sort(
        (a, b) => parseDate(a.entry).getTime() - parseDate(b.entry).getTime()
      )
    );
    setEntryDate('');
    setExitDate('');
  }, [entryDate, exitDate]);

  const removeTrip = useCallback((id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ---- computed results ---- */
  const results = useMemo(() => {
    const used = currentUsage(trips, config);
    const remaining = Math.max(0, config.maxDays - used);
    const nextEntry = nextAvailableDate(trips, config);
    let status: 'safe' | 'warning' | 'danger';
    if (remaining <= 0) status = 'danger';
    else if (remaining < 3) status = 'danger';
    else if (remaining < 14) status = 'warning';
    else status = 'safe';
    return { used, remaining, nextEntry, status };
  }, [trips, config]);

  /* ---- rolling window bar data ---- */
  const windowBar = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const windowStart = addDays(today, -(config.windowDays - 1));
    const windowEnd = today;

    // Build segments: each trip that overlaps the window
    const segments: {
      startPct: number;
      widthPct: number;
      label: string;
    }[] = [];

    for (const trip of trips) {
      const tEntry = parseDate(trip.entry);
      const tExit = parseDate(trip.exit);
      const overlapStart = tEntry > windowStart ? tEntry : windowStart;
      const overlapEnd = tExit < windowEnd ? tExit : windowEnd;
      if (overlapStart > overlapEnd) continue;

      const startDay = daysBetween(windowStart, overlapStart) - 1;
      const endDay = daysBetween(windowStart, overlapEnd) - 1;
      const startPct = (startDay / config.windowDays) * 100;
      const widthPct = ((endDay - startDay + 1) / config.windowDays) * 100;

      segments.push({
        startPct,
        widthPct,
        label: `${formatDate(overlapStart)} → ${formatDate(overlapEnd)}`,
      });
    }

    // Today marker position
    const todayPct = 100; // today is the last day of the window

    return { segments, todayPct, windowStart, windowEnd };
  }, [trips, config]);

  const statusColors = {
    safe: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      text: 'text-emerald-700 dark:text-emerald-400',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      label: 'Safe',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800/50',
      text: 'text-amber-700 dark:text-amber-400',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      label: 'Getting Close',
    },
    danger: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800/50',
      text: 'text-red-700 dark:text-red-400',
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      label: results.remaining <= 0 ? 'Overstayed' : 'Critical',
    },
  };

  const sc = statusColors[results.status];

  return (
    <div className="h-screen overflow-y-auto bg-[#fafafa] dark:bg-black selection:bg-primary/10 transition-colors duration-200 flex flex-col">
      <Header />
      <main
        id="main-content"
        className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 lg:py-24 pb-32 flex-1"
      >
        {/* Back link */}
        <Link
          href="/nomad"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>

        {/* Page title */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4 transition-colors">
            Visa Day Calculator
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 transition-colors">
            Track your rolling visa window and plan future trips without
            overstaying.
          </p>
        </div>

        {/* ---- Preset Tabs ---- */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(Object.entries(PRESETS) as [Preset, PresetConfig][]).map(
            ([key, cfg]) => (
              <button
                key={key}
                onClick={() => setPreset(key)}
                className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  preset === key
                    ? 'bg-black text-white dark:bg-white dark:text-black hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {cfg.label}
              </button>
            )
          )}
        </div>

        {/* ---- Active preset info ---- */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 flex items-center gap-1.5">
          <Info className="w-4 h-4 flex-shrink-0" />
          {config.description}
        </p>

        {/* ---- Status Card ---- */}
        {mounted && (
          <div
            className={`${sc.bg} border ${sc.border} rounded-xl p-6 mb-8 transition-all`}
          >
            <div className="flex items-center gap-3 mb-4">
              {sc.icon}
              <span className={`font-bold text-lg ${sc.text}`}>
                {sc.label}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Days Used
                </div>
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {results.used}
                  <span className="text-base font-normal text-zinc-400 dark:text-zinc-500">
                    /{config.maxDays}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Days Remaining
                </div>
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {results.remaining}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Next Available Entry
                </div>
                <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {results.nextEntry
                    ? formatDate(results.nextEntry)
                    : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Window
                </div>
                <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {config.windowDays} days
                </div>
              </div>
            </div>

            {/* Usage bar */}
            <div className="mt-4">
              <div className="w-full h-3 rounded-full bg-white/60 dark:bg-zinc-800/60 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      (results.used / config.maxDays) * 100,
                      100
                    )}%`,
                    backgroundColor:
                      results.status === 'safe'
                        ? '#10b981'
                        : results.status === 'warning'
                        ? '#f59e0b'
                        : '#ef4444',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ---- Rolling Window Visualization ---- */}
        {mounted && (
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-6 mb-8 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm dark:hover:shadow-white/5 transition-all">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Rolling {config.windowDays}-Day Window
            </h2>

            {/* Labels */}
            <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-500 mb-2">
              <span>{formatDate(windowBar.windowStart)}</span>
              <span>Today</span>
            </div>

            {/* Bar */}
            <div className="relative w-full h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 overflow-hidden">
              {windowBar.segments.map((seg, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full rounded-sm"
                  style={{
                    left: `${seg.startPct}%`,
                    width: `${Math.max(seg.widthPct, 0.5)}%`,
                    backgroundColor:
                      results.status === 'safe'
                        ? '#10b981'
                        : results.status === 'warning'
                        ? '#f59e0b'
                        : '#ef4444',
                    opacity: 0.7,
                  }}
                  title={seg.label}
                />
              ))}

              {/* Today marker */}
              <div
                className="absolute top-0 h-full w-0.5 bg-zinc-900 dark:bg-zinc-100"
                style={{ left: `calc(${windowBar.todayPct}% - 1px)` }}
              />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor:
                      results.status === 'safe'
                        ? '#10b981'
                        : results.status === 'warning'
                        ? '#f59e0b'
                        : '#ef4444',
                    opacity: 0.7,
                  }}
                />
                Days in zone
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-zinc-900 dark:bg-zinc-100" />
                Today
              </div>
            </div>
          </div>
        )}

        {/* ---- Add Trip ---- */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-6 mb-8 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm dark:hover:shadow-white/5 transition-all">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <Plane className="w-5 h-5" />
            Add Trip
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
                Entry Date
              </label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full h-10 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
                Exit Date
              </label>
              <input
                type="date"
                value={exitDate}
                onChange={(e) => setExitDate(e.target.value)}
                className="w-full h-10 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 mb-3">
              {error}
            </p>
          )}

          <button
            onClick={addTrip}
            className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Trip
          </button>
        </div>

        {/* ---- Trip List ---- */}
        {trips.length > 0 && (
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-6 mb-8 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm dark:hover:shadow-white/5 transition-all">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Your Trips
              <span className="ml-auto text-sm font-normal text-zinc-400 dark:text-zinc-500">
                {trips.length} trip{trips.length !== 1 ? 's' : ''}
              </span>
            </h2>

            <div className="space-y-2">
              {trips.map((trip) => {
                const entry = parseDate(trip.entry);
                const exit = parseDate(trip.exit);
                const days = daysBetween(entry, exit);
                return (
                  <div
                    key={trip.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800/50 group transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {formatDate(entry)} → {formatDate(exit)}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {days} day{days !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => removeTrip(trip.id)}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                      aria-label="Delete trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">
                Total days across all trips
              </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-50">
                {trips.reduce((sum, t) => {
                  return sum + daysBetween(parseDate(t.entry), parseDate(t.exit));
                }, 0)}
              </span>
            </div>
          </div>
        )}

        {/* ---- How It Works ---- */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-6 mb-8 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm dark:hover:shadow-white/5 transition-all">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            How It Works
          </h2>

          <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              The <strong className="text-zinc-900 dark:text-zinc-100">Schengen 90/180 rule</strong> allows
              you to stay for a maximum of <strong className="text-zinc-900 dark:text-zinc-100">90 days</strong> within
              any <strong className="text-zinc-900 dark:text-zinc-100">180-day rolling period</strong>.
            </p>
            <p>
              Unlike a fixed calendar period, this is a <em>rolling window</em>. On any
              given day, the system looks back 180 days and counts how many of those
              days you spent inside the Schengen area.
            </p>
            <p>
              <strong className="text-zinc-900 dark:text-zinc-100">Both your entry and exit days count</strong> as
              days spent in the zone. For example, entering on January 1 and exiting
              on January 3 uses 3 days.
            </p>
            <p>
              This calculator also supports{' '}
              <strong className="text-zinc-900 dark:text-zinc-100">Thailand&apos;s 60-day</strong> visa-exempt
              entries and the{' '}
              <strong className="text-zinc-900 dark:text-zinc-100">UK&apos;s 180/365</strong> rule via the preset
              tabs above.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
            <a
              href="https://ec.europa.eu/assets/home/visa-calculator/calculator.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline transition-colors"
            >
              Official EU Short-Stay Calculator →
            </a>
          </div>
        </div>
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
