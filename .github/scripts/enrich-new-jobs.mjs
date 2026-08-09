#!/usr/bin/env node
/**
 * Enrich NEWLY-FETCHED jobs with original, non-plagiarized content.
 *
 * Runs automatically right after jobs-sync (see .github/workflows/x-scheduler.yml).
 * For every new, un-curated job it:
 *   1. curls the source posting (apply_url) to pull the full official text
 *      (best-effort; falls back to the stored scraped description)
 *   2. asks an LLM to write an ORIGINAL 600-900 word job page — paraphrase
 *      only, never quote the source
 *   3. upserts the fresh description + curated-jd tag into the DB
 *   4. curls the resulting cvin.bio page to verify it renders (200)
 *
 * Provider priority (all OpenAI-compatible):
 *   1. DEEPSEEK (direct, default deepseek-v4-flash) — highest concurrency (2500),
 *      the only path that can finish a full ~33k cycle in minutes. Requires a
 *      DEEPSEEK_API_KEY with credits.
 *   2. OPENROUTER paid (OPENROUTER_MODEL, default deepseek/deepseek-v4-flash) —
 *      fallback when no DeepSeek key; note OpenRouter RPM caps make 10-min bursts
 *      unrealistic (~3.5k RPM wall).
 *   3. OPENROUTER free (OPENROUTER_FREE_MODEL, default inclusionai/ling-3.0-flash:free)
 *      — automatic $0 fallback.
 *   4. GROQ free / OPENAI (legacy) fallbacks.
 *
 * Burst mode (fastest full-cycle publish): set CONCURRENCY=1000 and
 * SKIP_SOURCE_CURL=1 SKIP_VERIFY=1 — uses the stored description directly and
 * skips page-verify curls so the hot path is just LLM + DB patch.
 *
 * The URL (slug/external_id) is NEVER changed here — only the content. The
 * read-path anti-plagiarism guard means un-curated jobs already never show
 * scraped text; this script upgrades them to full original pages.
 *
 * Env:
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY   (or SUPABASE_KEY)
 *   DEEPSEEK_API_KEY / DEEPSEEK_MODEL          (default deepseek-v4-flash; thinking off)
 *   OPENROUTER_API_KEY / OPENROUTER_MODEL / OPENROUTER_FREE_MODEL
 *   GROQ_API_KEY / OPENAI_API_KEY              (optional fallbacks)
 * Options:
 *   SINCE_HOURS=72   — look back window for "new" jobs (default 72h ≈ sync cadence)
 *   MAX_JOBS=50000   — process at most this many per run (default covers full cycle)
 *   CONCURRENCY=16   — parallel calls (default 16; raise to 1000 for burst mode)
 *   SOURCE_CHARS=7000— source text trimmed to ~this many chars (cost saver)
 *   SKIP_SOURCE_CURL=1 — use the stored DB description instead of curling apply_url
 *   SKIP_VERIFY=1    — skip the post-publish cvin.bio page curl
 *   DRY_RUN=1        — count + sample only
 */
import { createHash } from 'crypto';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, appendFileSync } from 'fs';
import { jobPublicUrl } from './lib/job-public-url.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'inclusionai/ling-3.0-flash:free';
const OPENROUTER_FREE_MODEL = process.env.OPENROUTER_FREE_MODEL || 'inclusionai/ling-3.0-flash:free';
const ZENMUX_KEY = process.env.ZENMUX_API_KEY || '';
const ZENMUX_MODEL = process.env.ZENMUX_MODEL || 'inclusionai/ling-3.0-flash';
const ZENMUX_BASE = process.env.ZENMUX_BASE_URL || 'https://zenmux.ai/api/v1';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';
const GROQ_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const ENABLE_LEGACY_PROVIDERS = process.env.ENABLE_LEGACY_PROVIDERS === '1';
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const SINCE_HOURS = Math.max(1, Number(process.env.SINCE_HOURS || 72));
const MAX_JOBS = Math.max(1, Math.min(500000, Number(process.env.MAX_JOBS || 50000)));
const CONCURRENCY = Math.max(1, Math.min(2000, Number(process.env.CONCURRENCY || 16)));
const SOURCE_CHARS = Math.max(1000, Math.min(20000, Number(process.env.SOURCE_CHARS || 7000)));
const WRITE_BATCH = Math.max(1, Math.min(1000, Number(process.env.WRITE_BATCH || 250)));
const POOL_LIMIT = Math.min(500000, Math.max(0, Number(process.env.POOL_LIMIT || 0))); // 0 = scan all
const STATE_FILE = process.env.STATE_FILE || ''; // optional: persists processed job ids so a crash resumes
const SKIP_SOURCE_CURL = process.env.SKIP_SOURCE_CURL === '1';
const SKIP_VERIFY = process.env.SKIP_VERIFY === '1';
// Trial knobs: target un-curated pages with <600-word descriptions (thin pages),
// across the whole site (no created_at window).
const THIN_ONLY = process.env.THIN_ONLY === '1';
const ALL_TIME = process.env.ALL_TIME === '1';
const DRY = process.env.DRY_RUN === '1';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio';

