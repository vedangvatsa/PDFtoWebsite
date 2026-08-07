/**
 * Shared job public URL helpers for Telegram posters + enrich + sync.
 * Must stay aligned with src/lib/job-description.ts routing rules so posted
 * links never 404 on cvin.bio.
 */
import { createHash } from 'crypto';

export const RESERVED_JOB_SEGMENTS = new Set([
  'th', 'wa', 'tg', 'li', 'x', 'tw', 'ig', 'fb', 'bsky', 'yt', 'rd',
  'api', 'editor', 'login', 'signup', 'jobs', 'blog', 'admin',
]);

export function decodeHtmlEntities(s) {
  return String(s || '')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ');
}

export function companyToSlug(company) {
  return decodeHtmlEntities(company)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Segment-level check used by Next route /[slug]/[jobSlug]. */
export function isShortJobSlug(s) {
  if (!s || RESERVED_JOB_SEGMENTS.has(String(s).toLowerCase())) return false;
  return /^[a-z0-9][a-z0-9-]{0,23}$/i.test(s);
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

/**
 * Deterministic short pretty job slug from a title — SAME algorithm as
 * src/lib/job-description.ts mintPrettyJobSlug. `used` = slug segments already
 * taken at this company; per-company collisions get `{head≤6}-{2hex}`.
 */
export function mintPrettyJobSlug(title, uniqueSeed, used) {
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

  const taken = used ? (s) => used.has(s) : () => false;
  let slug = base;
  if (taken(slug) || RESERVED_JOB_SEGMENTS.has(slug)) {
    const h = createHash('md5').update(String(uniqueSeed)).digest('hex').slice(0, 2);
    const first = (base.split('-')[0] || 'role').slice(0, 6);
    slug = `${first}-${h}`;
  }
  let n = 2;
  while (
    taken(slug) ||
    RESERVED_JOB_SEGMENTS.has(slug) ||
    !/^[a-z0-9][a-z0-9-]{0,23}$/.test(slug)
  ) {
    // Widen the hash space as collisions pile up (2 hex → 4 hex → …) so the loop
    // always terminates even for hundreds of same-prefix titles at one company.
    const width = Math.min(2 + Math.floor(n / 8), 8);
    const h = createHash('md5').update(`${uniqueSeed}:${n++}`).digest('hex').slice(0, width);
    const head = (base.split('-')[0] || 'role').slice(0, 6);
    slug = `${head}-${h}`;
  }
  if (used) used.add(slug);
  return slug;
}

/** Full persisted slug `{company_slug}_{jobSlug}` for a job (minted at insert). */
export function persistedJobSlug(company, title, id, usedByCompany) {
  const co = companyToSlug(company);
  if (!co) return null;
  let used = usedByCompany.get(co);
  if (!used) {
    used = new Set();
    usedByCompany.set(co, used);
  }
  const jobSlug = mintPrettyJobSlug(title, id, used);
  return `${co}_${jobSlug}`;
}

/** The jobSlug segment from a stored slug ({company_slug}_{jobSlug}). */
export function storedSlugSegment(company, slug) {
  if (!slug) return null;
  const co = companyToSlug(company);
  if (!co) return null;
  const s = String(slug).toLowerCase();
  const prefix = `${co}_`;
  if (!s.startsWith(prefix)) return null;
  const rest = s.slice(prefix.length);
  if (!isShortJobSlug(rest) || /^[0-9a-f]{8,}$/i.test(rest)) return null;
  return rest;
}

/**
 * Canonical short pretty external_id (mint target).
 * Same rules as src/lib/job-description.ts shortJobSlug + enrich isPrettyExternalId.
 */
export function isPrettyExternalId(company, externalId) {
  if (!externalId) return false;
  const co = companyToSlug(company);
  if (!co) return false;
  const prefix = `${co}_`;
  if (!String(externalId).toLowerCase().startsWith(prefix)) return false;
  const rest = String(externalId).slice(prefix.length).toLowerCase();
  if (!isShortJobSlug(rest)) return false;
  if (/^[0-9a-f]{8,}$/i.test(rest)) return false;
  if (rest.length > 12 && /^\d+$/.test(rest)) return false;
  const parts = rest.split('-').filter(Boolean);
  if (parts.length === 0 || parts.length > 2) return false;
  if (parts.length === 1) return parts[0].length <= 12;
  if (/^[0-9a-f]{2,4}$/.test(parts[1])) return parts[0].length <= 6;
  return rest.length <= 8;
}

/**
 * Routeable on site today: company prefix + segment passes isShortJobSlug.
 * Broader than "pretty mint" — used to avoid reminting links Telegram already posted.
 */
export function isRouteableExternalId(company, externalId) {
  if (!externalId) return false;
  const co = companyToSlug(company);
  if (!co) return false;
  const prefix = `${co}_`;
  if (!String(externalId).toLowerCase().startsWith(prefix)) return false;
  const rest = String(externalId).slice(prefix.length).toLowerCase();
  if (!isShortJobSlug(rest)) return false;
  if (/^[0-9a-f]{8,}$/i.test(rest)) return false;
  return true;
}

/** Job slug segment from external_id when routeable; else null. */
export function shortJobSlug(company, externalId) {
  if (!isPrettyExternalId(company, externalId) && !isRouteableExternalId(company, externalId)) {
    // Only mint-style pretty for NEW public posts (Telegram).
    // For posting we require isPrettyExternalId — see jobPublicUrlForTelegram.
  }
  if (!isRouteableExternalId(company, externalId)) return null;
  const co = companyToSlug(company);
  return String(externalId).slice(co.length + 1).toLowerCase();
}

/**
 * Absolute public URL for Telegram / social.
 * Prefer persisted `slug` column, then /{company}/{slug} from a routeable
 * external_id. `prettyOnly: true` → null if not routeable (never emit
 * /jobs/{uuid} for TG). UUID fallback only when prettyOnly is false.
 */
export function jobPublicUrl(job, { prettyOnly = false, base = 'https://cvin.bio' } = {}) {
  const co = companyToSlug(job.company);
  if (co) {
    const slugSeg = storedSlugSegment(job.company, job.slug);
    if (slugSeg) return `${base}/${co}/${slugSeg}`;
    if (isRouteableExternalId(job.company, job.external_id)) {
      const rest = String(job.external_id).slice(co.length + 1).toLowerCase();
      return `${base}/${co}/${rest}`;
    }
  }
  if (prettyOnly) return null;
  if (job?.id) return `${base}/jobs/${job.id}`;
  return null;
}

/** Jobs older than this are 404 on public pages (job-snapshots isExpiredJob = 30d). */
export const JOB_PUBLIC_MAX_AGE_DAYS = 28;

/**
 * Mirror src/lib/job-snapshots.ts isExpiredJob (30d) with a small buffer.
 * Expired if published_at OR created_at is older than the window.
 */
export function isJobPubliclyLive(job, now = Date.now()) {
  const maxAgeMs = JOB_PUBLIC_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  for (const ts of [job.published_at, job.created_at]) {
    if (!ts) continue;
    const ms = new Date(ts).getTime();
    if (Number.isFinite(ms) && now - ms >= maxAgeMs) return false;
  }
  return true;
}

/**
 * Live HTTP check — only post if cvin.bio returns 2xx/3xx.
 * Soft-fail open on network errors when allowNetworkFail is true (CI flakiness).
 */
export async function assertJobUrlLive(url, { timeoutMs = 12_000, allowNetworkFail = false } = {}) {
  if (!url || !url.startsWith('https://cvin.bio/')) {
    return { ok: false, status: 0, reason: 'invalid_url' };
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    let res = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: ctrl.signal,
      headers: { 'user-agent': 'cvin-telegram-link-check/1', accept: 'text/html' },
    });
    // Follow one redirect hop (CF / trailing slash)
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = res.headers.get('location');
      if (loc) {
        const next = loc.startsWith('http') ? loc : new URL(loc, url).href;
        if (next.startsWith('https://cvin.bio/')) {
          res = await fetch(next, {
            method: 'GET',
            redirect: 'manual',
            signal: ctrl.signal,
            headers: { 'user-agent': 'cvin-telegram-link-check/1', accept: 'text/html' },
          });
        }
      }
    }
    const ok = res.status >= 200 && res.status < 400;
    return { ok, status: res.status, reason: ok ? 'ok' : `http_${res.status}` };
  } catch (e) {
    if (allowNetworkFail) return { ok: true, status: 0, reason: 'network_skip' };
    return { ok: false, status: 0, reason: `network:${String(e.message || e).slice(0, 80)}` };
  } finally {
    clearTimeout(t);
  }
}
