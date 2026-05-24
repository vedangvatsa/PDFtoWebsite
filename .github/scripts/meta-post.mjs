#!/usr/bin/env node
/**
 * Meta Social Poster — Facebook Page + Instagram + Threads
 * Posts engagement content from x-content.json to Meta platforms.
 * Uses the same engagement queue as X/Bluesky but maintains separate state indices.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────
const CONTENT_FILE = path.join(__dirname, 'x-content.json');
const STATE_FILE   = path.join(__dirname, 'meta-state.json');
const IMAGES_DIR   = path.join(__dirname, '../images');

const META_PAGE_ID    = process.env.META_PAGE_ID;
const META_PAGE_TOKEN = process.env.META_PAGE_TOKEN;
const META_IG_USER_ID = process.env.META_IG_USER_ID;       // optional
const THREADS_USER_ID = process.env.THREADS_USER_ID;         // optional
const THREADS_TOKEN   = process.env.THREADS_ACCESS_TOKEN;    // optional

const GRAPH_URL = 'https://graph.facebook.com/v21.0';

// ── State ─────────────────────────────────────────────────────────────────
function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return { facebook: { index: 0 }, instagram: { index: 0 }, threads: { index: 0 } };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ── Facebook Page Post (returns public image URL for IG/Threads) ──────────
async function postToFacebook(text, imagePath) {
  if (!META_PAGE_ID || !META_PAGE_TOKEN) return { ok: false, imageUrl: null };
  try {
    if (imagePath && fs.existsSync(imagePath)) {
      const isVideo = imagePath.endsWith('.mp4');
      const fileData = fs.readFileSync(imagePath);
      const formData = new FormData();
      
      if (isVideo) {
        formData.append('description', text);
        formData.append('source', new Blob([fileData], { type: 'video/mp4' }), path.basename(imagePath));
      } else {
        formData.append('message', text);
        formData.append('source', new Blob([fileData], { type: 'image/jpeg' }), path.basename(imagePath));
      }
      formData.append('access_token', META_PAGE_TOKEN);

      const endpoint = isVideo ? 'videos' : 'photos';
      const url = `${GRAPH_URL}/${META_PAGE_ID}/${endpoint}`;
      
      const res = await fetch(url, { method: 'POST', body: formData });
      const data = await res.json();

      if (data.id) {
        console.log(`✅ Facebook: posted ${isVideo ? 'video' : 'photo'} ${data.id}`);
        let imageUrl = null;
        if (!isVideo) {
          try {
            const imgRes = await fetch(`${GRAPH_URL}/${data.id}?fields=images&access_token=${META_PAGE_TOKEN}`);
            const imgData = await imgRes.json();
            if (imgData.images && imgData.images.length > 0) imageUrl = imgData.images[0].source;
          } catch (e) {}
        }
        return { ok: true, imageUrl };
      } else {
        console.error('❌ Facebook error:', JSON.stringify(data));
        return { ok: false, imageUrl: null };
      }
    } else {
      const url = `${GRAPH_URL}/${META_PAGE_ID}/feed`;
      const params = new URLSearchParams({ message: text, access_token: META_PAGE_TOKEN });
      const res = await fetch(url, { method: 'POST', body: params });
      const data = await res.json();
      return { ok: !!data.id, imageUrl: null };
    }
  } catch (e) {
    console.error('❌ Facebook exception:', e.message);
    return { ok: false, imageUrl: null };
  }
}

// ── Instagram Post ────────────────────────────────────────────────────────
async function postToInstagram(text, mediaUrl, isVideo = false) {
  if (!META_IG_USER_ID || !META_PAGE_TOKEN) return false;
  if (!mediaUrl) return false;

  try {
    const createParams = new URLSearchParams({
      caption: text,
      access_token: META_PAGE_TOKEN,
    });
    
    if (isVideo) {
      createParams.append('media_type', 'REELS');
      createParams.append('video_url', mediaUrl);
    } else {
      createParams.append('image_url', mediaUrl);
    }

    const createRes = await fetch(`${GRAPH_URL}/${META_IG_USER_ID}/media`, { method: 'POST', body: createParams });
    const createData = await createRes.json();

    if (!createData.id) {
      console.error('❌ Instagram container error:', JSON.stringify(createData));
      return false;
    }

    console.log(`📦 Instagram: container created ${createData.id}`);
    // Wait longer for video processing
    let ready = false;
    for (let i = 0; i < (isVideo ? 6 : 2); i++) {
        await new Promise(r => setTimeout(r, 5000));
        if (isVideo) {
           const statusRes = await fetch(`${GRAPH_URL}/${createData.id}?fields=status_code&access_token=${META_PAGE_TOKEN}`);
           const statusData = await statusRes.json();
           if (statusData.status_code === 'FINISHED') { ready = true; break; }
        } else {
           ready = true; break;
        }
    }

    const publishParams = new URLSearchParams({ creation_id: createData.id, access_token: META_PAGE_TOKEN });
    const pubRes = await fetch(`${GRAPH_URL}/${META_IG_USER_ID}/media_publish`, { method: 'POST', body: publishParams });
    const pubData = await pubRes.json();

    if (pubData.id) {
      console.log(`✅ Instagram: published ${pubData.id}`);
      return true;
    } else {
      console.error('❌ Instagram publish error:', JSON.stringify(pubData));
      return false;
    }
  } catch (e) {
    console.error('❌ Instagram exception:', e.message);
    return false;
  }
}

// ── Threads Post ──────────────────────────────────────────────────────────
async function postToThreads(text, mediaUrl, isVideo = false) {
  if (!THREADS_USER_ID || !THREADS_TOKEN) return false;

  try {
    const createParams = new URLSearchParams({ text, access_token: THREADS_TOKEN });
    
    if (mediaUrl) {
      createParams.append('media_type', isVideo ? 'VIDEO' : 'IMAGE');
      if (isVideo) createParams.append('video_url', mediaUrl);
      else createParams.append('image_url', mediaUrl);
    } else {
      createParams.append('media_type', 'TEXT');
    }

    const createRes = await fetch(`https://graph.threads.net/v1.0/${THREADS_USER_ID}/threads`, { method: 'POST', body: createParams });
    const createData = await createRes.json();

    if (!createData.id) {
      console.error('❌ Threads container error:', JSON.stringify(createData));
      return false;
    }

    let ready = false;
    for (let i = 0; i < (isVideo ? 6 : 2); i++) {
        await new Promise(r => setTimeout(r, 5000));
        if (isVideo) {
           const statusRes = await fetch(`https://graph.threads.net/v1.0/${createData.id}?fields=status&access_token=${THREADS_TOKEN}`);
           const statusData = await statusRes.json();
           if (statusData.status === 'FINISHED') { ready = true; break; }
        } else {
           ready = true; break;
        }
    }

    const pubParams = new URLSearchParams({ creation_id: createData.id, access_token: THREADS_TOKEN });
    const pubRes = await fetch(`https://graph.threads.net/v1.0/${THREADS_USER_ID}/threads_publish`, { method: 'POST', body: pubParams });
    const pubData = await pubRes.json();

    if (pubData.id) {
      console.log(`✅ Threads: published ${pubData.id}`);
      return true;
    } else {
      console.error('❌ Threads publish error:', JSON.stringify(pubData));
      return false;
    }
  } catch (e) {
    console.error('❌ Threads exception:', e.message);
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  // Pull latest state from git first to avoid index mismatch
  try {
    const { execSync } = await import('child_process');
    execSync('git pull --rebase origin main', { cwd: path.join(__dirname, '../..'), stdio: 'pipe' });
    console.log('📥 Pulled latest state from git');
  } catch (e) {
    console.warn('⚠️ Git pull failed, proceeding with checkout state:', e.message);
  }

  const content = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
  const state = loadState();
  const items = content.engagement || [];

  // Cooldown: skip if posted recently (20h gap for 1x/day schedule)
  if (state.lastPostedAt) {
    const elapsed = Date.now() - new Date(state.lastPostedAt).getTime();
    const COOLDOWN_MS = 20 * 60 * 60 * 1000; // 20 hours
    if (elapsed < COOLDOWN_MS) {
      const hrs = (elapsed / 3600000).toFixed(1);
      console.log(`⏳ Meta Cooldown: last post was ${hrs}h ago (need 20h gap). Skipping.`);
      process.exit(0);
    }
  }

  // Use a single shared index — prevents any platform from re-posting old content
  const idx = Math.max(
    state.facebook?.index || 0,
    state.instagram?.index || 0,
    state.threads?.index || 0
  );

  if (idx >= items.length) {
    console.log(`✅ All ${items.length} engagement posts published on Meta. Done.`);
    process.exit(0);
  }

  const item = items[idx];
  const text = item.text.trim();
  console.log(`\n📝 Meta Post #${idx + 1}/${items.length}: "${text.substring(0, 60)}..."`);

  // Resolve image path (strictly required)
  if (!item.img) {
    console.error('❌ Error: No image defined for this Meta engagement post. Aborting.');
    process.exit(1);
  }

  let imagePath = null;
  if (item.img.startsWith('/')) {
    imagePath = item.img;
  } else if (item.img.startsWith('.github/')) {
    const REPO_ROOT = path.join(__dirname, '../..');
    imagePath = path.join(REPO_ROOT, item.img);
  } else {
    imagePath = path.join(IMAGES_DIR, item.img);
  }

  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Error: Required image not found on disk: ${imagePath}`);
    process.exit(1);
  }

  // Construct public raw GitHub URL for Instagram/Threads fallback
  const isVideo = imagePath.endsWith('.mp4');
  let relativeImgPath = '';
  relativeImgPath = item.img.startsWith('/') ? item.img.substring(1) : item.img;
  if (relativeImgPath.startsWith('.github/images/')) {
    relativeImgPath = relativeImgPath.substring('.github/images/'.length);
  }
  const githubUrl = !isVideo ? `https://cdn.jsdelivr.net/gh/vedangvatsa/PDFtoWebsite@main/.github/images/${relativeImgPath}` : null;

  // 1. Post to Facebook (file upload)
  const fb = await postToFacebook(text, imagePath);
  if (!fb.ok) {
    console.error('❌ Error: Facebook image upload failed. Aborting Meta posting pipeline to prevent partial text-only publish.');
    process.exit(1);
  }

  // Build media URL: FB CDN > GitHub Raw > null
  let mediaUrl = null;
  if (isVideo) {
    mediaUrl = `https://cvin.bio${item.img}`;
  } else {
    mediaUrl = fb.imageUrl || githubUrl;
  }

  if (!mediaUrl) {
    console.error('❌ Error: Could not resolve a valid public media URL for Instagram/Threads. Aborting.');
    process.exit(1);
  }

  // 2. Post to Instagram
  const igOk = await postToInstagram(text, mediaUrl, isVideo);
  if (!igOk) {
    console.error('❌ Error: Instagram image publishing failed. Aborting pipeline.');
    process.exit(1);
  }

  // 3. Post to Threads
  const threadsOk = await postToThreads(text, mediaUrl, isVideo);
  if (!threadsOk) {
    console.error('❌ Error: Threads image publishing failed. Aborting pipeline.');
    process.exit(1);
  }

  // ALWAYS advance the index only after ALL platforms succeeded.
  const nextIdx = idx + 1;
  state.facebook.index = nextIdx;
  state.instagram.index = nextIdx;
  state.threads.index = nextIdx;
  state.lastPostedAt = new Date().toISOString();
  saveState(state);
  console.log(`📊 Successfully posted to Facebook, Instagram, and Threads! Advanced Meta index to ${nextIdx}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
