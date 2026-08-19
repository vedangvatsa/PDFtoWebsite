/**
 * Fellowship program pages are not jobs. fellowship-discover minted curated-jd
 * from news posts, closed cycles, and careers landings. Fail closed before
 * tagging curated-jd.
 *
 * A listing may publish only when it is a current cycle, a live apply surface,
 * a real ATS row, or an explicit allowlisted institute page (NASA / IISc / ERA).
 */

const ALLOW_COMPANY_KEYS = new Set(['nasa', 'iisc', 'era', 'erafellowship', 'sequoiacapital']);

const APPLY_HOSTS = new Set([
  'airtable.com',
  'typeform.com',
  'forms.gle',
  'docs.google.com',
  'forms.sparai.org',
]);

const ATS_HOST_RE =
  /(greenhouse\.io|lever\.co|ashbyhq\.com|smartrecruiters\.com|myworkdayjobs\.com|icims\.com)$/i;

const APPLY_PATH_RE = /\/(apply|application|apply-now|become-a-fellow)(\/|$)/i;

const NEWS_RE =
  /\/news\/|\/blog\/|\/blogs\/|in-the-news|welcomes-first|\/news-and-stories\/|explaining-/i;

const LANDING_PATH_RE =
  /^\/(careers|career|jobs)\/?$|^\/careers\/research\/?$|\/company\/careers$|\/about\/careers$|\/careers-at-|\/employment-opportunities|\/people\/fellows$/i;

const POLYMARKET_SCIENCE_RE = /\bpolymarket\s+science\s+fellowship\b/i;

function compactKey(job) {
  return String(job?.company_key || job?.company || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function yearsIn(text) {
  return [...String(text || '').matchAll(/\b(20\d{2})\b/g)].map((m) => Number(m[1]));
}

function hostAndPath(url) {
  try {
    const u = new URL(url);
    return {
      host: u.hostname.replace(/^www\./i, '').toLowerCase(),
      path: u.pathname.replace(/\/+$/, '') || '/',
    };
  } catch {
    return { host: '', path: '' };
  }
}

function isLiveApplySurface(url) {
  const { host, path } = hostAndPath(url);
  if (!host) return false;
  if (APPLY_HOSTS.has(host) || [...APPLY_HOSTS].some((h) => host.endsWith(`.${h}`))) {
    return true;
  }
  if (ATS_HOST_RE.test(host)) return true;
  if (APPLY_PATH_RE.test(path)) return true;
  return false;
}

/**
 * @returns {string|null} block reason, or null if publishing is allowed
 */
export function fellowshipPublishBlockReason(job, now = new Date()) {
  const title = String(job?.title || '');
  const url = String(job?.apply_url || '');
  const source = String(job?.source || '');
  const year = now.getUTCFullYear();
  const blob = `${title} ${url}`;
  const years = yearsIn(blob);
  const hasLiveYear = years.some((y) => y >= year);
  const pastOnly = years.length > 0 && years.every((y) => y < year);

  // This program is a real Polymarket Institute fellowship page, not an
  // aggregator directory. Keep the exact listing publishable even when the
  // source URL has no year or conventional /apply path.
  if (
    POLYMARKET_SCIENCE_RE.test(title) &&
    compactKey(job) === 'polymarket' &&
    /polymarket\.com/i.test(url)
  ) {
    return null;
  }

  if (ALLOW_COMPANY_KEYS.has(compactKey(job))) return null;
  if (/paused/i.test(title)) return 'paused_program';
  if (/^become a fellow$/i.test(title.trim())) return 'not_a_posting';
  if (pastOnly) return 'closed_cycle';
  if (NEWS_RE.test(url) || /explaining the|read more$/i.test(title)) return 'not_a_posting';

  const { path } = hostAndPath(url);
  if (LANDING_PATH_RE.test(path) || path === '/fellows') return 'not_a_posting';
  if (isLiveApplySurface(url)) return null;
  if (hasLiveYear) return null;

  // Scraped program directories with no current cycle and no apply form.
  if (source === 'fellowship-discover') return 'not_a_posting';
  return null;
}

export function isPublishableFellowshipListing(job, now = new Date()) {
  return fellowshipPublishBlockReason(job, now) == null;
}
