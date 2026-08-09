/**
 * Build llms.txt + llms-full.txt and write them into public/ so they are
 * served as immutable static assets (Cloudflare edge, 0 ms, no Worker).
 * Run as part of npm run deploy or CI before opennextjs-cloudflare build.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in env.
 * When a local .env.production.local is present it is auto-loaded.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

// Load .env.production.local when present (CI sets env directly via secrets).
const envPath = join(REPO_ROOT, '.env.production.local');
try {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = (m[2] ?? '').replace(/^["'](.*)["']\s*$/, '$1').trim();
    }
  }
} catch {
  // File absent in non-deploy contexts — env must already be set.
}

async function main() {
  const t0 = Date.now();

  // Dynamic import so the module only loads after env is populated.
  const { buildDirectory } = await import('@/lib/llms-directory');
  const publicDir = join(REPO_ROOT, 'public');
  mkdirSync(publicDir, { recursive: true });

  console.log('Generating /llms.txt…');
  const index = await buildDirectory('index');
  writeFileSync(join(publicDir, 'llms.txt'), index);
  console.log(`  llms.txt  ${index.length.toLocaleString()} B  (${(Date.now() - t0) / 1000}s)`);

  const t1 = Date.now();
  console.log('Generating /llms-full.txt (all curated jobs)…');
  const full = await buildDirectory('full');
  writeFileSync(join(publicDir, 'llms-full.txt'), full);
  console.log(`  llms-full ${full.length.toLocaleString()} B  (${(Date.now() - t1) / 1000}s)`);

  console.log(`Done in ${Math.round((Date.now() - t0) / 1000)}s.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
