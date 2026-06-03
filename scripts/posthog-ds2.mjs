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
  const authErrors = await runQuery(`
    SELECT toDate(timestamp), count()
    FROM events
    WHERE event = '$pageview' AND properties.$current_url ILIKE '%error=auth%'
    GROUP BY toDate(timestamp)
    ORDER BY toDate(timestamp) ASC
  `);
  console.log("Auth Error Trend:");
  if (authErrors) authErrors.forEach(r => console.log(`${r[0]}: ${r[1]} errors`));
}

run();
