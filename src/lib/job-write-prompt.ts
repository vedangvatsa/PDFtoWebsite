import { readFileSync } from 'fs';
import { resolve } from 'path';
import { summarizeHardFacts } from './job-adequacy';
import { expandCountryCode } from './normalize-location';

const PROMPT_FILE = resolve(process.cwd(), 'src/lib/prompts/jd-write-system.txt');

let cached: string | null = null;

/** Canonical rewrite system prompt. Edit src/lib/prompts/jd-write-system.txt */
export function loadWriteSystemPrompt(): string {
  if (!cached) cached = readFileSync(PROMPT_FILE, 'utf8').trim();
  return cached;
}

/** Scraped job_type fields sometimes carry junk like "1+ years of experience"
 * or salary text. Employment-type strings only — junk must not leak into the
 * model's Key facts as an Engagement value. */
const JUNK_JOB_TYPE_RE =
  /(years?|months?|experience|salary|compensation|\$\s?\d|\d+\s*[-–+]\s*\d+|\bper\s+(hour|month|annum|year)\b)/i;

export function buildWriteUser(opts: {
  title?: string | null;
  company?: string | null;
  location?: string | null;
  jobType?: string | null;
  salary?: string | null;
  extraLines?: string[];
  sourceText: string;
}): string {
  const title = String(opts.title || 'this role').trim();
  const company = String(opts.company || 'the company').trim();
  const jobType = String(opts.jobType || '').trim();
  const keep = summarizeHardFacts(opts.sourceText);
  const extras = (opts.extraLines || []).filter(Boolean);
  const meta = [
    `${title} at ${company}.`,
    opts.location
      ? `Listed location: ${expandCountryCode(String(opts.location).trim())}`
      : null,
    jobType && !JUNK_JOB_TYPE_RE.test(jobType) ? `Listed job type: ${jobType}` : null,
    opts.salary ? `Listed salary field: ${opts.salary}` : null,
    extras.length ? extras.join('\n') : null,
    keep ? `KEEP (already in SOURCE, restate, do not drop):\n${keep}` : null,
    'Restate every duty and must-have from SOURCE. New sentences only. Omit empty optional sections.',
  ]
    .filter(Boolean)
    .join('\n\n');
  return `${meta}\n\nSOURCE:\n${String(opts.sourceText || '').slice(0, 12000)}`;
}
