/**
 * Fail-closed originality. A page is plagiarized if it copies or patchwrites ATS.
 * Pay, years, tools, company, and title are masked so shared facts are not theft.
 */
import { cleanPublishText } from '@/lib/noslop';

export const ORIGINALITY = {
  /** Fail if a shared contiguous run is longer than this (7+ words = copy). */
  maxCopySpan: 6,
  max5gramJaccard: 0.05,
  // Sentence gates are tuned for fact-dense ATS bullets: a faithful restatement
  // of a telegraphic requirement shares many tokens by necessity. Whole-page
  // copy_span + 5-gram remain the hard plagiarism tripwires.
  patchwriteTokenOverlap: 0.62,
  spinBigramOverlap: 0.5,
  minSentenceTokens: 10,
} as const;

const SLOT_SKILLS = [
  'python', 'javascript', 'typescript', 'java', 'kotlin', 'swift', 'golang', 'rust',
  'ruby', 'php', 'scala', 'react', 'angular', 'vue', 'django', 'flask', 'fastapi',
  'spring', 'rails', 'kubernetes', 'docker', 'terraform', 'postgresql', 'mysql',
  'mongodb', 'redis', 'kafka', 'spark', 'snowflake', 'bigquery', 'airflow',
  'pytorch', 'tensorflow', 'graphql', 'android', 'flutter', 'salesforce',
  'hubspot', 'linux', 'aws', 'gcp', 'azure', 'next.js', 'node.js',
];

export type OriginalityResult = {
  ok: boolean;
  reasons: string[];
  metrics: { copySpan: number; jaccard5: number };
};

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function tokenizeForOriginality(s: string): string[] {
  return cleanPublishText(s)
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0 && t !== 'slot');
}

/** Replace immutable facts so they do not count as copied prose. */
export function maskImmutableSlots(
  text: string,
  opts?: { company?: string | null; title?: string | null; extra?: string[] }
): string {
  let out = String(text || '');
  out = out.replace(/\$[\d,]+(?:\.\d+)?(?:\s*(?:k|m|usd|inr|eur|gbp|per\s+year|\/yr|a year))?/gi, ' SLOT ');
  out = out.replace(/(?:USD|EUR|GBP|INR|₹)\s*[\d,]+(?:\.\d+)?/gi, ' SLOT ');
  out = out.replace(/\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b/g, ' SLOT ');
  out = out.replace(/\b\d{1,2}\s*\+?\s*years?\b/gi, ' SLOT ');
  const phrases = [opts?.company, opts?.title, ...(opts?.extra || [])].filter(
    (v): v is string => Boolean(v && String(v).trim().length >= 2)
  );
  for (const phrase of phrases) {
    out = out.replace(new RegExp(escapeRe(phrase.trim()), 'gi'), ' SLOT ');
  }
  for (const skill of SLOT_SKILLS) {
    out = out.replace(new RegExp(`\\b${escapeRe(skill)}\\b`, 'gi'), ' SLOT ');
  }
  return out;
}

function ngrams(tokens: string[], n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) out.push(tokens.slice(i, i + n).join(' '));
  return out;
}

function jaccard(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter += 1;
  const union = A.size + B.size - inter;
  return union ? inter / union : 0;
}

function contiguousCopySpan(a: string[], b: string[]): number {
  let short = a;
  let long = b;
  if (short.length > long.length) [short, long] = [long, short];
  let prev = new Array(short.length + 1).fill(0);
  let best = 0;
  for (const x of long) {
    const cur = [0];
    for (let j = 0; j < short.length; j++) {
      const v = x === short[j] ? prev[j] + 1 : 0;
      cur.push(v);
      if (v > best) best = v;
    }
    prev = cur;
  }
  return best;
}

function splitSentences(text: string): string[] {
  return String(text || '')
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 24);
}

/**
 * Fact sections carry the employer's requirements as telegraphic facts; a
 * faithful restatement of a fact shares most of its tokens by necessity.
 * Originality gates apply to PROSE (About the role, What you'll do, Skills &
 * tools, Practical notes). Facts are policed by adequacy/truth gates instead.
 */
