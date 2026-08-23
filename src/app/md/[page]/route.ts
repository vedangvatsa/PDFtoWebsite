import { NextRequest, NextResponse } from 'next/server';
import { buildAgentMarkdown } from '@/lib/agent-markdown';

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
  const markdown = await buildAgentMarkdown(page);

  if (markdown === null) {
    return NextResponse.json(
      {
        error: `No markdown variant for '/${page}'.`,
        code: 'MARKDOWN_NOT_FOUND',
        hint: `Available pages: home, jobs, fellowships, companies, about, contact, docs, terms, privacy, discover.`,
      },
      {
        status: 404,
        headers: { 'Vary': 'Accept, Accept-Encoding' },
      }
    );
  }

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
