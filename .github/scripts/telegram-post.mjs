// Telegram Job Poster — posts latest jobs to a Telegram channel
// Piggybacks on the existing 3x/day cron (zero extra compute)
// Telegram Bot API is 100% free with no rate limits for channel posting
//
// Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID, SUPABASE_URL, SUPABASE_KEY

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { supabaseFetch, restUrl } from './supabase-fetch.mjs';

// ─── Banned Jobs Filter (must match jobs-sync.mjs) ───
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
  // Additional patterns for junk that was slipping through
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
  // Round 3
  '\\bproduction\\b', '\\boperator\\b', '\\bpilot\\b', '\\bsurvey\\b',
  '\\bsupply chain\\b', '\\bgrounds\\b', '\\bline tech\\b',
  '\\bcurb\\b', '\\bpowerline\\b', '\\bice cream\\b',
  '\\bhelicopter\\b', '\\bautocad\\b',
  '\\boriginations?\\b', '\\bmetal\\b', '\\bprep\\b',
  '\\btelemedicine\\b',
];
const BANNED_REGEX = new RegExp(BANNED_PATTERNS.join('|'), 'i');

const BOT_TOKEN  = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.log('TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID not set. Skipping.');
  process.exit(0);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY');
  process.exit(1);
}

const JOBS_PER_POST = 10;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN || '';
const LINKEDIN_PERSON_URN = process.env.LINKEDIN_PERSON_URN || '';

// ── Helpers ───────────────────────────────────────────────────────────────

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
  // Decode first to prevent double-encoding, then re-escape
  const decoded = decodeHTML(text);
  return decoded
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Known brands whose casing can't be derived from title case
const BRAND_CASE = {
  'deepl': 'DeepL',
  'deepmind': 'DeepMind',
  'openai': 'OpenAI',
  'mongodb': 'MongoDB',
  'webflow': 'Webflow',
  'clickup': 'ClickUp',
  'linkedin': 'LinkedIn',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'bitgo': 'BitGo',
  'coinbase': 'Coinbase',
  'okx': 'OKX',
  'bybit': 'Bybit',
  'sofi': 'SoFi',
  'postman': 'Postman',
  'langchain': 'LangChain',
  'datadog': 'Datadog',
  'snowflake': 'Snowflake',
  'hashicorp': 'HashiCorp',
  'devrev': 'DevRev',
  'airbnb': 'Airbnb',
  'infobip': 'Infobip',
  'hubspot': 'HubSpot',
  'shopify': 'Shopify',
  'cloudflare': 'Cloudflare',
  'nerdwallet': 'NerdWallet',
  'mckinsey': 'McKinsey',
  'descript': 'Descript',
  'synthesia': 'Synthesia',
  'pinecone': 'Pinecone',
  'deepgram': 'Deepgram',
  'supabase': 'Supabase',
  'perplexity': 'Perplexity',
  'replit': 'Replit',
  'taskrabbit': 'TaskRabbit',
  'servicenow': 'ServiceNow',
  'airwallex': 'Airwallex',
  'gopuff': 'Gopuff',
};

