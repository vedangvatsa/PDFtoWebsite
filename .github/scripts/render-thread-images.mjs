import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../images/threads');
const CONTENT_FILE = path.join(__dirname, 'x-content.json');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ── Brand-consistent HTML shell ──────────────────────────────────────────
const shell = (content, bgColor = '#FFFFFF') => `
<!DOCTYPE html>
<html>
<head>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1600px; height: 900px;
    background: ${bgColor};
    color: #09090B;
    font-family: 'Inter', -apple-system, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }
  .watermark {
    position: absolute;
    bottom: 36px; right: 48px;
    font-size: 22px; font-weight: 600;
    color: #A1A1AA;
    letter-spacing: -0.02em;
  }
  .thread-tag {
    position: absolute;
    top: 36px; left: 48px;
    font-size: 16px; font-weight: 600;
    color: #A1A1AA;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .container {
    width: 1360px;
    display: flex;
    flex-direction: column;
  }
  .num {
    font-size: 180px;
    font-weight: 900;
    color: #E4E4E7;
    letter-spacing: -0.06em;
    line-height: 1;
    position: absolute;
    top: 40px; right: 60px;
  }
  h1 {
    font-size: 72px;
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1.1;
    margin-bottom: 24px;
  }
  h2 {
    font-size: 42px;
    font-weight: 500;
    color: #71717A;
    line-height: 1.35;
  }
  .provider {
    font-size: 28px;
    font-weight: 700;
    color: #6366F1;
    letter-spacing: -0.01em;
    margin-bottom: 16px;
  }
  .details {
    display: flex;
    gap: 32px;
    margin-top: 32px;
    flex-wrap: wrap;
  }
  .detail-chip {
    background: #F4F4F5;
    border-radius: 12px;
    padding: 14px 28px;
    font-size: 24px;
    font-weight: 600;
    color: #3F3F46;
  }
  .accent { color: #6366F1; }
  .green { color: #10B981; }
  .big-emoji {
    font-size: 80px;
    margin-bottom: 24px;
  }
  .divider {
    width: 80px;
    height: 6px;
    background: #6366F1;
    border-radius: 3px;
    margin: 24px 0;
  }
  .card {
    background: #FAFAFA;
    border: 2px solid #E4E4E7;
    border-radius: 16px;
    padding: 40px 48px;
  }
  .card-accent {
    border-left: 8px solid #6366F1;
  }
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 24px;
  }
  .bullet {
    font-size: 28px;
    line-height: 1.6;
    color: #3F3F46;
  }
  .bullet span { color: #6366F1; font-weight: 700; }
</style>
</head>
<body>
  ${content}
  <div class="watermark">cvin.bio</div>
</body>
</html>`;

// ── Template builders ────────────────────────────────────────────────────

function hookTemplate(title, subtitle, emoji = '🧵') {
  return shell(`
    <div class="container" style="align-items: center; text-align: center;">
      <div style="font-size: 80px; margin-bottom: 32px;">${emoji}</div>
      <h1 style="font-size: 84px; max-width: 1100px;">${title}</h1>
      <div class="divider" style="margin: 32px auto;"></div>
      <h2 style="max-width: 900px;">${subtitle}</h2>
    </div>
  `);
}

function courseTemplate(num, name, provider, details, highlights) {
  const chips = highlights.map(h => `<div class="detail-chip">${h}</div>`).join('');
  return shell(`
    <div class="num">${num}</div>
    <div class="container">
      <div class="provider">${provider}</div>
      <h1>${name}</h1>
      <h2 style="max-width: 1000px;">${details}</h2>
      <div class="details">${chips}</div>
    </div>
  `);
}

function ctaTemplate(title, subtitle) {
  return shell(`
    <div class="container" style="align-items: center; text-align: center;">
      <div style="font-size: 80px; margin-bottom: 32px;">🔖</div>
      <h1 style="font-size: 72px; max-width: 1000px;">${title}</h1>
      <div class="divider" style="margin: 32px auto;"></div>
      <h2 style="max-width: 800px;">${subtitle}</h2>
      <div style="margin-top: 48px; font-size: 48px; font-weight: 800; color: #6366F1;">cvin.bio</div>
    </div>
  `);
}

