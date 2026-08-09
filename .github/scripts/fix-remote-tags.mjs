/**
 * Remove the `remote` tag from jobs whose listed location is a specific office
 * (not remote/hybrid/anywhere), fixing the inaccurate remote tagging.
 *
 * Usage:
 *   node .github/scripts/fix-remote-tags.mjs dry      # count only
 *   node .github/scripts/fix-remote-tags.mjs apply    # remove tags
 */
import { readFileSync } from 'node:fs';

const env = {};
for (const line of readFileSync(
  '/Users/vedang/.gemini/antigravity/scratch/PDFtoWebsite/.env.local',
  'utf8'
).split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (m) env[m[1]] = m[2];
}
const U = (env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = env.SUPABASE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '';
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const MODE = process.argv[2] || 'dry';
const REMOTE_RE = /remote|hybrid|work from home|wfh|worldwide|anywhere|virtual|global|telecommute/i;

async function jfetch(url, opts = {}, timeout = 60000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  let offset = 0;
  const PAGE = 1000;
  let checked = 0;
  let toFix = 0;
  let fixed = 0;
  const samples = [];

  while (true) {
    const url =
      `${U}/rest/v1/jobs?select=id,tags,location,title,company&tags=cs.{"remote"}` +
      `&apply_url=not.is.null&created_at=gt.${encodeURIComponent(since)}` +
      `&order=created_at.desc&limit=${PAGE}&offset=${offset}`;
    const r = await jfetch(url, { headers: H });
    if (!r.ok) throw new Error(`fetch ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const rows = await r.json();
    if (!Array.isArray(rows) || !rows.length) break;
    checked += rows.length;

    for (const j of rows) {
      const loc = (j.location || '').trim();
      if (!loc) continue; // unknown location — don't touch
      if (REMOTE_RE.test(loc)) continue; // genuinely remote-ish
      toFix++;
      if (samples.length < 10) samples.push(`${j.location} | ${j.company}: ${j.title}`);
      if (MODE === 'apply') {
        const tags = (j.tags || []).filter((t) => t !== 'remote');
        const pr = await jfetch(`${U}/rest/v1/jobs?id=eq.${j.id}`, {
          method: 'PATCH',
          headers: H,
          body: JSON.stringify({ tags }),
        });
        if (pr.ok || pr.status === 204) fixed++;
      }
    }
    if (rows.length < PAGE) break;
    offset += PAGE;
    if (checked % 5000 === 0) console.log(`  scanned ${checked}, on-site w/ remote tag: ${toFix}`);
  }

  console.log(`\nScanned ${checked} remote-tagged jobs`);
  console.log(`On-site locations (non-remote) carrying the remote tag: ${toFix}`);
  if (MODE === 'apply') console.log(`Removed remote tag from: ${fixed}`);
  console.log('Samples:');
  samples.forEach((s) => console.log('  ' + s));
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