if (!U || !K) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!DEEPSEEK_KEY && !OPENROUTER_KEY && !GROQ_KEY && !OPENAI_KEY) {
  console.error('Missing a provider key (DEEPSEEK_API_KEY, OPENROUTER_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY)');
  process.exit(1);
}

const headers = { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' };
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function jfetch(url, opts = {}, timeoutMs = 45000, retries = 3) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(timeoutMs) });
      // 429 (rate limit / out of credits) → return immediately so callers can fail over.
      if (r.status === 429) return r;
      if (r.status >= 500 && attempt < retries) {
        await sleep(1000 * 2 ** (attempt - 1));
        continue;
      }
      return r;
    } catch (e) {
      lastErr = e;
      if (attempt < retries) await sleep(1200 * 2 ** (attempt - 1));
    }
  }
  throw lastErr || new Error('jfetch failed');
}

async function pageAll(select, extraFilters, label) {
  const out = [];
  let offset = 0;
  while (true) {
    const url = `${U}/rest/v1/jobs?select=${select}${extraFilters}&limit=1000&offset=${offset}`;
    const rows = await jfetch(url, { headers }, 60000).then((r) => r.json());
    if (!Array.isArray(rows) || !rows.length) break;
    out.push(...rows);
    if (rows.length < 1000) break;
    offset += 1000;
  }
  if (label) console.log(`  … ${label}: ${out.length} rows`);
  return out;
}

