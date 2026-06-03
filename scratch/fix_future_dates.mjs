import fs from 'fs';
import path from 'path';

const filePath = '/Users/vedang/PDFtoWebsite/src/lib/blog-data.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// The current date threshold
const thresholdDate = new Date('2026-06-04');

// We want to find matches of: date: 'Month DD, YYYY'
const dateRegex = /date:\s*'([A-Za-z]+ \d{1,2}, \d{4})'/g;

let match;
const matches = [];
while ((match = dateRegex.exec(content)) !== null) {
  matches.push({
    fullMatch: match[0],
    dateStr: match[1],
    index: match.index
  });
}

// Process matches in reverse order so replacements don't shift index positions
let updatedContent = content;
let replacedCount = 0;

for (let i = matches.length - 1; i >= 0; i--) {
  const item = matches[i];
  const dateVal = new Date(item.dateStr);
  if (dateVal > thresholdDate) {
    // It's in the future. Let's subtract 120 days to make it in the past.
    const newDate = new Date(dateVal.getTime() - 120 * 24 * 60 * 60 * 1000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const newDateStr = `${months[newDate.getMonth()]} ${String(newDate.getDate()).padStart(2, '0')}, ${newDate.getFullYear()}`;
    
    const before = updatedContent.substring(0, item.index);
    const after = updatedContent.substring(item.index + item.fullMatch.length);
    updatedContent = before + `date: '${newDateStr}'` + after;
    replacedCount++;
  }
}

if (replacedCount > 0) {
  fs.writeFileSync(filePath, updatedContent, 'utf-8');
  console.log(`Successfully updated ${replacedCount} future dates to the past!`);
} else {
  console.log('No future dates found.');
}
