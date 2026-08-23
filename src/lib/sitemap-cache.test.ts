import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SITEMAP_CACHE_EPOCH,
  sitemapXmlHasUrls,
  JOB_SITEMAP_PAGE,
} from './sitemap-cache.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('sitemap cache must not poison Google Jobs discovery', () => {
  it('detects empty urlsets', () => {
    assert.equal(
      sitemapXmlHasUrls(`<?xml version="1.0"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`),
      false
    );
    assert.equal(
      sitemapXmlHasUrls(
        `<urlset><url><loc>https://cvin.bio/openai/engineer</loc></url></urlset>`
      ),
      true
    );
  });

  it('bumps cache epoch and keeps page size small', () => {
    assert.match(SITEMAP_CACHE_EPOCH, /^v\d+/);
    assert.ok(JOB_SITEMAP_PAGE <= 250, 'fat pages + OR date filter time out');
  });

  it('withSitemapCache rejects empty hits and never stores empty builds', () => {
    const file = fs.readFileSync(path.join(root, 'src/lib/sitemap-cache.ts'), 'utf8');
    assert.match(file, /sitemapXmlHasUrls\(cachedXml\)/);
    assert.match(file, /no-store/);
    assert.match(file, /SITEMAP_CACHE_EPOCH/);
    assert.match(file, /if \(!isEmpty\)/);
    assert.match(file, /cache\.put/);
  });

  it('job sitemap chunk does not select description or swallow DB errors', () => {
    const file = fs.readFileSync(
      path.join(root, 'src/app/sitemap-jobs/[chunk]/route.ts'),
      'utf8'
    );
    assert.doesNotMatch(file, /select\([^)]*description/);
    assert.match(file, /if \(error\)/);
    assert.match(file, /throw new Error/);
  });
});
