import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isJobExpired, jobPostingValidThrough } from './job-age.mjs';
import {
  isPublicJobPage,
  shouldListJobOnBoard,
  shouldListJobOnCompanyHub,
} from './job-apply-source';
import {
  companyHubJobLink,
  companyJobsDateOrFilter,
  companyKeyEqualityValues,
  companyNameEqualityValues,
  shouldKeepCompanyHub,
} from './company-hub-query';
import {
  companyHasCachedProfile,
  isUnpublishableCompanyBlurb,
  publishableCompanyAbout,
} from './company-about';
import { getCompanyLinks } from './company-links';
import { trustedCompanyWebsiteUrl } from './company-logo';
import { jobPublicPath } from '../../.github/scripts/lib/job-public-url.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const day = 24 * 60 * 60 * 1000;
const now = Date.parse('2026-08-14T00:00:00.000Z');

function readRel(rel: string) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function hubFnBody(file: string) {
  const m = file.match(
    /export function shouldListJobOnCompanyHub\s*\([^)]*\)[^{]*\{[\s\S]*?\n\}/
  );
  assert.ok(m, 'shouldListJobOnCompanyHub must exist');
  return m[0];
}

describe('indexing canonical URLs', () => {
  it('uses persisted pretty slugs, not the first 8 chars of external_id', () => {
    assert.equal(
      jobPublicPath({
        id: '5e92e3b0-8116-4e07-8f55-6585c749f781',
        company: 'Drata',
        slug: 'drata_enterp-31',
        title: 'Enterprise Account Executive',
        external_id: 'ashby_drata_20db37fa-f83e-4328-bb56-052415c00fd8',
      }),
      '/drata/enterp-31'
    );
  });
});

describe('job age uses newest stamp', () => {
  it('keeps a fresh publish even when created_at is old', () => {
    assert.equal(
      isJobExpired('2026-08-12T00:00:00.000Z', '2025-01-01T00:00:00.000Z', now),
      false
    );
  });

  it('expires only when every stamp is older than the window', () => {
    assert.equal(
      isJobExpired('2026-06-01T00:00:00.000Z', '2026-06-02T00:00:00.000Z', now),
      true
    );
  });

  it('does not expire missing timestamps', () => {
    assert.equal(isJobExpired(null, null, now), false);
  });

  it('validThrough follows the newest stamp, not source published_at', () => {
    const through = jobPostingValidThrough(
      '2026-07-10T00:00:00.000Z',
      '2026-08-05T00:00:00.000Z',
      now
    );
    assert.equal(through.slice(0, 10), '2026-09-04');
    const oldOnly = jobPostingValidThrough(
      '2026-07-10T00:00:00.000Z',
      '2026-07-10T00:00:00.000Z',
      now
    );
    assert.equal(oldOnly.slice(0, 10), '2026-08-09');
  });
});

