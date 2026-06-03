import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY');
  process.exit(1);
}

async function run() {
  console.log('Fetching all user profiles from Supabase Rest API...');
  const url = `${SUPABASE_URL}/rest/v1/profiles?select=id,profile_picture_url,experience,education,skills,custom_sections,links`;
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
  const totalUsers = profiles.length;

  const hasPhoto = profiles.filter(p => p.profile_picture_url && p.profile_picture_url.trim() !== '').length;
  const hasExperience = profiles.filter(p => Array.isArray(p.experience) && p.experience.length > 0).length;
  const hasEducation = profiles.filter(p => Array.isArray(p.education) && p.education.length > 0).length;
  const hasSkills = profiles.filter(p => Array.isArray(p.skills) && p.skills.length > 0).length;
  const hasCustomSections = profiles.filter(p => Array.isArray(p.custom_sections) && p.custom_sections.length > 0).length;
  const hasLinks = profiles.filter(p => Array.isArray(p.links) && p.links.length > 0).length;

  const pct = (val) => totalUsers > 0 ? ((val / totalUsers) * 100).toFixed(1) : '0.0';

  console.log('\n--- PROFILE COMPLETENESS STATISTICS ---');
  console.log(`Total Profiles:    ${totalUsers}`);
  console.log(`Skills:            ${hasSkills}/${totalUsers} (${pct(hasSkills)}%)`);
  console.log(`Experience:        ${hasExperience}/${totalUsers} (${pct(hasExperience)}%)`);
  console.log(`Education:         ${hasEducation}/${totalUsers} (${pct(hasEducation)}%)`);
  console.log(`Profile Photo:     ${hasPhoto}/${totalUsers} (${pct(hasPhoto)}%)`);
  console.log(`Custom Sections:   ${hasCustomSections}/${totalUsers} (${pct(hasCustomSections)}%)`);
  console.log(`Social Links:      ${hasLinks}/${totalUsers} (${pct(hasLinks)}%)`);
}

run().catch(console.error);
