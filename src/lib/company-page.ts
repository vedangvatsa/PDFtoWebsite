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

const SLIM_JOB_COLS =
  'id, title, company, company_logo, location, job_type, tags, category, apply_url, published_at, created_at, source, salary, external_id, slug';
const HUB_JOB_PAGE = 100;
const HUB_JOB_MAX = 2000;

/**
 * Load live jobs for a company page (the full list, not a 50-row sample).
 * Contract: equality only (company_key OR exact company name). Never ILIKE.
 * Hub listing is live inventory — do not wrap SQL in withCuratedJdTag.
 * Slim columns + paging so OpenAI-scale hubs do not hit statement timeout.
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

      async function fetchRange(
        applyFilters: (q: any) => any,
        label: string,
        from: number,
        withCount: boolean
      ) {
        const run = () =>
          applyFilters(
            supabaseForCompany
              .from('jobs')
              .select(SLIM_JOB_COLS, withCount ? { count: 'exact' } : undefined)
          )
            .order('published_at', { ascending: false, nullsFirst: false })
            .range(from, from + HUB_JOB_PAGE - 1);

        let page = await withTimeoutFallback(
          run(),
          DB_BUDGET.list,
          { data: null, count: null, error: { message: 'timeout' } } as any,
          `${label}:${from}`
        );
        for (let attempt = 0; attempt < 2 && page.error?.message === 'timeout'; attempt++) {
          page = await withTimeoutFallback(
            run(),
            DB_BUDGET.stats,
            { data: null, count: null, error: { message: 'timeout' } } as any,
            `${label}:${from}:retry${attempt}`
          );
        }
        return page;
      }

      async function fetchPaged(
        applyFilters: (q: any) => any,
        label: string
      ): Promise<{ rows: CompanyPageJob[]; timedOut: boolean }> {
        const first = await fetchRange(applyFilters, label, 0, true);
        if (first.error?.message === 'timeout' && !(first.data && first.data.length)) {
          return { rows: [], timedOut: true };
        }
        const rows: CompanyPageJob[] = [...((first.data || []) as CompanyPageJob[])];
        const reported = Number(first.count);
        const hasCount = Number.isFinite(reported) && reported > 0;
        const total = hasCount ? Math.min(reported, HUB_JOB_MAX) : HUB_JOB_MAX;
        if (rows.length >= total || rows.length < HUB_JOB_PAGE) {
          return { rows, timedOut: false };
        }

        if (!hasCount) {
          for (let from = HUB_JOB_PAGE; from < HUB_JOB_MAX; from += HUB_JOB_PAGE) {
            const page = await fetchRange(applyFilters, label, from, false);
            if (page.error?.message === 'timeout' && !(page.data && page.data.length)) {
              return { rows, timedOut: rows.length === 0 };
            }
            const chunk = (page.data || []) as CompanyPageJob[];
            rows.push(...chunk);
            if (chunk.length < HUB_JOB_PAGE) break;
          }
          return { rows, timedOut: false };
        }

        const starts: number[] = [];
        for (let from = HUB_JOB_PAGE; from < total; from += HUB_JOB_PAGE) {
          starts.push(from);
        }
        for (let i = 0; i < starts.length; i += 4) {
          const batch = await Promise.all(
            starts.slice(i, i + 4).map((from) => fetchRange(applyFilters, label, from, false))
          );
          for (const page of batch) {
            rows.push(...((page.data || []) as CompanyPageJob[]));
          }
        }
        const seen = new Set<string>();
        return {
          rows: rows.filter((j) => {
            if (!j.id || seen.has(j.id)) return false;
            seen.add(j.id);
            return true;
          }),
          timedOut: false,
        };
      }

      async function fetchJobs(
        windowStart: string | null
      ): Promise<{ rows: CompanyPageJob[]; timedOut: boolean }> {
        const applyWindow = (q: any) => {
          if (!windowStart) return q;
          return q.or(companyJobsDateOrFilter(windowStart));
        };

        if (keys.length) {
          const byKey = await fetchPaged(
            (q) => applyWindow(q.in('company_key', keys)),
            `company-jobs-key:${keys.join(',')}:${windowStart || 'all'}`
          );
          if (byKey.rows.length > 0) return byKey;
          if (byKey.timedOut) return byKey;
        }

        if (names.length) {
          const byName = await fetchPaged(
            (q) => applyWindow(q.in('company', names)),
            `company-jobs-name:${names.join(',')}:${windowStart || 'all'}`
          );
          if (byName.rows.length > 0 || byName.timedOut) return byName;
        }

        return { rows: [], timedOut: false };
      }

      async function hydrateDescriptions(rows: CompanyPageJob[]): Promise<CompanyPageJob[]> {
        const need = rows.filter((j) => Array.isArray(j.tags) && j.tags.includes('curated-jd') && j.id);
        if (!need.length) return rows;
        const byId = new Map<string, string | null>();
        for (let i = 0; i < need.length; i += 40) {
          const ids = need.slice(i, i + 40).map((j) => j.id);
          const page = await withTimeoutFallback(
            supabaseForCompany.from('jobs').select('id,description').in('id', ids),
            DB_BUDGET.list,
            { data: [] } as any,
            `company-jobs-desc:${slug}:${i}`
          );
          for (const row of page.data || []) {
            byId.set(row.id, row.description ?? null);
          }
        }
        return rows.map((j) => (byId.has(j.id) ? { ...j, description: byId.get(j.id) } : j));
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
      const live = rows.filter((j) => shouldListJobOnCompanyHub(j));
      return hydrateDescriptions(live);
    },
    ['company-jobs-v16', slug, dirName || ''],
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
  const jobCount = jobs.length;
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
