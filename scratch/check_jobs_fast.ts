import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Querying Supabase jobs table with gt(created_at, 30 days)...');
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  
  // Test A: count: 'exact' with gt('created_at')
  const startA = Date.now();
  try {
    const { count, error } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .gt('created_at', thirtyDaysAgo);
    console.log(`Test A (Exact Count with gt): count=${count}, error=${error ? JSON.stringify(error) : 'none'}, took=${Date.now() - startA}ms`);
  } catch (e) {
    console.error('Test A failed:', e);
  }

  // Test B: count: 'estimated' with gt('created_at')
  const startB = Date.now();
  try {
    const { count, error } = await supabase
      .from('jobs')
      .select('*', { count: 'estimated', head: true })
      .gt('created_at', thirtyDaysAgo);
    console.log(`Test B (Estimated Count with gt): count=${count}, error=${error ? JSON.stringify(error) : 'none'}, took=${Date.now() - startB}ms`);
  } catch (e) {
    console.error('Test B failed:', e);
  }

  // Test C: query with range, gt('created_at'), order
  const startC = Date.now();
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id,title,company,company_logo,location,job_type,salary,tags,apply_url,category,source,published_at')
      .not('company', 'ilike', '%Gopuff%')
      .gt('created_at', thirtyDaysAgo)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(0, 19);
    console.log(`Test C (Query with gt and order): rows=${data?.length || 0}, error=${error ? JSON.stringify(error) : 'none'}, took=${Date.now() - startC}ms`);
  } catch (e) {
    console.error('Test C failed:', e);
  }
}

run();
