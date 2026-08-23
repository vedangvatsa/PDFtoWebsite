import { NextRequest, NextResponse } from 'next/server';
import { handleRpcMessage, type JsonRpcResponse } from '@/lib/mcp-rpc';
import { MCP_SERVER_INFO, MCP_TOOLS } from '@/lib/mcp-tools';

export const revalidate = 0;

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version',
};

function jsonRpcResponse(body: JsonRpcResponse | JsonRpcResponse[] | null): NextResponse {
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
    if (parsed.length === 0) return jsonRpcResponse(null);
    const responses = await Promise.all(parsed.map((m) => handleRpcMessage(m)));
    return jsonRpcResponse(responses.filter((r): r is JsonRpcResponse => r !== null));
  }

  return jsonRpcResponse(await handleRpcMessage(parsed));
}

export function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
  return NextResponse.json(
    {
      name: MCP_SERVER_INFO.name,
      version: MCP_SERVER_INFO.version,
      protocolVersion: '2024-11-05',
      endpoint: `${siteUrl}/mcp`,
      transport: 'Streamable HTTP (JSON-RPC 2.0)',
      tools: MCP_TOOLS,
      instructions:
        'CVin.Bio Model Context Protocol server. Accepts JSON-RPC 2.0 requests over HTTP POST at /mcp or /.well-known/mcp.',
    },
    {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Content-Type': 'application/json',
      },
    }
  );
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
