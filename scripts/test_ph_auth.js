import fs from 'fs';
import path from 'path';

// Read from .env.local
const envPath = './.env.local';
let key = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
    if (match) {
      const k = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      if (k === 'POSTHOG_PERSONAL_API_KEY') key = val;
    }
  });
}

async function test() {
  const hosts = ['https://us.i.posthog.com', 'https://us.posthog.com', 'https://app.posthog.com', 'https://eu.posthog.com'];
  for (const host of hosts) {
    console.log('Testing host:', host);
    try {
      const res = await fetch(`${host}/api/users/@me/`, {
        headers: {
          Authorization: `Bearer ${key}`
        }
      });
      console.log('Status:', res.status);
      const data = await res.text();
      console.log('Response:', data.substring(0, 200));
    } catch(e) {
      console.log('Error:', e.message);
    }
  }
}

test();
