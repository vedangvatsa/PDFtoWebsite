

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('Set SUPABASE_URL and SUPABASE_KEY env vars'); process.exit(1); }

async function main() {
  console.log('Deleting Impuls HRK jobs...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/jobs?company=eq.Impuls HRK`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=representation'
    }
  });

  if (res.ok) {
    const data = await res.json();
    console.log(`Deleted ${data.length} jobs.`);
  } else {
    console.error('Failed to delete:', await res.text());
  }
}

main();
