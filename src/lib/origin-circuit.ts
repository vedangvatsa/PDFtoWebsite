export interface OriginCircuit {
  acquire(now: number): Promise<'allowed' | 'probe' | 'blocked'>;
  trip(now: number): Promise<void>;
  recover(): Promise<void>;
}

/** Shared outage backoff. One probe after cooldown; no automatic write retry. */
export async function circuitFetch(
  input: Parameters<typeof fetch>[0],
  init: Parameters<typeof fetch>[1],
  circuit: OriginCircuit,
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  const permission = await circuit.acquire(Date.now()).catch(() => 'blocked' as const);
  if (permission === 'blocked') {
    return Response.json({ code: 'CVIN_ORIGIN_BACKOFF', message: 'Database API is recovering. Please retry shortly.', details: null, hint: null },
      { status: 503, headers: { 'Retry-After': '30', 'Cache-Control': 'no-store' } });
  }
  try {
    const response = await fetcher(input, init);
    if ([429, 502, 503, 504, 520, 521, 522, 523, 524].includes(response.status)) {
      await circuit.trip(Date.now());
    } else if (permission === 'probe') {
      await circuit.recover();
    }
    return response;
  } catch (error) {
    const signal = init?.signal || (input instanceof Request ? input.signal : undefined);
    // A caller's shorter query budget or disconnect says nothing about other
    // requests. Do not turn one cancelled read into a shared 30-second outage.
    // Our actual upstream deadline has a distinct TimeoutError reason.
    const callerCancelled = signal?.aborted && signal.reason?.name !== 'TimeoutError';
    if (!callerCancelled) await circuit.trip(Date.now()).catch(() => {});
    throw error;
  }
}
