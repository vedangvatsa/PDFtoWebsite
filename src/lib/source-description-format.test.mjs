import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Parser } from 'htmlparser2';
import { sourceDescriptionHtml, sanitizeSourceDescription } from './source-job-description.mjs';

const tags = ['source-html'];
const visibleText = (html) => {
  let text = '';
  new Parser({ ontext(value) { text += value; } }).end(html);
  return text.replace(/\s+/g, '');
};

describe('readable original employer descriptions', () => {
  it('removes empty ATS wrappers, promotes section headings and separates loose legal copy without changing words', () => {
    const original = '<p><br>&nbsp;</p><div><div><p>Original introduction.<br>&nbsp;</p></div></div><p><br><strong>What you will do:</strong></p><ul><li><p>Build reliable APIs.</p></li><li><p>Document changes.<br>&nbsp;</p></li></ul><p></p>Base salary is $120,000–$150,000.<div><div><p>Equity and <a href="https://example.com/benefits">benefits</a>.</p></div></div>Applications remain open.<p>&nbsp;</p>';
    const formatted = sourceDescriptionHtml(original, tags);
    assert.match(formatted, /<h3>What you will do:<\/h3>/);
    assert.match(formatted, /<ul><li>Build reliable APIs\.<\/li><li>Document changes\.<\/li><\/ul>/);
    assert.match(formatted, /<p>Base salary is \$120,000–\$150,000\.<\/p>/);
    assert.match(formatted, /<p>Applications remain open\.<\/p>$/);
    assert.doesNotMatch(formatted, /<div|<p><\/p>|<br>/);
    assert.equal(visibleText(formatted), visibleText(sanitizeSourceDescription(original)));
    assert.equal(sourceDescriptionHtml(formatted, tags), formatted, 'formatting must be idempotent');
  });
  it('recognizes plain section labels and keeps inline bold emphasis inside paragraphs', () => {
    const html = sourceDescriptionHtml('<h3>The role</h3><p><strong>Shared Platform Architecture</strong></p><p>Work as a <strong>senior engineer</strong> on our team.</p><p><strong>This is a complete sentence.</strong></p><p>Requirements</p>', tags);
    assert.match(html, /<h4>Shared Platform Architecture<\/h4>/);
    assert.match(html, /<h4>Requirements<\/h4>/);
    assert.match(html, /<p>Work as a <strong>senior engineer<\/strong> on our team\.<\/p>/);
    assert.match(html, /<p><strong>This is a complete sentence\.<\/strong><\/p>/);
  });
  it('preserves nested lists, explicit numbering, tables and code whitespace', () => {
    const original = '<ol start="3"><li value="5"><p>First step</p><ul><li><strong>Nested requirement</strong></li></ul></li><li>Next step</li></ol><table><tbody><tr><th>Region</th><td colspan="2">US / Canada</td></tr></tbody></table><pre><code>  const html = &quot;&lt;p&gt;literal&lt;/p&gt;&quot;;\n\n  return html;</code></pre>';
    const formatted = sourceDescriptionHtml(original, tags);
    assert.match(formatted, /<ol start="3"><li value="5">/);
    assert.match(formatted, /<ul><li><strong>Nested requirement<\/strong><\/li><\/ul>/);
    assert.match(formatted, /<td colspan="2">US \/ Canada<\/td>/);
    assert.match(formatted, /<pre><code>  const html = &quot;&lt;p&gt;literal&lt;\/p&gt;&quot;;\n\n  return html;<\/code><\/pre>/);
    assert.equal(visibleText(formatted), visibleText(sanitizeSourceDescription(original)));
  });
  it('formats literal bullet/number lines without losing explicit list numbers', () => {
    assert.equal(sourceDescriptionHtml('<p>• Build APIs<br>• Review code</p>', tags), '<ul><li>Build APIs</li><li>Review code</li></ul>');
    assert.equal(sourceDescriptionHtml('<p>3. Design<br>5. Ship</p>', tags), '<ol start="3"><li>Design</li><li value="5">Ship</li></ol>');
    assert.equal(sourceDescriptionHtml('<p>• Build APIs</p><p>• Review code</p>', tags), '<ul><li>Build APIs</li><li>Review code</li></ul>');
    assert.equal(sourceDescriptionHtml('<p>* Mercury is a fintech company, not an FDIC-insured bank.</p>', tags), '<p>* Mercury is a fintech company, not an FDIC-insured bank.</p>');
    assert.equal(sourceDescriptionHtml('<p>2. Regulatory Strategy</p><p>Support applications.</p>', tags), '<p>2. Regulatory Strategy</p><p>Support applications.</p>');
  });
  it('trims promoted-heading whitespace on the first render', () => {
    const html = sourceDescriptionHtml('<p><strong>A Typical Day:&nbsp;</strong></p><p>Original wording.</p>', tags);
    assert.match(html, /^<h3>A Typical Day:<\/h3>/);
    assert.equal(sourceDescriptionHtml(html, tags), html);
  });
  it('formats plain originals into paragraphs, headings and lists while escaping literal HTML', () => {
    const html = sourceDescriptionHtml('About the role\n\nOriginal wording.\nSecond line.\n\nRequirements\n\n- TypeScript\n- SQL\n\n3. Design\n5. Ship\n\n<img src=x onerror=alert(1)>');
    assert.match(html, /<h3>About the role<\/h3><p>Original wording\.<br>Second line\.<\/p>/);
    assert.match(html, /<h3>Requirements<\/h3><ul><li>TypeScript<\/li><li>SQL<\/li><\/ul>/);
    assert.match(html, /<ol start="3"><li>Design<\/li><li value="5">Ship<\/li><\/ol>/);
    assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
    assert.doesNotMatch(html, /<img/);
    assert.equal(sourceDescriptionHtml('* Legal footnote.'), '<p>* Legal footnote.</p>');
  });
  it('retains safe link attributes and never reintroduces executable employer markup', () => {
    const html = sourceDescriptionHtml('<p onclick="bad()"><a href="https://example.com/?x=1&amp;y=2">Apply</a><a href="javascript:bad()">Unsafe</a></p><script>bad()</script><iframe src="https://evil.example"></iframe>', tags);
    assert.match(html, /href="https:\/\/example.com\/\?x=1&amp;y=2" target="_blank" rel="noopener noreferrer"/);
    assert.match(html, /Unsafe/);
    assert.doesNotMatch(html, /onclick|javascript|<script|<iframe|bad\(\)/);
  });
  it('bounds formatting recursion for unusually deep source wrappers', () => {
    const html = `${'<div>'.repeat(100)}Original wording.${'</div>'.repeat(100)}`;
    assert.equal(visibleText(sourceDescriptionHtml(html, tags)), 'Originalwording.');
  });
});
