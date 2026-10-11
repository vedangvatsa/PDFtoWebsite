import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SITEMAP_CACHE_EPOCH,
  sitemapXmlHasUrls,
  JOB_SITEMAP_PAGE,
  cacheKeyFor,
} from './sitemap-cache';

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
  it('changes XML cache keys after publication while ignoring query noise', () => {
    assert.equal(cacheKeyFor('https://cvin.bio/rss.xml?q=a', 10).url, cacheKeyFor('https://cvin.bio/rss.xml?q=b', 10).url);
    assert.notEqual(cacheKeyFor('https://cvin.bio/rss.xml', 10).url, cacheKeyFor('https://cvin.bio/rss.xml', 11).url);
    assert.equal(sitemapXmlHasUrls('<rss><channel><item><link>url</link></item></channel></rss>'), true);
    assert.equal(sitemapXmlHasUrls('<jobs><job id="1"></job></jobs>'), true);
    assert.equal(sitemapXmlHasUrls('<jobs></jobs>'), false);
  });
  it('does not resurrect a previous deployment snapshot when tag revisions reset', () => {
    const oldBuild = cacheKeyFor('https://cvin.bio/sitemap-jobs/0', 0, 'old-build').url;
    const newBuild = cacheKeyFor('https://cvin.bio/sitemap-jobs/0', 0, 'new-build').url;
    assert.notEqual(oldBuild, newBuild);
    assert.equal(newBuild, cacheKeyFor('https://cvin.bio/sitemap-jobs/0?noise=1', 0, 'new-build').url);
  });

  it('withSitemapCache rejects empty hits and never stores empty builds', () => {
    const file = fs.readFileSync(path.join(root, 'src/lib/sitemap-cache.ts'), 'utf8');
    assert.match(file, /sitemapXmlHasUrls\(cachedXml\)/);
    assert.match(file, /no-store/);
    assert.match(file, /SITEMAP_CACHE_EPOCH/);
    assert.match(file, /if \(isEmpty\)/);
    assert.match(file, /cache\.put/);
  });

  it('job sitemap chunk does not select description or swallow DB errors', () => {
    const file = fs.readFileSync(
      path.join(root, 'src/app/sitemap-jobs/[chunk]/route.ts'),
      'utf8'
    );
    assert.doesNotMatch(file, /select\([^)]*description/);
    assert.match(file, /fetchSitemapJobsCreatedPage/);
    assert.doesNotMatch(file, /companyJobsDateOrFilter/);
  });

  it('sitemap queries use DB budgets and split OR date filter', () => {
    const file = fs.readFileSync(path.join(root, 'src/lib/sitemap-jobs-query.ts'), 'utf8');
    assert.match(file, /withTimeoutFallback/);
    assert.match(file, /DB_BUDGET/);
    assert.match(file, /gte\('created_at'/);
    assert.match(file, /fetchSitemapJobsPublishedComplement/);
    assert.doesNotMatch(file, /companyJobsDateOrFilter/);
  });
});
