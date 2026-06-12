'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import { ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown, DollarSign, Info, Calculator, TrendingDown } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Tax data                                                           */
/* ------------------------------------------------------------------ */

interface TaxCountry {
  country: string;
  emoji: string;
  rate: number;
  dnVisa: boolean;
  notes: string;
}

const TAX_DATA: TaxCountry[] = [
  { country: 'UAE', emoji: '🇦🇪', rate: 0, dnVisa: true, notes: 'No income tax' },
  { country: 'Paraguay', emoji: '🇵🇾', rate: 0, dnVisa: false, notes: 'Territorial taxation' },
  { country: 'Panama', emoji: '🇵🇦', rate: 0, dnVisa: true, notes: 'Territorial — foreign income exempt' },
  { country: 'Georgia', emoji: '🇬🇪', rate: 0, dnVisa: true, notes: 'Individual entrepreneur: 1% on revenue <500K GEL' },
  { country: 'Malaysia', emoji: '🇲🇾', rate: 0, dnVisa: true, notes: 'Foreign-sourced income exempt' },
  { country: 'Bahamas', emoji: '🇧🇸', rate: 0, dnVisa: false, notes: 'No income tax' },
  { country: 'Montenegro', emoji: '🇲🇪', rate: 9, dnVisa: true, notes: 'Flat rate' },
  { country: 'Bulgaria', emoji: '🇧🇬', rate: 10, dnVisa: false, notes: 'Flat rate' },
  { country: 'Romania', emoji: '🇷🇴', rate: 10, dnVisa: true, notes: 'Flat rate + social contributions' },
  { country: 'Serbia', emoji: '🇷🇸', rate: 10, dnVisa: false, notes: 'Flat rate' },
  { country: 'Costa Rica', emoji: '🇨🇷', rate: 10, dnVisa: true, notes: 'Territorial taxation' },
  { country: 'Colombia', emoji: '🇨🇴', rate: 10, dnVisa: true, notes: 'Low bracket for non-residents' },
  { country: 'Singapore', emoji: '🇸🇬', rate: 3, dnVisa: false, notes: 'Progressive — very low at $60K' },
  { country: 'Greece', emoji: '🇬🇷', rate: 7, dnVisa: true, notes: '7% flat for 15 years (non-dom regime)' },
  { country: 'Albania', emoji: '🇦🇱', rate: 15, dnVisa: true, notes: 'Flat rate' },
  { country: 'Hungary', emoji: '🇭🇺', rate: 15, dnVisa: false, notes: 'Flat rate' },
  { country: 'Czech Republic', emoji: '🇨🇿', rate: 15, dnVisa: true, notes: 'Flat rate' },
  { country: 'Thailand', emoji: '🇹🇭', rate: 15, dnVisa: true, notes: 'Progressive — effective for mid-income' },
  { country: 'Croatia', emoji: '🇭🇷', rate: 20, dnVisa: true, notes: 'Flat rate' },
  { country: 'Portugal', emoji: '🇵🇹', rate: 20, dnVisa: true, notes: 'NHR regime (20% flat)' },
  { country: 'Estonia', emoji: '🇪🇪', rate: 20, dnVisa: true, notes: 'Only on distributions (e-Residency)' },
  { country: 'Spain', emoji: '🇪🇸', rate: 24, dnVisa: true, notes: 'Beckham Law: 24% flat for 6 years' },
  { country: 'Mexico', emoji: '🇲🇽', rate: 25, dnVisa: false, notes: 'Progressive — effective at mid-income' },
  { country: 'US', emoji: '🇺🇸', rate: 30, dnVisa: false, notes: 'Federal + self-employment tax' },
  { country: 'Australia', emoji: '🇦🇺', rate: 32, dnVisa: false, notes: 'Progressive — effective estimate' },
  { country: 'UK', emoji: '🇬🇧', rate: 33, dnVisa: false, notes: 'Income tax + NI contributions' },
  { country: 'Canada', emoji: '🇨🇦', rate: 33, dnVisa: false, notes: 'Federal + provincial combined' },
  { country: 'Japan', emoji: '🇯🇵', rate: 33, dnVisa: false, notes: 'National + municipal tax' },
  { country: 'Netherlands', emoji: '🇳🇱', rate: 37, dnVisa: false, notes: 'Box 1 income tax' },
  { country: 'Ireland', emoji: '🇮🇪', rate: 40, dnVisa: false, notes: 'Income tax + USC + PRSI' },
  { country: 'Germany', emoji: '🇩🇪', rate: 42, dnVisa: true, notes: 'Progressive — effective at mid-income' },
  { country: 'France', emoji: '🇫🇷', rate: 45, dnVisa: false, notes: 'Progressive + social charges' },
  { country: 'Sweden', emoji: '🇸🇪', rate: 50, dnVisa: false, notes: 'National + municipal tax' },
  { country: 'Denmark', emoji: '🇩🇰', rate: 55, dnVisa: false, notes: 'Highest in the world' },
];

type SortKey = 'country' | 'rate' | 'taxAmount' | 'takeHome';
type SortDir = 'asc' | 'desc';

