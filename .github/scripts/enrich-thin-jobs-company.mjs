#!/usr/bin/env node
/**
 * Enrich thin (400-600 word) curated job pages with an original
 * "About the company" section sourced from Wikipedia and rewritten by an LLM.
 *
 * Rules (noslop.md): original paraphrase only (never copy), plain short
 * sentences, no em/en dashes, no ellipsis, no AI filler, no HTML. Output runs
 * through cleanPublishText so nothing ships that fails the publish rules.
 *
 * Usage:
 *   DRY_RUN=1 node .github/scripts/enrich-thin-jobs-company.mjs   # preview
 *   BATCH_COMPANIES=20 node .github/scripts/enrich-thin-jobs-company.mjs
 */
import { createRequire } from 'module';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const headers = { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' };
const unquote = (v) => (v || '').replace(/"/g, '').trim();
const GEMINI_KEYS = [
  unquote(process.env.GEMINI_API_KEY),
  unquote(process.env.GEMINI_API_KEY_2),
  unquote(process.env.GEMINI_API_KEY_3),
  unquote(process.env.GEMINI_API_KEY_4),
].filter(Boolean);
const OPENAI_KEYS = [
  unquote(process.env.OPENAI_API_KEY),
  unquote(process.env.OPENAI_API_KEY_2),
  unquote(process.env.OPENAI_API_KEY_3),
].filter(Boolean);
const NVIDIA_KEYS = [
  unquote(process.env.NVIDIA_API_KEY),
  unquote(process.env.NVIDIA_API_KEY_2),
  unquote(process.env.NVIDIA_API_KEY_3),
].filter(Boolean);
const NVIDIA_BASE = (process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/$/, '');
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b';
const GROQ_KEYS = [
  unquote(process.env.GROQ_API_KEY),
  unquote(process.env.GROQ_API_KEY_2),
].filter(Boolean);

const DRY_RUN = process.env.DRY_RUN === '1';
const BATCH_COMPANIES = Math.max(1, Number(process.env.BATCH_COMPANIES || 40));
// Parallel workers: WORKERS=N WORKER_ID=i — each handles its own shard + state file.
const WORKERS = Math.max(1, Number(process.env.WORKERS || 1));
const WORKER_ID = Math.max(0, Number(process.env.WORKER_ID || 0)) % WORKERS;
const MIN_WORDS = 600; // indexable floor — appended section must clear this
const ABOUT_TARGET = 220; // target words for the About section

const hashStr = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

const STATE_PATH = resolve(
  __dirname,
  WORKERS > 1 ? `enrich-thin-jobs-company-state-w${WORKER_ID}.json` : 'enrich-thin-jobs-company-state.json'
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Mirrors src/lib/noslop.ts publish cleanup (plain text). */
function cleanPublishText(s) {
  if (!s) return '';
  return String(s)
    .replace(/—/g, ' - ')
    .replace(/–/g, '-')
    .replace(/−/g, '-')
    .replace(/…/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[“”„‟]/g, '"')
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[•·]/g, '-')
    .replace(/[\u200B-\u200F\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const wc = (s) => String(s || '').split(/\s+/).filter(Boolean).length;

async function jfetch(url, opts = {}, ms = 15000) {
  const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(ms) });
  if (!res.ok) throw new Error(`http_${res.status}`);
  return res;
}

/** Wikipedia intro extract (plain text) for a company name. */
const WIKI_CACHE_PATH = resolve(__dirname, 'enrich-wikipedia-extracts.json');
const wikiCache = (() => {
  try { return JSON.parse(readFileSync(WIKI_CACHE_PATH, 'utf8')); } catch { return {}; }
})();

async function fetchWikipediaExtract(company) {
  const clean = String(company || '').replace(/\s*\(.*?\)\s*/g, '').trim();
  if (!clean) return null;
  const cacheKey = clean.toLowerCase();
  if (wikiCache[cacheKey] !== undefined) return wikiCache[cacheKey] || null;
  // Progressively more specific searches; stop at the first good hit.
  const queries = [clean, `${clean} company`, `${clean} (company)`];
  for (const q of queries) {
    const url =
      `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}` +
      `&gsrlimit=1&gsrnamespace=0&prop=extracts&exintro&explaintext&format=json`;
    let data = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const r = await jfetch(url, {}, 12000);
        data = await r.json();
        break;
      } catch (e) {
        if (attempt === 2) return null;
        await sleep(1200 * (attempt + 1)); // back off on rate limits
      }
    }
    if (!data) continue;
    const pages = Object.values(data?.query?.pages || {});
    if (!pages.length) continue;
    const p = pages[0];
    const title = String(p?.title || '');
    const ext = String(p?.extract || '').trim();
    // Reject list / category / index / disambiguation pages.
    if (/^(list of|category:|companies listed|index of)|disambiguation|may refer to/i.test(title)) continue;
    if (ext.length < 150) continue;
    wikiCache[cacheKey] = ext;
    try { writeFileSync(WIKI_CACHE_PATH, JSON.stringify(wikiCache)); } catch {}
    return ext;
  }
  wikiCache[cacheKey] = null;
  try { writeFileSync(WIKI_CACHE_PATH, JSON.stringify(wikiCache)); } catch {}
  return null;
}

/** Build the "About the company" section with an LLM from the Wikipedia facts. */
async function writeAboutSection(company, extract) {
  const prompt = `Write an original "About the company" section for a job page for ${company}.

Source facts (paraphrase everything, never copy a sentence):
${extract.slice(0, 3500)}

Rules:
- 200-250 words of plain text. Start with a sentence that names the company.
- Use ONLY facts grounded in the source. If the source is thin, expand with
  careful, general facts about the industry or the company's known focus that
  are clearly implied - never invent precise numbers, dates, or products.
- Short, plain sentences. Front-load facts. No em dashes, no ellipsis, no
  curly quotes, no bullets.
- No AI filler: no leverage, delve, robust, seamless, passionate,
  cutting-edge, game-changing, "In today's fast-paced world".
- Output ONLY the section text, no heading, no HTML, no markdown.`;

  const system = 'You write factual, original company descriptions for a job board. Plain professional English.';

  // Try Gemini first (multiple models), then OpenAI (cheapest). Use a large
  // output budget — gemini-2.5 models reserve tokens for thinking, which can
  // starve the visible answer if the cap is too small.
  for (const model of ['gemini-flash-latest', 'gemini-2.5-flash-lite', 'gemini-2.5-flash']) {
    for (const key of GEMINI_KEYS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const r = await jfetch(
          url,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
            }),
          },
          45000
        );
        const d = await r.json();
        const text = (d?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
        if (text.trim()) return cleanPublishText(text);
      } catch {
        /* try next key / model */
      }
    }
  }
  for (const key of OPENAI_KEYS) {
    try {
      const r = await jfetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 700,
          }),
        },
        45000
      );
      const d = await r.json();
      const text = d?.choices?.[0]?.message?.content || '';
      if (text.trim()) return cleanPublishText(text);
    } catch {
      /* try next key */
    }
  }
  // NVIDIA Nemotron (OpenAI-compatible) — reliable fallback when Gemini/OpenAI quota is spent.
  for (const key of NVIDIA_KEYS) {
    try {
      const r = await jfetch(
        `${NVIDIA_BASE}/chat/completions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: NVIDIA_MODEL,
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 900,
            stream: false,
            chat_template_kwargs: { enable_thinking: false },
          }),
        },
        90000
      );
      const d = await r.json();
      const msg = d?.choices?.[0]?.message || {};
      const text = String(msg.content || '').trim() || String(msg.reasoning_content || '').trim();
      if (text) return cleanPublishText(text);
    } catch {
      /* try next key */
    }
  }
  // Groq (llama-3.3) — fast and cheap.
  for (const key of GROQ_KEYS) {
    try {
      const r = await jfetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 900,
          }),
        },
        45000
      );
      const d = await r.json();
      const text = d?.choices?.[0]?.message?.content || '';
      if (text.trim()) return cleanPublishText(text);
    } catch {
      /* try next key */
    }
  }
  throw new Error('all_llm_failed');
}

/** Append the About section to a stored description. */
function appendAbout(description, company, about) {
  const body = String(description || '').trim();
  const block = `\n\nAbout the company\n\n${about}`;
  let out = body + block;
  // If the role body already covers "About the company", avoid duplication.
  if (/about the company/i.test(body)) return null;
  return out;
}

async function main() {
  if (!U || !K) { console.error('Need Supabase env'); process.exit(1); }
  if (!GEMINI_KEYS.length && !OPENAI_KEYS.length && !NVIDIA_KEYS.length && !GROQ_KEYS.length && !DRY_RUN) {
    console.error('Need an LLM provider key (GEMINI / OPENAI / NVIDIA / GROQ)');
    process.exit(1);
  }

  const state = (() => {
    try { return JSON.parse(readFileSync(STATE_PATH, 'utf8')); } catch { return { done: {}, failed: {} }; }
  })();
  const save = () => writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));

  // 1) Load thin curated jobs (400-600 words). Limit to the recent window
  //    (same as the main enrichment) so the scan is fast — no full-table pass.
  const jobs = [];
  {
    const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    let from = 0;
    const PAGE = 1000;
    while (true) {
      const qs =
        `select=id,company,company_key,description` +
        `&tags=cs.%7B%22curated-jd%22%7D` +
        `&created_at=gte.${encodeURIComponent(since)}` +
        `&limit=${PAGE}&offset=${from}`;
      let rows = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const r = await jfetch(`${U}/rest/v1/jobs?${qs}`, { headers });
          rows = await r.json();
          break;
        } catch (e) {
          if (attempt === 2) {
            console.warn(`  scan page ${from} failed: ${String(e.message || e)}`);
            break;
          }
          await sleep(2000 * (attempt + 1));
        }
      }
      if (!Array.isArray(rows) || !rows.length) break;
      for (const j of rows) {
        const w = wc(j.description);
        if (w >= 400 && w < MIN_WORDS) jobs.push(j);
      }
      from += PAGE;
      if (rows.length < PAGE) break;
    }
  }
  console.log(`Thin curated jobs (400-${MIN_WORDS - 1}w): ${jobs.length}`);

  // 2) Group by company.
  const byCompany = new Map();
  for (const j of jobs) {
    const key = String(j.company_key || j.company || '').toLowerCase().trim() || String(j.company || '');
    if (!byCompany.has(key)) byCompany.set(key, { company: j.company, jobs: [] });
    byCompany.get(key).jobs.push(j);
  }
  console.log(`Companies: ${byCompany.size} | worker ${WORKER_ID}/${WORKERS} | processing up to ${BATCH_COMPANIES}`);

  // Seed per-worker state with the existing shared done set so already-enriched
  // companies are skipped, even after switching to parallel workers.
  if (WORKERS > 1) {
    try {
      const shared = JSON.parse(readFileSync(resolve(__dirname, 'enrich-thin-jobs-company-state.json'), 'utf8'));
      for (const [k, v] of Object.entries(shared.done || {})) state.done[k] = v;
      for (const [k, v] of Object.entries(shared.failed || {})) {
        if (!state.failed[k] && /^(no_wikipedia|about_too_short)/.test(String(v))) state.failed[k] = v;
      }
    } catch { /* no shared state yet */ }
  }

  let processed = 0, ok = 0, skip = 0, fail = 0, updated = 0;
  for (const [key, group] of byCompany) {
    if (processed >= BATCH_COMPANIES) break;
    // Shard companies across parallel workers.
    if (WORKERS > 1 && hashStr(key) % WORKERS !== WORKER_ID) continue;
    // Done companies stay done. Transient failures (LLM quota, patch errors)
    // are retried every run; permanent ones are skipped.
    const failReason = state.failed[key] || '';
    if (state.done[key]) { processed++; continue; }
    if (failReason && /^(no_wikipedia|about_too_short)/.test(failReason)) { processed++; continue; }
    processed++;
    const company = group.company;
    const companyName = String(company || '').replace(/\s+\(.*?\)$/g, '').trim();

    const extract = await fetchWikipediaExtract(companyName);
    if (!extract) {
      state.failed[key] = 'no_wikipedia';
      console.log(`  skip ${company}: no Wikipedia extract`);
      skip += group.jobs.length;
      if (!DRY_RUN) save();
      continue;
    }

    let about;
    try {
      about = await writeAboutSection(companyName, extract);
    } catch (e) {
      state.failed[key] = String(e.message || e).slice(0, 80);
      fail += group.jobs.length;
      console.log(`  fail ${company}: ${state.failed[key]}`);
      if (!DRY_RUN) save();
      continue;
    }
    if (wc(about) < 80) {
      state.failed[key] = `about_too_short:${wc(about)}w`;
      fail += group.jobs.length;
      console.log(`  fail ${company}: ${state.failed[key]} | extract ${wc(extract)}w`);
      if (!DRY_RUN) save();
      continue;
    }

    let companyUpdated = 0;
    for (const j of group.jobs) {
      const appended = appendAbout(j.description, companyName, about);
      if (!appended) { skip++; continue; }
      const finalWc = wc(appended);
      if (finalWc < MIN_WORDS) { skip++; continue; }
      if (!DRY_RUN) {
        try {
          await jfetch(`${U}/rest/v1/jobs?id=eq.${j.id}`, {
            method: 'PATCH',
            headers: { ...headers, Prefer: 'return=minimal' },
            body: JSON.stringify({ description: appended }),
          });
        } catch (e) {
          state.failed[key] = `patch_${String(e.message || e).slice(0, 40)}`;
          console.log(`  fail ${company}: patch error on ${j.id}`);
          break;
        }
      }
      companyUpdated++;
      updated++;
    }
    state.done[key] = { aboutWc: wc(about), jobs: companyUpdated };
    ok += group.jobs.length;
    console.log(`  ok ${company}: ${companyUpdated}/${group.jobs.length} jobs updated (about ${wc(about)}w)`);
    if (!DRY_RUN) save();
    await sleep(250);
  }

  console.log(`\nDone. processed=${processed} companies, updated=${updated} jobs, skip=${skip}, fail=${fail}${DRY_RUN ? ' (DRY RUN - no writes)' : ''}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
