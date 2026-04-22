import puppeteer from 'puppeteer';
import * as fs from 'fs';

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
    * { box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; padding: 0; color: #18181b; background: white; line-height: 1.5; margin: 0; }
    h1 { font-weight: 800; font-size: 26px; color: #09090b; letter-spacing: -0.02em; margin-bottom: 5px; margin-top: 0; }
    .subtitle { color: #52525b; font-size: 13px; margin-bottom: 20px; border-bottom: 1px solid #e4e4e7; padding-bottom: 12px;}
    .section-title { font-weight: 800; font-size: 14px; color: #18181b; margin-top: 18px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; border-left: 3px solid #18181b; padding-left: 8px;}
    p { font-size: 13px; color: #3f3f46; margin-top: 0; margin-bottom: 10px; }
    ul { padding-left: 20px; margin-top: 5px; margin-bottom: 10px; }
    li { font-size: 13px; color: #3f3f46; margin-bottom: 4px; }
    strong { color: #09090b; font-weight: 600; }
    .footer { margin-top: 25px; font-size: 12px; font-style: italic; color: #71717a; text-align: center; border-top: 1px solid #e4e4e7; padding-top: 15px;}
    .highlight { background-color: #f4f4f5; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #09090b;}
  </style>
</head>
<body>
  <h1>CVin.Bio: Talent Infrastructure for the Agentic Economy</h1>
  <div class="subtitle">
    <strong>Website:</strong> cvin.bio | <strong>Founder:</strong> Vedang Vatsa (FRSA, ex-KPMG)<br>
    <strong>Stage:</strong> Pre Seed | <strong>Status:</strong> Live (17,000+ roles indexed, 170+ companies)
  </div>

  <div class="section-title">The Problem</div>
  <ul>
    <li><strong>The AI Shift:</strong> Global recruitment is rapidly moving toward autonomous AI screening.</li>
    <li><strong>The Data Conflict:</strong> 99% of professional identities are trapped in visually complex PDF files.</li>
    <li><strong>The Core Issue:</strong> AI agents strictly require structured JSON, APIs, and semantic data; they do not accurately read PDFs.</li>
  </ul>

  <div class="section-title">The Solution</div>
  <ul>
    <li><strong>Live Web Profiles:</strong> We transform static CVs into live URLs (<span class="highlight">cvin.bio/name</span>) generating <span class="highlight">schema.org</span> markup.</li>
    <li><strong>Native Integration:</strong> Candidates are directly exposed via our Model Context Protocol (MCP) server & <span class="highlight">llms.txt</span>.</li>
    <li><strong>Autonomous Discovery:</strong> Authorized AI agents can instantly query our talent database utilizing plain English.</li>
  </ul>

  <div class="section-title">Traction</div>
  <ul>
    <li><strong>Data Scale:</strong> 17,000+ active, verified jobs indexed from 170+ top tech companies (Anthropic, Stripe, Binance).</li>
    <li><strong>Validation:</strong> 100+ direct hits from major AI crawlers mapping our endpoints within our launch week.</li>
    <li><strong>Acquisition:</strong> Automated X pipeline and 3 proprietary industry reports live for lead generation.</li>
  </ul>

  <div class="section-title">Business Model</div>
  <ul>
    <li><strong>Consumer Subscriptions:</strong> Premium tools for candidates including custom domains and analytics.</li>
    <li><strong>API Usage:</strong> Target micropayments driven by agentic searches across our verified talent database.</li>
    <li><strong>B2B Monetization:</strong> Highly featured promotion for priority roles and direct placement success fees.</li>
  </ul>

  <div class="section-title">The Founder</div>
  <ul>
    <li><strong>Vedang Vatsa (FRSA)</strong> — IIT Kanpur alumnus and former strategy consultant at KPMG.</li>
    <li><strong>Hashtag Web3 Founder:</strong> Scaled network to 120,000+ members and 55M views. Backed by Microsoft for Startups.</li>
    <li><strong>Domain Authority:</strong> Young Researcher Awardee with 22 published papers on tech economics and AI policy.</li>
  </ul>

  <div class="footer">CVin.Bio is raising a Pre Seed round to scale candidate acquisition and finalize enterprise API partnerships.</div>
</body>
</html>
`;

async function generatePDF() {
  fs.writeFileSync('one-pager-raw.html', htmlContent);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const url = 'file://' + process.cwd() + '/one-pager-raw.html';
  await page.goto(url, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: '/Users/vedang/Desktop/CVin-Bio-One-Pager.pdf',
    format: 'Letter',
    printBackground: true,
    margin: { top: '30px', right: '40px', bottom: '30px', left: '40px' }
  });

  await browser.close();
  fs.unlinkSync('one-pager-raw.html');
  console.log("PDF generated at: /Users/vedang/Desktop/CVin-Bio-One-Pager.pdf");
}

generatePDF();
