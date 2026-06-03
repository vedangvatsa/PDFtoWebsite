const fs = require('fs');

function countWords(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Extract text inside tags like <p>, <h2>, <h3>, <li>, etc.
  const regex = /<p[^>]*>([\s\S]*?)<\/p>|<li[^>]*>([\s\S]*?)<\/li>|<h[23][^>]*>([\s\S]*?)<\/h[23]>/g;
  let match;
  let wordCount = 0;
  let textContent = '';

  while ((match = regex.exec(content)) !== null) {
    const text = (match[1] || match[2] || match[3] || '')
      .replace(/<[^>]+>/g, '') // remove inline tags like <Link> or <span>
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .trim();
    if (text) {
      textContent += text + ' ';
      const words = text.split(/\s+/).filter(w => w.length > 0);
      wordCount += words.length;
    }
  }

  console.log(`File: ${filePath}`);
  console.log(`Word Count: ${wordCount}`);
  // Print preview of first 200 words
  // console.log(`Preview:\n${textContent.split(/\s+/).slice(0, 100).join(' ')}...`);
  return wordCount;
}

const file = process.argv[2];
if (file) {
  countWords(file);
} else {
  console.error("Please provide a file path.");
}
