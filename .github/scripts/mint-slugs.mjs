#!/usr/bin/env node
/**
 * Mint short pretty slugs (external_id = {company_slug}_{slug}) for ALL live
 * non-curated jobs so every public URL is /{company}/{slug} — never /jobs/{uuid}.
 *
 * Pure DB work (no AI, no scraping). Mirrors the slug logic in
 * enrich-remote-job-descriptions.mjs (deterministic per title+id), so RE_ENRICH
 * running concurrently produces identical slugs for the same job.
 *
 * Usage:
 *   DRY_RUN=1 node .github/scripts/mint-slugs.mjs        # count only
 *   CONCURRENCY=12 node .github/scripts/mint-slugs.mjs   # mint for real
 *   FORCE=1 CONCURRENCY=12 node .github/scripts/mint-slugs.mjs  # re-mint ALL live jobs (short rule)
 *
 * WARNING: FORCE rewrites external_id and therefore public URLs. There are no
 * redirects from old pretty slugs → new ones. Prefer FORCE only for staging or
 * when you accept breaking shared/indexed /{company}/{slug} links.
 */
import { createHash } from 'crypto';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  isRouteableExternalId,
  storedSlugSegment as libStoredSlugSegment,
} from './lib/job-public-url.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const DRY_RUN = process.env.DRY_RUN === '1';
const FORCE = process.env.FORCE === '1';
const CONCURRENCY = Math.max(1, Math.min(16, Number(process.env.CONCURRENCY || 8)));
const ONLY_COMPANY = process.env.ONLY_COMPANY ? companyToSlug(process.env.ONLY_COMPANY) : null;

