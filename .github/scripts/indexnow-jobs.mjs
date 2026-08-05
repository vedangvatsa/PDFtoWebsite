#!/usr/bin/env node
/**
 * Submit recent indexable pretty job URLs + sitemap to IndexNow (Bing/Yandex).
 *
 * Usage:
 *   node .github/scripts/indexnow-jobs.mjs
 *   node .github/scripts/indexnow-jobs.mjs --limit=200
 *   DRY_RUN=1 node .github/scripts/indexnow-jobs.mjs
 *
 * GSC: IndexNow does not replace Google Search Console. After deploy, still
 * submit https://cvin.bio/sitemap.xml in GSC → Sitemaps (one-time / on change).
 */
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const DRY = process.env.DRY_RUN === '1' || process.argv.includes('--dry-run');
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = Math.min(5000, Math.max(10, Number(limitArg?.split('=')[1] || 500)));

const INDEXNOW_KEY = '6db32ca940dd46cab89375c221953bd6';
const SITE = 'https://cvin.bio';
const ENDPOINTS = ['https://api.indexnow.org/indexnow', 'https://www.bing.com/indexnow'];

function companyToSlug(company) {
  return String(company || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isShortJobSlug(s) {
  return s && /^[a-z0-9][a-z0-9-]{0,23}$/i.test(s) && !/^(th|wa|tg|li|x|tw|ig|fb|jobs|api)$/i.test(s);
}

function wordCount(desc) {
  if (!desc) return 0;
  const t = String(desc)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return t ? t.split(/\s+/).length : 0;
}

function jobPath(company, externalId) {
  const co = companyToSlug(company);
  if (!co || !externalId) return null;
  const prefix = `${co}_`;
  if (!String(externalId).toLowerCase().startsWith(prefix)) return null;
  const rest = String(externalId).slice(prefix.length).toLowerCase();
  if (!isShortJobSlug(rest) || /^[0-9a-f]{8,}$/i.test(rest)) return null;
  return `/${co}/${rest}`;
}

async function pingIndexNow(urls) {
  const body = JSON.stringify({
    host: 'cvin.bio',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  });
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body,
      });
      if (res.status === 200 || res.status === 202 || res.status === 204) {
        return { ok: true, status: res.status, endpoint };
      }
      const err = await res.text().catch(() => '');
      console.warn(`  IndexNow ${endpoint} → ${res.status} ${err.slice(0, 120)}`);
    } catch (e) {
      console.warn(`  IndexNow ${endpoint} error: ${e.message}`);
    }
  }
  return { ok: false };
}

async function main() {
  if (!U || !K) {
    console.error('Need SUPABASE_URL + service role key');
    process.exit(1);
  }
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  // Pull a wider sample; prefer curated/enriched bodies via tags when present
  const urls = [
    `${U}/rest/v1/jobs?select=id,company,external_id,description,created_at,tags&created_at=gt.${encodeURIComponent(since)}&tags=cs.{curated-jd}&order=created_at.desc&limit=${LIMIT}`,
    `${U}/rest/v1/jobs?select=id,company,external_id,description,created_at,tags&created_at=gt.${encodeURIComponent(since)}&order=created_at.desc&limit=${Math.min(2000, LIMIT * 3)}`,
  ];
  const jobs = [];
  const seen = new Set();
  for (const u of urls) {
    const res = await fetch(u, {
      headers: { apikey: K, Authorization: `Bearer ${K}` },
    });
    if (!res.ok) {
      console.warn('Supabase fetch warn', res.status, (await res.text()).slice(0, 120));
      continue;
    }
    const rows = await res.json();
    for (const j of rows || []) {
      if (seen.has(j.id)) continue;
      seen.add(j.id);
      jobs.push(j);
    }
  }
  const paths = new Set([`${SITE}/sitemap.xml`, `${SITE}/jobs`, `${SITE}/companies`, `${SITE}/llms.txt`]);
  let skippedThin = 0;
  let skippedUgly = 0;
  for (const j of jobs) {
    if (wordCount(j.description) < 250) {
      skippedThin++;
      continue;
    }
    const p = jobPath(j.company, j.external_id);
    if (!p) {
      skippedUgly++;
      continue;
    }
    paths.add(`${SITE}${p}`);
    if (paths.size >= LIMIT + 10) break;
  }
  const list = [...paths];
  console.log(
    `IndexNow: ${list.length} URLs (from ${jobs.length} jobs, thin=${skippedThin}, no-pretty=${skippedUgly}) dry=${DRY ? 1 : 0}`
  );
  if (DRY) {
    console.log(list.slice(0, 15).join('\n'));
    return;
  }
  // Batch in chunks of 100 (IndexNow allows more; stay polite)
  let ok = 0;
  for (let i = 0; i < list.length; i += 100) {
    const chunk = list.slice(i, i + 100);
    const r = await pingIndexNow(chunk);
    console.log(`  chunk ${i / 100 + 1}: ${r.ok ? 'ok' : 'fail'} status=${r.status || '-'} n=${chunk.length}`);
    if (r.ok) ok += chunk.length;
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log(`Done. Submitted ok≈${ok}/${list.length}`);
  console.log('GSC: ensure https://cvin.bio/sitemap.xml is submitted under Search Console → Sitemaps.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
