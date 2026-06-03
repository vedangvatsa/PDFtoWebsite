import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkJobs() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  
  // Exact count total
  const { count: exactTotal } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
  
  // Exact count 30 days
  const { count: exact30 } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).gt('created_at', thirtyDaysAgo);
  
  // Estimated count 30 days
  const { count: est30 } = await supabase.from('jobs').select('*', { count: 'estimated', head: true }).gt('created_at', thirtyDaysAgo);

  console.log(`Total jobs in DB: ${exactTotal}`);
  console.log(`Exact jobs in last 30 days: ${exact30}`);
  console.log(`Estimated jobs in last 30 days (what API returns): ${est30}`);
}

checkJobs();
