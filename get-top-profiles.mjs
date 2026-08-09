import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'node:fs';

const ENV_PATH = './.env.local';

function loadEnv(path) {
  const out = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}

const env = loadEnv(ENV_PATH);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function findEmail(links) {
  if (!Array.isArray(links)) return null;
  const emailLink = links.find(l => l.type === 'email' && l.value);
  if (!emailLink) return null;
  // Some profiles store multiple emails or extra text; split and pick the first valid one
  const candidates = emailLink.value
    .split(/[,;]+/)
    .map(s => s.trim())
    .filter(Boolean);
  return candidates.find(isEmail) || null;
}

async function main() {
  console.log('Fetching top 200 profiles by views...');
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, views, links')
    .order('views', { ascending: false })
    .limit(200);

  if (error) {
    console.error('Profiles query error:', error.message);
    process.exit(1);
  }
  if (!profiles || profiles.length === 0) {
    console.log('No profiles found.');
    process.exit(0);
  }
  console.log(`Got ${profiles.length} profiles`);

  const out = profiles.map(p => ({
    id: p.id,
    email: findEmail(p.links),
    full_name: p.full_name,
    username: p.username,
    views: p.views,
    link: `https://cvin.bio/${p.username}`,
  }));

  const withEmail = out.filter(o => o.email).length;
  writeFileSync('/tmp/top200-profiles.json', JSON.stringify(out, null, 2));
  console.log(`Wrote /tmp/top200-profiles.json — ${withEmail}/200 with emails`);
  console.log('Top 10 sample:');
  console.table(out.slice(0, 10).map(o => ({ full_name: o.full_name, views: o.views, email: o.email, link: o.link })));
}

main();
