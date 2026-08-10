#!/usr/bin/env node
/**
 * Build a prioritized manual-jd queue (no LLM):
 *  - Only jobs with description < 600 words
 *  - Never touch fully enriched (curated-jd + ≥600w)
 *  - Prefer Lever / Ashby / Greenhouse; skip LinkedIn/aggregators with empty bodies
 *
 * Usage:
 *   LIMIT=30 node .github/scripts/queue-manual-jd-priority.mjs
 *   REWORK_SHORT_CURATED=1 ...  # rare: allow short curated-jd back into queue
 */
import { createRequire } from 'module';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  shouldQueueForManualEnrich,
  isFullyEnrichedJob,
  descriptionWords,
  isLowQualityApplySource,
} from './lib/job-apply-source.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const LIMIT = Math.max(1, Number(process.env.LIMIT || 30));
const REWORK_SHORT_CURATED = process.env.REWORK_SHORT_CURATED === '1';
const QUEUE = resolve(__dirname, 'manual-jd-queue');

function atsScore(url) {
  const u = String(url || '').toLowerCase();
  if (/lever\.co/.test(u)) return 40;
  if (/ashbyhq\.com/.test(u)) return 38;
  if (/greenhouse\.io/.test(u)) return 36;
  if (/smartrecruiters\.com/.test(u)) return 30;
  if (/workable\.com/.test(u)) return 28;
  if (isLowQualityApplySource(url)) return 0;
  return 12;
}

async function fetchJobs(params) {
  const url = `${U}/rest/v1/jobs?${params}`;
  const r = await fetch(url, { headers: { apikey: K, Authorization: `Bearer ${K}` } });
  const rows = await r.json();
  if (!Array.isArray(rows)) throw new Error(JSON.stringify(rows).slice(0, 200));
  return rows;
}

async function main() {
  if (!U || !K) {
    console.error('Need Supabase env');
    process.exit(1);
  }
  mkdirSync(QUEUE, { recursive: true });

  // Walk newest-first until we have enough high-quality ATS candidates (not just top 400).
  const SCAN_CAP = Math.max(2000, Number(process.env.SCAN_CAP || 20000));
  const scored = [];
  for (let offset = 0; offset < SCAN_CAP && scored.length < LIMIT * 40; offset += 1000) {
    const fresh = await fetchJobs(
      `select=id,title,company,location,salary,job_type,tags,apply_url,description,created_at&apply_url=not.is.null&order=created_at.desc&limit=1000&offset=${offset}`
    );
    if (!fresh.length) break;
    for (const j of fresh) {
      if (!shouldQueueForManualEnrich(j, { reworkShortCurated: REWORK_SHORT_CURATED })) continue;
      if (isFullyEnrichedJob(j)) continue;
      const w = descriptionWords(j.description);
      const ats = atsScore(j.apply_url);
      let score = ats;
      if (w >= 200) score += 15;
      if (w >= 400) score += 10;
      if (ats === 0) continue;
      scored.push({ j, score, w, ats });
    }
    if (fresh.length < 1000) break;
  }
  scored.sort((a, b) => b.score - a.score);

  const picked = [];
  const seen = new Set();
  const companyCount = new Map();
  for (const x of scored) {
    if (seen.has(x.j.id)) continue;
    const co = String(x.j.company || '').toLowerCase();
    if ((companyCount.get(co) || 0) >= 2 && picked.length < LIMIT) continue;
    seen.add(x.j.id);
    companyCount.set(co, (companyCount.get(co) || 0) + 1);
    picked.push(x);
    if (picked.length >= LIMIT) break;
  }
  if (picked.length < LIMIT) {
    for (const x of scored) {
      if (seen.has(x.j.id)) continue;
      seen.add(x.j.id);
      picked.push(x);
      if (picked.length >= LIMIT) break;
    }
  }

  console.log(`Picked ${picked.length} under-600 jobs (skipped enriched + low-quality empty sources)`);
  const listPath = resolve(QUEUE, 'priority.json');
  writeFileSync(
    listPath,
    JSON.stringify(
      picked.map(({ j, score, w, ats }) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        apply_url: j.apply_url,
        score,
        db_words: w,
        ats,
      })),
      null,
      2
    )
  );
  writeFileSync(resolve(QUEUE, 'priority-ids.txt'), picked.map((x) => x.j.id).join('\n') + '\n');
  console.log('Wrote', listPath);
  for (const x of picked.slice(0, 10)) {
    console.log(`  ${x.score} ${x.j.title.slice(0, 40)} @ ${x.j.company} (${x.w}w)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
