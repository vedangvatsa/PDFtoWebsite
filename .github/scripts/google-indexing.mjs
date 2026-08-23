/**
 * google-indexing.mjs — Google Indexing API notifications for job URLs.
 *
 * Google recommends the Indexing API over sitemaps for job posting URLs:
 * it prompts Googlebot to crawl new/updated URLs sooner.
 *
 * Env:
 *   GOOGLE_INDEXING_SERVICE_ACCOUNT  — full JSON of a GCP service account with
 *                                      the Indexing API enabled (project) and
 *                                      Owner access to the GSC property
 *   NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 *   SITE_URL (optional, default https://cvin.bio)
 *
 * Behavior:
 *   - Picks newest live public jobs (curated-jd, 600-word floor, not expired)
 *     with indexed created_at / published_at filters — never a 50k OR scan.
 *   - Publishes jobPublicPath URLs (/{company}/{slug}), never the first 8
 *     chars of external_id (those 404/301 and Google Jobs drops them).
 *   - Re-notifies URLs last pinged before SCHEMA_EPOCH so Google recrawls
 *     after JobPosting schema fixes (validThrough, applicantLocationRequirements).
 *   - Prefer refreshing URLs already in state (Google Jobs already knows them)
 *     before brand-new inventory.
 *   - URL_DELETED for state URLs that redirect / expired / lost curated-jd —
 *     not only those inside the capped live scan (that left dead Valid entries).
 *   - Removes run before publishes so daily quota cleans Google's index first.
 *
 * Usage: node .github/scripts/google-indexing.mjs
 * State: .github/scripts/google-indexing-state.json (committed)
 */
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { isJobExpired, JOB_MAX_AGE_DAYS } from '../../src/lib/job-age.mjs';
import { isPublicJobPage } from './lib/job-apply-source.mjs';
import { jobPublicPath } from './lib/job-public-url.mjs';
import { pingIndexNow } from './lib/indexnow.mjs';
import { ensureGscOwnership } from './ensure-gsc-ownership.mjs';
dotenv.config({ path: '.env.local' });
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, 'google-indexing-state.json');
const SITE_URL = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio').replace(/\/$/, '');
const DAILY_QUOTA = 200; // Indexing API free-tier limit (URLs per day)
// Bump this when JobPosting markup changes so live URLs get URL_UPDATED again.
const SCHEMA_EPOCH = '2026-08-22T00:00:00.000Z';
// 1000-row pages that include `description` + an OR date filter hit
// PostgREST statement timeout (~2.5m). Slim columns, small pages, cap the scan.
const PAGE_SIZE = 100;
const MAX_SCAN = 800;
/** Cap targeted dead-state checks so one run stays within Actions time. */
const MAX_DEAD_CHECK = 40;
/** Prefer cleaning dead Valid entries; leave the rest of the day for UPDATED. */
const MAX_REMOVE_PER_RUN = 80;
/** Description batches — 50× fat JD text trips PostgREST statement timeout. */
const HYDRATE_BATCH = 15;
const SLIM_COLS =
  'id,title,company,company_key,external_id,slug,tags,published_at,created_at,apply_url,category,source';

function isStatementTimeout(err) {
  const msg = String(err?.message || err || '');
  return /statement timeout|canceling statement/i.test(msg);
}

const SA_JSON = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT;
if (!SA_JSON) {
  console.log('GOOGLE_INDEXING_SERVICE_ACCOUNT not set. Skipping Indexing API.');
  process.exit(0);
}

const sa = JSON.parse(SA_JSON);
const SCOPE = 'https://www.googleapis.com/auth/indexing';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const INDEXING_API = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

// ── Supabase ─────────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// ── State ────────────────────────────────────────────────────────────────
function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { published: {} }; // url -> iso
  }
}

// ── JWT + OAuth token (no external deps — RS256 via node crypto) ────────
function base64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function makeJwt() {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const sig = base64url(signer.sign(sa.private_key));
  return `${header}.${claims}.${sig}`;
}

async function getAccessToken() {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: makeJwt(),
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Token error ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
  }
  return data.access_token;
}

