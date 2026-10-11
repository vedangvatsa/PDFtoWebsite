/** Original employer descriptions. `curated-jd` remains the legacy SQL
 * publication selector; `source-jd` distinguishes original text from rewrites.
 */
export const SOURCE_JD_TAG = 'source-jd';
export const SOURCE_ARCHIVED_TAG = 'source-archived';
export const SOURCE_DESCRIPTION_MAX_BYTES = 32 * 1024;
export const SOURCE_DESCRIPTION_MIN_WORDS = 40;
export const SOURCE_DESCRIPTION_MAX_ROWS = 2000;

export function isSourceJd(tags) {
  return Array.isArray(tags) && tags.includes(SOURCE_JD_TAG);
}

export function sourceDescriptionWords(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

export function sourceDescriptionValid(text) {
  return typeof text === 'string' && sourceDescriptionWords(text) >= SOURCE_DESCRIPTION_MIN_WORDS &&
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

/** Stored source bodies are plain text; escape every byte of markup at render. */
export function sourceDescriptionHtml(text) {
  const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  return String(text || '').split(/\n{2,}/).filter(Boolean)
    .map((block) => `<p>${escape(block).replace(/\n/g, '<br>')}</p>`).join('');
}

export function sourcePublicationPatch(job, description) {
  if (!sourceDescriptionValid(description)) return null;
  const tags = (Array.isArray(job.tags) ? job.tags : []).filter((tag) => !['curated-jd', SOURCE_JD_TAG, SOURCE_ARCHIVED_TAG].includes(tag));
  return { description, tags: [...tags, 'curated-jd', SOURCE_JD_TAG] };
}
