import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Querying Supabase PROFILES table...');
  const startProfiles = Date.now();
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id,username')
      .limit(5);
    console.log(`Profiles query: rows=${data?.length || 0}, error=${error ? JSON.stringify(error) : 'none'}, took=${Date.now() - startProfiles}ms`);
  } catch (e) {
    console.error('Profiles query failed:', e);
  }

  console.log('Querying Supabase JOBS table (simple limit)...');
  const startJobs = Date.now();
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id,title')
      .limit(5);
    console.log(`Jobs query (simple limit): rows=${data?.length || 0}, error=${error ? JSON.stringify(error) : 'none'}, took=${Date.now() - startJobs}ms`);
  } catch (e) {
    console.error('Jobs query failed:', e);
  }
}

run();
