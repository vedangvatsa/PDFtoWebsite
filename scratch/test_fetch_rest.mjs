import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  console.log('Testing Supabase REST API via fetch...');
  console.log(`URL: ${SUPABASE_URL}`);
  
  const start = Date.now();
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?limit=2`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });
    
    if (!res.ok) {
      console.error(`REST query failed: ${res.status} ${await res.text()}`);
    } else {
      const data = await res.json();
      console.log(`REST query success: profiles=${data.length}, took=${Date.now() - start}ms`);
    }
  } catch (e) {
    console.error('REST query error:', e);
  }

  console.log('Testing JOBS REST API with short limit...');
  const startJobs = Date.now();
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/jobs?limit=2`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });
    
    if (!res.ok) {
      console.error(`Jobs REST failed: ${res.status} ${await res.text()}`);
    } else {
      const data = await res.json();
      console.log(`Jobs REST success: jobs=${data.length}, took=${Date.now() - startJobs}ms`);
    }
  } catch (e) {
    console.error('Jobs REST error:', e);
  }
}

run();
