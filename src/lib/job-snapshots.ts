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
import { routeCompanySlug } from '@/lib/company-directory';
import {
  isJobId,
  isShortJobSlug,
  jobExternalIdFromSlugs,
  companyToSlug,
  JOB_DESCRIPTION_FORMAT_VERSION,
} from '@/lib/job-description';
import type { JobRow } from '@/lib/job-detail-data';

const SELECT_COLS =
  'id,title,company,company_key,company_logo,location,job_type,salary,tags,apply_url,category,source,published_at,description,external_id,created_at,slug';

// Expired jobs still load. The page shows a closed notice and hides apply.
// Missing rows (hard-deleted) still 301 to the company hub.

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
  // A URL is ambiguous when one job's minted slug column equals another job's
  // external_id (e.g. a greenhouse row minted `twilio_sw-eng` vs a native row
  // whose external_id is literally `twilio_sw-eng`). The exact external_id
  // match owns the URL — it is the legacy canonical and always unique. The
  // slug-column match is a minted pretty alias and only wins when nothing
  // claims the external_id. Never fall back to `.or().maybeSingle()`, which
  // 406s (and then legacy-redirects into a loop) when both rows match.
  const pickUnique = (
    rows: Array<Record<string, unknown>> | null | undefined
  ): JobRow | null => {
    if (!rows || rows.length !== 1) return null;
    const row = rows[0] as JobRow;
    const want = companySlug.toLowerCase();
    const rowHub = routeCompanySlug({
      company: row.company,
      company_key: (row as JobRow & { company_key?: string }).company_key,
    });
    if (rowHub !== want) return null;
    return row;
  };

  // Most jobs use the historical `${company}_${slug}` identifier, but
  // fellowship/academic imports can persist the short identifier itself
  // (`oxford-ra`, `aspen`). Resolve both forms so links minted from the
  // stored slug do not soft-redirect to the hub.
  const identifiers = [...new Set([externalId, jobSlug.toLowerCase()])];
  for (const identifier of identifiers) {
    const extResult = await withTimeoutFallback(
      supabaseAdmin
        .from('jobs')
        .select(SELECT_COLS)
        .eq('external_id', identifier)
        .limit(2),
      DB_BUDGET.fast,
      { data: [] } as any,
      `job-ext:${identifier}`
    );
    const extRow = pickUnique(extResult.data);
    if (extRow) return extRow;
  }

  for (const identifier of identifiers) {
    const slugResult = await withTimeoutFallback(
      supabaseAdmin
        .from('jobs')
        .select(SELECT_COLS)
        .eq('slug', identifier)
        .limit(2),
      DB_BUDGET.fast,
      { data: [] } as any,
      `job-slug:${identifier}`
    );
    const slugRow = pickUnique(slugResult.data);
    if (slugRow) return slugRow;
  }
  return null;
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
