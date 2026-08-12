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
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — candidate job rows
 *   SITE_URL (optional, default https://cvin.bio)
 *
 * Behavior:
 *   - Picks jobs published in the last 24h that are indexable (curated-jd,
 *     not expired, not banned) and not already notified (state file).
 *   - Publishes their canonical pretty URLs to the Indexing API (batches).
 *   - Also sends remove notifications for URLs whose jobs went expired
 *     (validThrough in the past / markup removed).
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
dotenv.config({ path: '.env.local' });
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, 'google-indexing-state.json');
const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio';
const LOOKBACK_HOURS = 24 * 7; // jobs sync cadence is <daily; 7d covers gaps
const DAILY_QUOTA = 200; // Indexing API free-tier limit (URLs per day)

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
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    throw new Error(`Indexing ${type} ${url} → ${res.status}: ${JSON.stringify(data).slice(0, 200)}`);
  }
  return { ok: true };
}

function isIndexable(job) {
  const tags = Array.isArray(job.tags) ? job.tags : [];
  if (!tags.includes('curated-jd')) return false;
  if (isJobExpired(job.published_at, job.created_at)) return false;
  return true;
}

/** Same expiry rule as the site (src/lib/job-age.ts): ~30 day listing window. */
function isJobExpired(publishedAt, createdAt) {
  const base = publishedAt || createdAt;
  if (!base) return false;
  const ms = new Date(base).getTime();
  if (!Number.isFinite(ms)) return false;
  return Date.now() - ms > 30 * 24 * 60 * 60 * 1000;
}

function canonicalUrl(job) {
  if (!job.external_id) return null;
  const company = (job.company || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
  if (!company) return null;
  const id = (job.external_id || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+/, '').slice(0, 8) || '';
  if (!id) return null;
  return `${SITE_URL}/${company}/${id}`;
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  const since = new Date(Date.now() - LOOKBACK_HOURS * 3600 * 1000).toISOString();
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id,title,company,external_id,tags,published_at,created_at')
    .gte('created_at', since)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(50000);

  if (error) throw new Error(`Supabase error: ${error.message}`);
  if (!jobs || jobs.length === 0) {
    console.log(`No jobs created in the last ${LOOKBACK_HOURS}h.`);
    return;
  }

  const state = loadState();
  const token = await getAccessToken();

  const toPublish = [];
  const toRemove = [];
  for (const job of jobs) {
    const url = canonicalUrl(job);
    if (!url) continue;
    if (isIndexable(job)) {
      if (!state.published[url]) toPublish.push({ url, job });
    } else {
      // Was previously notified but now closed → tell Google to drop it.
      if (state.published[url]) {
        toRemove.push(url);
        delete state.published[url];
      }
    }
  }

  // Free-tier quota: max 200 URL notifications per day. Prioritize the
  // most recently published jobs; the state file prevents re-notification,
  // so older backlog URLs get covered on later days as quota frees up.
  const budget = DAILY_QUOTA - toRemove.length;
  toPublish.sort((a, b) => {
    const pa = new Date(a.job.published_at || a.job.created_at || 0).getTime();
    const pb = new Date(b.job.published_at || b.job.created_at || 0).getTime();
    return pb - pa;
  });
  const publishBatch = toPublish.slice(0, Math.max(0, budget));

  console.log(
    `${jobs.length} new/changed rows; ${toPublish.length} to publish (${publishBatch.length} within quota), ${toRemove.length} to remove`
  );

  let published = 0;
  let removed = 0;
  let errors = 0;

  // Google recommends at most ~1 URL per second; batch in small chunks with pauses.
  for (const { url } of publishBatch) {
    try {
      await notify(token, url, 'URL_UPDATED');
      state.published[url] = new Date().toISOString();
      published++;
      process.stdout.write('+');
    } catch (e) {
      errors++;
      console.error(`\n  ✗ publish ${url}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }

  for (const url of toRemove) {
    try {
      await notify(token, url, 'URL_DELETED');
      removed++;
      process.stdout.write('-');
    } catch (e) {
      errors++;
      console.error(`\n  ✗ remove ${url}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }

  // Prune state to last 10k URLs to keep the file small.
  const entries = Object.entries(state.published).slice(-10000);
  state.published = Object.fromEntries(entries);
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

  console.log(`\nIndexing done: +${published} published, -${removed} removed, ${errors} errors`);
  if (published > 0 || removed > 0) {
    // Persist state for the workflow commit step.
    console.log('STATE_CHANGED');
  }
}

main().catch((e) => {
  console.error('Indexing API run failed:', e.message);
  process.exit(1);
});
