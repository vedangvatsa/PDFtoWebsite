import { supabaseAdmin } from '@/lib/supabase-admin';
import { getPlatformStats } from '@/lib/get-platform-stats';
import {
  canonicalizeCompanyName,
  toCompanySlug,
  isJunkCompanyName,
} from '@/lib/company-directory';
import { isDisposableProfileSlug } from '@/lib/parse-guard';
import { jobSitemapPath } from '@/lib/job-description';

const PAGE = 1000;
const CONCURRENCY = 8;
const INDEX_RECENT_JOBS = 500;
const FULL_MAX_JOBS = Infinity;

const PROFILE_SELECT = 'username, full_name, about, skills, experience, education';
const COMPANY_SELECT = 'slug, name, role_count';
const JOB_SELECT = 'id, company, external_id, slug, title, created_at, published_at';

type Row = Record<string, any>;

async function fetchRanges(
  baseQuery: (q: any) => any,
  cap: number
): Promise<Row[]> {
  const out: Row[] = [];
  let from = 0;
  for (;;) {
    if (out.length >= cap) break;
    const rangeStarts: number[] = [];
    for (let k = 0; k < CONCURRENCY; k++) {
      const f = from + k * PAGE;
      if (f >= cap) break;
      rangeStarts.push(f);
    }
    if (!rangeStarts.length) break;
    const results = await Promise.all(
      rangeStarts.map((f) =>
        baseQuery(supabaseAdmin)
          .range(f, f + PAGE - 1)
          .then((r: any) => r.data || [])
          .catch(() => [] as Row[])
      )
    );
    let any = false;
    for (const rows of results) {
      if (rows.length) {
        any = true;
        out.push(...rows);
      }
    }
    from += rangeStarts.length * PAGE;
    if (!any) break;
  }
  return out.slice(0, cap);
}

function profilePasses(p: Row): boolean {
  if (!p.username || typeof p.username !== 'string' || p.username.length < 3) return false;
  if (isDisposableProfileSlug(p.username)) return false;
  const hasRealName = p.full_name && p.full_name !== 'Your Name' && p.full_name.length > 1;
  const hasContent =
    (p.about && p.about.length > 10) ||
    (Array.isArray(p.skills) && p.skills.length > 0) ||
    (Array.isArray(p.experience) && p.experience.length > 0) ||
    (Array.isArray(p.education) && p.education.length > 0);
  return !!hasRealName && !!hasContent;
}

function companyLine(c: Row): string | null {
  const raw = String(c.name || '').trim();
  if (!raw || raw.length <= 2 || isJunkCompanyName(raw)) return null;
  const canonical = canonicalizeCompanyName(raw);
  const slug = toCompanySlug(canonical || raw);
  if (!slug || slug.length < 2) return null;
  const roles = Number(c.role_count) || 0;
  return `- [${canonical || raw}](https://cvin.bio/${slug}): ${roles} open role${roles === 1 ? '' : 's'} — careers hub on CVin.Bio.`;
}

function jobLine(j: Row): string | null {
  const path = jobSitemapPath(j as any);
  if (!path) return null;
  return `- ${String(j.title || 'Role').slice(0, 80)} — ${String(j.company || '').slice(0, 40)}: https://cvin.bio${path}`;
}

