/**
 * Create free-tier performance indexes on jobs/profiles.
 * Needs DATABASE_URL or SUPABASE_DB_PASSWORD (service_role JWT cannot run DDL).
 * Optionally pulls DB secrets from Vercel if VERCEL_TOKEN + project ids are set.
 */
import pg from 'pg';
const { Client } = pg;

const SQL = `
CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON public.jobs (created_at);
CREATE INDEX IF NOT EXISTS jobs_external_id_idx ON public.jobs (external_id);
CREATE INDEX IF NOT EXISTS jobs_dedup_hash_idx ON public.jobs (dedup_hash);
CREATE INDEX IF NOT EXISTS jobs_telegram_posted_at_idx ON public.jobs (telegram_posted_at);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);
`;

async function vercelEnvMap() {
  const token = process.env.VERCEL_TOKEN;
  const org = process.env.VERCEL_ORG_ID;
  const project = process.env.VERCEL_PROJECT_ID;
  if (!token || !project) {
    console.log('No VERCEL_TOKEN/PROJECT_ID — skip Vercel env pull');
    return {};
  }
  const qs = org ? `?teamId=${encodeURIComponent(org)}` : '';
  const r = await fetch(
    `https://api.vercel.com/v9/projects/${project}/env${qs}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!r.ok) {
    console.log('vercel env list status', r.status, (await r.text()).slice(0, 200));
    return {};
  }
  const data = await r.json();
  const envs = data.envs || [];
  const map = {};
  for (const e of envs) {
    if (e.value) map[e.key] = e.value;
    if (e.id && (e.type === 'encrypted' || e.type === 'sensitive' || !e.value)) {
      const er = await fetch(
        `https://api.vercel.com/v1/projects/${project}/env/${e.id}${qs}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (er.ok) {
        const full = await er.json();
        if (full.value) map[e.key] = full.value;
      }
    } else if (e.id && e.type === 'plain') {
      // already have value
    }
  }
  const interesting = Object.keys(map).filter((k) =>
    /SUPABASE|DATABASE|POSTGRES|DB_/i.test(k)
  );
  console.log('vercel env keys (db-related):', interesting.join(', ') || '(none)');
  return map;
}

function buildCandidates(extra = {}) {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DIRECT_URL ||
    extra.DATABASE_URL ||
    extra.POSTGRES_URL ||
    extra.DIRECT_URL ||
    extra.POSTGRES_PRISMA_URL;
  if (url) {
    return [{ connectionString: url, ssl: { rejectUnauthorized: false } }];
  }

  const password =
    process.env.SUPABASE_DB_PASSWORD ||
    process.env.POSTGRES_PASSWORD ||
    process.env.DB_PASSWORD ||
    extra.SUPABASE_DB_PASSWORD ||
    extra.POSTGRES_PASSWORD ||
    extra.DB_PASSWORD ||
    extra.SUPABASE_DB_PASS;

  const ref = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    extra.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  )
    .replace(/^https?:\/\//, '')
    .replace('.supabase.co', '')
    .replace(/\/$/, '');

  if (!password || !ref) return [];

  return [
    {
      host: `db.${ref}.supabase.co`,
      port: 5432,
      user: 'postgres',
      password,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
    },
    {
      host: 'aws-0-ap-southeast-1.pooler.supabase.com',
      port: 6543,
      user: `postgres.${ref}`,
      password,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
    },
  ];
}

const vercel = await vercelEnvMap();
const candidates = buildCandidates(vercel);
console.log('connection candidates:', candidates.length);

if (!candidates.length) {
  console.error(
    'No DATABASE_URL / SUPABASE_DB_PASSWORD found. service_role JWT cannot CREATE INDEX.'
  );
  process.exit(1);
}

let lastErr;
for (const conf of candidates) {
  const client = new Client({ ...conf, connectionTimeoutMillis: 20000 });
  try {
    await client.connect();
    console.log('connected');
    await client.query(SQL);
    const idx = await client.query(`
      select tablename, indexname
      from pg_indexes
      where schemaname = 'public'
        and tablename in ('jobs','profiles')
        and (
          indexname like '%created_at%'
          or indexname like '%external_id%'
          or indexname like '%dedup_hash%'
          or indexname like '%telegram%'
          or indexname like '%username%'
        )
      order by 1,2
    `);
    console.log('indexes present:', JSON.stringify(idx.rows, null, 2));
    await client.end();
    console.log('OK indexes applied');
    process.exit(0);
  } catch (e) {
    lastErr = e;
    console.log('candidate failed:', (e.message || String(e)).slice(0, 200));
    try {
      await client.end();
    } catch {
      /* ignore */
    }
  }
}

console.error('All candidates failed', lastErr?.message);
process.exit(1);
