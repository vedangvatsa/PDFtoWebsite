const puppeteer = require('puppeteer');

const photoPages = {
  'da-nang': 'https://unsplash.com/photos/a-bridge-that-has-a-lit-up-dragon-on-it-11XzH4uOa7c',
  'manila': 'https://unsplash.com/photos/buildings-in-city-during-night-time-G4cK8qG-4-8', // wait, let's check a good Manila page
  'penang': 'https://unsplash.com/photos/a-tall-building-towering-over-a-city-at-night-a-tall-building-towering-over-a-city-at-night-Z406-v0V268', // wait, let's verify
};

async function getCDNUrl(url) {
  console.log(`Loading ${url}...`);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
  
  // Wait 1 second
  await new Promise(r => setTimeout(r, 1000));

  const cdnUrl = await page.evaluate(() => {
    // Find all images from images.unsplash.com
    const imgs = Array.from(document.querySelectorAll('img'));
    const urls = imgs
      .map(img => img.src)
      .filter(src => src.startsWith('https://images.unsplash.com/photo-'));
    return urls;
  });

  await browser.close();
  return cdnUrl;
}

(async () => {
  for (const [key, url] of Object.entries(photoPages)) {
    const urls = await getCDNUrl(url);
    console.log(`\nKey: ${key}`);
    console.log(`URLs:`, urls.slice(0, 3));
  }
})();