// ── Indexing API calls ───────────────────────────────────────────────────
async function notify(token, url, type) {
  const res = await fetch(INDEXING_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, type }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // 409 = URL has been recently notified; treat as success.
    if (res.status === 409) return { ok: true, skipped: 'recently-notified' };
    // 429 = daily quota exhausted — stop the batch immediately (remaining URLs
    // stay unrecorded and get retried on the next run/day).
    if (res.status === 429) return { ok: false, quota: true, url, type };
    if (res.status === 403) return { ok: false, ownership: true, url, type };
    throw new Error(`Indexing ${type} ${url} → ${res.status}: ${JSON.stringify(data).slice(0, 200)}`);
  }
  return { ok: true };
}

function isFellowish(job) {
  return (
    /\bfellow/i.test(String(job?.title || '')) ||
    String(job?.category || '').toLowerCase() === 'fellowship' ||
    String(job?.source || '') === 'fellowship-discover'
  );
}

function logOwnershipHelp(url) {
  console.error(
    `\nIndexing API 403 URL ownership (${url}). Add this service account as Owner in Search Console on the Domain property cvin.bio — or the URL-prefix property https://cvin.bio/ (not only /jobs/): ${sa.client_email}`
  );
}

function isIndexable(job) {
  if (!isPublicJobPage(job)) return false;
  if (isJobExpired(job.published_at, job.created_at)) return false;
  return true;
}

function canonicalUrl(job) {
  const jobPath = jobPublicPath(job);
  if (!jobPath) return null;
  return `${SITE_URL}${jobPath}`;
}

function needsPublish(url, state) {
  const last = state.published[url];
  if (!last) return true;
  return new Date(last).getTime() < Date.parse(SCHEMA_EPOCH);
}

/** Parse https://cvin.bio/{company}/{jobSlug} or /jobs/{uuid}. */
function parseSiteJobUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname !== 'cvin.bio' && u.hostname !== 'www.cvin.bio') return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length === 2 && parts[0] === 'jobs') return { id: parts[1] };
    if (parts.length === 2) return { company: parts[0].toLowerCase(), jobSlug: parts[1].toLowerCase() };
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * True when this exact public URL is still a live JobPosting page.
 * Used for state URLs missed by MAX_SCAN (redirects / expired / uncurated).
 */
/**
 * True / false when known; null when the DB timed out (do not URL_DELETED).
 */
async function jobStillIndexableAtUrl(url) {
  const parsed = parseSiteJobUrl(url);
  if (!parsed) return false;

  try {
    let rows = [];
    if (parsed.id) {
      const { data, error } = await supabase.from('jobs').select(SLIM_COLS).eq('id', parsed.id).maybeSingle();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      if (data) rows = [data];
    } else {
      const { data, error } = await supabase
        .from('jobs')
        .select(SLIM_COLS)
        .eq('company_key', parsed.company)
        .ilike('slug', `%_${parsed.jobSlug}`)
        .limit(10);
      if (error) throw new Error(`Supabase error: ${error.message}`);
      rows = data || [];
    }

    if (!rows.length) return false;
    const hydrated = await hydrateDescriptions(rows);
    for (const job of hydrated) {
      if (canonicalUrl(job) === url && isIndexable(job)) return true;
    }
    return false;
  } catch (err) {
    if (isStatementTimeout(err)) {
      console.warn(`dead-check timeout for ${url}: ${err.message}`);
      return null;
    }
    throw err;
  }
}

/**
 * State URLs Google already has that are no longer live public pages.
 * Oldest first — most likely expired / redirected.
 */
async function findDeadStateUrls(state, liveUrls) {
  const suspects = Object.entries(state.published || {})
    .filter(([url]) => !liveUrls.has(url))
    .sort((a, b) => String(a[1]).localeCompare(String(b[1])))
    .slice(0, MAX_DEAD_CHECK);

  const dead = [];
  for (const [url] of suspects) {
    const stillLive = await jobStillIndexableAtUrl(url);
    if (stillLive === null) continue; // unknown — leave in state
    if (!stillLive) dead.push(url);
    if (dead.length >= MAX_REMOVE_PER_RUN) break;
  }
  return dead;
}

