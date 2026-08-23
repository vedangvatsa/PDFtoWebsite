import { NextResponse } from 'next/server';

/**
 * Predictable /developers URL alias redirecting to /docs.
 * Ensures agents searching for cvin.bio/developers land directly on developer resources.
 */
export function GET(request: Request) {
  const url = new URL('/docs', request.url);
  return NextResponse.redirect(url, 308);
}
