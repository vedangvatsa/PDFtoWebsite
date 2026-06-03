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

async function runAnalysis() {
  console.log('--- POSTHOG DEEP DATA SCIENCE ---');
  
  // 1. Most Popular Pages
  const topPages = await runQuery(`
    SELECT properties.$current_url, count()
    FROM events
    WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 30 DAY
    GROUP BY properties.$current_url
    ORDER BY count() DESC
    LIMIT 10
  `, 'Top Pages');
  
  console.log('\n🔥 TOP 10 MOST VIEWED PAGES (Last 30 Days):');
  if (topPages) topPages.forEach(r => console.log(`${r[1]} views: ${r[0]}`));

  // 2. Best Traffic Sources (Referrers)
  const referrers = await runQuery(`
    SELECT properties.$referrer, count()
    FROM events
    WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 30 DAY AND properties.$referrer IS NOT NULL AND properties.$referrer != ''
    GROUP BY properties.$referrer
    ORDER BY count() DESC
    LIMIT 10
  `, 'Top Referrers');
  
  console.log('\n🚀 TOP 10 TRAFFIC SOURCES (Last 30 Days):');
  if (referrers) referrers.forEach(r => console.log(`${r[1]} views from: ${r[0]}`));

  // 3. User Devices / OS to optimize for
  const devices = await runQuery(`
    SELECT properties.$os, properties.$device_type, count()
    FROM events
    WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 30 DAY
    GROUP BY properties.$os, properties.$device_type
    ORDER BY count() DESC
    LIMIT 5
  `, 'Devices');
  
  console.log('\n📱 TOP USER DEVICES & OS:');
  if (devices) devices.forEach(r => console.log(`${r[2]} views: ${r[0]} (${r[1] || 'Unknown Device'})`));

  // 4. Most Clicked Elements
  const clicks = await runQuery(`
    SELECT elements_chain, count()
    FROM events
    WHERE event = '$autocapture' AND properties.$event_type = 'click' AND timestamp >= now() - INTERVAL 30 DAY
    GROUP BY elements_chain
    ORDER BY count() DESC
    LIMIT 5
  `, 'Top Clicks');
  
  console.log('\n🖱️ MOST CLICKED UI ELEMENTS (Last 30 Days):');
  if (clicks && clicks.length > 0) {
    clicks.forEach(r => {
      // Try to parse the element chain to make it readable
      let el = r[0];
      if (el) {
        // Just extract text or tag for readability
        const match = el.match(/(href="[^"]+"|text="[^"]+"|class="[^"]+")/g);
        el = match ? match.join(' ') : el.substring(0, 100) + '...';
      }
      console.log(`${r[1]} clicks: ${el}`);
    });
  }
  
  // 5. Engagement by Country
  const countries = await runQuery(`
    SELECT properties.$geoip_country_name, count()
    FROM events
    WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 30 DAY AND properties.$geoip_country_name IS NOT NULL
    GROUP BY properties.$geoip_country_name
    ORDER BY count() DESC
    LIMIT 5
  `, 'Countries');
  
  console.log('\n🌍 TOP 5 GEOGRAPHIES:');
  if (countries) countries.forEach(r => console.log(`${r[1]} views: ${r[0]}`));
}

runAnalysis();
