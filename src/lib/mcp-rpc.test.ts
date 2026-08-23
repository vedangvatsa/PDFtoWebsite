import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { handleRpcMessage, type JsonRpcResponse } from './mcp-rpc';
import { MCP_PROTOCOL_VERSION, MCP_TOOLS } from './mcp-tools';

async function assertResponse(msg: unknown): Promise<JsonRpcResponse> {
  const res = await handleRpcMessage(msg);
  assert.ok(res, 'expected a JSON-RPC response');
  return res;
}

describe('MCP JSON-RPC handler (Streamable HTTP)', () => {
  it('initialize echoes a supported protocol version and advertises tools capability', async () => {
    const res = await assertResponse({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2025-03-26' },
    });
    assert.equal(res.jsonrpc, '2.0');
    assert.equal(res.id, 1);
    const result = res.result as { protocolVersion: string; capabilities: { tools: object }; serverInfo: { name: string } };
    assert.equal(result.protocolVersion, '2025-03-26');
    assert.ok(result.capabilities.tools);
    assert.equal(result.serverInfo.name, 'cvinbio');
    // Falls back to the server version for unknown client versions.
    const fallback = await assertResponse({
      jsonrpc: '2.0',
      id: 2,
      method: 'initialize',
      params: { protocolVersion: '1999-01-01' },
    });
    assert.equal((fallback.result as { protocolVersion: string }).protocolVersion, MCP_PROTOCOL_VERSION);
  });

  it('tools/list exposes public read-only tools with typed input schemas', async () => {
    const res = await assertResponse({ jsonrpc: '2.0', id: 'a', method: 'tools/list' });
    const { tools } = (res.result ?? {}) as { tools: { name: string; description: string; inputSchema: Record<string, unknown> }[] };
    assert.deepEqual(tools.map((t) => t.name).sort(), ['get_job', 'platform_stats', 'search_jobs']);
    for (const tool of tools) {
      assert.ok(tool.description.length > 20, `${tool.name} needs a real description`);
      assert.equal(tool.inputSchema.type, 'object');
    }
    assert.deepEqual(MCP_TOOLS.find((t) => t.name === 'search_jobs')?.inputSchema.required, ['query']);
  });

  it('notifications produce no response (server answers 202)', async () => {
    const res = await handleRpcMessage({ jsonrpc: '2.0', method: 'notifications/initialized' });
    assert.equal(res, null);
  });

  it('ping returns an empty result', async () => {
    const res = await assertResponse({ jsonrpc: '2.0', id: 7, method: 'ping' });
    assert.deepEqual(res.result, {});
  });

  it('unknown methods return -32601 with supported methods listed', async () => {
    const res = await assertResponse({ jsonrpc: '2.0', id: 9, method: 'resources/list' });
    assert.equal(res.error?.code, -32601);
    assert.ok(Array.isArray((res.error?.data as { supportedMethods?: [] })?.supportedMethods));
  });

  it('malformed messages return -32600 without throwing', async () => {
    const res = await assertResponse({ nope: true });
    assert.equal(res.error?.code, -32600);
  });

  it('tools/call rejects unknown tools before touching the database', async () => {
    const res = await assertResponse({
      jsonrpc: '2.0',
      id: 11,
      method: 'tools/call',
      params: { name: 'drop_tables' },
    });
    const err = res.error as { code: number; message: string; data?: { available: string[] } };
    assert.equal(err.code, -32602);
    assert.match(err.message, /Unknown tool/);
    assert.ok(err.data?.available.includes('search_jobs'));
  });

  it('tools/call validates required arguments before touching the database', async () => {
    const res = await assertResponse({
      jsonrpc: '2.0',
      id: 12,
      method: 'tools/call',
      params: { name: 'search_jobs', arguments: {} },
    });
    const result = res.result as { isError?: boolean; content: { text: string }[] };
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /query is required/);
  });

  it('tools/call without a name returns -32602', async () => {
    const res = await assertResponse({ jsonrpc: '2.0', id: 13, method: 'tools/call', params: {} });
    assert.equal(res.error?.code, -32602);
  });
});
