#!/usr/bin/env node
/**
 * Sample live jobs → build JobPosting-like objects → report Google Jobs readiness.
 * Usage: node .github/scripts/validate-job-postings.mjs [--limit=50]
 */
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = Math.min(200, Math.max(10, Number(limitArg?.split('=')[1] || 40)));

function wordCount(desc) {
  if (!desc) return 0;
  return String(desc)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function companyToSlug(company) {
  return String(company || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isRouteable(company, externalId) {
  const co = companyToSlug(company);
  if (!co || !externalId) return false;
  if (!String(externalId).toLowerCase().startsWith(co + '_')) return false;
  const rest = String(externalId).slice(co.length + 1).toLowerCase();
  return /^[a-z0-9][a-z0-9-]{0,23}$/i.test(rest) && !/^[0-9a-f]{8,}$/i.test(rest);
}

function validate(job) {
  const issues = [];
  const words = wordCount(job.description);
  if (words < 250) issues.push({ level: 'error', code: 'thin', message: `description ${words}w < 250` });
  if (!job.title || job.title.length < 3) issues.push({ level: 'error', code: 'title', message: 'title missing' });
  if (!job.company) issues.push({ level: 'error', code: 'company', message: 'company missing' });
  if (!job.published_at && !job.created_at) issues.push({ level: 'warn', code: 'date', message: 'no datePosted source' });
  if (!job.location) issues.push({ level: 'warn', code: 'location', message: 'no location' });
  else if (/^usa$/i.test(job.location.trim())) issues.push({ level: 'warn', code: 'location_coarse', message: 'location collapsed to USA' });
  if (!job.salary) issues.push({ level: 'warn', code: 'salary', message: 'no salary field' });
  if (!isRouteable(job.company, job.external_id)) {
    issues.push({ level: 'error', code: 'url', message: 'no pretty routeable URL' });
  }
  return issues;
}

async function main() {
  if (!U || !K) {
    console.error('Need Supabase env');
    process.exit(1);
  }
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const url = `${U}/rest/v1/jobs?select=id,title,company,location,salary,description,external_id,published_at,created_at,tags&created_at=gt.${encodeURIComponent(since)}&order=created_at.desc&limit=${LIMIT * 3}`;
  const res = await fetch(url, { headers: { apikey: K, Authorization: `Bearer ${K}` } });
  const jobs = await res.json();
  // Prefer pretty+rich sample
  const sample = [];
  for (const j of jobs || []) {
    if (isRouteable(j.company, j.external_id) && wordCount(j.description) >= 100) sample.push(j);
    if (sample.length >= LIMIT) break;
  }
  // pad with anything
  for (const j of jobs || []) {
    if (sample.length >= LIMIT) break;
    if (!sample.find((x) => x.id === j.id)) sample.push(j);
  }

  let ok = 0;
  let withErrors = 0;
  const codeCounts = {};
  for (const j of sample) {
    const issues = validate(j);
    const errors = issues.filter((i) => i.level === 'error');
    if (!errors.length) ok++;
    else withErrors++;
    for (const i of issues) {
      codeCounts[i.code] = (codeCounts[i.code] || 0) + 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        sampled: sample.length,
        ready_no_errors: ok,
        with_errors: withErrors,
        ready_pct: sample.length ? Math.round((ok / sample.length) * 100) : 0,
        issue_codes: codeCounts,
        note: 'Google Jobs still requires GSC Job postings report after crawl. Submit https://cvin.bio/sitemap.xml in Search Console.',
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
