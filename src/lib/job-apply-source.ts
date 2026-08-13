/**
 * Apply-URL sources that do not yield a usable job body when we curl them
 * (LinkedIn guest pages, CareerJet trackers, etc.).
 *
 * Policy:
 *  1. Do not ingest curl-empty sources as JD bodies (LinkedIn, etc.)
 *  2. Board, sitemap, feeds, and job URLs are curated-jd only
 *  3. Company hubs list live inventory (not expired, not banned). Uncurated
 *     rows are not pages — hub cards link out to apply_url.
 *  4. Never publish raw ATS or process/queue copy
 */
import { JOB_INDEXABLE_MIN_WORDS, jobDescriptionWordCount } from '@/lib/job-description';
import { isJobExpired } from '@/lib/job-age';
import { isLowQualityApplySource } from '@/lib/job-apply-hosts.mjs';
import { isBannedJobTitle } from '@/lib/banned-jobs.mjs';

export const CURATED_JD_TAG = 'curated-jd';

export function isCuratedJd(tags: unknown): boolean {
  return Array.isArray(tags) && tags.includes(CURATED_JD_TAG);
}

/** PostgREST list queries: constrain before limit() so the enrich queue cannot fill the page. */
export function withCuratedJdTag<T extends { contains: (column: string, value: string[]) => T }>(
  query: T
): T {
  return query.contains('tags', [CURATED_JD_TAG]);
}

/** Enriched (old AI or new paraphrase) — never rewrite these. */
export function isFullyEnrichedJob(job: {
  tags?: unknown;
  description?: string | null;
}): boolean {
  return isCuratedJd(job.tags);
}

export type PublicJobGate = {
  title?: string | null;
  tags?: unknown;
  apply_url?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

/**
 * A public job URL may render. Closed curated pages stay up; uncurated stubs
 * never get a 200 (redirect to the company hub / jobs board).
 */
export function isPublicJobPage(job: PublicJobGate): boolean {
  if (isBannedJobTitle(job.title)) return false;
  if (!isCuratedJd(job.tags)) return false;
  if (isLowQualityApplySource(job.apply_url)) return false;
  return true;
}

/** Board, related cards, sitemap: live curated paraphrases only. */
export function shouldListJobOnBoard(job: PublicJobGate): boolean {
  if (!isPublicJobPage(job)) return false;
  if (isJobExpired(job.published_at, job.created_at)) return false;
  return true;
}

/**
 * Company hub cards: live, not banned. Curated-jd is a board/sitemap/job-URL
 * gate. Aliasing this to shouldListJobOnBoard emptied OpenAI/Stripe hubs.
 */
export function shouldListJobOnCompanyHub(job: PublicJobGate): boolean {
  if (isBannedJobTitle(job.title)) return false;
  if (isJobExpired(job.published_at, job.created_at)) return false;
  return true;
}

/** Manual paraphrase queue: never touch curated-jd; only curlable under-600 raw jobs. */
export function shouldQueueForManualEnrich(
  job: {
    tags?: unknown;
    description?: string | null;
    apply_url?: string | null;
  },
  _opts?: { reworkShortCurated?: boolean }
): boolean {
  if (isCuratedJd(job.tags)) return false;
  if (isLowQualityApplySource(job.apply_url)) return false;
  return jobDescriptionWordCount(job.description) < JOB_INDEXABLE_MIN_WORDS;
}
