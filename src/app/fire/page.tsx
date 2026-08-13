'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import BlogCTA from '@/components/blog-cta';
import { NomadPageShell } from '@/components/nomad/nomad-page-shell';
import { useNomadCities } from '@/hooks/use-nomad-cities';
import { Flame } from 'lucide-react';

interface City { slug: string; name: string; country: string; emoji: string; cost: { monthly_total: number }; nomad_score: number; }

function runwayTier(months: number) {
  if (months >= 60) return { label: '5+ yrs', color: 'text-emerald-600', bg: 'bg-emerald-500' };
  if (months >= 24) return { label: '2-5 yrs', color: 'text-blue-600', bg: 'bg-blue-500' };
  if (months >= 12) return { label: '1-2 yrs', color: 'text-amber-600', bg: 'bg-amber-500' };
  return { label: '<1 yr', color: 'text-red-600', bg: 'bg-red-500' };
}

type SortKey = 'name' | 'cost' | 'months';
export default function FirePage() {
  const { cities, loading } = useNomadCities<City>();
  const [savings, setSavings] = useState(50000);
  const [sortKey, setSortKey] = useState<SortKey>('months');
  const [sortAsc, setSortAsc] = useState(false);

  const rows = useMemo(() => {
    const mapped = cities.filter(c => c.cost?.monthly_total > 0).map(c => {
      const months = Math.round((savings / c.cost.monthly_total) * 10) / 10;
      const years = Math.round(months / 12 * 10) / 10;
      return { ...c, months, years, tier: runwayTier(months) };
    });
    mapped.sort((a, b) => {
      if (sortKey === 'name') return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if (sortKey === 'cost') return sortAsc ? a.cost.monthly_total - b.cost.monthly_total : b.cost.monthly_total - a.cost.monthly_total;
      return sortAsc ? a.months - b.months : b.months - a.months;
    });
    return mapped;
  }, [cities, savings, sortKey, sortAsc]);

  const longest = useMemo(() => rows.reduce<typeof rows[0] | undefined>((best, row) => (!best || row.months > best.months ? row : best), undefined), [rows]);
  const shortest = useMemo(() => rows.reduce<typeof rows[0] | undefined>((worst, row) => (!worst || row.months < worst.months ? row : worst), undefined), [rows]);
  const avgMonths = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.months, 0) / rows.length) : 0;
  const fiveYrPlus = rows.filter(r => r.months >= 60).length;

  const toggleSort = (key: SortKey) => { if (sortKey === key) setSortAsc(!sortAsc); else { setSortKey(key); setSortAsc(false); } };
  const sortIcon = (key: SortKey) => sortKey === key ? (sortAsc ? '↑' : '↓') : '';

  return (
    <NomadPageShell
      title="FIRE Calculator"
      subtitle="Enter your total savings to see how many months of runway you have in each city."
      loading={loading}
      footer={<BlogCTA />}
    >
          <div className="mb-8">
            <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Total Savings (USD)</label>
            <div className="flex items-center gap-2 max-w-xs">
              <Flame className="w-5 h-5 text-zinc-400" />
              <input type="number" value={savings} onChange={e => setSavings(Number(e.target.value) || 0)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-lg font-semibold outline-none focus:border-zinc-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-white border border-zinc-200 rounded-xl p-4">
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Longest Runway</div>
              <div className="text-lg font-bold text-zinc-900 truncate">{longest?.emoji} {longest?.name}</div>
              <div className="text-xs text-emerald-600 font-semibold">{longest?.years} years</div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-4">
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Shortest Runway</div>
              <div className="text-lg font-bold text-zinc-900 truncate">{shortest?.emoji} {shortest?.name}</div>
              <div className="text-xs text-red-600 font-semibold">{shortest?.years} years</div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-4">
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Average Runway</div>
              <div className="text-3xl font-bold text-zinc-900">{avgMonths}</div>
              <div className="text-xs text-zinc-500">months</div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-4">
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">5+ Year Cities</div>
              <div className="text-3xl font-bold text-emerald-600">{fiveYrPlus}</div>
              <div className="text-xs text-zinc-500">cities</div>
            </div>
          </div>

          <div className="w-full max-w-full overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider w-8">#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-900" onClick={() => toggleSort('name')}>City {sortIcon('name')}</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-900" onClick={() => toggleSort('cost')}>Monthly Cost {sortIcon('cost')}</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-900" onClick={() => toggleSort('months')}>Runway {sortIcon('months')}</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Years</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map((r, i) => (
                  <tr key={r.slug} className="bg-white hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-zinc-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-zinc-900">{r.emoji} {r.name}<span className="text-zinc-400 ml-1 text-xs">{r.country}</span></td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-600">${r.cost.monthly_total.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-right font-mono font-semibold ${r.tier.color}`}>{r.months} mo</td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-600">{r.years}y</td>
                    <td className="px-4 py-3 text-center"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${r.tier.color}`}><span className={`w-1.5 h-1.5 rounded-full ${r.tier.bg}`} />{r.tier.label}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
    </NomadPageShell>
  );
}
