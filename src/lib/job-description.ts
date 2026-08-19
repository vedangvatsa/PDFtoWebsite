/**
 * Job description cleaning + URL helpers for cvin.bio JD pages.
 * Descriptions in DB are raw HTML (ATS) or plain text. We sanitize and
 * lightly restructure for readable job pages.
 *
 * All publish output runs through src/lib/noslop.ts (see /noslop.md).
 */

import { cleanPublishHtml, cleanPublishText } from '@/lib/noslop';
import { primaryCompanyLogoUrl } from '@/lib/company-logo';
import {
  toCompanySlug,
  applyCompanyDisplayCasing,
  routeCompanySlug,
  companyHubAliasPrefixes,
} from '@/lib/company-directory';

/** Bump when display formatting changes — invalidates job snapshot caches. */
export const JOB_DESCRIPTION_FORMAT_VERSION = 33;

/** Tailwind prose for every job detail description block. Base + layout utilities; typography in globals.css */
export const JOB_DESCRIPTION_PROSE_CLASS =
  'job-description min-w-0 max-w-full overflow-x-auto break-words [overflow-wrap:anywhere] ' +
  '[&_*]:max-w-full ' +
  '[&_img]:h-auto [&_img]:max-w-full ' +
  '[&_table]:block [&_table]:w-full [&_table]:overflow-x-auto ' +
  '[&_pre]:overflow-x-auto [&_pre]:max-w-full [&_pre]:whitespace-pre-wrap';

/** Prompt-template / instruction lines that leaked into published JDs. */
const PLACEHOLDER_FACT_VALUE =
  /^(?:see source|not specified|not provided|none listed|none stated|not stated|n\/a|tbd|\.\.\.)(?:\s|[.(]|$)/i;
const INSTRUCTION_COPY =
  /\b(?:omit(?:ted)?\s+(?:the line|the whole section|section|if source|if unknown|if empty)|only if source|only hours, travel, visa|remove this line|per source instructions|only include if|fact sheet json|output only the job page|(?:3-5 sentences|8-12 bullets|every must_have))\b/i;
const PAGE_META_COPY =
  /\bthis page does not\b|\bthis listing is the (?:only )?source\b|\bduties (?:remain|are only) those\b|\bdo the work posted for\b|\babout this (?:kind|type) of role\b|\bfollow scope\b|\bgeneral (?:engineering|workplace|working)[- ]practice\b|\bspecific duties remain\b|\bcvin\.bio does not submit\b|\ba public cv link is optional\b|\bomit the whole section\b|\bonly hours, travel, visa\b|\bnot specified in the source\b|\bthe role is (?:full_time|part_time|contract|internship)\b/i;
const ORPHAN_FILLER = /^(please|todo|tbd|n\/a|none|source:?)\.?$/i;

function plainFromHtmlish(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
}

/** Entirely a placeholder/instruction, or leftover prose after peeling one. */
function peelJunkFactValue(val: string): string | null {
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

function isJunkFactValue(val: string): boolean {
  return peelJunkFactValue(val) === null;
}

/** Drop leaked lines; if a junk fact shares a line with real copy, keep the copy. */
function rewriteContentLine(line: string): string | null {
  const plain = plainFromHtmlish(line);
  if (!plain) return line;
  if (ORPHAN_FILLER.test(plain)) return null;
  if (/\b(?:this page does not|do the work posted for|cvin\.bio does not submit)\b/i.test(plain)) {
    return null;
  }
  if (PAGE_META_COPY.test(plain) && plain.length < 500) return null;
  const debullet = plain.replace(/^[-•*]\s+/, '');
  // Any "Label: See source" / "Label: (omit…)" line — including commas in the label
  // and list bullets ("- Hours, travel, visa, or deadlines: See source").
  const labeled = debullet.match(/^([A-Za-z][^:]{0,80}):\s*(.*)$/);
  if (labeled) {
    const tail = peelJunkFactValue(labeled[2]);
    if (tail === null) return null;
    if (tail !== plainFromHtmlish(labeled[2]).trim()) return tail;
  }
  if (INSTRUCTION_COPY.test(plain) && plain.length < 220) return null;
  return line;
}

/**
 * Drop leaked writer-template text and page-meta padding so every job page
 * reads like a job. Pattern-class based — not a per-posting denylist.
 */
const KEY_FACT_LABEL =
  '(?:Location|Engagement|Compensation|Salary|Pay|Team|Workplace|Employment(?: type)?|Job type|Department)';

export function stripLeakedPromptText(text: string): string {
  if (!text) return '';
  let s = text;

  // Adjacent HTML blocks often sit on one line. Score each block alone so a
  // leaked fact never takes a whole posting's body with it.
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
    .filter((line): line is string => line != null)
    .join('\n');

  s = s
    .replace(/<h3>\s*About this (?:kind|type) of role\s*<\/h3>[\s\S]*?(?=<h[23]|$)/gi, '')
    .replace(/<h3>\s*About the location\s*<\/h3>[\s\S]*?(?=<h[23]|$)/gi, '')
    .replace(/\(\s*omit(?:ted)?(?:\s+the line)?[^)]*\)/gi, '')
    .replace(
      /Confirm details on the official apply page(\s+WITHOUT\s+\S+|.*?WITHOUT edit)/gi,
      'Confirm details on the official apply page.'
    );

  s = stripScaffoldAndEmptyHeadings(s)
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<li>\s*<\/li>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return s;
}

/** Writer-scaffold headings and headings that have no remaining body. */
const SCAFFOLD_HEADING =
  /^(?:role overview|what you should have|follow scope|source|fact sheet|page meta|about this (?:kind|type) of role)$/i;

function stripScaffoldAndEmptyHeadings(html: string): string {
  if (!html) return html;
  let s = html.replace(/<h([23])>\s*([^<]{1,90})\s*<\/h\1>/gi, (full, _n: string, title: string) =>
    SCAFFOLD_HEADING.test(title.replace(/&nbsp;/gi, ' ').trim()) ? '' : full
  );
  let prev = '';
  while (s !== prev) {
    prev = s;
    s = s.replace(
      /<h([23])>\s*[^<]{1,90}\s*<\/h\1>\s*(?:<(?:p|ul|ol)>\s*<\/(?:p|ul|ol)>\s*)*(?=<h[23]>|$)/gi,
      ''
    );
  }
  return s;
}

/** Titles that are blog posts, nav labels, or markdown leftovers — not jobs. */
export function isGarbageJobTitle(title: string | null | undefined): boolean {
  const t = String(title || '').replace(/\s+/g, ' ').trim();
  if (!t || t.length < 3) return true;
  if (/^(website|home|about|blog|news|careers|jobs|fellowship|fellowships)$/i.test(t)) return true;
  // RemoteOK / board-index scrapes: "Permanent Jobs", "Wanted Jobs", "Open Vacancies"
  if (
    /^(?:(?:wanted|permanent|casual|seasonal|current|open|available|remote)\s+)?(?:jobs?|vacancies|openings|positions|careers|roles)$/i.test(
      t
    )
  ) {
    return true;
  }
  if (/^(?:now\s+)?hiring(?:\s+process)?$/i.test(t)) return true;
  if (/^job title$/i.test(t)) return true;
  if (/^test job(?:\s+\d+)?$/i.test(t)) return true;
  if (/^(?:multiple|various|open|current)\s+(?:positions?|roles?|vacancies|openings|jobs)$/i.test(t)) {
    return true;
  }
  if (/^(?:current(?:ly)?\s+)?jobs?\s+openings?$/i.test(t)) return true;
  if (/^vacancies(?:\s+[a-z]+)?$/i.test(t) && t.length < 36) return true;
  if (/^community\s+/i.test(t) && t.length < 28) return true;
  if (/\bread more\b/i.test(t)) return true;
  if (/\bexplaining the\b/i.test(t) && t.length > 40) return true;
  if (/\band introducing (our|the)\b/i.test(t)) return true;
  // Truncated blog titles like "Community Dec 3"
  if (/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}\b/i.test(t) && t.length < 40) {
    return true;
  }
  return false;
}

/**
 * Display-time title cleanup. Markdown arrows, "Read More", trailing dashes.
 * Applied on every job card and detail page so scraped leftovers never show.
 */
export function cleanJobTitle(title: string | null | undefined): string {
  let t = cleanPublishText(String(title || ''));
  t = t
    .replace(/^(?:[-*>]+|-->)\s*/g, '')
    .replace(/\s*Read More\s*$/i, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s:\-\|]+/, '')
    .replace(/[\s:\-\|,]+$/, '')
    .replace(/\s+jobs?$/i, '')
    .trim();
  return t;
}

