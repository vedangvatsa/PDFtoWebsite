import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DB_BUDGET,
  DbTimeoutError,
  PROFILE_LOOKUP_RETRIES,
  ProfileUnavailableError,
  isProfileUnavailable,
  withRetryOnTimeout,
  withTimeout,
} from './db-timeout';

describe('profile lookup budget', () => {
  it('gives profile rows at least 8s so large JSON is not 404d', () => {
    assert.ok(DB_BUDGET.profile >= 8000);
    assert.ok(DB_BUDGET.profile > DB_BUDGET.fast);
    assert.equal(PROFILE_LOOKUP_RETRIES, 1);
  });

  it('exports timeout and unavailable as distinct errors', () => {
    const timeout = new DbTimeoutError('x', 1);
    const unavailable = new ProfileUnavailableError('chris-mowforth');
    assert.equal(timeout.name, 'DbTimeoutError');
    assert.equal(unavailable.name, 'ProfileUnavailableError');
    assert.equal(isProfileUnavailable(unavailable), true);
    assert.equal(isProfileUnavailable(timeout), false);
    assert.doesNotMatch(unavailable.message, /not found/i);
  });
});

describe('withRetryOnTimeout', () => {
  it('aborts a lazy query before retrying and attaches the signal before execution', async () => {
    let aborted = false;
    let calls = 0;
    const result = await withRetryOnTimeout(() => {
      calls++;
      if (calls === 2) {
        assert.equal(aborted, true, 'first request must be cancelled before retry');
        return Promise.resolve(42);
      }
      let signal: AbortSignal;
      return {
        abortSignal(s: AbortSignal) { signal = s; return this; },
        then(resolve: (value: number) => unknown, reject: (reason: unknown) => unknown) {
          assert.ok(signal, 'signal attached before lazy query starts');
          return new Promise<number>((_done, fail) => {
            signal.addEventListener('abort', () => { aborted = true; fail(new Error('aborted')); });
          }).then(resolve, reject);
        },
      } as PromiseLike<number>;
    }, 15, 'abort-test');
    assert.equal(result, 42);
    assert.equal(calls, 2);
  });
  it('retries once after a timeout then throws', async () => {
    let calls = 0;
    await assert.rejects(
      () =>
        withRetryOnTimeout(
          () => {
            calls += 1;
            return new Promise(() => {});
          },
          20,
          'test-hang',
          1
        ),
      (err: unknown) => err instanceof DbTimeoutError
    );
    assert.equal(calls, 2);
  });

  it('does not retry non-timeout errors', async () => {
    let calls = 0;
    await assert.rejects(
      () =>
        withRetryOnTimeout(
          () => {
            calls += 1;
            return Promise.reject(new Error('PGRST002'));
          },
          50,
          'test-fail',
          1
        ),
      /PGRST002/
    );
    assert.equal(calls, 1);
  });

  it('returns on a successful retry', async () => {
    let calls = 0;
    const value = await withRetryOnTimeout(
      () => {
        calls += 1;
        if (calls === 1) return new Promise(() => {});
        return Promise.resolve(42);
      },
      20,
      'test-ok',
      1
    );
    assert.equal(value, 42);
    assert.equal(calls, 2);
  });

  it('withTimeout rejects with DbTimeoutError', async () => {
    await assert.rejects(
      () => withTimeout(new Promise(() => {}), 15, 'unit'),
      (err: unknown) => err instanceof DbTimeoutError
    );
  });
});
