/**
 * Guardrail for next/og (Satori) prerender crashes.
 *
 * @vercel/og calls `.trim()` on style values. A style object with
 * `undefined` / `null` (e.g. `justifyContent: cond ? 'space-between' : undefined`)
 * fails the production build:
 *   Error: Cannot read properties of undefined (reading 'trim')
 *   … prerendering page "/rankings/opengraph-image"
 *
 * This script:
 *   1. Asserts satoriStyle() strips those values.
 *   2. Scans OG routes/components for the same pattern in source.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { satoriStyle } from '../src/lib/satori-style';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures: string[] = [];

function assert(cond: unknown, msg: string) {
  if (!cond) failures.push(msg);
}

const cleaned = satoriStyle({
  display: 'flex',
  justifyContent: undefined,
  marginTop: undefined,
  color: '#09090b',
  opacity: Number.NaN,
  width: null as unknown as number,
} as Parameters<typeof satoriStyle>[0]);

assert(cleaned.display === 'flex', 'satoriStyle keeps display');
assert(cleaned.color === '#09090b', 'satoriStyle keeps defined colors');
assert(!('justifyContent' in cleaned), 'satoriStyle drops undefined justifyContent');
assert(!('marginTop' in cleaned), 'satoriStyle drops undefined marginTop');
assert(!('opacity' in cleaned), 'satoriStyle drops NaN');
assert(!('width' in cleaned), 'satoriStyle drops null');

const DANGER = [
  /:\s*undefined\b/,
  /\?\s*[^:\n]+:\s*undefined\b/,
  /\|\|\s*undefined\b/,
  /\?\?\s*undefined\b/,
];

function isOgSource(p: string): boolean {
  const n = p.replaceAll('\\', '/');
  return (
    n.endsWith('/opengraph-image.tsx') ||
    n.endsWith('/opengraph-image.ts') ||
    /\/src\/components\/og\/.+\.tsx$/.test(n)
  );
}

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === '.open-next') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (isOgSource(p)) acc.push(p);
  }
  return acc;
}

const files = walk(join(root, 'src'));
if (files.length < 10) {
  failures.push(`expected many OG files, found ${files.length}`);
}

for (const file of files) {
  const rel = relative(root, file);
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    for (const re of DANGER) {
      if (re.test(line)) {
        failures.push(`${rel}:${i + 1} Satori-unsafe style value: ${trimmed}`);
      }
    }
  });
}

if (failures.length) {
  console.error('OG Satori check failed:\n' + failures.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}

console.log(`OG Satori check passed (${files.length} files, satoriStyle assertions ok)`);
