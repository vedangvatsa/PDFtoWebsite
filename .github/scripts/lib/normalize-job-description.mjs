/**
 * Storage-time job description cleanup (mirrors src/lib/job-description.ts).
 * Display formatting happens at render; this is the publish gate so leaked
 * writer-template text never lands in a new row.
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
  /This role is not on the public board yet\.?/gi,
  /We publish a paraphrased description from the official posting[\s\S]*?employer apply link\.?/gi,
];

const PLACEHOLDER_FACT_VALUE =
  /^(?:see source|not specified|not provided|none listed|none stated|not stated|n\/a|tbd|\.\.\.)(?:\s|[.(]|$)/i;
const INSTRUCTION_COPY =
  /\b(?:omit(?:ted)?\s+(?:the line|the whole section|section|if source|if unknown|if empty)|only if source|only hours, travel, visa|remove this line|per source instructions|only include if|fact sheet json|output only the job page|(?:3-5 sentences|8-12 bullets|every must_have))\b/i;
const PAGE_META_COPY =
  /\bthis page does not\b|\bthis listing is the (?:only )?source\b|\bduties (?:remain|are only) those\b|\bdo the work posted for\b|\babout this (?:kind|type) of role\b|\bfollow scope\b|\bgeneral (?:engineering|workplace|working)[- ]practice\b|\bspecific duties remain\b|\bcvin\.bio does not submit\b|\ba public cv link is optional\b|\bomit the whole section\b|\bonly hours, travel, visa\b|\bnot specified in the source\b|\bthe role is (?:full_time|part_time|contract|internship)\b/i;
const ORPHAN_FILLER = /^(please|todo|tbd|n\/a|none|source:?)\.?$/i;
const KEY_FACT_LABEL =
  '(?:Location|Engagement|Compensation|Salary|Pay|Team|Workplace|Employment(?: type)?|Job type|Department|Hours, travel, visa, or deadlines)';

function plainFromHtmlish(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Entirely a placeholder/instruction, or leftover prose after peeling one.
 * Does NOT treat a parenthetical like "(Growth)" as junk — only omit/see-source
 * parentheticals and explicit placeholders.
 */
function peelJunkFactValue(val) {
  const original = plainFromHtmlish(val).trim();
  if (!original) return null;
  const v = original
    .replace(/\(\s*omit(?:ted)?(?:\s+the line)?[^)]*\)/gi, ' ')
    .replace(/^(?:see source|not specified|not provided|none listed|none stated|not stated|n\/a|tbd)\.?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!v) return null;
  if (PLACEHOLDER_FACT_VALUE.test(v) && v.length < 80) return null;
  if (INSTRUCTION_COPY.test(v) && v.length < 220 && v === original) return null;
  return v;
}

function rewriteContentLine(line) {
  const plain = plainFromHtmlish(line);
  if (!plain) return line;
  if (ORPHAN_FILLER.test(plain)) return null;
  if (/\b(?:this page does not|do the work posted for|cvin\.bio does not submit)\b/i.test(plain)) {
    return null;
  }
  if (PAGE_META_COPY.test(plain) && plain.length < 500) return null;
  const debullet = plain.replace(/^[-•*]\s+/, '');
  const labeled = debullet.match(/^([A-Za-z][^:]{0,80}):\s*(.*)$/);
  if (labeled) {
    const tail = peelJunkFactValue(labeled[2]);
    if (tail === null) return null;
    if (tail !== plainFromHtmlish(labeled[2]).trim()) {
      const prefix = /^[-•*]\s+/.test(plain) ? '- ' : '';
      return `${prefix}${labeled[1]}: ${tail}`;
    }
  }
  if (INSTRUCTION_COPY.test(plain) && plain.length < 220) return null;
  return line;
}

export function stripAggregatorDisclaimers(text) {
  if (!text) return '';
  let s = String(text);
  for (const re of STRIP_PATTERNS) s = s.replace(re, '');
  return s
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Drop writer-template residue so it cannot be stored.
 * Conservative: never drop a real parenthetical value such as Team: (Growth).
 */
export function stripLeakedWriterInstructions(text) {
  if (!text) return '';
  let s = String(text);

  s = s.replace(
    /<\/(p|li|h[1-6]|div|blockquote)>\s*(?=<(?:p|li|h[1-6]|div|ul|ol|blockquote))/gi,
    '</$1>\n'
  );

  s = s.replace(/<(p|li|h[1-6])(\s[^>]*)?>[\s\S]*?<\/\1>/gi, (block) => {
    const next = rewriteContentLine(block);
    if (next == null) return '';
    if (next === block) return block;
    return `<p>${next.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
  });

  s = s
    .split('\n')
    .flatMap((line) => {
      if (/<[a-z]/i.test(line)) return [line];
      return line.split(new RegExp(`(?=${KEY_FACT_LABEL}\\s*:)`, 'i'));
    })
    .map((line) => line.trim())
    .map((line) => (line ? rewriteContentLine(line) : line))
    .filter((line) => line != null)
    .join('\n');

  s = s
    .replace(/\(\s*omit(?:ted)?(?:\s+the line)?[^)]*\)/gi, '')
    .replace(
      /Confirm details on the official apply page(\s+WITHOUT\s+\S+|.*?WITHOUT edit)/gi,
      'Confirm details on the official apply page.'
    )
    .replace(/^\s*See source\b[^\n]*\.?\s*$/gim, '')
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<li>\s*<\/li>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return s;
}

/** True if text still contains writer-template residue after a conservative strip. */
export function descriptionHasWriterLeak(text) {
  const s = String(text || '');
  if (!s.trim()) return false;
  if (
    /\b(?:omit(?:ted)?\s+(?:the line|the whole section)|only if source|only hours, travel, visa|per source instructions|remove this line|fact sheet json|output only the job page)\b/i.test(
      s
    )
  ) {
    return true;
  }
  if (/^[-•*]?\s*[A-Za-z][^:\n]{0,80}:\s*(?:see source|not specified|not provided|none listed|n\/a|tbd|\.\.\.)\b/im.test(s)) {
    return true;
  }
  if (/^[-•*]?\s*see source\b/im.test(s)) return true;
  if (/\bnot specified in the source\b/i.test(s)) return true;
  if (/\bthe role is (?:full_time|part_time|contract|internship)\b/i.test(s)) return true;
  return false;
}

/** Normalize before upsert — never append CVin.Bio / aggregator footers or writer leaks. */
export function normalizeJobDescriptionForStorage(description) {
  if (!description) return description ?? null;
  const cleaned = stripLeakedWriterInstructions(stripAggregatorDisclaimers(description));
  if (!cleaned) return null;
  return cleaned.length > 12000 ? cleaned.slice(0, 12000) : cleaned;
}
