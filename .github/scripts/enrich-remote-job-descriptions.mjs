#!/usr/bin/env node
/**
 * Enrich remote jobs with curated JD pages (see docs/JD_PARAPHRASE_RULES.md).
 *
 * DEFAULT = MANUAL ONLY (no LLM API calls):
 *  1. Fetch official apply_url (curl/ATS APIs)
 *  2. If source is usable, write a queue pack under .github/scripts/manual-jd-queue/
 *  3. Skip curated-jd DB write — a human/agent applies JD_PARAPHRASE_RULES and publishes
 *
 * AI enrich is opt-in only: ALLOW_AI_ENRICH=1.
 * When enabled, the ONLY LLM path is OpenRouter model inclusionai/ling-2.6-flash.
 * Gemini / OpenAI / NVIDIA / Groq / Cohere / Anthropic are disabled.
 *
 * Single entry for JD rewrite + unique About-the-company blurbs:
 *   ALLOW_AI_ENRICH=1 node .github/scripts/enrich-remote-job-descriptions.mjs
 *   ALLOW_AI_ENRICH=1 ABOUT_ONLY=1 ENRICH_SINCE_HOURS=24 ...  (company blurbs only)
 *
 * Usage:
 *   BATCH_SIZE=50 node .github/scripts/enrich-remote-job-descriptions.mjs
 *   DRY_RUN=1 ...  (fetch only, no queue/DB writes)
 */
import { createRequire } from 'module';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  shouldQueueForManualEnrich,
  isFullyEnrichedJob,
  descriptionWords,
  ENRICH_MIN_WORDS,
} from './lib/job-apply-source.mjs';
import { isBannedJobTitle } from '../../src/lib/banned-jobs.mjs';
import { fellowshipPublishBlockReason } from '../../src/lib/fellowship-publish-gate.mjs';
import { runCompanyAboutPass } from './lib/enrich-company-about.mjs';
import {
  normalizeJobDescriptionForStorage,
  stripLeakedWriterInstructions,
  descriptionHasWriterLeak,
} from './lib/normalize-job-description.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

/** Manual curation is the default. AI rewrite requires explicit ALLOW_AI_ENRICH=1. */
const ALLOW_AI_ENRICH = process.env.ALLOW_AI_ENRICH === '1' || process.env.ALLOW_AI_ENRICH === 'true';
const MANUAL_QUEUE_DIR = resolve(__dirname, 'manual-jd-queue');
// AI path: drop every non-OpenRouter LLM key so leftover rewrite helpers cannot fire.
if (ALLOW_AI_ENRICH) {
  for (const name of Object.keys(process.env)) {
    if (/^(GEMINI_|OPENAI_|NVIDIA_|GROQ_|COHERE_|ANTHROPIC_)/.test(name)) {
      delete process.env[name];
    }
  }
}

