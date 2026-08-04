/**
 * Static platform-wide job total for marketing UI.
 *
 * Avoids full-table COUNT(*) / exact counts on every request (homepage,
 * /jobs meta, /companies CTA, OG images, report copy). Real filtered
 * counts (search results, per-company pages) still query the DB.
 *
 * Bump when the board order-of-magnitude changes.
 */
export const PLATFORM_JOBS_TOTAL = 108_000;
export const PLATFORM_JOBS_DISPLAY = '100k+';
