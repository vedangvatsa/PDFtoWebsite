/**
 * Discover + verify additional Lever ATS company slugs from public directories:
 *  1. bloomberry.com/data/lever/          — exact jobs.lever.co/{slug} links (live scrape)
 *  2. theirstack.com/en/technology/lever  — top companies (+ country pages), name+domain pairs
 *  3. technologychecker.io/technology/lever — demo company names
 * Each candidate slug is verified against the Lever API (200 + has postings = valid).
 * Verified slugs not already in jobs-sync's LEVER_SLUGS are written to
 * .github/scripts/lever-slugs-extra.json.
 *
 * Usage: node .github/scripts/discover-lever-slugs.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, 'lever-slugs-extra.json');

async function fetchText(url) {
  const r = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125.0' },
    signal: AbortSignal.timeout(30000),
  });
  return r.ok ? await r.text() : '';
}

// 1) Bloomberry: exact slugs
async function bloomberrySlugs() {
  const html = await fetchText('https://bloomberry.com/data/lever/');
  return [...new Set([...html.matchAll(/https?:\/\/(?:www\.)?jobs\.lever\.co\/([a-z0-9-]+)/gi)].map((m) => m[1]))];
}

// 2) TheirStack: names (main + country pages), with domain hints where visible
const TS_COUNTRIES = ['us', 'gb', 'ca', 'fr', 'au', 'de', 'in'];
async function theirStackNames() {
  const names = new Set();
  const domains = new Map(); // name -> domain hint
  for (const url of ['https://theirstack.com/en/technology/lever', ...TS_COUNTRIES.map((c) => `https://theirstack.com/en/technology/lever/${c}`)]) {
    // The page is client-rendered; render it via r.jina.ai to get the table.
    const html = await fetchText(`https://r.jina.ai/${url}`);
    for (const m of html.matchAll(/domain\/([a-z0-9.-]+)\.(?:jpeg|png|gif)[^)]*\)[^\[]*\[([^\]\n]{2,50})\]/gi)) {
      const d = m[1].replace(/^www\./, '');
      const n = m[2].trim();
      names.add(n);
      domains.set(n, d);
    }
    for (const m of html.matchAll(/\[([A-Z][^\]\n]{2,50})\]\((?:https:\/\/app\.theirstack\.com\/home\?)/g)) {
      const n = m[1].trim();
      if (!/^(Home|Pricing|Log in|Sign up|See all|Get alerted|Export|Technologies|HRMS|English|Skip|Go to)/i.test(n)) {
        names.add(n);
      }
    }
  }
  return { names: [...names], domains };
}

// 2b) TheirStack API (free tier page 1, real names + domains)
const TS_API_PAIRS = [
  ['Ci&T', 'ciandt.com'], ['Binance', 'binance.com'], ['Paytm', 'paytm.com'],
  ['Octopus Energy', 'octopusenergy.group'], ['WinnCompanies', 'winncompanies.com'],
  ['Shield AI', 'shield.ai'], ['Zoox', 'zoox.com'], ['Edelman', 'edelman.com'],
  ['Nielsen', 'nielsen.com'], ['Dun & Bradstreet', 'dnb.co.in'], ['Veepee', 'veepee.com'],
  ['Vohra Wound Physicians', 'vohrawoundcare.com'], ['Planned Parenthood', 'plannedparenthood.org'],
  ['Daniels Health', 'info.danielshealth.com'], ['Xero', 'xero.com'], ['Mobileye', 'mobileye.com'],
  ['CSC Generation', 'cscgeneration.com'], ['Gopuff', 'gopuff.com'],
  ['Contact Government Services, LLC', null], ['CesiumAstro', 'cesiumastro.com'],
  ['Ninja Van', 'ninjavan.co'], ['Aledade, Inc.', 'aledade.com'],
  ['Extreme Networks', 'extremenetworks.com'], ['banco BV', 'bancobv.com.br'],
  ['despegar.com', 'despegar.com'],
];

// 3) TechChecker: demo names
const TECHCHECKER_NAMES = [
  'Shopify', 'LinkedIn', 'Remote.com', 'Klarna', 'Palantir', 'Rackspace Technology',
  'TechStars', 'Xero', 'Getty Images', '1Password',
];

// Known slug aliases (name -> lever slug) where slug != kebab(name)
const SLUG_ALIASES = {
  'ci&t': 'ciandt', 'cit': 'ciandt', 'dun & bradstreet': 'dnb',
  'rackspace technology': 'rackspace', '1password': '1password', 'remote.com': 'remote',
  'shield ai': 'shieldai', 'vohra wound physicians': 'vohrawoundcare',
  'lifestance health': 'lifestance', 'techstars': 'techstars', 'winncompanies': 'winncompanies',
  'life stance health': 'lifestance',
};

function slugify(name, domainHint) {
  const n = String(name || '').toLowerCase().trim();
  if (SLUG_ALIASES[n]) return [SLUG_ALIASES[n]];
  const out = [];
  if (domainHint) {
    const d = String(domainHint).toLowerCase().split('.')[0].replace(/[^a-z0-9-]/g, '');
    if (d.length > 2) out.push(d);
  }
  const base = n.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (base && base.length > 2) out.push(base, `${base}-inc`, `${base}-corp`, `${base}-2`);
  return [...new Set(out)];
}

async function verifySlug(slug) {
  try {
    const r = await fetch(`https://api.lever.co/v0/postings/${encodeURIComponent(slug)}?mode=json`, {
      signal: AbortSignal.timeout(20000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!r.ok) return { ok: false, jobs: 0 };
    const d = await r.json();
    return { ok: true, jobs: Array.isArray(d) ? d.length : 0 };
  } catch {
    return { ok: false, jobs: 0 };
  }
}

async function main() {
  const bb = await bloomberrySlugs();
  console.log('bloomberry exact slugs:', bb.length);
  const { names: tsNames, domains } = await theirStackNames();
  console.log('theirstack names:', tsNames.length);

  const candidates = new Map(); // slug -> { source, jobs }
  for (const s of bb) candidates.set(s, { source: 'bloomberry' });
  for (const [name, domain] of TS_API_PAIRS) {
    if (!domains.has(name)) domains.set(name, domain);
  }
  for (const name of [...tsNames, ...TECHCHECKER_NAMES]) {
    for (const s of slugify(name, domains.get(name))) {
      if (!candidates.has(s)) candidates.set(s, { source: name.slice(0, 30) });
    }
  }
  console.log('total candidates:', candidates.size);

  const existing = readFileSync(resolve(__dirname, 'jobs-sync.mjs'), 'utf8')
    .match(/'[a-z0-9-]{2,40}'/g).map((m) => m.slice(1, -1));
  const existingSet = new Set(existing);

  const list = [...candidates.keys()].filter((s) => !existingSet.has(s));
  const verified = [];
  const concurrency = 10;
  let idx = 0;
  async function worker() {
    while (idx < list.length) {
      const slug = list[idx++];
      const res = await verifySlug(slug);
      if (res.ok && res.jobs > 0) {
        verified.push({ slug, jobs: res.jobs, source: candidates.get(slug)?.source });
        console.log(`  ✓ ${slug} (${res.jobs} jobs, ${candidates.get(slug)?.source})`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  verified.sort((a, b) => a.slug.localeCompare(b.slug));

  writeFileSync(OUT, JSON.stringify(verified.map((v) => v.slug), null, 1));
  console.log(`verified new slugs (with active jobs): ${verified.length} -> ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
