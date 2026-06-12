import fs from 'fs';

// Read from .env.local
const envPath = './.env.local';
let phProjectToken = '';
let phPersonalApiKey = '';
let phProjectId = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
    if (match) {
      const k = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      if (k === 'NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN') phProjectToken = val;
      if (k === 'POSTHOG_PERSONAL_API_KEY') phPersonalApiKey = val;
      if (k === 'POSTHOG_PROJECT_ID') phProjectId = val;
    }
  });
}

console.log('Project Token:', phProjectToken ? phProjectToken.substring(0, 8) + '...' : 'missing');
console.log('Personal API Key:', phPersonalApiKey ? phPersonalApiKey.substring(0, 8) + '...' : 'missing');
console.log('Project ID:', phProjectId);

// Try using the PostHog Events API with the project token
// The /api/event endpoint is write-only, but /api/projects/{id}/query/ requires personal key
// Let's try the public Capture API to see if we can query events

// Actually, let's try the PostHog Query endpoint with the project token as a bearer
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

const hosts = ['https://us.i.posthog.com', 'https://us.posthog.com'];

for (const host of hosts) {
  console.log(`\nTrying ${host} with project token as bearer...`);
  try {
    const res = await fetch(`${host}/api/projects/${phProjectId}/query/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${phProjectToken}`,
      },
      body: JSON.stringify({
        query: { kind: 'HogQLQuery', query },
      }),
    });
    console.log('Status:', res.status);
    const text = await res.text();
    if (res.ok) {
      const data = JSON.parse(text);
      if (data.results && data.columns) {
        const list = data.results.map(row => {
          const obj = {};
          data.columns.forEach((col, i) => { obj[col] = row[i]; });
          return obj;
        });
        console.log(`\nFound ${list.length} deletion events:\n`);
        console.table(list);
      }
    } else {
      console.log('Response:', text.substring(0, 200));
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}
