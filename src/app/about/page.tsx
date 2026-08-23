import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'About CVin.Bio',
  description:
    'CVin.Bio turns PDF CVs into professional personal websites and runs a curated tech job board with 100k+ live roles. Free to use, updated daily.',
  alternates: { canonical: `${siteUrl}/about` },
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1 mx-auto w-full max-w-2xl px-4 py-12 space-y-6 text-sm text-muted-foreground">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">About CVin.Bio</h1>
          <p>
            CVin.Bio is a free product that converts your CV into a professional personal website and
            matches you with curated tech jobs. It exists because great people lose opportunities when
            their resume is hard to read and even harder to find.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">What we do</h2>
          <p>
            Upload a resume in any common format — PDF, Word, plain text, or an image — and AI extracts
            your work history, education, skills, and links to build a shareable profile page at{' '}
            cvin.bio/yourname in seconds. No templates to fight, no hosting to configure.
          </p>
          <p>
            The same platform operates a curated tech job board at{' '}
            <Link href="/jobs" className="underline underline-offset-2 hover:text-foreground">cvin.bio/jobs</Link>{' '}
            with over 100k live roles at companies including OpenAI, Anthropic, Stripe, Cloudflare, and
            thousands more. Listings are deduplicated across sources, junk-filtered, and refreshed daily.
            Every public profile is scored against open roles so candidates see the most relevant jobs first,
            and every hiring company gets a dedicated careers hub aggregating all of its open positions.
          </p>
          <p>
            We also publish original research on the tech labor market: the Tech Talent Report (
            <Link href="/hiring" className="underline underline-offset-2 hover:text-foreground">/hiring</Link>), the Tech Layoffs Report (
            <Link href="/layoffs" className="underline underline-offset-2 hover:text-foreground">/layoffs</Link>), and the Remote Talent Report (
            <Link href="/talent" className="underline underline-offset-2 hover:text-foreground">/talent</Link>).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Principles</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Free for candidates. Your profile and job matching cost nothing.</li>
            <li>You control visibility: publish publicly or keep your profile private.</li>
            <li>We do not sell personal data. See our{' '}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">privacy policy</Link>.
            </li>
            <li>Job listings link to real application sources — no gated reposts.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">For AI agents and developers</h2>
          <p>
            CVin.Bio exposes a public read-only API documented at{' '}
            <a href={`${siteUrl}/openapi.json`} className="underline underline-offset-2 hover:text-foreground">cvin.bio/openapi.json</a>,
            developer guides at{' '}
            <Link href="/docs" className="underline underline-offset-2 hover:text-foreground">cvin.bio/docs</Link>, agent instructions at{' '}
            <a href={`${siteUrl}/agent.txt`} className="underline underline-offset-2 hover:text-foreground">cvin.bio/agent.txt</a>, and an MCP server
            at cvin.bio/mcp. Reach us any time at hi@cvin.bio or via the{' '}
            <Link href="/contact" className="underline underline-offset-2 hover:text-foreground">contact page</Link>.
          </p>
        </section>
      </main>
      <MicroFooter />
    </div>
  );
}
