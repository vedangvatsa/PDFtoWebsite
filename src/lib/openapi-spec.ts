const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

const jobSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'string', description: 'Job UUID' },
    title: { type: 'string' },
    company: { type: 'string' },
    company_logo: { type: 'string', nullable: true },
    location: { type: 'string', nullable: true },
    job_type: { type: 'string', nullable: true, description: 'full_time | internship | contract | …' },
    salary: { type: 'string', nullable: true },
    tags: { type: 'array', items: { type: 'string' } },
    apply_url: { type: 'string', nullable: true },
    category: { type: 'string', nullable: true },
    source: { type: 'string', nullable: true },
    published_at: { type: 'string', format: 'date-time', nullable: true },
    external_id: { type: 'string', nullable: true },
    path: { type: 'string', description: 'Canonical path of the job page on cvin.bio' },
    external: { type: 'boolean', description: 'True when the canonical destination is off-site' },
    match_score: { type: 'number', description: '0-100 relevance for the authenticated candidate (0 when anonymous)' },
    matched_skills: { type: 'array', items: { type: 'string' } },
    match_count: { type: 'integer' },
  },
  required: ['id', 'title', 'company'],
};

const errorSchema = {
  type: 'object' as const,
  properties: {
    error: { type: 'string', description: 'Human-readable error message' },
    code: { type: 'string', description: 'Stable machine-readable error code' },
    hint: { type: 'string', description: 'Resolution hint for agents' },
  },
  required: ['error'],
};

const rateLimitHeaders = {
  'RateLimit-Limit': {
    description: 'Request quota for the current window (RFC 9331 draft)',
    schema: { type: 'string' },
  },
  'RateLimit-Remaining': {
    description: 'Requests left in the current window',
    schema: { type: 'string' },
  },
  'RateLimit-Reset': {
    description: 'Seconds until the window resets',
    schema: { type: 'string' },
  },
  'X-RateLimit-Limit': { description: 'Legacy quota header', schema: { type: 'string' } },
  'X-RateLimit-Remaining': { description: 'Legacy remaining header', schema: { type: 'string' } },
};

const apiVersionHeader = {
  'API-Version': {
    description: 'Major API version serving this response (e.g. v1)',
    schema: { type: 'string', example: 'v1' },
  },
};

const errorRef = { $ref: '#/components/schemas/ErrorEnvelope' };

/**
 * OpenAPI 3.1 specification of the public CVin.Bio API surface.
 * Served at /openapi.json — every operation has an operationId,
 * description, typed parameters, and response schemas so LLM
 * function-calling and agent frameworks can bind to it directly.
 */
