/**
 * Public company copy. Never publish raw Wikipedia / encyclopedia dumps.
 * Hand-written company-data blurbs first; otherwise an original hiring note.
 */
import { getCompanyMeta } from '@/lib/company-data';
import { toCompanyKey, companyDisplayName } from '@/lib/company-directory';
import companyDescriptions from '@/lib/company-descriptions.json';

const DESCRIPTIONS = companyDescriptions as Record<string, string>;

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
  return false;
}

function lookupCachedBlurb(slugOrName: string): string | null {
  const key = toCompanyKey(slugOrName);
  const compact = key.replace(/-/g, '');
  const raw = String(slugOrName || '').trim().toLowerCase();
  for (const candidate of [raw, key, compact]) {
    if (!candidate) continue;
    const text = String(DESCRIPTIONS[candidate] || '').trim();
    if (looksLikeEncyclopediaDump(text) || looksLikeWikipediaLede(text)) continue;
    return text;
  }
  return null;
}

/**
 * Original, publishable company about. Prefers curated company-data copy.
 * Cached JSON is used only when it does not look like Wikipedia or a scraped JD.
 */
export function publishableCompanyAbout(slugOrName: string): string | null {
  const key = toCompanyKey(slugOrName);
  const compact = key.replace(/-/g, '');
  const meta = (key && getCompanyMeta(key)) || (compact && getCompanyMeta(compact)) || null;
  const fromMeta = String(meta?.description || '').trim();
  if (fromMeta.length > 40 && !looksLikeEncyclopediaDump(fromMeta)) return fromMeta;

  const cached = lookupCachedBlurb(slugOrName);
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
export function companyAboutForJob(
  companyName: string,
  opts?: { title?: string; location?: string; slug?: string }
): string {
  return (
    publishableCompanyAbout(opts?.slug || companyName) ||
    originalHiringAbout(companyName, { title: opts?.title, location: opts?.location })
  );
}
