/**
 * Import live Digital India Corporation roles from https://dic.gov.in/careers/
 * Each listing page is fetched, then nested notification PDFs are pulled and
 * sliced to the matching role so ingest has the official body (not a copy-paste
 * publish). Archive listings are skipped.
 *
 * Usage: node .github/scripts/import-dic-careers.mjs
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY)
 *      SKIP_ENRICH=1 to ingest only
 */
import crypto from 'crypto';
import { spawnSync } from 'child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { normalizeJobDescriptionForStorage } from './lib/normalize-job-description.mjs';
import { ingestSourceDescription, htmlToIngestText } from './lib/ingest-job-description.mjs';
import { persistedJobSlug } from './lib/job-public-url.mjs';
import { pingIndexNow } from './lib/indexnow.mjs';
import { applyCanonicalCompany } from '../../src/lib/company-host.mjs';
import { isJobExpired } from '../../src/lib/job-age.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
try {
  require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
  require('dotenv').config();
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

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase URL / service role key');
  process.exit(1);
}

const LIST_URL = 'https://dic.gov.in/careers/';
const COMPANY = 'Digital India Corporation';
const COMPANY_KEY = 'dic';
const SOURCE = 'dic-careers';
const LOGO = 'https://dic.gov.in/wp-content/uploads/2024/11/images.png';
const UA = 'CVin.Bio job importer (+https://cvin.bio)';
const SKIP_ENRICH = process.env.SKIP_ENRICH === '1' || process.env.SKIP_ENRICH === 'true';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function decodeEntities(s) {
  return htmlToIngestText(String(s || '').replace(/<[^>]+>/g, ' '));
}

function compact(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function wordCount(s) {
  return String(s || '')
    .split(/\s+/)
    .filter(Boolean).length;
}

function dedupHash(company, title) {
  return crypto
    .createHash('md5')
    .update(`${company.toLowerCase().trim()}|${title.toLowerCase().trim()}`)
    .digest('hex');
}

function headers() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  };
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'text/html,application/pdf,*/*' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ctype = (res.headers.get('content-type') || '').toLowerCase();
  return { buf, ctype, finalUrl: res.url };
}

function pdfToText(buf) {
  const dir = mkdtempSync(join(tmpdir(), 'dic-pdf-'));
  const pdfPath = join(dir, 'in.pdf');
  const txtPath = join(dir, 'out.txt');
  writeFileSync(pdfPath, buf);
  const r = spawnSync('pdftotext', ['-layout', pdfPath, txtPath], { encoding: 'utf8' });
  if (r.status !== 0 || !existsSync(txtPath)) {
    spawnSync('pdftotext', [pdfPath, txtPath], { encoding: 'utf8' });
  }
  return existsSync(txtPath) ? readFileSync(txtPath, 'utf8') : '';
}

function parsePostedAgo(raw) {
  const s = String(raw || '').replace(/\s+/g, ' ').trim();
  const now = Date.now();
  let m = s.match(/posted\s+(\d+)\s+hour/i);
  if (m) return new Date(now - Number(m[1]) * 3600 * 1000).toISOString();
  m = s.match(/posted\s+(\d+)\s+day/i);
  if (m) return new Date(now - Number(m[1]) * 86400 * 1000).toISOString();
  if (/posted\s+yesterday/i.test(s)) return new Date(now - 86400 * 1000).toISOString();
  if (/posted\s+(an?\s+)?hour/i.test(s)) return new Date(now - 3600 * 1000).toISOString();
  return null;
}

function parseLastDate(text) {
  const s = String(text || '').replace(/\s+/g, ' ');
  const months = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  };
  let m = s.match(/last date[^0-9a-z]{0,40}(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})/i);
  if (m && months[m[2].toLowerCase()] != null) {
    return new Date(Date.UTC(Number(m[3]), months[m[2].toLowerCase()], Number(m[1])));
  }
  m = s.match(/last date[^0-9]{0,40}(\d{1,2})[./-](\d{1,2})[./-](\d{4})/i);
  if (m) return new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])));
  return null;
}

function lastDateStillOpen(text, now = new Date()) {
  const d = parseLastDate(text);
  if (!d || Number.isNaN(d.getTime())) return true;
  const end = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59);
  return end >= Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

