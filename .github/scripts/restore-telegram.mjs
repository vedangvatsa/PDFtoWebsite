import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { cleanAtsHtml } from '../../src/lib/job-ats-text.ts';
import { buildWriteUser, loadWriteSystemPrompt } from '../../src/lib/job-write-prompt.ts';
import { finalizeCuratedJd } from '../../src/lib/job-finalize.ts';
import { repairLoop } from '../../src/lib/job-repair.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env.local') });
config();
const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const OR = String(process.env.OPENROUTER_API_KEY || '').trim();
const MODEL = process.env.OPENROUTER_MODEL || 'inclusionai/ling-2.6-flash';
const headers = { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' };
const SYSTEM = loadWriteSystemPrompt();

const posted = JSON.parse(readFileSync('/Users/vedang/.gemini/antigravity/scratch/PDFtoWebsite/.github/scripts/.telegram-ai-jobs-posted.json', 'utf8'));

// which posted urls exist in DB now?
function norm(u) { return String(u || '').toLowerCase().split('?')[0].split('#')[0].replace(/^https?:\/\//, '').replace(/^www\./, ''); }
const wanted = new Set(posted.map(norm));
const existing = new Set();
for (let off = 0; ; off += 1000) {
  const r = await fetch(`${U}/rest/v1/jobs?select=apply_url&limit=1000&offset=${off}`, { headers });
  const rows = await r.json();
  if (!Array.isArray(rows) || !rows.length) break;
  for (const row of rows) if (row.apply_url) existing.add(norm(row.apply_url));
}
const missing = posted.filter((u) => !existing.has(norm(u)));
console.log('missing from DB:', missing.length);

async function callModel(prompt, system) {
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OR}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://cvin.bio', 'X-Title': 'restore' },
    body: JSON.stringify({
      model: MODEL, temperature: 0.2, max_tokens: 2200, reasoning: { effort: 'none' },
      messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) throw new Error('openrouter_' + r.status);
  const d = await r.json();
  return String(d.choices?.[0]?.message?.content || '').trim();
}

async function fetchMeta(url) {
  const r = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125.0' },
    signal: AbortSignal.timeout(20000),
    redirect: 'follow',
  });
  if (!r.ok) return null;
  const html = await r.text();
  const title = (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || '';
  const clean = cleanAtsHtml(html);
  const m = String(url).match(/ashbyhq\.com\/([^/]+)\//i);
  const g = String(url).match(/greenhouse\.io\/([^/]+)\/jobs\/(\d+)/i);
  const company = m ? m[1] : g ? g[1] : (html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i) || [])[1] || '';
  return { title: (title || '').replace(/[|–-].*$/, '').trim(), company: (company || '').trim(), text: clean };
}

let restored = 0, failed = 0;
for (let i = 0; i < missing.length; i++) {
  const url = missing[i];
  try {
    const meta = await fetchMeta(url);
    if (!meta || !meta.title || !meta.company) { failed++; continue; }
    // insert row
    const slugBase = String(meta.company).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'company';
    const slug = `${slugBase}-${Math.random().toString(16).slice(2, 8)}`;
    const insert = await fetch(`${U}/rest/v1/jobs`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({
        title: meta.title.slice(0, 200),
        company: meta.company.slice(0, 120),
        company_key: slugBase,
        slug,
        apply_url: url,
        source: 'telegram-restore',
        tags: ['remote'],
        published_at: new Date().toISOString(),
      }),
    });
    if (!insert.ok) { failed++; continue; }
    const row = (await insert.json())[0];
    // enrich
    const srcWords = meta.text.split(/\s+/).filter(Boolean).length;
    if (srcWords < 40) { failed++; continue; }
    const user = buildWriteUser({ title: row.title, company: row.company, location: null, sourceText: meta.text });
    const draft = await callModel(user, SYSTEM);
    const { fin } = await repairLoop(
      { rawDraft: draft, source: meta.text, job: row, system: SYSTEM, callModel },
      (d, s, j) => finalizeCuratedJd(d, { sourceText: s, job: j })
    );
    const onlyLength = fin.reasons.every((r) => r === 'short' || r === 'thin_duties' || r === 'thin_requirements');
    if (fin.ok || onlyLength) {
      const tags = ['remote'];
      if (fin.ok) tags.push('curated-jd');
      const patch = await fetch(`${U}/rest/v1/jobs?id=eq.${row.id}`, {
        method: 'PATCH',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify({ description: fin.text, tags }),
      });
      if (patch.ok) restored++;
      else failed++;
    } else {
      failed++;
    }
  } catch {
    failed++;
  }
  if ((i + 1) % 10 === 0) console.log(`progress ${i + 1}/${missing.length} restored=${restored} failed=${failed}`);
}
console.log(`DONE restored=${restored} failed=${failed}`);
