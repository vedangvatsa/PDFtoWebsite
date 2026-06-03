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

async function checkExceptions() {
  const rawExceptions = await runQuery(`
    SELECT properties
    FROM events
    WHERE event = '$exception' AND timestamp >= now() - INTERVAL 7 DAY
    LIMIT 3
  `, 'Raw Exceptions');
  
  console.log('\n🚨 Raw Exception Properties:');
  if (rawExceptions && rawExceptions.length > 0) {
    rawExceptions.forEach(r => console.log(JSON.stringify(JSON.parse(r[0]), null, 2).slice(0, 500) + '...'));
  } else {
    console.log('No exception details available.');
  }
}

checkExceptions();
