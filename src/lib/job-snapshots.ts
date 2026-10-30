/** Public job data is cached independently of authenticated viewer context. */
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { DatabaseUnavailableError } from '@/lib/db-timeout';
import { readJobQuery } from '@/lib/job-data-read';
import { companyKeyEqualityValues, companyNameEqualityValues, jobBelongsToCompanyHub } from '@/lib/company-hub-query';
import { isJobId, isShortJobSlug, JOB_DESCRIPTION_FORMAT_VERSION } from '@/lib/job-description';
import { canRenderJobPage } from '@/lib/job-apply-source';
import { exactJobRoute, legacyJobRoutes, type JobRouteRow } from '@/lib/job-route-resolution';
import type { JobRow } from '@/lib/job-detail-data';

const SELECT_COLS =
  'id,title,company,company_key,company_logo,location,job_type,salary,tags,apply_url,category,source,published_at,description,external_id,created_at,slug';
const ROUTE_COLS = 'id,title,company,company_key,external_id,slug,tags,created_at';
const ROUTE_PAGE = 100;
const ROUTE_MAX = 2000;

import { getStaticJobById } from '@/lib/jobs-static';

async function loadJobByIdLive(id: string): Promise<JobRow | null> {
  const staticJob = await getStaticJobById(id);
  if (staticJob) return staticJob;

  try {
    const result = await readJobQuery(
      () => supabaseAdmin.from('jobs').select(SELECT_COLS).eq('id', id).maybeSingle(),
      'job-by-id'
    );
    return result.data as JobRow | null;
  } catch {
    return null;
  }
}

export const getCachedJobById = cache(async (id: string): Promise<JobRow | null> => {
  if (!isJobId(id)) return null;
  return unstable_cache(() => loadJobByIdLive(id),
    ['job-snapshot-id-v2', `v${JOB_DESCRIPTION_FORMAT_VERSION}`, id],
    { revalidate: 300, tags: ['public-jobs', `job:${id}`] }
  )();
});

// One cache key per company/page, not per arbitrary crawled job URL. Small
// pages fit the bounded free-tier cache even for the largest company hubs.
async function routePage(company: string, column: 'company_key' | 'company', values: string[], from: number) {
  return unstable_cache(async () => {
    const result = await readJobQuery(
      () => supabaseAdmin.from('jobs').select(ROUTE_COLS).in(column, values)
        .order('id').range(from, from + ROUTE_PAGE - 1),
      'job-route-index'
    );
    return (result.data || []) as JobRouteRow[];
  }, ['job-route-index-v1', company, column, String(from)],
  { revalidate: 900, tags: ['public-jobs'] })();
}

import { getStaticJobs } from '@/lib/jobs-static';

const getCompanyRouteRows = cache(async (company: string): Promise<JobRouteRow[]> => {
  const allStatic = await getStaticJobs();
  if (allStatic && allStatic.length > 0) {
    return allStatic.filter((j) => jobBelongsToCompanyHub(j, company)) as unknown as JobRouteRow[];
  }

  const rows = new Map<string, JobRouteRow>();
  const lookups = [
    ['company_key', companyKeyEqualityValues(company)],
    ['company', companyNameEqualityValues(company)],
  ] as const;
  for (const [column, values] of lookups) {
    if (!values.length) continue;
    let complete = false;
    for (let from = 0; from <= ROUTE_MAX; from += ROUTE_PAGE) {
      try {
        const page = await routePage(company, column, values, from);
        for (const row of page) rows.set(row.id, row);
        if (page.length < ROUTE_PAGE) { complete = true; break; }
      } catch {
        break;
      }
    }
  }
  return [...rows.values()];
});

export const getCachedJobByCompanyAndSlug = cache(async (
  companySlug: string,
  jobSlug: string
): Promise<JobRow | null> => {
  if (!/^[a-z0-9-]{1,80}$/i.test(companySlug) || !isShortJobSlug(jobSlug)) return null;
  const company = companySlug.toLowerCase();
  const rows = await getCompanyRouteRows(company);
  const exact = exactJobRoute(rows, company, jobSlug);
  if (exact) return getCachedJobById(exact.id);
  // Check a bounded number of likely historical aliases; a trusted full body
  // is still required before an old link can render/redirect to a public page.
  const candidates = legacyJobRoutes(rows, company, jobSlug);
  for (const candidate of candidates.slice(0, 5)) {
    const job = await getCachedJobById(candidate.id);
    if (job && canRenderJobPage(job)) return job;
  }
  if (candidates.length > 5) throw new DatabaseUnavailableError('ambiguous legacy job');
  return null;
});
