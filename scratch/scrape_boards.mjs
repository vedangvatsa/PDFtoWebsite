import puppeteer from 'puppeteer';
import fs from 'fs';

async function main() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();
  console.log('Navigating to https://veda.ng/job-boards ...');
  await page.goto('https://veda.ng/job-boards', {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });

  console.log('Waiting for content to load...');
  // Wait for 5 seconds to ensure any dynamic rendering is done
  await new Promise(r => setTimeout(r, 5000));

  // Extract text and HTML
  const bodyText = await page.evaluate(() => document.body.innerText);
  const bodyHtml = await page.evaluate(() => document.body.innerHTML);

  fs.writeFileSync('scratch/scraped_text.txt', bodyText);
  fs.writeFileSync('scratch/scraped_html.html', bodyHtml);

  console.log('Scraped successfully! Saved to scratch/scraped_text.txt');
  await browser.close();
}

main().catch(e => {
  console.error('Error scraping:', e);
  process.exit(1);
});
