/**
 * Filter job `tags` down to skills recruiters care about (company pages, FAQs).
 * Job rows may also carry category/source labels — those are not skills.
 */

const SKILL_TAG_BLOCKLIST = new Set([
  'internship',
  'full time',
  'part time',
  'contract',
  'freelance',
  'remote',
  'hybrid',
  'onsite',
  'on-site',
  'on site',
  'india',
  'usa',
  'uk',
  'europe',
  'delhi',
  'government',
  'defence',
  'defense',
  'aicte',
  'nios',
  'mospi',
  'niti aayog',
  'niti',
  'aayog',
  'general',
  'operations',
  'sales',
  'marketing',
  'hiring',
  'curated',
  'curated-jd',
  'curated job',
]);

function normalizeTag(tag: string): string {
  return tag.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function isMeaningfulSkillTag(
  tag: string,
  opts?: { companyName?: string }
): boolean {
  const n = normalizeTag(tag);
  if (!n || n.length < 2 || n.length > 40) return false;
  if (SKILL_TAG_BLOCKLIST.has(n)) return false;

  const company = opts?.companyName ? normalizeTag(opts.companyName) : '';
  if (company && (n === company || company.includes(n) || n.includes(company))) {
    return false;
  }

  // Single-word country / region names that slipped through
  if (/^(india|delhi|mumbai|bangalore|bengaluru|hyderabad|pune|chennai)$/i.test(n)) {
    return false;
  }

  return true;
}

export function filterMeaningfulSkillTags(
  tags: string[] | null | undefined,
  opts?: { companyName?: string }
): string[] {
  if (!tags?.length) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const tag of tags) {
    if (!isMeaningfulSkillTag(tag, opts)) continue;
    const key = normalizeTag(tag);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out;
}

export function topSkillTagsFromJobs(
  jobs: Array<{ tags?: string[] | null }>,
  opts?: { companyName?: string },
  limit = 8
): string[] {
  const skillCount: Record<string, number> = {};
  const display: Record<string, string> = {};

  for (const job of jobs) {
    for (const tag of filterMeaningfulSkillTags(job.tags, opts)) {
      const key = normalizeTag(tag);
      skillCount[key] = (skillCount[key] || 0) + 1;
      display[key] = display[key] || tag;
    }
  }

  return Object.entries(skillCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => display[key]);
}
