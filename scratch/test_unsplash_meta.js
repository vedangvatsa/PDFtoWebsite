const https = require('https');

const photoIds = {
  'da-nang': '11XzH4uOa7c', // Dragon Bridge
  'manila': 'G4cK8qG-4-8', // lighted bridge / skyline? wait, let's verify
  'penang': 'Z406-v0V268',
};

function getCdnFromMeta(photoId) {
  return new Promise((resolve) => {
    const url = `https://unsplash.com/photos/${photoId}`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        // Find og:image content
        const match = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) || 
                      html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i);
        if (match && match[1]) {
          resolve(match[1]);
        } else {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
  for (const [key, id] of Object.entries(photoIds)) {
    const cdnUrl = await getCdnFromMeta(id);
    console.log(`${key} (${id}): ${cdnUrl}`);
  }
})();
