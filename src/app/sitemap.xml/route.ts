import { supabaseAdmin } from '@/lib/supabase-admin';
import { JOB_SITEMAP_CHUNK, withSitemapCache } from '@/lib/sitemap-cache';

export const revalidate = 3600;

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Dynamic sitemap index. Counts the CURRENT indexable (curated-jd) job set and
 * lists exactly as many job chunks as needed, so the whole site is always
 * covered — new jobs are picked up on the next revalidation and the chunk
 * count never goes stale.
 */
export async function GET(req: Request) {
  return withSitemapCache(req.url, async () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Live, indexable jobs only (curated-jd = 600+ word pages; pages expire 30d).
    let total = 0;
    try {
      const { count } = await supabaseAdmin
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .contains('tags', ['curated-jd'])
        .not('external_id', 'is', null)
        .not('company', 'is', null)
        .gt('created_at', thirtyDaysAgo)
        .or(`published_at.is.null,published_at.gt.${thirtyDaysAgo}`);
      total = count || 0;
    } catch (e) {
      console.error('Sitemap index: failed to count jobs', e);
    }

    const chunks = Math.max(1, Math.ceil(total / JOB_SITEMAP_CHUNK));
    const locs: string[] = [`${siteUrl}/sitemap-misc.xml`];
    for (let i = 0; i < chunks; i++) locs.push(`${siteUrl}/sitemap-jobs/${i}`);

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map((loc) => `  <sitemap><loc>${escapeXml(loc)}</loc></sitemap>`).join('\n')}
</sitemapindex>`;
  });
}
