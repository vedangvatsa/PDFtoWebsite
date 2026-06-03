import fs from 'fs';
import path from 'path';
import https from 'https';

const FEATURED_JSON_PATH = path.resolve('src/lib/featured-backlinks.json');
const SITE_URL = 'https://cvin.bio';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

const INDEXNOW_KEY = '6db32ca940dd46cab89375c221953bd6';
const SITE_HOST = 'cvin.bio';

/**
 * Submits cvin.bio URLs to IndexNow to trigger instant indexing and crawling.
 * Crawlers will visit cvin.bio, find the outgoing links to our profiles, and index them.
 */
async function pingSearchEngines() {
  console.log(`\n🚀 Triggering IndexNow crawling request for search engines...`);

  const urls = [
    `https://${SITE_HOST}/`,
    `https://${SITE_HOST}/blog`,
    `https://${SITE_HOST}/ai-discovery`
  ];

  const payload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
    urlList: urls
  };

  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log(`✅ IndexNow successfully requested crawl for ${urls.length} URLs (HTTP ${res.status})`);
    } else {
      console.error(`❌ IndexNow submission failed: HTTP ${res.status}`);
    }
  } catch (err) {
    console.error(`❌ IndexNow connection error: ${err.message}`);
  }
}

/**
 * Registers a new active backlink in our directory logs.
 * @param {string} name 
 * @param {string} url 
 */
function registerBacklink(name, url) {
  if (!name || !url) {
    console.error('❌ Error: Please provide both directory name and backlink URL.');
    process.exit(1);
  }

  let list = [];
  if (fs.existsSync(FEATURED_JSON_PATH)) {
    try {
      list = JSON.parse(fs.readFileSync(FEATURED_JSON_PATH, 'utf-8'));
    } catch (e) {
      console.warn('⚠️ Could not parse existing featured list. Creating new list.');
    }
  }

  // Check if link already exists
  if (list.some(item => item.url === url)) {
    console.log(`ℹ️ Backlink for ${name} (${url}) is already registered.`);
    pingSearchEngines();
    return;
  }

  list.push({
    name,
    url,
    dateAdded: new Date().toISOString().split('T')[0]
  });

  // Ensure directories exist
  const dir = path.dirname(FEATURED_JSON_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(FEATURED_JSON_PATH, JSON.stringify(list, null, 2), 'utf-8');
  console.log(`✅ Successfully registered new live backlink:`);
  console.log(`   - Platform: ${name}`);
  console.log(`   - Live URL: ${url}`);

  pingSearchEngines();
}

// Run CLI if arguments are passed
const args = process.argv.slice(2);
if (args.length >= 2) {
  const [name, url] = args;
  registerBacklink(name, url);
} else {
  console.log('ℹ️ Usage: node scripts/seo-ping-directory.mjs <directory_name> <backlink_url>');
  console.log('Running fallback sitemap ping...');
  pingSearchEngines();
}
