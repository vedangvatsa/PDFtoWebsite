/**
 * Single publish pipeline for canary, enrich, and manual publish.
 * scratchpad → drop copy → inject hard facts → honest 600 → gates.
 */
import {
  assessOriginality,
  dropCopiedSentences,
  looksLikeModelScratchpad,
} from '@/lib/job-originality';
import {
  GENERAL_SECTION_RE,
  assessAdequacy,
  expandMoneyValues,
  hasDegree,
  hasVisa,
  injectSourceHardFacts,
  moneyIn,
  moneyMatches,
  yearsIn,
} from '@/lib/job-adequacy';
import { evaluatePublishGates } from '@/lib/job-publish-gates';
import { ensureHonestMinWords, type HonestLengthInput } from '@/lib/job-honest-length';
import { jobDescriptionWordCount, JOB_INDEXABLE_MIN_WORDS } from '@/lib/job-description';

export type FinalizeJob = HonestLengthInput & {
  title?: string | null;
  company?: string | null;
  salary?: string | null;
};

export type FinalizeResult = {
  ok: boolean;
  text: string;
  wordCount: number;
  reasons: string[];
  origin_ok: boolean;
  origin_reasons: string[];
  adequacy_ok: boolean;
  adequacy_reasons: string[];
  gates_ok: boolean;
  gates_indexable: boolean;
  gates_reasons: string[];
  dropped_copied_lines: number;
  copy_span: number;
  jaccard5: number;
  added: string[];
};

