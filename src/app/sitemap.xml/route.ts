import {
  JOB_SITEMAP_CHUNK,
  withSitemapCache,
} from '@/lib/sitemap-cache';
import { countSitemapJobs } from '@/lib/sitemap-jobs-query';
import { escapeXml } from '@/lib/xml';

export const revalidate = 3600;

/**
 * Dynamic sitemap index. Counts recent curated job rows
 * and lists enough chunks. Chunks filter to curated or assembled-indexable.
 */
export async function GET(req: Request) {
  return withSitemapCache(req.url, async () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const total = await countSitemapJobs(thirtyDaysAgo);
    const chunks =
      total == null ? 8 : Math.max(1, Math.ceil(total / JOB_SITEMAP_CHUNK));

    const locs: string[] = [`${siteUrl}/sitemap-misc.xml`];
    for (let i = 0; i < chunks; i++) locs.push(`${siteUrl}/sitemap-jobs/${i}`);

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map((loc) => `  <sitemap><loc>${escapeXml(loc)}</loc></sitemap>`).join('\n')}
</sitemapindex>`;
  });
}
