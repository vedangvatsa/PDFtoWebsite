/**
 * Sitemap job queries — avoid PostgREST OR + tags scans that hit statement
 * timeout. Split created_at (indexed) from published_at complement.
 */
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withTimeoutFallback, DB_BUDGET } from '@/lib/db-timeout';

export const SITEMAP_JOB_COLS =
  'id, company, external_id, slug, title, created_at, published_at, location, job_type, salary, tags, category';

export type SitemapJobRow = {
  id: string;
  company: string;
  external_id: string | null;
  slug: string | null;
  title: string | null;
  created_at: string | null;
  published_at: string | null;
  location: string | null;
  job_type: string | null;
  salary: string | null;
  tags: string[] | null;
  category: string | null;
};

type PageResult = { data: SitemapJobRow[] | null; error: { message: string } | null };

function baseQuery() {
  return supabaseAdmin
    .from('jobs')
    .select(SITEMAP_JOB_COLS)
    .not('external_id', 'is', null)
    .not('company', 'is', null)
    .contains('tags', ['curated-jd']);
}

export async function fetchSitemapJobsCreatedPage(
  sinceIso: string,
  from: number,
  limit: number
): Promise<PageResult> {
  return (await withTimeoutFallback(
    baseQuery()
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1),
    DB_BUDGET.list,
    { data: [], error: { message: 'timeout' } } as never,
    `sitemap-created:${from}`
  )) as unknown as PageResult;
}

/** Old ingest stamp + newer source publish — missed by created_at-only scans. */
export async function fetchSitemapJobsPublishedComplement(
  sinceIso: string,
  limit = 200
): Promise<PageResult> {
  return (await withTimeoutFallback(
    baseQuery()
      .gte('published_at', sinceIso)
      .lt('created_at', sinceIso)
      .order('published_at', { ascending: false })
      .limit(limit),
    DB_BUDGET.list,
    { data: [], error: { message: 'timeout' } } as never,
    'sitemap-published-complement'
  )) as unknown as PageResult;
}

/** null when both count legs time out — caller should fall back to fixed chunks. */
function countQuery() {
  return supabaseAdmin
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .not('external_id', 'is', null)
    .not('company', 'is', null)
    .contains('tags', ['curated-jd']);
}

type CountResult = { count: number | null; error: { message: string } | null };

/** null when both count legs time out — caller should fall back to fixed chunks. */
export async function countSitemapJobs(sinceIso: string): Promise<number | null> {
  const created = (await withTimeoutFallback(
    countQuery().gte('created_at', sinceIso),
    DB_BUDGET.stats,
    { count: null, error: { message: 'timeout' } } as CountResult,
    'sitemap-count-created'
  )) as unknown as CountResult;
  if (created.error?.message === 'timeout' && created.count == null) return null;

  let total = created.count || 0;
  const extra = (await withTimeoutFallback(
    countQuery().gte('published_at', sinceIso).lt('created_at', sinceIso),
    DB_BUDGET.stats,
    { count: 0, error: null } as never,
    'sitemap-count-published'
  )) as unknown as CountResult;
  total += extra.count || 0;
  return total;
}
