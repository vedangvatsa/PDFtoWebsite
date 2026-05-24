// Buffer LinkedIn Auto-Scheduler (GitHub Actions version)
// Reads state from buffer-state.json, schedules next batch, updates state

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, 'buffer-state.json');

const TOKEN = process.env.BUFFER_TOKEN;
if (!TOKEN) { console.error('Missing BUFFER_TOKEN'); process.exit(1); }

const CHANNELS = {
  linkedin:  '69c5268baf47dacb69589bc6',
};

const CONTENT_FILE = path.join(__dirname, 'x-content.json');
const content = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
const POSTS = content.engagement || [];

async function gql(query) {
  const r = await fetch('https://api.buffer.com/graphql', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return r.json();
}

async function uploadToPixelDrain(filePath) {
  const fileData = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif' };
  const mime = mimeTypes[ext] || 'image/jpeg';

  const formData = new FormData();
  formData.append('anonymous', 'true');
  
  const file = new File([fileData], path.basename(filePath), { type: mime });
  formData.append('file', file);

  const res = await fetch('https://pixeldrain.com/api/file', {
    method: 'POST',
    body: formData
  });
  
  if (!res.ok) throw new Error(`PixelDrain upload failed: ${res.status}`);
  const data = await res.json();
  if (!data.id) throw new Error('PixelDrain did not return file ID');
  return `https://pixeldrain.com/api/file/${data.id}`;
}

async function schedulePost(channelId, text, imgPath, dueAt) {
  const isVideo = imgPath.endsWith('.mp4');
  let mediaUrl;
  
  if (isVideo) {
    const relativePath = imgPath.substring(imgPath.indexOf('/images/'));
    mediaUrl = `https://cvin.bio${relativePath}`;
  } else {
    // Upload image to PixelDrain to bypass raw.githubusercontent / jsDelivr user-agent block on Buffer
    console.log(`   📤 Uploading ${path.basename(imgPath)} to PixelDrain...`);
    mediaUrl = await uploadToPixelDrain(imgPath);
    console.log(`   🔗 Direct PixelDrain URL: ${mediaUrl}`);
  }
  
  const escapedText = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
  
  const assetsBlock = isVideo 
    ? `assets: [{ video: { url: "${mediaUrl}" } }]`
    : `assets: [{ image: { url: "${mediaUrl}" } }]`;
  
  const query = `mutation {
    createPost(input: {
      channelId: "${channelId}"
      text: "${escapedText}"
      mode: customScheduled
      schedulingType: automatic
      dueAt: "${dueAt}"
      ${assetsBlock}
    }) {
      ... on PostActionSuccess { post { id dueAt } }
      ... on LimitReachedError { message }
      ... on InvalidInputError { message }
      ... on UnexpectedError { message }
    }
  }`;
  
  return gql(query);
}

// 3 posts/day (8h gap): 00:30, 08:30, 16:30 UTC
function generateSchedule(startIndex) {
  const now = new Date();
  // Start from tomorrow
  let day = new Date(now);
  day.setUTCDate(day.getUTCDate() + 1);
  day.setUTCHours(0, 0, 0, 0);
  
  const slots = [
    { h: 0, m: 30, prevDay: false },
    { h: 8, m: 30, prevDay: false },
    { h: 16, m: 30, prevDay: false },
  ];
  const dates = [];
  let slotIdx = 0;
  
  while (dates.length < POSTS.length - startIndex) {
    const d = new Date(day);
    if (slots[slotIdx].prevDay) {
      d.setUTCDate(d.getUTCDate() - 1);
    }
    d.setUTCHours(slots[slotIdx].h, slots[slotIdx].m, 0, 0);
    
    if (d > now) {
      dates.push(d.toISOString());
    }
    
    slotIdx++;
    if (slotIdx >= slots.length) { slotIdx = 0; day.setUTCDate(day.getUTCDate() + 1); }
  }
  return dates;
}

async function main() {
  // Pull latest state from git first to avoid index mismatch
  try {
    const { execSync } = await import('child_process');
    execSync('git pull --rebase origin main', { cwd: path.join(__dirname, '../..'), stdio: 'pipe' });
    console.log('📥 Pulled latest state from git');
  } catch (e) {
    console.warn('⚠️ Git pull failed, proceeding with checkout state:', e.message);
  }

  // Load state
  let state = { linkedin: 55 }; // Skip old stack by default
  if (fs.existsSync(STATE_FILE)) {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  
  // If it's still using the old indexing scheme (e.g. 119), align it to 55 to skip old stack
  if (state.linkedin > POSTS.length || state.linkedin < 55) {
    console.log(`⚠️ Aligning state.linkedin from ${state.linkedin} to 55 (skipping old stack)`);
    state.linkedin = 55;
  }
  
  console.log(`📅 Buffer Scheduler — current state: LI=${state.linkedin}`);
  
  if (state.linkedin >= POSTS.length) {
    console.log('✅ All posts scheduled on LinkedIn. Nothing to do.');
    process.exit(0);
  }
  
  const platform = 'linkedin';
  const channelId = CHANNELS.linkedin;
  const skip = state.linkedin;
  
  const schedule = generateSchedule(skip);
  console.log(`\n── LINKEDIN (starting from #${skip + 1}) ──`);
  
  let scheduled = 0;
  
  for (let i = skip; i < POSTS.length; i++) {
    const item = POSTS[i];
    const text = item.text.trim();
    const imgRef = item.img;
    const dueAt = schedule[i - skip];
    if (!dueAt) break;
    
    // Resolve image path locally to check existence
    if (!imgRef) {
      console.error(`❌ Error: No image defined for post #${i}. Aborting.`);
      process.exit(1);
    }
    
    let imgPath;
    if (imgRef.startsWith('/')) {
      imgPath = imgRef;
    } else if (imgRef.startsWith('.github/')) {
      const REPO_ROOT = path.join(__dirname, '../..');
      imgPath = path.join(REPO_ROOT, imgRef);
    } else {
      imgPath = path.join(__dirname, '../images', imgRef);
    }
    
    if (!fs.existsSync(imgPath)) {
      console.error(`❌ Error: Required image not found on disk: ${imgPath}`);
      process.exit(1);
    }
    
    try {
      const result = await schedulePost(channelId, text, imgPath, dueAt);
      
      if (result.data?.createPost?.post) {
        const time = new Date(dueAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        console.log(`✅ #${i + 1} → ${time}`);
        scheduled++;
        state.linkedin = i + 1;
      } else {
        const err = result.data?.createPost?.message || result.errors?.[0]?.message || 'Unknown';
        console.log(`❌ #${i + 1} → ${err}`);
        if (err.includes('limit') || err.includes('Limit')) {
          console.log(`⏸ Hit limit for LinkedIn. Will continue next run.`);
          break;
        }
      }
    } catch (e) {
      console.log(`❌ #${i + 1} → ${e.message}`);
      process.exit(1); // Abort to prevent text-only fallback or out-of-order scheduling
    }
    
    await new Promise(r => setTimeout(r, 1500));
  }
  
  // Save state
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log(`\n💾 State saved: LI=${state.linkedin}`);
}

main().catch(e => { console.error(e); process.exit(1); });
