import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createOriginalJobFetcher, originalJobIdentity } from './fetch-original-job.mjs';
const id = '12345678-1234-1234-1234-123456789abc';

describe('official employer source fetching', () => {
  it('prefers matching URL region and board case, rejects conflicting source identities', async () => {
    const job = { source: 'ashby', external_id: `ashby_jasper ai_${id}`, apply_url: `https://jobs.ashbyhq.com/Jasper%20AI/${id}` };
    assert.equal(originalJobIdentity(job).board, 'Jasper AI');
    assert.equal(originalJobIdentity({ ...job, apply_url: `https://jobs.ashbyhq.com/other/${id}` }), null);
    assert.equal(originalJobIdentity({ source: 'ashby', external_id: `ashby_.._${id}` }), null);
    assert.equal(originalJobIdentity({ apply_url: `https://jobs.ashbyhq.com/a%2Fb/${id}` }), null);
    const fetchOriginal = createOriginalJobFetcher(async (url) => {
      assert.equal(url, 'https://boards-api.greenhouse.io/v1/boards/example/jobs/123');
      return Response.json({ id: 123, content: '<p>Original</p>' });
    });
    assert.equal((await fetchOriginal({ source: 'greenhouse', external_id: 'gh_example_123', apply_url: 'https://job-boards.eu.greenhouse.io/example/jobs/123' })).ok, true);
  });
  it('verifies Workday requisitions and does not accept a mismatched body', async () => {
    const job = { source: 'workday', external_id: 'wd_example_JR123', apply_url: 'https://example.wd1.myworkdayjobs.com/Careers/job/US/Engineer_JR123-1' };
    const fetchOriginal = createOriginalJobFetcher(async (url) => {
      assert.equal(url, 'https://example.wd1.myworkdayjobs.com/wday/cxs/example/Careers/job/US/Engineer_JR123-1');
      return Response.json({ jobPostingInfo: { jobReqId: 'JR123', jobDescription: '<h2>Original requirements</h2><p>Source.</p>' } });
    });
    assert.equal((await fetchOriginal(job)).ok, true);
    const wrong = createOriginalJobFetcher(async () => Response.json({ jobPostingInfo: { jobReqId: 'JR124', jobDescription: '<p>Wrong</p>' } }));
    assert.equal((await wrong(job)).reason, 'source_identity_mismatch');
    assert.equal(originalJobIdentity({ ...job, apply_url: 'https://example.wd1.myworkdayjobs.com.evil.example/Careers/job/US/Engineer_JR123' }), null);
  });
  it('routes custom Greenhouse careers URLs using the stored ATS identity', async () => {
    const fetchOriginal = createOriginalJobFetcher(async (url) => {
      assert.equal(url, 'https://boards-api.greenhouse.io/v1/boards/example/jobs/123');
      return Response.json({ id: 123, content: '<p>Exact source — unchanged.</p>' });
    });
    assert.deepEqual(await fetchOriginal({ source: 'greenhouse', external_id: 'gh_example_123', apply_url: 'https://careers.example.com/role' }), { ok: true, text: 'Exact source — unchanged.', html: '<p>Exact source — unchanged.</p>' });
  });
  it('includes all Lever responsibility and qualification lists in source order', async () => {
    const fetchOriginal = createOriginalJobFetcher(async (url) => {
      assert.match(url, /^https:\/\/api\.lever\.co\/v0\/postings\/example\//);
      return Response.json({ id, description: '<p>Intro.</p>', lists: [{ text: 'Requirements', content: '<ul><li>SQL.</li></ul>' }], additional: '<p>Closing.</p>' });
    });
    const result = await fetchOriginal({ source: 'lever', external_id: `lever_example_${id}` });
    assert.equal(result.text, 'Intro.\n\nRequirements\n\n- SQL.\n\nClosing.');
    assert.match(result.html, /<h2>Requirements<\/h2><ul><li>SQL\.<\/li><\/ul>/);
  });
  it('matches the exact Ashby ID and reuses the bounded board response', async () => {
    let calls = 0;
    const fetchOriginal = createOriginalJobFetcher(async (url) => {
      if (url.startsWith('https://jobs.ashbyhq.com/')) return new Response('<html>No structured data</html>');
      calls++;
      return Response.json({ jobs: [{ id: 'other', descriptionHtml: '<p>Wrong job</p>' }, { id, descriptionHtml: '<p>Correct job</p>' }] });
    });
    const job = { source: 'ashby', external_id: `ashby_example_${id}` };
    assert.equal((await fetchOriginal(job)).text, 'Correct job');
    assert.equal((await fetchOriginal(job)).text, 'Correct job');
    assert.equal(calls, 1);
  });
  it('does not fetch arbitrary hosts or fall back to AI for missing source text', async () => {
    const fetchOriginal = createOriginalJobFetcher(async () => { throw new Error('unexpected network'); });
    assert.equal(originalJobIdentity({ apply_url: 'https://jobs.lever.co.evil.example/example/123' }), null);
    assert.deepEqual(await fetchOriginal({ apply_url: 'http://127.0.0.1/private' }), { ok: false, reason: 'unsupported_source' });
    const unavailable = createOriginalJobFetcher(async () => new Response(null, { status: 404 }));
    assert.deepEqual(await unavailable({ source: 'greenhouse', external_id: 'gh_example_123' }), { ok: false, reason: 'source_closed', closed: true });
    const wrong = createOriginalJobFetcher(async () => Response.json({ id: 999, content: '<p>Wrong</p>' }));
    assert.equal((await wrong({ source: 'greenhouse', external_id: 'gh_example_123' })).ok, false);
  });
  it('gets one Ashby posting from structured page data without loading a huge board', async () => {
    const fetchOriginal = createOriginalJobFetcher(async (url) => {
      assert.equal(url, `https://jobs.ashbyhq.com/example/${id}`);
      return new Response(`<script type="application/ld+json">${JSON.stringify({ '@type': 'JobPosting', identifier: { value: id }, description: '<h2>Requirements</h2><ul><li>SQL</li></ul>' })}</script>`);
    });
    const result = await fetchOriginal({ source: 'ashby', external_id: `ashby_example_${id}`, apply_url: `https://jobs.ashbyhq.com/example/${id}` });
    assert.equal(result.html, '<h2>Requirements</h2><ul><li>SQL</li></ul>');
  });
  it('recognizes verified removed-posting redirects without following arbitrary URLs', async () => {
    const fetchOriginal = createOriginalJobFetcher(async (url) => url.includes('boards-api')
      ? new Response(null, { status: 404 }) : new Response(null, { status: 302, headers: { Location: '/example?error=true' } }));
    assert.equal((await fetchOriginal({ source: 'greenhouse', external_id: 'gh_example_123' })).closed, true);
    const unsafe = createOriginalJobFetcher(async (url) => url.includes('boards-api')
      ? new Response(null, { status: 404 }) : new Response(null, { status: 302, headers: { Location: 'http://127.0.0.1/private' } }));
    await assert.rejects(unsafe({ source: 'greenhouse', external_id: 'gh_example_123' }), /Unverified ATS redirect/);
  });
  it('surfaces source failures and enforces response byte limits', async () => {
    const job = { source: 'greenhouse', external_id: 'gh_example_123' };
    await assert.rejects(createOriginalJobFetcher(async () => new Response(null, { status: 429 }))(job), /HTTP 429/);
    let cancelled = false;
    const body = new ReadableStream({ start(c) { c.enqueue(new Uint8Array(12 * 1024 * 1024 + 1)); }, cancel() { cancelled = true; } });
    await assert.rejects(createOriginalJobFetcher(async () => new Response(body))(job), /byte budget/);
    assert.equal(cancelled, true);
  });
});
