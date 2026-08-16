/**
 * Ingest keeps the full ATS posting (HTML → structured text), not a 5k digest
 * and not a fact-sheet summary. Enrich paraphrases from this body later.
 */
export const INGEST_DESC_MAX = 50_000;

export function htmlToIngestText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<h[1-6][^>]*>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<\/(ul|ol|div|section|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Prefer full HTML (lists/headings kept) over truncated plain. Never 5k-cut. */
export function ingestSourceDescription({ html, plain } = {}) {
  const fromHtml = htmlToIngestText(html);
  const fromPlain = String(plain || '')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
  const text = fromHtml.length >= fromPlain.length ? fromHtml : fromPlain;
  if (!text) return '';
  return text.length > INGEST_DESC_MAX ? text.slice(0, INGEST_DESC_MAX) : text;
}
