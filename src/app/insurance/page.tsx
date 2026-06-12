import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import { ArrowLeft, Shield, Star, Heart, Plane, CreditCard, Award, Info } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Insurance data                                                     */
/* ------------------------------------------------------------------ */

interface InsuranceProvider {
  name: string;
  price: string;
  priceNum: number;
  coverage: string;
  ageRange: string;
  bestFor: string;
  popular?: boolean;
  features: string[];
  icon: React.ReactNode;
}

const PROVIDERS: InsuranceProvider[] = [
  {
    name: 'SafetyWing',
    price: '~$45/mo',
    priceNum: 45,
    coverage: '150+ countries',
    ageRange: '18–69',
    bestFor: 'Budget Nomads',
    popular: true,
    features: [
      'Emergency medical up to $250K',
      'No deductible on most plans',
      'Subscription model, no end date',
      'Covers COVID-19',
      'Home country coverage (15 days)',
    ],
    icon: <Shield className="w-5 h-5" />,
  },
  {
    name: 'Genki',
    price: '~$65/mo',
    priceNum: 65,
    coverage: 'Worldwide',
    ageRange: '18–65',
    bestFor: 'Mental Health',
    features: [
      'Full medical coverage',
      '€1M maximum coverage',
      'Mental health included',
      'Outpatient + dental (optional)',
      'Monthly cancellation',
    ],
    icon: <Heart className="w-5 h-5" />,
  },
  {
    name: 'World Nomads',
    price: '~$100/mo',
    priceNum: 100,
    coverage: '200+ countries',
    ageRange: '18–70',
    bestFor: 'Adventure Sports',
    features: [
      'Adventure sports + gear coverage',
      'Trip cancellation protection',
      '24/7 emergency assistance',
      'Electronics & gear coverage',
      'Extend while traveling',
    ],
    icon: <Plane className="w-5 h-5" />,
  },
  {
    name: 'PassportCard',
    price: '~$120/mo',
    priceNum: 120,
    coverage: 'Worldwide',
    ageRange: '18–55',
    bestFor: 'Zero Hassle Claims',
    features: [
      'No out-of-pocket debit card',
      'Real-time claims processing',
      'No forms or reimbursements',
      'Telemedicine included',
      'Prescription coverage',
    ],
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    name: 'Allianz Care',
    price: '~$180/mo',
    priceNum: 180,
    coverage: 'Worldwide',
    ageRange: '18–75',
    bestFor: 'Premium Coverage',
    features: [
      'Premium full-coverage plan',
      'Repatriation coverage',
      'Pre-existing conditions (after waiting)',
      'Maternity add-on available',
      'Extensive hospital network',
    ],
    icon: <Award className="w-5 h-5" />,
  },
  {
    name: 'Cigna Global',
    price: '~$200/mo',
    priceNum: 200,
    coverage: 'Worldwide',
    ageRange: '18–75',
    bestFor: 'Families',
    features: [
      'Full international health insurance',
      'Family plans available',
      'Dental add-on option',
      'Wellness & preventive care',
      'Global hospital network',
    ],
    icon: <Star className="w-5 h-5" />,
  },
];

function priceTier(price: number): { color: string; label: string } {
  if (price <= 50) return { color: 'text-emerald-600 dark:text-emerald-400', label: 'Budget' };
  if (price <= 100) return { color: 'text-blue-600 dark:text-blue-400', label: 'Mid-range' };
  if (price <= 150) return { color: 'text-amber-600 dark:text-amber-400', label: 'Premium' };
  return { color: 'text-red-600 dark:text-red-400', label: 'High-end' };
}

export default function InsurancePage() {
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
            Nomad Insurance Comparison
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 transition-colors max-w-3xl">
            Compare the top {PROVIDERS.length} insurance providers for digital nomads. Find the right balance of coverage, cost, and convenience.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Providers</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{PROVIDERS.length}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Starting From</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$45<span className="text-sm font-normal text-zinc-400">/mo</span></div>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <Heart className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Most Popular</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">SafetyWing</div>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Up To</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">$200<span className="text-sm font-normal text-zinc-400">/mo</span></div>
          </div>
        </div>

        {/* Provider Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROVIDERS.map((p) => {
            const tier = priceTier(p.priceNum);
            return (
              <div
                key={p.name}
                className={`bg-white dark:bg-zinc-900/50 border rounded-xl p-5 transition-colors relative ${
                  p.popular
                    ? 'border-emerald-300 dark:border-emerald-700/50 ring-1 ring-emerald-200 dark:ring-emerald-800/30'
                    : 'border-zinc-200 dark:border-zinc-800/50'
                }`}
              >
                {/* Popular badge */}
                {p.popular && (
                  <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-semibold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4 mt-1">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{p.name}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 ${tier.color}`}>
                      {p.bestFor}
                    </span>
                  </div>
                  <div className="text-zinc-400 dark:text-zinc-500">{p.icon}</div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className={`text-2xl font-bold ${tier.color}`}>{p.price}</span>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-4 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>Ages {p.ageRange}</span>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <span>{p.coverage}</span>
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 flex items-start gap-2 text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed max-w-2xl">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Prices are approximate and may vary by age, coverage area, and plan options.
            Always verify current pricing and coverage details directly with the provider.
            This is not financial or insurance advice. Last updated June 2026.
          </p>
        </div>
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
