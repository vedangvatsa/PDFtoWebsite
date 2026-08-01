/**
 * Ping IndexNow for URLs.
 * Usage:
 *   node .github/scripts/ping-indexnow.mjs /pdf-to-website /cv-website-vs-pdf
 *   node .github/scripts/ping-indexnow.mjs --india
 *   node .github/scripts/ping-indexnow.mjs --all
 *     → live sitemap + every /{company} slug from public.companies
 *       + curated short job paths (e.g. /indian-army/ai-ml)
 */
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pingIndexNow } from './lib/indexnow.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
try {
  require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
  require('dotenv').config();
} catch {
  /* optional */
}

const SITE = 'https://cvin.bio';
const BATCH = 10000;
const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
).replace(/\/$/, '');
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

const args = process.argv.slice(2).filter((a) => a !== '--');
const india = args.includes('--india');
const all = args.includes('--all');
const paths = args.filter((a) => a !== '--india' && a !== '--all');

function companyToSlug(company) {
  return (company || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function shortJobSlug(company, externalId) {
  if (!externalId) return null;
  const co = companyToSlug(company);
  if (!co) return null;
  const prefix = `${co}_`;
  const lower = externalId.toLowerCase();
  if (!lower.startsWith(prefix)) return null;
  const rest = externalId.slice(prefix.length);
  if (!/^[a-z0-9][a-z0-9-]{0,23}$/i.test(rest)) return null;
  if (/^[0-9a-f]{8,}$/i.test(rest)) return null;
  if (rest.length > 12 && /^\d+$/.test(rest)) return null;
  return rest.toLowerCase();
}

async function fetchSitemapUrls() {
  const res = await fetch(`${SITE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml HTTP ${res.status}`);
  const xml = await res.text();
  const urls = [];
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    urls.push(m[1].trim());
  }
  return urls;
}

async function fetchAllCompanyPaths() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY for --all companies');
  }
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  };
  const paths = [];
  let offset = 0;
  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/companies?select=slug&order=slug&limit=1000&offset=${offset}`,
      { headers }
    );
    const rows = await res.json();
    if (!Array.isArray(rows)) {
      throw new Error(`companies fetch failed: ${JSON.stringify(rows).slice(0, 200)}`);
    }
    if (!rows.length) break;
    for (const row of rows) {
      if (row.slug) paths.push(`/${row.slug}`);
    }
    if (rows.length < 1000) break;
    offset += 1000;
  }
  return paths;
}

/** Curated pretty job URLs: /{company}/{short-slug} */
async function fetchShortJobPaths() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  };
  const companyKeys = ['indian-army', 'mospi', 'niti-aayog'];
  const out = [];
  for (const ck of companyKeys) {
    let offset = 0;
    while (true) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/jobs?select=company,company_key,external_id&company_key=eq.${encodeURIComponent(ck)}&order=created_at.desc&limit=1000&offset=${offset}`,
        { headers }
      );
      const rows = await res.json();
      if (!Array.isArray(rows) || !rows.length) break;
      for (const j of rows) {
        const co = j.company_key || companyToSlug(j.company);
        const slug =
          shortJobSlug(j.company_key || j.company, j.external_id) ||
          shortJobSlug(j.company, j.external_id);
        if (co && slug) out.push(`/${co}/${slug}`);
      }
      if (rows.length < 1000) break;
      offset += 1000;
    }
  }
  return out;
}

async function collectAllUrls() {
  console.log('Fetching sitemap…');
  const sitemap = await fetchSitemapUrls();
  console.log(`  sitemap: ${sitemap.length}`);

  console.log('Fetching companies…');
  const companies = await fetchAllCompanyPaths();
  console.log(`  companies: ${companies.length}`);

  console.log('Fetching curated job paths…');
  const jobs = await fetchShortJobPaths();
  console.log(`  short jobs: ${jobs.length}`);

  const set = new Set([
    SITE,
    `${SITE}/companies`,
    ...sitemap,
    ...companies.map((p) => `${SITE}${p}`),
    ...jobs.map((p) => `${SITE}${p}`),
  ]);
  return [...set];
}

async function submitInBatches(urls) {
  const results = [];
  for (let i = 0; i < urls.length; i += BATCH) {
    const chunk = urls.slice(i, i + BATCH);
    const batchNo = Math.floor(i / BATCH) + 1;
    const totalBatches = Math.ceil(urls.length / BATCH);
    console.log(`Submitting batch ${batchNo}/${totalBatches} (${chunk.length} URLs)…`);
    const result = await pingIndexNow(chunk);
    console.log(result);
    results.push(result);
    if (!result.ok) return { ok: false, results, submitted: i + chunk.length };
    if (i + BATCH < urls.length) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return { ok: true, results, submitted: urls.length };
}

async function main() {
  let urls = [...paths];
  if (india) {
    urls.push(
      '/indian-army',
      '/mospi',
      '/niti-aayog',
      '/niti-aayog/internship',
      '/mospi/nios',
      '/jobs'
    );
  }

  if (all) {
    const absolute = await collectAllUrls();
    console.log(`Total unique URLs: ${absolute.length}`);
    const result = await submitInBatches(absolute);
    if (!result.ok) process.exit(1);
    console.log(`Done. Submitted ${result.submitted} URLs in ${result.results.length} batch(es).`);
    return;
  }

  if (!urls.length) {
    console.error(
      'Usage: node .github/scripts/ping-indexnow.mjs <path...> [--india] | --all'
    );
    process.exit(1);
  }
  const result = await pingIndexNow(urls);
  console.log(result);
  if (!result.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
