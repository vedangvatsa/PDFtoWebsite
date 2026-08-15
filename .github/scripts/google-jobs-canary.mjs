/**
 * Live Google Jobs canary. Fetches production job URLs as Googlebot and
 * fails if JobPosting JSON-LD is missing, validThrough is past, or schema
 * url does not match the public path.
 *
 * Worldwide "Remote" (no country) must still emit JobPosting — that omission
 * zeroed Google Jobs Valid in Aug 2026 while pages stayed 200.
 */
const SITE = process.env.SITE_URL || 'https://cvin.bio';
const UA =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const ATTEMPTS = Number(process.env.CANARY_ATTEMPTS || 6);
const DELAY_MS = Number(process.env.CANARY_DELAY_MS || 15000);

function isWorldwideRemote(location) {
  return /^(remote|worldwide|anywhere|global)$/i.test(String(location || '').trim());
}

async function fetchText(url, { json = false } = {}) {
  const res = await fetch(url, {
    headers: { 'user-agent': UA, accept: json ? 'application/json' : 'text/html' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return json ? res.json() : res.text();
}

function jobPostings(html) {
  const out = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    try {
      const data = JSON.parse(m[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const d of items) {
        const t = d?.['@type'];
        if (t === 'JobPosting' || (Array.isArray(t) && t.includes('JobPosting'))) {
          out.push(d);
        }
      }
    } catch {
      // ignore non-JSON script blocks
    }
  }
  return out;
}

function assertPosting(path, html) {
  const posts = jobPostings(html);
  if (posts.length === 0) {
    throw new Error(`${path} has no JobPosting JSON-LD`);
  }
  const ld = posts[0];
  const through = Date.parse(ld.validThrough);
  if (!Number.isFinite(through) || through <= Date.now()) {
    throw new Error(`${path} validThrough is missing or past: ${ld.validThrough}`);
  }
  const url = String(ld.url || '');
  if (!url.endsWith(path) && !url.includes(path)) {
    throw new Error(`${path} JobPosting.url is ${url}`);
  }
  return ld;
}

async function pickJobs() {
  const data = await fetchText(`${SITE}/api/jobs?limit=40`, { json: true });
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  const worldwide = jobs.find((j) => isWorldwideRemote(j.location) && j.path);
  const withCountry = jobs.find(
    (j) => j.path && j.location && !isWorldwideRemote(j.location)
  );
  const fallback = jobs.find((j) => j.path);
  const picked = [];
  if (worldwide) picked.push({ ...worldwide, kind: 'worldwide-remote' });
  if (withCountry && withCountry.path !== worldwide?.path) {
    picked.push({ ...withCountry, kind: 'located' });
  }
  if (picked.length === 0 && fallback) picked.push({ ...fallback, kind: 'any' });
  return picked;
}

async function checkOnce() {
  const jobs = await pickJobs();
  if (jobs.length === 0) throw new Error('API returned no public job paths');
  const results = [];
  for (const job of jobs) {
    const html = await fetchText(`${SITE}${job.path}`);
    const ld = assertPosting(job.path, html);
    if (job.kind === 'worldwide-remote' && ld.jobLocationType !== 'TELECOMMUTE') {
      throw new Error(`${job.path} worldwide remote missing TELECOMMUTE`);
    }
    results.push({
      kind: job.kind,
      path: job.path,
      title: ld.title,
      validThrough: ld.validThrough,
      jobLocationType: ld.jobLocationType || null,
    });
  }

  const sitemap = await fetchText(`${SITE}/sitemap.xml`);
  if (!sitemap.includes('sitemap-jobs')) {
    throw new Error('sitemap.xml is missing job chunks');
  }
  return results;
}

async function main() {
  let lastErr;
  for (let i = 1; i <= ATTEMPTS; i++) {
    try {
      const results = await checkOnce();
      console.log(`Google Jobs canary ok (${results.length} URLs)`);
      for (const r of results) console.log(`  ${r.kind} ${r.path} through ${r.validThrough}`);
      return;
    } catch (e) {
      lastErr = e;
      console.warn(`attempt ${i}/${ATTEMPTS}: ${e.message}`);
      if (i < ATTEMPTS) await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }
  console.error('Google Jobs canary failed:', lastErr?.message || lastErr);
  process.exit(1);
}

main();
