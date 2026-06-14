'use client';
import { PAGE_CONTAINER } from '@/lib/utils';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import {
  ArrowLeft,
  Search,
  X,
  ChevronDown,
  Globe,
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
  ShieldAlert,
  Info,
  Loader2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

// Compact format from visa-requirements.json
// t = type: vf=visa free, voa=visa on arrival, ev=e-visa, vr=visa required, fm=freedom of movement, na=no admission
// d = days
interface VisaEntryRaw {
  t: 'vf' | 'voa' | 'ev' | 'vr' | 'fm' | 'na';
  d: number;
}

type VisaData = Record<string, Record<string, VisaEntryRaw>>;

const TYPE_CONFIG = {
  fm: {
    label: 'Freedom of Movement',
    shortLabel: 'Free Movement',
    color: 'text-violet-700 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20',
    dot: 'bg-violet-500',
    icon: Globe,
    order: 0,
  },
  vf: {
    label: 'Visa Free',
    shortLabel: 'Visa Free',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
    order: 1,
  },
  voa: {
    label: 'Visa on Arrival',
    shortLabel: 'On Arrival',
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
    dot: 'bg-blue-500',
    icon: Clock,
    order: 2,
  },
  ev: {
    label: 'eVisa / ETA',
    shortLabel: 'eVisa',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
    dot: 'bg-amber-500',
    icon: FileText,
    order: 3,
  },
  vr: {
    label: 'Visa Required',
    shortLabel: 'Visa Required',
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
    dot: 'bg-red-500',
    icon: XCircle,
    order: 4,
  },
  na: {
    label: 'No Admission',
    shortLabel: 'No Entry',
    color: 'text-zinc-700 dark:text-zinc-400',
    bg: 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/50',
    dot: 'bg-zinc-500',
    icon: ShieldAlert,
    order: 5,
  },
};

/* ------------------------------------------------------------------ */
/*  Passport Picker                                                    */
/* ------------------------------------------------------------------ */

function PassportPicker({
  passports,
  selected,
  onSelect,
}: {
  passports: string[];
  selected: string | null;
  onSelect: (p: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return passports.filter((p) => p.toLowerCase().includes(q));
  }, [passports, query]);

  return (
    <div className="relative w-full max-w-md">
      <button
        id="passport-picker"
        onClick={() => { setOpen(!open); setQuery(''); }}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-left"
      >
        <Globe className="w-5 h-5 text-zinc-400 shrink-0" />
        <div className="flex-1 min-w-0">
          {selected ? (
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50 truncate">{selected}</span>
          ) : (
            <span className="text-base text-zinc-400">Select your passport country…</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-80 overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
            <Search className="w-4 h-4 text-zinc-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search countries..."
              className="flex-1 bg-transparent text-sm outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1 py-1">
            {filtered.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-zinc-400">No countries found</div>
            )}
            {filtered.map((p) => (
              <button
                key={p}
                onClick={() => { onSelect(p); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                  selected === p ? 'bg-zinc-50 dark:bg-zinc-800/40 font-medium' : ''
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function VisaCheckerPage() {
  const [visaData, setVisaData] = useState<VisaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [destQuery, setDestQuery] = useState('');

  useEffect(() => {
    fetch('/visa-requirements.json')
      .then((r) => r.json())
      .then((data: VisaData) => { setVisaData(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const passports = useMemo(() => {
    if (!visaData) return [];
    return Object.keys(visaData).sort();
  }, [visaData]);

  // Group destinations by visa type
  const grouped = useMemo(() => {
    if (!visaData || !selected || !visaData[selected]) return null;
    const entries = visaData[selected];
    const groups: Record<string, { country: string; days: number }[]> = {
      fm: [], vf: [], voa: [], ev: [], vr: [], na: [],
    };

    for (const [dest, entry] of Object.entries(entries)) {
      const q = destQuery.toLowerCase();
      if (q && !dest.toLowerCase().includes(q)) continue;
      groups[entry.t]?.push({ country: dest, days: entry.d });
    }

    // Sort each group alphabetically
    for (const g of Object.values(groups)) {
      g.sort((a, b) => a.country.localeCompare(b.country));
    }

    return groups;
  }, [visaData, selected, destQuery]);

  // Summary counts
  const summary = useMemo(() => {
    if (!grouped) return null;
    return {
      total: Object.values(grouped).reduce((s, g) => s + g.length, 0),
      free: grouped.fm.length + grouped.vf.length,
      arrival: grouped.voa.length,
      evisa: grouped.ev.length,
      required: grouped.vr.length + grouped.na.length,
    };
  }, [grouped]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black selection:bg-primary/10 transition-colors duration-200 flex flex-col">
      <Header />
      <main id="main-content" className={PAGE_CONTAINER}>
        <Link
          href="/nomad"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
            Visa Checker
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl">
            Select your passport to see visa requirements for 199 countries: visa-free access, visa on arrival, eVisa, or visa required.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <>
            {/* Passport Picker */}
            <div className="mb-8">
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">
                Your Passport
              </label>
              <PassportPicker passports={passports} selected={selected} onSelect={setSelected} />
            </div>

            {selected && grouped && summary && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
                    <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Visa Free Access</div>
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{summary.free}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">countries</div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
                    <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Visa on Arrival</div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{summary.arrival}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">countries</div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
                    <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">eVisa / ETA</div>
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{summary.evisa}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">countries</div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
                    <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Visa Required</div>
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">{summary.required}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">countries</div>
                  </div>
                </div>

                {/* Destination Search */}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 mb-8 max-w-md">
                  <Search className="w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={destQuery}
                    onChange={(e) => setDestQuery(e.target.value)}
                    placeholder="Filter destinations..."
                    className="flex-1 bg-transparent text-sm outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400"
                  />
                  {destQuery && (
                    <button onClick={() => setDestQuery('')} className="text-zinc-400 hover:text-zinc-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Grouped Results */}
                <div className="space-y-8">
                  {(['fm', 'vf', 'voa', 'ev', 'vr', 'na'] as const).map((type) => {
                    const items = grouped[type];
                    if (!items || items.length === 0) return null;
                    const config = TYPE_CONFIG[type];
                    const Icon = config.icon;

                    return (
                      <section key={type}>
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                          <h2 className={`text-sm font-bold uppercase tracking-wider ${config.color}`}>
                            {config.label}
                          </h2>
                          <span className="text-xs text-zinc-400 font-medium">({items.length})</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                          {items.map((item) => (
                            <div
                              key={item.country}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${config.bg} transition-colors`}
                            >
                              <span className="text-sm text-zinc-900 dark:text-zinc-100 truncate mr-2">
                                {item.country}
                              </span>
                              {item.days > 0 && (
                                <span className={`text-xs font-semibold shrink-0 ${config.color}`}>
                                  {item.days}d
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>

                {/* Disclaimer */}
                <div className="mt-10 flex items-start gap-2 text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed max-w-2xl">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    Data from <a href="https://github.com/ilyankou/passport-index-dataset" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-600 transition-colors">Passport Index</a>.
                    Requirements change frequently. Always verify with the destination embassy or{' '}
                    <a href="https://www.iatatravelcentre.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-600 transition-colors">IATA Travel Centre</a>{' '}
                    before booking travel.
                  </p>
                </div>
              </>
            )}

            {selected && !grouped && (
              <div className="text-center py-16 text-zinc-400">
                No visa data found for this passport.
              </div>
            )}
          </>
        )}
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
