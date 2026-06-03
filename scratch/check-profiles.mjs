import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY');
  process.exit(1);
}

// Splits by comma, but ignores commas inside parentheses or brackets
function splitByCommaOutsideParens(str) {
  const result = [];
  let current = '';
  let parenDepth = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '(' || char === '[' || char === '{') {
      parenDepth++;
      current += char;
    } else if (char === ')' || char === ']' || char === '}') {
      parenDepth = Math.max(0, parenDepth - 1);
      current += char;
    } else if (char === ',' && parenDepth === 0) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current) {
    result.push(current.trim());
  }
  return result.map(s => s.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
}

// Function to split skill line into individual skills
function splitSkills(skillsArray) {
  const result = [];

  for (const line of skillsArray) {
    if (!line) continue;
    
    // Check if line contains a category prefix (e.g. "Category: Skill1, Skill2")
    const match = line.match(/^([^:]+):(.+)$/s);
    if (match) {
      const category = match[1].trim();
      const rest = match[2].trim();
      
      if (category) {
        result.push(category);
      }
      
      const parts = splitByCommaOutsideParens(rest);
      for (const part of parts) {
        result.push(part);
      }
    } else {
      // Direct split if no category prefix
      const parts = splitByCommaOutsideParens(line);
      for (const part of parts) {
        result.push(part);
      }
    }
  }

  // Deduplicate and filter empty
  return [...new Set(result)].filter(Boolean);
}

async function run() {
  console.log('Fetching all user profiles from Supabase...');
  const url = `${SUPABASE_URL}/rest/v1/profiles?select=id,full_name,username,skills`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!res.ok) {
    console.error(`Failed to fetch profiles: ${res.statusText}`);
    return;
  }

  const profiles = await res.json();
  console.log(`Successfully fetched ${profiles.length} profiles.`);

  let problematicCount = 0;
  const profilesToUpdate = [];

  for (const p of profiles) {
    const skills = p.skills || [];
    if (skills.length === 0) continue;

    // Check if we need to split any skill
    const newSkills = splitSkills(skills);
    
    // Compare string arrays
    const isSame = skills.length === newSkills.length && skills.every((val, i) => val === newSkills[i]);

    if (!isSame) {
      problematicCount++;
      console.log(`\n----------------------------------------`);
      console.log(`Problematic profile found:`);
      console.log(`ID: ${p.id}`);
      console.log(`Name: ${p.full_name || 'N/A'}`);
      console.log(`Username: ${p.username || 'N/A'}`);
      console.log(`Current Skills (${skills.length}):`, skills);
      console.log(`Proposed Split Skills (${newSkills.length}):`, newSkills);
      
      profilesToUpdate.push({
        id: p.id,
        username: p.username,
        full_name: p.full_name,
        skills: newSkills
      });
    }
  }

  console.log(`\n========================================`);
  console.log(`Analysis complete.`);
  console.log(`Total profiles checked: ${profiles.length}`);
  console.log(`Problematic profiles: ${problematicCount}`);

  if (profilesToUpdate.length > 0) {
    console.log(`\nTo auto-update these ${profilesToUpdate.length} profiles, run the fix script.`);
  }
}

run().catch(console.error);
