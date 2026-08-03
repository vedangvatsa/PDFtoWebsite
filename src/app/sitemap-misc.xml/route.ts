import { blogPosts } from '@/lib/blog-data';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const revalidate = 21600;

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

type Entry = { url: string; lastmod?: string; changefreq?: string; priority?: string };

export async function GET() {
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
    { url: `${siteUrl}/privacy`, changefreq: 'yearly', priority: '0.2' },
    { url: `${siteUrl}/terms`, changefreq: 'yearly', priority: '0.2' },
    { url: `${siteUrl}/contact`, changefreq: 'yearly', priority: '0.4' },
    { url: `${siteUrl}/jobs`, changefreq: 'daily', priority: '0.9' },
    { url: `${siteUrl}/talent`, changefreq: 'monthly', priority: '0.8' },
    { url: `${siteUrl}/layoffs`, changefreq: 'monthly', priority: '0.8' },
    { url: `${siteUrl}/discover`, changefreq: 'monthly', priority: '0.7' },
    { url: `${siteUrl}/hiring`, changefreq: 'monthly', priority: '0.8' },
    { url: `${siteUrl}/news`, changefreq: 'hourly', priority: '0.9' },
    { url: `${siteUrl}/nomad`, changefreq: 'weekly', priority: '0.9' },
    { url: `${siteUrl}/costs`, changefreq: 'weekly', priority: '0.8' },
    { url: `${siteUrl}/compare`, changefreq: 'weekly', priority: '0.8' },
    { url: `${siteUrl}/visas`, changefreq: 'weekly', priority: '0.8' },
    { url: `${siteUrl}/visa-checker`, changefreq: 'weekly', priority: '0.8' },
    { url: `${siteUrl}/cost-of-living`, changefreq: 'weekly', priority: '0.8' },
    { url: `${siteUrl}/timezone`, changefreq: 'weekly', priority: '0.8' },
    { url: `${siteUrl}/tax`, changefreq: 'weekly', priority: '0.8' },
    { url: `${siteUrl}/passport`, changefreq: 'weekly', priority: '0.8' },
    { url: `${siteUrl}/rankings`, changefreq: 'weekly', priority: '0.8' },
    { url: `${siteUrl}/resources`, changefreq: 'monthly', priority: '0.6' },
    { url: `${siteUrl}/tech-talent-report`, changefreq: 'monthly', priority: '0.7' },
    { url: `${siteUrl}/admin`, changefreq: 'yearly', priority: '0.1' },
    { url: `${siteUrl}/fire`, changefreq: 'monthly', priority: '0.8' },
  ];

  let profileEntries: Entry[] = [];
  try {
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('username, updated_at, full_name, about, skills, experience, education')
      .not('username', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(500);

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
    const { data: allJobs } = await supabaseAdmin
      .from('jobs')
      .select('company')
      .order('created_at', { ascending: false })
      .limit(2500);

    if (allJobs) {
      const companyCounts: Record<string, number> = {};
      allJobs.forEach((j) => {
        if (j.company && !j.company.includes('...')) {
          const key = j.company.toLowerCase().trim();
          companyCounts[key] = (companyCounts[key] || 0) + 1;
        }
      });
      const toSlug = (name: string) =>
        name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').replace(/^-+/, '');
      const seenSlugs = new Set<string>();
      Object.entries(companyCounts)
        .filter(([, count]) => count >= 3)
        .forEach(([name]) => {
          const slug = toSlug(name);
          if (!seenSlugs.has(slug)) {
            seenSlugs.add(slug);
            companyEntries.push({
              url: `${siteUrl}/${slug}`,
              changefreq: 'daily',
              priority: '0.8',
            });
          }
        });
    }
  } catch (e) {
    console.error('Sitemap misc: failed to fetch companies', e);
  }

  entries.push(...staticEntries, ...blogEntries, ...profileEntries, ...companyEntries);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
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

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
