#!/usr/bin/env node
// Copies content/ (runtime jobs, companies, and description shards) into
// .open-next/assets/cdn-cgi/jobs so the Cloudflare Worker can fetch them
// via env.ASSETS at zero cost, bypassing Supabase on all SSR job pages.

import fs from 'node:fs';
import path from 'node:path';

const contentDir = resolvePath('content');
const targetDir = resolvePath('.open-next/assets/cdn-cgi/jobs');

function resolvePath(rel) {
  return path.resolve(process.cwd(), rel);
}

if (!fs.existsSync(contentDir)) {
  console.log('[populate-jobs-assets] content/ dir does not exist; skipping');
  process.exit(0);
}

fs.mkdirSync(targetDir, { recursive: true });

if (fs.existsSync(path.join(contentDir, 'jobs-runtime.json'))) {
  fs.copyFileSync(
    path.join(contentDir, 'jobs-runtime.json'),
    path.join(targetDir, 'jobs-runtime.json')
  );
}

if (fs.existsSync(path.join(contentDir, 'companies-runtime.json'))) {
  fs.copyFileSync(
    path.join(contentDir, 'companies-runtime.json'),
    path.join(targetDir, 'companies-runtime.json')
  );
}

const shardsDir = path.join(contentDir, 'job-description-shards');
const targetShardsDir = path.join(targetDir, 'shards');
if (fs.existsSync(shardsDir)) {
  fs.cpSync(shardsDir, targetShardsDir, { recursive: true });
}

const shardCount = fs.existsSync(targetShardsDir)
  ? fs.readdirSync(targetShardsDir).length
  : 0;

console.log(`[populate-jobs-assets] Copied jobs catalog & ${shardCount} shards to ${targetDir}`);
