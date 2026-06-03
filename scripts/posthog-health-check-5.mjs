const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID || '356601';
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;

async function checkExceptions() {
  const res = await fetch(`https://us.i.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query: `SELECT event, count() FROM events WHERE (event = '$exception' OR event ILIKE '%error%') AND timestamp >= now() - INTERVAL 7 DAY GROUP BY event`
      }
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data.results, null, 2));
}

checkExceptions();
