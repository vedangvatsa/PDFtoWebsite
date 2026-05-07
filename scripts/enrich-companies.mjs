#!/usr/bin/env node
/**
 * enrich-companies.mjs — v4 SMART (DB-first)
 *
 * Strategy (priority order):
 * 1. Job description "About" section (ALREADY IN DB — instant, no HTTP)
 * 2. Company website meta description (via domain from apply_url)
 * 3. Wikipedia fallback
 * 100 parallel workers for external fetches
 *
 * Output: src/lib/company-descriptions.json
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
);

const OUTPUT = path.join(__dirname, '..', 'src', 'lib', 'company-descriptions.json');

let existing = {};
try { existing = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); } catch {}

function htmlDecode(str) {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ').replace(/&#x2F;/g, '/');
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')  // strip tags
    .replace(/\s+/g, ' ')      // collapse whitespace
    .trim();
}

// Extract "About [Company]" section from job description
function extractAboutFromDesc(description, companyName) {
  if (!description || description.length < 50) return null;

  // Decode HTML entities first
  let text = htmlDecode(description);
  // Strip HTML tags
  text = stripHtml(text);

  // Look for "About [Company]" patterns
  const patterns = [
    new RegExp(`About\\s+${companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[:\\s]*(.{30,500})`, 'i'),
    /About\s+(?:Us|the\s+Company)[:\s]*(.{30,500})/i,
    /Who\s+(?:We\s+Are|are\s+we)[:\s]*(.{30,500})/i,
    /Company\s+(?:Overview|Description)[:\s]*(.{30,500})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      // Take first 2-3 sentences
      let about = match[1].trim();
      const sentences = about.match(/[^.!?]+[.!?]+/g);
      if (sentences && sentences.length > 0) {
        about = sentences.slice(0, 3).join(' ').trim();
        if (about.length > 350) about = sentences.slice(0, 2).join(' ').trim();
      }
      // Filter out garbage (job requirements etc.)
      if (about.length > 30 && !about.match(/^(You will|We are looking|Requirements|Responsibilities)/i)) {
        return about;
      }
    }
  }

  // Fallback: if the description STARTS with company info (common in Greenhouse)
  const firstPara = text.slice(0, 500);
  if (firstPara.toLowerCase().startsWith(companyName.toLowerCase()) || firstPara.match(/^[A-Z][a-z]+ is /)) {
    const sentences = firstPara.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences.length >= 1) {
      let about = sentences.slice(0, 3).join(' ').trim();
      if (about.length > 350) about = sentences.slice(0, 2).join(' ').trim();
      if (about.length > 30) return about;
    }
  }

  return null;
}

const ATS_DOMAINS = new Set([
  'boards.greenhouse.io', 'job-boards.greenhouse.io', 'jobs.lever.co',
  'jobs.ashbyhq.com', 'apply.workable.com', 'www.arbeitnow.com',
  'jobs.smartrecruiters.com', 'boards.eu.greenhouse.io',
  'job-boards.eu.greenhouse.io', 'jobs.workable.com',
]);

function extractDomain(applyUrl) {
  try {
    const url = new URL(applyUrl);
    const host = url.hostname.replace(/^www\./, '');
    
    // ATS domains: extract company slug from path → try as .com domain
    if (ATS_DOMAINS.has(host)) {
      const pathSlug = url.pathname.split('/').filter(Boolean)[0];
      if (pathSlug && pathSlug.length > 2) return `${pathSlug}.com`;
      return null;
    }
    
    // BambooHR: {company}.bamboohr.com → try {company}.com
    if (host.endsWith('.bamboohr.com')) {
      const sub = host.replace('.bamboohr.com', '');
      if (sub.length > 2) return `${sub}.com`;
      return null;
    }
    
    const parts = host.split('.');
    if (parts.length >= 3 && ['careers', 'jobs', 'hire', 'apply', 'work'].includes(parts[0])) {
      return parts.slice(1).join('.');
    }
    return host;
  } catch { return null; }
}

async function fetchMeta(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'Accept': 'text/html' },
      redirect: 'follow',
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const reader = res.body.getReader();
    const chunks = [];
    let size = 0;
    while (size < 30000) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      size += value.length;
    }
    try { reader.cancel(); } catch {}
    const html = chunks.map(c => new TextDecoder().decode(c)).join('');
    for (const pattern of [
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']{15,500})["']/i,
      /<meta[^>]*content=["']([^"']{15,500})["'][^>]*name=["']description["']/i,
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']{15,500})["']/i,
      /<meta[^>]*content=["']([^"']{15,500})["'][^>]*property=["']og:description["']/i,
    ]) {
      const match = html.match(pattern);
      if (match?.[1]) {
        const desc = htmlDecode(match[1]).trim();
        if (desc.length > 15 && !desc.startsWith('http')) return desc;
      }
    }
  } catch {}
  return null;
}

async function fetchWikipedia(companyName) {
  // Generate query variants: "Shieldai" → ["Shieldai", "Shield AI", "Shield Ai"]
  const spaced = companyName.replace(/([a-z])([A-Z])/g, '$1 $2'); // camelCase split
  const titleCase = companyName.replace(/\b\w/g, c => c.toUpperCase());
  const queries = new Set([
    companyName,
    spaced,
    titleCase,
    `${companyName} (company)`,
    `${spaced} (company)`,
  ]);
  
  for (const query of queries) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'CVinBot/1.0 (https://cvin.bio)' },
      });
      clearTimeout(timeout);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.type === 'disambiguation' || !data.extract) continue;
      const ext = data.extract.toLowerCase();
      const nameLC = companyName.toLowerCase();
      const spacedLC = spaced.toLowerCase();
      if (!ext.includes(nameLC) && !ext.includes(nameLC.replace(/\s/g, '')) && !ext.includes(spacedLC)) continue;
      if (/^Year \d|^In \d|was born|is a municipality|is a village|is a city|is a town|is a census/.test(data.extract)) continue;
      const sentences = data.extract.match(/[^.!?]+[.!?]+/g) || [data.extract];
      let desc = sentences.slice(0, 3).join(' ').trim();
      if (desc.length > 350) desc = sentences.slice(0, 2).join(' ').trim();
      return desc;
    } catch { continue; }
  }
  return null;
}

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').replace(/^-+/, '');
}

async function main() {
  console.log('📊 Fetching ALL job data from DB (descriptions + apply_urls)...');

  const companyData = {};  // slug -> { name, domain, descriptions[] }
  let page = 0;
  let totalRows = 0;
  while (true) {
    const { data } = await supabase
      .from('jobs')
      .select('company, apply_url, description')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (!data || data.length === 0) break;
    totalRows += data.length;
    data.forEach(j => {
      if (!j.company) return;
      const slug = toSlug(j.company);
      if (!companyData[slug]) {
        companyData[slug] = { name: j.company, domain: null, descriptions: [] };
      }
      if (j.company.length > companyData[slug].name.length) companyData[slug].name = j.company;
      if (!companyData[slug].domain && j.apply_url) {
        const d = extractDomain(j.apply_url);
        if (d) companyData[slug].domain = d;
      }
      // Keep first 5 descriptions for analysis
      if (j.description && companyData[slug].descriptions.length < 5) {
        companyData[slug].descriptions.push(j.description);
      }
    });
    if (data.length < 1000) break;
    page++;
    if (page % 10 === 0) console.log(`  ... fetched ${totalRows} rows`);
  }

  const slugs = Object.keys(companyData).sort();
  console.log(`  Fetched ${totalRows} jobs → ${slugs.length} unique companies`);
  console.log(`  ${Object.values(companyData).filter(c => c.domain).length} have domains from apply_url`);
  console.log(`  ${Object.values(companyData).filter(c => c.descriptions.length > 0).length} have job descriptions\n`);

  const toFetch = slugs.filter(s => !existing[s]);
  console.log(`  ${toFetch.length} need enrichment (${slugs.length - toFetch.length} cached)\n`);

  if (toFetch.length === 0) { console.log('✅ All enriched!'); return; }

  // Phase 1: Extract from job descriptions (instant, no HTTP)
  console.log('📝 Phase 1: Extracting from job descriptions (no HTTP needed)...');
  const results = { ...existing };
  let dbHits = 0, webHits = 0, wikiHits = 0, misses = 0;
  const needExternal = [];

  for (const slug of toFetch) {
    const cd = companyData[slug];
    let found = false;
    for (const desc of cd.descriptions) {
      const about = extractAboutFromDesc(desc, cd.name);
      if (about) {
        results[slug] = about;
        dbHits++;
        found = true;
        break;
      }
    }
    if (!found) needExternal.push(slug);
  }
  console.log(`  ✅ ${dbHits} companies from job descriptions`);
  console.log(`  ⏩ ${needExternal.length} need external fetch\n`);

  // Phase 2: Website + Wikipedia for remaining (100 parallel)
  console.log('🌐 Phase 2: Fetching from websites + Wikipedia (100 parallel)...');
  const startTime = Date.now();
  const BATCH = 100;

  for (let i = 0; i < needExternal.length; i += BATCH) {
    const batch = needExternal.slice(i, i + BATCH);
    await Promise.all(batch.map(async (slug) => {
      const cd = companyData[slug];

      // Try domain from apply_url
      if (cd.domain) {
        const desc = await fetchMeta(`https://${cd.domain}`);
        if (desc) { results[slug] = desc; webHits++; return; }
      }

      // Try guessed domains
      const base = cd.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const ext of ['.com', '.io', '.co']) {
        const desc = await fetchMeta(`https://${base}${ext}`);
        if (desc) { results[slug] = desc; webHits++; return; }
      }

      // Wikipedia
      const wikiDesc = await fetchWikipedia(cd.name);
      if (wikiDesc) { results[slug] = wikiDesc; wikiHits++; return; }

      misses++;
    }));

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  ⏳ ${Math.min(i + BATCH, needExternal.length)}/${needExternal.length} in ${elapsed}s | web:${webHits} wiki:${wikiHits} miss:${misses}`);

    if ((i + BATCH) % 500 < BATCH) {
      fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
      console.log(`  💾 Saved (${Object.keys(results).length} total)`);
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
  const total = Object.keys(results).length;
  console.log(`\n✅ Done! ${total}/${slugs.length} companies enriched (${Math.round(total/slugs.length*100)}%)`);
  console.log(`   Job Desc: ${dbHits} | Website: ${webHits} | Wikipedia: ${wikiHits} | Missing: ${misses}`);
  console.log(`   Saved to: ${OUTPUT}`);
}

main().catch(console.error);
