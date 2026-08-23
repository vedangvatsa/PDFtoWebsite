import { MCP_PROTOCOL_VERSION, MCP_SERVER_INFO, MCP_TOOLS, callTool } from '@/lib/mcp-tools';

export type JsonRpcId = string | number | null;

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: JsonRpcId;
  result?: unknown;
  error?: JsonRpcError;
}

const PARSE_ERROR = -32700;
const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;

function isMessage(msg: unknown): msg is { jsonrpc?: string; id?: JsonRpcId; method?: string; params?: unknown } {
  return typeof msg === 'object' && msg !== null && !Array.isArray(msg);
}

/**
 * Handle one JSON-RPC 2.0 message for the CVin.Bio MCP endpoint.
 * Returns a response object for requests, or null when the message is a
 * notification (Streamable HTTP servers answer those with 202 Accepted).
 */
export async function handleRpcMessage(msg: unknown): Promise<JsonRpcResponse | null> {
  if (!isMessage(msg) || typeof msg.method !== 'string') {
    return {
      jsonrpc: '2.0',
      id: (isMessage(msg) ? (msg as { id?: JsonRpcId }).id ?? null : null) as JsonRpcId,
      error: { code: INVALID_REQUEST, message: 'Request must be a JSON-RPC 2.0 object with a "method" string.' },
    };
  }

  const { id = null, method } = msg;
  const isNotification = !('id' in msg);
  const reply = (resultOrError: { result?: unknown; error?: JsonRpcError }): JsonRpcResponse | null => {
    if (isNotification) return null;
    return { jsonrpc: '2.0', id, ...resultOrError };
  };

  switch (method) {
    case 'initialize': {
      const clientVersion =
        typeof (msg.params as { protocolVersion?: string })?.protocolVersion === 'string'
          ? (msg.params as { protocolVersion: string }).protocolVersion
          : MCP_PROTOCOL_VERSION;
      // Echo the client's version when we support it, else advertise ours.
      const protocolVersion = [MCP_PROTOCOL_VERSION, '2025-03-26', '2024-11-05'].includes(clientVersion)
        ? clientVersion
        : MCP_PROTOCOL_VERSION;
      return reply({
        result: {
          protocolVersion,
          capabilities: { tools: { listChanged: false } },
          serverInfo: MCP_SERVER_INFO,
          instructions:
            'CVin.Bio exposes curated tech job search over MCP. Use search_jobs to find listings by skill/company/location, get_job for detail on a specific listing id, and platform_stats for live inventory counts. All tools are public and read-only.',
        },
      });
    }
    case 'notifications/initialized':
    case 'notifications/cancelled':
    case 'notifications/roots/list_changed':
      return null;
    case 'tools/list':
      return reply({ result: { tools: MCP_TOOLS } });
    case 'tools/call': {
      const params = (msg.params ?? {}) as { name?: unknown; arguments?: Record<string, unknown> };
      if (typeof params.name !== 'string') {
        return reply({ error: { code: INVALID_PARAMS, message: 'tools/call requires a "name" string.' } });
      }
      const result = await callTool(params.name, params.arguments);
      return reply({ result });
    }
    case 'ping':
      return reply({ result: {} });
    default:
      return reply({
        error: {
          code: METHOD_NOT_FOUND,
          message: `Method "${method}" not found.`,
          data: { supportedMethods: ['initialize', 'notifications/initialized', 'tools/list', 'tools/call', 'ping'] },
        },
      });
  }
}
