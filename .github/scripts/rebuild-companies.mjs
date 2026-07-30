/**
 * Rebuild public.companies from jobs (last N days).
 *
 * Paths (first success wins):
 *  1. Management API SQL (SUPABASE_ACCESS_TOKEN) — best for large tables
 *  2. RPC jobs_company_stats — may hit PostgREST statement_timeout
 *  3. Paginated REST scan — always works with service role
 *
 * Env:
 *   NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY / SUPABASE_KEY
 *   SUPABASE_ACCESS_TOKEN (optional, project management token)
 *   SUPABASE_PROJECT_REF (optional, default from URL)
 *   COMPANIES_STATS_DAYS (default 30)
 *
 * Usage: node .github/scripts/rebuild-companies.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

try {
  const dotenv = require('dotenv');
  dotenv.config({ path: resolve(__dirname, '../../.env.local') });
  dotenv.config();
} catch {
  /* optional */
}

const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
).replace(/\/$/, '');
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF ||
  (SUPABASE_URL.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1] ?? '');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const DAYS = Math.max(1, Number(process.env.COMPANIES_STATS_DAYS || 30));
const UPSERT_BATCH = 200;
const SCAN_PAGE = 1000;
const SCAN_MAX_PAGES = 250; // safety cap

// ── Name normalization (keep in sync with src/lib/company-directory.ts) ──
const BLOCKLIST = new Set([
  'leverdemo 8', 'getwingapp', 'leverdemo', 'test company', 'demo company',
  'smart working solutions', 'confidential', '10xteam', 'careers - think digitally',
  'careers.azx.io', 'brook hiddink - highticket.io',
  'unknown', 'n/a', 'na', 'none', 'null', 'undefined', 'company',
]);

const NAME_MAP = {
  'doordash usa': 'DoorDash', doordash: 'DoorDash',
  'shopback 2': 'ShopBack', shopback: 'ShopBack',
  'brillio 2': 'Brillio', brillio: 'Brillio',
  lyrahealth: 'Lyra Health', 'lyra health': 'Lyra Health',
  ciandt: 'CI&T', 'ci&t': 'CI&T',
  'hadrian-automation': 'Hadrian', hadrian: 'Hadrian',
  'relativity space': 'Relativity', relativity: 'Relativity',
  'scale ai': 'Scale AI', scale: 'Scale AI',
  'unity technologies': 'Unity', unity: 'Unity',
  'base-power': 'Base Power', 'heidihealth.com.au': 'Heidi Health',
  'roadsurfer.com': 'Roadsurfer', 'the-exploration-company': 'The Exploration Company',
  'finni-health': 'Finni Health', 'apex-technology-inc': 'Apex Technology',
  northwoodspace: 'Northwood Space', horizon3ai: 'Horizon3.ai',
  marianaminerals: 'Mariana Minerals', 'vertical-aerospace': 'Vertical Aerospace',
  'govtech singapore': 'GovTech', 'govtech ': 'GovTech',
  'amplitude ': 'Amplitude',
  'kraken.com': 'Kraken', kraken: 'Kraken',
  'chime financial, inc': 'Chime', 'gusto, inc.': 'Gusto',
  openai: 'OpenAI', airwallex: 'Airwallex', snowflake: 'Snowflake',
  deel: 'Deel', notion: 'Notion', vanta: 'Vanta', ramp: 'Ramp',
  cohere: 'Cohere', langchain: 'LangChain', plaid: 'Plaid',
  perplexity: 'Perplexity', replit: 'Replit', clickup: 'ClickUp',
  cursor: 'Cursor', socure: 'Socure', sentry: 'Sentry',
  persona: 'Persona', sanity: 'Sanity', pleo: 'Pleo',
  sardine: 'Sardine', modal: 'Modal', drata: 'Drata',
  attio: 'Attio', twenty: 'Twenty', linear: 'Linear',
  infisical: 'Infisical', writer: 'Writer', confluent: 'Confluent',
  semgrep: 'Semgrep', livekit: 'LiveKit', anyscale: 'Anyscale',
  plain: 'Plain', column: 'Column', unit: 'Unit',
  supabase: 'Supabase', render: 'Render', trivago: 'trivago',
  oyster: 'Oyster', character: 'Character.AI', n8n: 'n8n',
  posthog: 'PostHog', stream: 'Stream', railway: 'Railway',
  mindvalley: 'Mindvalley', resend: 'Resend', neon: 'Neon',
  statsig: 'Statsig', stytch: 'Stytch', runway: 'Runway',
  clerk: 'Clerk', axiom: 'Axiom', inngest: 'Inngest',
  causal: 'Causal', doppler: 'Doppler', hightouch: 'Hightouch',
  huggingface: 'Hugging Face', consensys: 'ConsenSys',
  gopuff: 'Gopuff', spotify: 'Spotify', deliveroo: 'Deliveroo',
  okta: 'Okta', klaviyo: 'Klaviyo', robinhood: 'Robinhood',
  jfrog: 'JFrog', handshake: 'Handshake', palantir: 'Palantir',
  lyft: 'Lyft', coinbase: 'Coinbase', hostinger: 'Hostinger',
  instacart: 'Instacart', remote: 'Remote', dropbox: 'Dropbox',
  duolingo: 'Duolingo', cribl: 'Cribl', databricks: 'Databricks',
  harvey: 'Harvey', everai: 'EverAI', applied: 'Applied',
  illumio: 'Illumio', instructure: 'Instructure', deepl: 'DeepL',
  siteminder: 'SiteMinder', gamma: 'Gamma', lovable: 'Lovable',
  floqast: 'FloQast', elfbeauty: 'e.l.f. Beauty',
  swordhealth: 'Sword Health', rothys: "Rothy's",
};

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+$/, '')
    .replace(/^-+/, '');
}

