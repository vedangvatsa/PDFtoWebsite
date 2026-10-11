import { browserSafeRedirect } from './src/lib/redirect-cache.mjs';
import { rendererStub, RENDER_POOL_SIZE, PARSER_POOL_SIZE, IMAGE_POOL_SIZE, AI_RENDER_LOCATION, analyticsTarget, canServeStaticHtml, forwardedRequest } from './src/lib/render-routing.mjs';
import staticPages from './.open-next/static-pages.json';
// Retain the existing queue namespace for migration compatibility, without
// importing Next.js or any of its middleware into the gateway.
export { DOQueueHandler } from './.open-next/.build/durable-objects/queue.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const analytics = analyticsTarget(url);
    if (analytics) {
      const headers = new Headers(request.headers);
      headers.delete('host');
      headers.delete('cookie');
      headers.delete('authorization');
      return fetch(new Request(analytics, {
        method: request.method, headers, redirect: 'manual',
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      }));
    }
    const page = Object.hasOwn(staticPages, path) ? staticPages[path] : null;
    if (page && canServeStaticHtml(request)) {
      const asset = await env.ASSETS.fetch(new Request(`https://assets.local${page.asset}`, { method: request.method }));
      if (asset.ok) {
        const headers = new Headers(asset.headers);
        for (const [key, value] of Object.entries(page.headers)) headers.set(key, value);
        headers.set('Content-Type', 'text/html; charset=utf-8');
        headers.set('Cache-Control', 'private, no-store');
        headers.set('X-CVin-Render', 'static');
        return new Response(asset.body, { status: asset.status, headers });
      }
      await asset.body?.cancel();
    }
    if (['/api/parse-resume', '/v1/api/parse-resume', '/v1/parse-resume'].includes(path.replace(/\/$/, ''))) {
      // Normalize documented API aliases before the isolated parser's router.
      url.pathname = '/api/parse-resume';
      return rendererStub(env.PARSER_RENDERER, request.headers.get('cf-connecting-ip') || path, PARSER_POOL_SIZE, AI_RENDER_LOCATION).fetch(new Request(url, forwardedRequest(request)));
    }
    if (/\/opengraph-image(?:\/|$)/.test(path) || /^\/(?:icon|apple-icon)\/?$/.test(path)) {
      return rendererStub(env.IMAGE_RENDERER, path, IMAGE_POOL_SIZE).fetch(forwardedRequest(request));
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
      if (hit) return browserSafeRedirect(hit);
    }
    const response = await rendererStub(env.APP_RENDERER, path, RENDER_POOL_SIZE, AI_RENDER_LOCATION).fetch(forwardedRequest(request));
    if (publicRedirect && [301, 308].includes(response.status) &&
        response.headers.get('location')?.startsWith('/') &&
        !response.headers.get('location').startsWith('//') && !response.headers.has('set-cookie')) {
      const cached = new Response(null, {
        status: response.status,
        headers: { Location: response.headers.get('location'), 'Cache-Control': 'public, max-age=0, s-maxage=60', 'X-CVin-Cache': 'stale-job-redirect' },
      });
      ctx.waitUntil(caches.default.put(key, cached.clone()));
      await response.body?.cancel();
      return browserSafeRedirect(cached);
    }
    return response;
  },
};
