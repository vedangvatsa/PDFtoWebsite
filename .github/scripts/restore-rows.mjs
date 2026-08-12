import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env.local') });
config();
const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const headers = { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' };

const mapped = JSON.parse(readFileSync('/var/folders/9v/95v6_ny50fq2t6wnlhc140dh0000gn/T/opencode/all-mapped.json', 'utf8'));
const triples = JSON.parse(readFileSync('/var/folders/9v/95v6_ny50fq2t6wnlhc140dh0000gn/T/opencode/triples.json', 'utf8'));
const byPath = new Map(triples.map(([co, ti, p]) => [p, { company: co, title: ti }]));

function norm(u) { return String(u||'').toLowerCase().split('?')[0].split('#')[0].replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/+$/,''); }
// check which are still missing
const existing = new Set();
for (let off = 0; ; off += 1000) {
  const r = await fetch(`${U}/rest/v1/jobs?select=apply_url&limit=1000&offset=${off}`, { headers });
  const rows = await r.json();
  if (!Array.isArray(rows) || !rows.length) break;
  for (const row of rows) if (row.apply_url) existing.add(norm(row.apply_url));
}
const still = mapped.filter((m) => !existing.has(norm(m.url)));
console.log('still missing (restorable):', still.length);

let restored = 0, failed = 0, already = 0;
for (const { url, path } of still) {
  try {
    const m = path.replace('https://cvin.bio/', '').split('/');
    if (m.length !== 2) { failed++; continue; }
    const [companySlug, jobSlug] = m;
    const info = byPath.get(path) || {};
    const title = info.title || jobSlug.replace(/-/g, ' ');
    const company = info.company || companySlug;
    const slug = `${companySlug}_${jobSlug}`;
    // duplicate check
    const dup = await fetch(`${U}/rest/v1/jobs?select=id&slug=eq.${encodeURIComponent(slug)}&limit=1`, { headers });
    const dupRows = await dup.json();
    if (Array.isArray(dupRows) && dupRows.length) { failed++; continue; }
    const r = await fetch(`${U}/rest/v1/jobs`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({
        title: title.slice(0, 200),
        company: company.slice(0, 120),
        company_key: companySlug,
        slug,
        apply_url: url,
        source: 'telegram-restore',
        external_id: `${companySlug}_${jobSlug}`,
        dedup_hash: `telegram-restore:${url}`,
        tags: ['remote'],
        published_at: new Date().toISOString(),
      }),
    });
    if (r.ok) restored++;
    else if (r.status === 409) { already++; }
    else { failed++; console.log('insert fail:', r.status, (await r.text()).slice(0, 120)); }
  } catch { failed++; }
}
console.log(`DONE restored=${restored} already-exists=${already} failed=${failed}`);
