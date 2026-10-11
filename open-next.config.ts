import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// All bindings below work on Workers Free. Runtime cache writes must not go
// into the read-only static-assets adapter. Keep static assets as a fallback.
const config = defineCloudflareConfig({
  incrementalCache: () => import('./src/cloudflare/incremental-cache').then((m) => m.default),
  queue: () => import('@opennextjs/cloudflare/overrides/queue/do-queue').then((m) => m.default),
  tagCache: () => import('@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache').then((m) => m.default),
});
config.edgeExternals = [...(config.edgeExternals || []), 'node:zlib'];

// Keep each deployed Worker below the Free plan's compressed script limit.
// Heavy document decoders and image-rendering WASM must not ship with pages.
const imagePages = ['', 'talent', 'timezone', 'schengen', 'layoffs', 'jobs',
  'fellowships', 'visas', 'fire', 'tax', 'nomad', 'costs', 'resources', 'rankings',
  'climate', 'hiring', 'compare', '[slug]', '[slug]/[jobSlug]', 'jobs/[id]'];
config.functions = {
  parser: { ...config.default, routes: ['app/api/parse-resume/route'], patterns: ['/api/parse-resume'] },
  images: { ...config.default,
    routes: [...imagePages.map((path) => `app/${path ? `${path}/` : ''}opengraph-image/route` as const), 'app/icon/route', 'app/apple-icon/route'],
    patterns: ['*/opengraph-image', '/icon', '/apple-icon'],
  },
};
export default config;
