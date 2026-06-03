import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environmental keys
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mkrwlyjjlngzozekkmec.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not defined.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function getProfileCompleteness() {
  console.log('Fetching profiles from Supabase...');
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, profile_picture_url, experience, education, skills, custom_sections, links');

  if (error) {
    console.error('Database Error:', error);
    return;
  }

  const totalUsers = profiles.length;
  console.log(`Total Profiles: ${totalUsers}`);

  const hasPhoto = profiles.filter(p => p.profile_picture_url && p.profile_picture_url.trim() !== '').length;
  const hasExperience = profiles.filter(p => Array.isArray(p.experience) && p.experience.length > 0).length;
  const hasEducation = profiles.filter(p => Array.isArray(p.education) && p.education.length > 0).length;
  const hasSkills = profiles.filter(p => Array.isArray(p.skills) && p.skills.length > 0).length;
  const hasCustomSections = profiles.filter(p => Array.isArray(p.custom_sections) && p.custom_sections.length > 0).length;
  const hasLinks = profiles.filter(p => Array.isArray(p.links) && p.links.length > 0).length;

  const pct = (val) => totalUsers > 0 ? ((val / totalUsers) * 100).toFixed(1) : '0.0';

  console.log('\n--- PROFILE COMPLETENESS STATISTICS ---');
  console.log(`Skills:            ${hasSkills}/${totalUsers} (${pct(hasSkills)}%)`);
  console.log(`Experience:        ${hasExperience}/${totalUsers} (${pct(hasExperience)}%)`);
  console.log(`Education:         ${hasEducation}/${totalUsers} (${pct(hasEducation)}%)`);
  console.log(`Profile Photo:     ${hasPhoto}/${totalUsers} (${pct(hasPhoto)}%)`);
  console.log(`Custom Sections:   ${hasCustomSections}/${totalUsers} (${pct(hasCustomSections)}%)`);
  console.log(`Social Links:      ${hasLinks}/${totalUsers} (${pct(hasLinks)}%)`);
}

getProfileCompleteness();
