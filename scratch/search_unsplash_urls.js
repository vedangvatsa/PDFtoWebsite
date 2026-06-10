const https = require('https');

function searchDDG(query) {
  return new Promise((resolve) => {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        // Look for unsplash image CDN links in the search results
        const regex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9_\-\?=&;%]+/g;
        const matches = [];
        let match;
        while ((match = regex.exec(html)) !== null) {
          matches.push(match[0]);
        }
        resolve(Array.from(new Set(matches)));
      });
    }).on('error', () => resolve([]));
  });
}

(async () => {
  const cities = [
    'Chiang Mai temple',
    'Bangalore Palace India',
    'Da Nang Dragon Bridge Vietnam',
    'Koh Phangan Thailand beach',
    'Kuala Lumpur Petronas Towers Malaysia',
    'Manila skyline Philippines',
    'Penang Street Art George Town Malaysia',
    'Phnom Penh Royal Palace Cambodia',
    'Siem Reap Angkor Wat Cambodia',
    'Hanoi Old Quarter Vietnam',
    'Cebu City skyline Philippines',
    'Playa del Carmen beach Mexico',
    'Bali temple gate Indonesia',
    'Ho Chi Minh City skyline Vietnam',
    'Taipei 101 Taiwan',
    'Bangkok Wat Arun Thailand',
    'Zanzibar Stone Town beach Tanzania',
    'Delhi Red Fort India'
  ];

  for (const city of cities) {
    const query = `site:unsplash.com ${city}`;
    const matches = await searchDDG(query);
    console.log(`City: ${city}`);
    console.log(`Found matches:`, matches.slice(0, 3));
    console.log("---");
  }
})();
