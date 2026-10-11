import { blogPosts } from '@/lib/blog-data';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withSitemapCache } from '@/lib/sitemap-cache';
import { escapeXml } from '@/lib/xml';
import { withTimeout, DB_BUDGET, requireDatabaseResult } from '@/lib/db-timeout';

export const revalidate = 3600;

type Entry = { url: string; lastmod?: string; changefreq?: string; priority?: string };

export async function GET(req: Request) {
  return withSitemapCache(req.url, async () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
    const entries: Entry[] = [];

    const blogEntries = blogPosts.map((post) => ({
      url: `${siteUrl}/${post.slug}`,
      lastmod: new Date(post.date).toISOString(),
      changefreq: 'monthly',
      priority: '0.8',
    }));

    const staticEntries: Entry[] = [
      { url: siteUrl, changefreq: 'weekly', priority: '1.0' },
      { url: `${siteUrl}/blog`, changefreq: 'weekly', priority: '0.9' },
      { url: `${siteUrl}/jobs`, changefreq: 'daily', priority: '0.9' },
      { url: `${siteUrl}/contact`, changefreq: 'yearly', priority: '0.4' },
      { url: `${siteUrl}/about`, changefreq: 'monthly', priority: '0.6' },
      { url: `${siteUrl}/privacy`, changefreq: 'yearly', priority: '0.4' },
      { url: `${siteUrl}/terms`, changefreq: 'yearly', priority: '0.4' },
      { url: `${siteUrl}/docs`, changefreq: 'monthly', priority: '0.7' },
      { url: `${siteUrl}/fellowships`, changefreq: 'daily', priority: '0.8' },
      { url: `${siteUrl}/rss.xml`, changefreq: 'hourly', priority: '0.5' },
      { url: `${siteUrl}/talent`, changefreq: 'monthly', priority: '0.8' },
      { url: `${siteUrl}/layoffs`, changefreq: 'monthly', priority: '0.8' },
      { url: `${siteUrl}/discover`, changefreq: 'monthly', priority: '0.7' },
      { url: `${siteUrl}/hiring`, changefreq: 'monthly', priority: '0.8' },
      { url: `${siteUrl}/news`, changefreq: 'hourly', priority: '0.9' },
      { url: `${siteUrl}/nomad`, changefreq: 'weekly', priority: '0.9' },
      { url: `${siteUrl}/costs`, changefreq: 'weekly', priority: '0.8' },
      { url: `${siteUrl}/compare`, changefreq: 'weekly', priority: '0.8' },
      { url: `${siteUrl}/visas`, changefreq: 'weekly', priority: '0.8' },
      { url: `${siteUrl}/timezone`, changefreq: 'weekly', priority: '0.8' },
      { url: `${siteUrl}/tax`, changefreq: 'weekly', priority: '0.8' },
      { url: `${siteUrl}/rankings`, changefreq: 'weekly', priority: '0.8' },
      { url: `${siteUrl}/resources`, changefreq: 'monthly', priority: '0.6' },
      { url: `${siteUrl}/fire`, changefreq: 'monthly', priority: '0.8' },
    ];

    let profileEntries: Entry[] = [];
    try {
      let after = '';
      let complete = false;
      for (let page = 0; page < 200; page++) {
        const result = await withTimeout(supabaseAdmin.rpc('profile_sitemap_page', {
          after_username: after, page_size: 250,
        }), DB_BUDGET.list, 'profile-sitemap');
        const profiles = (requireDatabaseResult(result, 'profile sitemap') || []) as { username: string; updated_at: string | null }[];
        profileEntries.push(...profiles.map((p) => ({
            url: `${siteUrl}/${p.username}`,
            lastmod: p.updated_at ? new Date(p.updated_at).toISOString() : new Date().toISOString(),
            changefreq: 'weekly',
            priority: '0.7',
          })));
        if (profiles.length < 250) { complete = true; break; }
        after = profiles[profiles.length - 1].username;
      }
      if (!complete) throw new Error('Profile sitemap exceeded its page budget');
    } catch (e) {
      console.error('Sitemap misc: failed to fetch profiles', e);
      throw e; // Never publish a partial XML document just because static URLs exist.
    }

    let companyEntries: Entry[] = [];
    try {
      // Use the companies directory (rebuilt from jobs) so EVERY hiring company
      // with open roles is covered — not just a 2.5k-row job sample.
      const result = await withTimeout(supabaseAdmin
        .from('companies')
        .select('slug, name, role_count')
        .gt('role_count', 0)
        .order('role_count', { ascending: false })
        .limit(1000), DB_BUDGET.list, 'company-sitemap');
      const companies = requireDatabaseResult(result, 'company sitemap');
      if (companies?.length === 1000) throw new Error('Company sitemap needs pagination before publishing');

      if (companies) {
        const BLOCKED = /leverdemo|test company|demo company|confidential|\.\.\.|gopuff|n\/a|^unknown$/i;
        for (const c of companies) {
          const name = String(c.name || '').trim();
          if (!name || name.length <= 2 || BLOCKED.test(name)) continue;
          const slug = String(c.slug || '').trim();
          if (!slug || slug.length < 2 || slug.length > 48) continue;
          companyEntries.push({
            url: `${siteUrl}/${slug}`,
            changefreq: 'daily',
            priority: '0.8',
          });
        }
      }
    } catch (e) {
      console.error('Sitemap misc: failed to fetch companies', e);
      throw e;
    }

    entries.push(...staticEntries, ...blogEntries, ...profileEntries, ...companyEntries);

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map((e) => {
    const parts = [`<loc>${escapeXml(e.url)}</loc>`];
    if (e.lastmod) parts.push(`<lastmod>${e.lastmod}</lastmod>`);
    if (e.changefreq) parts.push(`<changefreq>${e.changefreq}</changefreq>`);
    if (e.priority) parts.push(`<priority>${e.priority}</priority>`);
    return `  <url>${parts.join('')}</url>`;
  })
  .join('\n')}
</urlset>`;
  });
}
