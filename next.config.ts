import type { NextConfig } from 'next';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';

const nextConfigFn = (phase: string): NextConfig => {
  const isBuild = phase === PHASE_PRODUCTION_BUILD;
  
  return {
    /* config options here */
    staticPageGenerationTimeout: 300,
    env: {
      NEXT_IS_BUILD_PHASE: isBuild ? '1' : '0',
    },
    // Exclude heavy files from ALL serverless function NFT bundles.
    // The admin/social route uses process.cwd() which causes NFT to trace
    // the entire project root — pulling in 465MB of CSVs, videos, and databases.
    outputFileTracingExcludes: {
      '*': [
        'node_modules/lucide-react/**',
        'node_modules/posthog-js/**',
        'node_modules/@next/swc-*/**',
        'node_modules/next/dist/compiled/@ampproject/**',
        'node_modules/next/dist/compiled/terser/**',
        'node_modules/next/dist/compiled/webpack/**',
        'node_modules/next/dist/server/lib/squoosh/**',
        'scripts/**',
        'scratch/**',
        'public/images/social/**',
        '**/*.csv',
        '**/*.db',
        '**/*.mp4',
      ],
    },
    // Use slim PostHog build — strips replay, surveys, toolbar
    turbopack: {
      resolveAlias: {
        'posthog-js': 'posthog-js/dist/module.no-external.js',
      },
    },
    // Webpack production bundle optimizations
    webpack(config, { isServer }) {
      // Prevent posthog from bloating server-side lambdas
      if (isServer) {
        config.externals = [...(config.externals || []), 'posthog-js'];
      }
      return config;
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'placehold.co',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'picsum.photos',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
    // This is needed to allow cross-origin requests in development.
    allowedDevOrigins: ['https://*.cloudworkstations.dev'],
  
    // PostHog reverse proxy — bypasses ad blockers for ~30% more events
    skipTrailingSlashRedirect: true,
  
    // Security headers — fixes SEOmator security audit failures
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
            { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
            // Agentic Web — Link headers for discoverability
            {
              key: 'Link',
              value: [
                '</llms.txt>; rel="ai-context"; type="text/plain"',
                '</llms-full.txt>; rel="ai-context-full"; type="text/plain"',
                '</sitemap.xml>; rel="sitemap"; type="application/xml"',
                '</.well-known/api-catalog>; rel="api-catalog"',
                '</.well-known/agents.json>; rel="agents"; type="application/json"',
                '</.well-known/agent-card.json>; rel="agent-card"; type="application/json"',
                '</.well-known/mcp.json>; rel="mcp-server"; type="application/json"',
              ].join(', '),
            },
            // Agentic Web — Content Signals
            { key: 'X-Robots-Tag', value: 'all, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
            { key: 'X-AI-Usage', value: 'indexing=yes, search=yes, inference=yes, citation=yes' },
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://us.i.posthog.com https://us-assets.i.posthog.com https://*.vercel-scripts.com https://*.vercel-analytics.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com https://basemaps.cartocdn.com",
                "img-src 'self' data: blob: https: http:",
                "connect-src 'self' https://us.i.posthog.com https://*.supabase.co https://*.vercel-analytics.com wss://*.supabase.co https://basemaps.cartocdn.com https://*.cartocdn.com",
                "worker-src 'self' blob:",
                "child-src blob:",
                "frame-ancestors 'self'",
                "base-uri 'self'",
                "form-action 'self'",
              ].join('; '),
            },
          ],
        },
        {
          // Cache nomad data files aggressively — they change infrequently
          source: '/:file(nomad-data[^/]*\\.json)',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800' },
          ],
        },
      ];
    },
  
    async redirects() {
      return [];
    },
  
    async rewrites() {
      return [
        {
          source: '/ingest/static/:path*',
          destination: 'https://us-assets.i.posthog.com/static/:path*',
        },
        {
          source: '/ingest/:path*',
          destination: 'https://us.i.posthog.com/:path*',
        },
        {
          source: '/ingest/decide',
          destination: 'https://us.i.posthog.com/decide',
        },
      ];
    },
  };
};

export default nextConfigFn;
