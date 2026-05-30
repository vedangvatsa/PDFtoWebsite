import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          error: { code: -32700, message: 'Parse error: Invalid JSON received' },
          id: null
        },
        { status: 400 }
      );
    }

    // Validate JSON-RPC 2.0 structure
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          error: { code: -32600, message: 'Invalid Request: Expected a JSON object' },
          id: null
        },
        { status: 400 }
      );
    }

    const { jsonrpc, method, id } = body;

    // Check jsonrpc version
    if (jsonrpc !== '2.0') {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          error: { code: -32600, message: 'Invalid Request: jsonrpc must be exactly "2.0"' },
          id: id ?? null
        },
        { status: 400 }
      );
    }

    // Check method
    if (!method || typeof method !== 'string') {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          error: { code: -32600, message: 'Invalid Request: method is missing or invalid' },
          id: id ?? null
        },
        { status: 400 }
      );
    }

    // Handle heartbeats/pings (message/send or tasks/send or ping or message/stream)
    if (['message/send', 'tasks/send', 'ping', 'message/stream'].includes(method)) {
      return NextResponse.json({
        jsonrpc: '2.0',
        result: {
          status: 'success',
          message: 'heartbeat ok',
          timestamp: new Date().toISOString(),
          taskId: 'noop-heartbeat-' + Math.random().toString(36).substring(2, 9)
        },
        id: id ?? null
      });
    }

    // Method not found for actual execution requests since this is a compliant heartbeat/ping server
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: { code: -32601, message: `Method not found: ${method}` },
        id: id ?? null
      },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal error: ' + (error instanceof Error ? error.message : String(error)) },
        id: null
      },
      { status: 500 }
    );
  }
}

// Allow GET for simple sanity check/diagnostics
export async function GET() {
  return NextResponse.json({
    status: 'online',
    protocol: 'A2A JSON-RPC 2.0 endpoint',
    supportedMethods: ['message/send', 'tasks/send', 'ping', 'message/stream']
  });
}
