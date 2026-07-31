import { PAGE_CONTAINER, PAGE_TITLE } from '@/lib/utils';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Metadata } from 'next';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import { PLATFORM_JOBS_DISPLAY } from '@/lib/platform-job-count';
import { toCompanySlug } from '@/lib/company-directory';
import { withTimeoutFallback, DB_BUDGET } from '@/lib/db-timeout';
import { primaryCompanyLogoUrl } from '@/lib/company-logo';
import { unstable_cache } from 'next/cache';

const supabase = supabaseAdmin;

// Directory is rebuilt in jobs-sync; slim SSR list only.
export const revalidate = 21600; // 6 hours

/** Hard budget: first paint is top N by role_count (not the whole board). */
const DIRECTORY_LIMIT = 100;

export const metadata: Metadata = {
  title: 'Companies Hiring Now',
  description:
    'Browse all companies actively hiring on CVin.Bio. Discover open roles at top tech companies including Stripe, Anthropic, Figma, GitLab, and more.',
  alternates: { canonical: 'https://cvin.bio/companies' },
  openGraph: {
    type: 'website',
    url: 'https://cvin.bio/companies',
    title: 'Companies Hiring Now | CVin.Bio',
    description:
      'Browse all companies actively hiring on CVin.Bio. Discover open roles at top tech companies.',
    siteName: 'CVin.Bio',
  },
  twitter: { card: 'summary_large_image', title: 'Companies Hiring Now | CVin.Bio' },
  robots: { index: true, follow: true },
};

type CompanyRow = {
  slug: string;
  name: string;
  role_count: number;
  logo: string | null;
};

const loadCompaniesDirectory = unstable_cache(
  async (): Promise<CompanyRow[]> => {
    const result = await withTimeoutFallback(
      supabase
        .from('companies')
        // Slim select — no locations[] (shown on company pages only).
        .select('slug, name, role_count, logo')
        .order('role_count', { ascending: false })
        .limit(DIRECTORY_LIMIT),
      DB_BUDGET.fast,
      { data: null, error: { message: 'timeout' } } as any,
      'companies-directory'
    );

    if (result.error) {
      console.error('companies directory read failed:', result.error.message);
    }

    return (result.data || []).map((c: any) => ({
      slug: c.slug || toCompanySlug(c.name),
      name: c.name,
      role_count: c.role_count ?? 0,
      logo: c.logo ?? null,
    }));
  },
  ['companies-directory-v2'],
  { revalidate: 3600, tags: ['companies-directory'] }
);

/** Server-only logo img — keeps company marks without client hydration × N. */
function DirectoryLogo({
  name,
  logo,
  size,
  className,
  alt,
}: {
  name: string;
  logo?: string | null;
  size: number;
  className: string;
  alt: string;
}) {
  const src = primaryCompanyLogoUrl(name, logo, Math.max(size * 2, 64));
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

export default async function CompaniesPage() {
  const companies = await loadCompaniesDirectory();

  const logoStrip = [
    'Stripe',
    'Anthropic',
    'Cloudflare',
    'Figma',
    'GitLab',
    'Coinbase',
    'Discord',
    'Reddit',
    'Airbnb',
    'Spotify',
    'Netflix',
  ];

  return (
    <div className="h-screen overflow-y-auto bg-[#fafafa] selection:bg-primary/10 transition-colors duration-200 flex flex-col">
      <Header />
      <main id="main-content" className={PAGE_CONTAINER}>
        <div className="flex flex-col mb-10">
          <h1 className={PAGE_TITLE}>Companies</h1>
          <div className="flex items-center gap-3 mt-3">
            {logoStrip.map((name) => (
              <Link key={name} href={`/${toCompanySlug(name)}`} title={name} className="shrink-0">
                <DirectoryLogo
                  name={name}
                  size={24}
                  className="h-5 w-5 sm:h-6 sm:w-6 rounded-md opacity-80 hover:opacity-100 transition-all shrink-0 object-cover bg-white"
                  alt={`${name} company logo — remote job listings`}
                />
              </Link>
            ))}
            <span className="text-xs text-zinc-400 shrink-0">
              top {companies.length || DIRECTORY_LIMIT} hiring
            </span>
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-primary hover:underline"
          >
            <Briefcase className="h-4 w-4 text-primary" />
            Browse all {PLATFORM_JOBS_DISPLAY} open roles →
          </Link>
        </div>

        <p className="text-xs font-semibold text-zinc-400 mb-4 uppercase tracking-wider">
          Top {companies.length} companies by open roles
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {companies.map((company) => (
            <Link
              key={company.slug}
              href={`/${company.slug}`}
              className="group flex items-center gap-3 px-4 py-2.5 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 hover:shadow-sm transition-all"
            >
              <DirectoryLogo
                name={company.name}
                logo={company.logo}
                size={20}
                className="h-5 w-5 rounded shrink-0 object-cover bg-white"
                alt={`${company.name} logo — hiring ${company.role_count} open roles`}
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-[13px] font-semibold text-zinc-900 group-hover:text-primary transition-colors truncate">
                  {company.name}
                </h2>
                <p className="mt-0.5 text-[11px] text-zinc-500 font-medium">
                  {company.role_count} {company.role_count === 1 ? 'role' : 'roles'}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {companies.length === 0 && (
          <p className="text-sm text-zinc-500 mt-8">
            Company directory is refreshing. Browse{' '}
            <Link href="/jobs" className="text-primary underline">
              all open roles
            </Link>{' '}
            in the meantime.
          </p>
        )}

        {companies.length > 0 && (
          <p className="text-sm text-zinc-500 mt-8 text-center">
            Showing the top {companies.length} by open roles.{' '}
            <Link href="/jobs" className="text-primary underline">
              Search all companies on the jobs board
            </Link>
            .
          </p>
        )}
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
