/**
 * Local A/O/H-ish gates for manual JD pages (no LLM).
 * Shared by publish-manual-jd.mjs and optional checkers.
 */
export const MIN_WORDS = 600;
export const MAX_WORDS = 900;

export function normalizeTokens(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9+\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

export function wordCount(text) {
  return String(text || '')
    .split(/\s+/)
    .filter(Boolean).length;
}

export function ngrams(tokens, n) {
  const out = [];
  for (let i = 0; i <= tokens.length - n; i++) out.push(tokens.slice(i, i + n).join(' '));
  return out;
}

export function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  if (!A.size && !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

export function contiguousLcsWords(aTokens, bTokens) {
  let a = aTokens;
  let b = bTokens;
  if (a.length > b.length) [a, b] = [b, a];
  let prev = new Array(a.length + 1).fill(0);
  let best = 0;
  for (const x of b) {
    const cur = [0];
    for (let j = 0; j < a.length; j++) {
      const v = x === a[j] ? prev[j] + 1 : 0;
      cur.push(v);
      if (v > best) best = v;
    }
    prev = cur;
  }
  return best;
}

/** First-word openers of What you'll do bullets — identical run vs source is a smell. */
export function dutyOpeners(text) {
  const m = String(text || '').match(/What you'll do\n([\s\S]*?)(?:\nRequirements\n|$)/i);
  if (!m) return [];
  return m[1]
    .split('\n')
    .filter((l) => l.startsWith('- '))
    .map((l) => l.slice(2).trim().split(/\s+/).slice(0, 2).join(' ').toLowerCase());
}

export function structureOrderScore(draft, source) {
  const a = dutyOpeners(draft);
  const b = dutyOpeners(source);
  if (a.length < 4 || b.length < 4) return { ok: true, samePrefix: 0 };
  let same = 0;
  const n = Math.min(a.length, b.length, 8);
  for (let i = 0; i < n; i++) {
    if (a[i] && b[i] && a[i] === b[i]) same++;
  }
  // Fail if first 5 openers match source order
  return { ok: same < 5, samePrefix: same };
}

export function checkManualPage(pageText, sourceText = '') {
  const text = String(pageText || '').trim();
  const fails = [];
  const warnings = [];
  const wc = wordCount(text);

  if (wc < MIN_WORDS) fails.push(`short:${wc}`);
  if (wc > MAX_WORDS) fails.push(`long:${wc}`);
  if (/[—–]/.test(text)) fails.push('em_dash');
  if (/leverage|delve into|cutting-edge|exciting opportunity|furthermore|moreover|tapestry/i.test(text)) {
    fails.push('slop');
  }
  if (!/About the role/i.test(text) || !/What you'll do/i.test(text) || !/Requirements/i.test(text)) {
    fails.push('structure');
  }
  if (/listed on CVin\.Bio|Infer reasonable responsib|invent duties|make up (duties|requirements)/i.test(text)) {
    fails.push('invent_smell');
  }

  if (sourceText && wordCount(sourceText) >= 80) {
    const d = normalizeTokens(text);
    const s = normalizeTokens(sourceText);
    const lcs = contiguousLcsWords(d, s);
    const j5 = jaccard(ngrams(d, 5), ngrams(s, 5));
    // Obligatory skill/requirement lists share long spans; hard-fail only extreme copies
    if (lcs >= 22) fails.push(`copy_span_lcs:${lcs}`);
    else if (lcs >= 12) warnings.push(`copy_span_soft:${lcs}`);
    if (j5 > 0.22) fails.push(`ngram:${j5.toFixed(3)}`);
    else if (j5 > 0.12) warnings.push(`ngram_soft:${j5.toFixed(3)}`);

    const ord = structureOrderScore(text, sourceText);
    if (!ord.ok) fails.push(`structure_order:${ord.samePrefix}`);
  }

  return { ok: fails.length === 0, fails, warnings, wordCount: wc };
}
