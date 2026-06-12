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
  // Query all tables in public schema
  // Supabase doesn't let us query pg_catalog directly via standard REST API unless we call an RPC or if there's a view exposed.
  // But we can test if we can select from information_schema.tables.
  const { data, error } = await supabase.from('information_schema.tables').select('*');
  console.log('Error information_schema:', error?.message || 'none');
  
  // Let's also check if we can query common table names to see if they exist (returns 404 or empty/success)
  const commonTables = ['profiles', 'jobs', 'contact_submissions', 'parse_logs', 'email_events', 'audit_logs', 'deleted_users', 'users', 'logs'];
  for (const t of commonTables) {
    const { error: tErr } = await supabase.from(t).select('*').limit(1);
    console.log(`Table '${t}':`, tErr ? tErr.message : 'exists');
  }
}

test();
