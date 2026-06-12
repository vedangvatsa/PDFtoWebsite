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
  // Check parse_logs
  const { data: parseLogs, error: parseErr } = await supabase.from('parse_logs').select('*').limit(1);
  console.log('parse_logs schema sample (error:', parseErr?.message || 'none', '):');
  console.log(parseLogs);

  // Check email_events
  const { data: emailEvents, error: emailErr } = await supabase.from('email_events').select('*').limit(1);
  console.log('email_events schema sample (error:', emailErr?.message || 'none', '):');
  console.log(emailEvents);
}

test();