function listTemplate(title, items, emoji = '📋') {
  const bullets = items.map(i => `<div class="bullet"><span>→</span> ${i}</div>`).join('');
  return shell(`
    <div class="container">
      <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 32px;">
        <div style="font-size: 56px;">${emoji}</div>
        <h1 style="margin-bottom: 0;">${title}</h1>
      </div>
      <div class="divider"></div>
      <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 12px;">
        ${bullets}
      </div>
    </div>
  `);
}

function toolTemplate(num, name, description, replaces, url) {
  return shell(`
    <div class="num">${num}</div>
    <div class="container">
      <h1>${name}</h1>
      <h2 style="max-width: 1000px; margin-bottom: 32px;">${description}</h2>
      <div class="card card-accent" style="max-width: 900px;">
        <div style="font-size: 22px; color: #71717A; font-weight: 600; margin-bottom: 8px;">REPLACES</div>
        <div style="font-size: 32px; font-weight: 700; color: #09090B;">${replaces}</div>
      </div>
      <div style="margin-top: 24px; font-size: 24px; color: #A1A1AA;">${url}</div>
    </div>
  `);
}

function repoTemplate(num, name, desc, stars) {
  return shell(`
    <div class="num">${num}</div>
    <div class="container">
      <div style="font-size: 24px; font-weight: 600; color: #A1A1AA; margin-bottom: 8px;">⭐ ${stars}</div>
      <h1>${name}</h1>
      <h2 style="max-width: 1000px;">${desc}</h2>
    </div>
  `);
}

function statTemplate(headline, stat, detail) {
  return shell(`
    <div class="container" style="align-items: center; text-align: center;">
      <h2 style="margin-bottom: 24px;">${headline}</h2>
      <h1 style="font-size: 140px; color: #6366F1;">${stat}</h1>
      <h2 style="max-width: 900px; margin-top: 16px;">${detail}</h2>
    </div>
  `);
}

function weekTemplate(weekNum, title, items, color = '#6366F1') {
  const bullets = items.map(i => `<div class="bullet"><span>→</span> ${i}</div>`).join('');
  return shell(`
    <div class="container">
      <div style="display: flex; align-items: baseline; gap: 20px; margin-bottom: 16px;">
        <div style="font-size: 24px; font-weight: 800; color: ${color}; letter-spacing: 0.05em; text-transform: uppercase;">WEEK ${weekNum}</div>
      </div>
      <h1>${title}</h1>
      <div class="divider" style="background: ${color};"></div>
      <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 12px;">
        ${bullets}
      </div>
    </div>
  `);
}

// ── Build all 85 image templates ────────────────────────────────────────
const images = [];

// ═══ THREAD 1: Free AI Courses (12 tweets) ═══
images.push({ file: 't01_01.png', html: hookTemplate('10 Free AI Courses', 'Not certificate farms. The ones hiring managers actually recognize.', '🤖') });
images.push({ file: 't01_02.png', html: courseTemplate('1', 'Machine Learning', 'COURSERA — ANDREW NG', 'The gold standard. Regression, neural networks, transformers.', ['60 hours', 'Self-paced', 'Free to audit']) });
images.push({ file: 't01_03.png', html: courseTemplate('2', 'Practical Deep Learning', 'FAST.AI — JEREMY HOWARD', 'Top-down approach. Build first, theory later.', ['7 lessons', 'Free', 'Python only prereq']) });
images.push({ file: 't01_04.png', html: courseTemplate('3', 'CS50 AI with Python', 'HARVARD / EDX', 'Search, knowledge, ML, neural nets, NLP.', ['12 weeks', 'Free to audit', 'Harvard quality']) });
images.push({ file: 't01_05.png', html: courseTemplate('4', 'Google AI Essentials', 'GOOGLE / COURSERA', 'Prompt engineering, responsible AI, applied use cases.', ['10 hours', 'Beginner friendly', 'Free cert available']) });
images.push({ file: 't01_06.png', html: courseTemplate('5', 'Generative AI for Everyone', 'DEEPLEARNING.AI — ANDREW NG', 'How LLMs work. For non-engineers.', ['3 hours', 'Free to audit', 'No code needed']) });
images.push({ file: 't01_07.png', html: courseTemplate('6', 'Hugging Face NLP Course', 'HUGGING FACE', 'Build real NLP pipelines with transformers.', ['Free', 'Open source', 'Updated monthly']) });
images.push({ file: 't01_08.png', html: courseTemplate('7', 'Intro to Deep Learning', 'MIT 6.S191', 'CNNs, RNNs, GANs, reinforcement learning.', ['Full lectures', 'YouTube', 'Free forever']) });
images.push({ file: 't01_09.png', html: courseTemplate('8', 'CS229 Machine Learning', 'STANFORD', 'The course that started it all. 20 lectures.', ['Math-heavy', 'Theory depth', 'Free on YouTube']) });
images.push({ file: 't01_10.png', html: courseTemplate('9', 'Kaggle Learn', 'KAGGLE', 'Bite-sized interactive courses in your browser.', ['4 hours each', 'No setup', 'Weekend-friendly']) });
images.push({ file: 't01_11.png', html: courseTemplate('10', 'Elements of AI', 'UNIVERSITY OF HELSINKI', 'AI fundamentals without code. 750K+ enrolled.', ['Free', 'No prerequisites', 'Genuinely enjoyable']) });
images.push({ file: 't01_12.png', html: ctaTemplate('Bookmark this thread.', 'Share it with someone building AI skills.') });

