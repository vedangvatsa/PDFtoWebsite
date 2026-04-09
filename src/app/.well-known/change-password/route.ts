import { NextResponse } from 'next/server';

/**
 * /.well-known/change-password — W3C Standard
 * Instructs password managers and bots where to redirect for password changes.
 */
export async function GET() {
  const loginUrl = new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio');
  return NextResponse.redirect(loginUrl);
}
