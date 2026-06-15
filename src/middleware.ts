import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * UTM suffixes — append /th, /wa, /li etc. to ANY page URL
 * to automatically add UTM tracking parameters.
 *
 * Examples:
 *   /jobs/th    → /jobs?utm_source=threads&utm_medium=social&utm_campaign=social-share
 *   /nomad/wa   → /nomad?utm_source=whatsapp&utm_medium=social&utm_campaign=social-share
 *   /salary/x   → /salary?utm_source=twitter&utm_medium=social&utm_campaign=social-share
 */
const UTM_SUFFIXES: Record<string, string> = {
  th:   'threads',
  wa:   'whatsapp',
  tg:   'telegram',
  li:   'linkedin',
  x:    'twitter',
  tw:   'twitter',
  ig:   'instagram',
  fb:   'facebook',
  bsky: 'bluesky',
  yt:   'youtube',
  rd:   'reddit',
};

const SUFFIX_SET = new Set(Object.keys(UTM_SUFFIXES));

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract the last segment of the path
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  // Check if the last segment is a UTM suffix
  if (lastSegment && SUFFIX_SET.has(lastSegment)) {
    // Rebuild the path without the suffix
    const basePath = '/' + segments.slice(0, -1).join('/') || '/';
    const url = request.nextUrl.clone();
    url.pathname = basePath;
    url.searchParams.set('utm_source', UTM_SUFFIXES[lastSegment]);
    url.searchParams.set('utm_medium', 'social');
    url.searchParams.set('utm_campaign', 'social-share');
    return NextResponse.redirect(url, 302);
  }

  return NextResponse.next();
}

// Only run on page routes, skip static assets and API routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|ingest|api|.*\\.).*)',
  ],
};