/** Build the full Markdown for /llms.txt (scope=index) or /llms-full.txt (scope=full). */
export async function buildDirectory(scope: 'index' | 'full'): Promise<string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
  const stats = await getPlatformStats();
  const maxJobs = scope === 'index' ? INDEX_RECENT_JOBS : FULL_MAX_JOBS;

  const [profiles, companies, jobs] = await Promise.all([
    fetchRanges(
      (q) =>
        q
          .from('profiles')
          .select(PROFILE_SELECT)
          .not('username', 'is', null)
          .order('updated_at', { ascending: false }),
      Infinity
    ),
    fetchRanges(
      (q) =>
        q
          .from('companies')
          .select(COMPANY_SELECT)
          .gt('role_count', 0)
          .order('role_count', { ascending: false }),
      Infinity
    ),
    fetchRanges(
      (q) =>
        q
          .from('jobs')
          .select(JOB_SELECT)
          .contains('tags', ['curated-jd'])
          .order('created_at', { ascending: false }),
      maxJobs
    ),
  ]);

  const lines: string[] = [];

  if (scope === 'index') {
    lines.push(
      '# CVin.Bio',
      '',
      '> CVin.Bio is a professional identity and job platform. Users upload a CV and get a structured, public profile at a permanent URL. Companies have dedicated career pages with all open roles.',
      '',
      '## Useful Links',
      '',
      `- Homepage: ${siteUrl}`,
      `- Job Board (${stats.jobCountDisplay} live listings): ${siteUrl}/jobs`,
      `- Fellowships: ${siteUrl}/fellowships`,
      `- Companies (${stats.companyCountDisplay} hiring): ${siteUrl}/companies`,
      `- Tech Talent Report 2026: ${siteUrl}/hiring`,
      `- Tech Layoffs Report 2026: ${siteUrl}/layoffs`,
      `- Remote Talent Report 2026: ${siteUrl}/talent`,
      `- Blog: ${siteUrl}/blog`,
      `- Sitemap: ${siteUrl}/sitemap.xml`,
      `- Full context (complete profile/company/job directory): ${siteUrl}/llms-full.txt`,
      '',
      '## Professional Profiles',
      '',
      '> Every public profile URL below is a structured webpage with schema.org Person markup, work history, education, skills, and social links. Complete directory — regenerated live from the database.',
      ''
    );
  } else {
    lines.push(
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
      '### Core Product: Job Board',
      `The job board at ${siteUrl}/jobs aggregates curated tech job listings from companies. Users get personalized job recommendations based on skill matching. Open fellowships are listed at ${siteUrl}/fellowships.`,
      '',
      '### Research Reports',
      `1. [Tech Talent Report 2026](${siteUrl}/tech-talent-report) — Analysis of job listings across companies.`,
      `2. [Tech Layoffs Report 2026](${siteUrl}/layoffs) — Tech layoffs since 2020.`,
      `3. [Remote Talent Report 2026](${siteUrl}/talent) — Remote work trends.`,
      '',
      `Sitemap: ${siteUrl}/sitemap.xml`,
      '',
      '## Complete Profile Directory',
      ''
    );
  }

  for (const p of profiles) {
    if (!profilePasses(p)) continue;
    const name = p.full_name || 'Professional';
    const skills =
      Array.isArray(p.skills) && p.skills.length > 0
        ? p.skills.slice(0, scope === 'index' ? 5 : 10).join(', ')
        : null;
    const summary = p.about
      ? p.about.replace(/\n/g, ' ').trim().slice(0, scope === 'index' ? 120 : 250)
      : null;

    let description = name;
    if (summary) description += ` — ${summary}`;
    if (scope === 'full') {
      const bits: string[] = [];
      if (skills) bits.push(`Skills: ${skills}`);
      const expCount = Array.isArray(p.experience) ? p.experience.length : 0;
      const eduCount = Array.isArray(p.education) ? p.education.length : 0;
      if (expCount) bits.push(`${expCount} role${expCount === 1 ? '' : 's'}`);
      if (eduCount) bits.push(`${eduCount} education entr${eduCount === 1 ? 'y' : 'ies'}`);
      if (bits.length) description += ` (${bits.join('; ')})`;
    } else if (skills) {
      description += ` — Skills: ${skills}`;
    }
    lines.push(`- [${name}](${siteUrl}/${p.username}): ${description}`);
  }

  lines.push(
    '',
    scope === 'index' ? '## Company Careers' : '## Complete Company Directory',
    '',
    scope === 'index'
      ? '> Complete directory of hiring companies, each with a dedicated career page. Junk ATS labels and duplicate name variants are collapsed to a single slug.'
      : '> Every hiring company with open roles, each with a dedicated career page.',
    ''
  );

  let pushed = 0;
  const companyCap = scope === 'index' ? 5000 : Infinity;
  for (const c of companies) {
    const line = companyLine(c);
    if (!line) continue;
    lines.push(line);
    if (++pushed >= companyCap) break;
  }

  lines.push(
    '',
    scope === 'index' ? '## Recent Open Roles' : '## Complete Curated Job Directory',
    '',
    scope === 'index'
      ? '> Most recent curated job postings (pretty URLs). The full directory is at /llms-full.txt.'
      : `> Every curated job posting (${jobs.length.toLocaleString()} total) with pretty public URLs.`,
    ''
  );

  for (const j of jobs) {
    const line = jobLine(j);
    if (line) lines.push(line);
  }

  lines.push(
    '',
    '## Last Updated',
    '',
    new Date().toISOString(),
    ''
  );

  return lines.join('\n');
}
