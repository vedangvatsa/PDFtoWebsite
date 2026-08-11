#!/usr/bin/env node
// Populates the prerendered page cache into the Workers static-assets
// directory so the static-assets incremental cache can serve pages
// without running SSR in the Worker (avoids cold-start TTFB).
const fs = require("fs");
const path = require("path");

const src = ".open-next/cache";
const dest = ".open-next/assets/cdn-cgi/_next_cache";

if (!fs.existsSync(src)) {
  console.log("No cache dir to populate");
  process.exit(0);
}

fs.cpSync(src, dest, { recursive: true });

let n = 0;
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".cache")) n++;
  }
})(dest);

console.log("Populated static assets cache with", n, "prerendered files");