export function buildOpenApiSpec(): Record<string, unknown> {
  return {
    openapi: '3.1.0',
    info: {
      title: 'CVin.Bio Public API',
      version: '1.0.0',
      description:
        'Public, read-mostly API for CVin.Bio — a curated tech job board and CV-to-website product. Query live curated jobs, tech news, and public candidate profiles; submit contact messages. No authentication is required for read endpoints. An MCP server exposing the same tools over Streamable HTTP is available at https://cvin.bio/mcp (manifest at /.well-known/mcp.json). Rate-limited responses carry RFC 9331 RateLimit-* headers plus legacy X-RateLimit-* headers; on 429, honor Retry-After.',
      'x-api-versioning': {
        strategy: 'URL-path major version with backward-compatible additive changes inside a major version',
        current: 'v1',
        policy:
          'The current stable major version is v1. Breaking changes ship under /v2/ while /v1/ keeps working for at least 12 months after a v2 release. Additive fields may appear in responses at any time; consumers must ignore unknown properties. Send Prefer: code=true to receive machine-readable error envelopes.',
        unversioned_alias: 'Paths without a version prefix (/api/...) always alias the current stable major version (/v1/api/...).',
        version_header: 'Every API response includes an API-Version header identifying the served major version.',
        deprecation:
          'Deprecated operations are announced in release notes and marked deprecated: true in this spec at least 90 days before removal, and their responses carry Deprecation and Sunset (HTTP-date) headers until shutdown.',
        async_operations:
          'Long-running submissions return 202 Accepted with a JSON body { status: "queued", received_at } — the operation completes asynchronously; retry safety is provided by the Idempotency-Key header.',
      },
      contact: { name: 'CVin.Bio', email: 'hi@cvin.bio', url: `${siteUrl}/contact` },
      license: { name: 'Proprietary', url: `${siteUrl}/terms` },
    },
    servers: [
      { url: siteUrl, description: 'Production (unversioned alias of the current stable major version)' },
      { url: `${siteUrl}/v1`, description: 'Version-pinned v1 — path-identical to the unversioned alias' },
    ],
    tags: [
      { name: 'jobs', description: 'Curated tech job listings' },
      { name: 'news', description: 'Aggregated tech news' },
      { name: 'profiles', description: 'Public candidate profiles' },
      { name: 'contact', description: 'Contact form submissions' },
      { name: 'agent-resources', description: 'Machine-readable files for AI agents' },
    ],
    paths: {
      '/api/jobs': {
        get: {
          operationId: 'listJobs',
          summary: 'List curated tech jobs',
          description:
            'Returns a paginated, quality-filtered feed of curated tech jobs sorted by relevance then recency. Anonymous callers receive unpersonalized results; optional Supabase bearer auth personalizes match scores. Pagination is cursor-based and consistent across pages: pass each response\'s `next_cursor` value verbatim as the `cursor` query parameter until it returns null. The legacy `page`/`limit` offset parameters remain supported; every page shape includes limit, offset, hasMore, and next_cursor.',
          tags: ['jobs'],
          parameters: [
            { $ref: '#/components/parameters/ApiVersionHeader' },
            {
              name: 'cursor',
              in: 'query',
              schema: { type: 'string' },
              description:
                'Opaque pagination cursor taken from `next_cursor` of the previous response. Preferred over legacy page offsets. Omit on the first call.',
            },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 }, description: 'Legacy alias: page number starting at 1 (ignored when cursor is provided)' },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 }, description: 'Results per page (max 50)' },
            { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Keyword filter on title or company' },
            { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Job type filter, e.g. full_time, internship, contract' },
            { name: 'loc', in: 'query', schema: { type: 'string', enum: ['remote', 'onsite'] }, description: 'Location-type filter' },
            { name: 'kind', in: 'query', schema: { type: 'string', enum: ['fellowship'] }, description: 'Set to fellowship to list only fellowships' },
          ],
          responses: {
            '200': {
              description: 'Paginated job feed',
              headers: { ...rateLimitHeaders, ...apiVersionHeader },
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      jobs: { type: 'array', items: jobSchema },
                      total: { type: 'integer', description: 'Total matching jobs (estimated)' },
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                      offset: { type: 'integer', description: 'Zero-based start index of this page' },
                      hasMore: { type: 'boolean', description: 'True when another page exists' },
                      next_cursor: {
                        type: ['string', 'null'],
                        description:
                          'Opaque cursor for the next page. Pass it back verbatim as ?cursor= to continue pagination. Null on the last page.',
                      },
                      degraded: { type: 'boolean', description: 'True when the board timed out and returned an empty page' },
                    },
                    required: ['jobs', 'total', 'page', 'limit', 'hasMore', 'next_cursor'],
                  },
                },
              },
            },
            '500': {
              description: 'Database failure',
              content: { 'application/json': { schema: errorRef } },
            },
          },
        },
      },
      '/api/jobs/{id}': {
        get: {
          operationId: 'getJob',
          summary: 'Get one job by id',
          description: 'Fetches full detail for a single public curated job, including a safe published description when available.',
          tags: ['jobs'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Job UUID or external id' },
          ],
          responses: {
            '200': {
              description: 'Job detail',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      title: { type: 'string' },
                      company: { type: 'string' },
                      location: { type: 'string', nullable: true },
                      job_type: { type: 'string', nullable: true },
                      salary: { type: 'string', nullable: true },
                      tags: { type: 'array', items: { type: 'string' } },
                      description_html: { type: 'string', nullable: true, description: 'Sanitized published description HTML' },
                      apply_url: { type: 'string', nullable: true },
                      posted_at: { type: 'string', format: 'date-time', nullable: true },
                    },
                  },
                },
              },
            },
            '400': { description: 'Malformed job id', content: { 'application/json': { schema: errorRef } } },
            '404': { description: 'Job not found or not publicly listable', content: { 'application/json': { schema: errorRef } } },
            '500': { description: 'Database failure', content: { 'application/json': { schema: errorRef } } },
          },
        },
      },
      '/api/news': {
        get: {
          operationId: 'listTechNews',
          summary: 'List recent aggregated tech news',
          description: 'Returns recently ranked items from curated tier-1 tech RSS sources (Hacker News, TechCrunch, The Verge, Ars Technica, and more).',
          tags: ['news'],
          parameters: [
            { $ref: '#/components/parameters/ApiVersionHeader' },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 }, description: 'Maximum items to return' },
          ],
          responses: {
            '200': {
              description: 'News items',
              headers: { ...rateLimitHeaders, ...apiVersionHeader },
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        url: { type: 'string', format: 'uri' },
                        source: { type: 'string' },
                        sourceIcon: { type: 'string' },
                        publishedAt: { type: 'string', format: 'date-time' },
                        description: { type: 'string' },
                      },
                      required: ['title', 'url', 'source'],
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/profile/{username}': {
        get: {
          operationId: 'getPublicProfile',
          summary: 'Get a public candidate profile',
          description:
            'Returns the flattened public profile for a CVin.Bio username (the slug part of cvin.bio/{username}): name, summary, skills, experience, and links. Only profiles the owner chose to publish are returned.',
          tags: ['profiles'],
          parameters: [
            { name: 'username', in: 'path', required: true, schema: { type: 'string' }, description: 'Profile slug, e.g. vedang' },
          ],
          responses: {
            '200': {
              description: 'Public profile',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      full_name: { type: 'string' },
                      email: { type: 'string' },
                      phone: { type: 'string' },
                      location: { type: 'string' },
                      website: { type: 'string' },
                      github: { type: 'string' },
                      linkedin: { type: 'string' },
                      summary: { type: 'string' },
                      skills: { type: 'array', items: { type: 'string' } },
                      experience: { type: 'array', items: { type: 'object' } },
                      profile_picture_url: { type: 'string' },
                      links: { type: 'array', items: { type: 'object' } },
                    },
                  },
                },
              },
            },
            '404': { description: 'Profile not found', content: { 'application/json': { schema: errorRef } } },
            '503': {
              description: 'Profile temporarily unavailable (retry)',
              headers: { 'Retry-After': { description: 'Seconds to wait before retrying', schema: { type: 'string' } } },
              content: { 'application/json': { schema: errorRef } },
            },
          },
        },
      },
      '/api/contact': {
        post: {
          operationId: 'submitContactMessage',
          summary: 'Submit a contact message',
          description:
            'Delivers a support/partnership message to the CVin.Bio team. Rate limited per IP (5 requests per hour); honor Retry-After on 429. Returns 202 Accepted (async delivery); retries are safe when an Idempotency-Key header is provided — replays within 24h return the original response with an Idempotent-Replay: true header.',
          tags: ['contact'],
          parameters: [
            {
              name: 'Idempotency-Key',
              in: 'header',
              required: false,
              schema: { type: 'string', maxLength: 255 },
              description:
                'Unique key for this submission (e.g. a UUID). Retries with the same key within 24h return the original response instead of creating a duplicate message.',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email', description: 'Reply-to address' },
                    purpose: {
                      type: 'string',
                      enum: ['feedback', 'partnership', 'support', 'bug-report', 'feature-request', 'other'],
                      description: 'Why you are writing',
                    },
                    message: { type: 'string', minLength: 10, maxLength: 5000, description: 'Message body' },
                  },
                  required: ['email', 'purpose', 'message'],
                },
              },
            },
          },
          responses: {
            '202': {
              description: 'Message accepted and queued for async delivery',
              headers: { ...apiVersionHeader },
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      ok: { type: 'boolean' },
                      status: { type: 'string', enum: ['queued'], description: 'Async delivery state' },
                      received_at: { type: 'string', format: 'date-time' },
                    },
                    required: ['success', 'status'],
                  },
                },
              },
            },
            '400': { description: 'Validation failed', content: { 'application/json': { schema: errorRef } } },
            '429': {
              description: 'Rate limited',
              headers: { 'Retry-After': { description: 'Seconds to wait before retrying', schema: { type: 'string' } } },
              content: { 'application/json': { schema: errorRef } },
            },
          },
        },
      },
      '/mcp': {
        post: {
          operationId: 'mcpJsonRpc',
          summary: 'MCP Streamable HTTP endpoint (JSON-RPC 2.0)',
          description:
            'Model Context Protocol server over Streamable HTTP. Send JSON-RPC 2.0 requests: initialize, tools/list, tools/call. Public read-only tools: search_jobs, get_job, platform_stats. No authentication required.',
          tags: ['agent-resources'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: 'https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/schema/2025-06-18/schema.json#/definitions/JSONRPCRequest',
                },
              },
            },
          },
          responses: {
            '200': { description: 'JSON-RPC response (single) — notifications return 202 Accepted' },
            '405': { description: 'GET/SSE not supported; use POST' },
          },
        },
      },
      '/llms.txt': {
        get: {
          operationId: 'getLlmsIndex',
          summary: 'llms.txt index for AI systems',
          description: 'Markdown index of CVin.Bio surfaces: profiles directory, companies, recent jobs, reports, and developer resources.',
          tags: ['agent-resources'],
          responses: {
            '200': {
              description: 'text/markdown index',
              content: { 'text/markdown': { schema: { type: 'string' } } },
            },
          },
        },
      },
      '/agent.txt': {
        get: {
          operationId: 'getAgentInstructions',
          summary: 'Agent instructions incl. when-to-use guidance',
          description: 'Plain-text instructions for AI agents: what CVin.Bio is for, best-fit use cases, and how to call its API and MCP server.',
          tags: ['agent-resources'],
          responses: {
            '200': { description: 'text/plain instructions', content: { 'text/plain': { schema: { type: 'string' } } } },
          },
        },
      },
      '/openapi.json': {
        get: {
          operationId: 'getOpenApiSpec',
          summary: 'This OpenAPI document',
          tags: ['agent-resources'],
          responses: {
            '200': { description: 'OpenAPI 3.1 spec as JSON', content: { 'application/json': { schema: { type: 'object' } } } },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        OptionalBearer: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Optional Supabase access token for personalized job matching (GET /api/jobs?match=true). All read endpoints work anonymously; no consumer API keys are issued. Scope areas: jobs:read, profiles:read, news:read, stats:read, contact:write — see /.well-known/oauth-protected-resource.',
        },
      },
      schemas: {
        ErrorEnvelope: {
          type: 'object',
          description:
            'Canonical error body for every non-2xx API response. `code` is a stable machine-readable identifier; `hint` tells an agent how to proceed.',
          properties: {
            error: { type: 'string', description: 'Human-readable error message' },
            code: {
              type: 'string',
              description: 'Stable machine-readable error code',
              enum: [
                'RATE_LIMITED',
                'INVALID_EMAIL',
                'INVALID_PURPOSE',
                'MESSAGE_TOO_SHORT',
                'MESSAGE_TOO_LONG',
                'JOBS_QUERY_FAILED',
                'PROFILE_NOT_FOUND',
                'JOB_NOT_FOUND',
                'API_NOT_FOUND',
                'MARKDOWN_NOT_FOUND',
                'INTERNAL_ERROR',
              ],
            },
            hint: { type: 'string', description: 'Resolution hint, e.g. which endpoint or spec to consult' },
          },
          required: ['error', 'code'],
          additionalProperties: false,
          example: {
            error: 'Too many requests from this IP.',
            code: 'RATE_LIMITED',
            hint: 'Wait 30 seconds. Limits: 300 read requests/min per IP. See https://cvin.bio/openapi.json.',
          },
        },
      },
      responses: {
        BadRequest: { description: 'Validation failed', content: { 'application/json': { schema: errorRef } } },
        NotFound: { description: 'Resource not found', content: { 'application/json': { schema: errorRef } } },
        RateLimited: {
          description: 'Rate limit exceeded',
          headers: { 'Retry-After': { description: 'Seconds to wait before retrying', schema: { type: 'string' } } },
          content: { 'application/json': { schema: errorRef } },
        },
        ServerError: { description: 'Internal server error', content: { 'application/json': { schema: errorRef } } },
      },
      headers: rateLimitHeaders,
      parameters: {
        ApiVersionHeader: {
          name: 'API-Version',
          in: 'header',
          required: false,
          schema: { type: 'string', default: 'v1', enum: ['v1'] },
          description:
            'Major API version to serve. Responses always carry an API-Version header identifying what was served. Unversioned requests use the current stable version.',
        },
      },
    },
    'x-mcp-server': {
      transport: 'streamable-http',
      url: `${siteUrl}/mcp`,
      manifest: `${siteUrl}/.well-known/mcp.json`,
      auth: 'none for read-only tools',
      tools: ['search_jobs', 'get_job', 'platform_stats'],
    },
  };
}
