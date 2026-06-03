import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Querying Supabase jobs table using strictly published_at index...');
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  
  const start = Date.now();
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id,title,company,company_logo,location,job_type,salary,tags,apply_url,category,source,published_at')
      .gt('published_at', thirtyDaysAgo)
      .order('published_at', { ascending: false, nullsFirst: false })
      .range(0, 19);
    console.log(`Single Index Query: rows=${data?.length || 0}, error=${error ? JSON.stringify(error) : 'none'}, took=${Date.now() - start}ms`);
  } catch (e) {
    console.error('Query failed:', e);
  }
}

run();
