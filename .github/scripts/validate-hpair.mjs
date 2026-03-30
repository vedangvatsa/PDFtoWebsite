import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Resolver } from 'dns';

const __dirname = dirname(fileURLToPath(import.meta.url));
const emails = JSON.parse(readFileSync(join(__dirname, 'hpair-emails.json'), 'utf8'));

// ── 1. Syntax validation ───────────────────────────────────────────
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const syntaxValid = emails.filter(e => EMAIL_RE.test(e));
const syntaxInvalid = emails.filter(e => !EMAIL_RE.test(e));
console.log(`Syntax check: ${syntaxValid.length} valid, ${syntaxInvalid.length} invalid`);
if (syntaxInvalid.length > 0) console.log('  Invalid:', syntaxInvalid.slice(0, 10));

// ── 2. MX record validation (per domain) ───────────────────────────
const resolver = new Resolver();
resolver.setServers(['8.8.8.8', '1.1.1.1']);

function checkMX(domain) {
  return new Promise(resolve => {
    resolver.resolveMx(domain, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) resolve(false);
      else resolve(true);
    });
  });
}

// Group by domain
const domainMap = {};
for (const email of syntaxValid) {
  const domain = email.split('@')[1];
  if (!domainMap[domain]) domainMap[domain] = [];
  domainMap[domain].push(email);
}

const domains = Object.keys(domainMap);
console.log(`\nChecking MX records for ${domains.length} unique domains...`);

const validDomains = new Set();
const invalidDomains = new Set();
const CONCURRENCY = 20;

for (let i = 0; i < domains.length; i += CONCURRENCY) {
  const batch = domains.slice(i, i + CONCURRENCY);
  const results = await Promise.all(batch.map(async d => {
    const hasMX = await checkMX(d);
    return { domain: d, hasMX };
  }));
  
  for (const { domain, hasMX } of results) {
    if (hasMX) validDomains.add(domain);
    else invalidDomains.add(domain);
  }
  
  if ((i + CONCURRENCY) % 200 === 0 || i + CONCURRENCY >= domains.length) {
    console.log(`  Checked ${Math.min(i + CONCURRENCY, domains.length)}/${domains.length} domains...`);
  }
}

// ── 3. Filter & save ───────────────────────────────────────────────
const verified = syntaxValid.filter(e => validDomains.has(e.split('@')[1]));
const rejected = [
  ...syntaxInvalid.map(e => ({ email: e, reason: 'syntax' })),
  ...syntaxValid.filter(e => invalidDomains.has(e.split('@')[1])).map(e => ({ email: e, reason: 'no_mx' }))
];

console.log(`\n=== RESULTS ===`);
console.log(`Total input: ${emails.length}`);
console.log(`Valid (syntax + MX): ${verified.length}`);
console.log(`Rejected: ${rejected.length}`);
console.log(`  - Syntax invalid: ${syntaxInvalid.length}`);
console.log(`  - No MX record: ${rejected.length - syntaxInvalid.length}`);

if (invalidDomains.size > 0) {
  console.log(`\nDead domains (no MX):`);
  for (const d of invalidDomains) {
    console.log(`  ${d} (${domainMap[d].length} emails)`);
  }
}

writeFileSync(join(__dirname, 'hpair-emails.json'), JSON.stringify(verified, null, 2));
writeFileSync(join(__dirname, 'hpair-rejected.json'), JSON.stringify(rejected, null, 2));
console.log(`\nSaved ${verified.length} verified emails to hpair-emails.json`);
console.log(`Saved ${rejected.length} rejected to hpair-rejected.json`);
