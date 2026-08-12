/**
 * One-shot: delete jobs from curl-empty ingest sources / apply hosts.
 * Usage: node .github/scripts/purge-curl-empty-jobs.mjs
 */
import dotenv from 'dotenv';
import { isLowQualityApplySource } from './lib/job-apply-source.mjs';

dotenv.config({ path: '.env.local' });
dotenv.config();

const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
if (!U || !K) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const SOURCES = [
  'linkedin',
  'jooble',
  'adzuna',
  'careerjet',
  'jsearch',
  'indeed',
  'glassdoor',
  'ziprecruiter',
];

const HOST_NEEDLES = [
  'linkedin.com',
  'lnkd.in',
  'jobviewtrack.com',
  'jooble.org',
  'indeed.com',
  'glassdoor.com',
  'ziprecruiter.com',
  'simplyhired.com',
  'talent.com',
  'careerjet.',
  'adzuna.',
];

const headers = { apikey: K, Authorization: `Bearer ${K}` };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function deleteIds(ids) {
  if (!ids.length) return 0;
  const inList = ids.map((id) => `"${id}"`).join(',');
  const del = await fetch(`${U}/rest/v1/jobs?id=in.(${inList})`, {
    method: 'DELETE',
    headers: { ...headers, Prefer: 'return=minimal' },
  });
  if (!del.ok) {
    const err = await del.text();
    throw new Error(`delete ${del.status} ${err.slice(0, 200)}`);
  }
  return ids.length;
}

async function main() {
  let total = 0;

  for (const source of SOURCES) {
    for (let round = 0; round < 80; round++) {
      const sel = await fetch(
        `${U}/rest/v1/jobs?select=id&source=eq.${encodeURIComponent(source)}&limit=500`,
        { headers }
      );
      if (!sel.ok) throw new Error(`select source=${source} ${sel.status}`);
      const rows = await sel.json();
      if (!rows.length) break;
      const n = await deleteIds(rows.map((r) => r.id).filter(Boolean));
      total += n;
      console.log(`source=${source} round ${round + 1}: -${n} (total ${total})`);
      await sleep(120);
      if (rows.length < 500) break;
    }
  }

  for (const host of HOST_NEEDLES) {
    for (let round = 0; round < 40; round++) {
      const sel = await fetch(
        `${U}/rest/v1/jobs?select=id,apply_url&apply_url=ilike.*${encodeURIComponent(host)}*&limit=500`,
        { headers }
      );
      if (!sel.ok) throw new Error(`select apply~${host} ${sel.status}`);
      const rows = await sel.json();
      if (!rows.length) break;
      const ids = rows.filter((r) => isLowQualityApplySource(r.apply_url)).map((r) => r.id);
      if (!ids.length) break;
      const n = await deleteIds(ids);
      total += n;
      console.log(`apply~${host} round ${round + 1}: -${n} (total ${total})`);
      await sleep(120);
      if (rows.length < 500) break;
    }
  }

  console.log(`done. deleted ${total}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
