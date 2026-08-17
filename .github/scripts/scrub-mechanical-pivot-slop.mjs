#!/usr/bin/env node
/**
 * Audit + fix stored job descriptions corrupted by copy-gate pivot insertion
 * (`< specifically p>`, `& notably nbsp;`, stuffed specifically/notably/meanwhile).
 *
 * Safe/idempotent: only rewrites rows whose description changed after scrub.
 *
 * Env: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 * Usage:
 *   node .github/scripts/scrub-mechanical-pivot-slop.mjs           # audit only
 *   DRY_RUN=1 node .github/scripts/scrub-mechanical-pivot-slop.mjs # count matches
 *   APPLY=1 node .github/scripts/scrub-mechanical-pivot-slop.mjs   # write fixes
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  hasMechanicalPivotCorruption,
  stripMechanicalPivotSlop,
} from './lib/mechanical-pivot-slop.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env.local') });
dotenv.config();

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(
  /\/$/,
  ''
);
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const APPLY = process.env.APPLY === '1';
const DRY_RUN = process.env.DRY_RUN === '1' || !APPLY;
const OUT_JSON = process.env.OUT_JSON || resolve(__dirname, 'mechanical-pivot-audit.json');
const PAGE = 500;
const MAX_ROUNDS = 4000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function scrubCandidate(job, raw) {
  const cleaned = stripMechanicalPivotSlop(raw);
  if (!cleaned || cleaned === raw) return null;
  if (hasMechanicalPivotCorruption(cleaned)) {
    return { issue: 'still_corrupt_after_scrub' };
  }
  return { description: cleaned };
}

async function main() {
  let lastId = null;
  let scanned = 0;
  let matched = 0;
  let fixed = 0;
  const samples = [];

  for (let round = 0; round < MAX_ROUNDS; round++) {
    let q = sb
      .from('jobs')
      .select('id,title,company,slug,external_id,tags,description,location,apply_url')
      .order('id', { ascending: true })
      .limit(PAGE);
    if (lastId) q = q.gt('id', lastId);

    const { data, error } = await q;
    if (error) throw new Error(`Fetch error: ${error.message}`);
    if (!data || data.length === 0) break;

    const updates = [];
    for (const row of data) {
      const raw = String(row.description || '');
      if (!hasMechanicalPivotCorruption(raw)) continue;
      const result = scrubCandidate(row, raw);
      if (!result) continue;
      if (result.issue) {
        samples.push({
          id: row.id,
          title: row.title,
          company: row.company,
          slug: row.slug,
          issue: result.issue,
        });
        continue;
      }
      matched++;
      updates.push({ id: row.id, description: result.description });
      if (samples.length < 40) {
        samples.push({
          id: row.id,
          title: row.title,
          company: row.company,
          slug: row.slug,
          external_id: row.external_id,
          curated: Array.isArray(row.tags) && row.tags.includes('curated-jd'),
        });
      }
    }

    if (updates.length > 0) {
      if (DRY_RUN) {
        fixed += updates.length;
        console.log(`  round ${round}: ${updates.length} would fix (${fixed} total)`);
      } else {
        const CHUNK = 8;
        for (let i = 0; i < updates.length; i += CHUNK) {
          const chunk = updates.slice(i, i + CHUNK);
          for (let attempt = 0; attempt < 5; attempt++) {
            const results = await Promise.all(
              chunk.map((row) =>
                sb.from('jobs').update({ description: row.description }).eq('id', row.id)
              )
            );
            const upErr = results.find((r) => r.error)?.error;
            if (!upErr) {
              fixed += chunk.length;
              console.log(`  updated ${chunk.length} (${fixed} total)`);
              break;
            }
            const msg = String(upErr.message || upErr);
            const retryable = /timeout|57014|529|503|502/i.test(msg);
            if (!retryable || attempt === 4) throw new Error(`Update error: ${msg}`);
            await sleep(1500 * (attempt + 1));
          }
        }
      }
    }

    scanned += data.length;
    lastId = data[data.length - 1].id;
    if (data.length < PAGE) break;
    await sleep(200);
  }

  mkdirSync(dirname(OUT_JSON), { recursive: true });
  writeFileSync(
    OUT_JSON,
    JSON.stringify({ scanned, matched, fixed: DRY_RUN ? fixed : fixed, samples }, null, 2)
  );

  console.log(
    `\nDone: scanned ${scanned}, matched ${matched}, ${DRY_RUN ? `dry-fix ${fixed}` : `fixed ${fixed}`}`
  );
  console.log(`Report: ${OUT_JSON}`);
  if (matched > 0 && DRY_RUN) {
    console.log('Re-run with APPLY=1 to write cleaned descriptions.');
  }
}

main().catch((e) => {
  console.error('Scrub failed:', e.message);
  process.exit(1);
});
