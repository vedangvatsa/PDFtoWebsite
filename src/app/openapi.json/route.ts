import { buildOpenApiSpec } from '@/lib/openapi-spec';

export const revalidate = 3600;

/**
 * OpenAPI 3.1 spec of the public API surface. This is how agents and
 * LLM function-calling frameworks discover the CVin.Bio API automatically.
 */
export async function GET() {
  return Response.json(buildOpenApiSpec(), {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
