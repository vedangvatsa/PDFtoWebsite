/**
 * Create free-tier performance indexes on jobs/profiles.
 * Needs DATABASE_URL or SUPABASE_DB_PASSWORD (service_role JWT cannot run DDL).
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

function buildCandidates() {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DIRECT_URL;
  if (url) {
    return [{ connectionString: url, ssl: { rejectUnauthorized: false } }];
  }

  const password =
    process.env.SUPABASE_DB_PASSWORD ||
    process.env.POSTGRES_PASSWORD ||
    process.env.DB_PASSWORD;

  const ref = (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
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

const candidates = buildCandidates();
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
          or indexname like '%telegram_posted%'
          or indexname like '%username%'
        )
      order by tablename, indexname
    `);
    console.log('indexes:', idx.rows);
    await client.end();
    process.exit(0);
  } catch (e) {
    lastErr = e;
    console.error('candidate failed:', e.message || e);
    try {
      await client.end();
    } catch {}
  }
}

console.error('all candidates failed', lastErr);
process.exit(1);
