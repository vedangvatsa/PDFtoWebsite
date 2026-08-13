import { supabaseAdmin } from '@/lib/supabase-admin';
import { jobSitemapPath } from '@/lib/job-description';
import { jobQualifiesForSitemap } from '@/lib/job-assemble';
import { withSitemapCache } from '@/lib/sitemap-cache';
import { escapeXml } from '@/lib/xml';

export const revalidate = 3600;

/** Jooble pubdate/expire format: DD.MM.YYYY */
function dmy(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

const JOBTYPE_MAP: Record<string, string> = {
  full_time: 'full-time',
  part_time: 'part-time',
  contract: 'contract',
  intern: 'internship',
  temporary: 'temporary',
};

/**
 * Jooble XML feed (official spec: jooble.org/files/xml_feed_specifications.pdf).
 * Jobs published/updated within the last 45 days only (Jooble indexing rule).
 * Quality-gated with the same curated filter as the sitemap, plus the
 * banned-title gate (no low-level/service roles anywhere).
 */
export async function GET(req: Request) {
  return withSitemapCache(req.url, async () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
    const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();

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
          .gt('published_at', fortyFiveDaysAgo)
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
      console.error('Jooble feed failed', e);
    }

    const items = jobs
      .map((j) => {
        const path = jobSitemapPath(j);
        if (!path) return '';
        const url = `${siteUrl}${path}?utm_source=jooble&utm_medium=job-feed&utm_campaign=cvinbio_feed`;
        const desc = String(j.description || '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 9000);
        const pubdate = dmy(j.published_at || j.created_at);
        const expire = dmy(
          new Date(new Date(j.published_at || j.created_at || Date.now()).getTime() + 45 * 86400000).toISOString()
        );
        const type = JOBTYPE_MAP[String(j.job_type || '').toLowerCase().replace(/-/g, '_')] || 'full-time';
        const salary = String(j.salary || '').trim();
        return `  <job id="${escapeXml(j.id)}">
    <link><![CDATA[${url}]]></link>
    <name><![CDATA[${escapeXml(j.title)}]]></name>
    <region><![CDATA[${escapeXml(j.location || 'Remote')}]]></region>
${salary ? `    <salary><![CDATA[${escapeXml(salary)}]]></salary>\n` : ''}    <description><![CDATA[${desc}]]></description>
    <company><![CDATA[${escapeXml(j.company)}]]></company>
    <pubdate>${pubdate}</pubdate>
    <expire>${expire}</expire>
    <jobtype>${type}</jobtype>
  </job>`;
      })
      .filter(Boolean)
      .join('\n');

    return `<?xml version="1.0" encoding="utf-8"?>
<jobs>
${items}
</jobs>`;
  });
}
