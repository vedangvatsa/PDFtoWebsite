/**
 * Mandatory publish-time cleanup (see /noslop.md and docs/ARTICLE_GUIDELINES.md).
 *
 * Every user-facing string that we render or upsert should pass through
 * cleanPublishText (plain) or cleanPublishHtml (HTML bodies).
 */

/** Typographic junk → plain ASCII-friendly forms */
const PUNCT_REPLACEMENTS: Array<[RegExp, string]> = [
  [/—/g, ' - '], // em dash
  [/–/g, '-'], // en dash
  [/−/g, '-'], // minus
  [/…/g, '...'],
  [/\u00A0/g, ' '], // nbsp
  [/[“”„‟]/g, '"'],
  [/[‘’‚‛]/g, "'"],
  [/•/g, '-'],
  [/·/g, '-'],
  [/\u200B|\u200C|\u200D|\uFEFF/g, ''], // zero-width
];

/** Soft AI/marketing filler phrases we strip only in our own copy helpers */
const FILLER_PHRASES: Array<[RegExp, string]> = [
  [/\bIn today'?s fast[- ]paced (?:digital )?world,?\s*/gi, ''],
  [/\bIt is important to note that\s+/gi, ''],
  [/\bAt the end of the day,?\s*/gi, ''],
];

export type NoslopReport = {
  changed: boolean;
  emDashes: number;
  enDashes: number;
  curlyQuotes: number;
  ellipses: number;
};

export function auditPublishText(input: string): NoslopReport {
  return {
    changed: false,
    emDashes: (input.match(/—/g) || []).length,
    enDashes: (input.match(/–/g) || []).length,
    curlyQuotes: (input.match(/[“”„‟‘’‚‛]/g) || []).length,
    ellipses: (input.match(/…/g) || []).length,
  };
}

/**
 * Clean plain text for publish. Safe for titles, meta, UI strings, Telegram.
 */
export function cleanPublishText(
  input: string | null | undefined,
  opts?: { stripFiller?: boolean }
): string {
  if (!input) return '';
  let s = String(input);

  for (const [re, rep] of PUNCT_REPLACEMENTS) {
    s = s.replace(re, rep);
  }

  // HTML entity forms that often sneak into scraped JDs
  s = s
    .replace(/&mdash;/gi, ' - ')
    .replace(/&ndash;/gi, '-')
    .replace(/&#8212;/g, ' - ')
    .replace(/&#8211;/g, '-')
    .replace(/&#x2014;/gi, ' - ')
    .replace(/&#x2013;/gi, '-')
    .replace(/&hellip;/gi, '...')
    .replace(/&#8230;/g, '...')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&lsquo;|&rsquo;/gi, "'");

  if (opts?.stripFiller) {
    for (const [re, rep] of FILLER_PHRASES) {
      s = s.replace(re, rep);
    }
  }

  // Collapse whitespace left by dash rewrites
  s = s
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +\./g, '.')
    .replace(/ +,/g, ',')
    .trim();

  return s;
}

/**
 * Clean HTML job bodies while preserving tags.
 * Only rewrites text nodes / entity soup outside of tags is handled via global replaces
 * that avoid breaking attributes (we only touch known punctuation codepoints).
 */
export function cleanPublishHtml(input: string | null | undefined): string {
  if (!input) return '';
  let s = String(input);

  // Entity forms first
  s = s
    .replace(/&mdash;/gi, ' - ')
    .replace(/&ndash;/gi, '-')
    .replace(/&#8212;/g, ' - ')
    .replace(/&#8211;/g, '-')
    .replace(/&#x2014;/gi, ' - ')
    .replace(/&#x2013;/gi, '-')
    .replace(/&hellip;/gi, '...')
    .replace(/&#8230;/g, '...')
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&lsquo;|&rsquo;/gi, "'");

  // Unicode punctuation (safe in text and attributes for dash/quote chars)
  for (const [re, rep] of PUNCT_REPLACEMENTS) {
    s = s.replace(re, rep);
  }

  // Tighten "word - word" double spaces
  s = s.replace(/[ \t]{2,}/g, ' ');
  return s;
}

/** True if text still contains banned punctuation. */
export function hasPublishSlop(input: string | null | undefined): boolean {
  if (!input) return false;
  return /[—–…]|[“”„‟‘’‚‛]/.test(input);
}
