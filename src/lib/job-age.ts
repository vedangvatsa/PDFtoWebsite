/**
 * Listing window. See docs/JOB_PAGE_RULES.md.
 * Implementation lives in job-age.mjs so GitHub scripts cannot drift.
 */
export { JOB_MAX_AGE_DAYS, isJobExpired, jobPostingValidThrough } from './job-age.mjs';
