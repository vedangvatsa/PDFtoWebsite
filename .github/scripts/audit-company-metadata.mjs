#!/usr/bin/env node
/**
 * Audit company hub metadata vs DB.
 *
 * DB: company_keys with recent jobs but no companies row.
 * Live: sample pages for wrong homepage title (real metadata 404 bug).
 *
 * Does NOT treat layout "blank slate" / notFound template in RSC payload as failure.
 *
 * Usage:
 *   node .github/scripts/audit-company-metadata.mjs
 *   LIVE_LIMIT=50 CONCURRENCY=10 node .github/scripts/audit-company-metadata.mjs
 */
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio').replace(/\/$/, '');
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(
  /\/$/,
  ''
);
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const LIVE_LIMIT = Math.max(10, Number(process.env.LIVE_LIMIT || 80));
const CONCURRENCY = Math.max(2, Number(process.env.CONCURRENCY || 8));
const TIMEOUT_MS = 15000;
const RETRIES = 3;

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function fetchAll(table, select, filter = '') {
  const out = [];
  let offset = 0;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}${filter}&limit=1000&offset=${offset}`;
    const res = await fetch(url, { headers });
    const rows = await res.json();
    if (!Array.isArray(rows)) throw new Error(`${table}: ${JSON.stringify(rows).slice(0, 200)}`);
    out.push(...rows);
    if (rows.length < 1000) break;
    offset += 1000;
  }
  return out;
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url) {
  let lastErr;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        signal: ac.signal,
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; CVinBioMetadataAudit/1.1; +https://cvin.bio)',
          Accept: 'text/html',
        },
      });
      clearTimeout(timer);
      const html = await res.text();
      return { ok: true, status: res.status, html };
    } catch (e) {
      clearTimeout(timer);
      lastErr = e;
      if (attempt < RETRIES) await sleep(400 * attempt);
    }
  }
  return {
    ok: false,
    status: 0,
    html: '',
    error: lastErr?.cause?.code || lastErr?.name || lastErr?.message || 'fetch failed',
  };
}

/**
 * Real metadata bug = careers body with homepage title.
 * Ignore layout notFound/"blank slate" strings that always appear in RSC payload.
 */
function analyzeHtml(path, status, html) {
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() || '';
  const careersTitle = /Careers\s*[—-]/.test(title);
  const homeTitle = title.includes('Convert Your CV to a Website');
  const bodyCareers =
    /Active Roles|Open Roles|Careers<\/h1>/i.test(html) || /"@type":"Organization"/.test(html);
  const bodyBlog = /Back to Articles|BlogPosting/i.test(html);
  const wrongMeta = homeTitle && bodyCareers;
  const http404 = status === 404;
  const badMeta = wrongMeta || (http404 && !bodyCareers);

  return {
    path,
    status,
    title: title.slice(0, 90),
    careersTitle,
    homeTitle,
    bodyCareers,
    bodyBlog,
    wrongMeta,
    badMeta,
  };
}

async function checkLive(path) {
  const url = `${SITE}${path}`;
  const fetched = await fetchWithRetry(url);
  if (!fetched.ok) {
    return {
      url,
      path,
      status: 0,
      title: '',
      badMeta: false,
      networkError: fetched.error,
    };
  }
  return { url, ...analyzeHtml(path, fetched.status, fetched.html) };
}

async function mapPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

async function main() {
  if (!SUPABASE_URL || !KEY) {
    console.error('Need SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const companies = await fetchAll('companies', 'slug,name,role_count');
  const companySlugs = new Set(companies.map((c) => c.slug));

  const jobs = await fetchAll(
    'jobs',
    'company_key,company,title',
    `&company_key=not.is.null&created_at=gt.${encodeURIComponent(thirtyDaysAgo)}`
  );
  const jobsByKey = new Map();
  for (const j of jobs) {
    const k = j.company_key;
    if (!k) continue;
    if (!jobsByKey.has(k)) jobsByKey.set(k, []);
    jobsByKey.get(k).push(j);
  }

  const jobsNoDir = [...jobsByKey.keys()].filter((k) => !companySlugs.has(k));
  const BLOCKLIST = new Set([
    'leverdemo 8',
    'getwingapp',
    'leverdemo',
    'test company',
    'demo company',
    'smart working solutions',
    'confidential',
    '10xteam',
    'careers - think digitally',
    'careers.azx.io',
    'brook hiddink - highticket.io',
    'unknown',
    'n/a',
    'na',
    'none',
    'null',
    'undefined',
    'company',
  ]);
  function isBlocked(key) {
    const spaced = key.toLowerCase().replace(/-/g, ' ').trim();
    return BLOCKLIST.has(spaced) || BLOCKLIST.has(key.toLowerCase());
  }
  const jobsNoDirReal = jobsNoDir.filter((k) => !isBlocked(k));
  const jobsNoDirJunk = jobsNoDir.filter((k) => isBlocked(k));
  const dirNoRecentJobs = [...companySlugs].filter((k) => !jobsByKey.has(k));

  console.log('\n── DB audit ──');
  console.log(`companies rows: ${companySlugs.size}`);
  console.log(`company_keys with jobs (30d): ${jobsByKey.size}`);
  console.log(`jobs but NO companies row (real): ${jobsNoDirReal.length}`);
  console.log(`jobs but NO companies row (blocklisted junk): ${jobsNoDirJunk.length}`);
  for (const k of jobsNoDirReal.sort().slice(0, 40)) {
    const sample = jobsByKey.get(k)[0];
    console.log(`  /${k} — ${jobsByKey.get(k).length} job(s), e.g. "${sample.title}"`);
  }
  if (jobsNoDirReal.length > 40) console.log(`  … and ${jobsNoDirReal.length - 40} more`);
  if (jobsNoDirJunk.length) {
    console.log(`  junk keys (expected no hub): ${jobsNoDirJunk.sort().join(', ')}`);
  }

  console.log(`\ndirectory rows with no recent jobs: ${dirNoRecentJobs.length}`);
  for (const k of dirNoRecentJobs.slice(0, 10)) {
    const c = companies.find((x) => x.slug === k);
    console.log(`  /${k} — role_count=${c?.role_count ?? '?'}`);
  }
  if (dirNoRecentJobs.length > 10) console.log(`  … and ${dirNoRecentJobs.length - 10} more`);

  // Priority live sample — not every gap (avoids hour-long runs + ECONNRESET storms)
  const priority = ['mospi', 'niti-aayog', 'indian-army', 'stripe', 'openai', 'langchain', 'remote'];
  const gapSample = jobsNoDirReal.sort().slice(0, Math.max(0, LIVE_LIMIT - priority.length));
  const livePaths = [...new Set([...priority.map((s) => `/${s}`), ...gapSample.map((k) => `/${k}`)])].slice(
    0,
    LIVE_LIMIT
  );

  console.log(`\n── Live metadata audit (${livePaths.length} pages, concurrency ${CONCURRENCY}) ──`);
  const results = await mapPool(livePaths, CONCURRENCY, async (p, idx) => {
    const r = await checkLive(p);
    if ((idx + 1) % 20 === 0 || idx + 1 === livePaths.length) {
      process.stdout.write(`\r  checked ${idx + 1}/${livePaths.length}`);
    }
    return r;
  });
  console.log('');

  const bad = [];
  const network = [];
  for (const r of results) {
    if (r.networkError) {
      network.push(r);
      console.log(`⏳ ${r.path} network=${r.networkError}`);
      continue;
    }
    const flag = r.badMeta ? '❌' : '✅';
    console.log(
      `${flag} ${r.path} [${r.status}] ${r.careersTitle ? 'careers' : r.bodyBlog ? 'blog' : r.homeTitle ? 'HOME' : 'other'} | ${r.title}`
    );
    if (r.badMeta) bad.push(r);
  }

  console.log('\n── Summary ──');
  console.log(`DB gaps (jobs, no dir, real): ${jobsNoDirReal.length}`);
  console.log(`DB gaps (blocklisted junk): ${jobsNoDirJunk.length}`);
  console.log(`Live checked: ${results.length}`);
  console.log(`Live bad metadata: ${bad.length}`);
  console.log(`Live network errors: ${network.length}`);
  if (bad.length) {
    console.log('Affected URLs:');
    for (const b of bad) console.log(`  ${b.url} — ${b.title}`);
  }

  const outPath = resolve(__dirname, 'audit-company-metadata-results.json');
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        companies: companySlugs.size,
        jobKeys: jobsByKey.size,
        jobsNoDirReal: jobsNoDirReal.length,
        jobsNoDirJunk: jobsNoDirJunk.length,
        jobsNoDirRealSample: jobsNoDirReal.slice(0, 100),
        liveChecked: results.length,
        bad,
        network,
      },
      null,
      2
    )
  );
  console.log(`\nWrote ${outPath}`);

  // Non-zero only for real metadata bugs, not transient network noise
  process.exit(bad.length || jobsNoDirReal.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
