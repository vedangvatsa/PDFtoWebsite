#!/usr/bin/env node
/**
 * Backfill the persisted `slug` column for every job so public URLs are ALWAYS
 * /{company}/{slug} — never /jobs/{uuid}.
 *
 * - Rows with a routeable external_id ({company}_{shortslug}) keep it as their slug.
 * - Rows with ATS external_ids (gh_*, ashby_*, remoteok_*, …) get a minted
 *   title-based slug (same algorithm as jobs-sync at insert time).
 * - Per-company collisions are disambiguated with a short {head}-{2hex} suffix.
 *
 * Idempotent: rows that already have a slug are untouched; exits fast when
 * there is nothing left to backfill.
 *
 * Usage:
 *   DRY_RUN=1 node .github/scripts/backfill-job-slugs.mjs   # count only
 *   node .github/scripts/backfill-job-slugs.mjs             # for real
 */
import { createHash } from 'crypto';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  companyToSlug,
  isRouteableExternalId,
  mintPrettyJobSlug,
  shortJobSlug,
  storedSlugSegment,
} from './lib/job-public-url.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const DRY_RUN = process.env.DRY_RUN === '1';
const CONCURRENCY = Math.max(1, Math.min(12, Number(process.env.CONCURRENCY || 6)));

if (!U || !K) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const headers = { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function jfetch(url, opts, timeoutMs = 60000) {
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(timeoutMs) });
      if (!r.ok) {
        const t = await r.text();
        throw new Error(`HTTP ${r.status}: ${t.slice(0, 160)}`);
      }
      return r;
    } catch (e) {
      lastErr = e;
      if (attempt < 4) {
        await sleep(1200 * 2 ** (attempt - 1));
      }
    }
  }
  throw lastErr;
}

async function pageAll(select, extraFilters, label) {
  const out = [];
  let offset = 0;
  while (true) {
    const url = `${U}/rest/v1/jobs?select=${select}${extraFilters}&limit=1000&offset=${offset}`;
    const rows = await jfetch(url, { headers }, 60000).then((r) => r.json());
    if (!Array.isArray(rows) || !rows.length) break;
    out.push(...rows);
    if (out.length % 20000 === 0) console.log(`  … ${label}: ${out.length} rows`);
    if (rows.length < 1000) break;
    offset += 1000;
  }
  return out;
}

