import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env.local');

let token = process.env.BUFFER_TOKEN;
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/BUFFER_TOKEN=(.*)/);
  if (match) token = match[1].trim();
}

if (!token) {
  console.error("Missing BUFFER_TOKEN");
  process.exit(1);
}

const CHANNELS = {
  linkedin:  '69c5268baf47dacb69589bc6',
  instagram: '66c5268baf47dacb69589bc5', // just guessing, we can query profiles
};

async function getProfiles() {
  const r = await fetch('https://api.bufferapp.com/1/profiles.json', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return r.json();
}

async function getPending(profileId) {
  const r = await fetch(`https://api.bufferapp.com/1/profiles/${profileId}/updates/pending.json`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return r.json();
}

async function deleteUpdate(updateId) {
  const r = await fetch(`https://api.bufferapp.com/1/updates/${updateId}/destroy.json`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return r.json();
}

async function main() {
  console.log("Fetching profiles...");
  const profiles = await getProfiles();
  
  if (!Array.isArray(profiles)) {
    console.error("Failed to fetch profiles", profiles);
    return;
  }
  
  for (const p of profiles) {
    console.log(`Checking profile: ${p.service} (${p.id})`);
    const pending = await getPending(p.id);
    if (pending && pending.updates && pending.updates.length > 0) {
      console.log(`Found ${pending.updates.length} pending updates for ${p.service}`);
      for (const update of pending.updates) {
        console.log(`Deleting update ${update.id}...`);
        await deleteUpdate(update.id);
        await new Promise(res => setTimeout(res, 500));
      }
    } else {
      console.log(`No pending updates for ${p.service}`);
    }
  }
  
  // Reset buffer-state.json to 0 so the new queue schedules correctly
  const stateFile = path.join(__dirname, '../.github/scripts/buffer-state.json');
  if (fs.existsSync(stateFile)) {
    fs.writeFileSync(stateFile, JSON.stringify({ linkedin: 0, instagram: 0, facebook: 0 }, null, 2));
    console.log("Reset buffer-state.json to 0.");
  }
}

main().catch(console.error);