// ═══ THREAD 2: Blockchain Certifications (8 tweets) ═══
images.push({ file: 't02_01.png', html: hookTemplate('Free Blockchain Certifications', 'No paid bootcamps. Just free programs from actual protocols.', '⛓️') });
images.push({ file: 't02_02.png', html: courseTemplate('1', 'Ethereum Dev Bootcamp', 'ALCHEMY UNIVERSITY', 'Full Solidity curriculum. Smart contracts from scratch.', ['6 weeks', 'Free', '100K+ devs']) });
images.push({ file: 't02_03.png', html: courseTemplate('2', 'Developer Bootcamp', 'CHAINLINK', 'Hybrid smart contracts with oracles.', ['Free', 'Live cohorts', 'Mentorship']) });
images.push({ file: 't02_04.png', html: courseTemplate('3', 'Solana Bootcamp', 'SOLANA FOUNDATION', 'Rust + Anchor framework. Build programs on Solana.', ['Project-based', 'Free', 'Best docs']) });
images.push({ file: 't02_05.png', html: courseTemplate('4', 'Blockchain Developer', 'CONSENSYS ACADEMY', 'Ethereum, Solidity, Truffle, smart contract security.', ['Self-paced', 'Free tier', 'MetaMask team']) });
images.push({ file: 't02_06.png', html: courseTemplate('5', 'Web3 University', 'ALCHEMY', 'Build NFT dapps, DeFi protocols, DAOs.', ['1-3 hours each', 'Free', 'Project-based']) });
images.push({ file: 't02_07.png', html: courseTemplate('6', 'Cyfrin Updraft', 'PATRICK COLLINS', 'Most comprehensive Solidity course. Foundry-based.', ['32 hours', 'Free', 'Security-focused']) });
images.push({ file: 't02_08.png', html: ctaTemplate('These certs are recognized by Web3 companies hiring right now.', 'Browse 17,000+ roles including Web3.') });

// ═══ THREAD 3: Python in 30 Days (7 tweets) ═══
images.push({ file: 't03_01.png', html: hookTemplate('Learn Python in 30 Days', 'An actual roadmap. Not 400 hours of tutorials.', '🐍') });
images.push({ file: 't03_02.png', html: weekTemplate('1', 'Fundamentals', ['Variables, data types, loops, conditionals', 'Functions, scope, error handling', 'python.org tutorial + Exercism.org', '2-3 hours per day']) });
images.push({ file: 't03_03.png', html: weekTemplate('2', 'Data Structures', ['Lists, dicts, sets, tuples', 'List comprehensions, slicing, file I/O', 'Automate the Boring Stuff (free)', 'LeetCode Easy problems'], '#10B981') });
images.push({ file: 't03_04.png', html: weekTemplate('3', 'Libraries + Projects', ['requests, BeautifulSoup (scraping)', 'pandas (data), Flask/FastAPI (APIs)', 'Build a web scraper saving to CSV', 'Build a REST API with 3 endpoints'], '#F59E0B') });
images.push({ file: 't03_05.png', html: weekTemplate('4', 'Portfolio + Job Ready', ['Git basics (commit, push, branch)', 'README for each project', 'Deploy one project live', 'Apply to 10 junior Python roles'], '#EF4444') });
images.push({ file: 't03_06.png', html: listTemplate('Free Resources', ['python.org/tutorial', 'automatetheboringstuff.com', 'exercism.org', 'realpython.com', 'freecodecamp.org (YouTube)', 'kaggle.com/learn'], '📚') });
images.push({ file: 't03_07.png', html: ctaTemplate('Stop watching tutorials. Start building.', 'Break things. Google the error. Fix it. That\'s how devs learn.') });

