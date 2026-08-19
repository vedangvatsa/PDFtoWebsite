/**
 * Locks job URLs / sitemap / feeds to curated-jd.
 * /jobs board + company hubs are live inventory (uncurated = apply-out).
 * Do not require withCuratedJdTag on hub or board SQL.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function src(rel: string) {
  return readFileSync(join(root, rel), 'utf8');
}

function hubFn(file: string) {
  const m = file.match(
    /export function shouldListJobOnCompanyHub\s*\([^)]*\)[^{]*\{[\s\S]*?\n\}/
  );
  assert.ok(m, 'shouldListJobOnCompanyHub must exist');
  return m[0];
}

function walk(dir: string, acc: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.next' || e.name === '.open-next') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx|mjs|js)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

const CURATED_MARK =
  /withCuratedJdTag|['"]curated-jd['"]|isPublicJobPage|shouldListJobOnBoard|shouldListJobOnCompanyHub|shouldListLiveJobCard|liveUncuratedApplyUrl|companyHubJobLink|jobQualifiesForSitemap|isCuratedJd|cs\.\{\"curated-jd\"\}/;

const LIST_QUERY =
  /\.from\(\s*['"]jobs['"]\s*\)|restUrl\([^)]*['"]jobs['"]/;

/** By-id / admin / enrich internals — not public inventories. Hubs are live inventory. */
const SKIP_LIST_SCAN = [
  'src/lib/job-snapshots.ts',
  'src/lib/company-page.ts',
  'src/lib/seo-fallbacks.ts',
  'src/app/api/jobs/track/',
  'src/app/api/admin/',
  'src/app/editor/',
  'src/app/api/report-stats/',
  'src/app/hiring/opengraph-image.tsx',
  'src/app/jobs/opengraph-image.tsx',
  '.github/scripts/jobs-sync.mjs',
  '.github/scripts/enrich-remote-job-descriptions.mjs',
  '.github/scripts/publish-manual-jd.mjs',
  '.github/scripts/scrub-leaked-instructions.mjs',
  '.github/scripts/scrub-mechanical-pivot-slop.mjs',
  '.github/scripts/cleanup-old-jobs.mjs',
  '.github/scripts/queue-manual-jd-priority.mjs',
  '.github/scripts/restore-rows.mjs',
  '.github/scripts/match-restore.mjs',
];

