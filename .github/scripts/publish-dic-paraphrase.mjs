#!/usr/bin/env node
/**
 * Paraphrase + publish DIC careers rows (source=dic-careers) with OpenAI.
 * Uses stored ingest body (HTML+PDF), not live scrape. Gates from jd-manual-gates.
 *
 * Usage: node .github/scripts/publish-dic-paraphrase.mjs
 * Env: OPENAI_API_KEY, SUPABASE_*, NEXT_PUBLIC_SITE_URL
 */
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { checkManualPage } from './lib/jd-manual-gates.mjs';
import {
  normalizeJobDescriptionForStorage,
  descriptionHasWriterLeak,
} from './lib/normalize-job-description.mjs';
import { pingIndexNow } from './lib/indexnow.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const OPENAI_KEY = (process.env.OPENAI_API_KEY || '').replace(/"/g, '').trim();
const MODEL = (process.env.OPENAI_MODEL || 'gpt-4o').replace(/"/g, '').trim();
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio').replace(/\/$/, '');
const CONCURRENCY = Math.max(1, Number(process.env.PUBLISH_CONCURRENCY || 3));
const DRY_RUN = process.env.DRY_RUN === '1';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function headers(extra = {}) {
  return { apikey: K, Authorization: `Bearer ${K}`, ...extra };
}

function sourceBody(job) {
  const d = String(job.description || '');
  const marker = '--- Job page ---';
  const i = d.indexOf(marker);
  if (i >= 0) return d.slice(i + marker.length).trim();
  return d;
}

function buildPrompt(job, source) {
  const loc = job.location || '';
  const engagement = job.job_type || job.category || '';
  return `You are writing a cvin.bio job page from an official government posting. Paraphrase fully: new sentence structures, no copied phrases of 8+ words from the source.

Output PLAIN TEXT only (no markdown fences). Target 650–850 words (never exceed 900 words).

Required structure (each header on its own line, blank line before each section):

${job.title} at ${job.company}.

About the role
Write 4–5 paragraphs summarizing scope, employer context, and what the role is responsible for. Use only facts from the source.

Key facts
Location: ${loc || '(from source)'}
Engagement: ${engagement || '(from source)'}
Add Compensation/Team lines only if clearly stated in the source (omit unknown lines entirely).

What you'll do
At least 10 bullet lines starting with "- ". Full sentences. Regroup duties by theme; do not mirror source order.

Requirements
At least 8 bullet lines starting with "- ". Education, experience, certifications from source only.

Nice to have
Only if the source lists optional criteria; otherwise omit this entire section.

Practical notes
2–4 sentences on application deadline, how to apply, and contract/deputation notes if present. End with: Confirm details on the official apply page.

Rules:
- No em dashes (use commas).
- No leverage, delve, cutting-edge, exciting opportunity, furthermore, moreover, tapestry.
- Do not invent perks, salary, or duties not in the source.
- Government acronyms (NeGD, DIC, MeitY) may stay as in source.

SOURCE (fact feed only — do not paste):
${source.slice(0, 28000)}`;
}

async function callOpenAI(prompt, temperature = 0.45) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`openai ${res.status}: ${err.slice(0, 300)}`);
  }
  const data = await res.json();
  return String(data.choices?.[0]?.message?.content || '').trim();
}

async function paraphraseJob(job, source) {
  let lastGate = null;
  let draft = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    const prompt =
      attempt === 0
        ? buildPrompt(job, source)
        : `Revise this job page. Fix: ${lastGate?.fails?.join(', ') || 'too short'}. Keep all true facts. Minimum 650 words. Same section headers.\n\nDRAFT:\n${draft.slice(0, 12000)}`;
    draft = await callOpenAI(prompt, attempt === 0 ? 0.45 : 0.3);
    draft = normalizeJobDescriptionForStorage(draft) || '';
    draft = draft.replace(/[—–]/g, ', ');
    if (descriptionHasWriterLeak(draft)) continue;
    const gate = checkManualPage(draft, source);
    lastGate = gate;
    if (gate.ok) return { page: draft, gate };
    if (gate.wordCount < 600) continue;
  }
  return { page: draft, gate: lastGate || { ok: false, fails: ['failed'] } };
}

async function fetchJobs() {
  const url =
    `${U}/rest/v1/jobs?source=eq.dic-careers` +
    '&select=id,title,company,company_key,location,job_type,category,salary,apply_url,external_id,description,tags' +
    '&order=title.asc';
  const r = await fetch(url, { headers: headers() });
  const rows = await r.json();
  if (!Array.isArray(rows)) throw new Error(JSON.stringify(rows).slice(0, 200));
  return rows.filter((j) => !((j.tags || []).includes('curated-jd')));
}

async function publishJob(job, page) {
  const tags = Array.isArray(job.tags) ? [...job.tags] : [];
  if (!tags.includes('curated-jd')) tags.push('curated-jd');
  const patch = {
    description: page,
    tags,
    company_key: job.company_key || 'dic',
  };
  if (DRY_RUN) return patch;
  const r = await fetch(`${U}/rest/v1/jobs?id=eq.${job.id}`, {
    method: 'PATCH',
    headers: {
      ...headers({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    },
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error(`patch ${r.status} ${(await r.text()).slice(0, 200)}`);
  return patch;
}

function publicPath(job) {
  const co = job.company_key || 'dic';
  const ext = String(job.external_id || '');
  const seg = ext.startsWith(`${co}_`) ? ext.slice(co.length + 1) : ext;
  return `/${co}/${seg}`;
}

async function mapPool(items, concurrency, fn) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

async function main() {
  if (!U || !K || !OPENAI_KEY) {
    console.error('Need SUPABASE_* and OPENAI_API_KEY');
    process.exit(1);
  }
  const jobs = await fetchJobs();
  console.log(`Publishing ${jobs.length} DIC jobs with ${MODEL} (dry=${DRY_RUN ? 1 : 0})`);
  if (!jobs.length) {
    console.log('Nothing to publish');
    return;
  }

  const results = await mapPool(jobs, CONCURRENCY, async (job) => {
    const source = sourceBody(job);
    const path = publicPath(job);
    try {
      const { page, gate } = await paraphraseJob(job, source);
      if (!gate?.ok) {
        console.error(`FAIL gates ${path} ${gate?.fails?.join(',')} wc=${gate?.wordCount}`);
        return { ok: false, path, title: job.title, fails: gate?.fails };
      }
      await publishJob(job, page);
      console.log(`OK ${gate.wordCount}w ${SITE}${path}`);
      return { ok: true, path, title: job.title, words: gate.wordCount };
    } catch (e) {
      console.error(`ERR ${path} ${e.message}`);
      return { ok: false, path, title: job.title, error: e.message };
    }
  });

  const ok = results.filter((r) => r?.ok);
  const paths = ok.map((r) => r.path);
  if (paths.length && !DRY_RUN) {
    await pingIndexNow([...paths, '/dic', '/jobs']);
  }

  console.log(`\nDone: ${ok.length}/${jobs.length} published`);
  if (ok.length) {
    console.log('\nLive links:');
    for (const r of ok) console.log(`${SITE}${r.path} — ${r.title}`);
  }
  const bad = results.filter((r) => !r?.ok);
  if (bad.length) {
    console.log('\nFailed:');
    for (const r of bad) console.log(r.path, r.fails || r.error);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
