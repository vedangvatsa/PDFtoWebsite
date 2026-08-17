/**
 * Copy-gate pivot slop: broken tags (`< specifically p>`), corrupted entities
 * (`& notably nbsp;`), and stuffed filler words (specifically/notably/meanwhile).
 * Mirrors src/lib/job-description.ts stripMechanicalPivotSlop.
 */

const MECHANICAL_PIVOT_WORD = /\b(specifically|notably|meanwhile)\b/gi;

export const BROKEN_PIVOT_TAG_RE =
  /<\s*(specifically|notably|meanwhile)\s+[a-z][a-z0-9]*(\s[^>]*)?>/i;
export const BROKEN_PIVOT_ENTITY_RE =
  /&\s*(specifically|notably|meanwhile)\s+[a-z]+;/i;

/** True when copy-gate pivot words were stuffed into the body to dodge overlap checks. */
export function looksLikeMechanicalPivotSlop(text) {
  const raw = String(text || '');
  const words = raw.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  if (words < 200) return false;
  const pivots = (raw.match(MECHANICAL_PIVOT_WORD) || []).length;
  const pivotCycle = (
    raw.match(/\bspecifically\b[\s\S]{0,120}?\bnotably\b[\s\S]{0,120}?\bmeanwhile\b/gi) || []
  ).length;
  if (pivots >= 8 && pivots / words >= 0.01) return true;
  if (pivotCycle >= 2) return true;
  return false;
}

/** Any visible corruption from pivot insertion (broken markup or dense filler). */
export function hasMechanicalPivotCorruption(text) {
  const raw = String(text || '');
  if (!raw.trim()) return false;
  if (BROKEN_PIVOT_TAG_RE.test(raw)) return true;
  if (BROKEN_PIVOT_ENTITY_RE.test(raw)) return true;
  if (looksLikeMechanicalPivotSlop(raw)) return true;
  return false;
}

function repairMechanicalPivotMarkup(html) {
  let s = String(html || '');
  s = s.replace(
    /<\s*(specifically|notably|meanwhile)\s+([a-z][a-z0-9]*)(\s[^>]*)?>/gi,
    '<$2$3>'
  );
  s = s.replace(
    /<\s*\/\s*(specifically|notably|meanwhile)\s+([a-z][a-z0-9]*)\s*>/gi,
    '</$2>'
  );
  s = s.replace(/&\s*(specifically|notably|meanwhile)\s+([a-z]+);/gi, '&$2;');
  s = s.replace(/([a-z0-9])<(?![/]?[a-z])/gi, '$1');
  return s;
}

function stripMechanicalPivotWords(text) {
  return String(text || '')
    .replace(MECHANICAL_PIVOT_WORD, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([(\[{])\s+/g, '$1')
    .replace(/\s+([)\]}])/g, '$1')
    .replace(/-\s+/g, '-')
    .replace(/\s+-/g, '-')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Strip copy-gate pivot slop from stored JDs (broken markup + stuffed filler words). */
export function stripMechanicalPivotSlop(text) {
  if (!text) return '';
  let s = repairMechanicalPivotMarkup(text);
  if (looksLikeMechanicalPivotSlop(s)) {
    s = stripMechanicalPivotWords(s);
  }
  return s;
}
