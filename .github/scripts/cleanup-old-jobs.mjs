/**
 * Guarded expiry cleanup: delete ONLY unenriched jobs (no description) older
 * than JOBS_MAX_AGE_DAYS. Enriched pages (curated-jd or any description) are
 * NEVER deleted — matches the site rule "still indexable if curated".
 *
 * Env: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY, JOBS_MAX_AGE_DAYS (default 30)
 *      SUPABASE_ACCESS_TOKEN / SUPABASE_PROJECT_REF (optional fast path)
 * Usage: node .github/scripts/cleanup-old-jobs.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

try {
  const dotenv = require('dotenv');
  dotenv.config({ path: resolve(__dirname, '../../.env.local') });
  dotenv.config();
} catch {
  /* optional */
}

/** Telegram-posted jobs must NEVER be deleted — their cvin.bio links were
 * published to the channel. Protect by apply_url (normalized). */
function loadProtectedUrls() {
  const path = resolve(__dirname, '.telegram-ai-jobs-posted.json');
  if (!existsSync(path)) return new Set();
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8'));
    const out = new Set();
    for (const u of Array.isArray(raw) ? raw : []) {
      out.add(normUrl(u));
    }
    return out;
  } catch {
    return new Set();
  }
}

function normUrl(u) {
  return String(u || '')
    .toLowerCase()
    .split('?')[0]
    .split('#')[0]
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '');
}

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF ||
  (SUPABASE_URL.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1] ?? '');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const DAYS = Number(process.env.JOBS_MAX_AGE_DAYS || 30);
const BATCH = Math.min(500, Math.max(50, Number(process.env.JOBS_DELETE_BATCH || 200)));
const MAX_ROUNDS = Number(process.env.JOBS_DELETE_MAX_ROUNDS || 500);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function mgmtQuery(sql) {
  if (!ACCESS_TOKEN || !PROJECT_REF) return null;
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'cvin-cleanup-old-jobs/1.0',
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`mgmt query failed HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function main() {
  const cutoff = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString();
  const protectedUrls = loadProtectedUrls();
  const useMgmt = Boolean(ACCESS_TOKEN && PROJECT_REF);
  console.log(`guarded cleanup: delete UNENRICHED jobs (description is null) with created_at < ${cutoff} (>${DAYS}d)`);
  console.log(`protected telegram-posted urls: ${protectedUrls.size}`);
  console.log(`mode: ${useMgmt ? 'Management API SQL (fast direct)' : 'PostgREST REST client'}`);

  let totalDeleted = 0;
  let consecutiveEmpty = 0;
  let afterId = null;

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    let rows = null;

    if (useMgmt) {
      const sql = `
        SELECT id, apply_url
        FROM public.jobs
        WHERE created_at < '${cutoff}'
          AND (published_at IS NULL OR published_at < '${cutoff}')
          AND description IS NULL
          AND NOT coalesce(tags @> ARRAY['curated-jd']::text[], false)
          AND NOT coalesce(tags @> ARRAY['source-archived']::text[], false)
          AND telegram_posted_at IS NULL
          ${afterId ? `AND id > '${afterId}'` : ''}
        ORDER BY id ASC
        LIMIT ${BATCH};
      `;
      try {
        rows = await mgmtQuery(sql);
      } catch (err) {
        console.error('mgmt select failed', err.message);
        process.exit(1);
      }
    } else {
      let query = sb
        .from('jobs')
        .select('id,apply_url')
        .lt('created_at', cutoff)
        .or(`published_at.is.null,published_at.lt.${cutoff}`)
        .is('description', null)
        .not('tags', 'cs', '{curated-jd}')
        .not('tags', 'cs', '{source-archived}')
        .is('telegram_posted_at', null)
        .order('id', { ascending: true })
        .limit(BATCH);
      if (afterId) query = query.gt('id', afterId);
      const { data, error: selErr } = await query;
      if (selErr) {
        console.error('select failed', selErr.message);
        process.exit(1);
      }
      rows = data;
    }

    if (!rows || rows.length === 0) {
      consecutiveEmpty++;
      if (consecutiveEmpty >= 2) break;
      await sleep(500);
      continue;
    }
    consecutiveEmpty = 0;
    afterId = rows[rows.length - 1].id;

    const ids = rows
      .filter((r) => !protectedUrls.has(normUrl(r.apply_url)))
      .map((r) => r.id)
      .filter(Boolean);
    if (!ids.length) { if (rows.length < BATCH) break; continue; }

    if (useMgmt) {
      const quotedIds = ids.map((id) => `'${id}'`).join(',');
      const delSql = `
        DELETE FROM public.jobs
        WHERE id IN (${quotedIds})
          AND description IS NULL
          AND NOT coalesce(tags @> ARRAY['curated-jd']::text[], false)
          AND NOT coalesce(tags @> ARRAY['source-archived']::text[], false)
          AND telegram_posted_at IS NULL
          AND created_at < '${cutoff}'
          AND (published_at IS NULL OR published_at < '${cutoff}')
        RETURNING id;
      `;
      try {
        const deletedRows = await mgmtQuery(delSql);
        const n = Array.isArray(deletedRows) ? deletedRows.length : ids.length;
        totalDeleted += n;
        console.log(`round ${round}: deleted ${n} (total ${totalDeleted})`);
      } catch (delErr) {
        console.error('mgmt delete failed', delErr.message);
        process.exit(1);
      }
    } else {
      // Re-check the guard at write time in case enrichment raced the read.
      const { error: delErr, count: delCount } = await sb.from('jobs').delete({ count: 'exact' }).in('id', ids)
        .is('description', null).not('tags', 'cs', '{curated-jd}').not('tags', 'cs', '{source-archived}').is('telegram_posted_at', null)
        .lt('created_at', cutoff).or(`published_at.is.null,published_at.lt.${cutoff}`);

      if (delErr) {
        console.error('delete failed', delErr.message);
        process.exit(1);
      } else {
        const n = delCount ?? ids.length;
        totalDeleted += n;
        console.log(`round ${round}: deleted ${n} (total ${totalDeleted})`);
      }
    }

    await sleep(300);
    if (rows.length < BATCH) break;
  }

  // Verify: enriched pages untouched
  if (useMgmt) {
    try {
      const stats = await mgmtQuery(`
        SELECT
          (SELECT count(*) FROM public.jobs WHERE tags @> ARRAY['curated-jd']::text[]) AS curated_est,
          (SELECT count(*) FROM public.jobs WHERE description IS NULL) AS nulls_left;
      `);
      console.log(JSON.stringify({
        ok: true,
        days: DAYS,
        deleted: totalDeleted,
        curated_pages_est: stats?.[0]?.curated_est != null ? Number(stats[0].curated_est) : null,
        remaining_unenriched_est: stats?.[0]?.nulls_left != null ? Number(stats[0].nulls_left) : null,
      }, null, 2));
    } catch {
      console.log(JSON.stringify({ ok: true, days: DAYS, deleted: totalDeleted }, null, 2));
    }
  } else {
    const { count: curatedEst } = await sb
      .from('jobs')
      .select('id', { count: 'estimated', head: true })
      .contains('tags', ['curated-jd']);
    const { count: nullsLeft } = await sb
      .from('jobs')
      .select('id', { count: 'estimated', head: true })
      .is('description', null);
    console.log(JSON.stringify({
      ok: true,
      days: DAYS,
      deleted: totalDeleted,
      curated_pages_est: curatedEst ?? null,
      remaining_unenriched_est: nullsLeft ?? null,
    }, null, 2));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
