import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRecent() {
  const { data } = await supabase
    .from('jobs')
    .select('id, title, company, created_at, source')
    .order('created_at', { ascending: false })
    .limit(10);
  
  console.log(data);
}

checkRecent();
