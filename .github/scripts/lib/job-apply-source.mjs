/** Mirror of src/lib/job-apply-source.ts for Node enrich/sync scripts. */
import { isLowQualityApplySource } from '../../../src/lib/job-apply-hosts.mjs';
import { isBannedJobTitle } from '../../../src/lib/banned-jobs.mjs';

export { isLowQualityApplySource };
export const MIN_WORDS = 600;

export function isCuratedJd(tags) {
  return Array.isArray(tags) && tags.includes('curated-jd');
}

export function descriptionWords(description) {
  const text = String(description || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/** Already enriched (AI or paraphrase) — never rewrite. */
export function isFullyEnrichedJob(job) {
  return isCuratedJd(job.tags);
}

/**
 * Queue: scrapable ATS, under 600 words, not curated-jd.
 * Board only shows curated-jd after enrich (old AI or new paraphrase).
 */
export function shouldQueueForManualEnrich(job, _opts = {}) {
  if (isCuratedJd(job.tags)) return false;
  if (isLowQualityApplySource(job.apply_url)) return false;
  return descriptionWords(job.description) < MIN_WORDS;
}

/** Listing: curated paraphrases from curlable hosts. */
export function shouldListJobOnBoard(job) {
  if (isBannedJobTitle(job.title)) return false;
  if (!isCuratedJd(job.tags)) return false;
  if (isLowQualityApplySource(job.apply_url)) return false;
  return true;
}
