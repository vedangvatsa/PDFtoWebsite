import { getCloudflareContext } from '@opennextjs/cloudflare';
import { circuitFetch, type OriginCircuit } from './origin-circuit';
import { fetchWithDeadline } from './fetch-deadline';

function databaseCircuit(db: D1Database): OriginCircuit {
  return {
    async acquire(now) {
      const row = await db.prepare('SELECT retry_after, lease_until FROM origin_backoff WHERE id = 1')
        .first<{ retry_after: number; lease_until: number }>();
      if (!row) return 'allowed';
      if (row.retry_after > now || row.lease_until > now) return 'blocked';
      const claim = await db.prepare('UPDATE origin_backoff SET lease_until = ? WHERE id = 1 AND retry_after <= ? AND lease_until <= ?')
        .bind(now + 10_000, now, now).run();
      return claim.meta.changes === 1 ? 'probe' : 'blocked';
    },
    async trip(now) {
      await db.prepare('INSERT INTO origin_backoff (id, retry_after, lease_until) VALUES (1, ?, 0) ON CONFLICT(id) DO UPDATE SET retry_after = max(origin_backoff.retry_after, excluded.retry_after), lease_until = 0')
        .bind(now + 30_000).run();
    },
    async recover() {
      await db.prepare('DELETE FROM origin_backoff WHERE id = 1').run();
    },
  };
}

export const protectedSupabaseFetch: typeof fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
  if (!url.pathname.startsWith('/rest/v1/')) return fetch(input, init);
  let db: D1Database | undefined;
  try { db = getCloudflareContext().env.NEXT_TAG_CACHE_D1; } catch { /* Node build / tests */ }
  const fetcher: typeof fetch = db
    ? (resource, options) => circuitFetch(resource, options, databaseCircuit(db))
    : fetch;
  return fetchWithDeadline(input, init, 8_000, fetcher);
};
