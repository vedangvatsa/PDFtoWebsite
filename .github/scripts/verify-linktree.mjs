import { readFileSync, writeFileSync } from 'fs';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const REACHER = join(ROOT, 'check_if_email_exists');
const INPUT = join(__dirname, 'linktree-clean.json');
const VERIFIED_PATH = join(__dirname, 'linktree-verified.json');
const REJECTED_PATH = join(__dirname, 'linktree-rejected.json');

const CONCURRENCY = 500;

const emails = JSON.parse(readFileSync(INPUT, 'utf8'));

let verified = [];
let rejected = [];
try { verified = JSON.parse(readFileSync(VERIFIED_PATH, 'utf8')); } catch {}
try { rejected = JSON.parse(readFileSync(REJECTED_PATH, 'utf8')); } catch {}

const done = new Set([...verified, ...rejected.map(r => r.email || r)]);
const remaining = emails.filter(e => !done.has(e));

console.log(`🔍 Reacher SMTP Validation — Linktree list (${CONCURRENCY} workers)`);
console.log(`   Total: ${emails.length}, Already checked: ${done.size}, Remaining: ${remaining.length}\n`);

let checked = 0;
let validCount = 0;
let invalidCount = 0;

function checkEmail(email) {
  return new Promise((resolve) => {
    exec(`${REACHER} "${email}" 2>/dev/null`, { timeout: 15000 }, (err, stdout) => {
      if (err) {
        resolve({ email, valid: false, reason: 'timeout' });
        return;
      }
      try {
        const data = JSON.parse(stdout);
        const reachable = data.is_reachable;
        resolve({ email, valid: reachable === 'safe' || reachable === 'risky', reason: reachable });
      } catch {
        resolve({ email, valid: false, reason: 'parse_error' });
      }
    });
  });
}

function saveState() {
  writeFileSync(VERIFIED_PATH, JSON.stringify(verified, null, 2));
  writeFileSync(REJECTED_PATH, JSON.stringify(rejected, null, 2));
}

// Process in batches of CONCURRENCY
for (let i = 0; i < remaining.length; i += CONCURRENCY) {
  const batch = remaining.slice(i, i + CONCURRENCY);
  const results = await Promise.all(batch.map(checkEmail));

  for (const r of results) {
    checked++;
    if (r.valid) {
      verified.push(r.email);
      validCount++;
    } else {
      rejected.push({ email: r.email, reason: r.reason });
      invalidCount++;
    }
  }

  saveState();
  console.log(`[${checked}/${remaining.length}] Valid=${validCount} Invalid=${invalidCount} Total verified=${verified.length}`);
}

saveState();
console.log(`\n=== RESULTS ===`);
console.log(`Verified: ${verified.length}`);
console.log(`Rejected: ${rejected.length}`);
