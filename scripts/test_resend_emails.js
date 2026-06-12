import { Resend } from 'resend';
import fs from 'fs';

const envPath = './.env.production.local';
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
      if (k === 'RESEND_API_KEY') key = val;
    }
  });
}

if (!key) {
  // Try .env.local
  if (fs.existsSync('./.env.local')) {
    const envContent = fs.readFileSync('./.env.local', 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
      if (match) {
        const k = match[1].trim();
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        if (k === 'RESEND_API_KEY') key = val;
      }
    });
  }
}

console.log('Resend key found:', !!key);

async function test() {
  if (!key) return;
  const resend = new Resend(key);
  try {
    // Resend node SDK or fetch directly
    const response = await fetch('https://api.resend.com/emails', {
      headers: {
        Authorization: `Bearer ${key}`
      }
    });
    const data = await response.json();
    console.log('Resend response status:', response.status);
    console.log('Emails count:', data.data?.length || 0);
    if (data.data) {
      console.log(JSON.stringify(data.data.slice(0, 10), null, 2));
    }
  } catch(e) {
    console.error('Error fetching Resend emails:', e.message);
  }
}

test();
