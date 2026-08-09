/**
 * One-shot SQL remediation: remove `remote` tag from jobs whose location is a
 * specific office (non-remote). Keeps remote/hybrid/anywhere locations.
 * Uses the Supabase Management API (SUPABASE_ACCESS_TOKEN).
 */
import { readFileSync } from 'node:fs';

const env = {};
for (const line of readFileSync(
  '/Users/vedang/.gemini/antigravity/scratch/PDFtoWebsite/.env.local',
  'utf8'
).split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (m) env[m[1]] = m[2];
}
const U = env.NEXT_PUBLIC_SUPABASE_URL || '';
const TOKEN = env.SUPABASE_ACCESS_TOKEN || '';
const REF = (U.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i) || [])[1];
if (!TOKEN || !REF) {
  console.error('Missing SUPABASE_ACCESS_TOKEN / project ref');
  process.exit(1);
}

const sql = `
UPDATE public.jobs
SET tags = array_remove(tags, 'remote'), synced_at = now()
WHERE 'remote' = ANY(tags)
  AND location IS NOT NULL AND btrim(location) <> ''
  AND NOT (location ~* 'remote|hybrid|work from home|wfh|worldwide|anywhere|virtual|global|telecommute')
  AND apply_url IS NOT NULL
  AND created_at > now() - interval '30 days';
`;

const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'cvin-fix-remote/1.0' },
  body: JSON.stringify({ query: sql }),
});
const body = await r.text();
console.log(r.status, body.slice(0, 500));
