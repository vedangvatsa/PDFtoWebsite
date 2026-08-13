import { supabaseAdmin } from '@/lib/supabase-admin';
import { jobSitemapPath } from '@/lib/job-description';
import { jobQualifiesForSitemap } from '@/lib/job-assemble';
import { withSitemapCache } from '@/lib/sitemap-cache';
import { escapeXml } from '@/lib/xml';

export const revalidate = 3600;

function rfc822(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '';
  return d.toUTCString();
}

/**
 * RSS 2.0 job feed (https://cvin.bio/rss.xml).
 * Standard RSS ingesters (Feedly, Inoreader, NewsBlur, Flipboard, Feedspot)
 * consume this. Quality-gated with the same curated filter as the sitemap
 * plus the banned-title gate. <guid> is the canonical job URL so aggregators
 * dedupe correctly.
 */
export async function GET(req: Request) {
  return withSitemapCache(req.url, async () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const jobs: any[] = [];
    let from = 0;
    const PAGE = 1000;
    try {
      while (jobs.length < 200 && true) {
        const { data } = await supabaseAdmin
          .from('jobs')
          .select(
            'id, company, external_id, slug, title, created_at, published_at, location, job_type, salary, tags, category, description'
          )
          .not('external_id', 'is', null)
          .not('company', 'is', null)
          .gt('published_at', sevenDaysAgo)
          .order('published_at', { ascending: false })
          .range(from, from + PAGE - 1);
        if (!data || !data.length) break;
        for (const j of data) {
          if (!jobQualifiesForSitemap(j)) continue;
          jobs.push(j);
          if (jobs.length >= 200) break;
        }
        from += PAGE;
        if (data.length < PAGE) break;
      }
    } catch (e) {
      console.error('RSS feed failed', e);
    }

    const items = jobs
      .map((j) => {
        const path = jobSitemapPath(j);
        if (!path) return '';
        const url = `${siteUrl}${path}`;
        const desc = String(j.description || '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 2000);
        const pub = rfc822(j.published_at || j.created_at);
        return `  <item>
    <title><![CDATA[${escapeXml(j.title)} at ${escapeXml(j.company)} (${escapeXml(j.location || 'Remote')})]]></title>
    <link>${escapeXml(url)}</link>
    <guid isPermaLink="true">${escapeXml(url)}</guid>
    <pubDate>${pub}</pubDate>
    <description><![CDATA[${desc}]]></description>
    <category><![CDATA[${escapeXml(j.category || 'Jobs')}]]></category>
  </item>`;
      })
      .filter(Boolean)
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>CVin.Bio — New Tech Jobs</title>
  <link>${escapeXml(siteUrl)}</link>
  <description>The latest engineering, AI/ML, data and product jobs on CVin.Bio.</description>
  <language>en-us</language>
  <lastBuildDate>${rfc822(new Date().toISOString())}</lastBuildDate>
  <atom:link href="${escapeXml(siteUrl)}/rss.xml" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`;
  });
}
