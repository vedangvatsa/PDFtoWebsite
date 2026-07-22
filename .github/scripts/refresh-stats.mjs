import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENTMAIL_RAW = JSON.parse(readFileSync(join(__dirname, 'agentmail-accounts.json'), 'utf8'));
const ACCOUNTS = {};
for (const a of AGENTMAIL_RAW) {
  for (const inbox of a.inboxes) {
    ACCOUNTS[inbox] = a.api_key;
  }
}

const LOGS_PATH = join(__dirname, 'email-logs.json');

const logs = JSON.parse(readFileSync(LOGS_PATH, 'utf8'));

console.log(`Refreshing stats for ${logs.length} messages...\n`);

for (let log of logs) {
  if (log.status === 'sent' && log.id && !log.clicked) {
    const apiKey = ACCOUNTS[log.account || 'cvinbio@agentmail.to'];
    try {
      const res = await fetch(`https://api.agentmail.to/v0/messages/${log.id}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        // Assuming the API returns fields like 'opened_at' or 'clicked_at'
        // Since we don't have the exact response schema for stats, we'll map common patterns
        log.opened = !!(data.opened_at || data.stats?.opens > 0);
        log.clicked = !!(data.clicked_at || data.stats?.clicks > 0);
        log.bounced = data.status === 'bounced';
        
        if (log.opened) console.log(`👁️ Open detected: ${log.email}`);
        if (log.clicked) console.log(`🖱️ Click detected: ${log.email}`);
      }
    } catch (e) {
      console.log(`Error checking ${log.email}: ${e.message}`);
    }
  }
}

writeFileSync(LOGS_PATH, JSON.stringify(logs, null, 2));
console.log('\nStats refresh complete.');
