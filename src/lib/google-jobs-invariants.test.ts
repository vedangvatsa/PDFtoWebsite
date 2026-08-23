/**
 * Behavioral locks for Google Jobs. Source greps are not enough — Aug 2026
 * dropped JobPosting on live "Remote" pages and pinged 404 Indexing URLs.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildJobJsonLd, buildJobFaqJsonLd, titleSearchTokens, scoreRelatedJob } from './job-detail-data';
import type { JobRow } from './job-detail-data';
import type { JobDetail } from '@/app/jobs/[id]/job-detail-client';
import { jobPublicPath } from '../../.github/scripts/lib/job-public-url.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BODY = Array.from(
  { length: 40 },
  (_, i) => `Own the pipeline for enterprise accounts including discovery, demo, and close ${i + 1}.`
).join(' ');

function row(over: Partial<JobRow> = {}): JobRow {
  return {
    id: '5e92e3b0-8116-4e07-8f55-6585c749f781',
    title: 'Enterprise Account Executive',
    company: 'Drata',
    company_logo: null,
    location: 'Remote',
    job_type: 'full_time',
    salary: null,
    tags: ['curated-jd'],
    apply_url: 'https://jobs.ashbyhq.com/drata/example',
    category: 'Sales',
    source: 'ashby',
    published_at: '2026-07-10T00:00:00.000Z',
    created_at: '2026-08-05T00:00:00.000Z',
    description: BODY,
    external_id: 'ashby_drata_20db37fa-f83e-4328-bb56-052415c00fd8',
    slug: 'drata_enterp-31',
    ...over,
  };
}

function detail(over: Partial<JobDetail> = {}): JobDetail {
  return {
    id: '5e92e3b0-8116-4e07-8f55-6585c749f781',
    title: 'Enterprise Account Executive',
    company: 'Drata',
    company_logo: null,
    location: 'Remote',
    job_type: 'full_time',
    salary: null,
    tags: ['curated-jd'],
    apply_url: 'https://jobs.ashbyhq.com/drata/example',
    category: 'Sales',
    source: 'ashby',
    published_at: '2026-07-10T00:00:00.000Z',
    created_at: '2026-08-05T00:00:00.000Z',
    description_html: `<p>${BODY}</p>`,
    description_plain: BODY,
    has_description: true,
    excerpt: BODY.slice(0, 200),
    description_word_count: BODY.split(/\s+/).length,
    is_indexable: true,
    company_slug: 'drata',
    job_slug: 'enterp-31',
    public_path: '/drata/enterp-31',
    expired: false,
    ...over,
  };
}

describe('JobPosting JSON-LD', () => {
  const site = 'https://cvin.bio';

  it('emits TELECOMMUTE JobPosting for worldwide Remote without inventing a country', () => {
    const ld = buildJobJsonLd(row(), detail(), site);
    assert.ok(ld, 'worldwide remote must keep JobPosting');
    assert.equal(ld['@type'], 'JobPosting');
    assert.equal(ld.jobLocationType, 'TELECOMMUTE');
    const req = ld.applicantLocationRequirements as { '@type'?: string; name?: string };
    assert.equal(req?.['@type'], 'AdministrativeArea');
    assert.equal(req?.name, 'Worldwide');
    assert.equal(ld.employmentType, 'FULL_TIME');
    assert.equal(ld.url, 'https://cvin.bio/drata/enterp-31');
  });

  it('adds USA applicantLocationRequirements for Remote (USA)', () => {
    const ld = buildJobJsonLd(
      row({ location: 'Remote (USA)' }),
      detail({ location: 'Remote (USA)' }),
      site
    );
    assert.ok(ld);
    assert.equal(ld.jobLocationType, 'TELECOMMUTE');
    const req = ld.applicantLocationRequirements as { '@type'?: string; name?: string };
    assert.equal(req?.['@type'], 'Country');
    assert.equal(req?.name, 'USA');
  });

  it('uses AdministrativeArea for Remote (Europe), not a fake Country', () => {
    const ld = buildJobJsonLd(
      row({ location: 'Remote (Europe)' }),
      detail({ location: 'Remote (Europe)' }),
      site
    );
    assert.ok(ld);
    assert.equal(ld.jobLocationType, 'TELECOMMUTE');
    const req = ld.applicantLocationRequirements as { '@type'?: string; name?: string };
    assert.equal(req?.['@type'], 'AdministrativeArea');
    assert.equal(req?.name, 'Europe');
  });

  it('validThrough follows ingest created_at when source published_at is older', () => {
    const ld = buildJobJsonLd(row(), detail(), site);
    assert.ok(ld);
    assert.equal(String(ld.validThrough).slice(0, 10), '2026-09-04');
  });

  it('emits FAQPage from live job fields', () => {
    const faq = buildJobFaqJsonLd(row(), detail());
    assert.equal(faq['@type'], 'FAQPage');
    const names = (faq.mainEntity as { name: string }[]).map((q) => q.name);
    assert.ok(names.some((n) => /remote/i.test(n)));
    assert.ok(names.some((n) => /apply/i.test(n)));
  });

  it('omits JobPosting when the page is expired or not indexable', () => {
    assert.equal(buildJobJsonLd(row(), detail({ expired: true }), site), null);
    assert.equal(buildJobJsonLd(row(), detail({ is_indexable: false }), site), null);
  });

  it('keeps JobPosting for Canada/India cities (ISO CA/IN must not be stripped as US states)', () => {
    const toronto = buildJobJsonLd(
      row({ location: 'Toronto' }),
      detail({ location: 'Toronto' }),
      site
    );
    assert.ok(toronto, 'Toronto must emit JobPosting');
    const tLoc = toronto.jobLocation as { address?: { addressCountry?: string } };
    assert.equal(tLoc?.address?.addressCountry, 'CA');

    const india = buildJobJsonLd(
      row({ location: 'Bangalore' }),
      detail({ location: 'Bangalore' }),
      site
    );
    assert.ok(india);
    const iLoc = india.jobLocation as { address?: { addressCountry?: string } };
    assert.equal(iLoc?.address?.addressCountry, 'IN');
  });

  it('maps City, FullStateName and City, Country into jobLocation', () => {
    const chicago = buildJobJsonLd(
      row({ location: 'Chicago, Illinois' }),
      detail({ location: 'Chicago, Illinois' }),
      site
    );
    assert.ok(chicago, 'Chicago, Illinois must emit JobPosting');
    const cLoc = chicago.jobLocation as {
      address?: { addressCountry?: string; addressRegion?: string; addressLocality?: string };
    };
    assert.equal(cLoc?.address?.addressCountry, 'US');
    assert.equal(cLoc?.address?.addressRegion, 'IL');
    assert.equal(cLoc?.address?.addressLocality, 'Chicago');

    const greece = buildJobJsonLd(
      row({ location: 'Piraeus, Greece' }),
      detail({ location: 'Piraeus, Greece' }),
      site
    );
    assert.ok(greece);
    const gLoc = greece.jobLocation as {
      address?: { addressCountry?: string; addressLocality?: string };
    };
    assert.equal(gLoc?.address?.addressCountry, 'GR');
    assert.equal(gLoc?.address?.addressLocality, 'Piraeus');

    const estonia = buildJobJsonLd(
      row({ location: 'Estonia' }),
      detail({ location: 'Estonia' }),
      site
    );
    assert.ok(estonia);
    const eLoc = estonia.jobLocation as { address?: { addressCountry?: string } };
    assert.equal(eLoc?.address?.addressCountry, 'EE');
  });

  it('treats Full-time/Part-time/Contract in location as employmentType, not a Place', () => {
    const cases: { loc: string; type: string }[] = [
      { loc: 'Full-time', type: 'FULL_TIME' },
      { loc: 'Part-time', type: 'PART_TIME' },
      { loc: 'Contract', type: 'CONTRACTOR' },
    ];
    for (const { loc, type } of cases) {
      const ld = buildJobJsonLd(
        row({ location: loc, job_type: null }),
        detail({ location: loc }),
        site
      );
      assert.ok(ld, `misfiled job type "${loc}" must still emit JobPosting`);
      assert.equal(ld.employmentType, type);
      assert.equal(ld.jobLocationType, 'TELECOMMUTE');
      const req = ld.applicantLocationRequirements as { '@type'?: string; name?: string };
      assert.equal(req?.['@type'], 'AdministrativeArea');
      assert.equal(req?.name, 'Worldwide');
      assert.equal(ld.jobLocation, undefined);
    }
    const na = buildJobJsonLd(
      row({ location: 'N/A', job_type: null }),
      detail({ location: 'N/A' }),
      site
    );
    assert.ok(na);
    assert.equal(na.jobLocationType, 'TELECOMMUTE');
    assert.equal(na.jobLocation, undefined);
  });
});

describe('Indexing API / sitemap cannot drift off public paths', () => {
  it('jobPublicPath matches JobPosting url path', () => {
    const job = row();
    assert.equal(jobPublicPath(job), '/drata/enterp-31');
  });

  it('google-indexing uses jobPublicPath, both supabase URL env names, and SCHEMA_EPOCH refresh', () => {
    const file = fs.readFileSync(
      path.join(root, '.github/scripts/google-indexing.mjs'),
      'utf8'
    );
    assert.match(file, /jobPublicPath/);
    assert.doesNotMatch(file, /slice\(0,\s*8\)/);
    assert.match(file, /NEXT_PUBLIC_SUPABASE_URL \|\| process\.env\.SUPABASE_URL/);
    assert.match(file, /SCHEMA_EPOCH/);
    assert.match(file, /gte\('created_at', since\)/);
    assert.match(file, /gte\('published_at', since\)/);
    assert.doesNotMatch(file, /published_at\.gt\.\$\{since\},created_at\.gt\.\$\{since\}/);
    assert.match(file, /MAX_SCAN/);
    assert.doesNotMatch(file, /50_000/);
    assert.match(file, /ownership/);
    assert.match(file, /pingIndexNow/);
    assert.match(file, /\/jobs\/\$\{job\.id\}/);
    assert.match(file, /ensureGscOwnership/);
    // Dead state URLs (redirects) must URL_DELETED beyond the capped live scan.
    assert.match(file, /findDeadStateUrls/);
    assert.match(file, /jobStillIndexableAtUrl/);
    assert.match(file, /MAX_REMOVE_PER_RUN/);
    assert.match(file, /isStatementTimeout|statement timeout/i);
    assert.match(file, /HYDRATE_BATCH/);
    assert.doesNotMatch(file, /fetchedUrls\.has\(url\) && !liveUrls\.has\(url\)/);
    // Prefer refreshing URLs Google already has before brand-new inventory.
    assert.match(file, /knownA/);
    assert.match(file, /Removes first/);
  });

  it('Indexing API run verifies the service account on cvin.bio via DNS TXT', () => {
    const file = fs.readFileSync(
      path.join(root, '.github/scripts/ensure-gsc-ownership.mjs'),
      'utf8'
    );
    assert.match(file, /siteVerification/);
    assert.match(file, /DNS_TXT/);
    assert.match(file, /INET_DOMAIN/);
    assert.match(file, /cvin\.bio/);
    assert.match(file, /CLOUDFLARE_API_KEY/);
  });

  it('deploy and scheduler pass NEXT_PUBLIC_SUPABASE_URL into the indexing step', () => {
    for (const rel of [
      '.github/workflows/deploy-cloudflare.yml',
      '.github/workflows/x-bsky-scheduler.yml',
      '.github/workflows/google-indexing.yml',
    ]) {
      const file = fs.readFileSync(path.join(root, rel), 'utf8');
      assert.match(file, /Notify Google Indexing API/, rel);
      assert.ok(
        file.includes('NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}'),
        `${rel} indexing step missing NEXT_PUBLIC_SUPABASE_URL`
      );
      assert.ok(
        file.includes('CLOUDFLARE_API_KEY: ${{ secrets.CLOUDFLARE_API_KEY }}'),
        `${rel} indexing step missing Cloudflare DNS credentials for GSC ownership`
      );
    }
  });

  it('deploy runs a live Googlebot JobPosting canary after wrangler deploy', () => {
    const file = fs.readFileSync(
      path.join(root, '.github/workflows/deploy-cloudflare.yml'),
      'utf8'
    );
    assert.match(file, /google-jobs-canary\.mjs/);
    const deployAt = file.indexOf('npx wrangler deploy');
    const canaryAt = file.indexOf('google-jobs-canary.mjs');
    assert.ok(deployAt >= 0 && canaryAt > deployAt, 'canary must run after deploy');
  });

  it('canary reads sitemap job URLs instead of /api/jobs', () => {
    const file = fs.readFileSync(
      path.join(root, '.github/scripts/google-jobs-canary.mjs'),
      'utf8'
    );
    assert.match(file, /sitemap-jobs\/0/);
    assert.match(file, /applicantLocationRequirements/);
    assert.doesNotMatch(file, /\$\{SITE\}\/api\/jobs/);
  });

  it('WebSite SearchAction points at /jobs?q= not /{query} hubs', () => {
    const file = fs.readFileSync(path.join(root, 'src/app/layout.tsx'), 'utf8');
    assert.match(file, /\/jobs\?q=\{search_term_string\}/);
    assert.doesNotMatch(file, /urlTemplate: `\$\{siteUrl\}\/\{search_term_string\}`/);
  });

  it('homepage does not ship FAQPage JSON-LD', () => {
    const home = fs.readFileSync(path.join(root, 'src/app/page.tsx'), 'utf8');
    assert.doesNotMatch(home, /FAQPage/);
  });

  it('contact and hiring ship FAQPage JSON-LD', () => {
    const contact = fs.readFileSync(path.join(root, 'src/app/contact/layout.tsx'), 'utf8');
    const hiring = fs.readFileSync(path.join(root, 'src/app/hiring/page.tsx'), 'utf8');
    assert.match(contact, /FAQPage/);
    assert.match(hiring, /FAQPage/);
  });

  it('company hubs include a CVin.Bio URL FAQ', () => {
    const page = fs.readFileSync(path.join(root, 'src/app/[slug]/(hub)/page.tsx'), 'utf8');
    assert.match(page, /Where can I find \$\{companyName\} jobs on CVin\.Bio\?/);
    assert.match(page, /https:\/\/cvin\.bio\/\$\{slug\}/);
  });

  it('IndexNow pings citation pages not only job URLs', () => {
    const file = fs.readFileSync(
      path.join(root, '.github/scripts/google-indexing.mjs'),
      'utf8'
    );
    assert.match(file, /\$\{SITE_URL\}\/flexboard/);
    assert.match(file, /\$\{SITE_URL\}\/contact/);
    assert.match(file, /\$\{SITE_URL\}\/ai/);
  });

  it('robots.txt explicitly allows AI citation crawlers', () => {
    const file = fs.readFileSync(path.join(root, 'src/app/robots.txt/route.ts'), 'utf8');
    assert.match(file, /Google-Extended/);
    assert.match(file, /OAI-SearchBot/);
    assert.match(file, /PerplexityBot/);
  });
});

describe('related jobs do not ride generic title tokens', () => {
  it('does not treat AI or winter as related-search tokens', () => {
    const tokens = titleSearchTokens('ERA:AI Fellowship Winter 2027');
    assert.equal(tokens.includes('ai'), false);
    assert.equal(tokens.includes('winter'), false);
    assert.equal(tokens.includes('fellowship'), false);
  });

  it('does not rank a Winter Park GM under an ERA fellowship', () => {
    const era = row({
      title: 'ERA:AI Fellowship Winter 2027',
      company: 'ERA',
      category: 'fellowship',
      tags: ['curated-jd', 'fellowship', 'AI'],
    });
    const gm = row({
      id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      title: 'General Manager - Winter Park',
      company: 'Intrawest',
      category: 'Operations',
      tags: ['curated-jd'],
    });
    const tokens = titleSearchTokens(era.title);
    assert.equal(scoreRelatedJob(gm, era, tokens), 0);
  });
});
