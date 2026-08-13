/** Mirror of src/lib/job-apply-source.ts for Node enrich/sync scripts. */
import { isJobExpired } from '../../../src/lib/job-age.mjs';
import { isLowQualityApplySource } from '../../../src/lib/job-apply-hosts.mjs';
import { isBannedJobTitle } from '../../../src/lib/banned-jobs.mjs';

export { isLowQualityApplySource };
export const MIN_WORDS = 600;
export const CURATED_JD_TAG = 'curated-jd';

export function isCuratedJd(tags) {
  return Array.isArray(tags) && tags.includes(CURATED_JD_TAG);
}

export function descriptionWords(description) {
  const text = String(description || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export function isFullyEnrichedJob(job) {
  return isCuratedJd(job.tags);
}

/** Public URL may render (closed curated OK). Uncurated stubs are not pages. */
export function isPublicJobPage(job) {
  if (isBannedJobTitle(job?.title)) return false;
  if (!isCuratedJd(job?.tags)) return false;
  if (isLowQualityApplySource(job?.apply_url)) return false;
  return true;
}

export function shouldQueueForManualEnrich(job, _opts = {}) {
  if (isCuratedJd(job.tags)) return false;
  if (isLowQualityApplySource(job.apply_url)) return false;
  return descriptionWords(job.description) < MIN_WORDS;
}

export function shouldListJobOnBoard(job) {
  if (!isPublicJobPage(job)) return false;
  if (isJobExpired(job.published_at, job.created_at)) return false;
  return true;
}

/** Company hub cards: live, not banned. Do not alias the board gate. */
export function shouldListJobOnCompanyHub(job) {
  if (isBannedJobTitle(job?.title)) return false;
  if (isJobExpired(job?.published_at, job?.created_at)) return false;
  return true;
}
