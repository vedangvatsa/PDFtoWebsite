#!/usr/bin/env node
/**
 * Batch remint disposable profile usernames (userN, profileN, junk) to pretty name-based slugs.
 *
 * Usage:
 *   DRY_RUN=1 node .github/scripts/remint-disposable-slugs.mjs
 *   node .github/scripts/remint-disposable-slugs.mjs
 *   node .github/scripts/remint-disposable-slugs.mjs --limit=50
 */
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
require('dotenv').config();

const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const DRY = process.env.DRY_RUN === '1' || process.argv.includes('--dry-run');
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = Math.min(500, Math.max(1, Number(limitArg?.split('=')[1] || 200)));

function isDisposableProfileSlug(slug) {
  if (!slug) return true;
  const s = String(slug).toLowerCase().trim();
  if (s.length < 2 || s.length > 48) return true;
  if (/^user\d+$/i.test(s)) return true;
  if (/^profile\d*$/i.test(s)) return true;
  if (/^(your-?name|test|demo|temp|tmp|asdf|guest)$/i.test(s)) return true;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s)) return true;
  if (s.includes('http') || s.includes('linkedin') || s.includes('github')) return true;
  if (/img_\d+|screenshot|whatsapp.?image|fullsizerender|photo_\d+/i.test(s)) return true;
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(s)) return true;
  return false;
}

function nameToProfileSlug(name) {
  const parts = String(name || '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((p) => p.replace(/[^a-z0-9]/g, ''))
    .filter(
      (p) =>
        p &&
        !['https', 'http', 'www', 'com', 'linkedin', 'github', 'in', 'cv', 'resume'].includes(p)
    );
  if (!parts.length) return 'profile';
  return parts.slice(0, 3).join('-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'profile';
}

function looksLikeRealName(name) {
  if (!name || name === 'Your Name') return false;
  const n = name.trim();
  if (n.length < 3) return false;
  if (/img_|screenshot|whatsapp|fullsizerender|photo_/i.test(n)) return false;
  if (/^user\d+$/i.test(n)) return false;
  // Prefer at least two tokens or one long token
  const parts = n.split(/\s+/).filter(Boolean);
  return parts.length >= 2 || (parts.length === 1 && parts[0].length >= 4);
}

async function slugTaken(slug, excludeId) {
  const q = `${U}/rest/v1/profiles?select=id&username=eq.${encodeURIComponent(slug)}&limit=1`;
  const res = await fetch(q, { headers: { apikey: K, Authorization: `Bearer ${K}` } });
  const rows = await res.json();
  if (!Array.isArray(rows) || !rows.length) return false;
  return rows[0].id !== excludeId;
}

async function mintUnique(base, excludeId) {
  let candidate = base || 'profile';
  if (isDisposableProfileSlug(candidate)) candidate = 'profile';
  for (let i = 0; i < 40; i++) {
    const trySlug = i === 0 ? candidate : `${candidate.slice(0, 32)}-${i + 1}`;
    if (isDisposableProfileSlug(trySlug)) continue;
    if (!(await slugTaken(trySlug, excludeId))) return trySlug;
  }
  return `${candidate.slice(0, 28)}-${Date.now().toString(36).slice(-4)}`;
}

async function main() {
  if (!U || !K) {
    console.error('Need Supabase env');
    process.exit(1);
  }
  // Fetch profiles; filter disposable client-side (PostgREST regex is limited)
  const url = `${U}/rest/v1/profiles?select=id,username,full_name,updated_at&order=updated_at.desc&limit=2000`;
  const res = await fetch(url, { headers: { apikey: K, Authorization: `Bearer ${K}` } });
  if (!res.ok) {
    console.error('fetch failed', res.status, await res.text());
    process.exit(1);
  }
  const profiles = await res.json();
  const disposable = (profiles || []).filter((p) => isDisposableProfileSlug(p.username));
  console.log(`Scanned ${profiles.length} profiles; disposable slugs: ${disposable.length}`);

  let reminted = 0;
  let skipped = 0;
  for (const p of disposable.slice(0, LIMIT)) {
    if (!looksLikeRealName(p.full_name)) {
      console.log(`  skip (no real name): ${p.username} name=${JSON.stringify(p.full_name)}`);
      skipped++;
      continue;
    }
    const base = nameToProfileSlug(p.full_name);
    const next = await mintUnique(base, p.id);
    if (next === p.username) {
      skipped++;
      continue;
    }
    console.log(`  ${p.username} → ${next}  (${p.full_name})`);
    if (DRY) {
      reminted++;
      continue;
    }
    const patch = await fetch(`${U}/rest/v1/profiles?id=eq.${encodeURIComponent(p.id)}`, {
      method: 'PATCH',
      headers: {
        apikey: K,
        Authorization: `Bearer ${K}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ username: next }),
    });
    if (!patch.ok) {
      console.error(`  FAIL ${p.id}: ${patch.status} ${await patch.text()}`);
      skipped++;
      continue;
    }
    reminted++;
  }
  console.log(`Done. reminted=${reminted} skipped=${skipped} dry=${DRY ? 1 : 0}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
