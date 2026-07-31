/**
 * Cache-first job snapshots for public job pages.
 *
 * Layering:
 *  1. Next.js unstable_cache (edge/data cache, revalidate 15m)
 *  2. Live Supabase with hard timeout (fail open → null)
 *
 * When the primary is unhealthy, ISR still serves the last good snapshot.
 * Supabase remains system of record; public traffic never hangs on it.
 */
import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withTimeoutFallback, DB_BUDGET } from '@/lib/db-timeout';
import {
  isJobId,
  isShortJobSlug,
  jobExternalIdFromSlugs,
  companyToSlug,
  JOB_DESCRIPTION_FORMAT_VERSION,
} from '@/lib/job-description';
import type { JobRow } from '@/lib/job-detail-data';

const SELECT_COLS =
  'id,title,company,company_logo,location,job_type,salary,tags,apply_url,category,source,published_at,description,external_id';

async function loadJobByIdLive(id: string): Promise<JobRow | null> {
  const result = await withTimeoutFallback(
    supabaseAdmin.from('jobs').select(SELECT_COLS).eq('id', id).maybeSingle(),
    DB_BUDGET.fast,
    { data: null, error: { message: 'timeout' } } as any,
    `job-by-id:${id.slice(0, 8)}`
  );
  if (result.error || !result.data) return null;
  return result.data as JobRow;
}

async function loadJobByExternalIdLive(
  companySlug: string,
  jobSlug: string
): Promise<JobRow | null> {
  const externalId = jobExternalIdFromSlugs(companySlug, jobSlug);
  const result = await withTimeoutFallback(
    supabaseAdmin
      .from('jobs')
      .select(SELECT_COLS)
      .eq('external_id', externalId)
      .maybeSingle(),
    DB_BUDGET.fast,
    { data: null, error: { message: 'timeout' } } as any,
    `job-ext:${externalId}`
  );
  if (result.error || !result.data) return null;
  const row = result.data as JobRow;
  if (companyToSlug(row.company) !== companySlug.toLowerCase()) return null;
  return row;
}

/** Cached by id — used by /jobs/{uuid}. */
export function getCachedJobById(id: string): Promise<JobRow | null> {
  if (!isJobId(id)) return Promise.resolve(null);
  return unstable_cache(
    () => loadJobByIdLive(id),
    ['job-snapshot-id', `v${JOB_DESCRIPTION_FORMAT_VERSION}`, id],
    { revalidate: 300, tags: [`job:${id}`] }
  )();
}

/** Cached by company+slug — used by /google/mkt. */
export function getCachedJobByCompanyAndSlug(
  companySlug: string,
  jobSlug: string
): Promise<JobRow | null> {
  if (!companySlug || !isShortJobSlug(jobSlug)) return Promise.resolve(null);
  const key = `${companySlug.toLowerCase()}_${jobSlug.toLowerCase()}`;
  return unstable_cache(
    () => loadJobByExternalIdLive(companySlug.toLowerCase(), jobSlug.toLowerCase()),
    ['job-snapshot-ext', `v${JOB_DESCRIPTION_FORMAT_VERSION}`, key],
    { revalidate: 300, tags: [`job-ext:${key}`] }
  )();
}
