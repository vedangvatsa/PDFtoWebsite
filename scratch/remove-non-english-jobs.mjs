import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY');
  process.exit(1);
}

// Check if a title is probably English
function isProbablyEnglish(title) {
  if (!title) return true;

  // 1. Block non-Latin scripts completely (Cyrillic, Chinese, Japanese, Korean, Arabic)
  const nonLatinRegex = /[\p{Script=Cyrillic}\p{Script=Han}\p{Script=Hangul}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Arabic}]/gu;
  if (nonLatinRegex.test(title)) {
    return false;
  }

  // 2. Common non-English job title role keywords
  const nonEnglishKeywords = [
    // French
    'développeur', 'développeuse', 'logiciel', 'logiciels', 'ingénieur', 'ingénieure', 'ingénieurs',
    'alternance', 'alternant', 'alternante', 'stagiaire', 'stagiaires', 'concepteur', 'conceptrice',
    'chef de', 'stage de', 'chargé de', 'chargée de', 'collaborateur', 'collaboratrice',
    // Spanish / Portuguese
    'desarrollador', 'desarrolladora', 'desarrolladores', 'desenvolvedor', 'desenvolvedora', 'desenvolvedores',
    'ingeniero', 'ingeniera', 'ingenieros', 'ingenieras', 'engenheiro', 'engenheira', 'engenheiros', 'engenheiras',
    'estagiário', 'estagiária', 'estagio', 'becario', 'becaria', 'prácticas', 'practicas',
    // German
    'entwickler', 'entwicklerin', 'entwicklers', 'softwareentwickler', 'softwareentwicklerin',
    'ingenieur', 'ingenieurin', 'praktikant', 'praktikantin', 'praktikum', 'werkstudent', 'werkstudentin',
    'leiter', 'leiterin', 'mitarbeiter',
    // Italian
    'sviluppatore', 'sviluppatrice', 'sviluppatori', 'ingegnere',
    // Dutch
    'ontwikkelaar', 'ontwikkelaars', 'stagiair', 'stagiairs', 'stagiaire'
  ];

  // Normalize by removing diacritics
  const normalizedTitle = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const normalizedNonEnglishKeywords = nonEnglishKeywords.map(w => 
    w.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  );

  for (const word of normalizedNonEnglishKeywords) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalizedTitle)) {
      return false;
    }
  }

  return true;
}

async function run() {
  console.log('Fetching all jobs from Supabase...');
  let offset = 0;
  const pageSize = 2000;
  const nonEnglishJobs = [];

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/jobs?select=id,title,company&offset=${offset}&limit=${pageSize}`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!res.ok) {
      console.error(`Failed to fetch jobs at offset ${offset}: ${res.statusText}`);
      break;
    }

    const jobs = await res.json();
    if (jobs.length === 0) break;

    for (const job of jobs) {
      if (!isProbablyEnglish(job.title)) {
        nonEnglishJobs.push(job);
      }
    }

    console.log(`Fetched ${offset + jobs.length} jobs so far... found ${nonEnglishJobs.length} non-English jobs`);
    offset += pageSize;
  }

  console.log(`\nFound a total of ${nonEnglishJobs.length} non-English jobs out of all listings.`);

  if (nonEnglishJobs.length === 0) {
    console.log('No non-English jobs to remove!');
    return;
  }

  console.log('Sample of non-English jobs to delete:');
  for (const job of nonEnglishJobs.slice(0, 20)) {
    console.log(`- [${job.company}] ${job.title} (ID: ${job.id})`);
  }

  console.log(`\nDeleting ${nonEnglishJobs.length} jobs in batches...`);
  
  const batchSize = 100;
  for (let i = 0; i < nonEnglishJobs.length; i += batchSize) {
    const batch = nonEnglishJobs.slice(i, i + batchSize);
    const ids = batch.map(j => j.id);
    
    // Construct in query: id=in.(id1,id2,id3)
    const deleteUrl = `${SUPABASE_URL}/rest/v1/jobs?id=in.(${ids.join(',')})`;
    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (res.ok) {
      console.log(`Deleted batch ${i / batchSize + 1} (${batch.length} jobs)`);
    } else {
      const err = await res.text();
      console.error(`Failed to delete batch starting at index ${i}:`, err);
    }
  }

  console.log('Done!');
}

run().catch(console.error);
