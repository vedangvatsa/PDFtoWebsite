import { createHash } from 'node:crypto';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import staticAssets from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';
import type { CacheEntryType, CacheValue, IncrementalCache, WithLastModified } from '@opennextjs/aws/types/overrides.js';

/**
 * Free-plan cache: build-time pages stay in unlimited static assets; runtime
 * entries use bounded, indexed D1 slots (no KV write quota or R2 subscription).
 * Shared storage lets the revalidation queue refresh entries for every region.
 * 1,024 slots x 128 KiB bounds value storage to 128 MiB. Collisions are safe
 * misses (the full cache key is checked), never somebody else's response.
 * No request data or in-flight I/O is retained in module globals.
 */
export class FreeTierIncrementalCache implements IncrementalCache {
  readonly name = 'cvin-free-tier-incremental-cache';

  private key(key: string, type: CacheEntryType = 'cache') {
    const build = process.env.OPEN_NEXT_BUILD_ID || 'development';
    const hash = createHash('sha256').update(`${build}:${type}:${key}`).digest('hex');
    return { hash, slot: parseInt(hash.slice(0, 8), 16) % 1024 };
  }

  async get<T extends CacheEntryType = 'cache'>(key: string, type?: T): Promise<WithLastModified<CacheValue<T>> | null> {
    const { env } = getCloudflareContext();
    const { hash, slot } = this.key(key, type);
    try {
      const hit = await env.NEXT_TAG_CACHE_D1!.prepare(
        'SELECT value, last_modified FROM cache_entries WHERE slot = ? AND cache_key = ? AND last_modified > ?'
      ).bind(slot, hash, Date.now() - 86_400_000).first<{ value: string; last_modified: number }>();
      if (hit) return { value: JSON.parse(hit.value), lastModified: hit.last_modified };
    } catch {
      console.warn('[cache] runtime read unavailable');
    }
    // This is a read-only fallback, not the runtime cache write destination.
    return staticAssets.get(key, type);
  }

  async set<T extends CacheEntryType = 'cache'>(key: string, value: CacheValue<T>, type?: T): Promise<void> {
    const body = JSON.stringify(value);
    if (Buffer.byteLength(body, 'utf8') > 131_072) return;
    const { env } = getCloudflareContext();
    const { hash, slot } = this.key(key, type);
    try {
      await env.NEXT_TAG_CACHE_D1!.prepare(
        'INSERT INTO cache_entries (slot, cache_key, value, last_modified) VALUES (?, ?, ?, ?) ON CONFLICT(slot) DO UPDATE SET cache_key = excluded.cache_key, value = excluded.value, last_modified = excluded.last_modified'
      ).bind(slot, hash, body, Date.now()).run();
    } catch {
      console.warn('[cache] runtime write unavailable');
    }
  }

  async delete(key: string): Promise<void> {
    const { env } = getCloudflareContext();
    const { hash, slot } = this.key(key);
    await env.NEXT_TAG_CACHE_D1!.prepare('DELETE FROM cache_entries WHERE slot = ? AND cache_key = ?')
      .bind(slot, hash).run();
  }
}

export default new FreeTierIncrementalCache();
