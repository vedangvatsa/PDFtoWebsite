import { NextRequest, NextResponse } from 'next/server';

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  scope?: string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

// Shared in-memory limiter (per-isolate). Cloudflare Workers run a single
// isolate per deployment, so this is consistent across requests — but it is
// not cluster-accurate if the Worker is ever replicated. Acceptable for
// abuse-mitigation purposes.
const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10000;

// Lazy cleanup — expired entries are purged as they are hit, and the map is
// fully cleared if it ever grows unbounded (prevents memory creep).
function sweep(now: number) {
  if (buckets.size <= MAX_BUCKETS) return;
  for (const [key, b] of buckets) {
    if (now > b.resetAt) buckets.delete(key);
  }
  if (buckets.size > MAX_BUCKETS) buckets.clear();
}

export function getClientIp(request: NextRequest): string {
  const cf = request.headers.get('cf-connecting-ip');
  if (cf) return cf;
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
}

export function rateLimit(
  request: NextRequest,
  { windowMs, max, scope }: RateLimitOptions
): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  sweep(now);
  const key = `${getClientIp(request)}|${scope || 'default'}`;

  let entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    buckets.set(key, entry);
    return { limited: false, retryAfter: 0 };
  }

  if (entry.count >= max) {
    return { limited: true, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }

  entry.count++;
  return { limited: false, retryAfter: 0 };
}

export function rateLimitResponse(retryAfter: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) },
    }
  );
}
