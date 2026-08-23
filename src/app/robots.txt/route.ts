const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

/**
 * Plain-text robots.txt allowing all search, AI crawlers, and agent runtimes.
 */
export function GET() {
  const body = `User-agent: *
Allow: /
Allow: /api/
Disallow: /editor
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

User-agent: ora-agent
Allow: /

User-agent: DeepSeekBot
Allow: /

User-agent: MistralBot
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
