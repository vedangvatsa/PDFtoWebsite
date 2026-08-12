/**
 * Publish law for job pages. Fail closed.
 * noslop.md + docs/JD_PARAPHRASE_RULES.md + no invented facts + no ATS copy.
 */
import { hasPublishSlop, hasBannedSlopLexicon } from '@/lib/noslop';
import { jobDescriptionPlainText, jobDescriptionWordCount, JOB_INDEXABLE_MIN_WORDS } from '@/lib/job-description';
import { looksLikeOwnedJobCopy, looksLikeRawAts } from '@/lib/job-assemble';
import { filterMeaningfulSkillTags } from '@/lib/job-skill-tags';
import { assessOriginality } from '@/lib/job-originality';
import { assessAdequacy, sectionWordCount } from '@/lib/job-adequacy';

const REQUIRED_INDEX_HEADINGS = [
  'About the role',
  'Key facts',
  "What you'll do",
  'Requirements',
  'Practical notes',
];

const PLACEHOLDER_RE =
  /\[placeholder\]|lorem ipsum|todo:\s*add|\[company name\]|\[job title\]|your (?:company|team) here|not specified in source|not (?:specified|stated)(?:\.|\b)|to be determined|\btbd\b|\bn\/a\b/i;

const EXTRA_SLOP_RE =
  /\b(unlock your potential|in today's (?:fast[- ]paced )?(?:digital )?world|it's worth noting|at the end of the day|when it comes to|let's dive in|passionate)\b/i;

export type PublishGateResult = {
  ok: boolean;
  indexable: boolean;
  reasons: string[];
  wordCount: number;
};

export function evaluatePublishGates(opts: {
  text: string | null | undefined;
  sourceText?: string | null;
  /** Paraphrase only. Owned apply/listing appends must not be scored against ATS. */
  originalityText?: string | null;
  company?: string | null;
  title?: string | null;
  /** Structured salary (salary_min/max) — real facts even when ATS omits them. */
  salary?: string | null;
  mode: 'index' | 'stub';
}): PublishGateResult {
  const reasons: string[] = [];
  const plain = jobDescriptionPlainText(opts.text);
  const wordCount = jobDescriptionWordCount(plain);

  if (!plain) reasons.push('empty');
  if (PLACEHOLDER_RE.test(plain)) reasons.push('placeholder');
  if (hasPublishSlop(plain)) reasons.push('noslop_punct');
  // Lexicon slop is only model-added slop: the employer's own wording is kept
  // per noslop.md, so restating a source word is not a fail.
  const srcPlain = jobDescriptionPlainText(opts.sourceText || '');
  const modelSlop =
    (hasBannedSlopLexicon(plain) && !hasBannedSlopLexicon(srcPlain)) ||
    (EXTRA_SLOP_RE.test(plain) && !EXTRA_SLOP_RE.test(srcPlain));
  if (modelSlop) reasons.push('noslop_lexicon');

  if (opts.mode === 'index') {
    if (wordCount < JOB_INDEXABLE_MIN_WORDS) reasons.push('short');
    if (wordCount > 980) reasons.push('long');
    for (const h of REQUIRED_INDEX_HEADINGS) {
      const re = new RegExp(h.replace(/'/g, "'?"), 'i');
      if (!re.test(plain)) reasons.push(`missing_heading:${h}`);
    }
    if (looksLikeRawAts(plain) && !looksLikeOwnedJobCopy(plain)) reasons.push('raw_ats');
    if (!looksLikeOwnedJobCopy(plain)) reasons.push('not_owned_format');
    const srcWords = String(opts.sourceText || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    const dutyMin = srcWords && srcWords < 200 ? 8 : 40;
    const reqMin = srcWords && srcWords < 200 ? 6 : 20;
    if (sectionWordCount(opts.text || '', "What you'll do") < dutyMin) reasons.push('thin_duties');
    if (sectionWordCount(opts.text || '', 'Requirements') < reqMin) reasons.push('thin_requirements');
    if (hasRobotRhythm(plain)) reasons.push('robot_rhythm');
    if (vagueReferentCount(plain) >= 2) reasons.push('vague_duties');
    if (opts.sourceText) {
      const scored = opts.originalityText ?? plain;
      const origin = assessOriginality(scored, opts.sourceText, {
        company: opts.company,
        title: opts.title,
      });
      if (!origin.ok) reasons.push(...origin.reasons);
      const adequacy = assessAdequacy(scored, opts.sourceText, {
        allowedMoney: opts.salary ? [opts.salary] : [],
      });
      if (!adequacy.ok) reasons.push(...adequacy.reasons);
    }
  }

  const ok = reasons.length === 0;
  return {
    ok,
    indexable: ok && opts.mode === 'index',
    reasons,
    wordCount,
  };
}

export function sanitizeJobTags(
  tags: unknown,
  opts?: { companyName?: string; extra?: string[] }
): string[] {
  const base = Array.isArray(tags) ? tags.map(String) : [];
  const extra = opts?.extra || [];
  return filterMeaningfulSkillTags([...base, ...extra], { companyName: opts?.companyName });
}

function hasFabricationMarkers(text: string | null | undefined): boolean {
  return PLACEHOLDER_RE.test(String(text || ''));
}

/** ≥3 sentences in one section starting with the same 3-word opener (e.g.
 * "This matters to…") is padded robot rhythm and must not publish. */
function hasRobotRhythm(text: string): boolean {
  const s = String(text || '');
  const sections = s.split(/\n{2,}/);
  for (const sec of sections) {
    const openers = new Map<string, number>();
    for (const sent of sec.split(/(?<=[.!?])\s+|\n+/)) {
      const t = sent.trim();
      const m = t.match(/^([a-z][a-z0-9]{0,8}(?:\s+[a-z][a-z0-9]{0,8}){0,2})\b/i);
      if (!m || t.length < 30) continue;
      const opener = m[1].toLowerCase();
      openers.set(opener, (openers.get(opener) || 0) + 1);
      if (openers.get(opener)! >= 3) return true;
    }
  }
  return false;
}

/** Sentences that open on a vague referent ("These solutions…", "This ensures…",
 * "It supports…") say nothing concrete. Two or more = padded mush. */
const VAGUE_OPENER_RE =
  /^(this|these|that|those|it|they|such|which|so|as)\s+(solutions?|systems?|tooling|ownership|approach|work|things?|areas?|tasks?|efforts?|is|are|was|were|ensures?|helps?|supports?|means?|allows?|keeps?|drives?|guarantees?|provides?|makes?|gives?|creates?|covers?|ownership|aligned)\b/i;

function vagueReferentCount(text: string): number {
  let n = 0;
  for (const sent of String(text || '').split(/(?<=[.!?])\s+|\n+/)) {
    const t = sent.trim();
    if (t.length < 30) continue;
    if (VAGUE_OPENER_RE.test(t)) n += 1;
  }
  return n;
}
