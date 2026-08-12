import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env.local') });
config();
const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const headers = { apikey: K, Authorization: `Bearer ${K}` };

const triples = JSON.parse(readFileSync('/var/folders/9v/95v6_ny50fq2t6wnlhc140dh0000gn/T/opencode/triples.json', 'utf8'));
const posted = JSON.parse(readFileSync('/Users/vedang/.gemini/antigravity/scratch/PDFtoWebsite/.github/scripts/.telegram-ai-jobs-posted.json', 'utf8'));
function norm(u) { return String(u || '').toLowerCase().split('?')[0].split('#')[0].replace(/^https?:\/\//, '').replace(/^www\./, ''); }

const existing = new Set();
for (let off = 0; ; off += 1000) {
  const r = await fetch(`${U}/rest/v1/jobs?select=apply_url&limit=1000&offset=${off}`, { headers });
  const rows = await r.json();
  if (!Array.isArray(rows) || !rows.length) break;
  for (const row of rows) if (row.apply_url) existing.add(norm(row.apply_url));
}
const missing = posted.filter((u) => !existing.has(norm(u)));
console.log('missing:', missing.length);

// per-source title/company extraction
async function metaFor(url) {
  const s = String(url);
  const ashby = s.match(/ashbyhq\.com\/([^/]+)\/([0-9a-f-]{20,})/i);
  if (ashby) {
    try {
      const r = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${ashby[1]}`, { signal: AbortSignal.timeout(15000) });
      const d = await r.json();
      const p = (d?.jobs || []).find((j) => j.id === ashby[2]);
      if (p) return { title: p.title, company: p.organization?.name || ashby[1] };
    } catch {}
    return { title: null, company: ashby[1] };
  }
  const gh = s.match(/(?:boards|job-boards)\.greenhouse\.io\/([^/]+)\/jobs\/(\d+)/i);
  if (gh) {
    try {
      const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${gh[1]}/jobs/${gh[2]}`, { signal: AbortSignal.timeout(15000) });
      if (r.ok) { const d = await r.json(); return { title: d.title, company: gh[1] }; }
    } catch {}
    return { title: null, company: gh[1] };
  }
  const gh2 = s.match(/gh_jid=(\d+)/i);
  if (gh2) {
    const m = s.match(/^https?:\/\/(?:www\.)?([^.]+)\./i);
    const slug = m ? m[1] : null;
    if (slug) {
      try {
        const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs/${gh2[1]}`, { signal: AbortSignal.timeout(15000) });
        if (r.ok) { const d = await r.json(); return { title: d.title, company: slug }; }
      } catch {}
    }
  }
  const li = s.match(/linkedin\.com\/jobs\/view\/(.+?)-at-([a-z0-9-]+)-\d+/i);
  if (li) {
    const title = li[1].replace(/-/g, ' ');
    const company = li[2].replace(/-/g, ' ');
    return { title, company };
  }
  return { title: null, company: null };
}

function nk(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim(); }
const byCompany = new Map();
for (const [co, ti, path] of triples) {
  const k = nk(co);
  if (!byCompany.has(k)) byCompany.set(k, []);
  byCompany.get(k).push([nk(ti), path]);
}

const matched = [];
const unmatched = [];
for (let i = 0; i < missing.length; i++) {
  const url = missing[i];
  let meta;
  try { meta = await metaFor(url); } catch { meta = { title: null, company: null }; }
  const ck = nk(meta.company);
  const tk = nk(meta.title);
  const list = byCompany.get(ck);
  let path = null;
  if (list && tk) {
    path = (list.find(([t]) => t === tk) || list.find(([t]) => t.includes(tk.slice(0, 24)) || tk.includes(t.slice(0, 24))))?.[1] || null;
  } else if (list && list.length === 1 && !tk) {
    path = list[0][1]; // single posted job for this company
  }
  if (path) matched.push({ url, title: meta.title || '', company: meta.company || '', path });
  else unmatched.push([url, `${meta.company || '?'} | ${meta.title || '?'}`]);
  if ((i + 1) % 20 === 0) console.log(`progress ${i + 1}/${missing.length} matched=${matched.length}`);
}
console.log('MATCHED:', matched.length, '| UNMATCHED:', unmatched.length);
for (const u of unmatched.slice(0, 6)) console.log('  no:', u[0].slice(0, 60), '|', u[1].slice(0, 50));
writeFileSync('/var/folders/9v/95v6_ny50fq2t6wnlhc140dh0000gn/T/opencode/restore-map.json', JSON.stringify({ matched, unmatched }));
