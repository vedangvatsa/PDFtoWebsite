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
  'id,title,company,company_logo,location,job_type,salary,tags,apply_url,category,source,published_at,description,external_id,created_at,slug';

function isExpiredJob(createdAt?: string | null, publishedAt?: string | null): boolean {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const pubMs = publishedAt ? new Date(publishedAt).getTime() : 0;
  const createdMs = createdAt ? new Date(createdAt).getTime() : 0;
  // Scraped jobs: created_at is the ingestion date — if the scraper found
  // it recently the listing is still live regardless of source metadata age.
  if (createdMs > thirtyDaysAgo) return false;
  // Stale by both dates: neither signal is recent → job is gone.
  if (pubMs > 0 && pubMs < thirtyDaysAgo && createdMs > 0 && createdMs < thirtyDaysAgo) return true;
  // Single-date fallback: if only one date exists and it's old, expire.
  if (pubMs > 0 && pubMs < thirtyDaysAgo && !createdMs) return true;
  if (createdMs > 0 && createdMs < thirtyDaysAgo && !pubMs) return true;
  return false;
}

async function loadJobByIdLive(id: string): Promise<JobRow | null> {
  const result = await withTimeoutFallback(
    supabaseAdmin.from('jobs').select(SELECT_COLS).eq('id', id).maybeSingle(),
    DB_BUDGET.fast,
    { data: null, error: { message: 'timeout' } } as any,
    `job-by-id:${id.slice(0, 8)}`
  );
  if (result.error || !result.data) return null;
  const row = result.data as JobRow;
  if (isExpiredJob(row.created_at, row.published_at)) return null;
  return row;
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
    if (isExpiredJob(row.created_at, row.published_at)) return null;
    if (companyToSlug(row.company) !== companySlug.toLowerCase()) return null;
    return row;
  };

  const extResult = await withTimeoutFallback(
    supabaseAdmin
      .from('jobs')
      .select(SELECT_COLS)
      .eq('external_id', externalId)
      .limit(2),
    DB_BUDGET.fast,
    { data: [] } as any,
    `job-ext:${externalId}`
  );
  const extRow = pickUnique(extResult.data);
  if (extRow) return extRow;

  const slugResult = await withTimeoutFallback(
    supabaseAdmin
      .from('jobs')
      .select(SELECT_COLS)
      .eq('slug', externalId)
      .limit(2),
    DB_BUDGET.fast,
    { data: [] } as any,
    `job-slug:${externalId}`
  );
  return pickUnique(slugResult.data);
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
