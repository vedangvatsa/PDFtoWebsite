const PH_PROJECT_ID = '356601';
const PH_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
if (!PH_API_KEY) { console.error('POSTHOG_PERSONAL_API_KEY not set'); process.exit(1); }

async function hogql(query) {
  const res = await fetch(`https://us.posthog.com/api/projects/${PH_PROJECT_ID}/query/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${PH_API_KEY}` },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  });
  const data = await res.json();
  if (data.error) { console.error('Error:', JSON.stringify(data.error)); return null; }
  return data;
}

const SOURCE_MAP = {
  '$direct': 'Direct', '': 'Direct', 'direct': 'Direct',
  'www.google.com': 'Google', 'google.com': 'Google', 'search.google.com': 'Google',
  'accounts.google.com': 'Google Auth', 'com.google.android.googlequicksearchbox': 'Google App',
  'docs.google.com': 'Google Docs',
  'www.linkedin.com': 'LinkedIn', 'linkedin.com': 'LinkedIn', 'lnkd.in': 'LinkedIn', 'com.linkedin.android': 'LinkedIn',
  'www.facebook.com': 'Facebook', 'facebook.com': 'Facebook', 'm.facebook.com': 'Facebook', 'l.facebook.com': 'Facebook', 'lm.facebook.com': 'Facebook',
  'l.messenger.com': 'Messenger',
  'www.instagram.com': 'Instagram', 'instagram.com': 'Instagram', 'l.instagram.com': 'Instagram',
  'l.threads.com': 'Threads', 'threads.net': 'Threads', 'www.threads.net': 'Threads',
  'twitter.com': 'X', 'x.com': 'X', 't.co': 'X', 'com.twitter.android': 'X',
  'www.reddit.com': 'Reddit', 'reddit.com': 'Reddit',
  'wa.me': 'WhatsApp', 'web.whatsapp.com': 'WhatsApp', 'whatsapp.com': 'WhatsApp',
  't.me': 'Telegram', 'web.telegram.org': 'Telegram', 'org.telegram.messenger.web': 'Telegram',
  'org.telegram.messenger': 'Telegram', 'org.telegram.plus': 'Telegram',
  'bsky.app': 'Bluesky', 'bsky.social': 'Bluesky',
  'www.tiktok.com': 'TikTok', 'tiktok.com': 'TikTok',
  'www.tumblr.com': 'Tumblr', 'tumblr.com': 'Tumblr',
  'dev.to': 'Dev.to', 'hashnode.com': 'Hashnode', 'medium.com': 'Medium',
  'www.youtube.com': 'YouTube', 'youtube.com': 'YouTube', 'youtu.be': 'YouTube',
  'github.com': 'GitHub', 'www.github.com': 'GitHub',
  'mail.google.com': 'Gmail', 'com.google.android.gm': 'Gmail',
  'outlook.live.com': 'Outlook', 'outlook.office.com': 'Outlook',
  'statics.teams.cdn.office.net': 'MS Teams',
  'search.brave.com': 'Brave Search',
  'bing.com': 'Bing', 'www.bing.com': 'Bing', 'cn.bing.com': 'Bing',
  'duckduckgo.com': 'DuckDuckGo', 'www.duckduckgo.com': 'DuckDuckGo',
  'search.yahoo.com': 'Yahoo', 'in.search.yahoo.com': 'Yahoo', 'fr.search.yahoo.com': 'Yahoo', 'ca.search.yahoo.com': 'Yahoo',
  'chatgpt.com': 'ChatGPT', 'claude.ai': 'Claude',
  'vercel.com': 'Vercel',
  'cvin.bio': 'Internal', 'veda.ng': 'Internal',
  'temp-mail.org': 'Email', '10minutemail.com': 'Email', 'substack.com': 'Substack',
};
function friendly(raw) {
  if (!raw) return 'Direct';
  const lower = raw.toLowerCase().trim();
  return SOURCE_MAP[lower] || raw;
}
function aggregate(rows, keyIdx, valIdx) {
  const agg = {};
  for (const r of rows) {
    const name = friendly(r[keyIdx]);
    agg[name] = (agg[name] || 0) + r[valIdx];
  }
  return Object.entries(agg).map(([k, v]) => [k, v]).sort((a, b) => b[1] - a[1]);
}

(async () => {
  // 1. Total unique visitors per source (90 days) — same timeframe as conversions
  const traffic = await hogql(`
    SELECT
      multiIf(
        properties.utm_source != '', properties.utm_source,
        properties.$referring_domain != '', properties.$referring_domain,
        'Direct'
      ) AS source,
      countDistinct(distinct_id) AS unique_visitors
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - interval 90 day
    GROUP BY source
    ORDER BY unique_visitors DESC
  `);

  // 2. Signups per source (90 days)
  const signups = await hogql(`
    SELECT
      first_source AS source,
      count() AS signups
    FROM (
      SELECT
        e.distinct_id,
        (
          SELECT multiIf(
            pv.properties.utm_source != '', pv.properties.utm_source,
            pv.properties.$referring_domain != '', pv.properties.$referring_domain,
            'Direct'
          )
          FROM events AS pv
          WHERE pv.distinct_id = e.distinct_id
            AND pv.event = '$pageview'
          ORDER BY pv.timestamp ASC
          LIMIT 1
        ) AS first_source
      FROM events AS e
      WHERE e.event IN ('auth_google_started', 'auth_magic_link_sent')
        AND e.timestamp >= now() - interval 90 day
      GROUP BY e.distinct_id
    )
    WHERE first_source IS NOT NULL AND first_source != ''
    GROUP BY first_source
    ORDER BY signups DESC
  `);

  if (!traffic?.results || !signups?.results) { console.log('Query failed'); return; }

  const trafficAgg = aggregate(traffic.results, 0, 1);
  const signupsAgg = aggregate(signups.results, 0, 1);

  const trafficMap = Object.fromEntries(trafficAgg);
  const signupsMap = Object.fromEntries(signupsAgg);

  // Build combined table
  const allSources = new Set([...trafficAgg.map(r => r[0]), ...signupsAgg.map(r => r[0])]);
  const rows = [];
  for (const source of allSources) {
    const visitors = trafficMap[source] || 0;
    const sups = signupsMap[source] || 0;
    const rate = visitors > 0 ? ((sups / visitors) * 100) : 0;
    rows.push({ source, visitors, signups: sups, conversion: rate.toFixed(2) + '%' });
  }

  // Sort by signups desc
  rows.sort((a, b) => b.signups - a.signups);

  console.log('\n=== CONVERSION BY SOURCE (90 days, sorted by signups) ===');
  console.table(rows);

  // Sort by conversion rate (only sources with 2+ signups to avoid noise)
  const meaningful = rows.filter(r => r.signups >= 2);
  meaningful.sort((a, b) => parseFloat(b.conversion) - parseFloat(a.conversion));
  console.log('\n=== CONVERSION RATE RANKING (min 2 signups, sorted by rate) ===');
  console.table(meaningful);

  // Summary
  const totalSignups = signupsAgg.reduce((s, r) => s + r[1], 0);
  console.log(`\nTotal signups (90d): ${totalSignups}`);
  if (meaningful.length > 0) {
    console.log(`Highest conversion: ${meaningful[0].source} at ${meaningful[0].conversion} (${meaningful[0].signups} signups from ${meaningful[0].visitors} visitors)`);
  }
})();
