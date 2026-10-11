import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { completeJobCandidates } from './complete-job-intake.mjs';

const html = `<h2>Responsibilities</h2><p>${'Build reliable software, review changes, and support customers with production engineering issues. '.repeat(5)}</p><ul><li>SQL experience</li></ul>`;
describe('complete-only job intake', () => {
  it('admits only source-backed complete jobs and strips unverified input publication tags', async () => {
    const candidates = ['closed', 'short', 'live'].map((id) => ({ external_id: id, tags: ['source-closed', 'curated-jd', 'Engineering'], apply_url: 'https://employer.example/careers' }));
    const result = await completeJobCandidates(candidates, { limit: 10, fetchOriginal: async (job) => job.external_id === 'closed'
      ? { ok: false, reason: 'source_closed' } : { ok: true, html: job.external_id === 'short' ? '<p>Apply.</p>' : html } });
    assert.equal(result.jobs.length, 1);
    assert.equal(result.jobs[0].external_id, 'live');
    assert.match(result.jobs[0].description, /<h2>Responsibilities<\/h2>/);
    assert.deepEqual(result.jobs[0].tags, ['Engineering', 'curated-jd', 'source-jd', 'source-html']);
    assert.deepEqual(result.stats.skipped, { source_closed: 1, invalid_source_body: 1 });
  });
  it('caps accepted jobs and failed source attempts without inserting placeholders', async () => {
    const candidates = Array.from({ length: 100 }, (_, i) => ({ external_id: String(i) }));
    const result = await completeJobCandidates(candidates, { limit: 2, fetchOriginal: async () => ({ ok: true, html }) });
    assert.equal(result.jobs.length, 2);
    assert.equal(result.stats.attempted, 2);
    const blocked = await completeJobCandidates(candidates, { limit: 2, fetchOriginal: async () => ({ ok: false, reason: 'unsupported_source' }) });
    assert.equal(blocked.stats.attempted, 8);
    assert.equal(blocked.jobs.length, 0);
    const noBudget = await completeJobCandidates(candidates, { limit: 0, fetchOriginal: async () => { throw new Error('must not fetch'); } });
    assert.equal(noBudget.stats.attempted, 0);
  });
});
