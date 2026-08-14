import { blogPosts } from '@/lib/blog-data';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withSitemapCache } from '@/lib/sitemap-cache';
import { escapeXml } from '@/lib/xml';

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
      { url: `${siteUrl}/login`, changefreq: 'monthly', priority: '0.6' },
      { url: `${siteUrl}/signup`, changefreq: 'monthly', priority: '0.6' },
      { url: `${siteUrl}/terms`, changefreq: 'yearly', priority: '0.2' },
      { url: `${siteUrl}/contact`, changefreq: 'yearly', priority: '0.4' },
      { url: `${siteUrl}/jobs`, changefreq: 'daily', priority: '0.9' },
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
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('username, updated_at, full_name, about, skills, experience, education')
        .not('username', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(5000);

      if (profiles) {
        profileEntries = profiles
          .filter((p) => {
            if (!p.username || p.username.length < 3) return false;
            const hasRealName = p.full_name && p.full_name !== 'Your Name' && p.full_name.length > 1;
            const hasContent =
              (p.about && p.about.length > 10) ||
              (Array.isArray(p.skills) && p.skills.length > 0) ||
              (Array.isArray(p.experience) && p.experience.length > 0) ||
              (Array.isArray(p.education) && p.education.length > 0);
            return hasRealName && hasContent;
          })
          .map((p) => ({
            url: `${siteUrl}/${p.username}`,
            lastmod: p.updated_at ? new Date(p.updated_at).toISOString() : new Date().toISOString(),
            changefreq: 'weekly',
            priority: '0.7',
          }));
      }
    } catch (e) {
      console.error('Sitemap misc: failed to fetch profiles', e);
    }

    let companyEntries: Entry[] = [];
    try {
      // Use the companies directory (rebuilt from jobs) so EVERY hiring company
      // with open roles is covered — not just a 2.5k-row job sample.
      const { data: companies } = await supabaseAdmin
        .from('companies')
        .select('slug, name, role_count')
        .gt('role_count', 0)
        .order('role_count', { ascending: false })
        .limit(20000);

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
