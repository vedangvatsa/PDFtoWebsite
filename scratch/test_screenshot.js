const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log("Browser launched successfully!");
    const page = await browser.newPage();
    await page.goto('http://localhost:3001/nomad', { waitUntil: 'networkidle2' });
    console.log("Page title:", await page.title());
    await browser.close();
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
})();
