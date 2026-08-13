#!/usr/bin/env node
/**
 * Publish a manually written JD page (no LLM).
 *
 * Usage:
 *   node .github/scripts/publish-manual-jd.mjs --id <uuid> --page path/to/page.txt
 *   node .github/scripts/publish-manual-jd.mjs --id <uuid>   # reads manual-jd-queue/<id>.page.txt
 *   DRY_RUN=1 ...
 *
 * Requires: page text that passes local gates vs optional .source.txt
 * See docs/JD_PARAPHRASE_RULES.md
 */
import { createRequire } from 'module';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { checkManualPage } from './lib/jd-manual-gates.mjs';
import { isFullyEnrichedJob } from './lib/job-apply-source.mjs';
import {
  normalizeJobDescriptionForStorage,
  descriptionHasWriterLeak,
} from './lib/normalize-job-description.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const DRY_RUN = process.env.DRY_RUN === '1';
const QUEUE = resolve(__dirname, 'manual-jd-queue');
const FORCE = process.env.FORCE === '1';

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}

function companyToSlug(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function prettyJobSlug(title, uniqueSeed, used) {
  const base = String(title || 'role')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  let slug = base.slice(0, 24) || 'role';
  const RESERVED = new Set(['jobs', 'blog', 'editor', 'api', 'admin']);
  if (used.has(slug) || RESERVED.has(slug)) {
    const h = createHash('md5').update(String(uniqueSeed)).digest('hex').slice(0, 2);
    slug = `${(base.split('-')[0] || 'role').slice(0, 6)}-${h}`;
  }
  let n = 2;
  while (used.has(slug) || RESERVED.has(slug)) {
    const h = createHash('md5').update(`${uniqueSeed}:${n++}`).digest('hex').slice(0, 2);
    slug = `${(base.split('-')[0] || 'role').slice(0, 6)}-${h}`;
  }
  used.add(slug);
  return slug;
}

async function main() {
  if (!U || !K) {
    console.error('Need Supabase env');
    process.exit(1);
  }
  const id = arg('--id');
  if (!id) {
    console.error('Usage: node .github/scripts/publish-manual-jd.mjs --id <uuid> [--page file]');
    process.exit(1);
  }
  const pagePath = arg('--page') || resolve(QUEUE, `${id}.page.txt`);
  const sourcePath = resolve(QUEUE, `${id}.source.txt`);
  if (!existsSync(pagePath)) {
    console.error(`Missing page file: ${pagePath}`);
    process.exit(1);
  }
  const page = normalizeJobDescriptionForStorage(readFileSync(pagePath, 'utf8')) || '';
  const source = existsSync(sourcePath) ? readFileSync(sourcePath, 'utf8') : '';
  if (descriptionHasWriterLeak(page)) {
    console.error('Writer-template leak still present after strip (See source / omit-instructions).');
    process.exit(2);
  }
  const gate = checkManualPage(page, source);
  console.log(JSON.stringify({ id, gate }, null, 2));
  if (!gate.ok && !FORCE) {
    console.error('Gates failed. Fix page or FORCE=1 to publish anyway.');
    process.exit(2);
  }

  const r = await fetch(`${U}/rest/v1/jobs?id=eq.${id}&select=id,title,company,company_key,tags,external_id,apply_url,description`, {
    headers: { apikey: K, Authorization: `Bearer ${K}` },
  });
  const rows = await r.json();
  if (!Array.isArray(rows) || !rows[0]) {
    console.error('Job not found', id);
    process.exit(1);
  }
  const job = rows[0];
  if (isFullyEnrichedJob(job) && !FORCE) {
    console.error('Job already has curated-jd (enriched). Refusing to overwrite. FORCE=1 to override.');
    process.exit(3);
  }
  const companySlug = job.company_key || companyToSlug(job.company);
  let external_id = job.external_id;
  let path;
  if (external_id && String(external_id).toLowerCase().startsWith(`${companySlug}_`)) {
    path = `/${companySlug}/${external_id.slice(companySlug.length + 1)}`;
  } else {
    // Always uniquify with job id — title-only slugs collide across same-title postings.
    const h = createHash('md5').update(String(job.id)).digest('hex').slice(0, 6);
    const base = String(job.title || 'role')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 16) || 'role';
    const slug = `${base}-${h}`.slice(0, 32);
    external_id = `${companySlug}_${slug}`;
    path = `/${companySlug}/${slug}`;
  }
  const tags = Array.isArray(job.tags) ? [...job.tags] : [];
  if (!tags.includes('remote')) tags.push('remote');
  if (!tags.includes('curated-jd')) tags.push('curated-jd');

  const patch = {
    description: page,
    external_id,
    tags,
    company_key: companySlug,
  };
  console.log({ path, words: gate.wordCount, dry: DRY_RUN, force: FORCE });
  if (DRY_RUN) return;

  const u = await fetch(`${U}/rest/v1/jobs?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: K,
      Authorization: `Bearer ${K}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(patch),
  });
  if (!u.ok) {
    console.error('PATCH failed', u.status, await u.text());
    process.exit(1);
  }
  writeFileSync(resolve(QUEUE, `${id}.published.json`), JSON.stringify({ id, path, at: new Date().toISOString(), words: gate.wordCount }, null, 2));
  console.log('Published', path);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
