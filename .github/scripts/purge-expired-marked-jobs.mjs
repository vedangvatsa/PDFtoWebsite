#!/usr/bin/env node
/**
 * Delete jobs already marked posting_older_than_30d in enrich state.
 * Skips Telegram-posted apply_urls. Set DRY_RUN=1 to count only.
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const DRY_RUN = process.env.DRY_RUN === '1';
const BATCH = Math.min(200, Math.max(20, Number(process.env.BATCH_SIZE || 100)));
const headers = { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' };

function normUrl(u) {
  return String(u || '')
    .toLowerCase()
    .split('?')[0]
    .split('#')[0]
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '');
}

function loadProtectedUrls() {
  const set = new Set();
  const p = resolve(__dirname, '.telegram-ai-jobs-posted.json');
  if (!existsSync(p)) return set;
  try {
    for (const u of JSON.parse(readFileSync(p, 'utf8'))) set.add(normUrl(u));
  } catch {
    /* ignore */
  }
  return set;
}

function expiredMarkedIds() {
  const out = new Set();
  for (const name of readdirSync(__dirname)) {
    if (!/^enrich-remote-jd-state(?:-w\d+)?\.json$/.test(name)) continue;
    const proc = JSON.parse(readFileSync(resolve(__dirname, name), 'utf8')).processed || {};
    for (const [id, row] of Object.entries(proc)) {
      if (row?.status === 'skip' && row?.reason === 'posting_older_than_30d') out.add(id);
    }
  }
  return [...out];
}

async function fetchJobs(ids) {
  const rows = [];
  for (let i = 0; i < ids.length; i += 80) {
    const chunk = ids.slice(i, i + 80);
    const url = `${U}/rest/v1/jobs?select=id,title,company,apply_url,tags,published_at,created_at&id=in.(${chunk.join(',')})`;
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(120000) });
    const data = await r.json();
    if (!Array.isArray(data)) throw new Error(`fetch failed: ${JSON.stringify(data).slice(0, 200)}`);
    rows.push(...data);
  }
  return rows;
}

async function deleteIds(ids) {
  if (!ids.length) return 0;
  const r = await fetch(`${U}/rest/v1/jobs?id=in.(${ids.join(',')})`, {
    method: 'DELETE',
    headers: { ...headers, Prefer: 'return=minimal' },
    signal: AbortSignal.timeout(120000),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`delete ${r.status}: ${t.slice(0, 200)}`);
  }
  return ids.length;
}

async function main() {
  if (!U || !K) {
    console.error('Need SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  const protectedUrls = loadProtectedUrls();
  const marked = expiredMarkedIds();
  console.log(`marked posting_older_than_30d in enrich state: ${marked.length}`);
  if (!marked.length) return;

  let deleted = 0;
  let skippedProtected = 0;
  let missing = 0;

  for (let i = 0; i < marked.length; i += BATCH) {
    const chunk = marked.slice(i, i + BATCH);
    const rows = await fetchJobs(chunk);
    const byId = new Map(rows.map((r) => [r.id, r]));
    const toDelete = [];
    for (const id of chunk) {
      const job = byId.get(id);
      if (!job) {
        missing++;
        continue;
      }
      if (protectedUrls.has(normUrl(job.apply_url))) {
        skippedProtected++;
        continue;
      }
      toDelete.push(id);
    }
    if (DRY_RUN) {
      deleted += toDelete.length;
      console.log(`dry batch ${i / BATCH + 1}: would delete ${toDelete.length}`);
      continue;
    }
    if (toDelete.length) {
      const n = await deleteIds(toDelete);
      deleted += n;
      console.log(`batch ${i / BATCH + 1}: deleted ${n} (total ${deleted})`);
    }
  }

  console.log(
    JSON.stringify({ dry: DRY_RUN, marked: marked.length, deleted, skippedProtected, missing }, null, 2)
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
