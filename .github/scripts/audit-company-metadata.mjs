#!/usr/bin/env node
/**
 * Find company hub pages (/slug) where jobs exist but companies row is missing,
 * and live pages with metadata 404 fallback (wrong title / NEXT_HTTP_ERROR_FALLBACK).
 */
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio').replace(/\/$/, '');
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

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

async function checkLive(path) {
  const url = `${SITE}${path}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'metadata-audit/1.0' },
    redirect: 'follow',
  });
  const html = await res.text();
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() || '';
  const has404Fallback = html.includes('NEXT_HTTP_ERROR_FALLBACK;404');
  const hasCareers = /Careers<\/h1>|Careers —|Careers -/i.test(html);
  const hasBlankSlate = html.includes('blank slate');
  const wrongTitle = title.includes('Convert Your CV to a Website') && hasCareers;
  const badMeta = has404Fallback || wrongTitle || hasBlankSlate;
  return { url, status: res.status, title, has404Fallback, wrongTitle, hasBlankSlate, hasCareers, badMeta };
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
  const dirNoRecentJobs = [...companySlugs].filter((k) => !jobsByKey.has(k));

  console.log('\n── DB audit ──');
  console.log(`companies rows: ${companySlugs.size}`);
  console.log(`company_keys with jobs (30d): ${jobsByKey.size}`);
  console.log(`\n⚠️  Jobs but NO companies row (${jobsNoDir.length}):`);
  for (const k of jobsNoDir.sort()) {
    const sample = jobsByKey.get(k)[0];
    console.log(`  /${k} — ${jobsByKey.get(k).length} job(s), e.g. "${sample.title}"`);
  }

  console.log(`\nDirectory rows with no recent jobs (${dirNoRecentJobs.length}) — page may 404 if role_count stale:`);
  for (const k of dirNoRecentJobs.slice(0, 15)) {
    const c = companies.find((x) => x.slug === k);
    console.log(`  /${k} — role_count=${c?.role_count ?? '?'}`);
  }
  if (dirNoRecentJobs.length > 15) console.log(`  … and ${dirNoRecentJobs.length - 15} more`);

  const livePaths = new Set([
    ...jobsNoDir.map((k) => `/${k}`),
    ...['mospi', 'niti-aayog', 'indian-army', 'stripe', 'openai'].map((k) => `/${k}`),
  ]);

  console.log('\n── Live metadata audit ──');
  const bad = [];
  for (const p of [...livePaths].sort()) {
    const r = await checkLive(p);
    const flag = r.badMeta ? '❌' : '✅';
    console.log(`${flag} ${p} [${r.status}] title="${r.title.slice(0, 70)}"${r.has404Fallback ? ' +404fallback' : ''}`);
    if (r.badMeta) bad.push(r);
  }

  console.log(`\n── Summary ──`);
  console.log(`DB gaps (jobs, no dir): ${jobsNoDir.length}`);
  console.log(`Live bad metadata: ${bad.length}`);
  if (bad.length) {
    console.log('Affected URLs:');
    for (const b of bad) console.log(`  ${b.url}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