/** Strip tags to plain text for grounding the rewrite. */
function toPlain(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Best-effort: curl the source posting for the full official text. */
async function fetchSourceText(job) {
  if (SKIP_SOURCE_CURL) {
    return toPlain(job.description || '').slice(0, SOURCE_CHARS);
  }
  let text = '';
  if (job.apply_url) {
    try {
      const r = await jfetch(
        job.apply_url,
        { headers: { 'User-Agent': UA, Accept: 'text/html' } },
        8000,
        1
      );
      if (r.ok) {
        const html = await r.text();
        text = toPlain(html);
      }
    } catch {}
  }
  if (text.length < 300) text = toPlain(job.description || '');
  return text.slice(0, SOURCE_CHARS);
}

// ── Prompt + validation (mirrors enrich-remote-job-descriptions.mjs) ──
/**
 * Build chat messages: a shared INSTRUCTION system message (identical across
 * jobs → provider context-cache friendly) + a per-job user message with the
 * job facts and trimmed source. Never quotes the source.
 */
function buildMessages(job, sourceText, nudge) {
  const system = `You write original job description pages for cvin.bio. Every output is machine-checked against ALL rules below, and any violation means the page is rejected and rewritten. Follow every rule exactly.

1. LENGTH — NON-NEGOTIABLE: The final page MUST contain at least 650 words (aim for 700-900). These per-section minimums are mandatory and together guarantee 650+ words. Do not leave any section short, stubbed, or as "...":
   - "{Title} at {Company}." intro line + About the role: 3-4 full sentences (at least 50 words total)
   - Key facts: the Location / Engagement / Compensation lines
   - What you'll do: at least 10 bullets, each 10-25 words (at least 120 words)
   - Requirements: at least 8 bullets, each 10-25 words (at least 100 words)
   - Nice to have: at least 4 bullets (at least 50 words)
   - Skills & tools: at least 6 bullets (at least 45 words)
   - Practical notes: at least 4 bullets (at least 55 words)
   Write the COMPLETE page now, in one continuous response. Do not truncate and do not stop early. Before finishing, count the words of your draft; if it is under 650, expand the bullets and sentences until it clearly exceeds 650.

2. ORIGINALITY: Rewrite the source entirely in your own words. Never copy a sentence, clause, phrase, or bullet from the source. Every fact is re-expressed freshly.

3. FACTS: Preserve EVERY concrete fact from the source: technologies, years of experience, degree requirements, locations, salary/compensation numbers, visas, deadlines, team names, product names, must-haves, nice-to-haves. Do not invent facts that are not in the source.

4. STRUCTURE — use EXACTLY these headers, in this exact order, with a blank line between sections:
{Title} at {Company}.
About the role
Key facts
Location: <match the Listed location; write "Not specified" only if unknown>
Engagement: <full-time / part-time / contract / internship / freelance>
Compensation: <only if the source lists salary>
What you'll do
Requirements
Nice to have
Skills & tools
Practical notes

5. REMOTE RULE: Describe the role as remote ONLY if the Listed location or the source text explicitly says it is remote/remote-first/work-from-home. If the Listed location is a specific city or office, the "Location:" line must match that city exactly and the role must NOT be called remote.

6. TONE: Plain text only. No HTML, no Markdown, no em dashes, no bullet-dot characters. Do not use buzzwords: leverage, delve, robust, seamless, passionate, cutting-edge, exciting opportunity.

7. OUTPUT ONLY THE PAGE: Begin directly with the "{Title} at {Company}." line. Do NOT include any preamble, reasoning, analysis, commentary, or trailing notes before or after the page.`;

  const metaBits = [
    `Company: ${job.company}`,
    `Title: ${job.title}`,
    job.location ? `Listed location: ${job.location}` : null,
    job.job_type ? `Job type: ${job.job_type}` : null,
    job.salary ? `Listed salary: ${job.salary}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const user = `META
${metaBits}

SOURCE (facts only — rewrite in your own words, do not quote):
${sourceText.slice(0, SOURCE_CHARS)}${nudge ? `\n\n${nudge}` : ''}`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

const REMOTE_SIGNAL = /\bremote\b|work from home|\bwfh\b|remote[- ]first|work from anywhere|distributed/i;

/**
 * Plagiarism gate: reject rewrites that copy sentences verbatim from the source.
 * Returns the ratio of output sentences that are near-identical to a source
 * sentence (word-set overlap ≥ 0.8) OR a long verbatim substring match.
 */
function copiedSentenceRatio(output, source) {
  const norm = (s) =>
    String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  const src = norm(source);
  if (src.length < 80) return 0; // thin source → nothing meaningful to copy
  const srcSentences = src.split(/\. |\n|! |\? /).filter((s) => s.split(' ').length >= 5);

  const outSentences = norm(output)
    .split(/\. |\n|! |\? /)
    .filter((s) => s.split(' ').length >= 6);

  let flagged = 0;
  for (const os of outSentences) {
    const words = new Set(os.split(' '));
    if (words.size < 6) continue;
    // 1) verbatim substring: a long exact chunk lifted from the source
    let verbatim = false;
    for (let n = 40; n <= os.length; n += 20) {
      for (const ss of srcSentences) {
        if (ss.includes(os.slice(0, n)) || os.includes(ss.slice(0, n))) {
          verbatim = true;
          break;
        }
      }
      if (verbatim) break;
    }
    if (verbatim) { flagged++; continue; }
    // 2) word-set overlap with any source sentence
    for (const ss of srcSentences) {
      const sw = ss.split(' ');
      let hits = 0;
      for (const w of sw) if (words.has(w)) hits++;
      const overlap = hits / Math.max(sw.length, words.size);
      if (overlap >= 0.8) { flagged++; break; }
    }
  }
  return outSentences.length ? flagged / outSentences.length : 0;
}

function finalizeText(text, job, sourceText) {
  text = (text || '').trim();
  if (text.startsWith('```')) text = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
  // Strip markdown formatting some models emit (#/## headers, **bold**).
  text = text
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 600) throw new Error('rewrite_short');
  if (/delve into|cutting-edge|exciting opportunity to join/i.test(text)) throw new Error('rewrite_slop');
  if (!/About the role|What you'll do|Requirements/i.test(text)) throw new Error('rewrite_structure');
  // Anti-plagiarism: reject near-verbatim copies of the source posting.
  const copyRatio = copiedSentenceRatio(text, sourceText);
  if (copyRatio > 0.15) throw new Error(`rewrite_copy:${Math.round(copyRatio * 100)}pct`);

  const listed = String(job?.location || '').trim().replace(/\s+/g, ' ');
  const listedRemote = REMOTE_SIGNAL.test(listed.toLowerCase());
  const sourceRemote = REMOTE_SIGNAL.test(String(sourceText || '').toLowerCase());
  const lines = text.split('\n');
  let locIdx = lines.findIndex((l) => /^Location:/i.test(l.trim()));
  if (listed && !/unknown|not (specified|provided|given)|n\/a/i.test(listed)) {
    if (locIdx !== -1) {
      const val = lines[locIdx].replace(/^Location:/i, '').trim();
      const valRemote = REMOTE_SIGNAL.test(val.toLowerCase());
      if (valRemote && !(sourceRemote || listedRemote)) throw new Error('rewrite_remote_contradiction');
      if (valRemote && !listedRemote) lines[locIdx] = `Location: ${listed}`;
    } else {
      const kf = lines.findIndex((l) => /^Key facts$/i.test(l.trim()));
      if (kf !== -1) lines.splice(kf + 1, 0, `Location: ${listed}`);
    }
  }
  return lines.join('\n').slice(0, 8000);
}

/** Provider configs (OpenAI-compatible chat completions). */
const PROVIDERS = {
  gemini: {
    url: `${GEMINI_BASE}/chat/completions`,
    key: GEMINI_KEY,
    model: GEMINI_MODEL,
    retries: 5,
    freeTier: true, // free-tier quota → exponential backoff on 429
  },
  zenmux: {
    url: `${ZENMUX_BASE}/chat/completions`,
    key: ZENMUX_KEY,
    model: ZENMUX_MODEL,
    retries: 4,
    freeTier: true, // free/rate-limited variants → exponential backoff on 429
  },
  deepseek: {
    url: 'https://api.deepseek.com/v1/chat/completions',
    key: DEEPSEEK_KEY,
    model: DEEPSEEK_MODEL,
    retries: 3,
    // DeepSeek v4 defaults to thinking mode; disable for fast, cheap rewrites.
    thinkingOff: true,
  },
  openrouter: {
    url: `${OPENROUTER_BASE}/chat/completions`,
    key: OPENROUTER_KEY,
    model: OPENROUTER_MODEL,
    retries: 3,
  },
  'openrouter-free': {
    url: `${OPENROUTER_BASE}/chat/completions`,
    key: OPENROUTER_KEY,
    model: OPENROUTER_FREE_MODEL,
    retries: 4, // free tier rate-limits more
  },
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: GROQ_KEY,
    model: GROQ_MODEL,
    retries: 5,
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    key: OPENAI_KEY,
    model: OPENAI_MODEL,
    retries: 1,
  },
};

/** Ordered provider names to try per job (first working wins). */
function providerOrder() {
  const order = [];
  if (GEMINI_KEY) order.push('gemini'); // Google Gemini free tier
  if (ZENMUX_KEY) order.push('zenmux'); // ZenMux (ling)
  if (OPENROUTER_KEY) {
    order.push('openrouter'); // OPENROUTER_MODEL (ling)
    order.push('openrouter-free'); // OPENROUTER_FREE_MODEL (ling free fallback)
  }
  if (DEEPSEEK_KEY) order.push('deepseek');
  // Groq / OpenAI are only used when explicitly enabled (default: ling only).
  if (ENABLE_LEGACY_PROVIDERS) {
    if (GROQ_KEY) order.push('groq');
    if (OPENAI_KEY) order.push('openai');
  }
  return order;
}

async function callChat(provider, messages) {
  const cfg = PROVIDERS[provider];
  const isFree = provider === 'openrouter-free' || provider === 'groq' || cfg.freeTier;
  let lastErr = '';
  for (let attempt = 0; attempt < cfg.retries; attempt++) {
    const body = {
      model: cfg.model,
      messages,
      temperature: 0.4,
      max_tokens: 16000,
      top_p: 0.9,
    };
    // DeepSeek v4-flash: thinking mode off → keeps output ~1k tokens, not 4k+ of reasoning.
    if (cfg.thinkingOff) body.thinking = false;
    const r = await jfetch(
      cfg.url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.key}` },
        body: JSON.stringify(body),
      },
      300000,
      4
    );
    if (r.ok) {
      const data = await r.json();
      return data.choices?.[0]?.message?.content || '';
    }
    const err = await r.text();
    lastErr = `${provider}_${r.status}:${err.slice(0, 120)}`;
    // Free-tier 429 → exponential backoff + retry; paid 429 → fail over.
    if (r.status === 429 && isFree && attempt < cfg.retries - 1) {
      await sleep(6000 * 2 ** attempt); // 6s, 12s, 24s, 48s
      continue;
    }
    throw new Error(lastErr);
  }
  throw new Error(lastErr || `${provider}_failed`);
}

/** Rewrite a job's description, failing over across providers. */
async function rewriteDescription(job, sourceText, nudge) {
  const providers = providerOrder();
  const messages = buildMessages(job, sourceText, nudge);
  let lastErr = '';
  for (const provider of providers) {
    try {
      const text = await callChat(provider, messages);
      return finalizeText(text, job, sourceText);
    } catch (e) {
      const msg = String(e.message || e);
      // Quality-gate rejection (rewrite_short/copy/structure/...) is model
      // behavior, not a provider failure → propagate so the worker nudge-retries
      // on the SAME model rather than switching providers.
      if (/^rewrite_/.test(msg)) throw e;
      lastErr = msg;
      console.log(`  ℹ ${provider} failed (${msg.slice(0, 60)}) → trying next provider`);
    }
  }
  throw new Error(lastErr || 'no_provider');
}

/** Curl the resulting cvin.bio page to confirm it renders. */
async function verifyPage(job) {
  const url = jobPublicUrl({ company: job.company, external_id: job.external_id, slug: job.slug }, { base: SITE });
  if (!url) return { ok: false, url: null };
  try {
    const r = await jfetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' } }, 15000, 2);
    return { ok: r.ok, url, status: r.status };
  } catch {
    return { ok: false, url, status: 0 };
  }
}

async function updateJob(id, patch) {
  const r = await jfetch(
    `${U}/rest/v1/jobs?id=eq.${id}`,
    { method: 'PATCH', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify(patch) },
    30000,
    3
  );
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`patch_${r.status}:${t.slice(0, 160)}`);
  }
}

async function main() {
  const t0 = Date.now();
  console.log(
    `enrich-new-jobs: dry=${DRY ? 1 : 0} openai=${OPENAI_KEY ? OPENAI_MODEL : 'off'} groq=${GROQ_KEY ? GROQ_MODEL : 'off'} since=${SINCE_HOURS}h max=${MAX_JOBS} concurrency=${CONCURRENCY}`
  );

  const since = new Date(Date.now() - SINCE_HOURS * 3600 * 1000).toISOString();
  let filters = `&tags=not.cs.{"curated-jd"}&apply_url=not.is.null`;
  if (!ALL_TIME) filters += `&created_at=gt.${encodeURIComponent(since)}`;
  let jobs;
  if (POOL_LIMIT > 0) {
    // Bounded pool (fast, few REST calls) — good for trials / validating batches.
    const r = await jfetch(
      `${U}/rest/v1/jobs?select=id,title,company,company_key,location,job_type,salary,tags,apply_url,external_id,slug,description,source,dedup_hash${filters}&order=created_at.desc&limit=${POOL_LIMIT}`,
      { headers },
      60000,
      3
    );
    jobs = await r.json();
    if (!Array.isArray(jobs)) jobs = [];
  } else {
    jobs = await pageAll(
      'id,title,company,company_key,location,job_type,salary,tags,apply_url,external_id,slug,description,source,dedup_hash',
      filters + '&order=created_at.desc',
      THIN_ONLY ? 'un-curated thin pages' : 'new un-curated jobs'
    );
  }
  if (THIN_ONLY) {
    // <600-word published pages = thin descriptions. Word-count client-side so
    // we hit every un-curated page that would be below the indexable floor.
    const wc = (html) => String(html || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    const before = jobs.length;
    jobs = jobs.filter((j) => wc(j.description) < 600);
    console.log(`Thin (<600w) un-curated pages: ${jobs.length} (of ${before} un-curated)`);
  } else {
    console.log(`New un-curated jobs in last ${SINCE_HOURS}h: ${jobs.length}`);
  }
  if (jobs.length === 0) {
    console.log('Nothing to enrich. Done.');
    return;
  }

  const targets = jobs.slice(0, MAX_JOBS);
  console.log(`Processing ${targets.length} jobs…`);

  // Resume support: persist each completed job id so a crash loses nothing.
  const done = new Set();
  if (STATE_FILE) {
    try {
      for (const line of readFileSync(STATE_FILE, 'utf8').split('\n')) {
        const id = line.trim();
        if (id) done.add(id);
      }
      console.log(`Resume: ${done.size} jobs already done (from ${STATE_FILE})`);
    } catch {}
    const before = targets.length;
    for (let i = targets.length - 1; i >= 0; i--) {
      if (done.has(targets[i].id)) targets.splice(i, 1);
    }
    if (targets.length !== before) console.log(`Skipping ${before - targets.length} already-done jobs.`);
  }
  const recordDone = (id) => {
    if (!STATE_FILE) return;
    try { appendFileSync(STATE_FILE, id + '\n'); } catch {}
  };

  const stats = { ok: 0, fail: 0, short: 0, slop: 0, structure: 0, copy: 0, other: {} };
  let idx = 0;

  // ── Batched DB writes: 40k individual PATCHes is the bottleneck. Collect
  // rewritten rows and upsert WRITE_BATCH at a time (on_conflict=id). ──
  const writeQueue = [];
  let flushing = false;

  const toCompanyKey = (name) =>
    String(name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  async function writeBatch(batch) {
    // Full NOT-NULL payload required (minimal payloads make PostgREST INSERT).
    const payload = batch.map(({ job, fresh, tags }) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      source: job.source,
      external_id: job.external_id,
      dedup_hash: job.dedup_hash,
      apply_url: job.apply_url,
      slug: job.slug ?? null,
      company_key: job.company_key || toCompanyKey(job.company),
      location: job.location ?? null,
      job_type: job.job_type ?? null,
      salary: job.salary ?? null,
      category: job.category ?? null,
      tags,
      description: fresh,
    }));
    const r = await jfetch(
      `${U}/rest/v1/jobs?on_conflict=id`,
      {
        method: 'POST',
        headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(payload),
      },
      120000,
      3
    );
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`upsert_${r.status}:${t.slice(0, 160)}`);
    }
  }

  async function flushWrites() {
    if (!writeQueue.length || flushing) return;
    flushing = true;
    try {
      while (writeQueue.length) {
        const batch = writeQueue.splice(0, WRITE_BATCH);
        try {
          await writeBatch(batch);
          stats.ok += batch.length;
          for (const item of batch) recordDone(item.job.id);
        } catch (e) {
          // Batch rejected (e.g. one bad row) → fall back to per-row PATCH.
          for (const item of batch) {
            try {
              await updateJob(item.job.id, {
                description: item.fresh,
                tags: item.tags,
                company_key: item.job.company_key || toCompanyKey(item.job.company),
              });
              stats.ok++;
              recordDone(item.job.id);
            } catch (e2) {
              stats.fail++;
              if (stats.fail <= 10) console.error(`  ✗ ${item.job.id}: ${String(e2.message || e2).slice(0, 100)}`);
            }
          }
        }
        if ((stats.ok + stats.fail) % 500 === 0) {
          console.log(`  … written ok ${stats.ok} / fail ${stats.fail} (${Math.round((Date.now() - t0) / 1000)}s)`);
        }
      }
    } finally {
      flushing = false;
    }
  }

  async function worker() {
    while (true) {
      const pos = idx++;
      if (pos >= targets.length) return;
      const job = targets[pos];

      let fresh;
      try {
        const sourceText = await fetchSourceText(job);
        // Barren source (dead link + no stored body) → cannot ground a 650-word
        // page; skip rather than waste a call or let the model copy/guess.
        if (sourceText.replace(/[^a-z0-9]/gi, '').length < 80) {
          stats.fail++;
          stats.other['thin_source'] = (stats.other['thin_source'] || 0) + 1;
          continue;
        }
        try {
          fresh = await rewriteDescription(job, sourceText);
        } catch (rewriteErr) {
          const reason = String(rewriteErr.message || rewriteErr);
          // Quality-gate rejections → one free retry with a targeted nudge.
          if (/^rewrite_copy/.test(reason)) {
            fresh = await rewriteDescription(
              job,
              sourceText,
              'IMPORTANT: The previous draft was rejected for plagiarism — it copied sentences from the source. Rewrite ENTIRELY in your own words; change sentence structure completely, never reuse source wording. Keep every concrete fact. 600-900 words, exact headers.'
            );
          } else if (/^rewrite_short/.test(reason)) {
            fresh = await rewriteDescription(
              job,
              sourceText,
              'IMPORTANT: The previous draft was rejected because it was under 600 words. Write the COMPLETE page now — at least 650 words. Expand every section with concrete detail from the source: at least 8 bullets under "What you\'ll do", 6 under "Requirements", 4 under "Skills & tools". Do not stop early.'
            );
          } else {
            throw rewriteErr;
          }
        }
      } catch (e) {
        stats.fail++;
        const reason = String(e.message || e).slice(0, 60);
        if (/rewrite_short/.test(reason)) stats.short++;
        else if (/rewrite_slop/.test(reason)) stats.slop++;
        else if (/^rewrite_copy/.test(reason)) stats.copy++;
        else if (/rewrite_structure|rewrite_remote/.test(reason)) stats.structure++;
        else stats.other[reason] = (stats.other[reason] || 0) + 1;
        if (stats.fail <= 10) console.error(`  ✗ ${job.id}: ${reason}`);
        continue;
      }

      const tags = Array.isArray(job.tags) ? [...job.tags] : [];
      if (!tags.includes('curated-jd')) tags.push('curated-jd');

      if (!DRY) {
        // Enqueue for the batched writer (fast); flush picks it up.
        writeQueue.push({ job, fresh, tags });
        await flushWrites();
      } else {
        stats.ok++;
      }

      // Burst mode: skip the post-publish page curl (fastest full-cycle publish).
      // Otherwise curl the live page to confirm the fresh content renders.
      let page = { ok: true, url: '(skipped)' };
      if (!SKIP_VERIFY && !DRY) page = await verifyPage(job);
      if ((stats.ok + stats.fail) % (SKIP_VERIFY ? 500 : 10) === 0 || page.ok === false) {
        console.log(
          `  … ok ${stats.ok} / fail ${stats.fail} | page ${page.ok === false ? `FAIL(${page.status})` : 'ok'} ${job.company} — ${job.title}`
        );
        if (page.ok === false && stats.fail <= 10) {
          console.error(`     page check ${page.status} for ${page.url}`);
        }
      }
      if (stats.ok % 500 === 0) {
        console.log(`  … progress ${stats.ok}/${targets.length} (${Math.round((Date.now() - t0) / 1000)}s)`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  await flushWrites(); // drain any remaining queued writes

  console.log(`Done: ok=${stats.ok} fail=${stats.fail} (short=${stats.short}, slop=${stats.slop}, copy=${stats.copy}, structure=${stats.structure}) in ${Math.round((Date.now() - t0) / 1000)}s`);
  const top = Object.entries(stats.other).sort((a, b) => b[1] - a[1]).slice(0, 5);
  for (const [reason, n] of top) console.log(`  fail[${n}] ${reason}`);
  if (!DRY && targets.length > 0 && stats.ok === 0 && stats.fail > 0) {
    console.error('FAILED: 0 jobs rewritten — check LLM provider credits/keys (DEEPSEEK_API_KEY, OPENROUTER_API_KEY).');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('enrich-new-jobs failed:', e.message);
  process.exit(1);
});
