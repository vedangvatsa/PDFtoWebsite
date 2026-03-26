import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

// We recommend using the service role key for admin privileges in an API route.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAILS = ['vatsvedang@gmail.com'];

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
    const anonClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll().map(c => ({ name: c.name, value: c.value })) } }
    );
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

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', slug)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Atomic increment: try RPC first (recommended), fall back to read-write
    const { error: rpcError } = await supabase.rpc('increment_views', { profile_id: profile.id });
    if (rpcError) {
      // Fallback: read-write (tiny race window acceptable for resume view counters)
      const { data: current } = await supabase.from('profiles').select('views').eq('id', profile.id).single();
      const newViews = ((current?.views) || 0) + 1;
      await supabase.from('profiles').update({ views: newViews }).eq('id', profile.id);
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
