// Buffer LinkedIn Auto-Scheduler (GitHub Actions version)
// Reads state from buffer-state.json, schedules next batch, updates state

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, 'buffer-state.json');

const TOKEN = process.env.BUFFER_TOKEN;
if (!TOKEN) { console.error('Missing BUFFER_TOKEN'); process.exit(1); }

const MAX_POSTS = (process.env.MAX_POSTS && parseInt(process.env.MAX_POSTS, 10) > 0) ? parseInt(process.env.MAX_POSTS, 10) : Infinity;

const CHANNELS = {
  linkedin:  '6a134180c687a22dd420e089',  // cvinbio page on Web3-Jobs Buffer account
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

async function uploadImage(filePath) {
  const fileData = fs.readFileSync(filePath);
  const filename = path.basename(filePath);
  const ext = path.extname(filename).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : ext === '.jpeg' ? 'image/jpeg' : 'image/jpeg';
  
  // Primary: Telegra.ph upload (simple, permanent, publicly accessible)
  try {
    console.log(`   📤 Uploading ${filename} to telegra.ph...`);
    const formData = new FormData();
    formData.append('file', new Blob([fileData], { type: mimeType }), filename);
    const res = await fetch('https://telegra.ph/upload', { method: 'POST', body: formData });
    if (res.ok) {
      const data = await res.json();
      if (data[0] && data[0].src) {
        const url = `https://telegra.ph${data[0].src}`;
        console.log(`   🔗 telegra.ph URL: ${url}`);
        return url;
      }
    }
    console.warn(`   ⚠️ telegra.ph returned unexpected response`);
  } catch (e) { console.warn(`   ⚠️ telegra.ph failed: ${e.message}`); }
  
  // Fallback: catbox.moe
  try {
    console.log(`   📤 Trying catbox.moe...`);
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', new Blob([fileData], { type: mimeType }), filename);
    const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: formData });
    if (res.ok) {
      const url = (await res.text()).trim();
      if (url.startsWith('http')) {
        console.log(`   🔗 catbox URL: ${url}`);
        return url;
      }
    }
  } catch (e) { console.warn(`   ⚠️ catbox failed: ${e.message}`); }
  
  throw new Error(`All image upload methods failed for ${filename}`);
}

async function schedulePost(channelId, text, imgPath, altText) {
  const isVideo = imgPath.endsWith('.mp4');
  let mediaUrl;
  
  if (isVideo) {
    const relativePath = imgPath.substring(imgPath.indexOf('/images/'));
    mediaUrl = `https://cvin.bio${relativePath}`;
  } else {
    mediaUrl = await uploadImage(imgPath);
  }
  
  const escapedText = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
  const escapedAlt = altText ? altText.replace(/\\/g, '\\\\').replace(/"/g, '\\"') : '';
  
  const assetsBlock = isVideo 
    ? `assets: [{ video: { url: "${mediaUrl}" } }]`
    : `assets: [{ image: { url: "${mediaUrl}" } }]`;
  
  const query = `mutation {
    createPost(input: {
      channelId: "${channelId}"
      text: "${escapedText}"
      mode: addToQueue
      schedulingType: automatic
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
  
  console.log(`\n── LINKEDIN (starting from #${skip + 1}, using Buffer queue slots) ──`);
  
  let scheduled = 0;
  const maxToSchedule = Math.min(POSTS.length, skip + MAX_POSTS);
  
  for (let i = skip; i < maxToSchedule; i++) {
    const item = POSTS[i];
    const text = item.text.trim();
    const imgRef = item.img;
    
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
      const altText = item.alt || '';
      const result = await schedulePost(channelId, text, imgPath, altText);
      
      if (result.data?.createPost?.post) {
        const slotTime = result.data.createPost.post.dueAt;
        const time = slotTime ? new Date(slotTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'queued';
        console.log(`✅ #${i + 1} → ${time}`);
        scheduled++;
        state.linkedin = i + 1;
      } else {
        const err = result.data?.createPost?.message || result.errors?.[0]?.message || 'Unknown';
        if (err.includes('Too many requests') || err.includes('rate') || err.includes('RATE_LIMIT')) {
          console.log(`⏳ #${i + 1} → Rate limited (24h window). Will retry next cron run.`);
          break;
        }
        console.log(`❌ #${i + 1} → ${err}`);
        if (err.includes('limit') || err.includes('Limit')) {
          console.log(`⏸ Hit limit for LinkedIn. Will continue next run.`);
          break;
        }
      }
      // Delay between posts to avoid rate limiting
      await new Promise(r => setTimeout(r, 2000));
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