async function fetchSlimPages(since) {
  const all = [];
  for (let from = 0; from < MAX_SCAN; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('jobs')
      .select(SLIM_COLS)
      .contains('tags', ['curated-jd'])
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) {
      if (isStatementTimeout(error) && all.length) {
        console.warn(`fetchSlimPages created_at timeout at ${from}; using ${all.length} rows`);
        break;
      }
      throw new Error(`Supabase error: ${error.message}`);
    }
    if (!data?.length) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
  }
  // Indexed complement: live by published_at but ingested earlier.
  try {
    const { data: extra, error: extraErr } = await supabase
      .from('jobs')
      .select(SLIM_COLS)
      .contains('tags', ['curated-jd'])
      .gte('published_at', since)
      .lt('created_at', since)
      .order('published_at', { ascending: false })
      .limit(200);
    if (extraErr) {
      if (isStatementTimeout(extraErr)) {
        console.warn(`fetchSlimPages published_at complement timed out: ${extraErr.message}`);
      } else {
        throw new Error(`Supabase error: ${extraErr.message}`);
      }
    } else {
      const seen = new Set(all.map((j) => j.id));
      for (const row of extra || []) {
        if (!seen.has(row.id)) all.push(row);
      }
    }
  } catch (err) {
    if (!isStatementTimeout(err)) throw err;
    console.warn(`fetchSlimPages complement failed: ${err.message}`);
  }
  return all;
}

async function hydrateDescriptions(rows) {
  const out = new Map();
  for (let i = 0; i < rows.length; i += HYDRATE_BATCH) {
    const ids = rows.slice(i, i + HYDRATE_BATCH).map((j) => j.id);
    const { data, error } = await supabase.from('jobs').select('id,description').in('id', ids);
    if (error) {
      if (isStatementTimeout(error)) {
        console.warn(
          `hydrateDescriptions timeout on batch ${i}-${i + ids.length}; skipping those ids`
        );
        continue;
      }
      throw new Error(`Supabase error: ${error.message}`);
    }
    for (const row of data || []) out.set(row.id, row.description);
  }
  return rows.map((j) => ({ ...j, description: out.get(j.id) ?? j.description }));
}

