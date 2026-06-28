#!/usr/bin/env node
/**
 * Buffer LinkedIn-Only Refill Script (CVin.Bio)
 * 
 * Checks how many posts are pending in Buffer's LinkedIn queue.
 * If fewer than threshold, schedules the next batch from x-content.json.
 * 
 * Run with: node .github/scripts/buffer-linkedin.mjs
 * Env: BUFFER_ACCESS_TOKEN
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TOKEN = process.env.BUFFER_ACCESS_TOKEN || '';
const LINKEDIN_ID = '69c5b139af47dacb695b5feb';
const GRAPHQL_URL = 'https://api.buffer.com/graphql';

const CONTENT_FILE = path.join(__dirname, 'x-content.json');
const STATE_FILE = path.join(__dirname, 'buffer-linkedin-state.json');

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return { lastIndex: -1, postedHashes: [] };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function hashText(text) {
  return crypto.createHash('md5').update(text).digest('hex').slice(0, 12);
}

async function gqlRequest(query, variables) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

function cleanAndCompare(candidate, existing) {
  const normalize = (t) => t.toLowerCase().replace(/https?:\/\/[^\s]+/g, '').replace(/#\w+/g, '').replace(/[^a-z0-9]/g, '').substring(0, 80);
  const a = normalize(candidate);
  const b = normalize(existing);
  if (a.length < 15 || b.length < 15) return false;
  return a === b || b.includes(a) || a.includes(b);
}

async function getQueueTexts() {
  const query = `query GetPosts($channelId: String!) {
    posts(input: { channelId: $channelId, status: "scheduled" }) {
      edges { node { text } }
    }
  }`;
  try {
    const data = await gqlRequest(query, { channelId: LINKEDIN_ID });
    if (!data.errors) {
      return (data.data?.posts?.edges || []).map(e => e.node?.text || '');
    }
  } catch (err) {
    console.warn('⚠ Failed to fetch queue texts:', err.message);
  }
  return [];
}

async function getQueueCount() {
  const query = `query GetPosts($channelId: String!) {
    posts(input: { channelId: $channelId, status: "scheduled" }) {
      edges { node { id } }
      totalCount
    }
  }`;
  try {
    const data = await gqlRequest(query, { channelId: LINKEDIN_ID });
    if (!data.errors) {
      return data.data?.posts?.totalCount ?? data.data?.posts?.edges?.length ?? 0;
    }
  } catch {}
  console.log('Could not query queue count, assuming needs refill');
  return 0;
}

async function schedulePost(text, imageUrl, videoUrl) {
  const input = {
    channelId: LINKEDIN_ID,
    text,
    schedulingType: 'automatic',
    mode: 'addToQueue',
  };

  if (videoUrl) {
    input.assets = [{ video: { url: videoUrl } }];
  } else if (imageUrl) {
    input.assets = [{ image: { url: imageUrl, thumbnailUrl: imageUrl } }];
  }

  const data = await gqlRequest(`
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess { post { id } }
        ... on MutationError { message }
      }
    }
  `, { input });

  if (data.errors) {
    console.error('  ERROR:', JSON.stringify(data.errors));
    return { success: false, duplicate: false };
  }

  const result = data.data?.createPost;
  if (result?.post?.id) {
    console.log(`  ✅ Scheduled (ID: ${result.post.id})`);
    return { success: true, duplicate: false };
  } else {
    const msg = result?.message || 'unknown';
    const isDuplicate = msg.toLowerCase().includes('posted that one recently') || msg.toLowerCase().includes('same thing again');
    console.log(`  ❌ Failed: ${msg}${isDuplicate ? ' [DUPLICATE]' : ''}`);
    return { success: false, duplicate: isDuplicate };
  }
}

async function run() {
  if (!TOKEN) {
    console.error('BUFFER_ACCESS_TOKEN is required');
    process.exit(1);
  }

  const content = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
  const items = content.engagement || [];
  const state = loadState();

  console.log('--- Buffer LinkedIn Refill (CVin.Bio) ---');
  console.log(`Total posts in schedule: ${items.length}`);
  console.log(`LinkedIn lastIndex: ${state.lastIndex}, posted hashes: ${state.postedHashes.length}`);

  const count = await getQueueCount();
  console.log(`LinkedIn queue: ${count} pending`);

  const REFILL_THRESHOLD = 5;
  const BATCH_SIZE = 5;

  if (count >= REFILL_THRESHOLD) {
    console.log('LinkedIn queue OK, no refill needed');
    saveState(state);
    return;
  }

  const toSchedule = Math.min(BATCH_SIZE, 10 - count);
  console.log(`\nRefilling LinkedIn: scheduling up to ${toSchedule} posts...`);

  const queueTexts = await getQueueTexts();

  let scheduled = 0;

  for (let i = 0; i < toSchedule; i++) {
    const idx = (state.lastIndex + 1 + i) % items.length;
    const post = items[idx];
    const text = post.text?.trim();
    if (!text) continue;

    const textHash = hashText(text);

    // Skip duplicates
    const isAlreadyInQueue = queueTexts.some(qt => cleanAndCompare(text, qt));
    if (isAlreadyInQueue || state.postedHashes.includes(textHash)) {
      console.log(`  SKIP #${idx} (duplicate, hash: ${textHash})`);
      if (isAlreadyInQueue && !state.postedHashes.includes(textHash)) {
        state.postedHashes.push(textHash);
      }
      continue;
    }

    let imageUrl = '';
    let isVideo = false;
    if (post.img) {
      if (post.img.startsWith('/')) {
        imageUrl = `https://raw.githubusercontent.com/vedangvatsa/PDFtoWebsite/main/public${post.img}`;
      } else if (post.img.startsWith('.github/images/')) {
        imageUrl = `https://raw.githubusercontent.com/vedangvatsa/PDFtoWebsite/main/${post.img}`;
      } else {
        imageUrl = `https://raw.githubusercontent.com/vedangvatsa/PDFtoWebsite/main/.github/images/${post.img}`;
      }
      isVideo = imageUrl.toLowerCase().endsWith('.mp4');
    }

    console.log(`  #${idx} adding to queue`);
    const result = await schedulePost(text, isVideo ? undefined : imageUrl, isVideo ? imageUrl : post.videoUrl);

    if (result.success) {
      state.postedHashes.push(textHash);
      scheduled++;
    } else if (result.duplicate) {
      state.postedHashes.push(textHash);
    }
  }

  // Always advance index
  state.lastIndex = (state.lastIndex + toSchedule) % items.length;
  // Keep hashes bounded
  state.postedHashes = state.postedHashes.slice(-20);

  console.log(`\nLinkedIn index advanced to: ${state.lastIndex} (scheduled ${scheduled}/${toSchedule})`);
  saveState(state);
  console.log('Refill complete.');
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
