import fs from 'fs';

const blogDataPath = '/Users/vedang/PDFtoWebsite/src/lib/blog-data.tsx';
const blogMetaPath = '/Users/vedang/PDFtoWebsite/src/lib/blog-metadata.ts';

const dataContent = fs.readFileSync(blogDataPath, 'utf8');
const metaContent = fs.readFileSync(blogMetaPath, 'utf8');

// Simple regex parser to extract slugs
const getSlugs = (content) => {
  const slugs = [];
  const regex = /slug:\s*'([^']+)'/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    slugs.push(match[1]);
  }
  return slugs;
};

const dataSlugs = getSlugs(dataContent);
const metaSlugs = getSlugs(metaContent);

console.log(`blog-data.tsx slugs count: ${dataSlugs.length}`);
console.log(`blog-metadata.ts slugs count: ${metaSlugs.length}`);

const dataUnique = new Set(dataSlugs);
const metaUnique = new Set(metaSlugs);

const missingInMeta = dataSlugs.filter(s => !metaUnique.has(s));
const missingInData = metaSlugs.filter(s => !dataUnique.has(s));

console.log('Missing in blog-metadata.ts:', missingInMeta);
console.log('Missing in blog-data.tsx:', missingInData);

if (missingInMeta.length === 0 && missingInData.length === 0 && dataSlugs.length === metaSlugs.length) {
  console.log('SUCCESS: All slugs match 1-to-1 between blog-data.tsx and blog-metadata.ts!');
} else {
  console.log('FAILURE: Mismatch detected!');
}
