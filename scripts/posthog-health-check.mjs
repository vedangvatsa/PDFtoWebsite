const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID || '356601';
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;

async function runQuery(queryStr, name) {
  try {
    const res = await fetch(`https://us.i.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: queryStr
        }
      })
    });
    const data = await res.json();
    if (data.error) {
      console.error(`Error in ${name}:`, data.error);
      return null;
    }
    return data.results;
  } catch (err) {
    console.error(`Failed to fetch ${name}:`, err);
    return null;
  }
}

async function checkHealth() {
  console.log('--- POSTHOG HEALTH CHECK ---');
  
  // 1. Pageviews over the last 7 days
  const traffic = await runQuery(`
    SELECT toDate(timestamp), count() 
    FROM events 
    WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 7 DAY
    GROUP BY toDate(timestamp)
    ORDER BY toDate(timestamp) ASC
  `, 'Daily Traffic');
  
  console.log('\n📅 Daily Pageviews (Last 7 Days):');
  if (traffic) traffic.forEach(r => console.log(`${r[0]}: ${r[1]} views`));

  // 2. Top 404/Error Pages (Looking for "Not Found" or specific error titles)
  const errors = await runQuery(`
    SELECT properties.$current_url, count()
    FROM events
    WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 7 DAY 
      AND (properties.$current_url ILIKE '%404%' OR properties.$title ILIKE '%Not Found%' OR properties.$title ILIKE '%Error%')
    GROUP BY properties.$current_url
    ORDER BY count() DESC
    LIMIT 10
  `, '404 Errors');
  
  console.log('\n⚠️ Potential 404/Error Pages (Last 7 Days):');
  if (errors && errors.length > 0) {
    errors.forEach(r => console.log(`${r[1]} hits: ${r[0]}`));
  } else {
    console.log('No major 404s detected.');
  }

  // 3. Exception Events (if tracked)
  const exceptions = await runQuery(`
    SELECT event, count()
    FROM events
    WHERE event = '$exception' OR event ILIKE '%error%' AND timestamp >= now() - INTERVAL 7 DAY
    GROUP BY event
    ORDER BY count() DESC
    LIMIT 5
  `, 'Exceptions');
  
  console.log('\n🚨 JS Exceptions / Error Events:');
  if (exceptions && exceptions.length > 0) {
    exceptions.forEach(r => console.log(`${r[1]} hits: ${r[0]}`));
  } else {
    console.log('No exception events recorded.');
  }

  // 4. Dead Clicks / Rage Clicks
  const frustration = await runQuery(`
    SELECT properties.$current_url, count()
    FROM events
    WHERE event = '$autocapture' AND properties.$event_type = 'click' AND (properties.$is_rageclick = true OR properties.$is_deadclick = true) AND timestamp >= now() - INTERVAL 7 DAY
    GROUP BY properties.$current_url
    ORDER BY count() DESC
    LIMIT 5
  `, 'Frustration Clicks');

  console.log('\n😡 Pages with Frustration (Rage/Dead Clicks):');
  if (frustration && frustration.length > 0) {
    frustration.forEach(r => console.log(`${r[1]} bad clicks: ${r[0]}`));
  } else {
    console.log('No significant rage/dead clicks detected.');
  }
}

checkHealth();
