import { supabaseAdmin } from '@/lib/supabase-admin';
import { getPlatformStats } from '@/lib/get-platform-stats';
import {
  canonicalizeCompanyName,
  toCompanySlug,
  isJunkCompanyName,
} from '@/lib/company-directory';
import { isDisposableProfileSlug } from '@/lib/parse-guard';
import { jobSitemapPath } from '@/lib/job-description';

// Full-context endpoint: complete live profile/company/job directory.
// Regenerated from the database so nothing is ever stale or missing.
export const revalidate = 21600; // 6 hours

const MAX_JOBS = 20000; // keep generation inside worker limits; jobs expire after 30d anyway

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

  const stats = await getPlatformStats();

  const lines: string[] = [
    '# CVin.Bio — Full Context for AI Systems',
    '',
    `> CVin.Bio converts PDF CVs into professional websites and runs a curated tech job board with **${stats.jobCountDisplay} curated jobs** across **${stats.companyCountDisplay} companies**. This file is the complete, live directory — every public profile, every hiring company, and the full curated job listing.`,
    '',
    '## About CVin.Bio',
    '',
    'CVin.Bio converts PDF CVs into professional websites and runs a curated tech job board with AI-powered skill matching. The platform also publishes original research reports analyzing hiring trends.',
    '',
    '### Core Product: CV to Website',
    'Upload a PDF CV; AI extracts structured data and generates a responsive personal website at a custom URL (e.g., cvin.bio/yourname).',
    '',
    `### Core Product: Job Board`,
    `The job board at ${siteUrl}/jobs aggregates curated tech job listings from companies. Users get personalized job recommendations based on skill matching.`,
    '',
    '### Research Reports',
    `1. [Tech Talent Report 2026](${siteUrl}/tech-talent-report) — Analysis of job listings across companies.`,
    `2. [Tech Layoffs Report 2026](${siteUrl}/layoffs) — Tech layoffs since 2020.`,
    `3. [Remote Talent Report 2026](${siteUrl}/talent) — Remote work trends.`,
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
    '## Complete Profile Directory',
    '',
  ];

  // ── ALL valid profiles (paginated) ──
  let from = 0;
  const PAGE = 1000;
  let done = false;
  while (!done) {
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('username, full_name, about, skills, experience, education')
      .not('username', 'is', null)
      .order('updated_at', { ascending: false })
      .range(from, from + PAGE - 1);
    if (!data || !data.length) break;
    for (const p of data) {
      if (!p.username || p.username.length < 3) continue;
      if (isDisposableProfileSlug(p.username)) continue;
      const hasRealName = p.full_name && p.full_name !== 'Your Name' && p.full_name.length > 1;
      const hasContent =
        (p.about && p.about.length > 10) ||
        (Array.isArray(p.skills) && p.skills.length > 0) ||
        (Array.isArray(p.experience) && p.experience.length > 0) ||
        (Array.isArray(p.education) && p.education.length > 0);
      if (!hasRealName || !hasContent) continue;

      const name = p.full_name || 'Professional';
      const skills =
        Array.isArray(p.skills) && p.skills.length > 0 ? p.skills.slice(0, 10).join(', ') : null;
      const summary = p.about ? p.about.replace(/\n/g, ' ').trim().slice(0, 250) : null;
      const expCount = Array.isArray(p.experience) ? p.experience.length : 0;
      const eduCount = Array.isArray(p.education) ? p.education.length : 0;

      let description = name;
      if (summary) description += ` — ${summary}`;
      const bits: string[] = [];
      if (skills) bits.push(`Skills: ${skills}`);
      if (expCount) bits.push(`${expCount} role${expCount === 1 ? '' : 's'}`);
      if (eduCount) bits.push(`${eduCount} education entr${eduCount === 1 ? 'y' : 'ies'}`);
      if (bits.length) description += ` (${bits.join('; ')})`;

      lines.push(`- [${name}](${siteUrl}/${p.username}): ${description}`);
    }
    from += PAGE;
    if ((data?.length || 0) < PAGE) done = true;
  }

  lines.push('');
  lines.push('## Complete Company Directory');
  lines.push('');
  lines.push('> Every hiring company with open roles, each with a dedicated career page.');
  lines.push('');

  let coffset = 0;
  const CPAGE = 1000;
  let cdone = false;
  while (!cdone) {
    const { data: companies } = await supabaseAdmin
      .from('companies')
      .select('slug, name, role_count')
      .gt('role_count', 0)
      .order('role_count', { ascending: false })
      .range(coffset, coffset + CPAGE - 1);
    if (!companies || !companies.length) break;
    for (const c of companies) {
      const raw = String(c.name || '').trim();
      if (!raw || raw.length <= 2 || isJunkCompanyName(raw)) continue;
      const canonical = canonicalizeCompanyName(raw);
      const slug = toCompanySlug(canonical || raw);
      if (!slug || slug.length < 2) continue;
      lines.push(
        `- [${canonical || raw}](${siteUrl}/${slug}): ${c.role_count} open role${c.role_count === 1 ? '' : 's'}`
      );
    }
    coffset += CPAGE;
    if ((companies?.length || 0) < CPAGE) cdone = true;
  }

  lines.push('');
  lines.push('## Complete Curated Job Directory');
  lines.push('');
  lines.push(
    `> Curated job postings (${MAX_JOBS.toLocaleString()} most recent) with pretty public URLs.`
  );
  lines.push('');

  // ── Curated jobs (paginated, capped for worker limits) ──
  let jfrom = 0;
  let jdone = false;
  let jcount = 0;
  while (!jdone && jcount < MAX_JOBS) {
    const { data: jobs } = await supabaseAdmin
      .from('jobs')
      .select('id, company, external_id, slug, title, created_at, published_at')
      .contains('tags', ['curated-jd'])
      .order('created_at', { ascending: false })
      .range(jfrom, jfrom + PAGE - 1);
    if (!jobs || !jobs.length) break;
    for (const j of jobs) {
      const path = jobSitemapPath(j);
      if (!path) continue;
      lines.push(
        `- ${String(j.title || 'Role').slice(0, 90)} — ${String(j.company || '').slice(0, 50)}: ${siteUrl}${path}`
      );
      jcount++;
      if (jcount >= MAX_JOBS) break;
    }
    jfrom += PAGE;
    if ((jobs?.length || 0) < PAGE) jdone = true;
  }

  lines.push('');
  lines.push('## Last Updated');
  lines.push('');
  lines.push(`${new Date().toISOString()}`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400',
    },
  });
}
