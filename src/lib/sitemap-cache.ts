/**
 * Edge-cache sitemap XML on Cloudflare so Google (and validators) don't wait
 * 20s+ for every read. OpenNext's default incremental cache is per-isolate and
 * was always MISSing for these routes — Cache API is shared at the colo.
 *
 * Hardening: a transient DB failure must never pin an empty urlset into the
 * edge cache (it starves Google Jobs discovery for a full TTL). Empty builds
 * serve with `no-store`, empty cache hits are rejected, and SITEMAP_CACHE_EPOCH
 * orphans any poisoned entries from previous deploys.
 */

/** Bump to invalidate every cached sitemap entry (e.g. after a poisoning incident). */
export const SITEMAP_CACHE_EPOCH = 'v3';

export function sitemapXmlHasUrls(xml: string): boolean {
  return typeof xml === 'string' && xml.includes('<loc>');
}

const XML_HEADERS_BASE = {
  'Content-Type': 'application/xml; charset=utf-8',
} as const;

function sitemapResponseHeaders(ttlSeconds = 3600): HeadersInit {
  if (ttlSeconds <= 0) {
    return {
      ...XML_HEADERS_BASE,
      'Cache-Control': 'no-store',
    };
  }
  return {
    ...XML_HEADERS_BASE,
    'Cache-Control': `public, max-age=0, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds}`,
    'CDN-Cache-Control': `public, max-age=${ttlSeconds}`,
    'Cloudflare-CDN-Cache-Control': `public, max-age=${ttlSeconds}`,
  };
}

function cacheKeyFor(url: string): Request {
  const u = new URL(url);
  // Path+epoch key: query noise / UA variance don't fragment the cache, and a
  // deploy can orphan all previously cached (possibly poisoned) entries.
  return new Request(`${u.origin}${u.pathname}?smaphe=${SITEMAP_CACHE_EPOCH}`, { method: 'GET' });
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
        const cachedXml = await hit.text();
        // Reject empty hits — never let a poisoned entry back out the door.
        if (sitemapXmlHasUrls(cachedXml)) {
          // Ensure CDN TTLs stay attached on hits.
          return new Response(cachedXml, { status: hit.status, headers });
        }
      }
    } catch {
      // ignore cache read failures
    }

    const xml = await build();
    const isEmpty = !sitemapXmlHasUrls(xml);
    if (isEmpty) {
      // Never store an empty build — serve uncached so the next request retries.
      return new Response(xml, { status: 200, headers: sitemapResponseHeaders(0) });
    }
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
  const isEmpty = !sitemapXmlHasUrls(xml);
  return new Response(xml, {
    status: 200,
    headers: isEmpty ? sitemapResponseHeaders(0) : headers,
  });
}

/** Max URLs per job child sitemap — keep cold builds well under CF/Google timeouts. */
export const JOB_SITEMAP_CHUNK = 10000;
/** Fat pages + OR date filters time out; keep ranges small. */
export const JOB_SITEMAP_PAGE = 250;
