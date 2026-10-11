import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { insertJobWithRecovery, jobInsertConflict } from './job-insert-recovery.mjs';

const conflict = (constraint) => ({ status: 409, error: { code: '23505', message: `duplicate key value violates unique constraint "${constraint}"` } });
const job = { external_id: 'example_123', slug: 'example_engineer' };
const remint = (original, attempt) => ({ ...original, slug: `${original.slug}-${attempt}` });

describe('bounded job insert recovery', () => {
  it('skips a dedup conflict encountered after reminting a colliding slug', async () => {
    const responses = [conflict('jobs_slug_key'), conflict('jobs_dedup_hash_key')];
    const seen = [];
    const inserted = await insertJobWithRecovery(job, async (row) => { seen.push(row.slug); return responses.shift(); }, remint);
    assert.equal(inserted, 0);
    assert.deepEqual(seen, ['example_engineer', 'example_engineer-1']);
    assert.equal(job.slug, 'example_engineer', 'source row remains unchanged');
  });
  it('tries a distinct candidate on each slug collision and succeeds', async () => {
    const responses = [conflict('jobs_slug_key'), conflict('jobs_slug_key'), { status: 201, data: [{ id: 'new' }] }];
    const seen = [];
    assert.equal(await insertJobWithRecovery(job, async (row) => { seen.push(row.slug); return responses.shift(); }, remint), 1);
    assert.equal(new Set(seen).size, 3);
  });
  it('bounds collisions instead of looping forever', async () => {
    let calls = 0;
    await assert.rejects(insertJobWithRecovery(job, async () => { calls++; return conflict('jobs_slug_key'); }, remint), /retry budget/);
    assert.equal(calls, 4);
  });
  it('fails immediately on an outage or unknown constraint', async () => {
    let calls = 0;
    await assert.rejects(insertJobWithRecovery(job, async () => { calls++; return { status: 503, error: { code: 'PGRST002' } }; }, remint), /503/);
    assert.equal(calls, 1);
    assert.equal(jobInsertConflict(conflict('jobs_pkey')), null);
    assert.equal(jobInsertConflict({ status: 409, error: { code: '23505', message: 'constraint "other_key"', details: 'Key (slug)=(mentions-dedup_hash-in-value)' } }), null);
  });
  it('counts an ignored existing external ID as zero inserted rows', async () => {
    assert.equal(await insertJobWithRecovery(job, async () => ({ status: 201, data: [] }), remint), 0);
  });
});
