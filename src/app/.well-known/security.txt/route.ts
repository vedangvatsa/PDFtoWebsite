import { NextResponse } from 'next/server';

/**
 * /.well-known/security.txt — RFC 9116
 * Lets security researchers and AI systems know how to report vulnerabilities.
 */
export async function GET() {
  const content = [
    'Contact: mailto:hello@cvin.bio',
    'Contact: https://cvin.bio/contact',
    `Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}`,
    'Preferred-Languages: en',
    'Canonical: https://cvin.bio/.well-known/security.txt',
  ].join('\n');

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400',
    },
  });
}
