import { readFileSync, writeFileSync } from 'fs';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────────────
const REACHER_BIN  = join(__dirname, '..', '..', 'check_if_email_exists');
const FROM_EMAIL   = 'hi@mail.hashtagweb3.com';
const CONCURRENCY  = 50;

const INPUT_PATH    = join(__dirname, 'hpair-emails.json');
const VERIFIED_PATH = join(__dirname, 'hpair-verified.json');
const REJECTED_PATH = join(__dirname, 'hpair-rejected.json');

// ── Load data ───────────────────────────────────────────────────────
const emails = JSON.parse(readFileSync(INPUT_PATH, 'utf8'));

let verified = [];
let rejected = [];
try { verified = JSON.parse(readFileSync(VERIFIED_PATH, 'utf8')); } catch {}
try { rejected = JSON.parse(readFileSync(REJECTED_PATH, 'utf8')); } catch {}

const alreadyChecked = new Set([...verified, ...rejected.map(r => r.email)]);
const toCheck = emails.filter(e => !alreadyChecked.has(e));

if (toCheck.length === 0) {
  console.log('✅ All emails already verified.');
  process.exit(0);
}

console.log(`🔍 Verifying ${toCheck.length} emails (${CONCURRENCY} parallel workers)`);
console.log(`   Already done: ${alreadyChecked.size} (${verified.length} verified, ${rejected.length} rejected)\n`);

// ── Worker ──────────────────────────────────────────────────────────
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
          resolve({ email, ok: false, reason: reachable });
        }
      } catch {
        resolve({ email, ok: false, reason: 'parse_error' });
      }
    });
  });
}

// ── Parallel execution ──────────────────────────────────────────────
let idx = 0;
let doneCount = 0;
let vCount = 0;
let rCount = 0;

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
      vCount++;
      if (doneCount % 100 === 0 || doneCount <= 5) 
        console.log(`✓ [${doneCount}/${toCheck.length}] ${email} — ${result.reachable}`);
    } else {
      rejected.push({ email, reason: result.reason, error: result.error });
      rCount++;
      if (doneCount % 100 === 0 || doneCount <= 5) 
        console.log(`✗ [${doneCount}/${toCheck.length}] ${email} — ${result.reason}`);
    }

    if (doneCount % 200 === 0) {
      saveState();
      console.log(`  💾 Saved — Verified: ${verified.length}, Rejected: ${rejected.length}`);
    }
  }
}

const workers = [];
for (let w = 0; w < Math.min(CONCURRENCY, toCheck.length); w++) {
  workers.push(worker());
}
await Promise.all(workers);

saveState();
console.log(`\n✅ Done — Verified: ${vCount}, Rejected: ${rCount}`);
console.log(`📋 Total clean list: ${verified.length} emails`);
