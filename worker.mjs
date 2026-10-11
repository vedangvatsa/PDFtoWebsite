import app from './.open-next/worker.js';
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from './.open-next/worker.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (['/api/parse-resume', '/v1/api/parse-resume', '/v1/parse-resume'].includes(path.replace(/\/$/, ''))) {
      // Normalize documented API aliases before the isolated parser's router.
      url.pathname = '/api/parse-resume';
      return env.PARSER_WORKER.fetch(new Request(url, request));
    }
    if (/\/opengraph-image(?:\/|$)/.test(path) || /^\/(?:icon|apple-icon)\/?$/.test(path)) {
      return env.IMAGE_WORKER.fetch(request);
    }
    // Absorb repeated crawler requests for confirmed stale job URLs before
    // starting the Next.js renderer. Auth, RSC and API traffic bypass this.
    const segments = path.split('/').filter(Boolean);
    const reserved = new Set(['api', 'v1', 'auth', 'md', 'images', 'cdn-cgi', '_next', '.well-known']);
    const publicRedirect = request.method === 'GET' && segments.length === 2 &&
      !reserved.has(segments[0]) && !request.headers.has('authorization') &&
      !request.headers.has('cookie') && !request.headers.has('rsc') &&
      !request.headers.has('next-router-state-tree');
    const key = new Request(`${url.origin}${path}${url.search}`, { method: 'GET' });
    if (publicRedirect) {
      const hit = await caches.default.match(key);
      if (hit) return hit;
    }
    const response = await app.fetch(request, env, ctx);
    if (publicRedirect && [301, 308].includes(response.status) &&
        response.headers.get('location')?.startsWith('/') &&
        !response.headers.get('location').startsWith('//') && !response.headers.has('set-cookie')) {
      const cached = new Response(null, {
        status: response.status,
        headers: { Location: response.headers.get('location'), 'Cache-Control': 'public, max-age=0, s-maxage=60', 'X-CVin-Cache': 'stale-job-redirect' },
      });
      ctx.waitUntil(caches.default.put(key, cached.clone()));
      await response.body?.cancel();
      return cached;
    }
    return response;
  },
};
