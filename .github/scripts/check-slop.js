#!/usr/bin/env node
/**
 * Fail if published-facing content still contains noslop violations.
 * See /noslop.md
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BAD = /[—–…]|[“”„‟‘’‚‛]/;
const AI_WORDS = [
  'delve',
  'navigate the landscape',
  'tapestry',
  'testament to',
  'demystify',
  'unveil',
  "in today's fast-paced",
  'unlock your potential',
  'game-changing',
];

const files = [
  'src/app/jobs/[id]/job-detail-client.tsx',
  'src/lib/job-description.ts',
  'src/lib/job-detail-data.ts',
  'src/lib/noslop.ts',
];

// Also scan optional social content if present
for (const extra of [
  '.github/scripts/buffer-content.json',
  '.github/scripts/x-content.json',
]) {
  if (fs.existsSync(path.join(ROOT, extra))) files.push(extra);
}

let issues = 0;

function checkText(text, source) {
  if (!text) return;
  if (BAD.test(text)) {
    // Allow emdash only inside comments in noslop docs themselves
    if (source.includes('noslop')) return;
    const m = text.match(BAD);
    console.log(`SLOP punctuation ${JSON.stringify(m[0])} in ${source}`);
    issues++;
  }
  const lower = text.toLowerCase();
  for (const w of AI_WORDS) {
    if (lower.includes(w)) {
      console.log(`SLOP phrase "${w}" in ${source}`);
      issues++;
    }
  }
}

for (const rel of files) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) continue;
  const text = fs.readFileSync(full, 'utf8');
  // Skip code comments that document the ban (contain the character as example)
  if (rel.endsWith('noslop.ts') || rel.endsWith('noslop.md')) continue;
  // For TSX, only flag string literals that look like user copy (heuristic: lines with quotes containing bad chars)
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) return;
    if (line.includes('// em dash') || line.includes('em dash') || line.includes('U+2014')) return;
    if (BAD.test(line) && /['"`]/.test(line)) {
      console.log(`SLOP in ${rel}:${i + 1}: ${line.trim().slice(0, 100)}`);
      issues++;
    }
  });
  if (rel.endsWith('.json')) checkText(text, rel);
}

console.log(issues === 0 ? 'check-slop: clean' : `check-slop: ${issues} issue(s)`);
process.exit(issues > 0 ? 1 : 0);