function jobTypeFromLabel(raw) {
  const t = String(raw || '').toLowerCase();
  if (t.includes('intern')) return 'internship';
  if (t.includes('deput')) return 'full_time';
  if (t.includes('contract')) return 'contract';
  return t ? 'contract' : null;
}

function extractTags(title, body) {
  const blob = `${title}\n${body}`.toLowerCase();
  const found = new Set();
  const pairs = [
    ['python', 'Python'], ['java', 'Java'], ['javascript', 'JavaScript'],
    ['typescript', 'TypeScript'], ['react', 'React'], ['node', 'Node.js'],
    ['android', 'Android'], ['ios', 'iOS'], ['flutter', 'Flutter'],
    ['aws', 'AWS'], ['azure', 'Azure'], ['gcp', 'GCP'],
    ['docker', 'Docker'], ['kubernetes', 'Kubernetes'], ['devops', 'DevOps'],
    ['mlops', 'MLOps'], ['machine learning', 'Machine Learning'],
    ['ai', 'AI'], ['nlp', 'NLP'], ['sql', 'SQL'],
    ['postgres', 'PostgreSQL'], ['mongodb', 'MongoDB'],
    ['figma', 'Figma'], ['ui/ux', 'UI/UX'], ['legal', 'Legal'],
    ['finance', 'Finance'], ['cyber', 'Cybersecurity'],
    ['bhashini', 'Bhashini'], ['digilocker', 'DigiLocker'],
  ];
  for (const [needle, label] of pairs) {
    if (blob.includes(needle)) found.add(label);
  }
  return [...found].slice(0, 12);
}

function slicePdfForTitle(pdfText, title) {
  const text = String(pdfText || '').replace(/\r/g, '');
  if (!text.trim()) return '';
  if (wordCount(text) <= 900) return text.trim();
  const tokens = compact(title)
    .split(' ')
    .filter((t) => t.length > 2 && !['young', 'professional', 'expert', 'language'].includes(t));
  const lines = text.split('\n');
  let start = -1;
  const need = Math.min(3, Math.max(1, tokens.length));
  for (let i = 0; i < lines.length; i++) {
    const c = compact(lines[i]);
    if (!c) continue;
    const hits = tokens.filter((t) => c.includes(t)).length;
    if (tokens.length && hits >= need) {
      start = Math.max(0, i - 2);
      break;
    }
  }
  if (start < 0) {
    const blob = compact(text);
    const hits = tokens.filter((t) => blob.includes(t)).length;
    return hits >= need ? text.trim() : '';
  }
  let end = lines.length;
  const heading = /^(sr\.?\s*no\.?|s\.\s*no|job description|job title|name of the post|position title)\b/i;
  for (let i = start + 8; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!heading.test(line)) continue;
    const c = compact(line);
    const hits = tokens.filter((t) => c.includes(t)).length;
    if (hits < Math.min(2, tokens.length)) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join('\n').trim();
}

