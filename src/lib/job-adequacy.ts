/**
 * Fail-closed adequacy: draft may not invent hard facts, and must keep
 * years / pay / degree / visa that SOURCE already stated.
 */

const FILLER_RE =
  /\b(proven track record|highly motivated|self[- ]starter|hit the ground running|fast[- ]paced environment|world-class team|exciting opportunity)\b/i;

export type AdequacyResult = { ok: boolean; reasons: string[] };

/** Facts already in SOURCE, for the write user prompt. Never invents. */
export function summarizeHardFacts(source: string): string {
  const s = String(source || '');
  const lines: string[] = [];
  const years = [...new Set(yearsIn(s))];
  if (years.length) lines.push(`- years mentioned: ${years.map((y) => `${y}+`).join(', ')}`);
  const money = moneyIn(s);
  if (money.length) lines.push(`- pay figures: ${money.map((m) => `$${m}`).join(' to ')}`);
  if (hasDegree(s)) lines.push('- a degree requirement is stated (keep the fields SOURCE names)');
  if (hasVisa(s)) lines.push('- a visa / export / citizenship rule is stated (keep it)');
  return lines.join('\n');
}

const CURRENCY_SYMBOL = '[$€£₹¥]';
const CURRENCY_CODE =
  '\\b(?:usd|eur|gbp|inr|myr|rm|aud|cad|sgd|hkd|rmb|cny|nzd|sek|nok|dkk|chf|zar|jpy|krw|php|thb|vnd|idr)\\b';
const PAY_UNIT = '\\bper\\s+(?:year|month|hour|annum|week|day)\\b';

/** A money token: optional currency anchor, a number (optionally a range),
 * optional k/m scale, optional currency suffix, optional pay unit.
 * Numbers require at least one digit — bare commas never match. */
const NUMBER = `[\\d]+(?:,[\\d]{3})*(?:\\.[0-9]{1,2})?`;
const MONEY_TOKEN_RE = new RegExp(
  `(?:${CURRENCY_SYMBOL}\\s*|${CURRENCY_CODE}\\s*)?` +
    `(${NUMBER}(?:\\s*[-–]\\s*${NUMBER})?)` +
    `(?:\\s*([kKmM])(?!\\w))?` +
    `(?:\\s*(lakh|lac|crore)s?)?` +
    `(?:\\s*${CURRENCY_SYMBOL}|\\s*${CURRENCY_CODE})?` +
    `(?:\\s*${PAY_UNIT})?`,
  'gi'
);

/** Export for debug/repair diagnostics. */
function moneyTokenRe(): RegExp {
  return MONEY_TOKEN_RE;
}

/** Benefit figures are not salary: insurance coverage, provident fund,
 * reimbursements, premiums. When these words sit in the match window the
 * figure is not pay. */
const NOT_PAY_WORDS =
  /(coverage|insurance|provident|contribution|reimbursement|premium|deductible|top[- ]?up|lakhs?\s+coverage)/i;
/** Without an explicit salary word nearby, only unambiguous large
 * $/€/£ amounts (≥ 4 digits) count as pay. */
const PAY_WORDS =
  /(salary|compensation|base pay|total comp|pay band|pay range|remuneration|ctc|package|annual pay|starting pay|salary range|per annum|lpa|k pa|k per annum|\bpay\b)/i;

/** Currency-anchored figures at full scale: "$120k" → "120000",
 * "RM 5,000 - 8,000" → 5000+8000, "₹6 lakhs" → 600000, "₹1,800 per month"
 * (PF contribution) → [] — benefit amounts are not pay. */
