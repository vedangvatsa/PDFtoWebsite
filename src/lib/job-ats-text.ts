/** Clean ATS HTML, including Greenhouse double-escaped markup. */

function decodeEntitiesOnce(s: string): string {
  return s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

export function parseGreenhouseExternalId(ext: string | null | undefined): {
  slug: string;
  id: string;
} | null {
  const m = String(ext || '').match(/^gh_(.+)_(\d+)$/);
  return m ? { slug: m[1], id: m[2] } : null;
}

export function sourceWordCount(text: string | null | undefined): number {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

const CVIN_STUB_RE = /listed on CVin\.Bio|original summary prepared by CVin\.Bio/i;

/** Empty/stub only. Short real ATS is allowed. */
export function usableSourceText(text: string | null | undefined, minWords = 40): boolean {
  const t = String(text || '').trim();
  if (!t || CVIN_STUB_RE.test(t)) return false;
  return sourceWordCount(t) >= minWords;
}

export function cleanAtsHtml(html: string): string {
  let s = String(html || '');
  if (/&(?:lt|gt|amp|quot|nbsp|#)/i.test(s)) {
    s = decodeEntitiesOnce(s);
    if (/&(?:lt|gt|amp|quot|nbsp|#)/i.test(s)) s = decodeEntitiesOnce(s);
  }
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
