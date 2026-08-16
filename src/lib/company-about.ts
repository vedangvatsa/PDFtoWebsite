/**
 * Public company copy. Never publish raw Wikipedia / encyclopedia dumps.
 * Hand-written company-data blurbs first; otherwise an original hiring note.
 */
import { getCompanyMeta } from '@/lib/company-data';
import { toCompanyKey, companyDisplayName } from '@/lib/company-directory';
// Lazy-loaded to avoid bundling 2.4MB JSON into every server function
let _descriptions: Record<string, string> | null = null;
async function getDescriptions(): Promise<Record<string, string>> {
  if (!_descriptions) {
    const mod = await import('@/lib/company-descriptions.json');
    _descriptions = mod.default as Record<string, string>;
  }
  return _descriptions;
}

/** Encyclopedia / wiki residue that must never reach a public page. */
const ENCYCLOPEDIA_DUMP_RE =
  /\b(see also|external links|disambiguation|may refer to|further reading|references)\b|\(\s*,\s*[A-Z]{2,}[-\s]|Pages displaying short descriptions|\[\d{1,3}\]|^\s*Year \d{3,4}\b/i;

const JD_FRAGMENT_RE =
  /\b(about the role|compensation and benefits|what you.?ll do|requirements:|preferred qualifications|job openings at|how we work|ramp quota|is seeking|are seeking|we are looking for|we.?re looking for|we are seeking|study overview|join our high-performing)\b/i;

const WRONG_ENTITY_RE =
  /\bis (?:a|an) (?:masculine|feminine) given name\b|\bis the most populous (?:city|municipality)\b|\bis (?:a|an) (?:alchemical still|punk song)\b|\bown this domain\b|\bextraordinary domain names\b/i;

const PROMPT_LEAK_RE = /\b(?:constraint check|90 words range|starts with ")\b/i;

function normalizeBlurb(text: string): string {
  return String(text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u200b\u200c\u200d\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeEncyclopediaDump(text: string): boolean {
  const raw = String(text || '').trim();
  const t = normalizeBlurb(text);
  if (t.length < 120) return true;
  // Full wiki articles, not a company blurb
  if (t.length > 900) return true;
  if (ENCYCLOPEDIA_DUMP_RE.test(raw)) return true;
  if (/\n\s*History\s*\n/i.test(raw)) return true;
  if (JD_FRAGMENT_RE.test(t)) return true;
  if (/<[^>]+>|\[&hellip;\]|&hellip;/i.test(t)) return true;
  if (/\b(?:this )?domain (?:may be )?for sale\b|\bis available for sale\b/i.test(t)) return true;
  if (/\bis (?:a surname|both a surname|a given name)\b/i.test(t)) return true;
  if (WRONG_ENTITY_RE.test(t)) return true;
  if (PROMPT_LEAK_RE.test(t)) return true;
  if (/https?:\/\//i.test(t) || /\bwww\./i.test(t)) return true;
  return false;
}

/** Cut-off scrape: mid-word, no sentence end, or a continuation fragment. */
function looksLikeTruncatedBlurb(text: string): boolean {
  const t = normalizeBlurb(text);
  if (!t) return true;
  if (t.length < 120) return true;
  const stripped = t.replace(/["')\]]+$/g, '');
  if (!/[.!?]$/.test(stripped)) return true;
  if (/^[a-z•*]/.test(t)) return true;
  return false;
}

/** First-person careers-page paste, not original hub copy. */
function looksLikeScrapedFirstPerson(text: string): boolean {
  const t = normalizeBlurb(text);
  if (/^(?:we|we[’']re|we[’']ve)\b/i.test(t)) return true;
  if (/\bwe.?re people who\b/i.test(t)) return true;
  return false;
}

/** Typical Wikipedia first-sentence shape — do not publish from the JSON cache. */
function looksLikeWikipediaLede(text: string): boolean {
  const t = String(text || '').trim();
  if (/\bis an? (?:American|British|Canadian|French|German|Indian|Australian|Irish|Dutch|Swedish|Japanese|Chinese|multinational)\b/i.test(t)) {
    return true;
  }
  if (/\bheadquartered in\b/i.test(t) && /\b(founded|established) in\b/i.test(t)) return true;
  if (/\bis a (?:password manager|visual discovery engine|monitoring and security platform|connected workspace)\b/i.test(t)) {
    return true;
  }
  if (/\bdeveloped by the (?:American|British|Canadian|French|German)\b/i.test(t)) return true;
  if (/\bwe work remotely\b/i.test(t) && /\b(advanced job search|find your next remote career)\b/i.test(t)) {
    return true;
  }
  if (/\badvanced job search for we work remotely\b/i.test(t)) return true;
  if (
    /\bwe work remotely\b/i.test(t) &&
    /\b(programming|marketing|customer service)\b/i.test(t) &&
    /\b(search|refine|explore|filter)\b/i.test(t)
  ) {
    return true;
  }
  return false;
}

/** True when cached JSON / wiki residue must not be shown as company about. */
export function isUnpublishableCompanyBlurb(text: string): boolean {
  return (
    looksLikeEncyclopediaDump(text) ||
    looksLikeWikipediaLede(text) ||
    looksLikeTruncatedBlurb(text) ||
    looksLikeScrapedFirstPerson(text)
  );
}

async function lookupCachedBlurb(slugOrName: string): Promise<string | null> {
  const key = toCompanyKey(slugOrName);
  const compact = key.replace(/-/g, '');
  const raw = String(slugOrName || '').trim().toLowerCase();
  const descriptions = await getDescriptions();
  for (const candidate of [raw, key, compact]) {
    if (!candidate) continue;
    const text = String(descriptions[candidate] || '').trim();
    if (isUnpublishableCompanyBlurb(text)) continue;
    return text;
  }
  return null;
}

/**
 * True when we still know this company well enough to keep `/{slug}` as a hub
 * even if Wikipedia-shaped cache copy is not publishable.
 */
export async function companyHasCachedProfile(slugOrName: string): Promise<boolean> {
  const key = toCompanyKey(slugOrName);
  const compact = key.replace(/-/g, '');
  const raw = String(slugOrName || '').trim().toLowerCase();
  if ((key && getCompanyMeta(key)) || (compact && getCompanyMeta(compact))) return true;
  const descriptions = await getDescriptions();
  for (const candidate of [raw, key, compact]) {
    if (candidate && descriptions[candidate]) return true;
  }
  return false;
}

/**
 * Original, publishable company about. Prefers curated company-data copy.
 * Cached JSON is used only when it does not look like Wikipedia or a scraped JD.
 */
export async function publishableCompanyAbout(slugOrName: string): Promise<string | null> {
  const key = toCompanyKey(slugOrName);
  const compact = key.replace(/-/g, '');
  const meta = (key && getCompanyMeta(key)) || (compact && getCompanyMeta(compact)) || null;
  const fromMeta = String(meta?.description || '').trim();
  if (
    fromMeta.length >= 120 &&
    !looksLikeEncyclopediaDump(fromMeta) &&
    !looksLikeTruncatedBlurb(fromMeta)
  ) {
    return fromMeta;
  }

  const cached = await lookupCachedBlurb(slugOrName);
  if (cached) return cached;
  return null;
}

/** Always-original fallback when we have no curated blurb. */
function originalHiringAbout(
  companyName: string,
  opts?: { title?: string; location?: string; roleCount?: number }
): string {
  const name = companyDisplayName(companyName) || companyName;
  const title = String(opts?.title || '').trim();
  const location = String(opts?.location || '').trim();
  const roles = opts?.roleCount;
  const roleBit =
    typeof roles === 'number' && roles > 0
      ? ` ${name} currently lists ${roles} open ${roles === 1 ? 'role' : 'roles'}.`
      : '';
  if (title) {
    return `${name} is hiring for ${title}.${location ? ` ${location}.` : ''}${roleBit}`.replace(
      /\s+/g,
      ' '
    ).trim();
  }
  return `${name} is actively hiring.${roleBit}${location ? ` Key locations include ${location}.` : ''}`.replace(
    /\s+/g,
    ' '
  ).trim();
}

/** Body text for a job page that has no curated JD. */
export async function companyAboutForJob(
  companyName: string,
  opts?: { title?: string; location?: string; slug?: string }
): Promise<string> {
  return (
    (await publishableCompanyAbout(opts?.slug || companyName)) ||
    originalHiringAbout(companyName, { title: opts?.title, location: opts?.location })
  );
}

/** Hub about: curated copy, else a complete hiring note. Never a cut-off scrape. */
export async function companyHubAbout(
  slug: string,
  companyName: string,
  opts?: { roleCount?: number; location?: string; remotePercent?: number; skills?: string[] }
): Promise<string> {
  const owned = await publishableCompanyAbout(slug);
  if (owned) return owned;
  const name = companyDisplayName(companyName) || companyName;
  const roles = opts?.roleCount;
  const roleBit =
    typeof roles === 'number' && roles > 0
      ? `${name} currently lists ${roles} open ${roles === 1 ? 'role' : 'roles'}.`
      : `${name} is actively hiring.`;
  const remoteBit =
    typeof opts?.remotePercent === 'number' && opts.remotePercent > 0
      ? ` ${opts.remotePercent}% of roles are remote.`
      : '';
  const loc = String(opts?.location || '').trim();
  const locBit = loc ? ` Key hiring locations include ${loc}.` : '';
  const skills = (opts?.skills || []).filter(Boolean).slice(0, 5);
  const skillBit = skills.length ? ` In-demand skills include ${skills.join(', ')}.` : '';
  return `${roleBit}${remoteBit}${locBit}${skillBit}`.replace(/\s+/g, ' ').trim();
}

const META_DESC_MAX = 160;

function firstSentence(text: string): string {
  const t = normalizeBlurb(text);
  const m = t.match(/^[\s\S]+?[.!?]/);
  return (m ? m[0] : t).trim();
}

/** Clip to max chars on a sentence, then a word. Never mid-word. */
export function clipMetaDescription(text: string, max = META_DESC_MAX): string {
  const t = normalizeBlurb(text);
  if (t.length <= max) return t;
  const slice = t.slice(0, max);
  const bound = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '));
  if (bound >= 60) return slice.slice(0, bound + 1).trim();
  const word = slice.replace(/\s+\S*$/, '').trim();
  return word || slice.trim();
}

/** Search-result description: complete sentences only. */
export function companyHubMetaDescription(input: {
  companyDisplay: string;
  jobCount: number;
  about: string | null;
}): string {
  const countBit = `${input.companyDisplay} has ${input.jobCount.toLocaleString()} open positions. Browse roles and apply.`;
  const about = String(input.about || '').trim();
  if (!about || isUnpublishableCompanyBlurb(about)) {
    return clipMetaDescription(
      `${input.companyDisplay} is hiring. ${input.jobCount.toLocaleString()} open positions. Browse active job openings with live hiring data, remote availability, and technical requirements.`
    );
  }
  const first = firstSentence(about);
  const combined = `${first} ${countBit}`.replace(/\s+/g, ' ').trim();
  if (combined.length <= META_DESC_MAX) return combined;
  if (first.length <= META_DESC_MAX) return first;
  return clipMetaDescription(first);
}
