const fs = require('fs');

async function fetchPhotoIds(query) {
  const url = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) {
      console.error(`Failed to fetch for ${query}: ${res.status}`);
      return [];
    }
    const html = await res.text();
    // Search for patterns like href="/photos/..." or src="...photo-..."
    // Specifically, photo IDs are often 11-12 alphanumeric characters, e.g. /photos/xxxxxxxxx
    const regex = /\/photos\/([a-zA-Z0-9_-]{10,15})/g;
    const matches = new Set();
    let match;
    while ((match = regex.exec(html)) !== null) {
      matches.add(match[1]);
    }
    return Array.from(matches);
  } catch (err) {
    console.error(`Error fetching for ${query}:`, err);
    return [];
  }
}

async function main() {
  console.log('Fetching Budapest photo IDs...');
  const budapest = await fetchPhotoIds('budapest');
  console.log('Budapest IDs:', budapest.slice(0, 10));

  console.log('\nFetching Johor Bahru photo IDs...');
  const johor = await fetchPhotoIds('johor-bahru');
  console.log('Johor Bahru IDs:', johor.slice(0, 10));
}

main();
