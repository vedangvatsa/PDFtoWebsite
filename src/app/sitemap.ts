import type { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blog-data';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Free-tier friendly: cache sitemap so crawlers don't hammer Supabase every hit.
// Was force-dynamic + full job scans — a major source of Nano load.
export const revalidate = 21600; // 6 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteUrl}/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${siteUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/talent`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/layoffs`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/hiring`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/nomad`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/costs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/visas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/rankings`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/aiq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/climate`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/fire`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/schengen`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/tax`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/timezone`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Add /companies listing page
  staticEntries.push({
    url: `${siteUrl}/companies`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  });

  const supabase = supabaseAdmin;

  // Dynamic user profile URLs
  let profileEntries: MetadataRoute.Sitemap = [];
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('username, updated_at, full_name, about, skills, experience, education')
      .not('username', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(500);

    if (profiles) {
      profileEntries = profiles
        .filter(p => {
          if (!p.username || p.username.length < 3) return false;
          const hasRealName = p.full_name && p.full_name !== 'Your Name' && p.full_name.length > 1;
          const hasContent = (p.about && p.about.length > 10)
            || (Array.isArray(p.skills) && p.skills.length > 0)
            || (Array.isArray(p.experience) && p.experience.length > 0)
            || (Array.isArray(p.education) && p.education.length > 0);
          return hasRealName && hasContent;
        })
        .map(p => ({
          url: `${siteUrl}/${p.username}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));
    }
  } catch (e) {
    console.error('Sitemap: failed to fetch profiles', e);
  }

  // Dynamic company page URLs — single capped query, no pagination loop
  let companyEntries: MetadataRoute.Sitemap = [];
  try {
    // Cap hard — Free Nano cannot load 10k job rows per sitemap build
    const { data: allJobs } = await supabase
      .from('jobs')
      .select('company')
      .order('created_at', { ascending: false })
      .limit(2500);

    if (allJobs) {
      const companyCounts: Record<string, number> = {};
      allJobs.forEach(j => {
        if (j.company && !j.company.includes('...')) {
          const key = j.company.toLowerCase().trim();
          companyCounts[key] = (companyCounts[key] || 0) + 1;
        }
      });
      const toSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').replace(/^-+/, '');
      const seenSlugs = new Set<string>();
      Object.entries(companyCounts)
        .filter(([, count]) => count >= 3)
        .forEach(([name]) => {
          const slug = toSlug(name);
          if (!seenSlugs.has(slug)) {
            seenSlugs.add(slug);
            companyEntries.push({
              url: `${siteUrl}/${slug}`,
              lastModified: new Date(),
              changeFrequency: 'daily' as const,
              priority: 0.8,
            });
          }
        });
    }
  } catch (e) {
    console.error('Sitemap: failed to fetch companies', e);
  }

  // Dynamic curated job URLs created in last 30 days
  let jobEntries: MetadataRoute.Sitemap = [];
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: curatedJobs } = await supabase
      .from('jobs')
      .select('company, external_id, created_at')
      .contains('tags', ['curated-jd'])
      .gt('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false })
      .limit(3000);

    if (curatedJobs) {
      const toSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').replace(/^-+/, '');
      curatedJobs.forEach(j => {
        if (!j.company || !j.external_id) return;
        const cSlug = toSlug(j.company);
        const prefix = `${cSlug}_`;
        if (j.external_id.toLowerCase().startsWith(prefix)) {
          const jSlug = j.external_id.slice(prefix.length);
          jobEntries.push({
            url: `${siteUrl}/${cSlug}/${jSlug}`,
            lastModified: j.created_at ? new Date(j.created_at) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          });
        }
      });
    }
  } catch (e) {
    console.error('Sitemap: failed to fetch curated jobs', e);
  }

  return [...staticEntries, ...blogEntries, ...profileEntries, ...companyEntries, ...jobEntries];
}
