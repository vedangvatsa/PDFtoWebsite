// Step 1: Fetch viral Reddit posts with images from multiple subreddits
// Step 2: Download images locally  
// Step 3: Upload to freeimage.host (permanent, Buffer-compatible)
// Step 4: Schedule to Buffer LinkedIn

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');
const IMG_DIR = path.join(REPO_ROOT, '.github/images/viral3');
const OUTPUT_FILE = path.join(__dirname, 'viral_posts_raw.json');

const SUBREDDITS = [
  'antiwork', 'WorkReform', 'recruitinghell', 'jobs',
  'LinkedInLunatics', 'ProgrammerHumor', 'cscareerquestions',
  'mildlyinfuriating', 'facepalm', 'meirl',
  'latestagecapitalism', 'WorkersStrikeBack'
];

const WORK_KEYWORDS = [
  'work', 'job', 'boss', 'office', 'meeting', 'email', 'coworker',
  'employee', 'employer', 'hire', 'hiring', 'fired', 'salary', 
  'interview', 'resume', 'remote', 'wfh', 'corporate', 'manager',
  'intern', 'developer', 'programmer', 'coding', 'deploy', 'production',
  'code', 'debug', 'client', 'deadline', 'sprint', 'standup',
  'layoff', 'laid off', 'pay', 'wage', 'promotion', 'quit',
  'resign', 'hr', 'recruiter', 'linkedin', 'career', 'company',
  'ceo', 'startup', 'freelance', 'overtime', 'burnout', 'toxic',
  'hustle', 'grind', 'cubicle', 'commute', 'rto', 'return to office',
  'application', 'applied', 'offer', 'benefits', 'insurance', 'pto',
  'vacation', 'retirement', '401k', 'raise', 'bonus'
];

// Subreddits that are inherently work-related (skip keyword filter)
const WORK_SUBS = ['antiwork', 'WorkReform', 'recruitinghell', 'jobs', 
  'LinkedInLunatics', 'cscareerquestions', 'WorkersStrikeBack'];

const BANNED_KEYWORDS = ['child labor', 'union vote', 'minimum wage law', 
  'abortion', 'trump', 'biden', 'maga', 'democrat', 'republican', 'gun',
  'immigration', 'border', 'palestine', 'israel', 'ukraine', 'russia'];

async function fetchSubreddit(sub) {
  const url = `https://www.reddit.com/r/${sub}/top.json?t=year&limit=100`;
  console.log(`📡 Fetching r/${sub}...`);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (WorkViralBot/1.0)' }
    });
    if (!res.ok) { console.warn(`   ⚠️ r/${sub}: ${res.status}`); return []; }
    const data = await res.json();
    const posts = data.data?.children || [];
    
    return posts
      .map(p => p.data)
      .filter(d => {
        // Must have image
        if (d.is_video) return false;
        if (!d.url) return false;
        const isImage = d.post_hint === 'image' || 
          /\.(jpg|jpeg|png|gif)$/i.test(d.url) ||
          d.url.includes('i.redd.it');
        if (!isImage) return false;
        
        // Check for banned content
        const titleLower = d.title.toLowerCase();
        if (BANNED_KEYWORDS.some(kw => titleLower.includes(kw))) return false;
        
        // Work-related filter (skip for inherently work subs)
        if (!WORK_SUBS.includes(sub)) {
          const isWork = WORK_KEYWORDS.some(kw => titleLower.includes(kw));
          if (!isWork) return false;
        }
        
        return true;
      })
      .map(d => ({
        title: d.title,
        score: d.score,
        imageUrl: d.url.replace(/&amp;/g, '&'),
        permalink: `https://www.reddit.com${d.permalink}`,
        subreddit: sub,
        id: d.id
      }));
  } catch (e) {
    console.warn(`   ❌ r/${sub}: ${e.message}`);
    return [];
  }
}

async function main() {
  // Fetch from all subreddits
  const allPosts = [];
  for (const sub of SUBREDDITS) {
    const posts = await fetchSubreddit(sub);
    console.log(`   ✅ r/${sub}: ${posts.length} image posts found`);
    allPosts.push(...posts);
    await new Promise(r => setTimeout(r, 1500)); // Rate limit
  }
  
  // Deduplicate by image URL
  const seen = new Set();
  const unique = allPosts.filter(p => {
    if (seen.has(p.imageUrl)) return false;
    seen.add(p.imageUrl);
    return true;
  });
  
  // Sort by score descending
  unique.sort((a, b) => b.score - a.score);
  
  // Also filter out posts we already have (check existing viral2 images by checking x-content.json)
  const contentFile = path.join(REPO_ROOT, '.github/scripts/x-content.json');
  const existing = JSON.parse(fs.readFileSync(contentFile, 'utf8'));
  const existingTexts = (existing.engagement || []).map(p => p.text?.toLowerCase() || '');
  
  const fresh = unique.filter(p => {
    const titleLower = p.title.toLowerCase();
    // Skip if title words substantially overlap with existing posts
    return !existingTexts.some(t => {
      const words = titleLower.split(/\s+/).filter(w => w.length > 4);
      const matches = words.filter(w => t.includes(w));
      return matches.length > 3;
    });
  });
  
  console.log(`\n📊 Total: ${allPosts.length} | Unique: ${unique.length} | Fresh: ${fresh.length}`);
  console.log(`\n🏆 Top 80 by score (taking 80 to give buffer for curation):\n`);
  
  const top80 = fresh.slice(0, 80);
  top80.forEach((p, i) => {
    console.log(`${i+1}. [${p.score}] r/${p.subreddit}: ${p.title.substring(0, 80)}`);
  });
  
  // Save to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(top80, null, 2));
  console.log(`\n💾 Saved ${top80.length} posts to ${OUTPUT_FILE}`);
}

main().catch(e => { console.error(e); process.exit(1); });
