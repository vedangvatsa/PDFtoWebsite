#!/usr/bin/env node
/**
 * Re-roll slugs shadowed by another job's external_id.
 *
 * When two jobs in one company share a URL segment — one via its minted
 * `slug` column, the other via a routeable `external_id` (e.g. a greenhouse
 * row minted `twilio_sw-eng` while a native row's external_id is literally
 * `twilio_sw-eng`) — the URL is ambiguous: loadJobByExternalIdLive could
 * not `.or().maybeSingle()` it, and the legacy resolver redirected it into a
 * 308 loop. The external_id owner keeps the URL; the slug-only claimant is
 * "shadowed" and re-minted to a fresh unique pretty slug.
 *
 * Uses the repo's own mintPrettyJobSlug with a FULL-TABLE claimed-keys set
 * (every routeable slug segment AND every routeable external_id segment), so
 * the replacement can never collide with anything already on the site.
 *
 * Usage:
 *   DRY_RUN=1 node .github/scripts/fix-shadowed-slugs.mjs   # plan only
 *   CONCURRENCY=12 node .github/scripts/fix-shadowed-slugs.mjs  # apply
 *
 * WARNING: rewrites the `slug` column (and therefore canonical public URLs)
 * for shadowed rows. Old URLs keep working — they deterministically resolve
 * to the external_id owner — so no existing link regresses.
 */
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  companyToSlug,
  storedSlugSegment,
  isRouteableExternalId,
  shortJobSlug,
  mintPrettyJobSlug,
  isShortJobSlug,
} from './lib/job-public-url.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const DRY_RUN = process.env.DRY_RUN === '1';
const CONCURRENCY = Math.max(1, Math.min(16, Number(process.env.CONCURRENCY || 8)));

if (!U || !K) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const headers = { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchRows(url, label) {
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const r = await fetch(url, { headers, signal: AbortSignal.timeout(45000) });
      if (!r.ok) {
        const t = await r.text();
        throw new Error(`${label} HTTP ${r.status}: ${t.slice(0, 160)}`);
      }
      return await r.json();
    } catch (e) {
      lastErr = e;
      if (attempt < 4) {
        const wait = Math.min(20000, 1000 * 2 ** (attempt - 1));
        console.warn(`  ⚠️  ${label} attempt ${attempt} failed (${e.name || e.message}); retry in ${wait}ms`);
        await sleep(wait);
      }
    }
  }
  throw lastErr;
}

async function pageAll() {
  const out = [];
  let cursor = null;
  while (true) {
    let url = `${U}/rest/v1/jobs?select=id,title,company,company_key,external_id,slug&order=id.asc&limit=1000`;
    if (cursor) url += `&id=gt.${cursor}`;
    const rows = await fetchRows(url, 'jobs');
    if (!Array.isArray(rows) || !rows.length) break;
    out.push(...rows);
    if (out.length % 40000 === 0) console.log(`  … fetched ${out.length} rows`);
    if (rows.length < 1000) break;
    cursor = rows[rows.length - 1].id;
  }
  return out;
}

/** URL keys claimed by each row: its routeable slug segment + external_id segment. */
function rowKeys(co, row) {
  const keys = new Set();
  const slugSeg = storedSlugSegment(row.company, row.slug);
  if (slugSeg) keys.add(slugSeg);
  if (isRouteableExternalId(row.company, row.external_id)) {
    const extSeg = shortJobSlug(row.company, row.external_id);
    if (extSeg) keys.add(extSeg);
  }
  return keys;
}

