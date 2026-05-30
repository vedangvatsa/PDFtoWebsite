#!/usr/bin/env node
/**
 * Smart Skills Cleanup Script v2
 * 
 * Uses Gemini AI + work experience context to intelligently filter skills.
 * Fetches each profile's work experience descriptions to validate which
 * skills are real (mentioned in actual job roles) vs noise.
 */

const SUPABASE_URL = 'https://mkrwlyjjlngzozekkmec.supabase.co';
const SUPABASE_KEY = 'REDACTED';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

async function filterSkillsWithAI(username, skills, experience) {
  // Build work experience context
  const expContext = (experience || [])
    .map(e => `${e.title || ''} at ${e.company || ''}: ${(e.description || '').substring(0, 300)}`)
    .join('\n')
    .substring(0, 2000);

  const prompt = `You are a resume skills curator. Given a candidate's skills list and their work experience, return ONLY genuine professional skills.

WORK EXPERIENCE (for context on what this person actually does):
${expContext || 'No work experience provided.'}

CANDIDATE'S EXTRACTED SKILLS (${skills.length} items):
${JSON.stringify(skills)}

RULES:
1. Cross-reference skills against the work experience. Skills that align with actual job roles are HIGH PRIORITY to keep.
2. KEEP: Programming languages, frameworks, tools, platforms, cloud services, methodologies, certifications, domain expertise keywords that appear in or relate to their work.
3. REMOVE:
   - Project deliverables / outcomes (e.g., "rural road verification", "birth and death registration", "seamless transition")
   - Company/organization names (e.g., "Freescale Semiconductors", "PwC India's Blockchain Practice")
   - Job titles/roles (e.g., "Director", "Chief Architect", "Senior Product Manager")
   - Vague business jargon (e.g., "operational synergy", "continuous improvement", "best practices")
   - Long phrases that are really project descriptions, not skills
4. DEDUPLICATE: If "Tokenization" appears twice or "AI" and "Artificial Intelligence" both appear, keep only one.
5. Maximum 30 skills. Prioritize: hard/technical skills > domain expertise > methodologies > soft skills.
6. Each skill should be concise (1-4 words typically).

Return ONLY a raw JSON array of strings. No markdown, no explanation.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 2048, responseMimeType: 'application/json' }
      })
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  const cleaned = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
  
  if (!Array.isArray(cleaned)) throw new Error('AI returned non-array');
  return cleaned.slice(0, 30);
}

async function main() {
  if (!GEMINI_KEY) {
    console.error('Set GEMINI_API_KEY env var');
    process.exit(1);
  }

  // Fetch all profiles with skills AND experience for context
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?select=username,skills,experience&order=username`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Range: '0-999'
      }
    }
  );
  const allProfiles = await res.json();
  const bloated = allProfiles
    .filter(p => Array.isArray(p.skills) && p.skills.length > 30)
    .sort((a, b) => b.skills.length - a.skills.length);

  console.log(`Found ${bloated.length} profiles with >30 skills\n`);

  let fixed = 0;
  let failed = 0;

  for (const p of bloated) {
    try {
      process.stdout.write(`${p.username} (${p.skills.length} skills)... `);
      const filtered = await filterSkillsWithAI(p.username, p.skills, p.experience);
      
      const removed = p.skills.length - filtered.length;
      process.stdout.write(`→ ${filtered.length} kept (-${removed}) `);

      // Update Supabase
      const updateRes = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(p.username)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            Prefer: 'return=minimal'
          },
          body: JSON.stringify({ skills: filtered })
        }
      );

      if (updateRes.ok) {
        fixed++;
        console.log('✅');
      } else {
        console.log(`❌ ${updateRes.status}`);
        failed++;
      }

      // Rate limit: 0.3s between API calls
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.log(`❌ ${err.message}`);
      failed++;
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\n✅ Done! Fixed: ${fixed}, Failed: ${failed}, Total: ${bloated.length}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
