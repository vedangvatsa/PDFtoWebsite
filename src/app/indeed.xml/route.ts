import { supabaseAdmin } from '@/lib/supabase-admin';
import { jobSitemapPath } from '@/lib/job-description';
import { jobQualifiesForSitemap } from '@/lib/job-assemble';
import { withSitemapCache } from '@/lib/sitemap-cache';

export const revalidate = 3600;

function escapeXml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Indeed jobtype values: FULL_TIME | PART_TIME | CONTRACT | TEMPORARY | INTERN | OTHER */
const JOBTYPE_MAP: Record<string, string> = {
  full_time: 'FULL_TIME',
  part_time: 'PART_TIME',
  contract: 'CONTRACT',
  intern: 'INTERN',
  temporary: 'TEMPORARY',
};

/**
 * Indeed Publisher XML feed ("Post to Indeed").
 * Format per Indeed publisher spec:
 * https://support.indeed.com/hc/en-us/articles/204119730-Post-Jobs-to-Indeed
 * Requires the site to be approved in Indeed Publisher; the feed URL is then
 * registered with the publisher account. Revalidate 24h.
 */
export async function GET(req: Request) {
  return withSitemapCache(req.url, async () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const jobs: any[] = [];
    let from = 0;
    const PAGE = 1000;
    try {
      while (jobs.length < 10000 && true) {
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
          if (jobs.length >= 10000) break;
        }
        from += PAGE;
        if (data.length < PAGE) break;
      }
    } catch (e) {
      console.error('Indeed feed failed', e);
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
          .slice(0, 10000);
        const date = (j.published_at || j.created_at || '').toString().slice(0, 10);
        const type = JOBTYPE_MAP[String(j.job_type || '').toLowerCase().replace(/-/g, '_')] || 'FULL_TIME';
        const salary = String(j.salary || '').trim();
        return `  <job>
    <title><![CDATA[${escapeXml(j.title)}]]></title>
    <date>${escapeXml(date)}</date>
    <referencenumber>${escapeXml(j.id)}</referencenumber>
    <url><![CDATA[${url}]]></url>
    <company><![CDATA[${escapeXml(j.company)}]]></company>
    <city><![CDATA[${escapeXml((j.location || 'Remote').split(',')[0].trim())}]]></city>
    <country>US</country>
    <description><![CDATA[${desc}]]></description>
    <jobtype>${type}</jobtype>
${salary ? `    <salary><![CDATA[${escapeXml(salary)}]]></salary>\n` : ''}  </job>`;
      })
      .filter(Boolean)
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<source publisher="cvinbio">
  <publisher>CVin.Bio</publisher>
  <publisherurl>${escapeXml(siteUrl)}</publisherurl>
  <lastmod>${escapeXml(new Date().toISOString().slice(0, 10))}</lastmod>
${items}
</source>`;
  });
}
