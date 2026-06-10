const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    console.log("Loading Unsplash search...");
    await page.goto('https://unsplash.com/s/photos/chiang-mai', { waitUntil: 'networkidle2' });
    const title = await page.title();
    console.log("Page title:", title);
    const body = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log("Page body excerpt:", body);
    
    // Take a screenshot
    await page.screenshot({ path: '/Users/vedang/.gemini/antigravity/scratch/PDFtoWebsite/scratch/unsplash_diag.png' });
    console.log("Screenshot saved to scratch/unsplash_diag.png");
  } catch (err) {
    console.error("Failed:", err);
  } finally {
    await browser.close();
  }
})();
