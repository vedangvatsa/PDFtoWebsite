/**
 * Apply-URL sources that do not yield a usable job body when we curl them
 * (LinkedIn guest pages, CareerJet trackers, etc.).
 *
 * Policy:
 *  1. Do not ingest curl-empty sources as JD bodies (LinkedIn, etc.)
 *  2. Job URLs, sitemap, feeds, Telegram, IndexNow use the curated-jd publication marker
 *     for legacy rewrites and source-jd original employer descriptions.
 *  3. /jobs board + company hubs list live inventory. Curated cards stay
 *     on-site; uncurated cards (and uncurated URL hits) go to apply_url
 *     until enrich publishes a page in the same sync run.
 *  4. Original source-jd bodies are fetched from official ATS APIs, bounded and escaped.
 */
import { JOB_INDEXABLE_MIN_WORDS, jobDescriptionWordCount, isGarbageJobTitle, formatJobDescription, jobDescriptionPlainText } from '@/lib/job-description';
import { isJobExpired } from '@/lib/job-age';
import { isLowQualityApplySource } from '@/lib/job-apply-hosts.mjs';
import { isBannedJobTitle } from '@/lib/banned-jobs.mjs';
import { fellowshipPublishBlockReason } from '@/lib/fellowship-publish-gate.mjs';
import { isGenericCompanyLabel } from '@/lib/company-host.mjs';
import { isSourceJd, sourceDescriptionValid } from '@/lib/source-job-description.mjs';

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

/** True when the loaded body meets the 600-word publish floor. Unloaded (`undefined`) is not a fail. */
export function curatedJdMeetsWordFloor(description: string | null | undefined): boolean {
  if (description == null) return true;
  return jobDescriptionWordCount(description) >= JOB_INDEXABLE_MIN_WORDS;
}

/** Enriched (old AI or new paraphrase) — never rewrite these. Tag alone is not enough. */
export function isFullyEnrichedJob(job: {
  tags?: unknown;
  description?: string | null;
  title?: string | null;
  company?: string | null;
  location?: string | null;
  apply_url?: string | null;
}): boolean {
  if (!isCuratedJd(job.tags)) return false;
  if (isSourceJd(job.tags)) return sourceDescriptionValid(job.description);
  const raw = jobDescriptionWordCount(job.description);
  if (raw < ENRICH_STORE_MIN_WORDS) return false;
  const html = formatJobDescription(job.description, job.location || null, {
    title: job.title,
    company: job.company,
    applyUrl: job.apply_url,
  });
  const formatted = jobDescriptionWordCount(jobDescriptionPlainText(html));
  return formatted >= JOB_INDEXABLE_MIN_WORDS;
}

/** Enrich must store above index floor — formatter often trims 5–30 words. */
export const ENRICH_STORE_MIN_WORDS = 625;

export type PublicJobGate = {
  title?: string | null;
  company?: string | null;
  tags?: unknown;
  apply_url?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  description?: string | null;
  source?: string | null;
  category?: string | null;
};

export function hasHttpApplyUrl(applyUrl: string | null | undefined): boolean {
  return /^https?:\/\//i.test(String(applyUrl || '').trim());
}

/**
 * A public job URL may render. Closed curated pages stay up; uncurated stubs
 * never get a 200 (temporary redirect to apply_url, else hub /jobs).
 * Original descriptions use their natural length; the 600-word floor applies
 * only to legacy rewrites. An unloaded body is allowed in slim list queries.
 */
export function isPublicJobPage(job: PublicJobGate): boolean {
  if (isBannedJobTitle(job.title)) return false;
  if (isGarbageJobTitle(job.title)) return false;
  if (isGenericCompanyLabel(job.company)) return false;
  if (!isCuratedJd(job.tags)) return false;
  if (isSourceJd(job.tags)) {
    if (job.description !== undefined && !sourceDescriptionValid(job.description)) return false;
  } else if (!curatedJdMeetsWordFloor(job.description)) return false;
  if (isLowQualityApplySource(job.apply_url)) return false;
  const fellowish =
    /\bfellow/i.test(String(job.title || '')) ||
    String(job.category || '').toLowerCase() === 'fellowship' ||
    String(job.source || '') === 'fellowship-discover' ||
    (Array.isArray(job.tags) && job.tags.some((t) => /^fellowship$/i.test(String(t))));
  if (fellowish && fellowshipPublishBlockReason(job)) return false;
  return true;
}

/**
 * A lightweight job page is useful to visitors but must not enter SEO feeds.
 * Its details are fetched from the employer only when a visitor opens it;
 * raw ATS copy is never persisted in Postgres.
 */
export function isThinJobPage(job: PublicJobGate): boolean {
  if (isBannedJobTitle(job.title)) return false;
  if (isGarbageJobTitle(job.title)) return false;
  if (isGenericCompanyLabel(job.company)) return false;
  if (isLowQualityApplySource(job.apply_url)) return false;
  if (!hasHttpApplyUrl(job.apply_url)) return false;
  return !isJobExpired(job.published_at, job.created_at);
}

/** Render only curated, publish-safe job pages. Thin rows click through to employers. */
export function canRenderJobPage(job: PublicJobGate): boolean {
  return isPublicJobPage(job);
}

/** Sitemap, feeds, related cards, Telegram: live verified job descriptions. */
export function shouldListJobOnBoard(job: PublicJobGate): boolean {
  if (!isPublicJobPage(job)) return false;
  if (isJobExpired(job.published_at, job.created_at)) return false;
  return true;
}

/**
 * Company hub cards: live, not banned. Curated-jd is a sitemap/job-URL
 * gate. Aliasing this to shouldListJobOnBoard emptied OpenAI/Stripe hubs.
 */
export function shouldListJobOnCompanyHub(job: PublicJobGate): boolean {
  if (isBannedJobTitle(job.title)) return false;
  if (isJobExpired(job.published_at, job.created_at)) return false;
  return true;
}

/**
 * /jobs + hub cards. Live inventory: on-site if the page is public, otherwise
 * only when there is an http(s) apply URL to send the click to.
 */
export function shouldListLiveJobCard(job: PublicJobGate): boolean {
  if (!shouldListJobOnCompanyHub(job)) return false;
  if (isPublicJobPage(job)) return true;
  return hasHttpApplyUrl(job.apply_url);
}

/** Live uncurated row → employer apply URL. Null once the on-site page is public. */
export function liveUncuratedApplyUrl(job: PublicJobGate): string | null {
  if (isPublicJobPage(job)) return null;
  if (isJobExpired(job.published_at, job.created_at)) return null;
  const apply = String(job.apply_url || '').trim();
  return hasHttpApplyUrl(apply) ? apply : null;
}

/** Manual paraphrase queue: never touch a 600w curated page; short tagged rows can re-enter. */
export function shouldQueueForManualEnrich(
  job: {
    tags?: unknown;
    description?: string | null;
    apply_url?: string | null;
  },
  _opts?: { reworkShortCurated?: boolean }
): boolean {
  if (isFullyEnrichedJob(job)) return false;
  if (isLowQualityApplySource(job.apply_url)) return false;
  return jobDescriptionWordCount(job.description) < ENRICH_STORE_MIN_WORDS;
}
