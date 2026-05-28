// Bluesky Auto-Poster — posts via AT Protocol API
// Triggered by GitHub Actions cron at 1 AM, 9 AM, 5 PM IST

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, 'bsky-state.json');

const HANDLE = 'hashtagweb3.bsky.social';
const APP_PASSWORD = process.env.BSKY_APP_PASSWORD;
if (!APP_PASSWORD) { console.error('Missing BSKY_APP_PASSWORD'); process.exit(1); }

const IMAGES_DIR = path.join(__dirname, '../images');

const CONTENT_FILE = path.join(__dirname, 'x-content.json');
const content = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
const POSTS = content.engagement || [];

// ── AT Protocol helpers ───────────────────────────────────────────────────
async function createSession() {
  const r = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: HANDLE, password: APP_PASSWORD }),
  });
  if (!r.ok) throw new Error(`Auth failed: ${r.status}`);
  return r.json();
}

async function uploadImage(session, imgPath) {
  const imgData = fs.readFileSync(imgPath);
  const r = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.accessJwt}`,
      'Content-Type': 'image/png',
    },
    body: imgData,
  });
  if (!r.ok) throw new Error(`Image upload failed: ${r.status}`);
  const data = await r.json();
  return data.blob;
}

async function createPost(session, text, imageBlob) {
  // Detect cvin.bio link and add facet
  const facets = [];
  const linkMatch = text.match(/cvin\.bio/);
  if (linkMatch) {
    const start = new TextEncoder().encode(text.substring(0, linkMatch.index)).length;
    const end = start + new TextEncoder().encode('cvin.bio').length;
    facets.push({
      index: { byteStart: start, byteEnd: end },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri: 'https://cvin.bio' }],
    });
  }

  const record = {
    $type: 'app.bsky.feed.post',
    text,
    facets,
    createdAt: new Date().toISOString(),
  };

  if (imageBlob) {
    record.embed = {
      $type: 'app.bsky.embed.images',
      images: [{ alt: 'Infographic about the job market by CVin.Bio', image: imageBlob }],
    };
  }

  const r = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.accessJwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record,
    }),
  });

  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Post failed: ${r.status} ${err}`);
  }
  return r.json();
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  // Pull latest state from git first
  try {
    const { execSync } = await import('child_process');
    execSync('git pull --rebase origin main', { cwd: path.join(__dirname, '../..'), stdio: 'pipe' });
    console.log('📥 Pulled latest state from git');
  } catch (e) {
    console.warn('⚠️ Git pull failed, proceeding with checkout state:', e.message);
  }

  let state = { index: 0, lastPostedAt: null };
  if (fs.existsSync(STATE_FILE)) state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));

  // Cooldown: skip if posted recently (7h gap for 3x/day schedule)
  if (state.lastPostedAt) {
    const elapsed = Date.now() - new Date(state.lastPostedAt).getTime();
    const COOLDOWN_MS = 7 * 60 * 60 * 1000; // 7 hours
    if (elapsed < COOLDOWN_MS) {
      const hrs = (elapsed / 3600000).toFixed(1);
      console.log(`⏳ Cooldown: last post was ${hrs}h ago (need 7h gap). Skipping.`);
      process.exit(0);
    }
  }

  if (state.index >= POSTS.length) {
    console.log(`✅ All ${POSTS.length} posts published. Nothing to do.`);
    process.exit(0);
  }

  const item = POSTS[state.index];
  const text = typeof item === 'string' ? item : item.text.trim();
  console.log(`🦋 Bluesky poster — posting #${state.index + 1} of ${POSTS.length}`);

  const session = await createSession();
  console.log(`🔑 Authenticated as ${session.handle}`);

  // Resolve image from x-content.json item
  let imageBlob = null;
  const imgRef = typeof item === 'object' ? item.img : null;
  if (!imgRef) {
    console.error('❌ Error: No image reference defined for this engagement post. Aborting.');
    process.exit(1);
  }

  let imgPath;
  if (imgRef.startsWith('/')) {
    imgPath = imgRef;
  } else if (imgRef.startsWith('.github/')) {
    const REPO_ROOT = path.join(__dirname, '../..');
    imgPath = path.join(REPO_ROOT, imgRef);
  } else {
    imgPath = path.join(IMAGES_DIR, imgRef);
  }

  if (imgPath.endsWith('.mp4')) {
    console.error('❌ Error: Bluesky does not support video, and all engagement posts MUST have a valid image.');
    process.exit(1);
  }

  if (!fs.existsSync(imgPath)) {
    console.error(`❌ Error: Required image not found: ${imgPath}`);
    process.exit(1);
  }

  try {
    imageBlob = await uploadImage(session, imgPath);
    console.log(`🖼️ Image uploaded successfully: ${path.basename(imgPath)}`);
  } catch (e) {
    console.error('❌ Error: Image upload to Bluesky failed:', e.message);
    process.exit(1);
  }

  if (!imageBlob) {
    console.error('❌ Error: No image blob returned — aborting to prevent text-only publish.');
    process.exit(1);
  }

  const result = await createPost(session, text, imageBlob);
  console.log(`✅ Posted to Bluesky! URI: ${result.uri}`);

  state.index++;
  state.lastPostedAt = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log(`💾 State saved: next post is #${state.index + 1}`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
