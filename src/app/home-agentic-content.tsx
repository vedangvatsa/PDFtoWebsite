import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

/**
 * Server-rendered product summary for AI agents and no-JS crawlers.
 * Ships in the initial HTML response so agents that never execute
 * JavaScript still get a meaningful description of CVin.Bio, its
 * key surfaces, and machine-readable resources.
 */
export default function AgenticContent() {
  return (
    <section aria-label="About CVin.Bio" className="w-full max-w-3xl mx-auto px-4 pb-10 text-sm text-muted-foreground space-y-4">
      <h2 className="text-base font-semibold text-foreground">What is CVin.Bio?</h2>
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
      <h2 className="sr-only">Explore CVin.Bio</h2>
      <h3 className="sr-only">Key pages</h3>
      <p>
        Key pages:{' '}
        <Link href="/jobs" className="underline underline-offset-2 hover:text-foreground">job board</Link>,{' '}
        <Link href="/companies" className="underline underline-offset-2 hover:text-foreground">hiring companies</Link>,{' '}
        <Link href="/fellowships" className="underline underline-offset-2 hover:text-foreground">fellowships</Link>,{' '}
        <Link href="/about" className="underline underline-offset-2 hover:text-foreground">about</Link>, and{' '}
        <Link href="/contact" className="underline underline-offset-2 hover:text-foreground">contact</Link>.
      </p>
      <p>
        For AI agents and developers:{' '}
        <a href={`${siteUrl}/docs`} className="underline underline-offset-2 hover:text-foreground">developer docs</a>,{' '}
        <a href={`${siteUrl}/openapi.json`} className="underline underline-offset-2 hover:text-foreground">OpenAPI spec</a>,{' '}
        <a href={`${siteUrl}/llms.txt`} className="underline underline-offset-2 hover:text-foreground">llms.txt</a>,{' '}
        <a href={`${siteUrl}/agent.txt`} className="underline underline-offset-2 hover:text-foreground">agent instructions</a>, and an{' '}
        <a href={`${siteUrl}/.well-known/mcp.json`} className="underline underline-offset-2 hover:text-foreground">MCP server manifest</a>{' '}
        (Streamable HTTP endpoint at <code>{siteUrl}/mcp</code>).
      </p>
    </section>
  );
}
