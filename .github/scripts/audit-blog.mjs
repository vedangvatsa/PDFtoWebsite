/**
 * Audit blog articles for word count and NoSlop flags.
 * Usage: node .github/scripts/audit-blog.mjs [--json] [--under N]
 */
import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const BLOG_DIR = join(ROOT, 'src/content/blog');

function extractText(tsx) {
  let s = tsx
    .replace(/import[\s\S]*?from\s+['"][^'"]+['"];?\n?/g, '')
    .replace(/export default function[\s\S]*?return\s*\(/, '')
    .replace(/\);\s*\}\s*$/, '');
  s = s.replace(/aria-label="([^"]+)"/g, ' $1 ');
  s = s.replace(/className=\{[^}]+\}/g, ' ');
  s = s.replace(/className="[^"]*"/g, ' ');
  s = s.replace(/<[^>]+>/g, ' ');
  s = s.replace(/\{['"]([^'"]+)['"]\}/g, ' $1 ');
  s = s.replace(/\{[^}]*\}/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function faqWordsForSlug(blogData, slug) {
  const block = blogData.match(
    new RegExp(`slug:\\s*'${slug.replace(/-/g, '\\-')}'[\\s\\S]*?(?=\\n  \\},\\n  \\{|\\];)`)
  );
  if (!block) return 0;
  const faqText = [...block[0].matchAll(/(?:question|answer):\s*['"]([^'"]+)['"]/g)]
    .map((x) => x[1])
    .join(' ');
  return wordCount(faqText);
}

const BANNED_WORDS = [
  'delve', 'tapestry', 'pivotal', 'vibrant', 'meticulous', 'testament', 'intricate',
  'interplay', 'garner', 'bolster', 'foster', 'showcase', 'emphasize', 'enduring',
  'crucial', 'enhance', 'highlighting', 'renowned', 'groundbreaking', 'profound',
  'comprehensive', 'multifaceted', 'leverage', 'utilize', 'facilitate', 'encompasses',
  'spearhead', 'harness', 'elevate', 'streamline', 'robust', 'seamless', 'holistic',
  'synergy', 'paradigm', 'supercharge', 'embark', 'paramount', 'transformative',
  'cutting-edge', 'game-changer', 'ever-evolving', 'empower', 'realm', 'beacon',
  'elucidate', 'endeavor', 'myriad', 'plethora', 'catalyze', 'resonate', 'cultivate',
  'galvanize', 'cornerstone', 'reimagine', 'revolutionize', 'next-generation',
  'world-class', 'enterprise-grade', 'best-in-class', 'thought-provoking', 'invaluable',
  'indelible', 'emblematic', 'noteworthy', 'unlock', 'unleash', 'unpack', 'navigate',
  'optimize', 'innovative', 'nestled', 'bustling', 'unwavering', 'nuanced',
];

const BANNED_PHRASES = [
  "it's worth noting", 'it is important to note', 'at the end of the day',
  'when it comes to', 'at its core', "in today's", 'in the age of', 'in the world of',
  'the reality is', 'the truth is', 'in terms of', 'with regard to', 'in order to',
  'going forward', "let's dive in", "let's unpack", 'let me be clear', "here's the thing",
  "here's what", 'what nobody tells you', 'what most people get wrong',
  'the part everyone misses', 'the best part:', 'experts agree', 'studies show',
  'industry reports suggest', 'widely regarded as', 'in conclusion', 'to summarize',
  'to sum up', "let's explore", 'we will examine', 'as we can see',
  'it goes without saying', 'without further ado', 'i hope this helps',
  'as an ai', 'as a language model', 'based on the information provided',
  'supercharge your workflow', 'building the future', 'reimagining', 'stay tuned',
  'watch this space', 'only time will tell', 'a double-edged sword', 'a mixed bag',
  'low-hanging fruit', 'move the needle', 'circle back', 'synergize', 'touch base',
  'this comprehensive guide', 'in this article, we will explore',
  "whether you're a beginner or an expert", 'on one hand', 'moreover,', 'furthermore,',
  'additionally,', 'interestingly,', 'notably,', 'importantly,', 'indeed,',
  'certainly,', 'absolutely,', 'great question', 'excellent question',
  "i'd be happy to", "however, it's important",
];

function auditBody(body) {
  const issues = [];
  if (body.includes('—') || body.includes('–')) issues.push('em/en dash');
  for (const w of BANNED_WORDS) {
    const re = new RegExp(`\\b${w.replace(/-/g, '[- ]?')}\\b`, 'i');
    if (re.test(body)) issues.push(`word:${w}`);
  }
  const lower = body.toLowerCase();
  for (const p of BANNED_PHRASES) {
    if (lower.includes(p)) issues.push(`phrase:${p}`);
  }
  if (/\bnot just\b/i.test(body)) issues.push('phrase:not just');
  if (/\bnot only\b/i.test(body)) issues.push('phrase:not only');
  return issues;
}

const blogData = readFileSync(join(ROOT, 'src/lib/blog-data.tsx'), 'utf8');
const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.tsx')).sort();
const rows = files.map((file) => {
  const slug = file.replace(/\.tsx$/, '');
  const raw = readFileSync(join(BLOG_DIR, file), 'utf8');
  const body = extractText(raw);
  const bodyW = wordCount(body);
  const faqW = faqWordsForSlug(blogData, slug);
  return { slug, bodyW, faqW, total: bodyW + faqW, issues: auditBody(body) };
});

const under = Number(process.argv.find((a) => a.startsWith('--under='))?.split('=')[1] || 1500);
const json = process.argv.includes('--json');

if (json) {
  console.log(
    JSON.stringify(
      {
        total: rows.length,
        under1500: rows.filter((r) => r.total < under).length,
        withIssues: rows.filter((r) => r.issues.length).length,
        rows: rows.sort((a, b) => a.total - b.total),
      },
      null,
      2
    )
  );
} else {
  const failing = rows.filter((r) => r.total < under).sort((a, b) => a.total - b.total);
  console.log(`Articles: ${rows.length}`);
  console.log(`Under ${under} words: ${failing.length}`);
  console.log(`NoSlop flags: ${rows.filter((r) => r.issues.length).length}`);
  for (const r of failing) {
    console.log(`${String(r.total).padStart(5)}  /${r.slug}${r.issues.length ? `  [${r.issues.join(', ')}]` : ''}`);
  }
}
