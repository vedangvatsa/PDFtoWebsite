#!/usr/bin/env node
/**
 * Meta Social Poster — Facebook Page + Instagram + Threads
 * Posts engagement content from x-content.json to Meta platforms.
 * Uses the same engagement queue as X/Bluesky but maintains separate state indices.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  applyPostsToPerformance,
  emptyPerformance,
  pickThreadsCandidate,
} from './lib/threads-queue.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────
const CONTENT_FILE = path.join(__dirname, 'x-content.json');
const STATE_FILE   = path.join(__dirname, 'meta-state.json');
const PERF_FILE    = path.join(__dirname, 'threads-performance.json');
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

function loadPerformance() {
  try {
    return JSON.parse(fs.readFileSync(PERF_FILE, 'utf-8'));
  } catch {
    return emptyPerformance();
  }
}

function savePerformance(perf) {
  perf.updatedAt = new Date().toISOString();
  fs.writeFileSync(PERF_FILE, JSON.stringify(perf, null, 2));
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

// ── Instagram Hashtag Picker (3 relevant tags from top 100 IG hashtags) ───
// Only hashtags from the top 100 most followed/used hashtags on Instagram
// Each category maps to DIFFERENT tags to ensure variety across posts
const IG_HASHTAG_MAP = [
  // Remote work & flexibility
  { keywords: ['remote', 'wfh', 'work from home', 'hybrid', 'flexibility', 'location'], tags: ['#travel', '#lifestyle', '#explore'] },
  // Salary & money
  { keywords: ['salary', 'pay', 'compensation', 'raise', 'negotiate', 'income', 'money', 'budget', 'worth'], tags: ['#goals', '#inspiration', '#life'] },
  // Toxic workplace & quitting
  { keywords: ['toxic', 'burnout', 'overwork', 'quit', 'fired', 'layoff', 'red flag'], tags: ['#reels', '#instadaily', '#life'] },
  // Corporate culture & office
  { keywords: ['corporate', 'manager', 'boss', 'office', 'meeting', 'linkedin', 'hr '], tags: ['#funny', '#reels', '#instadaily'] },
  // Job search & hiring
  { keywords: ['job', 'jobs', 'hiring', 'recruit', 'interview', 'applicant', 'apply'], tags: ['#motivation', '#goals', '#success'] },
  // Resume & CV
  { keywords: ['resume', 'cv ', 'portfolio', 'profile', 'cvin.bio'], tags: ['#instagood', '#style', '#photooftheday'] },
  // Tech & engineering
  { keywords: ['tech', 'software', 'developer', 'engineer', 'coding', 'programming', 'ai '], tags: ['#technology', '#amazing', '#cool'] },
  // Startup & entrepreneurship
  { keywords: ['startup', 'founder', 'entrepreneur', 'bootstrapped', 'venture'], tags: ['#entrepreneur', '#hustle', '#success'] },
  // Skills & learning
  { keywords: ['skill', 'learn', 'course', 'certif', 'training', 'education'], tags: ['#inspiration', '#beautiful', '#goals'] },
  // Travel & nomad life
  { keywords: ['travel', 'nomad', 'abroad', 'visa', 'country', 'city', 'relocat'], tags: ['#travel', '#wanderlust', '#adventure'] },
  // Work-life balance
  { keywords: ['balance', 'weekend', 'vacation', 'time off', 'family', 'life'], tags: ['#happy', '#lifestyle', '#love'] },
  // Freelance & independence
  { keywords: ['freelance', 'freelancer', 'independent', 'contract', 'self-employed', 'side'], tags: ['#lifestyle', '#explore', '#goals'] },
  // Design & creative
  { keywords: ['design', 'creative', 'art', 'brand', 'visual', 'aesthetic'], tags: ['#art', '#style', '#beautiful'] },
  // Inequality & fairness
  { keywords: ['inequality', 'unfair', 'gap', 'privilege', 'union', 'rights', 'equity'], tags: ['#reels', '#life', '#instadaily'] },
];

const IG_FALLBACK_TAGS = ['#instagood', '#photooftheday', '#instadaily'];

function pickHashtags(text, count = 3) {
  const lower = text.toLowerCase();
  const scored = new Map(); // tag -> score
  for (const rule of IG_HASHTAG_MAP) {
    const matchCount = rule.keywords.filter(kw => lower.includes(kw)).length;
    if (matchCount > 0) {
      for (const tag of rule.tags) {
        scored.set(tag, (scored.get(tag) || 0) + matchCount);
      }
    }
  }
  // Sort by score descending, pick top N unique tags
  const sorted = [...scored.entries()].sort((a, b) => b[1] - a[1]);
  const picked = sorted.slice(0, count).map(([tag]) => tag);
  // Fill with fallbacks if not enough
  for (const fb of IG_FALLBACK_TAGS) {
    if (picked.length >= count) break;
    if (!picked.includes(fb)) picked.push(fb);
  }
  return picked.slice(0, count);
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

// ── Fetch Threads posts for dedup + live scoring ──────────────────────────
// Full paginated fetch (all posts + insights) runs once per day so the
// performance file stays complete. Every run also fetches the last 25 for
// dedup; their insights are already included in the full fetch when it runs.
async function fetchRecentThreads(performance) {
  if (!THREADS_USER_ID || !THREADS_TOKEN) return { prefixes: [], posts: [] };

  const FULL_FETCH_INTERVAL_MS = 23 * 60 * 60 * 1000; // ~once a day
  const lastUpdated = performance?.updatedAt ? new Date(performance.updatedAt).getTime() : 0;
  const doFullFetch = (Date.now() - lastUpdated) >= FULL_FETCH_INTERVAL_MS;

  try {
    // Always fetch last 25 for dedup prefixes
    const recentRes = await fetch(
      `https://graph.threads.net/v1.0/${THREADS_USER_ID}/threads?fields=id,text,timestamp&limit=25&access_token=${THREADS_TOKEN}`
    );
    if (!recentRes.ok) return { prefixes: [], posts: [] };
    const recentData = await recentRes.json();
    const recentThreads = recentData?.data || [];
    const prefixes = recentThreads.map(p => (p.text || '').slice(0, 120).toLowerCase().trim());

    // Decide which thread IDs to score
    let threadsToScore = recentThreads;
    if (doFullFetch) {
      console.log('  📡 Full Threads backfill (scoring all posts)...');
      const allThreads = [];
      let nextUrl = `https://graph.threads.net/v1.0/${THREADS_USER_ID}/threads?fields=id,text,timestamp&limit=100&access_token=${THREADS_TOKEN}`;
      let pages = 0;
      while (nextUrl && pages < 15) {
        pages++;
        const r = await fetch(nextUrl);
        if (!r.ok) break;
        const d = await r.json();
        allThreads.push(...(d.data || []));
        nextUrl = d.paging?.next || null;
      }
      threadsToScore = allThreads;
      console.log(`  📡 Full fetch: ${allThreads.length} posts across ${pages} pages`);
    }

    const posts = [];
    for (const thread of threadsToScore) {
      const post = {
        text: thread.text || '',
        timestamp: thread.timestamp,
        likes: 0, views: 0, replies: 0, reposts: 0, quotes: 0, shares: 0,
      };
      try {
        const ins = await fetch(
          `https://graph.threads.net/v1.0/${thread.id}/insights?metric=views,likes,replies,reposts,quotes,shares&access_token=${THREADS_TOKEN}`
        );
        if (ins.ok) {
          const insData = await ins.json();
          for (const m of (insData.data || [])) {
            post[m.name] = m.values?.[0]?.value || 0;
          }
        }
      } catch { /* insights optional; dedup still works */ }
      posts.push(post);
    }
    return { prefixes, posts };
  } catch {
    return { prefixes: [], posts: [] };
  }
}

