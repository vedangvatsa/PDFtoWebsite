// OpenNext 1.20.2's OG pass scans traces for *all* functions, then tries to
// patch routes absent from the current split. Scope it to files actually
// copied into this function. Keep the patch narrow and fail on upstream drift.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
const require = createRequire(import.meta.url);
const dist = dirname(dirname(require.resolve('@opennextjs/cloudflare')));
const path = resolve(dist, 'cli/build/patches/ast/patch-vercel-og-library.js');
const before = '        // Look for the Node version of the traced @vercel/og files';
const after = '        // CVIN_SPLIT_OG: only patch routes in this function.\n        if (!existsSync(traceInfoPath.replace(appBuildOutputPath, packagePath).replace(".nft.json", ""))) continue;\n' + before;
const source = readFileSync(path, 'utf8');
if (!source.includes('CVIN_SPLIT_OG')) {
  if (!source.includes(before)) throw new Error('Review OpenNext split OG patch for the installed adapter');
  writeFileSync(path, source.replace(before, after));
}
