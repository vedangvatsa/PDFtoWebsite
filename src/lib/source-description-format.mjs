import { Parser } from 'htmlparser2';

const escape = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const blockTags = new Set(['p', 'div', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr']);
const textOf = (node) => typeof node === 'string' ? node : node.children.map(textOf).join('');
const blank = (node) => typeof node === 'string' ? !node.trim() : node.tag === 'br' || !textOf(node).trim();
const element = (tag, children, attrs = {}) => ({ tag, children, attrs });

function trimEdges(children) {
  const result = [...children];
  while (result.length && blank(result[0])) result.shift();
  while (result.length && blank(result.at(-1))) result.pop();
  if (typeof result[0] === 'string') result[0] = result[0].trimStart();
  if (typeof result.at(-1) === 'string') result[result.length - 1] = result.at(-1).trimEnd();
  return result;
}

function paragraphize(children) {
  const result = []; let inline = [];
  const flush = () => {
    const content = trimEdges(inline);
    if (content.length) result.push(element('p', content));
    inline = [];
  };
  for (const child of children) {
    if (typeof child !== 'string' && blockTags.has(child.tag)) { flush(); result.push(child); }
    else inline.push(child);
  }
  flush();
  return result;
}

function bullet(line) {
  const unordered = line.trim().match(/^[•●▪◦‣*–—-]\s+(.+)$/u);
  if (unordered) return { tag: 'ul', text: unordered[1] };
  const ordered = line.trim().match(/^(\d{1,3})[.)]\s+(.+)$/);
  return ordered ? { tag: 'ol', text: ordered[2], number: Number(ordered[1]) } : null;
}

/** Receives already-sanitized HTML. Changes structure/whitespace only; wording,
 * links, emphasis, list order, legal copy and compensation are retained.
 */
export function formatSourceHtml(html) {
  const root = element('div', []), stack = [root];
  let tooDeep = false, headingLevel = 4;
  new Parser({
    onopentag(tag, attrs) {
      if (stack.length > 64) tooDeep = true;
      if (/^h[234]$/.test(tag)) headingLevel = Math.min(headingLevel, Number(tag[1]));
      const node = element(tag, [], attrs);
      stack.at(-1).children.push(node); stack.push(node);
    },
    ontext(text) { stack.at(-1).children.push(text); },
    onclosetag() { if (stack.length > 1) stack.pop(); },
  }).end(html);
  // Do not recursively walk adversarially deep employer markup.
  if (tooDeep) return html;
  const promotedTag = headingLevel < 4 ? `h${Math.min(4, headingLevel + 1)}` : 'h3';
  const normalize = (node, inList = false) => {
    if (typeof node === 'string') return [node];
    if (node.tag === 'pre' || node.tag === 'code') return [node];
    node.children = node.children.flatMap((child) => normalize(child, inList || node.tag === 'li'));
    if (node.tag === 'div') return paragraphize(node.children);
    if (['p', 'h2', 'h3', 'h4', 'li'].includes(node.tag)) node.children = trimEdges(node.children);
    if (node.tag !== 'br' && node.tag !== 'hr' && !textOf(node).trim()) return [];
    if (node.tag === 'li' && node.children.length === 1 && node.children[0]?.tag === 'p') node.children = node.children[0].children;
    return [node];
  };
  const promote = (node, inList = false) => {
    if (typeof node === 'string' || node.tag === 'pre' || node.tag === 'code') return node;
    node.children = node.children.map((child) => promote(child, inList || node.tag === 'li'));
    if (node.tag !== 'p' || inList) return node;
    const text = textOf(node).trim();
    const content = node.children.filter((child) => !blank(child));
    const boldOnly = content.length && content.every((child) => typeof child !== 'string' && child.tag === 'strong');
    const namedSection = text.length <= 120 && plainHeading.test(text);
    if ((boldOnly || namedSection) && text.length <= 140 && text.split(/\s+/).length <= 16 && !/[.!?]$/.test(text) && !/^[\p{Sc}\d•*-]/u.test(text)) {
      return element(promotedTag, trimEdges(boldOnly ? content.flatMap((child) => child.children) : node.children));
    }
    return node;
  };
  const manualItems = (node) => {
    if (node?.tag !== 'p' || !node.children.every((child) => typeof child === 'string' || child.tag === 'br')) return null;
    const lines = node.children.map((child) => typeof child === 'string' ? child : '\n').join('').split(/\n/).map((line) => line.trim()).filter(Boolean);
    const items = lines.map(bullet);
    return items.length && items.every((item) => item && item.tag === items[0].tag) ? items : null;
  };
  const groupLists = (nodes) => {
    const result = [];
    for (let i = 0; i < nodes.length; i++) {
      const items = manualItems(nodes[i]);
      if (!items) { result.push(nodes[i]); continue; }
      let next = i + 1;
      for (; next < nodes.length; next++) {
        const more = manualItems(nodes[next]);
        if (!more || more[0].tag !== items[0].tag) break;
        items.push(...more);
      }
      // A lone asterisk paragraph may be a legal footnote, and a numbered
      // paragraph may be a section title. Require an actual sequence of items.
      if (items.length < 2) { result.push(nodes[i]); continue; }
      const first = items[0];
      result.push(element(first.tag, items.map((item, index) => element('li', [item.text], item.number !== undefined && item.number !== first.number + index ? { value: String(item.number) } : {})),
        first.tag === 'ol' && first.number !== 1 ? { start: String(first.number) } : {}));
      i = next - 1;
    }
    return result;
  };
  const serialize = (node) => {
    if (typeof node === 'string') return escape(node);
    const attrs = Object.entries(node.attrs).map(([key, value]) => ` ${key}="${escape(value)}"`).join('');
    return `<${node.tag}${attrs}>${node.children.map(serialize).join('')}${['br', 'hr'].includes(node.tag) ? '' : `</${node.tag}>`}`;
  };
  return groupLists(paragraphize(root.children.flatMap((node) => normalize(node))).map((node) => promote(node))).map(serialize).join('');
}

const plainHeading = /^(?:about (?:us|the (?:role|team|company|job))|the (?:role|team|opportunity)|(?:key |your )?responsibilities|(?:minimum |preferred |required )?qualifications|(?:skills (?:and|&) )?requirements|(?:what|who) (?:you|we).{0,90}|benefits|compensation(?: (?:and|&) benefits)?|location|how to apply):?$/i;

/** Plain originals stay escaped, with semantic paragraphs/lists instead of a
 * wall of BR tags. No editorial rewriting or markdown HTML interpretation.
 */
export function formatPlainSourceDescription(text) {
  const out = []; let paragraph = [], list = null;
  const flushParagraph = () => { if (paragraph.length) out.push(`<p>${paragraph.map(escape).join('<br>')}</p>`); paragraph = []; };
  const flushList = () => {
    if (list) out.push(list.original.length === 1 && /^\*\s/.test(list.original[0])
      ? `<p>${escape(list.original[0])}</p>`
      : `<${list.tag}${list.start && list.start !== 1 ? ` start="${list.start}"` : ''}>${list.items.join('')}</${list.tag}>`);
    list = null;
  };
  for (const raw of String(text || '').replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line) { flushParagraph(); flushList(); continue; }
    const item = bullet(line);
    if (item) {
      flushParagraph();
      if (list && list.tag !== item.tag) flushList();
      if (!list) list = { tag: item.tag, start: item.number, items: [], original: [] };
      const value = item.number !== undefined && item.number !== list.start + list.items.length ? ` value="${item.number}"` : '';
      list.items.push(`<li${value}>${escape(item.text)}</li>`);
      list.original.push(line);
    } else {
      flushList();
      if (line.length <= 120 && plainHeading.test(line) && !/[.!?]$/.test(line)) { flushParagraph(); out.push(`<h3>${escape(line)}</h3>`); }
      else paragraph.push(line);
    }
  }
  flushParagraph(); flushList();
  return out.join('');
}
