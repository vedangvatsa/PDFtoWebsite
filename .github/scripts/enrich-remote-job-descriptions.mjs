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
const GEMINI_KEY = (process.env.GEMINI_API_KEY || '').replace(/"/g, '');
const BATCH_SIZE = Math.max(1, Number(process.env.BATCH_SIZE || 500));
const BATCH_NUM = Math.max(1, Number(process.env.BATCH_NUM || 1));
const DRY_RUN = process.env.DRY_RUN === '1';
const CONCURRENCY = Math.max(1, Math.min(8, Number(process.env.CONCURRENCY || 4)));
const WORKERS = Math.max(1, Number(process.env.WORKERS || 1));
const WORKER_ID = Math.max(0, Number(process.env.WORKER_ID || 0)) % WORKERS;
const CONTINUOUS = process.env.CONTINUOUS === '1';
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

function companyToSlug(company) {
  return (company || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isRemote(j) {
  const s = `${j.location || ''} ${(j.tags || []).join(' ')} ${j.title || ''} ${j.job_type || ''}`.toLowerCase();
  return /\bremote\b|work from home|\bwfh\b|distributed|anywhere|fully remote|remote-first|remote first/.test(s);
}

function isPrettyExternalId(company, externalId) {
  if (!externalId) return false;
  const co = companyToSlug(company);
  const prefix = `${co}_`;
  if (!externalId.toLowerCase().startsWith(prefix)) return false;
  const rest = externalId.slice(prefix.length);
  return /^[a-z0-9][a-z0-9-]{0,23}$/i.test(rest) && !/^[0-9a-f]{8,}$/i.test(rest);
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

  // Skip known-bad / thin aggregators
  if (
    /linkedin\.com|jooble\.org|jobviewtrack\.com|adzuna\.|indeed\.|glassdoor\.|ziprecruiter\./i.test(
      host
    )
  ) {
    return { kind: 'skip' };
  }

  return { kind: 'html', url };
}

const ashbyBoardCache = new Map();

async function fetchAshbyBoard(board) {
  if (ashbyBoardCache.has(board)) return ashbyBoardCache.get(board);
  const r = await fetch(
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
    if (meta.kind === 'greenhouse' && meta.board && meta.id) {
      const r = await fetch(
        `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(meta.board)}/jobs/${meta.id}`,
        { headers: { 'User-Agent': 'cvin-jd-enrich/1.0' } }
      );
      if (!r.ok) return { ok: false, reason: `gh_${r.status}` };
      const d = await r.json();
      const text = stripHtml(d.content || '');
      if (text.length < 280) return { ok: false, reason: 'gh_short' };
      return {
        ok: true,
        text,
        extras: {
          location: d.location?.name,
          departments: (d.departments || []).map((x) => x.name).filter(Boolean),
        },
      };
    }

    if (meta.kind === 'ashby' && meta.board && meta.id) {
      const map = await fetchAshbyBoard(meta.board);
      const j = map?.get(meta.id);
      if (!j) return { ok: false, reason: 'ashby_not_found' };
      const text = stripHtml(j.descriptionHtml || j.descriptionPlain || '');
      if (text.length < 280) return { ok: false, reason: 'ashby_short' };
      return {
        ok: true,
        text,
        extras: {
          location: j.location,
          employmentType: j.employmentType,
          department: j.department,
          compensation: j.compensation,
          workplaceType: j.workplaceType,
        },
      };
    }

    if (meta.kind === 'lever' && meta.board && meta.id) {
      const r = await fetch(
        `https://api.lever.co/v0/postings/${encodeURIComponent(meta.board)}/${meta.id}`,
        { headers: { 'User-Agent': 'cvin-jd-enrich/1.0' } }
      );
      if (!r.ok) return { ok: false, reason: `lever_${r.status}` };
      const d = await r.json();
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
          location: d.categories?.location,
          commitment: d.categories?.commitment,
          team: d.categories?.team,
          salary: d.salaryRange || d.salaryDescription,
        },
      };
    }

    if (meta.kind === 'smartrecruiters' && meta.board && meta.id) {
      const r = await fetch(
        `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(meta.board)}/postings/${meta.id}`,
        { headers: { 'User-Agent': 'cvin-jd-enrich/1.0' } }
      );
      if (!r.ok) return { ok: false, reason: `sr_${r.status}` };
      const d = await r.json();
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
      return { ok: true, text, extras: { location: d.location?.city } };
    }

    if (meta.kind === 'html') {
      const r = await fetch(meta.url, {
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; cvin-jd-enrich/1.0; +https://cvin.bio)',
          Accept: 'text/html,application/xhtml+xml',
        },
      });
      if (!r.ok) return { ok: false, reason: `html_${r.status}` };
      const html = await r.text();
      if (/cf-browser-verification|captcha|access denied|login to continue/i.test(html) && html.length < 8000) {
        return { ok: false, reason: 'html_blocked' };
      }
      // Prefer JSON-LD JobPosting
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
      const text = stripHtml(html).slice(0, 20000);
      if (text.length < 400) return { ok: false, reason: 'html_short' };
      // Too much chrome / nav noise
      if (text.length > 400 && text.split(/\s+/).length < 80) return { ok: false, reason: 'html_thin' };
      return { ok: true, text: text.slice(0, 14000), extras: {} };
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
    // Prefer ≤12; hard cap 16 with whole tokens only
    if (out.length >= 1 && next.length > 12 && out.length >= 2) break;
    if (out.length >= 1 && next.length > 16) break;
    out.push(t);
    if (out.length >= 3 || next.length >= 10) break;
  }

  let base = out.join('-') || 'role';
  if (base.length > 16) {
    const parts = base.split('-');
    while (parts.length > 1 && parts.join('-').length > 16) parts.pop();
    base = parts.join('-');
  }
  base = base.replace(/-+/g, '-').replace(/^-|-$/g, '') || 'role';

  let slug = base;
  if (used.has(slug)) {
    const h = createHash('md5').update(String(uniqueSeed)).digest('hex').slice(0, 2);
    const parts = base.split('-');
    let shortBase = parts.slice(0, 2).join('-');
    if (shortBase.length > 12) shortBase = parts[0];
    shortBase = (shortBase || 'role').slice(0, 12).replace(/-+$/, '') || 'role';
    // Prefer whole-token shortBase + hash (still meaningful)
    slug = `${shortBase}-${h}`.slice(0, 16).replace(/-+$/, '');
  }
  let n = 2;
  while (used.has(slug) || !/^[a-z0-9][a-z0-9-]{0,23}$/.test(slug)) {
    const h = createHash('md5').update(`${uniqueSeed}:${n++}`).digest('hex').slice(0, 2);
    const head = (base.split('-')[0] || 'role').slice(0, 10);
    slug = `${head}-${h}`;
  }
  used.add(slug);
  return slug;
}

async function rewriteWithGemini(job, sourceText, extras) {
  if (!GEMINI_KEY) throw new Error('Missing GEMINI_API_KEY');

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

  const prompt = `You write original job description pages for cvin.bio.

TASK: Rewrite the source posting into a clear, original job page. Do NOT copy sentences or bullet wording from the source. Paraphrase everything. Keep EVERY concrete fact: tech, years of experience, degrees, locations, salary/comp numbers, visas, deadlines, team names, product names, must-haves, nice-to-haves.

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
- Max ~4500 characters
- Output ONLY the job page text

META
${metaBits}

SOURCE (facts only — rewrite, do not quote):
${sourceText.slice(0, 12000)}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_KEY}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 4096,
        topP: 0.9,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`gemini_${r.status}:${err.slice(0, 180)}`);
  }
  const data = await r.json();
  let text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  text = text.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
  }
  // Light quality gates
  if (text.length < 350) throw new Error('rewrite_short');
  if (/leverage|delve into|cutting-edge|exciting opportunity to join/i.test(text)) {
    throw new Error('rewrite_slop');
  }
  if (!/About the role|What you'll do|Requirements/i.test(text)) {
    throw new Error('rewrite_structure');
  }
  return text.slice(0, 8000);
}

function loadState() {
  if (!existsSync(STATE_PATH)) {
    return { processed: {}, doneIds: [], skipped: {}, batches: [] };
  }
  return JSON.parse(readFileSync(STATE_PATH, 'utf8'));
}

function saveState(state) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

async function fetchAllJobs() {
  const out = [];
  let offset = 0;
  const page = 1000;
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  while (true) {
    const r = await fetch(
      `${U}/rest/v1/jobs?select=id,title,company,company_key,location,tags,job_type,salary,apply_url,external_id,description,dedup_hash&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=${page}&offset=${offset}`,
      { headers }
    );
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
  const r = await fetch(
    `${U}/rest/v1/jobs?select=external_id&external_id=like.${encodeURIComponent(prefix + '*')}&limit=1000`,
    { headers }
  );
  const rows = await r.json();
  if (Array.isArray(rows)) {
    for (const row of rows) {
      const ext = row.external_id || '';
      if (ext.toLowerCase().startsWith(prefix)) used.add(ext.slice(prefix.length).toLowerCase());
    }
  }
  return used;
}

async function updateJob(id, patch) {
  const r = await fetch(`${U}/rest/v1/jobs?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify(patch),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`patch_${r.status}:${t.slice(0, 200)}`);
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
  const all = await fetchAllJobs();
  const remote = all.filter(isRemote);
  console.log(`Remote (broad): ${remote.length}`);

  const candidates = remote
    .filter((j) => shardOf(j.id) === WORKER_ID)
    .filter((j) => j.apply_url && !done.has(j.id))
    .filter((j) => {
      const tags = j.tags || [];
      if (tags.includes('curated-jd')) return false;
      const kind = classifyApplyUrl(j.apply_url).kind;
      if (kind === 'skip' || kind === 'none') return false;
      if (isPrettyExternalId(j.company, j.external_id) && (j.description || '').length >= 500) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const rank = (j) => {
        const k = classifyApplyUrl(j.apply_url).kind;
        const ats = { ashby: 0, greenhouse: 1, lever: 2, smartrecruiters: 3, html: 4 }[k] ?? 9;
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

  const waveSize = Math.max(CONCURRENCY * 4, 12);
  for (let start = 0; start < queue.length && stats.ok < BATCH_SIZE; start += waveSize) {
    const wave = queue.slice(start, Math.min(start + waveSize, queue.length));
    await mapPool(wave, CONCURRENCY, async (job) => {
      if (stats.ok >= BATCH_SIZE) return;
      if (done.has(job.id) && state.processed[job.id]?.status === 'ok') return;
      attempted++;

      const companySlug = companyToSlug(job.company);
      if (!companySlug) {
        stats.skip++;
        stats.reasons.no_company = (stats.reasons.no_company || 0) + 1;
        state.processed[job.id] = { status: 'skip', reason: 'no_company' };
        return;
      }

      const scraped = await fetchSourceText(job);
      if (!scraped.ok) {
        stats.skip++;
        stats.reasons[scraped.reason] = (stats.reasons[scraped.reason] || 0) + 1;
        state.processed[job.id] = { status: 'skip', reason: scraped.reason };
        done.add(job.id);
        return;
      }

      let description;
      try {
        description = await rewriteWithGemini(job, scraped.text, scraped.extras);
        await sleep(80);
      } catch (e) {
        stats.fail++;
        const reason = String(e.message || e).slice(0, 80);
        stats.reasons[reason] = (stats.reasons[reason] || 0) + 1;
        state.processed[job.id] = { status: 'fail', reason };
        done.add(job.id);
        return;
      }

      if (stats.ok >= BATCH_SIZE) return;

      let jobSlug;
      let external_id;
      let path;
      await withCompanyLock(companySlug, async () => {
        if (!usedByCompany.has(companySlug)) {
          usedByCompany.set(companySlug, await loadUsedSlugs(companySlug));
        }
        const used = usedByCompany.get(companySlug);
        if (isPrettyExternalId(job.company, job.external_id)) {
          used.delete(job.external_id.slice(companySlug.length + 1).toLowerCase());
        }
        jobSlug = prettyJobSlug(job.title, job.id, used);
        external_id = `${companySlug}_${jobSlug}`;
        path = `/${companySlug}/${jobSlug}`;
      });

      const tags = Array.isArray(job.tags) ? [...job.tags] : [];
      if (!tags.includes('remote')) tags.push('remote');
      if (!tags.includes('curated-jd')) tags.push('curated-jd');

      try {
        if (!DRY_RUN) {
          await updateJob(job.id, {
            description,
            external_id,
            tags,
            company_key: job.company_key || companySlug,
          });
        }
        stats.ok++;
        successes.push({ id: job.id, path, title: job.title, company: job.company });
        state.processed[job.id] = {
          status: DRY_RUN ? 'dry_ok' : 'ok',
          path,
          external_id,
        };
        if (!DRY_RUN) done.add(job.id);
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
    });
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
  if (!GEMINI_KEY && !DRY_RUN) {
    console.error('Need GEMINI_API_KEY');
    process.exit(1);
  }

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
      process.exit(0);
    }
    // If a full pass only skipped/failed, shard is effectively done for now
    if (result.ok === 0) {
      console.log(`ENRICH_COMPLETE worker=${WORKER_ID} totalOk=${totalOk} (no more writable)`);
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
