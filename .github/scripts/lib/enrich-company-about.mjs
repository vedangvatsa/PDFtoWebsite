/**
 * Unique "About the company" copy for the site cache + thin curated JDs.
 * Called from enrich-remote-job-descriptions.mjs (ABOUT_ONLY=1 or after JD work).
 * LLM: OpenRouter inclusionai/ling-2.6-flash only.
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../..');
const DESCRIPTIONS_PATH = resolve(ROOT, 'src/lib/company-descriptions.json');
const WIKI_CACHE_PATH = resolve(__dirname, '../enrich-wikipedia-extracts.json');
const STATE_PATH = resolve(__dirname, '../enrich-company-about-state.json');

const ENCYCLOPEDIA_DUMP_RE =
  /\b(see also|external links|disambiguation|may refer to|further reading|references)\b|\(\s*,\s*[A-Z]{2,}[-\s]|Pages displaying short descriptions|\[\d{1,3}\]|^\s*Year \d{3,4}\b/i;

function looksLikeEncyclopediaDump(text) {
  const t = String(text || '').trim();
  if (t.length < 120) return true;
  if (t.length > 1200) return true;
  if (ENCYCLOPEDIA_DUMP_RE.test(t)) return true;
  if (/\n\s*History\s*\n/i.test(t)) return true;
  if (/\b(about the role|compensation and benefits|what you.?ll do|requirements:|preferred qualifications|job openings at|how we work|ramp quota|is seeking|are seeking|we are looking for|we.?re looking for|study overview)\b/i.test(t)) return true;
  if (/<[^>]+>|\[&hellip;\]|&hellip;/i.test(t)) return true;
  if (/https?:\/\//i.test(t)) return true;
  if (/^(?:we|we[’']re|we[’']ve)\b/i.test(t)) return true;
  return false;
}

function looksBadCached(text) {
  const t = String(text || '').trim();
  if (t.length < 120) return true;
  if (!/[.!?]$/.test(t.replace(/["')\]]+$/g, ''))) return true;
  if (/^[a-z•*]/.test(t)) return true;
  return looksLikeEncyclopediaDump(t);
}

function wc(s) {
  return String(s || '')
    .split(/\s+/)
    .filter(Boolean).length;
}

function companyToSlug(company) {
  return String(company || '')
    .toLowerCase()
    .replace(/&amp;/gi, '&')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function cleanPublishText(s) {
  return String(s || '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/—/g, ' - ')
    .replace(/–/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();
}

function loadJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function jfetch(url, opts = {}, ms = 15000) {
  return fetch(url, { ...opts, signal: AbortSignal.timeout(ms) });
}

async function fetchWikipediaExtract(company, wikiCache) {
  const clean = String(company || '')
    .replace(/\s*\(.*?\)\s*/g, '')
    .trim();
  if (!clean) return null;
  const cacheKey = clean.toLowerCase();
  if (wikiCache[cacheKey] !== undefined) return wikiCache[cacheKey] || null;
  const queries = [clean, `${clean} company`, `${clean} (company)`];
  for (const q of queries) {
    const url =
      `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}` +
      `&gsrlimit=1&gsrnamespace=0&prop=extracts&exintro&explaintext&format=json`;
    let data = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const r = await jfetch(url, {}, 12000);
        if (!r.ok) throw new Error(`wiki_${r.status}`);
        data = await r.json();
        break;
      } catch {
        if (attempt === 2) break;
        await sleep(1200 * (attempt + 1));
      }
    }
    if (!data) continue;
    const pages = Object.values(data?.query?.pages || {});
    if (!pages.length) continue;
    const p = pages[0];
    const title = String(p?.title || '');
    const ext = String(p?.extract || '').trim();
    if (/^(list of|category:|companies listed|index of)|disambiguation|may refer to/i.test(title)) continue;
    if (ext.length < 150) continue;
    wikiCache[cacheKey] = ext;
    try {
      writeFileSync(WIKI_CACHE_PATH, JSON.stringify(wikiCache));
    } catch {
      /* ignore */
    }
    return ext;
  }
  wikiCache[cacheKey] = null;
  try {
    writeFileSync(WIKI_CACHE_PATH, JSON.stringify(wikiCache));
  } catch {
    /* ignore */
  }
  return null;
}

function aboutPrompt(company, extract, titles) {
  const titleList = [...new Set((titles || []).map((t) => String(t).trim()).filter(Boolean))].slice(0, 8);
  const source = extract
    ? `Source facts (paraphrase everything, never copy a sentence):\n${extract.slice(0, 3500)}`
    : `No encyclopedia source. Open roles seen on the board: ${titleList.join('; ') || 'unknown'}.\nWrite only what that implies. Do not invent HQ, founding year, funding, headcount, or product names.`;
  return `Write an original "About the company" blurb for ${company}.

${source}

Rules:
- 140-220 words of plain text. First sentence must name ${company}.
- Use ONLY facts grounded in the source. Never invent numbers, dates, or products.
- Short, plain sentences. No em dashes, no ellipsis, no curly quotes, no bullets, no markdown.
- No AI filler: leverage, delve, robust, seamless, passionate, cutting-edge, game-changing.
- Output ONLY the blurb.`;
}

async function writeAbout(complete, company, extract, titles) {
  const raw = await complete(aboutPrompt(company, extract, titles), {
    temperature: 0.35,
    maxOutputTokens: 900,
  });
  return cleanPublishText(raw);
}