async function main() {
  const t0 = Date.now();
  console.log(`fix-shadowed-slugs: dry=${DRY_RUN ? 1 : 0} concurrency=${CONCURRENCY}`);

  const rows = await pageAll();
  console.log(`Fetched ${rows.length} rows (${Math.round((Date.now() - t0) / 1000)}s)`);

  const byCompany = new Map();
  for (const r of rows) {
    const co = companyToSlug(r.company);
    if (!co) continue;
    if (!byCompany.has(co)) byCompany.set(co, []);
    byCompany.get(co).push(r);
  }

  // Per-company claimed-keys set: every routeable slug segment + external_id segment.
  const claimed = new Map();
  for (const [co, list] of byCompany) {
    const used = new Set();
    for (const r of list) for (const k of rowKeys(co, r)) used.add(k);
    claimed.set(co, used);
  }

  // Find shadowed rows: slug-only claimants of a URL key owned by another row's external_id.
  const losers = [];
  let slugSlugClashes = 0;
  for (const [co, list] of byCompany) {
    const byKey = new Map();
    for (const r of list) {
      for (const k of rowKeys(co, r)) {
        if (!byKey.has(k)) byKey.set(k, { ext: [], slug: [] });
        const e = byKey.get(k);
        if (isRouteableExternalId(r.company, r.external_id) && shortJobSlug(r.company, r.external_id) === k) {
          e.ext.push(r.id);
        }
        if (storedSlugSegment(r.company, r.slug) === k) e.slug.push(r.id);
      }
    }
    for (const [k, e] of byKey) {
      if (e.ext.length) {
        for (const id of e.slug) if (!e.ext.includes(id)) losers.push(id);
        if (e.ext.length > 1) losers.push(...e.ext.slice(1));
      } else if (e.slug.length > 1) {
        slugSlugClashes += e.slug.length - 1;
        losers.push(...e.slug.slice(1));
      }
    }
  }

  const loserSet = new Set(losers);
  const rawSlugs = new Set(rows.filter((r) => r.slug).map((r) => String(r.slug).toLowerCase()));
  console.log(`colliding URL keys resolved: slug-slug extras=${slugSlugClashes}`);
  console.log(`rows needing re-slug (shadowed): ${loserSet.size}`);
  if (loserSet.size === 0) {
    console.log('Nothing to fix.');
    return;
  }

  const plan = [];
  for (const r of rows) {
    if (!loserSet.has(r.id)) continue;
    const co = companyToSlug(r.company);
    const used = claimed.get(co);
    if (!used) continue;
    let newSlug = `${co}_${mintPrettyJobSlug(r.title, r.id, used)}`;
    // Guard against a raw slug-column value we cannot route (extremely rare).
    let guard = 0;
    while (rawSlugs.has(newSlug.toLowerCase()) && guard++ < 8) {
      newSlug = `${co}_${mintPrettyJobSlug(r.title, `${r.id}:${guard}`, used)}`;
    }
    plan.push({ id: r.id, company: r.company, title: r.title, old: r.slug, new: newSlug });
  }
  plan.sort((a, b) => (a.company || '').localeCompare(b.company || '') || a.id.localeCompare(b.id));

  const uniqueNew = new Set(plan.map((p) => p.new.toLowerCase()));
  const invalid = plan.filter((p) => {
    const rest = p.new.split('_').slice(1).join('_');
    return !isShortJobSlug(rest);
  });
  console.log(`plan: ${plan.length} slugs (unique=${uniqueNew.size}, invalid=${invalid.length})`);
  for (const s of plan.slice(0, 12)) {
    console.log(`  ${s.company} | ${String(s.title).slice(0, 40)} | ${s.old} -> ${s.new}`);
  }
  if (plan.length !== uniqueNew.size || invalid.length) {
    console.error('PLAN INVALID — aborting (duplicate or non-routeable new slug).');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log(`DRY_RUN — no writes. ${plan.length} rows would be updated.`);
    return;
  }

  // Apply.
  const stats = { ok: 0, fail: 0, reasons: {} };
  let idx = 0;
  async function patchSlug(id, slug) {
    let lastErr;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const r = await fetch(`${U}/rest/v1/jobs?id=eq.${id}`, {
          method: 'PATCH',
          headers: { ...headers, Prefer: 'return=minimal' },
          body: JSON.stringify({ slug }),
          signal: AbortSignal.timeout(30000),
        });
        if (!r.ok) {
          const t = await r.text();
          throw new Error(`patch_${r.status}:${t.slice(0, 200)}`);
        }
        return true;
      } catch (e) {
        lastErr = e;
        const msg = String(e.message || e);
        if (attempt < 3 && (msg.includes('fetch failed') || msg.includes('aborted') || /patch_5\d\d:/.test(msg))) {
          await sleep(1000 * attempt);
          continue;
        }
        throw e;
      }
    }
    throw lastErr;
  }

  async function worker() {
    while (true) {
      const pos = idx++;
      if (pos >= plan.length) return;
      const p = plan[pos];
      const co = companyToSlug(p.company);
      try {
        let applied = await patchSlug(p.id, p.new);
        if (!applied) {
          const used = claimed.get(co);
          const retry = `${co}_${mintPrettyJobSlug(p.title, `${p.id}:retry`, used)}`;
          applied = await patchSlug(p.id, retry);
        }
        if (applied) stats.ok++;
        else {
          stats.fail++;
          console.error(`  ✗ ${p.id}: could not set slug ${p.new}`);
        }
      } catch (e) {
        stats.fail++;
        const reason = String(e.message || e).slice(0, 80);
        stats.reasons[reason] = (stats.reasons[reason] || 0) + 1;
        if (stats.fail <= 10) console.error(`  ✗ ${p.id}: ${reason}`);
      }
      if ((stats.ok + stats.fail) % 500 === 0) {
        const rate = Math.round((stats.ok + stats.fail) / ((Date.now() - t0) / 60000));
        console.log(`  … ok ${stats.ok} / fail ${stats.fail} (${rate}/min)`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  console.log(`Done: ok=${stats.ok} fail=${stats.fail} in ${Math.round((Date.now() - t0) / 1000)}s`);
  if (stats.fail) {
    const top = Object.entries(stats.reasons).sort((a, b) => b[1] - a[1]).slice(0, 8);
    for (const [reason, n] of top) console.log(`  fail[${n}] ${reason}`);
  }
}

main().catch((e) => {
  console.error('fix-shadowed-slugs failed:', e.message);
  process.exit(1);
});
