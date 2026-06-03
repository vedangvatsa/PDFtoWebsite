import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY');
  process.exit(1);
}

async function run() {
  const url = `${SUPABASE_URL}/rest/v1/profiles?username=eq.aryan&select=id,full_name,username,skills`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!res.ok) {
    console.error(`Failed to fetch profile: ${res.statusText}`);
    return;
  }

  const profiles = await res.json();
  if (profiles.length === 0) {
    console.error('Profile not found with username "aryan"');
    return;
  }

  const profile = profiles[0];
  console.log('Found profile:', profile);
}

run().catch(console.error);
