import { jobSitemapPath } from '@/lib/job-description';
import { jobQualifiesForSitemap } from '@/lib/job-assemble';
import {
  JOB_SITEMAP_CHUNK,
  JOB_SITEMAP_PAGE,
  withSitemapCache,
} from '@/lib/sitemap-cache';
import {
  fetchSitemapJobsCreatedPage,
  fetchSitemapJobsPublishedComplement,
  type SitemapJobRow,
} from '@/lib/sitemap-jobs-query';
import { escapeXml } from '@/lib/xml';

export const revalidate = 3600;

type Props = { params: Promise<{ chunk: string }> };

function rowToUrl(
  j: SitemapJobRow,
  siteUrl: string
): { loc: string; lastmod?: string } | null {
  if (!jobQualifiesForSitemap(j)) return null;
  const path = jobSitemapPath(j);
  if (!path) return null;
  const lastMs = [j.published_at, j.created_at]
    .map((ts) => (ts ? new Date(String(ts)).getTime() : NaN))
    .filter((ms) => Number.isFinite(ms));
  const last = lastMs.length
    ? new Date(Math.max(...lastMs)).toISOString().slice(0, 10)
    : undefined;
  return { loc: `${siteUrl}${path}`, lastmod: last };
}

/**
 * Dynamic job sitemap chunk.
 *
 * Curated paraphrases that pass quality gates. Uses indexed created_at pages
 * (not OR date filter) with a published_at complement on chunk 0.
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
    const seen = new Set<string>();

    const pushRow = (j: SitemapJobRow) => {
      const u = rowToUrl(j, siteUrl);
      if (!u || seen.has(u.loc)) return;
      seen.add(u.loc);
      urls.push(u);
    };

    if (chunkIdx === 0) {
      const complement = await fetchSitemapJobsPublishedComplement(thirtyDaysAgo);
      for (const j of complement.data || []) {
        pushRow(j);
        if (urls.length >= JOB_SITEMAP_CHUNK) break;
      }
    }

    let from = offset;
    let done = false;
    let pages = 0;
    const maxPages = Math.ceil(JOB_SITEMAP_CHUNK / JOB_SITEMAP_PAGE) + 25;

    while (urls.length < JOB_SITEMAP_CHUNK && !done && pages < maxPages) {
      pages += 1;
      const { data, error } = await fetchSitemapJobsCreatedPage(
        thirtyDaysAgo,
        from,
        JOB_SITEMAP_PAGE
      );

      if (error?.message === 'timeout' && !(data && data.length)) {
        // Fail open with whatever we collected — never hang until CF kills us.
        break;
      }
      if (error && error.message !== 'timeout') {
        throw new Error(`Sitemap jobs chunk ${chunkIdx}: ${error.message}`);
      }

      if (!data || !data.length) break;
      for (const j of data) {
        pushRow(j);
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
