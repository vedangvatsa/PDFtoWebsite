import { companyHubAliasPrefixes } from './company-directory';
import { jobBelongsToCompanyHub } from './company-hub-query';
import { jobMatchesLegacySlugHint, jobStoredSlug } from './job-description';

export type JobRouteRow = {
  id: string;
  title: string;
  company: string;
  company_key?: string | null;
  external_id: string | null;
  slug: string | null;
  tags: string[] | null;
  created_at: string | null;
};

/** Preserve external-id ownership before pretty-slug aliases, including shorts. */
export function exactJobRoute(rows: JobRouteRow[], company: string, jobSlug: string): JobRouteRow | null {
  const owned = rows.filter((row) => jobBelongsToCompanyHub(row, company));
  const identifiers = [...new Set([
    ...companyHubAliasPrefixes(company).map((hub) => `${hub}_${jobSlug.toLowerCase()}`),
    jobSlug.toLowerCase(),
  ])];
  for (const column of ['external_id', 'slug'] as const) {
    for (const identifier of identifiers) {
      const matches = owned.filter((row) => row[column] === identifier);
      if (matches.length === 1) return matches[0];
    }
  }
  return null;
}

/** Legacy matching is CPU-only over a bounded, company-scoped cached index. */
export function legacyJobRoutes(rows: JobRouteRow[], company: string, jobSlug: string): JobRouteRow[] {
  const want = jobSlug.toLowerCase();
  return rows.filter((row) =>
    row.tags?.includes('curated-jd') &&
    jobBelongsToCompanyHub(row, company) &&
    jobMatchesLegacySlugHint(row, want)
  ).sort((a, b) => {
    const exact = Number(jobStoredSlug(b) === want) - Number(jobStoredSlug(a) === want);
    return exact || String(b.created_at || '').localeCompare(String(a.created_at || ''));
  });
}
