import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Serve prerendered pages directly from the Workers static-assets binding
// (cdn-cgi/_next_cache) instead of re-rendering them in the Worker on every
// request. This eliminates the SSR cold-start TTFB on static routes. Only
// safe because static pages never revalidate.
export default defineCloudflareConfig({
  incrementalCache: () =>
    import("@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache").then(
      (m) => m.default
    ),
});
