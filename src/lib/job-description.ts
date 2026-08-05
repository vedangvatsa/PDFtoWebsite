/**
 * Job description cleaning + URL helpers for cvin.bio JD pages.
 * Descriptions in DB are raw HTML (ATS) or plain text. We sanitize and
 * lightly restructure for readable job pages.
 *
 * All publish output runs through src/lib/noslop.ts (see /noslop.md).
 */

import { cleanPublishHtml, cleanPublishText } from '@/lib/noslop';

/** Bump when display formatting changes — invalidates job snapshot caches. */
export const JOB_DESCRIPTION_FORMAT_VERSION = 10;

/** Tailwind prose for every job detail description block. Base + layout utilities; typography in globals.css */
export const JOB_DESCRIPTION_PROSE_CLASS =
  'job-description min-w-0 max-w-full overflow-x-auto break-words [overflow-wrap:anywhere] ' +
  '[&_*]:max-w-full ' +
  '[&_img]:h-auto [&_img]:max-w-full ' +
  '[&_table]:block [&_table]:w-full [&_table]:overflow-x-auto ' +
  '[&_pre]:overflow-x-auto [&_pre]:max-w-full [&_pre]:whitespace-pre-wrap';

/** Strip aggregator / mirror disclaimers that must never appear on job pages. */
export function stripAggregatorDisclaimers(text: string): string {
  if (!text) return '';
  let s = text;
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
  ];
  for (const re of patterns) s = s.replace(re, '');
  return s
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Normalize before DB upsert — strips aggregator footers, caps length. */
export function normalizeJobDescriptionForStorage(
  description: string | null | undefined
): string | null {
  if (!description) return null;
  const cleaned = stripAggregatorDisclaimers(description).trim();
  if (!cleaned) return null;
  return cleaned.length > 12000 ? cleaned.slice(0, 12000) : cleaned;
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
export function sanitizeJobHtml(raw: string): string {
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
    .replace(/<(p|div|h[2-6]|li|span)>\s*<\/\1>/gi, '')
    .replace(/(<br\s*\/?>\s*){3,}/gi, '<br /><br />')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return html;
}

/** Plain text → simple HTML paragraphs. */
export function plainTextToHtml(text: string): string {
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

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      if (inBody) flushBuf();
      continue;
    }
    if (isMetaSectionHeading(trimmed)) {
      flushBuf();
      flushIntro();
      inBody = true;
      const title = trimmed.replace(/:$/, '').trim();
      currentSection = title.toLowerCase();
      out.push(`<h3>${escapeHtml(title)}</h3>`);
      continue;
    }
    if (isSubSectionHeading(trimmed)) {
      flushBuf();
      flushIntro();
      inBody = true;
      out.push(`<h4>${escapeHtml(trimmed.replace(/^-\s*/, '').trim())}</h4>`);
      continue;
    }
    if (!inBody) {
      introBuf.push(trimmed);
    } else {
      buf.push(rawLine);
    }
  }
  flushBuf();
  flushIntro();
  return out.join('\n');
}

function renderIntroBlock(lines: string[]): string {
  const parts: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const role = t.match(/^Role:\s*(.+)$/i);
    if (role) {
      parts.push(`<p><strong>Role:</strong> ${escapeHtml(role[1].trim())}</p>`);
      continue;
    }
    const labeled = t.match(/^([^:\n]{2,48}):\s+(.+)$/);
    if (labeled && !isMetaSectionHeading(t)) {
      parts.push(
        `<p><strong>${escapeHtml(labeled[1].trim())}:</strong> ${escapeHtml(labeled[2].trim())}</p>`
      );
      continue;
    }
    parts.push(`<p>${escapeHtml(t)}</p>`);
  }
  return `<div class="jd-intro">${parts.join('\n')}</div>`;
}

function isMetaFactsSection(section: string): boolean {
  return section === 'key facts' || section === 'application window';
}