function rateColor(rate: number): string {
  if (rate < 10) return 'text-emerald-600 dark:text-emerald-400';
  if (rate < 20) return 'text-blue-600 dark:text-blue-400';
  if (rate < 30) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function rateBg(rate: number): string {
  if (rate < 10) return 'bg-emerald-500';
  if (rate < 20) return 'bg-blue-500';
  if (rate < 30) return 'bg-amber-500';
  return 'bg-red-500';
}

function fmtCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

export default function TaxPage() {
  const [income, setIncome] = useState(60000);
  const [sortKey, setSortKey] = useState<SortKey>('rate');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const sorted = useMemo(() => {
    const copy = [...TAX_DATA];
    copy.sort((a, b) => {
      let va: number | string, vb: number | string;
      switch (sortKey) {
        case 'country': va = a.country; vb = b.country; break;
        case 'rate': va = a.rate; vb = b.rate; break;
        case 'taxAmount': va = a.rate * income / 100; vb = b.rate * income / 100; break;
        case 'takeHome': va = income - a.rate * income / 100; vb = income - b.rate * income / 100; break;
      }
      if (typeof va === 'string' && typeof vb === 'string') {
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return copy;
  }, [sortKey, sortDir, income]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortHeader = ({ label, field, className = '' }: { label: string; field: SortKey; className?: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className={`group inline-flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors ${className}`}
    >
      {label}
      {sortKey === field ? (
        sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-zinc-900 dark:text-zinc-100" /> : <ArrowDown className="h-3 w-3 text-zinc-900 dark:text-zinc-100" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      )}
    </button>
  );

  const zeroTaxCount = TAX_DATA.filter(c => c.rate === 0).length;
  const lowTaxCount = TAX_DATA.filter(c => c.rate > 0 && c.rate < 15).length;
  const dnVisaCount = TAX_DATA.filter(c => c.dnVisa).length;

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
            Nomad Tax Comparison
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 transition-colors max-w-3xl">
            Compare effective freelancer tax rates across {TAX_DATA.length} countries.
            Adjust your income to see take-home pay instantly.
          </p>
        </div>

        {/* Income Input */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Annual Income (USD)</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
                className="pl-9 pr-4 py-2.5 w-48 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-lg font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
              />
            </div>
            <div className="flex gap-2">
              {[30000, 60000, 100000, 150000].map(v => (
                <button
                  key={v}
                  onClick={() => setIncome(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    income === v
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  ${(v / 1000)}K
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Countries</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{TAX_DATA.length}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">0% Tax</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{zeroTaxCount}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">&lt;15% Tax</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{lowTaxCount + zeroTaxCount}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <ArrowUpDown className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">DN Visas</span>
            </div>
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">{dnVisaCount}</div>
          </div>
        </div>

        {/* Tax Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium">Tax tiers:</span>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 0–9%</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> 10–19%</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 20–29%</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> 30%+</div>
        </div>

        {/* Tax Table */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl overflow-hidden transition-colors">
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800/50">
                  <th className="text-left px-5 py-4"><SortHeader label="Country" field="country" /></th>
                  <th className="text-right px-5 py-4"><SortHeader label="Rate" field="rate" /></th>
                  <th className="text-right px-5 py-4"><SortHeader label="Tax Amount" field="taxAmount" /></th>
                  <th className="text-right px-5 py-4"><SortHeader label="Take-Home" field="takeHome" /></th>
                  <th className="text-center px-5 py-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">DN Visa</span>
                  </th>
                  <th className="text-left px-5 py-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Notes</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(c => {
                  const taxAmt = Math.round(c.rate * income / 100);
                  const takeHome = income - taxAmt;
                  const barWidth = (c.rate / 55) * 100;
                  return (
                    <tr key={c.country} className="border-b border-zinc-100 dark:border-zinc-800/30 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        <span className="mr-2">{c.emoji}</span>{c.country}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div className={`h-full rounded-full ${rateBg(c.rate)}`} style={{ width: `${barWidth}%`, opacity: 0.7 }} />
                          </div>
                          <span className={`font-bold tabular-nums ${rateColor(c.rate)}`}>{c.rate}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-zinc-600 dark:text-zinc-400">{fmtCurrency(taxAmt)}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">{fmtCurrency(takeHome)}</td>
                      <td className="px-5 py-3.5 text-center">
                        {c.dnVisa ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓</span>
                        ) : (
                          <span className="text-zinc-300 dark:text-zinc-600">✗</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-zinc-500 dark:text-zinc-400 max-w-[200px] truncate">{c.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800/30">
            {sorted.map(c => {
              const taxAmt = Math.round(c.rate * income / 100);
              const takeHome = income - taxAmt;
              return (
                <div key={c.country} className="px-4 py-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {c.emoji} {c.country}
                      {c.dnVisa && <span className="ml-1.5 text-emerald-500 text-xs">✓ visa</span>}
                    </span>
                    <span className={`font-bold tabular-nums ${rateColor(c.rate)}`}>{c.rate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Tax: {fmtCurrency(taxAmt)}</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">Take-home: {fmtCurrency(takeHome)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 flex items-start gap-2 text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed max-w-2xl">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Tax rates are approximate effective rates for freelancers/self-employed at the selected income level.
            Actual rates depend on residency status, deductions, social contributions, and treaty benefits.
            Consult a qualified tax professional before making any decisions. Last updated June 2026.
          </p>
        </div>
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
