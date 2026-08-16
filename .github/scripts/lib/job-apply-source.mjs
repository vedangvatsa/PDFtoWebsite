/** Mirror of src/lib/job-apply-source.ts for Node enrich/sync scripts. */
import { isJobExpired } from '../../../src/lib/job-age.mjs';
import { isLowQualityApplySource } from '../../../src/lib/job-apply-hosts.mjs';
import { isBannedJobTitle } from '../../../src/lib/banned-jobs.mjs';
import { fellowshipPublishBlockReason } from '../../../src/lib/fellowship-publish-gate.mjs';
import { isGenericCompanyLabel } from '../../../src/lib/company-host.mjs';
import {
  isFullyEnrichedJob,
  rewriteMeetsPublishFloor,
  needsCuratedReenrich,
  formattedDescriptionWords,
} from './job-description-gate.mjs';

export { isLowQualityApplySource };
export {
  isFullyEnrichedJob,
  rewriteMeetsPublishFloor,
  needsCuratedReenrich,
  formattedDescriptionWords,
};
/** Public job URL / board / sitemap floor. */
export const MIN_WORDS = 600;
/**
 * Enrich must store above MIN_WORDS — formatJobDescription often trims 5–30 words
 * (noslop, junk facts, heading reflow). Ashby copywriter was 603 stored → 598
 * displayed and fell back to the company stub before the display-floor guard.
 */
export const ENRICH_MIN_WORDS = 625;
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

export function curatedJdMeetsWordFloor(description) {
  if (description == null) return true;
  return descriptionWords(description) >= MIN_WORDS;
}

/** Public URL may render (closed curated OK). Uncurated stubs are not pages. */
export function isPublicJobPage(job) {
  if (isBannedJobTitle(job?.title)) return false;
  if (isGenericCompanyLabel(job?.company)) return false;
  if (!isCuratedJd(job?.tags)) return false;
  if (!curatedJdMeetsWordFloor(job?.description)) return false;
  if (isLowQualityApplySource(job?.apply_url)) return false;
  const fellowish =
    /\bfellow/i.test(String(job?.title || '')) ||
    String(job?.category || '').toLowerCase() === 'fellowship' ||
    String(job?.source || '') === 'fellowship-discover' ||
    (Array.isArray(job?.tags) && job.tags.some((t) => /^fellowship$/i.test(String(t))));
  if (fellowish && fellowshipPublishBlockReason(job)) return false;
  return true;
}

export function shouldQueueForManualEnrich(job, _opts = {}) {
  if (isFullyEnrichedJob(job)) return false;
  if (isLowQualityApplySource(job.apply_url)) return false;
  return descriptionWords(job.description) < ENRICH_MIN_WORDS;
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
