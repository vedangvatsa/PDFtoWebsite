/**
 * Strip aggregator disclaimers from stored job descriptions.
 * Targets rows matching known footer patterns (fast) unless --all is passed.
 *
 * Usage:
 *   node .github/scripts/normalize-job-descriptions.mjs
 *   node .github/scripts/normalize-job-descriptions.mjs --all
 * Env: SUPABASE_URL, SUPABASE_KEY (service role)
 */
import dotenv from 'dotenv';
import { normalizeJobDescriptionForStorage } from './lib/normalize-job-description.mjs';

dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const scanAll = process.argv.includes('--all');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY');
  process.exit(1);
}

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

const DISCLAIMER_PATTERNS = [
  'readable summary on CVin.Bio',
  'Apply on Google Careers',
  'Applications close around',
  'Apply via CVin.Bio',
  'Continue to the official posting',
  'per Google posting',
];

const PAGE = 200;

async function fetchPage(offset, pattern) {
  let url =
    `${SUPABASE_URL}/rest/v1/jobs?select=id,description` +
    `&description=not.is.null` +
    `&order=id.asc&offset=${offset}&limit=${PAGE}`;
  if (pattern) {
    url += `&description=ilike.${encodeURIComponent(`%${pattern}%`)}`;
  }
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`fetch: ${await res.text()}`);
  return res.json();
}

async function patchDescription(id, description) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/jobs?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      ...HEADERS,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ description }),
  });
  if (!res.ok) throw new Error(`patch ${id}: ${await res.text()}`);
}

async function scanPattern(pattern) {
  let offset = 0;
  let scanned = 0;
  let updated = 0;

  while (true) {
    const rows = await fetchPage(offset, pattern);
    if (!rows.length) break;

    for (const row of rows) {
      scanned += 1;
      const raw = row.description || '';
      const normalized = normalizeJobDescriptionForStorage(raw);
      if (normalized === raw) continue;
      await patchDescription(row.id, normalized);
      updated += 1;
    }

    offset += rows.length;
    if (rows.length < PAGE) break;
  }

  return { scanned, updated };
}

async function scanAllRows() {
  let offset = 0;
  let scanned = 0;
  let updated = 0;

  while (true) {
    const rows = await fetchPage(offset, null);
    if (!rows.length) break;

    for (const row of rows) {
      scanned += 1;
      const raw = row.description || '';
      const normalized = normalizeJobDescriptionForStorage(raw);
      if (normalized === raw) continue;
      await patchDescription(row.id, normalized);
      updated += 1;
    }

    offset += rows.length;
    if (rows.length < PAGE) break;
    if (scanned % 1000 === 0) {
      console.log(`  scanned ${scanned}, updated ${updated}...`);
    }
  }

  return { scanned, updated };
}

async function main() {
  let totalScanned = 0;
  let totalUpdated = 0;
  const seen = new Set();

  if (scanAll) {
    console.log('Full scan (--all)...');
    const { scanned, updated } = await scanAllRows();
    totalScanned += scanned;
    totalUpdated += updated;
  } else {
    console.log('Targeted disclaimer scan...');
    for (const pattern of DISCLAIMER_PATTERNS) {
      const rows = [];
      let offset = 0;
      while (true) {
        const batch = await fetchPage(offset, pattern);
        if (!batch.length) break;
        for (const row of batch) {
          if (!seen.has(row.id)) {
            seen.add(row.id);
            rows.push(row);
          }
        }
        offset += batch.length;
        if (batch.length < PAGE) break;
      }
      if (!rows.length) continue;

      let updated = 0;
      for (const row of rows) {
        totalScanned += 1;
        const raw = row.description || '';
        const normalized = normalizeJobDescriptionForStorage(raw);
        if (normalized === raw) continue;
        await patchDescription(row.id, normalized);
        updated += 1;
        totalUpdated += 1;
      }
      if (updated) console.log(`  ${pattern}: ${updated} cleaned`);
    }
  }

  console.log(`Done. scanned=${totalScanned} updated=${totalUpdated}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
