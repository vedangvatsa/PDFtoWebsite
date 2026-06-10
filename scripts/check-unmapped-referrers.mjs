const PH_PROJECT_ID = '356601';
const PH_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
if (!PH_API_KEY) { console.error('POSTHOG_PERSONAL_API_KEY not set'); process.exit(1); }

// Current SOURCE_MAP keys (from route.ts)
const MAPPED = new Set([
  '$direct', '', 'direct',
  'www.google.com', 'google.com', 'search.google.com',
  'accounts.google.com', 'com.google.android.googlequicksearchbox',
  'www.linkedin.com', 'linkedin.com', 'lnkd.in', 'com.linkedin.android',
  'www.facebook.com', 'facebook.com', 'm.facebook.com', 'l.facebook.com', 'lm.facebook.com',
  'www.instagram.com', 'instagram.com', 'l.instagram.com',
  'l.threads.com', 'threads.net', 'www.threads.net',
  'twitter.com', 'x.com', 't.co',
  'www.reddit.com', 'reddit.com',
  'wa.me', 'web.whatsapp.com', 'whatsapp.com',
  't.me', 'web.telegram.org', 'org.telegram.messenger.web',
  'bsky.app', 'bsky.social',
  'www.tumblr.com', 'tumblr.com',
  'dev.to', 'hashnode.com',
  'www.youtube.com', 'youtube.com', 'youtu.be',
  'github.com', 'www.github.com',
  'mail.google.com', 'com.google.android.gm',
  'outlook.live.com', 'outlook.office.com',
  'search.brave.com', 'bing.com', 'cn.bing.com',
  'cvin.bio', 'temp-mail.org', 'substack.com',
]);

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

(async () => {
  // Get ALL referring domains with 2+ visits
  const res = await hogql(`
    SELECT
      properties.$referring_domain AS domain,
      count() AS visits,
      countDistinct(distinct_id) AS uniques
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - interval 90 day
      AND properties.$referring_domain IS NOT NULL
      AND properties.$referring_domain != ''
    GROUP BY domain
    ORDER BY visits DESC
    LIMIT 200
  `);

  if (!res?.results?.length) { console.log('No data'); return; }

  const all = res.results.map(r => ({ domain: r[0], visits: r[1], uniques: r[2] }));

  console.log(`=== ALL REFERRING DOMAINS (${all.length} total, last 90 days) ===`);
  console.table(all);

  const unmapped = all.filter(r => !MAPPED.has(r.domain?.toLowerCase()));
  console.log(`\n=== UNMAPPED DOMAINS (${unmapped.length} not in SOURCE_MAP) ===`);
  console.table(unmapped);

  // Also check UTM sources that might need mapping
  const utmRes = await hogql(`
    SELECT
      properties.utm_source AS source,
      count() AS visits
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - interval 90 day
      AND properties.utm_source IS NOT NULL
      AND properties.utm_source != ''
    GROUP BY source
    ORDER BY visits DESC
  `);
  if (utmRes?.results?.length) {
    console.log('\n=== ALL UTM SOURCES ===');
    console.table(utmRes.results.map(r => ({ source: r[0], visits: r[1] })));
  }
})();
