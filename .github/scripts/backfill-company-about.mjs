import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { publishableCompanyAbout } from '../../src/lib/company-about.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env.local') });
config();

const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const headers = { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' };

const aboutCache = new Map();
function aboutFor(row) {
  const key = String(row.company_key || row.company || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (aboutCache.has(key)) return aboutCache.get(key);
  const about = publishableCompanyAbout(key) || publishableCompanyAbout(row.company || '');
  aboutCache.set(key, about);
  return about;
}

let ok = 0, noBlurb = 0, skipped = 0;
for (let off = 0; ; off += 1000) {
  const r = await fetch(
    `${U}/rest/v1/jobs?select=id,title,company,company_key,description&tags=cs.%7B%22curated-jd%22%7D&limit=1000&offset=${off}`,
    { headers }
  );
  const rows = await r.json();
  if (!Array.isArray(rows) || !rows.length) break;
  for (const row of rows) {
    const d = String(row.description || '');
    if (/About the company/i.test(d)) { skipped++; continue; }
    const about = aboutFor(row);
    if (!about) { noBlurb++; continue; }
    const words = d.split(/\s+/).filter(Boolean).length;
    const patched = `${d}\n\nAbout the company\n${about}`.trim();
    const r2 = await fetch(`${U}/rest/v1/jobs?id=eq.${row.id}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({ description: patched }),
    });
    if (r2.ok) ok++;
    else console.log('patch fail', row.id, (await r2.text()).slice(0, 100));
  }
  console.log(`page ${off}+${rows.length} | appended=${ok} noBlurb=${noBlurb} had=${skipped}`);
}
console.log(`DONE appended=${ok} noBlurb=${noBlurb} already=${skipped}`);
