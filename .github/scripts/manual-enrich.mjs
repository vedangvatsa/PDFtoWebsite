/**
 * Manual enrich helper — fetch under-600-word jobs for the agent to rewrite,
 * then apply the agent's enriched descriptions back to the DB.
 *
 * Usage:
 *   node .github/scripts/manual-enrich.mjs fetch <N>        # print N candidates
 *   node .github/scripts/manual-enrich.mjs apply <file.json> # PATCH descriptions
 *
 * apply file format: { "<jobId>": "<enriched 600+ word description>", ... }
 * Keeps existing external_id (URL unchanged); adds curated-jd + remote tags.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const env = {};
for (const line of readFileSync(
  '/Users/vedang/.gemini/antigravity/scratch/PDFtoWebsite/.env.local',
  'utf8'
).split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (m) env[m[1]] = m[2];
}
const U = (env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = env.SUPABASE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '';
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const REMOTE_RE = /remote|hybrid|work from home|wfh|worldwide|anywhere|virtual|global|telecommute/i;
function looksRemote(location, jobType, tags) {
  const s = [location, jobType, (tags || []).join(' ')].filter(Boolean).join(' ');
  return REMOTE_RE.test(s);
}

const mode = process.argv[2];
const arg = process.argv[3];

async function jfetch(url, opts = {}, timeout = 60000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

if (mode === 'fetch-company') {
  const companyKey = process.argv[3];
  const N = Math.max(1, Number(process.argv[4] || 5));
  const MIN_SOURCE = Number(process.argv[5] || 150); // min words in existing desc to write from honestly
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const url =
    `${U}/rest/v1/jobs?select=id,title,company,location,job_type,salary,tags,apply_url,external_id,description` +
    `&company_key=eq.${encodeURIComponent(companyKey)}&apply_url=not.is.null&created_at=gt.${encodeURIComponent(since)}&limit=500`;
  const r = await jfetch(url, { headers: H });
  if (!r.ok) {
    console.error(r.status, await r.text());
    process.exit(1);
  }
  const rows = await r.json();
  const wc = (d) => (d || '').split(/\s+/).filter(Boolean).length;
  const cands = rows.filter((j) => wc(j.description) < 600 && wc(j.description) >= MIN_SOURCE);
  cands.sort((a, b) => wc(b.description) - wc(a.description));
  const batch = cands.slice(0, N);
  writeFileSync('/tmp/enrich-batch.json', JSON.stringify(batch, null, 2));
  console.log(`company=${companyKey} fetched=${rows.length} under600=${rows.filter(j=>wc(j.description)<600).length} enrichable(>=${MIN_SOURCE}w)=${cands.length} showing=${batch.length}`);
  batch.forEach((j, i) => {
    console.log(`\n===== [${i}] ${j.id}`);
    console.log(`company: ${j.company} | title: ${j.title}`);
    console.log(`location: ${j.location} | job_type: ${j.job_type} | salary: ${j.salary}`);
    console.log(`tags: ${(j.tags || []).join(', ')} | external_id: ${j.external_id}`);
    console.log(`apply_url: ${j.apply_url}`);
    console.log(`--- current description (${wc(j.description)} words) ---`);
    console.log((j.description || '').slice(0, 5000));
    console.log('--- end ---');
  });
} else if (mode === 'fetch') {
  const N = Math.max(1, Number(arg || 5));
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const url =
    `${U}/rest/v1/jobs?select=id,title,company,location,job_type,salary,tags,apply_url,external_id,description` +
    `&apply_url=not.is.null&created_at=gt.${encodeURIComponent(since)}&order=created_at.desc&limit=500`;
  const r = await jfetch(url, { headers: H });
  if (!r.ok) {
    console.error(r.status, await r.text());
    process.exit(1);
  }
  const rows = await r.json();
  const wc = (d) => (d || '').split(/\s+/).filter(Boolean).length;
  const cands = rows.filter((j) => wc(j.description) < 600);
  cands.sort((a, b) => wc(b.description) - wc(a.description));
  const batch = cands.slice(0, N);
  writeFileSync('/tmp/enrich-batch.json', JSON.stringify(batch, null, 2));
  batch.forEach((j, i) => {
    console.log(`\n===== [${i}] ${j.id}`);
    console.log(`company: ${j.company} | title: ${j.title}`);
    console.log(`location: ${j.location} | job_type: ${j.job_type} | salary: ${j.salary}`);
    console.log(`tags: ${(j.tags || []).join(', ')} | external_id: ${j.external_id}`);
    console.log(`apply_url: ${j.apply_url}`);
    console.log(`--- current description (${wc(j.description)} words) ---`);
    console.log((j.description || '').slice(0, 3000));
    console.log('--- end ---');
  });
  console.log(`\nSaved ${batch.length} candidates to /tmp/enrich-batch.json`);
} else if (mode === 'apply') {
  const data = JSON.parse(readFileSync(arg, 'utf8'));
  const ids = Object.keys(data);
  console.log(`Applying ${ids.length} enriched descriptions…`);
  let ok = 0;
  for (const id of ids) {
    const desc = data[id].trim();
    const w = desc.split(/\s+/).filter(Boolean).length;
    if (w < 600) {
      console.log(`SKIP ${id}: only ${w} words (< 600)`);
      continue;
    }
    const row = await jfetch(
      `${U}/rest/v1/jobs?select=id,tags,external_id,company_key,location,job_type&id=eq.${id}`,
      { headers: H }
    ).then((r) => r.json());
    const job = Array.isArray(row) ? row[0] : null;
    if (!job) {
      console.log(`SKIP ${id}: not found`);
      continue;
    }
    const tags = Array.isArray(job.tags) ? [...job.tags] : [];
    if (looksRemote(job.location, job.job_type, job.tags)) {
      if (!tags.includes('remote')) tags.push('remote');
    } else {
      // Never tag on-site roles as remote — accuracy first.
      tags.splice(tags.indexOf('remote'), 1);
    }
    if (!tags.includes('curated-jd')) tags.push('curated-jd');
    const patch = { description: desc, tags };
    if (!job.company_key) patch.company_key = job.company_key || '';
    const r = await jfetch(`${U}/rest/v1/jobs?id=eq.${id}`, {
      method: 'PATCH',
      headers: H,
      body: JSON.stringify(patch),
    });
    if (r.ok || r.status === 204) {
      ok++;
      console.log(`OK ${id} (${w} words) ext=${job.external_id}`);
    } else {
      console.log(`FAIL ${id}: ${r.status} ${(await r.text()).slice(0, 200)}`);
    }
  }
  console.log(`Done: ${ok}/${ids.length} applied`);
} else {
  console.log('usage: manual-enrich.mjs fetch <N> | apply <file.json>');
}
