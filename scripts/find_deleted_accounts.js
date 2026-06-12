const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
let PH_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
let PH_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;

if (!PH_API_KEY && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      if (key === 'POSTHOG_PERSONAL_API_KEY') PH_API_KEY = val;
      if (key === 'POSTHOG_PROJECT_ID') PH_PROJECT_ID = val;
    }
  });
}

const query = `
  SELECT
    timestamp,
    distinct_id,
    person.properties.email AS email,
    person.properties.username AS username
  FROM events
  WHERE event = 'editor_account_deleted'
  ORDER BY timestamp DESC
  LIMIT 100
`;

async function tryHost(host) {
  console.log(`Trying host ${host}...`);
  try {
    const res = await fetch(`${host}/api/projects/${PH_PROJECT_ID}/query/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PH_API_KEY}`,
      },
      body: JSON.stringify({
        query: { kind: 'HogQLQuery', query }
      }),
    });
    console.log(`${host} response status:`, res.status);
    const text = await res.text();
    if (res.ok) {
      console.log(`Success on ${host}!`);
      return JSON.parse(text);
    } else {
      console.log(`${host} failed:`, text);
    }
  } catch (err) {
    console.log(`${host} threw error:`, err.message);
  }
  return null;
}

async function fetchDeleted() {
  const hosts = ['https://us.i.posthog.com', 'https://us.posthog.com', 'https://app.posthog.com', 'https://eu.posthog.com'];
  let data = null;
  for (const host of hosts) {
    data = await tryHost(host);
    if (data) break;
  }

  if (!data || !data.results || !data.columns) {
    console.log('Failed to fetch from all hosts.');
    return;
  }

  const list = data.results.map(row => {
    const obj = {};
    data.columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });

  console.log(`\nFound ${list.length} account deletion events:\n`);
  console.table(list);
}

fetchDeleted().catch(console.error);
