import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const campaign = searchParams.get('campaign') || 'unknown';
  const content = searchParams.get('content') || 'unknown';
  const source = searchParams.get('source') || 'unknown';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const ua = request.headers.get('user-agent') || 'unknown';

  try {
    await supabaseAdmin.from('email_opens').insert({
      campaign,
      content,
      source,
      ip,
      user_agent: ua.slice(0, 500),
    });
  } catch {
    // Non-fatal — don't block the pixel
  }

  // Return a 1x1 transparent GIF
  const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  return new NextResponse(gif, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
