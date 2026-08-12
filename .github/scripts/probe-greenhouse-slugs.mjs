import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const dir = dirname(fileURLToPath(import.meta.url));
const slugsPath = join(dir, 'data/greenhouse-slugs.json');
const reportPath = join(dir, 'data/greenhouse-slugs-probe.json');
const slugs = JSON.parse(readFileSync(slugsPath, 'utf8'));

const CONCURRENCY = 25;
const RETRIES = 4;

async function probe(slug) {
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(20000),
      });
      if (res.status === 429 || res.status >= 500) {
        await new Promise(r => setTimeout(r, 800 * 2 ** attempt));
        continue;
      }
      let jobs = 0;
      if (res.ok) {
        const data = await res.json();
        jobs = Array.isArray(data.jobs) ? data.jobs.length : 0;
      }
      return { slug, status: res.status, jobs };
    } catch {
      await new Promise(r => setTimeout(r, 600 * 2 ** attempt));
    }
  }
  return { slug, status: 0, jobs: 0 };
}

const results = [];
let next = 0;
async function worker() {
  while (next < slugs.length) {
    const i = next++;
    results[i] = await probe(slugs[i]);
    if ((i + 1) % 200 === 0 || i + 1 === slugs.length) {
      const done = results.filter(Boolean).length;
      const live = results.filter(r => r?.status === 200).length;
      const withJobs = results.filter(r => r?.status === 200 && r.jobs > 0).length;
      console.log(`${done}/${slugs.length}  live=${live}  with_jobs=${withJobs}`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const live = results.filter(r => r.status === 200).map(r => r.slug).sort((a, b) => a.localeCompare(b));
const dead = results.filter(r => r.status !== 200);
const empty = results.filter(r => r.status === 200 && r.jobs === 0);
const withJobs = results.filter(r => r.status === 200 && r.jobs > 0);

writeFileSync(slugsPath, JSON.stringify(live) + '\n');
writeFileSync(reportPath, JSON.stringify({
  probed: results.length,
  live: live.length,
  with_jobs: withJobs.length,
  empty_boards: empty.length,
  dead: dead.length,
  status_counts: dead.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {}),
  dead_slugs: dead.map(r => ({ slug: r.slug, status: r.status })),
}, null, 2) + '\n');

console.log(JSON.stringify({
  probed: results.length,
  live: live.length,
  with_jobs: withJobs.length,
  empty_boards: empty.length,
  dead: dead.length,
}, null, 2));
