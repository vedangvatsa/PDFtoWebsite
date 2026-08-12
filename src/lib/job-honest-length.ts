/**
 * Reach 600 words with real content: the model's honest restatement plus
 * curated blocks woven into the page flow — "About this type of role" (after
 * About the role), "Typical interview steps" (before Practical notes),
 * "Career growth" (at the end), plus "About the company" and "About the
 * location". Role-family classification keeps the general content relevant.
 * No CVin.Bio advice boilerplate, no fabrication.
 */
import { publishableCompanyAbout } from '@/lib/company-about';
import { companyDisplayName } from '@/lib/company-directory';
import { jobDescriptionWordCount, JOB_INDEXABLE_MIN_WORDS } from '@/lib/job-description';
import CITY_DESCRIPTIONS from '@/lib/city-descriptions';
import { generalBlocksFor } from '@/lib/general-content';
import { getCitySlug } from '@/lib/utils';

function words(text: string): number {
  return jobDescriptionWordCount(text);
}

export type HonestLengthInput = {
  id?: string | null;
  title?: string | null;
  company?: string | null;
  location?: string | null;
  tags?: string[] | null;
};

/** Curated city paragraph for a location string, when one exists. */
function cityDescriptionFor(location?: string | null): string | null {
  const loc = String(location || '').trim();
  if (!loc) return null;
  const slug = getCitySlug(loc);
  if (CITY_DESCRIPTIONS[slug]) return CITY_DESCRIPTIONS[slug];
  const first = slug.split('-')[0];
  if (CITY_DESCRIPTIONS[first]) return CITY_DESCRIPTIONS[first];
  if (first === 'bengaluru' && CITY_DESCRIPTIONS['bangalore']) return CITY_DESCRIPTIONS['bangalore'];
  return null;
}

const ALL_HEADINGS = [
  'About the role',
  'Key facts',
  "What you'll do",
  'Requirements',
  'Nice to have',
  'Skills & tools',
  'Practical notes',
  'Good to know',
  'About the company',
  'About the location',
  'About this type of role',
  'Typical interview steps',
  'Career growth',
];

function isHeading(line: string): boolean {
  const t = line.trim();
  return ALL_HEADINGS.some((h) => t.toLowerCase() === h.toLowerCase());
}

/** Insert a section at the end of the section that follows `afterHeading`
 * (i.e. right before the next heading line), or at the end if absent. */
function insertAfter(text: string, afterHeading: string, heading: string, body: string): string {
  const lines = String(text || '').split('\n');
  let pos = lines.length;
  let seen = -1;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t.toLowerCase() === afterHeading.toLowerCase()) {
      seen = i;
      pos = lines.length;
      continue;
    }
    if (seen >= 0 && isHeading(lines[i])) {
      pos = i;
      break;
    }
  }
  const block = `${heading}\n${body}`;
  if (pos >= lines.length) {
    return `${lines.join('\n')}\n\n${block}`.trim();
  }
  lines.splice(pos, 0, '', block);
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function ensureHonestMinWords(
  draft: string,
  job: HonestLengthInput,
  minWords = JOB_INDEXABLE_MIN_WORDS
): { text: string; wordCount: number; reached: boolean; added: string[] } {
  const company = companyDisplayName(job.company || '') || String(job.company || 'the company');
  const added: string[] = [];
  let text = String(draft || '').trim();

  const general = generalBlocksFor(job);
  const placements: Array<[string, string, string]> = [
    ['About the role', general[0]?.heading || 'About this type of role', general[0]?.body || ''],
    ['Practical notes', general[1]?.heading || 'Typical interview steps', general[1]?.body || ''],
    ['Good to know', general[2]?.heading || 'Career growth', general[2]?.body || ''],
    ['Good to know', general[3]?.heading || 'Questions to ask', general[3]?.body || ''],
  ];

  for (const [after, heading, body] of placements) {
    if (words(text) >= minWords) break;
    if (!body || text.includes(body.slice(0, 48))) continue;
    text = insertAfter(text, after, heading, body);
    added.push(heading);
  }

  const about = publishableCompanyAbout(company);
  if (about && !new RegExp(about.slice(0, 40).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(text)) {
    if (words(text) < minWords) {
      text = `${text}\n\nAbout the company\n${about}`.trim();
      added.push('About the company');
    }
  }
  const city = cityDescriptionFor(job.location);
  if (city && !text.includes(city.slice(0, 48))) {
    if (words(text) < minWords) {
      text = `${text}\n\nAbout the location\n${city}`.trim();
      added.push('About the location');
    }
  }

  const wordCount = words(text);
  return { text, wordCount, reached: wordCount >= minWords, added };
}
