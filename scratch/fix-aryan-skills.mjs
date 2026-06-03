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
  // Fetch initial profile
  // Note: we can't use the previous state directly because it was already updated with the wrong split.
  // We can hardcode the original input array from Aryan's profile since we have it in our logs!
  const originalSkills = [
    'Product Management:  Product Discovery, PRDs & User Stories, Feature Prioritisation (RICE/ICE), Roadmapping,\n' +
      'OKRs & KPIs (North Star, Input Metrics), A/B Testing, User Journey Mapping, Go-to-Market Strategy, Stakeholder\n' +
      'Management, Agile/Scrum, Sprint Planning, Customer Research, Wireframing',
    'AI & Automation:  AI Agent Design, Retrieval-Augmented Generation (RAG), Prompt Engineering, Vector Embeddings,\n' +
      'Semantic Search, Google Flow, Image AI Pipelines, Chunking Strategies, Model Context Protocol (MCP)',
    'Tools & Data:  Notion, Jira, Confluence, Figma (Flows & Wireframes), Google Sheets (Automation & Dashboards), SQL\n' +
      '(Basic), CMS Management'
  ];

  const newSkills = splitSkills(originalSkills);

  console.log('\nNew correctly split skills:', newSkills);

  // Fetch Aryan's ID to be safe
  const fetchUrl = `${SUPABASE_URL}/rest/v1/profiles?username=eq.aryan&select=id`;
  const res = await fetch(fetchUrl, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!res.ok) {
    console.error(`Failed to fetch profile: ${res.statusText}`);
    return;
  }

  const profiles = await res.json();
  if (profiles.length === 0) {
    console.error('Profile not found with username "aryan"');
    return;
  }

  const profile = profiles[0];

  // Update in database
  const updateUrl = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${profile.id}`;
  const updateRes = await fetch(updateUrl, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ skills: newSkills })
  });

  if (updateRes.ok) {
    const updated = await updateRes.json();
    console.log('\nSuccessfully updated Aryan\'s skills in database:', updated[0].skills);
  } else {
    const err = await updateRes.text();
    console.error('Failed to update skills:', err);
  }
}

run().catch(console.error);
