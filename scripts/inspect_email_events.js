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
  const { data: emailEvents, error } = await supabase.from('email_events').select('*').limit(1);
  if (error) {
    console.error('Error:', error.message);
  } else if (emailEvents && emailEvents.length > 0) {
    console.log('Top-level keys in email_events:', Object.keys(emailEvents[0]));
    console.log('Sample email event:', emailEvents[0]);
  } else {
    console.log('No email events found (or empty due to RLS).');
  }
}

test();
