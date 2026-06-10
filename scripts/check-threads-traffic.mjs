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
  if (data.error) { console.error('Query error:', JSON.stringify(data.error)); return null; }
  return data;
}

function printTable(data) {
  if (!data?.results?.length) { console.log('  (no data)\n'); return; }
  const cols = data.columns;
  const rows = data.results.map(r => {
    const obj = {};
    cols.forEach((c, i) => obj[c] = r[i]);
    return obj;
  });
  console.table(rows);
  console.log();
}

(async () => {
  // 1. Threads referrer traffic
  console.log('=== THREADS REFERRAL TRAFFIC (last 90 days) ===');
  printTable(await hogql(`
    SELECT
      properties.$referring_domain AS referrer,
      count() AS visits,
      countDistinct(distinct_id) AS unique_visitors,
      min(timestamp) AS first_seen,
      max(timestamp) AS last_seen
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - interval 90 day
      AND (
        properties.$referring_domain ILIKE '%threads%'
        OR properties.$referrer ILIKE '%threads%'
      )
    GROUP BY referrer
    ORDER BY visits DESC
  `));

  // 2. Instagram referrer traffic (since Threads shares sometimes show as Instagram)
  console.log('=== INSTAGRAM REFERRAL TRAFFIC (last 90 days) ===');
  printTable(await hogql(`
    SELECT
      properties.$referring_domain AS referrer,
      count() AS visits,
      countDistinct(distinct_id) AS unique_visitors
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - interval 90 day
      AND (
        properties.$referring_domain ILIKE '%instagram%'
      )
    GROUP BY referrer
    ORDER BY visits DESC
  `));

  // 3. UTM source = threads or instagram
  console.log('=== UTM SOURCE: threads / instagram (last 90 days) ===');
  printTable(await hogql(`
    SELECT
      properties.utm_source AS source,
      count() AS visits,
      countDistinct(distinct_id) AS unique_visitors
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - interval 90 day
      AND properties.utm_source IN ('threads', 'instagram')
    GROUP BY source
    ORDER BY visits DESC
  `));

  // 4. All social platform comparison
  console.log('=== ALL SOCIAL MEDIA REFERRERS COMPARISON (last 90 days) ===');
  printTable(await hogql(`
    SELECT
      multiIf(
        properties.$referring_domain ILIKE '%linkedin%', 'LinkedIn',
        properties.$referring_domain ILIKE '%facebook%', 'Facebook',
        properties.$referring_domain ILIKE '%instagram%', 'Instagram',
        properties.$referring_domain ILIKE '%threads%', 'Threads',
        properties.$referring_domain IN ('x.com', 'twitter.com', 't.co'), 'X/Twitter',
        properties.$referring_domain ILIKE '%reddit%', 'Reddit',
        properties.$referring_domain ILIKE '%bsky%', 'Bluesky',
        properties.$referring_domain ILIKE '%youtube%', 'YouTube',
        properties.$referring_domain ILIKE '%telegram%', 'Telegram',
        properties.$referring_domain ILIKE '%whatsapp%', 'WhatsApp',
        'Other'
      ) AS platform,
      count() AS visits,
      countDistinct(distinct_id) AS unique_visitors
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - interval 90 day
      AND (
        properties.$referring_domain ILIKE '%linkedin%'
        OR properties.$referring_domain ILIKE '%facebook%'
        OR properties.$referring_domain ILIKE '%instagram%'
        OR properties.$referring_domain ILIKE '%threads%'
        OR properties.$referring_domain IN ('x.com', 'twitter.com', 't.co')
        OR properties.$referring_domain ILIKE '%reddit%'
        OR properties.$referring_domain ILIKE '%bsky%'
        OR properties.$referring_domain ILIKE '%youtube%'
        OR properties.$referring_domain ILIKE '%telegram%'
        OR properties.$referring_domain ILIKE '%whatsapp%'
      )
    GROUP BY platform
    ORDER BY visits DESC
  `));

  // 5. All UTM sources
  console.log('=== ALL UTM SOURCES (last 90 days) ===');
  printTable(await hogql(`
    SELECT
      properties.utm_source AS source,
      count() AS visits,
      countDistinct(distinct_id) AS unique_visitors
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - interval 90 day
      AND properties.utm_source IS NOT NULL
      AND properties.utm_source != ''
    GROUP BY source
    ORDER BY visits DESC
    LIMIT 20
  `));

  // 6. Daily breakdown of threads/instagram traffic
  console.log('=== THREADS + INSTAGRAM DAILY TRAFFIC (last 30 days) ===');
  printTable(await hogql(`
    SELECT
      toDate(timestamp) AS day,
      countIf(properties.$referring_domain ILIKE '%threads%' OR properties.$referrer ILIKE '%threads%') AS threads_visits,
      countIf(properties.$referring_domain ILIKE '%instagram%') AS instagram_visits,
      countIf(properties.utm_source = 'threads') AS utm_threads,
      countIf(properties.utm_source = 'instagram') AS utm_instagram
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - interval 30 day
      AND (
        properties.$referring_domain ILIKE '%threads%'
        OR properties.$referrer ILIKE '%threads%'
        OR properties.$referring_domain ILIKE '%instagram%'
        OR properties.utm_source IN ('threads', 'instagram')
      )
    GROUP BY day
    ORDER BY day
  `));
})();
