import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'CVin.Bio Developer Resources — API Docs, OpenAPI Spec & MCP Server',
  description:
    'Public API documentation for CVin.Bio: REST endpoints for curated tech jobs, news, and profiles; OpenAPI 3.1 spec; MCP server over Streamable HTTP; rate-limit conventions.',
  alternates: { canonical: `${siteUrl}/docs` },
};

const ENDPOINTS: { method: string; path: string; desc: string; opId: string }[] = [
  { method: 'GET', path: '/api/jobs?page=1&limit=20&q=&type=&loc=remote', desc: 'Paginated feed of curated tech jobs. Returns { jobs[], total, page, limit, hasMore }. Optional Supabase bearer auth personalizes match scores.', opId: 'listJobs' },
  { method: 'GET', path: '/api/jobs/{id}', desc: 'Full detail for one public job, including sanitized description HTML when published.', opId: 'getJob' },
  { method: 'GET', path: '/api/news?limit=10', desc: 'Recent aggregated items from tier-1 tech news sources (Hacker News, TechCrunch, The Verge, Ars Technica…).', opId: 'listTechNews' },
  { method: 'GET', path: '/api/profile/{username}', desc: 'Flattened public candidate profile for a cvin.bio username slug.', opId: 'getPublicProfile' },
  { method: 'POST', path: '/api/contact', desc: 'Submit a support/partnership message. JSON body: { email, purpose, message }. Rate limited to 5/hour per IP.', opId: 'submitContactMessage' },
];

const TOOLS: { name: string; desc: string }[] = [
  { name: 'search_jobs', desc: 'Search curated tech jobs by keyword, company, or location.' },
  { name: 'get_job', desc: 'Fetch one job listing with full description and apply link.' },
  { name: 'platform_stats', desc: 'Live counts of jobs, companies, and public profiles on CVin.Bio.' },
];

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1 mx-auto w-full max-w-2xl px-4 py-12 space-y-8 text-sm text-muted-foreground">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">CVin.Bio API Documentation</h1>
          <p>
            CVin.Bio exposes a small public, read-mostly API so developers and AI agents can query live
            curated tech jobs, aggregated tech news, and public candidate profiles. No authentication is
            required for read endpoints.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Machine-readable resources</h2>
          <ul className="space-y-1.5">
            <li><a href={`${siteUrl}/openapi.json`} className="underline underline-offset-2 hover:text-foreground font-mono text-xs">GET /openapi.json</a> — OpenAPI 3.1 specification of every endpoint below.</li>
            <li><a href={`${siteUrl}/.well-known/mcp.json`} className="underline underline-offset-2 hover:text-foreground font-mono text-xs">GET /.well-known/mcp.json</a> — MCP server manifest.</li>
            <li><a href={`${siteUrl}/mcp`} className="underline underline-offset-2 hover:text-foreground font-mono text-xs">POST /mcp</a> — MCP server over Streamable HTTP (JSON-RPC 2.0: initialize, tools/list, tools/call). No auth for read-only tools.</li>
            <li><a href={`${siteUrl}/llms.txt`} className="underline underline-offset-2 hover:text-foreground font-mono text-xs">GET /llms.txt</a> · <a href={`${siteUrl}/llms-full.txt`} className="underline underline-offset-2 hover:text-foreground font-mono text-xs">/llms-full.txt</a> — structured context for AI systems.</li>
            <li><a href={`${siteUrl}/agent.txt`} className="underline underline-offset-2 hover:text-foreground font-mono text-xs">GET /agent.txt</a> — agent instructions incl. when-to-use guidance.</li>
            <li><a href={`${siteUrl}/sitemap.xml`} className="underline underline-offset-2 hover:text-foreground font-mono text-xs">GET /sitemap.xml</a> — indexable URLs; <a href={`${siteUrl}/rss.xml`} className="underline underline-offset-2 hover:text-foreground font-mono text-xs">/rss.xml</a> — blog feed.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">REST endpoints</h2>
          <ul className="space-y-4">
            {ENDPOINTS.map((e) => (
              <li key={e.opId} className="space-y-1">
                <p className="font-mono text-xs text-foreground break-all">
                  <span className="font-bold">{e.method}</span> {e.path}
                </p>
                <p>{e.desc}</p>
                <p className="text-[11px] text-muted-foreground/70">operationId: <code>{e.opId}</code></p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">MCP tools</h2>
          <p>
            The same data is available to AI agents via the Model Context Protocol at{' '}
            <code className="font-mono text-xs">{siteUrl}/mcp</code>. Point any MCP client (Claude,
            ChatGPT, Cursor) at the Streamable HTTP endpoint — tool listing is public.
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            {TOOLS.map((t) => (
              <li key={t.name}><code className="font-mono text-xs">{t.name}</code> — {t.desc}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Rate limits</h2>
          <p>
            API responses carry standard rate-limit headers:{' '}
            <code className="font-mono text-xs">RateLimit-Limit</code>,{' '}
            <code className="font-mono text-xs">RateLimit-Remaining</code>,{' '}
            <code className="font-mono text-xs">RateLimit-Reset</code> (RFC 9331 draft) plus the legacy{' '}
            <code className="font-mono text-xs">X-RateLimit-*</code> set. Read endpoints allow 300
            requests/minute per IP; contact submissions are limited to 5/hour per IP. On HTTP 429, honor
            the <code className="font-mono text-xs">Retry-After</code> header before retrying.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Errors</h2>
          <p>
            All API errors return JSON — never HTML pages — shaped as{' '}
            <code className="font-mono text-xs">{`{ error, code?, hint? }`}</code>. Unknown /api/* paths
            return a JSON 404 pointing back to this document and the{' '}
            <Link href="/docs" className="underline underline-offset-2 hover:text-foreground">OpenAPI spec</Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Support</h2>
          <p>
            Questions about the API? Email hi@cvin.bio or use the{' '}
            <Link href="/contact" className="underline underline-offset-2 hover:text-foreground">contact page</Link>.
          </p>
        </section>
      </main>
      <MicroFooter />
    </div>
  );
}
