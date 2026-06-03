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

async function investigateAuthErrors() {
  console.log('--- DEEP DIVE: AUTH ERRORS ---');

  // Find the exact sessions/persons who hit the auth error, and their device types
  const authErrorSessions = await runQuery(`
    SELECT person.id, properties.$device_type, properties.$os, timestamp
    FROM events
    WHERE event = '$pageview' AND properties.$current_url ILIKE '%error=auth%' AND timestamp >= now() - INTERVAL 30 DAY
    ORDER BY timestamp DESC
    LIMIT 20
  `, 'Auth Error Sessions');

  console.log('\n🔍 Last 20 Auth Errors (Device & OS):');
  if (authErrorSessions) {
    authErrorSessions.forEach(r => console.log(`Time: ${r[3]} | Person: ${r[0].substring(0,8)}... | Device: ${r[1] || 'Unknown'} | OS: ${r[2]}`));
  }

  // Look at events that happened *right before* the auth error for those people
  // Let's just find the sequence of events for a couple of people who had errors
  if (authErrorSessions && authErrorSessions.length > 0) {
    const samplePerson = authErrorSessions[0][0];
    
    const priorEvents = await runQuery(`
      SELECT event, properties.$current_url, properties.$browser, timestamp
      FROM events
      WHERE person.id = '${samplePerson}' AND timestamp >= now() - INTERVAL 30 DAY
      ORDER BY timestamp ASC
      LIMIT 15
    `, 'User Journey');

    console.log(`\n🕵️ User Journey for sample person (${samplePerson.substring(0,8)}...):`);
    if (priorEvents) {
      priorEvents.forEach(r => console.log(`[${r[3]}] ${r[0]} | ${r[2]} | ${r[1]}`));
    }
  }

  // Let's aggregate what the previous event was for all people who hit error=auth
  const generalJourney = await runQuery(`
    SELECT event, count()
    FROM events
    WHERE timestamp >= now() - INTERVAL 30 DAY AND person.id IN (
      SELECT person.id FROM events WHERE event = '$pageview' AND properties.$current_url ILIKE '%error=auth%' AND timestamp >= now() - INTERVAL 30 DAY
    ) AND properties.$current_url NOT ILIKE '%error=auth%'
    GROUP BY event
    ORDER BY count() DESC
    LIMIT 10
  `, 'Aggregated Prior Events');

  console.log('\n📊 What were these users doing in their sessions?');
  if (generalJourney) {
    generalJourney.forEach(r => console.log(`${r[1]} hits: ${r[0]}`));
  }
}

investigateAuthErrors();
