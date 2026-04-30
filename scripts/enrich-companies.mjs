#!/usr/bin/env node
/**
 * enrich-companies.mjs
 *
 * For every unique company in the jobs DB, fetch a verified description from:
 *   1. Wikipedia REST API (fact-checked by human editors)
 *   2. Company website <meta name="description"> / og:description
 *
 * Output: src/lib/company-descriptions.json
 *         { "stripe": "Stripe, Inc. is an Irish-American ...", ... }
 *
 * Usage:  node scripts/enrich-companies.mjs
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

// Load existing cache to avoid re-fetching
let existing = {};
try { existing = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); } catch {}

// ─── Wikipedia API ───
async function fetchWikipedia(companyName) {
  // Try several search variants
  const variants = [
    companyName,
    `${companyName} (company)`,
    `${companyName} (software)`,
    `${companyName} (technology company)`,
  ];

  for (const query of variants) {
    try {
      const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(searchUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'CVinBot/1.0 (https://cvin.bio; jobs@cvin.bio)' },
      });
      clearTimeout(timeout);

      if (!res.ok) continue;
      const data = await res.json();

      // Verify it's actually about this company (not a disambiguation page)
      if (data.type === 'disambiguation') continue;
      if (!data.extract) continue;

      // Basic relevance check: the extract should mention something company-like
      const ext = data.extract.toLowerCase();
      const name = companyName.toLowerCase();
      if (!ext.includes(name) && !ext.includes(name.replace(/\s/g, ''))) continue;

      // Take first 2-3 sentences (up to ~300 chars)
      let desc = data.extract;
      const sentences = desc.match(/[^.!?]+[.!?]+/g) || [desc];
      desc = sentences.slice(0, 3).join(' ').trim();
      if (desc.length > 350) desc = sentences.slice(0, 2).join(' ').trim();

      return { source: 'wikipedia', description: desc, url: data.content_urls?.desktop?.page || null };
    } catch { continue; }
  }
  return null;
}

// ─── Website meta description ───
async function fetchWebsiteMeta(companyName) {
  const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`https://${domain}`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'CVinBot/1.0 (https://cvin.bio)' },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const html = await res.text();

    // meta description
    let match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']{20,300})["']/i)
      || html.match(/<meta[^>]*content=["']([^"']{20,300})["'][^>]*name=["']description["']/i);
    if (match?.[1]) {
      return { source: 'website', description: htmlDecode(match[1]).trim() };
    }

    // og:description fallback
    match = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']{20,300})["']/i)
      || html.match(/<meta[^>]*content=["']([^"']{20,300})["'][^>]*property=["']og:description["']/i);
    if (match?.[1]) {
      return { source: 'og', description: htmlDecode(match[1]).trim() };
    }
  } catch {}
  return null;
}

function htmlDecode(str) {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

// ─── Slug helper ───
function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').replace(/^-+/, '');
}

// ─── Main ───
async function main() {
  console.log('📊 Fetching unique companies from DB...');

  // Get all unique company names
  let allCompanies = new Set();
  let page = 0;
  while (true) {
    const { data } = await supabase
      .from('jobs')
      .select('company')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (!data || data.length === 0) break;
    data.forEach(j => { if (j.company) allCompanies.add(j.company); });
    if (data.length < 1000) break;
    page++;
  }

  // Deduplicate by slug
  const companyBySlug = {};
  for (const name of allCompanies) {
    const slug = toSlug(name);
    if (!companyBySlug[slug] || name.length > companyBySlug[slug].length) {
      companyBySlug[slug] = name;
    }
  }

  const slugs = Object.keys(companyBySlug).sort();
  console.log(`  Found ${slugs.length} unique companies`);

  // Filter out already-cached ones
  const toFetch = slugs.filter(s => !existing[s]);
  console.log(`  ${toFetch.length} need enrichment (${slugs.length - toFetch.length} already cached)\n`);

  const results = { ...existing };
  let wikiHits = 0, webHits = 0, misses = 0;

  // Process in batches of 10 (concurrency)
  for (let i = 0; i < toFetch.length; i += 10) {
    const batch = toFetch.slice(i, i + 10);
    const promises = batch.map(async (slug) => {
      const name = companyBySlug[slug];

      // 1. Try Wikipedia
      const wiki = await fetchWikipedia(name);
      if (wiki) {
        results[slug] = wiki.description;
        wikiHits++;
        console.log(`  ✅ [wiki] ${name}`);
        return;
      }

      // 2. Try website meta
      const web = await fetchWebsiteMeta(name);
      if (web) {
        results[slug] = web.description;
        webHits++;
        console.log(`  🌐 [site] ${name}`);
        return;
      }

      misses++;
      console.log(`  ⚠ [miss] ${name}`);
    });

    await Promise.all(promises);

    // Save incrementally every 50
    if (i % 50 === 0 && i > 0) {
      fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
      console.log(`  💾 Saved (${Object.keys(results).length} total)\n`);
    }
  }

  // Final save
  fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2));

  console.log(`\n✅ Done! ${Object.keys(results).length} companies enriched`);
  console.log(`   Wikipedia: ${wikiHits} | Website: ${webHits} | Missing: ${misses}`);
  console.log(`   Saved to: ${OUTPUT}`);
}

main().catch(console.error);
