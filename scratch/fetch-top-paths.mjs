import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

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

async function run() {
  const topPages = await runQuery(`
    SELECT properties.$current_url, count()
    FROM events
    WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 30 DAY
    GROUP BY properties.$current_url
    ORDER BY count() DESC
    LIMIT 25
  `, 'Top Pages');
  
  console.log('RESULTS:');
  if (topPages) {
    topPages.forEach(r => console.log(`${r[1]} views: ${r[0]}`));
  }
}

run();
