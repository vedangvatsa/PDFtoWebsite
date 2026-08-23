import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

/**
 * Server-rendered summary for AI agents and search crawlers.
 * Visually hidden (sr-only) so there is 0 impact on UI for human visitors,
 * while remaining 100% present in initial HTML for AI discovery.
 */
export default function AgenticContent() {
  return (
    <section aria-label="About CVin.Bio" className="sr-only">
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
      <h2>Explore CVin.Bio</h2>
      <h3>Key pages</h3>
      <p>
        Key pages:{' '}
        <Link href="/jobs">job board</Link>,{' '}
        <Link href="/companies">hiring companies</Link>,{' '}
        <Link href="/fellowships">fellowships</Link>,{' '}
        <Link href="/about">about</Link>, and{' '}
        <Link href="/contact">contact</Link>.
      </p>
      <p>
        For AI agents and developers:{' '}
        <a href={`${siteUrl}/docs`}>developer docs</a>,{' '}
        <a href={`${siteUrl}/openapi.json`}>OpenAPI spec</a>,{' '}
        <a href={`${siteUrl}/llms.txt`}>llms.txt</a>,{' '}
        <a href={`${siteUrl}/agent.txt`}>agent instructions</a>, and an{' '}
        <a href={`${siteUrl}/.well-known/mcp.json`}>MCP server manifest</a>{' '}
        (Streamable HTTP endpoint at <code>{siteUrl}/mcp</code>).
      </p>
    </section>
  );
}
