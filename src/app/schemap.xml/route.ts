const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

/**
 * NLWeb-style Schema Map: machine-readable index of structured feeds.
 * Referenced from robots.txt via the `Schemamap:` directive.
 */
export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<schemamap xmlns="https://nlweb.org/schemamap/0.1">
  <feed name="jobs" type="itemlist" lastMod="${new Date().toISOString()}">
    <url>${siteUrl}/rss.xml</url>
    <format>rss</format>
  </feed>
  <feed name="site-index" type="sitemap">
    <url>${siteUrl}/sitemap.xml</url>
    <format>xml</format>
  </feed>
  <feed name="llms-context" type="markdown">
    <url>${siteUrl}/llms.txt</url>
    <format>markdown</format>
  </feed>
</schemamap>`;
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600',
    },
  });
}
