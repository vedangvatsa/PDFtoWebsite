const fs = require('fs');
const path = require('path');

const dataPath = '/Users/vedang/.gemini/antigravity/scratch/PDFtoWebsite/public/nomad-data-v2.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log("Lookup table sample (first 20 entries):", data.c.slice(0, 20));
console.log("Total entries in lookup table:", data.c.length);
