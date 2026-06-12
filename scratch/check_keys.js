import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envPath = './.env.local';
let url = '';
let key = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
    if (match) {
      const k = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      if (k === 'NEXT_PUBLIC_SUPABASE_URL') url = val;
      if (k === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') key = val;
    }
  });
}

const supabase = createClient(url, key);

async function test() {
  const { data: profiles } = await supabase.from('profiles').select('*').limit(1);
  if (profiles && profiles.length > 0) {
    console.log('Keys:', Object.keys(profiles[0]));
  } else {
    console.log('No profiles found');
  }
}

test();
