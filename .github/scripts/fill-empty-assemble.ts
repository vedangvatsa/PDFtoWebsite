/**
 * Organize empty Greenhouse rows: curl ATS → tags, salary, location, job_type.
 * Never writes description (no raw ATS, no invented JD).
 *
 *   DRY_RUN=1 LIMIT=200 npx tsx .github/scripts/fill-empty-assemble.ts
 *   LIMIT=2000 npx tsx .github/scripts/fill-empty-assemble.ts
 */
import { config } from 'dotenv';
import { extractJobFacts, mergeLocation, stripAtsHtml } from '../../src/lib/job-fact-extract';
import { sanitizeJobTags } from '../../src/lib/job-publish-gates';
import { parseGreenhouseExternalId } from '../../src/lib/job-ats-text';

config({ path: '.env.local' });
config();

const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const DRY = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const LIMIT = Math.max(1, Number(process.env.LIMIT || 200));
const headers = { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' };

const parseGhExternalId = parseGreenhouseExternalId;

type Row = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  job_type: string | null;
  salary: string | null;
  tags: string[] | null;
  external_id: string;
};

async function loadEmptyGreenhouse(limit: number): Promise<Row[]> {
  const rows: Row[] = [];
  for (let offset = 0; offset < limit; offset += 1000) {
    const take = Math.min(1000, limit - offset);
    const url =
      `${U}/rest/v1/jobs?select=id,title,company,location,job_type,salary,tags,external_id` +
      `&source=eq.greenhouse&or=(description.is.null,description.eq.)` +
      `&apply_url=not.is.null&order=created_at.desc&limit=${take}&offset=${offset}`;
    const r = await fetch(url, { headers });
    const batch = await r.json();
    if (!Array.isArray(batch) || !batch.length) break;
    rows.push(...batch);
    if (batch.length < take) break;
  }
  return rows;
}

const boardCache = new Map<string, Map<string, { text: string; location?: string }>>();

async function loadBoard(slug: string) {
  let map = boardCache.get(slug);
  if (map) return map;
  map = new Map();
  const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs?content=true`);
  if (r.ok) {
    const data = await r.json();
    for (const j of data.jobs || []) {
      map.set(String(j.id), {
        text: stripAtsHtml(j.content || ''),
        location: j.location?.name || '',
      });
    }
  }
  boardCache.set(slug, map);
  return map;
}

async function patch(id: string, body: Record<string, unknown>) {
  const r = await fetch(`${U}/rest/v1/jobs?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`patch ${r.status} ${(await r.text()).slice(0, 180)}`);
}

async function main() {
  if (!U || !K) {
    console.error('Need Supabase env');
    process.exit(1);
  }
  const jobs = await loadEmptyGreenhouse(LIMIT);
  console.log(`empty greenhouse ${jobs.length} dry=${DRY ? 1 : 0}`);

  let updated = 0;
  let skipped = 0;
  let thin = 0;

  for (const job of jobs) {
    const parsed = parseGhExternalId(job.external_id);
    if (!parsed) {
      skipped++;
      continue;
    }
    const board = await loadBoard(parsed.slug);
    const src = board.get(parsed.id);
    if (!src || src.text.length < 80) {
      thin++;
      continue;
    }
    const facts = extractJobFacts(src.text, {
      title: job.title,
      existingTags: job.tags,
      company: job.company,
    });
    const location = mergeLocation(src.location || job.location, facts.workplace) || job.location;
    const tags = sanitizeJobTags(facts.skills, { companyName: job.company });
    const next: Record<string, unknown> = {};
    if (facts.salary && facts.salary !== job.salary) next.salary = facts.salary;
    if (facts.jobType && facts.jobType !== job.job_type) next.job_type = facts.jobType;
    if (location && location !== job.location) next.location = location;
    if (tags.length && JSON.stringify(tags) !== JSON.stringify(job.tags || [])) next.tags = tags;
    if (!Object.keys(next).length) {
      skipped++;
      continue;
    }
    if (!DRY) await patch(job.id, next);
    updated++;
  }

  console.log(JSON.stringify({ boards: boardCache.size, updated, skipped, thin, dry: DRY }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
