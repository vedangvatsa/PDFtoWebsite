/**
 * Repair loop: a failing draft is revised with targeted instructions (the exact
 * gates it failed, the exact offending sentences/numbers/words) until it
 * passes or the repair budget is spent. Repair never invents — it removes and
 * restructures.
 */
import { type FinalizeResult } from '@/lib/job-finalize';
import { expandMoneyValues, groundednessFailures, hasDegree, hasVisa, moneyIn, moneyMatches, sectionedSentences, yearsIn } from '@/lib/job-adequacy';
import { assessOriginality, tokenizeForOriginality, maskImmutableSlots, ORIGINALITY } from '@/lib/job-originality';
import { jobDescriptionWordCount } from '@/lib/job-description';

export type RepairInstruction = { gate: string; fix: string };

const FACT_HEADING_RE =
  /^(key facts|requirements|nice to have)$/i;

function proseSentences(text: string): string[] {
  let section = '';
  const out: string[] = [];
  for (const line of String(text || '').split('\n')) {
    const t = line.trim();
    if (/^(about the role|key facts|what you['’]?ll do|requirements|nice to have|skills & tools|practical notes|about the company|how to apply|about this listing|after you apply|apply notes|how we write this page|what this page is not|before you apply)$/i.test(t)) {
      section = t.toLowerCase();
      continue;
    }
    if (FACT_HEADING_RE.test(section)) continue;
    out.push(line);
  }
  return out
    .join('\n')
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 24);
}

/** Sentences that copy / patchwrite / spin SOURCE. */
function originalityFailures(draft: string, source: string, job: { company?: string | null; title?: string | null }): string[] {
  const opts = { company: job.company, title: job.title };
  return proseSentences(draft).filter((s) => {
    const t = tokenizeForOriginality(maskImmutableSlots(s, opts));
    return t.length >= ORIGINALITY.minSentenceTokens && !assessOriginality(s, source, opts).ok;
  });
}

function allowedMoneySet(job: { salary?: string | null }): Set<string> {
  const out = new Set<string>();
  for (const raw of job?.salary ? [job.salary] : []) {
    for (const v of expandMoneyValues(raw)) out.add(v);
  }
  return out;
}

/** Turn the gate verdicts into concrete, actionable instructions. */
export function diagnoseFailures(
  fin: FinalizeResult,
  draft: string,
  source: string,
  job: { company?: string | null; title?: string | null; salary?: string | null }
): RepairInstruction[] {
  const out: RepairInstruction[] = [];
  const r = new Set(fin.reasons);
  const allowed = allowedMoneySet(job);

  if (r.has('short') || r.has('thin_duties') || r.has('thin_requirements')) {
    const wc = jobDescriptionWordCount(draft);
    out.push({
      gate: 'length',
      fix:
        `The page has ${wc} words; write 420-600 words of your own content (two curated ` +
        `blocks, About the company and About the location, are appended after you). ` +
        `Expand each duty into 1-2 sentences and each requirement into 1-2 sentences, ` +
        `adding purpose or context ONLY when SOURCE states it. Restate every duty, every ` +
        `must-have, and every nice-to-have. Add the "Good to know" section with 3-6 ` +
        `sentences of GENERAL, true information about the type of role or its tools ` +
        `(never about this job, company, location, pay, years, or visa; no numbers). ` +
        `Never invent facts about this job; never write filler openers like "This", ` +
        `"These", "That", "It", or "They".`,
    });
  }

  const ung = groundednessFailures(draft, source);
  if (r.has('invented_facts') || ung.length) {
    out.push({
      gate: 'truth',
      fix:
        `These sentences do not share enough words with SOURCE to prove they are ` +
        `restatements. Rewrite EACH ONE to use SOURCE's exact terms for tools, ` +
        `platforms, products, and objects (for example, if SOURCE says "radio and audio ` +
        `campaigns", keep the words radio, audio, and campaigns). Your rewrite must ` +
        `share at least a quarter of its words with a SOURCE sentence. Do not delete ` +
        `a duty or requirement to fix this. Never add claims SOURCE does not state. ` +
        `Offending sentences:\n` +
        ung.map(([s, o]) => `- [${Math.round(o * 100)}% overlap] ${s.slice(0, 160)}`).join('\n'),
    });
  }

  if (r.has('invented_pay')) {
    const bad = moneyIn(draft).filter((m) => !allowed.has(m) && !moneyIn(source).some((x) => moneyMatches(x, m)));
    out.push({
      gate: 'numbers',
      fix:
        `These pay figures are not in SOURCE and must be removed: ${bad.join(', ')}. ` +
        `Only restate pay SOURCE states. If SOURCE states no pay, write no pay at all.`,
    });
  }
  if (r.has('invented_years')) {
    const sY = new Set(yearsIn(source));
    const bad = yearsIn(draft).filter((y) => !sY.has(y));
    out.push({
      gate: 'numbers',
      fix: `These year figures are not in SOURCE and must be removed: ${bad.join(', ')}. Only restate years SOURCE states.`,
    });
  }
  if (r.has('invented_degree')) {
    out.push({
      gate: 'numbers',
      fix: 'SOURCE states no degree requirement. Remove every degree claim from the page.',
    });
  }
  if (r.has('invented_visa')) {
    out.push({
      gate: 'numbers',
      fix: 'SOURCE states no visa or citizenship rule. Remove every visa claim from the page.',
    });
  }
  if (r.has('dropped_years') || r.has('dropped_pay') || r.has('dropped_degree') || r.has('dropped_visa')) {
    out.push({
      gate: 'coverage',
      fix:
        `SOURCE states facts the page is missing (years / pay / degree / visa). ` +
        `Restate them from SOURCE in Key facts or Requirements, with the exact numbers.`,
    });
  }

  const originals = originalityFailures(draft, source, job);
  if (originals.length) {
    out.push({
      gate: 'originality',
      fix:
        `These sentences copy or closely paraphrase SOURCE (7+ shared words in a row, ` +
        `>62% token overlap, or >50% bigram overlap). Rewrite each with a different ` +
        `grammatical subject, different main verbs, and different clause order; merge or split. ` +
        `Offending sentences:\n` + originals.map((s) => `- ${s.slice(0, 160)}`).join('\n'),
    });
  }

  if (r.has('noslop_punct') || r.has('noslop_lexicon') || r.has('typical_role_filler')) {
    out.push({
      gate: 'style',
      fix:
        'Remove em/en dashes, ellipses, curly quotes, bullet dots, and banned words ' +
        '(leverage, utilize, seamless, robust, passionate, cutting-edge, world-class, ' +
        'game-changer, furthermore, moreover, exciting opportunity, fast-paced environment, ' +
        'self-starter, proven track record, and similar). Replace with plain short words.',
    });
  }
  if (r.has('placeholder')) {
    out.push({
      gate: 'style',
      fix: 'Remove "not specified", "N/A", "TBD", and placeholder text. Omit the topic entirely instead.',
    });
  }
  if (r.has('model_scratchpad')) {
    out.push({
      gate: 'shape',
      fix:
        'The previous output was not the page itself — it contained planning notes. ' +
        'Output ONLY the revised page: first line is the real title + " at " + company + ".", ' +
        'then exactly the headings About the role, Key facts, What you\'ll do, Requirements, ' +
        'Nice to have (if any), Skills & tools (if any), Practical notes. No notes, no plan, no explanation.',
    });
  }
  if (r.has('missing_heading:')) {
    const missing = fin.gates_reasons.filter((x) => x.startsWith('missing_heading:')).map((x) => x.replace('missing_heading:', ''));
    out.push({
      gate: 'shape',
      fix: `The page is missing these exact headings: ${missing.join(', ')}. Add them verbatim.`,
    });
  }
  if (r.has('not_owned_format') || r.has('raw_ats')) {
    out.push({
      gate: 'shape',
      fix: 'Keep the exact section headings (About the role, Key facts, What you\'ll do, Requirements, Practical notes) in that order with blank lines between sections.',
    });
  }
  if (r.has('robot_rhythm') || r.has('vague_duties')) {
    out.push({
      gate: 'style',
      fix:
        'Sentences that open with "This", "These", "That", "It", or "They" and then a ' +
        'generic word (solutions, systems, tooling, ensures, helps, supports) say nothing ' +
        'concrete and are removed by the checker. Rewrite each one to name the actual ' +
        'object and action from SOURCE (for example: "The CI/CD pipelines are maintained ' +
        'for the SDK, Android, and firmware builds."). Delete any sentence you cannot ' +
        'make concrete. Also ensure no three sentences in one section start the same way.',
    });
  }

  return out;
}

export function buildRepairPrompt(
  draft: string,
  source: string,
  instructions: RepairInstruction[]
): string {
  return `You revise the job page draft below to fix the FAILING checks. Fix ONLY what is listed. Keep every fact SOURCE states; add nothing SOURCE does not state. Do not copy SOURCE sentences. Keep the exact headings. Output the full revised page, plain text only, nothing before or after it.

FAILING CHECKS:
${instructions.map((i) => `[${i.gate}] ${i.fix}`).join('\n\n')}

SOURCE:
${String(source || '').slice(0, 12000)}

DRAFT:
${String(draft || '').slice(0, 8000)}`;
}

export type RepairLoopOptions = {
  rawDraft: string;
  source: string;
  job: { company?: string | null; title?: string | null; salary?: string | null; id?: string | null; location?: string | null };
  callModel: (prompt: string, system: string) => Promise<string>;
  system: string;
  maxRepairs?: number;
};

const BANNED_WORDS_RE =
  /\b(delve|tapestry|pivotal|vibrant|meticulous|testament|groundbreaking|leverage|utilize|synergy|holistic|seamless|robust|passionate|cutting-edge|game-changer|unlock your potential|in today's (?:fast[- ]paced )?(?:digital )?world|it's worth noting|at the end of the day|when it comes to|let's dive in|furthermore|moreover|exciting opportunity|world-class|best-in-class|state-of-the-art|supercharge|reimagine|revolutionize)\b/gi;

/** Deterministic style scrub: banned lexicon words, em/en dashes, ellipsis. */
export function scrubLexicon(text: string): string {
  return String(text || '')
    .replace(BANNED_WORDS_RE, '')
    .replace(/[—–…]/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

const PLACEHOLDER_PHRASE_RE = /\b(not specified|not stated|to be determined|\btbd\b|\bn\/a\b)\b/gi;

/** Sentences that open on a vague referent say nothing concrete; the checker
 * rejects two or more, so the backstop removes them deterministically. */
const VAGUE_OPENER_RE =
  /^(this|these|that|those|it|they|such|which|so|as)\s+(solutions?|systems?|tooling|ownership|approach|work|things?|areas?|tasks?|efforts?|is|are|was|were|ensures?|helps?|supports?|means?|allows?|keeps?|drives?|guarantees?|provides?|makes?|gives?|creates?|covers?|aligned)\b/i;

/** Deterministic backstop: remove every sentence that still fails grounding,
 * plus sentences carrying years/pay figures SOURCE does not state, plus
 * placeholder phrases. Only deletes unsupported claims; never rewrites or
 * invents. */
export function removeUngrounded(text: string, source: string, job?: { salary?: string | null }): string {
  const bad = groundednessFailures(text, source).map(([s]) => s);
  const sYears = new Set(yearsIn(source));
  const sMoney = moneyIn(source);
  const sDegree = hasDegree(source);
  const sVisa = hasVisa(source);
  const allowed = new Set<string>();
  for (const raw of job?.salary ? [job.salary] : []) {
    for (const v of expandMoneyValues(raw)) allowed.add(v);
  }
  for (const { section, sentence: t } of sectionedSentences(text)) {
    if (section === 'good to know' || section === 'owned') continue;
    if (t.length < 24) continue;
    const y = yearsIn(t).filter((y) => !sYears.has(y));
    const m = moneyIn(t).filter((v) => !allowed.has(v) && !sMoney.some((x) => moneyMatches(x, v)));
    if (
      y.length ||
      m.length ||
      PLACEHOLDER_PHRASE_RE.test(t) ||
      VAGUE_OPENER_RE.test(t) ||
      (hasDegree(t) && !sDegree) ||
      (hasVisa(t) && !sVisa)
    ) {
      bad.push(t);
    }
  }
  if (!bad.length) return text;
  let out = String(text || '');
  for (const s of bad) {
    out = out.replace(s, '');
  }
  return out.replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ').trim();
}

/** Draft → finalize → diagnose → repair → finalize… until pass or budget spent.
 * After the budget, ungrounded sentences are removed deterministically so no
 * fabricated claim can survive (the page then either passes or is an honest
 * short stub — never a fabricated failure). */
export async function repairLoop(
  opts: RepairLoopOptions,
  finalize: (draft: string, source: string, job: RepairLoopOptions['job']) => FinalizeResult
): Promise<{ fin: FinalizeResult; attempts: number }> {
  let draft = String(opts.rawDraft || '');
  let fin = finalize(draft, opts.source, opts.job);
  let attempts = 1;
  const maxRepairs = opts.maxRepairs ?? 3;
  while (!fin.ok && attempts <= maxRepairs) {
    const instructions = diagnoseFailures(fin, draft, opts.source, opts.job);
    if (!instructions.length) break;
    draft = await opts.callModel(buildRepairPrompt(draft, opts.source, instructions), opts.system);
    fin = finalize(draft, opts.source, opts.job);
    attempts += 1;
  }
  if (!fin.ok) {
    const stripped = scrubLexicon(removeUngrounded(fin.text, opts.source, opts.job));
    if (stripped && stripped !== fin.text) {
      const fin2 = finalize(stripped, opts.source, opts.job);
      if (process.env.DEBUG_ERR === '1') {
        console.error('DBGLOOP', JSON.stringify({ before: fin.reasons, after: fin2.reasons, w1: fin.wordCount, w2: fin2.wordCount }));
      }
      const onlyLength = fin2.reasons.length > 0 && fin2.reasons.every((r) => r === 'short' || r === 'thin_duties' || r === 'thin_requirements');
      if (fin2.ok || onlyLength) return { fin: fin2, attempts };
      if (fin2.reasons.length < fin.reasons.length) return { fin: fin2, attempts };
    }
  }
  return { fin, attempts };
}
