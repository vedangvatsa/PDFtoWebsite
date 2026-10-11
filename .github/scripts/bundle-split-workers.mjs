/** Complete Cloudflare's final bundling pass for OpenNext split functions.
 * The pinned adapter's final pass targets server-functions/default. Rotate only
 * generated build directories for that pass; never change application sources.
 */
import { renameSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { normalizeOptions } from '@opennextjs/aws/build/helper.js';

const require = createRequire(import.meta.url);
const cfDist = dirname(dirname(require.resolve('@opennextjs/cloudflare')));
const { bundleServer } = await import(pathToFileURL(resolve(cfDist, 'cli/build/bundle-server.js')).href);
const config = (await import(pathToFileURL(resolve('.open-next/.build/open-next.config.mjs')).href)).default;
const awsDist = dirname(dirname(require.resolve('@opennextjs/aws/build/helper.js')));
const options = normalizeOptions(config, awsDist, resolve('.open-next/.build'));
const base = resolve('.open-next/server-functions');
const original = resolve(base, 'default');
const saved = resolve(base, 'main-saved');
if (existsSync(saved)) throw new Error('Interrupted split build: rebuild OpenNext before retrying');
for (const name of ['parser', 'images']) {
  const split = resolve(base, name);
  if (!existsSync(split)) throw new Error(`Missing split function ${name}`);
  renameSync(original, saved);
  try {
    renameSync(split, original);
    await bundleServer(options, { minify: true });
  } finally {
    if (existsSync(original)) renameSync(original, split);
    renameSync(saved, original);
  }
  // The adapter emits absolute imports for WASM/fonts and some externals.
  // Relocate them with the generated function; do not point into the main
  // function's now-restored node_modules tree.
  const handler = resolve(split, 'handler.mjs');
  const source = readFileSync(handler, 'utf8').replaceAll(`${original}/`, `${split}/`);
  writeFileSync(handler, source);
}
