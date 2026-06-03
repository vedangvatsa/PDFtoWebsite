import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── PHASE 1: Delete entire non-tech companies ───
const NON_TECH_COMPANIES = [
  'Westlibertyuniversity', 'Bentonvillear', 'Cityofhamilton',
  'Lmpgroup', 'Hightechhigh', 'oakland-feather-river-camp',
  'rebecca-school', 'the-learning-spectrum', 'Foho',
];

let totalDeleted = 0;

for (const company of NON_TECH_COMPANIES) {
  const { data, error } = await supabase
    .from('jobs')
    .delete()
    .ilike('company', company)
    .select('id');
  
  if (error) {
    console.error(`Error deleting ${company}:`, error.message);
  } else {
    const count = data?.length || 0;
    if (count > 0) {
      console.log(`Deleted ${count} jobs from: ${company}`);
      totalDeleted += count;
    }
  }
}

// ─── PHASE 2: Delete specific irrelevant titles from any company ───
const IRRELEVANT_TITLE_PATTERNS = [
  '%Bus Driver%',
  '%Lifeguard%',
  '%Crossing Guard%',
  '%Jobfestival%',
  '%Paraprofessional%',
  "%Head Coach Women's%",
  "%Head Coach Men's%",
  '%Lunch Aide%',
  '%Playground Monitor%',
  '%Custodial Worker%',
  '%Groundskeeper%',
  '%Seasonal Lifeguard%',
];

for (const pattern of IRRELEVANT_TITLE_PATTERNS) {
  const { data, error } = await supabase
    .from('jobs')
    .delete()
    .ilike('title', pattern)
    .select('id, title, company');
  
  if (error) {
    console.error(`Error deleting pattern "${pattern}":`, error.message);
  } else if (data && data.length > 0) {
    console.log(`Deleted ${data.length} jobs matching: ${pattern}`);
    data.forEach(j => console.log(`  → ${j.title} @ ${j.company}`));
    totalDeleted += data.length;
  }
}

console.log(`\n✅ Total deleted: ${totalDeleted} irrelevant jobs`);

// Verify new count
const { count } = await supabase.from('jobs').select('id', { count: 'exact', head: true });
console.log(`Remaining jobs in DB: ${count}`);
