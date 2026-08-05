/**
 * JobPosting JSON-LD validation helpers (Google Jobs oriented).
 * Used by admin tooling and scripts — not a Google API client.
 */

export type JobPostingIssue = { level: 'error' | 'warn'; code: string; message: string };

export function validateJobPostingJsonLd(jsonLd: Record<string, unknown>): JobPostingIssue[] {
  const issues: JobPostingIssue[] = [];
  const err = (code: string, message: string) => issues.push({ level: 'error', code, message });
  const warn = (code: string, message: string) => issues.push({ level: 'warn', code, message });

  if (jsonLd['@type'] !== 'JobPosting') err('type', 'Missing @type JobPosting');
  if (!jsonLd.title || String(jsonLd.title).trim().length < 3) err('title', 'Title missing or too short');

  const desc = String(jsonLd.description || '').trim();
  if (desc.length < 80) err('description', 'Description too short for Google Jobs (<80 chars)');
  else if (desc.split(/\s+/).length < 50) warn('description_words', 'Description under ~50 words');

  if (!jsonLd.datePosted) err('datePosted', 'Missing datePosted');
  if (!jsonLd.validThrough) warn('validThrough', 'Missing validThrough (recommended)');

  const org = jsonLd.hiringOrganization as Record<string, unknown> | undefined;
  if (!org || org['@type'] !== 'Organization') err('org', 'Missing hiringOrganization Organization');
  else if (!org.name) err('org_name', 'Missing hiringOrganization.name');

  if (!jsonLd.url || !String(jsonLd.url).startsWith('http')) err('url', 'Missing absolute url');

  const remote = jsonLd.jobLocationType === 'TELECOMMUTE';
  if (!jsonLd.jobLocation && !remote) {
    err('location', 'Missing jobLocation and not TELECOMMUTE');
  }
  if (remote && !jsonLd.applicantLocationRequirements) {
    warn('remote_req', 'TELECOMMUTE without applicantLocationRequirements');
  }

  if (jsonLd.baseSalary) {
    const sal = jsonLd.baseSalary as any;
    if (sal['@type'] !== 'MonetaryAmount') warn('salary_type', 'baseSalary should be MonetaryAmount');
    if (!sal.currency) warn('salary_currency', 'baseSalary missing currency');
  } else {
    warn('salary', 'No baseSalary (optional but useful)');
  }

  if (!jsonLd.identifier) warn('identifier', 'Missing identifier PropertyValue');

  return issues;
}

export function summarizeJobPostingValidation(issues: JobPostingIssue[]) {
  const errors = issues.filter((i) => i.level === 'error');
  const warns = issues.filter((i) => i.level === 'warn');
  return {
    ok: errors.length === 0,
    errorCount: errors.length,
    warnCount: warns.length,
    issues,
  };
}
