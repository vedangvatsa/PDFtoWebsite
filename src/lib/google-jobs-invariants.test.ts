/**
 * Behavioral locks for Google Jobs. Source greps are not enough — Aug 2026
 * dropped JobPosting on live "Remote" pages and pinged 404 Indexing URLs.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildJobJsonLd, buildJobFaqJsonLd } from './job-detail-data';
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
    assert.equal(ld.applicantLocationRequirements, undefined);
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
    const req = ld.applicantLocationRequirements as { name?: string };
    assert.equal(req?.name, 'USA');
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
  });

  it('deploy and scheduler pass NEXT_PUBLIC_SUPABASE_URL into the indexing step', () => {
    for (const rel of [
      '.github/workflows/deploy-cloudflare.yml',
      '.github/workflows/x-bsky-scheduler.yml',
    ]) {
      const file = fs.readFileSync(path.join(root, rel), 'utf8');
      assert.match(file, /Notify Google Indexing API/, rel);
      assert.ok(
        file.includes('NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}'),
        `${rel} indexing step missing NEXT_PUBLIC_SUPABASE_URL`
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
    assert.doesNotMatch(file, /\$\{SITE\}\/api\/jobs/);
  });

  it('WebSite SearchAction points at /jobs?q= not /{query} hubs', () => {
    const file = fs.readFileSync(path.join(root, 'src/app/layout.tsx'), 'utf8');
    assert.match(file, /\/jobs\?q=\{search_term_string\}/);
    assert.doesNotMatch(file, /urlTemplate: `\$\{siteUrl\}\/\{search_term_string\}`/);
  });

  it('homepage and /jobs ship FAQPage JSON-LD', () => {
    const home = fs.readFileSync(path.join(root, 'src/app/page.tsx'), 'utf8');
    const jobs = fs.readFileSync(path.join(root, 'src/app/jobs/page.tsx'), 'utf8');
    assert.match(home, /FAQPage/);
    assert.match(jobs, /FAQPage/);
  });

  it('robots.txt explicitly allows AI citation crawlers', () => {
    const file = fs.readFileSync(path.join(root, 'src/app/robots.ts'), 'utf8');
    assert.match(file, /Google-Extended/);
    assert.match(file, /OAI-SearchBot/);
    assert.match(file, /PerplexityBot/);
  });
});
