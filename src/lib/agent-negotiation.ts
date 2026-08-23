/**
 * Shared helpers for agent-facing content negotiation and machine-facing
 * paths. Imported by src/middleware.ts and the /md/[page] route handler.
 */

/** Machine-facing surfaces never blocked by anti-scraper rules. */
export const AGENT_INFRA_PREFIXES = [
  '/mcp',
  '/md/',
  '/openapi',
  '/agent.txt',
  '/llms',
  '/.well-known',
  '/sitemap',
  '/robots.txt',
  '/rss.xml',
  '/schemap.xml',
  '/auth.md',
  '/docs/llms.txt',
  '/api/llms.txt',
];

/** Markdown page keys served by /md/[page]. */
export type MarkdownPageKey =
  | 'home'
  | 'jobs'
  | 'about'
  | 'contact'
  | 'docs'
  | 'terms'
  | 'privacy'
  | 'companies'
  | 'fellowships'
  | 'discover';

/** Public path → markdown page key served by /md/[page]. */
export const MARKDOWN_PAGES: Record<string, MarkdownPageKey> = {
  '/': 'home',
  '/jobs': 'jobs',
  '/about': 'about',
  '/contact': 'contact',
  '/docs': 'docs',
  '/terms': 'terms',
  '/privacy': 'privacy',
  '/companies': 'companies',
  '/fellowships': 'fellowships',
  '/discover': 'discover',
};

export function isAgentInfraPath(pathname: string): boolean {
  return AGENT_INFRA_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
}

function acceptEntries(accept: string): { type: string; q: number }[] {
  return accept
    .split(',')
    .map((part) => {
      const [type, ...params] = part.trim().split(';');
      let q = 1;
      for (const p of params) {
        const m = p.trim().match(/^q=([\d.]+)$/);
        if (m) q = parseFloat(m[1]);
      }
      return { type: type.trim().toLowerCase(), q };
    })
    .filter((e) => e.type.length > 0);
}

/**
 * True when the request's Accept header asks for text/markdown with a
 * non-zero quality at least as high as anything else offered
 * (acceptmarkdown.com content negotiation).
 */
export function negotiatesMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false;
  const entries = acceptEntries(accept);
  const md = entries.find((e) => e.type === 'text/markdown');
  if (!md || md.q <= 0) return false;
  const others = entries.filter((e) => e.type !== 'text/markdown');
  // text/markdown wins unless some other explicitly-listed type has a
  // strictly higher quality value.
  return others.every((e) => e.q <= md.q);
}
