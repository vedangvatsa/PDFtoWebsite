/**
 * Second pass: company blurbs from the employer's own website (verified
 * domains only). Extract the intro (og:description / meta description /
 * first paragraph), paraphrase with ling-2.6-flash, gate against plagiarism
 * and slop, store in company-descriptions.json + sources map.
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { assessOriginality } from '../../src/lib/job-originality.ts';
import { hasPublishSlop } from '../../src/lib/noslop.ts';
import companyDomains from '../../src/lib/company-domains.json' with { type: 'json' };
import { publishableCompanyAbout } from '../../src/lib/company-about.ts';

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

const WRITE_SYSTEM = `You rewrite a company website intro into an original 60-90 word "About the company" paragraph for a job site.

Rules:
- Every fact must come from the SOURCE intro. Do not add facts. If the intro is mostly marketing claims with no concrete facts, keep only what is factual.
- Original prose: no 6+ word copy from SOURCE, no synonym-spin. Change subject, verbs, clause order.
- Plain short sentences. No em dashes, no ellipsis, no curly quotes.
- Never write: leverage, utilize, seamless, robust, passionate, cutting-edge, world-class, game-changer, furthermore, moreover, empowering, revolutionize.
- Never open a sentence with This, These, That, It, or They.
- No markdown, no lists, no headings. One paragraph only.
- Output only the paragraph.`;

async function fetchIntro(domain) {
  const url = `https://${domain}`;
  const r = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36' },
    signal: AbortSignal.timeout(12000),
    redirect: 'follow',
  });
  if (!r.ok) return null;
  const html = await r.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
  // og:description / meta description first
  const og = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  const md = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  for (const m of [og, md]) {
    if (m && m[1].trim().length >= 80 && m[1].trim().length <= 500) return { text: m[1].trim(), url };
  }
  // fallback: first long paragraph-ish run of the body text
  const sentences = text.split(/(?<=[.!?])\s+/);
  let acc = '';
  for (const s of sentences) {
    acc += (acc ? ' ' : '') + s;
    if (acc.length >= 200 && acc.length <= 600) return { text: acc, url };
  }
  return null;
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
  if (t.length < 250 || t.length > 750) return 'length';
  if (hasPublishSlop(t)) return 'noslop';
  if (/\b(see also|external links|disambiguation|further reading|references)\b/i.test(t)) return 'wiki_residue';
  const words = t.split(/\s+/).length;
  if (words < 40 || words > 115) return 'length';
  const origin = assessOriginality(t, source, { company: name });
  if (!origin.ok) return `origin:${origin.reasons.join(',')}`;
  return null;
}

// --- collect companies missing a blurb ---
const companies = new Map();
for (let off = 0; ; off += 1000) {
  const r = await fetch(`${U}/rest/v1/jobs?select=company,company_key&limit=1000&offset=${off}`, { headers });
  const part = await r.json();
  if (!Array.isArray(part) || !part.length) break;
  for (const row of part) {
    const key = String(row.company_key || '').trim() || String(row.company || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (key && row.company) companies.set(key, String(row.company));
  }
}
const missing = [...companies.entries()].filter(([key, name]) => {
  if (desc[key] || desc[key.replace(/-/g, '')]) return false;
  return !publishableCompanyAbout(key) && !publishableCompanyAbout(name);
});
console.log('missing blurbs:', missing.length);

const reasonLog = new Map();
const concurrency = Number(process.env.CONCURRENCY || 6);
let done = 0, okCount = 0;
let idx = 0;
async function worker() {
  while (idx < missing.length) {
    const i = idx++;
    const [key, name] = missing[i];
    const domain = String(companyDomains[key] || companyDomains[key.replace(/-/g, '')] || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!domain) {
      reasonLog.set(key, 'no_domain');
      done++;
      continue;
    }
    try {
      const intro = await fetchIntro(domain);
      if (!intro) {
        reasonLog.set(key, 'fetch_fail');
        done++;
        continue;
      }
      const prompt = `COMPANY: ${name}\nSOURCE INTRO:\n${intro.text.slice(0, 1800)}\n\nWrite the original About the company paragraph (60-90 words).`;
      let about = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const out = await callModel(prompt, WRITE_SYSTEM);
          const fail = gate(out, intro.text, name);
          if (fail) {
            reasonLog.set(key, fail);
            continue;
          }
          about = out;
          break;
        } catch (e) {
          reasonLog.set(key, String(e.message || e).slice(0, 40));
        }
      }
      if (about) {
        desc[key] = about;
        sources[key] = intro.url;
        okCount++;
        if (okCount % 25 === 0) {
          writeFileSync(DESC_PATH, JSON.stringify(desc, null, 1));
          writeFileSync(SRC_PATH, JSON.stringify(sources, null, 1));
        }
      }
    } catch {
      reasonLog.set(key, 'err');
    }
    done++;
    if (done % 50 === 0) console.log(`progress ${done}/${missing.length} ok=${okCount}`);
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));
writeFileSync(DESC_PATH, JSON.stringify(desc, null, 1));
writeFileSync(SRC_PATH, JSON.stringify(sources, null, 1));
const reasonCounts = {};
for (const r of reasonLog.values()) reasonCounts[r] = (reasonCounts[r] || 0) + 1;
console.log(`DONE total=${missing.length} ok=${okCount}`, JSON.stringify(reasonCounts, null, 1));
