/**
 * Export remaining incomplete-profile emails (auth join).
 * Does NOT print the service key. Writes audience JSON for artifact download.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('start', new Date().toISOString());
console.log('urlHost', url ? new URL(url).host : null);
console.log('serviceKeyLen', serviceKey.length);

if (!url || !serviceKey) {
  console.error('Missing URL or SERVICE_ROLE');
  process.exit(1);
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
};

async function sbGet(path) {
  const res = await fetch(`${url}${path}`, { headers });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`JSON parse fail ${res.status}: ${text.slice(0, 200)}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} ${path}: ${text.slice(0, 300)}`);
  return data;
}

function analyze(p) {
  const hasPhoto = !!(
    p.profile_picture_url &&
    String(p.profile_picture_url).trim() &&
    !String(p.profile_picture_url).includes('picsum.photos')
  );
  const hasSummary = !!(p.about && String(p.about).trim());
  const links = Array.isArray(p.links) ? p.links : [];
  const hasLocation = links.some(
    (l) => l?.type === 'location' && String(l?.value || '').trim()
  );
  const exp = Array.isArray(p.experience) ? p.experience : [];
  const edu = Array.isArray(p.education) ? p.education : [];
  const skills = Array.isArray(p.skills) ? p.skills : [];
  const hasWork = exp.some((w) =>
    (w?.title || w?.company || w?.description || '').toString().trim()
  );
  const hasEdu = edu.some((ed) =>
    (ed?.institution || ed?.degree || '').toString().trim()
  );
  const hasSkill = skills.some((s) => {
    const val = typeof s === 'string' ? s : s?.name || '';
    return String(val).trim().length > 0;
  });
  const checks = {
    hasPhoto,
    hasSummary,
    hasLocation,
    hasWork,
    hasEdu,
    hasSkill,
  };
  const missing = Object.entries(checks)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  return {
    complete: missing.length === 0,
    missing,
    score: Math.round(((6 - missing.length) / 6) * 100),
  };
}

const alreadyPath = '.github/scripts/already-sent-profile-reminder.json';
const already = existsSync(alreadyPath)
  ? JSON.parse(readFileSync(alreadyPath, 'utf8'))
  : [];
const alreadySet = new Set(already.map((e) => String(e).toLowerCase()));
console.log('already', alreadySet.size);

let profiles = [];
let from = 0;
while (true) {
  const batch = await sbGet(
    `/rest/v1/profiles?select=id,username,full_name,links,profile_picture_url,about,skills,experience,education,created_at&offset=${from}&limit=1000`
  );
  profiles = profiles.concat(batch);
  console.log('profiles', profiles.length);
  if (batch.length < 1000) break;
  from += 1000;
}

const allUsers = [];
for (let page = 1; page <= 100; page++) {
  const batch = await sbGet(`/auth/v1/admin/users?page=${page}&per_page=200`);
  const users = batch?.users || [];
  if (!Array.isArray(users)) {
    console.error('auth shape', typeof batch, Object.keys(batch || {}));
    process.exit(1);
  }
  allUsers.push(...users);
  console.log('auth page', page, users.length);
  if (users.length < 200) break;
}
console.log('auth total', allUsers.length);
const byId = Object.fromEntries(allUsers.map((u) => [u.id, u]));

const seen = new Set();
const audience = [];
for (const p of profiles) {
  const a = analyze(p);
  if (a.complete) continue;
  if (
    p.created_at &&
    Date.now() - new Date(p.created_at).getTime() < 86400000
  )
    continue;
  if (!p.username || /^user\d+$/i.test(String(p.username))) continue;
  const u = byId[p.id];
  const email = (u?.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) continue;
  if (alreadySet.has(email) || seen.has(email)) continue;
  seen.add(email);
  const firstName =
    (p.full_name || u?.user_metadata?.full_name || '')
      .trim()
      .split(/\s+/)[0] || 'there';
  audience.push({
    email,
    firstName,
    username: p.username,
    score: a.score,
    missing: a.missing,
  });
}

writeFileSync('remaining-audience.json', JSON.stringify(audience, null, 2));
console.log('remaining audience', audience.length);
console.log('sample', audience.slice(0, 3).map((a) => ({ u: a.username, s: a.score })));
