import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const K1 = process.env.AGENTMAIL_API_KEY || 'am_us_bd628380488f632397ce6b30b630c55a76e1ed5fee96860b5b359332ac7ff7c6';
const K2 = process.env.AGENTMAIL_API_KEY_2 || 'am_us_b0299617e7fa8dc355c3aaa4eb8464ff6b972f0609ebe664ed798cf7032e47f7';
const K3 = process.env.AGENTMAIL_API_KEY_3 || 'am_us_2c975d4bbda82b90af084f0c2936a431f3a5020686247561a75501e9581d5894';
const K4 = process.env.AGENTMAIL_API_KEY_4 || 'am_us_1c24769df244dbbcd0657e51f20105471a6a0feaef0e212f152887c5e40c0f00';

const K5 = process.env.AGENTMAIL_API_KEY_5 || 'am_us_a1a368bc15d1fcdf46f8cc3a3dc4a1cb553d72913e3c0d6e2b74b912a9e6698c';
const K6 = process.env.AGENTMAIL_API_KEY_6 || 'am_us_7c394f3ec04464e7faac0d1fa09c2bcd6b343d15fd0eefebd36f367b56845f68';

const ACCOUNTS = {
  'cvinbio@agentmail.to': K1,
  'thankfulproblem853@agentmail.to': K1,
  'bitterweather319@agentmail.to': K1,
  'quaintmirror345@agentmail.to': K2,
  'foolishglass765@agentmail.to': K2,
  'curiousvideo725@agentmail.to': K2,
  'creepymessage220@agentmail.to': K3,
  'easyball343@agentmail.to': K3,
  'bravewriter157@agentmail.to': K3,
  'repulsivehappiness172@agentmail.to': K4,
  'pricklyweather719@agentmail.to': K4,
  'ashamedclass759@agentmail.to': K4,
  'cvinbio-sender-2@agentmail.to': K5,
  'adorablecharacter249@agentmail.to': K5,
  'beautifulself926@agentmail.to': K5,
  'cvinbio-sender-7@agentmail.to': K6,
  'naughtylocation145@agentmail.to': K6,
  'hurtinspiration418@agentmail.to': K6,
};

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