// ═══ THREAD 4: Free Dev Tools (9 tweets) ═══
images.push({ file: 't04_01.png', html: hookTemplate('7 Free Tools That Replace $500/mo SaaS', 'Every one is free or has a generous free tier.', '🛠️') });
images.push({ file: 't04_02.png', html: toolTemplate('1', 'Cursor', 'AI-powered code editor. Autocomplete + chat with your codebase.', 'GitHub Copilot ($10/mo)', 'cursor.com') });
images.push({ file: 't04_03.png', html: toolTemplate('2', 'Supabase', 'Postgres, auth, storage, realtime, edge functions.', 'Firebase + Auth0 ($25+/mo)', 'supabase.com') });
images.push({ file: 't04_04.png', html: toolTemplate('3', 'Vercel', 'Deploy React/Next.js. Free SSL, CDN, preview deploys.', 'Heroku + Netlify paid ($7+/mo)', 'vercel.com') });
images.push({ file: 't04_05.png', html: toolTemplate('4', 'Excalidraw', 'Hand-drawn style diagrams. Real-time collaboration.', 'Miro / Figma diagrams ($12+/mo)', 'excalidraw.com') });
images.push({ file: 't04_06.png', html: toolTemplate('5', 'Umami', 'Privacy-first analytics. Self-hosted, 100% free.', 'Google Analytics / Mixpanel ($25+/mo)', 'umami.is') });
images.push({ file: 't04_07.png', html: toolTemplate('6', 'Resend', 'Beautiful email API. React Email for templates.', 'SendGrid / Mailgun paid tiers', 'resend.com') });
images.push({ file: 't04_08.png', html: toolTemplate('7', 'Linear', 'Fastest PM tool. Free for teams up to 250 issues.', 'Jira ($7.75/user/mo) + suffering', 'linear.app') });
images.push({ file: 't04_09.png', html: ctaTemplate('Total savings: $500+/month', 'The best tools in 2026 are free.') });

// ═══ THREAD 5: GitHub Repos (12 tweets) ═══
images.push({ file: 't05_01.png', html: hookTemplate('10 GitHub Repos to Star', 'Not viral repos with zero utility. Actual tools.', '⭐') });
images.push({ file: 't05_02.png', html: repoTemplate('1', 'build-your-own-x', 'Build your own database, blockchain, Docker, Git, search engine, web server.', '340K+ stars') });
images.push({ file: 't05_03.png', html: repoTemplate('2', 'free-programming-books', 'Thousands of free books organized by language. The internet\'s best education library.', '350K+ stars') });
images.push({ file: 't05_04.png', html: repoTemplate('3', 'system-design-primer', 'Everything for system design interviews. Load balancing, caching, microservices.', '290K+ stars') });
images.push({ file: 't05_05.png', html: repoTemplate('4', 'project-based-learning', 'Learn by building in 20+ languages. Web apps, games, ML models, CLI tools.', '220K+ stars') });
images.push({ file: 't05_06.png', html: repoTemplate('5', 'developer-roadmap', 'Visual roadmaps for frontend, backend, DevOps, AI, blockchain. Updated monthly.', '310K+ stars') });
images.push({ file: 't05_07.png', html: repoTemplate('6', 'awesome-selfhosted', '2,000+ self-hostable alternatives to commercial services. Never pay for SaaS again.', '220K+ stars') });
images.push({ file: 't05_08.png', html: repoTemplate('7', 'public-apis', '1,400+ free APIs: weather, crypto, news, music, maps, AI. Perfect for projects.', '330K+ stars') });
images.push({ file: 't05_09.png', html: repoTemplate('8', 'tech-interview-handbook', 'Algorithms, behavioral questions, resume tips, negotiation. Ex-Meta engineer.', '125K+ stars') });
images.push({ file: 't05_10.png', html: repoTemplate('9', '30-seconds-of-code', 'Short snippets for JS, Python, React, CSS. Quick reference for common patterns.', '122K+ stars') });
images.push({ file: 't05_11.png', html: repoTemplate('10', 'the-book-of-secret-knowledge', 'Terminal tools, one-liners, cheatsheets, security tools. Swiss army knife.', '160K+ stars') });
images.push({ file: 't05_12.png', html: ctaTemplate('Star them all. Refer back when you need them.', 'Building skills is step one. Showing them is step two.') });

