import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readInventory, assertDirectorySize } from './free-tier-guards.mjs';

describe('free tier ingestion correctness', () => {
  it('never returns an empty inventory on repeated backend failures', async () => {
    let calls = 0;
    await assert.rejects(readInventory('https://example.invalid/jobs', {}, {
      fetcher: async () => { calls++; return new Response('', { status: 522 }); }, pause: async () => {},
    }), /522/);
    assert.equal(calls, 3);
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
});
