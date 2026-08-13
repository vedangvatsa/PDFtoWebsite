/**
 * Factual stub only. Indexable pages must already be a trusted curated paraphrase.
 */
import { cleanPublishText } from '@/lib/noslop';
import {
  formatJobDescription,
  jobDescriptionWordCount,
  JOB_INDEXABLE_MIN_WORDS,
  cleanJobTitle,
  looksLikeFellowship,
} from '@/lib/job-description';
import { publishableCompanyAbout } from '@/lib/company-about';
import { companyDisplayName, applyCompanyDisplayCasing } from '@/lib/company-directory';
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
  return n >= 2;
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

export async function assembleJobPage(
  job: AssembleJobInput,
  opts?: { formatHtml?: boolean }
): Promise<AssembledJobPage> {
  const formatHtml = opts?.formatHtml !== false;
  const title = cleanPublishText(job.title || '');
  const rawCompany = cleanPublishText(job.company || '');
  const company = companyDisplayName(rawCompany, job.apply_url);
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

  const displayTitle = cleanJobTitle(title) || title;
  const engagement = looksLikeFellowship(job)
    ? 'fellowship'
    : engagementLabel(job.job_type);
  const ownedAbout = await publishableCompanyAbout(job.company || company);
  const blurb = ownedAbout && jobDescriptionWordCount(ownedAbout) >= 40 ? ownedAbout : '';
  const skills = filterMeaningfulSkillTags(job.tags || [], { companyName: company }).slice(0, 8);

  const sections: string[] = [];
  if (blurb) {
    sections.push(`About ${company}`, blurb, '');
  }
  const locBit = location ? ` (${location})` : '';
  sections.push(
    `${company} is hiring for ${displayTitle}${locBit}.`,
    'The full description, including duties, requirements, and pay, is on the company apply page.'
  );
  if (engagement) sections.push(`This listing is a ${engagement} role.`);
  if (salary) sections.push(`Listed pay: ${salary}.`);
  if (skills.length >= 2) sections.push(`Skills mentioned: ${skills.join(', ')}.`);

  const plain = applyCompanyDisplayCasing(
    cleanPublishText(sections.join('\n')),
    rawCompany,
    company,
    job.apply_url
  );
  const wordCount = jobDescriptionWordCount(plain);
  const html = formatHtml
    ? formatJobDescription(plain, location, {
        title: displayTitle,
        company,
        rawCompany,
        applyUrl: job.apply_url,
        isFellowship: looksLikeFellowship(job),
      })
    : '';

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
