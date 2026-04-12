import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY');
  process.exit(1);
}

async function getJobsToCheck(limit = 100) {
  // Pick random jobs or oldest ones to check
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/jobs?select=id,apply_url&limit=${limit}&order=synced_at.asc`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  if (!res.ok) return [];
  return res.json();
}

async function isAlive(url) {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0 (CVin.Bio job checker)' },
      timeout: 10000,
    });
    // Consider it dead if it's 404. Other errors (like 403) might just be bot protection, so we keep them.
    return res.status !== 404;
  } catch (e) {
    // If it timed out or network failed, we assume it's still alive to be safe, unless it's a very specific error.
    return true; 
  }
}

async function prune() {
  console.log('🔍 Checking for dead job links...');
  const jobs = await getJobsToCheck(200);
  console.log(`Checking ${jobs.length} jobs...`);

  const deadIds = [];
  for (const job of jobs) {
    const alive = await isAlive(job.apply_url);
    if (!alive) {
      console.log(`❌ Dead Link: ${job.apply_url}`);
      deadIds.push(job.id);
    }
  }

  if (deadIds.length > 0) {
    console.log(`🗑️ Pruning ${deadIds.length} dead jobs...`);
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/jobs?id=in.(${deadIds.join(',')})`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    if (res.ok) console.log('✅ Pruned successfully.');
    else console.error('❌ Failed to prune:', await res.text());
  } else {
    console.log('✨ No dead links found in this batch.');
  }
}

prune().catch(console.error);