describe('hub gate is live inventory, not the board gate', () => {
  it('TypeScript hub listing is independent of shouldListJobOnBoard', () => {
    const body = hubFn(src('src/lib/job-apply-source.ts'));
    assert.doesNotMatch(body, /return shouldListJobOnBoard\(job\)/);
    assert.match(body, /return true/);
  });

  it('script mirror hub listing is independent of shouldListJobOnBoard', () => {
    const body = hubFn(src('.github/scripts/lib/job-apply-source.mjs'));
    assert.doesNotMatch(body, /return shouldListJobOnBoard\(job\)/);
    assert.match(body, /return true/);
  });

  it('keeps live-inventory hub SQL (no curated-jd wrap)', () => {
    const page = src('src/lib/company-page.ts');
    assert.match(page, /Hub listing is live inventory/);
    assert.doesNotMatch(page, /withCuratedJdTag\(/);
  });
});

describe('public job URLs 301 uncurated stubs', () => {
  for (const rel of [
    'src/app/jobs/[id]/page.tsx',
    'src/app/[slug]/[jobSlug]/page.tsx',
  ]) {
    it(`${rel} gates with isPublicJobPage + redirect`, () => {
      const file = src(rel);
      assert.match(file, /isPublicJobPage/, rel);
      assert.match(file, /liveUncuratedApplyUrl/, rel);
      assert.match(file, /redirect\(/, rel);
      assert.match(file, /permanentRedirect/, rel);
      assert.match(file, /!job \|\| !isPublicJobPage\(job\)/, rel);
    });
  }

  it('GET /api/jobs/[id] 404s uncurated rows', () => {
    const file = src('src/app/api/jobs/[id]/route.ts');
    assert.match(file, /isPublicJobPage/);
    assert.match(file, /status: 404/);
  });

  for (const rel of [
    'src/app/jobs/[id]/opengraph-image.tsx',
    'src/app/[slug]/[jobSlug]/opengraph-image.tsx',
  ]) {
    it(`${rel} skips personalizing uncurated jobs`, () => {
      assert.match(src(rel), /isPublicJobPage/);
    });
  }

  it('job pages have no ancestor loading.tsx (streaming 200 swallows 308)', () => {
    // GSC "Excluded by noindex" exploded because [slug]/loading.tsx streamed
    // 200 + generateMetadata noindex instead of HTTP 308 for gone jobs.
    assert.equal(existsSync(join(root, 'src/app/[slug]/loading.tsx')), false);
    assert.equal(existsSync(join(root, 'src/app/jobs/loading.tsx')), false);
    assert.equal(existsSync(join(root, 'src/app/[slug]/(hub)/loading.tsx')), true);
    assert.equal(existsSync(join(root, 'src/app/jobs/(board)/loading.tsx')), true);
  });
});

describe('public lists constrain curated-jd before limit()', () => {
  it('company hub SQL is live inventory + in-memory hub gate', () => {
    const file = src('src/lib/company-page.ts');
    assert.doesNotMatch(file, /withCuratedJdTag\(/);
    assert.match(file, /shouldListJobOnCompanyHub/);
  });

  it('board API lists live inventory; uncurated cards go apply-out', () => {
    const file = src('src/app/api/jobs/route.ts');
    assert.doesNotMatch(file, /withCuratedJdTag\(/);
    assert.match(file, /shouldListLiveJobCard/);
    assert.match(file, /companyHubJobLink/);
    assert.match(file, /companyJobsDateOrFilter/);
    assert.match(file, /kind === 'fellowship'/);
  });

  it('public job URLs require a 600-word curated body', () => {
    const ts = src('src/lib/job-apply-source.ts');
    const mjs = src('.github/scripts/lib/job-apply-source.mjs');
    assert.match(ts, /curatedJdMeetsWordFloor/);
    assert.match(mjs, /curatedJdMeetsWordFloor/);
    assert.match(ts, /JOB_INDEXABLE_MIN_WORDS/);
    assert.match(mjs, /MIN_WORDS/);
    const sitemap = src('src/app/sitemap-jobs/[chunk]/route.ts');
    assert.match(sitemap, /description/);
    const detail = src('src/lib/job-detail-data.ts');
    assert.match(detail, /wordCount >= JOB_INDEXABLE_MIN_WORDS/);
    assert.doesNotMatch(detail, /wordCount >= 40/);
  });

  it('plain-node job-apply-source.mjs never imports the TS format gate', () => {
    // jobs-sync / google-indexing / telegram run under `node`, not tsx.
    // Importing job-description-gate pulls job-description.ts + @/ aliases and crashes CI.
    const mjs = src('.github/scripts/lib/job-apply-source.mjs');
    assert.doesNotMatch(mjs, /from\s+['"]\.\/job-description-gate\.mjs['"]/);
    assert.doesNotMatch(mjs, /from\s+['"][^'"]*job-description\.ts['"]/);
  });

  it('jobs-sync / cleanup never Telegram-post on failure', () => {
    const workflows = [
      src('.github/workflows/x-scheduler.yml'),
      src('.github/workflows/cleanup-old-jobs.yml'),
    ].join('\n');
    assert.doesNotMatch(workflows, /Notify on failure/);
    assert.doesNotMatch(workflows, /jobs-sync failed/);
    assert.doesNotMatch(workflows, /cleanup-old-jobs failed/);
    assert.doesNotMatch(workflows, /if:\s*failure\(\)/);
    assert.doesNotMatch(workflows, /github\.com\/\$\{\{\s*github\.repository/);
    assert.doesNotMatch(workflows, /actions\/runs\/\$\{\{\s*github\.run_id/);
  });

  it('fellowships board reuses curated jobs API, not hub SQL', () => {
    const page = src('src/app/fellowships/page.tsx');
    assert.match(page, /mode="fellowships"/);
    assert.doesNotMatch(page, /withCuratedJdTag\(/);
    const client = src('src/components/jobs-client.tsx');
    assert.match(client, /kind', 'fellowship'/);
  });

  it('related jobs SQL requires curated-jd', () => {
    const file = src('src/lib/job-detail-data.ts');
    assert.match(file, /contains\('tags', \['curated-jd'/);
    assert.match(file, /shouldListJobOnBoard/);
  });

  for (const rel of [
    'src/app/sitemap.xml/route.ts',
    'src/app/sitemap-jobs/[chunk]/route.ts',
    'src/app/rss.xml/route.ts',
    'src/app/indeed.xml/route.ts',
    'src/app/jooble.xml/route.ts',
    'src/app/jobtome.xml/route.ts',
    'src/lib/llms-directory.ts',
  ]) {
    it(`${rel} filters curated-jd`, () => {
      const file = src(rel);
      assert.match(file, LIST_QUERY, rel);
      assert.match(file, /curated-jd/, rel);
    });
  }

  it('hub cards outbound-link uncurated apply URLs', () => {
    const file = src('src/lib/company-hub-query.ts');
    assert.match(file, /jobPublicPath\(job\)/);
    assert.match(file, /external:\s*true/);
  });

  it('jobs board client opens uncurated cards off-site', () => {
    const file = src('src/components/jobs-client.tsx');
    assert.match(file, /job\.external/);
    assert.match(file, /target="_blank"/);
    assert.match(file, /ExternalLink/);
  });
});

describe('ingest cannot mint curated-jd; DB cannot auto-tag it', () => {
  it('jobs-sync strips curated-jd on insert', () => {
    const file = src('.github/scripts/jobs-sync.mjs');
    assert.match(file, /toLowerCase\(\) !== 'curated-jd'/);
    assert.doesNotMatch(file, /tags\.push\(['"]curated-jd['"]\)/);
  });

  it('jobs-sync enriches newly inserted ids in the same run', () => {
    const file = src('.github/scripts/jobs-sync.mjs');
    assert.match(file, /enrichInsertedJobs/);
    assert.match(file, /enrich-remote-job-descriptions\.mjs/);
    assert.match(file, /PRIORITY_IDS_FILE/);
    assert.match(file, /SKIP_ENRICH/);
  });

  it('jobs-sync rejects unverifiable or older-than-30-day postings before insert', () => {
    const file = src('.github/scripts/jobs-sync.mjs');
    assert.match(file, /function normalizePublishedAt/);
    assert.match(file, /function isFreshPublishedAt/);
    assert.match(file, /if \(!isFreshPublishedAt\(j\.published_at\)\) return false/);
    assert.match(file, /30 \* 24 \* 60 \* 60 \* 1000/);
  });

  it('job route resolves short stored identifiers as well as company-prefixed ids', () => {
    const file = src('src/lib/job-snapshots.ts');
    assert.match(file, /jobSlug\.toLowerCase\(\)/);
    assert.match(file, /\.eq\('external_id', identifier\)/);
    assert.match(file, /\.eq\('slug', identifier\)/);
  });

  it('keeps the Oxford company hub on its canonical slug', () => {
    const file = src('src/app/[slug]/(hub)/page.tsx');
    assert.match(file, /'university-of-oxford': 'oxford'/);
    assert.match(file, /permanentRedirect\(`\/\$\{canonicalCompany\}`\)/);
  });

  it('enrich rewrite is OpenRouter fact-sheet write with formatted sections', () => {
    const file = src('.github/scripts/enrich-remote-job-descriptions.mjs');
    const start = file.indexOf('async function rewriteJobPage');
    assert.ok(start >= 0, 'rewriteJobPage must exist');
    const fn = file.slice(start, file.indexOf('\nfunction enqueueManualPack'));
    assert.match(fn, /buildExtractPrompt/);
    assert.match(fn, /buildWriterPrompt/);
    assert.match(fn, /rewriteWithOpenRouter/);
    assert.match(fn, /rewriteMeetsPublishFloor/);
    assert.match(fn, /factSheetIsIndexable/);
    assert.doesNotMatch(fn, /breakCopiedProse/);
    assert.doesNotMatch(fn, /forceBreakEvery/);
    assert.match(file, /function asBulletBlock/);
    assert.match(file, /assembleJobPage/);
    assert.match(file, /Need OPENROUTER_API_KEY/);
  });

  it('latest jobs_auto_curated_tag is a no-op and trigger is dropped', () => {
    const dir = join(root, 'supabase/migrations');
    const files = readdirSync(dir)
      .filter((f) => f.endsWith('.sql'))
      .sort();
    let lastFn = '';
    let dropped = false;
    for (const f of files) {
      const body = readFileSync(join(dir, f), 'utf8');
      if (/DROP TRIGGER IF EXISTS trg_jobs_curated_tag/i.test(body)) dropped = true;
      const fn = body.match(
        /CREATE OR REPLACE FUNCTION jobs_auto_curated_tag\(\)[\s\S]*?LANGUAGE plpgsql;/i
      );
      if (fn) lastFn = fn[0];
    }
    assert.ok(dropped, 'trg_jobs_curated_tag must stay dropped');
    assert.ok(lastFn, 'jobs_auto_curated_tag must still be defined');
    assert.doesNotMatch(
      lastFn,
      /ARRAY\['curated-jd'\]/,
      'auto-tag must not append curated-jd (ingest ATS would become public pages)'
    );
  });
});

describe('Telegram / IndexNow do not advertise uncurated URLs', () => {
  for (const rel of [
    '.github/scripts/telegram-post.mjs',
    '.github/scripts/telegram-ai-jobs.mjs',
  ]) {
    it(`${rel} every jobs REST call includes cs.{"curated-jd"}`, () => {
      const file = src(rel);
      const parts = file.split(/restUrl\(/).slice(1);
      const jobsCalls = parts.filter((p) => /['"]jobs['"]/.test(p.slice(0, 120)));
      assert.ok(jobsCalls.length > 0, rel);
      for (const call of jobsCalls) {
        const head = call.slice(0, 900);
        assert.match(
          head,
          /cs\.\{\"curated-jd\"\}/,
          `${rel} jobs fetch missing SQL curated-jd filter`
        );
      }
      assert.match(file, /shouldListJobOnBoard|isCuratedJd/);
    });
  }

  it('google-indexing SQL + in-memory require curated-jd', () => {
    const file = src('.github/scripts/google-indexing.mjs');
    assert.match(file, /contains\('tags', \['curated-jd'\]\)/);
    assert.match(file, /isPublicJobPage/);
    assert.match(file, /jobPublicPath/);
    assert.doesNotMatch(file, /slice\(0,\s*8\)/);
    assert.match(file, /NEXT_PUBLIC_SUPABASE_URL \|\| process\.env\.SUPABASE_URL/);
  });
});

describe('mechanical pivot slop cleanup', () => {
  it('formatJobDescription strips copy-gate pivot slop at render', () => {
    const jd = src('src/lib/job-description.ts');
    assert.match(jd, /stripMechanicalPivotSlop/);
  });

  it('storage normalize + enrich reject mechanical pivot corruption', () => {
    const norm = src('.github/scripts/lib/normalize-job-description.mjs');
    const enrich = src('.github/scripts/enrich-remote-job-descriptions.mjs');
    assert.match(norm, /stripMechanicalPivotSlop/);
    assert.match(enrich, /hasMechanicalPivotCorruption/);
    assert.ok(existsSync(join(root, '.github/scripts/scrub-mechanical-pivot-slop.mjs')));
  });
});

describe('CI must run this lock', () => {
  it('npm test includes the hub and public-job contract files', () => {
    const pkg = JSON.parse(src('package.json')) as { scripts: { test: string } };
    assert.match(pkg.scripts.test, /src\/lib\/\*\.test\.ts/);
    assert.match(pkg.scripts.test, /src\/lib\/\*\.test\.mjs/);
    assert.match(pkg.scripts.test, /company-hub-invariants/);
  });
});

describe('new public jobs lists cannot omit the gate', () => {
  it('every public list query mentions a curated marker', () => {
    const files = [
      ...walk(join(root, 'src/app')),
      ...walk(join(root, 'src/lib')),
      ...walk(join(root, '.github/scripts')),
    ];
    const leaks: string[] = [];
    for (const abs of files) {
      const rel = relative(root, abs).replace(/\\/g, '/');
      if (SKIP_LIST_SCAN.some((p) => rel.startsWith(p) || rel === p)) continue;
      if (rel.endsWith('.test.ts') || rel.endsWith('.test.mjs')) continue;
      const file = readFileSync(abs, 'utf8');
      if (!LIST_QUERY.test(file)) continue;
      const isList =
        /\.limit\s*\(|\.range\s*\(/.test(file) || /restUrl\([^)]*['"]jobs['"]/.test(file);
      if (!isList) continue;
      if (!CURATED_MARK.test(file)) leaks.push(rel);
    }
    assert.deepEqual(leaks, [], `public jobs lists missing curated-jd gate:\n${leaks.join('\n')}`);
  });
});
