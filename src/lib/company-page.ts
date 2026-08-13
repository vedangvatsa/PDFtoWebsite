import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { toCompanyKey, COMPANY_BLOCKLIST, companyDisplayName } from '@/lib/company-directory';
import { shouldListJobOnBoard } from '@/lib/job-apply-source';
import { withTimeoutFallback, DB_BUDGET } from '@/lib/db-timeout';
import { knownCompanyDescription } from '@/lib/seo-fallbacks';

const supabaseForCompany = supabaseAdmin;

export type CompanyDirectoryRow = {
  slug: string;
  name: string;
  role_count: number;
  logo: string | null;
  locations: string[] | null;
};

export type CompanyPageJob = {
  id: string;
  title: string;
  company: string;
  company_logo: string | null;
  location: string | null;
  job_type: string | null;
  tags: string[] | null;
  category: string | null;
  apply_url: string | null;
  published_at: string | null;
  created_at: string | null;
  source: string | null;
  salary: string | null;
  external_id: string | null;
  slug: string | null;
  description: string | null;
};

export type CompanyPageContext = {
  dir: CompanyDirectoryRow | null;
  jobs: CompanyPageJob[];
};

/** Resolve directory row by slug (O(1) PK) — avoids dual exact COUNT on jobs. */
export async function getCompanyDirectory(slug: string) {
  const result = await withTimeoutFallback(
    supabaseForCompany
      .from('companies')
      .select('slug, name, role_count, logo, locations')
      .eq('slug', slug)
      .maybeSingle(),
    DB_BUDGET.fast,
    { data: null, error: null } as any,
    `company-dir:${slug}`
  );
  return result.data as CompanyDirectoryRow | null;
}

const SELECT_JOB_COLS =
  'id, title, company, company_logo, location, job_type, tags, category, apply_url, published_at, created_at, source, salary, external_id, slug, description';

/**
 * Load recent jobs for a company page.
 * Contract: equality only (company_key OR exact company name). Never ILIKE.
 * Hard timeout + empty fail-open so the page still renders directory meta.
 */
export async function loadCompanyJobs(
  slug: string,
  dirName: string | null | undefined
): Promise<CompanyPageJob[]> {
  return unstable_cache(
    async () => {
      const thirtyDaysAgo = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString();
      const companyKey = toCompanyKey(dirName || slug);

      async function fetchJobs(since: string | null): Promise<CompanyPageJob[]> {
        if (companyKey) {
          let q = supabaseForCompany
            .from('jobs')
            .select(SELECT_JOB_COLS)
            .eq('company_key', companyKey);
          if (since) {
            q = q.gt('created_at', since);
            q = q.or(`published_at.is.null,published_at.gt.${since}`);
          }
          const byKey = await withTimeoutFallback(
            q
              .order('published_at', { ascending: false, nullsFirst: false })
              .limit(50),
            DB_BUDGET.list,
            { data: null, error: { message: 'timeout' } } as any,
            `company-jobs-key:${companyKey}:${since || 'all'}`
          );
          if (byKey.data && byKey.data.length > 0) return byKey.data;
        }

        if (dirName) {
          let q = supabaseForCompany
            .from('jobs')
            .select(SELECT_JOB_COLS)
            .eq('company', dirName);
          if (since) {
            q = q.gt('created_at', since);
            q = q.or(`published_at.is.null,published_at.gt.${since}`);
          }
          const byName = await withTimeoutFallback(
            q
              .order('published_at', { ascending: false, nullsFirst: false })
              .limit(50),
            DB_BUDGET.list,
            { data: null, error: { message: 'timeout' } } as any,
            `company-jobs-name:${dirName}:${since || 'all'}`
          );
          if (byName.data && byName.data.length > 0) return byName.data;
        }

        return [];
      }

      const recent = await fetchJobs(thirtyDaysAgo);
      return (recent || []).filter((j) => shouldListJobOnBoard(j));
    },
    ['company-jobs-v4', slug, dirName || ''],
    { revalidate: 900, tags: [`company-jobs:${slug}`] }
  )();
}

/** Directory row and/or recent jobs — same gate as the company page body. */
export async function resolveCompanyPage(slug: string): Promise<CompanyPageContext | null> {
  const blockKey = slug.toLowerCase().replace(/-/g, ' ').trim();
  if (COMPANY_BLOCKLIST.has(blockKey) || COMPANY_BLOCKLIST.has(slug.toLowerCase())) {
    return null;
  }
  const dir = await getCompanyDirectory(slug);
  const jobs = await loadCompanyJobs(slug, dir?.name);
  if ((!jobs || jobs.length === 0) && !dir) {
    // Keep hubs Google already indexed when we still know the company —
    // otherwise /cayuse, /noodle, /monarch-money hard-404 after jobs purge.
    const description = knownCompanyDescription(slug);
    if (!description) return null;
    const name = companyDisplayName(slug.replace(/-/g, ' '));
    return {
      dir: {
        slug,
        name,
        role_count: 0,
        logo: null,
        locations: null,
      },
      jobs: [],
    };
  }
  // Also block if the resolved company name is junk
  const name = (dir?.name || jobs[0]?.company || '').toLowerCase().trim();
  if (name && COMPANY_BLOCKLIST.has(name)) return null;
  return { dir, jobs };
}

/** Shared company careers metadata — mirrors page render (dir OR jobs). */
export async function buildCompanyPageMetadata(
  slug: string,
  canonicalUrl: string,
  resolved?: CompanyPageContext | null
): Promise<Metadata | null> {
  const ctx = resolved ?? (await resolveCompanyPage(slug));
  if (!ctx) return null;
  const { dir, jobs } = ctx;
  const { getCompanyMeta } = await import('@/lib/company-data');
  const meta = getCompanyMeta(slug);
  const companyDisplay = companyDisplayName(dir?.name || jobs[0]?.company || slug.replace(/-/g, ' '));
  // loadCompanyJobs caps at 50; if we hit the cap prefer directory total when larger
  const jobCount =
    jobs.length >= 50 && dir?.role_count && dir.role_count > jobs.length
      ? dir.role_count
      : jobs.length;
  const title = `${companyDisplay} Careers — ${jobCount.toLocaleString()} Open Roles (${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})`;
  const desc = meta
    ? `${meta.description.slice(0, 100)} ${companyDisplay} has ${jobCount.toLocaleString()} open positions. Browse roles and apply.`
    : `${companyDisplay} is hiring — ${jobCount.toLocaleString()} open positions. Browse active job openings with live hiring data, remote availability, and technical requirements.`;
  const description = desc.slice(0, 160);
  // Empty hubs (description-only soft landings) stay crawlable but noindex —
  // clears GSC 404s without padding the index with thin 0-role pages.
  const indexable = jobCount > 0;
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title,
      description,
      siteName: 'CVin.Bio',
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: indexable, follow: true },
  };
}
