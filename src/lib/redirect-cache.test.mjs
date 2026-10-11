import { it } from 'node:test';
import assert from 'node:assert/strict';
import { browserSafeRedirect } from './redirect-cache.mjs';

it('retains the short internal edge TTL while preventing browser/CDN retention', () => {
  const stored = new Response(null, { status: 308, headers: {
    Location: '/tenstorrent', 'Cache-Control': 'public, max-age=14400, s-maxage=60',
  } });
  const sent = browserSafeRedirect(stored);
  assert.equal(sent.status, 308);
  assert.equal(sent.headers.get('location'), '/tenstorrent');
  assert.equal(sent.headers.get('cache-control'), 'private, no-store');
  assert.equal(sent.headers.get('cloudflare-cdn-cache-control'), 'no-store');
  assert.match(stored.headers.get('cache-control'), /s-maxage=60/);
});
