import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Querying Supabase jobs table...');
  
  // Test 1: Full-table count & estimation latency
  const start1 = Date.now();
  try {
    const { count, error } = await supabase
      .from('jobs')
      .select('*', { count: 'estimated', head: true });
    console.log(`Test 1 (Estimated Count): count=${count}, error=${error ? JSON.stringify(error) : 'none'}, took=${Date.now() - start1}ms`);
  } catch (e) {
    console.error('Test 1 failed:', e);
  }

  // Test 2: Standard API query latency (entire table with sorting)
  const start2 = Date.now();
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id,title,company,location,job_type,published_at')
      .not('company', 'ilike', '%Gopuff%')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(0, 19);
    console.log(`Test 2 (Full Query with Sorting): rows=${data?.length || 0}, error=${error ? JSON.stringify(error) : 'none'}, took=${Date.now() - start2}ms`);
  } catch (e) {
    console.error('Test 2 failed:', e);
  }

  // Test 3: Active subset (last 30 days) count
  const start3 = Date.now();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  try {
    const { count, error } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .gt('created_at', thirtyDaysAgo);
    console.log(`Test 3 (Active Count last 30 days): count=${count}, error=${error ? JSON.stringify(error) : 'none'}, took=${Date.now() - start3}ms`);
  } catch (e) {
    console.error('Test 3 failed:', e);
  }

  // Test 4: Optimized query latency (last 30 days with sorting)
  const start4 = Date.now();
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id,title,company,location,job_type,published_at')
      .not('company', 'ilike', '%Gopuff%')
      .gt('created_at', thirtyDaysAgo)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(0, 19);
    console.log(`Test 4 (Optimized Query last 30 days): rows=${data?.length || 0}, error=${error ? JSON.stringify(error) : 'none'}, took=${Date.now() - start4}ms`);
  } catch (e) {
    console.error('Test 4 failed:', e);
  }
}

run();
