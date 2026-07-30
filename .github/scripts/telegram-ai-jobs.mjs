// Telegram AI Jobs Poster — posts daily AI/ML job roundup to @hashtag_ai
//
// Pulls from the same Supabase jobs DB, but filters for:
//  1. AI/ML-relevant titles (engineer, researcher, scientist, etc.)
//  2. Famous AI companies only (top-tier labs + infra + apps)
//
// Env: TELEGRAM_AI_BOT_TOKEN, TELEGRAM_AI_CHANNEL_ID, SUPABASE_URL, SUPABASE_KEY
// Usage: node telegram-ai-jobs.mjs [--dry-run]

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { supabaseFetch, restUrl } from './supabase-fetch.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes('--dry-run');

// ─── Config ──────────────────────────────────────────────────────────────────
const BOT_TOKEN  = process.env.TELEGRAM_AI_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_AI_CHANNEL_ID || '@hashtag_ai';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.log('TELEGRAM_AI_BOT_TOKEN not set. Skipping.');
  process.exit(0);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY');
  process.exit(1);
}

const JOBS_PER_POST = 5;
// Free-tier friendly: never pull 3000 rows (that was causing Cloudflare 522s).
const RECENT_DAYS = 7;
const RECENT_LIMIT = 200;
const COMPANY_BATCH = 10;
const DEDUP_FILE = resolve(__dirname, '.telegram-ai-jobs-posted.json');
const DEDUP_MAX = 500;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ─── Pure AI companies (ALL roles are AI-relevant, skip title filter) ────────
const PURE_AI_COMPANIES = new Set([
  'openai', 'anthropic', 'deepmind', 'google deepmind', 'xai',
  'mistral', 'cohere', 'inflection', 'character', 'reka', 'aleph alpha',
  'stability ai', 'midjourney',
  'cerebras', 'groq', 'sambanova', 'tenstorrent', 'graphcore', 'd-matrix',
  'together ai', 'fireworks', 'fireworks ai', 'anyscale', 'modal', 'baseten', 'replicate',
  'hugging face', 'huggingface', 'weights & biases', 'wandb', 'langchain', 'pinecone',
  'weaviate', 'vectara', 'unstructured', 'arize',
  'cursor', 'perplexity', 'replit', 'jasper', 'grammarly', 'descript',
  'elevenlabs', 'synthesia', 'heygen', 'runway', 'pika', 'ideogram',
  'suno', 'udio', 'livekit', 'deepgram', 'moveworks', 'cresta',
  'cognition', 'sierra', 'poolside', 'contextual ai', 'tavus',
  'abnormal security', 'observe ai', 'c3 ai', 'c3.ai', 'datarobot', 'snorkel', 'snorkel ai',
  'coreweave', 'lambda', 'databricks', 'scale ai', 'scaleai', 'nvidia',
  'waymo', 'cruise', 'nuro', 'figure', 'skydio', 'shield ai', 'shieldai',
  'physical intelligence', 'sanctuary ai', 'insitro', 'pathai',
]);

// Big tech — only post if the title mentions AI/ML
const BIG_TECH_COMPANIES = new Set([
  'google', 'apple', 'microsoft', 'amazon', 'meta', 'tesla',
]);

