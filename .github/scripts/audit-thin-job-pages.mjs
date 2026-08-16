#!/usr/bin/env node
/**
 * Audit curated-jd jobs that are thin, format below 600w, or would show the stub.
 *
 * Usage:
 *   node .github/scripts/audit-thin-job-pages.mjs
 *   OUT=.github/scripts/thin-curated-priority.ids node .github/scripts/audit-thin-job-pages.mjs
 */
import { createRequire } from 'module';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { descriptionWords } from './lib/job-apply-source.mjs';
import {
  formattedDescriptionWords,
  isCvinStubText,
  isFullyEnrichedJob,
  needsCuratedReenrich,
  ENRICH_MIN_WORDS,
  MIN_WORDS,
} from './lib/job-description-gate.mjs';

const VERIFY_STUB = process.env.VERIFY_STUB === '1';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const OUT_IDS = process.env.OUT || resolve(__dirname, 'thin-curated-priority.ids');
const OUT_JSON = process.env.OUT_JSON || resolve(__dirname, 'thin-curated-audit.json');
const PAGE = 150;

async function fetchPage(from) {
  const url = `${U}/rest/v1/jobs?select=id,title,company,slug,external_id,tags,description,location,apply_url,job_type,salary,published_at,created_at,source&tags=cs.%7Bcurated-jd%7D&order=created_at.desc&limit=${PAGE}&offset=${from}`;
  const r = await fetch(url, {
    headers: { apikey: K, Authorization: `Bearer ${K}` },
  });
  const rows = await r.json();
  if (!Array.isArray(rows)) throw new Error(JSON.stringify(rows).slice(0, 300));
  return rows;
}

async function main() {
  if (!U || !K) {
    console.error('Need Supabase env');
    process.exit(1);
  }

  const stats = {
    curated: 0,
    fullyOk: 0,
    needsReenrich: 0,
    rawUnderEnrichMin: 0,
    formattedUnder600: 0,
    showsStub: 0,
    cvinStubStored: 0,
  };
  const samples = { stub: [], thin: [], borderline: [] };
  const affectedIds = [];

  for (let from = 0; ; from += PAGE) {
    const rows = await fetchPage(from);
    if (!rows.length) break;

    for (const job of rows) {
      stats.curated++;
      const raw = descriptionWords(job.description);
      const fmt = formattedDescriptionWords(job);

      let showsStub = isCvinStubText(job.description);
      if (!showsStub && VERIFY_STUB) {
        const { publishSafeDescription } = await import('../../src/lib/job-detail-data.ts');
        try {
          const pub = await publishSafeDescription(job, job.location || '');
          showsStub = /company apply page/i.test(pub.plain);
        } catch {
          showsStub = true;
        }
      } else if (!showsStub && fmt < MIN_WORDS && raw >= 80) {
        // Formatter trim dropped curated body below index floor — page may stub or show thin body.
        showsStub = true;
      }

      const need =
        needsCuratedReenrich(job) ||
        showsStub ||
        raw < ENRICH_MIN_WORDS ||
        fmt < MIN_WORDS;

      if (isCvinStubText(job.description)) stats.cvinStubStored++;
      if (raw < ENRICH_MIN_WORDS) stats.rawUnderEnrichMin++;
      if (fmt < MIN_WORDS) stats.formattedUnder600++;
      if (showsStub) stats.showsStub++;

      if (need) {
        stats.needsReenrich++;
        affectedIds.push(job.id);
        if (showsStub && samples.stub.length < 10) {
          samples.stub.push({ id: job.id, title: job.title, company: job.company, raw, fmt });
        } else if (raw < ENRICH_MIN_WORDS && samples.thin.length < 10) {
          samples.thin.push({ id: job.id, title: job.title, company: job.company, raw, fmt });
        } else if (fmt < MIN_WORDS && samples.borderline.length < 10) {
          samples.borderline.push({ id: job.id, title: job.title, company: job.company, raw, fmt });
        }
      } else if (isFullyEnrichedJob(job)) {
        stats.fullyOk++;
      }
    }

    if (rows.length < PAGE) break;
    if (from % 1500 === 0 && from > 0) console.error(`audited ${from + rows.length}…`);
  }

  mkdirSync(dirname(OUT_IDS), { recursive: true });
  writeFileSync(OUT_IDS, affectedIds.join('\n') + (affectedIds.length ? '\n' : ''));
  writeFileSync(
    OUT_JSON,
    JSON.stringify({ stats, samples, affectedCount: affectedIds.length, outIds: OUT_IDS }, null, 2)
  );

  console.log(JSON.stringify({ stats, affectedCount: affectedIds.length, outIds: OUT_IDS, samples }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
