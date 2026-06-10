const PH_PROJECT_ID = '356601';
const PH_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
if (!PH_API_KEY) { console.error('No key'); process.exit(1); }

async function hogql(query) {
  const res = await fetch(`https://us.posthog.com/api/projects/${PH_PROJECT_ID}/query/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${PH_API_KEY}` },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  });
  const data = await res.json();
  if (!data.results) { console.error('Query error:', JSON.stringify(data).slice(0, 500)); return null; }
  return data.results;
}

const SM = {
  'www.google.com':'Google','google.com':'Google','accounts.google.com':'Google Auth',
  'www.linkedin.com':'LinkedIn','linkedin.com':'LinkedIn','lnkd.in':'LinkedIn',
  'www.facebook.com':'Facebook','l.facebook.com':'Facebook','m.facebook.com':'Facebook',
  'l.threads.com':'Threads','threads.net':'Threads','www.threads.net':'Threads',
  'twitter.com':'X','x.com':'X','t.co':'X',
  'www.reddit.com':'Reddit','reddit.com':'Reddit',
  'wa.me':'WhatsApp','web.whatsapp.com':'WhatsApp',
  't.me':'Telegram','web.telegram.org':'Telegram','org.telegram.messenger':'Telegram',
  'www.instagram.com':'Instagram','instagram.com':'Instagram','l.instagram.com':'Instagram',
  'l.messenger.com':'Messenger',
  'bsky.app':'Bluesky','bsky.social':'Bluesky',
  'chatgpt.com':'ChatGPT','claude.ai':'Claude',
  'www.bing.com':'Bing','bing.com':'Bing',
  'duckduckgo.com':'DuckDuckGo','search.brave.com':'Brave',
  'cvin.bio':'Internal','veda.ng':'Internal',
  'mail.google.com':'Gmail','github.com':'GitHub',
  'www.youtube.com':'YouTube','www.tiktok.com':'TikTok',
};
const f = r => SM[r?.toLowerCase?.()] || r || 'Direct';
const agg = rows => {
  const m = {};
  for (const [s, c] of rows) { const n = f(s); m[n] = (m[n] || 0) + c; }
  return m;
};

(async () => {
  // Step 1: Get all users who signed up in last 90 days
  const signupUsers = await hogql(`
    SELECT distinct_id
    FROM events
    WHERE event IN ('auth_google_started', 'auth_magic_link_sent')
      AND timestamp >= now() - interval 90 day
    GROUP BY distinct_id
  `);
  if (!signupUsers) { console.log('Signup query failed'); return; }
  console.log('Total unique signup users:', signupUsers.length);

  // Step 2: For each signup user, find their first pageview's referrer
  // We batch this by getting ALL first pageviews with referrers
  const firstTouch = await hogql(`
    SELECT
      distinct_id,
      argMin(
        multiIf(
          properties.utm_source != '', properties.utm_source,
          properties.$referring_domain != '', properties.$referring_domain,
          'Direct'
        ),
        timestamp
      ) AS first_source
    FROM events
    WHERE event = '$pageview'
      AND distinct_id IN (
        SELECT distinct_id FROM events
        WHERE event IN ('auth_google_started', 'auth_magic_link_sent')
          AND timestamp >= now() - interval 90 day
        GROUP BY distinct_id
      )
    GROUP BY distinct_id
  `);
  if (!firstTouch) { console.log('First touch query failed'); return; }

  // Step 3: Traffic (90 days) for fair comparison
  const traffic = await hogql(`
    SELECT
      multiIf(
        properties.utm_source != '', properties.utm_source,
        properties.$referring_domain != '', properties.$referring_domain,
        'Direct'
      ) AS source,
      uniq(distinct_id) AS visitors
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - interval 90 day
    GROUP BY source
    ORDER BY visitors DESC
  `);
  if (!traffic) { console.log('Traffic query failed'); return; }

  // Aggregate first-touch sources
  const signupsBySource = {};
  for (const [, src] of firstTouch) {
    const name = f(src);
    signupsBySource[name] = (signupsBySource[name] || 0) + 1;
  }

  const tM = agg(traffic);

  const rows = [];
  for (const src of new Set([...Object.keys(signupsBySource), ...Object.keys(tM)])) {
    const v = tM[src] || 0;
    const s = signupsBySource[src] || 0;
    if (s > 0) rows.push({ source: src, visitors: v, signups: s, rate: v > 0 ? ((s / v) * 100).toFixed(2) + '%' : 'N/A' });
  }

  rows.sort((a, b) => b.signups - a.signups);
  console.log('\n=== FIRST-TOUCH ATTRIBUTION: ALL SOURCES → SIGNUPS (90d) ===');
  console.table(rows);

  const meaningful = rows.filter(r => r.signups >= 2 && r.source !== 'Internal');
  meaningful.sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate));
  console.log('\n=== CONVERSION RATE RANKING (min 2 signups, excl Internal) ===');
  console.table(meaningful);

  const total = rows.reduce((a, r) => a + r.signups, 0);
  console.log('\nTotal signups (90d):', total);
  if (meaningful.length) {
    console.log('\n🏆 HIGHEST CONVERSION:', meaningful[0].source, 'at', meaningful[0].rate,
      '(' + meaningful[0].signups + ' signups from ' + meaningful[0].visitors + ' visitors)');
  }
})();
