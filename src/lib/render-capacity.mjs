/** An in-memory semaphore for one actor, held until its response stream ends.
 * Active requests prevent hibernation; no timer or polling loop keeps idle
 * objects awake. No user/session data is retained in the semaphore.
 */
export class RenderCapacity {
  #active = 0;
  constructor(limit = 4) { this.limit = limit; }

  async run(render, { head = false } = {}) {
    if (this.#active >= this.limit) {
      return Response.json({ error: 'Server is busy', code: 'RENDER_BUSY', hint: 'Retry in 5 seconds.' },
        { status: 503, headers: { 'Retry-After': '5', 'Cache-Control': 'private, no-store' } });
    }
    this.#active++;
    let released = false;
    const release = () => { if (!released) { released = true; this.#active--; } };
    try {
      const response = await render();
      if (head && response.body) {
        await response.body.cancel();
        release();
        return new Response(null, { status: response.status, statusText: response.statusText, headers: response.headers });
      }
      if (!response.body || response.status === 101) { release(); return response; }
      const reader = response.body.getReader();
      const stream = new ReadableStream({
        type: 'bytes',
        async pull(controller) {
          try {
            const { done, value } = await reader.read();
            if (done) { controller.close(); controller.byobRequest?.respond(0); release(); }
            else if (value.byteLength) controller.enqueue(new Uint8Array(value));
          } catch (error) { release(); controller.error(error); }
        },
        async cancel(reason) { try { await reader.cancel(reason); } finally { release(); } },
      });
      return new Response(stream, { status: response.status, statusText: response.statusText, headers: response.headers });
    } catch (error) { release(); throw error; }
  }
}
