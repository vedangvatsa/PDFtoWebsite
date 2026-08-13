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

function looksLikeEncyclopediaDump(text: string): boolean {
  const t = String(text || '').trim();
  if (t.length < 40) return true;
  // Full wiki articles, not a company blurb
  if (t.length > 900) return true;
  if (ENCYCLOPEDIA_DUMP_RE.test(t)) return true;
  if (/\n\s*History\s*\n/i.test(t)) return true;
  // Scraped JD fragments parked in the company cache
  if (/\b(about the role|compensation and benefits|what you.?ll do|requirements:)\b/i.test(t)) {
    return true;
  }
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
  return looksLikeEncyclopediaDump(text) || looksLikeWikipediaLede(text);
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
  if (fromMeta.length > 40 && !looksLikeEncyclopediaDump(fromMeta)) return fromMeta;

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
