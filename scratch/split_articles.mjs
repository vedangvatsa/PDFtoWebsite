import fs from 'fs';
import path from 'path';

const blogDataPath = '/Users/vedang/PDFtoWebsite/src/lib/blog-data.tsx';
const targetDir = '/Users/vedang/PDFtoWebsite/src/content/blog';

// Ensure the directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const fileContent = fs.readFileSync(blogDataPath, 'utf-8');

// Find all matches for slugs
const slugRegex = /slug:\s*'([^']+)'/g;
const slugs = [];
let match;
while ((match = slugRegex.exec(fileContent)) !== null) {
  slugs.push({
    slug: match[1],
    index: match.index
  });
}

console.log(`Found ${slugs.length} articles to extract.`);

const newBlogPostsMetadata = [];

for (let i = 0; i < slugs.length; i++) {
  const current = slugs[i];
  const next = slugs[i + 1];
  
  const blockStart = current.index;
  const blockEnd = next ? next.index : fileContent.indexOf('];', blockStart);
  
  const blockText = fileContent.substring(blockStart, blockEnd);
  
  // Extract fields using robust regex that handles escaped quotes
  const titleMatch = blockText.match(/title:\s*'((?:[^'\\]|\\.)*)'/);
  const excerptMatch = blockText.match(/excerpt:\s*'((?:[^'\\]|\\.)*)'/);
  const dateMatch = blockText.match(/date:\s*'((?:[^'\\]|\\.)*)'/);
  
  // Extract FAQs block
  const faqsStart = blockText.indexOf('faqs: [');
  let faqsText = '[]';
  if (faqsStart !== -1) {
    const faqsEnd = blockText.indexOf('],', faqsStart) + 1;
    faqsText = blockText.substring(faqsStart + 6, faqsEnd).trim();
  }
  
  // Extract Author block
  const authorStart = blockText.indexOf('author: {');
  let authorText = '';
  if (authorStart !== -1) {
    const authorEnd = blockText.indexOf('},', authorStart) + 1;
    authorText = blockText.substring(authorStart + 8, authorEnd).trim();
  }
  
  // Extract Content
  const contentStart = blockText.indexOf('content: (');
  if (contentStart === -1) {
    console.error(`Could not find content for slug: ${current.slug}`);
    continue;
  }
  
  // The content JSX starts after content: (
  // and ends at the corresponding closing )
  let depth = 1;
  let j = contentStart + 10;
  while (depth > 0 && j < blockText.length) {
    if (blockText[j] === '(') depth++;
    else if (blockText[j] === ')') depth--;
    j++;
  }
  
  const contentJSX = blockText.substring(contentStart + 10, j - 1).trim();
  
  // Write content file
  const componentContent = `import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    ${contentJSX}
  );
}
`;
  
  const targetFile = path.join(targetDir, `${current.slug}.tsx`);
  fs.writeFileSync(targetFile, componentContent, 'utf-8');
  
  // Add to metadata array
  const rawTitle = titleMatch ? titleMatch[1] : '';
  const rawExcerpt = excerptMatch ? excerptMatch[1] : '';
  
  newBlogPostsMetadata.push({
    slug: current.slug,
    title: rawTitle,
    excerpt: rawExcerpt,
    date: dateMatch ? dateMatch[1] : '',
    faqs: faqsText,
    author: authorText
  });
}

// Generate the new clean blog-data.tsx
let newBlogDataContent = `import React from 'react';

export type Author = {
  name: string;
  avatarUrl: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: Author;
  faqs?: {
    question: string;
    answer: string;
  }[];
};

export const blogPosts: BlogPost[] = [
`;

newBlogPostsMetadata.forEach(meta => {
  // Since we extracted strings that already had single quotes escaped,
  // we do not need to escape them twice.
  newBlogDataContent += `  {
    slug: '${meta.slug}',
    title: '${meta.title}',
    excerpt: '${meta.excerpt}',
    date: '${meta.date}',
    faqs: ${meta.faqs},
    author: ${meta.author}
  },
`;
});

newBlogDataContent += `];\n`;

fs.writeFileSync(blogDataPath, newBlogDataContent, 'utf-8');
console.log('Successfully completed splitting and updating blog-data.tsx!');
