// Buffer LinkedIn + Instagram Auto-Scheduler (GitHub Actions version)
// Reads state from buffer-state.json, schedules next batch, updates state

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, 'buffer-state.json');

const TOKEN = process.env.BUFFER_TOKEN;
if (!TOKEN) { console.error('Missing BUFFER_TOKEN'); process.exit(1); }

const CHANNELS = {
  linkedin:  '69c5268baf47dacb69589bc6',
  instagram: '69c5279caf47dacb6958a000',
};
const IMG_BASE = 'https://cvin.bio/images/social';

const POSTS = [
  `Someone on Reddit shared this. 2,000 upvotes in a day.\n\nWork of 3 people. $53k. No raise.\n\nManager promised 15%. Got 1.75%.\n\nLeft his keys on the desk. Walked out by 10am.\n\nNobody was surprised.\n\nIf they don't value you, someone else will. cvin.bio`,
  `Job hunting in 2026:\n\n45 minutes filling a form that already had your CV.\nOne call. Two interviews. Take-home task.\n\nTwo weeks later: nothing. Not a rejection. Just silence.\n\nA profile that works for you even when companies don't. cvin.bio`,
  `Real job listing.\n\nEntry level.\n3-5 years experience required.\nDegree required.\nSalary: competitive.\n\nThe talent is there. The listing is broken.\n\nYou're more than a listing can capture. Show it at cvin.bio`,
  `Companies say they can't find talent.\n\nThey fired 3 people. Told 1 to cover it all.\n\nTalent shortages at a 17-year high. Employee engagement at a 10-year low.\n\nKnow your worth before they pretend they don't. cvin.bio`,
  `Someone posted a Sunday newspaper to r/jobs.\n\nJob listings section: completely empty.\n\nWe still hire like it's that newspaper. PDF. ATS scans it. Bot rejects it. Hear nothing.\n\nSkip the ATS. Share a link instead. cvin.bio`,
  `Annual review.\n\nManager: "We value you."\nHR: "Budget constraints."\nLetter: 2.1% raise.\nInflation: 3.8%.\n\nEffective pay cut dressed up as a raise.\n\nYour next raise starts with being visible to the right people. cvin.bio`,
  `Companies post about psychological safety.\n\nThen ghost candidates after the final round.\n\nThe application experience is a preview of the culture.\n\nThe companies worth joining will find you first. cvin.bio`,
  `Entry level used to mean you could learn on the job.\n\nNow it means: want someone senior, not paying senior rates, not willing to train.\n\nLet your actual skills speak louder than the requirements. cvin.bio`,
  `The talent shortage isn't real.\n\nWhat's real: below-market pay, poor management, no flexibility.\n\nThe talent moved somewhere that treats it better.\n\nBe somewhere better. cvin.bio`,
  `72% of resumes are rejected before a human sees them.\n\nThe ATS was built to help recruiters manage volume.\n\nIt now filters out qualified candidates before anyone human reads them.\n\nA link doesn't go through an ATS. cvin.bio`,
  `"We'll revisit your compensation in 6 months."\n\nThat was 18 months ago.\n\nVerbal commitments in this economy are not commitments. They're stalling tactics.\n\nGet it in writing. Or get better options. cvin.bio`,
  `Recruiter called. Said it was urgent. Great fit.\n\nThree interviews in two weeks.\n\nRadio silence for a month.\n\nThen: "Hey, are you still exploring opportunities?"\n\nLet the right ones find you instead. cvin.bio`,
  `Fresh grad: degree, two internships, portfolio.\n\nEntry level role: 3 years experience.\nJunior role: 5 years.\nMid-level: management experience.\n\nSomeone pulled the ladder up.\n\nBuild the profile that bypasses the first filter. cvin.bio`,
  `Understaffing is a business decision dressed up as a market problem.\n\n"We can't find anyone" means: nobody will work these hours for this pay with this manager.\n\nUntil they fix the conditions, you have options. cvin.bio`,
  `Your CV goes to:\n1. Email inbox.\n2. ATS keyword filter.\n3. 6-second skim.\n4. Pile.\n\nNone of these care about your actual work.\n\nDon't be a pile. Be a link. cvin.bio`,
  `The real math of staying loyal to one company:\n\nYear 1: market rate.\nYear 4: budget freeze.\n\nMeanwhile, someone hired externally gets 20% more than you on day one.\n\nLoyalty is not a career strategy. Options are. cvin.bio`,
  `The real cost of a bad hire:\n\n$240,000 per wrong hire.\n6 months to realize the mistake.\n74% of employers admit they've hired wrong.\n\nCompanies spend more recovering from bad hires than actually finding good ones.\n\nBe impossible to ignore. cvin.bio`,
  `Where recruiters actually look:\n\n1. LinkedIn — 3 seconds\n2. Portfolio link — 12 seconds\n3. Your CV — 6 seconds\n4. Cover letter — never\n\nA link gets 4x more attention than a PDF. cvin.bio`,
  `Remote work in 2021:\nEverywhere. Flexible. Trust-based.\n\nRemote work in 2026:\nHybrid mandatory. Surveillance software. Return to office.\n\nThe job market changed. Your strategy should too.\n\nStart here. cvin.bio`,
  `What they ask: "Tell me about yourself."\n\nWhat they mean: sell yourself in 60 seconds or you're out.\n\nThe gap between what interviewers say and what they want is enormous.\n\nLet your profile speak before you walk in. cvin.bio`,
  `Your CV: sits in a folder.\nYour profile link: works while you sleep.\n\nOne gets lost. One gets shared.\n\nStop sending files. Start sharing links. cvin.bio`,
  `100 applications sent. 12 callbacks. 4 interviews. 1 offer.\n\nThat's the average.\n\nThe system isn't broken for companies. It's broken for you.\n\nMake every application count. cvin.bio`,
  `Why candidates get rejected:\n\n34% — No online presence\n28% — Generic CV\n22% — No portfolio\n16% — Other\n\nMore than half of rejections happen before anyone reads your skills.\n\nFix the first impression. cvin.bio`,
  `How long companies take to reply:\n\nDay 1 — You apply.\nDay 14 — Automated acknowledgment.\nDay 45 — First human contact.\nDay 90 — "We went with someone else."\n\n90 days of silence is not a process. It's disrespect.\n\nTake back control. cvin.bio`,
  `Sending a PDF:\n✗ Filtered by ATS\n✗ Buried in inbox\n✗ Can't update once sent\n✗ No analytics\n\nSharing a link:\n✓ Bypasses all filters\n✓ Always accessible\n✓ Updates in real time\n✓ Track who viewed\n\nThe difference is one click. cvin.bio`,
  `The job market in 2026:\n\n250 applications per opening.\n7.4 seconds spent on each CV.\n63% of jobs filled through networking.\n85% of applications never reach a human.\n\nNumbers don't lie. Your strategy needs to change. cvin.bio`,
];

