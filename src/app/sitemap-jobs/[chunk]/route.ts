import { supabaseAdmin } from '@/lib/supabase-admin';
import { companyJobsDateOrFilter } from '@/lib/company-hub-query';
import { jobSitemapPath } from '@/lib/job-description';
import { jobQualifiesForSitemap } from '@/lib/job-assemble';
import {
  JOB_SITEMAP_CHUNK,
  JOB_SITEMAP_PAGE,
  withSitemapCache,
} from '@/lib/sitemap-cache';
import { escapeXml } from '@/lib/xml';

export const revalidate = 3600;

type Props = { params: Promise<{ chunk: string }> };

/**
 * Dynamic job sitemap chunk.
 *
 * Curated paraphrases that pass quality gates.
 * Chunk offset is over recent jobs; non-qualifying rows are skipped.
 *
 * Do not select `description` here — fat text + OR date filter trips PostgREST
 * statement timeouts, which used to be swallowed into an empty urlset and
 * edge-cached. `jobQualifiesForSitemap` treats a missing description as
 * tag-trusted (curated-jd already implies the 600-word floor).
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
    let pages = 0;
    const maxPages = Math.ceil(JOB_SITEMAP_CHUNK / JOB_SITEMAP_PAGE) + 25;

    while (urls.length < JOB_SITEMAP_CHUNK && !done && pages < maxPages) {
      pages += 1;
      const { data, error } = await supabaseAdmin
        .from('jobs')
        .select(
          'id, company, external_id, slug, title, created_at, published_at, location, job_type, salary, tags, category'
        )
        .not('external_id', 'is', null)
        .not('company', 'is', null)
        .contains('tags', ['curated-jd'])
        .or(companyJobsDateOrFilter(thirtyDaysAgo))
        .order('created_at', { ascending: false })
        .range(from, from + JOB_SITEMAP_PAGE - 1);

      // Rethrow — never return an empty urlset that looks like "no jobs".
      if (error) {
        throw new Error(`Sitemap jobs chunk ${chunkIdx}: ${error.message}`);
      }

      if (!data || !data.length) break;
      for (const j of data) {
        if (!jobQualifiesForSitemap(j)) continue;
        const path = jobSitemapPath(j);
        if (!path) continue;
        const lastMs = [j.published_at, j.created_at]
          .map((ts) => (ts ? new Date(String(ts)).getTime() : NaN))
          .filter((ms) => Number.isFinite(ms));
        const last = lastMs.length
          ? new Date(Math.max(...lastMs)).toISOString().slice(0, 10)
          : undefined;
        urls.push({ loc: `${siteUrl}${path}`, lastmod: last });
        if (urls.length >= JOB_SITEMAP_CHUNK) break;
      }
      from += JOB_SITEMAP_PAGE;
      if (data.length < JOB_SITEMAP_PAGE) done = true;
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
