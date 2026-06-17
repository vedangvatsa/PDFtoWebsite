'use client';
import { PAGE_CONTAINER, PAGE_DISCLAIMER, PAGE_SUBTITLE, PAGE_TITLE } from '@/lib/utils';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import BlogCTA from '@/components/blog-cta';
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
  source: string;
}

const TAX_DATA: TaxCountry[] = [
  { country: 'UAE', emoji: '🇦🇪', rate: 0, dnVisa: true, notes: 'No personal income tax', source: 'tax.gov.ae' },
  { country: 'Paraguay', emoji: '🇵🇾', rate: 0, dnVisa: false, notes: 'Territorial. Foreign income exempt', source: 'pwc.com' },
  { country: 'Panama', emoji: '🇵🇦', rate: 0, dnVisa: true, notes: 'Territorial. Foreign income exempt', source: 'pwc.com' },
  { country: 'Bahamas', emoji: '🇧🇸', rate: 0, dnVisa: false, notes: 'No personal income tax', source: 'bahamas.gov.bs' },
  { country: 'Georgia', emoji: '🇬🇪', rate: 1, dnVisa: true, notes: '1% on revenue under 500K GEL (Small Business Status). Excludes consulting', source: 'rs.ge' },
  { country: 'Malaysia', emoji: '🇲🇾', rate: 0, dnVisa: true, notes: 'FSI exempt if taxed abroad (extended to 2036). Otherwise 0–30% progressive', source: 'www.hasil.gov.my' },
  { country: 'Singapore', emoji: '🇸🇬', rate: 4, dnVisa: false, notes: 'Progressive 0–22%. ~4% effective at $60K USD for residents', source: 'iras.gov.sg' },
  { country: 'Greece', emoji: '🇬🇷', rate: 7, dnVisa: true, notes: '7% flat for foreign pensioners only. Standard freelancer rates: 9-44% progressive. Non-dom investor regime requires 500K+ EUR investment', source: 'aade.gr' },
  { country: 'Montenegro', emoji: '🇲🇪', rate: 13, dnVisa: true, notes: 'Progressive 0-15% since 2022. Was flat 9%. Most income above 1,000 EUR/mo taxed at 15%', source: 'gov.me' },
  { country: 'Bulgaria', emoji: '🇧🇬', rate: 10, dnVisa: false, notes: 'Flat 10%', source: 'nra.bg' },
  { country: 'Romania', emoji: '🇷🇴', rate: 35, dnVisa: true, notes: '10% income tax + 25% pension (CAS) + 10% health (CASS). Total burden ~35-45% for freelancers', source: 'anaf.ro' },
  { country: 'Serbia', emoji: '🇷🇸', rate: 10, dnVisa: false, notes: 'Flat 10% income tax', source: 'poreskauprava.gov.rs' },
  { country: 'Costa Rica', emoji: '🇨🇷', rate: 0, dnVisa: true, notes: 'Territorial. Foreign income exempt. DN visa holders pay 0% on remote work income. Local income taxed up to 25%', source: 'hacienda.go.cr' },
  { country: 'Albania', emoji: '🇦🇱', rate: 15, dnVisa: true, notes: 'Flat 15%', source: 'tatime.gov.al' },
  { country: 'Hungary', emoji: '🇭🇺', rate: 15, dnVisa: false, notes: 'Flat 15%', source: 'nav.gov.hu' },
  { country: 'Czech Republic', emoji: '🇨🇿', rate: 15, dnVisa: true, notes: 'Flat 15% (23% above ~$73K USD)', source: 'financnisprava.cz' },
  { country: 'Croatia', emoji: '🇭🇷', rate: 20, dnVisa: true, notes: '20% up to ~$60K, 30% above', source: 'porezna-uprava.hr' },
  { country: 'Estonia', emoji: '🇪🇪', rate: 22, dnVisa: true, notes: '22% flat (increased from 20% in 2025). e-Residency: only on distributed profits', source: 'emta.ee' },
  { country: 'Thailand', emoji: '🇹🇭', rate: 20, dnVisa: true, notes: 'Progressive 5–35%. Foreign income taxed if remitted while resident (180+ days)', source: 'rd.go.th' },
  { country: 'Portugal', emoji: '🇵🇹', rate: 28, dnVisa: true, notes: 'NHR ended 2024. Standard progressive up to 48%. IFICI (NHR 2.0) very limited', source: 'www.portaldasfinancas.gov.pt' },
  { country: 'Spain', emoji: '🇪🇸', rate: 24, dnVisa: true, notes: 'Beckham Law: 24% flat, 6 years. Employees + DN visa holders eligible. Standard freelancers excluded', source: 'www.agenciatributaria.es' },
  { country: 'Mexico', emoji: '🇲🇽', rate: 25, dnVisa: false, notes: 'Progressive 1.9–35%. ~25% effective at mid-income', source: 'sat.gob.mx' },
  { country: 'US', emoji: '🇺🇸', rate: 30, dnVisa: false, notes: 'Federal 10–37% + 15.3% self-employment tax', source: 'www.irs.gov' },
  { country: 'Australia', emoji: '🇦🇺', rate: 32, dnVisa: false, notes: 'Progressive 0–45%. ~32% effective at mid-income', source: 'ato.gov.au' },
  { country: 'UK', emoji: '🇬🇧', rate: 33, dnVisa: false, notes: '20–45% income tax + NI contributions', source: 'gov.uk/hmrc' },
  { country: 'Canada', emoji: '🇨🇦', rate: 33, dnVisa: false, notes: 'Federal 15–33% + provincial. ~33% combined effective', source: 'canada.ca/cra' },
  { country: 'Japan', emoji: '🇯🇵', rate: 33, dnVisa: false, notes: 'National 5–45% + municipal 10%', source: 'www.nta.go.jp' },
  { country: 'Colombia', emoji: '🇨🇴', rate: 35, dnVisa: true, notes: 'Non-residents: 35% flat on local income. Residents: 0–39% progressive', source: 'www.dian.gov.co' },
  { country: 'Netherlands', emoji: '🇳🇱', rate: 37, dnVisa: false, notes: 'Progressive 36.9–49.5% (Box 1)', source: 'belastingdienst.nl' },
  { country: 'Ireland', emoji: '🇮🇪', rate: 40, dnVisa: false, notes: '20–40% income tax + USC + PRSI', source: 'revenue.ie' },
  { country: 'Germany', emoji: '🇩🇪', rate: 42, dnVisa: false, notes: 'Progressive 14-45%. ~42% effective at mid-income. No dedicated DN visa; freelance visa (Section 21) exists but requires German clients', source: 'bzst.de' },
  { country: 'France', emoji: '🇫🇷', rate: 45, dnVisa: false, notes: 'Progressive 0–45% + social charges', source: 'impots.gouv.fr' },
  { country: 'Sweden', emoji: '🇸🇪', rate: 50, dnVisa: false, notes: 'National + municipal combined. Up to ~52%', source: 'skatteverket.se' },
  { country: 'Denmark', emoji: '🇩🇰', rate: 55, dnVisa: false, notes: 'Among highest globally. Up to ~55.9%', source: 'skat.dk' },
];

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
      className={`group inline-flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-700 transition-colors ${className}`}
    >
      {label}
      {sortKey === field ? (
        sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-zinc-900" /> : <ArrowDown className="h-3 w-3 text-zinc-900" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      )}
    </button>
  );

  const zeroTaxCount = TAX_DATA.filter(c => c.rate === 0).length;
  const lowTaxCount = TAX_DATA.filter(c => c.rate > 0 && c.rate < 15).length;
  const dnVisaCount = TAX_DATA.filter(c => c.dnVisa).length;

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-primary/10 transition-colors duration-200 flex flex-col">
      <Header />
      <main id="main-content" className={PAGE_CONTAINER}>
        {/* Back link */}
        <Link
          href="/nomad"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className={PAGE_TITLE}>
            Nomad Tax Comparison
          </h1>
          <p className={PAGE_SUBTITLE}>
            Compare effective freelancer tax rates across {TAX_DATA.length} countries.
            Adjust your income to see take-home pay instantly.
          </p>
          <p className="text-xs text-zinc-500 mt-3 max-w-2xl">
            Rates apply to remote employees, self-employed freelancers, and sole proprietors contracting with clients outside their destination country (often under a Digital Nomad Visa).
          </p>
        </div>

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

        <BlogCTA />

        {/* Disclaimer */}
        <div className={PAGE_DISCLAIMER}>
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
