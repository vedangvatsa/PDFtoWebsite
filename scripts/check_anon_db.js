import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read from .env.local
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

console.log('URL:', url);
console.log('Anon Key:', key ? 'found' : 'missing');

const supabase = createClient(url, key);

async function test() {
  // Try profiles
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*').limit(5);
  console.log('Profiles err:', pErr?.message || 'none', 'count:', profiles?.length || 0);

  // Try parsing logs
  const { data: parseLogs, error: plErr } = await supabase.from('parse_logs').select('*').limit(5);
  console.log('Parse logs err:', plErr?.message || 'none', 'count:', parseLogs?.length || 0);

  // Try contact_submissions
  const { data: contactSub, error: csErr } = await supabase.from('contact_submissions').select('*').limit(5);
  console.log('Contact submissions err:', csErr?.message || 'none', 'count:', contactSub?.length || 0);
  
  // Try email_events
  const { data: emailEv, error: eeErr } = await supabase.from('email_events').select('*').limit(5);
  console.log('Email events err:', eeErr?.message || 'none', 'count:', emailEv?.length || 0);
}

test();
