'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import { ArrowLeft, DollarSign, ArrowUpDown, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

interface City { slug: string; name: string; country: string; emoji: string; cost: { monthly_total: number }; nomad_score: number; }

function tier(remaining: number) {
  if (remaining >= 3000) return { label: 'Luxury', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' };
  if (remaining >= 1500) return { label: 'Comfortable', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500' };
  if (remaining >= 500) return { label: 'Moderate', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500' };
  return { label: 'Tight', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500' };
}

type SortKey = 'name' | 'cost' | 'remaining' | 'ppi';
export default function SalaryPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState(4000);
  const [sortKey, setSortKey] = useState<SortKey>('remaining');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => { fetch('/nomad-cities.json').then(r => r.json()).then(d => { setCities(d); setLoading(false); }); }, []);

  const nycCost = useMemo(() => cities.find(c => c.slug === 'new-york')?.cost.monthly_total || 3500, [cities]);

  const rows = useMemo(() => {
    const mapped = cities.filter(c => c.cost?.monthly_total > 0).map(c => {
      const remaining = income - c.cost.monthly_total;
      const ppi = Math.round((income / c.cost.monthly_total) * 100);
      return { ...c, remaining, ppi, tier: tier(remaining) };
    });
    mapped.sort((a, b) => {
      let va: number | string, vb: number | string;
      if (sortKey === 'name') { va = a.name; vb = b.name; return sortAsc ? (va as string).localeCompare(vb as string) : (vb as string).localeCompare(va as string); }
      if (sortKey === 'cost') { va = a.cost.monthly_total; vb = b.cost.monthly_total; }
      else if (sortKey === 'remaining') { va = a.remaining; vb = b.remaining; }
      else { va = a.ppi; vb = b.ppi; }
      return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return mapped;
  }, [cities, income, sortKey, sortAsc, nycCost]);

  const comfortable = rows.filter(r => r.remaining >= 1500).length;
  const best = rows[0];
  const worst = rows[rows.length - 1];

  const toggleSort = (key: SortKey) => { if (sortKey === key) setSortAsc(!sortAsc); else { setSortKey(key); setSortAsc(false); } };
  const sortIcon = (key: SortKey) => sortKey === key ? (sortAsc ? '↑' : '↓') : '';

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black selection:bg-primary/10 transition-colors duration-200 flex flex-col">
      <Header />
      <main id="main-content" className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 lg:py-24 pb-32 flex-1">
        <Link href="/nomad" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-zinc-900 dark:text-zinc-50 mb-3">Purchasing Power Calculator</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl">Enter your monthly income to see what it buys across 95 digital nomad cities.</p>
        </div>

        {loading ? <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div> : (<>
          <div className="mb-8">
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">Monthly Income (USD)</label>
            <div className="flex items-center gap-2 max-w-xs">
              <DollarSign className="w-5 h-5 text-zinc-400" />
              <input type="number" value={income} onChange={e => setIncome(Number(e.target.value) || 0)} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 text-zinc-900 dark:text-zinc-50 text-lg font-semibold outline-none focus:border-zinc-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Comfortable+</div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{comfortable}</div>
              <div className="text-xs text-zinc-500">cities ≥$1,500 left</div>
            </div>
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Best Value</div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50 truncate">{best?.emoji} {best?.name}</div>
              <div className="text-xs text-zinc-500">${best?.remaining?.toLocaleString()}/mo left</div>
            </div>
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Most Expensive</div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50 truncate">{worst?.emoji} {worst?.name}</div>
              <div className="text-xs text-zinc-500">${worst?.cost?.monthly_total?.toLocaleString()}/mo cost</div>
            </div>
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Total Cities</div>
              <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{rows.length}</div>
              <div className="text-xs text-zinc-500">compared</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider w-8">#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100" onClick={() => toggleSort('name')}>City {sortIcon('name')}</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100" onClick={() => toggleSort('cost')}>Monthly Cost {sortIcon('cost')}</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100" onClick={() => toggleSort('remaining')}>Remaining {sortIcon('remaining')}</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100" onClick={() => toggleSort('ppi')}>Power Index {sortIcon('ppi')}</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Lifestyle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/30">
                {rows.map((r, i) => (
                  <tr key={r.slug} className="bg-white dark:bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-zinc-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{r.emoji} {r.name}<span className="text-zinc-400 ml-1 text-xs">{r.country}</span></td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-600 dark:text-zinc-400">${r.cost.monthly_total.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-right font-mono font-semibold ${r.remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>${r.remaining.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-600 dark:text-zinc-400">{r.ppi}</td>
                    <td className="px-4 py-3 text-center"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${r.tier.color} bg-opacity-10`}><span className={`w-1.5 h-1.5 rounded-full ${r.tier.bg}`} />{r.tier.label}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
