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
  if (!META_PAGE_ID || !META_PAGE_TOKEN) {
    console.log('⏭️  Facebook: no credentials, skipping');
    return { ok: false, imageUrl: null };
  }

  try {
    if (imagePath && fs.existsSync(imagePath)) {
      // Post with image
      const imageData = fs.readFileSync(imagePath);
      const formData = new FormData();
      formData.append('message', text);
      formData.append('source', new Blob([imageData], { type: 'image/jpeg' }), path.basename(imagePath));
      formData.append('access_token', META_PAGE_TOKEN);

      const url = `${GRAPH_URL}/${META_PAGE_ID}/photos`;
      const res = await fetch(url, { method: 'POST', body: formData });
      const data = await res.json();

      if (data.id) {
        console.log(`✅ Facebook: posted photo ${data.id}`);

        // Get the public URL of the uploaded photo for IG/Threads
        let imageUrl = null;
        try {
          const imgRes = await fetch(`${GRAPH_URL}/${data.id}?fields=images&access_token=${META_PAGE_TOKEN}`);
          const imgData = await imgRes.json();
          if (imgData.images && imgData.images.length > 0) {
            // Pick the largest image
            imageUrl = imgData.images[0].source;
            console.log(`🔗 Facebook CDN URL obtained for IG/Threads`);
          }
        } catch (e) { console.warn('⚠️  Could not get FB image URL:', e.message); }

        return { ok: true, imageUrl };
      } else {
        console.error('❌ Facebook photo error:', JSON.stringify(data));
        return { ok: false, imageUrl: null };
      }
    } else {
      // Text-only post
      const url = `${GRAPH_URL}/${META_PAGE_ID}/feed`;
      const params = new URLSearchParams({ message: text, access_token: META_PAGE_TOKEN });
      const res = await fetch(url, { method: 'POST', body: params });
      const data = await res.json();

      if (data.id) {
        console.log(`✅ Facebook: posted ${data.id}`);
        return { ok: true, imageUrl: null };
      } else {
        console.error('❌ Facebook error:', JSON.stringify(data));
        return { ok: false, imageUrl: null };
      }
    }
  } catch (e) {
    console.error('❌ Facebook exception:', e.message);
    return { ok: false, imageUrl: null };
  }
}

// ── Instagram Post ────────────────────────────────────────────────────────
async function postToInstagram(text, imageUrl) {
  if (!META_IG_USER_ID || !META_PAGE_TOKEN) {
    console.log('⏭️  Instagram: no credentials, skipping');
    return false;
  }

  if (!imageUrl) {
    console.log('⏭️  Instagram: no image URL (required for IG), skipping');
    return false;
  }

  try {
    // Step 1: Create media container
    const createParams = new URLSearchParams({
      image_url: imageUrl,
      caption: text,
      access_token: META_PAGE_TOKEN,
    });

    const createRes = await fetch(`${GRAPH_URL}/${META_IG_USER_ID}/media`, {
      method: 'POST',
      body: createParams,
    });
    const createData = await createRes.json();

    if (!createData.id) {
      console.error('❌ Instagram container error:', JSON.stringify(createData));
      return false;
    }

    console.log(`📦 Instagram: container created ${createData.id}`);

    // Step 2: Wait for processing
    await new Promise(r => setTimeout(r, 5000));

    // Step 3: Publish
    const publishParams = new URLSearchParams({
      creation_id: createData.id,
      access_token: META_PAGE_TOKEN,
    });

    const pubRes = await fetch(`${GRAPH_URL}/${META_IG_USER_ID}/media_publish`, {
      method: 'POST',
      body: publishParams,
    });
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
async function postToThreads(text, imageUrl) {
  if (!THREADS_USER_ID || !THREADS_TOKEN) {
    console.log('⏭️  Threads: no credentials, skipping');
    return false;
  }

  try {
    const createParams = new URLSearchParams({
      text,
      media_type: imageUrl ? 'IMAGE' : 'TEXT',
      access_token: THREADS_TOKEN,
    });
    if (imageUrl) createParams.append('image_url', imageUrl);

    const createRes = await fetch(`https://graph.threads.net/v1.0/${THREADS_USER_ID}/threads`, {
      method: 'POST',
      body: createParams,
    });
    const createData = await createRes.json();

    if (!createData.id) {
      console.error('❌ Threads container error:', JSON.stringify(createData));
      return false;
    }

    await new Promise(r => setTimeout(r, 5000));

    const pubParams = new URLSearchParams({
      creation_id: createData.id,
      access_token: THREADS_TOKEN,
    });

    const pubRes = await fetch(`https://graph.threads.net/v1.0/${THREADS_USER_ID}/threads_publish`, {
      method: 'POST',
      body: pubParams,
    });
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
  const content = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
  const state = loadState();
  const items = content.engagement || [];

  // Use the facebook index as the primary (all platforms share the same queue)
  const idx = state.facebook?.index || 0;

  if (idx >= items.length) {
    console.log(`✅ All ${items.length} engagement posts published on Meta. Done.`);
    process.exit(0);
  }

  const item = items[idx];
  const text = item.text.trim();
  console.log(`\n📝 Meta Post #${idx + 1}/${items.length}: "${text.substring(0, 60)}..."`);

  // Resolve image path
  let imagePath = null;
  if (item.img) {
    imagePath = item.img.startsWith('/') ? item.img : path.join(IMAGES_DIR, item.img);
    if (!fs.existsSync(imagePath)) {
      console.warn(`⚠️  Image not found: ${imagePath}`);
      imagePath = null;
    }
  }

  // 1. Post to Facebook first — get public CDN URL from the uploaded photo
  const fb = await postToFacebook(text, imagePath);
  const imageUrl = fb.imageUrl;  // public FB CDN URL for IG/Threads

  // 2. Post to Instagram using FB CDN URL
  await postToInstagram(text, imageUrl);

  // 3. Post to Threads using FB CDN URL
  await postToThreads(text, imageUrl);

  // Advance index if at least Facebook succeeded
  if (fb.ok) {
    state.facebook.index = idx + 1;
    state.instagram.index = idx + 1;
    state.threads.index = idx + 1;
    state.lastPostedAt = new Date().toISOString();
    saveState(state);
    console.log(`📊 Advanced Meta index to ${idx + 1}`);
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
