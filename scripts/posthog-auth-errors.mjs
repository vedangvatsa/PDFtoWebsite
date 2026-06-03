const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID || '356601';
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;

async function runQuery(queryStr) {
  try {
    const res = await fetch(`https://us.i.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: { kind: 'HogQLQuery', query: queryStr } })
    });
    return (await res.json()).results;
  } catch (err) { return null; }
}

async function run() {
  const events = await runQuery(`
    SELECT event, properties.error, count()
    FROM events
    WHERE event IN ('magic_link_failed', 'google_failed', 'auth_failed') AND timestamp >= now() - INTERVAL 30 DAY
    GROUP BY event, properties.error
    ORDER BY count() DESC
  `);
  console.log("Captured Auth Errors from Frontend:");
  if (events && events.length > 0) {
    events.forEach(r => console.log(`[${r[2]}x] ${r[0]}: ${r[1]}`));
  } else {
    console.log('No specific frontend error captures found.');
  }
}

run();
