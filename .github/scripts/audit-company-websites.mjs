#!/usr/bin/env node
/**
 * Audit company website links used on /[slug] careers pages.
 * Resolves the same way as the page: meta.website || https://{domainForCompany(name)}
 * Then HEAD/GET checks for dead hosts.
 *
 * Usage:
 *   node .github/scripts/audit-company-websites.mjs
 *   TOP=2000 CONCURRENCY=40 node .github/scripts/audit-company-websites.mjs
 */
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const TOP = Math.max(50, Number(process.env.TOP || 1500));
const CONCURRENCY = Math.max(5, Number(process.env.CONCURRENCY || 40));
const TIMEOUT_MS = 8000;

const companyDomains = JSON.parse(
  readFileSync(resolve(__dirname, '../../src/lib/company-domains.json'), 'utf8')
);

// Parse company-data.ts for website entries (slug + website)
const companyDataSrc = readFileSync(resolve(__dirname, '../../src/lib/company-data.ts'), 'utf8');
const META_WEBSITES = new Map();
for (const m of companyDataSrc.matchAll(
  /['"]?([a-z0-9-]+)['"]?\s*:\s*\{[^}]*?slug:\s*['"]([^'"]+)['"][^}]*?website:\s*['"]([^'"]+)['"]/gs
)) {
  META_WEBSITES.set(m[1], m[3]);
  META_WEBSITES.set(m[2], m[3]);
}
// Fallback simpler parse
for (const m of companyDataSrc.matchAll(/slug:\s*['"]([^'"]+)['"][\s\S]*?website:\s*['"]([^'"]+)['"]/g)) {
  META_WEBSITES.set(m[1], m[2]);
}

function hostFromDomainEntry(value) {
  try {
    const u = new URL(value.startsWith('http') ? value : `https://${value}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return value.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

const DOMAIN_OVERRIDES = {
  ...Object.fromEntries(
    Object.entries(companyDomains).map(([k, v]) => [k.toLowerCase().trim(), hostFromDomainEntry(v)])
  ),
  google: 'google.com',
  meta: 'meta.com',
  microsoft: 'microsoft.com',
  amazon: 'amazon.com',
  apple: 'apple.com',
  elevenlabs: 'elevenlabs.io',
  openrouter: 'openrouter.ai',
  'opal security': 'opal.dev',
  opal: 'opal.dev',
  'scale ai': 'scale.com',
  scale: 'scale.com',
  'hugging face': 'huggingface.co',
  huggingface: 'huggingface.co',
  notion: 'notion.so',
  neon: 'neon.tech',
  railway: 'railway.app',
  lovable: 'lovable.dev',
  'character.ai': 'character.ai',
  'character ai': 'character.ai',
  character: 'character.ai',
  'govtech singapore': 'tech.gov.sg',
  govtech: 'tech.gov.sg',
  mospi: 'mospi.gov.in',
  'niti aayog': 'niti.gov.in',
  'indian army': 'joinindianarmy.nic.in',
  'indian-army': 'joinindianarmy.nic.in',
};

const LEGAL_SUFFIX =
  /\b(inc|inc\.|incorporated|llc|l\.l\.c\.|ltd|ltd\.|limited|corp|corp\.|corporation|co|co\.|company|plc|gmbh|ag|sa|bv|nv|pty|pvt|private|public|group|holdings?|technologies|technology|tech|software|systems|solutions|labs?|studio|ventures|partners|international|global|digital|media|ai|the)\b/gi;

function companyBaseName(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(LEGAL_SUFFIX, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, '');
}

function domainForCompany(name) {
  const key = name.toLowerCase().trim();
  if (DOMAIN_OVERRIDES[key]) return { domain: DOMAIN_OVERRIDES[key], source: 'override' };

  const slug = key.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (META_WEBSITES.has(slug)) {
    try {
      const host = new URL(META_WEBSITES.get(slug)).hostname.replace(/^www\./, '');
      return { domain: host, source: 'meta', fullUrl: META_WEBSITES.get(slug) };
    } catch {}
  }

  const compact = key.replace(/[^a-z0-9]/g, '');
  if (DOMAIN_OVERRIDES[compact]) return { domain: DOMAIN_OVERRIDES[compact], source: 'override-compact' };

  const base = companyBaseName(name);
  if (base && DOMAIN_OVERRIDES[base]) return { domain: DOMAIN_OVERRIDES[base], source: 'override-base' };

  if (/\.[a-z]{2,}$/i.test(key) && !/\s/.test(key)) {
    return {
      domain: key.replace(/^https?:\/\//, '').replace(/^www\./, ''),
      source: 'name-as-domain',
    };
  }

  const guess = (base || compact || 'example').slice(0, 63);
  return { domain: `${guess}.com`, source: 'guessed-com' };
}

function resolveWebsite(slug, name) {
  const metaUrl = META_WEBSITES.get(slug) || META_WEBSITES.get(name.toLowerCase());
  if (metaUrl) return { url: metaUrl, source: 'meta', domain: hostFromDomainEntry(metaUrl) };
  const d = domainForCompany(name || slug);
  if (d.fullUrl) return { url: d.fullUrl, source: d.source, domain: d.domain };
  return { url: `https://${d.domain}`, source: d.source, domain: d.domain };
}

async function fetchCompanies(limit) {
  const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };
  const out = [];
  let offset = 0;
  while (out.length < limit) {
    const n = Math.min(1000, limit - out.length);
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/companies?select=slug,name,role_count&order=role_count.desc&limit=${n}&offset=${offset}`,
      { headers }
    );
    const rows = await res.json();
    if (!Array.isArray(rows) || !rows.length) break;
    out.push(...rows);
    if (rows.length < n) break;
    offset += rows.length;
  }
  return out;
}

async function probe(url) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    let r = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: ac.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; CVinBioWebsiteAudit/1.0; +https://cvin.bio)',
        Accept: '*/*',
      },
    });
    // Some hosts reject HEAD
    if (r.status === 405 || r.status === 403 || r.status === 501) {
      r = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: ac.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          Accept: 'text/html',
        },
      });
    }
    clearTimeout(t);
    return { ok: r.status >= 200 && r.status < 400, status: r.status, final: r.url };
  } catch (e) {
    clearTimeout(t);
    return { ok: false, status: 0, error: e.name === 'AbortError' ? 'timeout' : e.message?.slice(0, 80) };
  }
}

async function mapPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

async function main() {
  if (!SUPABASE_URL || !KEY) {
    console.error('Need SUPABASE_URL + service role key');
    process.exit(1);
  }

  console.log(`Fetching top ${TOP} companies…`);
  const companies = await fetchCompanies(TOP);
  console.log(`Got ${companies.length}. Resolving + probing (concurrency ${CONCURRENCY})…\n`);

  const resolved = companies.map((c) => {
    const w = resolveWebsite(c.slug, c.name);
    return { ...c, ...w };
  });

  const bySource = {};
  for (const r of resolved) bySource[r.source] = (bySource[r.source] || 0) + 1;
  console.log('Resolution sources:', bySource);

  let done = 0;
  const probed = await mapPool(resolved, CONCURRENCY, async (row) => {
    const result = await probe(row.url);
    done++;
    if (done % 100 === 0 || done === resolved.length) {
      process.stdout.write(`\r  probed ${done}/${resolved.length}`);
    }
    return { ...row, ...result };
  });
  console.log('\n');

  const dead = probed.filter((p) => !p.ok);
  const guessedDead = dead.filter((p) => p.source === 'guessed-com');
  const knownDead = dead.filter((p) => p.source !== 'guessed-com');
  const live = probed.filter((p) => p.ok);

  console.log('═'.repeat(60));
  console.log(`Checked: ${probed.length}`);
  console.log(`✅ Live (2xx/3xx): ${live.length} (${((live.length / probed.length) * 100).toFixed(1)}%)`);
  console.log(`❌ Dead/fail: ${dead.length}`);
  console.log(`   of which guessed .com: ${guessedDead.length}`);
  console.log(`   of which known map/meta: ${knownDead.length}`);
  console.log('═'.repeat(60));

  console.log('\n── Known-map / meta failures (should fix overrides) ──');
  for (const p of knownDead.sort((a, b) => b.role_count - a.role_count).slice(0, 40)) {
    console.log(
      `  /${p.slug} (${p.role_count}) → ${p.url} [${p.status || p.error}] source=${p.source}`
    );
  }

  console.log('\n── Top guessed-.com failures (hide or fix) ──');
  for (const p of guessedDead.sort((a, b) => b.role_count - a.role_count).slice(0, 40)) {
    console.log(`  /${p.slug} (${p.role_count}) → ${p.url} [${p.status || p.error}]`);
  }

  const outPath = resolve(__dirname, 'audit-company-websites-results.json');
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        top: TOP,
        summary: {
          checked: probed.length,
          live: live.length,
          dead: dead.length,
          guessedDead: guessedDead.length,
          knownDead: knownDead.length,
          bySource,
        },
        knownDead: knownDead.map((p) => ({
          slug: p.slug,
          name: p.name,
          role_count: p.role_count,
          url: p.url,
          status: p.status,
          error: p.error,
          source: p.source,
        })),
        guessedDeadTop: guessedDead
          .sort((a, b) => b.role_count - a.role_count)
          .slice(0, 200)
          .map((p) => ({
            slug: p.slug,
            name: p.name,
            role_count: p.role_count,
            url: p.url,
            status: p.status,
            error: p.error,
          })),
      },
      null,
      2
    )
  );
  console.log(`\nWrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
