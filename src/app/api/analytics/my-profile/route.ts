import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// ── PostHog HogQL helper ────────────────────────────────────────────────────
const PH_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const PH_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const PH_HOST = 'https://us.posthog.com';

async function hogql(query: string): Promise<any[] | null> {
  if (!PH_API_KEY || !PH_PROJECT_ID) return null;
  try {
    const res = await fetch(`${PH_HOST}/api/projects/${PH_PROJECT_ID}/query/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${PH_API_KEY}` },
      body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.results || !data.columns) return null;
    return data.results.map((row: any[]) => {
      const obj: any = {};
      data.columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
      return obj;
    });
  } catch { return null; }
}

/** Map raw referrer domains to friendly names */
const SOURCE_MAP: Record<string, string> = {
  '$direct': 'Direct', '': 'Direct', 'direct': 'Direct',
  'www.google.com': 'Google', 'google.com': 'Google',
  'www.linkedin.com': 'LinkedIn', 'linkedin.com': 'LinkedIn', 'lnkd.in': 'LinkedIn',
  'www.facebook.com': 'Facebook', 'facebook.com': 'Facebook', 'm.facebook.com': 'Facebook', 'l.facebook.com': 'Facebook',
  'www.instagram.com': 'Instagram', 'instagram.com': 'Instagram', 'l.instagram.com': 'Instagram',
  'twitter.com': 'X', 'x.com': 'X', 't.co': 'X',
  'www.reddit.com': 'Reddit', 'reddit.com': 'Reddit',
  'wa.me': 'WhatsApp', 'web.whatsapp.com': 'WhatsApp', 'whatsapp.com': 'WhatsApp',
  't.me': 'Telegram', 'web.telegram.org': 'Telegram',
  'bsky.app': 'Bluesky',
  'www.tumblr.com': 'Tumblr', 'tumblr.com': 'Tumblr',
  'dev.to': 'Dev.to',
  'hashnode.com': 'Hashnode',
  'www.youtube.com': 'YouTube', 'youtube.com': 'YouTube', 'youtu.be': 'YouTube',
  'github.com': 'GitHub', 'www.github.com': 'GitHub',
  'mail.google.com': 'Gmail',
  'outlook.live.com': 'Outlook', 'outlook.office.com': 'Outlook',
};
function friendlySource(raw: string): string {
  if (!raw) return 'Direct';
  const lower = raw.toLowerCase().trim();
  if (SOURCE_MAP[lower]) return SOURCE_MAP[lower];
  // Fallback: strip www. and TLD, capitalize
  const clean = lower.replace(/^www\./, '').replace(/\.(com|org|net|io|co|app|me)$/, '');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export async function GET(request: NextRequest) {
  try {
    // Auth: get current user from cookie
    const anonClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll().map(c => ({ name: c.name, value: c.value })) } }
    );
    const { data: { user } } = await anonClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get this user's profile slug
    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: profile } = await supabase.from('profiles').select('username, views').eq('id', user.id).single();
    if (!profile?.username) {
      return NextResponse.json({ error: 'No profile' }, { status: 404 });
    }

    const slug = profile.username;
    const profilePath = `/${slug}`;

    // Run PostHog queries in parallel — all scoped to this user's slug
    const [viewsByDay, viewsTotal, referrers, countries, avgTime, shareCount] = await Promise.all([
      // 7-day views sparkline
      hogql(`
        SELECT toDate(timestamp) AS day, count() AS views
        FROM events
        WHERE event = 'profile_viewed'
          AND properties.slug = '${slug}'
          AND timestamp >= now() - interval 7 day
        GROUP BY day ORDER BY day
      `),
      // Total views + uniques last 30 days
      hogql(`
        SELECT count() AS views, countDistinct(distinct_id) AS uniques
        FROM events
        WHERE event = 'profile_viewed'
          AND properties.slug = '${slug}'
          AND timestamp >= now() - interval 30 day
      `),
      // Top referrers
      hogql(`
        SELECT properties.$referring_domain AS source, count() AS visits
        FROM events
        WHERE event = '$pageview'
          AND properties.$pathname = '${profilePath}'
          AND timestamp >= now() - interval 30 day
          AND properties.$referring_domain != ''
          AND properties.$referring_domain != 'cvin.bio'
        GROUP BY source ORDER BY visits DESC LIMIT 3
      `),
      // Top countries
      hogql(`
        SELECT properties.$geoip_country_name AS country, count() AS visits
        FROM events
        WHERE event = '$pageview'
          AND properties.$pathname = '${profilePath}'
          AND timestamp >= now() - interval 30 day
          AND properties.$geoip_country_name != ''
        GROUP BY country ORDER BY visits DESC LIMIT 3
      `),
      // Avg time on profile
      hogql(`
        SELECT avg(toFloat64OrNull(toString(properties.seconds))) AS avg_seconds
        FROM events
        WHERE event = 'profile_time_spent'
          AND properties.slug = '${slug}'
          AND timestamp >= now() - interval 30 day
      `),
      // Total share events
      hogql(`
        SELECT count() AS shares
        FROM events
        WHERE event IN (
          'editor_share_x', 'editor_share_linkedin', 'editor_share_facebook',
          'editor_share_link_copied', 'editor_share_message_copied',
          'profile_share_link_copied', 'profile_share_linkedin',
          'profile_share_x', 'profile_share_facebook', 'profile_share_whatsapp',
          'profile_story_card_downloaded'
        )
          AND properties.slug = '${slug}'
          AND timestamp >= now() - interval 30 day
      `),
    ]);

    // Build 7-day sparkline data (fill missing days with 0)
    const sparkline: number[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const found = viewsByDay?.find((r: any) => r.day === dayStr);
      sparkline.push(found?.views || 0);
    }

    return NextResponse.json({
      views: viewsTotal?.[0]?.views || profile.views || 0,
      uniques: viewsTotal?.[0]?.uniques || 0,
      sparkline,
      sources: (referrers || []).map((r: any) => ({ name: friendlySource(r.source), count: r.visits })),
      countries: (countries || []).map((r: any) => ({ name: r.country, count: r.visits })),
      avgTime: Math.round(avgTime?.[0]?.avg_seconds || 0),
      shares: shareCount?.[0]?.shares || 0,
      available: !!(PH_API_KEY && PH_PROJECT_ID),
    });
  } catch (error) {
    console.error('User analytics error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
