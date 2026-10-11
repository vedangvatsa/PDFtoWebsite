/** Original employer descriptions. `curated-jd` remains the legacy SQL
 * publication selector; `source-jd` distinguishes original text from rewrites.
 */
import { Parser } from 'htmlparser2';

export const SOURCE_JD_TAG = 'source-jd';
export const SOURCE_HTML_TAG = 'source-html';
export const SOURCE_CLOSED_TAG = 'source-closed';
export const SOURCE_ARCHIVED_TAG = 'source-archived';
export const SOURCE_DESCRIPTION_MAX_BYTES = 32 * 1024;
export const SOURCE_DESCRIPTION_MIN_WORDS = 40;
export const SOURCE_DESCRIPTION_MAX_ROWS = 4000;

export function isSourceJd(tags) {
  return Array.isArray(tags) && tags.includes(SOURCE_JD_TAG);
}

export function sourceDescriptionWords(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

/** @param {unknown} text @param {unknown} [tags] */
export function sourceDescriptionValid(text, tags = []) {
  return typeof text === 'string' && sourceDescriptionWords(sourceDescriptionPlain(text, tags)) >= SOURCE_DESCRIPTION_MIN_WORDS &&
    new TextEncoder().encode(text).byteLength <= SOURCE_DESCRIPTION_MAX_BYTES;
}

const entities = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', bull: '•', hellip: '…',
};
function decodeEntities(text) {
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (whole, entity) => {
    if (!entity.startsWith('#')) return entities[entity.toLowerCase()] ?? whole;
    const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : whole;
  });
}

/** Formatting conversion only: no paraphrasing, punctuation rewriting, filler,
 * or truncation. Oversized descriptions are rejected by the publication gate.
 */
export function originalDescriptionText({ html, plain } = {}) {
  if (!html) return String(plain || '').replace(/\r\n?/g, '\n').trim();
  let text = String(html);
  // Greenhouse can return an entity-encoded HTML document.
  if (!/<(?:p|div|h[1-6]|ul|li)\b/i.test(text) && /&lt;(?:p|div|h[1-6]|ul|li)\b/i.test(text)) text = decodeEntities(text);
  text = text
    .replace(/<(script|style|noscript|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(/<\/(?:p|div|section|h[1-6]|ul|ol)\s*>/gi, '\n\n')
    .replace(/<\/(?:li|tr)\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  return decodeEntities(text).replace(/\r/g, '').replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const allowed = new Set(['p', 'div', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'br', 'hr', 'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td']);
const blocked = new Set(['script', 'style', 'noscript', 'svg', 'math', 'iframe', 'object', 'embed', 'template', 'form', 'button', 'select', 'textarea']);
const mapped = { h1: 'h2', h5: 'h4', h6: 'h4', b: 'strong', i: 'em', section: 'div', article: 'div' };

/** Real HTML parser + allowlist at BOTH ingest and render. Preserve source
 * structure, remove executable elements/attributes, and resolve employer links.
 */
export function sanitizeSourceDescription(html, baseUrl = 'https://cvin.bio') {
  let input = String(html || '');
  if (!/<(?:p|div|h[1-6]|ul|li)\b/i.test(input) && /&lt;(?:p|div|h[1-6]|ul|li)\b/i.test(input)) input = decodeEntities(input);
  const stack = [];
  const out = [];
  const parser = new Parser({
    onopentag(name, attributes) {
      const suppress = Boolean(stack.at(-1)?.suppress) || blocked.has(name);
      let tag = mapped[name] || name;
      let attrs = '';
      for (const key of tag === 'ol' ? ['start'] : tag === 'li' ? ['value'] : ['td', 'th'].includes(tag) ? ['colspan', 'rowspan'] : []) {
        if (/^\d{1,4}$/.test(attributes[key] || '')) attrs += ` ${key}="${attributes[key]}"`;
      }
      if (tag === 'a' && !suppress) {
        try {
          const href = new URL(attributes.href || '', baseUrl);
          if (!attributes.href || !['https:', 'http:', 'mailto:'].includes(href.protocol)) tag = '';
          else attrs = ` href="${escape(href.href)}" target="_blank" rel="noopener noreferrer"`;
        } catch { tag = ''; }
      }
      const emit = !suppress && allowed.has(tag);
      stack.push({ tag, emit, suppress });
      if (emit) out.push(`<${tag}${attrs}>`);
    },
    ontext(text) { if (!stack.at(-1)?.suppress) out.push(escape(text)); },
    onclosetag() {
      const frame = stack.pop();
      if (frame?.emit && !['br', 'hr'].includes(frame.tag)) out.push(`</${frame.tag}>`);
    },
  }, { decodeEntities: true });
  parser.end(input);
  return out.join('').trim();
}

/** @param {unknown} text @param {unknown} [tags] */
export function sourceDescriptionPlain(text, tags = []) {
  return Array.isArray(tags) && tags.includes(SOURCE_HTML_TAG)
    ? originalDescriptionText({ html: sanitizeSourceDescription(text) })
    : String(text || '');
}

/** Legacy plain snapshots remain safe; versioned HTML retains its structure. */
/** @param {unknown} text @param {unknown} [tags] */
export function sourceDescriptionHtml(text, tags = []) {
  if (Array.isArray(tags) && tags.includes(SOURCE_HTML_TAG)) return sanitizeSourceDescription(text);
  return String(text || '').split(/\n{2,}/).filter(Boolean)
    .map((block) => `<p>${escape(block).replace(/\n/g, '<br>')}</p>`).join('');
}

export function sourcePublicationPatch(job, description, { html = false } = {}) {
  const stored = html ? sanitizeSourceDescription(description, job.apply_url) : description;
  const formatTags = html ? [SOURCE_HTML_TAG] : [];
  if (!sourceDescriptionValid(stored, formatTags)) return null;
  const tags = (Array.isArray(job.tags) ? job.tags : []).filter((tag) => !['curated-jd', SOURCE_JD_TAG, SOURCE_HTML_TAG, SOURCE_CLOSED_TAG, SOURCE_ARCHIVED_TAG].includes(tag));
  return { description: stored, tags: [...tags, 'curated-jd', SOURCE_JD_TAG, ...formatTags] };
}
