import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createAnonFromRequest } from '@/utils/supabase/anon';
import { hogql, friendlySource, isPosthogConfigured } from '@/lib/posthog-hogql';

export async function GET(request: NextRequest) {
  try {
    const anonClient = createAnonFromRequest(request);
    const { data: { user } } = await anonClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin;
    const { data: profile } = await supabase.from('profiles').select('username, views').eq('id', user.id).single();
    if (!profile?.username) {
      return NextResponse.json({ error: 'No profile' }, { status: 404 });
    }

    const slug = profile.username;
    // Defense-in-depth: the slug is interpolated into HogQL strings, so it must
    // be strictly validated even though it originates from the profiles table.
    if (typeof slug !== 'string' || !/^[a-zA-Z0-9_-]{1,40}$/.test(slug)) {
      return NextResponse.json({ error: 'Invalid profile' }, { status: 400 });
    }
    const profilePath = `/${slug}`;

    const [viewsByDay, viewsTotal, referrers, countries, avgTime, shareCount] = await Promise.all([
      hogql(`
        SELECT toDate(timestamp) AS day, count() AS views
        FROM events
        WHERE event = 'profile_viewed'
          AND properties.slug = '${slug}'
          AND timestamp >= now() - interval 7 day
        GROUP BY day ORDER BY day
      `),
      hogql(`
        SELECT count() AS views, countDistinct(distinct_id) AS uniques
        FROM events
        WHERE event = 'profile_viewed'
          AND properties.slug = '${slug}'
          AND timestamp >= now() - interval 30 day
      `),
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
      hogql(`
        SELECT properties.$geoip_country_name AS country, count() AS visits
        FROM events
        WHERE event = '$pageview'
          AND properties.$pathname = '${profilePath}'
          AND timestamp >= now() - interval 30 day
          AND properties.$geoip_country_name != ''
        GROUP BY country ORDER BY visits DESC LIMIT 3
      `),
      hogql(`
        SELECT avg(toFloat64OrNull(toString(properties.seconds))) AS avg_seconds
        FROM events
        WHERE event = 'profile_time_spent'
          AND properties.slug = '${slug}'
          AND timestamp >= now() - interval 30 day
      `),
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
      sources: (referrers || []).map((r: any) => ({ name: friendlySource(r.source, 'title'), count: r.visits })),
      countries: (countries || []).map((r: any) => ({ name: r.country, count: r.visits })),
      avgTime: Math.round(avgTime?.[0]?.avg_seconds || 0),
      shares: shareCount?.[0]?.shares || 0,
      available: isPosthogConfigured(),
    });
  } catch (error) {
    console.error('User analytics error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
