import { NextRequest, NextResponse } from 'next/server';

type Ctx = { params: Promise<{ notfound: string[] }> };

/**
 * JSON fallback for unknown /api/* paths. Agents must never receive an
 * HTML error page from the API namespace.
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { notfound } = await ctx.params;
  return NextResponse.json(
    {
      error: `No API endpoint at /${['api', ...notfound].join('/')}.`,
      code: 'API_NOT_FOUND',
      hint: 'See the OpenAPI spec at /openapi.json for the list of public endpoints.',
    },
    {
      status: 404,
      headers: { 'Access-Control-Allow-Origin': '*' },
    }
  );
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { notfound } = await ctx.params;
  return NextResponse.json(
    {
      error: `No API endpoint at /${['api', ...notfound].join('/')}.`,
      code: 'API_NOT_FOUND',
      hint: 'POST endpoints are documented in /openapi.json.',
    },
    {
      status: 404,
      headers: { 'Access-Control-Allow-Origin': '*' },
    }
  );
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  return GET(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  return GET(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  return GET(req, ctx);
}
