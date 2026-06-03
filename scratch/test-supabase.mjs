import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function testTable(tableName) {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`Error querying table "${tableName}":`, error.message, error.details || '');
    } else {
      console.log(`Table "${tableName}" exists. Count:`, count);
    }
  } catch (e) {
    console.error(`Exception querying table "${tableName}":`, e.message);
  }
}

async function run() {
  console.log('Checking Supabase tables...');
  await testTable('profiles');
  await testTable('parse_logs');
  await testTable('contact_submissions');
  await testTable('jobs');
}

run();