function renderMetaFactsBlock(block: string): string {
  const lines = block
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length > 0 && lines.every(isLabelValueLine)) {
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

    const numberedColon = line.match(
      /^(?:-\s*)?(\d{1,2})\.\s+([A-Za-z0-9 /&'’()-]{2,70}?):\s+(.+)$/
    );
    if (numberedColon && numberedColon[3].length > 5) {
      expanded.push(`${numberedColon[1]}. ${numberedColon[2]}`);
      expanded.push(`- ${numberedColon[3].trim()}`);
      continue;
    }

    const numbered = line.match(
      /^(?:-\s*)?(\d{1,2})\.\s+([A-Z][A-Za-z0-9 /&'’()-]{2,60}?)\s+(.+)$/
    );
    if (numbered && numbered[3].length > 15 && isNumberedSectionTitle(numbered[2])) {
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

  return expanded.join('\n');
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

/** Section titles for structured plain-text job descriptions. */
function isMetaSectionHeading(line: string): boolean {
  if (!line || line.length > 90) return false;
  if (/^Who can apply\??$/i.test(line)) return true;
  if (/^Key facts$/i.test(line)) return true;
  if (/^Skills (&|and) tools$/i.test(line)) return true;
  if (/^Program highlights$/i.test(line)) return true;
  if (/^Current cycles$/i.test(line)) return true;
  if (/^Official references$/i.test(line)) return true;
  if (/^Application window$/i.test(line)) return true;
  if (/^Desired start months/i.test(line)) return true;
  if (/^Areas of interest$/i.test(line)) return true;
  if (/^About the scheme$/i.test(line)) return true;
  if (/^About the program$/i.test(line)) return true;
  if (/^Work areas$/i.test(line)) return true;
  if (/^Practical notes$/i.test(line)) return true;
  if (/^Role & project$/i.test(line)) return true;
  if (/^Technical requirements$/i.test(line)) return true;
  if (/^Terms of engagement$/i.test(line)) return true;
  if (/^About (the )?(role|job|company|team|us|position)$/i.test(line)) return true;
  if (/^Requirements?$/i.test(line)) return true;
  if (/^Qualifications?$/i.test(line)) return true;
  if (/^What you('ll| will) do$/i.test(line)) return true;
  if (/^What we offer$/i.test(line)) return true;
  if (/^Benefits$/i.test(line)) return true;
  if (/^Nice to have$/i.test(line)) return true;
  if (/^Must have$/i.test(line)) return true;
  if (/^Open application window$/i.test(line)) return true;
  if (/^Placement groups$/i.test(line)) return true;
  if (/^Selection$/i.test(line)) return true;
  if (/^During the internship$/i.test(line)) return true;
  if (/^How to apply/i.test(line)) return true;
  if (/^Contact$/i.test(line)) return true;
  if (/^Responsibilities:?$/i.test(line)) return true;
  if (/^Skills Required:?$/i.test(line)) return true;
  if (/^Keywords:?$/i.test(line)) return true;
  if (isNumberedStepLine(line)) return false;
  const numberedTitle = line.match(/^(\d{1,2})\.\s+(.+)$/);
  if (numberedTitle && isNumberedSectionTitle(numberedTitle[2])) return true;
  return false;
}

/** @deprecated Use isMetaSectionHeading — kept for internal HTML restructuring. */
function isSectionHeading(line: string): boolean {
  return isMetaSectionHeading(line);
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
  if (!m) return `<p>${escapeHtml(line.trim())}</p>`;
  return `<p><strong>${escapeHtml(m[1].trim())}:</strong> ${escapeHtml(m[2].trim())}</p>`;
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
        return `<li><strong>${escapeHtml(labeled[1].trim())}:</strong> ${escapeHtml(labeled[2].trim())}</li>`;
      }
      return `<li>${escapeHtml(text)}</li>`;
    })
    .join('');
  return `<${tag}>${items}</${tag}>`;
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

  return `<p>${escapeHtml(trimmed)}</p>`;
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

/** Light restructuring for HTML that already has some markup. */
function structureJobHtml(html: string): string {
  let s = sanitizeJobHtml(html);

  s = s.replace(
    /<p>\s*<(?:strong|b)>([^<]{2,90})<\/(?:strong|b)>\s*<\/p>/gi,
    (_full, title: string) => {
      const t = decodeHtmlEntities(title.trim());
      if (isMetaSectionHeading(t) || isSubSectionHeading(t)) {
        return `<h3>${escapeHtml(t)}</h3>`;
      }
      if (
        t.length < 60 &&
        /^[A-Z0-9][A-Z0-9\s/&,:.\-]{4,}$/.test(t) &&
        !/\.$/.test(t) &&
        !/^Role:/i.test(t)
      ) {
        return `<h3>${escapeHtml(t)}</h3>`;
      }
      return `<p><strong>${escapeHtml(t)}</strong></p>`;
    }
  );

  s = s.replace(/<p>([\s\S]*?)<\/p>/gi, (_full, inner: string) => {
    const text = decodeHtmlEntities(inner.replace(/<[^>]+>/g, '').trim());
    if (text.length < 180 || !/\s\d{1,2}\.\s+[A-Z]/.test(text)) {
      return `<p>${inner}</p>`;
    }
    const restructured = plainTextToHtml(text);
    return restructured || `<p>${inner}</p>`;
  });

  return s;
}

/**
 * Normalize stored description into safe HTML for display.
 * Structure cleanup + mandatory noslop punctuation pass.
 */
export function formatJobDescription(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return '';

  const cleaned = stripAggregatorDisclaimers(raw);
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
  return cleanPublishHtml(structured);
}

/** Strip HTML → plain text for excerpts / schema. */
export function jobDescriptionPlainText(raw: string | null | undefined): string {
  if (!raw) return '';
  return cleanPublishText(
    stripAggregatorDisclaimers(raw)
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
 * Thin JD floor for indexation. Below this we noindex and skip sitemap
 * so Google doesn't treat meta-seed stubs as soft-404s.
 */
export const JOB_INDEXABLE_MIN_WORDS = 200;

export function isJobDescriptionIndexable(raw: string | null | undefined): boolean {
  return jobDescriptionWordCount(raw) >= JOB_INDEXABLE_MIN_WORDS;
}

/** Plain excerpt for meta description / OG. */
export function jobDescriptionExcerpt(raw: string | null | undefined, max = 160): string {
  const text = jobDescriptionPlainText(raw);
  if (!text) return '';
  if (text.length <= max) return text;
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

export function companyLogoFallback(company: string, logo: string | null | undefined): string {
  if (logo) return logo;
  const key = company.toLowerCase().trim();
  if (key === 'indian army') {
    const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio').replace(/\/$/, '');
    return `${site}/company-logos/indian-army.png`;
  }
  if (key === 'google') {
    const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio').replace(/\/$/, '');
    return `${site}/company-logos/google.png`;
  }
  if (key === 'mospi') {
    const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio').replace(/\/$/, '');
    return `${site}/company-logos/mospi.png`;
  }
  if (key === 'niti aayog') {
    const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio').replace(/\/$/, '');
    return `${site}/company-logos/niti-aayog.png`;
  }
  const domainGuess = company.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://www.google.com/s2/favicons?domain=${domainGuess}.com&sz=128`;
}

export function jobTypeLabel(type: string | null | undefined): string | null {
  if (!type) return null;
  const labels: Record<string, string> = {
    full_time: 'Full Time',
    part_time: 'Part Time',
    contract: 'Contract',
    internship: 'Internship',
    freelance: 'Freelance',
  };
  return labels[type] || type;
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
  return (company || '')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Valid short job slug segment (not a UTM suffix / reserved path). */
export const RESERVED_JOB_SEGMENTS = new Set([
  'th', 'wa', 'tg', 'li', 'x', 'tw', 'ig', 'fb', 'bsky', 'yt', 'rd',
  'api', 'editor', 'login', 'signup', 'jobs', 'blog', 'admin',
]);

/**
 * Short job slug from external_id when curated as `{company}_{slug}`
 * e.g. external_id `google_mkt` + company Google → `mkt`
 * Otherwise null (fall back to /jobs/{uuid}).
 */
export function shortJobSlug(
  company: string,
  externalId: string | null | undefined
): string | null {
  if (!externalId) return null;
  const co = companyToSlug(company);
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
 * Canonical public path for a job.
 * Prefer company-scoped short URLs: `/google/mkt`
 * Fallback: `/jobs/{uuid}`
 */
export function jobPublicPath(job: {
  id: string;
  company: string;
  external_id?: string | null;
}): string {
  const jobSlug = shortJobSlug(job.company, job.external_id);
  if (jobSlug) return `/${companyToSlug(job.company)}/${jobSlug}`;
  return `/jobs/${job.id}`;
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
 * Path for sitemaps / crawl: any URL the /[company]/[jobSlug] route can resolve.
 * Broader than shortJobSlug (mint rules) so enriched multi-token slugs still get listed.
 * Returns null for non-pretty external_ids (do not emit /jobs/{uuid} — weak SEO).
 */
export function jobSitemapPath(job: {
  company: string;
  external_id?: string | null;
}): string | null {
  const co = companyToSlug(job.company);
  const ext = job.external_id;
  if (!co || !ext) return null;
  const strict = shortJobSlug(job.company, ext);
  if (strict) return `/${co}/${strict}`;
  const prefix = `${co}_`;
  if (!ext.toLowerCase().startsWith(prefix)) return null;
  const rest = ext.slice(prefix.length).toLowerCase();
  if (!isShortJobSlug(rest)) return null;
  if (/^[0-9a-f]{8,}$/i.test(rest)) return null;
  return `/${co}/${rest}`;
}
