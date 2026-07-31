/**
 * Job description cleaning + URL helpers for cvin.bio JD pages.
 * Descriptions in DB are raw HTML (ATS) or plain text. We sanitize and
 * lightly restructure for readable job pages.
 *
 * All publish output runs through src/lib/noslop.ts (see /noslop.md).
 */

import { cleanPublishHtml, cleanPublishText } from '@/lib/noslop';

/** Bump when display formatting changes — invalidates job snapshot caches. */
export const JOB_DESCRIPTION_FORMAT_VERSION = 2;

/** Tailwind prose for every job detail description block. */
export const JOB_DESCRIPTION_PROSE_CLASS =
  'job-description text-[13px] sm:text-[14px] leading-relaxed text-zinc-600 min-w-0 max-w-full overflow-x-auto ' +
  'break-words [overflow-wrap:anywhere] ' +
  '[&_*]:max-w-full ' +
  '[&_img]:h-auto [&_img]:max-w-full ' +
  '[&_table]:block [&_table]:w-full [&_table]:overflow-x-auto ' +
  '[&_pre]:overflow-x-auto [&_pre]:max-w-full [&_pre]:whitespace-pre-wrap ' +
  '[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:pt-4 [&_h2]:border-t [&_h2]:border-zinc-200 [&_h2]:text-[11px] sm:[&_h2]:text-xs [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:tracking-wider [&_h2]:text-zinc-500 [&_h2]:first:mt-0 [&_h2]:first:pt-0 [&_h2]:first:border-t-0 ' +
  '[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:pt-4 [&_h3]:border-t [&_h3]:border-zinc-200 [&_h3]:text-[11px] sm:[&_h3]:text-xs [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-wider [&_h3]:text-zinc-500 [&_h3]:first:mt-0 [&_h3]:first:pt-0 [&_h3]:first:border-t-0 ' +
  '[&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-zinc-900 ' +
  '[&_p]:mb-3 [&_p]:leading-relaxed ' +
  '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:marker:text-zinc-400 ' +
  '[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 ' +
  '[&_li]:text-zinc-600 ' +
  '[&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline [&_a]:break-all ' +
  '[&_strong]:font-semibold [&_strong]:text-zinc-800 ' +
  '[&_b]:font-semibold [&_b]:text-zinc-800 ' +
  '[&_blockquote]:border-l-2 [&_blockquote]:border-zinc-200 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-zinc-500';

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

  const flush = () => {
    while (buf.length && !buf[0].trim()) buf.shift();
    while (buf.length && !buf[buf.length - 1].trim()) buf.pop();
    if (!buf.length) return;
    out.push(renderPlainBlock(buf.join('\n')));
    buf = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      flush();
      continue;
    }
    if (isSectionHeading(trimmed)) {
      flush();
      out.push(`<h3>${escapeHtml(trimmed)}</h3>`);
      continue;
    }
    if (isSubSectionHeading(trimmed)) {
      flush();
      out.push(`<h4>${escapeHtml(trimmed.replace(/^-\s*/, '').trim())}</h4>`);
      continue;
    }
    buf.push(line);
  }
  flush();
  return out.join('\n');
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
    if (numbered && numbered[3].length > 15) {
      expanded.push(`${numbered[1]}. ${numbered[2]}`);
      expanded.push(...splitLetteredSubclauses(numbered[3]));
      continue;
    }

    if (/\s\d{1,2}\.\s+[A-Z]/.test(line) && line.length > 120) {
      const parts = line.split(/\s+(?=\d{1,2}\.\s+[A-Z])/);
      for (const part of parts) {
        const inner = part.trim().match(
          /^(\d{1,2})\.\s+([A-Z][A-Za-z0-9 /&'’()-]{2,60}?)\s+(.+)$/
        );
        if (inner) {
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

/** Section titles commonly found in curated / government JD plain text. */
function isSectionHeading(line: string): boolean {
  if (!line || line.length > 90) return false;
  if (/^Who can apply\??$/i.test(line)) return true;
  if (/^Key facts$/i.test(line)) return true;
  if (/^Skills (&|and) tools$/i.test(line)) return true;
  if (/^Program highlights$/i.test(line)) return true;
  if (/^Current cycles$/i.test(line)) return true;
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
  if (/^Role:\s+\S+/i.test(line)) return true;
  // Numbered section titles on their own line: "1. Documentation Requirements"
  if (/^\d{1,2}\.\s+[A-Z][A-Za-z0-9 /&'’()-]{2,70}$/.test(line)) return true;
  // Short noun-phrase labels ending with colon (not full sentences)
  if (
    line.length < 45 &&
    /:$/.test(line) &&
    /^[A-Z][A-Za-z0-9 /&'’()-]{1,42}:$/.test(line) &&
    !/\b(who|that|which|with|from|are|can|the|and|for|only|those|candidates)\b/i.test(
      line
    )
  ) {
    return true;
  }
  return false;
}

/** In-section labels: "5. SOC Platform", "- 1. AI Integration: ..." title only */
function isSubSectionHeading(line: string): boolean {
  const t = line.replace(/^-\s*/, '').trim();
  if (/^\d{1,2}\.\s+[A-Z][A-Za-z0-9 /&'’()-]{3,70}$/.test(t)) return true;
  if (/^Technical Requirements$/i.test(t)) return true;
  return false;
}

function isLabelValueLine(line: string): boolean {
  return /^[A-Za-z][A-Za-z0-9 /&'’()-]{1,40}:\s+.+$/.test(line.trim());
}

function renderPlainBlock(block: string): string {
  const trimmed = block.trim();
  const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);

  // Key facts style: Location: Delhi / Duration: 75 Days
  if (lines.length > 0 && lines.every(isLabelValueLine)) {
    const items = lines
      .map((l) => {
        const m = l.match(/^([^:]+):\s+(.+)$/);
        if (!m) return '';
        return `<li><strong>${escapeHtml(m[1])}:</strong> ${escapeHtml(m[2])}</li>`;
      })
      .filter(Boolean)
      .join('');
    return `<ul>${items}</ul>`;
  }

  // Promote ALL-CAPS short lines to headings (common JD pattern)
  if (
    trimmed.length < 60 &&
    /^[A-Z0-9][A-Z0-9\s/&,:.\-]{4,}$/.test(trimmed) &&
    !/\.$/.test(trimmed)
  ) {
    return `<h3>${escapeHtml(trimmed)}</h3>`;
  }
  // Bullet-like lines
  if (
    /^[-•*]\s+/m.test(trimmed) &&
    trimmed.split('\n').every((l) => !l.trim() || /^[-•*]\s+/.test(l.trim()))
  ) {
    const items = trimmed
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const text = l.replace(/^[-•*]\s+/, '');
        const labeled = text.match(/^([^:]+):\s+(.+)$/);
        if (labeled) {
          return `<li><strong>${escapeHtml(labeled[1])}:</strong> ${escapeHtml(labeled[2])}</li>`;
        }
        return `<li>${escapeHtml(text)}</li>`;
      })
      .join('');
    return `<ul>${items}</ul>`;
  }
  // Label: value lines — bold the label
  const labeled = trimmed
    .split('\n')
    .map((l) => {
      const m = l.match(/^([A-Za-z][A-Za-z0-9 /&'’()-]{1,40}):\s+(.+)$/);
      if (m) {
        return `<strong>${escapeHtml(m[1])}:</strong> ${escapeHtml(m[2])}`;
      }
      return escapeHtml(l);
    })
    .join('<br />');
  return `<p>${labeled}</p>`;
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
    (l) => isSectionHeading(l) || isSubSectionHeading(l)
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
      if (isSectionHeading(t) || isSubSectionHeading(t)) {
        return `<h3>${escapeHtml(t)}</h3>`;
      }
      if (
        t.length < 60 &&
        /^[A-Z0-9][A-Z0-9\s/&,:.\-]{4,}$/.test(t) &&
        !/\.$/.test(t)
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

/** Plain excerpt for meta description / OG. */
export function jobDescriptionExcerpt(raw: string | null | undefined, max = 160): string {
  if (!raw) return '';
  const text = cleanPublishText(
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
  if (key === 'mospi') {
    const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio').replace(/\/$/, '');
    return `${site}/company-logos/mospi.png`;
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
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

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
  const rest = externalId.slice(prefix.length);
  // Short pretty slug: 1-24 chars, no uuid-ish noise
  if (!/^[a-z0-9][a-z0-9-]{0,23}$/i.test(rest)) return null;
  if (/^[0-9a-f]{8,}$/i.test(rest)) return null; // reject pure hex ids
  if (rest.length > 12 && /^\d+$/.test(rest)) return null; // reject google numeric job ids
  return rest.toLowerCase();
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

/** Valid short job slug segment (not a UTM suffix / reserved). */
const RESERVED_SEGMENTS = new Set([
  'th', 'wa', 'tg', 'li', 'x', 'tw', 'ig', 'fb', 'bsky', 'yt', 'rd',
  'api', 'editor', 'login', 'signup', 'jobs', 'blog', 'admin',
]);

export function isShortJobSlug(s: string): boolean {
  if (!s || RESERVED_SEGMENTS.has(s.toLowerCase())) return false;
  return /^[a-z0-9][a-z0-9-]{0,23}$/i.test(s);
}
