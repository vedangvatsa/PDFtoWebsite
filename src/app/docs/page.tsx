import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'CVin.Bio Developer Resources — API Docs, OpenAPI Spec, MCP Server & Webhooks',
  description:
    'Official developer documentation for CVin.Bio: REST API endpoints for curated tech jobs, news, and profiles; OpenAPI 3.1 spec; MCP server over Streamable HTTP; webhooks; auth metadata.',
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">CVin.Bio Developer Resources &amp; API Documentation</h1>
          <p>
            CVin.Bio exposes a public, read-mostly API and Model Context Protocol (MCP) server so developers
            and AI agents can query live curated tech jobs, aggregated tech news, and public candidate profiles.
            No authentication is required for public read endpoints.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">CVin.Bio Machine-Readable Specifications</h2>
          <ul className="space-y-1.5">
            <li><a href={`${siteUrl}/openapi.json`} className="underline underline-offset-2 hover:text-foreground font-mono text-xs">GET /openapi.json</a> — CVin.Bio OpenAPI 3.1 specification.</li>
            <li><a href={`${siteUrl}/.well-known/mcp.json`} className="underline underline-offset-2 hover:text-foreground font-mono text-xs">GET /.well-known/mcp.json</a> — CVin.Bio MCP server manifest.</li>
            <li><a href={`${siteUrl}/mcp`} className="underline underline-offset-2 hover:text-foreground font-mono text-xs">POST /mcp</a> — CVin.Bio MCP server over Streamable HTTP (JSON-RPC 2.0: initialize, tools/list, tools/call).</li>
            <li><a href={`${siteUrl}/.well-known/oauth-authorization-server`} className="underline underline-offset-2 hover:text-foreground font-mono text-xs">GET /.well-known/oauth-authorization-server</a> — RFC 8414 Authorization Server Metadata.</li>
            <li><a href={`${siteUrl}/.well-known/oauth-protected-resource`} className="underline underline-offset-2 hover:text-foreground font-mono text-xs">GET /.well-known/oauth-protected-resource</a> — RFC 9728 Protected Resource Metadata.</li>
            <li><a href={`${siteUrl}/llms.txt`} className="underline underline-offset-2 hover:text-foreground font-mono text-xs">GET /llms.txt</a> · <a href={`${siteUrl}/llms-full.txt`} className="underline underline-offset-2 hover:text-foreground font-mono text-xs">/llms-full.txt</a> — CVin.Bio LLMs directory and context index.</li>
            <li><a href={`${siteUrl}/agent.txt`} className="underline underline-offset-2 hover:text-foreground font-mono text-xs">GET /agent.txt</a> — CVin.Bio agent instructions and when-to-use guidance.</li>
            <li><a href={`${siteUrl}/sitemap.xml`} className="underline underline-offset-2 hover:text-foreground font-mono text-xs">GET /sitemap.xml</a> — sitemap; <a href={`${siteUrl}/rss.xml`} className="underline underline-offset-2 hover:text-foreground font-mono text-xs">/rss.xml</a> — RSS feed.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">CVin.Bio REST API Endpoints</h2>
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
          <h2 className="text-lg font-semibold text-foreground">CVin.Bio MCP Tools</h2>
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

        <section id="webhooks" className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">CVin.Bio Webhooks &amp; Event Notifications</h2>
          <p>
            CVin.Bio provides real-time job updates and profile indexing events via polling feeds and webhooks:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 font-mono text-xs">
            <li><code>GET /rss.xml</code> — RSS 2.0 feed of new technology jobs and platform news</li>
            <li><code>GET /api/jobs?sort=latest</code> — polling feed for new job listings</li>
            <li><code>POST /api/contact</code> — partner webhook registration requests (email hi@cvin.bio)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">CVin.Bio Rate Limits</h2>
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
          <h2 className="text-lg font-semibold text-foreground">CVin.Bio Errors</h2>
          <p>
            All API errors return JSON — never HTML pages — shaped as{' '}
            <code className="font-mono text-xs">{`{ error, code?, hint? }`}</code>. Unknown /api/* paths
            return a JSON 404 pointing back to this document and the{' '}
            <Link href="/docs" className="underline underline-offset-2 hover:text-foreground">OpenAPI spec</Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">API Versioning &amp; Deprecation Policy</h2>
          <p>
            CVin.Bio APIs use URL-path major versioning (current stable: <code>/api/*</code> alias of <code>/v1/api/*</code>).
            When an endpoint or version is scheduled for deprecation, CVin.Bio guarantees a minimum 180-day notice period
            and signals deprecation on every affected response via standard HTTP headers:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 font-mono text-xs">
            <li><code>Deprecation: @&lt;unix-timestamp&gt;</code> — RFC 9261 deprecation header</li>
            <li><code>Sunset: &lt;HTTP-date&gt;</code> — RFC 8594 sunset date header</li>
            <li><code>Link: &lt;url&gt;; rel="deprecation"</code> — link to migration documentation</li>
          </ul>
          <p className="text-xs">
            Breaking changes are never introduced within a major version. Non-breaking additive changes may be introduced at any time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Developer Support</h2>
          <p>
            Questions about the API or developer integrations? Email hi@cvin.bio or use the{' '}
            <Link href="/contact" className="underline underline-offset-2 hover:text-foreground">contact page</Link>.
          </p>
        </section>
      </main>
      <MicroFooter />
    </div>
  );
}
