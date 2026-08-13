#!/usr/bin/env node
/**
 * One-off cleanup: remove leaked prompt-template/instruction text from live job
 * descriptions. Old prompt templates leaked meta text into published pages:
 *   "Engagement: See source"
 *   "Compensation: (omit the line if SOURCE has no pay)"
 *   "Compensation: (see source)" / "(omitted per source instructions)"
 *   "Compensation: Not specified" / "n/a" / "tbd" / "none listed"
 *   "Confirm details on the official apply page WITHOUT edit"
 *   orphan "Source:" lines, "exact headers" lines, "..." placeholder bullets
 *
 * Safe/idempotent: only rewrites rows whose description matched; curated-jd
 * status and all other content are untouched. Symmetric with the leak gate in
 * enrich-remote-job-descriptions.mjs (humanityFailReasons) and the template fix.
 *
 * Env: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 * Usage: node .github/scripts/scrub-leaked-instructions.mjs
 *        DRY_RUN=1 node .github/scripts/scrub-leaked-instructions.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env.local') });
dotenv.config();

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const DRY_RUN = process.env.DRY_RUN === '1';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const PAGE = 500;
const MAX_ROUNDS = 2000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Line whose value is a placeholder/instruction instead of real content:
 *  "Engagement: See source", "Compensation: (omit …)", "Compensation: Not
 *  specified", "Location: ...", "Team: ... (omit if unknown)", "Source:".
 *  Also any line that ends with an embedded instruction string. */
const ORPHAN_PLACEHOLDER_RE = /^[-•]\s*(?:\.\.\.|Only if SOURCE\b.*)\s*$/gim;
const WITHOUT_EDIT_RE = /Confirm details on the official apply page(\s+WITHOUT\s+\S+|.*?WITHOUT edit)/gim;
const STEP_ICON_RE = /^\s*\[\d+\]\s*$/gim;
const MULTI_NL_RE = /\n{3,}/g;

function leakedLineRe() {
  // New regex each call so /g lastIndex cannot skip rows. Optional bullet.
  return /^[-•*]\s*[A-Za-z][^:\n]{0,80}:\s*(?:(?:See source|Not specified|not specified|not provided|n\/a|tbd|none listed|per source instructions|\([^)\n]*\)|\.\.\.)(?:\s*\([^)\n]*\))?|.*?(?:omit|ONLY include if|REMOVE THIS LINE|per source instructions|See source|Only if SOURCE).*?)$/gim;
}

function leakedLineReNoBullet() {
  return /^[A-Za-z][^:\n]{0,80}:\s*(?:(?:See source|Not specified|not specified|not provided|n\/a|tbd|none listed|per source instructions|\([^)\n]*\)|\.\.\.)(?:\s*\([^)\n]*\))?|.*?(?:omit|ONLY include if|REMOVE THIS LINE|per source instructions|See source|Only if SOURCE).*?)$/gim;
}

const JUNK_FACT_VALUE =
  /^(?:see source|not specified|not provided|none listed|n\/a|tbd|\.\.\.)(?:\s|[.(]|$)/i;
const JUNK_INSTRUCTION =
  /\b(?:omit(?:ted)?\s+(?:the line|section|if source|if unknown|if empty)|only if source|per source instructions)\b/i;

function isJunkFactValue(val) {
  const v = String(val || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\(\s*omit(?:ted)?(?:\s+the line)?[^)]*\)/gi, ' ')
    .replace(/^(?:see source|not specified|not provided|none listed|n\/a|tbd)\.?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!v) return true;
  if (JUNK_FACT_VALUE.test(v) && v.length < 80) return true;
  if (JUNK_INSTRUCTION.test(v) && v.length < 220) return true;
  return false;
}

function scrub(text) {
  if (typeof text !== 'string' || !text) return null;
  let out = text
    .replace(
      /<\/(p|li)>\s*(?=<(?:p|li))/gi,
      '</$1>\n'
    )
    .replace(
      /\s+(?=(?:Location|Engagement|Compensation|Salary|Pay|Team|Workplace|Employment(?: type)?|Job type|Department)\s*:)/g,
      '\n'
    )
    .replace(
      /<p>\s*<strong>([A-Za-z][^:]{0,80}):<\/strong>\s*([^<]*)<\/p>/gi,
      (full, _label, val) => (isJunkFactValue(val) ? '' : full)
    )
    .replace(
      /<li[^>]*>\s*[-•*]?\s*[A-Za-z][^:]{0,80}:\s*(?:See source|not specified|n\/a|tbd|\(omit[^)]*\))[^<]*<\/li>/gi,
      ''
    )
    .replace(leakedLineRe(), '')
    .replace(leakedLineReNoBullet(), '')
    .replace(ORPHAN_PLACEHOLDER_RE, '')
    .replace(
      /Only hours, travel, visa, or deadlines stated in SOURCE\.?\s*(?:Omit the whole section if none\.?)?/gi,
      ''
    )
    .replace(/^[-•*]?\s*Omit the whole section if none\.?\s*$/gim, '')
    .replace(WITHOUT_EDIT_RE, 'Confirm details on the official apply page.')
    .replace(STEP_ICON_RE, '')
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(MULTI_NL_RE, '\n\n')
    .trim();
  const changed = out !== text.trim();
  if (!changed) return null;
  if (out.length >= 2) out += '\n';
  return out;
}

async function main() {
  let lastId = null;
  let scanned = 0;
  let fixed = 0;
  let dryFixed = 0;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    let q = sb.from('jobs')
      .select('id, description')
      .order('id', { ascending: true })
      .limit(PAGE);
    if (lastId) q = q.gt('id', lastId);

    const { data, error } = await q;
    if (error) throw new Error(`Fetch error: ${error.message}`);
    if (!data || data.length === 0) break;

    const updates = [];
    for (const row of data) {
      const cleaned = scrub(row.description);
      if (cleaned !== null) updates.push({ id: row.id, description: cleaned });
    }

    if (updates.length > 0) {
      if (DRY_RUN) {
        dryFixed += updates.length;
        console.log(`  round ${round}: ${updates.length} match (dry, ${dryFixed} total)`);
      } else {
        // Small serial chunks + retry: a 40-wide Promise.all previously
        // died on "upstream request timeout" after ~27k writes.
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
    await sleep(300);
  }

  console.log(`\nDone: scanned ${scanned} jobs, ${DRY_RUN ? `dry-match ${dryFixed}` : `fixed ${fixed}`}`);
}

main().catch((e) => {
  console.error('Cleanup failed:', e.message);
  process.exit(1);
});