// ═══ THREAD 6: Remote Job Guide (6 tweets) ═══
images.push({ file: 't06_01.png', html: hookTemplate('Remote Job Hunting in 2026', 'Where to find jobs. Red flags. How to negotiate.', '🌍') });
images.push({ file: 't06_02.png', html: listTemplate('Where to Find Remote Jobs', ['We Work Remotely', 'Remote OK', 'Himalayas', 'Remotive', 'AngelList / Wellfound', 'cvin.bio/jobs (17,000+ roles)'], '🔍') });
images.push({ file: 't06_03.png', html: listTemplate('Red Flags in Remote Listings', ['"Must overlap 8 hours with US timezone"', 'No salary range = lowball incoming', '"Startup culture" = always online', '"Camera on" daily standups = surveillance', 'No async tools mentioned'], '🚩') });
images.push({ file: 't06_04.png', html: listTemplate('How to Stand Out Remotely', ['Record a 60-second Loom intro', 'Show timezone overlap explicitly', 'Mention async tools (Notion, Linear)', 'Share a link to your work, not a PDF'], '✨') });
images.push({ file: 't06_05.png', html: listTemplate('Negotiating Remote Comp', ['Never accept the first offer', 'Ask "Is this adjusted for location?"', 'Negotiate perks if salary is fixed', 'Get remote policy in writing'], '💰') });
images.push({ file: 't06_06.png', html: ctaTemplate('Apply to remote-first companies.', 'Not companies that "allow" remote.') });

// ═══ THREAD 7: AI Tools for Job Search (8 tweets) ═══
images.push({ file: 't07_01.png', html: hookTemplate('7 AI Tools for Your Job Search', 'Not hype. These actually work.', '🤖') });
images.push({ file: 't07_02.png', html: toolTemplate('1', 'ChatGPT / Claude', 'Paste job description + resume. Get a tailored cover letter in 30 seconds.', 'Manually writing cover letters', '') });
images.push({ file: 't07_03.png', html: toolTemplate('2', 'Teal', 'AI job tracker. Tailors your resume and highlights keyword matches.', 'Spreadsheet tracking', 'tealhq.com') });
images.push({ file: 't07_04.png', html: toolTemplate('3', 'Jobscan', 'Paste resume + JD. Shows exactly which keywords to add. ATS score.', 'Guessing at keywords', 'jobscan.co') });
images.push({ file: 't07_05.png', html: toolTemplate('4', 'Otta', 'Set preferences once. Get matched to roles. No spam.', 'Scrolling job boards manually', 'otta.com') });
images.push({ file: 't07_06.png', html: toolTemplate('5', 'Huntr', 'Kanban board for job search. Chrome extension auto-saves jobs.', 'Losing track of applications', 'huntr.co') });
images.push({ file: 't07_07.png', html: toolTemplate('6', 'Interview Warmup', 'Google\'s AI mock interviews. Analyzes filler words and structure.', 'Practicing alone', 'grow.google') });
images.push({ file: 't07_08.png', html: ctaTemplate('The tools are better than ever.', 'Use them. Share this with someone still doing it the old way.') });

