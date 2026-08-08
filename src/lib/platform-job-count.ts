/**
 * Static platform-wide job total for marketing UI.
 *
 * Avoids full-table COUNT(*) / exact counts on every request (homepage,
 * /jobs meta, /companies CTA, OG images, report copy). Real filtered
 * counts (search results, per-company pages) still query the DB.
 *
 * Single source of truth for the "100k" claim — keep TOTAL and DISPLAY in
 * sync so no page ever shows a divergent number.
 */
export const PLATFORM_JOBS_TOTAL = 100_000;
export const PLATFORM_JOBS_DISPLAY = '100k+';
