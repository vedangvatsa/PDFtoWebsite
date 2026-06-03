import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Key Length: ${serviceKey?.length || 0}`);
  
  try {
    const url = `${supabaseUrl}/rest/v1/jobs?limit=1`;
    console.log(`Fetching: ${url}`);
    
    const start = Date.now();
    const res = await fetch(url, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    });
    const elapsed = Date.now() - start;
    
    console.log(`Response Status: ${res.status} (${res.statusText})`);
    console.log(`Time taken: ${elapsed}ms`);
    console.log(`Headers:`, Object.fromEntries(res.headers.entries()));
    
    const text = await res.text();
    console.log(`Body:`, text);
  } catch (err) {
    console.error(`Connection Exception:`, err.message);
    if (err.cause) console.error(`Cause:`, err.cause);
  }
}

run();
