import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { publishableCompanyAbout } from '/Users/vedang/.gemini/antigravity/scratch/PDFtoWebsite/src/lib/company-about.ts';
import companyDomains from '/Users/vedang/.gemini/antigravity/scratch/PDFtoWebsite/src/lib/company-domains.json' with { type: 'json' };

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env.local') });
config();
const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const headers = { apikey: K, Authorization: `Bearer ${K}` };

const companies = new Map();
for (let off = 0; ; off += 1000) {
  const r = await fetch(`${U}/rest/v1/jobs?select=company,company_key&limit=1000&offset=${off}`, { headers });
  const part = await r.json();
  if (!Array.isArray(part) || !part.length) break;
  for (const row of part) {
    const key = String(row.company_key || '').trim() || String(row.company || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (key && row.company) companies.set(key, String(row.company));
  }
}
let missing = 0, withDomain = 0;
const sample = [];
for (const [key, name] of companies) {
  const about = publishableCompanyAbout(key) || publishableCompanyAbout(name);
  if (!about) {
    missing++;
    const domain = companyDomains[key] || companyDomains[key.replace(/-/g, '')];
    if (domain) { withDomain++; if (sample.length < 8) sample.push([key, name, domain]); }
  }
}
console.log('distinct companies:', companies.size, '| missing blurb:', missing, '| of which with known domain:', withDomain);
for (const s of sample) console.log('  ', s[0], '|', s[1].slice(0, 30), '|', s[2]);
