'use client';
import { PAGE_DISCLAIMER } from '@/lib/utils';

import { useState, useMemo } from 'react';
import BlogCTA from '@/components/blog-cta';
import { NomadPageShell, NomadSortHeader } from '@/components/nomad/nomad-page-shell';
import { DollarSign, Info, Calculator, TrendingDown, ArrowUpDown } from 'lucide-react';

import { TAX_DATA } from '@/lib/nomad-tax';

type SortKey = 'country' | 'rate' | 'taxAmount' | 'takeHome';
type SortDir = 'asc' | 'desc';

function rateColor(rate: number): string {
  if (rate < 10) return 'text-emerald-600';
  if (rate < 20) return 'text-blue-600';
  if (rate < 30) return 'text-amber-600';
  return 'text-red-600';
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

export default function TaxClient() {
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
    <NomadSortHeader label={label} field={field} sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} className={className} />
  );

  const zeroTaxCount = TAX_DATA.filter(c => c.rate === 0).length;
  const lowTaxCount = TAX_DATA.filter(c => c.rate > 0 && c.rate < 15).length;
  const dnVisaCount = TAX_DATA.filter(c => c.dnVisa).length;

  return (
    <NomadPageShell
      title="Nomad Tax Comparison"
      subtitle={
        <>
          <p className="text-lg text-zinc-600 max-w-none">
            Compare effective freelancer tax rates across {TAX_DATA.length} countries.
            Adjust your income to see take-home pay instantly.
          </p>
          <p className="text-xs text-zinc-500 mt-3 max-w-2xl">
            Rates apply to remote employees, self-employed freelancers, and sole proprietors contracting with clients outside their destination country (often under a Digital Nomad Visa).
          </p>
        </>
      }
      footer={
        <>
          <BlogCTA />
          <div className={PAGE_DISCLAIMER}>
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Tax rates are approximate effective rates for freelancers/self-employed at the selected income level.
              Actual rates depend on residency status, deductions, social contributions, and treaty benefits.
              Consult a qualified tax professional before making any decisions. Last updated June 2026.
            </p>
          </div>
        </>
      }
    >

        {/* Income Input */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Annual Income (USD)</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative w-full sm:w-auto">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
                className="pl-9 pr-4 py-2.5 w-full sm:w-48 bg-zinc-50 border border-zinc-200 rounded-lg text-lg font-semibold text-zinc-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-zinc-300"
              />
            </div>
            <div className="flex gap-2">
              {[30000, 60000, 100000, 150000].map(v => (
                <button
                  key={v}
                  onClick={() => setIncome(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    income === v
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
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
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Countries</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900">{TAX_DATA.length}</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">0% Tax</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{zeroTaxCount}</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">&lt;15% Tax</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{lowTaxCount + zeroTaxCount}</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <ArrowUpDown className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">DN Visas</span>
            </div>
            <div className="text-2xl font-bold text-violet-600">{dnVisaCount}</div>
          </div>
        </div>

        {/* Tax Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-xs text-zinc-500">
          <span className="font-medium">Tax tiers:</span>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 0–9%</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> 10–19%</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 20–29%</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> 30%+</div>
        </div>

        {/* Tax Table */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden transition-colors">
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left px-5 py-4"><SortHeader label="Country" field="country" /></th>
                  <th className="text-right px-5 py-4"><SortHeader label="Rate" field="rate" /></th>
                  <th className="text-right px-5 py-4"><SortHeader label="Tax Amount" field="taxAmount" /></th>
                  <th className="text-right px-5 py-4"><SortHeader label="Take-Home" field="takeHome" /></th>
                  <th className="text-center px-5 py-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">DN Visa</span>
                  </th>
                  <th className="text-left px-5 py-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Notes</span>
                  </th>
                  <th className="text-left px-5 py-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Read More</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(c => {
                  const taxAmt = Math.round(c.rate * income / 100);
                  const takeHome = income - taxAmt;
                  const barWidth = (c.rate / 55) * 100;
                  return (
                    <tr key={c.country} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-zinc-900 whitespace-nowrap">
                        <span className="mr-2">{c.emoji}</span>{c.country}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                            <div className={`h-full rounded-full ${rateBg(c.rate)}`} style={{ width: `${barWidth}%`, opacity: 0.7 }} />
                          </div>
                          <span className={`font-bold tabular-nums ${rateColor(c.rate)}`}>{c.rate}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-zinc-600">{fmtCurrency(taxAmt)}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums font-semibold text-zinc-900">{fmtCurrency(takeHome)}</td>
                      <td className="px-5 py-3.5 text-center">
                        {c.dnVisa ? (
                          <span className="text-emerald-600 font-semibold">✓</span>
                        ) : (
                          <span className="text-zinc-300">✗</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-zinc-500 max-w-[320px] whitespace-normal break-words">{c.notes}</td>
                      <td className="px-5 py-3.5 text-xs text-zinc-400 whitespace-nowrap">
                        <a href={`https://${c.source}`} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-700 underline underline-offset-2 transition-colors">Read More</a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-zinc-100">
            {sorted.map(c => {
              const taxAmt = Math.round(c.rate * income / 100);
              const takeHome = income - taxAmt;
              return (
                <div key={c.country} className="px-4 py-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-zinc-900">
                      {c.emoji} {c.country}
                      {c.dnVisa && <span className="ml-1.5 text-emerald-500 text-xs">✓ visa</span>}
                    </span>
                    <span className={`font-bold tabular-nums ${rateColor(c.rate)}`}>{c.rate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Tax: {fmtCurrency(taxAmt)}</span>
                    <span className="font-medium text-zinc-700">Take-home: {fmtCurrency(takeHome)}</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {c.notes} · <a href={`https://${c.source}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-zinc-600">Read More</a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
    </NomadPageShell>
  );
}
