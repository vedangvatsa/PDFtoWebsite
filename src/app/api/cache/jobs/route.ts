import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const expected = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  const hash = (value: string) => createHash('sha256').update(value).digest();
  if (!expected || !provided || !timingSafeEqual(hash(provided), hash(expected))) {
    return NextResponse.json({ error: 'Authentication required', code: 'AUTH_REQUIRED', hint: 'This endpoint is for the trusted ingestion worker.' }, { status: 401 });
  }
  revalidateTag('public-jobs', { expire: 0 });
  revalidateTag('companies-directory', { expire: 0 });
  revalidatePath('/companies');
  revalidatePath('/fellowships');
  revalidatePath('/[slug]/[jobSlug]', 'page');
  revalidatePath('/jobs/[id]', 'page');
  // XML handlers also have an outer Next ISR cache, above their revision-keyed
  // Cache API layer. The bounded source inventory fits the first sitemap chunk.
  for (const path of ['/sitemap.xml', '/sitemap-jobs/0', '/rss.xml', '/indeed.xml', '/jooble.xml', '/jobtome.xml']) {
    revalidatePath(path);
  }
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}