function titleCase(str) {
  if (!str) return '';
  // Don't title-case ALL-CAPS acronyms (e.g. "OKX", "AWS")
  if (str === str.toUpperCase() && str.length <= 5) return str;
  return str
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function cleanCompany(name) {
  if (!name) return '';
  let clean = decodeHTML(name);
  // Strip legal suffixes (require space/comma before suffix to avoid matching word endings like 'Wise')
  clean = clean
    .replace(/[,\s]+(?:Inc\.?|LLC|Ltd\.?|Corp\.?|GmbH|S\.?R\.?L\.?|Pty\.?|Co\.?|PLC|AG|SE)\.?\s*$/i, '')
    .replace(/\s+(Infrastructure|Technology|Technologies|Solutions|Services|Digital|Software|Global|Group|International)\s*&.*$/i, '')
    .replace(/\s*\(.*?\)/g, '')
    .replace(/\s+\d+$/, '') // Strip trailing numbers like "Shopback 2"
    .trim();
  // Fix capitalization: check brand map first, then title-case
  const key = clean.toLowerCase();
  if (BRAND_CASE[key]) {
    clean = BRAND_CASE[key];
  } else if (clean === clean.toLowerCase()) {
    // Only title-case if the name is all-lowercase (don't touch mixed case like "ServiceNow")
    clean = titleCase(clean);
  }
  // Break domain-like names so Telegram doesn't auto-link (e.g. Expatfile.tax)
  if (clean.includes('.')) {
    clean = clean.replace(/\.([a-z]{2,6})$/i, '\u200B.$1');
  }
  return clean || decodeHTML(name);
}

function cleanTitle(title) {
  if (!title) return '';
  let clean = decodeHTML(title);
  // Remove ALL parenthetical content (closed parens)
  clean = clean.replace(/\s*\(.*?\)/g, '');
  // Remove unclosed parentheticals like "(React Native" with no closing )
  clean = clean.replace(/\s*\([^)]*$/, '');
  // Remove everything after separators (hyphen/en-dash with >=1 space, em-dash, pipe, or colon)
  clean = clean.replace(/(?:\s+[-–]\s*|\s*[-–]\s+|—|\||\s*:\s).*$/, '');
  // Remove comma-separated department qualifiers like ", Post-Training" or ", Brand & Communications"
  clean = clean.replace(/,\s+[A-Z][a-zA-Z\s&/\-]+$/, '');
  return clean.trim() || decodeHTML(title);
}

function truncate(text, max = 60) {
  if (!text || text.length <= max) return text || '';
  return text.substring(0, max - 1) + '…';
}

// ── Fetch unposted jobs from Supabase ────────────────────────────────────
// Ultra-light for Free Nano: short window + small limit + retries.
// Tradeoff: less backlog catch-up / thinner category pool vs fewer 522/503s.
// Only curated sources — BambooHR excluded (unfiltered junk).
const TELEGRAM_ALLOWED_SOURCES = ['greenhouse', 'ashby', 'lever', 'workable', 'remoteok'];
const FETCH_DAYS = 1;        // ultra-light: last 24h only
const FETCH_LIMIT = 40;      // ultra-light: small payload
const FALLBACK_DAYS = 2;     // only if first pass is too thin
const FALLBACK_LIMIT = 60;

async function fetchJobsPage({ days, limit, label }) {
  const sourceFilter = TELEGRAM_ALLOWED_SOURCES.map(s => `"${s}"`).join(',');
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const url = restUrl(SUPABASE_URL, 'jobs', {
    // Minimal columns — less IO on free tier
    select: 'id,title,company,location,apply_url,published_at,telegram_posted_at,external_id',
    source: `in.(${sourceFilter})`,
    published_at: `gt.${since}`,
    order: 'published_at.desc',
    limit: String(limit),
  });

  const jobs = await supabaseFetch(url, {
    apiKey: SUPABASE_KEY,
    timeoutMs: 20_000,
    retries: 5,
    label,
  });
  if (!Array.isArray(jobs)) throw new Error('Unexpected jobs response');
  return jobs.filter(j => !j.telegram_posted_at);
}

async function fetchUnpostedJobs() {
  // Pass 1: ultra-light
  let jobs = await fetchJobsPage({
    days: FETCH_DAYS,
    limit: FETCH_LIMIT,
    label: 'telegram-jobs-1d',
  });
  console.log(`  Ultra-light fetch: ${jobs.length} unposted (last ${FETCH_DAYS}d, limit ${FETCH_LIMIT})`);

  // Pass 2: slightly larger only if we can't fill a post
  if (jobs.length < JOBS_PER_POST) {
    console.log(`  Thin pool (${jobs.length} < ${JOBS_PER_POST}) — fallback ${FALLBACK_DAYS}d / ${FALLBACK_LIMIT}`);
    try {
      const more = await fetchJobsPage({
        days: FALLBACK_DAYS,
        limit: FALLBACK_LIMIT,
        label: 'telegram-jobs-fallback',
      });
      const seen = new Set(jobs.map(j => j.id));
      for (const j of more) {
        if (!seen.has(j.id)) jobs.push(j);
      }
      console.log(`  After fallback: ${jobs.length} unposted`);
    } catch (e) {
      console.warn(`  ⚠️  fallback fetch failed: ${e.message}`);
    }
  }

  return jobs;
}

// ── Pick jobs: 2+ remote, 1 per company, diverse locations ───────────────

function isRemote(loc) {
  return !loc || loc.toLowerCase().includes('remote');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Priority companies — big names drive reshares ────────────────────────
const PRIORITY_COMPANIES = new Set([
  'airbnb','anthropic','stripe','coinbase','databricks','discord','dropbox','figma',
  'gitlab','google','meta','microsoft','apple','amazon','netflix','openai','shopify',
  'slack','snap','spotify','square','tiktok','uber','vercel','cloudflare','datadog',
  'twilio','reddit','pinterest','linkedin','oracle','salesforce','adobe','nvidia',
  'palantir','robinhood','ripple','binance','plaid','brex','ramp','mercury','chime',
  'affirm','klarna','revolut','wise','deel','remote','notion','linear','retool',
  'supabase','mongodb','elastic','grafana','hashicorp','confluent','snowflake',
  'github','atlassian','canva','asana','airtable','monday','hubspot','zendesk',
  'intercom','twitch','epic games','unity','riot games','duolingo','instacart',
  'doordash','lyft','waymo','cruise','nuro','postman','deepmind','stability ai',
  'cohere','mistral','scale ai','coreweave','lambda','perplexity','cursor','replit',
  'warp','raycast','sentry','pagerduty','okta','crowdstrike','zscaler','1password',
  'livekit','elevenlabs','midjourney','hugging face','runway','character',
  'uniswap','alchemy','chainalysis','fireblocks','consensys','phantom','opensea',
  'wealthsimple','monzo','nubank','mercari','flexport','faire','toast',
  // AI companies
  'inflection','cerebras','groq','grammarly','figure','shield ai',
  'khan academy','sambanova','snorkel','descript','jasper','c3 ai',
  'datarobot','together ai','lightning ai','xai','labelbox',
  // AI companies — round 2 (top 100)
  'reka','aleph alpha','langchain','unstructured','pinecone','weaviate',
  'graphcore','tenstorrent','heygen','pika','ideogram','suno','udio',
  'moveworks','abnormal security','arize','fireworks','contextual ai',
  'cognition','poolside','livekit','deepgram','skydio','insitro','pathai',
  'vectara','cresta','observe ai','modal','baseten','anyscale','tavus',
  'physical intelligence','sanctuary ai','d-matrix','rain ai',
  // Web3 protocols
  'solana','arbitrum','optimism','eigenlayer','celestia','avalanche',
  'polkadot','layerzero','zksync','magic eden','injective','pyth',
  // More tech companies
  'spotify','netflix','jetbrains','atlassian','webflow','amplitude',
  'mixpanel','supabase','posthog','railway','algolia','contentful',
  'plaid','ramp','deel','n26','trade republic','lemonade',
]);

// ─── Categories Filter Regexes ───────────────────────────────────────────
const TECH_RE = /\b(engineer|developer|programmer|architect|frontend|backend|fullstack|devops|sre|security|cyber|infrastructure|qa|test|compiler|systems|firmware|hardware|machine learning|ml|ai|artificial intelligence|deep learning|data scientist|data science|data eng|data tech|database|db\b|it\b|information technology|tech\b|technology|support engineer|system admin|network|cloud)\b/i;

const PRODUCT_RE = /\b(product manager|pm\b|project manager|scrum|product owner|agile|delivery manager|designer|design\b|ux\b|ui\b|creative|art\b|illustrator|graphic|user research|data analyst|analytics|analyst|business analyst|bi analyst|intelligence analyst|strategist|strategy)\b/i;

const BUSINESS_RE = /\b(sales|business development|bd\b|account manager|account executive|ae\b|marketing|growth|seo|copywriter|content|brand|social media|pmm|advertising|pr\b|public relations|customer success|support specialist|operations|ops|finance|accounting|accountant|audit|payroll|billing|tax|treasury|controller|recruiter|hr|talent|people|culture|legal|compliance|counsel|lawyer|attorney|office|admin|exec|chief|ceo|cfo|coo|cro|president|director|manager|buyer|procurement|supply chain|logistics)\b/i;

function getCategoryRegex(category) {
  if (category === 'developer') return TECH_RE;
  if (category === 'product') return PRODUCT_RE;
  if (category === 'business') return BUSINESS_RE;
  return null;
}

function getAutomaticCategory() {
  const options = { timeZone: 'Asia/Singapore', hour: 'numeric', hour12: false };
  const sgtHour = parseInt(new Intl.DateTimeFormat('en-US', options).format(new Date()), 10);
  console.log(`  Current SGT Hour: ${sgtHour}`);
  if (sgtHour >= 8 && sgtHour < 15) {
    return 'developer';
  } else if (sgtHour >= 15 && sgtHour < 23) {
    return 'product';
  } else {
    return 'business';
  }
}

function isHighProfileCompany(company) {
  const c = company.toLowerCase().trim();
  for (const p of PRIORITY_COMPANIES) {
    if (c.includes(p) || p.includes(c)) return true;
  }
  return false;
}

function pickJobs(jobs, limit, category) {
  const seen = new Set();
  const priority = [];
  const regular = [];
  const overflow = []; // extra jobs from same companies if we need to fill

  const catRegex = getCategoryRegex(category);

  // Segregate jobs based on category
  const matchingJobs = [];
  const nonMatchingJobs = [];

  for (const job of jobs) {
    // Skip bad data: truncated names, non-English titles
    if (!job.company || job.company.includes('...') || job.company.length <= 2) continue;
    if (!job.title || /[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff]/.test(job.title)) continue;
    if (BANNED_REGEX.test(job.title)) continue;
    // Never post a UUID-fallback URL — every posted link must be /{company}/{slug}
    if (!shortJobSlug(job.company, job.external_id)) continue;

    if (catRegex && catRegex.test(job.title)) {
      matchingJobs.push(job);
    } else {
      nonMatchingJobs.push(job);
    }
  }

  // Pick category matching jobs first
  for (const job of matchingJobs) {
    const key = job.company.toLowerCase().trim();
    if (seen.has(key)) {
      overflow.push(job); // save for backfill
      continue;
    }
    seen.add(key);

    if (isHighProfileCompany(job.company)) {
      priority.push(job);
    } else {
      regular.push(job);
    }
  }

  const picked = [...priority.slice(0, limit)];
  if (picked.length < limit) {
    picked.push(...regular.slice(0, limit - picked.length));
  }

  // Smart fallback: If we don't have 10 matching jobs, backfill with other categories
  if (picked.length < limit) {
    console.log(`  Category [${category}] has only ${picked.length} jobs. Backfilling with other categories.`);
    const backfillPriority = [];
    const backfillRegular = [];

    for (const job of nonMatchingJobs) {
      const key = job.company.toLowerCase().trim();
      if (seen.has(key)) {
        overflow.push(job);
        continue;
      }
      seen.add(key);

      if (isHighProfileCompany(job.company)) {
        backfillPriority.push(job);
      } else {
        backfillRegular.push(job);
      }
    }

    picked.push(...backfillPriority.slice(0, limit - picked.length));
    if (picked.length < limit) {
      picked.push(...backfillRegular.slice(0, limit - picked.length));
    }
  }

  // If still under limit, backfill with overflow
  if (picked.length < limit) {
    picked.push(...shuffle(overflow).slice(0, limit - picked.length));
  }

  return picked.slice(0, limit);
}

// ── Mark jobs as posted ──────────────────────────────────────────────────

async function markJobsPosted(jobIds) {
  const now = new Date().toISOString();

  for (let i = 0; i < jobIds.length; i += 20) {
    const batch = jobIds.slice(i, i + 20);
    const idFilter = batch.map(id => `"${id}"`).join(',');
    let ok = false;
    for (let attempt = 1; attempt <= 4 && !ok; attempt++) {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/jobs?id=in.(${idFilter})`,
          {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({ telegram_posted_at: now }),
          }
        );
        if (res.ok) {
          ok = true;
        } else {
          const err = await res.text();
          if (attempt === 4) console.error(`  Failed to mark batch as posted: ${err.slice(0, 200)}`);
          else await new Promise(r => setTimeout(r, 1000 * attempt));
        }
      } catch (e) {
        if (attempt === 4) console.error(`  Failed to mark batch as posted: ${e.message}`);
        else await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
  }
}

// ── Format the Telegram message ──────────────────────────────────────────

function formatJobsMessage(jobs, category) {
  const lines = [];

  for (const job of jobs) {
    const title = truncate(cleanTitle(job.title), 60);
    const company = escapeHTML(cleanCompany(job.company));
    const url = escapeHTML(jobPublicPath(job));

    lines.push(`• ${company} is hiring <a href="${url}">${escapeHTML(title)}</a>`);
  }

  let header = '';
  if (category === 'developer') {
    header = '<b>Engineering & IT Jobs</b>';
  } else if (category === 'product') {
    header = '<b>Product, Design & Data Jobs</b>';
  } else if (category === 'business') {
    header = '<b>Business, Sales & Growth Jobs</b>';
  } else {
    header = '<b>Featured Tech & Business Jobs</b>';
  }

  let text = header + '\n\n' + lines.join('\n');
  text += `\n\n_\nTurn your CV into a Website: <a href="https://cvin.bio/tg">cvin.bio</a>`;
  return text;
}

// ── Send message via Telegram Bot API ────────────────────────────────────

async function sendTelegramMessage(text) {
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

// ── Convert Telegram HTML message to LinkedIn plain text ─────────────────

function htmlToLinkedInText(html) {
  return html
    .replace(/<b>/g, '')
    .replace(/<\/b>/g, '')
    .replace(/<a\s+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi, (m, url, text) => {
      const t = text.trim().toLowerCase();
      if (!t) return url;
      try {
        const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
        if (host === t || host.startsWith(t + '.') || host.endsWith('.' + t)) return url;
      } catch {}
      return `${text}: ${url}`;
    })
    .replace(/\n_\n/g, '\n\n')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/utm_medium=telegram/g, 'utm_medium=linkedin')
    .replace(/(?:\r?\n)*Turn your CV into a Website:[\s\S]*$/, '')
    .replace(/^• .+$/gm, (line) => line + '\n')
    .trim();
}

// ── Cross-post the job list to LinkedIn (vedangvatsa) ───────────────────

async function postToLinkedIn(text) {
  const res = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': '202604',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: LINKEDIN_PERSON_URN,
      commentary: text,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: 'PUBLISHED',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LinkedIn API error: ${res.status} ${err}`);
  }

  const postUrn = res.headers.get('x-restli-id') || 'unknown';
  return postUrn;
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('Telegram Job Poster');
  console.log(`  Channel: ${CHANNEL_ID}`);

  // Parse command-line argument --category <val> (supports --category=val or --category val)
  const catArg = process.argv.find(arg => arg.startsWith('--category'));
  let category = null;
  if (catArg) {
    if (catArg.includes('=')) {
      category = catArg.split('=')[1];
    } else {
      const idx = process.argv.indexOf('--category');
      if (idx !== -1 && process.argv[idx + 1]) {
        category = process.argv[idx + 1];
      }
    }
  }

  if (!category) {
    category = getAutomaticCategory();
  }

  console.log(`  Category: ${category}`);

  // 1. Fetch unposted jobs (grab extra for dedup headroom)
  const allJobs = await fetchUnpostedJobs();

  if (allJobs.length === 0) {
    console.log('  No new jobs to post.');
    return;
  }

  // 2. Shuffle for source diversity, then pick category-matching remote-preferred roles
  const jobs = pickJobs(shuffle(allJobs), JOBS_PER_POST, category);
  if (jobs.length === 0) {
    console.log('  No jobs matched category filters.');
    return;
  }
  const remoteCount = jobs.filter(j => isRemote(j.location)).length;
  console.log(`  ${allJobs.length} unposted -> ${jobs.length} picked (${remoteCount} remote)`);

  // 3. Format once — post TG and LinkedIn independently so one failure doesn't block the other
  const message = formatJobsMessage(jobs, category);
  console.log(`  Message: ${message.length} chars`);

  let telegramOk = false;
  try {
    if (message.length > 4096) {
      const half = Math.ceil(jobs.length / 2);
      await sendTelegramMessage(formatJobsMessage(jobs.slice(0, half), category));
      await new Promise(r => setTimeout(r, 1000));
      await sendTelegramMessage(formatJobsMessage(jobs.slice(half), category));
      console.log('  Posted Telegram in 2 batches');
    } else {
      const result = await sendTelegramMessage(message);
      console.log(`  Posted Telegram. Message ID: ${result.message_id}`);
    }
    telegramOk = true;
  } catch (e) {
    console.warn(`  ⚠️ Telegram send failed: ${e.message}`);
  }

  // Cross-post to LinkedIn (vedangvatsa) — same job list, direct API (not Buffer)
  let linkedInOk = false;
  if (LINKEDIN_ACCESS_TOKEN && LINKEDIN_PERSON_URN) {
    try {
      const linkedInText = htmlToLinkedInText(message);
      const linkedInUrn = await postToLinkedIn(linkedInText);
      console.log(`  ✅ LinkedIn cross-post: ${linkedInUrn}`);
      linkedInOk = true;
    } catch (e) {
      console.warn(`  ⚠️ LinkedIn cross-post failed: ${e.message}`);
    }
  } else {
    console.log('  ⏭ LinkedIn cross-post skipped (no LINKEDIN_ACCESS_TOKEN/PERSON_URN)');
  }

  // 4. Mark posted if either channel succeeded (avoid re-spamming the one that worked)
  if (telegramOk || linkedInOk) {
    const pickedIds = jobs.map(j => j.id);
    await markJobsPosted(pickedIds);
    console.log(`  Marked ${pickedIds.length} jobs as posted (tg=${telegramOk}, li=${linkedInOk})`);
  } else {
    console.error('  Both Telegram and LinkedIn failed — jobs left unposted for retry');
    process.exitCode = 1;
  }
}

main().catch(e => {
  console.error('Telegram post failed:', e.message);
  process.exit(1);
});

// ── Job public path helpers (same as telegram-ai-jobs.mjs) ───────────────

function companyToSlug(company) {
  return (company || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function shortJobSlug(company, externalId) {
  if (!externalId) return null;
  const co = companyToSlug(company);
  if (!co) return null;
  const prefix = `${co}_`;
  const lower = externalId.toLowerCase();
  if (!lower.startsWith(prefix)) return null;
  const rest = externalId.slice(prefix.length);
  if (!/^[a-z0-9][a-z0-9-]{0,23}$/i.test(rest)) return null;
  if (/^[0-9a-f]{8,}$/i.test(rest)) return null;
  if (rest.length > 12 && /^\d+$/.test(rest)) return null;
  return rest.toLowerCase();
}

function jobPublicPath(job) {
  const jobSlug = shortJobSlug(job.company, job.external_id);
  if (jobSlug) return `https://cvin.bio/${companyToSlug(job.company)}/${jobSlug}`;
  return `https://cvin.bio/jobs/${job.id}`;
}

