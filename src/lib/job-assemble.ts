/**
 * Factual stub only. Indexable pages must already be a trusted curated paraphrase.
 */
import { cleanPublishText } from '@/lib/noslop';
import {
  formatJobDescription,
  jobDescriptionWordCount,
  JOB_INDEXABLE_MIN_WORDS,
} from '@/lib/job-description';
import { publishableCompanyAbout } from '@/lib/company-about';
import { companyDisplayName } from '@/lib/company-directory';
import { filterMeaningfulSkillTags } from '@/lib/job-skill-tags';
import { isJobExpired } from '@/lib/job-age';
import { isBannedJobTitle } from '@/lib/banned-jobs.mjs';

export type AssembleJobInput = {
  id?: string | null;
  title?: string | null;
  company?: string | null;
  location?: string | null;
  job_type?: string | null;
  salary?: string | null;
  tags?: string[] | null;
  description?: string | null;
  apply_url?: string | null;
  category?: string | null;
};

export type AssembledJobPage = {
  ok: boolean;
  indexable: boolean;
  html: string;
  plain: string;
  wordCount: number;
  failReason: string | null;
};

const RAW_ATS_RE =
  /equal opportunity employer|all qualified applicants|requisition id|job requisition|click here to apply|we are an equal|receive consideration without regard|eeo is the law|disability accommodation|unsolicited resumes|applicants must be authorized to work|greenhouse\.io|boards\.greenhouse|lever\.co\/|jobs\.ashbyhq|you must be legally authorized|reasonable accommodation|protected veteran/i;

const OWNED_HEADER_RES = [
  /about the role/i,
  /key facts/i,
  /what you'?ll do/i,
  /practical notes/i,
  /how to apply/i,
  /skills (&|and) tools/i,
];

export function looksLikeOwnedJobCopy(text: string | null | undefined): boolean {
  const t = String(text || '');
  let n = 0;
  for (const re of OWNED_HEADER_RES) {
    if (re.test(t)) n += 1;
  }
  return n >= 3;
}

export function looksLikeRawAts(text: string | null | undefined): boolean {
  return RAW_ATS_RE.test(String(text || ''));
}

/** Trusted long paraphrase / owned body we should not replace. */
export function isTrustedCuratedBody(text: string | null | undefined): boolean {
  const words = jobDescriptionWordCount(text);
  if (words < JOB_INDEXABLE_MIN_WORDS) return false;
  if (!looksLikeOwnedJobCopy(text)) return false;
  if (looksLikeRawAts(text)) return false;
  if (/\[placeholder\]|lorem ipsum/i.test(String(text || ''))) return false;
  return true;
}

function engagementLabel(jobType: string | null | undefined): string | null {
  const t = String(jobType || '').toLowerCase().replace(/[_-]+/g, ' ').trim();
  if (!t) return null;
  if (/full\s*time/.test(t)) return 'full-time';
  if (/part\s*time/.test(t)) return 'part-time';
  if (/intern/.test(t)) return 'internship';
  if (/contract/.test(t)) return 'contract';
  if (/freelance/.test(t)) return 'freelance';
  if (/temp/.test(t)) return 'temporary';
  return t.slice(0, 40);
}

export function assembleJobPage(
  job: AssembleJobInput,
  opts?: { formatHtml?: boolean }
): AssembledJobPage {
  const formatHtml = opts?.formatHtml !== false;
  const title = cleanPublishText(job.title || '');
  const company = companyDisplayName(cleanPublishText(job.company || ''));
  const location = cleanPublishText(job.location || '');
  const salary = cleanPublishText(job.salary || '');
  const fail = (reason: string, extra?: Partial<AssembledJobPage>): AssembledJobPage => ({
    ok: false,
    indexable: false,
    html: extra?.html || '',
    plain: extra?.plain || '',
    wordCount: extra?.wordCount || 0,
    failReason: reason,
  });

  if (!title || !company) return fail('sparse_facts');

  const engagement = engagementLabel(job.job_type);
  const ownedAbout = publishableCompanyAbout(job.company || company);
  const blurb = ownedAbout && jobDescriptionWordCount(ownedAbout) >= 40 ? ownedAbout : '';
  const skills = filterMeaningfulSkillTags(job.tags || [], { companyName: company }).slice(0, 8);

  const facts: string[] = [];
  if (location) facts.push(`Location: ${location}`);
  if (engagement) facts.push(`Engagement: ${engagement}`);
  if (salary) facts.push(`Compensation: ${salary}`);
  if (skills.length >= 2) facts.push(`Listed skills: ${skills.join(', ')}`);
  facts.push('Duties and requirements are only those on the official apply page.');

  const sections: string[] = [`${title} at ${company}.`, '', 'Key facts', ...facts];
  if (blurb) sections.push('', `About ${company}`, blurb);
  sections.push(
    '',
    'Practical notes',
    'This page does not invent day-to-day work, perks, or hiring criteria.',
    'Confirm title, team, visa, and pay on the official apply page before you submit.',
    '',
    'How to apply',
    'Use the official apply link. CVin.Bio does not submit the application for you. A public CV link is optional and is not a substitute for the employer form.'
  );

  const plain = cleanPublishText(sections.join('\n'));
  const wordCount = jobDescriptionWordCount(plain);
  const html = formatHtml ? formatJobDescription(plain, location) : '';

  return {
    ok: true,
    indexable: false,
    html,
    plain,
    wordCount,
    failReason: 'factual_stub',
  };
}

/** Factual stubs are never indexable. Board listing uses curated-jd instead. */
export function jobAssembledIndexable(_job: AssembleJobInput): boolean {
  return false;
}

export function jobQualifiesForSitemap(
  job: AssembleJobInput & {
    tags?: unknown;
    description?: string | null;
    published_at?: string | null;
    created_at?: string | null;
  }
): boolean {
  if (isBannedJobTitle(job.title)) return false;
  if (isJobExpired(job.published_at, job.created_at)) return false;
  if (!Array.isArray(job.tags) || !job.tags.includes('curated-jd')) return false;
  if (job.description == null) return true;
  return isTrustedCuratedBody(job.description);
}
