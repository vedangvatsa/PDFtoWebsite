/** Mirror of src/lib/job-apply-source.ts for Node enrich/sync scripts. */
export const MIN_WORDS = 600;

/** Apply hosts that return no usable JD body when curled. */
const CURL_EMPTY_APPLY_HOST_RE =
  /(?:^|\.)(?:linkedin\.com|lnkd\.in|jobviewtrack\.com|jooble\.org|adzuna\.[a-z.]+|indeed\.[a-z.]+|glassdoor\.[a-z.]+|ziprecruiter\.com|careerjet\.[a-z.]+|simplyhired\.com|talent\.com)$/i;

export function applyUrlHostname(url) {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return '';
  }
}

export function isLowQualityApplySource(url) {
  const host = applyUrlHostname(url);
  if (!host) return true;
  return CURL_EMPTY_APPLY_HOST_RE.test(host);
}

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

/** Listing: enriched/paraphrased only. */
export function shouldListJobOnBoard(job) {
  if (!isCuratedJd(job.tags)) return false;
  if (isLowQualityApplySource(job.apply_url)) return false;
  return true;
}
