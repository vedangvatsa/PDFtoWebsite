import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analyticsTarget, canServeStaticHtml, renderShard, forwardedRequest } from './render-routing.mjs';

const browser = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15';
function request(path = '/about', options = {}) {
  return new Request(`https://cvin.bio${path}`, { ...options, headers: { 'User-Agent': browser, ...options.headers } });
}

describe('lightweight routing preserves representations', () => {
  it('bounds arbitrary paths to a stable finite render pool', () => {
    const names = new Set(Array.from({ length: 5000 }, (_, i) => renderShard(`/person-${i}`)));
    assert.equal(names.size, 4);
    assert.equal(renderShard('/jobs'), renderShard('/jobs'));
  });
  it('allows normal public HTML and tracking params', () => {
    assert.equal(canServeStaticHtml(request()), true);
    assert.equal(canServeStaticHtml(request('/?utm_source=example')), true);
    assert.equal(canServeStaticHtml(request('/about', { method: 'HEAD' })), true);
  });
  it('delegates auth, RSC, actions, revalidation and markdown to Next middleware', () => {
    for (const headers of [{ Authorization: 'Bearer test' }, { RSC: '1' }, { 'next-action': 'test' }, { 'x-isr': '1' }, { Accept: 'text/markdown' }, { 'User-Agent': 'ChatGPT-User' }, { 'User-Agent': `${browser} HeadlessChrome` }]) {
      assert.equal(canServeStaticHtml(request('/about', { headers })), false);
    }
    assert.equal(canServeStaticHtml(request('/about', { method: 'POST' })), false);
    assert.equal(canServeStaticHtml(request('/about?mode=agent')), false);
    assert.equal(canServeStaticHtml(request('/about?_rsc=test')), false);
  });
  it('analytics proxy cannot be turned into an arbitrary-host proxy', () => {
    assert.equal(analyticsTarget(new URL('https://cvin.bio/ingest/static/x.js')).href, 'https://us-assets.i.posthog.com/static/x.js');
    assert.equal(analyticsTarget(new URL('https://cvin.bio/ingest/e/?v=1')).href, 'https://us.i.posthog.com/e/?v=1');
    assert.equal(analyticsTarget(new URL('https://cvin.bio/ingest//evil.example/test')).hostname, 'us.i.posthog.com');
    assert.equal(analyticsTarget(new URL('https://cvin.bio/ingest@evil.example')), null);
  });
  it('overwrites spoofed forwarding headers while preserving auth and body', async () => {
    const forwarded = forwardedRequest(new Request('https://cvin.bio/api/cache/profile', {
      method: 'POST', body: 'payload', headers: {
        'x-forwarded-host': 'evil.example', 'x-forwarded-proto': 'http', Cookie: 'session=test', Origin: 'https://cvin.bio',
      },
    }));
    assert.equal(forwarded.headers.get('host'), 'cvin.bio');
    assert.equal(forwarded.headers.get('x-forwarded-host'), 'cvin.bio');
    assert.equal(forwarded.headers.get('x-forwarded-proto'), 'https');
    assert.equal(forwarded.headers.get('cookie'), 'session=test');
    assert.equal(forwarded.headers.get('origin'), 'https://cvin.bio');
    assert.equal(await forwarded.text(), 'payload');
  });
});
