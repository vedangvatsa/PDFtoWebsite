import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { COMPANY_BLOCKLIST, companyDisplayName, companyDisplayNameFromJob } from '@/lib/company-directory';
import { shouldListJobOnCompanyHub } from '@/lib/job-apply-source';
import { JOB_MAX_AGE_DAYS } from '@/lib/job-age';
import { withTimeoutFallback, DB_BUDGET } from '@/lib/db-timeout';
import { knownCompanyDescription } from '@/lib/seo-fallbacks';
import { companyHasCachedProfile } from '@/lib/company-about';
import {
  companyJobsDateOrFilter,
  companyKeyEqualityValues,
  companyNameEqualityValues,
  shouldKeepCompanyHub,
} from '@/lib/company-hub-query';

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
  description?: string | null;
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
  'id, title, company, company_logo, location, job_type, tags, category, apply_url, published_at, created_at, source, salary, external_id, slug';

/**
 * Load recent jobs for a company page.
 * Contract: equality only (company_key OR exact company name). Never ILIKE.
 * Hub listing is live inventory — do not wrap SQL in withCuratedJdTag.
 * Hard timeout + empty fail-open so the page still renders directory meta.
 */
export async function loadCompanyJobs(
  slug: string,
  dirName: string | null | undefined
): Promise<CompanyPageJob[]> {
  return unstable_cache(
    async () => {
      const since = new Date(
        Date.now() - JOB_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
      ).toISOString();
      const keys = companyKeyEqualityValues(slug, dirName);
      const names = companyNameEqualityValues(slug, dirName);

      async function fetchJobs(
        windowStart: string | null
      ): Promise<{ rows: CompanyPageJob[]; timedOut: boolean }> {
        let timedOut = false;
        const applyWindow = (q: any) => {
          if (!windowStart) return q;
          return q.or(companyJobsDateOrFilter(windowStart));
        };

        if (keys.length) {
          const q = applyWindow(
            supabaseForCompany
              .from('jobs')
              .select(SELECT_JOB_COLS)
              .in('company_key', keys)
          );
          const byKey = await withTimeoutFallback(
            q
              .order('published_at', { ascending: false, nullsFirst: false })
              .limit(50),
            DB_BUDGET.list,
            { data: null, error: { message: 'timeout' } } as any,
            `company-jobs-key:${keys.join(',')}:${windowStart || 'all'}`
          );
          if (byKey.data && byKey.data.length > 0) {
            return { rows: byKey.data as CompanyPageJob[], timedOut: false };
          }
          if (byKey.error?.message === 'timeout') timedOut = true;
        }

        if (names.length) {
          const q = applyWindow(
            supabaseForCompany
              .from('jobs')
              .select(SELECT_JOB_COLS)
              .in('company', names)
          );
          const byName = await withTimeoutFallback(
            q
              .order('published_at', { ascending: false, nullsFirst: false })
              .limit(50),
            DB_BUDGET.list,
            { data: null, error: { message: 'timeout' } } as any,
            `company-jobs-name:${names.join(',')}:${windowStart || 'all'}`
          );
          if (byName.data && byName.data.length > 0) {
            return { rows: byName.data as CompanyPageJob[], timedOut: false };
          }
          if (byName.error?.message === 'timeout') timedOut = true;
        }

        return { rows: [], timedOut };
      }

      const recent = await fetchJobs(since);
      if (recent.timedOut && (!recent.rows || recent.rows.length === 0)) {
        throw new Error('COMPANY_JOBS_TIMEOUT');
      }
      let rows = recent.rows || [];
      if (!rows.length) {
        const all = await fetchJobs(null);
        if (all.timedOut && (!all.rows || all.rows.length === 0)) {
          throw new Error('COMPANY_JOBS_TIMEOUT');
        }
        rows = all.rows || [];
      }
      return rows.filter((j) => shouldListJobOnCompanyHub(j));
    },
    ['company-jobs-v14', slug, dirName || ''],
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
  let jobs: CompanyPageJob[] = [];
  try {
    jobs = await loadCompanyJobs(slug, dir?.name);
  } catch (err) {
    if (!String((err as Error)?.message || err).includes('COMPANY_JOBS_TIMEOUT')) throw err;
    jobs = [];
  }
  const resolvedName = (dir?.name || jobs[0]?.company || '').toLowerCase().trim();
  const keep = shouldKeepCompanyHub({
    nameBlocked: Boolean(resolvedName && COMPANY_BLOCKLIST.has(resolvedName)),
    hasDirectory: Boolean(dir),
    liveJobCount: jobs.length,
    hasCachedProfile: await companyHasCachedProfile(slug) || Boolean(await knownCompanyDescription(slug)),
  });
  if (!keep) return null;

  if ((jobs && jobs.length > 0) || dir) {
    return { dir, jobs: jobs || [] };
  }
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
  const companyDisplay = companyDisplayNameFromJob(
    jobs[0],
    dir?.name || slug.replace(/-/g, ' ')
  );
  const jobCount =
    jobs.length >= 50 && dir?.role_count && dir.role_count > jobs.length
      ? dir.role_count
      : jobs.length;
  const title = `${companyDisplay} Careers — ${jobCount.toLocaleString()} Open Roles (${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})`;
  const desc = meta
    ? `${meta.description.slice(0, 100)} ${companyDisplay} has ${jobCount.toLocaleString()} open positions. Browse roles and apply.`
    : `${companyDisplay} is hiring — ${jobCount.toLocaleString()} open positions. Browse active job openings with live hiring data, remote availability, and technical requirements.`;
  const description = desc.slice(0, 160);
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
