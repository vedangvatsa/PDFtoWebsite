import { supabaseAdmin } from '@/lib/supabase-admin';
import { jobSitemapPath } from '@/lib/job-description';
import {
  JOB_SITEMAP_CHUNK,
  JOB_SITEMAP_PAGE,
  withSitemapCache,
} from '@/lib/sitemap-cache';

export const revalidate = 3600;

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

type Props = { params: Promise<{ chunk: string }> };

/**
 * Dynamic job sitemap chunk.
 *
 * Only curated-jd jobs are indexed. Chunk offset is relative to the curated set
 * so every chunk pages ONLY over indexable rows. Responses are edge-cached so
 * Google does not pay a 20s+ cold build on every read.
 */
export async function GET(req: Request, ctx: Props) {
  const { chunk } = await ctx.params;
  const chunkIdx = Number(chunk);
  if (!Number.isInteger(chunkIdx) || chunkIdx < 0) {
    return new Response('Not found', { status: 404 });
  }

  return withSitemapCache(req.url, async () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const offset = chunkIdx * JOB_SITEMAP_CHUNK;

    const urls: { loc: string; lastmod?: string }[] = [];
    let from = offset;
    let done = false;
    try {
      while (urls.length < JOB_SITEMAP_CHUNK && !done) {
        const { data } = await supabaseAdmin
          .from('jobs')
          .select('id, company, external_id, slug, title, created_at, published_at')
          .contains('tags', ['curated-jd'])
          .not('external_id', 'is', null)
          .not('company', 'is', null)
          .gt('created_at', thirtyDaysAgo)
          .or(`published_at.is.null,published_at.gt.${thirtyDaysAgo}`)
          .order('created_at', { ascending: false })
          .range(from, from + JOB_SITEMAP_PAGE - 1);

        if (!data || !data.length) break;
        for (const j of data) {
          const path = jobSitemapPath(j);
          if (!path) continue;
          const last = (j.published_at || j.created_at || '').toString().slice(0, 10) || undefined;
          urls.push({ loc: `${siteUrl}${path}`, lastmod: last });
          if (urls.length >= JOB_SITEMAP_CHUNK) break;
        }
        from += JOB_SITEMAP_PAGE;
        if (data.length < JOB_SITEMAP_PAGE) done = true;
      }
    } catch (e) {
      console.error(`Sitemap jobs chunk ${chunkIdx}: failed`, e);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => {
    const last = u.lastmod ? `<lastmod>${escapeXml(u.lastmod)}</lastmod>` : '';
    return `  <url><loc>${escapeXml(u.loc)}</loc>${last}<changefreq>weekly</changefreq><priority>0.7</priority></url>`;
  })
  .join('\n')}
</urlset>`;
  });
}