if (!U || !K) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const headers = { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' };
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

/** UTM suffixes + app routes — never emit these as standalone job slug segments. */
const RESERVED_SLUGS = new Set([
  'th', 'wa', 'tg', 'li', 'x', 'tw', 'ig', 'fb', 'bsky', 'yt', 'rd',
  'api', 'editor', 'login', 'signup', 'jobs', 'blog', 'admin',
]);

/**
 * Short pretty slug only:
 *  - `{company}_{slug}` where slug is 1–2 tokens
 *  - 1 token ≤ 12 chars; 2 semantic tokens total ≤ 8 chars
 *  - collision form: `{head≤6}-{2hex}` (e.g. eng-a3)
 * Longer / ATS / multi-token ids are NOT pretty → will be reminted.
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
  // two parts: either short semantic (≤8) or head+hash collision
  if (/^[0-9a-f]{2,4}$/.test(parts[1])) return parts[0].length <= 6;
  return rest.length <= 8;
}

const SLUG_STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'for', 'to', 'in', 'on', 'at', 'by', 'with',
  'from', 'as', 'is', 'are', 'be', 'remote', 'full', 'time', 'fulltime', 'part',
  'contract', 'intern', 'internship', 'senior', 'junior', 'staff', 'principal',
  'i', 'ii', 'iii', 'iv', 'sr', 'jr', 'us', 'uk', 'eu', 'emea', 'apac', 'americas',
  'month', 'months', 'fixed', 'term', 'temporary', 'opening', 'role', 'position',
  'opportunity', 'new', 'based',
]);

const SLUG_ALIAS = {
  software: 'sw', engineer: 'eng', engineering: 'eng', engineers: 'eng',
  manager: 'mgr', management: 'mgmt', director: 'dir', product: 'prod',
  platform: 'plat', developer: 'dev', development: 'dev', designer: 'design',
  design: 'design', analyst: 'analyst', analytics: 'analytics',
  scientist: 'sci', science: 'sci', specialist: 'spec', operations: 'ops',
  operator: 'ops', technical: 'tech', technology: 'tech', solutions: 'sol',
  solution: 'sol', architect: 'arch', architecture: 'arch',
  infrastructure: 'infra', security: 'sec', compliance: 'comply',
  marketing: 'mkt', sales: 'sales', customer: 'cust', support: 'support',
  research: 'research', machine: 'ml', learning: null, artificial: 'ai',
  intelligence: null, frontend: 'fe', backend: 'be', fullstack: 'fullstk',
  'full-stack': 'fullstk', mobile: 'mobile', data: 'data', cloud: 'cloud',
  devops: 'devops', reliability: 'sre', site: null, lead: 'lead', head: 'head',
  vice: 'vp', president: null, associate: 'assoc', assistant: 'asst',
  coordinator: 'coord', consultant: 'consult', partner: 'partner',
  account: 'acct', finance: 'fin', financial: 'fin', accounting: 'acct',
  legal: 'legal', people: 'people', human: 'hr', resources: null,
  recruiter: 'recruit', recruiting: 'recruit', growth: 'growth',
  revenue: 'rev', strategy: 'strat', strategic: 'strat', business: 'biz',
  program: 'prog', project: 'proj', network: 'net', systems: 'sys',
  system: 'sys', application: 'app', applications: 'app', quality: 'qa',
  assurance: null, testing: 'qa', automation: 'auto', healthcare: 'health',
  health: 'health', clinical: 'clinic', medical: 'med',
  generaliste: 'gp', medecin: 'md', médecin: 'md',
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
    // Widen hash space as collisions pile up so the loop always terminates
    // (2 hex → 4 hex → …) for hundreds of same-prefix titles at one company.
    const width = Math.min(2 + Math.floor(n / 8), 8);
    const h = createHash('md5').update(`${uniqueSeed}:${n++}`).digest('hex').slice(0, width);
    const head = (base.split('-')[0] || 'role').slice(0, 6);
    slug = `${head}-${h}`;
  }
  used.add(slug);
  return slug;
}

async function fetchRows(url, label) {
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const r = await fetch(url, { headers, signal: AbortSignal.timeout(45000) });
      if (!r.ok) {
        const t = await r.text();
        throw new Error(`${label} HTTP ${r.status}: ${t.slice(0, 160)}`);
      }
      return await r.json();
    } catch (e) {
      lastErr = e;
      if (attempt < 4) {
        const wait = Math.min(20000, 1000 * 2 ** (attempt - 1));
        console.warn(`  ⚠️  ${label} attempt ${attempt} failed (${e.name || e.message}); retry in ${wait}ms`);
        await sleep(wait);
      }
    }
  }
  throw lastErr;
}

/** Page through a PostgREST query, running the same URL shape each iteration. */
async function pageAll({ select, extraFilters, limit = 1000, label }) {
  const out = [];
  let offset = 0;
  while (true) {
    const url = `${U}/rest/v1/jobs?select=${select}${extraFilters}&limit=${limit}&offset=${offset}`;
    const rows = await fetchRows(url, `${label}-${offset}`);
    if (!Array.isArray(rows) || !rows.length) break;
    out.push(...rows);
    if (out.length % 10000 === 0 || rows.length < limit) {
      console.log(`  … ${label}: ${out.length} rows`);
    }
    if (rows.length < limit) break;
    offset += limit;
  }
  return out;
}

async function main() {
  const t0 = Date.now();
  console.log(`mint-slugs: dry=${DRY_RUN ? 1 : 0} concurrency=${CONCURRENCY} onlyCompany=${ONLY_COMPANY || 'all'}`);

  // Fetch the FULL live table (no date window) so the used-set can reserve the
  // whole URL namespace — every routeable slug column AND external_id segment.
  // Previously only a 30-day window of external_ids was scanned, so a freshly
  // minted external_id could claim a segment another job's slug owned (or vice
  // versa), producing shadowed-slug URLs that 308-looped.
  const all = await pageAll({
    select: 'id,title,company,external_id,slug,created_at,published_at',
    extraFilters: `&apply_url=not.is.null&order=id.asc`,
    label: 'jobs',
  });
  console.log(`Fetched ${all.length} live jobs (${Math.round((Date.now() - t0) / 1000)}s)`);

  // Remint scope stays the recent 30-day window unless FORCE=1: created recently
  // AND (unpublished or published recently), mirroring the old DB filter.
  const cutoff = Date.now() - 30 * 86400000;
  const jobs = FORCE
    ? all
    : all.filter((j) => {
        const created = j.created_at ? new Date(j.created_at).getTime() : 0;
        const published = j.published_at ? new Date(j.published_at).getTime() : 0;
        return created > cutoff && (j.published_at == null || published > cutoff);
      });
  console.log(`  scope: ${jobs.length} jobs to evaluate${FORCE ? ' (FORCE)' : ''}`);

  const need = [];
  const already = [];
  const noTitle = [];
  for (const j of jobs) {
    const co = companyToSlug(j.company);
    if (ONLY_COMPANY && co !== ONLY_COMPANY) continue;
    // FORCE remints even short/pretty; default only remints long/ATS/missing slugs
    if (!FORCE && isPrettyExternalId(j.company, j.external_id)) {
      already.push(j);
    } else if (!j.title || !String(j.title).trim()) {
      noTitle.push(j);
    } else {
      need.push(j);
    }
  }
  console.log(
    `  already short-pretty: ${already.length} | need remint: ${need.length} | no title: ${noTitle.length}${FORCE ? ' (FORCE)' : ''}`
  );

  if (need.length === 0) {
    console.log('Nothing to remint.');
    return;
  }

  // Build used-sets from the FULL table: routeable slug segments + external_id
  // segments reserve the entire per-company URL namespace.
  console.log('Building used-sets from full job namespace…');
  const usedByCompany = new Map();
  let reservedCount = 0;
  for (const row of all) {
    const co = companyToSlug(row.company);
    if (!co) continue;
    if (!usedByCompany.has(co)) usedByCompany.set(co, new Set());
    const used = usedByCompany.get(co);
    const slugSeg = libStoredSlugSegment(row.company, row.slug);
    if (slugSeg) {
      used.add(slugSeg);
      reservedCount++;
    }
    if (row.external_id) {
      const prefix = `${co}_`;
      const ext = String(row.external_id);
      if (isRouteableExternalId(row.company, row.external_id)) {
        const rest = ext.slice(prefix.length).toLowerCase();
        used.add(rest);
        reservedCount++;
      } else if (ext.toLowerCase().startsWith(prefix)) {
        used.add(ext.slice(prefix.length).toLowerCase());
        reservedCount++;
      } else {
        used.add(ext.toLowerCase());
        reservedCount++;
      }
    }
  }
  console.log(`  ${reservedCount} keys reserved across ${usedByCompany.size} companies (${Math.round((Date.now() - t0) / 1000)}s)`);
  console.log(`Reminting ${need.length} jobs (concurrency=${CONCURRENCY})…`);

  const stats = { ok: 0, fail: 0, collision: 0, reasons: {} };
  let idx = 0;

  async function worker() {
    while (true) {
      const pos = idx++;
      if (pos >= need.length) return;
      const job = need[pos];
      const co = companyToSlug(job.company);
      try {
        let used = usedByCompany.get(co);
        if (!used) {
          used = new Set();
          usedByCompany.set(co, used);
        }
        const old = job.external_id || '';
        if (old.toLowerCase().startsWith(`${co}_`)) {
          used.delete(old.slice(co.length + 1).toLowerCase());
        }
        const ownSlugSeg = libStoredSlugSegment(job.company, job.slug);
        if (ownSlugSeg) used.delete(ownSlugSeg);
        let slug = prettyJobSlug(job.title, job.id, used);
        let externalId = `${co}_${slug}`;
        if (!DRY_RUN) {
          try {
            await patchExternalId(job.id, externalId);
          } catch (e) {
            if (String(e.message || e).includes('23505') || String(e.message || e).includes('409')) {
              // Stay short: head≤6 + 2-hex (matches prettyJobSlug collision form)
              const hash = createHash('md5').update(job.id).digest('hex').slice(0, 2);
              const head = (slug.split('-')[0] || 'role').slice(0, 6);
              slug = `${head}-${hash}`;
              externalId = `${co}_${slug}`;
              // if still colliding, one more unique try
              try {
                await patchExternalId(job.id, externalId);
              } catch (e2) {
                const hash2 = createHash('md5').update(`${job.id}:x`).digest('hex').slice(0, 2);
                slug = `${head.slice(0, 5)}${hash2}`;
                if (slug.length > 8) slug = slug.slice(0, 8);
                externalId = `${co}_${slug}`;
                await patchExternalId(job.id, externalId);
              }
              used.add(slug);
              stats.collision++;
            } else {
              throw e;
            }
          }
        }
        stats.ok++;
        if (stats.ok % 500 === 0) {
          const rate = Math.round((stats.ok + stats.fail) / ((Date.now() - t0) / 60000));
          console.log(`  … ok ${stats.ok} / fail ${stats.fail} (${rate}/min)`);
        }
      } catch (e) {
        stats.fail++;
        const reason = String(e.message || e).slice(0, 80);
        stats.reasons[reason] = (stats.reasons[reason] || 0) + 1;
        if (stats.fail <= 20) console.error(`  ✗ ${job.id}: ${reason}`);
      }
    }
  }

  await Promise.all(Array.from({ length: DRY_RUN ? 1 : CONCURRENCY }, () => worker()));

  console.log(`Done: ok=${stats.ok} fail=${stats.fail} collision=${stats.collision} in ${Math.round((Date.now() - t0) / 1000)}s`);
  if (stats.fail) {
    const top = Object.entries(stats.reasons).sort((a, b) => b[1] - a[1]).slice(0, 8);
    for (const [reason, n] of top) console.log(`  fail[${n}] ${reason}`);
  }
}

async function patchExternalId(id, externalId) {
  const url = `${U}/rest/v1/jobs?id=eq.${id}`;
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch(url, {
        method: 'PATCH',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify({ external_id: externalId }),
        signal: AbortSignal.timeout(30000),
      });
      if (!r.ok) {
        const t = await r.text();
        throw new Error(`patch_${r.status}:${t.slice(0, 200)}`);
      }
      return;
    } catch (e) {
      lastErr = e;
      const msg = String(e.message || e);
      if (attempt < 3 && (msg.includes('fetch failed') || msg.includes('aborted') || /patch_5\d\d:/.test(msg))) {
        await sleep(1000 * attempt);
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

main().catch((e) => {
  console.error('mint-slugs failed:', e.message);
  process.exit(1);
});
