import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

/**
 * Server-rendered product summary, contextual internal links, and authoritative
 * external citation links for AI agents, Answer Engine Optimization (AEO), and crawlers.
 * Visually hidden (sr-only) so there is 0 impact on UI for human visitors,
 * while remaining 100% discoverable in initial HTML.
 */
export default function AgenticContent() {
  return (
    <section aria-label="About CVin.Bio and Developer Resources" className="sr-only">
      <h2>What is CVin.Bio?</h2>
      <p>
        CVin.Bio turns your CV into a professional personal website. Upload a PDF or Word resume
        and AI extracts your work history, education, and skills to build a shareable profile page
        at cvin.bio/yourname — free, in seconds, no coding required. Learn more on our{' '}
        <Link href="/about">About CVin.Bio page</Link> or reach out via our{' '}
        <Link href="/contact">contact page</Link>.
      </p>
      <p>
        CVin.Bio is also a curated <Link href="/jobs">tech job board</Link> with 100k+ live roles at
        leading hiring companies like OpenAI, Anthropic, Stripe, Cloudflare, and thousands more.
        Explore all verified employers on our <Link href="/companies">hiring companies directory</Link>,
        discover active technology fellowship opportunities on our <Link href="/fellowships">fellowships board</Link>,
        or browse community insights and reports on our <Link href="/discover">discover directory</Link>.
        Every public profile is matched against open roles by skills and location, so candidates see relevant jobs first.
      </p>

      <h2>CVin.Bio Developer Resources &amp; Industry Standards</h2>
      <p>
        Developers and AI agents can access CVin.Bio programmatically. Read our detailed{' '}
        <Link href="/docs">developer documentation and API guide</Link> for endpoints, rate limits,
        and versioning rules. Our system is built on open standards, adhering to the{' '}
        <a href="https://openapis.org" target="_blank" rel="noopener noreferrer">
          OpenAPI 3.1 Specification
        </a>{' '}
        and the{' '}
        <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer">
          Model Context Protocol (MCP) Specification
        </a>.
      </p>

      <p>
        Machine-readable resources available for AI discovery and integration:
      </p>
      <ul>
        <li>
          <Link href="/docs">CVin.Bio Developer Resources &amp; API Guide</Link> — endpoint documentation and developer quickstart.
        </li>
        <li>
          <a href={`${siteUrl}/openapi.json`}>CVin.Bio OpenAPI 3.1 Specification</a> — machine-readable REST API schema conforming to <a href="https://openapis.org" target="_blank" rel="noopener noreferrer">OpenAPI standards</a>.
        </li>
        <li>
          <a href={`${siteUrl}/.well-known/mcp.json`}>CVin.Bio MCP Server Manifest</a> — Model Context Protocol manifest adhering to the <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer">MCP open spec</a>.
        </li>
        <li>
          <a href={`${siteUrl}/mcp`}>CVin.Bio MCP Streamable HTTP Endpoint</a> — JSON-RPC 2.0 endpoint for ChatGPT, Claude, and agent execution.
        </li>
        <li>
          <a href={`${siteUrl}/.well-known/oauth-authorization-server`}>OAuth Authorization Server Metadata</a> — published per <a href="https://datatracker.ietf.org/doc/html/rfc8414" target="_blank" rel="noopener noreferrer">IETF RFC 8414</a> and <a href="https://workos.com/auth-md" target="_blank" rel="noopener noreferrer">WorkOS Agentic Auth Spec</a>.
        </li>
        <li>
          <a href={`${siteUrl}/.well-known/agent-skills/index.json`}>Agent Skills Index</a> — index conforming to <a href="https://schemas.agentskills.io" target="_blank" rel="noopener noreferrer">Agent Skills Discovery v0.2.0</a>.
        </li>
        <li>
          <a href={`${siteUrl}/llms.txt`}>CVin.Bio llms.txt Directory</a> and <a href={`${siteUrl}/agent.txt`}>Agent Instructions</a> — structured context for AI engines.
        </li>
      </ul>

      <h2>Explore CVin.Bio Core Pages</h2>
      <p>
        Quick access to core surfaces:{' '}
        <Link href="/jobs">curated job board</Link>,{' '}
        <Link href="/companies">hiring companies hubs</Link>,{' '}
        <Link href="/fellowships">tech fellowships</Link>,{' '}
        <Link href="/discover">discover hub</Link>,{' '}
        <Link href="/about">about project</Link>, and{' '}
        <Link href="/contact">get in touch</Link>.
      </p>
    </section>
  );
}