async function gql(query) {
  const r = await fetch('https://api.buffer.com/graphql', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return r.json();
}

async function schedulePost(channelId, platform, text, imageNum, dueAt) {
  const imgUrl = `${IMG_BASE}/post_${imageNum}.png`;
  const escapedText = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
  
  const metadataBlock = platform === 'instagram'
    ? `metadata: { instagram: { type: post, shouldShareToFeed: true } }`
    : '';
  
  const query = `mutation {
    createPost(input: {
      channelId: "${channelId}"
      text: "${escapedText}"
      mode: customScheduled
      schedulingType: automatic
      dueAt: "${dueAt}"
      assets: { images: [{ url: "${imgUrl}" }] }
      ${metadataBlock}
    }) {
      ... on PostActionSuccess { post { id dueAt } }
      ... on LimitReachedError { message }
      ... on InvalidInputError { message }
      ... on UnexpectedError { message }
    }
  }`;
  
  return gql(query);
}

// 3 posts/day: 1 AM, 9 AM, 5 PM IST
function generateSchedule(startIndex) {
  const now = new Date();
  // Start from tomorrow
  let day = new Date(now);
  day.setUTCDate(day.getUTCDate() + 1);
  day.setUTCHours(0, 0, 0, 0);
  
  const slots = [
    { h: 19, m: 30, prevDay: true }, // 1:00 AM IST = 19:30 UTC (previous day)
    { h: 3, m: 30, prevDay: false },  // 9:00 AM IST = 03:30 UTC
    { h: 11, m: 30, prevDay: false }, // 5:00 PM IST = 11:30 UTC
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
  // Load state
  let state = { linkedin: 10, instagram: 10 }; // default: first 10 already scheduled
  if (fs.existsSync(STATE_FILE)) {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  
  console.log(`📅 Buffer Scheduler — current state: LI=${state.linkedin}, IG=${state.instagram}`);
  
  if (state.linkedin >= POSTS.length && state.instagram >= POSTS.length) {
    console.log('✅ All posts scheduled on all channels. Nothing to do.');
    process.exit(0);
  }
  
  for (const [platform, channelId] of Object.entries(CHANNELS)) {
    const skip = state[platform] || 0;
    if (skip >= POSTS.length) { console.log(`\n── ${platform}: all done ──`); continue; }
    
    const schedule = generateSchedule(skip);
    console.log(`\n── ${platform.toUpperCase()} (starting from #${skip + 1}) ──`);
    
    let scheduled = 0;
    
    for (let i = skip; i < POSTS.length; i++) {
      const imageNum = String(i + 1).padStart(2, '0');
      const dueAt = schedule[i - skip];
      if (!dueAt) break;
      
      try {
        const result = await schedulePost(channelId, platform, POSTS[i], imageNum, dueAt);
        
        if (result.data?.createPost?.post) {
          const time = new Date(dueAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
          console.log(`✅ #${i + 1} → ${time}`);
          scheduled++;
          state[platform] = i + 1;
        } else {
          const err = result.data?.createPost?.message || result.errors?.[0]?.message || 'Unknown';
          console.log(`❌ #${i + 1} → ${err}`);
          if (err.includes('limit') || err.includes('Limit')) {
            console.log(`⏸ Hit limit for ${platform}. Will continue next run.`);
            break;
          }
        }
      } catch (e) {
        console.log(`❌ #${i + 1} → ${e.message}`);
      }
      
      await new Promise(r => setTimeout(r, 1500));
    }
    
    console.log(`   ${platform}: ${scheduled} new posts scheduled`);
  }
  
  // Save state
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log(`\n💾 State saved: LI=${state.linkedin}, IG=${state.instagram}`);
}

main().catch(e => { console.error(e); process.exit(1); });
