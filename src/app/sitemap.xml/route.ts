import { supabaseAdmin } from '@/lib/supabase-admin';
import { JOB_SITEMAP_CHUNK, withSitemapCache } from '@/lib/sitemap-cache';

export const revalidate = 3600;

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Dynamic sitemap index. Counts recent job rows (curated + assemble candidates)
 * and lists enough chunks. Chunks drop rows that fail quality gates.
 */
export async function GET(req: Request) {
  return withSitemapCache(req.url, async () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Broader candidate set; chunks filter to curated or assembled-indexable.
    let total = 0;
    try {
      const { count } = await supabaseAdmin
        .from('jobs')
        .select('id', { count: 'exact', head: true })
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
