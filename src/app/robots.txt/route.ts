const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

/**
 * Plain-text robots.txt so non-standard agent directives (Schemamap:) can be
 * emitted alongside the standard rules.
 */
export function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /editor
Disallow: /api/
Disallow: /admin

User-agent: Google-Extended
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Applebot-Extended
Allow: /

Schemamap: ${siteUrl}/schemap.xml

Sitemap: ${siteUrl}/sitemap.xml
Host: ${siteUrl}
`;
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600',
    },
  });
}
