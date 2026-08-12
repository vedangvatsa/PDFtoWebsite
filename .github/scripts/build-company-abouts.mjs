/**
 * Generate original "About the company" blurbs for companies that lack one.
 * Source: Wikipedia page summary (facts only). Output: a ≤90-word original
 * paraphrase, gated against plagiarism (copy span ≤ 6, 5-gram jaccard ≤ 0.05,
 * noslop-clean, no encyclopedia residue). Written into company-descriptions.json
 * so both the site and the enrichment pipeline pick it up.
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { assessOriginality } from '../../src/lib/job-originality.ts';
import { hasPublishSlop } from '../../src/lib/noslop.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env.local') });
config();

const ROOT = resolve(__dirname, '../..');
const DESC_PATH = resolve(ROOT, 'src/lib/company-descriptions.json');
const SRC_PATH = resolve(ROOT, 'docs/company-about-sources.json');
const OR = String(process.env.OPENROUTER_API_KEY || '').trim();
const MODEL = process.env.OPENROUTER_MODEL || 'inclusionai/ling-2.6-flash';
const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const headers = { apikey: K, Authorization: `Bearer ${K}` };

const desc = JSON.parse(readFileSync(DESC_PATH, 'utf8'));
let sources = {};
try {
  sources = JSON.parse(readFileSync(SRC_PATH, 'utf8'));
} catch {
  sources = {};
}

const WRITE_SYSTEM = `You rewrite a Wikipedia company summary into an original 60-90 word "About the company" paragraph for a job site.

Rules:
- Every fact must come from the SOURCE summary. Do not add facts.
- Original prose: no 6+ word copy from SOURCE, no synonym-spin. Change subject, verbs, clause order.
- Plain short sentences. No em dashes, no ellipsis, no curly quotes.
- Never write: leverage, utilize, seamless, robust, passionate, cutting-edge, world-class, game-changer, furthermore, moreover.
- Never open a sentence with This, These, That, It, or They.
- No markdown, no lists, no headings. One paragraph only.
- Output only the paragraph.`;

async function wikiSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const r = await fetch(url, { headers: { 'User-Agent': 'cvin.bio-job-site/1.0 (contact: admin@cvin.bio)' } });
  if (!r.ok) return null;
  const d = await r.json();
  const text = String(d?.extract || '').trim();
  if (text.length < 60) return null;
  return { text, url: d?.content_urls?.desktop?.page || url };
}

async function callModel(prompt, system) {
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OR}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://cvin.bio',
      'X-Title': 'cvin.bio company about builder',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 400,
      reasoning: { effort: 'none' },
      messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`openrouter_${r.status}`);
  const d = await r.json();
  return String(d.choices?.[0]?.message?.content || '').trim();
}

function gate(about, source, name) {
  const t = String(about || '').trim();
  if (t.length < 250 || t.length > 750) return "length";
  if (hasPublishSlop(t)) return 'noslop';
  if (/\b(see also|external links|disambiguation|further reading|references)\b/i.test(t)) return 'wiki_residue';
  const words = t.split(/\s+/).length;
  if (words < 40 || words > 115) return 'length';
  const origin = assessOriginality(t, source, { company: name });
  if (!origin.ok) return `origin:${origin.reasons.join(',')}`;
  return null;
}

async function buildOne(name, reasonLog) {
  for (const candidate of [name, `${name} (company)`, `${name.replace(/\s+(?:inc|llc|ltd|plc|corp)\.?$/i, '')}`]) {
    const wiki = await wikiSummary(candidate);
    if (!wiki) {
      reasonLog.set(name, reasonLog.has(name) ? reasonLog.get(name) : 'wiki_missing');
      continue;
    }
    const prompt = `SOURCE SUMMARY:\n${wiki.text.slice(0, 2200)}\n\nWrite the original About the company paragraph (60-90 words).`;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const about = await callModel(prompt, WRITE_SYSTEM);
        const fail = gate(about, wiki.text, name);
        if (fail) {
          reasonLog.set(name, fail);
          continue;
        }
        return { about, url: wiki.url };
      } catch (e) {
        reasonLog.set(name, String(e.message || e).slice(0, 40));
      }
    }
  }
  return null;
}

// --- collect companies missing a blurb (paginated) ---
const companies = new Map();
for (let off = 0; ; off += 1000) {
  const r = await fetch(`${U}/rest/v1/jobs?select=company,company_key&limit=1000&offset=${off}`, { headers });
  const part = await r.json();
  if (!Array.isArray(part) || !part.length) break;
  for (const row of part) {
    const key = String(row.company_key || '').trim() || String(row.company || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const name = String(row.company || '').trim();
    if (key && name) companies.set(key, name);
  }
}
console.log('distinct companies from jobs:', companies.size);

const missing = [...companies.entries()].filter(([key]) => !desc[key] && !desc[key.replace(/-/g, '')]);
console.log('missing blurbs:', missing.length);

const reasonLog = new Map();
const concurrency = Number(process.env.CONCURRENCY || 6);
let done = 0, okCount = 0;
let idx = 0;
async function worker() {
  while (idx < missing.length) {
    const i = idx++;
    const [key, name] = missing[i];
    const result = await buildOne(name, reasonLog);
    done++;
    if (result) {
      desc[key] = result.about;
      sources[key] = result.url;
      okCount++;
      if (okCount % 25 === 0) {
        writeFileSync(DESC_PATH, JSON.stringify(desc, null, 1));
        writeFileSync(SRC_PATH, JSON.stringify(sources, null, 1));
      }
    }
    if (done % 50 === 0) console.log(`progress ${done}/${missing.length} ok=${okCount}`);
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));
writeFileSync(DESC_PATH, JSON.stringify(desc, null, 1));
writeFileSync(SRC_PATH, JSON.stringify(sources, null, 1));
const reasonCounts = {};
for (const r of reasonLog.values()) reasonCounts[r] = (reasonCounts[r] || 0) + 1;
console.log(`DONE total=${missing.length} ok=${okCount}`, JSON.stringify(reasonCounts, null, 1));
