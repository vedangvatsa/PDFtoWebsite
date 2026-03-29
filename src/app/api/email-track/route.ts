import { NextResponse } from 'next/server';

// 1x1 transparent GIF
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'open';
  const cid = searchParams.get('cid') || '';
  const email = searchParams.get('email') || '';
  const url = searchParams.get('url') || '';

  // Log to Vercel function logs (queryable via Vercel dashboard or CLI)
  console.log(JSON.stringify({
    type: 'email_track',
    action,
    campaign: cid,
    email: decodeURIComponent(email),
    timestamp: new Date().toISOString(),
  }));

  if (action === 'click' && url) {
    return NextResponse.redirect(url, 302);
  }

  // Return 1x1 transparent GIF for open tracking
  return new NextResponse(PIXEL, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
}