export function moneyIn(text: string): string[] {
  const src = String(text || '');
  const out: string[] = [];
  for (const m of src.matchAll(MONEY_TOKEN_RE)) {
    const token = m[0];
    const anchored = new RegExp(
      `(?:${CURRENCY_SYMBOL}|${CURRENCY_CODE}|${PAY_UNIT})`,
      'i'
    ).test(token);
    if (!anchored) continue;
    const idx = m.index ?? 0;
    const window = src.slice(Math.max(0, idx - 60), idx + token.length + 60);
    if (NOT_PAY_WORDS.test(window)) continue;
    if (!PAY_WORDS.test(window)) {
      const bigDollar = /[$€£]/.test(token) && /\d{4}/.test(token);
      if (!bigDollar) continue;
    }
    const scale = String(m[2] || '').toLowerCase();
    const india = String(m[3] || '').toLowerCase();
    const lscale = india.startsWith('crore')
      ? 10_000_000
      : india
        ? 100_000
        : scale === 'k'
          ? 1000
          : scale === 'm'
            ? 1_000_000
            : 1;
    for (const part of (m[1] || '').split(/[-–]/)) {
      const n = Number(part.replace(/,/g, ''));
      if (Number.isFinite(n) && n > 0) {
        out.push(String(Math.round(n * lscale)));
      }
    }
  }
  return out;
}

/** "120k" / "$1.2m" / "120000" / "120k-160k" → ["120000", "160000"]. */
export function expandMoneyValues(raw: string): string[] {
  const out: string[] = [];
  for (const part of String(raw || '').toLowerCase().split(/[^0-9.km]+/)) {
    const m = part.match(/^(\d+(?:\.\d+)?)(k|m)?$/);
    if (!m || !part) continue;
    const n = parseFloat(m[1]) * (m[2] === 'k' ? 1000 : m[2] === 'm' ? 1_000_000 : 1);
    if (n > 0) out.push(String(Math.round(n)));
  }
  return out;
}

export function hasDegree(text: string): boolean {
  return /\b(?:bachelor'?s?|master'?s?|phd|stem discipline|computer engineering|electrical engineering|b\.?s\.?|m\.?s\.?|b\.?tech|m\.?tech|b\.?e\.?|m\.?e\.?|b\.?sc\.?|m\.?sc\.?)\b/i.test(
    String(text || '')
  );
}

export function hasVisa(text: string): boolean {
  return /\b(itar|u\.?s\.? citizen|green card|permanent resident|asylee|export regulations|e-?verify)\b/i.test(
    String(text || '')
  );
}

export function yearsIn(text: string): string[] {
  const s = String(text || '').toLowerCase();
  return [
    ...[...s.matchAll(/\b(\d{1,2})\s*\+?\s*years?\b/g)].map((m) => m[1]),
    ...[...s.matchAll(/\byears?\s*[:\s]+(\d{1,2})\s*\+?\b/g)].map((m) => m[1]),
  ];
}

export function assessAdequacy(
  draft: string,
  source: string,
  opts?: { allowedMoney?: string[] }
): AdequacyResult {
  const reasons: string[] = [];
  const d = String(draft || '');
  const s = String(source || '');
  if (!s.trim() || !d.trim()) return { ok: true, reasons };

  // Filler is only a fail when the MODEL added it — if the employer's own
  // source uses "fast-paced environment", restating it is not fabrication.
  if (FILLER_RE.test(d) && !FILLER_RE.test(s)) reasons.push('typical_role_filler');

  const sYears = new Set(yearsIn(s));
  for (const y of yearsIn(d)) {
    if (!sYears.has(y)) reasons.push('invented_years');
  }
  // Pay figures the employer listed in structured metadata (salary_min/max) are
  // real facts even when the scraped ATS body omits them. Normalize "120k" /
  // "$1.2m" / "120k-160k" shorthand to plain digits.
  const allowedMoney = new Set<string>();
  for (const raw of opts?.allowedMoney || []) {
    for (const v of expandMoneyValues(raw)) allowedMoney.add(v);
  }
  const sMoney = moneyIn(s);
  for (const m of moneyIn(d)) {
    if (allowedMoney.has(m)) continue;
    if (!sMoney.some((x) => moneyMatches(x, m))) reasons.push('invented_pay');
  }
  if (hasDegree(d) && !hasDegree(s)) reasons.push('invented_degree');
  if (hasVisa(d) && !hasVisa(s)) reasons.push('invented_visa');

  if (sYears.size && yearsIn(d).length === 0) reasons.push('dropped_years');
  if (sMoney.length && moneyIn(d).length === 0) reasons.push('dropped_pay');
  if (hasDegree(s) && !hasDegree(d)) reasons.push('dropped_degree');
  if (hasVisa(s) && !hasVisa(d)) reasons.push('dropped_visa');

  if (assessGroundedness(d, s)) reasons.push('invented_facts');

  const unique = [...new Set(reasons)];
  return { ok: unique.length === 0, reasons: unique };
}

