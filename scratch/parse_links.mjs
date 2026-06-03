import fs from 'fs';

const html = fs.readFileSync('scratch/scraped_html.html', 'utf8');

// Find the table that contains "Yohannes" or "Jeremyyza"
// We can use a regex to find table rows or links
console.log('Searching for links in the HTML...');
const linkRegex = /href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
let match;
const links = [];
while ((match = linkRegex.exec(html)) !== null) {
  links.push({ url: match[1], text: match[2] });
}

console.log(`Found ${links.length} links in total.`);
console.log(JSON.stringify(links.slice(0, 100), null, 2));

// Let's also look for any table cells or URLs in the text
const urlRegex = /https?:\/\/[^\s"'>]+/g;
const urls = html.match(urlRegex) || [];
console.log(`Found ${urls.length} raw URLs:`);
console.log(Array.from(new Set(urls)));
