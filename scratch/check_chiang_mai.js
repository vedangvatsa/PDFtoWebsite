const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log("Launching browser to audit Chiang Mai detail page...");
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('http://localhost:3001/nomad/chiang-mai', { waitUntil: 'networkidle2' });
    
    // Give it a moment to render Map and Listings
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Evaluate stats text or badge counts
    const placeBadgeText = await page.evaluate(() => {
      const badges = Array.from(document.querySelectorAll('span, div, p'));
      const badge = badges.find(b => b.textContent.includes('places') && b.textContent.match(/^\d+\s+places$/));
      return badge ? badge.textContent : 'Not found';
    });
    console.log("Detected places badge text:", placeBadgeText);

    // Evaluate the list category button texts (e.g. "Coliving (9)")
    const categoryButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons
        .map(b => b.textContent.trim())
        .filter(t => t.includes('Coliving') || t.includes('Hostels') || t.includes('Coworking'));
    });
    console.log("Category filter buttons found:", categoryButtons);

    // Count list table rows
    const trCount = await page.evaluate(() => {
      return document.querySelectorAll('table tbody tr').length;
    });
    console.log("Number of places in the listing table:", trCount);

    await browser.close();
  } catch (err) {
    console.error("Audit failed:", err);
  }
})();
