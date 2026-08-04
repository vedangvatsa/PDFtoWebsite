import { supabaseAdmin } from '@/lib/supabase-admin';
import { companyToSlug, shortJobSlug } from '@/lib/job-description';

export const revalidate = 21600;

const CHUNK = 40000;
const PAGE = 1000;

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

type Props = { params: Promise<{ chunk: string }> };

export async function GET(_req: Request, ctx: Props) {
  const { chunk } = await ctx.params;
  const chunkIdx = Number(chunk);
  if (!Number.isInteger(chunkIdx) || chunkIdx < 0) {
    return new Response('Not found', { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const offset = chunkIdx * CHUNK;

  const urls: string[] = [];
  let from = offset;
  let done = false;
  try {
    while (urls.length < CHUNK && !done) {
      const { data } = await supabaseAdmin
        .from('jobs')
        .select('id, company, external_id')
        .not('external_id', 'is', null)
        .not('company', 'is', null)
        .gt('created_at', thirtyDaysAgo)
        .or(`published_at.is.null,published_at.gt.${thirtyDaysAgo}`)
        .order('created_at', { ascending: false })
        .range(from, from + PAGE - 1);

      if (!data || !data.length) break;
      for (const j of data) {
        // Only emit routeable pretty URLs (rejects reserved UTM segments, hex ids, junk)
        const jobSlug = shortJobSlug(j.company, j.external_id);
        if (jobSlug) {
          urls.push(`${siteUrl}/${companyToSlug(j.company)}/${jobSlug}`);
        } else if (j.id) {
          urls.push(`${siteUrl}/jobs/${j.id}`);
        }
      }
      from += PAGE;
      if (data.length < PAGE) done = true;
    }
  } catch (e) {
    console.error(`Sitemap jobs chunk ${chunkIdx}: failed`, e);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${escapeXml(u)}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`)
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