export function looksLikeFellowship(job: {
  title?: string | null;
  category?: string | null;
  tags?: string[] | null;
}): boolean {
  if (isFalseFellowshipProgramTitle(job.title)) return false;
  if (String(job.category || '').toLowerCase() === 'fellowship') return true;
  if ((job.tags || []).some((t) => /^fellowship$/i.test(String(t)))) return true;
  if (/\bfellow(?:ship|s)?\b/i.test(String(job.title || ''))) return true;
  return false;
}

/** Job titles that mention fellow/residency but are not an open fellowship program. */
export function isFalseFellowshipProgramTitle(title: string | null | undefined): boolean {
  const t = String(title || '').replace(/\s+/g, ' ').trim();
  if (!t) return false;
  if (/^become a fellow$/i.test(t)) return true;
  if (/\bfellowship[- ]trained\b/i.test(t)) return true;
  if (/\bfellowship service representative\b/i.test(t)) return true;
  if (/\bfellow experience specialist\b/i.test(t)) return true;
  if (/\bfellows project program coordinator\b/i.test(t)) return true;
  if (/\bprogram manager\b/i.test(t) && /\bfellowship program\b/i.test(t)) return true;
  if (/\b(?:engineering )?technical fellow\b/i.test(t)) return true;
  if (/\bresidency(?:-|\s+)trained\b/i.test(t)) return true;
  if (/\bresidency manager\b/i.test(t)) return true;
  if (/\bboard-certified\b/i.test(t)) return true;
  if (/\bin[- ]residence\b/i.test(t) && !/\bfellowship\b/i.test(t)) return true;
  return false;
}

function stripRedundantTitleOpener(
  text: string,
  title?: string | null,
  company?: string | null
): string {
  const ttl = String(title || '').trim();
  const co = String(company || '').trim();
  if (!ttl || !co || !text) return text;
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const opener = `${esc(ttl)}\\s+at\\s+${esc(co)}\\.?`;
  return text
    .replace(new RegExp(`(?:<p>\\s*)?${opener}(?:\\s*</p>)?\\s*`, 'gi'), '')
    .trim();
}

export function cleanSalaryDisplay(salary: string | null | undefined): string | null {
  if (!salary) return null;
  const s = cleanPublishText(String(salary))
    .replace(/(\d),(\d{3})\.00\b/g, '$1,$2')
    .replace(/\.00\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return s || null;
}

const MECHANICAL_PIVOT_WORD = /\b(specifically|notably|meanwhile)\b/gi;

/** True when copy-gate pivot words were stuffed into the body to dodge overlap checks. */
function looksLikeMechanicalPivotSlop(text: string): boolean {
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

/** Repair broken tags/entities from mechanical pivot insertion (`< specifically p>`, `& notably nbsp;`). */
function repairMechanicalPivotMarkup(html: string): string {
  let s = html;
  s = s.replace(
    /<\s*(specifically|notably|meanwhile)\s+([a-z][a-z0-9]*)(\s[^>]*)?>/gi,
    '<$2$3>'
  );
  s = s.replace(
    /<\s*\/\s*(specifically|notably|meanwhile)\s+([a-z][a-z0-9]*)\s*>/gi,
    '</$2>'
  );
  s = s.replace(/&\s*(specifically|notably|meanwhile)\s+([a-z]+);/gi, '&$2;');
  // Dangling `<` left when a pivot-corrupted tag was truncated (`outputs<`).
  s = s.replace(/([a-z0-9])<(?![/]?[a-z])/gi, '$1');
  return s;
}

function stripMechanicalPivotWords(text: string): string {
  return text
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
export function stripMechanicalPivotSlop(text: string | null | undefined): string {
  if (!text) return '';
  let s = repairMechanicalPivotMarkup(text);
  if (looksLikeMechanicalPivotSlop(s)) {
    s = stripMechanicalPivotWords(s);
  }
  return s;
}

/** Strip aggregator / mirror disclaimers that must never appear on job pages. */
function stripAggregatorDisclaimers(text: string): string {
  if (!text) return '';
  let s = stripLeakedPromptText(text);
  const patterns: RegExp[] = [
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
    /Duties and requirements are only those on the official apply page\.?/gi,
    /This page does not invent day-to-day work[^.]*\.?/gi,
    /CVin\.Bio does not submit the application for you[^.]*\.?/gi,
    /A public CV link is optional and is not a substitute for the employer form\.?/gi,
    /This page does not add tasks[^.]*\.?/gi,
    /This page does not invent a (?:research agenda|roadmap)[^.]*\.?/gi,
    /General (?:engineering|workplace|working)[- ]practice[^.]*\.?/gi,
    /Specific duties remain only those in the source[^.]*\.?/gi,
    /Do the work posted for[^\n<]*/gi,
    /Follow scope\s*About the company/gi,
    /(?:^|\n)What You Should Have\s*$/gim,
    /<li>\s*What You Should Have\s*<\/li>/gi,
    /<p>\s*Please\s*<\/p>/gi,
    /(?:^|\n)Please\s*$/gim,
    /About this kind of role[\s\S]*?(?=\n(?:About |Key facts|What you|Requirements|Nice to have|Skills|Practical notes|Good to know|How to apply)|<h[23]|$)/gi,
    /About the location\s*\n[^\n]*(?:listed workplace|listing already states)[^\n]*/gi,
    /<h3>\s*About this kind of role\s*<\/h3>[\s\S]*?(?=<h[23]|$)/gi,
    /<h3>\s*About the location\s*<\/h3>[\s\S]*?(?=<h[23]|$)/gi,
  ];
  for (const re of patterns) s = s.replace(re, '');
  s = s
    .replace(/(\d)\.\s+(\d)/g, '$1.$2') // "1. 5 billion" → "1.5 billion"
    .replace(/<li>\s*[-•]\s*/gi, '<li>')
    .replace(/^[-•]\s+[-•]\s+/gm, '- ');
  return stripLeakedPromptText(s)
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li',
  'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'blockquote', 'span', 'div',
]);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Escape HTML then turn bare http(s) URLs into clickable links. */
function escapeHtmlWithLinks(s: string): string {
  let out = escapeHtml(s);
  out = out.replace(
    /https?:\/\/[^\s<>"']+/g,
    (m) => {
      let url = m;
      let suffix = '';
      // Trim trailing punctuation that is not part of the URL.
      const m2 = url.match(/^(.*?)([.,;:!?]+)$/);
      if (m2 && m2[2].length <= 3) {
        url = m2[1];
        suffix = m2[2];
      }
      if (url.length < 12) return m; // too short to be a real URL
      return `<a href="${url}" rel="noopener noreferrer nofollow" target="_blank">${url}</a>${suffix}`;
    }
  );
  return out;
}

/** Strip scripts, styles, comments, and MS Office cruft. */
function stripUnsafe(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?o:[^>]*>/gi, '')
    .replace(/<\/?w:[^>]*>/gi, '')
    .replace(/<\/?v:[^>]*>/gi, '')
    .replace(/<\/?m:[^>]*>/gi, '')
    .replace(/<xml[\s\S]*?<\/xml>/gi, '')
    .replace(/<!\[if[\s\S]*?<!\[endif\]>/gi, '');
}

/**
 * Allowlist-based sanitizer (no external deps).
 * Keeps structure tags; strips event handlers and style/class noise.
 */
function sanitizeJobHtml(raw: string): string {
  let html = stripUnsafe(raw);

  // Drop all attributes except href on anchors
  html = html.replace(/<\/?([a-zA-Z0-9]+)(\s[^>]*)?>/g, (full, tag: string, attrs?: string) => {
    const t = tag.toLowerCase();
    const isClose = full.startsWith('</');
    if (!ALLOWED_TAGS.has(t)) {
      // Convert unknown block-ish tags to nothing; keep content via next text
      return '';
    }
    if (isClose) return `</${t}>`;
    if (t === 'br') return '<br />';
    if (t === 'a' && attrs) {
      const hrefMatch = attrs.match(/\shref\s*=\s*["']([^"']+)["']/i);
      const href = hrefMatch?.[1] || '';
      if (/^https?:\/\//i.test(href) || href.startsWith('/')) {
        return `<a href="${escapeHtml(href)}" rel="noopener noreferrer nofollow" target="_blank">`;
      }
      return '<span>';
    }
    if (t === 'a') return '<span>';
    return `<${t}>`;
  });

  // Collapse empty tags and excess whitespace
  html = html
    // A few ATS exporters wrap an entire description in a generic div. Keep
    // its content, but do not let that wrapper create an unstyled block whose
    // margins differ from the shared description flow.
    .replace(/<\/?div>/gi, '')
    .replace(/<(p|div|h[2-6]|li|span)>\s*<\/\1>/gi, '')
    .replace(/(<br\s*\/?>\s*){3,}/gi, '<br /><br />')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return html;
}

/** Plain text → simple HTML paragraphs. */
function plainTextToHtml(text: string): string {
  const cleaned = expandStructuredPlainText(
    text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .trim()
  );

  if (!cleaned) return '';

  const lines = cleaned.split('\n');
  const out: string[] = [];
  let buf: string[] = [];
  let introBuf: string[] = [];
  let inBody = false;
  let currentSection = '';

  const flushBuf = () => {
    while (buf.length && !buf[0].trim()) buf.shift();
    while (buf.length && !buf[buf.length - 1].trim()) buf.pop();
    if (!buf.length) return;
    if (isMetaFactsSection(currentSection)) {
      out.push(renderMetaFactsBlock(buf.join('\n')));
    } else if (isCriteriaListSection(currentSection) && buf.some((l) => isOrderedLine(l.trim()))) {
      out.push(renderNumberedCriteriaBlock(buf.join('\n')));
    } else {
      out.push(renderPlainBlock(buf.join('\n')));
    }
    buf = [];
  };

  const flushIntro = () => {
    if (!introBuf.length) return;
    out.push(renderIntroBlock(introBuf));
    introBuf = [];
  };

  const bufIsListRun = () =>
    buf.length > 0 &&
    buf.some((l) => l.trim()) &&
    buf.every((l) => {
      const t = l.trim();
      return !t || isBulletLine(t) || isOrderedLine(t);
    });

  const bufIsNumberedCriteriaRun = () =>
    buf.length > 0 &&
    isCriteriaListSection(currentSection) &&
    buf.some((l) => isOrderedLine(l.trim()));

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      // ATS HTML often emits one <ul> per <li>, which becomes "- a\n\n- b".
      // Keep list runs intact across blank lines; flush other blocks.
      // Under Requirements/Qualifications, keep numbered criteria runs together.
      if (inBody && !bufIsListRun() && !bufIsNumberedCriteriaRun()) flushBuf();
      continue;
    }
    const inCriteria = isCriteriaListSection(currentSection);
    const numberedCriteria = inCriteria && isNumberedCriteriaLine(trimmed);
    if (!numberedCriteria && isMetaSectionHeading(trimmed)) {
      flushBuf();
      flushIntro();
      inBody = true;
      const title = trimmed.replace(/:$/, '').trim();
      currentSection = title.toLowerCase();
      out.push(`<h3>${escapeHtml(title)}</h3>`);
      continue;
    }
    if (!numberedCriteria && isSubSectionHeading(trimmed)) {
      flushBuf();
      flushIntro();
      inBody = true;
      out.push(`<h4>${escapeHtml(trimmed.replace(/^-\s*/, '').trim())}</h4>`);
      continue;
    }
    if (!inBody) {
      introBuf.push(trimmed);
    } else {
      const lineIsList = isBulletLine(trimmed) || isOrderedLine(trimmed);
      if (buf.length) {
        if (
          inCriteria &&
          isOrderedLine(trimmed) &&
          buf.some((l) => isBulletLine(l.trim())) &&
          !buf.some((l) => isOrderedLine(l.trim()))
        ) {
          flushBuf();
        } else if (
          inCriteria &&
          isBulletLine(trimmed) &&
          bufIsNumberedCriteriaRun()
        ) {
          const last = [...buf].reverse().find((l) => l.trim())?.trim() || '';
          if (isOrderedLine(last) && numberedLineHasInlineBody(last)) {
            flushBuf();
          }
        } else if (bufIsListRun() && !lineIsList) flushBuf();
        else if (!bufIsListRun() && lineIsList) flushBuf();
      }
      buf.push(rawLine);
    }
  }
  flushBuf();
  flushIntro();
  return mergeAdjacentLists(out.join('\n'));
}

function renderIntroBlock(lines: string[]): string {
  const parts: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const role = t.match(/^Role:\s*(.+)$/i);
    if (role) {
      parts.push(`<p><strong>Role:</strong> ${escapeHtmlWithLinks(role[1].trim())}</p>`);
      continue;
    }
    const labeled = t.match(/^([^:\n]{2,48}):\s+(.+)$/);
    if (labeled && !isMetaSectionHeading(t)) {
      parts.push(
        `<p><strong>${escapeHtml(labeled[1].trim())}:</strong> ${escapeHtmlWithLinks(labeled[2].trim())}</p>`
      );
      continue;
    }
    parts.push(`<p>${escapeHtmlWithLinks(t)}</p>`);
  }
  return `<div class="jd-intro">${parts.join('\n')}</div>`;
}

