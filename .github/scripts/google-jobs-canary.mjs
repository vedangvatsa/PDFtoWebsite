/**
 * Live Google Jobs canary. Reads pretty job URLs from the public sitemap
 * (GitHub Actions IPs get 403 on /api/jobs — never fetch that) and checks
 * SSR JobPosting JSON-LD. Use a first-party UA: Cloudflare bot fight 403s
 * Googlebot spoofing from Actions, and the markup is the same in SSR HTML.
 *
 * Fails if fewer than 2 sampled pages have JobPosting, validThrough is past,
 * or schema url does not match the public path.
 */
const SITE = process.env.SITE_URL || 'https://cvin.bio';
const CANARY_UA = 'cvin-google-jobs-canary/1';
const ATTEMPTS = Number(process.env.CANARY_ATTEMPTS || 6);
const DELAY_MS = Number(process.env.CANARY_DELAY_MS || 15000);

async function fetchText(url, ua) {
  const res = await fetch(url, {
    headers: { 'user-agent': ua, accept: 'text/html,application/xml' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
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
      // ignore non-JSON blocks
    }
  }
  return out;
}

function pathOf(loc) {
  try {
    return new URL(loc).pathname;
  } catch {
    return loc;
  }
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
  if (ld.jobLocationType === 'TELECOMMUTE' && !ld.applicantLocationRequirements) {
    throw new Error(`${path} TELECOMMUTE missing applicantLocationRequirements`);
  }
  return ld;
}

async function pickJobPaths() {
  const xml = await fetchText(`${SITE}/sitemap-jobs/0`, CANARY_UA);
  const locs = [...xml.matchAll(/<loc>(https:\/\/cvin\.bio\/[^<]+)<\/loc>/g)].map(
    (m) => m[1]
  );
  const paths = locs
    .map(pathOf)
    .filter((p) => /^\/[a-z0-9-]+\/[a-z0-9-]+$/i.test(p));
  if (paths.length < 2) throw new Error('sitemap-jobs/0 has too few job URLs');
  const step = Math.max(1, Math.floor(paths.length / 12));
  return [...new Set(Array.from({ length: 12 }, (_, i) => paths[(i * step) % paths.length]))];
}

async function checkOnce() {
  const paths = await pickJobPaths();
  const results = [];
  const missing = [];
  for (const path of paths) {
    const html = await fetchText(`${SITE}${path}`, CANARY_UA);
    const posts = jobPostings(html);
    if (!posts.length) {
      missing.push(path);
      continue;
    }
    const ld = assertPosting(path, html);
    results.push({
      path,
      title: ld.title,
      validThrough: ld.validThrough,
      jobLocationType: ld.jobLocationType || null,
    });
    if (results.length >= 3) break;
  }
  if (results.length < 2) {
    throw new Error(
      `fewer than 2 JobPosting pages in sample (ok=${results.length} missing=${missing.slice(0, 6).join(',')})`
    );
  }

  const sitemap = await fetchText(`${SITE}/sitemap.xml`, CANARY_UA);
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
      for (const r of results) {
        console.log(`  ${r.path} through ${r.validThrough} ${r.jobLocationType || ''}`);
      }
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