function stripCodeFence(text: string): string {
  return String(text || '')
    .replace(/^```(?:text|markdown|md)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

export function finalizeCuratedJd(
  rawDraft: string,
  opts: { sourceText: string; job: FinalizeJob }
): FinalizeResult {
  const source = String(opts.sourceText || '');
  const job = opts.job || {};
  const company = job.company;
  const title = job.title;
  let draft = stripCodeFence(rawDraft);

  if (looksLikeModelScratchpad(draft)) {
    return emptyResult(draft, ['model_scratchpad']);
  }

  const stripped = dropCopiedSentences(draft, source, { company, title });
  const strippedReserved = stripModelGeneralSections(stripped.text);
  const injected = injectSourceHardFacts(strippedReserved, source);
  const scrubbed = scrubGeneralSectionClaims(
    scrubPlaceholderLabels(
      scrubUnsupportedKeyFacts(injected, source, job.salary ? [job.salary] : [])
    ),
    job
  );
  const origin = assessOriginality(scrubbed, source, { company, title });
  const adequacy = assessAdequacy(scrubbed, source, {
    allowedMoney: job.salary ? [job.salary] : [],
  });
  const filled = ensureHonestMinWords(scrubbed, job);
  draft = filled.text;
  const gates = evaluatePublishGates({
    text: draft,
    sourceText: source,
    // Score the same text adequacy/originality saw (post injection, pre owned blocks).
    originalityText: scrubbed,
    company,
    title,
    salary: job.salary,
    mode: 'index',
  });
  const wordCount = jobDescriptionWordCount(draft);
  const reasons = [
    ...(!origin.ok ? origin.reasons : []),
    ...(!adequacy.ok ? adequacy.reasons : []),
    ...(!gates.ok ? gates.reasons : []),
    ...(wordCount < JOB_INDEXABLE_MIN_WORDS ? ['short'] : []),
  ];
  const unique = [...new Set(reasons)];

  return {
    ok: unique.length === 0,
    text: draft,
    wordCount,
    reasons: unique,
    origin_ok: origin.ok,
    origin_reasons: origin.reasons,
    adequacy_ok: adequacy.ok,
    adequacy_reasons: adequacy.reasons,
    gates_ok: gates.ok,
    gates_indexable: gates.indexable,
    gates_reasons: gates.reasons,
    dropped_copied_lines: stripped.dropped,
    copy_span: origin.metrics.copySpan,
    jaccard5: origin.metrics.jaccard5,
    added: filled.added,
  };
}

/** The general-info headings are pipeline-owned. If the model writes them
 * anyway, remove the section (heading + content until the next heading) so
 * the pipeline's curated version is never duplicated. */
const RESERVED_GENERAL_HEADINGS = new Set([
  'about this type of role',
  'typical interview steps',
  'career growth',
  'questions to ask',
]);

function stripModelGeneralSections(text: string): string {
  const lines = String(text || '').split('\n');
  const keep: string[] = [];
  let skipping = false;
  for (const line of lines) {
    const t = line.trim().toLowerCase();
    if (RESERVED_GENERAL_HEADINGS.has(t)) {
      skipping = true;
      continue;
    }
    if (skipping && /^[A-Z][A-Za-z0-9 &'’]{2,40}$/.test(line.trim()) && !/[.!?]$/.test(line.trim())) {
      skipping = false;
    }
    if (!skipping) keep.push(line);
  }
  return keep.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** The "Good to know" section is general info by design, so groundedness skips
 * it — but it must never carry job-specific claims. If it mentions pay, years,
 * degree, visa, the company, or the location, the whole section is removed. */
function scrubGeneralSectionClaims(text: string, job: { company?: string | null; location?: string | null }): string {
  const company = String(job.company || '').trim().toLowerCase();
  const location = String(job.location || '').trim().toLowerCase();
  const lines = String(text || '').split('\n');
  let inGeneral = false;
  const keep: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (GENERAL_SECTION_RE.test(t)) {
      inGeneral = true;
      keep.push(line);
      continue;
    }
    if (inGeneral && /^[A-Z][A-Za-z0-9 &'’]{2,40}$/.test(t) && !/[.!?]$/.test(t)) {
      inGeneral = false;
      keep.push(line);
      continue;
    }
    if (!inGeneral) {
      keep.push(line);
      continue;
    }
    const claims =
      moneyIn(t).length > 0 ||
      yearsIn(t).length > 0 ||
      hasDegree(t) ||
      hasVisa(t) ||
      (company.length > 3 && t.toLowerCase().includes(company)) ||
      (location.length > 3 && t.toLowerCase().includes(location));
    if (!claims) keep.push(line);
  }
  return keep.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Drop honest-but-placeholder label lines ("Visa: Not specified") the model
 * insists on writing. Only label:value lines whose value is a placeholder —
 * never content claims. */
function scrubPlaceholderLabels(text: string): string {
  return String(text || '')
    .replace(
      /^[ \t]*([A-Za-z][A-Za-z &]{1,30}):\s*(not specified|not stated|no pay|no compensation|not mentioned|no information|not available|tbd|n\/a|to be determined|to be confirmed|unknown|none)[.\s]*$/gim,
      ''
    )
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Remove Key facts label lines whose value is NOT supported by source or
 * listed metadata. Can only delete unsupported claims (never add): the model
 * fills labels like Compensation/Years/Visa/Degree with guesses. */
function scrubUnsupportedKeyFacts(
  text: string,
  source: string,
  allowedMoney: string[]
): string {
  const allowed = new Set<string>();
  for (const raw of allowedMoney) {
    for (const v of expandMoneyValues(raw)) allowed.add(v);
  }
  const sMoney = moneyIn(source);
  const sYears = new Set(yearsIn(source));
  const sDegree = hasDegree(source);
  const sVisa = hasVisa(source);
  return String(text || '')
    .split('\n')
    .map((line) => {
      const m = line.match(/^[ \t]*([A-Za-z][A-Za-z &]{1,30}):\s*(.+)$/);
      if (!m) return line;
      const label = m[1].trim().toLowerCase();
      const value = m[2].trim();
      if (label === 'compensation') {
        // No pay figures at all ("No pay", "competitive", "TBD") → the topic
        // was not stated; omit the line entirely. Never claim absence of pay.
        const dMoney = moneyIn(value);
        if (!dMoney.length) return '';
        const supported = dMoney.some((v) =>
          allowed.has(v)
            ? true
            : sMoney.some((x) => moneyMatches(x, v))
        );
        return supported ? line : '';
      }
      if (label === 'years' || label === 'year') {
        const dYears = [...String(value).matchAll(/(\d{1,2})\s*\+?/g)].map((m) => m[1]);
        if (!dYears.length) return line;
        return dYears.every((y) => sYears.has(y)) ? line : '';
      }
      if (label === 'visa') {
        if (!hasVisa(value)) return line;
        return sVisa ? line : '';
      }
      if (label === 'degree') {
        if (!hasDegree(value)) return line;
        return sDegree ? line : '';
      }
      // Engagement / Team labels must not smuggle years or pay figures.
      if (label === 'engagement' || label === 'team') {
        const dYears = [...String(value).matchAll(/(\d{1,2})\s*\+?/g)].map((m) => m[1]);
        if (dYears.length && !dYears.every((y) => sYears.has(y))) return '';
        const dMoney = moneyIn(value);
        if (dMoney.length) {
          const supported = dMoney.some((v) =>
            allowed.has(v) || sMoney.some((x) => moneyMatches(x, v))
          );
          if (!supported) return '';
        }
      }
      return line;
    })
    .filter(Boolean)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function emptyResult(text: string, reasons: string[]): FinalizeResult {
  return {
    ok: false,
    text,
    wordCount: jobDescriptionWordCount(text),
    reasons,
    origin_ok: false,
    origin_reasons: [],
    adequacy_ok: false,
    adequacy_reasons: [],
    gates_ok: false,
    gates_indexable: false,
    gates_reasons: reasons,
    dropped_copied_lines: 0,
    copy_span: 0,
    jaccard5: 0,
    added: [],
  };
}
