// Merge both batches, filter, download top 65 images
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');
const IMG_DIR = path.join(REPO_ROOT, '.github/images/viral3');

// Load both batches
const batch1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'viral_posts_raw.json'), 'utf8'));
const batch2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'viral_posts_extra.json'), 'utf8'));

// Merge and deduplicate
const all = [...batch1, ...batch2];
const seen = new Set();
const unique = all.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });

// Strict filter
const BANNED = ['trump','biden','maga','democrat','republican','gun','immigration','border',
  'palestine','israel','ukraine','russia','oligarch','aoc','sanders','huckabee','cop ','cops',
  'police','politician','government','congress','senate','socialism','socialist','communis',
  'fascis','abortion','deport','assassination','assassinated','prison',
  'democracy','pedophil','billionaire','billion','healthcare','trillion','civility',
  'violence','strike','protest','riot','revolution','union','r.i.p','rip ','died',
  'killed','murder','death','war ','warzone','passport','neighbor','aunt','floss','airpod',
  'ceiling','pterodactyl','loss prevention','chewed','dog ','right wing','country back',
  'evil','hot yoga','european','freedom','trickle','warned','obvious','system has failed',
  'sustainable','lisa is right','valid question','good to see','about time','amazon',
  'ceo of one','shiftdelete','pot fil','child labor','minimum wage','alien','baby bust',
  'baby bust','save us','comunism','teacher','pepsi','fuck you','screw you',
  'insurance','health ins','vogue','boomers','american dream','american truth',
  'retirement age','motivational quote','spongebob','troll sue','baby bust',
  'railroad','sick leave','baby bust','millennials','teen vogue','paid sick'];

const clean = unique.filter(p => {
  const t = p.title.toLowerCase();
  return !BANNED.some(kw => t.includes(kw));
});

// Sort by score
clean.sort((a, b) => b.score - a.score);

// Also check against existing posts (55-84) to avoid duplicates
const contentFile = path.join(REPO_ROOT, '.github/scripts/x-content.json');
const existing = JSON.parse(fs.readFileSync(contentFile, 'utf8'));
const existingImgs = new Set((existing.engagement || []).slice(55, 85).map(p => p.img || ''));

const fresh = clean.filter(p => {
  // Check if image URL is already used
  return true; // No exact URL match possible since we use local files
});

console.log(`Merged: ${all.length} | Unique: ${unique.length} | Clean: ${clean.length}`);

// Take top 65
const top65 = fresh.slice(0, 65);
console.log(`\n📋 Top 65 posts for download:\n`);
top65.forEach((p, i) => {
  console.log(`${i+1}. [${p.score}] r/${p.subreddit}: ${p.title.substring(0, 90)}`);
  console.log(`   🖼️ ${p.imageUrl}`);
});

// Create images directory
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

// Download images
console.log(`\n📥 Downloading ${top65.length} images to ${IMG_DIR}...\n`);
let downloaded = 0;
let failed = 0;

for (let i = 0; i < top65.length; i++) {
  const p = top65[i];
  const ext = p.imageUrl.match(/\.(jpg|jpeg|png|gif)/i)?.[1] || 'jpg';
  const filename = `v3_${String(i).padStart(2, '0')}_${p.score}.${ext}`;
  const filepath = path.join(IMG_DIR, filename);
  
  if (fs.existsSync(filepath)) {
    console.log(`   ⏭️ ${filename} (exists)`);
    p.localFile = filename;
    downloaded++;
    continue;
  }
  
  try {
    const res = await fetch(p.imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filepath, buf);
    p.localFile = filename;
    downloaded++;
    console.log(`   ✅ ${filename} (${(buf.length/1024).toFixed(0)}KB)`);
  } catch (e) {
    console.log(`   ❌ ${filename}: ${e.message}`);
    p.localFile = null;
    failed++;
  }
  
  await new Promise(r => setTimeout(r, 300));
}

console.log(`\n📊 Downloaded: ${downloaded} | Failed: ${failed}`);

// Save final curated list with local filenames
const final = top65.filter(p => p.localFile);
fs.writeFileSync(path.join(__dirname, 'viral3_curated.json'), JSON.stringify(final, null, 2));
console.log(`💾 Saved ${final.length} curated posts to viral3_curated.json`);
