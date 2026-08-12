/**
 * Deterministic facts from an ATS body. Never invent.
 * Used to organize metadata/tags. Not a publishable JD.
 */
import { filterMeaningfulSkillTags } from '@/lib/job-skill-tags';
import { cleanAtsHtml } from '@/lib/job-ats-text';

const SKILL_LEXICON = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'Kotlin', 'Swift', 'Go', 'Rust',
  'Ruby', 'PHP', 'Scala', 'C++', 'C#', 'React', 'Vue', 'Angular', 'Next.js',
  'Node.js', 'Django', 'Flask', 'FastAPI', 'Spring', 'Rails', 'AWS', 'GCP',
  'Azure', 'Kubernetes', 'Docker', 'Terraform', 'PostgreSQL', 'MySQL', 'MongoDB',
  'Redis', 'Kafka', 'Spark', 'Snowflake', 'BigQuery', 'dbt', 'Airflow',
  'PyTorch', 'TensorFlow', 'GraphQL', 'SQL', 'iOS', 'Android', 'Flutter',
  'Figma', 'Salesforce', 'HubSpot', 'Linux', 'Git',
];

export type JobFacts = {
  salary: string | null;
  jobType: string | null;
  workplace: 'remote' | 'hybrid' | 'onsite' | null;
  years: number | null;
  skills: string[];
  locationHint: string | null;
  sourceChars: number;
};

export function stripAtsHtml(html: string | null | undefined): string {
  return cleanAtsHtml(String(html || ''));
}

export function extractJobFacts(
  source: string | null | undefined,
  opts?: { title?: string; existingTags?: string[] | null; company?: string }
): JobFacts {
  const text = stripAtsHtml(source);
  const blob = `${opts?.title || ''} ${text}`.toLowerCase();

  let salary: string | null = null;
  const sal = text.match(
    /(?:\$|USD|EUR|GBP|₹|INR)\s?[\d,]+(?:\s?[-–to]+\s?(?:\$|USD|EUR|GBP|₹|INR)?\s?[\d,]+)?(?:\s?(?:k|K|per\s+year|\/yr|a year))?/
  );
  if (sal && sal[0].length >= 4 && sal[0].length <= 80) salary = sal[0].replace(/–/g, '-').trim();

  let jobType: string | null = null;
  if (/\bfull[-\s]?time\b/i.test(blob)) jobType = 'full_time';
  else if (/\bpart[-\s]?time\b/i.test(blob)) jobType = 'part_time';
  else if (/\bcontract\b|\bfreelance\b/i.test(blob)) jobType = /\bfreelance\b/i.test(blob) ? 'freelance' : 'contract';
  else if (/\bintern(?:ship)?\b/i.test(blob)) jobType = 'internship';

  let workplace: JobFacts['workplace'] = null;
  if (/\bhybrid\b/i.test(blob)) workplace = 'hybrid';
  else if (/\b(remote|work from home|\bwfh\b|distributed)\b/i.test(blob)) workplace = 'remote';
  else if (/\b(onsite|on-site|in-office)\b/i.test(blob)) workplace = 'onsite';

  let years: number | null = null;
  const ym = blob.match(/\b(\d{1,2})\s*\+?\s*years?\b/);
  if (ym) {
    const n = Number(ym[1]);
    if (n >= 1 && n <= 40) years = n;
  }

  const found: string[] = [];
  for (const skill of SKILL_LEXICON) {
    const re = new RegExp(`\\b${skill.replace(/[.+]/g, '\\$&')}\\b`, 'i');
    if (re.test(blob)) found.push(skill);
  }

  return {
    salary,
    jobType,
    workplace,
    years,
    skills: filterMeaningfulSkillTags([...found, ...(opts?.existingTags || [])], {
      companyName: opts?.company,
    }),
    locationHint: null,
    sourceChars: text.length,
  };
}

export function mergeLocation(existing: string | null | undefined, workplace: JobFacts['workplace']): string | null {
  const cur = String(existing || '').trim();
  if (workplace === 'remote' && cur && !/\bremote\b/i.test(cur)) return `${cur} (Remote)`;
  if (workplace === 'hybrid' && cur && !/\bhybrid\b/i.test(cur)) return `${cur} (Hybrid)`;
  return cur || (workplace === 'remote' ? 'Remote' : null);
}
