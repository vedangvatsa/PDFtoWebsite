/**
 * Apply safe automated NoSlop fixes to blog article bodies.
 * Usage: node .github/scripts/fix-blog-noslop.mjs [--dry-run]
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = join(__dirname, '../../src/content/blog');
const dryRun = process.argv.includes('--dry-run');

const WORD_SWAPS = [
  [/\bleverage\b/gi, 'use'],
  [/\butilize\b/gi, 'use'],
  [/\bfacilitate\b/gi, 'help'],
  [/\bshowcase\b/gi, 'show'],
  [/\bemphasize\b/gi, 'stress'],
  [/\benhance\b/gi, 'improve'],
  [/\bhighlighting\b/gi, 'showing'],
  [/\boptimize\b/gi, 'tune'],
  [/\boptimizing\b/gi, 'tuning'],
  [/\boptimized\b/gi, 'tuned'],
  [/\boptimization\b/gi, 'tuning'],
  [/\bnavigate\b/gi, 'work through'],
  [/\bnavigating\b/gi, 'working through'],
  [/\bstreamline\b/gi, 'simplify'],
  [/\brobust\b/gi, 'strong'],
  [/\bseamless\b/gi, 'smooth'],
  [/\bcomprehensive\b/gi, 'full'],
  [/\bfoster\b/gi, 'build'],
  [/\bbolster\b/gi, 'support'],
  [/\bembark\b/gi, 'start'],
  [/\bunlock\b/gi, 'open'],
  [/\bunleash\b/gi, 'release'],
  [/\bunpack\b/gi, 'break down'],
  [/\bsynergize\b/gi, 'coordinate'],
  [/\bmove the needle\b/gi, 'change results'],
  [/\bwhen it comes to\b/gi, 'for'],
  [/\bin order to\b/gi, 'to'],
  [/\bin terms of\b/gi, 'for'],
  [/\bat the end of the day\b/gi, ''],
  [/\bto summarize\b/gi, ''],
  [/\bin conclusion\b/gi, ''],
  [/\bstudies show\b/gi, 'research finds'],
  [/\bmoreover,\s*/gi, ''],
  [/\bfurthermore,\s*/gi, ''],
  [/\badditionally,\s*/gi, ''],
  [/\binterestingly,\s*/gi, ''],
  [/\bnotably,\s*/gi, ''],
  [/\bimportantly,\s*/gi, ''],
];

function fixContent(s) {
  let out = s;
  // Em/en dash to period or comma (inside JSX text nodes mostly)
  out = out.replace(/\s*[—–]\s*/g, '. ');
  out = out.replace(/\.\s+\./g, '.');
  for (const [re, rep] of WORD_SWAPS) out = out.replace(re, rep);
  // "not just X, but Y" -> "X works, and Y"
  out = out.replace(/\bnot just\b/gi, '');
  out = out.replace(/\bnot only\b/gi, '');
  // collapse double spaces in string literals only
  out = out.replace(/>([^<]+)</g, (m, text) => {
    if (!text.trim() || text.includes('{')) return m;
    return `>${text.replace(/  +/g, ' ').replace(/\s+\./g, '.')}<`;
  });
  return out;
}

let changed = 0;
for (const file of readdirSync(BLOG_DIR).filter((f) => f.endsWith('.tsx'))) {
  const path = join(BLOG_DIR, file);
  const raw = readFileSync(path, 'utf8');
  const fixed = fixContent(raw);
  if (fixed !== raw) {
    changed++;
    if (!dryRun) writeFileSync(path, fixed);
    console.log(dryRun ? 'would fix' : 'fixed', file);
  }
}
console.log(`${dryRun ? 'Would change' : 'Changed'} ${changed} files`);