function isMetaFactsSection(section: string): boolean {
  return section === 'key facts' || section === 'application window';
}

/** Sections where "1. …" lines are eligibility criteria, not document headings. */
function isCriteriaListSection(section: string): boolean {
  return (
    section === 'requirements' ||
    section === 'requirement' ||
    section === 'qualifications' ||
    section === 'qualification' ||
    section === 'must have' ||
    section === 'eligibility' ||
    section === 'who can apply'
  );
}

function isNumberedCriteriaLine(line: string): boolean {
  return /^\d{1,2}\.\s+/.test(line.trim());
}

/** Numbered criterion line that already carries its body (not a short title awaiting sub-bullets). */
function numberedLineHasInlineBody(line: string): boolean {
  const body = line.replace(/^\d{1,2}\.\s+/, '').trim();
  if (/:\s/.test(body)) return true;
  if (body.length > 90) return true;
  if (/[.!?]\s*$/.test(body) && body.length > 50) return true;
  if (/,\s*(?:covering|including|addressing)\b/i.test(body)) return true;
  return false;
}

/** "1. Title: body" or "1. Title\n- body" → single numbered list item line. */
function mergeNumberedWithFollowingBullets(lines: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim();
    if (!t) {
      out.push('');
      continue;
    }
    if (isOrderedLine(t)) {
      const bullets: string[] = [];
      let j = i + 1;
      while (j < lines.length) {
        const next = lines[j].trim();
        if (!next) {
          j++;
          continue;
        }
        if (isBulletLine(next)) {
          bullets.push(next.replace(/^[-•*]\s+/, ''));
          j++;
          continue;
        }
        break;
      }
      if (bullets.length === 1) {
        const num = t.match(/^(\d{1,2})\./)?.[1] || '1';
        const title = t.replace(/^\d{1,2}\.\s+/, '');
        if (!/:\s/.test(title)) {
          out.push(`${num}. ${title}: ${bullets[0]}`);
          i = j - 1;
          continue;
        }
      }
      if (bullets.length > 1) {
        out.push(raw);
        for (let k = i + 1; k < j; k++) out.push(lines[k]);
        i = j - 1;
        continue;
      }
    }
    out.push(raw);
  }
  return out;
}

function renderMetaFactsBlock(block: string): string {
  const lines = block
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => {
      const m = l.match(/^([^:\n]{2,48}):\s+(.+)$/);
      return !(m && isJunkFactValue(m[2]));
    });
  if (!lines.length) return '';
  if (lines.every(isLabelValueLine)) {
    return `<div class="jd-meta-facts">${lines.map((l) => renderLabelValueParagraph(l)).join('')}</div>`;
  }
  return renderPlainBlock(block);
}

