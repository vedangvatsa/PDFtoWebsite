import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createAnonFromRequest } from '@/utils/supabase/anon';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const limit = rateLimit(request, { windowMs: 60_000, max: 60, scope: 'profile-cache' });
  if (limit.limited) return rateLimitResponse(limit.retryAfter, limit);
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Invalid origin', code: 'INVALID_ORIGIN', hint: 'Use the same-origin editor.' }, { status: 403 });
  }
  const { data: { user }, error } = await createAnonFromRequest(request).auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Authentication required', code: 'AUTH_REQUIRED', hint: 'Sign in before saving your profile.' }, { status: 401 });
  }
  // Global tag also invalidates the old slug after a rename and negative hits
  // on the new slug, without exporting/enumerating other users' profile data.
  revalidateTag('public-profiles', { expire: 0 });
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}