describe('board vs company hub listing', () => {
  const live = new Date(now - 2 * day).toISOString();
  const uncurated = {
    title: 'Software Engineer',
    tags: [],
    apply_url: 'https://boards.greenhouse.io/openai/jobs/1',
    published_at: live,
    created_at: '2020-01-01T00:00:00.000Z',
  };
  const curated = { ...uncurated, tags: ['curated-jd'] };

  it('lists live uncurated jobs on hubs but not the board', () => {
    assert.equal(shouldListJobOnCompanyHub(uncurated), true);
    assert.equal(shouldListJobOnBoard(uncurated), false);
    assert.equal(isPublicJobPage(uncurated), false);
  });

  it('lists live curated jobs on both', () => {
    assert.equal(shouldListJobOnCompanyHub(curated), true);
    assert.equal(shouldListJobOnBoard(curated), true);
  });

  it('hub cards send uncurated jobs off-site', () => {
    const link = companyHubJobLink({
      id: 'abc',
      company: 'OpenAI',
      title: 'Software Engineer',
      tags: [],
      apply_url: 'https://boards.greenhouse.io/openai/jobs/1',
    });
    assert.equal(link.external, true);
    assert.equal(link.href, 'https://boards.greenhouse.io/openai/jobs/1');
  });

  it('hub cards keep curated jobs on-site', () => {
    const link = companyHubJobLink({
      id: 'abc',
      company: 'OpenAI',
      title: 'Software Engineer',
      tags: ['curated-jd'],
      apply_url: 'https://boards.greenhouse.io/openai/jobs/1',
    });
    assert.equal(link.external, false);
    assert.equal(link.href.startsWith('http'), false);
  });

  it('hub cards send thin curated bodies off-site', () => {
    const link = companyHubJobLink({
      id: 'abc',
      company: 'OpenAI',
      title: 'Software Engineer',
      tags: ['curated-jd'],
      apply_url: 'https://boards.greenhouse.io/openai/jobs/1',
      description: Array.from({ length: 200 }, () => 'word').join(' '),
    });
    assert.equal(link.external, true);
    assert.equal(link.href, 'https://boards.greenhouse.io/openai/jobs/1');
  });

  it('hub cards keep 600-word curated bodies on-site', () => {
    const link = companyHubJobLink({
      id: 'abc',
      company: 'OpenAI',
      title: 'Software Engineer',
      tags: ['curated-jd'],
      apply_url: 'https://boards.greenhouse.io/openai/jobs/1',
      description: Array.from({ length: 600 }, () => 'word').join(' '),
    });
    assert.equal(link.external, false);
    assert.equal(link.href.startsWith('http'), false);
  });
});

describe('company hub query contracts', () => {
  it('ORs published_at and created_at instead of ANDing created_at', () => {
    const filter = companyJobsDateOrFilter('2026-07-15T00:00:00.000Z');
    assert.match(filter, /published_at\.gt\./);
    assert.match(filter, /created_at\.gt\./);
    assert.doesNotMatch(filter, /created_at\.gt\..+created_at/);
  });

  it('queries both slug and display-name keys (OpenAI vs openai)', () => {
    const keys = companyKeyEqualityValues('openai', 'OpenAI');
    assert.ok(keys.includes('openai'));
    const names = companyNameEqualityValues('openai', 'OpenAI');
    assert.ok(names.includes('OpenAI'));
    assert.ok(names.includes('openai'));
  });

  it('keeps wiki-only brands instead of 404ing', () => {
    assert.equal(
      shouldKeepCompanyHub({
        hasDirectory: false,
        liveJobCount: 0,
        hasCachedProfile: true,
      }),
      true
    );
    assert.equal(
      shouldKeepCompanyHub({
        hasDirectory: false,
        liveJobCount: 0,
        hasCachedProfile: false,
      }),
      false
    );
  });
});

describe('company about never publishes aggregator/wiki dumps', () => {
  it('rejects We Work Remotely job-board paste', async () => {
    const dump =
      'Advanced job search for We Work Remotely, allowing you to search and refine jobs across programming, marketing, customer service, etc. Find your next remote career.';
    assert.equal(isUnpublishableCompanyBlurb(dump), true);
    assert.equal(await publishableCompanyAbout('__missing_wwr_slug__'), null);
  });

  it('keeps Databricks as a known hub even when the cache lede is wiki', async () => {
    assert.equal(await companyHasCachedProfile('databricks'), true);
    const about = await publishableCompanyAbout('databricks');
    if (about) {
      assert.equal(isUnpublishableCompanyBlurb(about), false);
    }
  });
});

describe('verified website and social overlay', () => {
  it('resolves OpenAI / Anduril websites by slug even when the display name differs', () => {
    assert.equal(trustedCompanyWebsiteUrl('Anduril Industries', 'anduril'), 'https://anduril.com');
    assert.equal(trustedCompanyWebsiteUrl('OpenAI', 'openai'), 'https://openai.com');
  });

  it('exposes overlay socials for high-profile hubs', () => {
    const openai = getCompanyLinks('openai');
    assert.equal(openai.website, 'https://openai.com');
    assert.ok(openai.linkedin?.includes('linkedin.com/company/openai'));
    assert.ok(openai.github?.includes('github.com/openai'));
  });
});

