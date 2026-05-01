import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID!; // e.g. "@cvinbio_jobs"
const CRON_SECRET = process.env.CRON_SECRET || 'cvinbio-tg-2026';

/** Format a single job as a Telegram message with HTML */
function formatJob(job: any): string {
  const company = job.company || 'Unknown';
  const title = job.title || 'Untitled';
  const location = job.location || 'Not specified';
  const type = job.job_type || '';
  const tags = (job.tags || []).slice(0, 5).map((t: string) => `#${t.replace(/[\s.\/\-\+]/g, '_')}`).join(' ');
  const salary = job.salary ? `\n💰 ${job.salary}` : '';
  const applyUrl = job.apply_url || '';

  let msg = `🏢 <b>${escapeHtml(company)}</b>\n`;
  msg += `💼 <b>${escapeHtml(title)}</b>\n`;
  msg += `📍 ${escapeHtml(location)}`;
  if (type) msg += ` · ${escapeHtml(type)}`;
  msg += salary;
  if (applyUrl) msg += `\n\n<a href="${applyUrl}">Apply Now →</a>`;
  if (tags) msg += `\n\n${tags}`;
  msg += `\n\n—\n🔗 More jobs at <a href="https://cvin.bio/jobs">cvin.bio/jobs</a>`;

  return msg;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Send a message to Telegram */
async function sendTelegramMessage(text: string): Promise<boolean> {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHANNEL_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    }),
  });

  const data = await res.json();
  if (!data.ok) {
    console.error('Telegram send failed:', data);
    return false;
  }
  return true;
}

export async function GET(request: NextRequest) {
  // Simple auth check — cron-job.org will send this as a query param
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    return NextResponse.json({ error: 'Telegram not configured' }, { status: 500 });
  }

  // Fetch jobs published in the last 24 hours that haven't been posted yet
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, company, location, job_type, salary, tags, apply_url, published_at')
    .gte('published_at', twentyFourHoursAgo)
    .is('telegram_posted_at', null)
    .not('company', 'ilike', '%Gopuff%')
    .order('published_at', { ascending: false })
    .limit(10); // Max 10 jobs per cron run to avoid Telegram rate limits

  if (error) {
    console.error('Supabase query error:', error);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ message: 'No new jobs to post', posted: 0 });
  }

  let posted = 0;
  const failed: string[] = [];

  for (const job of jobs) {
    const message = formatJob(job);
    const success = await sendTelegramMessage(message);

    if (success) {
      // Mark as posted so we never double-post
      await supabase
        .from('jobs')
        .update({ telegram_posted_at: new Date().toISOString() })
        .eq('id', job.id);
      posted++;
    } else {
      failed.push(job.id);
    }

    // Telegram rate limit: max 20 msgs/min to a channel
    await new Promise(r => setTimeout(r, 3500));
  }

  return NextResponse.json({
    message: `Posted ${posted} jobs to Telegram`,
    posted,
    failed,
    total_found: jobs.length,
  });
}
