/**
 * Edge-cache sitemap XML on Cloudflare so Google (and validators) don't wait
 * 20s+ for every read. OpenNext's default incremental cache is per-isolate and
 * was always MISSing for these routes — Cache API is shared at the colo.
 */

const XML_HEADERS_BASE = {
  'Content-Type': 'application/xml; charset=utf-8',
} as const;

function sitemapResponseHeaders(ttlSeconds = 3600): HeadersInit {
  return {
    ...XML_HEADERS_BASE,
    'Cache-Control': `public, max-age=0, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 24}`,
    'CDN-Cache-Control': `public, max-age=${ttlSeconds}`,
    'Cloudflare-CDN-Cache-Control': `public, max-age=${ttlSeconds}`,
  };
}

function cacheKeyFor(url: string): Request {
  const u = new URL(url);
  // Path-only key so query noise / UA variance don't fragment the cache.
  return new Request(`${u.origin}${u.pathname}`, { method: 'GET' });
}

export async function withSitemapCache(
  requestUrl: string,
  build: () => Promise<string>,
  ttlSeconds = 3600
): Promise<Response> {
  const headers = sitemapResponseHeaders(ttlSeconds);
  const cache = (globalThis as unknown as { caches?: { default?: Cache } }).caches
    ?.default;

  if (cache) {
    const key = cacheKeyFor(requestUrl);
    try {
      const hit = await cache.match(key);
      if (hit) {
        // Ensure CDN TTLs stay attached on hits.
        const out = new Response(hit.body, { status: hit.status, headers });
        return out;
      }
    } catch {
      // ignore cache read failures
    }

    const xml = await build();
    const res = new Response(xml, { headers });
    try {
      const { getCloudflareContext } = await import('@opennextjs/cloudflare');
      const { ctx } = await getCloudflareContext({ async: true });
      ctx.waitUntil(cache.put(key, res.clone()));
    } catch {
      try {
        await cache.put(key, res.clone());
      } catch {
        // local / non-CF runtimes
      }
    }
    return res;
  }

  const xml = await build();
  return new Response(xml, { headers });
}

/** Max URLs per job child sitemap — keep cold builds well under CF/Google timeouts. */
export const JOB_SITEMAP_CHUNK = 10000;
export const JOB_SITEMAP_PAGE = 1000;
