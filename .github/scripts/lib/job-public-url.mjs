/**
 * Shared job public URL helpers for Telegram posters + enrich.
 * Must stay aligned with src/lib/job-description.ts routing rules so posted
 * links never 404 on cvin.bio.
 */

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
 * Prefer /{company}/{slug} when external_id is routeable on site.
 * `prettyOnly: true` → null if not routeable (never emit /jobs/{uuid} for TG).
 * UUID fallback only when prettyOnly is false.
 */
export function jobPublicUrl(job, { prettyOnly = false, base = 'https://cvin.bio' } = {}) {
  const co = companyToSlug(job.company);
  // Routeable is enough for live pages; enrich must not remint these (see enrich script).
  if (co && isRouteableExternalId(job.company, job.external_id)) {
    const rest = String(job.external_id).slice(co.length + 1).toLowerCase();
    return `${base}/${co}/${rest}`;
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
