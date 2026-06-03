import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Testing the optimized API query...');
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  
  // Test 1: EXACT query from optimized route.ts
  const start1 = Date.now();
  try {
    const { data, error, count } = await supabase
      .from('jobs')
      .select('id,title,company,company_logo,location,job_type,salary,tags,apply_url,category,source,published_at', { count: 'estimated' })
      .gt('created_at', thirtyDaysAgo)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(0, 59);
    
    console.log(`Test 1 (Optimized Query): rows=${data?.length || 0}, count=${count}, error=${error ? JSON.stringify(error) : 'none'}, took=${Date.now() - start1}ms`);
  } catch (e) {
    console.error('Test 1 failed:', e);
  }

  // Test 2: Query WITHOUT any count
  const start2 = Date.now();
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id,title,company,company_logo,location,job_type,salary,tags,apply_url,category,source,published_at')
      .gt('created_at', thirtyDaysAgo)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(0, 59);
    
    console.log(`Test 2 (Omitted count): rows=${data?.length || 0}, error=${error ? JSON.stringify(error) : 'none'}, took=${Date.now() - start2}ms`);
  } catch (e) {
    console.error('Test 2 failed:', e);
  }

  // Test 3: Query using published_at index only (no double order, no count)
  const start3 = Date.now();
  const thirtyDaysAgoPublished = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id,title,company,company_logo,location,job_type,salary,tags,apply_url,category,source,published_at')
      .gt('published_at', thirtyDaysAgoPublished)
      .order('published_at', { ascending: false, nullsFirst: false })
      .range(0, 59);
    
    console.log(`Test 3 (Single Order, gt on published_at): rows=${data?.length || 0}, error=${error ? JSON.stringify(error) : 'none'}, took=${Date.now() - start3}ms`);
  } catch (e) {
    console.error('Test 3 failed:', e);
  }
}

run();
