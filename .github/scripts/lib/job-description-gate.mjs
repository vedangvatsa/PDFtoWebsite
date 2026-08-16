/**
 * Shared publish-floor checks: raw storage vs formatted display word counts.
 */
import {
  formatJobDescription,
  jobDescriptionPlainText,
  jobDescriptionWordCount,
} from '../../../src/lib/job-description.ts';
import { descriptionWords, ENRICH_MIN_WORDS, MIN_WORDS, isCuratedJd } from './job-apply-source.mjs';

export { ENRICH_MIN_WORDS, MIN_WORDS };

export function isCvinStubText(text) {
  const t = String(text || '');
  return /listed on CVin\.Bio|original summary prepared by CVin\.Bio|company apply page/i.test(t);
}

export function formattedDescriptionWords(job) {
  const raw = String(job?.description || '').trim();
  if (!raw || isCvinStubText(raw)) return 0;
  const html = formatJobDescription(raw, job?.location || null, {
    title: job?.title || null,
    company: job?.company || null,
    applyUrl: job?.apply_url || null,
  });
  return jobDescriptionWordCount(jobDescriptionPlainText(html));
}

/** Curated row is truly done: enough raw storage AND survives formatter trim. */
export function isFullyEnrichedJob(job) {
  if (!isCuratedJd(job?.tags)) return false;
  const raw = descriptionWords(job?.description);
  if (raw < ENRICH_MIN_WORDS) return false;
  return formattedDescriptionWords(job) >= MIN_WORDS;
}

export function needsCuratedReenrich(job) {
  if (!isCuratedJd(job?.tags)) return false;
  if (!job?.apply_url) return false;
  if (isCvinStubText(job?.description)) return true;
  const raw = descriptionWords(job?.description);
  if (raw < ENRICH_MIN_WORDS) return true;
  return formattedDescriptionWords(job) < MIN_WORDS;
}

export function rewriteMeetsPublishFloor(storedDescription, job) {
  const raw = descriptionWords(storedDescription);
  if (raw < ENRICH_MIN_WORDS) return false;
  return (
    formattedDescriptionWords({ ...job, description: storedDescription }) >= MIN_WORDS
  );
}