const GROUND_MIN_OVERLAP = 0.25;
const GROUND_MIN_WHOLE_OVERLAP = 0.35;
const INJECTED_LINE_RE = /^(the posting (states|requires|says)|confirm the exact (field|terms))\b/i;

/** "Good to know" carries general role info by design — never scored against
 * SOURCE, and its safety is enforced by scrubGeneralSectionClaims. */
export const GENERAL_SECTION_RE = /^good to know$/i;

/** Pipeline-owned sections (curated general info, company, location) are
 * inserted after the model draft — never scored against SOURCE. */
const OWNED_HEADING_RE =
  /^(about this type of role|typical interview steps|career growth|questions to ask|about the company|about the location)$/i;

/** Sentences with the section they belong to. Headings reset the section. */
export function sectionedSentences(text: string): Array<{ section: string; sentence: string }> {
  let section = '';
  const out: Array<{ section: string; sentence: string }> = [];
  for (const line of String(text || '').split('\n')) {
    const t = line.trim();
    if (GENERAL_SECTION_RE.test(t)) {
      section = 'good to know';
      continue;
    }
    if (OWNED_HEADING_RE.test(t)) {
      section = 'owned';
      continue;
    }
    if (/^[A-Z][A-Za-z0-9 &'’]{2,40}$/.test(t) && !/[.!?]$/.test(t)) {
      section = '';
      continue;
    }
    for (const s of t.split(/(?<=[.!?])\s+|\n+/)) {
      const sent = s.trim();
      if (sent.length >= 24) out.push({ section, sentence: sent });
    }
  }
  return out;
}

function normTokens(text: string): string[] {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/**
 * Groundedness: every draft claim sentence must share content with SOURCE.
 * Checks, in order:
 *  1. Best per-sentence token overlap (a faithful restatement shares ~40%+).
 *  2. Whole-source vocabulary overlap (rescues facts spread across many
 *     source lines — location, schedule, travel).
 *  3. Number anchoring: any number (≥10, incl. "5+" style) in a claim must
 *     exist in SOURCE. Catches pay/percent/headcount mutations exactly
 *     ("approx. 30% travel" → "10% travel").
 * Code-injected "The posting states…" lines are machine-verified facts and
 * are skipped.
 */
function assessGroundedness(draft: string, source: string): boolean {
  const src = String(source || '');
  const sSents = src
    .split(/(?<=[.!?])\s+|\n+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 24)
    .map(normTokens)
    .filter((t) => t.length >= 6);
  if (!sSents.length) return false;
  const sAll = new Set(normTokens(src));
  const sNums = [...normTokens(src).filter((t) => /^\d+$/.test(t))];

  for (const { section, sentence: ds } of sectionedSentences(draft)) {
    if (section === 'good to know' || section === 'owned') continue;
    if (INJECTED_LINE_RE.test(ds)) continue;
    const dt = normTokens(ds);
    if (dt.length < 8) continue;

    let best = 0;
    for (const st of sSents) {
      const set = new Set(st);
      let hit = 0;
      for (const w of dt) if (set.has(w)) hit += 1;
      best = Math.max(best, hit / dt.length);
    }
    if (best < GROUND_MIN_OVERLAP) {
      let wholeHit = 0;
      for (const w of dt) if (sAll.has(w)) wholeHit += 1;
      const whole = wholeHit / dt.length;
      if (whole < GROUND_MIN_WHOLE_OVERLAP) return true;
    }

    // Number anchoring: every number a claim carries must appear in SOURCE.
    const dNums = dt.filter((t) => /^\d+$/.test(t) && Number(t) >= 10);
    if (dNums.length) {
      const found = dNums.some((n) => sNums.includes(n));
      if (!found) return true;
    }
  }
  return false;
}

/** Sentences whose facts are not grounded in SOURCE (invented or mutated).
 * Returns [sentence, bestOverlap] for the repair loop. */
export function groundednessFailures(draft: string, source: string): Array<[string, number]> {
  const src = String(source || '');
  const sSents = src
    .split(/(?<=[.!?])\s+|\n+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 24)
    .map(normTokens)
    .filter((t) => t.length >= 6);
  if (!sSents.length) return [];
  const sAll = new Set(normTokens(src));
  const sNums = [...normTokens(src).filter((t) => /^\d+$/.test(t))];

  const out: Array<[string, number]> = [];
  for (const { section, sentence: ds } of sectionedSentences(draft)) {
    if (section === 'good to know' || section === 'owned') continue;
    if (INJECTED_LINE_RE.test(ds)) continue;
    const dt = normTokens(ds);
    if (dt.length < 8) continue;
    let best = 0;
    for (const st of sSents) {
      const set = new Set(st);
      let hit = 0;
      for (const w of dt) if (set.has(w)) hit += 1;
      best = Math.max(best, hit / dt.length);
    }
    if (best < GROUND_MIN_OVERLAP) {
      let wholeHit = 0;
      for (const w of dt) if (sAll.has(w)) wholeHit += 1;
      if (wholeHit / dt.length < GROUND_MIN_WHOLE_OVERLAP) {
        out.push([ds, best]);
        continue;
      }
    }
    const dNums = dt.filter((t) => /^\d+$/.test(t) && Number(t) >= 10);
    if (dNums.length && !dNums.some((n) => sNums.includes(n))) {
      out.push([ds, best]);
    }
  }
  return out;
}

/** Proportional pay tolerance: small amounts match closely, large salaries
 * allow minor rounding. */
export function moneyMatches(a: string | number, b: string | number): boolean {
  const x = Number(a);
  const n = Number(b);
  return Math.abs(x - n) <= Math.max(1, n * 0.02);
}

/** Slot hard facts from SOURCE into the draft. New sentences only. No duties invented. */
export function injectSourceHardFacts(draft: string, source: string): string {
  const d = String(draft || '');
  const s = String(source || '');
  if (!s.trim()) return d;
  const extras: string[] = [];

  if (hasDegree(s) && !hasDegree(d)) {
    extras.push(
      'The posting states a bachelor\'s degree requirement. Confirm the exact field on the official apply page.'
    );
  }
  const sYears = yearsIn(s);
  const dYears = new Set(yearsIn(d));
  const missingYear = sYears.find((y) => !dYears.has(y));
  if (missingYear) {
    extras.push(`The posting states a minimum of ${missingYear} years of experience.`);
  }
  if (hasVisa(s) && !hasVisa(d)) {
    extras.push(
      'The posting states a U.S. export or citizenship requirement. Confirm the exact terms on the official apply page.'
    );
  }
  const sMoney = moneyIn(s);
  if (sMoney.length && moneyIn(d).length === 0) {
    extras.push(`The posting states a pay range of $${sMoney[0]} to $${sMoney[sMoney.length - 1]}.`);
  }
  if (!extras.length) return d.trim();
  if (/^requirements$/im.test(d)) {
    return d.replace(/^requirements$/im, `Requirements\n${extras.join(' ')}`).trim();
  }
  return `${d.trim()}\n\nRequirements\n${extras.join(' ')}`.trim();
}

export function sectionWordCount(text: string, heading: string): number {
  const esc = heading
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/'/g, "['’]?");
  const re = new RegExp(`(?:^|\\n)${esc}\\s*\\n([\\s\\S]*?)(?=\\n(?:[A-Z][^\\n]{2,40})\\n|$)`, 'i');
  const m = String(text || '').match(re);
  if (!m) return 0;
  return m[1].split(/\s+/).filter(Boolean).length;
}
