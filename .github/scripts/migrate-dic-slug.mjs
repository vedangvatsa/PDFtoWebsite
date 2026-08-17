/**
 * One-off: move Digital India Corporation hub from digital-india-corporation → dic.
 * Usage: node .github/scripts/migrate-dic-slug.mjs
 */
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pingIndexNow } from './lib/indexnow.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

const OLD = 'digital-india-corporation';
const NEW = 'dic';
const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

function headers(extra = {}) {
  return { apikey: K, Authorization: `Bearer ${K}`, ...extra };
}

function remapId(value) {
  if (!value) return value;
  const s = String(value);
  const p = `${OLD}_`;
  if (s.toLowerCase().startsWith(p)) return `${NEW}_${s.slice(p.length)}`;
  return s;
}

async function main() {
  if (!U || !K) {
    console.error('Need Supabase env');
    process.exit(1);
  }

  const jobsUrl =
    `${U}/rest/v1/jobs?or=(company_key.eq.${OLD},source.eq.dic-careers)` +
    '&select=id,title,external_id,slug,company_key';
  const jobs = await fetch(jobsUrl, { headers: headers() }).then((r) => r.json());
  if (!Array.isArray(jobs)) throw new Error(JSON.stringify(jobs).slice(0, 200));
  console.log(`Updating ${jobs.length} jobs…`);

  for (const job of jobs) {
    const patch = {
      company_key: NEW,
      external_id: remapId(job.external_id),
      slug: remapId(job.slug),
    };
    const r = await fetch(`${U}/rest/v1/jobs?id=eq.${job.id}`, {
      method: 'PATCH',
      headers: {
        ...headers({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
      },
      body: JSON.stringify(patch),
    });
    if (!r.ok) {
      console.error(`  fail ${job.title}: ${(await r.text()).slice(0, 160)}`);
    }
  }

  const coGet = await fetch(`${U}/rest/v1/companies?slug=eq.${OLD}&select=*`, {
    headers: headers(),
  });
  const coRows = await coGet.json();
  const oldCo = Array.isArray(coRows) ? coRows[0] : null;

  if (oldCo) {
    const row = { ...oldCo, slug: NEW, updated_at: new Date().toISOString() };
    delete row.id;
    const ins = await fetch(`${U}/rest/v1/companies?on_conflict=slug`, {
      method: 'POST',
      headers: {
        ...headers({
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal',
        }),
      },
      body: JSON.stringify([row]),
    });
    if (!ins.ok) console.warn('companies upsert:', (await ins.text()).slice(0, 200));
    await fetch(`${U}/rest/v1/companies?slug=eq.${OLD}`, {
      method: 'DELETE',
      headers: headers({ Prefer: 'return=minimal' }),
    });
    console.log('Companies row: digital-india-corporation → dic');
  } else {
    const ins = await fetch(`${U}/rest/v1/companies?on_conflict=slug`, {
      method: 'POST',
      headers: {
        ...headers({
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal',
        }),
      },
      body: JSON.stringify([
        {
          slug: NEW,
          name: 'Digital India Corporation',
          role_count: jobs.length,
          latest_job_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]),
    });
    if (!ins.ok) console.warn('companies insert:', (await ins.text()).slice(0, 200));
    console.log('Companies row: created dic');
  }

  const paths = [
    `/${NEW}`,
    '/jobs',
    ...jobs.map((j) => `/${NEW}/${String(remapId(j.external_id)).replace(`${NEW}_`, '')}`),
  ];
  const ping = await pingIndexNow(paths);
  console.log(ping.ok ? `IndexNow ok (${ping.submitted})` : `IndexNow failed ${ping.error || ''}`);
  console.log('Done. Hub: https://cvin.bio/dic');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
