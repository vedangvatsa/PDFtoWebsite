import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Known ATS platforms that are overwhelmingly used by tech companies / startups
const TECH_ATS = [
  'ashbyhq', 
  'leverco', 
  'greenhouse', 
  'gem', 
  'jobvite',
  'rippling',
  'recruitee',
  'teamtailor'
];

async function exportTechCompanies() {
  const db = await open({
    filename: './scratch/OpenPostings/jobs.db',
    driver: sqlite3.Database
  });

  const placeholders = TECH_ATS.map(() => '?').join(',');
  const query = `
    SELECT company_name, url_string, ATS_name 
    FROM companies 
    WHERE ATS_name IN (${placeholders})
    ORDER BY ATS_name, company_name
  `;

  const companies = await db.all(query, TECH_ATS);
  
  console.log(`Found ${companies.length} tech companies.`);

  const headers = ['Company Name', 'Job Board URL', 'ATS Provider'];
  const lines = [headers.join(',')];

  for (const c of companies) {
    const name = `"${(c.company_name || '').replace(/"/g, '""')}"`;
    const url = `"${(c.url_string || '').replace(/"/g, '""')}"`;
    const ats = `"${(c.ATS_name || '').replace(/"/g, '""')}"`;
    lines.push(`${name},${url},${ats}`);
  }

  const outPath = join(process.cwd(), 'scripts', 'tech-companies-to-scrape.csv');
  writeFileSync(outPath, lines.join('\n'), 'utf-8');
  console.log(`Exported to ${outPath}`);
}

exportTechCompanies().catch(console.error);
