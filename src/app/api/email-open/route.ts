import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Pixel is embedded in outbound mail; still cap it so a single IP can't
  // flood email_opens. Generous window to absorb corporate mail servers.
  const { limited, retryAfter } = rateLimit(request, { windowMs: 15 * 60 * 1000, max: 600, scope: 'email-open' });
  if (limited) return rateLimitResponse(retryAfter);

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
