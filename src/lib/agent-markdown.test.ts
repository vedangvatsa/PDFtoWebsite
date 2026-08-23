import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildAgentMarkdown } from './agent-markdown';

// Dummy env so the lazy Supabase proxy constructs; live pages then degrade
// to their fallback copy instead of throwing in the test runner.
process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'https://test.supabase.co';
process.env.SUPABASE_KEY ||= 'test-key-for-unit-tests-000000000000';

const STATIC_PAGES = ['home', 'about', 'contact', 'docs', 'terms', 'privacy', 'discover'] as const;

describe('agent markdown variants (/md/[page])', () => {
  for (const page of STATIC_PAGES) {
    it(`renders "${page}" as substantive markdown`, async () => {
      const md = await buildAgentMarkdown(page);
      assert.ok(md, `${page} returned null`);
      assert.match(md!, /^# /);
      assert.ok(md!.length >= 400, `${page} markdown too short (${md!.length} chars)`);
    });
  }

  it('home links developer resources by name', async () => {
    const md = await buildAgentMarkdown('home');
    assert.ok(md!.includes('/openapi.json'));
    assert.ok(md!.includes('/agent.txt'));
    assert.ok(md!.includes('/mcp'));
  });

  it('docs page documents rate-limit headers', async () => {
    const md = await buildAgentMarkdown('docs');
    assert.ok(md!.includes('RateLimit-Limit'));
    assert.ok(md!.includes('Retry-After'));
  });

  it('live pages degrade gracefully without a database', async () => {
    const jobs = await buildAgentMarkdown('jobs');
    assert.ok(jobs && jobs.startsWith('# ') && jobs.length > 200);
  });

  it('returns null for unknown pages (route answers JSON 404)', async () => {
    assert.equal(await buildAgentMarkdown('nonexistent'), null);
  });
});
