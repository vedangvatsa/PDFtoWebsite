import { supabaseAdmin } from '@/lib/supabase-admin';
import { getPlatformStats } from '@/lib/get-platform-stats';

// Free-tier: cache hard so crawlers don't re-scan profiles/jobs every request.
// Do not use force-dynamic here — that would bypass revalidate.
export const revalidate = 43200; // 12 hours

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

  const stats = await getPlatformStats();

  const lines: string[] = [
    '# CVin.Bio',
    '',
    '> CVin.Bio is a professional identity and job platform. Users upload a CV and get a structured, public profile at a permanent URL. Companies have dedicated career pages with all open roles.',
    '',
    '## Useful Links',
    '',
    `- Homepage: ${siteUrl}`,
    `- Job Board (${stats.jobCountDisplay} live listings): ${siteUrl}/jobs`,
    `- Companies (${stats.companyCountDisplay} hiring): ${siteUrl}/companies`,
    `- Tech Talent Report 2026: ${siteUrl}/hiring`,
    `- Tech Layoffs Report 2026: ${siteUrl}/layoffs`,
    `- Remote Talent Report 2026: ${siteUrl}/talent`,
    `- Blog: ${siteUrl}/blog`,
    '',
    '## Nomad Directory & Tools',
    '',
    `> Directory of 100 digital nomad cities with cost of living, visas, wifi speeds, and interactive tools for remote workers.`,
    '',
    `- Digital Nomad Directory: ${siteUrl}/nomad`,
    `- Cost of Living & Purchasing Power: ${siteUrl}/costs`,
    `- Compare Cities: ${siteUrl}/compare`,
    `- Visas & Travel (Nomad Visas + Visa Checker): ${siteUrl}/visas`,
    `- City Rankings (Internet, Safety, Walkability): ${siteUrl}/rankings`,
    `- Resources (Insurance, Banking, eSIM & more): ${siteUrl}/resources`,
    `- FIRE / Savings Runway Calculator: ${siteUrl}/fire`,
    `- Schengen 90/180 Day Rule Tracker: ${siteUrl}/schengen`,
    `- Nomad Tax Comparison: ${siteUrl}/tax`,
    `- Timezone Overlap Tool: ${siteUrl}/timezone`,
    '',
    '## Professional Profiles',
    '',
    '> Each profile URL below is a public, structured webpage representing a professional. Profiles include schema.org Person markup with work history, education credentials, skills, and social links.',
    '',
  ];

  try {
    const supabase = supabaseAdmin;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('username, full_name, about, skills, experience, education')
      .not('username', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(400);

    if (profiles) {
      for (const p of profiles) {
        if (!p.username || p.username.length < 3) continue;
        const hasRealName =
          p.full_name && p.full_name !== 'Your Name' && p.full_name.length > 1;
        const hasContent =
          (p.about && p.about.length > 10) ||
          (Array.isArray(p.skills) && p.skills.length > 0) ||
          (Array.isArray(p.experience) && p.experience.length > 0) ||
          (Array.isArray(p.education) && p.education.length > 0);
        if (!hasRealName || !hasContent) continue;

        const name = p.full_name || 'Professional';
        const skills =
          Array.isArray(p.skills) && p.skills.length > 0
            ? p.skills.slice(0, 5).join(', ')
            : null;
        const summary = p.about
          ? p.about.slice(0, 120).replace(/\n/g, ' ').trim()
          : null;

        let description = name;
        if (summary) description += ` — ${summary}`;
        else if (skills) description += ` — Skills: ${skills}`;

        lines.push(`- [${name}](${siteUrl}/${p.username}): ${description}`);
      }
    }

    lines.push('');
    lines.push('## Company Careers');
    lines.push('');
    lines.push(
      '> These pages contain live job openings, hiring locations, required skills, and FAQ for specific tech companies.'
    );
    lines.push('');

    // Cap hard for Free Nano (was up to 10k rows)
    const { data: jobSample } = await supabase
      .from('jobs')
      .select('company')
      .order('created_at', { ascending: false })
      .limit(2000);

    const companyNames = new Set<string>();
    (jobSample || []).forEach((j) => {
      if (j.company && !j.company.includes('...')) companyNames.add(j.company);
    });

    const toSlug = (name: string) =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+$/, '')
        .replace(/^-+/, '');
    const seenSlugs = new Set<string>();

    companyNames.forEach((name) => {
      const slug = toSlug(name);
      if (!seenSlugs.has(slug)) {
        seenSlugs.add(slug);
        lines.push(
          `- [${name}](${siteUrl}/${slug}): Open roles, remote data, and hiring FAQs for ${name}.`
        );
      }
    });
  } catch {
    lines.push('- Error loading data');
  }

  lines.push('');
  lines.push(`## Last Updated`);
  lines.push('');
  lines.push(`${new Date().toISOString()}`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=86400',
    },
  });
}
