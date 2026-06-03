import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const supabase = supabaseAdmin;

export async function POST(request: NextRequest) {
  try {
    const { ids, action } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0 || ids.length > 50) {
      return NextResponse.json({ error: 'ids: 1-50 required' }, { status: 400 });
    }
    if (action !== 'view' && action !== 'click') {
      return NextResponse.json({ error: 'action: view|click' }, { status: 400 });
    }

    const col = action === 'click' ? 'clicks' : 'views';

    // Atomic batch increment via SQL function
    const { error } = await supabase.rpc('batch_increment_jobs', {
      job_ids: ids,
      col_name: col,
    });

    if (error) {
      console.error('Track error:', error);
      // Fallback: simple per-row increment
      for (const id of ids) {
        const { data } = await supabase.from('jobs').select(col).eq('id', id).single();
        if (data) {
          await supabase.from('jobs').update({ [col]: ((data as Record<string, number>)[col] || 0) + 1 }).eq('id', id);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
