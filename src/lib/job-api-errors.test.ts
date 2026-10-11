import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { jobDataUnavailableResponse } from './job-api-errors';

it('job read failures are retryable, uncacheable and cannot end a pagination stream', async () => {
  const response = jobDataUnavailableResponse({ 'RateLimit-Remaining': '299', 'Cache-Control': 'public' });
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('Retry-After'), '30');
  assert.equal(response.headers.get('RateLimit-Remaining'), '299');
  for (const header of ['Cache-Control', 'CDN-Cache-Control', 'Cloudflare-CDN-Cache-Control']) assert.match(response.headers.get(header) || '', /no-store/);
  const data = await response.json();
  assert.equal(data.code, 'DATABASE_UNAVAILABLE');
  assert.ok(data.error && data.hint);
  assert.equal('jobs' in data || 'next_cursor' in data || 'hasMore' in data, false);
});

it('board and detail routes keep failed reads distinct from real empty results', () => {
  const board = readFileSync(new URL('../app/api/jobs/route.ts', import.meta.url), 'utf8');
  const detail = readFileSync(new URL('../app/api/jobs/[id]/route.ts', import.meta.url), 'utf8');
  assert.match(board, /return jobDataUnavailableResponse\(rlHeaders\)/);
  assert.doesNotMatch(board, /timeoutResult|degraded: true/);
  assert.match(board, /const skills = filterMeaningfulSkillTags\(/);
  assert.match(board, /rawWindow.slice\(0, limit\).filter\(\(job\) => !isBannedJobTitle\(job.title\)\)/);
  assert.match(detail, /if \(!result \|\| result.error\) return jobDataUnavailableResponse\(\)/);
});
