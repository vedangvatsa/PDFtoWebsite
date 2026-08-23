import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

/**
 * Server-rendered product summary and developer resource index for AI agents and search crawlers.
 * Visually hidden (sr-only) so there is 0 impact on UI for human visitors,
 * while remaining 100% discoverable in initial HTML for AI agents and search crawlers.
 */
export default function AgenticContent() {
  return (
    <section aria-label="About CVin.Bio and Developer Resources" className="sr-only">
      <h2>What is CVin.Bio?</h2>
      <p>
        CVin.Bio turns your CV into a professional personal website. Upload a PDF or Word resume
        and AI extracts your work history, education, and skills to build a shareable profile page
        at cvin.bio/yourname — free, in seconds, no coding required.
      </p>
      <p>
        CVin.Bio is also a curated tech job board with {`100k+`} live roles at companies like
        OpenAI, Anthropic, Stripe, Cloudflare, and thousands more. Every public profile is matched
        against open roles by skills and location, so candidates see relevant jobs first.
        Companies get dedicated career hubs listing all of their open positions.
      </p>

      <h2>CVin.Bio Developer Resources &amp; API Documentation</h2>
      <p>
        Developers and AI agents can access CVin.Bio programmatically via our public REST API,
        OpenAPI 3.1 specification, and Model Context Protocol (MCP) server:
      </p>
      <ul>
        <li>
          <a href={`${siteUrl}/docs`}>CVin.Bio Developer Resources &amp; API Documentation</a> — full guide to endpoints, rate limits, and authentication.
        </li>
        <li>
          <a href={`${siteUrl}/openapi.json`}>CVin.Bio OpenAPI Specification</a> — machine-readable OpenAPI 3.1 schema.
        </li>
        <li>
          <a href={`${siteUrl}/.well-known/mcp.json`}>CVin.Bio MCP Server Manifest</a> — Model Context Protocol manifest for AI runtimes.
        </li>
        <li>
          <a href={`${siteUrl}/mcp`}>CVin.Bio MCP Streamable HTTP Endpoint</a> — JSON-RPC 2.0 endpoint for ChatGPT, Claude, and AI agent execution.
        </li>
        <li>
          <a href={`${siteUrl}/llms.txt`}>CVin.Bio llms.txt Directory</a> and <a href={`${siteUrl}/agent.txt`}>Agent Instructions</a> — structured context and when-to-use guidance.
        </li>
      </ul>

      <h2>Explore CVin.Bio Key Surfaces</h2>
      <p>
        Key pages:{' '}
        <Link href="/jobs">job board</Link>,{' '}
        <Link href="/companies">hiring companies</Link>,{' '}
        <Link href="/fellowships">fellowships</Link>,{' '}
        <Link href="/about">about</Link>, and{' '}
        <Link href="/contact">contact</Link>.
      </p>
    </section>
  );
}
