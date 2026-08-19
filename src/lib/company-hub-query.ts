/**
 * Pure company-hub query contracts. No DB, no Next cache.
 * Tests lock these so empty hubs / false 404s cannot return via filter drift.
 */
import { companyDisplayName, toCompanyKey, toCompanySlug, canonicalCompanyHub, companyHubAliasPrefixes, routeCompanySlug } from '@/lib/company-directory';
import { isCuratedJd, isPublicJobPage } from '@/lib/job-apply-source';
import { jobPublicPath } from '@/lib/job-description';

export function uniqueNonEmpty(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.map((v) => String(v || '').trim()).filter(Boolean))];
}

/** Equality keys for jobs.company_key — slug and directory name can diverge. */
export function companyKeyEqualityValues(slug: string, dirName?: string | null): string[] {
  const canonical = canonicalCompanyHub(toCompanyKey(slug));
  const fromName = dirName ? toCompanySlug(dirName) : '';
  return uniqueNonEmpty([
    slug,
    canonical,
    fromName,
    ...companyHubAliasPrefixes(canonical),
    ...companyHubAliasPrefixes(fromName),
  ]);
}

/**
 * Exact company-column variants. Directory stores "OpenAI"; jobs often store
 * "openai". Never ILIKE — only equality / IN lists.
 */
export function companyNameEqualityValues(slug: string, dirName?: string | null): string[] {
  const spaced = slug.replace(/-/g, ' ');
  const display = companyDisplayName(dirName || spaced);
  const fromAliases = companyHubAliasPrefixes(canonicalCompanyHub(toCompanyKey(slug))).flatMap(
    (prefix) => {
      const sp = prefix.replace(/-/g, ' ');
      return [prefix, sp, companyDisplayName(sp)];
    }
  );
  return uniqueNonEmpty([
    dirName,
    display,
    slug,
    spaced,
    spaced.toLowerCase(),
    display.toLowerCase(),
    dirName?.toLowerCase(),
    ...fromAliases,
  ]);
}

/** True when the row belongs on this public hub, including alias keys/names. */
export function jobBelongsToCompanyHub(
  job: { company?: string | null; company_key?: string | null },
  hubSlug: string
): boolean {
  const want = canonicalCompanyHub(hubSlug);
  if (!want) return false;
  if (routeCompanySlug(job) === want) return true;
  const keys = companyKeyEqualityValues(want, job.company);
  const rowKey = String(job.company_key || '').trim().toLowerCase();
  if (rowKey && (keys.includes(rowKey) || canonicalCompanyHub(rowKey) === want)) {
    return true;
  }
  const nameSlug = toCompanySlug(String(job.company || ''));
  if (!nameSlug) return false;
  return keys.includes(nameSlug) || canonicalCompanyHub(nameSlug) === want;
}

/**
 * PostgREST date window: newest of published_at OR created_at.
 * Never AND created_at (that dropped 2-day publishes with old ingest stamps).
 */
export function companyJobsDateOrFilter(sinceIso: string): string {
  return `published_at.gt.${sinceIso},created_at.gt.${sinceIso}`;
}

/** Keep `/{slug}` when we still know the company, even if about copy is unpublished wiki. */
export function shouldKeepCompanyHub(input: {
  slugBlocked?: boolean;
  nameBlocked?: boolean;
  hasDirectory: boolean;
  liveJobCount: number;
  hasCachedProfile: boolean;
}): boolean {
  if (input.slugBlocked || input.nameBlocked) return false;
  if (input.hasDirectory || input.liveJobCount > 0) return true;
  return input.hasCachedProfile;
}

/**
 * Curated cards stay on-site. Uncurated live cards go to apply_url so they
 * do not 301-loop back to the hub (job URLs are curated-only until enrich).
 * Shared by company hubs and the /jobs board.
 */
export function companyHubJobLink(job: {
  id: string;
  company: string;
  company_key?: string | null;
  title?: string | null;
  tags?: unknown;
  apply_url?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  external_id?: string | null;
  slug?: string | null;
  description?: string | null;
}): { href: string; external: boolean } {
  const onSite = () => ({ href: jobPublicPath(job), external: false as const });
  if (isPublicJobPage(job)) return onSite();
  const apply = String(job.apply_url || '').trim();
  if (/^https?:\/\//i.test(apply)) return { href: apply, external: true };
  // Unloaded curated body may still resolve; a loaded non-public row must not
  // mint /{hub}/{slug} that 301s back to the hub.
  if (isCuratedJd(job.tags) && job.description === undefined) return onSite();
  return onSite();
}