function canonicalize(raw) {
  const trimmed = (raw || '').trim();
  if (!trimmed || trimmed.includes('...')) return null;
  const lower = trimmed.toLowerCase();
  if (BLOCKLIST.has(lower)) return null;
  return NAME_MAP[lower] || trimmed;
}

function simplifyLocation(raw) {
  if (!raw) return null;
  let loc = String(raw).trim();
  if (!loc) return null;
  if (/remote|hybrid|work from home|wfh|worldwide|anywhere|global/i.test(loc)) return null;
  loc = loc.split(',')[0].trim();
  if (loc.length < 2 || loc.length > 40) return null;
  if (/https?:|@|\d{5,}/i.test(loc)) return null;
  return loc;
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function mgmtQuery(sql) {
  if (!ACCESS_TOKEN || !PROJECT_REF) return null;
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'cvin-rebuild-companies/1.0',
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`mgmt ${res.status}: ${text.slice(0, 300)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function fetchStatsViaMgmt() {
  const sql = `
SET statement_timeout = '180s';
SELECT
  j.company,
  count(*)::bigint AS role_count,
  min(j.company_logo) FILTER (
    WHERE j.company_logo IS NOT NULL AND btrim(j.company_logo) <> ''
  ) AS logo,
  (array_agg(j.location) FILTER (
    WHERE j.location IS NOT NULL
      AND btrim(j.location) <> ''
      AND j.location !~* 'remote|hybrid|worldwide|anywhere'
  ))[1:6] AS locations,
  max(coalesce(j.published_at, j.created_at)) AS latest_job_at
FROM public.jobs j
WHERE j.created_at > now() - interval '${DAYS} days'
  AND j.company IS NOT NULL
  AND btrim(j.company) <> ''
  AND j.company NOT LIKE '%...%'
GROUP BY j.company;
`;
  const rows = await mgmtQuery(sql);
  if (!Array.isArray(rows)) throw new Error('mgmt returned non-array');
  return rows;
}

async function fetchStatsViaRpc() {
  const { data, error } = await sb.rpc('jobs_company_stats', { days: DAYS });
  if (error) throw error;
  return data || [];
}

async function fetchStatsViaScan() {
  console.warn('  using paginated REST scan');
  const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString();
  const byCompany = new Map();
  let page = 0;
  let lastCreated = null;
  let lastId = null;

  // Keyset on (created_at, id) avoids OFFSET blowups
  while (page < SCAN_MAX_PAGES) {
    let q = sb
      .from('jobs')
      .select('id, company, company_logo, location, published_at, created_at')
      .gt('created_at', since)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .limit(SCAN_PAGE);

    if (lastCreated && lastId) {
      // (created_at, id) > (lastCreated, lastId)
      q = q.or(
        `and(created_at.gt.${lastCreated}),and(created_at.eq.${lastCreated},id.gt.${lastId})`
      );
    }

    const { data, error } = await q;
    if (error) throw error;
    if (!data?.length) break;

    for (const j of data) {
      if (!j.company) continue;
      const key = j.company;
      let row = byCompany.get(key);
      if (!row) {
        row = {
          company: key,
          role_count: 0,
          logo: null,
          locations: new Set(),
          latest_job_at: null,
        };
        byCompany.set(key, row);
      }
      row.role_count += 1;
      if (j.company_logo && !row.logo) row.logo = j.company_logo;
      if (j.location) row.locations.add(j.location);
      const d = j.published_at || j.created_at;
      if (d && (!row.latest_job_at || d > row.latest_job_at)) row.latest_job_at = d;
    }

    const last = data[data.length - 1];
    lastCreated = last.created_at;
    lastId = last.id;
    page++;
    if (page % 20 === 0) {
      console.log(`  scanned ~${page * SCAN_PAGE} rows, ${byCompany.size} companies…`);
    }
    if (data.length < SCAN_PAGE) break;
  }

  return [...byCompany.values()].map((r) => ({
    company: r.company,
    role_count: r.role_count,
    logo: r.logo,
    locations: [...r.locations],
    latest_job_at: r.latest_job_at,
  }));
}

function mergeCanonical(rawRows) {
  const map = new Map();

  for (const row of rawRows) {
    const display = canonicalize(row.company);
    if (!display) continue;
    const key = display.toLowerCase().trim();
    let entry = map.get(key);
    if (!entry) {
      entry = {
        name: display,
        nameCounts: {},
        role_count: 0,
        logo: null,
        locations: new Map(),
        latest_job_at: null,
      };
      map.set(key, entry);
    }
    const n = Number(row.role_count || 0);
    entry.nameCounts[display] = (entry.nameCounts[display] || 0) + n;
    entry.role_count += n;
    if (row.logo && !entry.logo) entry.logo = row.logo;
    const locs = Array.isArray(row.locations) ? row.locations : [];
    for (const loc of locs) {
      const simple = simplifyLocation(loc);
      if (!simple) continue;
      entry.locations.set(simple, (entry.locations.get(simple) || 0) + 1);
    }
    if (
      row.latest_job_at &&
      (!entry.latest_job_at || row.latest_job_at > entry.latest_job_at)
    ) {
      entry.latest_job_at = row.latest_job_at;
    }
  }

  const out = [];
  for (const entry of map.values()) {
    entry.name = Object.entries(entry.nameCounts).sort((a, b) => b[1] - a[1])[0][0];
    const slug = toSlug(entry.name);
    if (!slug) continue;
    const topLocs = [...entry.locations.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    out.push({
      slug,
      name: entry.name,
      role_count: entry.role_count,
      logo: entry.logo,
      locations: topLocs,
      latest_job_at: entry.latest_job_at,
      updated_at: new Date().toISOString(),
    });
  }

  const bySlug = new Map();
  for (const row of out) {
    const prev = bySlug.get(row.slug);
    if (!prev || row.role_count > prev.role_count) bySlug.set(row.slug, row);
  }
  return [...bySlug.values()].sort((a, b) => b.role_count - a.role_count);
}

async function loadRawStats() {
  if (ACCESS_TOKEN && PROJECT_REF) {
    try {
      const rows = await fetchStatsViaMgmt();
      console.log(`  management SQL: ${rows.length} raw companies`);
      return rows;
    } catch (e) {
      console.warn(`  management SQL failed: ${e.message}`);
    }
  }

  try {
    const rows = await fetchStatsViaRpc();
    console.log(`  RPC: ${rows.length} raw companies`);
    return rows;
  } catch (e) {
    console.warn(`  RPC failed: ${e.message || e}`);
  }

  const rows = await fetchStatsViaScan();
  console.log(`  scan: ${rows.length} raw companies`);
  return rows;
}

async function main() {
  console.log(`rebuild-companies: last ${DAYS}d`);
  const t0 = Date.now();

  const raw = await loadRawStats();
  const companies = mergeCanonical(raw);
  console.log(`  after normalize: ${companies.length} companies (${Date.now() - t0}ms)`);

  if (companies.length === 0) {
    console.error('No companies produced — aborting (will not wipe table)');
    process.exit(1);
  }

  let upserted = 0;
  for (let i = 0; i < companies.length; i += UPSERT_BATCH) {
    const batch = companies.slice(i, i + UPSERT_BATCH);
    const { error } = await sb.from('companies').upsert(batch, { onConflict: 'slug' });
    if (error) {
      console.error('upsert failed', error.message, error.details);
      process.exit(1);
    }
    upserted += batch.length;
    if (i === 0 || (i / UPSERT_BATCH) % 10 === 0) {
      console.log(`  upserted ${upserted}/${companies.length}`);
    }
  }
  console.log(`  upserted total: ${upserted}`);

  const keep = new Set(companies.map((c) => c.slug));
  let page = 0;
  let pruned = 0;
  while (page < 50) {
    const { data: existing, error: listErr } = await sb
      .from('companies')
      .select('slug')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (listErr) {
      console.warn('prune list failed:', listErr.message);
      break;
    }
    if (!existing?.length) break;
    const stale = existing.map((r) => r.slug).filter((s) => !keep.has(s));
    if (stale.length) {
      for (let i = 0; i < stale.length; i += 200) {
        const chunk = stale.slice(i, i + 200);
        const { error: delErr } = await sb.from('companies').delete().in('slug', chunk);
        if (delErr) console.warn('prune failed:', delErr.message);
        else pruned += chunk.length;
      }
    }
    if (existing.length < 1000) break;
    page++;
  }
  console.log(`  pruned ${pruned} stale companies`);

  const top = companies
    .slice(0, 5)
    .map((c) => `${c.name}(${c.role_count})`)
    .join(', ');
  console.log(`✅ companies directory ready in ${((Date.now() - t0) / 1000).toFixed(1)}s — top: ${top}`);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
