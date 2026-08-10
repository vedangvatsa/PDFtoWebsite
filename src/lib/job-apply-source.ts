/**
 * Apply-URL sources that do not yield a usable job body when we curl them
 * (LinkedIn guest pages, CareerJet trackers, etc.).
 *
 * Policy (simple):
 *  1. Do not ingest curl-empty sources (LinkedIn, etc.)
 *  2. Board lists only paraphrased jobs (curated-jd) — from curl + rules, checked manually
 *  3. Never invent a stub; uncurated jobs wait in the manual queue (not on the board)
 */
import { JOB_INDEXABLE_MIN_WORDS, jobDescriptionWordCount } from '@/lib/job-description';

/** Hosts with no reliable JD body via curl. */
const CURL_EMPTY_APPLY_HOST_RE =
  /(?:^|\.)(?:linkedin\.com|lnkd\.in|jobviewtrack\.com|jooble\.org|adzuna\.[a-z.]+|indeed\.[a-z.]+|glassdoor\.[a-z.]+|ziprecruiter\.com|careerjet\.[a-z.]+|simplyhired\.com|talent\.com)$/i;

export function applyUrlHostname(url: string | null | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return '';
  }
}

/** True when the apply link is a known curl-empty source. */
export function isLowQualityApplySource(url: string | null | undefined): boolean {
  const host = applyUrlHostname(url);
  if (!host) return true;
  return CURL_EMPTY_APPLY_HOST_RE.test(host);
}

export function isCuratedJd(tags: unknown): boolean {
  return Array.isArray(tags) && tags.includes('curated-jd');
}

/** Enriched (old AI or new paraphrase) — never rewrite these. */
export function isFullyEnrichedJob(job: {
  tags?: unknown;
  description?: string | null;
}): boolean {
  // Any curated-jd is treated as already enriched; leave it alone.
  return isCuratedJd(job.tags);
}

/**
 * Board / company listing: only paraphrased/enriched (curated-jd) jobs from curlable sources.
 */
export function shouldListJobOnBoard(job: {
  apply_url?: string | null;
  tags?: unknown;
  description?: string | null;
}): boolean {
  if (!isCuratedJd(job.tags)) return false;
  if (isLowQualityApplySource(job.apply_url)) return false;
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
