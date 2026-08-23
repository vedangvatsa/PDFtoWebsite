import { supabaseAdmin } from '@/lib/supabase-admin';
import { getPlatformStats } from '@/lib/get-platform-stats';
import { withTimeoutFallback, DB_BUDGET } from '@/lib/db-timeout';
import { jobSitemapPath } from '@/lib/job-description';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

type JsonSchema = Record<string, unknown>;

export interface McpTool {
  name: string;
  description: string;
  inputSchema: JsonSchema;
}

/**
 * Public read-only MCP tools exposed at https://cvin.bio/mcp over
 * Streamable HTTP. Tool listing is intentionally public — job data is
 * already public on the site.
 */
export const MCP_TOOLS: McpTool[] = [
  {
    name: 'search_jobs',
    description:
      'Search curated tech jobs on CVin.Bio by keyword, company name, or location. Returns up to 20 matching listings with title, company, location, and profile URL.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: "Search term — a skill ('React'), company ('Stripe'), location ('remote'), or role title.",
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 20,
          default: 10,
          description: 'Maximum results to return.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_job',
    description:
      'Get one curated tech job listing from CVin.Bio by its id. Returns title, company, location, salary when listed, and the canonical cvin.bio URL.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Job UUID (from search_jobs results).' },
      },
      required: ['id'],
    },
  },
  {
    name: 'platform_stats',
    description: 'Live counts of curated jobs, hiring companies, and public candidate profiles on CVin.Bio.',
    inputSchema: { type: 'object', properties: {}, required: [], additionalProperties: false },
  },
];

function jobTextLine(j: { title: string | null; company: string | null; location: string | null; slug: string | null; external_id: string | null }): string | null {
  const path = jobSitemapPath({
    company: String(j.company || ''),
    external_id: j.external_id,
    slug: j.slug,
    title: j.title,
  });
  if (!path) return null;
  const loc = j.location ? ` — ${String(j.location).slice(0, 60)}` : '';
  return `- ${String(j.title || 'Role').slice(0, 90)} at ${String(j.company || '').slice(0, 50)}${loc}: ${siteUrl}${path}`;
}

export interface ToolCallResult {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}

/** Dispatch a tools/call invocation against the public database views. */
export async function callTool(name: string, args: Record<string, unknown> | undefined): Promise<ToolCallResult> {
  switch (name) {
    case 'search_jobs': {
      const query = String(args?.query ?? '').trim();
      if (!query) {
        return {
          content: [{ type: 'text', text: 'Error: query is required. Example: {"query": "react", "limit": 5}' }],
          isError: true,
        };
      }
      const limit = Math.min(20, Math.max(1, Number(args?.limit) || 10));
      try {
        const res = await withTimeoutFallback(
          supabaseAdmin
            .from('jobs')
            .select('title, company, location, slug, external_id')
            .contains('tags', ['curated-jd'])
            .or(`title.ilike.%${query.replace(/[%_,]/g, '')}%,company.ilike.%${query.replace(/[%_,]/g, '')}%`)
            .order('created_at', { ascending: false })
            .limit(limit * 3),
          DB_BUDGET.list,
          { data: [] as never[] } as any,
          'mcp-search-jobs'
        );
        const rows = (res.data || []) as never[];
        const seen = new Set<string>();
        const lines: string[] = [];
        for (const row of rows) {
          const line = jobTextLine(row);
          if (!line || seen.has(line)) continue;
          seen.add(line);
          lines.push(line);
          if (lines.length >= limit) break;
        }
        if (!lines.length) {
          return { content: [{ type: 'text', text: `No curated jobs matched "${query}". Try a broader skill, company, or location.` }] };
        }
        return {
          content: [{ type: 'text', text: `Found ${lines.length} curated job(s) matching "${query}":\n\n${lines.join('\n')}\n\nBrowse all listings at ${siteUrl}/jobs` }],
        };
      } catch {
        return {
          content: [{ type: 'text', text: 'Job search is temporarily unavailable. Try again shortly or browse https://cvin.bio/jobs.' }],
          isError: true,
        };
      }
    }
    case 'get_job': {
      const id = String(args?.id ?? '').trim();
      if (!id) {
        return { content: [{ type: 'text', text: 'Error: id is required. Get ids from search_jobs first.' }], isError: true };
      }
      try {
        const res = await withTimeoutFallback(
          supabaseAdmin
            .from('jobs')
            .select('title, company, location, salary, job_type, apply_url, slug, external_id, published_at')
            .eq('id', id)
            .maybeSingle(),
          DB_BUDGET.fast,
          { data: null as never } as any,
          'mcp-get-job'
        );
        const job = res.data as never as
          | { title: string | null; company: string | null; location: string | null; salary: string | null; job_type: string | null; apply_url: string | null; slug: string | null; external_id: string | null; published_at: string | null }
          | null;
        if (!job) {
          return { content: [{ type: 'text', text: `No job found with id "${id}". Use search_jobs to find valid ids.` }] };
        }
        const path = jobSitemapPath({ company: String(job.company || ''), external_id: job.external_id, slug: job.slug, title: job.title });
        let text = `## ${job.title || 'Role'}\nCompany: ${job.company || 'Unknown'}\n`;
        if (job.location) text += `Location: ${job.location}\n`;
        if (job.job_type) text += `Type: ${job.job_type}\n`;
        if (job.salary) text += `Salary: ${job.salary}\n`;
        if (job.published_at) text += `Published: ${job.published_at.slice(0, 10)}\n`;
        if (path) text += `Listing: ${siteUrl}${path}\n`;
        if (job.apply_url) text += `Apply: ${job.apply_url}\n`;
        return { content: [{ type: 'text', text }] };
      } catch {
        return { content: [{ type: 'text', text: 'Job lookup is temporarily unavailable. Try again shortly.' }], isError: true };
      }
    }
    case 'platform_stats': {
      const stats = await getPlatformStats();
      return {
        content: [{
          type: 'text',
          text: `CVin.Bio platform stats:\n- Curated tech jobs: ${stats.totalJobs.toLocaleString()}\n- Hiring companies: ${stats.totalCompanies.toLocaleString()}\n- Public profiles: ${stats.totalUsers.toLocaleString()}\n\nJob board: ${siteUrl}/jobs`,
        }],
      };
    }
    default:
      return { content: [{ type: 'text', text: `Unknown tool "${name}". Available tools: ${MCP_TOOLS.map((t) => t.name).join(', ')}.` }], isError: true };
  }
}

export const MCP_SERVER_INFO = { name: 'cvinbio', version: '1.1.0' } as const;

/** Latest MCP protocol version this server speaks. */
export const MCP_PROTOCOL_VERSION = '2025-06-18';
