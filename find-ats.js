const fs = require('fs');

async function workerPool(tasks, maxConcurrent) {
  const results = [];
  const executing = [];
  for (const task of tasks) {
    const p = Promise.resolve().then(() => task());
    results.push(p);
    const e = p.then(() => executing.splice(executing.indexOf(e), 1));
    executing.push(e);
    if (executing.length >= maxConcurrent) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

async function checkPersonio(slug) {
  try {
    const res = await fetch(`https://${slug}.jobs.personio.de/xml`, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    return res.ok ? slug : null;
  } catch (e) { return null; }
}

async function checkBreezy(slug) {
  try {
    const res = await fetch(`https://${slug}.breezy.hr/json`, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    return res.ok ? slug : null;
  } catch (e) { return null; }
}

async function checkBambooHR(slug) {
  try {
    const res = await fetch(`https://${slug}.bamboohr.com/careers/list`, { 
      method: 'GET', 
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000) 
    });
    return res.status === 200 ? slug : null;
  } catch (e) { return null; }
}

async function checkWorkable(slug) {
  try {
    const res = await fetch(`https://apply.workable.com/api/v3/accounts/${slug}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '', location: [], department: [], worktype: [], remote: [] }),
      signal: AbortSignal.timeout(5000)
    });
    return res.ok ? slug : null;
  } catch (e) { return null; }
}

async function run() {
  console.log('Downloading layoffs.csv...');
  const res = await fetch('https://raw.githubusercontent.com/Layoffs-fyi/layoffs.fyi-dataset/main/layoffs.csv');
  const text = await res.text();
  
  const rawSlugs = new Set();
  const rows = text.split('\n');
  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i].split(',');
    if (cols[0]) {
      const company = cols[0].trim();
      const s = company.toLowerCase().replace(/[^a-z0-9]+/g, '');
      const s2 = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (s) rawSlugs.add(s);
      if (s2 && s2 !== s) rawSlugs.add(s2);
    }
  }

  // Also read jobs-sync.mjs to extract ANY company names we already know exist
  const code = fs.readFileSync('.github/scripts/jobs-sync.mjs', 'utf8');
  ['GREENHOUSE_SLUGS', 'LEVER_SLUGS', 'ASHBY_SLUGS'].forEach(varName => {
    const match = code.match(new RegExp('const ' + varName + ' = \\\s*\\\[([\\\s\\\S]*?)\\\];'));
    if (match) {
      match[1].split(',').forEach(slug => {
        const clean = slug.trim().replace(/['"]/g, '').replace(/\\/g, '').split('//')[0].trim();
        if (clean && !clean.includes('===')) {
          rawSlugs.add(clean);
          rawSlugs.add(clean.replace(/-/g, ''));
        }
      });
    }
  });

  const slugs = Array.from(rawSlugs).sort();
  console.log(`Testing ${slugs.length} slugs across 4 platforms...`);

  const pTasks = slugs.map(s => () => checkPersonio(s));
  const brTasks = slugs.map(s => () => checkBreezy(s));
  const bTasks = slugs.map(s => () => checkBambooHR(s));
  const wTasks = slugs.map(s => () => checkWorkable(s));

  console.log('Testing Personio...');
  const pRes = (await workerPool(pTasks, 50)).filter(Boolean);
  
  console.log('Testing Breezy...');
  const brRes = (await workerPool(brTasks, 50)).filter(Boolean);
  
  console.log('Testing BambooHR...');
  const bRes = (await workerPool(bTasks, 50)).filter(Boolean);
  
  console.log('Testing Workable...');
  const wRes = (await workerPool(wTasks, 50)).filter(Boolean);

  console.log(`\nFound valid ATS links:`);
  console.log(`Personio: ${pRes.length}`);
  console.log(`Breezy: ${brRes.length}`);
  console.log(`BambooHR: ${bRes.length}`);
  console.log(`Workable: ${wRes.length}`);

  // Inject back into jobs-sync.mjs
  let newCode = code;

  function replaceArray(varName, newSlugs) {
    const regex = new RegExp(`const ${varName} = \\s*\\[([\\s\\S]*?)\\];`);
    const existingMatch = newCode.match(regex);
    if (!existingMatch) return;
    
    // Merge existing and new
    const existing = existingMatch[1].split(',')
      .map(s => s.trim().replace(/['"]/g, '').split('//')[0].trim())
      .filter(s => s.length > 0 && !s.includes('==='));
      
    const finalSet = Array.from(new Set([...existing, ...newSlugs])).sort();
    
    let replacement = `const ${varName} = [\n`;
    for (let i = 0; i < finalSet.length; i += 10) {
      const chunk = finalSet.slice(i, i + 10).map(s => `'${s}'`).join(',');
      replacement += `  ${chunk}${i + 10 < finalSet.length ? ',' : ''}\n`;
    }
    replacement += '];';
    
    newCode = newCode.replace(regex, replacement);
  }

  replaceArray('PERSONIO_SLUGS', pRes);
  replaceArray('BREEZY_SLUGS', brRes);
  replaceArray('BAMBOOHR_SLUGS', bRes);
  
  // Wait, jobs-sync.mjs doesn't have WORKABLE_SLUGS array explicitly defined yet?
  // Let's check if WORKABLE_SLUGS exists.
  if (newCode.includes('const WORKABLE_SLUGS')) {
    replaceArray('WORKABLE_SLUGS', wRes);
  } else {
    // Inject WORKABLE_SLUGS array right after BREEZY_SLUGS
    const wArrayStr = `\n// ─── Workable company slugs ───\nconst WORKABLE_SLUGS = [\n  ${wRes.map(s => `'${s}'`).join(',')}\n];\n`;
    newCode = newCode.replace(/(const BREEZY_SLUGS = \[\s*[\s\S]*?\];)/, `$1\n${wArrayStr}`);
  }

  fs.writeFileSync('.github/scripts/jobs-sync.mjs', newCode);
  console.log('Successfully injected new companies into jobs-sync.mjs!');
}

run();
