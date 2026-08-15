#!/usr/bin/env node
/**
 * Publish the traits carousel to Instagram (max 10 slides) and Threads (all slides).
 * Images are uploaded to the Facebook Page CDN so public deploy is not required.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SLIDES_DIR = path.join(__dirname, '../images/carousel-traits');
const GRAPH_URL = 'https://graph.facebook.com/v21.0';
const THREADS_URL = 'https://graph.threads.net/v1.0';

const META_PAGE_ID = process.env.META_PAGE_ID;
const META_PAGE_TOKEN = process.env.META_PAGE_TOKEN;
const META_IG_USER_ID = process.env.META_IG_USER_ID;
const THREADS_USER_ID = process.env.THREADS_USER_ID;
const THREADS_TOKEN = process.env.THREADS_ACCESS_TOKEN;

const IG_CAPTION = `Your traits aren’t random.

They’re clues. Use them.

Swipe through. Find the ones that are actually yours.

Then put them where a recruiter can see them.

cvin.bio

#careeradvice #jobsearch #hiring`;

const THREADS_TEXT = `Your traits aren’t random.

They’re clues. Use them.

Swipe through. Find the ones that are actually yours.

Then put them where a recruiter can see them.

cvin.bio`;

const IG_MAX = 10;
const THREADS_MAX = 20;

const REPO = process.env.GITHUB_REPOSITORY || 'vedangvatsa/PDFtoWebsite';
const BRANCH = process.env.GITHUB_REF_NAME || process.env.GITHUB_HEAD_REF || 'main';

function slidePaths(limit) {
  const files = [];
  for (let i = 1; i <= limit; i++) {
    const p = path.join(SLIDES_DIR, `${String(i).padStart(2, '0')}.png`);
    if (!fs.existsSync(p)) throw new Error(`Missing slide: ${p}`);
    files.push(p);
  }
  return files;
}

function publicSlideUrl(basename) {
  return `https://raw.githubusercontent.com/${REPO}/${BRANCH}/.github/images/carousel-traits/${basename}`;
}

async function resolvePublicUrls(paths) {
  // Meta fetches image_url server-side; raw GitHub URLs work after push to main.
  return paths.map((p) => publicSlideUrl(path.basename(p)));
}

async function createIgCarouselItem(imageUrl) {
  const params = new URLSearchParams({
    image_url: imageUrl,
    is_carousel_item: 'true',
    access_token: META_PAGE_TOKEN,
  });
  const res = await fetch(`${GRAPH_URL}/${META_IG_USER_ID}/media`, { method: 'POST', body: params });
  const data = await res.json();
  if (!data.id) throw new Error(`IG carousel item failed: ${JSON.stringify(data)}`);
  return data.id;
}

async function publishInstagramCarousel(imageUrls, caption) {
  const childIds = [];
  for (const url of imageUrls) {
    childIds.push(await createIgCarouselItem(url));
    console.log(`  📦 IG child container ${childIds.length}/${imageUrls.length}`);
  }

  const parentParams = new URLSearchParams({
    media_type: 'CAROUSEL',
    caption,
    children: childIds.join(','),
    access_token: META_PAGE_TOKEN,
  });
  const parentRes = await fetch(`${GRAPH_URL}/${META_IG_USER_ID}/media`, { method: 'POST', body: parentParams });
  const parentData = await parentRes.json();
  if (!parentData.id) throw new Error(`IG carousel parent failed: ${JSON.stringify(parentData)}`);

  await new Promise((r) => setTimeout(r, 5000));

  const pubParams = new URLSearchParams({
    creation_id: parentData.id,
    access_token: META_PAGE_TOKEN,
  });
  const pubRes = await fetch(`${GRAPH_URL}/${META_IG_USER_ID}/media_publish`, { method: 'POST', body: pubParams });
  const pubData = await pubRes.json();
  if (!pubData.id) throw new Error(`IG publish failed: ${JSON.stringify(pubData)}`);
  return pubData.id;
}

async function createThreadsCarouselItem(imageUrl) {
  const params = new URLSearchParams({
    media_type: 'IMAGE',
    image_url: imageUrl,
    is_carousel_item: 'true',
    access_token: THREADS_TOKEN,
  });
  const res = await fetch(`${THREADS_URL}/${THREADS_USER_ID}/threads`, { method: 'POST', body: params });
  const data = await res.json();
  if (!data.id) throw new Error(`Threads carousel item failed: ${JSON.stringify(data)}`);
  return data.id;
}

async function publishThreadsCarousel(imageUrls, text) {
  const childIds = [];
  for (const url of imageUrls) {
    childIds.push(await createThreadsCarouselItem(url));
    console.log(`  📦 Threads child container ${childIds.length}/${imageUrls.length}`);
    await new Promise((r) => setTimeout(r, 1500));
  }

  const parentParams = new URLSearchParams({
    media_type: 'CAROUSEL',
    children: childIds.join(','),
    text,
    access_token: THREADS_TOKEN,
  });
  const parentRes = await fetch(`${THREADS_URL}/${THREADS_USER_ID}/threads`, { method: 'POST', body: parentParams });
  const parentData = await parentRes.json();
  if (!parentData.id) throw new Error(`Threads carousel parent failed: ${JSON.stringify(parentData)}`);

  await new Promise((r) => setTimeout(r, 5000));

  const pubParams = new URLSearchParams({
    creation_id: parentData.id,
    access_token: THREADS_TOKEN,
  });
  const pubRes = await fetch(`${THREADS_URL}/${THREADS_USER_ID}/threads_publish`, { method: 'POST', body: pubParams });
  const pubData = await pubRes.json();
  if (!pubData.id) {
    console.warn('⚠️ Threads publish response:', JSON.stringify(pubData), '(container may still auto-publish)');
  }
  return parentData.id;
}

async function main() {
  const totalSlides = fs.readdirSync(SLIDES_DIR).filter((f) => /^\d{2}\.png$/.test(f)).length;
  if (totalSlides < 2) throw new Error(`Need at least 2 slides in ${SLIDES_DIR}`);

  const igCount = Math.min(totalSlides, IG_MAX);
  const thCount = Math.min(totalSlides, THREADS_MAX);

  const hasIg = !!(META_IG_USER_ID && META_PAGE_TOKEN && META_PAGE_ID);
  const hasThreads = !!(THREADS_USER_ID && THREADS_TOKEN);

  console.log(`Slides: ${totalSlides} | IG: ${hasIg ? igCount : 'skip'} | Threads: ${hasThreads ? thCount : 'skip'}`);

  if (!hasIg && !hasThreads) {
    console.error('❌ Set META_* and/or THREADS_* env vars.');
    process.exit(1);
  }

  let igOk = !hasIg;
  let thOk = !hasThreads;
  let hadError = false;

  if (hasIg) {
    try {
      console.log('\n📸 Instagram carousel…');
      const paths = slidePaths(igCount);
      const urls = await resolvePublicUrls(paths);
      console.log(`  URLs: ${urls[0]} … (${urls.length} slides)`);
      const id = await publishInstagramCarousel(urls, IG_CAPTION);
      console.log(`✅ Instagram published: ${id} (${igCount} slides)`);
      igOk = true;
    } catch (err) {
      hadError = true;
      console.error(`❌ Instagram failed: ${err.message || err}`);
      if (String(err.message || err).includes('OAuth') || String(err.message || err).includes('access token')) {
        console.error('   Refresh META_PAGE_TOKEN in GitHub repo secrets (Facebook Page long-lived token).');
      }
    }
  }

  if (hasThreads) {
    try {
      console.log('\n🧵 Threads carousel…');
      const paths = slidePaths(thCount);
      const urls = await resolvePublicUrls(paths);
      console.log(`  URLs: ${urls[0]} … (${urls.length} slides)`);
      const id = await publishThreadsCarousel(urls, THREADS_TEXT);
      console.log(`✅ Threads published: ${id} (${thCount} slides)`);
      thOk = true;
    } catch (err) {
      hadError = true;
      console.error(`❌ Threads failed: ${err.message || err}`);
    }
  }

  if (!igOk && !thOk) process.exit(1);
  if (hadError) console.log('\n⚠️ One or more platforms failed — see logs above.');
}

main().catch((err) => {
  console.error('Fatal:', err.message || err);
  process.exit(1);
});