const FACT_SECTIONS = new Set(['key facts', 'requirements', 'nice to have']);
const HEADING_RE =
  /^(about the role|key facts|what you['’]?ll do|requirements|nice to have|skills & tools|practical notes|about the company|how to apply|about this listing|after you apply|apply notes|how we write this page|what this page is not|before you apply)$/i;

/** Drop fact-section lines from a text so they never count as copied prose. */
export function proseOnly(text: string): string {
  let section = '';
  const out: string[] = [];
  for (const line of String(text || '').split('\n')) {
    const t = line.trim();
    if (HEADING_RE.test(t)) {
      section = t.toLowerCase();
      continue;
    }
    if (!section || !FACT_SECTIONS.has(section)) out.push(line);
  }
  return out.join('\n');
}

function uniq(xs: string[]): string[] {
  return [...new Set(xs)];
}

/**
 * Compare draft to cleaned ATS. Empty source → skipped (ok), caller decides.
 * When source exists, any hit fails closed. Whole-page copy/jaccard and
 * sentence gates run on prose sections only; fact sections (Key facts,
 * Requirements, Nice to have) are covered by adequacy instead.
 */
export function assessOriginality(
  draft: string | null | undefined,
  source: string | null | undefined,
  opts?: { company?: string | null; title?: string | null; extra?: string[] }
): OriginalityResult {
  const metrics = { copySpan: 0, jaccard5: 0 };
  const src = String(source || '').trim();
  const out = String(draft || '').trim();
  if (!src || !out) return { ok: true, reasons: [], metrics };

  const dTok = tokenizeForOriginality(maskImmutableSlots(proseOnly(out), opts));
  // Source stays complete so prose copied from ANY source section is caught.
  const sTok = tokenizeForOriginality(maskImmutableSlots(src, opts));
  if (sTok.length < 8 || dTok.length < 8) return { ok: true, reasons: [], metrics };

  const reasons: string[] = [];
  metrics.copySpan = contiguousCopySpan(dTok, sTok);
  if (metrics.copySpan > ORIGINALITY.maxCopySpan) reasons.push('copy_span');

  metrics.jaccard5 = jaccard(ngrams(dTok, 5), ngrams(sTok, 5));
  if (metrics.jaccard5 > ORIGINALITY.max5gramJaccard) reasons.push('ngram_overlap');

  const srcSents = splitSentences(maskImmutableSlots(src, opts))
    .map(tokenizeForOriginality)
    .filter((t) => t.length >= ORIGINALITY.minSentenceTokens);
  const srcSets = srcSents.map((t) => new Set(t));
  const srcBis = srcSents.map((t) => new Set(ngrams(t, 2)));

  for (const sent of splitSentences(maskImmutableSlots(proseOnly(out), opts))) {
    const t = tokenizeForOriginality(sent);
    if (t.length < ORIGINALITY.minSentenceTokens) continue;
    const dBi = ngrams(t, 2);
    for (let i = 0; i < srcSents.length; i++) {
      let hit = 0;
      for (const w of t) if (srcSets[i].has(w)) hit += 1;
      if (hit / t.length > ORIGINALITY.patchwriteTokenOverlap) {
        reasons.push('patchwrite');
        break;
      }
      if (dBi.length) {
        let biHit = 0;
        for (const b of dBi) if (srcBis[i].has(b)) biHit += 1;
        if (biHit / dBi.length > ORIGINALITY.spinBigramOverlap) {
          reasons.push('synonym_spin');
          break;
        }
      }
    }
    if (reasons.includes('patchwrite') && reasons.includes('synonym_spin')) break;
  }

  const uniqueReasons = uniq(reasons);
  return { ok: uniqueReasons.length === 0, reasons: uniqueReasons, metrics };
}

function isPlagiarizedAgainstSource(
  draft: string | null | undefined,
  source: string | null | undefined,
  opts?: { company?: string | null; title?: string | null; extra?: string[] }
): boolean {
  return !assessOriginality(draft, source, opts).ok;
}

const KEEP_HEADING =
  /^(about the role|key facts|what you['’]?ll do|requirements|nice to have|skills & tools|practical notes|about the company|how to apply|about this listing|after you apply|apply notes)$/i;

/** Drop sentences that copy or patchwrite SOURCE. Headings stay. $0, no invention.
 * Fact sections (Key facts, Requirements, Nice to have) are kept as-is — their
 * lines are facts, gated by adequacy, and whole-page prose gates catch real copy. */
export function dropCopiedSentences(
  draft: string,
  source: string,
  opts?: { company?: string | null; title?: string | null; extra?: string[] }
): { text: string; dropped: number } {
  const src = String(source || '').trim();
  const lines = String(draft || '').split('\n');
  const kept: string[] = [];
  let dropped = 0;
  let section = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || KEEP_HEADING.test(trimmed)) {
      if (KEEP_HEADING.test(trimmed)) section = trimmed.toLowerCase();
      kept.push(line);
      continue;
    }
    if (FACT_SECTIONS.has(section)) {
      kept.push(line);
      continue;
    }
    const parts = splitSentences(trimmed);
    if (parts.length <= 1) {
      const origin = assessOriginality(trimmed, src, opts);
      if (!origin.ok) {
        dropped += 1;
        continue;
      }
      kept.push(line);
      continue;
    }
    const okParts = parts.filter((p) => assessOriginality(p, src, opts).ok);
    dropped += parts.length - okParts.length;
    if (okParts.length) kept.push(okParts.join(' '));
  }
  let text = kept
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Combined lines can still form a long copied span. Drop the sentence
  // whose removal cuts copy_span the most until the page passes or nothing left.
  for (let i = 0; i < 40; i++) {
    const cur = assessOriginality(text, src, opts);
    if (cur.ok) break;
    const sents = splitSentences(text).filter((s) => !KEEP_HEADING.test(s.trim()));
    if (!sents.length) break;
    let bestSent: string | null = null;
    let bestSpan = cur.metrics.copySpan;
    let bestReasons = cur.reasons.length;
    for (const sent of sents) {
      const trial = text.replace(sent, '').replace(/\n{3,}/g, '\n\n').trim();
      if (trial === text) continue;
      const next = assessOriginality(trial, src, opts);
      if (
        next.reasons.length < bestReasons ||
        (next.reasons.length === bestReasons && next.metrics.copySpan < bestSpan)
      ) {
        bestSent = sent;
        bestSpan = next.metrics.copySpan;
        bestReasons = next.reasons.length;
      }
    }
    if (!bestSent) break;
    text = text.replace(bestSent, '').replace(/\n{3,}/g, '\n\n').trim();
    dropped += 1;
  }

  return { text, dropped };
}

const SCRATCHPAD_RE =
  /\b(we need to produce|let'?s parse|let me (analyze|extract|break|think|start)|the source includes|the user wants me|i will now|i need to (extract|rewrite|analyze|parse|write)|here is my plan|my plan is|first,? (i need|let'?s|we|let me)|chain of thought|thinking process|must not invent|must not copy)\b/i;

export function looksLikeModelScratchpad(text: string): boolean {
  const t = String(text || '');
  if (SCRATCHPAD_RE.test(t.slice(0, 800))) return true;
  if (!/about the role/i.test(t) || !/what you['’]?ll do/i.test(t)) return true;
  return false;
}
