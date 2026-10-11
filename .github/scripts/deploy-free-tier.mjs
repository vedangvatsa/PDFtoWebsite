import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync } from 'node:fs';
import { parse } from 'dotenv';

const checkOnly = process.argv.includes('--check');
const uploadOnly = process.argv.includes('--upload-only');
const configurations = ['wrangler.parser.jsonc', 'wrangler.images.jsonc', 'wrangler.jsonc'];
const run = (args, options = {}) => {
  const result = spawnSync('node_modules/.bin/wrangler', args, { encoding: 'utf8', ...options });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || '');
    process.stdout.write(result.stdout || '');
    throw new Error(`Wrangler ${args[0]} failed`);
  }
  return result.stdout;
};

// Do not accidentally publish unrelated, untracked local public assets.
const untracked = spawnSync('git', ['ls-files', '--others', '--exclude-standard', '-z', 'public'], { encoding: 'utf8' });
if (untracked.status !== 0) throw new Error('Cannot verify deployment asset inventory');
const ignored = untracked.stdout.split('\0').filter(Boolean).map((path) => `/${path.slice('public/'.length)}`);
if (ignored.length) writeFileSync('.open-next/assets/.assetsignore', `${ignored.join('\n')}\n`);

// Check every bundle before any upload. Use a conservative decimal 3 MB
// ceiling, also below Cloudflare's documented 3 MiB compressed limit.
for (const config of configurations) {
  const output = run(['deploy', '--dry-run', '--config', config]);
  const match = output.match(/gzip:\s*([\d.]+)\s*KiB/);
  if (!match) throw new Error(`Cannot verify compressed size for ${config}`);
  const bytes = Number(match[1]) * 1024;
  console.log(`${config}: ${match[1]} KiB compressed`);
  if (bytes > 3_000_000) throw new Error(`${config} exceeds the Workers Free script budget`);
}
if (checkOnly) process.exit(0);

const values = {};
for (const file of ['.env.local', '.env.production.local']) {
  if (existsSync(file)) Object.assign(values, parse(readFileSync(file)));
}
Object.assign(values, Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== '')));
const common = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SITE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_KEY'];
const parser = [...common, 'GEMINI_API_KEY', 'GEMINI_API_KEY_2', 'GEMINI_API_KEY_3', 'GEMINI_API_KEY_4', 'GEMINI_API_KEY_5', 'GEMINI_MODEL', 'DEEPSEEK_API_KEY', 'DEEPSEEK_API_KEY_2', 'DEEPSEEK_MODEL', 'DEEPSEEK_REASONING_EFFORT'];
if (!values.NEXT_PUBLIC_SUPABASE_URL || !(values.SUPABASE_SERVICE_ROLE_KEY || values.SUPABASE_KEY)) {
  throw new Error('Supabase deployment credentials unavailable');
}
mkdirSync('.wrangler', { recursive: true });
run(['d1', 'execute', 'cvinbio-cache-tags', '--remote', '--file', 'cloudflare-cache-schema.sql']);
for (const config of configurations) {
  const keys = config === 'wrangler.parser.jsonc' ? parser : common;
  const secrets = Object.fromEntries(keys.filter((key) => values[key]).map((key) => [key, values[key]]));
  const file = '.wrangler/free-tier-deploy-secrets.json';
  writeFileSync(file, JSON.stringify(secrets), { mode: 0o600 });
  try {
    // Service-bound workers are deployed first; switch public routing last.
    process.stdout.write(run([...(uploadOnly ? ['versions', 'upload'] : ['deploy']), '--config', config, '--keep-vars', '--secrets-file', file]));
  } finally {
    unlinkSync(file);
  }
}
