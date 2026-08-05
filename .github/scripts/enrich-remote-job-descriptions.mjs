#!/usr/bin/env node
/**
 * Enrich remote jobs with curated JD pages (Army/NITI style):
 *  1. Scrape official apply_url / ATS APIs
 *  2. Rewrite into original structured plain text (Gemini)
 *  3. Set short pretty external_id → /{company}/{slug}
 *
 * Keeps dedup_hash so jobs-sync won't re-insert duplicates.
 * Skips jobs we can't scrape well.
 *
 * Usage:
 *   BATCH_SIZE=500 BATCH_NUM=1 node .github/scripts/enrich-remote-job-descriptions.mjs
 *   DRY_RUN=1 ...  (fetch+rewrite, no DB writes)
 */
import { createRequire } from 'module';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

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
const ANTHROPIC_KEY = unquote(process.env.ANTHROPIC_API_KEY);
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-5';
const BATCH_SIZE = Math.max(1, Number(process.env.BATCH_SIZE || 500));
const BATCH_NUM = Math.max(1, Number(process.env.BATCH_NUM || 1));
const DRY_RUN = process.env.DRY_RUN === '1';
// TURBO=1: max parallel, mini model, no sleep, keep existing pretty slugs
const TURBO = process.env.TURBO === '1';
// Hard cap high so one machine can saturate API keys (429s self-throttle)
const CONCURRENCY = Math.max(1, Math.min(TURBO ? 256 : 16, Number(process.env.CONCURRENCY || 4)));
const WORKERS = Math.max(1, Number(process.env.WORKERS || 1));
const WORKER_ID = Math.max(0, Number(process.env.WORKER_ID || 0)) % WORKERS;
const CONTINUOUS = process.env.CONTINUOUS === '1';
const RETRY_ONLY = process.env.RETRY_ONLY === '1';
const LINKEDIN_ONLY = process.env.LINKEDIN_ONLY === '1';
const RE_ENRICH = process.env.RE_ENRICH === '1';
const MIN_REWRITE_WORDS = 600;
const OPENAI_FAST_MODEL = process.env.OPENAI_FAST_MODEL || 'gpt-4o-mini';
// TURBO scrapes must fail fast — long LinkedIn/HTML retries were killing throughput (~20 ok/min).
const SCRAPE_MS = TURBO ? 4000 : 15000;
const HTML_MS = TURBO ? 4000 : 20000;
const PERMANENT_REASONS = new Set(['posting_older_than_30d', 'html_blocked', 'rewrite_slop', 'no_company', 'unsupported']);
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
  'api', 'editor', 'login', 'signup', 'jobs', 'blog', 'admin',
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
    /jooble\.org|jobviewtrack\.com|adzuna\.|indeed\.|glassdoor\.|ziprecruiter\./i.test(
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
      if (!r.ok) return { ok: false, reason: `linkedin_${r.status}` };
      const html = await r.text();
      const match = html.match(/<div class=\"show-more-less-html__markup[^\"]*\">([\s\S]*?)<\/div>/i);
      if (!match) return { ok: false, reason: 'linkedin_no_markup' };
      const text = stripHtml(match[1]);
      if (text.length < 280) return { ok: false, reason: 'linkedin_short' };

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

function buildJobPrompt(job, sourceText, extras) {
  const metaBits = [
    `Company: ${job.company}`,
    `Title: ${job.title}`,
    job.location ? `Listed location: ${job.location}` : null,
    job.job_type ? `Job type: ${job.job_type}` : null,
    job.salary ? `Listed salary: ${job.salary}` : null,
    extras?.department ? `Department: ${extras.department}` : null,
    extras?.employmentType ? `Employment: ${extras.employmentType}` : null,
    extras?.workplaceType ? `Workplace: ${extras.workplaceType}` : null,
    extras?.compensation ? `Compensation JSON: ${JSON.stringify(extras.compensation).slice(0, 400)}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  // TURBO: shorter prompt → fewer input tokens + faster completions
  if (TURBO) {
    return `Expand this into a cvin.bio job page. Output ONLY plain text.

MUST be ≥600 words. Keep every concrete fact (stack, years, location, salary, visa). Paraphrase; do not copy sentences.

Format (exact headers, blank line between sections):
${job.title} at ${job.company}.

About the role
(3-5 sentences)

Key facts
Location: ...
Engagement: ...
${job.salary || extras?.compensation ? 'Compensation: ...' : ''}

What you'll do
- (8-12 detailed bullets)

Requirements
- (6-10 bullets)

Nice to have
- (3-6 bullets)

Skills & tools
- ...

Practical notes
- ...

META
${metaBits}

SOURCE:
${sourceText.slice(0, 8000)}`;
  }

  return `You write original job description pages for cvin.bio.

TASK: Rewrite the source posting into a clear, original job page. Do NOT copy sentences or bullet wording from the source. Paraphrase everything. Keep EVERY concrete fact: tech, years of experience, degrees, locations, salary/comp numbers, visas, deadlines, team names, product names, must-haves, nice-to-haves.

LENGTH: The final output MUST be at least 600 words. Expand each section with specific detail grounded in the source facts — do not pad with generic filler. Write in complete, informative sentences and thorough bullet points.

FORMAT — plain text only, exact section headers, blank line between sections:

${job.title} at ${job.company}.

About the role
<2-4 short original sentences>

Key facts
Location: ...
Engagement: ...
${job.salary || extras?.compensation ? 'Compensation: ...' : ''}
Team: ... (omit line if unknown)

What you'll do
- ...
- ...

Requirements
- ...
- ...

Nice to have
- ... (omit whole section if none)

Skills & tools
- ...

Practical notes
- ... (visa, travel, benefits highlights, application notes — omit section if none)

Rules:
- No HTML, no markdown bold/italic, no em dashes, no filler AI tone
- Avoid words: leverage, delve, robust, seamless, passionate, cutting-edge, exciting opportunity
- Keep all numbers, stack names, and hard requirements
- Target 600-900 words (do not stop early)
- Output ONLY the job page text

META
${metaBits}

SOURCE (facts only — rewrite, do not quote):
${sourceText.slice(0, 12000)}`;
}

function finalizeText(text) {
  text = (text || '').trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
  }
  // Light quality gates
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 600) throw new Error('rewrite_short');
  if (/leverage|delve into|cutting-edge|exciting opportunity to join/i.test(text)) {
    throw new Error('rewrite_slop');
  }
  if (!/About the role|What you'll do|Requirements/i.test(text)) {
    throw new Error('rewrite_structure');
  }
  return text.slice(0, 8000);
}

// Per-key(+model) cooldowns so one 429 does not burn the whole key ring
const geminiKeyCooldown = new Map();
function geminiCooldownKey(model, key) {
  return `${model}::${key.slice(0, 12)}`;
}

async function rewriteWithGemini(job, sourceText, extras) {
  if (!GEMINI_KEYS.length) throw new Error('Missing GEMINI_API_KEY');
  const prompt = buildJobPrompt(job, sourceText, extras);

  // Prefer models confirmed working on free/paid keys (avoid 2.0-flash free limit:0).
  const models = [
    process.env.GEMINI_MODEL,
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
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
                temperature: 0.4,
                maxOutputTokens: 8192,
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
    throw new Error(`gemini_empty:${reason}`);
  }
  return finalizeText(text);
}

const cohereKeyIndex = new Map();
const groqKeyIndex = new Map();

async function rewriteWithCohere(job, sourceText, extras) {
  if (!COHERE_KEYS.length) throw new Error('Missing COHERE_API_KEY');
  const prompt = buildJobPrompt(job, sourceText, extras);

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
            temperature: 0.4,
            max_tokens: 4096,
          }),
        }, 45000);
        if (r.ok) {
          const data = await r.json();
          const text = data.text || '';
          return finalizeText(text);
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

async function rewriteWithGroq(job, sourceText, extras) {
  if (!GROQ_KEYS.length) throw new Error('Missing GROQ_API_KEY');
  const prompt = buildJobPrompt(job, sourceText, extras);

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
            temperature: 0.4,
            max_tokens: 4096,
            top_p: 0.9,
          }),
        }, 45000);
        if (r.ok) {
          const data = await r.json();
          const text = data.choices?.[0]?.message?.content || '';
          return finalizeText(text);
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

async function rewriteWithOpenAI(job, sourceText, extras) {
  if (!OPENAI_KEYS.length) throw new Error('Missing OPENAI_API_KEY');
  const prompt = buildJobPrompt(job, sourceText, extras);
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
            temperature: TURBO ? 0.3 : 0.4,
            max_tokens: 4096,
            top_p: 0.9,
          }),
        }, TURBO ? 60000 : 45000);
        if (r.ok) {
          const data = await r.json();
          const text = data.choices?.[0]?.message?.content || '';
          return finalizeText(text);
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
async function rewriteWithNvidia(job, sourceText, extras) {
  if (!NVIDIA_KEYS.length) throw new Error('Missing NVIDIA_API_KEY');
  const prompt = buildJobPrompt(job, sourceText, extras);
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
            temperature: TURBO ? 0.3 : 0.4,
            max_tokens: 4096,
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
          return finalizeText(text);
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

async function rewriteWithAnthropic(job, sourceText, extras) {
  if (!ANTHROPIC_KEY) throw new Error('Missing ANTHROPIC_API_KEY');
  const prompt = buildJobPrompt(job, sourceText, extras);

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
          max_tokens: 4096,
          temperature: 0.4,
          messages: [{ role: 'user', content: prompt }],
        }),
      }, 45000);
      if (r.ok) {
        const data = await r.json();
        const text = (data.content || []).map((p) => p.text || '').join('');
        return finalizeText(text);
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

// Provider order controlled by env:
//   NVIDIA_ONLY=1           → nvidia only
//   GEMINI_NVIDIA_ONLY=1    → gemini → nvidia (no OpenAI)
//   SKIP_OPENAI=1           → same as GEMINI_NVIDIA_ONLY when both keys exist
//   TURBO default           → gemini → openai → nvidia
async function rewriteJobPage(job, sourceText, extras) {
  const providers = [];
  const nvidiaOnly = process.env.NVIDIA_ONLY === '1' || process.env.NVIDIA_ONLY === 'true';
  const geminiNvidiaOnly =
    process.env.GEMINI_NVIDIA_ONLY === '1' ||
    process.env.GEMINI_NVIDIA_ONLY === 'true' ||
    process.env.SKIP_OPENAI === '1' ||
    process.env.SKIP_OPENAI === 'true';
  if (nvidiaOnly && NVIDIA_KEYS.length) {
    providers.push(['nvidia', rewriteWithNvidia]);
  } else if (geminiNvidiaOnly) {
    if (GEMINI_KEYS.length) providers.push(['gemini', rewriteWithGemini]);
    if (NVIDIA_KEYS.length) providers.push(['nvidia', rewriteWithNvidia]);
  } else if (TURBO) {
    // TURBO: Gemini → OpenAI → NVIDIA (Nemotron is powerful but rate-limits hard in parallel)
    if (GEMINI_KEYS.length) providers.push(['gemini', rewriteWithGemini]);
    if (OPENAI_KEYS.length) providers.push(['openai', rewriteWithOpenAI]);
    if (NVIDIA_KEYS.length) providers.push(['nvidia', rewriteWithNvidia]);
  } else {
    if (OPENAI_KEYS.length) providers.push(['openai', rewriteWithOpenAI]);
    if (GEMINI_KEYS.length) providers.push(['gemini', rewriteWithGemini]);
    if (NVIDIA_KEYS.length) providers.push(['nvidia', rewriteWithNvidia]);
  }
  // TURBO: skip slow/broken tail (Groq/Cohere/Anthropic). Cascading to Anthropic was
  // burning every fail as anthropic_400 and hiding the real OpenAI/Gemini error.
  if (!TURBO) {
    if (GROQ_KEYS.length) providers.push(['groq', rewriteWithGroq]);
    if (COHERE_KEYS.length) providers.push(['cohere', rewriteWithCohere]);
    if (ANTHROPIC_KEY) providers.push(['anthropic', rewriteWithAnthropic]);
  }
  if (!providers.length) {
    throw new Error('No AI providers configured (OPENAI_API_KEY / NVIDIA_API_KEY / GEMINI_API_KEY)');
  }

  const errors = [];
  for (const [name, provider] of providers) {
    try {
      return await provider(job, sourceText, extras);
    } catch (e) {
      errors.push(`${name}:${String(e.message || e).slice(0, 100)}`);
    }
  }
  // Prefer first error (usually OpenAI) so logs show the real bottleneck
  throw new Error(`all_providers_failed: ${errors.join(' | ')}`.slice(0, 200));
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

/** Seed text when scrape fails / stub has no JD — enough for mini to hit ≥600w. */
function buildMetaSeed(job) {
  const bits = [
    `Job title: ${job.title || 'Unknown role'}`,
    `Company: ${job.company || 'Unknown company'}`,
    job.location ? `Location: ${job.location}` : null,
    job.job_type ? `Job type / engagement: ${job.job_type}` : null,
    job.salary ? `Listed compensation: ${job.salary}` : null,
    job.apply_url ? `Apply URL: ${job.apply_url}` : null,
    Array.isArray(job.tags) && job.tags.length ? `Tags: ${job.tags.filter((t) => t !== 'curated-jd').join(', ')}` : null,
  ].filter(Boolean);
  return [
    bits.join('\n'),
    '',
    'No full posting body was available. Write a thorough, original ≥600-word job page',
    'using the title, company, and any facts above. Be specific to this role title and',
    'company domain; avoid generic placeholder fluff. Infer reasonable responsibilities,',
    'requirements, and skills that fit the role name — mark unknowns only in Practical notes.',
  ].join('\n');
}

async function fetchAllJobs() {
  const out = [];
  let offset = 0;
  const page = 1000;
  const since = RETRY_ONLY || LINKEDIN_ONLY || RE_ENRICH ? new Date(0).toISOString() : new Date(Date.now() - 30 * 86400000).toISOString();
  const orderDir = RETRY_ONLY || LINKEDIN_ONLY || RE_ENRICH ? 'created_at.asc' : 'created_at.desc';

  const hex = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
  const chunkSize = Math.max(1, Math.floor(hex.length / WORKERS));
  const startHex = hex[Math.min(WORKER_ID * chunkSize, hex.length - 1)];
  const endHex = (WORKER_ID === WORKERS - 1) ? null : hex[Math.min((WORKER_ID + 1) * chunkSize, hex.length - 1)];

  while (true) {
    // RE_ENRICH must include curated-jd rows that are still under 600w (old short rewrites).
    // Fresh enrich still skips already-curated jobs.
    let url = `${U}/rest/v1/jobs?select=id,title,company,company_key,location,tags,job_type,salary,apply_url,external_id,description,dedup_hash&created_at=gte.${encodeURIComponent(since)}&apply_url=not.is.null`;
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

async function runOneBatch(batchNum, state, done) {
  console.log(
    `enrich-remote-jd: worker ${WORKER_ID}/${WORKERS} batch ${batchNum}, size ${BATCH_SIZE}, concurrency ${CONCURRENCY}, dry=${DRY_RUN ? 1 : 0}`
  );

  console.log('Loading jobs…');
  let all;
  try {
    all = await fetchAllJobs();
  } catch (e) {
    console.error(`fetchAllJobs failed: ${String(e.message || e).slice(0, 120)}`);
    return { attempted: 0, ok: 0, skip: 0, fail: 1, reasons: {} };
  }
  console.log(`Total jobs loaded: ${all.length}`);

  const candidates = all
    .filter((j) =>
      RE_ENRICH
        ? j.apply_url &&
          (j.description || '').split(/\s+/).filter(Boolean).length < MIN_REWRITE_WORDS
        : RETRY_ONLY
        ? j.apply_url &&
          ((j.description || '').length >= 500 ||
            (state.processed[j.id] && state.processed[j.id].status !== 'ok' && !PERMANENT_REASONS.has(String(state.processed[j.id].reason || '').trim())))
        : j.apply_url && !done.has(j.id)
    )
    .filter((j) => {
      const tags = j.tags || [];
      if (!RE_ENRICH && tags.includes('curated-jd')) return false;
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
        state.processed[job.id]?.status === 'ok'
      ) {
        return;
      }
      attempted++;

      const companySlug = companyToSlug(job.company);
      if (!companySlug) {
        stats.skip++;
        stats.reasons.no_company = (stats.reasons.no_company || 0) + 1;
        state.processed[job.id] = { status: 'skip', reason: 'no_company' };
        return;
      }

      const existing = (job.description || '').trim();
      const existingWords = existing.split(/\s+/).filter(Boolean).length;
      let scraped;
      // Usable hosted body: expand without scraping (main throughput path).
      const canUseExisting = existingWords >= 15 || existing.length >= 80;
      if (RE_ENRICH) {
        if (TURBO && canUseExisting) {
          scraped = { ok: true, text: existing, extras: {}, fromExisting: true };
        } else if (canUseExisting) {
          // Non-turbo: try scrape first for quality, fall back to existing
          scraped = await fetchSourceText(job);
          if (!scraped.ok) {
            scraped = { ok: true, text: existing, extras: {}, fromExisting: true };
          }
        } else if (TURBO) {
          // Empty/stub in TURBO: do NOT scrape (4s×40 concurrent timeouts = ~0 ok/min).
          // Expand from title/company/meta so the SEO floor still lands.
          scraped = { ok: true, text: buildMetaSeed(job), extras: {}, fromMeta: true };
        } else {
          scraped = await fetchSourceText(job);
          if (!scraped.ok) {
            scraped = { ok: true, text: buildMetaSeed(job), extras: {}, fromMeta: true };
          }
        }
      } else if (existing.length >= 500 && RETRY_ONLY) {
        const thirtyDaysAgoMs = Date.now() - 30 * 24 * 60 * 60 * 1000;
        if (job.posted_at && new Date(job.posted_at).getTime() < thirtyDaysAgoMs) {
          scraped = { ok: false, reason: 'posting_older_than_30d' };
        } else {
          scraped = { ok: true, text: existing, extras: {}, fromExisting: true };
        }
      } else {
        scraped = await fetchSourceText(job);
        // Never burn a job on scrape fail if we can still write a page from meta
        if (!scraped.ok && TURBO) {
          scraped = { ok: true, text: existing || buildMetaSeed(job), extras: {}, fromMeta: true };
        }
      }
      if (!scraped.ok) {
        stats.skip++;
        stats.reasons[scraped.reason] = (stats.reasons[scraped.reason] || 0) + 1;
        state.processed[job.id] = { status: 'skip', reason: scraped.reason };
        // RE_ENRICH: don't permanently burn — allow retry next batch with different path
        if (!RE_ENRICH) done.add(job.id);
        return;
      }
      if (scraped.fromMeta) {
        stats.reasons.meta_seed = (stats.reasons.meta_seed || 0) + 1;
      } else if (scraped.fromExisting) {
        stats.reasons.expand_existing = (stats.reasons.expand_existing || 0) + 1;
      }

      let description;
      try {
        description = await rewriteJobPage(job, scraped.text, scraped.extras);
        consecutiveProviderFails = 0;
        // Normal mode soft-throttles; TURBO relies on API 429 backoff only
        if (!TURBO) await sleep(80);
      } catch (e) {
        stats.fail++;
        const reason = String(e.message || e).slice(0, 80);
        stats.reasons[reason] = (stats.reasons[reason] || 0) + 1;
        state.processed[job.id] = { status: 'fail', reason };
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

      const tags = Array.isArray(job.tags) ? [...job.tags] : [];
      if (!tags.includes('remote')) tags.push('remote');
      if (!tags.includes('curated-jd')) tags.push('curated-jd');

      try {
        if (!DRY_RUN) {
          const patchObj = {
            description,
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
              // Stay short: head≤6 + 2-hex (same as mint-slugs collision form)
              const hash = createHash('md5').update(job.id).digest('hex').slice(0, 2);
              const head = (jobSlug.split('-')[0] || 'role').slice(0, 6);
              jobSlug = `${head}-${hash}`;
              external_id = `${companySlug}_${jobSlug}`;
              path = `/${companySlug}/${jobSlug}`;
              patchObj.external_id = external_id;
              await updateJob(job.id, patchObj);
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
  if (!OPENAI_KEYS.length && !GEMINI_KEYS.length && !NVIDIA_KEYS.length && !ANTHROPIC_KEY && !DRY_RUN) {
    console.error('Need GEMINI_API_KEY and/or NVIDIA_API_KEY and/or OPENAI_API_KEY');
    process.exit(1);
  }
  const mode =
    process.env.NVIDIA_ONLY === '1' || process.env.NVIDIA_ONLY === 'true'
      ? 'nvidia_only'
      : process.env.GEMINI_NVIDIA_ONLY === '1' ||
          process.env.GEMINI_NVIDIA_ONLY === 'true' ||
          process.env.SKIP_OPENAI === '1' ||
          process.env.SKIP_OPENAI === 'true'
        ? 'gemini+nvidia'
        : TURBO
          ? 'turbo_all'
          : 'default';
  console.log(
    `AI providers mode=${mode}: openai=${OPENAI_KEYS.length ? 'yes' : 'no'} nvidia=${NVIDIA_KEYS.length} gemini=${GEMINI_KEYS.length} cohere=${COHERE_KEYS.length} groq=${GROQ_KEYS.length} anthropic=${ANTHROPIC_KEY ? 'yes' : 'no'} minWords=${MIN_REWRITE_WORDS} turbo=${TURBO ? 1 : 0} concurrency=${CONCURRENCY} workers=${WORKERS}/${WORKER_ID}`
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
