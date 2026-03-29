import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createHmac, createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────────────
const REGION     = process.env.AWS_SES_REGION || 'us-west-1';
const ACCESS_KEY = process.env.AWS_SES_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SES_SECRET_ACCESS_KEY;
const CONCURRENCY = 5;  // Be gentle with rate limits

if (!ACCESS_KEY || !SECRET_KEY) {
  console.error('❌ Missing AWS credentials');
  process.exit(1);
}

// ── Which list to validate (pass as arg) ────────────────────────────
const LIST_ARG = process.argv[2] || 'hpair';
const LIST_MAP = {
  hpair: 'hpair-verified.json',
  yc: 'ses-verified.json',
  agentmail: 'email-list-clean.json',
};

const listFile = LIST_MAP[LIST_ARG];
if (!listFile) {
  console.error(`Usage: node ses-validate.mjs [hpair|yc|agentmail]`);
  process.exit(1);
}

const emails = JSON.parse(readFileSync(join(__dirname, listFile), 'utf8'));
const blacklist = JSON.parse(readFileSync(join(__dirname, 'global-do-not-send.json'), 'utf8'));
const blacklistSet = new Set(blacklist);
const toCheck = emails.filter(e => !blacklistSet.has(e));

// Track results
const OUTPUT_PATH = join(__dirname, `ses-validation-${LIST_ARG}.json`);
let results = [];
try { results = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8')); } catch {}
const alreadyChecked = new Set(results.map(r => r.email));
const remaining = toCheck.filter(e => !alreadyChecked.has(e));

console.log(`🔍 AWS SES Email Validation — ${LIST_ARG.toUpperCase()} list`);
console.log(`   Total: ${emails.length}, Already checked: ${alreadyChecked.size}, Remaining: ${remaining.length}\n`);

if (remaining.length === 0) {
  console.log('✅ All emails already validated.');
  process.exit(0);
}

// ── AWS Sig V4 ──────────────────────────────────────────────────────
function hmac(key, data) { return createHmac('sha256', key).update(data).digest(); }
function sha256(data) { return createHash('sha256').update(data).digest('hex'); }
function getSignatureKey(sk, ds, r, s) {
  let k = hmac(`AWS4${sk}`, ds); k = hmac(k, r); k = hmac(k, s); k = hmac(k, 'aws4_request'); return k;
}

async function validateEmail(email) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const dateStamp = amzDate.slice(0, 8);
  const host = `email.${REGION}.amazonaws.com`;
  const path = `/v2/email/email-address-insights/`;
  const body = JSON.stringify({ EmailAddress: email });

  const payloadHash = sha256(body);
  const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-date';
  const canonicalRequest = `POST\n${path}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const credentialScope = `${dateStamp}/${REGION}/ses/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${sha256(canonicalRequest)}`;
  const signingKey = getSignatureKey(SECRET_KEY, dateStamp, REGION, 'ses');
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  const authHeader = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`https://${host}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Amz-Date': amzDate,
      'Authorization': authHeader,
    },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    const errMsg = text.match(/<Message>(.*?)<\/Message>/)?.[1] || text.slice(0, 100);
    return { email, error: errMsg, statusCode: res.status };
  }

  try {
    const data = JSON.parse(text);
    return { email, validation: data.MailboxValidation || data, statusCode: res.status };
  } catch {
    return { email, error: 'parse_error', raw: text.slice(0, 200), statusCode: res.status };
  }
}

// ── Run validation ──────────────────────────────────────────────────
let checked = 0;
let highCount = 0;
let medCount = 0;
let lowCount = 0;
let errorCount = 0;
const toBlacklist = [];

function saveState() {
  writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
}

// Test with first email to check if API is accessible
console.log('Testing API access...');
const testResult = await validateEmail(remaining[0]);
if (testResult.error) {
  console.error(`❌ API error: ${testResult.error}`);
  console.error(`Status: ${testResult.statusCode}`);
  if (testResult.statusCode === 403) {
    console.error('\nYour IAM user needs the ses:GetEmailAddressInsights permission.');
    console.error('Add this policy to your IAM user in the AWS console.');
  }
  process.exit(1);
}
console.log('✓ API accessible. Starting validation...\n');

for (let i = 0; i < remaining.length; i += CONCURRENCY) {
  const batch = remaining.slice(i, i + CONCURRENCY);
  const batchResults = await Promise.all(batch.map(validateEmail));

  for (const r of batchResults) {
    checked++;
    if (r.error) {
      errorCount++;
      results.push({ email: r.email, valid: 'error', error: r.error });
      continue;
    }

    const verdict = r.validation?.IsValid?.ConfidenceVerdict || 'UNKNOWN';
    const evals = r.validation?.Evaluations || {};
    const isDisposable = evals.IsDisposable?.ConfidenceVerdict === 'HIGH';
    const isRole = evals.IsRoleAddress?.ConfidenceVerdict === 'HIGH';
    const isRandom = evals.IsRandomInput?.ConfidenceVerdict === 'HIGH';
    const mailboxExists = evals.MailboxExists?.ConfidenceVerdict;

    results.push({
      email: r.email,
      valid: verdict,
      mailboxExists,
      isDisposable,
      isRole,
      isRandom,
    });

    if (verdict === 'HIGH') highCount++;
    else if (verdict === 'MEDIUM') medCount++;
    else {
      lowCount++;
      toBlacklist.push(r.email);
    }

    // Also blacklist disposable and random
    if (isDisposable || isRandom) {
      if (!toBlacklist.includes(r.email)) toBlacklist.push(r.email);
    }
  }

  if (checked % 50 === 0 || checked >= remaining.length) {
    console.log(`[${checked}/${remaining.length}] HIGH=${highCount} MED=${medCount} LOW=${lowCount} ERR=${errorCount}`);
    saveState();
  }

  await new Promise(r => setTimeout(r, 200));
}

saveState();

console.log(`\n=== RESULTS ===`);
console.log(`HIGH confidence (safe): ${highCount}`);
console.log(`MEDIUM confidence: ${medCount}`);
console.log(`LOW confidence (risky): ${lowCount}`);
console.log(`Errors: ${errorCount}`);
console.log(`To blacklist: ${toBlacklist.length}`);

if (toBlacklist.length > 0) {
  // Add to global blacklist
  const updatedBlacklist = [...new Set([...blacklist, ...toBlacklist])].sort();
  writeFileSync(join(__dirname, 'global-do-not-send.json'), JSON.stringify(updatedBlacklist, null, 2));
  console.log(`\n✅ Added ${toBlacklist.length} emails to global-do-not-send.json`);

  // Remove from list
  const cleanList = emails.filter(e => !new Set(toBlacklist).has(e));
  writeFileSync(join(__dirname, listFile), JSON.stringify(cleanList, null, 2));
  console.log(`📋 Updated ${listFile}: ${emails.length} → ${cleanList.length}`);
}
