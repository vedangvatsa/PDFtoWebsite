/**
 * Apply-URL sources that do not yield a usable job body when we curl them
 * (LinkedIn guest pages, CareerJet trackers, etc.).
 *
 * Policy:
 *  1. Do not ingest curl-empty sources as JD bodies (LinkedIn, etc.)
 *  2. Board lists curated paraphrases that pass publish gates
 *  3. Never publish raw ATS or process/queue copy
 */
import { JOB_INDEXABLE_MIN_WORDS, jobDescriptionWordCount } from '@/lib/job-description';
import { jobAssembledIndexable } from '@/lib/job-assemble';
import { isJobExpired } from '@/lib/job-age';
import { isLowQualityApplySource } from '@/lib/job-apply-hosts.mjs';

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
 * Board / company listing: curated paraphrases from curlable hosts, or
 * assembled pages that pass Google Jobs quality gates.
 */
export function shouldListJobOnBoard(job: {
  id?: string | null;
  title?: string | null;
  company?: string | null;
  location?: string | null;
  job_type?: string | null;
  salary?: string | null;
  tags?: unknown;
  description?: string | null;
  apply_url?: string | null;
  category?: string | null;
  published_at?: string | null;
  created_at?: string | null;
}): boolean {
  if (isJobExpired(job.published_at, job.created_at)) return false;
  if (isCuratedJd(job.tags) && !isLowQualityApplySource(job.apply_url)) return true;
  return jobAssembledIndexable({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    job_type: job.job_type,
    salary: job.salary,
    tags: Array.isArray(job.tags) ? job.tags : null,
    description: job.description,
    apply_url: job.apply_url,
    category: job.category,
  });
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
