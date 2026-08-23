import { NextResponse } from 'next/server';

export function GET(request: Request) {
  const url = new URL('/discover', request.url);
  return NextResponse.redirect(url, 308);
}
