'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import BlogCTA from '@/components/blog-cta';
import { NomadPageShell } from '@/components/nomad/nomad-page-shell';
import { Search, Coins, Calendar, DollarSign, ExternalLink, X, FileText, Landmark, Loader2 } from 'lucide-react';
import VisaCheckerContent from './visa-checker';

import { VISAS, type VisaData } from '@/lib/visas-data';

function VisasPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') === 'checker' ? 'checker' : 'programs';

  const setTab = (t: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (t === 'programs') {
      params.delete('tab');
    } else {
      params.set('tab', t);
    }
    const qs = params.toString();
    router.push(qs ? `/visas?${qs}` : '/visas', { scroll: false });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncomeFilter, setSelectedIncomeFilter] = useState('all');
  const [selectedContinent, setSelectedContinent] = useState('all');
  const [activeModalVisa, setActiveModalVisa] = useState<VisaData | null>(null);

  const continents = useMemo(() => {
    const set = new Set(VISAS.map(v => v.continent));
    return ['all', ...Array.from(set).sort()];
  }, []);

  const filteredVisas = useMemo(() => {
    let result = VISAS;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => v.country.toLowerCase().includes(q) || v.continent.toLowerCase().includes(q));
    }
    if (selectedIncomeFilter !== 'all') {
      const maxIncome = parseInt(selectedIncomeFilter);
      result = result.filter(v => v.minIncome <= maxIncome);
    }
    if (selectedContinent !== 'all') {
      result = result.filter(v => v.continent === selectedContinent);
    }
    return result;
  }, [searchQuery, selectedIncomeFilter, selectedContinent]);

  return (
    <NomadPageShell title="Visas & Travel" footer={<BlogCTA />}>
        {/* Tab Bar */}
        <div className="bg-zinc-100 rounded-lg p-1 inline-flex gap-1 mb-8">
          <button
            onClick={() => setTab('programs')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === 'programs'
                ? 'bg-white shadow-sm text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Nomad Visas
          </button>
          <button
            onClick={() => setTab('checker')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === 'checker'
                ? 'bg-white shadow-sm text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Visa Checker
          </button>
        </div>

        {tab === 'checker' && <VisaCheckerContent />}

        {tab === 'programs' && (<>
        <p className="text-xl text-zinc-600 transition-colors max-w-3xl mb-10">
          Explore and compare {VISAS.length} active digital nomad visas across the world. Filter by region, income requirements, and tax rules.
        </p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Continent Filter */}
          <select
            value={selectedContinent}
            onChange={(e) => setSelectedContinent(e.target.value)}
            className="h-10 px-4 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer min-w-[160px]"
          >
            {continents.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'All Regions' : c}</option>
            ))}
          </select>

          {/* Income Filter */}
          <select
            value={selectedIncomeFilter}
            onChange={(e) => setSelectedIncomeFilter(e.target.value)}
            className="h-10 px-4 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer min-w-[200px]"
          >
            <option value="all">Any Income Requirement</option>
            <option value="0">No Monthly Minimum (Savings Only)</option>
            <option value="2500">Under $2,500/mo</option>
            <option value="3500">Under $3,500/mo</option>
            <option value="4500">Under $4,500/mo</option>
            <option value="6000">Under $6,000/mo</option>
          </select>
        </div>

        {/* Results count */}
        <p className="text-sm text-zinc-500 mb-6">
          Showing {filteredVisas.length} of {VISAS.length} visas
        </p>

        {/* Visas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVisas.map((visa) => (
            <div
              key={visa.country}
              onClick={() => setActiveModalVisa(visa)}
              className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between gap-3"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <span className="text-2xl shrink-0">{visa.flag}</span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-900 leading-tight truncate">
                    {visa.country}
                  </h3>
                  <p className="text-xs text-zinc-500">{visa.continent}</p>
                </div>
              </div>

              {/* Highlights */}
              <div className="flex flex-wrap gap-1.5">
                {visa.highlights.map((h, idx) => (
                  <span key={idx} className="bg-zinc-100 text-zinc-600 text-[11px] px-2 py-0.5 rounded-md font-medium">
                    {h}
                  </span>
                ))}
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4 pt-3 border-t border-zinc-200 text-zinc-900">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <Coins className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <p className="text-xs font-semibold truncate">
                    {visa.minIncome === 0 ? 'No min' : `$${visa.minIncome.toLocaleString()}/mo`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <p className="text-xs font-semibold truncate">{visa.durationDisplay}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredVisas.length === 0 && (
          <div className="text-center py-16 bg-white border border-zinc-200 rounded-2xl">
            <Search className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900">No visas match your filters</h3>
            <p className="text-sm text-zinc-500 mt-1">Try resetting search or filters.</p>
          </div>
        )}
        </>)}
        {activeModalVisa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div
            className="bg-white border border-zinc-200 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-100 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{activeModalVisa.flag}</span>
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900">
                    {activeModalVisa.country} Nomad Visa
                  </h2>
                  <p className="text-sm text-zinc-500">{activeModalVisa.continent}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalVisa(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              <p className="text-base text-zinc-700 leading-relaxed">
                {activeModalVisa.description}
              </p>

              {/* Requirement Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/40">
                  <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Min Income</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">
                    {activeModalVisa.minIncomeDisplay}
                  </p>
                </div>
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/40">
                  <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Duration</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 leading-tight">
                    {activeModalVisa.duration}
                  </p>
                </div>
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/40">
                  <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                    <Coins className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Visa Fee</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">
                    {activeModalVisa.fee}
                  </p>
                </div>
              </div>

              {/* Tax Implications */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-2">
                  <Landmark className="w-3.5 h-3.5" />
                  Tax Implications
                </h4>
                <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-200/40">
                  {activeModalVisa.taxImplications}
                </p>
              </div>

              {/* Documents Required */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  Documents Needed
                </h4>
                <ul className="space-y-2 text-sm text-zinc-700">
                  {activeModalVisa.documents.map((doc, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary font-bold shrink-0">•</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-zinc-100 flex justify-end gap-3 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setActiveModalVisa(null)}
                className="px-4 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50 transition-all w-full sm:w-auto"
              >
                Close
              </button>
              <a
                href={activeModalVisa.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-sm font-semibold transition-all w-full sm:w-auto"
              >
                Apply via Official Portal
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        )}
    </NomadPageShell>
  );
}

export default function VisasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    }>
      <VisasPageInner />
    </Suspense>
  );
}