function listingCards(html) {
  const blocks = html.split(/class="[^"]*grid-item jobgrid[^"]*"/i).slice(1);
  const out = [];
  const seen = new Set();
  for (const b of blocks) {
    const um = b.match(/https:\/\/dic\.gov\.in\/jobs\/[a-z0-9\-]+\/?/i);
    if (!um) continue;
    const url = um[0].replace(/\/?$/, '/');
    if (seen.has(url)) continue;
    seen.add(url);
    const title = b.match(/job-title">([\s\S]*?)<\/span>/i);
    const posted = b.match(/Posted\s+([^<]+)/i);
    const exp = b.match(/job-type"><i[^>]*><\/i>([\s\S]*?)<\/div>/i);
    const loc = b.match(/job-location"><i[^>]*><\/i>([\s\S]*?)<\/div>/i);
    out.push({
      url,
      listTitle: decodeEntities(title?.[1] || ''),
      postedRaw: decodeEntities(posted?.[1] || ''),
      experience: decodeEntities(exp?.[1] || ''),
      location: decodeEntities(loc?.[1] || ''),
    });
  }
  return out;
}

async function listLiveJobs() {
  const byUrl = new Map();
  for (let p = 1; p <= 8; p++) {
    const url = p === 1 ? LIST_URL : `${LIST_URL}?paged=${p}`;
    const { buf } = await fetchText(url);
    const html = buf.toString('utf8');
    const cards = listingCards(html);
    console.log(`  careers page ${p}: ${cards.length} cards`);
    if (!cards.length) break;
    for (const c of cards) if (!byUrl.has(c.url)) byUrl.set(c.url, c);
    await sleep(250);
  }
  return [...byUrl.values()];
}

function extractJobHtml(html) {
  const m = html.match(
    /<div class="job-description[\s\S]*?<\/div>\s*<div class="clearfix">/i
  );
  return m ? m[0] : '';
}

function extractMeta(html, fallback) {
  const title = html.match(/class="job-title">([\s\S]*?)<\/span>/i);
  const type = html.match(/class="job-type"><i[^>]*><\/i>([\s\S]*?)<\/div>/i);
  const loc = html.match(/class="job-location"><i[^>]*><\/i>([\s\S]*?)<\/div>/i);
  const posted = html.match(/Posted\s+(\d+\s+(?:hour|day)s?\s+ago|yesterday)/i);
  return {
    title: decodeEntities(title?.[1] || fallback.listTitle || ''),
    engagement: decodeEntities(type?.[1] || ''),
    location: decodeEntities(loc?.[1] || fallback.location || ''),
    postedRaw: posted ? posted[0] : fallback.postedRaw,
  };
}

function extractLinks(descHtml) {
  const out = [];
  const re = /<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(descHtml))) {
    out.push({ href: m[1], label: decodeEntities(m[2]) });
  }
  return out;
}

function officialApplyUrl(links, jobUrl) {
  const apply = links.find((l) =>
    /apply|ora\.|forms\.gle|docs\.google\.com\/forms/i.test(`${l.href} ${l.label}`)
  );
  return apply?.href || jobUrl;
}

const pdfCache = new Map();

async function pdfTextForUrl(url) {
  if (pdfCache.has(url)) return pdfCache.get(url);
  try {
    const { buf, ctype } = await fetchText(url);
    if (!/pdf/i.test(ctype) && buf.slice(0, 5).toString() !== '%PDF-') {
      pdfCache.set(url, '');
      return '';
    }
    const text = pdfToText(buf);
    pdfCache.set(url, text);
    return text;
  } catch (e) {
    console.warn(`  pdf fail ${url}: ${e.message}`);
    pdfCache.set(url, '');
    return '';
  }
}

function buildSource({ title, location, engagement, experience, jobUrl, applyUrl, htmlText, pdfText, lastDateRaw }) {
  const parts = [
    `Official posting: ${title} at Digital India Corporation.`,
    `Listing URL: ${jobUrl}`,
    applyUrl && applyUrl !== jobUrl ? `Application URL: ${applyUrl}` : null,
    location ? `Location: ${location}` : null,
    engagement ? `Engagement: ${engagement}` : null,
    experience ? `Experience (listing): ${experience}` : null,
    lastDateRaw ? `Last date to apply: ${lastDateRaw}` : null,
    '',
    '--- Job page ---',
    htmlText,
  ].filter((x) => x !== null);
  const sliced = slicePdfForTitle(pdfText, title);
  if (sliced && wordCount(sliced) >= 40) {
    parts.push('', '--- Detailed notification ---', sliced);
  }
  return ingestSourceDescription({ plain: parts.join('\n') });
}

async function scrapeJob(card) {
  const { buf } = await fetchText(card.url);
  const html = buf.toString('utf8');
  const meta = extractMeta(html, card);
  const descHtml = extractJobHtml(html);
  const htmlText = ingestSourceDescription({ html: descHtml });
  const links = extractLinks(descHtml || html);
  const applyUrl = officialApplyUrl(links, card.url);
  const pdfHrefs = [
    ...new Set(
      [...(descHtml || '').matchAll(/https?:\/\/[^\s"'<>]+\.pdf/gi)].map((m) => m[0])
    ),
  ];
  let pdfText = '';
  for (const href of pdfHrefs) {
    const t = await pdfTextForUrl(href);
    if (wordCount(t) > wordCount(pdfText)) pdfText = t;
    await sleep(150);
  }
  const last = parseLastDate(htmlText) || parseLastDate(pdfText);
  const lastDateRaw = last
    ? last.toISOString().slice(0, 10)
    : null;
  const location = [meta.location || card.location, 'India']
    .filter(Boolean)
    .join(', ')
    .replace(/,\s*India,\s*India$/i, ', India');
  const publishedAt =
    parsePostedAgo(meta.postedRaw) ||
    parsePostedAgo(card.postedRaw) ||
    new Date().toISOString();
  const description = buildSource({
    title: meta.title,
    location,
    engagement: meta.engagement,
    experience: card.experience,
    jobUrl: card.url,
    applyUrl,
    htmlText,
    pdfText,
    lastDateRaw,
  });
  return {
    title: meta.title,
    location,
    engagement: meta.engagement,
    experience: card.experience,
    publishedAt,
    applyUrl: card.url,
    officialApply: applyUrl,
    description,
    lastDateRaw,
    htmlWords: wordCount(htmlText),
    sourceWords: wordCount(description),
    pdfWords: wordCount(pdfText),
    closed: !lastDateStillOpen(`${htmlText}\n${pdfText}`),
  };
}

async function fetchUsedSlugs() {
  const usedByCompany = new Map();
  usedByCompany.set(COMPANY_KEY, new Set());
  const pageSize = 200;
  for (let offset = 0; offset < 4000; offset += pageSize) {
    const url =
      `${SUPABASE_URL}/rest/v1/jobs?select=slug,external_id` +
      `&or=(company_key.eq.${COMPANY_KEY},company.eq.${encodeURIComponent(COMPANY)})` +
      `&limit=${pageSize}&offset=${offset}`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) break;
    const rows = await res.json();
    if (!Array.isArray(rows) || !rows.length) break;
    const used = usedByCompany.get(COMPANY_KEY);
    for (const r of rows) {
      for (const raw of [r.slug, r.external_id]) {
        if (!raw) continue;
        const s = String(raw);
        const prefix = `${COMPANY_KEY}_`;
        if (s.toLowerCase().startsWith(prefix)) used.add(s.slice(prefix.length).toLowerCase());
      }
    }
    if (rows.length < pageSize) break;
  }
  return usedByCompany;
}

async function upsertJobs(jobs) {
  console.log(`\n── Upsert ${jobs.length} DIC jobs ──`);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/jobs?on_conflict=external_id`, {
    method: 'POST',
    headers: {
      ...headers(),
      'Content-Type': 'application/json',
      Prefer: 'resolution=ignore-duplicates,return=representation',
    },
    body: JSON.stringify(jobs),
  });
  if (res.ok) {
    const rows = await res.json();
    console.log(`  ok ${Array.isArray(rows) ? rows.length : 0}`);
    return Array.isArray(rows) ? rows : [];
  }
  const err = await res.text();
  console.error(`  batch error: ${err.slice(0, 400)}`);
  const out = [];
  for (const job of jobs) {
    const r2 = await fetch(`${SUPABASE_URL}/rest/v1/jobs?on_conflict=external_id`, {
      method: 'POST',
      headers: {
        ...headers(),
        'Content-Type': 'application/json',
        Prefer: 'resolution=ignore-duplicates,return=representation',
      },
      body: JSON.stringify([job]),
    });
    if (r2.ok) {
      const rows = await r2.json();
      if (Array.isArray(rows)) out.push(...rows);
    } else {
      console.error(`  row fail ${job.external_id}: ${(await r2.text()).slice(0, 160)}`);
    }
  }
  return out;
}

async function upsertCompany(count, locations) {
  const row = {
    slug: COMPANY_KEY,
    name: COMPANY,
    logo: LOGO,
    role_count: count,
    locations: [...new Set(locations.filter(Boolean))].slice(0, 3),
    latest_job_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/companies?on_conflict=slug`, {
    method: 'POST',
    headers: {
      ...headers(),
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify([row]),
  });
  if (!res.ok) console.warn(`  companies upsert: ${(await res.text()).slice(0, 200)}`);
  else console.log('  company hub dic ok');
}

async function enrichIds(ids) {
  if (SKIP_ENRICH) {
    console.log('\n⏭ SKIP_ENRICH=1 — cards stay apply-out until enrich');
    return;
  }
  if (!ids.length) return;
  const idsPath = resolve(__dirname, 'dic-inserted-ids.txt');
  writeFileSync(idsPath, `${ids.join('\n')}\n`);
  console.log(`\n═══ Enrich ${ids.length} DIC jobs (unique paraphrase, not copy) ═══`);
  const enrichScript = resolve(__dirname, 'enrich-remote-job-descriptions.mjs');
  const r = spawnSync('npx', ['tsx', enrichScript], {
    env: {
      ...process.env,
      ALLOW_AI_ENRICH: '1',
      RETRY_ONLY: '1',
      PRIORITY_IDS_FILE: idsPath,
      TURBO: process.env.TURBO || '1',
      BATCH_SIZE: process.env.ENRICH_BATCH_SIZE || '50',
      CONCURRENCY: process.env.ENRICH_CONCURRENCY || '4',
      JOB_MAX_AGE_DAYS: process.env.JOB_MAX_AGE_DAYS || '30',
    },
    stdio: 'inherit',
    timeout: Number(process.env.ENRICH_TIMEOUT_MS || 50 * 60 * 1000),
  });
  if (r.status !== 0) {
    console.error(`  ⚠️ enrich exited ${r.status} — unenriched jobs stay apply-out`);
  }
}

async function main() {
  console.log('── Digital India Corporation careers ──');
  const cards = await listLiveJobs();
  console.log(`  live listings: ${cards.length}`);
  if (!cards.length) process.exit(1);

  const usedByCompany = await fetchUsedSlugs();
  const scraped = [];
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    try {
      const job = await scrapeJob(card);
      console.log(
        `  [${i + 1}/${cards.length}] ${job.title} words=${job.sourceWords} html=${job.htmlWords} pdf=${job.pdfWords}${job.closed ? ' CLOSED' : ''}`
      );
      if (!job.title || job.closed) continue;
      if (isJobExpired(job.publishedAt, job.publishedAt)) {
        console.log('    skip expired listing stamp');
        continue;
      }
      scraped.push(job);
    } catch (e) {
      console.warn(`  fail ${card.url}: ${e.message}`);
    }
    await sleep(250);
  }

  const rows = scraped.map((j) => {
    const title = j.title.slice(0, 200);
    const slug = persistedJobSlug(COMPANY, title, j.applyUrl, usedByCompany);
    const row = {
      source: SOURCE,
      external_id: slug,
      slug,
      dedup_hash: dedupHash(COMPANY, title),
      title,
      company: COMPANY,
      company_key: COMPANY_KEY,
      company_logo: LOGO,
      location: j.location,
      job_type: jobTypeFromLabel(j.engagement),
      salary: null,
      description: normalizeJobDescriptionForStorage(j.description),
      tags: extractTags(title, j.description),
      apply_url: j.applyUrl,
      category: j.engagement || 'Open Job',
      published_at: j.publishedAt,
    };
    applyCanonicalCompany(row);
    row.company_key = COMPANY_KEY;
    row.company = COMPANY;
    return row;
  });

  console.log(`\nPretty paths (${rows.length}):`);
  for (const j of rows) {
    const seg = String(j.external_id).replace(`${COMPANY_KEY}_`, '');
    console.log(`  /${COMPANY_KEY}/${seg} — ${j.title}`);
  }

  const upserted = await upsertJobs(rows);
  await upsertCompany(
    rows.length,
    rows.map((r) => String(r.location || '').split(',')[0].trim())
  );

  const ids = upserted.map((r) => r.id).filter(Boolean);
  const indexPaths = [
    `/${COMPANY_KEY}`,
    '/jobs',
    ...rows.map((j) => `/${COMPANY_KEY}/${String(j.external_id).replace(`${COMPANY_KEY}_`, '')}`),
  ];
  const ping = await pingIndexNow(indexPaths);
  console.log(
    ping.ok
      ? `IndexNow ok status=${ping.status} submitted=${ping.submitted}`
      : `IndexNow failed ${ping.status || ''} ${ping.error || ''}`
  );

  await enrichIds(ids);
  console.log(`\nDone. ingested=${rows.length} upserted=${upserted.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
