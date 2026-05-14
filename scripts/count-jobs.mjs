const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('Set SUPABASE_URL and SUPABASE_KEY env vars'); process.exit(1); }

async function getCount() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/jobs?select=id&limit=1`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'count=exact'
    }
  });
  const count = res.headers.get('content-range');
  console.log('Count:', count);
}
getCount();
