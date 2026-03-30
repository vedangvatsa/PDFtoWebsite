import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createHmac, createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────────────
const REGION     = process.env.AWS_SES_REGION || 'us-west-1';
const ACCESS_KEY = process.env.AWS_SES_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SES_SECRET_ACCESS_KEY;

if (!ACCESS_KEY || !SECRET_KEY) {
  console.error('❌ Missing AWS credentials. Set AWS_SES_ACCESS_KEY_ID and AWS_SES_SECRET_ACCESS_KEY');
  process.exit(1);
}

// ── Load remaining queue ────────────────────────────────────────────
const allEmails = JSON.parse(readFileSync(join(__dirname, 'hpair-verified.json'), 'utf8'));
let sent = [];
try { sent = JSON.parse(readFileSync(join(__dirname, 'hpair-sent.json'), 'utf8')); } catch {}
const sentSet = new Set(sent);
const remaining = allEmails.filter(e => !sentSet.has(e));

console.log(`🔍 Checking ${remaining.length} emails against SES suppression list\n`);

// ── AWS Sig V4 ──────────────────────────────────────────────────────
function hmac(key, data) { return createHmac('sha256', key).update(data).digest(); }
function sha256(data) { return createHash('sha256').update(data).digest('hex'); }
function getSignatureKey(sk, ds, r, s) {
  let k = hmac(`AWS4${sk}`, ds);
  k = hmac(k, r); k = hmac(k, s); k = hmac(k, 'aws4_request');
  return k;
}

async function checkSuppressed(email) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const dateStamp = amzDate.slice(0, 8);
  const host = `email.${REGION}.amazonaws.com`;
  const path = `/v2/email/suppression/addresses/${encodeURIComponent(email)}`;
  
  const payloadHash = sha256('');
  const canonicalHeaders = `host:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-date';
  const canonicalRequest = `GET\n${path}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const credentialScope = `${dateStamp}/${REGION}/ses/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${sha256(canonicalRequest)}`;
  const signingKey = getSignatureKey(SECRET_KEY, dateStamp, REGION, 'ses');
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  const authHeader = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`https://${host}${path}`, {
    method: 'GET',
    headers: {
      'X-Amz-Date': amzDate,
      'Authorization': authHeader,
    },
  });

  if (res.status === 404) return { email, suppressed: false };
  if (res.ok) {
    const data = await res.json();
    return { email, suppressed: true, reason: data.SuppressedDestination?.Reason || 'unknown' };
  }
  // Rate limited or error
  const text = await res.text();
  return { email, suppressed: false, error: text.slice(0, 100) };
}

// ── Check in batches ────────────────────────────────────────────────
const CONCURRENCY = 10;
const suppressed = [];
const errors = [];
let checked = 0;

for (let i = 0; i < remaining.length; i += CONCURRENCY) {
  const batch = remaining.slice(i, i + CONCURRENCY);
  const results = await Promise.all(batch.map(checkSuppressed));
  
  for (const r of results) {
    checked++;
    if (r.suppressed) {
      suppressed.push(r);
      console.log(`⛔ SUPPRESSED: ${r.email} — ${r.reason}`);
    }
    if (r.error) {
      errors.push(r);
    }
  }
  
  if (checked % 200 === 0 || checked >= remaining.length) {
    console.log(`  Checked ${checked}/${remaining.length} — ${suppressed.length} suppressed`);
  }
  
  // Small delay to avoid throttling
  await new Promise(r => setTimeout(r, 100));
}

console.log(`\n=== RESULTS ===`);
console.log(`Checked: ${checked}`);
console.log(`Suppressed: ${suppressed.length}`);
console.log(`Errors: ${errors.length}`);

if (suppressed.length > 0) {
  console.log(`\nSuppressed emails:`);
  suppressed.forEach(s => console.log(`  ${s.email} — ${s.reason}`));
  
  // Remove suppressed from verified list
  const suppressedSet = new Set(suppressed.map(s => s.email));
  const clean = allEmails.filter(e => !suppressedSet.has(e));
  writeFileSync(join(__dirname, 'hpair-verified.json'), JSON.stringify(clean, null, 2));
  console.log(`\n✅ Removed ${suppressed.length} suppressed emails from hpair-verified.json`);
  console.log(`📋 Clean list: ${clean.length} emails`);
} else {
  console.log(`\n✅ No suppressed emails found — list is clean!`);
}
