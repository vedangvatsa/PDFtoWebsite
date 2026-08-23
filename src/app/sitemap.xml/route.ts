import { supabaseAdmin } from '@/lib/supabase-admin';
import { companyJobsDateOrFilter } from '@/lib/company-hub-query';
import { JOB_SITEMAP_CHUNK, withSitemapCache } from '@/lib/sitemap-cache';
import { escapeXml } from '@/lib/xml';

export const revalidate = 3600;

/**
 * Dynamic sitemap index. Counts recent curated job rows
 * and lists enough chunks. Chunks drop rows that fail quality gates.
 */
export async function GET(req: Request) {
  return withSitemapCache(req.url, async () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Broader candidate set; chunks filter to curated or assembled-indexable.
    // On count failure, list several chunks rather than a single empty child —
    // Google still discovers inventory while the next request retries the count.
    let total = 0;
    let countFailed = false;
    try {
      const { count, error } = await supabaseAdmin
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .not('external_id', 'is', null)
        .not('company', 'is', null)
        .contains('tags', ['curated-jd'])
        .or(companyJobsDateOrFilter(thirtyDaysAgo));
      if (error) throw new Error(error.message);
      total = count || 0;
    } catch (e) {
      countFailed = true;
      console.error('Sitemap index: failed to count jobs', e);
    }

    const chunks = countFailed
      ? 8
      : Math.max(1, Math.ceil(total / JOB_SITEMAP_CHUNK));
    const locs: string[] = [`${siteUrl}/sitemap-misc.xml`];
    for (let i = 0; i < chunks; i++) locs.push(`${siteUrl}/sitemap-jobs/${i}`);

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map((loc) => `  <sitemap><loc>${escapeXml(loc)}</loc></sitemap>`).join('\n')}
</sitemapindex>`;
  });
}
