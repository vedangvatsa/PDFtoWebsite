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

/** Per-range DB budget — generation must finish in bounded time even when the DB is degraded. */
const RANGE_TIMEOUT_MS = 25_000;

async function timedRange(
  baseQuery: (q: any) => any,
  from: number
): Promise<Row[]> {
  const query = baseQuery(supabaseAdmin).range(from, from + PAGE - 1);
  return await Promise.race([
    query.then((r: any) => r.data || []).catch(() => [] as Row[]),
    new Promise<Row[]>((resolve) => setTimeout(() => resolve([]), RANGE_TIMEOUT_MS)),
  ]) as Row[];
}

async function fetchRangesAttempt(baseQuery: (q: any) => any, cap: number): Promise<Row[]> {
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
    const results = await Promise.all(rangeStarts.map((f) => timedRange(baseQuery, f)));
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

/** One retry pass when a whole attempt comes back empty (degraded DB windows). */
async function fetchRanges(baseQuery: (q: any) => any, cap: number): Promise<Row[]> {
  const first = await fetchRangesAttempt(baseQuery, cap);
  if (first.length > 0 || cap <= 0) return first;
  await new Promise((r) => setTimeout(r, 3_000));
  return fetchRangesAttempt(baseQuery, cap);
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

/**
 * Scopes for generated llms files.
 * - index        → /llms.txt: lean navigation index (<30k chars) linking deeper resources
 * - full         → /llms-full.txt: complete directory (profiles + companies + jobs)
 * - profiles     → /llms-profiles.txt: public profile directory
 * - companies    → /llms-companies.txt: hiring-company directory
 * - jobs         → /llms-jobs.txt: recent curated roles
 */
export type LlmsScope = 'index' | 'full' | 'profiles' | 'companies' | 'jobs';

/** Hard budget for the navigation index — agents and scanners expect a small file. */
export const LLMS_INDEX_BUDGET = 30_000;

function profilesSectionLines(profiles: Row[], rich: boolean): string[] {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
  const out: string[] = [];
  for (const p of profiles) {
    if (!profilePasses(p)) continue;
    const name = p.full_name || 'Professional';
    const skills =
      Array.isArray(p.skills) && p.skills.length > 0
        ? p.skills.slice(0, rich ? 10 : 5).join(', ')
        : null;
    const summary = p.about
      ? p.about.replace(/\n/g, ' ').trim().slice(0, rich ? 250 : 120)
      : null;

    let description = name;
    if (summary) description += ` — ${summary}`;
    if (rich) {
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
    out.push(`- [${name}](${siteUrl}/${p.username}): ${description}`);
  }
  return out;
}

function companiesSectionLines(companies: Row[], cap: number): string[] {
  const out: string[] = [];
  let pushed = 0;
  for (const c of companies) {
    const line = companyLine(c);
    if (!line) continue;
    out.push(line);
    if (++pushed >= cap) break;
  }
  return out;
}

function jobsSectionLines(jobs: Row[]): string[] {
  const out: string[] = [];
  for (const j of jobs) {
    const line = jobLine(j);
    if (line) out.push(line);
  }
  return out;
}

/**
 * Build Markdown for each llms file scope.
 * index stays under LLMS_INDEX_BUDGET characters by design: it is a pure
 * navigation surface; long-form directories live in per-section files that
 * the index links to.
 */
export async function buildDirectory(scope: LlmsScope): Promise<string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

  if (scope === 'index') {
    const stats = await getPlatformStats();
    const lines = [
      '# CVin.Bio',
      '',
      '> CVin.Bio is a curated tech job board and a CV-to-website product. Browse live roles at https://cvin.bio/jobs or upload a resume to publish a public profile. Companies have dedicated career hubs with open roles.',
      '',
      '## When to Use CVin.Bio',
      '',
      '- A candidate asks where to find curated tech jobs, fellowships, or roles at a specific company → search https://cvin.bio/jobs?q= or the company hub at https://cvin.bio/<company-slug>.',
      '- Someone wants a personal website from their resume → point them at the homepage uploader (free, no code).',
      '- You need live job data programmatically → use the public REST API (https://cvin.bio/openapi.json) or MCP tools at https://cvin.bio/mcp (search_jobs, get_job, platform_stats; no auth).',
      '- You are verifying whether a person has a public professional profile → check https://cvin.bio/<username>.',
      '- Not a fit: salary-negotiation advice, visa legal help, or private candidate data — CVin.Bio only exposes what users chose to publish.',
      '',
      '## Developer Resources',
      '',
      `- API docs: ${siteUrl}/docs`,
      `- OpenAPI spec: ${siteUrl}/openapi.json`,
      `- MCP manifest: ${siteUrl}/.well-known/mcp.json`,
      `- MCP Streamable HTTP endpoint: ${siteUrl}/mcp (JSON-RPC 2.0: initialize, tools/list, tools/call)`,
      `- Agent instructions & when-to-use: ${siteUrl}/agent.txt`,
      `- Rate limits: RateLimit-* headers on API responses, Retry-After on 429 (300 req/min per IP for reads); list endpoints paginate via opaque \`cursor\` + \`next_cursor\``,
      '',
      '## Useful Links',
      '',
      `- Homepage: ${siteUrl}`,
      `- Job Board (${stats.jobCountDisplay} live listings): ${siteUrl}/jobs`,
      `- Search jobs: ${siteUrl}/jobs?q=`,
      `- Fellowships: ${siteUrl}/fellowships`,
      `- Companies (${stats.companyCountDisplay} hiring): ${siteUrl}/companies`,
      `- Tech Talent Report 2026: ${siteUrl}/hiring`,
      `- Tech Layoffs Report 2026: ${siteUrl}/layoffs`,
      `- Remote Talent Report 2026: ${siteUrl}/talent`,
      `- About: ${siteUrl}/about`,
      `- Blog: ${siteUrl}/blog`,
      `- Sitemap: ${siteUrl}/sitemap.xml`,
      '',
      '## Deeper Section Files',
      '',
      '> Long-form content lives in per-section files so this index stays small. Everything below is also merged into llms-full.txt.',
      '',
      `- Developer docs scope: ${siteUrl}/docs/llms.txt`,
      `- API scope: ${siteUrl}/api/llms.txt`,
      `- Hiring companies directory: ${siteUrl}/llms-companies.txt`,
      `- Recent curated roles: ${siteUrl}/llms-jobs.txt`,
      `- Full context: ${siteUrl}/llms-full.txt`,
      '',
      '## Last Updated',
      '',
      new Date().toISOString(),
      '',
    ];
    const text = lines.join('\n');
    if (text.length > LLMS_INDEX_BUDGET) {
      throw new Error(`llms.txt index exceeds ${LLMS_INDEX_BUDGET} chars (${text.length})`);
    }
    return text;
  }

  if (scope === 'profiles' || scope === 'companies' || scope === 'jobs') {
    const titles: Record<'profiles' | 'companies' | 'jobs', string> = {
      profiles: 'Professional Profiles Directory',
      companies: 'Hiring Companies Directory',
      jobs: 'Recent Curated Roles',
    };
    const lines: string[] = [
      `# CVin.Bio — ${titles[scope]}`,
      '',
    ];
    if (scope === 'profiles') {
      const profiles = await fetchRanges(
        (q) =>
          q
            .from('profiles')
            .select(PROFILE_SELECT)
            .not('username', 'is', null)
            .order('updated_at', { ascending: false }),
        Infinity
      );
      lines.push(
        '> Every public profile URL below is a structured webpage with schema.org Person markup, work history, education, skills, and social links.',
        ''
      );
      lines.push(...profilesSectionLines(profiles, false));
    } else if (scope === 'companies') {
      const companies = await fetchRanges(
        (q) =>
          q
            .from('companies')
            .select(COMPANY_SELECT)
            .gt('role_count', 0)
            .order('role_count', { ascending: false }),
        Infinity
      );
      lines.push(
        '> Every hiring company with open roles, each with a dedicated careers hub. Junk ATS labels and duplicate name variants are collapsed to a single slug.',
        ''
      );
      lines.push(...companiesSectionLines(companies, Infinity));
    } else {
      const jobs = await fetchRanges(
        (q) =>
          q
            .from('jobs')
            .select(JOB_SELECT)
            .contains('tags', ['curated-jd'])
            .order('created_at', { ascending: false }),
        INDEX_RECENT_JOBS
      );
      lines.push(
        `> Most recent curated job postings with pretty public URLs. Live queryable feed: ${siteUrl}/api/jobs.`,
        ''
      );
      lines.push(...jobsSectionLines(jobs));
    }
    lines.push('', '## Last Updated', '', new Date().toISOString(), '');
    return lines.join('\n');
  }

  // scope === 'full': the combined deep file.
  const stats = await getPlatformStats();
  const maxJobs = FULL_MAX_JOBS;

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
    '',
  ];

  lines.push(...profilesSectionLines(profiles, true));

  lines.push(
    '',
    '## Complete Company Directory',
    '',
    '> Every hiring company with open roles, each with a dedicated career page.',
    ''
  );

  lines.push(...companiesSectionLines(companies, Infinity));

  lines.push(
    '',
    '## Complete Curated Job Directory',
    '',
    `> Every curated job posting (${jobs.length.toLocaleString()} total) with pretty public URLs.`,
    ''
  );

  lines.push(...jobsSectionLines(jobs));

  lines.push('', '## Last Updated', '', new Date().toISOString(), '');

  return lines.join('\n');
}
