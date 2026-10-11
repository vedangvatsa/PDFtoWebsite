import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { withTimeout, DB_BUDGET } from '@/lib/db-timeout';

const supabase = supabaseAdmin;

export async function POST(request: NextRequest) {
  try {
    const { limited, retryAfter } = rateLimit(request, { windowMs: 60 * 60 * 1000, max: 120, scope: 'jobs-track' });
    if (limited) return rateLimitResponse(retryAfter);

    const { ids, action } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0 || ids.length > 50) {
      return NextResponse.json({ error: 'ids: 1-50 required', code: 'INVALID_TRACKING_EVENT', hint: 'Send between 1 and 50 job UUIDs.' }, { status: 400 });
    }
    if (action !== 'view' && action !== 'click') {
      return NextResponse.json({ error: 'action: view|click', code: 'INVALID_TRACKING_EVENT', hint: 'Use view or click.' }, { status: 400 });
    }

    const col = action === 'click' ? 'clicks' : 'views';

    // Atomic batch increment via SQL function
    if (ids.some((id: unknown) => typeof id !== 'string' || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id))) {
      return NextResponse.json({ error: 'Invalid job ID', code: 'INVALID_TRACKING_EVENT', hint: 'Use job UUIDs from /api/jobs.' }, { status: 400 });
    }
    const { error } = await withTimeout(supabase.rpc('batch_increment_jobs', {
      job_ids: [...new Set(ids)],
      col_name: col,
    }), DB_BUDGET.fast, 'job-tracking');

    if (error) {
      console.error('Track error:', error);
      return NextResponse.json({ error: 'Tracking temporarily unavailable', code: 'DATABASE_UNAVAILABLE', hint: 'Viewing and applying still work; do not retry this non-idempotent event.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const invalid = error instanceof SyntaxError;
    return NextResponse.json({ error: invalid ? 'Invalid request' : 'Tracking temporarily unavailable', code: invalid ? 'INVALID_TRACKING_EVENT' : 'DATABASE_UNAVAILABLE', hint: 'Send valid JSON; do not retry a tracking event after a timeout.' }, { status: invalid ? 400 : 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
