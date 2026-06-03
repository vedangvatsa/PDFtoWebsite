// Fetch more viral posts - all time + different time ranges
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUBREDDITS_EXTRA = [
  { sub: 'antiwork', t: 'all' },
  { sub: 'recruitinghell', t: 'all' },
  { sub: 'LinkedInLunatics', t: 'all' },
  { sub: 'jobs', t: 'all' },
  { sub: 'ProgrammerHumor', t: 'all' },
  { sub: 'WorkReform', t: 'all' },
  { sub: 'antiwork', t: 'month' },
  { sub: 'recruitinghell', t: 'month' },
  { sub: 'LinkedInLunatics', t: 'month' },
  { sub: 'jobs', t: 'month' },
  { sub: 'workreform', t: 'month' },
];

const WORK_SUBS = ['antiwork', 'WorkReform', 'workreform', 'recruitinghell', 'jobs', 
  'LinkedInLunatics', 'cscareerquestions', 'WorkersStrikeBack'];

const WORK_KEYWORDS = [
  'work', 'job', 'boss', 'office', 'meeting', 'email', 'coworker',
  'employee', 'employer', 'hire', 'hiring', 'fired', 'salary', 
  'interview', 'resume', 'remote', 'wfh', 'corporate', 'manager',
  'intern', 'developer', 'programmer', 'coding', 'deploy', 'production',
  'code', 'debug', 'client', 'deadline', 'sprint', 'standup',
  'layoff', 'laid off', 'pay', 'wage', 'promotion', 'quit',
  'resign', 'hr', 'recruiter', 'linkedin', 'career', 'company',
  'startup', 'freelance', 'overtime', 'burnout', 'toxic',
  'hustle', 'grind', 'cubicle', 'commute', 'rto', 'return to office',
  'application', 'applied', 'offer', 'benefits', 'pto', 'raise', 'bonus'
];

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
  'ceo of one','shiftdelete','pot fil','child labor','minimum wage'];

// Load existing posts to dedup
const existing = JSON.parse(fs.readFileSync('scratch/viral_posts_raw.json', 'utf8'));
const existingIds = new Set(existing.map(p => p.id));

async function fetchSub(sub, t) {
  const url = `https://www.reddit.com/r/${sub}/top.json?t=${t}&limit=100`;
  console.log(`📡 r/${sub} (${t})...`);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (WorkViralBot/2.0)' }
    });
    if (!res.ok) { console.warn(`   ⚠️ ${res.status}`); return []; }
    const data = await res.json();
    return (data.data?.children || [])
      .map(p => p.data)
      .filter(d => {
        if (d.is_video || !d.url) return false;
        if (existingIds.has(d.id)) return false;
        const isImage = d.post_hint === 'image' || /\.(jpg|jpeg|png|gif)$/i.test(d.url) || d.url.includes('i.redd.it');
        if (!isImage) return false;
        const t = d.title.toLowerCase();
        if (BANNED.some(kw => t.includes(kw))) return false;
        if (!WORK_SUBS.includes(sub)) {
          if (!WORK_KEYWORDS.some(kw => t.includes(kw))) return false;
        }
        return true;
      })
      .map(d => ({
        title: d.title, score: d.score,
        imageUrl: d.url.replace(/&amp;/g, '&'),
        permalink: `https://www.reddit.com${d.permalink}`,
        subreddit: sub, id: d.id
      }));
  } catch (e) { console.warn(`   ❌ ${e.message}`); return []; }
}

async function main() {
  const allNew = [];
  for (const {sub, t} of SUBREDDITS_EXTRA) {
    const posts = await fetchSub(sub, t);
    console.log(`   ✅ ${posts.length} new posts`);
    allNew.push(...posts);
    await new Promise(r => setTimeout(r, 1500));
  }
  
  const seen = new Set();
  const unique = allNew.filter(p => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
  
  unique.sort((a, b) => b.score - a.score);
  
  console.log(`\n📊 New unique posts: ${unique.length}`);
  unique.slice(0, 50).forEach((p,i) => console.log(`${i+1}. [${p.score}] r/${p.subreddit}: ${p.title.substring(0,90)}`));
  
  fs.writeFileSync('scratch/viral_posts_extra.json', JSON.stringify(unique.slice(0, 50), null, 2));
  console.log(`\n💾 Saved to viral_posts_extra.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
