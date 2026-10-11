import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  const expected = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  const hash = (value: string) => createHash('sha256').update(value).digest();
  if (!expected || !provided || !timingSafeEqual(hash(provided), hash(expected))) {
    return NextResponse.json({ error: 'Authentication required', code: 'AUTH_REQUIRED', hint: 'This endpoint is for the trusted ingestion worker.' }, { status: 401 });
  }
  revalidateTag('public-jobs', { expire: 0 });
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}