/**
 * @param {{
 *   supabaseUrl: string,
 *   supabaseKey: string,
 *   complete: (prompt: string, opts?: object) => Promise<string>,
 *   dryRun?: boolean,
 *   sinceHours?: number,
 *   limit?: number,
 * }} opts
 */
export async function runCompanyAboutPass(opts) {
  const U = String(opts.supabaseUrl || '').replace(/\/$/, '');
  const K = opts.supabaseKey || '';
  const complete = opts.complete;
  const dryRun = !!opts.dryRun;
  const sinceHours = Math.max(1, Number(opts.sinceHours || process.env.ENRICH_SINCE_HOURS || 24));
  const limit = Math.max(1, Number(opts.limit || process.env.ABOUT_LIMIT || 400));
  if (!U || !K) throw new Error('Need Supabase env');
  if (!complete) throw new Error('Need OpenRouter complete()');

  const headers = { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' };
  const descriptions = loadJson(DESCRIPTIONS_PATH, {});
  const wikiCache = loadJson(WIKI_CACHE_PATH, {});
  const state = loadJson(STATE_PATH, { done: {}, failed: {} });
  const since = new Date(Date.now() - sinceHours * 3600 * 1000).toISOString();

  const groups = new Map();
  let from = 0;
  const PAGE = 200;
  for (;;) {
    const qs =
      `select=id,company,company_key,title` +
      `&created_at=gte.${encodeURIComponent(since)}` +
      `&order=created_at.desc` +
      `&limit=${PAGE}&offset=${from}`;
    let rows = null;
    let lastErr = '';
    for (let attempt = 0; attempt < 6; attempt++) {
      const r = await jfetch(`${U}/rest/v1/jobs?${qs}`, { headers }, 45000);
      if (r.ok) {
        rows = await r.json();
        break;
      }
      lastErr = `jobs_scan_${r.status}:${(await r.text()).slice(0, 160)}`;
      if (!/57014|timeout|529|502/i.test(lastErr)) throw new Error(lastErr);
      await sleep(2000 * (attempt + 1));
    }
    if (!rows) throw new Error(lastErr || 'jobs_scan_failed');
    if (!Array.isArray(rows) || !rows.length) break;
    for (const j of rows) {
      const name = String(j.company || '').trim();
      if (!name || name.length < 2) continue;
      const slug = companyToSlug(j.company_key || name);
      if (!slug) continue;
      if (!groups.has(slug)) {
        groups.set(slug, { name, slug, titles: [], jobIds: [] });
      }
      const g = groups.get(slug);
      if (j.title && g.titles.length < 12) g.titles.push(j.title);
      g.jobIds.push(j.id);
    }
    from += PAGE;
    if (rows.length < PAGE) break;
  }

  const missing = [];
  for (const g of groups.values()) {
    if (state.done[g.slug]) continue;
    if (/^(no_source)$/.test(String(state.failed[g.slug] || ''))) continue;
    const cached = String(descriptions[g.slug] || descriptions[g.slug.replace(/-/g, '')] || '').trim();
    if (cached && !looksBadCached(cached)) continue;
    missing.push(g);
  }

  console.log(
    `about-company: window=${sinceHours}h companies=${groups.size} missing_or_bad=${missing.length} writing_upto=${limit}`
  );

  let ok = 0;
  let skip = 0;
  let fail = 0;
  const written = [];

  for (const g of missing.slice(0, limit)) {
    const extract = await fetchWikipediaExtract(g.name, wikiCache);
    if (!extract && !g.titles.length) {
      state.failed[g.slug] = 'no_source';
      skip++;
      continue;
    }
    try {
      let about = null;
      let lastWriteErr = '';
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          about = await writeAbout(complete, g.name, extract, g.titles);
          break;
        } catch (e) {
          lastWriteErr = String(e.message || e);
          if (/429|rate/i.test(lastWriteErr)) {
            await sleep(8000 * (attempt + 1));
            continue;
          }
          throw e;
        }
      }
      if (!about) throw new Error(lastWriteErr || 'openrouter_failed');
      const words = wc(about);
      if (words < 80 || words > 280) {
        state.failed[g.slug] = `about_len_${words}`;
        fail++;
        console.log(`  fail ${g.slug}: about_len_${words}`);
        continue;
      }
      if (looksLikeEncyclopediaDump(about)) {
        state.failed[g.slug] = 'about_dump';
        fail++;
        console.log(`  fail ${g.slug}: about_dump`);
        continue;
      }
      if (!dryRun) {
        descriptions[g.slug] = about;
        state.done[g.slug] = { words, at: new Date().toISOString(), wiki: !!extract };
        writeFileSync(DESCRIPTIONS_PATH, JSON.stringify(descriptions));
        writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
      }
      ok++;
      written.push(g.slug);
      console.log(`  ok ${g.slug} ${words}w wiki=${extract ? 1 : 0}`);
    } catch (e) {
      state.failed[g.slug] = String(e.message || e).slice(0, 120);
      fail++;
      console.log(`  fail ${g.slug}: ${state.failed[g.slug]}`);
      if (!dryRun) writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
    }
  }

  console.log(`about-company done: ok=${ok} skip=${skip} fail=${fail} dry=${dryRun ? 1 : 0}`);
  if (written.length) console.log(`  wrote: ${written.slice(0, 30).join(', ')}${written.length > 30 ? '…' : ''}`);
  return { ok, skip, fail, written, scanned: groups.size, missing: missing.length };
}