/** Split "1. Title body..." lines and inline numbered clauses into structured lines. */
function expandStructuredPlainText(text: string): string {
  const expanded: string[] = [];

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) {
      expanded.push('');
      continue;
    }

    // Keep how-to steps intact: "1. Open the portal", "2. Fill the form"
    if (isNumberedStepLine(line)) {
      expanded.push(raw);
      continue;
    }

    const numberedColon = line.match(/^(?:-\s*)?(\d{1,2})\.\s+(.+?):\s+(.+)$/);
    if (numberedColon && numberedColon[3].trim().length > 5) {
      expanded.push(`${numberedColon[1]}. ${numberedColon[2].trim()}`);
      expanded.push(`- ${numberedColon[3].trim()}`);
      continue;
    }

    const numbered = line.match(
      /^(?:-\s*)?(\d{1,2})\.\s+([A-Z][A-Za-z0-9 /&'’()-]{2,60}?)\s+(.+)$/
    );
    if (
      numbered &&
      numbered[3].length > 15 &&
      isNumberedSectionTitle(numbered[2]) &&
      !/,\s*(?:covering|including|addressing)\b/i.test(line)
    ) {
      expanded.push(`${numbered[1]}. ${numbered[2]}`);
      expanded.push(...splitLetteredSubclauses(numbered[3]));
      continue;
    }

    if (/\s\d{1,2}\.\s+[A-Z]/.test(line) && line.length > 120) {
      // IAIP intros and ALL-CAPS multi-role titles are one paragraph — do not split
      if (/IAIP|Indian Army Internship Program/i.test(line)) {
        expanded.push(raw);
        continue;
      }
      if (isAllCapsTitleFragment(line)) {
        expanded.push(raw);
        continue;
      }
      const parts = line.split(/\s+(?=\d{1,2}\.\s+[A-Z])/);
      for (const part of parts) {
        const inner = part.trim().match(
          /^(\d{1,2})\.\s+([A-Z][A-Za-z0-9 /&'’()-]{2,60}?)\s+(.+)$/
        );
        if (inner && isNumberedSectionTitle(inner[2])) {
          expanded.push(`${inner[1]}. ${inner[2]}`);
          expanded.push(...splitLetteredSubclauses(inner[3]));
        } else {
          expanded.push(part.trim());
        }
      }
      continue;
    }

    expanded.push(raw);
  }

  return mergeNumberedWithFollowingBullets(expanded).join('\n');
}

/** ALL-CAPS portal titles (e.g. "AI ENABLED APPLICATION FOR ARCH LAYOUT VETTING") are not section headings. */
function isAllCapsTitleFragment(text: string): boolean {
  const t = text.trim();
  if (t.length < 12) return false;
  const letters = t.replace(/[^A-Za-z]/g, '');
  if (letters.length < 8) return false;
  const upper = letters.replace(/[^A-Z]/g, '').length;
  return upper / letters.length >= 0.85;
}

/** "1. Documentation Requirements" yes; "1. Open" no */
function isNumberedSectionTitle(title: string): boolean {
  const t = title.trim();
  if (isNumberedStepLine(`1. ${t}`)) return false;
  if (isAllCapsTitleFragment(t)) return false;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length >= 3) return true;
  if (t.length >= 20) return true;
  if (/requirements|engagement|documentation|responsibilities|qualifications/i.test(t)) {
    return true;
  }
  return false;
}

function isNumberedStepLine(line: string): boolean {
  return /^\d{1,2}\.\s+(Open|Fill|Preview|Submit|Register|Upload|Complete|Review|Create|Sign|Download|Read|Check|Apply|Select|Verify|Confirm|Visit|Browse|Prepare|Attend|Join)\b/i.test(
    line.trim()
  );
}

function isBulletLine(line: string): boolean {
  return /^[-•*]\s+/.test(line.trim());
}

/** "Do A. - Do B. - Do C." on one line → separate bullet lines. */
function expandInlineDashBullets(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed) return [];
  const body = isBulletLine(trimmed)
    ? trimmed.replace(/^[-•*]\s+/, '')
    : trimmed;
  if (!/\s+-\s+(?=[A-Z])/.test(body)) return [trimmed];
  const parts = body
    .split(/\s+-\s+(?=[A-Z])/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length <= 1) return [trimmed];
  const prefix = isBulletLine(trimmed) ? '- ' : '';
  return parts.map((p) => `${prefix}${p}`);
}

function isOrderedLine(line: string): boolean {
  return /^\d{1,2}\.\s+/.test(line.trim());
}

function splitLetteredSubclauses(body: string): string[] {
  const trimmed = body.trim();
  if (!/\([a-z]\)\s/i.test(trimmed)) return [trimmed];

  const segments = trimmed.split(/\s*\(([a-z])\)\s*/i);
  const out: string[] = [];
  const intro = segments[0]?.trim();
  if (intro) out.push(intro);

  for (let i = 1; i < segments.length; i += 2) {
    const letter = segments[i];
    const content = segments[i + 1]?.trim();
    if (content) out.push(`- (${letter}) ${content}`);
  }
  return out;
}

/**
 * Short ALL-CAPS labels ("ABOUT SUPERPOWER", "WHAT WE'RE LOOKING FOR").
 * Longer ALL-CAPS job-title fragments stay body text via length/word caps.
 * Single-word ALL-CAPS (USA, NYC, CEO) is left to the explicit whitelist.
 */
