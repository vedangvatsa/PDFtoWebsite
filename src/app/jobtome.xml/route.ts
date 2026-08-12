import { supabaseAdmin } from '@/lib/supabase-admin';
import { jobSitemapPath } from '@/lib/job-description';
import { jobQualifiesForSitemap } from '@/lib/job-assemble';
import { withSitemapCache } from '@/lib/sitemap-cache';

export const revalidate = 3600;

function escapeXml(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Jobtome XML feed — full-snapshot semantics.
 * https://www.jobtome.com/webmasters/xml (official spec):
 *  - feed must include ALL currently-valid jobs (absent jobs are removed)
 *  - all textual content in CDATA sections
 *  - <date> = first publication date, numeric DD/MM/YYYY or YYYY/MM/DD
 *  - feed checked once per day; zip/gzip encouraged
 */
export async function GET(req: Request) {
  return withSitemapCache(req.url, async () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const jobs: any[] = [];
    let from = 0;
    const PAGE = 1000;
    try {
      while (jobs.length < 20000 && true) {
        const { data } = await supabaseAdmin
          .from('jobs')
          .select(
            'id, company, external_id, slug, title, created_at, published_at, location, job_type, salary, tags, category, description'
          )
          .not('external_id', 'is', null)
          .not('company', 'is', null)
          .gt('published_at', thirtyDaysAgo)
          .order('published_at', { ascending: false })
          .range(from, from + PAGE - 1);
        if (!data || !data.length) break;
        for (const j of data) {
          if (!jobQualifiesForSitemap(j)) continue;
          jobs.push(j);
          if (jobs.length >= 20000) break;
        }
        from += PAGE;
        if (data.length < PAGE) break;
      }
    } catch (e) {
      console.error('Jobtome feed failed', e);
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
          .slice(0, 9000);
        const pub = j.published_at || j.created_at || new Date().toISOString();
        const pubDate = pub.slice(0, 10).split('-').reverse().join('/'); // DD/MM/YYYY
        const locParts = String(j.location || 'Remote').split(',');
        const city = locParts[0]?.trim() || 'Remote';
        const country = 'US';
        return `  <job>
    <title><![CDATA[${escapeXml(j.title)}]]></title>
    <date><![CDATA[${pubDate}]]></date>
    <uniqueid><![CDATA[${escapeXml(j.id)}]]></uniqueid>
    <url><![CDATA[${url}]]></url>
    <company><![CDATA[${escapeXml(j.company)}]]></company>
    <city><![CDATA[${escapeXml(city)}]]></city>
    <province><![CDATA[]]></province>
    <country><![CDATA[${country}]]></country>
    <description><![CDATA[${desc}]]></description>
  </job>`;
      })
      .filter(Boolean)
      .join('\n');

    return `<?xml version="1.0" encoding="utf-8"?>
<source>
  <publisher><![CDATA[CVin.Bio]]></publisher>
  <publisherurl><![CDATA[${escapeXml(siteUrl)}]]></publisherurl>
  <lastBuildDate>${escapeXml(new Date().toUTCString())}</lastBuildDate>
${items}
</source>`;
  });
}