async function main() {
  const t0 = Date.now();
  console.log(`backfill-job-slugs: dry=${DRY_RUN ? 1 : 0} concurrency=${CONCURRENCY}`);

  // Fast exit when nothing needs a slug.
  const countRes = await jfetch(
    `${U}/rest/v1/jobs?select=id&slug=is.null&limit=1`,
    { headers: { ...headers, Prefer: 'count=exact' } },
    30000
  );
  const missing = Number(countRes.headers.get('content-range')?.split('/')[1] || 0);
  console.log(`Rows missing a slug: ${missing}`);
  if (missing === 0) {
    console.log('Nothing to backfill. Done.');
    return;
  }

  // Load ALL rows so the per-company used-sets cover legacy routeable external_ids
  // (which keep their slug) plus any already-minted slugs. Full columns are
  // required for PostgREST on_conflict upserts (minimal payloads INSERT instead).
  const rows = await pageAll(
    'id,title,company,external_id,slug,source,dedup_hash,apply_url',
    '&apply_url=not.is.null',
    'all rows'
  );
  console.log(`Fetched ${rows.length} rows (${Math.round((Date.now() - t0) / 1000)}s)`);

  const usedByCompany = new Map();
  const getUsed = (co) => {
    let used = usedByCompany.get(co);
    if (!used) {
      used = new Set();
      usedByCompany.set(co, used);
    }
    return used;
  };

  // Pass 1: register ONLY committed slug column values. A row's own routeable
  // external_id is NOT pre-registered here — it claims it in pass 2a, so legacy
  // pretty URLs survive unless they genuinely collide with a committed slug.
  for (const r of rows) {
    if (!r.slug) continue;
    const seg = storedSlugSegment(r.company, r.slug);
    if (!seg) continue;
    const co = companyToSlug(r.company);
    if (co) getUsed(co).add(seg);
  }

  // Pass 1.5: reserve the routeable external_id segments of rows that already
  // have a slug. Otherwise a title-minted slug for an ATS row can claim a
  // segment another job's external_id already owns — the shadowed-slug
  // collision that made /{company}/{slug} ambiguous and looped 308s.
  for (const r of rows) {
    if (!r.slug) continue;
    const co = companyToSlug(r.company);
    if (!co || !isRouteableExternalId(r.company, r.external_id)) continue;
    getUsed(co).add(shortJobSlug(r.company, r.external_id));
  }

  const toPatch = [];
  const disambiguate = (baseSeg, seed, used) => {
    let n = 0;
    let seg = baseSeg;
    while (used.has(seg)) {
      const width = Math.min(2 + Math.floor(n / 8), 8);
      const h = createHash('md5').update(`${seed}:${n++}`).digest('hex').slice(0, width);
      seg = `${(baseSeg.split('-')[0] || 'role').slice(0, 6)}-${h}`;
    }
    return seg;
  };

  // Pass 2a: routeable external_id rows claim their own legacy segment first
  // (external_ids are unique, so these never collide with each other). The raw
  // segment is reserved unconditionally — the external_id owns that URL key —
  // even when the committed-slug conflict forces a different minted slug.
  for (const r of rows) {
    if (r.slug) continue;
    const co = companyToSlug(r.company);
    if (!co || !isRouteableExternalId(r.company, r.external_id)) continue;
    const baseSeg = String(r.external_id).slice(co.length + 1).toLowerCase();
    getUsed(co).add(baseSeg);
    const jobSlug = disambiguate(baseSeg, r.id, getUsed(co));
    getUsed(co).add(jobSlug);
    toPatch.push({ ...r, slug: `${co}_${jobSlug}` });
  }

  // Pass 2b: ATS / non-routeable rows get a title-based minted slug avoiding
  // everything already claimed.
  for (const r of rows) {
    if (r.slug) continue;
    const co = companyToSlug(r.company);
    if (!co || isRouteableExternalId(r.company, r.external_id)) continue;
    const jobSlug = mintPrettyJobSlug(r.title, r.id, getUsed(co));
    toPatch.push({ ...r, slug: `${co}_${jobSlug}` });
  }

  console.log(`To backfill: ${toPatch.length} rows (${Math.round((Date.now() - t0) / 1000)}s)`);
  if (DRY_RUN) {
    const samples = toPatch.slice(0, 10).map((p) => p.slug);
    console.log('Sample slugs:', samples.join('  '));
    console.log('DRY_RUN — no writes.');
    return;
  }

  // Parallel REST PATCH with remint-on-409. Simple, fast, and immune to the
  // batch-poisoning / PostgREST upsert quirks: a rare conflict only costs the
  // affected row (reminted to a fresh short slug).
  const WORKERS = Math.max(4, Math.min(30, Number(process.env.CONCURRENCY || 20)));
  let ok = 0, fail = 0, idx = 0;

  async function patchRow(p) {
    try {
      const pr = await jfetch(
        `${U}/rest/v1/jobs?id=eq.${p.id}`,
        { method: 'PATCH', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ slug: p.slug }) },
        30000
      );
      if (pr.ok) return true;
      return false;
    } catch {
      return false;
    }
  }

  async function worker() {
    while (true) {
      const pos = idx++;
      if (pos >= toPatch.length) return;
      const p = toPatch[pos];
      let applied = await patchRow(p);
      if (!applied) {
        // Slug already taken by another row → remint to a fresh short slug.
        applied = await patchRow(remintForConflict(p));
        if (!applied && fail <= 8) console.error(`  ✗ ${p.id}: could not set slug`);
      }
      if (applied) ok++; else fail++;
      if ((ok + fail) % 10000 === 0) {
        console.log(`  … ok ${ok} / fail ${fail} (${Math.round((Date.now() - t0) / 1000)}s)`);
      }
    }
  }
  await Promise.all(Array.from({ length: WORKERS }, () => worker()));

  console.log(`Done: ok=${ok} fail=${fail} in ${Math.round((Date.now() - t0) / 1000)}s`);
}

/** Stay short: {head≤6}-{wider hash} so it never collides with the existing row. */
function remintForConflict(p) {
  const co = p.slug.slice(0, p.slug.lastIndexOf('_'));
  const cur = p.slug.slice(co.length + 1);
  const head = (cur.split('-')[0] || 'role').slice(0, 6);
  const h = createHash('md5').update(`${p.id}:remint`).digest('hex').slice(0, 4);
  return { ...p, slug: `${co}_${head}-${h}` };
}

main().catch((e) => {
  console.error('backfill-job-slugs failed:', e.message);
  process.exit(1);
});
