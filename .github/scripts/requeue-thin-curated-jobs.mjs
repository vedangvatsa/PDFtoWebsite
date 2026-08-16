#!/usr/bin/env node
/**
 * Find thin curated pages, clear enrich state, optionally strip curated-jd from
 * rows that cannot be re-enriched, and write a priority ID file for RE_ENRICH.
 *
 * Usage:
 *   node .github/scripts/requeue-thin-curated-jobs.mjs --dry-run
 *   node .github/scripts/requeue-thin-curated-jobs.mjs
 */
import { createRequire } from 'module';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { isCuratedJd } from './lib/job-apply-source.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

const DRY = process.argv.includes('--dry-run');
const IDS_FILE = resolve(__dirname, 'thin-curated-priority.ids');
const AUDIT_JSON = resolve(__dirname, 'thin-curated-audit.json');
const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

function clearEnrichState(ids) {
  const idSet = new Set(ids);
  const dir = __dirname;
  const files = readdirSync(dir).filter((f) => f.startsWith('enrich-remote-jd-state') && f.endsWith('.json'));
  let cleared = 0;
  for (const file of files) {
    const path = resolve(dir, file);
    try {
      const state = JSON.parse(readFileSync(path, 'utf8'));
      let touched = false;
      for (const id of [...(state.doneIds || [])]) {
        if (idSet.has(id)) {
          state.doneIds = (state.doneIds || []).filter((x) => x !== id);
          touched = true;
          cleared++;
        }
      }
      for (const id of ids) {
        if (state.processed?.[id]) {
          delete state.processed[id];
          touched = true;
        }
      }
      if (touched && !DRY) writeFileSync(path, JSON.stringify(state, null, 2));
    } catch {
      /* ignore corrupt state files */
    }
  }
  return cleared;
}

async function main() {
  if (!existsSync(IDS_FILE)) {
    console.log('Running audit first…');
    execSync('npx tsx .github/scripts/audit-thin-job-pages.mjs', {
      cwd: resolve(__dirname, '../..'),
      stdio: 'inherit',
    });
  }

  const audit = JSON.parse(readFileSync(AUDIT_JSON, 'utf8'));
  const ids = readFileSync(IDS_FILE, 'utf8')
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`Affected: ${ids.length} (audit: ${JSON.stringify(audit.stats)})`);

  const cleared = clearEnrichState(ids);
  console.log(`${DRY ? 'Would clear' : 'Cleared'} enrich state entries: ${cleared}`);

  if (DRY) {
    console.log(`Priority file ready: ${IDS_FILE}`);
    console.log('Run enrich:');
    console.log(
      `  ALLOW_AI_ENRICH=1 RE_ENRICH=1 TURBO=1 BATCH_SIZE=200 CONCURRENCY=12 PRIORITY_IDS_FILE=${IDS_FILE} npx tsx .github/scripts/enrich-remote-job-descriptions.mjs`
    );
    return;
  }

  console.log(`Ready for RE_ENRICH with PRIORITY_IDS_FILE=${IDS_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
