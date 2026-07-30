/**
 * Delete jobs older than N days (by created_at).
 * Free-tier safe: select ids then delete in small batches.
 *
 * Env:
 *   NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY / SUPABASE_KEY
 *   JOBS_MAX_AGE_DAYS (default 30)
 *   JOBS_DELETE_BATCH (default 200)
 *
 * Usage: node .github/scripts/cleanup-old-jobs.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
).replace(/\/$/, '');
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

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

async function main() {
  const cutoff = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString();
  console.log(`cleanup: delete jobs with created_at < ${cutoff} (>${DAYS} days), batch=${BATCH}`);

  // Estimated count of candidates (exact often null on free tier)
  const { count: estCount, error: estErr } = await sb
    .from('jobs')
    .select('id', { count: 'estimated', head: true })
    .lt('created_at', cutoff);
  if (estErr) console.warn('count warning:', estErr.message);
  console.log('estimated rows to delete:', estCount ?? '(unknown)');

  let totalDeleted = 0;
  let consecutiveEmpty = 0;

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    const { data: rows, error: selErr } = await sb
      .from('jobs')
      .select('id')
      .lt('created_at', cutoff)
      .order('created_at', { ascending: true })
      .limit(BATCH);

    if (selErr) {
      console.error('select failed', selErr.message, selErr.code, selErr.details);
      process.exit(1);
    }
    if (!rows || rows.length === 0) {
      consecutiveEmpty++;
      if (consecutiveEmpty >= 2) break;
      await sleep(500);
      continue;
    }
    consecutiveEmpty = 0;

    const ids = rows.map((r) => r.id).filter(Boolean);

    // Prefer .in('id', ids) — avoids broken PostgREST id=in.("uuid") quoting (400)
    const { error: delErr, count: delCount } = await sb
      .from('jobs')
      .delete({ count: 'exact' })
      .in('id', ids);

    if (delErr) {
      console.error('delete failed', delErr.message, delErr.code, delErr.details, delErr.hint);
      // Fallback: delete one-by-one for this batch (still free-tier friendly)
      let ok = 0;
      for (const id of ids) {
        const { error: oneErr } = await sb.from('jobs').delete().eq('id', id);
        if (oneErr) {
          console.error('single delete failed', id, oneErr.message);
          process.exit(1);
        }
        ok++;
        if (ok % 25 === 0) await sleep(100);
      }
      totalDeleted += ok;
      console.log(`round ${round}: deleted ${ok} (fallback singles, total ${totalDeleted})`);
    } else {
      const n = delCount ?? ids.length;
      totalDeleted += n;
      console.log(`round ${round}: deleted ${n} (total ${totalDeleted})`);
    }

    // Pace free-tier
    await sleep(300);
    if (ids.length < BATCH) break;
  }

  // Verify remaining
  const { count: leftEst } = await sb
    .from('jobs')
    .select('id', { count: 'estimated', head: true })
    .lt('created_at', cutoff);
  const { count: totalEst } = await sb
    .from('jobs')
    .select('id', { count: 'estimated', head: true });

  console.log(
    JSON.stringify(
      {
        ok: true,
        days: DAYS,
        deleted: totalDeleted,
        remaining_older_than_cutoff_est: leftEst ?? null,
        jobs_total_est: totalEst ?? null,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