// ═══ THREAD 8: How ATS Works (7 tweets) ═══
images.push({ file: 't08_01.png', html: hookTemplate('How ATS Actually Works', 'What happens when you upload your resume.', '📄') });
images.push({ file: 't08_02.png', html: shell(`
  <div class="container">
    <h1>The Two-Column Collapse</h1>
    <h2 style="margin-bottom: 32px;">Parsers read top-to-bottom, left-to-right. Columns get mashed.</h2>
    <div class="grid-2">
      <div class="card"><div style="font-size: 22px; font-weight: 700; color: #10B981; margin-bottom: 12px;">YOUR LAYOUT</div><div style="font-size: 28px; color: #3F3F46;">Skills | Experience<br/>React | Senior Dev</div></div>
      <div class="card" style="border-color: #FCA5A5; background: #FEF2F2;"><div style="font-size: 22px; font-weight: 700; color: #EF4444; margin-bottom: 12px;">ATS READS</div><div style="font-size: 28px; color: #991B1B;">"Skills Experience React Senior Dev"</div><div style="font-size: 22px; color: #EF4444; margin-top: 12px; font-weight: 700;">❌ Rejected</div></div>
    </div>
  </div>
`) });
images.push({ file: 't08_03.png', html: shell(`
  <div class="container">
    <h1>Invisible SVG Contact Info</h1>
    <h2 style="margin-bottom: 32px;">Custom vector icons? OCR libraries skip them entirely.</h2>
    <div class="grid-2">
      <div class="card"><div style="font-size: 22px; font-weight: 700; color: #10B981; margin-bottom: 12px;">RAW TEXT</div><div style="font-size: 28px;">Email: alex@gmail.com</div><div style="font-size: 22px; color: #10B981; margin-top: 12px; font-weight: 700;">✓ Mapped to DB</div></div>
      <div class="card" style="border-color: #FCA5A5; background: #FEF2F2;"><div style="font-size: 22px; font-weight: 700; color: #EF4444; margin-bottom: 12px;">SVG ICON</div><div style="font-size: 28px; color: #991B1B;">[invisible] alex@gmail.com</div><div style="font-size: 22px; color: #EF4444; margin-top: 12px; font-weight: 700;">✗ Contact info lost</div></div>
    </div>
  </div>
`) });
images.push({ file: 't08_04.png', html: shell(`
  <div class="container" style="text-align: center; align-items: center;">
    <h1 style="font-size: 100px;"><span style="color: #EF4444;">Node.js</span> <span style="color: #A1A1AA;">≠</span> NodeJS</h1>
    <div class="divider" style="margin: 32px auto;"></div>
    <h2 style="max-width: 900px;">Legacy ATS uses exact string matching. Not an LLM. A single punctuation difference drops your score.</h2>
  </div>
`) });
images.push({ file: 't08_05.png', html: shell(`
  <div class="container">
    <h1>DOCX = ZIP of XML</h1>
    <h2 style="margin-bottom: 32px;">Complex tables create deeply nested XML trees that parsers can't handle.</h2>
    <div class="card" style="background: #18181B; border: none;">
      <pre style="font-family: monospace; font-size: 24px; color: #A1A1AA; line-height: 1.5; margin: 0;">&lt;w:document&gt;
  &lt;w:body&gt;
    &lt;w:tbl&gt;
      &lt;w:tr&gt;&lt;w:tc&gt;
        <span style="color: #EF4444; font-weight: bold;">[Error: Unexpected node at /body/tbl/tr/tc]</span>
        <span style="color: #EF4444; font-weight: bold;">[Fatal: Parser Aborted. Payload empty.]</span>
      &lt;/w:tc&gt;&lt;/w:tr&gt;
    &lt;/w:tbl&gt;</pre>
    </div>
  </div>
`) });
images.push({ file: 't08_06.png', html: statTemplate('The Real Numbers', '75%', 'of resumes never reach a human. The filter wasn\'t built to find talent. It was built to reduce volume.') });
images.push({ file: 't08_07.png', html: ctaTemplate('Stop trusting the black box.', 'Send a live URL instead of a PDF. No parsing. No garbled text.') });

