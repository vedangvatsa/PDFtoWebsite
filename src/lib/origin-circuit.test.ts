import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { circuitFetch, type OriginCircuit } from './origin-circuit';

function store() {
  let blocked = false;
  let probing = false;
  let cooldown = false;
  return {
    async acquire() {
      if (blocked) {
        if (!cooldown || probing) return 'blocked' as const;
        probing = true;
        return 'probe' as const;
      }
      return 'allowed' as const;
    },
    async trip() { blocked = true; probing = false; cooldown = false; },
    async recover() { blocked = false; probing = false; },
    expire() { cooldown = true; },
  } satisfies OriginCircuit & { expire(): void };
}

describe('database outage circuit', () => {
  it('does not send subsequent requests to a failed origin', async () => {
    const circuit = store(); let calls = 0;
    const fetcher: typeof fetch = async () => { calls++; return Response.json({ code: 'PGRST002' }, { status: 503 }); };
    await circuitFetch('https://example.invalid', {}, circuit, fetcher);
    const response = await circuitFetch('https://example.invalid', {}, circuit, fetcher);
    assert.equal(calls, 1);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('retry-after'), '30');
  });
  it('allows only one recovery probe and reopens on recovery', async () => {
    const circuit = store(); await circuit.trip(); circuit.expire();
    let finish!: (response: Response) => void;
    const first = circuitFetch('https://example.invalid', {}, circuit, () => new Promise((resolve) => { finish = resolve; }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    const second = await circuitFetch('https://example.invalid', {}, circuit, async () => { throw new Error('must not reach origin'); });
    assert.equal(second.status, 503);
    finish(Response.json({ ok: true })); await first;
    assert.equal(await circuit.acquire(), 'allowed');
  });
  it('preserves ordinary validation errors without opening the circuit', async () => {
    const circuit = store();
    const response = await circuitFetch('https://example.invalid', { method: 'POST' }, circuit, async () => Response.json({ error: 'invalid' }, { status: 400 }));
    assert.equal(response.status, 400);
    assert.equal(await circuit.acquire(), 'allowed');
  });
  it('opens on network failure and never retries a write', async () => {
    const circuit = store(); let calls = 0;
    await assert.rejects(circuitFetch('https://example.invalid', { method: 'POST' }, circuit, async () => { calls++; throw new Error('network down'); }), /network down/);
    assert.equal(calls, 1);
    assert.equal(await circuit.acquire(), 'blocked');
  });
});
