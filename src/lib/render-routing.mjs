/** Fixed pool sizes prevent arbitrary URLs from creating unbounded actors. */
export const RENDER_POOL_SIZE = 4;
export const PARSER_POOL_SIZE = 2;
export const IMAGE_POOL_SIZE = 2;
// Gemini rejects some APAC egress locations. Both the app (autofill) and parser
// call it; constrain their execution instead of relying on a best-effort hint.
export const AI_RENDER_LOCATION = { jurisdiction: 'us', locationHint: 'enam' };

export function renderShard(pathname, size = RENDER_POOL_SIZE) {
  let hash = 2166136261;
  for (let i = 0; i < pathname.length; i++) hash = Math.imul(hash ^ pathname.charCodeAt(i), 16777619);
  return `render-v1-${(hash >>> 0) % size}`;
}

export function rendererStub(namespace, pathname, size, { jurisdiction, locationHint = 'apac' } = {}) {
  let scoped = namespace;
  if (jurisdiction) {
    try { scoped = namespace.jurisdiction(jurisdiction); }
    catch (error) {
      // Local workerd cannot simulate jurisdictions. Production errors must
      // propagate rather than silently escaping the requested jurisdiction.
      if (error.message !== 'Jurisdiction restrictions are not implemented in workerd.') throw error;
    }
  }
  return scoped.get(scoped.idFromName(renderShard(pathname, size)), { locationHint });
}

/** Preserve the public authority across the internal DO hop. Never trust
 * caller-supplied forwarded-host/proto values for redirects or origin checks.
 */
export function forwardedRequest(request) {
  const url = new URL(request.url);
  const headers = new Headers(request.headers);
  headers.set('host', url.host);
  headers.set('x-forwarded-host', url.host);
  headers.set('x-forwarded-proto', url.protocol.slice(0, -1));
  return new Request(request, { headers });
}

export function analyticsTarget(url) {
  if (url.pathname.startsWith('/ingest/static/')) {
    return new URL(`https://us-assets.i.posthog.com/static/${url.pathname.slice('/ingest/static/'.length)}${url.search}`);
  }
  if (url.pathname === '/ingest' || url.pathname.startsWith('/ingest/')) {
    return new URL(`https://us.i.posthog.com${url.pathname.slice('/ingest'.length) || '/'}${url.search}`);
  }
  return null;
}

/** Serve only the exact, public build-time HTML representation. */
export function canServeStaticHtml(request) {
  const url = new URL(request.url);
  if (!['GET', 'HEAD'].includes(request.method)) return false;
  if (['authorization', 'rsc', 'next-router-state-tree', 'next-router-prefetch', 'next-router-segment-prefetch', 'next-action', 'x-prerender-revalidate', 'x-isr'].some((h) => request.headers.has(h))) return false;
  const accept = request.headers.get('accept') || '';
  if (/text\/markdown|text\/x-component/i.test(accept)) return false;
  for (const key of url.searchParams.keys()) {
    if (!key.startsWith('utm_') && !['ref', 'fbclid', 'gclid'].includes(key)) return false;
  }
  // All crawlers and unusual clients still pass through existing negotiation
  // and anti-scraper middleware. No duplicated user-agent policy at the edge.
  const ua = request.headers.get('user-agent') || '';
  return ua.includes('Mozilla/') && !/bot|crawl|spider|headless|phantom|puppeteer|playwright|selenium|GPT|Claude|Perplexity|DeepSeek|Mistral|ora-agent/i.test(ua);
}