/** Append /th so middleware tags utm_source=threads. Skip media paths and links that already end in /th. */
function withThreadsCta(text) {
  return text.replace(/(https?:\/\/)?cvin\.bio(\/[^\s]*)?/gi, (full, proto = '', path = '') => {
    const p = path || '';
    if (p.startsWith('/images') || /\/th\/?$/i.test(p)) return full;
    const host = proto ? `${proto}cvin.bio` : 'cvin.bio';
    const cleaned = p.replace(/\/$/, '');
    return `${host}${cleaned}/th`;
  });
}

// ── Threads Post ──────────────────────────────────────────────────────────
async function postToThreads(text, mediaUrl, isVideo = false) {
  if (!THREADS_USER_ID || !THREADS_TOKEN) return false;

  try {
    const createParams = new URLSearchParams({ text: withThreadsCta(text), access_token: THREADS_TOKEN });
    
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

    // Container created — Threads will auto-publish even if the publish
    // call below fails or times out, so we treat this as success.
    console.log(`📦 Threads: container created ${createData.id}`);

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
    } else {
      // Log the error but still return true — container was created
      // and Threads will auto-publish it
      console.warn('⚠️ Threads publish response missing id (container was created, will auto-publish):', JSON.stringify(pubData));
    }
    return true; // Always true once container is created
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

  // Cooldown: skip if posted recently (7h gap for 3x/day schedule)
  if (state.lastPostedAt) {
    const elapsed = Date.now() - new Date(state.lastPostedAt).getTime();
    const COOLDOWN_MS = 7 * 60 * 60 * 1000; // 7 hours (3x/day)
    if (elapsed < COOLDOWN_MS) {
      const hrs = (elapsed / 3600000).toFixed(1);
      console.log(`⏳ Meta Cooldown: last post was ${hrs}h ago (need 7h gap). Skipping.`);
      process.exit(0);
    }
  }

  // Each platform tracks its own index so failed platforms can retry
  const fbIdx = state.facebook?.index || 0;
  const igIdx = state.instagram?.index || 0;
  const thIdx = state.threads?.index || 0;

  const hasFacebook = !!(META_PAGE_ID && META_PAGE_TOKEN);
  const hasInstagram = !!(META_IG_USER_ID && META_PAGE_TOKEN);
  const hasThreads = !!(THREADS_USER_ID && THREADS_TOKEN);

  // Threads keeps going after the linear queue by recycling winners.
  if (fbIdx >= items.length && igIdx >= items.length && !hasThreads) {
    console.log(`✅ All ${items.length} engagement posts published on Facebook and Instagram. Done.`);
    process.exit(0);
  }

  console.log(`📊 Platform indices — FB: ${fbIdx}, IG: ${igIdx}, Threads: ${thIdx}`);

  console.log(`🔌 Platform Status: Facebook: ${hasFacebook ? 'Configured' : 'Skipped'}, Instagram: ${hasInstagram ? 'Configured' : 'Skipped'}, Threads: ${hasThreads ? 'Configured' : 'Skipped'}`);

  if (!hasFacebook && !hasInstagram && !hasThreads) {
    console.error('❌ Error: No Meta platforms are configured. Aborting.');
    process.exit(1);
  }

  // Helper to resolve image for a given content item
  function resolveMedia(item) {
    let imagePath = null;
    const REPO_ROOT = path.join(__dirname, '../..');
    if (item.img.startsWith('/')) {
      // Next.js public assets: /images/... → public/images/...
      const publicPath = path.join(REPO_ROOT, 'public', item.img);
      if (fs.existsSync(publicPath)) {
        imagePath = publicPath;
      } else {
        imagePath = item.img; // fallback to absolute
      }
    } else if (item.img.startsWith('.github/images/')) {
      imagePath = path.join(REPO_ROOT, 'public/images/github', item.img.substring('.github/images/'.length));
    } else if (item.img.startsWith('.github/')) {
      imagePath = path.join(REPO_ROOT, item.img);
    } else {
      imagePath = path.join(REPO_ROOT, 'public/images/github', item.img);
    }
    const isVideo = imagePath?.endsWith('.mp4') || false;
    let relativeImgPath = item.img.startsWith('/') ? item.img.substring(1) : item.img;
    if (relativeImgPath.startsWith('.github/images/')) {
      relativeImgPath = relativeImgPath.substring('.github/images/'.length);
    }
    const githubUrl = !isVideo ? `https://cvin.bio/images/github/${relativeImgPath}` : null;
    return { imagePath, isVideo, githubUrl };
  }

  let anySuccess = false;

  // Helper: check if a post should be skipped after too many retries
  const MAX_RETRIES = 3;
  function getRetries(platform) { return state[platform]?.retries || 0; }
  function getRetryIdx(platform) { return state[platform]?.retryIndex ?? -1; }
  function recordFailure(platform, idx) {
    if (!state[platform]) state[platform] = { index: 0 };
    if (getRetryIdx(platform) === idx) {
      state[platform].retries = getRetries(platform) + 1;
    } else {
      state[platform].retries = 1;
      state[platform].retryIndex = idx;
    }
  }
  function shouldSkip(platform, idx) {
    return getRetryIdx(platform) === idx && getRetries(platform) >= MAX_RETRIES;
  }
  function clearRetries(platform) {
    if (state[platform]) { delete state[platform].retries; delete state[platform].retryIndex; }
  }

  // 1. Post to Facebook (at its own index)
  if (hasFacebook && fbIdx < items.length) {
    // Skip posts stuck after MAX_RETRIES
    let fbCurrent = fbIdx;
    while (fbCurrent < items.length && shouldSkip('facebook', fbCurrent)) {
      console.log(`  ⏭️ Facebook: skipping post #${fbCurrent + 1} after ${MAX_RETRIES} failures`);
      fbCurrent++;
      state.facebook.index = fbCurrent;
      clearRetries('facebook');
    }
    if (fbCurrent < items.length) {
      const fbItem = items[fbCurrent];
      const fbText = fbItem.text.trim();
      console.log(`\n📝 Facebook Post #${fbCurrent + 1}/${items.length}: "${fbText.substring(0, 60)}..."`);

      if (!fbItem.img) {
        console.error('  ❌ No image for this post. Skipping.');
        state.facebook.index = fbCurrent + 1;
        clearRetries('facebook');
      } else {
        const { imagePath } = resolveMedia(fbItem);
        if (!fs.existsSync(imagePath)) {
          console.error(`  ❌ Image not found: ${imagePath}`);
          state.facebook.index = fbCurrent + 1;
          clearRetries('facebook');
        } else {
          console.log('  📤 Posting to Facebook...');
          const fb = await postToFacebook(fbText, imagePath);
          if (fb.ok) {
            state.facebook.index = fbCurrent + 1;
            clearRetries('facebook');
            anySuccess = true;
            console.log(`  ✅ Facebook index → ${fbCurrent + 1}`);
          } else {
            recordFailure('facebook', fbCurrent);
            console.error(`  ❌ Facebook post failed (attempt ${getRetries('facebook')}/${MAX_RETRIES})`);
            if (getRetries('facebook') >= MAX_RETRIES) {
              console.log(`  ⏭️ Facebook: auto-skipping post #${fbCurrent + 1} after ${MAX_RETRIES} failures`);
              state.facebook.index = fbCurrent + 1;
              clearRetries('facebook');
              saveState(state);
            }
          }
        }
      }
    }
  } else if (hasFacebook) {
    console.log('  Facebook: all posts published ✅');
  }

  // 2. Post to Instagram (at its own index)
  if (hasInstagram && igIdx < items.length) {
    let igCurrent = igIdx;
    while (igCurrent < items.length && shouldSkip('instagram', igCurrent)) {
      console.log(`  ⏭️ Instagram: skipping post #${igCurrent + 1} after ${MAX_RETRIES} failures`);
      igCurrent++;
      state.instagram.index = igCurrent;
      clearRetries('instagram');
    }
    if (igCurrent < items.length) {
      const igItem = items[igCurrent];
      const igText = igItem.text.trim();
      console.log(`\n📝 Instagram Post #${igCurrent + 1}/${items.length}: "${igText.substring(0, 60)}..."`);

      if (!igItem.img) {
        console.error('  ❌ No image for this post. Skipping.');
        state.instagram.index = igCurrent + 1;
        clearRetries('instagram');
      } else {
        const { imagePath, isVideo, githubUrl } = resolveMedia(igItem);
        if (!fs.existsSync(imagePath)) {
          console.error(`  ❌ Image not found: ${imagePath}`);
          state.instagram.index = igCurrent + 1;
          clearRetries('instagram');
        } else {
          // For IG, we need a public URL — try uploading to FB first for CDN URL, or use GitHub
          let mediaUrl = null;
          if (isVideo) {
            mediaUrl = `https://cvin.bio${igItem.img}`;
          } else {
            // Try to get a public URL from GitHub CDN
            mediaUrl = githubUrl;
          }
          if (!mediaUrl) {
            console.error('  ❌ No public media URL available. Skipping.');
            state.instagram.index = igCurrent + 1;
            clearRetries('instagram');
          } else {
            const hashtags = pickHashtags(igText);
            const igCaption = `${igText}\n\n${hashtags.join(' ')}`;
            console.log(`  📤 Posting to Instagram... (tags: ${hashtags.join(' ')})`);
            const igOk = await postToInstagram(igCaption, mediaUrl, isVideo);
            if (igOk) {
              state.instagram.index = igCurrent + 1;
              clearRetries('instagram');
              anySuccess = true;
              console.log(`  ✅ Instagram index → ${igCurrent + 1}`);
            } else {
              recordFailure('instagram', igCurrent);
              console.error(`  ❌ Instagram post failed (attempt ${getRetries('instagram')}/${MAX_RETRIES})`);
              if (getRetries('instagram') >= MAX_RETRIES) {
                console.log(`  ⏭️ Instagram: auto-skipping post #${igCurrent + 1} after ${MAX_RETRIES} failures`);
                state.instagram.index = igCurrent + 1;
                clearRetries('instagram');
                saveState(state);
              }
            }
          }
        }
      }
    }
  } else if (hasInstagram) {
    console.log('  Instagram: all posts published ✅');
  }

  // 3. Post to Threads — skip known flops, recycle proven winners
  const THREADS_COOLDOWN_MS = 7 * 60 * 60 * 1000; // 7 hours
  const threadsCooldownOk = !state.threads?.lastPostedAt ||
    (Date.now() - new Date(state.threads.lastPostedAt).getTime()) >= THREADS_COOLDOWN_MS;

  if (!threadsCooldownOk && hasThreads) {
    const thElapsed = ((Date.now() - new Date(state.threads.lastPostedAt).getTime()) / 3600000).toFixed(1);
    console.log(`  ⏳ Threads Cooldown: last Threads post was ${thElapsed}h ago (need 7h gap). Skipping Threads.`);
  }

  if (hasThreads && threadsCooldownOk) {
    let performance = loadPerformance();
    const recent = await fetchRecentThreads(performance);
    console.log(`  🔍 Fetched ${recent.prefixes.length} recent Threads posts for dedup + scoring`);

    if (recent.posts.length) {
      performance = applyPostsToPerformance(performance, recent.posts, items);
      savePerformance(performance);
      console.log(`  📈 Threads scoreboard: ${Object.keys(performance.winners).length} winners, ${Object.keys(performance.flops).length} flops`);
    }

    if (!state.threads) state.threads = { index: 0 };
    const pick = pickThreadsCandidate({
      items,
      index: state.threads.index || 0,
      recycleIndex: state.threads.recycleIndex || 0,
      recentPrefixes: recent.prefixes,
      performance,
    });

    if (pick.skippedFlops.length) {
      console.log(`  ⏭️ Threads: skipping ${pick.skippedFlops.length} known flop(s)`);
    }

    if (pick.kind === 'none') {
      state.threads.index = pick.nextIndex;
      saveState(state);
      console.log('  ⏭️ Threads: no eligible post (flops skipped, winners already in the last 25).');
    } else if (pick.kind === 'forward' && shouldSkip('threads', pick.index)) {
      console.log(`  ⏭️ Threads: skipping post #${pick.index + 1} after ${MAX_RETRIES} failures`);
      state.threads.index = pick.nextIndex;
      clearRetries('threads');
      saveState(state);
    } else {
      const thItem = items[pick.index];
      const thText = (thItem.text || '').trim();
      const label = pick.kind === 'recycle' ? '♻️ recycle winner' : `#${pick.index + 1}/${items.length}`;
      console.log(`\n📝 Threads ${label}: "${thText.substring(0, 60)}..."`);

      if (!thItem.img) {
        console.error('  ❌ No image for this post. Skipping.');
        state.threads.index = pick.nextIndex;
        if (pick.kind === 'recycle') state.threads.recycleIndex = pick.recycleIndex;
        clearRetries('threads');
        saveState(state);
      } else {
        const { isVideo, githubUrl } = resolveMedia(thItem);
        const mediaUrl = isVideo ? `https://cvin.bio${thItem.img}` : githubUrl;
        console.log('  📤 Posting to Threads...');
        const thOk = await postToThreads(thText, mediaUrl, isVideo);
        if (thOk) {
          state.threads.index = pick.nextIndex;
          state.threads.recycleIndex = pick.recycleIndex;
          state.threads.lastPostedAt = new Date().toISOString();
          clearRetries('threads');
          anySuccess = true;
          console.log(`  ✅ Threads index → ${pick.nextIndex}${pick.kind === 'recycle' ? ` (recycle ${pick.recycleIndex})` : ''}`);
          saveState(state);
        } else {
          recordFailure('threads', pick.index);
          console.error(`  ❌ Threads post failed (attempt ${getRetries('threads')}/${MAX_RETRIES})`);
          if (getRetries('threads') >= MAX_RETRIES) {
            console.log(`  ⏭️ Threads: auto-skipping post #${pick.index + 1} after ${MAX_RETRIES} failures`);
            state.threads.index = pick.nextIndex;
            if (pick.kind === 'recycle') state.threads.recycleIndex = pick.recycleIndex;
            clearRetries('threads');
            saveState(state);
          }
        }
      }
    }
  }

  if (anySuccess) {
    state.lastPostedAt = new Date().toISOString();
    saveState(state);
    console.log(`\n📊 Post complete! FB:${state.facebook?.index} IG:${state.instagram?.index} TH:${state.threads?.index}`);
  } else {
    // Save state even on failure (retries/skip counts need to persist)
    saveState(state);
    console.error('\n❌ All configured Meta platforms failed to publish. Aborting.');
    process.exit(1);
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
