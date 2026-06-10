const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/Users/vedang/.gemini/antigravity/brain/f840a154-203b-493d-aea1-eee4d00b80d9';
const SCREENSHOTS_DIR = path.join(ARTIFACT_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Clear old screenshots
fs.readdirSync(SCREENSHOTS_DIR).forEach(file => {
  if (file.endsWith('.png')) {
    fs.unlinkSync(path.join(SCREENSHOTS_DIR, file));
  }
});

const pagesToCheck = [
  { name: 'directory', url: 'http://localhost:3001/nomad' },
  { name: 'city_detail', url: 'http://localhost:3001/chiang-mai' },
  { name: 'visas', url: 'http://localhost:3001/visas' },
  { name: 'compare', url: 'http://localhost:3001/compare?a=chiang-mai&b=da-nang' },
  { name: 'cost_of_living', url: 'http://localhost:3001/cost-of-living' }
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 }
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const errors = [];

  for (const pageInfo of pagesToCheck) {
    console.log(`\nAuditing Page: ${pageInfo.name} (${pageInfo.url})`);
    
    for (const vp of viewports) {
      console.log(`  - Capturing viewport: ${vp.name} (${vp.width}x${vp.height})`);
      const page = await browser.newPage();
      
      // Capture logs
      page.on('pageerror', (err) => {
        errors.push({ page: pageInfo.name, type: 'PageError', message: err.message, viewport: vp.name });
      });
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push({ page: pageInfo.name, type: 'ConsoleError', message: msg.text(), viewport: vp.name });
        }
      });

      await page.setViewport({ width: vp.width, height: vp.height });
      
      try {
        await page.goto(pageInfo.url, { waitUntil: 'networkidle2', timeout: 15000 });
        // Give dynamic elements (like MapLibre map rendering) a bit extra time to settle
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const filename = `${pageInfo.name}_${vp.name}.png`;
        const filepath = path.join(SCREENSHOTS_DIR, filename);
        
        await page.screenshot({ path: filepath, fullPage: true });
        console.log(`    Saved: ${filename}`);
      } catch (err) {
        console.error(`    Failed to capture ${pageInfo.name} on ${vp.name}:`, err.message);
        errors.push({ page: pageInfo.name, type: 'CaptureError', message: err.message, viewport: vp.name });
      } finally {
        await page.close();
      }
    }
  }

  await browser.close();

  console.log("\n--- Audit Completed ---");
  if (errors.length > 0) {
    console.log(`Found ${errors.length} error(s)/warning(s) in console/page:`);
    console.log(JSON.stringify(errors, null, 2));
  } else {
    console.log("No console errors or page errors detected!");
  }
})();
