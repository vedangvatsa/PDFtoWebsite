import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatJobDescription } from './job-description';
import { publishSafeDescription } from './job-detail-data';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('formatJobDescription meta facts', () => {
  it('drops Visa when the value is a placeholder like None stated', () => {
    const html = formatJobDescription(
      `<h3>Key facts</h3>
<p><strong>Location:</strong> Indonesia</p>
<p><strong>Engagement:</strong> Full-Time</p>
<p><strong>Visa:</strong> None stated</p>`
    );
    assert.match(html, /Location/i);
    assert.doesNotMatch(html, /\bVisa\b/i, html);
    assert.doesNotMatch(html, /None stated/i, html);
  });

  it('enrich stores above the public floor so formatter trim cannot blank the page', () => {
    const src = fs.readFileSync(
      path.join(root, '.github/scripts/lib/job-apply-source.mjs'),
      'utf8'
    );
    assert.match(src, /ENRICH_MIN_WORDS = 625/);
    const enrich = fs.readFileSync(
      path.join(root, '.github/scripts/enrich-remote-job-descriptions.mjs'),
      'utf8'
    );
    assert.match(enrich, /MIN_REWRITE_WORDS = ENRICH_MIN_WORDS/);
  });

  it('enrich validates formatted word floor before curated-jd', () => {
    const enrich = fs.readFileSync(
      path.join(root, '.github/scripts/enrich-remote-job-descriptions.mjs'),
      'utf8'
    );
    assert.match(enrich, /buildUniquenessPrompt/);
    assert.match(enrich, /uniquenessFromSource/);
    assert.match(enrich, /Priority wave/);
    assert.match(enrich, /fetchJobsByIds/);
    assert.match(enrich, /MAX_REWRITE_WORDS = 4000/);
    assert.match(enrich, /rewriteMeetsPublishFloor/);
    assert.match(enrich, /rewrite_formats_short/);
    assert.doesNotMatch(enrich, /filter\(\(t\) => t !== 'curated-jd'\)/);
  });

  it('keeps curated bodies when sanitizer trims slightly below 600 words', async (t) => {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      t.skip('needs Supabase credentials');
      return;
    }
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { data: job } = await sb
      .from('jobs')
      .select('*')
      .eq('external_id', 'ashby_poshmark_6e6d8a1d-b4f2-4ab3-82b3-01bfdf60aa20')
      .maybeSingle();
    if (!job?.description) {
      t.skip('poshmark copywriter row missing');
      return;
    }
    const pub = await publishSafeDescription(job as any, job.location || 'Remote');
    assert.equal(pub.kind, 'curated');
    assert.doesNotMatch(pub.plain, /company apply page/i);
    assert.match(pub.plain, /Copywriter|Creative Team/i);
  });

  it('drops plain-text Visa: None stated in Key facts blocks', () => {
    const html = formatJobDescription(`Key facts
Location: Indonesia
Visa: None stated
Engagement: Full-time`);
    assert.match(html, /Location/i);
    assert.doesNotMatch(html, /\bVisa\b/i, html);
  });
});
