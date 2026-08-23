import { NextRequest, NextResponse } from 'next/server';

interface RateLimitOptions {
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

export interface RateLimitResult {
  limited: boolean;
  retryAfter: number;
  /** Configured quota for the window. */
  limit: number;
  /** Requests left in the current window. */
  remaining: number;
  /** Seconds until the window resets. */
  resetSeconds: number;
}

export function rateLimit(
  request: NextRequest,
  { windowMs, max, scope }: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const key = `${getClientIp(request)}|${scope || 'default'}`;

  const build = (count: number, resetAt: number): RateLimitResult => ({
    limited: false,
    retryAfter: 0,
    limit: max,
    remaining: Math.max(0, max - count),
    resetSeconds: Math.max(0, Math.ceil((resetAt - now) / 1000)),
  });

  let entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    buckets.set(key, entry);
    return build(1, entry.resetAt);
  }

  if (entry.count >= max) {
    return {
      ...build(entry.count, entry.resetAt),
      limited: true,
      retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count++;
  return build(entry.count, entry.resetAt);
}

/**
 * Standard rate-limit headers (RFC 9331 draft RateLimit-* plus the widely
 * supported X-RateLimit-* compat set) so agents can self-throttle.
 */
export function rateLimitHeaders(result: Pick<RateLimitResult, 'limit' | 'remaining' | 'resetSeconds'>): Record<string, string> {
  return {
    'API-Version': 'v1',
    'RateLimit-Limit': String(result.limit),
    'RateLimit-Remaining': String(Math.max(0, result.remaining)),
    'RateLimit-Reset': String(result.resetSeconds),
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(Math.max(0, result.remaining)),
    'X-RateLimit-Reset': String(result.resetSeconds),
  };
}

export function rateLimitResponse(
  retryAfter: number,
  info?: Partial<Pick<RateLimitResult, 'limit' | 'remaining' | 'resetSeconds'>>
): NextResponse {
  const headers: Record<string, string> = {
    'Retry-After': String(retryAfter),
    ...(info
      ? rateLimitHeaders({
          limit: info.limit ?? 0,
          remaining: 0,
          resetSeconds: info.resetSeconds ?? retryAfter,
        })
      : {}),
  };
  return NextResponse.json(
    {
      error: 'Too many requests. Please try again later.',
      code: 'RATE_LIMITED',
      hint: `Wait ${retryAfter}s before retrying.`,
    },
    { status: 429, headers }
  );
}
