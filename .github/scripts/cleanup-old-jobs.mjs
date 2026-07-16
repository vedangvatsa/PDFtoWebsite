/**
 * One-shot / manual: delete jobs older than 30 days (by created_at).
 * Free-tier safe: selects + deletes in batches of 1000.
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY
 * Usage: node .github/scripts/cleanup-old-jobs.mjs
 */
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const cutoff = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString();
  console.log(`cleanup: delete jobs with created_at < ${cutoff} (>${DAYS} days)`);

  // Count first
  const countRes = await fetch(
    `${SUPABASE_URL}/rest/v1/jobs?select=id&created_at=lt.${encodeURIComponent(cutoff)}`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'count=exact',
        Range: '0-0',
      },
    }
  );
  const contentRange = countRes.headers.get('content-range') || '';
  console.log('content-range (approx count):', contentRange || '(unknown)');

  let totalDeleted = 0;
  for (let round = 0; round < 100; round++) {
    const sel = await fetch(
      `${SUPABASE_URL}/rest/v1/jobs?select=id&created_at=lt.${encodeURIComponent(cutoff)}&limit=1000`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    if (!sel.ok) {
      console.error('select failed', sel.status, await sel.text());
      process.exit(1);
    }
    const rows = await sel.json();
    if (!Array.isArray(rows) || rows.length === 0) break;
    const ids = rows.map((r) => r.id).filter(Boolean);
    // PostgREST: quote UUIDs in in.() filters
    const inList = ids.map((id) => `"${id}"`).join(',');
    const del = await fetch(
      `${SUPABASE_URL}/rest/v1/jobs?id=in.(${inList})`,
      {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: 'return=minimal',
        },
      }
    );
    if (!del.ok) {
      console.error('delete failed', del.status, await del.text());
      process.exit(1);
    }
    totalDeleted += ids.length;
    console.log(`round ${round + 1}: deleted ${ids.length} (total ${totalDeleted})`);
    await sleep(250);
    if (rows.length < 1000) break;
  }

  console.log(JSON.stringify({ ok: true, days: DAYS, deleted: totalDeleted }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
