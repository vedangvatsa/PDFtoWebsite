import { NextRequest, NextResponse } from 'next/server';
import { handleRpcMessage, type JsonRpcResponse } from '@/lib/mcp-rpc';

export const revalidate = 0;

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version',
};

function jsonRpcResponse(body: JsonRpcResponse | JsonRpcResponse[] | null): NextResponse {
  // Notifications only → 202 Accepted, no body (Streamable HTTP spec).
  if (body === null || (Array.isArray(body) && body.length === 0)) {
    return new NextResponse(null, {
      status: 202,
      headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' },
    });
  }
  return NextResponse.json(body, {
    status: 200,
    headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' },
  });
}

/**
 * CVin.Bio MCP server over Streamable HTTP.
 *
 * POST accepts JSON-RPC 2.0 messages (single or batch). Requests are
 * answered application/json; notifications return 202 Accepted.
 * GET returns 200 OK server card & capability metadata (or text/markdown on request).
 */
export async function POST(request: NextRequest) {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Invalid JSON body.' },
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      return jsonRpcResponse(null);
    }
    const responses = await Promise.all(parsed.map((m) => handleRpcMessage(m)));
    return jsonRpcResponse(responses.filter((r): r is JsonRpcResponse => r !== null));
  }

  return jsonRpcResponse(await handleRpcMessage(parsed));
}

export function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
  const accept = request.headers.get('accept') || '';
  const wantsMarkdown = accept.includes('text/markdown') || request.nextUrl.pathname.endsWith('.md');

  if (wantsMarkdown) {
    const md = [
      `# CVin.Bio Model Context Protocol (MCP) Server`,
      ``,
      `CVin.Bio MCP server exposes tools to search curated tech jobs, view job details, and query platform stats over Streamable HTTP (JSON-RPC 2.0).`,
      ``,
      `## Server Metadata`,
      `- Name: CVin.Bio MCP Server`,
      `- Version: 1.0.0`,
      `- Protocol Version: 2024-11-05`,
      `- Endpoint: POST ${siteUrl}/mcp`,
      `- Transport: Streamable HTTP (JSON-RPC 2.0)`,
      ``,
      `## Available Tools`,
      `- \`search_jobs\` — Search curated tech jobs by keyword, company, or location. Required args: \`{"query": "string"}\`, optional \`{"limit": 10}\`.`,
      `- \`get_job\` — Fetch job listing detail by UUID. Required args: \`{"id": "string"}\`.`,
      `- \`platform_stats\` — Fetch live platform counts for jobs, companies, and candidate profiles.`,
      ``,
      `## Specification & Manifests`,
      `- Manifest: ${siteUrl}/.well-known/mcp.json`,
      `- OpenAPI 3.1 Spec: ${siteUrl}/openapi.json`,
      `- Developer Docs: ${siteUrl}/docs`,
      ``,
    ].join('\n');

    return new NextResponse(md, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Vary': 'Accept',
      },
    });
  }

  return NextResponse.json(
    {
      name: 'CVin.Bio MCP Server',
      version: '1.0.0',
      protocolVersion: '2024-11-05',
      endpoint: `${siteUrl}/mcp`,
      transport: 'Streamable HTTP (JSON-RPC 2.0)',
      instructions:
        'CVin.Bio Model Context Protocol server. Send JSON-RPC 2.0 requests via POST to execute tools or initialize.',
      tools: [
        { name: 'search_jobs', description: 'Search curated tech jobs by keyword, company, or location.' },
        { name: 'get_job', description: 'Fetch job listing detail by UUID.' },
        { name: 'platform_stats', description: 'Fetch live platform counts.' },
      ],
    },
    {
      status: 200,
      headers: { ...CORS_HEADERS, 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
    }
  );
}

export function DELETE() {
  return new NextResponse(
    JSON.stringify({
      error: 'Method Not Allowed.',
      code: 'MCP_SESSION_DELETE_NOT_SUPPORTED',
      hint: 'This MCP server is stateless — no session to terminate.',
    }),
    {
      status: 405,
      headers: { ...CORS_HEADERS, Allow: 'POST, GET', 'Content-Type': 'application/json' },
    }
  );
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