/** Normalize company strings so "OpenAI, Inc." / "Snorkel AI" match the allowlist. */
function normalizeCompanyName(company) {
  return (company || '')
    .toLowerCase()
    .trim()
    .replace(/&amp;/g, '&')
    .replace(/[,\s]+(?:inc\.?|llc|ltd\.?|corp\.?|gmbh|pty\.?|co\.?|plc|ag|se)\.?\s*$/i, '')
    .replace(/\s*\(.*?\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Short/ambiguous allowlist names must match exactly (after normalize).
// Longer brand names may match as a prefix ("OpenAI Research", "Anthropic PBC").
const PURE_AI_EXACT_ONLY = new Set([
  'sierra', 'figure', 'modal', 'lambda', 'cruise', 'character', 'reka',
  'pika', 'udio', 'suno', 'arize', 'jasper', 'nuro', 'cohere', 'groq',
]);

function isPureAICompany(company) {
  const c = normalizeCompanyName(company);
  if (!c) return false;
  if (PURE_AI_COMPANIES.has(c)) return true;

  // "Foo AI" / "Foo.AI" → try base name (snorkel ai → snorkel)
  const withoutAi = c.replace(/\s+ai$/, '').replace(/\.ai$/, '');
  if (withoutAi !== c && PURE_AI_COMPANIES.has(withoutAi)) return true;

  // Prefix variants for unambiguous brands only
  for (const name of PURE_AI_COMPANIES) {
    if (PURE_AI_EXACT_ONLY.has(name) || name.length < 5) continue;
    if (c.startsWith(name + ' ') || c.startsWith(name + ',') || c.startsWith(name + '.')) {
      return true;
    }
  }
  return false;
}

function isBigTech(company) {
  const c = normalizeCompanyName(company);
  if (!c) return false;
  // Substring match is intentional: "Amazon Web Services (AWS)", "Google DeepMind"
  for (const name of BIG_TECH_COMPANIES) {
    if (c.includes(name)) return true;
  }
  if (c.includes('aws') || c.includes('facebook')) return true;
  return false;
}

// ─── AI/ML title patterns ────────────────────────────────────────────────────
const AI_TITLE_RE = /\b(ai\b|artificial intelligence|machine learning|ml\b|deep learning|llm|nlp\b|natural language|computer vision|cv\b|generative|gen\s*ai|foundation model|large language|diffusion|transformer|neural|reinforcement learning|rl\b|speech|perception|autonomy|autonomous|robotics|data scien|research scien|research engineer|applied scien|ml engineer|ml ops|mlops|ai engineer|ai research|ai product|ai safety|alignment|model (train|eval|deploy|infra)|prompt engineer|inference|gpu|cuda|pytorch|tensorflow|jax\b|model.*engineer|train.*engineer)/i;

// ─── Skip patterns (non-tech roles) ──────────────────────────────────────────
// ─── Skip patterns — same as tech jobs channel (telegram-post.mjs) ───────────
const BANNED_PATTERNS = [
  '\\btherapists?\\b', '\\bpsychiatric\\b', '\\bpsychiatrist\\b', '\\bnurse\\b',
  '\\bphysician\\b', '\\bmedical assistant\\b', '\\bphlebotomist\\b',
  '\\bbehavior technician\\b', '\\brbt\\b', '\\bretail ambassador\\b',
  '\\bstore (opening|associate|manager|lead|director)\\b', '\\bbarista\\b',
  '\\bjanitor\\b', '\\bcashier\\b', '\\bbookkeeper\\b', '\\bhvac\\b',
  '\\bplumbing\\b', '\\bplumber\\b', '\\bwarehouse\\b',
  '\\bdelivery driver\\b', '\\btruck driver\\b', '\\bteacher\\b', '\\btutor\\b',
  '\\bcaregiver\\b', '\\bnanny\\b', '\\bhousekeeper\\b', '\\bcleaner\\b',
  '\\bdentist\\b', '\\bdental\\b', '\\bpharmacist\\b', '\\bpharmacy\\b',
  '\\bparamedic\\b', '\\bsurgeon\\b', '\\bclinician\\b', '\\boptometrist\\b',
  '\\bveterinarian\\b', '\\bveterinary\\b', '\\bmassage\\b', '\\besthetician\\b',
  '\\bsalon\\b', '\\bspa\\b', '\\bfitness instructor\\b', '\\bpersonal trainer\\b',
  '\\bpastor\\b', '\\bclergy\\b', '\\bmechanic\\b', '\\bforklift\\b',
  '\\bbartender\\b', '\\bwaiter\\b', '\\bwaitress\\b', '\\bchef\\b', '\\bcook\\b',
  '\\bdishwasher\\b', '\\bbusser\\b', '\\bhostess\\b', '\\bcounselor\\b',
  '\\bpainter\\b', '\\bcarpenter\\b', '\\belectrician\\b', '\\bwelder\\b',
  '\\bmason\\b', '\\bconstruction\\b', '\\bsecurity guard\\b', '\\bbouncer\\b',
  '\\bkeyholder\\b', '\\bretail\\b', '\\bdispensary\\b',
  '\\bpsychologist\\b', '\\bdashmart\\b',
  '\\bshift (supervisor|leader|manager)\\b', '\\bcall center\\b',
  '\\bsoldering\\b', '\\bmanufacturing\\b', '\\brobot operator\\b',
  '\\bequipment operator\\b', '\\bassembl\\w*\\b', '\\bfactory\\b',
  '\\bdispatcher\\b', '\\bdriver\\b', '\\bdelivery\\b',
  '\\binventory\\b', '\\breceiving\\b', '\\bfulfillment\\b',
  '\\btechnician\\b', '\\bbrand ambassador\\b', '\\bpart.time\\b',
  '\\bseasonal\\b', '\\b1099\\b',
  '\\bforeman\\b', '\\bforewoman\\b', '\\bjourneyman\\b',
  '\\banimal\\b', '\\bhusbandry\\b', '\\binfusion\\b', '\\bmicrobiology\\b',
  '\\blaboratory tech\\b', '\\blab tech\\b',
  '\\bfield service\\b', '\\bfield tech\\b',
  '\\bshop tech\\b', '\\bservice tech\\b',
  '\\binstaller\\b', '\\bfabricator\\b', '\\bmaintenance\\b',
  '\\broofing\\b', '\\bpaving\\b', '\\bexcavat\\b', '\\blandscap\\b',
  '\\bpipefitter\\b', '\\bironworker\\b', '\\bscaffold\\b',
  '\\bconcrete\\b', '\\bdrywall\\b', '\\binsulation\\b',
  '\\bsales rep\\b', '\\bsales associate\\b',
  '\\bstore manager\\b', '\\bassistant.*manager\\b',
  '\\bRN\\b', '\\bLPN\\b', '\\bCNA\\b', '\\bEMT\\b',
  '\\bcustodian\\b', '\\bgroundskeeper\\b',
  '\\bproduction\\b', '\\boperator\\b', '\\bpilot\\b', '\\bsurvey\\b',
  '\\bsupply chain\\b', '\\bgrounds\\b', '\\bline tech\\b',
  '\\bcurb\\b', '\\bpowerline\\b', '\\bice cream\\b',
  '\\bhelicopter\\b', '\\bautocad\\b',
  '\\boriginations?\\b', '\\bmetal\\b', '\\bprep\\b',
  '\\btelemedicine\\b',
  // Extra: non-tech roles at AI companies
  '\\bintern\\b', '\\bco-?op\\b', '\\bbounty\\b',
  '\\bcustomer support\\b', '\\bcustomer service\\b',
  '\\blegal counsel\\b', '\\bcounsel\\b', '\\battorney\\b', '\\blawyer\\b',
  '\\bparalegal\\b', '\\boffice manager\\b', '\\breceptionist\\b',
  '\\bexecutive assistant\\b', '\\badmin assistant\\b',
  '\\baccountant\\b', '\\bpayroll\\b', '\\bbenefits\\b',
  '\\bjunior recruiter\\b', '\\brecruiting coordinator\\b',
  '\\bfacilities\\b', '\\bjanitorial\\b', '\\bcatering\\b',
];
const SKIP_RE = new RegExp(BANNED_PATTERNS.join('|'), 'i');

// ─── Dedup tracking ──────────────────────────────────────────────────────────
function loadPosted() {
  try {
    if (existsSync(DEDUP_FILE)) {
      return JSON.parse(readFileSync(DEDUP_FILE, 'utf8'));
    }
  } catch { /* start fresh */ }
  return [];
}

function savePosted(urls) {
  // Keep only last DEDUP_MAX entries
  const trimmed = urls.slice(-DEDUP_MAX);
  writeFileSync(DEDUP_FILE, JSON.stringify(trimmed, null, 2));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function decodeHTML(text) {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function escapeHTML(text) {
  if (!text) return '';
  const decoded = decodeHTML(text);
  return decoded
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const BRAND_CASE = {
  'openai': 'OpenAI', 'deepmind': 'DeepMind', 'xai': 'xAI',
  'langchain': 'LangChain', 'deepgram': 'Deepgram', 'pinecone': 'Pinecone',
  'hugging face': 'Hugging Face', 'elevenlabs': 'ElevenLabs',
  'coreweave': 'CoreWeave', 'databricks': 'Databricks',
  'perplexity': 'Perplexity', 'grammarly': 'Grammarly',
  'anthropic': 'Anthropic', 'midjourney': 'Midjourney',
  'stability ai': 'Stability AI', 'together ai': 'Together AI',
  'cerebras': 'Cerebras', 'sambanova': 'SambaNova',
  'synthesia': 'Synthesia', 'descript': 'Descript',
  'scale ai': 'Scale AI', 'cognition': 'Cognition',
  'replit': 'Replit', 'cursor': 'Cursor',
  'nvidia': 'NVIDIA', 'google': 'Google', 'apple': 'Apple',
  'microsoft': 'Microsoft', 'amazon': 'Amazon', 'meta': 'Meta',
  'tesla': 'Tesla', 'waymo': 'Waymo',
  // Added — common lowercase DB entries
  'skydio': 'Skydio', 'pika': 'Pika', 'suno': 'Suno', 'udio': 'Udio',
  'mistral': 'Mistral', 'cohere': 'Cohere', 'groq': 'Groq',
  'modal': 'Modal', 'baseten': 'Baseten', 'replicate': 'Replicate',
  'runway': 'Runway', 'heygen': 'HeyGen', 'ideogram': 'Ideogram',
  'livekit': 'LiveKit', 'moveworks': 'Moveworks', 'cresta': 'Cresta',
  'sierra': 'Sierra', 'poolside': 'Poolside', 'tavus': 'Tavus',
  'arize': 'Arize', 'snorkel': 'Snorkel AI', 'datarobot': 'DataRobot',
  'weaviate': 'Weaviate', 'vectara': 'Vectara',
  'graphcore': 'Graphcore', 'tenstorrent': 'Tenstorrent',
  'jasper': 'Jasper', 'c3 ai': 'C3 AI', 'lambda': 'Lambda',
  'figure': 'Figure', 'nuro': 'Nuro', 'cruise': 'Cruise',
  'shield ai': 'Shield AI', 'insitro': 'Insitro',
  'fireworks': 'Fireworks AI', 'anyscale': 'Anyscale',
  'inflection': 'Inflection', 'character': 'Character AI',
  'reka': 'Reka', 'aleph alpha': 'Aleph Alpha',
  'abnormal security': 'Abnormal Security', 'observe ai': 'Observe AI',
  'contextual ai': 'Contextual AI',
};

function cleanCompany(name) {
  if (!name) return '';
  let clean = decodeHTML(name)
    .replace(/[,\s]+(?:Inc\.?|LLC|Ltd\.?|Corp\.?|GmbH|Pty\.?|Co\.?|PLC|AG|SE)\.?\s*$/i, '')
    .replace(/\s*\(.*?\)/g, '')
    .trim();
  const key = clean.toLowerCase();
  if (BRAND_CASE[key]) clean = BRAND_CASE[key];
  // Break domain-like names
  if (clean.includes('.')) clean = clean.replace(/\.([a-z]{2,6})$/i, '\u200B.$1');
  return clean || decodeHTML(name);
}

function cleanLocation(loc) {
  if (!loc) return 'Remote';
  let clean = decodeHTML(loc);
  // Shorten verbose locations: "San Francisco, CA, United States" → "San Francisco, CA"
  clean = clean.replace(/,\s*(United States|USA|US|United Kingdom|UK|Canada|Australia|Germany|France)\s*$/i, '');
  clean = clean.replace(/\s*\(.*?\)/g, '');
  return clean.trim() || 'Remote';
}

// ─── Fetch AI jobs from Supabase (free-tier friendly) ────────────────────────
// Avoid one huge `limit=3000` scan (Cloudflare 522 on Free Nano).
// Strategy:
//   1) Small recent window (7d, 200 rows) for big-tech AI titles + any pure AI hits
//   2) Targeted company.ilike batches for pure-AI brands (tiny queries, high yield)
// Always order by created_at (UUID id.desc is NOT chronological).

function mergeByUrl(into, rows) {
  for (const j of rows || []) {
    if (j?.apply_url && !into.has(j.apply_url)) into.set(j.apply_url, j);
  }
}

async function fetchRecentJobs() {
  const since = new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const url = restUrl(SUPABASE_URL, 'jobs', {
    select: 'id,title,company,location,apply_url,source,created_at',
    created_at: `gt.${since}`,
    order: 'created_at.desc',
    limit: String(RECENT_LIMIT),
  });
  const rows = await supabaseFetch(url, {
    apiKey: SUPABASE_KEY,
    timeoutMs: 25_000,
    retries: 5,
    label: 'ai-jobs-recent',
  });
  return Array.isArray(rows) ? rows : [];
}

/** Tiny per-batch company lookups — each request is cheap for Free Nano. */
async function fetchByCompanyNames(names) {
  const out = new Map();
  // Prefer longer / multi-word names first; skip ultra-ambiguous shorts in SQL
  // (filter exact-ish in pickJobs anyway). Wildcards used carefully.
  const usable = names.filter((n) => n.length >= 4 && n !== 'modal' && n !== 'lambda' && n !== 'cruise');

  for (let i = 0; i < usable.length; i += COMPANY_BATCH) {
    const batch = usable.slice(i, i + COMPANY_BATCH);
    // company.ilike.*name* — PostgREST or=() list
    const or = batch
      .map((n) => {
        // escape commas/parens in filter values
        const safe = n.replace(/[,()]/g, ' ');
        return `company.ilike.*${safe}*`;
      })
      .join(',');
    const url = restUrl(SUPABASE_URL, 'jobs', {
      select: 'id,title,company,location,apply_url,source,created_at',
      or: `(${or})`,
      order: 'created_at.desc',
      limit: '30',
    });
    try {
      const rows = await supabaseFetch(url, {
        apiKey: SUPABASE_KEY,
        timeoutMs: 20_000,
        retries: 4,
        label: `ai-jobs-co[${i / COMPANY_BATCH + 1}]`,
      });
      mergeByUrl(out, rows);
    } catch (e) {
      // Don't fail the whole post if one company batch times out
      console.warn(`  ⚠️  company batch failed: ${e.message}`);
    }
    // Brief pause between batches to avoid free-tier connection spikes
    await new Promise((r) => setTimeout(r, 200));
  }
  return [...out.values()];
}

async function fetchJobs() {
  const byUrl = new Map();

  // Pass 1: recent jobs (cheap date-range scan)
  try {
    const recent = await fetchRecentJobs();
    console.log(`  Recent window: ${recent.length} jobs (last ${RECENT_DAYS}d)`);
    mergeByUrl(byUrl, recent);
  } catch (e) {
    console.warn(`  ⚠️  recent fetch failed: ${e.message}`);
  }

  // Pass 2: pure-AI company batches (fills gaps if recent window is sparse)
  try {
    const pure = await fetchByCompanyNames([...PURE_AI_COMPANIES]);
    console.log(`  Pure-AI company fetch: ${pure.length} jobs`);
    mergeByUrl(byUrl, pure);
  } catch (e) {
    console.warn(`  ⚠️  pure-AI fetch failed: ${e.message}`);
  }

  // Pass 3: if still thin, one slightly larger recent pull (not 3000)
  if (byUrl.size < 40) {
    try {
      const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const url = restUrl(SUPABASE_URL, 'jobs', {
        select: 'id,title,company,location,apply_url,source,created_at',
        created_at: `gt.${since}`,
        order: 'created_at.desc',
        limit: '400',
      });
      const rows = await supabaseFetch(url, {
        apiKey: SUPABASE_KEY,
        timeoutMs: 30_000,
        retries: 4,
        label: 'ai-jobs-fallback-14d',
      });
      console.log(`  Fallback 14d: ${Array.isArray(rows) ? rows.length : 0} jobs`);
      mergeByUrl(byUrl, rows);
    } catch (e) {
      console.warn(`  ⚠️  fallback fetch failed: ${e.message}`);
    }
  }

  if (byUrl.size === 0) {
    throw new Error('No jobs fetched from Supabase after retries (free-tier timeout?)');
  }

  return [...byUrl.values()];
}

// ─── Pick 5 AI jobs (one per company, spread across different orgs) ──────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickJobs(jobs, postedUrls) {
  const postedSet = new Set(postedUrls);
  const companySeen = new Set();
  const picked = [];

  // Filter → must be AI company + relevant title + not skipped
  const candidates = shuffle(jobs).filter(job => {
    if (!job.company || !job.title || !job.apply_url) return false;
    if (postedSet.has(job.apply_url)) return false;
    if (SKIP_RE.test(job.title)) return false;
    // Skip non-English titles
    if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff]/.test(job.title)) return false;

    // Pure AI companies → all roles are relevant
    if (isPureAICompany(job.company)) return true;
    // Big tech → only if title mentions AI/ML
    if (isBigTech(job.company) && AI_TITLE_RE.test(job.title)) return true;

    return false;
  });

  console.log(`  Candidates after filter: ${candidates.length}`);

  // First pass: Try to get one per company
  for (const job of candidates) {
    if (picked.length >= JOBS_PER_POST) break;
    const key = job.company.toLowerCase().trim();
    if (companySeen.has(key)) continue;
    companySeen.add(key);
    picked.push(job);
  }

  // Second pass: Fill remaining slots if we couldn't find 5 unique companies
  for (const job of candidates) {
    if (picked.length >= JOBS_PER_POST) break;
    if (!picked.includes(job)) {
      picked.push(job);
    }
  }

  return picked;
}

// ─── Format Telegram message (same style as tech jobs channel) ───────────────

function cleanTitle(title) {
  if (!title) return '';
  let clean = decodeHTML(title);
  clean = clean.replace(/\s*\(.*?\)/g, '');
  clean = clean.replace(/\s*\([^)]*$/, '');
  clean = clean.replace(/(?:\s+[-–]\s*|\s*[-–]\s+|—|\||\s*:\s).*$/, '');
  clean = clean.replace(/,\s+[A-Z][a-zA-Z\s&/\-]+$/, '');
  return clean.trim() || decodeHTML(title);
}

function truncate(text, max = 60) {
  if (!text || text.length <= max) return text || '';
  return text.substring(0, max - 1) + '…';
}

function formatMessage(jobs) {
  const lines = [];

  for (const job of jobs) {
    const title = truncate(cleanTitle(job.title), 60);
    const company = escapeHTML(cleanCompany(job.company));
    const url = escapeHTML(job.apply_url);

    lines.push(`• ${company} is hiring <a href="${url}">${escapeHTML(title)}</a>`);
  }

  let text = lines.join('\n');
  text += `\n\n_\nWeb3 Jobs: <a href="https://t.me/web3hiring">t.me/web3hiring</a>`;
  return text;
}

// ─── Send via Telegram Bot API ───────────────────────────────────────────────
async function sendTelegram(text) {
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });

  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.description} (code: ${data.error_code})`);
  }
  return data.result;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🤖 Telegram AI Jobs Poster');
  console.log(`  Channel: ${CHANNEL_ID}`);
  console.log(`  Dry run: ${DRY_RUN}`);

  // 1. Load dedup history
  const postedUrls = loadPosted();
  console.log(`  Previously posted: ${postedUrls.length} jobs`);

  // 2. Fetch all jobs
  const allJobs = await fetchJobs();
  console.log(`  Fetched: ${allJobs.length} jobs from DB`);

  // 3. Pick 5 AI jobs
  const jobs = pickJobs(allJobs, postedUrls);
  console.log(`  Picked: ${jobs.length} AI jobs`);

  if (jobs.length === 0) {
    console.log('  No new AI jobs to post. Done.');
    return;
  }

  // 4. Preview
  for (const job of jobs) {
    console.log(`  • ${cleanCompany(job.company)} — ${job.title}`);
  }

  // 5. Format and send
  const message = formatMessage(jobs);
  console.log(`  Message: ${message.length} chars`);
  console.log('---');
  console.log(message.replace(/<[^>]*>/g, ''));
  console.log('---');

  if (DRY_RUN) {
    console.log('  🏜️  Dry run — skipped posting and dedup update.');
    return;
  }

  // 6. Send + update dedup only on real posts
  const result = await sendTelegram(message);
  console.log(`  ✅ Posted. Message ID: ${result.message_id}`);

  const newUrls = [...postedUrls, ...jobs.map(j => j.apply_url)];
  savePosted(newUrls);
  console.log(`  Saved ${newUrls.length} total URLs to dedup file.`);
}

main().catch(e => {
  console.error('❌ AI Jobs post failed:', e.message);
  process.exit(1);
});
