import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readInventory, assertDirectorySize, assertCompleteCompanyStats } from './free-tier-guards.mjs';

describe('free tier ingestion correctness', () => {
  it('never returns an empty inventory on repeated backend failures', async () => {
    let calls = 0;
    await assert.rejects(readInventory('https://example.invalid/jobs', {}, {
      fetcher: async () => { calls++; return new Response('', { status: 522 }); }, pause: async () => {},
    }), /522/);
    assert.equal(calls, 5);
  });
  it('retries transient reads but preserves actual empty results', async () => {
    let calls = 0;
    const rows = await readInventory('https://example.invalid/jobs', {}, {
      fetcher: async () => ++calls === 1 ? new Response('', { status: 504 }) : Response.json([]), pause: async () => {},
    });
    assert.deepEqual(rows, []);
    assert.equal(calls, 2);
  });
  it('rejects successful responses with malformed inventories', async () => {
    await assert.rejects(readInventory('https://example.invalid/jobs', {}, {
      fetcher: async () => Response.json({ error: 'not rows' }), pause: async () => {},
    }), /non-array/);
  });
  it('accepts the real small directory but rejects catastrophic partial results', () => {
    assert.doesNotThrow(() => assertDirectorySize(193, 187));
    assert.doesNotThrow(() => assertDirectorySize(1, 0));
    assert.throws(() => assertDirectorySize(0, 187));
    assert.throws(() => assertDirectorySize(40, 187), /retaining/);
    assert.throws(() => assertDirectorySize(193, NaN), /unavailable/);
  });
  it('permits a proven expiry contraction and a genuinely empty directory', () => {
    const complete = Array.from({ length: 34 }, (_, i) => ({ company: `Company ${i}`, role_count: 2 }));
    assertCompleteCompanyStats(complete, 34);
    assert.doesNotThrow(() => assertDirectorySize(34, 193, { coverageVerified: true }));
    assertCompleteCompanyStats([], 0);
    assert.doesNotThrow(() => assertDirectorySize(0, 193, { minimum: 0, coverageVerified: true }));
  });
  it('rejects row-cap truncation, missing counts, duplicate groups and malformed counts', () => {
    const rows = [{ company: 'Example', role_count: 3 }];
    assert.throws(() => assertCompleteCompanyStats(rows, 2), /Incomplete/);
    assert.throws(() => assertCompleteCompanyStats(rows, null), /Incomplete/);
    assert.throws(() => assertCompleteCompanyStats([...rows, ...rows], 2), /Invalid/);
    assert.throws(() => assertCompleteCompanyStats([{ company: 'Example', role_count: 'NaN' }], 1), /Invalid/);
  });
});
