/**
 * Add jobs.company_key column + index (if missing) and backfill from company names.
 * Uses Supabase Management API SQL (SUPABASE_ACCESS_TOKEN + PROJECT_REF).
 *
 * Usage: node .github/scripts/backfill-company-key.mjs
 */
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
try {
  require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
  require('dotenv').config();
} catch {
  /* optional */
}

const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
).replace(/\/$/, '');
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF ||
  (SUPABASE_URL.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1] ?? '');

if (!ACCESS_TOKEN || !PROJECT_REF) {
  console.error('Need SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF');
  process.exit(1);
}

async function runSql(sql, label) {
  const t0 = Date.now();
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  const ms = Date.now() - t0;
  if (!res.ok) {
    console.error(`[${label}] HTTP ${res.status} in ${ms}ms`, text.slice(0, 500));
    throw new Error(`${label} failed: ${res.status}`);
  }
  console.log(`[${label}] ok in ${ms}ms`);
  return body;
}

const DDL = `
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS company_key TEXT;

CREATE INDEX IF NOT EXISTS jobs_company_key_created_idx
  ON public.jobs (company_key, created_at DESC)
  WHERE company_key IS NOT NULL AND company_key <> '';

CREATE INDEX IF NOT EXISTS jobs_external_id_lookup_idx
  ON public.jobs (external_id)
  WHERE external_id IS NOT NULL;
`;

// Postgres-side slugify matching toCompanyKey (lowercase, non-alnum → -, trim -)
const BACKFILL = `
SET statement_timeout = '300s';

UPDATE public.jobs
SET company_key = trim(both '-' from regexp_replace(lower(coalesce(company, '')), '[^a-z0-9]+', '-', 'g'))
WHERE (company_key IS NULL OR company_key = '')
  AND company IS NOT NULL
  AND btrim(company) <> '';
`;

const COUNT = `
SELECT
  count(*) FILTER (WHERE company_key IS NOT NULL AND company_key <> '') AS with_key,
  count(*) FILTER (WHERE company_key IS NULL OR company_key = '') AS without_key,
  count(*) AS total
FROM public.jobs;
`;

console.log('project', PROJECT_REF);
await runSql(DDL, 'ddl');
await runSql(BACKFILL, 'backfill');
const counts = await runSql(COUNT, 'count');
console.log('counts', JSON.stringify(counts));
console.log('done');
