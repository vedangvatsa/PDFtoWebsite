import { NextResponse } from 'next/server';

/**
 * Predictable /webhooks URL alias redirecting to /docs.
 * Provides machine-readable webhooks and event streaming guidance.
 */
export function GET(request: Request) {
  const url = new URL('/docs#webhooks', request.url);
  return NextResponse.redirect(url, 308);
}