// ═══ THREAD 9: Web3 Career Guide (7 tweets) ═══
images.push({ file: 't09_01.png', html: hookTemplate('Break Into Web3 in 2026', 'Salaries, skills, where to look, what to learn first.', '🌐') });
images.push({ file: 't09_02.png', html: listTemplate('Web3 Roles', ['Smart contract dev (Solidity, Rust)', 'Frontend (React + ethers.js)', 'Protocol engineer', 'DevRel', 'Security auditor', 'Community manager', 'Product manager', 'On-chain analyst'], '👷') });
images.push({ file: 't09_03.png', html: shell(`
  <div class="container">
    <h1>Web3 Salary Benchmarks</h1>
    <div class="divider"></div>
    <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 24px;">
      <div style="display: flex; justify-content: space-between; font-size: 32px; padding: 16px 0; border-bottom: 2px solid #F4F4F5;"><span style="font-weight: 600;">Junior Solidity Dev</span><span style="font-weight: 800; color: #6366F1;">$80-120K</span></div>
      <div style="display: flex; justify-content: space-between; font-size: 32px; padding: 16px 0; border-bottom: 2px solid #F4F4F5;"><span style="font-weight: 600;">Senior Smart Contract Eng</span><span style="font-weight: 800; color: #6366F1;">$150-250K</span></div>
      <div style="display: flex; justify-content: space-between; font-size: 32px; padding: 16px 0; border-bottom: 2px solid #F4F4F5;"><span style="font-weight: 600;">Protocol Engineer</span><span style="font-weight: 800; color: #6366F1;">$200-350K</span></div>
      <div style="display: flex; justify-content: space-between; font-size: 32px; padding: 16px 0; border-bottom: 2px solid #F4F4F5;"><span style="font-weight: 600;">Security Auditor</span><span style="font-weight: 800; color: #6366F1;">$180-300K</span></div>
      <div style="display: flex; justify-content: space-between; font-size: 32px; padding: 16px 0;"><span style="font-weight: 600;">DevRel</span><span style="font-weight: 800; color: #6366F1;">$100-180K</span></div>
    </div>
    <div style="margin-top: 24px; font-size: 24px; color: #71717A;">Web3 pays 20-40% above Web2 for equivalent seniority.</div>
  </div>
`) });
images.push({ file: 't09_04.png', html: listTemplate('Where to Find Web3 Jobs', ['cvin.bio/jobs', 'crypto.jobs', 'web3.career', 'Wellfound (crypto filter)', 'Protocol Discord channels'], '🔍') });
images.push({ file: 't09_05.png', html: weekTemplate('1-4', 'JS/TS Developer Path', ['Week 1: Solidity basics (CryptoZombies.io)', 'Week 2: Build + deploy smart contract (Remix)', 'Week 3: Connect frontend (ethers.js)', 'Week 4: Deploy to testnet. Push to GitHub.'], '#10B981') });
images.push({ file: 't09_06.png', html: listTemplate('Non-Code Web3 Roles', ['Community managers (Discord/Telegram)', 'Content writers (docs, blogs)', 'Analysts (Dune Analytics, Nansen)', 'Marketing (growth, partnerships)'], '📝') });
images.push({ file: 't09_07.png', html: ctaTemplate('Build in public. The community is small.', 'People notice contributors.') });

// ═══ THREAD 10: Interview Prep (7 tweets) ═══
images.push({ file: 't10_01.png', html: hookTemplate('Interview Prep Megathread', 'Technical, behavioral, system design, negotiation. All free.', '🎯') });
images.push({ file: 't10_02.png', html: listTemplate('Technical Interviews', ['NeetCode.io — 150 curated problems', 'Blind 75 / Grind 75 lists', 'LeetCode free (2,000+ problems)', 'HackerRank Interview Prep Kit', '2-3 problems/day for 30 days'], '💻') });
images.push({ file: 't10_03.png', html: listTemplate('System Design', ['system-design-primer (290K stars)', 'ByteByteGo YouTube (free)', 'Designing Data-Intensive Applications', 'interviewing.io blog'], '🏗️') });
images.push({ file: 't10_04.png', html: listTemplate('Behavioral Interviews', ['STAR: Situation, Task, Action, Result', 'Prep 5 stories: conflict, failure, leadership', 'Amazon Leadership Principles', 'Interview Warmup by Google (AI)'], '🗣️') });
images.push({ file: 't10_05.png', html: listTemplate('Salary Negotiation', ['levels.fyi for comp data', 'Never say a number first', '"What is the comp band for this level?"', '85% of companies expect negotiation', 'Negotiate signing bonus or equity too'], '💰') });
images.push({ file: 't10_06.png', html: listTemplate('Mock Interview Platforms', ['Pramp — free peer-to-peer', 'interviewing.io — FAANG engineers', 'Interview Warmup — Google AI', 'Record yourself on Loom'], '🎤') });
images.push({ file: 't10_07.png', html: ctaTemplate('This thread replaces a $2,000 bootcamp.', 'Bookmark it. Share it.') });

// ── Generate all images ──────────────────────────────────────────────────
async function generate() {
  console.log(`Generating ${images.length} thread images...`);
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 2 });

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const outPath = path.join(OUT_DIR, img.file);
    process.stdout.write(`  [${i + 1}/${images.length}] ${img.file}...`);
    await page.setContent(img.html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800)); // font loading
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(' ✅');
  }

  await browser.close();
  console.log(`\n✅ All ${images.length} images saved to ${OUT_DIR}`);
}

generate().catch(e => { console.error(e); process.exit(1); });
