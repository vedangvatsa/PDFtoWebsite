/**
 * Listing window. See docs/JOB_PAGE_RULES.md.
 * After this: page stays 200, apply off, no JobPosting, still indexable if curated.
 * Do not hard-delete. Ingest must drop already-old postings.
 * Bulk enrich can override with JOB_MAX_AGE_DAYS env.
 */
export const JOB_MAX_AGE_DAYS = Number(process.env.JOB_MAX_AGE_DAYS || 30) || 30;

export function isJobExpired(
  publishedAt?: string | null,
  createdAt?: string | null,
  now = Date.now()
): boolean {
  const cutoff = now - JOB_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  for (const ts of [publishedAt, createdAt]) {
    if (!ts) continue;
    const ms = new Date(ts).getTime();
    if (Number.isFinite(ms) && ms < cutoff) return true;
  }
  return false;
}