const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const unquote = (v) => (v || '').replace(/"/g, '').trim();
const GEMINI_KEYS = [
  unquote(process.env.GEMINI_API_KEY),
  unquote(process.env.GEMINI_API_KEY_2),
  unquote(process.env.GEMINI_API_KEY_3),
  unquote(process.env.GEMINI_API_KEY_4),
].filter(Boolean);

const COHERE_KEYS = [
  unquote(process.env.COHERE_API_KEY),
  unquote(process.env.COHERE_API_KEY_2),
  unquote(process.env.COHERE_API_KEY_3),
  unquote(process.env.COHERE_API_KEY_4),
  unquote(process.env.COHERE_API_KEY_5),
].filter(Boolean);

const GROQ_KEYS = [
  unquote(process.env.GROQ_API_KEY),
  unquote(process.env.GROQ_API_KEY_2),
].filter(Boolean);
// dotenv reloads .env.local after shell unset — honor SKIP_OPENAI / GEMINI_NVIDIA_ONLY
const SKIP_OPENAI =
  process.env.SKIP_OPENAI === '1' ||
  process.env.SKIP_OPENAI === 'true' ||
  process.env.GEMINI_NVIDIA_ONLY === '1' ||
  process.env.GEMINI_NVIDIA_ONLY === 'true';
const OPENAI_KEYS = SKIP_OPENAI
  ? []
  : [
      unquote(process.env.OPENAI_API_KEY),
      unquote(process.env.OPENAI_API_KEY_2),
      unquote(process.env.OPENAI_API_KEY_3),
      unquote(process.env.OPENAI_API_KEY_4),
    ].filter(Boolean);
if (SKIP_OPENAI) {
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY_2;
  delete process.env.OPENAI_API_KEY_3;
  delete process.env.OPENAI_API_KEY_4;
}
const NVIDIA_KEYS = [
  unquote(process.env.NVIDIA_API_KEY),
  unquote(process.env.NVIDIA_API_KEY_2),
  unquote(process.env.NVIDIA_API_KEY_3),
].filter(Boolean);
// OpenAI-compatible NIM / integrate.api.nvidia.com
const NVIDIA_BASE = (process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/$/, '');
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b';
const OPENROUTER_KEYS = [
  unquote(process.env.OPENROUTER_API_KEY),
  unquote(process.env.OPENROUTER_API_KEY_2),
  unquote(process.env.OPENROUTER_API_KEY_3),
].filter(Boolean);
const OPENROUTER_BASE = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
// Locked — do not read OPENROUTER_MODEL; this is the only rewrite model.
const OPENROUTER_MODEL = 'inclusionai/ling-2.6-flash';
const ANTHROPIC_KEY = unquote(process.env.ANTHROPIC_API_KEY);
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-5';
const BATCH_SIZE = Math.max(1, Number(process.env.BATCH_SIZE || 500));
const BATCH_NUM = Math.max(1, Number(process.env.BATCH_NUM || 1));
const DRY_RUN = process.env.DRY_RUN === '1';
const ABOUT_ONLY = process.env.ABOUT_ONLY === '1' || process.env.ABOUT_ONLY === 'true';
// TURBO=1: max parallel, mini model, no sleep, keep existing pretty slugs
const TURBO = process.env.TURBO === '1';
// Hard cap high so one machine can saturate API keys (429s self-throttle)
const CONCURRENCY = Math.max(1, Math.min(TURBO ? 2048 : 1024, Number(process.env.CONCURRENCY || 4)));
const WORKERS = Math.max(1, Number(process.env.WORKERS || 1));
const WORKER_ID = Math.max(0, Number(process.env.WORKER_ID || 0)) % WORKERS;
const CONTINUOUS = process.env.CONTINUOUS === '1';
const RETRY_ONLY = process.env.RETRY_ONLY === '1';
const LINKEDIN_ONLY = process.env.LINKEDIN_ONLY === '1';
const RE_ENRICH = process.env.RE_ENRICH === '1';
const MIN_REWRITE_WORDS = ENRICH_MIN_WORDS;
const MAX_REWRITE_WORDS = 900;
/** Originality / adequacy knobs (docs/JD_PARAPHRASE_RULES.md). */
const GATE = {
  maxLcsWords: 10, // fail if shared contiguous words >= 11 (after slot mask)
  max5gramJaccard: 0.12,
  maxRepair: 1,
  // Never publish a page that still matches the ATS after repair.
  originalitySoft: false,
};
const OPENAI_FAST_MODEL = process.env.OPENAI_FAST_MODEL || 'gpt-4o-mini';
// TURBO scrapes must fail fast — long LinkedIn/HTML retries were killing throughput (~20 ok/min).
const SCRAPE_MS = TURBO ? 4000 : 15000;
const HTML_MS = TURBO ? 4000 : 20000;
const PERMANENT_REASONS = new Set([
  'posting_older_than_30d',
  'html_blocked',
  'rewrite_slop',
  'no_company',
  'unsupported',
  'source_thin',
  'invented_facts',
]);
const STATE_PATH = resolve(
  __dirname,
  WORKERS > 1 ? `enrich-remote-jd-state-w${WORKER_ID}.json` : 'enrich-remote-jd-state.json'
);
const headers = { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' };

function shardOf(id) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % WORKERS;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── permanent unenrichable detection + live DB purge ─────────────────── *
 * Jobs that can never become a curated-jd page (dead board, thin source,
 * expired posting, or a rewrite that failed quality gates) are deleted from
 * the jobs table as soon as the enrich step confirms it, so later runs and
 * the daily index never re-scrape them. Enriched (curated-jd) rows and any
 * apply_url that was posted to Telegram are NEVER deleted, matching
 * cleanup-old-jobs.mjs / purge-unenrichable-jobs.mjs protections. */
const PERMANENT_UNENRICHABLE_REASONS = new Set([
  // dead boards
  'ashby_not_found', 'gh_404', 'lever_404', 'sr_404', 'linkedin_404',
  'html_404', 'html_410', 'html_blocked', 'html_403', 'dead_board',
  // thin source
  'source_thin', 'html_short', 'gh_short', 'lever_short', 'ashby_short', 'fact_sheet_parse',
  // expired
  'posting_older_than_30d',
  // unroutable
  'no_company', 'unsupported',
  // rewrite / quality rejects
  'rewrite_slop', 'rewrite_short', 'rewrite_structure', 'rewrite_long', 'invented_facts',
]);

let telegramProtectedUrlsCache = null;
function telegramProtectedUrls() {
  if (telegramProtectedUrlsCache) return telegramProtectedUrlsCache;
  const set = new Set();
  const p = resolve(__dirname, '.telegram-ai-jobs-posted.json');
  if (existsSync(p)) {
    try {
      const raw = JSON.parse(readFileSync(p, 'utf8'));
      for (const u of Array.isArray(raw) ? raw : []) {
        set.add(normUrlForProtection(u));
      }
    } catch {
      /* ignore */
    }
  }
  telegramProtectedUrlsCache = set;
  return set;
}
function normUrlForProtection(u) {
  return String(u || '')
    .toLowerCase()
    .split('?')[0]
    .split('#')[0]
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '');
}

function isPermanentUnenrichableReason(reason) {
  const r = String(reason || '');
  if (/429|rate|timeout|timed out|aborted|fetch failed|openrouter|gemini|all_providers_failed|5\d\d/i.test(r)) return false;
  return PERMANENT_UNENRICHABLE_REASONS.has(r) || PERMANENT_UNENRICHABLE_REASONS.has(r.split(/[:]/)[0]);
}

/** Delete a single unenrichable job row (fire-and-forget), never curated/telegram. */
async function purgeJobRow(job) {
  if (DRY_RUN) return false;
  if (!job || !job.id || !U || !K) return false;
  const tags = Array.isArray(job.tags) ? job.tags : [];
  if (tags.includes('curated-jd')) return false;
  if (telegramProtectedUrls().has(normUrlForProtection(job.apply_url))) return false;
  try {
    await fetch(`${U}/rest/v1/jobs?id=eq.${job.id}`, {
      method: 'DELETE',
      headers,
      signal: AbortSignal.timeout(30000),
    });
    return true;
  } catch {
    return false;
  }
}

function decodeHtmlEntities(s) {
  return String(s || '')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ');
}

function companyToSlug(company) {
  return decodeHtmlEntities(company)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isRemote(j) {
  const s = `${j.location || ''} ${(j.tags || []).join(' ')} ${j.title || ''} ${j.job_type || ''}`.toLowerCase();
  return /\bremote\b|work from home|\bwfh\b|distributed|anywhere|fully remote|remote-first|remote first/.test(s);
}

/** UTM suffixes + app routes — never emit these as standalone job slug segments. */
const RESERVED_SLUGS = new Set([
  'th', 'wa', 'tg', 'li', 'x', 'tw', 'ig', 'fb', 'bsky', 'yt', 'rd',
  'api', 'editor', 'login', 'signup', 'jobs', 'fellowships', 'blog', 'admin',
]);

/**
 * Short pretty slug only (must match mint-slugs.mjs):
 *  - 1–2 tokens; 1-token ≤12; 2 semantic tokens total ≤8
 *  - collision form: `{head≤6}-{2hex}`
 */
function isPrettyExternalId(company, externalId) {
  if (!externalId) return false;
  const co = companyToSlug(company);
  if (!co) return false;
  const prefix = `${co}_`;
  if (!externalId.toLowerCase().startsWith(prefix)) return false;
  const rest = externalId.slice(prefix.length).toLowerCase();
  if (RESERVED_SLUGS.has(rest)) return false;
  if (!/^[a-z0-9][a-z0-9-]{0,23}$/.test(rest)) return false;
  if (/^[0-9a-f]{8,}$/.test(rest)) return false;
  if (rest.length > 12 && /^\d+$/.test(rest)) return false;
  const parts = rest.split('-').filter(Boolean);
  if (parts.length === 0 || parts.length > 2) return false;
  if (parts.length === 1) return parts[0].length <= 12;
  if (/^[0-9a-f]{2,4}$/.test(parts[1])) return parts[0].length <= 6;
  return rest.length <= 8;
}

/**
 * Already live on site as /{company}/{slug}. Never remint these during RE_ENRICH —
 * Telegram (@hashtag_ai / techjobsdaily) posts these URLs; reminting = permanent 404.
 */
function isRouteableExternalId(company, externalId) {
  if (!externalId) return false;
  const co = companyToSlug(company);
  if (!co) return false;
  const prefix = `${co}_`;
  if (!externalId.toLowerCase().startsWith(prefix)) return false;
  const rest = externalId.slice(prefix.length).toLowerCase();
  if (RESERVED_SLUGS.has(rest)) return false;
  if (!/^[a-z0-9][a-z0-9-]{0,23}$/.test(rest)) return false;
  if (/^[0-9a-f]{8,}$/.test(rest)) return false;
  return true;
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function classifyApplyUrl(url) {
  if (!url) return { kind: 'none' };
  let u;
  try {
    u = new URL(url);
  } catch {
    return { kind: 'none' };
  }
  const host = u.hostname.replace(/^www\./, '');
  const path = u.pathname;

  // Greenhouse
  let m = host.match(/greenhouse\.io$/) && path.match(/\/([^/]+)\/jobs\/(\d+)/);
  if (m) return { kind: 'greenhouse', board: m[1], id: m[2] };
  m = host.includes('greenhouse') && (url.match(/[?&]gh_jid=(\d+)/) || url.match(/jid=(\d+)/));
  if (m) {
    const board = url.match(/greenhouse\.io\/([^/?#]+)/)?.[1] || url.match(/greenhouse\.io\/([^/?#]+)/)?.[1];
    const board2 = url.match(/(?:boards|job-boards)(?:\.eu)?\.greenhouse\.io\/([^/?#]+)/)?.[1];
    return { kind: 'greenhouse', board: board2 || board || null, id: m[1] };
  }

  // Ashby
  m = host.includes('ashbyhq.com') && path.match(/\/([^/]+)\/([0-9a-f-]{36})/i);
  if (m) return { kind: 'ashby', board: m[1], id: m[2] };

  // Lever
  m = host.includes('lever.co') && path.match(/\/([^/]+)\/([0-9a-f-]{36})/i);
  if (m) return { kind: 'lever', board: m[1], id: m[2] };

  // SmartRecruiters
  m = host.includes('smartrecruiters.com') && path.match(/\/([^/]+)\/(\d+)/);
  if (m) return { kind: 'smartrecruiters', board: m[1], id: m[2] };

  // LinkedIn
  m = host.includes('linkedin.com') && (url.match(/\/jobs\/view\/.*?(\d{8,})/i) || url.match(/\/jobs\/view\/(\d{8,})/i) || url.match(/[?&]currentJobId=(\d{8,})/i) || path.match(/(\d{8,})/));
  if (m) return { kind: 'linkedin', id: m[1] };

  // Skip known-bad / thin aggregators
  if (
    /jooble\.org|jobviewtrack\.com|adzuna\.|indeed\.|glassdoor\.|ziprecruiter\.|theguardian\.|reed\.co\.uk|totaljobs\.|cv-library\./i.test(
      host
    )
  ) {
    return { kind: 'skip' };
  }

  return { kind: 'html', url };
}

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Scrape a job page as raw HTML: JSON-LD first, then SPA embedded JSON, then text.
async function scrapeAsHtml(url) {
  let current = url;
  const maxHops = TURBO ? 1 : 4;
  for (let hop = 0; hop < maxHops; hop++) {
    if (hop > 0 && !TURBO) await sleep(300);
    let r;
    try {
      r = await jfetch(
        current,
        {
          redirect: 'follow',
          headers: {
            'User-Agent': BROWSER_UA,
            Accept: 'text/html,application/xhtml+xml',
          },
        },
        HTML_MS
      );
    } catch (e) {
      return { ok: false, reason: `err_${e.name || 'fetch'}` };
    }
    if ([403, 429, 503].includes(r.status)) {
      if (TURBO) return { ok: false, reason: `html_${r.status}` };
      await sleep(1500);
      try {
        r = await jfetch(
          current,
          {
            redirect: 'follow',
            headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html,application/xhtml+xml', Referer: 'https://www.google.com/' },
          },
          25000
        );
      } catch (e) {
        return { ok: false, reason: `err_${e.name || 'fetch'}` };
      }
    }
    if (!r.ok) {
      if (!TURBO && r.status !== 404 && r.status !== 410) {
        const wb = await waybackExtract(url);
        if (wb) return wb;
      }
      return { ok: false, reason: `html_${r.status}` };
    }
    const html = await r.text();
    if (/cf-browser-verification|captcha|access denied|login to continue/i.test(html) && html.length < 8000) {
      if (!TURBO) {
        const wb = await waybackExtract(url);
        if (wb) return wb;
      }
      return { ok: false, reason: 'html_blocked' };
    }
    const extracted = extractFromHtml(html);
    if (extracted.ok) return extracted;
    if (extracted.reason === 'html_short' && !TURBO) {
      const target = resolveRedirectShell(html);
      if (target) {
        current = target;
        continue;
      }
    }
    return extracted;
  }
  return { ok: false, reason: 'html_too_many_redirects' };
}

function extractFromHtml(html) {
  const ld = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const match of ld) {
    try {
      const data = JSON.parse(match[1]);
      const nodes = Array.isArray(data) ? data : data['@graph'] || [data];
      for (const n of nodes) {
        if (n && /JobPosting/i.test(String(n['@type'] || ''))) {
          const text = stripHtml(n.description || '');
          if (text.length >= 280) {
            return {
              ok: true,
              text,
              extras: {
                location: n.jobLocation?.address?.addressLocality || n.jobLocationType,
                salary: n.baseSalary,
              },
            };
          }
        }
      }
    } catch {
      /* ignore bad json-ld */
    }
  }
  const embedded = extractEmbeddedJson(html);
  if (embedded) return { ok: true, text: embedded, extras: {} };
  const text = stripHtml(html).slice(0, 20000);
  if (text.length < 400) return { ok: false, reason: 'html_short' };
  if (text.length > 400 && text.split(/\s+/).length < 80) return { ok: false, reason: 'html_thin' };
  return { ok: true, text: text.slice(0, 14000), extras: {} };
}

function resolveRedirectShell(html) {
  const meta = html.match(/<meta[^>]+http-equiv=["']?refresh["']?[^>]*content=["']?[^"']*url=([^"'>]+)/i);
  if (meta) return meta[1].trim().replace(/&amp;/g, '&');
  const loc = html.match(/(?:window\.|top\.|document\.|self\.)?location(?:\.(?:href|replace|assign))?\s*=\s*["'](https?:\/\/[^"']+)["']/i);
  if (loc) return loc[1].replace(/&amp;/g, '&');
  return null;
}

async function waybackExtract(url) {
  try {
    await sleep(500);
    const cdx = await jfetch(
      `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&fl=timestamp,original,statuscode&filter=statuscode:200&collapse=digest&limit=5`,
      { headers: { 'User-Agent': 'cvin-jd-enrich/1.0 (+https://cvin.bio)' } },
      20000
    );
    if (!cdx.ok) return null;
    const rows = await cdx.json();
    if (!Array.isArray(rows) || rows.length < 2) return null;
    const original = rows[rows.length - 1][1];
    await sleep(500);
    const r = await jfetch(
      `https://web.archive.org/web/2id_/${original}`,
      { redirect: 'follow', headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html,application/xhtml+xml' } },
      25000
    );
    if (!r.ok) return null;
    const out = extractFromHtml(await r.text());
    if (!out.ok) return null;
    return { ok: true, text: out.text, extras: out.extras };
  } catch {
    return null;
  }
}

const ashbyBoardCache = new Map();

// SPA pages ship the job description inside embedded JSON state. Try to pull a
// long, sentence-like string out of it (Next.js __NEXT_DATA__, window.__STATE__
// etc.) that looks like a real job description.
function extractEmbeddedJson(html) {
  const blocks = [];
  const scriptRe = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = scriptRe.exec(html)) !== null) blocks.push(m[1]);

  const candidates = [];
  for (const block of blocks) {
    let json = null;
    if (/__NEXT_DATA__|__INITIAL_STATE__|__APP_STATE__|__PRELOADED_STATE__|__SERVER_STATE__|__DATA__/i.test(block)) {
      const inner = block.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
      const raw = inner ? inner[1] : block;
      const stripped = raw.replace(/^\s*\w+\s*=\s*/, '').replace(/;?\s*$/, '').replace(/^JSON\.parse\(\s*['"]/, '').replace(/['"]\s*\)\s*;?\s*$/, '');
      try { json = JSON.parse(stripped); } catch (e) {}
      if (!json && /JSON\.parse/.test(raw)) {
        const q = raw.match(/JSON\.parse\(\s*['"]([\s\S]*?)['"]\s*\)/i);
        if (q) { try { json = JSON.parse(q[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\')); } catch (e) {} }
      }
      if (!json) {
        const brace = raw.indexOf('{');
        if (brace >= 0) {
          try { json = JSON.parse(raw.slice(brace)); } catch (e) {}
        }
      }
    } else {
      const brace = block.indexOf('{');
      const eq = block.indexOf('=');
      const start = eq >= 0 && brace >= 0 ? Math.min(brace, eq + 1) : Math.max(brace, eq + 1);
      if (brace >= 0) {
        try { json = JSON.parse(block.slice(brace)); } catch (e) {}
      }
    }
    if (!json) continue;

    const strings = [];
    const walk = (node) => {
      if (typeof node === 'string') {
        if (node.length >= 600) strings.push(node);
      } else if (Array.isArray(node)) {
        node.forEach(walk);
      } else if (node && typeof node === 'object') {
        Object.values(node).forEach(walk);
      }
    };
    walk(json);
    const jdLike = strings
      .filter((s) => /(responsibilities|requirements|qualifications|about the (role|job|position)|what you'?ll do|what you will do|the role|we are looking for|you will|experience|skills)/i.test(s))
      .sort((a, b) => b.length - a.length);
    if (jdLike.length) candidates.push(jdLike[0]);
  }

  // Next.js App Router ships the page content in the flight stream as escaped
  // quoted strings (self.__next_f.push([1,"\u003ch2\u003e..."])). Extract them.
  const quoted = [];
  const unesc = (s) =>
    s
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  for (const block of blocks) {
    const qRe = /"(?:[^"\\]|\\.)*"/g;
    let qm;
    while ((qm = qRe.exec(block)) !== null) {
      const s = unesc(qm[0].slice(1, -1));
      if (s.length >= 600) quoted.push(s);
    }
  }
  const htmlCands = quoted
    .filter((s) => /<p[ >]/.test(s) && /<\/p>/.test(s) && /<h[1-4][ >]/.test(s) && /<\/h[1-4]>/.test(s))
    .filter((s) => /(About the Role|Responsibilities|Requirements|Qualifications|What you'?ll do|What You Will Do|You Will|We are looking for)/i.test(s))
    .map((s) => ({ tags: (s.match(/<p[ >]/g) || []).length, text: stripHtml(s) }))
    .filter((x) => x.text.length >= 400)
    .sort((a, b) => b.tags - a.tags || b.text.length - a.text.length);
  if (htmlCands.length) {
    const best = htmlCands[0];
    if (best.text.length >= 280) return best.text.slice(0, 14000);
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => b.length - a.length);
  const best = candidates[0];
  const text = stripHtml(best);
  if (text.length < 280) return null;
  return text.slice(0, 14000);
}

const jfetch = (url, opts = {}, ms = SCRAPE_MS) =>
  fetch(url, { ...opts, signal: opts.signal || AbortSignal.timeout(ms) });

async function fetchAshbyBoard(board) {
  if (ashbyBoardCache.has(board)) return ashbyBoardCache.get(board);
  const r = await jfetch(
    `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board)}?includeCompensation=true`,
    { headers: { 'User-Agent': 'cvin-jd-enrich/1.0' } }
  );
  if (!r.ok) {
    ashbyBoardCache.set(board, null);
    return null;
  }
  const data = await r.json();
  const map = new Map();
  for (const j of data.jobs || []) map.set(j.id, j);
  ashbyBoardCache.set(board, map);
  return map;
}

async function fetchSourceText(job) {
  const meta = classifyApplyUrl(job.apply_url);
  if (meta.kind === 'none' || meta.kind === 'skip') return { ok: false, reason: meta.kind || 'skip' };

  try {
    const thirtyDaysAgoMs = Date.now() - 30 * 24 * 60 * 60 * 1000;

    if (meta.kind === 'greenhouse' && meta.board && meta.id) {
      const r = await jfetch(
        `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(meta.board)}/jobs/${meta.id}`,
        { headers: { 'User-Agent': 'cvin-jd-enrich/1.0' } }
      );
      if (!r.ok) {
        const fb = await scrapeAsHtml(job.apply_url);
        if (fb.ok) return fb;
        return { ok: false, reason: `gh_${r.status}` };
      }
      const d = await r.json();
      const publishedAt = d.updated_at || d.created_at;
      if (publishedAt && new Date(publishedAt).getTime() < thirtyDaysAgoMs) {
        return { ok: false, reason: 'posting_older_than_30d' };
      }
      const text = stripHtml(d.content || '');
      if (text.length < 280) return { ok: false, reason: 'gh_short' };
      return {
        ok: true,
        text,
        extras: {
          publishedAt,
          location: d.location?.name,
          departments: (d.departments || []).map((x) => x.name).filter(Boolean),
        },
      };
    }

    if (meta.kind === 'ashby' && meta.board && meta.id) {
      const map = await fetchAshbyBoard(meta.board);
      let j = map?.get(meta.id);
      if (!j) {
        const fb = await scrapeAsHtml(job.apply_url);
        if (fb.ok) return fb;
        return { ok: false, reason: 'ashby_not_found' };
      }
      const publishedAt = j.publishedAt;
      if (publishedAt && new Date(publishedAt).getTime() < thirtyDaysAgoMs) {
        return { ok: false, reason: 'posting_older_than_30d' };
      }
      const text = stripHtml(j.descriptionHtml || j.descriptionPlain || '');
      if (text.length < 280) return { ok: false, reason: 'ashby_short' };
      return {
        ok: true,
        text,
        extras: {
          publishedAt,
          location: j.location,
          employmentType: j.employmentType,
          department: j.department,
          compensation: j.compensation,
          workplaceType: j.workplaceType,
        },
      };
    }

    if (meta.kind === 'lever' && meta.board && meta.id) {
      const r = await jfetch(
        `https://api.lever.co/v0/postings/${encodeURIComponent(meta.board)}/${meta.id}`,
        { headers: { 'User-Agent': 'cvin-jd-enrich/1.0' } }
      );
      if (!r.ok) {
        const fb = await scrapeAsHtml(job.apply_url);
        if (fb.ok) return fb;
        return { ok: false, reason: `lever_${r.status}` };
      }
      const d = await r.json();
      const publishedAt = d.createdAt ? new Date(d.createdAt).toISOString() : null;
      if (d.createdAt && d.createdAt < thirtyDaysAgoMs) {
        return { ok: false, reason: 'posting_older_than_30d' };
      }
      const lists = (d.lists || [])
        .map((l) => `${l.text || ''}\n${stripHtml(l.content || '')}`)
        .join('\n\n');
      const text = [d.descriptionPlain || stripHtml(d.description || ''), d.additionalPlain || '', lists]
        .filter(Boolean)
        .join('\n\n')
        .trim();
      if (text.length < 280) return { ok: false, reason: 'lever_short' };
      return {
        ok: true,
        text,
        extras: {
          publishedAt,
          location: d.categories?.location,
          commitment: d.categories?.commitment,
          team: d.categories?.team,
          salary: d.salaryRange || d.salaryDescription,
        },
      };
    }

    if (meta.kind === 'smartrecruiters' && meta.board && meta.id) {
      const r = await jfetch(
        `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(meta.board)}/postings/${meta.id}`,
        { headers: { 'User-Agent': 'cvin-jd-enrich/1.0' } }
      );
      if (!r.ok) {
        const fb = await scrapeAsHtml(job.apply_url);
        if (fb.ok) return fb;
        return { ok: false, reason: `sr_${r.status}` };
      }
      const d = await r.json();
      const publishedAt = d.releasedDate;
      if (publishedAt && new Date(publishedAt).getTime() < thirtyDaysAgoMs) {
        return { ok: false, reason: 'posting_older_than_30d' };
      }
      const sections = d.jobAd?.sections || {};
      const text = stripHtml(
        [
          sections.jobDescription?.text,
          sections.qualifications?.text,
          sections.additionalInformation?.text,
          sections.companyDescription?.text,
        ]
          .filter(Boolean)
          .join('\n\n')
      );
      if (text.length < 280) return { ok: false, reason: 'sr_short' };
      return { ok: true, text, extras: { publishedAt, location: d.location?.city } };
    }

    if (meta.kind === 'linkedin' && meta.id) {
      // TURBO: one attempt only (3–26s LinkedIn retry loops destroyed fleet throughput)
      let r = await jfetch(
        `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${meta.id}`,
        {
          headers: {
            'User-Agent': BROWSER_UA,
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        },
        SCRAPE_MS
      );
      if (r.status === 429 && !TURBO) {
        for (const delay of [3000, 8000, 15000]) {
          await sleep(delay);
          const retry = await jfetch(
            `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${meta.id}`,
            {
              headers: {
                'User-Agent': BROWSER_UA,
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
              },
            },
            20000
          );
          if (retry.ok) { r = retry; break; }
          if (retry.status !== 429) { r = retry; break; }
        }
      }
      if (!r.ok) {
        const wb = await waybackExtract(job.apply_url);
        if (wb?.ok) return { ...wb, via: 'linkedin_wayback' };
        return { ok: false, reason: `linkedin_${r.status}` };
      }
      const html = await r.text();
      // Prefer employer apply URL embedded on LinkedIn when present (real ATS body)
      const applyHref =
        html.match(/href="(https?:\/\/[^"]+(?:lever\.co|ashbyhq\.com|greenhouse\.io|smartrecruiters\.com|workable\.com)[^"]*)"/i)?.[1] ||
        html.match(/data-tracking-control-name="public_jobs_apply_link_top_link"[^>]*href="(https?:\/\/[^"]+)"/i)?.[1];
      if (applyHref) {
        try {
          const decoded = applyHref.replace(/&amp;/g, '&');
          if (!/linkedin\.com/i.test(decoded)) {
            const nested = await fetchSourceText({ ...job, apply_url: decoded });
            if (nested.ok) return { ...nested, via: 'linkedin_external_apply', external_apply: decoded };
          }
        } catch {
          /* fall through */
        }
      }
      const match = html.match(/<div class=\"show-more-less-html__markup[^\"]*\">([\s\S]*?)<\/div>/i);
      if (!match) {
        const wb = await waybackExtract(job.apply_url);
        if (wb?.ok) return { ...wb, via: 'linkedin_wayback' };
        return { ok: false, reason: 'linkedin_no_markup' };
      }
      const text = stripHtml(match[1]);
      if (text.length < 280) {
        const wb = await waybackExtract(job.apply_url);
        if (wb?.ok) return { ...wb, via: 'linkedin_wayback' };
        return { ok: false, reason: 'linkedin_short' };
      }

      let location = null;
      const locMatch = html.match(/class=\"topcard__flavor topcard__flavor--bullet\">([^<]+)<\/span>/i);
      if (locMatch) location = stripHtml(locMatch[1]);

      let publishedAt = null;
      const dateMatch = html.match(/datetime=\"([^\"]+)\"/i);
      if (dateMatch && dateMatch[1].includes('-')) publishedAt = dateMatch[1];
      if (publishedAt && new Date(publishedAt).getTime() < thirtyDaysAgoMs) {
        return { ok: false, reason: 'posting_older_than_30d' };
      }

      return {
        ok: true,
        text,
        extras: {
          publishedAt,
          location,
        },
      };
    }

    if (meta.kind === 'html') {
      return await scrapeAsHtml(meta.url);
    }
  } catch (e) {
    return { ok: false, reason: `err_${e.name || 'fetch'}` };
  }

  return { ok: false, reason: 'unsupported' };
}

const SLUG_STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'for', 'to', 'in', 'on', 'at', 'by', 'with',
  'from', 'as', 'is', 'are', 'be', 'remote', 'full', 'time', 'fulltime', 'part',
  'contract', 'intern', 'internship', 'senior', 'junior', 'staff', 'principal',
  'i', 'ii', 'iii', 'iv', 'sr', 'jr', 'us', 'uk', 'eu', 'emea', 'apac', 'americas',
  'month', 'months', 'fixed', 'term', 'temporary', 'opening', 'role', 'position',
  'opportunity', 'new', 'based',
]);

/** Compress common title words into short meaningful tokens (never mid-word cut). */
const SLUG_ALIAS = {
  software: 'sw',
  engineer: 'eng',
  engineering: 'eng',
  engineers: 'eng',
  manager: 'mgr',
  management: 'mgmt',
  director: 'dir',
  product: 'prod',
  platform: 'plat',
  developer: 'dev',
  development: 'dev',
  designer: 'design',
  design: 'design',
  analyst: 'analyst',
  analytics: 'analytics',
  scientist: 'sci',
  science: 'sci',
  specialist: 'spec',
  operations: 'ops',
  operator: 'ops',
  technical: 'tech',
  technology: 'tech',
  solutions: 'sol',
  solution: 'sol',
  architect: 'arch',
  architecture: 'arch',
  infrastructure: 'infra',
  security: 'sec',
  compliance: 'comply',
  marketing: 'mkt',
  sales: 'sales',
  customer: 'cust',
  support: 'support',
  research: 'research',
  machine: 'ml',
  learning: null, // with machine → ml
  artificial: 'ai',
  intelligence: null,
  frontend: 'fe',
  backend: 'be',
  fullstack: 'fullstk',
  'full-stack': 'fullstk',
  mobile: 'mobile',
  data: 'data',
  cloud: 'cloud',
  devops: 'devops',
  reliability: 'sre',
  site: null,
  lead: 'lead',
  head: 'head',
  vice: 'vp',
  president: null,
  associate: 'assoc',
  assistant: 'asst',
  coordinator: 'coord',
  consultant: 'consult',
  partner: 'partner',
  account: 'acct',
  finance: 'fin',
  financial: 'fin',
  accounting: 'acct',
  legal: 'legal',
  people: 'people',
  human: 'hr',
  resources: null,
  recruiter: 'recruit',
  recruiting: 'recruit',
  growth: 'growth',
  revenue: 'rev',
  strategy: 'strat',
  strategic: 'strat',
  business: 'biz',
  program: 'prog',
  project: 'proj',
  network: 'net',
  systems: 'sys',
  system: 'sys',
  application: 'app',
  applications: 'app',
  quality: 'qa',
  assurance: null,
  testing: 'qa',
  automation: 'auto',
  healthcare: 'health',
  health: 'health',
  clinical: 'clinic',
  medical: 'med',
  generaliste: 'gp',
  medecin: 'md',
  médecin: 'md',
};

function prettyJobSlug(title, uniqueSeed, used) {
  const tokens = String(title || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/r\s*&\s*d|\br\s+and\s+d\b/gi, ' rd ')
    .replace(/ai\s*[&/]\s*ml/gi, ' ai ml ')
    .replace(/full[\s-]*stack/gi, ' fullstack ')
    .replace(/front[\s-]*end/gi, ' frontend ')
    .replace(/back[\s-]*end/gi, ' backend ')
    .replace(/&/g, ' ')
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !/^\d+$/.test(t) && t.length < 18);

  const out = [];
  for (let i = 0; i < tokens.length; i++) {
    let t = tokens[i];
    if (SLUG_STOP.has(t)) continue;
    if (Object.prototype.hasOwnProperty.call(SLUG_ALIAS, t)) {
      const a = SLUG_ALIAS[t];
      if (a == null) continue;
      t = a;
    }
    // machine + learning → already aliased machine=ml, skip learning
    if (out.includes(t)) continue;
    const next = out.length ? `${out.join('-')}-${t}` : t;
    // SHORT slugs: max 2 tokens; 2-token job slug ≤ 8 chars
    if (out.length >= 1 && next.length > 8) break;
    out.push(t);
    if (out.length >= 2) break;
  }

  let base = out.join('-') || 'role';
  if (base.length > 12) {
    const parts = base.split('-');
    while (parts.length > 1 && parts.join('-').length > 12) parts.pop();
    base = parts.join('-');
    if (base.length > 12) base = base.slice(0, 12);
  }
  base = base.replace(/-+/g, '-').replace(/^-|-$/g, '') || 'role';

  let slug = base;
  // Collisions + reserved path segments (UTM suffixes / app routes) → disambiguate
  if (used.has(slug) || RESERVED_SLUGS.has(slug)) {
    const h = createHash('md5').update(String(uniqueSeed)).digest('hex').slice(0, 2);
    const first = (base.split('-')[0] || 'role').slice(0, 6);
    slug = `${first}-${h}`;
  }
  let n = 2;
  while (
    used.has(slug) ||
    RESERVED_SLUGS.has(slug) ||
    !/^[a-z0-9][a-z0-9-]{0,23}$/.test(slug)
  ) {
    const h = createHash('md5').update(`${uniqueSeed}:${n++}`).digest('hex').slice(0, 2);
    const head = (base.split('-')[0] || 'role').slice(0, 6);
    slug = `${head}-${h}`;
  }
  used.add(slug);
  return slug;
}

function isCvinStubText(text) {
  const t = String(text || '');
  return /listed on CVin\.Bio|original summary prepared by CVin\.Bio/i.test(t);
}

function usableSourceText(text) {
  const t = String(text || '').trim();
  if (!t || isCvinStubText(t)) return false;
  const words = t.split(/\s+/).filter(Boolean).length;
  return words >= 80 || t.length >= 400;
}

function normalizeTokens(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9+\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

function ngrams(tokens, n) {
  const out = [];
  for (let i = 0; i <= tokens.length - n; i++) out.push(tokens.slice(i, i + n).join(' '));
  return out;
}

function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  if (!A.size && !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

/** Word-level longest contiguous common subsequence length. */
function contiguousLcsWords(aTokens, bTokens) {
  let a = aTokens;
  let b = bTokens;
  if (a.length > b.length) [a, b] = [b, a];
  let prev = new Array(a.length + 1).fill(0);
  let best = 0;
  for (const x of b) {
    const cur = [0];
    for (let j = 0; j < a.length; j++) {
      const v = x === a[j] ? prev[j] + 1 : 0;
      cur.push(v);
      if (v > best) best = v;
    }
    prev = cur;
  }
  return best;
}

function maskSlotSpans(text, sheet) {
  let out = String(text || '');
  const slots = Array.isArray(sheet?.slots) ? sheet.slots : [];
  for (const slot of slots) {
    const v = String(slot?.value || '').trim();
    if (v.length >= 2) {
      const re = new RegExp(v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      out = out.replace(re, ' SLOT ');
    }
  }
  for (const v of [...(sheet?.skills || []), ...(sheet?.systems || []), ...(sheet?.comp_notes || [])]) {
    const s = String(v || '').trim();
    if (s.length >= 3) {
      const re = new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      out = out.replace(re, ' SLOT ');
    }
  }
  return out;
}

function buildMetaBits(job, extras) {
  return [
    `Company: ${job.company}`,
    `Title: ${job.title}`,
    job.location ? `Listed location: ${job.location}` : null,
    job.job_type ? `Job type: ${job.job_type}` : null,
    job.salary ? `Listed salary: ${job.salary}` : null,
    extras?.department ? `Department: ${extras.department}` : null,
    extras?.employmentType ? `Employment: ${extras.employmentType}` : null,
    extras?.workplaceType ? `Workplace: ${extras.workplaceType}` : null,
    extras?.compensation
      ? `Compensation JSON: ${JSON.stringify(extras.compensation).slice(0, 400)}`
      : null,
    job.apply_url ? `Apply URL: ${job.apply_url}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

function buildExtractPrompt(job, sourceText, extras) {
  return `You extract a Fact Sheet JSON for a job posting. Output JSON only (no markdown).

Schema:
{
  "meta": {
    "title": "", "company": "", "location": "",
    "workplace": "remote|hybrid|onsite|unknown",
    "engagement": "", "salary_raw": "",
    "team": "", "department": "", "apply_url": ""
  },
  "slots": [{ "type": "years|salary|skill|location|visa|product|method|other", "value": "exact string" }],
  "duties": ["telegraphic note"],
  "must_have": ["telegraphic note"],
  "nice_to_have": ["telegraphic note"],
  "skills": ["method or tool tokens only"],
  "systems": ["products/platforms named in posting, not soft skills"],
  "constraints": ["visa, clearance, onsite days, etc"],
  "comp_notes": ["exact pay bands and package lines"],
  "omissions": ["facts not stated"]
}

Rules:
- One claim per line. Telegraphic. No hype. No marketing sentences.
- Digits/units exact. Preserve must vs nice.
- Put immutable strings (years like 5+, salary bands, product names) in slots[].value.
- skills = methods/tools (FRACAS, Go, HubSpot). systems = products (V-BAT, Hivemind).
- Include EVERY hard requirement and EVERY listed duty theme.
- Unknown meta fields are "" (empty). Never invent a value.

META
${buildMetaBits(job, extras)}

SOURCE:
${String(sourceText || '').slice(0, 14000)}`;
}

const ENGAGEMENT_LABELS = {
  full_time: 'Full-time',
  'full-time': 'Full-time',
  fulltime: 'Full-time',
  part_time: 'Part-time',
  'part-time': 'Part-time',
  parttime: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
  temporary: 'Temporary',
  temp: 'Temporary',
  volunteer: 'Volunteer',
  freelance: 'Freelance',
};

function humanizeEngagement(raw) {
  const t = String(raw || '')
    .trim()
    .replace(/[.:]+$/, '')
    .trim();
  if (!t || /^unknown$/i.test(t)) return '';
  const key = t.toLowerCase().replace(/[ -]+/g, '_');
  if (ENGAGEMENT_LABELS[key]) return ENGAGEMENT_LABELS[key];
  if (ENGAGEMENT_LABELS[t.toLowerCase()]) return ENGAGEMENT_LABELS[t.toLowerCase()];
  if (/full\s*time/i.test(t)) return t.replace(/full\s*time/gi, 'Full-time');
  if (/part\s*time/i.test(t)) return t.replace(/part\s*time/gi, 'Part-time');
  return t;
}

function isUsableFactValue(v) {
  const t = String(v || '').trim();
  if (!t) return false;
  if (/^(unknown|\.\.\.|see source|not specified|not provided|none listed|n\/a|tbd)$/i.test(t)) {
    return false;
  }
  return true;
}

/** Key facts are assembled in code from the sheet — the model must not invent them. */
function buildKeyFactsLines(job, sheet) {
  const meta = sheet?.meta || {};
  const location = String(meta.location || job?.location || '').trim();
  const engagement = humanizeEngagement(meta.engagement || job?.job_type || '');
  const team = String(meta.team || '').trim();
  const pay =
    String(meta.salary_raw || '').trim() ||
    String((sheet?.comp_notes || [])[0] || '').trim() ||
    String(job?.salary || '').trim();
  const lines = [];
  if (isUsableFactValue(location)) lines.push(`Location: ${location}`);
  if (isUsableFactValue(engagement)) lines.push(`Engagement: ${engagement}`);
  if (isUsableFactValue(team)) lines.push(`Team: ${team}`);
  if (isUsableFactValue(pay)) lines.push(`Compensation: ${pay}`);
  return lines;
}

const PAGE_SECTION_HEADERS = [
  'About the role',
  "What you'll do",
  'Requirements',
  'Nice to have',
  'Engineering methods',
  'Relevant systems',
  'Skills & tools',
  'Practical notes',
  'Good to know',
  'About the company',
  'About the location',
];

function isPageSectionHeader(line) {
  const t = String(line || '').trim();
  return PAGE_SECTION_HEADERS.some((h) => h.toLowerCase() === t.toLowerCase());
}

function noteLines(arr, max = 24) {
  const out = [];
  const seen = new Set();
  for (const raw of arr || []) {
    const s = String(raw || '')
      .replace(/\s+/g, ' ')
      .trim();
    if (s.length < 2 || !isUsableFactValue(s)) continue;
    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(`- ${s}`);
    if (out.length >= max) break;
  }
  return out;
}

function uniqueTokens(arr, max = 24) {
  const out = [];
  const seen = new Set();
  for (const raw of arr || []) {
    const s = String(raw || '')
      .replace(/\s+/g, ' ')
      .trim();
    if (s.length < 2 || !isUsableFactValue(s)) continue;
    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

function isAnyPageHeader(line) {
  const t = String(line || '').trim();
  if (/^Key facts\s*$/i.test(t)) return true;
  return isPageSectionHeader(line);
}

function extractSectionBody(text, header) {
  const parts = String(text || '').split('\n');
  const want = header.trim().toLowerCase();
  let i = parts.findIndex((l) => l.trim().toLowerCase() === want);
  if (i < 0) return '';
  i += 1;
  const body = [];
  while (i < parts.length && !isAnyPageHeader(parts[i])) {
    body.push(parts[i]);
    i += 1;
  }
  return body.join('\n').trim();
}

function buildPracticalNotesBody(sheet) {
  const bits = uniqueTokens(
    [...(sheet?.constraints || []), ...(sheet?.comp_notes || []).slice(1)],
    12
  ).filter((s) => !/confirm details on the official apply page/i.test(s));
  const sentences = bits.map((s) => (/[.!?]$/.test(s) ? s : `${s}.`));
  sentences.push('Confirm details on the official apply page.');
  return sentences.join(' ');
}

/**
 * Cheap-model safety: the writer only authors About / duties / requirements.
 * Title line, Key facts, tool lists, and Practical notes are assembled in code.
 */
function assembleJobPage(draft, job, sheet) {
  const about = extractSectionBody(draft, 'About the role');
  const duties = extractSectionBody(draft, "What you'll do");
  const req = extractSectionBody(draft, 'Requirements');
  const nice = extractSectionBody(draft, 'Nice to have');
  const keyFacts = buildKeyFactsLines(job, sheet);
  const skills = uniqueTokens(sheet?.skills);
  const systems = uniqueTokens(sheet?.systems);
  const chunks = [`${job.title} at ${job.company}.`, '', 'About the role', about || ''];
  if (keyFacts.length) chunks.push('', 'Key facts', ...keyFacts);
  chunks.push('', "What you'll do", duties || '');
  chunks.push('', 'Requirements', req || '');
  if ((sheet?.nice_to_have || []).length && nice) {
    chunks.push('', 'Nice to have', nice);
  }
  if (skills.length && systems.length) {
    chunks.push('', 'Engineering methods', skills.join(', '), '', 'Relevant systems', systems.join(', '));
  } else if (systems.length) {
    chunks.push('', 'Relevant systems', systems.join(', '));
  } else if (skills.length) {
    chunks.push('', 'Skills & tools', skills.join(', '));
  }
  chunks.push('', 'Practical notes', buildPracticalNotesBody(sheet));
  return chunks.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function breakSourceOrder(arr) {
  const a = [...(arr || [])];
  if (a.length < 3) return a;
  const mid = Math.ceil(a.length / 2);
  const out = [];
  for (let i = 0; i < mid; i++) {
    out.push(a[i]);
    if (mid + i < a.length) out.push(a[mid + i]);
  }
  return out;
}

function buildNotesForWriter(job, sheet) {
  const duties = noteLines(breakSourceOrder(sheet.duties));
  const must = noteLines(breakSourceOrder(sheet.must_have));
  const nice = noteLines(breakSourceOrder(sheet.nice_to_have));
  let page = `${job.title} at ${job.company}.

About the role

What you'll do
${duties.join('\n')}

Requirements
${must.join('\n')}
`;
  if (nice.length) {
    page += `
Nice to have
${nice.join('\n')}
`;
  }
  return page.trim();
}

function buildWritePrompt(job, sheet) {
  const notes = buildNotesForWriter(job, sheet);

  return `Write original sentences from the notes. Do not copy a note's word order. Do not add facts.

For every note write 2 sentences: the work, then its stated purpose only if the note already has one.
Start each sentence with a different subject than the note (the object, the tool, the result, or the team).
Keep names and numbers exactly.

Example:
Note: "define API contracts with product managers"
Wrong: "Define API contracts with product managers."
Right: "Product and engineering settle the API surface together, and the contract grows as features land."

About the role: 4 sentences that scope the work from the duty notes. No marketing.
What you'll do / Requirements / Nice to have: one bullet per note, two sentences each.
Keep those headings. Do not write Key facts. Do not write Practical notes.

${notes}

Cover every note. No HTML. No em dashes. Output only the page.`;
}

function buildRepairPrompt(job, sheet, draft, failReasons) {
  const notes = buildNotesForWriter(job, sheet);
  const reasons = failReasons.join(', ');
  let extra = 'Keep every note. Do not add facts. Do not write Key facts or Practical notes.';
  if (/copy_span|ngram_overlap/.test(reasons)) {
    extra +=
      ' Copied wording: rewrite those bullets with a new grammatical subject. Keep names and numbers.';
  }
  if (/rewrite_short/.test(reasons)) {
    extra +=
      ' Too short: give every duty and requirement note 2 sentences from that note. Do not invent perks, culture, or extra duties.';
  }
  if (/rewrite_long/.test(reasons)) {
    extra += ' Too long: cut repeated sentences. Do not drop a note.';
  }
  return `Fix: ${reasons}

${extra}

NOTES:
${notes}

DRAFT:
${String(draft || '').slice(0, 8000)}

Output only the corrected page.`;
}

function stripCodeFence(text) {
  let t = String(text || '').trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }
  return t;
}

function parseFactSheet(raw) {
  let t = stripCodeFence(raw);
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('fact_sheet_parse');
  let sheet;
  try {
    sheet = JSON.parse(t.slice(start, end + 1));
  } catch {
    throw new Error('fact_sheet_parse');
  }
  if (!sheet || typeof sheet !== 'object') throw new Error('fact_sheet_parse');
  sheet.meta = sheet.meta && typeof sheet.meta === 'object' ? sheet.meta : {};
  for (const k of ['duties', 'must_have', 'nice_to_have', 'skills', 'systems', 'constraints', 'comp_notes', 'omissions', 'slots']) {
    if (!Array.isArray(sheet[k])) sheet[k] = [];
  }
  for (const k of Object.keys(sheet.meta)) {
    const v = String(sheet.meta[k] ?? '').trim();
    sheet.meta[k] = isUsableFactValue(v) ? v : '';
  }
  sheet.duties = sheet.duties.map((x) => String(x || '').trim()).filter((x) => isUsableFactValue(x));
  sheet.must_have = sheet.must_have.map((x) => String(x || '').trim()).filter((x) => isUsableFactValue(x));
  sheet.nice_to_have = sheet.nice_to_have.map((x) => String(x || '').trim()).filter((x) => isUsableFactValue(x));
  sheet.skills = sheet.skills.map((x) => String(x || '').trim()).filter((x) => isUsableFactValue(x));
  sheet.systems = sheet.systems.map((x) => String(x || '').trim()).filter((x) => isUsableFactValue(x));
  sheet.constraints = sheet.constraints.map((x) => String(x || '').trim()).filter((x) => isUsableFactValue(x));
  sheet.comp_notes = sheet.comp_notes.map((x) => String(x || '').trim()).filter((x) => isUsableFactValue(x));
  return sheet;
}

/** Rich enough to aim for indexable 600–900w page. */
function factSheetIsIndexable(sheet) {
  const duties = sheet.duties?.length || 0;
  const must = sheet.must_have?.length || 0;
  const nice = sheet.nice_to_have?.length || 0;
  const substance = duties + must + nice;
  // Mirror docs: rich ≈ ≥6 duties and ≥4 must, or overall substance
  if (duties >= 6 && must >= 4) return true;
  if (substance >= 12 && must >= 3) return true;
  if (substance >= 10 && (sheet.skills?.length || 0) + (sheet.systems?.length || 0) >= 4) return true;
  return false;
}

function slotValuesInDraft(sheet, draft) {
  const normDraft = normalizeTokens(draft).join(' ');
  const missing = [];
  for (const slot of sheet.slots || []) {
    const v = String(slot?.value || '').trim();
    if (v.length < 2) continue;
    // Allow minor punctuation variance
    const nv = normalizeTokens(v).join(' ');
    if (nv && !normDraft.includes(nv)) missing.push(v);
  }
  return missing;
}

function originalityFailReasons(draft, sourceText, sheet) {
  const reasons = [];
  const maskedDraft = maskSlotSpans(draft, sheet);
  const maskedSrc = maskSlotSpans(sourceText, sheet);
  const dTok = normalizeTokens(maskedDraft);
  const sTok = normalizeTokens(maskedSrc);
  if (sTok.length) {
    const lcs = contiguousLcsWords(dTok, sTok);
    if (lcs > GATE.maxLcsWords) reasons.push('copy_span');
    const j5 = jaccard(ngrams(dTok, 5), ngrams(sTok, 5));
    if (j5 > GATE.max5gramJaccard) reasons.push('ngram_overlap');
  }
  // Cheap models paste extract notes; those notes often still match the ATS.
  const draftNorm = dTok.join(' ');
  for (const note of [...(sheet?.duties || []), ...(sheet?.must_have || [])]) {
    const nt = normalizeTokens(note);
    if (nt.length < 8) continue;
    if (draftNorm.includes(nt.join(' '))) {
      reasons.push('copy_span');
      break;
    }
  }
  return reasons;
}

function humanityFailReasons(text) {
  const reasons = [];
  if (/[—–]/.test(text)) reasons.push('slop');
  if (
    /leverage|delve into|cutting-edge|exciting opportunity|furthermore|moreover|tapestry|navigate the landscape/i.test(
      text
    )
  ) {
    reasons.push('slop');
  }
  // Do not treat real parentheticals like "Team: (Growth)" as leaks.
  if (descriptionHasWriterLeak(text)) reasons.push('rewrite_leak');
  return reasons;
}

function structureFailReasons(text) {
  const reasons = [];
  if (!/About the role/i.test(text) || !/What you'll do/i.test(text) || !/Requirements/i.test(text)) {
    reasons.push('structure');
  }
  return reasons;
}

function finalizeText(text, { sourceText = '', sheet = null, job = null } = {}) {
  text = stripCodeFence(text);

  if (job && sheet) {
    text = assembleJobPage(text, job, sheet);
  } else {
    text = text.replace(/^Engagement:\s*(.+)$/gim, (m, v) => {
      const label = humanizeEngagement(v);
      return label ? `Engagement: ${label}` : m;
    });
  }

  text = stripLeakedWriterInstructions(text);
  if (descriptionHasWriterLeak(text)) throw new Error('rewrite_leak');

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < MIN_REWRITE_WORDS) throw new Error('rewrite_short');
  if (wordCount > MAX_REWRITE_WORDS + 80) throw new Error('rewrite_long');
  // Soft trim only trailing Practical notes fluff if slightly over — else fail for repair
  if (wordCount > MAX_REWRITE_WORDS) throw new Error('rewrite_long');

  const fails = [
    ...humanityFailReasons(text),
    ...structureFailReasons(text),
    ...(sheet ? originalityFailReasons(text, sourceText, sheet) : []),
  ];
  if (sheet) {
    const missingSlots = slotValuesInDraft(sheet, text);
    // Only fail on salary/years-like slots that are clearly immutable
    const critical = missingSlots.filter((v) => /(\d|\$|\+|years?)/i.test(v));
    if (critical.length) throw new Error('slot_mutation');
  }
  if (fails.includes('rewrite_leak')) throw new Error('rewrite_leak');
  if (fails.includes('slop')) throw new Error('rewrite_slop');
  if (fails.includes('structure')) throw new Error('rewrite_structure');
  if (fails.includes('copy_span')) throw new Error('copy_span');
  if (fails.includes('ngram_overlap')) throw new Error('ngram_overlap');
  return text.slice(0, 12000);
}


// Per-key(+model) cooldowns so one 429 does not burn the whole key ring
const geminiKeyCooldown = new Map();
function geminiCooldownKey(model, key) {
  return `${model}::${key.slice(0, 12)}`;
}

async function rewriteWithGemini(prompt, opts = {}) {
  throw new Error('provider_disabled: openrouter inclusionai/ling-2.6-flash only');
  if (!GEMINI_KEYS.length) throw new Error('Missing GEMINI_API_KEY');
  const temperature = opts.temperature ?? 0.4;
  const maxOutputTokens = opts.maxOutputTokens ?? 8192;

  // Prefer models confirmed working on free/paid keys (avoid 2.0-flash free limit:0).
  const models = [
    process.env.GEMINI_MODEL,
    'gemini-2.0-flash',
    'gemini-1.5-flash',
  ].filter(Boolean);
  let lastErr = '';
  let data = null;

  for (const model of models) {
    for (const key of GEMINI_KEYS) {
      const cdKey = geminiCooldownKey(model, key);
      const until = geminiKeyCooldown.get(cdKey) || 0;
      if (Date.now() < until) continue;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      try {
        // Keep generationConfig simple — thinkingConfig 400s on some flash variants
        const r = await jfetch(
          url,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature,
                maxOutputTokens,
                topP: 0.9,
              },
            }),
          },
          90000
        );
        if (r.ok) {
          data = await r.json();
          break;
        }
        const err = await r.text();
        lastErr = `gemini_${model}_${r.status}:${err.slice(0, 180)}`;
        if (r.status === 429) {
          // key-specific cooldown; try other keys / models
          geminiKeyCooldown.set(cdKey, Date.now() + 45_000);
          continue;
        }
        if (r.status === 404) {
          // model unavailable for this key — skip remaining keys for this model name
          geminiKeyCooldown.set(cdKey, Date.now() + 600_000);
          break;
        }
      } catch (e) {
        lastErr = `gemini_${model}_err:${String(e.message || e).slice(0, 100)}`;
      }
    }
    if (data) break;
  }

  if (!data) throw new Error(lastErr || 'gemini_failed');
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p) => p.text || '').join('');
  if (!text.trim()) {
    const reason = data.candidates?.[0]?.finishReason || data.promptFeedback?.blockReason || 'empty';
    throw new Error(`gemini_empty_${reason}`);
  }
  return stripCodeFence(text);
}

const cohereKeyIndex = new Map();
const groqKeyIndex = new Map();

async function rewriteWithCohere(prompt, opts = {}) {
  throw new Error('provider_disabled: openrouter inclusionai/ling-2.6-flash only');
  if (!COHERE_KEYS.length) throw new Error('Missing COHERE_API_KEY');
  const temperature = opts.temperature ?? 0.4;

  const models = ['command-r-plus', 'command-r', 'command-light'];
  let lastErr = '';

  for (const model of models) {
    for (const key of COHERE_KEYS) {
      try {
        const r = await jfetch('https://api.cohere.ai/v1/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model,
            message: prompt,
            temperature,
            max_tokens: opts.maxOutputTokens ?? 4096,
          }),
        }, 45000);
        if (r.ok) {
          const data = await r.json();
          const text = data.text || '';
          return stripCodeFence(text);
        }
        const err = await r.text();
        lastErr = `cohere_${model}_${r.status}:${err.slice(0, 180)}`;
        if (r.status === 429) await sleep(1000);
      } catch (e) {
        lastErr = `cohere_${model}_err:${String(e.message||e).slice(0, 100)}`;
      }
    }
  }

  throw new Error(lastErr || 'cohere_failed');
}

async function rewriteWithGroq(prompt, opts = {}) {
  throw new Error('provider_disabled: openrouter inclusionai/ling-2.6-flash only');
  if (!GROQ_KEYS.length) throw new Error('Missing GROQ_API_KEY');
  const temperature = opts.temperature ?? 0.4;

  const models = ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768'];
  let lastErr = '';

  for (const model of models) {
    for (const key of GROQ_KEYS) {
      try {
        const r = await jfetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens: opts.maxOutputTokens ?? 4096,
            top_p: 0.9,
          }),
        }, 45000);
        if (r.ok) {
          const data = await r.json();
          const text = data.choices?.[0]?.message?.content || '';
          return stripCodeFence(text);
        }
        const err = await r.text();
        lastErr = `groq_${model}_${r.status}:${err.slice(0, 180)}`;
        if (r.status === 429) await sleep(1000);
      } catch (e) {
        lastErr = `groq_${model}_err:${String(e.message||e).slice(0, 100)}`;
      }
    }
  }

  throw new Error(lastErr || 'groq_failed');
}

async function rewriteWithOpenAI(prompt, opts = {}) {
  throw new Error('provider_disabled: openrouter inclusionai/ling-2.6-flash only');
  if (!OPENAI_KEYS.length) throw new Error('Missing OPENAI_API_KEY');
  const temperature = opts.temperature ?? (TURBO ? 0.3 : 0.4);
  // TURBO: mini only (fast). Normal: mini then full.
  const models = TURBO ? [OPENAI_FAST_MODEL] : [OPENAI_FAST_MODEL, 'gpt-4o'];
  let lastErr = '';

  for (const model of models) {
    for (const key of OPENAI_KEYS) {
      try {
        const r = await jfetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens: opts.maxOutputTokens ?? 4096,
            top_p: 0.9,
          }),
        }, TURBO ? 60000 : 45000);
        if (r.ok) {
          const data = await r.json();
          const text = data.choices?.[0]?.message?.content || '';
          return stripCodeFence(text);
        }
        const err = await r.text();
        lastErr = `openai_${model}_${r.status}:${err.slice(0, 180)}`;
        // TURBO: fail over to Gemini quickly on 429 instead of burning the whole key ring
        if (r.status === 429) {
          if (TURBO) throw new Error(lastErr);
          await sleep(1000);
        }
      } catch (e) {
        lastErr = `openai_${model}_err:${String(e.message||e).slice(0, 100)}`;
        if (TURBO && /429/.test(lastErr)) throw new Error(lastErr);
      }
    }
  }

  throw new Error(lastErr || 'openai_failed');
}

/** NVIDIA NIM — OpenAI-compatible chat completions (Nemotron). */
let nvidiaNextAllowedAt = 0;
async function rewriteWithNvidia(prompt, opts = {}) {
  throw new Error('provider_disabled: openrouter inclusionai/ling-2.6-flash only');
  if (!NVIDIA_KEYS.length) throw new Error('Missing NVIDIA_API_KEY');
  const temperature = opts.temperature ?? (TURBO ? 0.3 : 0.4);
  // Prefer configured model (e.g. nvidia/nemotron-3-ultra-550b-a55b); optional fallbacks
  const models = TURBO
    ? [NVIDIA_MODEL]
    : [NVIDIA_MODEL, 'meta/llama-3.3-70b-instruct', 'meta/llama-3.1-70b-instruct'];
  let lastErr = '';

  // Global min spacing across workers on this machine (~1 rps soft cap)
  const waitMs = nvidiaNextAllowedAt - Date.now();
  if (waitMs > 0) await sleep(Math.min(waitMs, 15_000));
  nvidiaNextAllowedAt = Date.now() + 1200;

  for (const model of models) {
    for (const key of NVIDIA_KEYS) {
      try {
        const r = await jfetch(`${NVIDIA_BASE}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens: opts.maxOutputTokens ?? 4096,
            top_p: 0.9,
            stream: false,
            // Nemotron ultra can emit reasoning; disable so `content` is clean job text
            chat_template_kwargs: { enable_thinking: false },
          }),
        }, TURBO ? 120000 : 90000);
        if (r.ok) {
          const data = await r.json();
          const msg = data.choices?.[0]?.message || {};
          // Prefer final content; never use reasoning_content as the JD body
          const text = (msg.content || '').trim() || (msg.reasoning_content || '').trim();
          return stripCodeFence(text);
        }
        const err = await r.text();
        lastErr = `http_${r.status}:${err.slice(0, 120)}`;
        // Rate limited — back off then throw so caller can skip this job
        if (r.status === 429 || r.status === 503) {
          nvidiaNextAllowedAt = Date.now() + 20_000;
          await sleep(2000);
          throw new Error(lastErr);
        }
        if (r.status >= 500) await sleep(TURBO ? 400 : 800);
      } catch (e) {
        const msg = String(e.message || e);
        // Don't double-prefix if we already threw lastErr
        lastErr = msg.startsWith('http_') || msg.startsWith('rewrite_') ? msg.slice(0, 140) : `err:${msg.slice(0, 120)}`;
        if (/429|503|rate/i.test(lastErr)) throw new Error(lastErr);
      }
    }
  }
  throw new Error(lastErr || 'nvidia_failed');
}

/** OpenRouter only — model locked to inclusionai/ling-2.6-flash. */
const openrouterKeyCooldown = new Map();
async function openrouterCall(key, model, prompt, temperature, maxTokens) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${key}`,
    'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://cvin.bio',
    'X-Title': process.env.OPENROUTER_APP_NAME || 'cvin.bio job enrich',
  };
  const body = JSON.stringify({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens: maxTokens,
    top_p: 0.9,
  });
  return jfetch(`${OPENROUTER_BASE}/chat/completions`, { method: 'POST', headers, body }, TURBO ? 90000 : 60000);
}

async function rewriteWithOpenRouter(prompt, opts = {}) {
  if (!OPENROUTER_KEYS.length) throw new Error('Missing OPENROUTER_API_KEY');
  const temperature = opts.temperature ?? (TURBO ? 0.3 : 0.4);
  const model = OPENROUTER_MODEL;
  const maxTokens = opts.maxOutputTokens ?? 4096;
  const maxRetries = Math.max(2, Number(process.env.OR_RETRIES || 8));
  let lastErr = '';

  // Each request retries in place with per-key backoff so the provider's
  // throttling paces throughput without hard-failing the batch. When the key
  // is cooled, WAIT for release instead of skipping — otherwise the shared
  // cooldown map makes every concurrent call fail with empty lastErr.
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const key = OPENROUTER_KEYS[0];
    const cdKey = `${model}::${key.slice(0, 12)}`;
    const until = openrouterKeyCooldown.get(cdKey) || 0;
    const wait = until - Date.now();
    if (wait > 0) {
      await sleep(Math.min(wait, 15000));
      continue;
    }
    try {
      const r = await openrouterCall(key, model, prompt, temperature, maxTokens);
      if (r.ok) {
        const data = await r.json();
        const text = data.choices?.[0]?.message?.content || '';
        if (!String(text).trim()) throw new Error('openrouter_empty');
        return stripCodeFence(text);
      }
      const err = await r.text();
      lastErr = `openrouter_${model}_${r.status}:${err.slice(0, 180)}`;
      if (r.status === 429) {
        const backoff = Math.max(2000, 3000 + attempt * 2000);
        openrouterKeyCooldown.set(cdKey, Date.now() + backoff);
        await sleep(Math.min(backoff, 12000));
        continue;
      }
      if (r.status >= 500) {
        await sleep(TURBO ? 400 : 800);
        continue;
      }
      throw new Error(lastErr);
    } catch (e) {
      const msg = String(e.message || e);
      if (/429|503|rate|timeout|ETIMEDOUT|ENOTFOUND|socket|ECONNRESET/i.test(msg) && attempt < maxRetries - 1) {
        lastErr = msg.slice(0, 140);
        await sleep(Math.min(1500 + attempt * 1500, 8000));
        continue;
      }
      throw new Error(msg.startsWith('openrouter_') ? msg.slice(0, 140) : `openrouter_${model}_err:${msg.slice(0, 100)}`);
    }
  }
  throw new Error(lastErr || 'openrouter_failed');
}

async function rewriteWithAnthropic(prompt, opts = {}) {
  throw new Error('provider_disabled: openrouter inclusionai/ling-2.6-flash only');
  if (!ANTHROPIC_KEY) throw new Error('Missing ANTHROPIC_API_KEY');
  const temperature = opts.temperature ?? 0.4;

  const models = [ANTHROPIC_MODEL, 'claude-sonnet-4-5'];
  let lastErr = '';
  for (const model of models) {
    try {
      const r = await jfetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: opts.maxOutputTokens ?? 4096,
          temperature,
          messages: [{ role: 'user', content: prompt }],
        }),
      }, 45000);
      if (r.ok) {
        const data = await r.json();
        const text = (data.content || []).map((p) => p.text || '').join('');
        return stripCodeFence(text);
      }
      const err = await r.text();
      lastErr = `anthropic_${model}_${r.status}:${err.slice(0, 180)}`;
      if (r.status === 429) await sleep(1000);
    } catch (e) {
      lastErr = `anthropic_${model}_err:${String(e.message||e).slice(0, 100)}`;
    }
  }
  throw new Error(lastErr || 'anthropic_failed');
}

// AI rewrite is OpenRouter + inclusionai/ling-2.6-flash only. No other providers.
function buildProviderList() {
  if (!OPENROUTER_KEYS.length) return [];
  return [['openrouter', rewriteWithOpenRouter]];
}

async function completeWithProviders(prompt, opts = {}) {
  if (!OPENROUTER_KEYS.length) {
    throw new Error('No AI providers configured (need OPENROUTER_API_KEY)');
  }
  return rewriteWithOpenRouter(prompt, opts);
}

/**
 * Fact Sheet → sealed write → A/O/H gates (+ one repair).
 * Default: no LLM — throws manual_only so callers queue a pack instead.
 */
async function rewriteJobPage(job, sourceText, extras) {
  if (!ALLOW_AI_ENRICH) {
    throw new Error('manual_only');
  }
  if (!usableSourceText(sourceText)) {
    throw new Error('source_thin');
  }

  const extractRaw = await completeWithProviders(buildExtractPrompt(job, sourceText, extras), {
    temperature: 0.1,
    maxOutputTokens: 4096,
  });
  const sheet = parseFactSheet(extractRaw);
  if (!factSheetIsIndexable(sheet)) {
    throw new Error('source_thin');
  }

  let draft = await completeWithProviders(buildWritePrompt(job, sheet), {
    temperature: TURBO ? 0.2 : 0.25,
    maxOutputTokens: 8192,
  });

  const ctx = { sourceText, sheet, job };
  try {
    return finalizeText(draft, ctx);
  } catch (e) {
    const reason = String(e.message || e);
    const repairable = /copy_span|ngram_overlap|rewrite_long|rewrite_short|rewrite_slop|rewrite_structure|rewrite_leak|slot_mutation/.test(
      reason
    );
    if (!repairable || GATE.maxRepair < 1) throw e;
    draft = await completeWithProviders(buildRepairPrompt(job, sheet, draft, [reason]), {
      temperature: 0.2,
      maxOutputTokens: 8192,
    });
    try {
      return finalizeText(draft, ctx);
    } catch (e2) {
      const r2 = String(e2.message || e2);
      // Soft originality: after one repair, allow page if only O-gates fail
      if (GATE.originalitySoft && /copy_span|ngram_overlap/.test(r2)) {
        const soft = finalizeText(draft, { sourceText: '', sheet, job }); // H + structure + length only
        return soft;
      }
      throw e2;
    }
  }
}

/** Write curl/ATS source pack for manual Fact Sheet → rewrite (no API). */
function enqueueManualPack(job, scraped) {
  if (DRY_RUN) return null;
  mkdirSync(MANUAL_QUEUE_DIR, { recursive: true });
  const id = job.id;
  const sourcePath = resolve(MANUAL_QUEUE_DIR, `${id}.source.txt`);
  const metaPath = resolve(MANUAL_QUEUE_DIR, `${id}.meta.json`);
  const text = String(scraped.text || '');
  writeFileSync(sourcePath, text);
  const meta = {
    id,
    title: job.title,
    company: job.company,
    location: job.location || null,
    job_type: job.job_type || null,
    salary: job.salary || null,
    apply_url: job.apply_url,
    source_words: text.split(/\s+/).filter(Boolean).length,
    extras: scraped.extras || {},
    queued_at: new Date().toISOString(),
    rules: 'docs/JD_PARAPHRASE_RULES.md',
    source_file: `${id}.source.txt`,
  };
  writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  appendFileSync(
    resolve(MANUAL_QUEUE_DIR, 'index.jsonl'),
    JSON.stringify({ id, title: job.title, company: job.company, apply_url: job.apply_url, words: meta.source_words }) +
      '\n'
  );
  return metaPath;
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function loadState() {
  if (!existsSync(STATE_PATH)) {
    return { processed: {}, doneIds: [], skipped: {}, batches: [] };
  }
  try {
    const parsed = JSON.parse(readFileSync(STATE_PATH, 'utf8'));
    if (!parsed || typeof parsed !== 'object') throw new Error('empty state');
    return parsed;
  } catch (e) {
    console.error(`Corrupt state file ${STATE_PATH}, starting fresh`);
    return { processed: {}, doneIds: [], skipped: {}, batches: [] };
  }
}

function saveState(state) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

/**
 * Never invent duties from title/tags. Thin/stub sources must skip (no curated-jd).
 * Kept only for logging context — not a rewrite source.
 */
function describeThinSource(job) {
  return `thin_source title=${job.title || ''} company=${job.company || ''} apply=${job.apply_url || ''}`;
}

async function fetchAllJobs() {
  const out = [];
  let offset = 0;
  // limit=1000 + description often exceeds Supabase statement timeout → page in smaller
  // chunks so the fetch never 500s mid-run.
  const page = Math.max(50, Math.min(500, Number(process.env.FETCH_PAGE || 500)));
  const since = RETRY_ONLY || LINKEDIN_ONLY || RE_ENRICH ? new Date(0).toISOString() : new Date(Date.now() - 30 * 86400000).toISOString();
  const orderDir = RETRY_ONLY || LINKEDIN_ONLY || RE_ENRICH ? 'created_at.asc' : 'created_at.desc';

  const hex = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
  const chunkSize = Math.max(1, Math.floor(hex.length / WORKERS));
  const startHex = hex[Math.min(WORKER_ID * chunkSize, hex.length - 1)];
  const endHex = (WORKER_ID === WORKERS - 1) ? null : hex[Math.min((WORKER_ID + 1) * chunkSize, hex.length - 1)];

  while (true) {
    // RE_ENRICH must include curated-jd rows that are still under 600w (old short rewrites).
    // Fresh enrich still skips already-curated jobs.
    let url = `${U}/rest/v1/jobs?select=id,title,company,company_key,location,tags,job_type,salary,apply_url,external_id,description,dedup_hash,source&created_at=gte.${encodeURIComponent(since)}&apply_url=not.is.null`;
    if (!RE_ENRICH) {
      url += `&tags=not.cs.{"curated-jd"}`;
    }
    if (WORKERS > 1) {
      url += `&id=gte.${startHex}0000000-0000-0000-0000-000000000000`;
      if (endHex) url += `&id=lt.${endHex}0000000-0000-0000-0000-000000000000`;
    }
    url += `&order=${orderDir}&limit=${page}&offset=${offset}`;

    let r;
    let ok = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        r = await jfetch(url, { headers }, 60000);
        ok = true;
        break;
      } catch (e) {
        if (attempt < 2) { await sleep(1500 * (attempt + 1)); continue; }
        console.error(`fetchAllJobs page error (${e.name || e.message}); returning ${out.length} rows`);
        return out;
      }
    }
    if (!ok) return out;
    const rows = await r.json();
    if (!Array.isArray(rows) || !rows.length) break;
    out.push(...rows);
    if (rows.length < page) break;
    offset += page;
  }
  return out;
}

async function loadUsedSlugs(companySlug) {
  const used = new Set();
  const prefix = `${companySlug}_`;
  const url = `${U}/rest/v1/jobs?select=external_id&external_id=like.${encodeURIComponent(prefix + '*')}&limit=1000`;
  let r;
  let rows;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      r = await jfetch(url, { headers }, 30000);
      rows = await r.json();
      break;
    } catch (e) {
      if (attempt < 2) {
        await sleep(800 * (attempt + 1));
        continue;
      }
      throw e;
    }
  }
  if (Array.isArray(rows)) {
    for (const row of rows) {
      const ext = row.external_id || '';
      if (ext.toLowerCase().startsWith(prefix)) used.add(ext.slice(prefix.length).toLowerCase());
    }
  }
  return used;
}

async function updateJob(id, patch) {
  const url = `${U}/rest/v1/jobs?id=eq.${id}`;
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await jfetch(
        url,
        {
          method: 'PATCH',
          headers: { ...headers, Prefer: 'return=minimal' },
          body: JSON.stringify(patch),
        },
        30000
      );
      if (!r.ok) {
        const t = await r.text();
        throw new Error(`patch_${r.status}:${t.slice(0, 200)}`);
      }
      return;
    } catch (e) {
      const msg = String(e.message || e);
      if (attempt < 2 && (msg.includes('CONNECT_TIMEOUT') || msg.includes('fetch failed') || /^patch_5\d\d:/.test(msg))) {
        lastErr = e;
        await sleep(1000 * (attempt + 1));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

/** Soft IndexNow ping for SEO (Bing). Every N successful enriches. Google uses crawl/GSC. */
const INDEXNOW_EVERY = Math.max(0, Number(process.env.INDEXNOW_EVERY || 25));
const INDEXNOW_KEY = '6db32ca940dd46cab89375c221953bd6';
let enrichOkSinceIndexNow = 0;
async function maybePingIndexNow(publicPath) {
  if (!INDEXNOW_EVERY || DRY_RUN || !publicPath) return;
  enrichOkSinceIndexNow++;
  if (enrichOkSinceIndexNow % INDEXNOW_EVERY !== 0) return;
  const abs = publicPath.startsWith('http') ? publicPath : `https://cvin.bio${publicPath}`;
  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'cvin.bio',
        key: INDEXNOW_KEY,
        keyLocation: `https://cvin.bio/${INDEXNOW_KEY}.txt`,
        urlList: [abs],
      }),
    });
  } catch {
    /* ignore */
  }
}

/** Serialize slug minting per company (concurrent workers race on `used`). */
const companyLocks = new Map();
async function withCompanyLock(companySlug, fn) {
  const prev = companyLocks.get(companySlug) || Promise.resolve();
  let release;
  const gate = new Promise((r) => {
    release = r;
  });
  companyLocks.set(
    companySlug,
    prev.then(() => gate)
  );
  await prev;
  try {
    return await fn();
  } finally {
    release();
  }
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


/** Transient failures (rate limits, timeouts, network) deserve a retry; everything
 * else — dead sources, quality rejects, collisions — is permanent. Without this,
 * RE_ENRICH sweeps re-attempt the same hopeless jobs on every run forever. */
function isPermanentlyFailed(state, id) {
  const row = state && state.processed && state.processed[id];
  if (!row) return false;
  if (row.status !== 'fail' && row.status !== 'skip') return false;
  const reason = String(row.reason || '');
  if (/429|rate|timeout|timed out|fetch failed|5\d\d|aborted/i.test(reason)) return false;
  return true;
}

async function runOneBatch(batchNum, state, done) {
  console.log(
    `enrich-remote-jd: worker ${WORKER_ID}/${WORKERS} batch ${batchNum}, size ${BATCH_SIZE}, concurrency ${CONCURRENCY}, dry=${DRY_RUN ? 1 : 0}`
  );

  const priorityFile = process.env.PRIORITY_IDS_FILE;
  let prioritySet = null;
  if (priorityFile && existsSync(priorityFile)) {
    prioritySet = new Set(
      readFileSync(priorityFile, 'utf8')
        .split(/\s+/)
        .map((s) => s.trim())
        .filter(Boolean)
    );
    console.log(`Priority filter: ${prioritySet.size} ids from ${priorityFile}`);
  }

  console.log('Loading jobs…');
  let all;
  try {
    if (prioritySet && prioritySet.size) {
      // Direct id fetch (ignore 30d window) so rework/manual VIP packs always load
      all = [];
      const ids = [...prioritySet];
      for (let i = 0; i < ids.length; i += 50) {
        const chunk = ids.slice(i, i + 50);
        const url = `${U}/rest/v1/jobs?select=id,title,company,company_key,location,tags,job_type,salary,apply_url,external_id,description,dedup_hash,source&id=in.(${chunk.join(',')})`;
        const r = await jfetch(url, { headers }, 60000);
        const rows = await r.json();
        if (Array.isArray(rows)) all.push(...rows);
      }
    } else {
      all = await fetchAllJobs();
    }
  } catch (e) {
    console.error(`fetchAllJobs failed: ${String(e.message || e).slice(0, 120)}`);
    return { attempted: 0, ok: 0, skip: 0, fail: 1, reasons: {} };
  }
  console.log(`Total jobs loaded: ${all.length}`);

  const candidates = all
    .filter((j) => (prioritySet ? prioritySet.has(j.id) : true))
    .filter((j) => {
      if (prioritySet) return Boolean(j.apply_url);
      if (isBannedJobTitle(j.title)) return false;
      // Never touch fully enriched (≥600 + curated-jd). Only under-600 for queue/rewrite.
      if (isFullyEnrichedJob(j)) return false;
      if (!shouldQueueForManualEnrich(j, { reworkShortCurated: process.env.REWORK_SHORT_CURATED === '1' })) {
        return false;
      }
      return RE_ENRICH
        ? j.apply_url &&
          descriptionWords(j.description) < MIN_REWRITE_WORDS &&
          !isPermanentlyFailed(state, j.id)
        : RETRY_ONLY
          ? j.apply_url &&
            ((j.description || '').length >= 500 ||
              (state.processed[j.id] &&
                state.processed[j.id].status !== 'ok' &&
                !PERMANENT_REASONS.has(String(state.processed[j.id].reason || '').trim())))
          : j.apply_url &&
            (!done.has(j.id) || descriptionWords(j.description) < MIN_REWRITE_WORDS);
    })
    .filter((j) => {
      if (prioritySet) return true;
      if (isFullyEnrichedJob(j)) return false;
      const kind = classifyApplyUrl(j.apply_url).kind;
      if (kind === 'none') return false;
      if (kind === 'skip' && (j.description || '').length < 500) return false;
      if (LINKEDIN_ONLY && kind !== 'linkedin') return false;
      if (RETRY_ONLY && !LINKEDIN_ONLY && kind === 'linkedin') return false;
      if (!RETRY_ONLY && !RE_ENRICH && isPrettyExternalId(j.company, j.external_id) && (j.description || '').length >= 500) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // TURBO RE_ENRICH: expand existing text first (no scrape). Stubs last.
      // Normal: prefer ATS + empty (need scrape) so we fill blanks with real source.
      const rank = (j) => {
        const k = classifyApplyUrl(j.apply_url).kind;
        const ats = { ashby: 0, greenhouse: 1, lever: 2, smartrecruiters: 3, html: 4 }[k] ?? 9;
        const words = (j.description || '').split(/\s+/).filter(Boolean).length;
        if (TURBO && RE_ENRICH) {
          // more words → earlier (negated); then ATS rank
          const bodyScore = words >= 40 ? 0 : words >= 15 ? 1 : 2;
          return bodyScore * 100 + ats;
        }
        const empty = (j.description || '').length < 200 ? 0 : 1;
        return ats * 10 + empty;
      };
      return rank(a) - rank(b);
    });

  console.log(`Candidates remaining (this shard): ${candidates.length}`);
  if (candidates.length === 0) {
    return { attempted: 0, ok: 0, skip: 0, fail: 0, reasons: {}, successes: [], complete: true };
  }

  const maxAttempts = BATCH_SIZE * 3;
  const queue = candidates.slice(0, maxAttempts);
  console.log(`Queue this batch (max attempts ${queue.length}, target ok ${BATCH_SIZE})`);

  const usedByCompany = new Map();
  const stats = { ok: 0, skip: 0, fail: 0, reasons: {} };
  const successes = [];
  let attempted = 0;
  let consecutiveProviderFails = 0;
  const tBatch = Date.now();

  // Small waves under rate limits so we log progress and bail instead of silent multi-hour hangs
  const waveSize = Math.max(CONCURRENCY * 2, Math.min(6, CONCURRENCY * 4));
  for (let start = 0; start < queue.length && stats.ok < BATCH_SIZE; start += waveSize) {
    // Circuit breaker: providers are 429-dead — stop burning the rest of the queue this batch
    if (consecutiveProviderFails >= 8 && stats.ok === 0) {
      console.log(
        `[${new Date().toISOString()}] circuit_open worker=${WORKER_ID} consecutive_fails=${consecutiveProviderFails} ok=0 — end batch early`
      );
      break;
    }
    const wave = queue.slice(start, Math.min(start + waveSize, queue.length));
    await mapPool(wave, CONCURRENCY, async (job) => {
      try {
        await processOne(job);
      } catch (e) {
        stats.fail++;
        const reason = String(e.message || e).slice(0, 80);
        stats.reasons[reason] = (stats.reasons[reason] || 0) + 1;
        state.processed[job.id] = { status: 'fail', reason };
        done.add(job.id);
        if (/429|rate|all_providers_failed/i.test(reason)) consecutiveProviderFails++;
        else consecutiveProviderFails = 0;
      }
      if (attempted > 0 && attempted % 5 === 0) {
        const elapsed = ((Date.now() - tBatch) / 1000).toFixed(0);
        console.log(
          `[${new Date().toISOString()}] progress worker=${WORKER_ID} attempted=${attempted} ok=${stats.ok} fail=${stats.fail} skip=${stats.skip} ${elapsed}s`
        );
      }
    });
    // Persist state between waves so a kill mid-batch keeps partial progress
    try {
      saveState(state);
    } catch {
      /* ignore */
    }

    async function processOne(job) {
      if (stats.ok >= BATCH_SIZE) return;
      // RE_ENRICH targets under-600-word pages even if previously marked ok.
      // Without this, short "ok" jobs are permanently stuck below the SEO floor.
      if (
        !RE_ENRICH &&
        done.has(job.id) &&
        state.processed[job.id]?.status === 'ok' &&
        isFullyEnrichedJob(job)
      ) {
        return;
      }
      attempted++;

      if (isFullyEnrichedJob(job)) {
        stats.skip++;
        stats.reasons.already_enriched = (stats.reasons.already_enriched || 0) + 1;
        state.processed[job.id] = { status: 'skip', reason: 'already_enriched' };
        done.add(job.id);
        return;
      }

      const companySlug = companyToSlug(job.company);
      if (!companySlug) {
        stats.skip++;
        stats.reasons.no_company = (stats.reasons.no_company || 0) + 1;
        state.processed[job.id] = { status: 'skip', reason: 'no_company' };
        if (await purgeJobRow(job)) console.log(`[purge] no_company ${job.id}`);
        return;
      }

      const existing = (job.description || '').trim();
      let scraped;
      // Prefer live apply_url body. Existing DB text is OK only if it is a real posting
      // body (not our CVin.Bio stub). Never invent from title/tags/meta.
      const existingUsable = usableSourceText(existing);

      if (RE_ENRICH) {
        scraped = await fetchSourceText(job);
        if (!scraped.ok && existingUsable) {
          scraped = { ok: true, text: existing, extras: {}, fromExisting: true };
        }
      } else if (existingUsable && RETRY_ONLY && existing.length >= 500) {
        const thirtyDaysAgoMs = Date.now() - 30 * 24 * 60 * 60 * 1000;
        if (job.posted_at && new Date(job.posted_at).getTime() < thirtyDaysAgoMs) {
          scraped = { ok: false, reason: 'posting_older_than_30d' };
        } else {
          scraped = { ok: true, text: existing, extras: {}, fromExisting: true };
        }
      } else {
        scraped = await fetchSourceText(job);
        if (!scraped.ok && existingUsable) {
          scraped = { ok: true, text: existing, extras: {}, fromExisting: true };
        }
      }

      if (scraped.ok && !usableSourceText(scraped.text)) {
        scraped = { ok: false, reason: 'source_thin' };
      }

      if (!scraped.ok) {
        stats.skip++;
        const reason = scraped.reason || 'source_thin';
        stats.reasons[reason] = (stats.reasons[reason] || 0) + 1;
        state.processed[job.id] = { status: 'skip', reason, note: describeThinSource(job) };
        // Permanent unenrichable → delete the row so future runs never burn budget re-scraping it.
        if (isPermanentUnenrichableReason(reason)) {
          if (await purgeJobRow(job)) console.log(`[purge] ${reason} ${job.id}`);
        }
        // RE_ENRICH: don't permanently burn — allow retry next batch with different path
        if (!RE_ENRICH) done.add(job.id);
        return;
      }
      if (scraped.fromExisting) {
        stats.reasons.expand_existing = (stats.reasons.expand_existing || 0) + 1;
      }

      let description;
      try {
        if (!ALLOW_AI_ENRICH) {
          enqueueManualPack(job, scraped);
          stats.skip++;
          stats.reasons.manual_queued = (stats.reasons.manual_queued || 0) + 1;
          state.processed[job.id] = { status: 'queued', reason: 'manual_only' };
          if (!RE_ENRICH) done.add(job.id);
          return;
        }
        description = await rewriteJobPage(job, scraped.text, scraped.extras);
        consecutiveProviderFails = 0;
        // Normal mode soft-throttles; TURBO relies on API 429 backoff only
        if (!TURBO) await sleep(80);
      } catch (e) {
        const reason = String(e.message || e).slice(0, 80);
        if (/manual_only/.test(reason)) {
          enqueueManualPack(job, scraped);
          stats.skip++;
          stats.reasons.manual_queued = (stats.reasons.manual_queued || 0) + 1;
          state.processed[job.id] = { status: 'queued', reason: 'manual_only' };
          if (!RE_ENRICH) done.add(job.id);
          return;
        }
        // Thin / unindexable fact sheets are skips, not provider fails
        if (/source_thin|fact_sheet_parse/.test(reason)) {
          stats.skip++;
          stats.reasons[reason] = (stats.reasons[reason] || 0) + 1;
          state.processed[job.id] = { status: 'skip', reason };
          if (isPermanentUnenrichableReason(reason)) {
            if (await purgeJobRow(job)) console.log(`[purge] ${reason} ${job.id}`);
          }
          if (!RE_ENRICH) done.add(job.id);
          return;
        }
        stats.fail++;
        stats.reasons[reason] = (stats.reasons[reason] || 0) + 1;
        state.processed[job.id] = { status: 'fail', reason };
        // Quality-gate rejects (rewrite_slop/short/structure/long, invented facts)
        // can never become an indexable page → delete now.
        if (isPermanentUnenrichableReason(reason)) {
          if (await purgeJobRow(job)) console.log(`[purge] ${reason} ${job.id}`);
        }
        if (/429|rate|all_providers_failed/i.test(reason)) consecutiveProviderFails++;
        else consecutiveProviderFails = 0;
        // Don't permanently burn RE_ENRICH fails — allow retry next batch
        if (!RE_ENRICH) done.add(job.id);
        return;
      }

      if (stats.ok >= BATCH_SIZE) return;

      let jobSlug;
      let external_id;
      let path;
      try {
        // Keep any already-routeable external_id (not only "strict pretty").
        // Reminting breaks Telegram / social links that already went out.
        if (isPrettyExternalId(job.company, job.external_id) || isRouteableExternalId(job.company, job.external_id)) {
          const co = companySlug;
          const prefix = `${co}_`;
          const rest = job.external_id.slice(prefix.length);
          jobSlug = rest;
          external_id = job.external_id;
          path = `/${co}/${jobSlug}`;
        } else {
          await withCompanyLock(companySlug, async () => {
            if (!usedByCompany.has(companySlug)) {
              usedByCompany.set(companySlug, await loadUsedSlugs(companySlug));
            }
            const used = usedByCompany.get(companySlug);
            if (job.external_id && String(job.external_id).toLowerCase().startsWith(`${companySlug}_`)) {
              used.delete(job.external_id.slice(companySlug.length + 1).toLowerCase());
            }
            jobSlug = prettyJobSlug(job.title, job.id, used);
            external_id = `${companySlug}_${jobSlug}`;
            path = `/${companySlug}/${jobSlug}`;
          });
        }
      } catch (e) {
        stats.fail++;
        const reason = String(e.message || e).slice(0, 80);
        stats.reasons[reason] = (stats.reasons[reason] || 0) + 1;
        state.processed[job.id] = { status: 'fail', reason };
        if (!RE_ENRICH) done.add(job.id);
        return;
      }

      const fellowshipBlock = fellowshipPublishBlockReason(job);
      if (fellowshipBlock) {
        stats.fail++;
        stats.reasons[fellowshipBlock] = (stats.reasons[fellowshipBlock] || 0) + 1;
        state.processed[job.id] = { status: 'fail', reason: fellowshipBlock };
        if (!RE_ENRICH) done.add(job.id);
        return;
      }

      try {
        if (!DRY_RUN) {
          const storedDescription = normalizeJobDescriptionForStorage(description);
          if (!storedDescription || descriptionHasWriterLeak(storedDescription)) {
            throw new Error('rewrite_leak');
          }
          if (descriptionWords(storedDescription) < MIN_REWRITE_WORDS) {
            throw new Error('rewrite_short');
          }
          const tags = Array.isArray(job.tags) ? [...job.tags] : [];
          if (!tags.includes('remote')) tags.push('remote');
          if (!tags.includes('curated-jd')) tags.push('curated-jd');
          const patchObj = {
            description: storedDescription,
            external_id,
            tags,
            company_key: job.company_key || companySlug,
          };
          if (scraped.extras?.publishedAt) {
            patchObj.published_at = scraped.extras.publishedAt;
          }
          try {
            await updateJob(job.id, patchObj);
          } catch (patchErr) {
            if (String(patchErr.message || patchErr).includes('23505') || String(patchErr.message || patchErr).includes('409')) {
              // Slug collision: keep retrying with a widening hash instead of
              // failing the job (head≤6 + 2/4/6-hex, same as mint-slugs form).
              const head = (jobSlug.split('-')[0] || 'role').slice(0, 6);
              let ok = false;
              for (let width = 2; width <= 8 && !ok; width += 2) {
                const hash = createHash('md5').update(job.id + ':' + width).digest('hex').slice(0, width);
                jobSlug = `${head}-${hash}`;
                external_id = `${companySlug}_${jobSlug}`;
                path = `/${companySlug}/${jobSlug}`;
                patchObj.external_id = external_id;
                try {
                  await updateJob(job.id, patchObj);
                  ok = true;
                } catch (retryErr) {
                  if (!String(retryErr.message || retryErr).includes('23505') && !String(retryErr.message || retryErr).includes('409')) {
                    throw retryErr;
                  }
                }
              }
              if (!ok) throw patchErr;
            } else {
              throw patchErr;
            }
          }
        }
        stats.ok++;
        successes.push({ id: job.id, path, title: job.title, company: job.company });
        state.processed[job.id] = {
          status: DRY_RUN ? 'dry_ok' : 'ok',
          path,
          external_id,
        };
        if (!DRY_RUN) {
          done.add(job.id);
          // Fire-and-forget IndexNow every N oks (does not block throughput)
          maybePingIndexNow(path).catch(() => {});
        }
        if (stats.ok % 25 === 0) {
          console.log(`  … ok ${stats.ok} / skip ${stats.skip} / fail ${stats.fail}`);
          state.doneIds = [...done];
          if (!DRY_RUN) saveState(state);
        }
      } catch (e) {
        stats.fail++;
        const reason = String(e.message || e).slice(0, 80);
        stats.reasons[reason] = (stats.reasons[reason] || 0) + 1;
        state.processed[job.id] = { status: 'fail', reason };
        await withCompanyLock(companySlug, async () => {
          usedByCompany.get(companySlug)?.delete(jobSlug);
        });
      }
    }
  }

  state.doneIds = [...done];
  state.batches = state.batches || [];
  state.batches.push({
    batchNum,
    worker: WORKER_ID,
    at: new Date().toISOString(),
    attempted,
    ...stats,
    samplePaths: successes.slice(0, 20).map((s) => s.path),
  });
  saveState(state);

  console.log('\n══ Batch complete ══');
  console.log({ worker: WORKER_ID, attempted, ...stats, dry: DRY_RUN });
  console.log('Sample paths:');
  for (const s of successes.slice(0, 12)) {
    console.log(`  ${s.path} — ${s.title.slice(0, 50)} @ ${s.company}`);
  }

  return { attempted, ...stats, successes, complete: false };
}

async function main() {
  if (!U || !K) {
    console.error('Need Supabase env');
    process.exit(1);
  }
  if (ABOUT_ONLY) {
    if (!ALLOW_AI_ENRICH) {
      console.error('ABOUT_ONLY needs ALLOW_AI_ENRICH=1');
      process.exit(1);
    }
    if (!OPENROUTER_KEYS.length && !DRY_RUN) {
      console.error('Need OPENROUTER_API_KEY');
      process.exit(1);
    }
    console.log(`enrich mode=about-company openrouter=${OPENROUTER_MODEL}`);
    await runCompanyAboutPass({
      supabaseUrl: U,
      supabaseKey: K,
      complete: rewriteWithOpenRouter,
      dryRun: DRY_RUN,
      sinceHours: Number(process.env.ENRICH_SINCE_HOURS || 24),
    });
    return;
  }
  if (!ALLOW_AI_ENRICH) {
    console.log(
      `MANUAL_ONLY (default): no LLM API calls. Usable scrapes → ${MANUAL_QUEUE_DIR}/. Publish via docs/JD_PARAPHRASE_RULES.md. Set ALLOW_AI_ENRICH=1 to re-enable AI rewrite.`
    );
  } else if (!OPENROUTER_KEYS.length && !DRY_RUN) {
    console.error('Need OPENROUTER_API_KEY (or unset ALLOW_AI_ENRICH for manual)');
    process.exit(1);
  }
  const mode = !ALLOW_AI_ENRICH ? 'manual_only' : `openrouter:${OPENROUTER_MODEL}`;
  console.log(
    `enrich mode=${mode}: ai=${ALLOW_AI_ENRICH ? 'yes' : 'no'} openrouter=${OPENROUTER_KEYS.length ? OPENROUTER_MODEL : 'no'} minWords=${MIN_REWRITE_WORDS} turbo=${TURBO ? 1 : 0} concurrency=${CONCURRENCY} workers=${WORKERS}/${WORKER_ID}`
  );

  const state = loadState();
  const done = new Set(state.doneIds || []);
  // Inherit sticky done/skips from the primary batch-1 state file
  const globalStatePath = resolve(__dirname, 'enrich-remote-jd-state.json');
  if (STATE_PATH !== globalStatePath && existsSync(globalStatePath)) {
    try {
      const g = JSON.parse(readFileSync(globalStatePath, 'utf8'));
      for (const id of g.doneIds || []) done.add(id);
      for (const [id, row] of Object.entries(g.processed || {})) {
        if (row?.status === 'skip' || row?.status === 'fail' || row?.status === 'ok') {
          done.add(id);
          if (!state.processed[id]) state.processed[id] = row;
        }
      }
    } catch {
      /* ignore */
    }
  }
  let batchNum = BATCH_NUM;
  let totalOk = 0;

  do {
    const result = await runOneBatch(batchNum, state, done);
    totalOk += result.ok;
    if (result.complete || (result.ok === 0 && result.attempted === 0)) {
      console.log(`ENRICH_COMPLETE worker=${WORKER_ID} totalOk=${totalOk}`);
      // TURBO supervisors restart us immediately; short sleep avoids tight spin
      if (TURBO && RE_ENRICH && CONTINUOUS) {
        console.log(`worker ${WORKER_ID}: empty shard — sleep 15s then recheck`);
        await sleep(15000);
        batchNum++;
        continue;
      }
      process.exit(0);
    }
    // Skip-only batch: don't kill the worker forever (that shrank fleet to 2)
    if (result.ok === 0) {
      console.log(
        `ENRICH_IDLE worker=${WORKER_ID} totalOk=${totalOk} (skip-only batch attempt=${result.attempted})`
      );
      if (TURBO && RE_ENRICH && CONTINUOUS) {
        await sleep(5000);
        batchNum++;
        continue;
      }
      process.exit(0);
    }
    batchNum++;
  } while (CONTINUOUS);

  console.log(`State: ${STATE_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
