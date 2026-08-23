/**
 * Edge-cache sitemap XML on Cloudflare so Google (and validators) don't wait
 * 20s+ for every read. OpenNext's default incremental cache is per-isolate and
 * was always MISSing for these routes — Cache API is shared at the colo.
 */

const XML_HEADERS_BASE = {
  'Content-Type': 'application/xml; charset=utf-8',
} as const;

/** Bump to orphan poisoned empty urlsets left in the Workers / CDN cache. */
export const SITEMAP_CACHE_EPOCH = 'v2';

function sitemapResponseHeaders(ttlSeconds = 3600): HeadersInit {
  return {
    ...XML_HEADERS_BASE,
    'Cache-Control': `public, max-age=0, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds}`,
    'CDN-Cache-Control': `public, max-age=${ttlSeconds}`,
    'Cloudflare-CDN-Cache-Control': `public, max-age=${ttlSeconds}`,
  };
}

/** Empty / failed builds must not stick in CDN or browsers. */
function uncachedXmlHeaders(): HeadersInit {
  return {
    ...XML_HEADERS_BASE,
    'Cache-Control': 'private, no-store, max-age=0',
    'CDN-Cache-Control': 'no-store',
    'Cloudflare-CDN-Cache-Control': 'no-store',
  };
}

export function sitemapXmlHasUrls(xml: string): boolean {
  return xml.includes('<loc>');
}

function cacheKeyFor(url: string): Request {
  const u = new URL(url);
  // Path + epoch so query noise doesn't fragment, and epoch busts bad entries.
  return new Request(`${u.origin}${u.pathname}?sc=${SITEMAP_CACHE_EPOCH}`, {
    method: 'GET',
  });
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
        const cachedXml = await hit.clone().text();
        // Never re-serve a poisoned empty build (pre-fix Cache API entries).
        if (sitemapXmlHasUrls(cachedXml)) {
          return new Response(cachedXml, { status: hit.status, headers });
        }
      }
    } catch {
      // ignore cache read failures
    }

    const xml = await build();
    const isEmpty = !sitemapXmlHasUrls(xml);
    const effectiveHeaders = isEmpty ? uncachedXmlHeaders() : headers;

    const res = new Response(xml, { headers: effectiveHeaders });
    if (!isEmpty) {
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
    }
    return res;
  }

  const xml = await build();
  const isEmpty = !sitemapXmlHasUrls(xml);
  return new Response(xml, {
    headers: isEmpty ? uncachedXmlHeaders() : headers,
  });
}

/** Max URLs per job child sitemap — keep cold builds well under CF/Google timeouts. */
export const JOB_SITEMAP_CHUNK = 10000;
/** Small pages: OR date + tags + fat description columns trip PostgREST timeouts. */
export const JOB_SITEMAP_PAGE = 200;
