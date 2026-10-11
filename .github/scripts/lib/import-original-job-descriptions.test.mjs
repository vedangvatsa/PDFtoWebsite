import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { importOriginalDescriptions } from '../import-original-job-descriptions.mjs';

const text = 'The employer requires production engineering experience, code review, database maintenance, and clear written communication. '.repeat(4);
const row = { id: 'job-1', source: 'greenhouse', external_id: 'gh_example_123', apply_url: 'https://example.com/careers/123', tags: ['Engineering'] };
function database({ count = 0, rows = [row], expired = [], failedCount = false, race = false } = {}) {
  const requests = [];
  const client = createClient('https://database.example.invalid', 'test-key', { auth: { persistSession: false, autoRefreshToken: false }, global: {
    fetch: async (input, init) => {
      const url = new URL(input);
      const request = { method: init.method, query: url.searchParams, body: init.body ? JSON.parse(init.body) : null };
      requests.push(request);
      if (init.method === 'HEAD') return new Response(null, { status: failedCount ? 503 : 200, headers: { 'content-range': `*/${count}` } });
      if (init.method === 'PATCH') return Response.json(race ? [] : [{ id: request.query.get('id').slice(3) }]);
      if (request.query.get('tags') === 'cs.{source-jd}') return Response.json(expired);
      assert.equal(request.query.get('description'), 'is.null');
      assert.match(request.query.get('or'), /tags.not.cs.\{curated-jd\}/);
      return Response.json(rows);
    },
  } });
  return { client, requests };
}

describe('bounded original-description publication', () => {
  it('stores exact text with provenance, guards races, and preserves other tags', async () => {
    const { client, requests } = database();
    const result = await importOriginalDescriptions({ client, fetchOriginal: async () => ({ ok: true, text }) });
    assert.equal(result.imported, 1);
    const patch = requests.find((r) => r.method === 'PATCH');
    assert.deepEqual(patch.body, { description: text, tags: ['Engineering', 'curated-jd', 'source-jd'] });
    assert.equal(patch.query.get('apply_url'), `eq.${row.apply_url}`);
    assert.equal(patch.query.get('description'), 'is.null');
    const other = database({ race: true });
    assert.equal((await importOriginalDescriptions({ client: other.client, fetchOriginal: async () => ({ ok: true, text }) })).imported, 0);
  });
  it('dry-run fetches and validates but performs no writes or retention', async () => {
    const { client, requests } = database();
    assert.equal((await importOriginalDescriptions({ client, dryRun: true, fetchOriginal: async () => ({ ok: true, text }) })).imported, 1);
    assert.ok(requests.every((r) => ['GET', 'HEAD'].includes(r.method)));
  });
  it('refuses work without a complete storage count and stops at the row cap', async () => {
    const forbidden = async () => { throw new Error('must not fetch'); };
    await assert.rejects(importOriginalDescriptions({ client: database({ failedCount: true }).client, fetchOriginal: forbidden }), /storage budget/);
    assert.equal((await importOriginalDescriptions({ client: database({ count: 2000 }).client, fetchOriginal: forbidden })).selected, 0);
  });
  it('archives only expired source snapshots, keeping rows and URL metadata', async () => {
    const { client, requests } = database({ rows: [], expired: [{ id: 'old-source', tags: ['curated-jd', 'source-jd', 'Engineering'] }] });
    const result = await importOriginalDescriptions({ client });
    assert.equal(result.archived, 1);
    const patch = requests.find((r) => r.method === 'PATCH');
    assert.deepEqual(patch.body, { description: null, tags: ['Engineering', 'source-archived'] });
    assert.equal(patch.query.get('tags'), 'cs.{source-jd}');
    assert.match(patch.query.get('created_at'), /^lt\./);
    assert.equal(requests.some((r) => r.method === 'DELETE'), false);
  });
  it('leaves unavailable or incomplete source jobs unchanged and reports network failures', async () => {
    const first = database();
    const skipped = await importOriginalDescriptions({ client: first.client, fetchOriginal: async () => ({ ok: false, reason: 'source_not_found' }) });
    assert.equal(skipped.skipped.source_not_found, 1);
    assert.equal(first.requests.some((r) => r.method === 'PATCH'), false);
    const second = database();
    const failed = await importOriginalDescriptions({ client: second.client, fetchOriginal: async () => { throw new Error('ATS HTTP 503'); } });
    assert.equal(failed.failed, 1);
    assert.equal(failed.imported, 0);
    assert.equal(second.requests.some((r) => r.method === 'PATCH'), false);
    const oversized = await importOriginalDescriptions({ client: database().client, fetchOriginal: async () => {
      throw Object.assign(new Error('too large'), { code: 'SOURCE_BYTE_BUDGET' });
    } });
    assert.equal(oversized.skipped.source_response_too_large, 1);
    assert.equal(oversized.failed, 0);
  });
});
