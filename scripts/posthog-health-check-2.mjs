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
  const exceptionDetails = await runQuery(`
    SELECT properties.$exception_type, properties.$exception_message, properties.$current_url, count()
    FROM events
    WHERE event = '$exception' AND timestamp >= now() - INTERVAL 7 DAY
    GROUP BY properties.$exception_type, properties.$exception_message, properties.$current_url
    ORDER BY count() DESC
    LIMIT 10
  `, 'Exception Details');
  
  console.log('\n🚨 JS Exceptions Details (Last 7 Days):');
  if (exceptionDetails && exceptionDetails.length > 0) {
    exceptionDetails.forEach(r => console.log(`[${r[3]}x] ${r[0]}: ${r[1]}\n    URL: ${r[2]}\n`));
  } else {
    console.log('No exception details available.');
  }
}

checkExceptions();
