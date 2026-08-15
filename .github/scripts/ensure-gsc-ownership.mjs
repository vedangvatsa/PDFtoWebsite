/**
 * Verify cvin.bio for the Indexing API service account.
 *
 * Indexing API 403 "URL ownership" means the JWT works but this SA is not a
 * Search Console / Site Verification owner. A human GSC property is not enough.
 *
 * This script (same SA as google-indexing.mjs):
 *   1. Enables Site Verification if the project allows it
 *   2. Asks Google for a DNS TXT token for this SA
 *   3. Upserts that TXT on Cloudflare (does not touch existing records)
 *   4. Calls webResource.insert so the SA owns sc-domain:cvin.bio
 *
 * Env: GOOGLE_INDEXING_SERVICE_ACCOUNT, CLOUDFLARE_API_KEY + CLOUDFLARE_EMAIL
 *      (CLOUDFLARE_API_TOKEN used if it can read the zone)
 */
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const DOMAIN = 'cvin.bio';
const SITE_URL = 'https://cvin.bio/';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const VERIFY_API = 'https://www.googleapis.com/siteVerification/v1';
const WEBMASTERS = 'https://www.googleapis.com/webmasters/v3/sites';

function base64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function parseSa() {
  const raw = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT;
  if (!raw) return null;
  return JSON.parse(raw);
}

function makeJwt(sa, scope) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  return `${header}.${claims}.${base64url(signer.sign(sa.private_key))}`;
}

async function getAccessToken(sa, scope) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: makeJwt(sa, scope),
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Token error ${res.status}: ${JSON.stringify(data).slice(0, 240)}`);
  }
  return data.access_token;
}

function cfHeaders() {
  const token = (process.env.CLOUDFLARE_API_TOKEN || '').trim();
  const key = (process.env.CLOUDFLARE_API_KEY || '').trim();
  const email = (process.env.CLOUDFLARE_EMAIL || '').trim();
  if (key && email) return { 'X-Auth-Email': email, 'X-Auth-Key': key };
  if (token) return { Authorization: `Bearer ${token}` };
  return null;
}

async function cf(path, opts = {}) {
  const headers = cfHeaders();
  if (!headers) throw new Error('Missing CLOUDFLARE_API_KEY+EMAIL (or CLOUDFLARE_API_TOKEN)');
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...opts,
    headers: { ...headers, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    const msg = data.errors?.[0]?.message || JSON.stringify(data).slice(0, 200);
    throw new Error(`Cloudflare ${path} → ${res.status}: ${msg}`);
  }
  return data;
}

async function googleJson(token, url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

function ownsCvin(items) {
  return (items || []).some((item) => {
    const id = String(item?.site?.identifier || item?.id || '').toLowerCase();
    return id.includes('cvin.bio');
  });
}

async function enableApis(sa) {
  try {
    const token = await getAccessToken(sa, 'https://www.googleapis.com/auth/cloud-platform');
    for (const svc of [
      'siteverification.googleapis.com',
      'webmasters.googleapis.com',
      'indexing.googleapis.com',
    ]) {
      const { res, data } = await googleJson(
        token,
        `https://serviceusage.googleapis.com/v1/projects/${sa.project_id}/services/${svc}:enable`,
        { method: 'POST', body: '{}' }
      );
      if (res.ok || res.status === 409) {
        console.log(`API ${svc}: ${res.status === 409 ? 'already on' : 'enabled'}`);
      } else {
        console.warn(`API ${svc}: ${res.status} ${JSON.stringify(data).slice(0, 160)}`);
      }
    }
  } catch (err) {
    console.warn(`Could not enable Google APIs (${err.message}). Continuing.`);
  }
}