describe('source locks — do not reintroduce empty hubs', () => {
  it('job-apply-source hub listing is not an alias of the board gate', () => {
    const ts = hubFnBody(readRel('src/lib/job-apply-source.ts'));
    const mjs = hubFnBody(readRel('.github/scripts/lib/job-apply-source.mjs'));
    assert.doesNotMatch(ts, /return shouldListJobOnBoard\(job\)/);
    assert.doesNotMatch(mjs, /return shouldListJobOnBoard\(job\)/);
    assert.match(ts, /return true/);
    assert.match(mjs, /return true/);
  });

  it('does not constrain hub SQL to curated-jd', () => {
    const src = readRel('src/lib/company-page.ts');
    assert.equal(src.includes('withCuratedJdTag('), false, 'hub queries must not use withCuratedJdTag');
    assert.ok(src.includes('companyJobsDateOrFilter'));
    assert.ok(src.includes('shouldListJobOnCompanyHub'));
    assert.ok(src.includes('shouldKeepCompanyHub'));
  });

  it('sitemap date window is newest-stamp OR, not AND created_at', () => {
    for (const rel of ['src/app/sitemap.xml/route.ts', 'src/app/sitemap-jobs/[chunk]/route.ts']) {
      const src = readRel(rel);
      assert.ok(src.includes('companyJobsDateOrFilter'), rel);
      assert.doesNotMatch(src, /\.gt\('created_at'/);
    }
  });

  it('does not drop JobPosting for worldwide remote TELECOMMUTE', () => {
    const src = readRel('src/lib/job-detail-data.ts');
    assert.match(src, /jobLocationType !== 'TELECOMMUTE'/);
    assert.doesNotMatch(
      src,
      /TELECOMMUTE' && jsonLd\.applicantLocationRequirements/
    );
  });

  it('job-age.ts re-exports the shared mjs implementation', () => {
    const src = readRel('src/lib/job-age.ts');
    assert.ok(src.includes("from './job-age.mjs'"));
    assert.ok(src.includes('jobPostingValidThrough'));
    const jsonLd = readRel('src/lib/job-detail-data.ts');
    assert.ok(jsonLd.includes('jobPostingValidThrough'));
    assert.doesNotMatch(
      jsonLd,
      /validThrough = new Date\(\(Number\.isFinite\(postedMs\)/
    );
  });

  it('hub cards send uncurated jobs off-site in source', () => {
    const src = readRel('src/lib/company-hub-query.ts');
    const start = src.indexOf('export function companyHubJobLink');
    const hubLink = src.slice(start);
    assert.ok(hubLink.includes('jobPublicPath(job)'));
    assert.ok(hubLink.includes('external: true'));
    assert.ok(hubLink.includes('isPublicJobPage'));
  });

  it('company hub page uses overlay links and hub card helper', () => {
    const page = readRel('src/app/[slug]/page.tsx');
    assert.match(page, /getCompanyLinks/);
    assert.match(page, /companyHubJobLink/);
  });

  it('hub lists every live job, not a 50-row sample with a fake total', () => {
    const loader = readRel('src/lib/company-page.ts');
    assert.match(loader, /HUB_JOB_PAGE/);
    assert.match(loader, /HUB_JOB_MAX/);
    assert.match(loader, /\.range\(/);
    assert.doesNotMatch(loader, /\.limit\(50\)/);
    assert.match(loader, /const jobCount = jobs\.length/);
    const page = readRel('src/app/[slug]/page.tsx');
    assert.match(page, /const totalJobs = jobs\.length/);
    assert.doesNotMatch(page, /dir\?\.role_count/);
    assert.match(page, /resolveCompanyPage/);
    const og = readRel('src/app/[slug]/opengraph-image.tsx');
    assert.match(og, /loadCompanyJobs/);
    assert.doesNotMatch(og, /jobCount = companyDir\.role_count/);
  });

  it('agent rule does not require hub to alias the board', () => {
    const rule = readRel('.cursor/rules/public-job-gate.mdc');
    assert.doesNotMatch(rule, /must\*\* `return shouldListJobOnBoard/);
    assert.match(rule, /Never `return shouldListJobOnBoard\(job\)`/);
  });
});
