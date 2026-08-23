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
 * answered application/json; notifications return 202 Accepted. GET/DELETE
 * return 405 because no server-initiated SSE streams or sessions are
 * offered — allowed by the MCP spec for stateless servers.
 *
 * Tool listing is public: search_jobs, get_job, platform_stats expose only
 * data that is already public on cvin.bio.
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

export function GET() {
  return new NextResponse(
    JSON.stringify({
      error: 'Method Not Allowed.',
      code: 'MCP_GET_NOT_SUPPORTED',
      hint: 'This MCP server is stateless and does not offer server-initiated SSE streams. Send JSON-RPC 2.0 messages via POST.',
    }),
    {
      status: 405,
      headers: { ...CORS_HEADERS, Allow: 'POST', 'Content-Type': 'application/json' },
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
      headers: { ...CORS_HEADERS, Allow: 'POST', 'Content-Type': 'application/json' },
    }
  );
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
