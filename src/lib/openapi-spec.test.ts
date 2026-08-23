import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildOpenApiSpec } from './openapi-spec';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] as const;

describe('OpenAPI spec (agent function-calling compatibility)', () => {
  const spec = buildOpenApiSpec() as {
    openapi: string;
    info: Record<string, unknown>;
    paths: Record<string, Record<string, { operationId?: string; description?: string; summary?: string; responses?: unknown; tags?: string[] }>>;
  };

  it('is OpenAPI 3.1 with identifying info', () => {
    assert.equal(spec.openapi, '3.1.0');
    assert.match(String(spec.info.title), /CVin\.Bio/i);
    assert.ok(spec.info.description);
  });

  it('documents the core public endpoints', () => {
    for (const path of ['/api/jobs', '/api/jobs/{id}', '/api/news', '/api/profile/{username}', '/api/contact']) {
      assert.ok(spec.paths[path], `missing path ${path}`);
    }
  });

  it('gives every operation a unique operationId, description, and responses', () => {
    const ids = new Set<string>();
    let operations = 0;
    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const method of HTTP_METHODS) {
        const op = methods[method];
        if (!op) continue;
        operations++;
        assert.ok(op.operationId, `${method.toUpperCase()} ${path} has no operationId`);
        assert.ok(!ids.has(op.operationId), `duplicate operationId ${op.operationId}`);
        ids.add(op.operationId);
        assert.ok(op.summary || op.description, `${op.operationId} lacks summary/description`);
        assert.ok(op.responses && Object.keys(op.responses).length > 0, `${op.operationId} has no responses`);
      }
    }
    assert.ok(operations >= 6, `expected at least 6 documented operations, got ${operations}`);
  });

  it('exposes agent resources (llms.txt, agent.txt, MCP)', () => {
    assert.ok(spec.paths['/llms.txt']);
    assert.ok(spec.paths['/agent.txt']);
    assert.ok(spec.paths['/mcp']);
    const mcp = (spec as Record<string, unknown>)['x-mcp-server'];
    assert.ok(typeof mcp === 'object' && mcp !== null);
    assert.equal((mcp as { transport?: string }).transport, 'streamable-http');
  });

  it('documents rate-limit conventions on the jobs list response', () => {
    const responses = (spec.paths['/api/jobs'].get.responses ?? {}) as Record<string, { headers?: Record<string, unknown> }>;
    const headers = responses['200']?.headers;
    assert.ok(headers, 'jobs list 200 missing headers block');
    assert.ok('RateLimit-Limit' in headers);
    assert.ok('X-RateLimit-Remaining' in headers);
  });

  it('documents cursor pagination on list endpoints', () => {
    const get = spec.paths['/api/jobs'].get as Record<string, any>;
    const params: Array<Record<string, any>> = get.parameters ?? [];
    const cursor = params.find((p) => p.name === 'cursor');
    assert.ok(cursor, 'listJobs missing cursor parameter');
    const schema = get.responses['200'].content['application/json'].schema;
    assert.ok(schema.properties.next_cursor, 'listJobs response schema missing next_cursor');
    assert.ok(schema.properties.offset, 'listJobs response schema missing offset');
    assert.ok(schema.required.includes('next_cursor'));
  });

  it('defines a typed error model in components', () => {
    const components = (spec as Record<string, any>).components;
    const envelope = components?.schemas?.ErrorEnvelope;
    assert.ok(envelope, 'missing ErrorEnvelope component');
    assert.deepEqual(envelope.required, ['error', 'code']);
    const codes: string[] = envelope.properties.code.enum;
    for (const expected of ['RATE_LIMITED', 'API_NOT_FOUND', 'JOBS_QUERY_FAILED']) {
      assert.ok(codes.includes(expected), `error code enum missing ${expected}`);
    }
    // Error responses reference the shared envelope.
    const jobGet = (spec.paths['/api/jobs/{id}'] as { get?: { responses?: Record<string, any> } }).get;
    const notFound = jobGet?.responses?.['404'];
    assert.equal(
      notFound?.content?.['application/json']?.schema?.$ref,
      '#/components/schemas/ErrorEnvelope'
    );
  });

  it('declares an API versioning policy', () => {
    const versioning = (spec.info as Record<string, any>)['x-api-versioning'];
    assert.ok(versioning, 'info missing x-api-versioning');
    assert.match(versioning.policy, /v1/);
    const jobsResponses = (spec.paths['/api/jobs'].get as { responses?: Record<string, any> }).responses ?? {};
    assert.ok(jobsResponses['200']?.headers?.['API-Version'], 'listJobs 200 missing API-Version header doc');
  });
});
