const puppeteer = require('puppeteer');

(async () => {
  const queries = [
    'chiang mai temple',
    'bangalore city',
    'da nang dragon bridge',
    'koh phangan beach',
    'kuala lumpur petronas towers',
    'manila city skyline',
    'penang george town',
    'phnom penh cambodia',
    'siem reap angkor wat',
    'hanoi vietnam old quarter',
    'cebu philippines',
    'playa del carmen beach',
    'bali temple gate',
    'ho chi minh city skyline',
    'taipei 101',
    'bangkok wat arun',
    'zanzibar beach stone town',
    'delhi red fort'
  ];

  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set a realistic viewport
  await page.setViewport({ width: 1280, height: 800 });

  const results = {};

  for (const q of queries) {
    try {
      console.log(`Searching for "${q}"...`);
      await page.goto(`https://unsplash.com/s/photos/${encodeURIComponent(q)}`, { 
        waitUntil: 'networkidle2',
        timeout: 20000
      });

      // Wait 2 seconds just in case
      await new Promise(r => setTimeout(r, 2000));
      
      const photoUrls = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        // Find links that look like "/photos/..."
        return links
          .map(l => l.href)
          .filter(h => h.includes('/photos/') && !h.includes('/download') && !h.includes('/contrib') && !h.includes('/related'));
      });

      console.log(`Found ${photoUrls.length} links for "${q}"`);
      if (photoUrls.length > 0) {
        // Find the first one that has a clean alphanumeric suffix
        let chosen = null;
        for (const url of photoUrls) {
          const match = url.match(/\/photos\/([a-zA-Z0-9_-]+)$/);
          if (match && match[1] && match[1].length > 5) {
            chosen = match[1];
            break;
          }
        }
        console.log(`-> Chosen ID for "${q}": ${chosen}`);
        results[q] = chosen;
      } else {
        results[q] = null;
      }
    } catch (e) {
      console.error(`Failed for "${q}":`, e.message);
    }
  }

  await browser.close();
  console.log("\nRESOLVED PHOTO IDS:");
  console.log(JSON.stringify(results, null, 2));
})();