async function upsertTxt(tokenValue) {
  const zones = await cf(`/zones?name=${DOMAIN}`);
  const zoneId = zones.result?.[0]?.id;
  if (!zoneId) throw new Error(`Cloudflare zone ${DOMAIN} not found`);
  const list = await cf(`/zones/${zoneId}/dns_records?type=TXT&name=${DOMAIN}&per_page=100`);
  const content = tokenValue.replace(/^"|"$/g, '');
  const existing = (list.result || []).find((r) => String(r.content).replace(/"/g, '') === content);
  if (existing) {
    console.log('DNS TXT for this service account already present');
    return;
  }
  await cf(`/zones/${zoneId}/dns_records`, {
    method: 'POST',
    body: JSON.stringify({ type: 'TXT', name: DOMAIN, content, ttl: 3600 }),
  });
  console.log('Wrote DNS TXT google-site-verification for the Indexing API service account');
}

async function addSearchConsoleProperties(token) {
  for (const site of [`sc-domain:${DOMAIN}`, SITE_URL]) {
    const { res, data } = await googleJson(token, `${WEBMASTERS}/${encodeURIComponent(site)}`, {
      method: 'PUT',
    });
    if (res.ok || res.status === 204 || res.status === 409) {
      console.log(`Search Console property ${site}: ok`);
    } else {
      console.warn(`Search Console ${site}: ${res.status} ${JSON.stringify(data).slice(0, 160)}`);
    }
  }
}

export async function ensureGscOwnership() {
  const sa = parseSa();
  if (!sa) {
    console.log('GOOGLE_INDEXING_SERVICE_ACCOUNT not set — skip ownership ensure');
    return { ok: false, skipped: true };
  }
  console.log(`Ensuring GSC ownership for ${sa.client_email} on ${DOMAIN}`);

  await enableApis(sa);
  const token = await getAccessToken(sa, 'https://www.googleapis.com/auth/siteverification');

  const listed = await googleJson(token, `${VERIFY_API}/webResource`);
  if (listed.res.ok && ownsCvin(listed.data.items)) {
    console.log('Service account already owns cvin.bio');
    try {
      const wm = await getAccessToken(sa, 'https://www.googleapis.com/auth/webmasters');
      await addSearchConsoleProperties(wm);
    } catch (err) {
      console.warn(`Search Console add skipped: ${err.message}`);
    }
    return { ok: true, already: true, email: sa.client_email };
  }
  if (!listed.res.ok && listed.res.status !== 404) {
    console.warn(
      `Site Verification list ${listed.res.status}: ${JSON.stringify(listed.data).slice(0, 200)}`
    );
  }

  const tok = await googleJson(token, `${VERIFY_API}/token`, {
    method: 'POST',
    body: JSON.stringify({
      verificationMethod: 'DNS_TXT',
      site: { type: 'INET_DOMAIN', identifier: DOMAIN },
    }),
  });
  if (!tok.res.ok || !tok.data.token) {
    throw new Error(
      `getToken failed ${tok.res.status}: ${JSON.stringify(tok.data).slice(0, 240)}`
    );
  }

  await upsertTxt(tok.data.token);

  let last = tok;
  for (let i = 0; i < 6; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 8000 * i));
    last = await googleJson(token, `${VERIFY_API}/webResource?verificationMethod=DNS_TXT`, {
      method: 'POST',
      body: JSON.stringify({ site: { type: 'INET_DOMAIN', identifier: DOMAIN } }),
    });
    if (last.res.ok || last.res.status === 409) {
      console.log(`Verified INET_DOMAIN ${DOMAIN} for ${sa.client_email}`);
      try {
        const wm = await getAccessToken(sa, 'https://www.googleapis.com/auth/webmasters');
        await addSearchConsoleProperties(wm);
      } catch (err) {
        console.warn(`Search Console add skipped: ${err.message}`);
      }
      return { ok: true, email: sa.client_email };
    }
    console.warn(
      `verify attempt ${i + 1}: ${last.res.status} ${JSON.stringify(last.data).slice(0, 180)}`
    );
  }
  throw new Error(
    `Site Verification insert failed: ${JSON.stringify(last.data).slice(0, 240)}`
  );
}

if (process.argv[1] && process.argv[1].endsWith('ensure-gsc-ownership.mjs')) {
  ensureGscOwnership()
    .then((r) => {
      if (!r.ok && !r.skipped) process.exit(1);
    })
    .catch((err) => {
      console.error('ensure-gsc-ownership failed:', err.message);
      process.exit(1);
    });
}
