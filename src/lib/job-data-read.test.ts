import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readJobQuery } from './job-data-read';
import { DatabaseUnavailableError, DbTimeoutError } from './db-timeout';

describe('critical job reads tolerate cold origins without hiding failures', () => {
  it('accepts a healthy 3.1-second response that exceeded the old 2.5-second deadline', async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let attempts = 0;
    const result = { data: { id: 'job', description: 'Original employer text' }, error: null };
    const pending = readJobQuery(() => {
      attempts++;
      return new Promise<typeof result>((resolve) => setTimeout(() => resolve(result), 3100));
    }, 'job-by-id');
    t.mock.timers.tick(3101);
    assert.deepEqual(await pending, result);
    assert.equal(attempts, 1);
  });

  it('cancels a timed-out attempt before recreating the query, then returns the real job', async () => {
    let calls = 0, cancelled = false;
    const result = await readJobQuery(() => {
      calls++;
      if (calls === 2) {
        assert.equal(cancelled, true);
        return Promise.resolve({ data: { id: 'job' }, error: null });
      }
      let signal: AbortSignal;
      return {
        abortSignal(value: AbortSignal) { signal = value; return this; },
        then(resolve, reject) {
          assert.ok(signal, 'attach cancellation before executing the lazy query');
          return new Promise<{ data: { id: string }; error: null }>((_resolve, fail) => {
            signal.addEventListener('abort', () => { cancelled = true; fail(signal.reason); });
          }).then(resolve, reject);
        },
      } as PromiseLike<{ data: { id: string }; error: null }>;
    }, 'job-route-index', 15);
    assert.deepEqual(result.data, { id: 'job' });
    assert.equal(calls, 2);
  });

  it('throws after two timed-out reads instead of caching a missing job', async (t) => {
    t.mock.method(console, 'error', () => {});
    let calls = 0;
    await assert.rejects(readJobQuery(() => {
      calls++;
      return new Promise<{ data: null; error: null }>(() => {});
    }, 'job-by-id', 10), DbTimeoutError);
    assert.equal(calls, 2);
  });

  it('does not retry a database API/backoff error and distinguishes confirmed absence', async (t) => {
    t.mock.method(console, 'error', () => {});
    let calls = 0;
    await assert.rejects(readJobQuery(() => {
      calls++;
      return Promise.resolve({ data: null, error: { code: 'CVIN_ORIGIN_BACKOFF' } });
    }, 'job-by-id'), DatabaseUnavailableError);
    assert.equal(calls, 1);
    assert.deepEqual(await readJobQuery(() => Promise.resolve({ data: null, error: null }), 'job-by-id'), { data: null, error: null });
  });

  it('uses protected reads inside snapshot caches without changing optional-content budgets', () => {
    const snapshots = readFileSync(new URL('./job-snapshots.ts', import.meta.url), 'utf8');
    const company = readFileSync(new URL('./company-page.ts', import.meta.url), 'utf8');
    const detail = readFileSync(new URL('./job-detail-data.ts', import.meta.url), 'utf8');
    assert.match(snapshots, /readJobQuery\(/);
    assert.match(company, /readJobQuery/);
    assert.doesNotMatch(snapshots + company, /DB_BUDGET.fast|DB_BUDGET.list/);
    assert.match(detail, /withTimeoutFallback/);
    assert.match(detail, /DB_BUDGET.fast/);
  });
});
