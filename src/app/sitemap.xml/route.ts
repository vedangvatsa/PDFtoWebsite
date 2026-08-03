import { supabaseAdmin } from '@/lib/supabase-admin';

export const revalidate = 21600;

const CHUNK = 40000;

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Live jobs only (pages expire after 30d — isExpiredJob). Excluding expired
  // URLs keeps the sitemap free of mass-404 noise.
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

  const chunks = Math.max(1, Math.ceil(total / CHUNK));
  const locs: string[] = [`${siteUrl}/sitemap-misc.xml`];
  for (let i = 0; i < chunks; i++) locs.push(`${siteUrl}/sitemap-jobs/${i}`);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map((loc) => `  <sitemap><loc>${escapeXml(loc)}</loc></sitemap>`).join('\n')}
</sitemapindex>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
