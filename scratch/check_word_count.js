const fs = require('fs');

function countWords(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /<p[^>]*>([\s\S]*?)<\/p>|<li[^>]*>([\s\S]*?)<\/li>|<h[23][^>]*>([\s\S]*?)<\/h[23]>/g;
  let match;
  let wordCount = 0;
  let textBlocks = [];

  while ((match = regex.exec(content)) !== null) {
    const rawText = match[1] || match[2] || match[3] || '';
    const cleanText = rawText.replace(/<[^>]+>/g, '').trim();
    if (cleanText) {
      textBlocks.push(cleanText);
      const words = cleanText.split(/\s+/).filter(Boolean);
      wordCount += words.length;
    }
  }

  console.log(`File: ${filePath}`);
  console.log(`Word Count inside text tags: ${wordCount}`);
  if (wordCount < 1100) {
    console.log(`Warning: Word count is under 1,100!`);
  } else {
    console.log(`Success: Word count is sufficient!`);
  }
}

const file = process.argv[2];
if (file) {
  countWords(file);
} else {
  console.error("Please provide a file path.");
}
