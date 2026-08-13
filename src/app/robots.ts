import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/editor', '/api/', '/admin'],
      },
      // All crawlers (search engines, AI bots, social previews) are
      // allowed by the wildcard rule above. No need to list them
      // individually — robots.txt defaults to "allow" for unlisted paths.
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}