function isAllCapsSectionHeading(line: string): boolean {
  const t = line.replace(/:$/, '').trim();
  if (t.length < 6 || t.length > 70) return false;
  if (/\.$/.test(t)) return false;
  if (!/^[A-Z0-9][A-Z0-9\s/'’&,:.\-]{2,}$/.test(t)) return false;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 8) return false;
  if (t.length > 55 && words.length >= 6) return false;
  const letters = t.replace(/[^A-Za-z]/g, '');
  return letters.length >= 6;
}

/** Section titles for structured plain-text job descriptions. */
function isMetaSectionHeading(line: string): boolean {
  if (!line || line.length > 90) return false;
  const t = line.replace(/:$/, '').trim();
  if (/^Who can apply\??$/i.test(t)) return true;
  if (/^Key facts$/i.test(t)) return true;
  if (/^Skills (&|and) tools$/i.test(t)) return true;
  if (/^Program highlights$/i.test(t)) return true;
  if (/^Current cycles$/i.test(t)) return true;
  if (/^Official references$/i.test(t)) return true;
  if (/^Application window$/i.test(t)) return true;
  if (/^Desired start months/i.test(t)) return true;
  if (/^Areas of interest$/i.test(t)) return true;
  if (/^About the scheme$/i.test(t)) return true;
  if (/^About the program$/i.test(t)) return true;
  if (/^Role Overview$/i.test(t)) return true;
  if (/^What You Should Have$/i.test(t)) return true;
  if (/^Work areas$/i.test(t)) return true;
  if (/^Practical notes$/i.test(t)) return true;
  if (/^Good to know$/i.test(t)) return true;
  if (/^Role & project$/i.test(t)) return true;
  if (/^Technical requirements$/i.test(t)) return true;
  if (/^Terms of engagement$/i.test(t)) return true;
  if (/^About (the )?(role|job|company|team|us|position)$/i.test(t)) return true;
  if (/^About [A-Z][\w'’&-]{1,40}$/i.test(t) && t.length <= 50) return true;
  if (/^Why join( us)?$/i.test(t)) return true;
  // "Why Superpower" / "WHY ACME" — not full sentences like "Why we care about…"
  if (/^Why [A-Z][\w'’&-]{1,40}$/i.test(t) && t.length <= 45) return true;
  if (/^What we(['’]re| are) looking for$/i.test(t)) return true;
  if (/^What you(['’]ll| will) (do|bring|need|get)$/i.test(t)) return true;
  if (/^What we offer$/i.test(t)) return true;
  if (/^Requirements?$/i.test(t)) return true;
  if (/^Qualifications?$/i.test(t)) return true;
  if (/^Benefits$/i.test(t)) return true;
  if (/^Nice to have$/i.test(t)) return true;
  if (/^Must have$/i.test(t)) return true;
  if (/^(?:Anthropic Fellows Program overview|What to expect|Interview process|Fellows workstreams|AI Safety Fellows|AI Security Fellows|ML Systems & Performance Fellows|Reinforcement Learning Fellows|Economics & Societal Impacts Fellows|Mentors, research areas,? & past projects|Unique candidate criteria)$/i.test(t)) return true;
  if (/^Open application window$/i.test(t)) return true;
  if (/^Placement groups$/i.test(t)) return true;
  if (/^Selection(?:\s+process)?$/i.test(t)) return true;
  if (/^Service bond$/i.test(t)) return true;
  if (/^Application fee$/i.test(t)) return true;
  if (/^Vacancies$/i.test(t)) return true;
  if (/^During the internship$/i.test(t)) return true;
  if (/^How to apply/i.test(t)) return true;
  if (/^Applying with a CV link$/i.test(t)) return true;
  if (/^Contact$/i.test(t)) return true;
  if (/^Responsibilities:?$/i.test(t)) return true;
  if (/^Key responsibilities$/i.test(t)) return true;
  if (/^Core principles$/i.test(t)) return true;
  if (/^Compensation and benefits$/i.test(t)) return true;
  if (/^Total rewards$/i.test(t)) return true;
  if (/^Application details$/i.test(t)) return true;
  if (/^Application process$/i.test(t)) return true;
  if (/^Essential functions$/i.test(t)) return true;
  if (/^Job summary$/i.test(t)) return true;
  if (/^Skills Required:?$/i.test(t)) return true;
  if (/^Keywords:?$/i.test(t)) return true;
  if (/^(Company )?Philosoph(y|ies)$/i.test(t)) return true;
  if (/^Investors?$/i.test(t)) return true;
  if (/^(Our )?(Culture|Values|Mission|Vision|Perks|Compensation|Team|Equal Opportunity)$/i.test(t)) {
    return true;
  }
  if (isAllCapsSectionHeading(t)) return true;
  if (isNumberedStepLine(line)) return false;
  return false;
}

/** Collapse adjacent same-type lists left by ATS one-li-per-ul markup. */
function mergeAdjacentLists(html: string): string {
  return html
    .replace(/<\/ul>\s*<ul>/gi, '')
    .replace(/<\/ol>\s*<ol>/gi, '');
}

/** In-section labels: "5. SOC Platform", "- 1. AI Integration: ..." title only */
function isSubSectionHeading(line: string): boolean {
  const t = line.replace(/^-\s*/, '').trim();
  const numbered = t.match(/^(\d{1,2})\.\s+(.+)$/);
  if (numbered && isNumberedSectionTitle(numbered[2])) return true;
  if (/^Technical Requirements$/i.test(t)) return true;
  return false;
}

function isLabelValueLine(line: string): boolean {
  return /^[A-Za-z][A-Za-z0-9 /&'’()-]{1,48}:\s+.+$/.test(line.trim());
}

function renderLabelValueParagraph(line: string): string {
  const m = line.trim().match(/^([^:\n]{2,48}):\s+(.+)$/);
  if (!m) return `<p>${escapeHtmlWithLinks(line.trim())}</p>`;
  if (isJunkFactValue(m[2])) return '';
  return `<p><strong>${escapeHtml(m[1].trim())}:</strong> ${escapeHtmlWithLinks(m[2].trim())}</p>`;
}

function renderListItems(lines: string[], ordered = false): string {
  const tag = ordered ? 'ol' : 'ul';
  const items = lines
    .map((l) => {
      const text = l
        .trim()
        .replace(/^\d{1,2}\.\s+/, '')
        .replace(/^[-•*]\s+/, '');
      const labeled = text.match(/^([^:]+):\s+(.+)$/);
      if (labeled && !/^-/.test(l.trim())) {
        return `<li><strong>${escapeHtml(labeled[1].trim())}:</strong> ${escapeHtmlWithLinks(labeled[2].trim())}</li>`;
      }
      return `<li>${escapeHtmlWithLinks(text)}</li>`;
    })
    .join('');
  return `<${tag}>${items}</${tag}>`;
}

/** Requirements/Qualifications blocks with numbered criteria and optional sub-bullets. */
function renderNumberedCriteriaBlock(block: string): string {
  const lines = block
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return '';

  const prefix: string[] = [];
  let i = 0;
  while (i < lines.length && !isOrderedLine(lines[i]) && !isBulletLine(lines[i])) {
    prefix.push(renderLabelValueParagraph(lines[i]));
    i++;
  }
  if (i >= lines.length) {
    return prefix.join('\n') || renderPlainBlock(block);
  }

  const olItems: string[] = [];
  while (i < lines.length) {
    const t = lines[i];
    if (isOrderedLine(t)) {
      const title = t.replace(/^\d{1,2}\.\s+/, '');
      const bullets: string[] = [];
      i++;
      while (i < lines.length && isBulletLine(lines[i])) {
        bullets.push(lines[i].replace(/^[-•*]\s+/, ''));
        i++;
      }
      const colon = title.match(/^(.+?):\s+(.+)$/);
      if (colon) {
        olItems.push(
          `<li><strong>${escapeHtml(colon[1].trim())}:</strong> ${escapeHtmlWithLinks(colon[2].trim())}</li>`
        );
      } else if (bullets.length === 1) {
        olItems.push(
          `<li><strong>${escapeHtml(title)}:</strong> ${escapeHtmlWithLinks(bullets[0])}</li>`
        );
      } else if (bullets.length > 1) {
        const sub = bullets.map((b) => `<li>${escapeHtmlWithLinks(b)}</li>`).join('');
        olItems.push(`<li><strong>${escapeHtml(title)}</strong><ul>${sub}</ul></li>`);
      } else {
        olItems.push(`<li>${escapeHtmlWithLinks(title)}</li>`);
      }
      continue;
    }
    if (isBulletLine(t)) {
      const bullets: string[] = [];
      while (i < lines.length && isBulletLine(lines[i])) {
        bullets.push(lines[i]);
        i++;
      }
      prefix.push(renderListItems(bullets));
      continue;
    }
    prefix.push(renderLabelValueParagraph(t));
    i++;
  }

  const ol = olItems.length ? `<ol>${olItems.join('')}</ol>` : '';
  return [prefix.join('\n'), ol].filter(Boolean).join('\n');
}

function renderPlainBlock(block: string): string {
  const trimmed = block.trim();
  const lines = trimmed
    .split('\n')
    .flatMap((l) => expandInlineDashBullets(l.trim()))
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length > 0 && lines.every(isLabelValueLine)) {
    return lines.map((l) => renderLabelValueParagraph(l)).join('\n');
  }

  const bulletLines = lines.filter(isBulletLine);
  const orderedLines = lines.filter((l) => isOrderedLine(l) && !isBulletLine(l));
  const plainLines = lines.filter((l) => !isBulletLine(l) && !isOrderedLine(l));

  if (bulletLines.length && plainLines.length) {
    const paras = plainLines.map((l) => renderLabelValueParagraph(l)).join('\n');
    return `${paras}\n${renderListItems(bulletLines)}`;
  }

  if (orderedLines.length && plainLines.length) {
    const paras = plainLines.map((l) => renderLabelValueParagraph(l)).join('\n');
    return `${paras}\n${renderListItems(orderedLines, true)}`;
  }

  if (bulletLines.length && bulletLines.length === lines.length) {
    return renderListItems(bulletLines);
  }

  if (orderedLines.length && orderedLines.length === lines.length) {
    return renderListItems(orderedLines, true);
  }

  if (lines.length > 1) {
    return lines.map((l) => renderLabelValueParagraph(l)).join('\n');
  }

  if (lines.length === 1 && isLabelValueLine(lines[0])) {
    return renderLabelValueParagraph(lines[0]);
  }

  return `<p>${escapeHtmlWithLinks(trimmed)}</p>`;
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'");
}

/** Strip tags while preserving line breaks from block elements. */
function htmlToPlainText(html: string): string {
  let s = stripUnsafe(html);
  s = s
    .replace(/<h[1-6][^>]*>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  return decodeHtmlEntities(s)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Flat ATS HTML → plain pipeline when structure heuristics match. */
function shouldUsePlainPipeline(html: string, plain?: string): boolean {
  const text = plain ?? htmlToPlainText(html);
  const hasSemanticHeadings = /<h[2-4][\s>]/i.test(html);
  const listCount = (html.match(/<[uo]l[\s>]/gi) || []).length;

  if (hasSemanticHeadings && listCount >= 2 && text.length < 2500) return false;

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const sectionLines = lines.filter(
    (l) => isMetaSectionHeading(l) || isSubSectionHeading(l)
  );
  if (sectionLines.length >= 2) return true;

  const labelLines = lines.filter(isLabelValueLine);
  if (labelLines.length >= 3 && labelLines.length / lines.length >= 0.45) {
    return true;
  }
  if (/^\d{1,2}\.\s+[A-Z]/m.test(text)) return true;

  if (!hasSemanticHeadings && text.length > 350) {
    const pBlocks = (html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || []).length;
    if (pBlocks <= 3 || text.length / Math.max(pBlocks, 1) > 200) return true;
  }
  return false;
}

function sectionHeadingTag(text: string): 'h3' | 'h4' | null {
  const t = text.replace(/:$/, '').trim();
  if (isSubSectionHeading(t)) return 'h4';
  if (isMetaSectionHeading(t)) return 'h3';
  return null;
}

/** Light restructuring for HTML that already has some markup. */
function structureJobHtml(html: string): string {
  let s = sanitizeJobHtml(html);

  s = s.replace(
    /<p>\s*<(?:strong|b)>([^<]{2,90})<\/(?:strong|b)>\s*<\/p>/gi,
    (_full, title: string) => {
      const t = decodeHtmlEntities(title.trim());
      if (/^\d{1,2}\.\s+/.test(t)) {
        return `<p><strong>${escapeHtml(t)}</strong></p>`;
      }
      const tag = sectionHeadingTag(t);
      if (tag) {
        const label = tag === 'h4' ? t.replace(/^-\s*/, '').trim() : t;
        return `<${tag}>${escapeHtml(label)}</${tag}>`;
      }
      if (
        t.length < 60 &&
        /^[A-Z0-9][A-Z0-9\s/'’&,:.\-]{4,}$/.test(t) &&
        !/\.$/.test(t) &&
        !/^Role:/i.test(t)
      ) {
        return `<h3>${escapeHtml(t)}</h3>`;
      }
      return `<p><strong>${escapeHtml(t)}</strong></p>`;
    }
  );

  // Bare paragraph titles (common in paraphrased / ATS HTML without <strong>)
  s = s.replace(/<p>([\s\S]*?)<\/p>/gi, (full, inner: string) => {
    const text = decodeHtmlEntities(inner.replace(/<[^>]+>/g, '').trim());
    if (!text) return full;
    if (/^\d{1,2}\.\s+/.test(text)) {
      return `<p>${inner}</p>`;
    }
    const tag = sectionHeadingTag(text);
    if (tag) {
      const label = tag === 'h4' ? text.replace(/^-\s*/, '').trim() : text.replace(/:$/, '').trim();
      return `<${tag}>${escapeHtml(label)}</${tag}>`;
    }
    if (text.length < 180 || !/\s\d{1,2}\.\s+[A-Z]/.test(text)) {
      return `<p>${inner}</p>`;
    }
    const restructured = plainTextToHtml(text);
    return restructured || `<p>${inner}</p>`;
  });

  return mergeAdjacentLists(s);
}

/**
 * Normalize stored description into safe HTML for display.
 * Structure cleanup + mandatory noslop punctuation pass.
 *
 * When `authoritativeLocation` is provided, the first `Location:` entry inside
 * the "Key facts" block is replaced with it so the displayed page can never
 * contradict the authoritative DB `location` column (the LLM rewrite may
 * hallucinate a "Remote" location for an on-site role).
 */
export function formatJobDescription(
  raw: string | null | undefined,
  authoritativeLocation?: string | null,
  opts?: {
    title?: string | null;
    company?: string | null;
    rawCompany?: string | null;
    applyUrl?: string | null;
    isFellowship?: boolean;
  }
): string {
  if (!raw || !raw.trim()) return '';

  const cleaned = stripRedundantTitleOpener(
    stripAggregatorDisclaimers(stripMechanicalPivotSlop(raw)),
    opts?.title,
    opts?.company
  );
  const looksHtml = /<[a-z][\s\S]*>/i.test(cleaned);

  let structured: string;
  if (!looksHtml) {
    structured = plainTextToHtml(cleaned);
  } else {
    const plain = htmlToPlainText(cleaned);
    if (shouldUsePlainPipeline(cleaned, plain)) {
      structured = plainTextToHtml(plain);
    } else {
      structured = structureJobHtml(cleaned);
    }
  }

  let html = mergeAdjacentLists(cleanPublishHtml(structured));

  const loc = String(authoritativeLocation || '').trim();
  if (loc) {
    html = html.replace(
      /(<p><strong>Location:<\/strong>\s*)([^<]*)(<\/p>)/i,
      (_full, open: string, _val: string, close: string) =>
        `${open}${escapeHtml(loc)}${close}`
    );
  }

  html = html.replace(
    /<p>\s*<strong>([A-Za-z][^:]{0,80}):<\/strong>\s*([^<]*)<\/p>/gi,
    (full, _label: string, val: string) => (isJunkFactValue(val) ? '' : full)
  );

  html = html.replace(
    /(<p><strong>Engagement:<\/strong>\s*)([^<]+)(<\/p>)/gi,
    (_full, open: string, val: string, close: string) => {
      let v = val.trim().replace(/_/g, ' ');
      if (opts?.isFellowship) v = v.replace(/^internship\b/i, 'fellowship');
      v = v.replace(/\bfull\s*time\b/i, 'Full-time');
      v = v.replace(/\bpart\s*time\b/i, 'Part-time');
      v = v.replace(/\bcontract\s+to\s+hire\b/i, 'Contract to hire');
      if (isJunkFactValue(v)) return '';
      return `${open}${escapeHtml(v)}${close}`;
    }
  );

  if (opts?.isFellowship) {
    html = html.replace(
      /(<p><strong>Engagement:<\/strong>\s*)internship((?:\s*\/\s*residency)?\s*<\/p>)/gi,
      '$1fellowship$2'
    );
  }

  // Padding "What you'll do" block appended after a real JD.
  html = html.replace(
    /<h3>\s*What you'?ll do\s*<\/h3>\s*(?:<ul>\s*)?(?:<li>\s*(?:Do the work posted for|Follow scope)[\s\S]*?<\/li>\s*)+(?:<\/ul>\s*)?/gi,
    ''
  );

  html = stripLeakedPromptText(html);
  // Remove dangling editorial references copied from source pages. They are
  // misleading when the referenced main posting is not linked on this page.
  html = html.replace(
    /<p>\s*This page is specific to one of the Anthropic Fellows Workstreams,[\s\S]*?main Anthropic Fellows posting\.\s*<\/p>/gi,
    ''
  );
  html = html.replace(
    /<p>\s*On our Alignment Science and Frontier Red Team blogs, you can read about some past Fellows projects, including:\s*<\/p>\s*/gi,
    ''
  );
  html = html.replace(
    /<p>\s*For a full list of representative projects for each area, please see these blog posts:[\s\S]*?Recommendations for Technical AI Safety Research Directions\.\s*<\/p>/gi,
    ''
  );
  if (opts?.applyUrl) {
    const applyLink = `<a href="${escapeHtml(opts.applyUrl)}" target="_blank" rel="noopener noreferrer">this link</a>`;
    html = html.replace(/\bApply using this link\.?/gi, `Apply using ${applyLink}.`);
  } else {
    html = html.replace(/<p>\s*Apply using this link\.?\s*<\/p>/gi, '');
  }
  html = html.replace(
    /<h3>\s*Nice to have\s*<\/h3>\s*(?:<(?:p|ul|ol)>[\s]*<\/(?:p|ul|ol)>\s*)*(?=<h[23]>|$)/gi,
    ''
  );
  html = stripScaffoldAndEmptyHeadings(html);
  html = html.replace(/<div class="jd-meta-facts">\s*<\/div>/gi, '');
  html = applyCompanyDisplayCasing(html, opts?.rawCompany, opts?.company, opts?.applyUrl);

  return mergeAdjacentLists(html);
}

/** Strip HTML → plain text for excerpts / schema. */
export function jobDescriptionPlainText(raw: string | null | undefined): string {
  if (!raw) return '';
  return cleanPublishText(
    stripAggregatorDisclaimers(stripMechanicalPivotSlop(raw))
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/** Word count of job body (for quality / noindex / sitemap). */
export function jobDescriptionWordCount(raw: string | null | undefined): number {
  const text = jobDescriptionPlainText(raw);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Minimum words for a full curated publish (manual/LLM gates).
 * Google Jobs / sitemap / index uses GOOGLE_JOBS_MIN_WORDS (420) so a
 * complete owned paraphrase is not held back waiting for padded filler.
 */
export const JOB_INDEXABLE_MIN_WORDS = 600;

/** Formatted curated body still renders when sanitizer trims below the index floor. */
export const JOB_CURATED_DISPLAY_FLOOR = 400;

export function isJobDescriptionIndexable(raw: string | null | undefined): boolean {
  return jobDescriptionWordCount(raw) >= JOB_INDEXABLE_MIN_WORDS;
}

/** Escape RegExp special chars. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** LLM-structured JD section headings — never show up in a preview excerpt. */
const SECTION_HEADING_RE =
  /\b(About the role|Key facts|What you'?ll do|What you will do|Requirements?|Nice to have|Skills (&|and) tools|Practical notes|Good to know)\b\s*:?\s*/gi;

/**
 * Plain excerpt for meta description / OG.
 * When `opts.title`/`opts.company` are provided, the leading "{Title} at
 * {Company}." intro line and the "{Title}." line are dropped, and all LLM
 * section headings are removed, so the preview is a natural body snippet that
 * never repeats the title. Truncation cuts at a sentence/word boundary.
 */
export function jobDescriptionExcerpt(
  raw: string | null | undefined,
  max = 160,
  opts?: { title?: string | null; company?: string | null }
): string {
  let text = jobDescriptionPlainText(raw);
  if (!text) return '';
  const title = opts?.title?.trim();
  if (title) {
    const company = opts?.company?.trim();
    if (company) {
      const withCo = text.replace(
        new RegExp(`^${escapeRegExp(title)}\\s+at\\s+${escapeRegExp(company)}\\.?`),
        ''
      ).trim();
      if (withCo) text = withCo;
    }
    const plain = text.replace(new RegExp(`^${escapeRegExp(title)}\\.?`), '').trim();
    if (plain) text = plain;
  }
  // Remove LLM section headings so the snippet reads as a description, not a TOC.
  text = text.replace(SECTION_HEADING_RE, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return '';

  if (text.length <= max) return text;

  // Cut at the last sentence boundary within the limit (clean, no mid-word "...").
  const slice = text.slice(0, max);
  const sentenceMatch = slice.match(/.*?[.!?](?=\s|$)/g);
  const last = sentenceMatch?.pop()?.trim();
  if (last && last.length >= 40) return last;
  const space = slice.lastIndexOf(' ');
  if (space > 40) return slice.slice(0, space).trimEnd() + '...';
  return text.slice(0, max - 1).trimEnd() + '...';
}

export function addJobApplyUtm(url: string, medium = 'job_detail'): string {
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source', 'cvin.bio');
    u.searchParams.set('utm_medium', medium);
    return u.toString();
  } catch {
    return url;
  }
}

export function companyLogoFallback(
  company: string,
  logo: string | null | undefined,
  applyUrl?: string | null
): string {
  return primaryCompanyLogoUrl(company, logo, 128, applyUrl);
}

export function jobTypeLabel(
  type: string | null | undefined,
  extra?: { title?: string | null; category?: string | null; tags?: string[] | null }
): string | null {
  if (extra && looksLikeFellowship(extra)) return 'Fellowship';
  if (!type) return null;
  const labels: Record<string, string> = {
    full_time: 'Full Time',
    part_time: 'Part Time',
    contract: 'Contract',
    internship: 'Internship',
    freelance: 'Freelance',
  };
  if (labels[type]) return labels[type];
  if (/^[a-z0-9]+(?:_[a-z0-9]+)+$/.test(type)) {
    return type
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return type;
}

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/** UUID v4-ish check for route param. */
export function isJobId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/** Company display name → URL segment (`Google` → `google`). */
export function companyToSlug(company: string): string {
  return toCompanySlug(company || '');
}

/** Valid short job slug segment (not a UTM suffix / reserved path). */
export const RESERVED_JOB_SEGMENTS = new Set([
  'th', 'wa', 'tg', 'li', 'x', 'tw', 'ig', 'fb', 'bsky', 'yt', 'rd',
  'api', 'editor', 'login', 'signup', 'jobs', 'fellowships', 'blog', 'admin',
]);

/** Noise words never used as slug tokens (matches .github/scripts/mint-slugs.mjs). */
const SLUG_STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'for', 'to', 'in', 'on', 'at', 'by', 'with',
  'from', 'as', 'is', 'are', 'be', 'remote', 'full', 'time', 'fulltime', 'part',
  'contract', 'intern', 'internship', 'senior', 'junior', 'staff', 'principal',
  'i', 'ii', 'iii', 'iv', 'sr', 'jr', 'us', 'uk', 'eu', 'emea', 'apac', 'americas',
  'month', 'months', 'fixed', 'term', 'temporary', 'opening', 'role', 'position',
  'opportunity', 'new', 'based',
]);

/** Token → short alias (matches .github/scripts/mint-slugs.mjs). */
const SLUG_ALIAS: Record<string, string | null> = {
  software: 'sw', engineer: 'eng', engineering: 'eng', engineers: 'eng',
  manager: 'mgr', management: 'mgmt', director: 'dir', product: 'prod',
  platform: 'plat', developer: 'dev', development: 'dev', designer: 'design',
  design: 'design', analyst: 'analyst', analytics: 'analytics',
  scientist: 'sci', science: 'sci', specialist: 'spec', operations: 'ops',
  operator: 'ops', technical: 'tech', technology: 'tech', solutions: 'sol',
  solution: 'sol', architect: 'arch', architecture: 'arch',
  infrastructure: 'infra', security: 'sec', compliance: 'comply',
  marketing: 'mkt', sales: 'sales', customer: 'cust', support: 'support',
  research: 'research', machine: 'ml', learning: null, artificial: 'ai',
  intelligence: null, frontend: 'fe', backend: 'be', fullstack: 'fullstk',
  'full-stack': 'fullstk', mobile: 'mobile', data: 'data', cloud: 'cloud',
  devops: 'devops', reliability: 'sre', site: null, lead: 'lead', head: 'head',
  vice: 'vp', president: null, associate: 'assoc', assistant: 'asst',
  coordinator: 'coord', consultant: 'consult', partner: 'partner',
  account: 'acct', finance: 'fin', financial: 'fin', accounting: 'acct',
  legal: 'legal', people: 'people', human: 'hr', resources: null,
  recruiter: 'recruit', recruiting: 'recruit', growth: 'growth',
  revenue: 'rev', strategy: 'strat', strategic: 'strat', business: 'biz',
  program: 'prog', project: 'proj', network: 'net', systems: 'sys',
  system: 'sys', application: 'app', applications: 'app', quality: 'qa',
  assurance: null, testing: 'qa', automation: 'auto', healthcare: 'health',
  health: 'health', clinical: 'clinic', medical: 'med',
  generaliste: 'gp', medecin: 'md', médecin: 'md',
};

/**
 * Deterministic short pretty job slug from a title.
 * Same algorithm as .github/scripts/mint-slugs.mjs / enrich-remote-job-descriptions.mjs,
 * so write-path minting and any read-path fallback produce identical values.
 * `used` is the set of slug segments already taken at this company (per-company
 * collisions get a `{head≤6}-{2hex}` suffix); when omitted, collisions fall back
 * to the seeded hash directly so the result is still unique-per-seed.
 */
export function mintPrettyJobSlug(
  title: string,
  uniqueSeed: string,
  used?: Set<string>
): string {
  const tokens = String(title || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/r\s*&\s*d|\br\s+and\s+d\b/gi, ' rd ')
    .replace(/ai\s*[&/]\s*ml/gi, ' ai ml ')
    .replace(/full[\s-]*stack/gi, ' fullstack ')
    .replace(/front[\s-]*end/gi, ' frontend ')
    .replace(/back[\s-]*end/gi, ' backend ')
    .replace(/&/g, ' ')
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !/^\d+$/.test(t) && t.length < 18);

  const out: string[] = [];
  for (const raw of tokens) {
    let t = raw;
    if (SLUG_STOP.has(t)) continue;
    if (Object.prototype.hasOwnProperty.call(SLUG_ALIAS, t)) {
      const a = SLUG_ALIAS[t];
      if (a == null) continue;
      t = a;
    }
    if (out.includes(t)) continue;
    const next = out.length ? `${out.join('-')}-${t}` : t;
    // SHORT slugs: max 2 tokens; 2-token job slug ≤ 8 chars
    if (out.length >= 1 && next.length > 8) break;
    out.push(t);
    if (out.length >= 2) break;
  }

  let base = out.join('-') || 'role';
  if (base.length > 12) {
    const parts = base.split('-');
    while (parts.length > 1 && parts.join('-').length > 12) parts.pop();
    base = parts.join('-');
    if (base.length > 12) base = base.slice(0, 12);
  }
  base = base.replace(/-+/g, '-').replace(/^-|-$/g, '') || 'role';

  const taken = used ? used.has.bind(used) : () => false;
  let slug = base;
  // Read-path mint (no `used` set) always mixes in a short id hash so two
  // "Product *" roles at the same company never share /company/prod.
  if (!used) {
    const h = md5Hex(uniqueSeed).slice(0, 2);
    const head = (base.split('-')[0] || 'role').slice(0, 6);
    slug = `${head}-${h}`;
  } else if (taken(slug) || RESERVED_JOB_SEGMENTS.has(slug)) {
    const h = md5Hex(uniqueSeed).slice(0, 2);
    const first = (base.split('-')[0] || 'role').slice(0, 6);
    slug = `${first}-${h}`;
  }
  let n = 2;
  while (
    taken(slug) ||
    RESERVED_JOB_SEGMENTS.has(slug) ||
    !/^[a-z0-9][a-z0-9-]{0,23}$/.test(slug)
  ) {
    // Widen the hash space as collisions pile up (2 hex → 4 hex → …) so the loop
    // always terminates even for hundreds of same-prefix titles at one company.
    const width = Math.min(2 + Math.floor(n / 8), 8);
    const h = md5Hex(`${uniqueSeed}:${n++}`).slice(0, width);
    const head = (base.split('-')[0] || 'role').slice(0, 6);
    slug = `${head}-${h}`;
  }
  used?.add(slug);
  return slug;
}

/**
 * Pure-JS MD5 — edge-safe (no node:crypto) yet byte-identical to the crypto
 * MD5 used by .github/scripts minting, so read-path and write-path slugs agree.
 */
function md5Hex(s: string): string {
  const K = new Uint32Array([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ]);
  const S: number[] = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];

  const str = String(s);
  const bytes = new Uint8Array(new TextEncoder().encode(str));

  const bitLen = bytes.length * 8;
  const paddedLen = (((bytes.length + 8) >> 6) + 1) << 6;
  const msg = new Uint8Array(paddedLen);
  msg.set(bytes);
  msg[bytes.length] = 0x80;
  const dv = new DataView(msg.buffer);
  dv.setUint32(paddedLen - 8, bitLen >>> 0, true);
  dv.setUint32(paddedLen - 4, Math.floor(bitLen / 0x100000000), true);

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  for (let off = 0; off < paddedLen; off += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) M[j] = dv.getUint32(off + j * 4, true);
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      const Fn = (F + A + K[i] + M[g]) | 0;
      A = D; D = C; C = B;
      B = (B + ((Fn << S[i]) | (Fn >>> (32 - S[i])))) | 0;
    }
    a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
  }
  const hex = (n: number) => {
    const w = n >>> 0;
    return (
      (w & 0xff).toString(16).padStart(2, '0') +
      ((w >>> 8) & 0xff).toString(16).padStart(2, '0') +
      ((w >>> 16) & 0xff).toString(16).padStart(2, '0') +
      ((w >>> 24) & 0xff).toString(16).padStart(2, '0')
    );
  };
  return hex(a0) + hex(b0) + hex(c0) + hex(d0);
}

/**
 * Short job slug from external_id when curated as `{company}_{slug}`
 * e.g. external_id `google_mkt` + company Google → `mkt`
 * Otherwise null (callers fall back to the persisted slug column or mint).
 */
export function shortJobSlug(
  company: string,
  externalId: string | null | undefined,
  companyKey?: string | null
): string | null {
  if (!externalId) return null;
  const co = routeCompanySlug({ company, company_key: companyKey });
  if (!co) return null;
  const prefix = `${co}_`;
  const lower = externalId.toLowerCase();
  if (!lower.startsWith(prefix)) return null;
  const rest = externalId.slice(prefix.length).toLowerCase();
  // Must be a routeable short pretty slug (rejects reserved, hex, long/multi-token).
  if (!isShortJobSlug(rest)) return null;
  if (/^[0-9a-f]{8,}$/i.test(rest)) return null; // reject pure hex ids
  if (rest.length > 12 && /^\d+$/.test(rest)) return null; // reject google numeric job ids
  const parts = rest.split('-').filter(Boolean);
  if (parts.length === 0 || parts.length > 2) return null;
  if (parts.length === 1 && parts[0].length > 12) return null;
  if (parts.length === 2) {
    // collision: eng-a3  OR short semantic: sw-eng (≤8)
    if (/^[0-9a-f]{2,4}$/.test(parts[1])) {
      if (parts[0].length > 6) return null;
    } else if (rest.length > 8) {
      return null;
    }
  }
  return rest;
}

/**
 * The pretty job slug segment for a job, in priority order:
 *  1. Persisted `slug` column ({company_slug}_{jobSlug}) — canonical, minted at insert.
 *  2. Routeable `external_id` ({company}_{short slug}) — legacy pretty rows.
 * Returns null only when the company slug is empty.
 */
function isUsablePrettyJobSeg(raw: string): boolean {
  const s = String(raw || '').toLowerCase();
  if (!isShortJobSlug(s)) return false;
  if (/^[0-9a-f]{8,}$/i.test(s)) return false;
  if (/^\d+$/.test(s) && s.length > 8) return false;
  return true;
}

function peelStoredJobSeg(stored: string | null | undefined, hub: string): string | null {
  const s = String(stored || '').trim().toLowerCase();
  if (!s) return null;
  for (const prefix of companyHubAliasPrefixes(hub)) {
    const head = `${prefix}_`;
    if (s.startsWith(head)) {
      const rest = s.slice(head.length);
      if (isUsablePrettyJobSeg(rest)) return rest;
    }
  }
  if (isUsablePrettyJobSeg(s)) return s;
  return null;
}

export function jobStoredSlug(job: {
  company: string;
  company_key?: string | null;
  external_id?: string | null;
  slug?: string | null;
}): string | null {
  const co = routeCompanySlug(job);
  if (!co) return null;
  const fromSlug = peelStoredJobSeg(job.slug, co);
  if (fromSlug) return fromSlug;
  const fromExternal = peelStoredJobSeg(job.external_id, co);
  if (fromExternal) return fromExternal;
  return shortJobSlug(job.company, job.external_id, job.company_key);
}

/**
 * Truncated pretty URLs like /openai/prod should still reach /openai/prod-mgr.
 * Require a `-` after the hint so `prod` does not steal `production`.
 */
export function jobSlugSegmentMatchesHint(
  segment: string | null | undefined,
  hint: string
): boolean {
  const s = String(segment || '').toLowerCase();
  const h = String(hint || '').toLowerCase();
  if (!s || !h) return false;
  return s === h || s.startsWith(`${h}-`);
}

/**
 * Whether a job owns `/{hub}/{want}` as a stored, minted (read or write),
 * or short external segment. Used by the pretty-URL legacy resolver so
 * `/aspen/sci-tech` still reaches a row stored as `aspen-institute_sci-e9`.
 */
export function jobMatchesLegacySlugHint(
  job: {
    id: string;
    title?: string | null;
    company?: string | null;
    company_key?: string | null;
    external_id?: string | null;
    slug?: string | null;
  },
  want: string
): boolean {
  const hint = String(want || '').toLowerCase();
  if (!hint || !job?.id) return false;
  const rest = jobStoredSlug({
    company: job.company || '',
    company_key: job.company_key,
    external_id: job.external_id,
    slug: job.slug,
  });
  const minted = mintPrettyJobSlug(job.title || '', job.id).toLowerCase();
  const mintedWrite = mintPrettyJobSlug(job.title || '', job.id, new Set()).toLowerCase();
  const short = shortJobSlug(job.company || '', job.external_id, job.company_key)?.toLowerCase();
  return (
    jobSlugSegmentMatchesHint(rest, hint) ||
    minted === hint ||
    mintedWrite === hint ||
    short === hint
  );
}

/**
 * Canonical public path for a job — ALWAYS /{company}/{jobSlug}.
 * Persisted slug wins, then routeable external_id, then a deterministic
 * mint from the title. Never /jobs/{uuid} except when the company has no
 * routeable slug segment at all (pathological data).
 */
export function jobPublicPath(job: {
  id: string;
  company: string;
  company_key?: string | null;
  title?: string | null;
  external_id?: string | null;
  slug?: string | null;
}): string {
  const co = routeCompanySlug(job);
  if (!co) return `/jobs/${job.id}`;
  const jobSlug = jobStoredSlug(job) ?? mintPrettyJobSlug(job.title ?? '', job.id);
  return `/${co}/${jobSlug}`;
}

/** external_id used to resolve `/google/mkt` → `google_mkt` */
export function jobExternalIdFromSlugs(companySlug: string, jobSlug: string): string {
  return `${companySlug.toLowerCase()}_${jobSlug.toLowerCase()}`;
}

export function isShortJobSlug(s: string): boolean {
  if (!s || RESERVED_JOB_SEGMENTS.has(s.toLowerCase())) return false;
  return /^[a-z0-9][a-z0-9-]{0,23}$/i.test(s);
}

/**
 * Path for sitemaps / crawl: pretty /{company}/{slug} for ANY job the
 * /[company]/[jobSlug] route can resolve. Broader than shortJobSlug (mint rules)
 * so enriched multi-token slugs still get listed. Never /jobs/{uuid} and never
 * null unless the company has no routeable slug segment.
 */
export function jobSitemapPath(job: {
  company: string;
  external_id?: string | null;
  slug?: string | null;
  title?: string | null;
}): string | null {
  const co = companyToSlug(job.company);
  if (!co) return null;
  const jobSlug = jobStoredSlug(job);
  if (jobSlug) return `/${co}/${jobSlug}`;
  return null;
}
