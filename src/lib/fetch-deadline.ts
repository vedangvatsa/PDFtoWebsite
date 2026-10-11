/** Bound headers AND body reads, but clear the timer as soon as I/O finishes.
 * AbortSignal.timeout cannot be cleared and keeps Durable Objects awake after
 * successful requests. Preserve streaming rather than buffering entire bodies.
 */
export async function fetchWithDeadline(
  input: Parameters<typeof fetch>[0],
  init: Parameters<typeof fetch>[1] = {},
  timeoutMs = 8_000,
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException('Fetch deadline exceeded', 'TimeoutError')), timeoutMs);
  const clear = () => clearTimeout(timer);
  const caller = init?.signal || (input instanceof Request ? input.signal : undefined);
  const signal = caller ? AbortSignal.any([caller, controller.signal]) : controller.signal;
  try {
    const response = await fetcher(input, { ...init, signal });
    if (!response.body) { clear(); return response; }
    const reader = response.body.getReader();
    const body = new ReadableStream({
      type: 'bytes',
      async pull(stream: ReadableByteStreamController) {
        try {
          const { done, value } = await reader.read();
          if (done) { clear(); stream.close(); stream.byobRequest?.respond(0); }
          else if (value.byteLength) stream.enqueue(new Uint8Array(value));
        } catch (error) { clear(); stream.error(error); }
      },
      async cancel(reason) {
        try { await reader.cancel(reason); } finally { clear(); }
      },
    });
    return new Response(body, response);
  } catch (error) { clear(); throw error; }
}
