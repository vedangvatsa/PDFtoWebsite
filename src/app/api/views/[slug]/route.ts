import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createAnonFromRequest } from '@/utils/supabase/anon';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { ADMIN_EMAILS } from '@/lib/admin';

const supabase = supabaseAdmin;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  // Skip bots/crawlers to prevent inflated view counts
  const ua = request.headers.get('user-agent') || '';
  if (/bot|crawl|spider|slurp|mediapartners|facebookexternalhit|linkedinbot|twitterbot|whatsapp|telegram|preview/i.test(ua)) {
    return NextResponse.json({ success: true, bot: true }, { status: 200 });
  }

  // Skip owner and admin views
  try {
    const anonClient = createAnonFromRequest(request);
    const { data: { user: viewer } } = await anonClient.auth.getUser();
    if (viewer) {
      // Skip admin views
      if (ADMIN_EMAILS.includes(viewer.email || '')) {
        return NextResponse.json({ success: true, admin: true }, { status: 200 });
      }
      // Skip owner viewing their own profile
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', slug)
        .single();
      if (ownerProfile && ownerProfile.id === viewer.id) {
        return NextResponse.json({ success: true, owner: true }, { status: 200 });
      }
    }
  } catch (_) {
    // Auth check failed — continue with normal view counting
  }

  // Basic deduplication: check for a view cookie to prevent repeated counting
  const viewCookieName = `viewed_${slug}`;
  const alreadyViewed = request.cookies.get(viewCookieName);

  if (alreadyViewed) {
    return NextResponse.json({ success: true, deduplicated: true }, { status: 200 });
  }

  // Per-slug rate limit — caps view inflation from a single client while
  // letting genuine unique visitors through (they're deduped by cookie first).
  const { limited, retryAfter } = rateLimit(request, {
    windowMs: 15 * 60 * 1000,
    max: 60,
    scope: `views:${slug}`,
  });
  if (limited) {
    return rateLimitResponse(retryAfter);
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', slug)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Atomic only. A failed RPC must not amplify an outage or double count a
    // write whose response was lost.
    const { error: rpcError } = await supabase.rpc('increment_views', { profile_id: profile.id });
    if (rpcError) {
      return NextResponse.json({ error: 'Tracking temporarily unavailable', code: 'DATABASE_UNAVAILABLE', hint: 'The profile remains available. Do not retry this view event.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }

    // Set a cookie to prevent duplicate counting (expires in 24 hours)
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set(viewCookieName, '1', {
      httpOnly: true,
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'lax',
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('Error incrementing view count:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: 'Failed to increment view count.', details: errorMessage }, { status: 500 });
  }
}
