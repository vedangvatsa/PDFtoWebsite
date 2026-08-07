#!/usr/bin/env node
/**
 * Verify every company-domains.json entry resolves and the site title matches
 * the company name. Fabricated/guessed domains (wrong site, parked page, or
 * NXDOMAIN) are removed so company pages never link to the wrong website.
 *
 * Usage: node .github/scripts/verify-company-domains.mjs
 *   --write       actually prune bad entries from src/lib/company-domains.json
 *   --only=dns    only the DNS fast pass (skip title fetch)
 */
import dns from 'dns';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '../../src/lib/company-domains.json');
const WRITE = process.argv.includes('--write');
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1];

const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const entries = Object.entries(data);

const lookup = (host) =>
  new Promise((resolve) => {
    dns.resolve4(host, (err) => resolve(!err));
  });

function stripLegal(name) {
  return name.toLowerCase()
    .replace(/[\s,.\-]+(inc|llc|ltd|corp|gmbh|ag|sa|bv|nv|plc|co|company|group|holdings|technologies|technology|tech|software|systems|solutions|labs|studio|ventures|partners|international|global|digital|media|ai|the)\b.*$/i, '')
    .replace(/[^a-z0-9]+/g, '');
}

function fetchTitle(host) {
  return new Promise((resolve) => {
    const req = https.get(`https://${host}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CVin domain-verifier)' },
      timeout: 8000,
    }, (res) => {
      let body = '';
      const max = 120000;
      res.on('data', (c) => { body += c; if (body.length > max) req.destroy(); });
      res.on('end', () => {
        const t = body.match(/<title[^>]*>([^<]+)/i);
        const og = body.match(/property="og:site_name"[^>]*content="([^"]+)/i);
        const ld = body.match(/"name"\s*:\s*"([^"]{2,60})"/g);
        const ldNames = ld ? [...new Set(ld.map((x) => x.match(/"name"\s*:\s*"([^"]+)/)?.[1].toLowerCase()))] : [];
        resolve({ title: t ? t[1] : '', og: og ? og[1] : '', ld: ldNames.join(' ') });
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

const CONCURRENCY = 40;
async function mapLimit(items, fn, n) {
  const out = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: n }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return out;
}

(async () => {
  // Pass 1: DNS check (fast)
  const dnsResults = await mapLimit(entries, async ([key, url]) => {
    const host = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
    const ok = await lookup(host);
    return { key, url, host, ok };
  }, CONCURRENCY);

  const noDns = dnsResults.filter((r) => !r.ok);
  console.log(`DNS pass: ${dnsResults.length} checked, ${noDns.length} NO_DNS`);

  // Pass 2: title match (only for entries with DNS)
  const titleResults = await mapLimit(
    dnsResults.filter((r) => r.ok),
    async (r) => {
      const meta = await fetchTitle(r.host);
      if (!meta) return { ...r, status: 'no_fetch' };
      const baseKey = r.key.toLowerCase();
      const haystack = `${meta.title} ${meta.og} ${meta.ld}`.toLowerCase();
      const words = baseKey.split(/[^a-z0-9]+/).filter((w) => w.length > 3 && w !== 'the');
      const match = words.filter((w) => haystack.includes(w) || haystack.includes(w.slice(0, 5))).length;
      const ratio = words.length ? match / words.length : 0;
      return { ...r, status: ratio >= 0.5 ? 'keep' : 'suspect', match, words: words.join(','), title: (meta.title + ' | ' + meta.og).slice(0, 60) };
    },
    CONCURRENCY
  );

  const kept = titleResults.filter((r) => r.status === 'keep');
  const suspect = titleResults.filter((r) => r.status === 'suspect');
  const noFetch = titleResults.filter((r) => r.status === 'no_fetch');
  console.log(`Title pass: keep=${kept.length} suspect=${suspect.length} no_fetch=${noFetch.length} no_dns=${noDns.length}`);

  console.log('\n=== SUSPECT (site title does not match company) ===');
  suspect.forEach((r) => console.log(`${r.key}\t${r.url}\t[${r.match}/${r.words}]\t${r.title}`));
  console.log('\n=== NO_DNS ===');
  noDns.forEach((r) => console.log(`${r.key}\t${r.url}`));

  if (WRITE) {
    const bad = new Set([...suspect, ...noDns].map((r) => r.key));
    const cleaned = Object.fromEntries(entries.filter(([k]) => !bad.has(k)));
    fs.writeFileSync(DB_PATH, JSON.stringify(cleaned, null, 2) + '\n');
    console.log(`\nwrote ${Object.keys(cleaned).length} entries (removed ${bad.size})`);
  }
})();
