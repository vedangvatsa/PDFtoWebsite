/**
 * Listing window. See docs/JOB_PAGE_RULES.md.
 * After this: page stays 200, apply off, no JobPosting, still indexable if curated.
 * Do not hard-delete. Ingest must drop already-old postings.
 * Bulk enrich can override with JOB_MAX_AGE_DAYS env.
 *
 * Single implementation for the Next app and Node scripts — do not copy this.
 */
export const JOB_MAX_AGE_DAYS = Number(process.env.JOB_MAX_AGE_DAYS || 30) || 30;

function listingStamps(publishedAt, createdAt) {
  return [publishedAt, createdAt]
    .map((ts) => (ts ? new Date(ts).getTime() : NaN))
    .filter((ms) => Number.isFinite(ms));
}

export function isJobExpired(publishedAt, createdAt, now = Date.now()) {
  const cutoff = now - JOB_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const times = listingStamps(publishedAt, createdAt);
  if (times.length === 0) return false;
  // Listing window follows the newest stamp. A 2-day-old publish must not
  // expire because created_at is older (enrich / re-ingest).
  return Math.max(...times) < cutoff;
}

/**
 * Google Jobs validThrough. Must follow the same newest-stamp window as
 * isJobExpired. Using published_at + 30d dropped live listings from GSC
 * because source published_at is often weeks older than created_at.
 */
export function jobPostingValidThrough(publishedAt, createdAt, now = Date.now()) {
  const times = listingStamps(publishedAt, createdAt);
  const newest = times.length ? Math.max(...times) : now;
  return new Date(newest + JOB_MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();
}
