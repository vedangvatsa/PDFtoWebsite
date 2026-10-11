import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fetchWithDeadline } from './fetch-deadline';

describe('fetch deadlines do not keep completed renderers awake', () => {
  it('clears after body consumption, retaining status and headers', async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let signal: AbortSignal | undefined;
    const response = await fetchWithDeadline('https://example.invalid', {}, 100, async (_input, init) => {
      signal = init!.signal!;
      return new Response('body', { status: 201, headers: { 'x-test': 'yes' } });
    });
    assert.equal(response.status, 201);
    assert.equal(response.headers.get('x-test'), 'yes');
    assert.equal(await response.text(), 'body');
    t.mock.timers.tick(101);
    assert.equal(signal!.aborted, false);
  });
  it('still aborts requests that never return headers', async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const promise = fetchWithDeadline('https://example.invalid', {}, 100, async (_input, init) =>
      new Promise((_resolve, reject) => init!.signal!.addEventListener('abort', () => reject(init!.signal!.reason), { once: true })));
    const rejected = assert.rejects(promise, { name: 'TimeoutError' });
    t.mock.timers.tick(101);
    await rejected;
  });
  it('keeps the deadline until a stalled response body ends', async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const response = await fetchWithDeadline('https://example.invalid', {}, 100, async (_input, init) =>
      new Response(new ReadableStream({ start(stream) {
        init!.signal!.addEventListener('abort', () => stream.error(init!.signal!.reason), { once: true });
      } })));
    const rejected = assert.rejects(response.text(), { name: 'TimeoutError' });
    t.mock.timers.tick(101);
    await rejected;
  });
  it('clears on cancellation and forwards cancellation upstream', async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let signal: AbortSignal | undefined;
    let cancelled = false;
    const response = await fetchWithDeadline('https://example.invalid', {}, 100, async (_input, init) => {
      signal = init!.signal!;
      return new Response(new ReadableStream({ cancel() { cancelled = true; } }));
    });
    await response.body!.cancel();
    t.mock.timers.tick(101);
    assert.equal(cancelled, true);
    assert.equal(signal!.aborted, false);
  });
  it('clears when fetch throws or has no body', async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const signals: AbortSignal[] = [];
    await assert.rejects(fetchWithDeadline('https://example.invalid', {}, 100, async (_input, init) => {
      signals.push(init!.signal!); throw new Error('network failed');
    }), /network failed/);
    await fetchWithDeadline('https://example.invalid', {}, 100, async (_input, init) => {
      signals.push(init!.signal!); return new Response(null, { status: 204 });
    });
    t.mock.timers.tick(101);
    assert.ok(signals.every((signal) => !signal.aborted));
  });
  it('preserves the caller abort signal', async () => {
    const caller = new AbortController();
    const promise = fetchWithDeadline('https://example.invalid', { signal: caller.signal }, 1000, async (_input, init) =>
      new Promise((_resolve, reject) => init!.signal!.addEventListener('abort', () => reject(init!.signal!.reason), { once: true })));
    const rejected = assert.rejects(promise, { name: 'AbortError' });
    caller.abort();
    await rejected;
  });
});
