/**
 * Storage-time job description cleanup (mirrors src/lib/job-description.ts).
 * Display formatting happens at render; this only strips banned footer copy.
 */

const STRIP_PATTERNS = [
  /<p>\s*<em>\s*Applications close around[\s\S]*?<\/em>\s*<\/p>/gi,
  /<em>\s*Applications close around[\s\S]*?<\/em>/gi,
  /Applications close around[^.<\n]*(?:\(per [^)]+\))?\.?\s*(?:Apply on [^.]+\.\s*)?(?:this page is a readable summary on CVin\.Bio\.?\s*)?/gi,
  /this page is a readable summary on CVin\.Bio\.?/gi,
  /\(per Google posting\)/gi,
  /Apply on Google Careers\s*[-–]?\s*/gi,
  /Apply via CVin\.Bio\.?/gi,
  /Continue to the official posting[^\n.]*/gi,
  /Full description is on the company careers page\.?/gi,
];

export function stripAggregatorDisclaimers(text) {
  if (!text) return '';
  let s = String(text);
  for (const re of STRIP_PATTERNS) s = s.replace(re, '');
  return s
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Normalize before upsert — never append CVin.Bio / aggregator footers. */
export function normalizeJobDescriptionForStorage(description) {
  if (!description) return description ?? null;
  const cleaned = stripAggregatorDisclaimers(description);
  if (!cleaned) return null;
  return cleaned.length > 12000 ? cleaned.slice(0, 12000) : cleaned;
}
