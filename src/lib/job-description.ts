/**
 * Job description cleaning + URL helpers for cvin.bio JD pages.
 * Descriptions in DB are raw HTML (ATS) or plain text. We sanitize and
 * lightly restructure for readable interstitial pages before external apply.
 *
 * All publish output runs through src/lib/noslop.ts (see /noslop.md).
 */

import { cleanPublishHtml, cleanPublishText } from '@/lib/noslop';

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
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();

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
    buf.push(line);
  }
  flush();
  return out.join('\n');
}

/** Section titles commonly found in curated / government JD plain text. */
function isSectionHeading(line: string): boolean {
  if (!line || line.length > 90) return false;
  if (/^Who can apply\??$/i.test(line)) return true;
  if (/^About the program$/i.test(line)) return true;
  if (/^Terms of Engagement\b/i.test(line)) return true;
  if (/^Responsibilities:?$/i.test(line)) return true;
  if (/^Skills Required:?$/i.test(line)) return true;
  if (/^Keywords:?$/i.test(line)) return true;
  if (/^Role:\s+\S+/i.test(line)) return true;
  // Numbered engagement clauses: "3. Working Hours", "6. Stipend"
  if (/^\d{1,2}\.\s+[A-Z][A-Za-z0-9 /&'’-]{1,60}$/.test(line)) return true;
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

function renderPlainBlock(block: string): string {
  const trimmed = block.trim();
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
      .map((l) => `<li>${escapeHtml(l.replace(/^[-•*]\s+/, ''))}</li>`)
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

/**
 * Normalize stored description into safe HTML for display.
 * Structure cleanup + mandatory noslop punctuation pass.
 */
export function formatJobDescription(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return '';

  const looksHtml = /<[a-z][\s\S]*>/i.test(raw);
  const structured = looksHtml ? sanitizeJobHtml(raw) : plainTextToHtml(raw);
  return cleanPublishHtml(structured);
}

/** Plain excerpt for meta description / OG. */
export function jobDescriptionExcerpt(raw: string | null | undefined, max = 160): string {
  if (!raw) return '';
  const text = cleanPublishText(
    raw
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
