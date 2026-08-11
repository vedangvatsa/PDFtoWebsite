/**
 * Soft landings for expired / reminted public URLs.
 * High-churn job corpus + hard deletes produced ~2k GSC "Not found" URLs;
 * prefer 301 to a live parent over hard 404 so Google drops dead URLs cleanly.
 */
import { supabaseAdmin } from '@/lib/supabase-admin';
import { toCompanyKey, COMPANY_BLOCKLIST, isJunkCompanyName } from '@/lib/company-directory';
import { withTimeoutFallback, DB_BUDGET } from '@/lib/db-timeout';
import companyDescriptions from '@/lib/company-descriptions.json';
import { publishableCompanyAbout } from '@/lib/company-about';

const DESCRIPTIONS = companyDescriptions as Record<string, string>;

/** Disposable profile remints leave /user87 etc. permanently dead without redirects. */
/** Prefer the shared parse-guard definition so bare `profile` is treated as disposable. */
export { isDisposableProfileSlug } from '@/lib/parse-guard';

/**
 * True when `/{slug}` can (or should) resolve as a company careers hub —
 * directory row, any live job under company_key, or a known description.
 */
export async function companyHubExists(slug: string): Promise<boolean> {
  const key = toCompanyKey(slug);
  if (!key) return false;
  const blockKey = key.replace(/-/g, ' ').trim();
  if (COMPANY_BLOCKLIST.has(blockKey) || COMPANY_BLOCKLIST.has(key)) return false;
  if (isJunkCompanyName(key.replace(/-/g, ' '))) return false;

  if (DESCRIPTIONS[key]) return true;

  const dir = await withTimeoutFallback(
    supabaseAdmin
      .from('companies')
      .select('slug')
      .eq('slug', key)
      .maybeSingle(),
    DB_BUDGET.fast,
    { data: null } as any,
    `seo-hub-dir:${key}`
  );
  if (dir.data?.slug) return true;

  const jobs = await withTimeoutFallback(
    supabaseAdmin
      .from('jobs')
      .select('id')
      .eq('company_key', key)
      .limit(1),
    DB_BUDGET.fast,
    { data: [] } as any,
    `seo-hub-jobs:${key}`
  );
  return Array.isArray(jobs.data) && jobs.data.length > 0;
}

/** Where to send a dead `/{company}/{jobSlug}` — company hub if live, else jobs board. */
export async function gonePrettyJobPath(companySlug: string): Promise<string> {
  const key = toCompanyKey(companySlug);
  if (key && (await companyHubExists(key))) return `/${key}`;
  return '/jobs';
}

/** Reminted disposable profiles → home. */
export function goneDisposableProfilePath(): string {
  return '/';
}

/** Dead UUID job pages → jobs board. */
export function goneUuidJobPath(): string {
  return '/jobs';
}

/** Known publishable description for a company slug (never encyclopedia dumps). */
export function knownCompanyDescription(slug: string): string | null {
  return publishableCompanyAbout(slug);
}
