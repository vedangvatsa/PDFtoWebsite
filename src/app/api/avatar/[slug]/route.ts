import { NextRequest, NextResponse } from 'next/server';
import { getProfileBySlug } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isSafeFetchUrl(raw: string): string | null {
  let u: URL;
  try { u = new URL(raw); } catch { return null; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  const h = u.hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return null;
  // Reject IP-literal hosts (covers 169.254.169.254 metadata, 127.0.0.1, RFC1918, ::1)
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h) || h.includes(':')) return null;
  return u.toString();
}

export async function GET(req: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  const data = await getProfileBySlug(slug);
  if (!data || !data.profile.avatarUrl) {
    return new NextResponse('Not found', { status: 404 });
  }

  const avatar = data.profile.avatarUrl;
  
  // If it's a standard HTTP link, fetch and pipe it from our origin
  // This avoids canvas CORS taint when drawing user photos on canvas story cards
  if (avatar.startsWith('http')) {
    const safeUrl = isSafeFetchUrl(avatar);
    if (!safeUrl) return new NextResponse('Blocked URL', { status: 400 });

    let optimizedUrl = safeUrl;
    if (optimizedUrl.includes('googleusercontent.com')) {
      optimizedUrl = optimizedUrl.replace(/=s\d+-c/, '=s400-c').replace(/=s\d+$/, '=s400');
      if (!optimizedUrl.includes('=s400')) optimizedUrl = optimizedUrl + '=s400-c';
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const upstream = await fetch(optimizedUrl, {
        headers: { 'User-Agent': 'CVinBio/1.0' },
        signal: controller.signal,
      });
      if (!upstream.ok) return new NextResponse('Upstream error', { status: 502 });
      const contentType = upstream.headers.get('content-type') || 'image/jpeg';
      return new NextResponse(upstream.body, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=900, stale-while-revalidate=3600',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch {
      return new NextResponse('Fetch failed', { status: 502 });
    } finally {
      clearTimeout(timeout);
    }
  }

  // If it's a Base64 string, parse and serve the binary image natively!
  if (avatar.startsWith('data:image/')) {
    const matches = avatar.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const type = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': `image/${type}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }
  }

  return new NextResponse('Invalid avatar format', { status: 400 });
}
