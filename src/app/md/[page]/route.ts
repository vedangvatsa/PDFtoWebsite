import { NextRequest, NextResponse } from 'next/server';
import { buildAgentMarkdown, withFrontmatter } from '@/lib/agent-markdown';

export const revalidate = 0;

/**
 * Markdown variants for key public pages, reached via Accept: text/markdown
 * negotiation in middleware (acceptmarkdown.com). Every response carries
 * `Vary: Accept` so CDN caches never mix HTML and markdown variants.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page } = await params;
  const built = await buildAgentMarkdown(page);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

  if (built === null) {
    const cleanName = String(page || 'Resource')
      .replace(/^.*[/\\]/, '')
      .replace(/\.md$/i, '')
      .replace(/[-_]/g, ' ');
    const titleName = (cleanName.charAt(0).toUpperCase() + cleanName.slice(1)) || 'Resource';
    const fallbackMarkdown = [
      `# CVin.Bio — ${titleName}`,
      '',
      `CVin.Bio turns your CV into a professional personal website and runs a curated tech job board. Upload a PDF or Word resume and AI extracts your work history, education, and skills to build a shareable profile page at cvin.bio/yourname — free, in seconds.`,
      '',
      `## Machine-readable resources`,
      `- OpenAPI 3.1 Spec: ${siteUrl}/openapi.json`,
      `- MCP Server (Streamable HTTP): ${siteUrl}/mcp`,
      `- MCP Manifest: ${siteUrl}/.well-known/mcp.json`,
      `- Agent Instructions: ${siteUrl}/agent.txt`,
      `- llms.txt Directory: ${siteUrl}/llms.txt`,
      `- Developer Docs: ${siteUrl}/docs`,
      `- Job Board: ${siteUrl}/jobs`,
      '',
    ].join('\n');

    return new NextResponse(fallbackMarkdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Vary': 'Accept, Accept-Encoding',
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
        'X-Robots-Tag': 'all',
      },
    });
  }

  const markdown = withFrontmatter(page, built);

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept, Accept-Encoding',
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
      'X-Robots-Tag': 'all',
    },
  });
}
