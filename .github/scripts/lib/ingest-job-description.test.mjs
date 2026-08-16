import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { htmlToIngestText, ingestSourceDescription, INGEST_DESC_MAX } from './ingest-job-description.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('ingestSourceDescription', () => {
  it('keeps every list item from ATS HTML instead of flattening to a short blob', () => {
    const html = `<h2>What you'll do</h2><ul>${Array.from({ length: 20 }, (_, i) => `<li>Duty number ${i} with extra detail about the work.</li>`).join('')}</ul>`;
    const text = ingestSourceDescription({ html, plain: 'short' });
    assert.match(text, /What you'll do/);
    assert.equal((text.match(/^- Duty number/gm) || []).length, 20);
    assert.ok(text.length > 500);
  });

  it('does not 5k-truncate a long posting', () => {
    const plain = 'word '.repeat(2000).trim();
    const text = ingestSourceDescription({ plain });
    assert.ok(text.length > 5000);
    assert.ok(text.length <= INGEST_DESC_MAX);
  });

  it('prefers HTML when it is richer than descriptionPlain', () => {
    const html = '<p>About</p><ul><li>Write campaigns</li><li>Edit landing pages</li><li>Work with brand</li></ul>';
    const text = ingestSourceDescription({ html, plain: 'Copywriter role' });
    assert.match(text, /Write campaigns/);
    assert.match(text, /Edit landing pages/);
  });

  it('jobs-sync stores full ingest text, not substring 5000', () => {
    const src = readFileSync(join(root, '.github/scripts/jobs-sync.mjs'), 'utf8');
    assert.match(src, /ingestSourceDescription/);
    assert.doesNotMatch(src, /substring\(0,\s*5000\)/);
  });
});

describe('htmlToIngestText', () => {
  it('turns li tags into markdown-style lines', () => {
    const t = htmlToIngestText('<ul><li>First</li><li>Second</li></ul>');
    assert.match(t, /- First/);
    assert.match(t, /- Second/);
  });
});
