import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env.local') });
config();
const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const headers = { apikey: K, Authorization: `Bearer ${K}` };

function norm(u) { return String(u || '').toLowerCase().split('?')[0].split('#')[0].replace(/^https?:\/\//, '').replace(/^www\./, ''); }
const posted = JSON.parse(readFileSync('/Users/vedang/.gemini/antigravity/scratch/PDFtoWebsite/.github/scripts/.telegram-ai-jobs-posted.json', 'utf8'));
const existing = new Set();
for (let off = 0; ; off += 1000) {
  const r = await fetch(`${U}/rest/v1/jobs?select=apply_url&limit=1000&offset=${off}`, { headers });
  const rows = await r.json();
  if (!Array.isArray(rows) || !rows.length) break;
  for (const row of rows) if (row.apply_url) existing.add(norm(row.apply_url));
}
const missing = posted.filter((u) => !existing.has(norm(u)));
console.log('missing urls:', missing.length);
const missingSet = new Set(missing.map(norm));

const adds = JSON.parse(readFileSync('/var/folders/9v/95v6_ny50fq2t6wnlhc140dh0000gn/T/opencode/commit-adds.json', 'utf8'));
const needed = adds.filter((c) => c.added.some((u) => missingSet.has(norm(u))));
console.log('commits with missing urls:', needed.length);

const runs = JSON.parse(readFileSync('/var/folders/9v/95v6_ny50fq2t6wnlhc140dh0000gn/T/opencode/runs.json', 'utf8'));
console.log('runs loaded:', runs.length);

function findRunForDate(dateStr) {
  const t = new Date(dateStr).getTime();
  let best = null;
  for (const r of runs) {
    if (r.status !== 'completed') continue;
    const rt = new Date(r.createdAt).getTime();
    const d = Math.abs(rt - t);
    if (d < 3 * 3600 * 1000 && (!best || d < best.d)) best = { id: r.databaseId, d };
  }
  return best;
}

const matched = [];
const stillMissing = [];
for (const c of needed) {
  const run = findRunForDate(c.date);
  if (!run) { stillMissing.push(...c.added.filter((u) => missingSet.has(norm(u))).map((u) => [u, 'no_run'])); continue; }
  let log = '';
  try {
    log = execSync(`gh run view ${run.id} --log 2>/dev/null`, { cwd: '/Users/vedang/.gemini/antigravity/scratch/PDFtoWebsite', maxBuffer: 1e8 }).toString();
  } catch { stillMissing.push(...c.added.filter((u) => missingSet.has(norm(u))).map((u) => [u, 'log_fetch'])); continue; }
  const paths = [];
  for (const line of log.split('\n')) {
    const m = line.match(/✓ live \d+: (https:\/\/cvin\.bio\/[^ \t]+)/);
    if (m) paths.push(m[1]);
    const p = line.match(/• .+? → (https:\/\/cvin\.bio\/[^ \t]+)/);
    if (p) paths.push(p[1]);
  }
  if (!paths.length) { stillMissing.push(...c.added.filter((u) => missingSet.has(norm(u))).map((u) => [u, 'no_live_lines'])); continue; }
  const addedHere = c.added.filter((u) => missingSet.has(norm(u)));
  const count = Math.min(addedHere.length, paths.length);
  for (let i = 0; i < count; i++) matched.push({ url: addedHere[i], path: paths[i], date: c.date });
  for (let i = count; i < addedHere.length; i++) stillMissing.push([addedHere[i], 'zip_overflow']);
}
console.log('MATCHED:', matched.length, '| STILL MISSING:', stillMissing.length);
for (const s of stillMissing.slice(0, 6)) console.log('  still:', s[0].slice(0, 60), s[1]);
writeFileSync('/var/folders/9v/95v6_ny50fq2t6wnlhc140dh0000gn/T/opencode/final-map.json', JSON.stringify({ matched, stillMissing }));
