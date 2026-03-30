import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createHmac, createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

const REGION     = process.env.AWS_SES_REGION || 'us-west-1';
const ACCESS_KEY = process.env.AWS_SES_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SES_SECRET_ACCESS_KEY;

if (!ACCESS_KEY || !SECRET_KEY) { console.error('❌ Missing AWS creds'); process.exit(1); }

function hmac(key, data) { return createHmac('sha256', key).update(data).digest(); }
function sha256(data) { return createHash('sha256').update(data).digest('hex'); }
function getSignatureKey(sk, ds, r, s) {
  let k = hmac(`AWS4${sk}`, ds); k = hmac(k, r); k = hmac(k, s); k = hmac(k, 'aws4_request'); return k;
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
    headers: { 'X-Amz-Date': amzDate, 'Authorization': authHeader },
  });

  if (res.status === 404) return { email, suppressed: false };
  if (res.ok) {
    const data = await res.json();
    return { email, suppressed: true, reason: data.SuppressedDestination?.Reason || 'unknown' };
  }
  return { email, suppressed: false };
}

async function checkList(name, emails) {
  console.log(`\n=== ${name} (${emails.length} emails) ===`);
  const suppressed = [];
  const CONCURRENCY = 10;

  for (let i = 0; i < emails.length; i += CONCURRENCY) {
    const batch = emails.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(checkSuppressed));
    for (const r of results) {
      if (r.suppressed) {
        suppressed.push(r);
        console.log(`  ⛔ ${r.email} — ${r.reason}`);
      }
    }
    if ((i + CONCURRENCY) % 500 < CONCURRENCY || i + CONCURRENCY >= emails.length) {
      console.log(`  Checked ${Math.min(i + CONCURRENCY, emails.length)}/${emails.length} — ${suppressed.length} suppressed`);
    }
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`  ✅ Result: ${suppressed.length} suppressed out of ${emails.length}`);
  if (suppressed.length > 0) {
    suppressed.forEach(s => console.log(`    - ${s.email} (${s.reason})`));
  }
  return suppressed;
}

// Load lists
const ycVerified = JSON.parse(readFileSync(join(__dirname, 'ses-verified.json'), 'utf8'));
const agentQueue = JSON.parse(readFileSync(join(__dirname, 'email-list-clean.json'), 'utf8'));

const ycSuppressed = await checkList('YC FOUNDERS', ycVerified);
const agentSuppressed = await checkList('AGENTMAIL', agentQueue);

console.log(`\n=== FINAL SUMMARY ===`);
console.log(`YC Founders: ${ycSuppressed.length} suppressed / ${ycVerified.length}`);
console.log(`AgentMail: ${agentSuppressed.length} suppressed / ${agentQueue.length}`);
