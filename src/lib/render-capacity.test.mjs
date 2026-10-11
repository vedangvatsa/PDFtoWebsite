import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RenderCapacity } from './render-capacity.mjs';

describe('bounded renderer capacity', () => {
  it('holds capacity until the response is consumed and preserves cookies', async () => {
    const pool = new RenderCapacity(1);
    const first = await pool.run(async () => new Response('hello', { headers: { 'Set-Cookie': 'session=test; HttpOnly' } }));
    const busy = await pool.run(async () => { throw new Error('must not render'); });
    assert.equal(busy.status, 503);
    assert.equal(busy.headers.get('retry-after'), '5');
    assert.match(first.headers.get('set-cookie'), /HttpOnly/);
    assert.equal(await first.text(), 'hello');
    const next = await pool.run(async () => new Response('next'));
    assert.equal(await next.text(), 'next');
  });
  it('releases on exceptions and cancellation', async () => {
    const pool = new RenderCapacity(1);
    await assert.rejects(pool.run(async () => { throw new Error('render failed'); }), /render failed/);
    let cancelled = false;
    const first = await pool.run(async () => new Response(new ReadableStream({ cancel() { cancelled = true; } })));
    await first.body.cancel();
    assert.equal(cancelled, true);
    const next = await pool.run(async () => new Response(null, { status: 204 }));
    assert.equal(next.status, 204);
  });
  it('does not retain HEAD slots', async () => {
    const pool = new RenderCapacity(1);
    const head = await pool.run(async () => new Response('body', { headers: { 'x-test': 'present' } }), { head: true });
    assert.equal(head.body, null);
    assert.equal(head.headers.get('x-test'), 'present');
    assert.equal((await pool.run(async () => new Response(null, { status: 204 }))).status, 204);
  });
  it('streams chunks without detaching the upstream buffer', async () => {
    const pool = new RenderCapacity(1);
    const bytes = new Uint8Array([65, 66, 67]);
    const response = await pool.run(async () => new Response(new ReadableStream({ start(c) { c.enqueue(bytes); c.close(); } })));
    assert.equal(await response.text(), 'ABC');
    assert.equal(bytes.byteLength, 3);
  });
});
