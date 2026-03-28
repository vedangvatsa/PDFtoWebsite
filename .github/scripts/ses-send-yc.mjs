import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHmac, createHash } from 'crypto';

/* ── config ── */
const REGION     = process.env.AWS_SES_REGION || 'us-west-1';
const ACCESS_KEY = process.env.AWS_SES_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SES_SECRET_ACCESS_KEY;
const FROM_EMAIL = 'Sara <hi@mail.hashtagweb3.com>';
const REPLY_TO   = 'hi@hashtagweb3.com';
const SUBJECT    = 'Network School x Hashtag Web3';
const BATCH_SIZE = Number(process.env.SES_BATCH_SIZE) || 5938;
const DELAY_MS   = 80;

/* ── helpers ── */
function hmac(key, data) { return createHmac('sha256', key).update(data).digest(); }
function sha256(data) { return createHash('sha256').update(data).digest('hex'); }
function getSignatureKey(sk, ds, r, s) { let k = hmac(`AWS4${sk}`, ds); k = hmac(k, r); k = hmac(k, s); return hmac(k, 'aws4_request'); }
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ── load data ── */
const recipients = JSON.parse(readFileSync('.github/scripts/ses-yc-recipients.json', 'utf8'));
const htmlTemplate = readFileSync('.github/scripts/ses-template-yc.html', 'utf8');

const SENT_PATH = '.github/scripts/ses-yc-sent.json';
const LOG_PATH  = '.github/scripts/ses-yc-logs.json';
let sent  = existsSync(SENT_PATH) ? JSON.parse(readFileSync(SENT_PATH, 'utf8')) : [];
let logs  = existsSync(LOG_PATH) ? JSON.parse(readFileSync(LOG_PATH, 'utf8')) : [];
const sentSet = new Set(sent);

const queue = recipients.filter(r => !sentSet.has(r.email)).slice(0, BATCH_SIZE);
console.log(`📧 Queue: ${queue.length} | Already sent: ${sent.length} | Total: ${recipients.length}`);

let ok = 0, fail = 0;

for (const recipient of queue) {
  const { email, firstName } = recipient;

  // Personalize HTML
  const html = htmlTemplate
    .replace(/\{\{FIRST_NAME\}\}/g, firstName || 'there')
    .replace(/\{\{EMAIL\}\}/g, encodeURIComponent(email));

  // Personalize plain text
  const textBody = `Hey ${firstName || 'there'},

Network School, by Balaji Srinivasan, is a startup society on an island off the coast of Singapore - built for remote workers, tech founders, and content creators. Several YC founders have already been through cohorts here.

What you get: serviced room, healthy meals, 24/7 coworking, gym, world-class speakers, content studio, workshops, fitness classes, and a makerspace.

Selected applicants are eligible to receive a free 1-week stay when accepted into a month-long cohort.

One month. One island. Ship faster than you would anywhere else.

Apply here: https://ns.com/hashtagweb3/apply?utm_source=hashtagweb3&utm_medium=email&utm_campaign=ns_yc_founders&utm_content=apply_cta

Sara
Hashtag Web3`;

  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const raw = [
    `From: ${FROM_EMAIL}`,
    `To: ${email}`,
    `Reply-To: ${REPLY_TO}`,
    `Subject: ${SUBJECT}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    textBody,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    html,
    ``,
    `--${boundary}--`,
  ].join('\r\n');

  const rawB64 = Buffer.from(raw).toString('base64');

  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const dateStamp = amzDate.slice(0, 8);
  const host = `email.${REGION}.amazonaws.com`;

  const params = new URLSearchParams({ 'Action': 'SendRawEmail', 'RawMessage.Data': rawB64, 'Version': '2010-12-01' });
  const body = params.toString();
  const payloadHash = sha256(body);
  const canonicalHeaders = `content-type:application/x-www-form-urlencoded\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-date';
  const canonicalRequest = `POST\n/\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const credentialScope = `${dateStamp}/${REGION}/ses/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${sha256(canonicalRequest)}`;
  const signingKey = getSignatureKey(SECRET_KEY, dateStamp, REGION, 'ses');
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  const authHeader = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  try {
    const res = await fetch(`https://${host}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Amz-Date': amzDate, 'Authorization': authHeader },
      body,
    });
    const text = await res.text();
    if (res.ok) {
      ok++;
      sent.push(email);
      sentSet.add(email);
      logs.push({ email, status: 'sent', time: new Date().toISOString() });
      console.log(`✓ [${ok + fail}/${queue.length}] ${email}`);
    } else {
      fail++;
      const msg = text.match(/<Message>(.*?)<\/Message>/)?.[1] || 'unknown';
      logs.push({ email, status: 'failed', error: msg, time: new Date().toISOString() });
      console.log(`✗ [${ok + fail}/${queue.length}] ${email} — ${msg}`);
    }
  } catch (err) {
    fail++;
    logs.push({ email, status: 'error', error: err.message, time: new Date().toISOString() });
    console.log(`✗ [${ok + fail}/${queue.length}] ${email} — ${err.message}`);
  }

  // Save state every 50 emails
  if ((ok + fail) % 50 === 0) {
    writeFileSync(SENT_PATH, JSON.stringify(sent, null, 2));
    writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2));
  }

  await sleep(DELAY_MS);
}

// Final save
writeFileSync(SENT_PATH, JSON.stringify(sent, null, 2));
writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2));
console.log(`\n✅ Done — Sent: ${ok}, Failed: ${fail}, Queue remaining: ${recipients.length - sent.length}`);
