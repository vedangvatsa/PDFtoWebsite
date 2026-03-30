import { readFileSync, writeFileSync } from 'fs';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────────────
const REACHER_BIN  = process.env.REACHER_BIN || '/tmp/check_if_email_exists';
const FROM_EMAIL   = 'hi@mail.hashtagweb3.com';
const CONCURRENCY  = Number(process.env.VERIFY_CONCURRENCY) || 100;

const RECIPIENTS_PATH = join(__dirname, 'ses-recipients.json');
const VERIFIED_PATH   = join(__dirname, 'ses-verified.json');
const REJECTED_PATH   = join(__dirname, 'ses-rejected.json');

// ── Load data ───────────────────────────────────────────────────────
const recipients = JSON.parse(readFileSync(RECIPIENTS_PATH, 'utf8'));

let verified = [];
let rejected = [];
try { verified = JSON.parse(readFileSync(VERIFIED_PATH, 'utf8')); } catch {}
try { rejected = JSON.parse(readFileSync(REJECTED_PATH, 'utf8')); } catch {}

const alreadyChecked = new Set([...verified, ...rejected.map(r => r.email)]);
const toCheck = recipients.filter(e => !alreadyChecked.has(e));

if (toCheck.length === 0) {
  console.log('✅ All emails already verified. Nothing to check.');
  process.exit(0);
}

console.log(`🔍 Verifying ${toCheck.length} emails with ${CONCURRENCY} parallel workers\n`);

// ── Worker function ─────────────────────────────────────────────────
function checkEmail(email) {
  return new Promise((resolve) => {
    const cmd = `"${REACHER_BIN}" "${email}" --from-email "${FROM_EMAIL}"`;
    exec(cmd, { timeout: 30000 }, (err, stdout) => {
      if (err) {
        resolve({ email, ok: false, reason: 'error', error: err.message?.slice(0, 80) });
        return;
      }
      try {
        const result = JSON.parse(stdout);
        const reachable = result.is_reachable;
        if (reachable === 'safe' || reachable === 'risky') {
          resolve({ email, ok: true, reachable });
        } else {
          resolve({ email, ok: false, reason: reachable, is_reachable: reachable });
        }
      } catch {
        resolve({ email, ok: false, reason: 'parse_error' });
      }
    });
  });
}

// ── Parallel execution with concurrency limit ───────────────────────
let idx = 0;
let doneCount = 0;
let verifiedCount = 0;
let rejectedCount = 0;

function saveState() {
  writeFileSync(VERIFIED_PATH, JSON.stringify(verified, null, 2));
  writeFileSync(REJECTED_PATH, JSON.stringify(rejected, null, 2));
}

async function worker() {
  while (idx < toCheck.length) {
    const i = idx++;
    const email = toCheck[i];
    const result = await checkEmail(email);
    doneCount++;

    if (result.ok) {
      verified.push(email);
      verifiedCount++;
      console.log(`✓ [${doneCount}/${toCheck.length}] ${email} — ${result.reachable}`);
    } else {
      rejected.push({ email, reason: result.reason, error: result.error });
      rejectedCount++;
      console.log(`✗ [${doneCount}/${toCheck.length}] ${email} — ${result.reason}`);
    }

    // Save state every 50 emails
    if (doneCount % 50 === 0) saveState();
  }
}

// Launch workers
const workers = [];
for (let w = 0; w < Math.min(CONCURRENCY, toCheck.length); w++) {
  workers.push(worker());
}
await Promise.all(workers);

// Final save
saveState();
writeFileSync(RECIPIENTS_PATH, JSON.stringify(verified, null, 2));

console.log(`\n✅ Done — Verified: ${verifiedCount}, Rejected: ${rejectedCount}`);
console.log(`📋 Total clean list: ${verified.length} emails`);
