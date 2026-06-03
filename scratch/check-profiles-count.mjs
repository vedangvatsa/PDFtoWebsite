import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function run() {
  console.log('Querying profile count...');
  const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  console.log('Profile Count:', count);
  if (error) console.error('Error:', error);
}

run();