async function fetchCandidateJobs() {
  const since = new Date(Date.now() - JOB_MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  try {
    return await hydrateDescriptions(await fetchSlimPages(since));
  } catch (err) {
    if (isStatementTimeout(err)) {
      console.error(`fetchCandidateJobs timed out: ${err.message}`);
      return [];
    }
    throw err;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  try {
    await ensureGscOwnership();
  } catch (err) {
    console.error('GSC ownership ensure failed:', err.message);
  }

  const jobs = await fetchCandidateJobs();
  if (!jobs.length) {
    console.log(`No jobs in the last ${JOB_MAX_AGE_DAYS}d listing window.`);
    return;
  }

  const state = loadState();
  const token = await getAccessToken();

  const liveUrls = new Set();
  const toPublish = [];
  for (const job of jobs) {
    const url = canonicalUrl(job);
    if (!url) continue;
    if (isIndexable(job)) {
      liveUrls.add(url);
      if (needsPublish(url, state)) toPublish.push({ url, job });
    }
  }

  // Dead state URLs (redirect / expired / uncurated) — verify beyond MAX_SCAN.
  // Do not require fetchedUrls; that left Google Valid entries hanging.
  const toRemove = await findDeadStateUrls(state, liveUrls);

  // Free-tier quota: removes first (clean Valid drop), then UPDATED.
  // Prefer URLs Google already knows (in state) for SCHEMA_EPOCH refresh.
  const budget = Math.max(0, DAILY_QUOTA - Math.min(toRemove.length, MAX_REMOVE_PER_RUN));
  const removeBatch = toRemove.slice(0, MAX_REMOVE_PER_RUN);
  toPublish.sort((a, b) => {
    const knownA = state.published?.[a.url] ? 1 : 0;
    const knownB = state.published?.[b.url] ? 1 : 0;
    if (knownA !== knownB) return knownB - knownA;
    const fellow = (j) => (isFellowish(j) ? 1 : 0);
    if (fellow(a.job) !== fellow(b.job)) return fellow(a.job) - fellow(b.job);
    const newest = (j) =>
      Math.max(
        0,
        ...[j.published_at, j.created_at].map((ts) => (ts ? new Date(ts).getTime() : 0))
      );
    return newest(b.job) - newest(a.job);
  });
  const publishBatch = toPublish.slice(0, budget);

  console.log(
    `${jobs.length} live-window rows; ${liveUrls.size} public URLs; ${toPublish.length} to publish (${publishBatch.length} within quota), ${toRemove.length} dead state (${removeBatch.length} to remove)`
  );

  let published = 0;
  let removed = 0;
  let errors = 0;
  let useUuidFallback = false;
  let quotaHit = false;

  // Removes first — stop Valid from counting redirect/no-JobPosting URLs.
  for (const url of removeBatch) {
    const r = await notify(token, url, 'URL_DELETED');
    if (r.ok) {
      delete state.published[url];
      removed++;
      process.stdout.write('-');
    } else if (r.quota) {
      console.log(`\n  ⏸ quota hit at remove ${url} — stopping`);
      quotaHit = true;
      break;
    } else if (r.ownership) {
      logOwnershipHelp(url);
      break;
    } else {
      errors++;
      console.error(`\n  ✗ remove ${url}: ${r.error?.message || 'failed'}`);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }

  // Google recommends at most ~1 URL per second; batch in small chunks with pauses.
  if (!quotaHit) {
    for (const { url, job } of publishBatch) {
      const target = useUuidFallback && job?.id ? `${SITE_URL}/jobs/${job.id}` : url;
      let r = await notify(token, target, 'URL_UPDATED');
      if (r.ownership && !useUuidFallback && job?.id) {
        const uuidUrl = `${SITE_URL}/jobs/${job.id}`;
        const r2 = await notify(token, uuidUrl, 'URL_UPDATED');
        if (r2.ok) {
          console.log(
            '\n  Indexing API accepted /jobs/{id} but not pretty URLs. GSC is likely a /jobs prefix — add the service account as Owner on sc-domain:cvin.bio.'
          );
          useUuidFallback = true;
          r = r2;
        } else if (r2.ownership) {
          logOwnershipHelp(url);
          break;
        } else {
          r = r2;
        }
      } else if (r.ownership) {
        logOwnershipHelp(url);
        break;
      }
      if (r.ok) {
        state.published[url] = new Date().toISOString();
        published++;
        process.stdout.write('+');
      } else if (r.quota) {
        console.log(`\n  ⏸ quota hit at ${url} — stopping (retries next run/day)`);
        break;
      } else if (!r.ownership) {
        errors++;
        console.error(`\n  ✗ publish ${url}: ${r.error?.message || 'failed'}`);
      }
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  // Prune state to last 10k URLs to keep the file small.
  const entries = Object.entries(state.published).slice(-10000);
  state.published = Object.fromEntries(entries);
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

  console.log(`\nIndexing done: +${published} published, -${removed} removed, ${errors} errors`);
  try {
    const citePages = [
      `${SITE_URL}/`,
      `${SITE_URL}/jobs`,
      `${SITE_URL}/contact`,
      `${SITE_URL}/ai`,
      `${SITE_URL}/flexboard`,
      `${SITE_URL}/hiring`,
      `${SITE_URL}/discover`,
    ];
    const ping = await pingIndexNow([...citePages, ...publishBatch.map((x) => x.url)]);
    console.log(`IndexNow: submitted ${ping.submitted || 0} URLs (citation pages + jobs)`);
  } catch (e) {
    console.warn(`IndexNow skipped: ${e.message}`);
  }
  if (published > 0 || removed > 0) {
    // Persist state for the workflow commit step.
    console.log('STATE_CHANGED');
  }
}

main().catch((e) => {
  console.error('Indexing API run failed:', e.message);
  process.exit(1);
});
