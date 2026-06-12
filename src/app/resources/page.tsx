import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import {
  ArrowLeft,
  Shield,
  CreditCard,
  Smartphone,
  Lock,
  Plane,
  Home,
  Laptop,
  FileText,
  Briefcase,
  Users,
  Wrench,
  ExternalLink,
  Star,
} from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'Digital Nomad Resources & Tools — Essential Services for Remote Workers',
  description:
    'Curated collection of the best tools, services, and resources for digital nomads — insurance, banking, eSIMs, VPNs, flights, accommodation, and more.',
  keywords: [
    'digital nomad tools',
    'remote work resources',
    'nomad insurance',
    'esim travel',
    'nomad banking',
    'travel vpn',
  ],
  alternates: { canonical: `${siteUrl}/resources` },
  openGraph: {
    title: 'Digital Nomad Resources & Tools',
    description: 'Essential services for remote workers and digital nomads.',
    url: `${siteUrl}/resources`,
    siteName: 'CVin.Bio',
    type: 'website',
    images: [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630 }],
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Resource {
  name: string;
  url: string;
  description: string;
  tag?: string; // e.g. "Popular", "Free", "Budget"
}

interface Category {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string; // accent color class
  resources: Resource[];
}

const CATEGORIES: Category[] = [
  {
    id: 'insurance',
    title: 'Health Insurance',
    description: 'Travel and health insurance designed for location-independent workers.',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
    resources: [
      {
        name: 'SafetyWing',
        url: 'https://safetywing.com',
        description: 'Subscription-based travel medical insurance. Pay monthly, cancel anytime. Built for nomads.',
        tag: 'Popular',
      },
      {
        name: 'World Nomads',
        url: 'https://www.worldnomads.com',
        description: 'Comprehensive travel insurance with adventure activity coverage and gear protection.',
      },
      {
        name: 'Genki',
        url: 'https://www.genki.world',
        description: 'EU-based health insurance for remote workers. Monthly billing, worldwide coverage.',
      },
      {
        name: 'Passport Card',
        url: 'https://www.passportcard.com',
        description: 'Digital-first international health insurance with direct billing — no claims paperwork.',
      },
      {
        name: 'Insured Nomads',
        url: 'https://insurednomads.com',
        description: 'Travel medical + telemedicine + mental health support. Includes crisis response.',
      },
    ],
  },
  {
    id: 'banking',
    title: 'Banking & Money',
    description: 'Multi-currency accounts, zero-fee transfers, and cards that work everywhere.',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10',
    resources: [
      {
        name: 'Wise (TransferWise)',
        url: 'https://wise.com',
        description: 'Multi-currency account with real exchange rates. Debit card works in 200+ countries.',
        tag: 'Essential',
      },
      {
        name: 'Revolut',
        url: 'https://www.revolut.com',
        description: 'Digital banking with free currency exchange (fair limits), crypto, and stock trading.',
        tag: 'Popular',
      },
      {
        name: 'N26',
        url: 'https://n26.com',
        description: 'EU-based digital bank with free ATM withdrawals and real-time notifications.',
      },
      {
        name: 'Charles Schwab',
        url: 'https://www.schwab.com/checking',
        description: 'US brokerage checking account. Unlimited ATM fee rebates worldwide. No foreign transaction fees.',
      },
      {
        name: 'Mercury',
        url: 'https://mercury.com',
        description: 'US business banking for startups and freelancers. Clean UI, API access, virtual cards.',
      },
    ],
  },
  {
    id: 'esim',
    title: 'eSIM & Connectivity',
    description: 'Stay connected anywhere without swapping physical SIM cards.',
    icon: <Smartphone className="w-5 h-5" />,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10',
    resources: [
      {
        name: 'Airalo',
        url: 'https://www.airalo.com',
        description: 'eSIMs for 200+ countries. Data-only plans starting at $4.50. Instant activation.',
        tag: 'Popular',
      },
      {
        name: 'Holafly',
        url: 'https://holafly.com',
        description: 'Unlimited data eSIMs for travelers. Simple pricing per country, no hidden caps.',
      },
      {
        name: 'Nomad eSIM',
        url: 'https://www.getnomad.app',
        description: 'Regional and global eSIM plans. Good for multi-country trips across continents.',
      },
      {
        name: 'Google Fi',
        url: 'https://fi.google.com',
        description: 'US-based plan that works in 200+ countries. Flexible or unlimited options.',
      },
      {
        name: 'Saily',
        url: 'https://saily.com',
        description: 'By NordVPN. Affordable eSIMs with straightforward pricing and fast setup.',
        tag: 'Budget',
      },
    ],
  },
  {
    id: 'vpn',
    title: 'VPN & Security',
    description: 'Protect your connection on public WiFi and access content from anywhere.',
    icon: <Lock className="w-5 h-5" />,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
    resources: [
      {
        name: 'NordVPN',
        url: 'https://nordvpn.com',
        description: 'Fast speeds, 6,000+ servers in 111 countries. Threat protection and ad blocking built in.',
        tag: 'Popular',
      },
      {
        name: 'Surfshark',
        url: 'https://surfshark.com',
        description: 'Unlimited simultaneous devices. Budget-friendly with solid speeds.',
        tag: 'Budget',
      },
      {
        name: 'ExpressVPN',
        url: 'https://www.expressvpn.com',
        description: 'Premium VPN with consistently fast speeds. Good for streaming and restrictive countries.',
      },
      {
        name: 'ProtonVPN',
        url: 'https://protonvpn.com',
        description: 'Swiss-based, privacy-first VPN from the team behind ProtonMail. Free tier available.',
        tag: 'Free tier',
      },
      {
        name: '1Password',
        url: 'https://1password.com',
        description: 'Password manager for securing all your accounts. Travel mode hides sensitive vaults at borders.',
      },
    ],
  },
  {
    id: 'flights',
    title: 'Flights & Transport',
    description: 'Find cheap flights, compare routes, and book inter-city transport.',
    icon: <Plane className="w-5 h-5" />,
    color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10',
    resources: [
      {
        name: 'Google Flights',
        url: 'https://flights.google.com',
        description: 'Best flight search engine. Price tracking, flexible dates, explore map. No booking fees.',
        tag: 'Essential',
      },
      {
        name: 'Skyscanner',
        url: 'https://www.skyscanner.com',
        description: 'Compare flights across airlines and OTAs. "Everywhere" search for cheapest destinations.',
      },
      {
        name: 'Kiwi.com',
        url: 'https://www.kiwi.com',
        description: 'Combines airlines for cheaper routes. Self-transfer guarantee protects missed connections.',
      },
      {
        name: 'Rome2Rio',
        url: 'https://www.rome2rio.com',
        description: 'Shows all transport options between any two points — flights, trains, buses, ferries.',
      },
      {
        name: '12Go Asia',
        url: 'https://12go.asia',
        description: 'Book trains, buses, ferries, and transfers across Southeast Asia. Essential for the region.',
      },
    ],
  },
  {
    id: 'accommodation',
    title: 'Accommodation',
    description: 'Find apartments, coliving spaces, hostels, and long-term stays.',
    icon: <Home className="w-5 h-5" />,
    color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10',
    resources: [
      {
        name: 'Airbnb',
        url: 'https://www.airbnb.com',
        description: 'Monthly stays get significant discounts. Filter by WiFi speed and workspace.',
        tag: 'Popular',
      },
      {
        name: 'Booking.com',
        url: 'https://www.booking.com',
        description: 'Hotels, apartments, and hostels with free cancellation. Genius loyalty discounts.',
      },
      {
        name: 'Hostelworld',
        url: 'https://www.hostelworld.com',
        description: 'Best hostel booking platform. Social features to meet other travelers.',
        tag: 'Budget',
      },
      {
        name: 'Coliving.com',
        url: 'https://www.coliving.com',
        description: 'Directory of coliving spaces worldwide. Work-focused communities with included amenities.',
      },
      {
        name: 'Flatio',
        url: 'https://www.flatio.com',
        description: 'Medium-term rentals (1-12 months) in Europe. No deposit required. Verified landlords.',
      },
      {
        name: 'NomadStays',
        url: 'https://nomadstays.com',
        description: 'Curated apartments verified for remote work — fast WiFi, desk, quiet environment.',
      },
    ],
  },
  {
    id: 'coworking',
    title: 'Coworking & Productivity',
    description: 'Day passes, memberships, and tools to stay productive on the road.',
    icon: <Laptop className="w-5 h-5" />,
    color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10',
    resources: [
      {
        name: 'Deskpass',
        url: 'https://www.deskpass.com',
        description: 'Day passes to coworking spaces in 1,000+ locations. Pay per visit, no commitment.',
      },
      {
        name: 'Croissant',
        url: 'https://www.getcroissant.com',
        description: 'Flexible coworking membership. Use credits at 500+ spaces across cities.',
      },
      {
        name: 'Notion',
        url: 'https://www.notion.so',
        description: 'All-in-one workspace for notes, docs, wikis, and project management.',
        tag: 'Essential',
      },
      {
        name: 'Loom',
        url: 'https://www.loom.com',
        description: 'Async video messaging. Record screen + camera and share instantly. Reduces meetings.',
      },
      {
        name: 'Krisp',
        url: 'https://krisp.ai',
        description: 'AI noise cancellation for calls. Works with any app. Essential for noisy cafes.',
        tag: 'Popular',
      },
    ],
  },
  {
    id: 'tax-legal',
    title: 'Tax & Legal',
    description: 'Handle taxes, incorporate remotely, and stay compliant across borders.',
    icon: <FileText className="w-5 h-5" />,
    color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10',
    resources: [
      {
        name: 'Deel',
        url: 'https://www.deel.com',
        description: 'Global payroll, contractor payments, and EOR services. Handle compliance in 150+ countries.',
        tag: 'Popular',
      },
      {
        name: 'Remote.com',
        url: 'https://remote.com',
        description: 'Employer of Record platform. Get hired legally in countries where your company has no entity.',
      },
      {
        name: 'Bright!Tax',
        url: 'https://brighttax.com',
        description: 'US expat tax services. Specializes in Americans living abroad and digital nomads.',
      },
      {
        name: 'Xolo',
        url: 'https://www.xolo.io',
        description: 'Estonian e-Residency company management. Invoice clients globally through an EU company.',
      },
      {
        name: 'Lano',
        url: 'https://www.lano.io',
        description: 'Hire and pay international contractors compliantly. Multi-currency payroll.',
      },
    ],
  },
  {
    id: 'freelance',
    title: 'Freelance & Remote Jobs',
    description: 'Find remote-friendly work and clients from anywhere.',
    icon: <Briefcase className="w-5 h-5" />,
    color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10',
    resources: [
      {
        name: 'CVin.Bio Jobs',
        url: '/jobs',
        description: 'Our own curated board of remote and hybrid roles across tech, design, and operations.',
        tag: 'Our Pick',
      },
      {
        name: 'Toptal',
        url: 'https://www.toptal.com',
        description: 'Top 3% freelance talent network. High-paying contracts for developers, designers, and finance.',
      },
      {
        name: 'Upwork',
        url: 'https://www.upwork.com',
        description: 'Largest freelance marketplace. Good for building client relationships and recurring work.',
      },
      {
        name: 'We Work Remotely',
        url: 'https://weworkremotely.com',
        description: 'One of the largest remote job boards. Engineering, design, marketing, and more.',
      },
      {
        name: 'Contra',
        url: 'https://contra.com',
        description: 'Commission-free freelance platform. Build a portfolio and get discovered by clients.',
        tag: 'Free',
      },
    ],
  },
  {
    id: 'community',
    title: 'Community & Networking',
    description: 'Meet other nomads, join local groups, and find your tribe.',
    icon: <Users className="w-5 h-5" />,
    color: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10',
    resources: [
      {
        name: 'Nomad List',
        url: 'https://nomadlist.com',
        description: 'OG nomad community. City rankings, member map, in-person meetups, and Slack chat.',
      },
      {
        name: 'r/digitalnomad',
        url: 'https://www.reddit.com/r/digitalnomad',
        description: '2M+ member subreddit. City reviews, visa questions, gear advice, and real experiences.',
        tag: 'Free',
      },
      {
        name: 'Meetup',
        url: 'https://www.meetup.com',
        description: 'Find local events and groups in any city — tech meetups, language exchanges, hiking.',
      },
      {
        name: 'Couchsurfing Hangouts',
        url: 'https://www.couchsurfing.com',
        description: 'Meet locals and travelers for coffee, activities, or events. Good for solo nomads.',
      },
      {
        name: 'Lunchclub',
        url: 'https://lunchclub.com',
        description: 'AI-matched 1:1 professional networking. Great for building connections in new cities.',
      },
    ],
  },
  {
    id: 'gear',
    title: 'Gear & Essentials',
    description: 'Travel-friendly tech, bags, and gadgets for life on the move.',
    icon: <Wrench className="w-5 h-5" />,
    color: 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50',
    resources: [
      {
        name: 'Peak Design Travel Backpack',
        url: 'https://www.peakdesign.com/products/travel-backpack',
        description: '45L expandable carry-on. Laptop sleeve, cable organizer, weather-resistant. The nomad bag.',
        tag: 'Popular',
      },
      {
        name: 'Anker Power Bank',
        url: 'https://www.anker.com',
        description: 'Portable chargers and travel adapters. High capacity, fast charging, compact.',
      },
      {
        name: 'Roost Laptop Stand',
        url: 'https://www.therooststand.com',
        description: 'Ultra-portable laptop stand (165g). Prevents neck strain. Folds to pencil-size.',
      },
      {
        name: 'Sony WH-1000XM5',
        url: 'https://www.sony.com/headphones',
        description: 'Industry-leading noise cancelling headphones. 30-hour battery. Essential for cafe work.',
      },
      {
        name: 'Universal Travel Adapter',
        url: 'https://www.epickatech.com',
        description: 'One adapter for all outlet types. USB-C PD fast charging. Covers 200+ countries.',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function ResourceCard({ resource }: { resource: Resource }) {
  const isInternal = resource.url.startsWith('/');

  const Tag = isInternal ? Link : 'a';
  const linkProps = isInternal
    ? { href: resource.url }
    : { href: resource.url, target: '_blank', rel: 'noopener noreferrer' };

  return (
    <Tag
      {...(linkProps as any)}
      className="group flex flex-col gap-1.5 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700/80 hover:shadow-sm transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors">
            {resource.name}
          </span>
          {resource.tag && (
            <span className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {resource.tag === 'Popular' && <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />}
              {resource.tag}
            </span>
          )}
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors shrink-0 mt-0.5" />
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
        {resource.description}
      </p>
    </Tag>
  );
}

export default function ResourcesPage() {
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
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3 transition-colors">
            Resources & Tools
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 transition-colors max-w-3xl">
            Everything you need for life as a digital nomad — insurance, banking, connectivity, flights, accommodation, and more. Hand-picked and regularly updated.
          </p>
        </div>

        {/* Quick jump nav */}
        <div className="flex flex-wrap gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all"
            >
              {cat.title}
            </a>
          ))}
        </div>

        {/* Categories */}
        <div className="space-y-12">
          {CATEGORIES.map((cat) => (
            <section key={cat.id} id={cat.id}>
              {/* Category header */}
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cat.color}`}>
                  {cat.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    {cat.title}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Resource cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {cat.resources.map((resource) => (
                  <ResourceCard key={resource.name} resource={resource} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800/50">
          <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed max-w-2xl">
            This page contains curated recommendations based on community feedback and personal use. Some links may be affiliate links that help support CVin.Bio at no extra cost to you. Last updated June 2026.
          </p>
        </div>
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
