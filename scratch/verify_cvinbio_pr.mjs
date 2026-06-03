const banned = [
  "revolutionize", "revolutionary", "game-changer", "game changer",
  "unlock", "seamless", "cutting-edge", "cutting edge", "unprecedented",
  "supercharge", "amplify", "accelerate", "the future of", "elevate your",
  "lifeblood", "authentic", "the ultimate", "transform your", "limitless",
  "resume", "synergistic", "dynamic", "fast-paced"
];

const prs = [
  // PR 1: Tech Layoffs Report 2026
  `CVin.Bio Releases Comprehensive Analysis on Five Years of Global Technology Layoffs

SINGAPORE, May 25, 2026, professional presence platform CVin.Bio published its Tech Layoffs Report 2026 today. The report aggregates data from six distinct labor market sources to analyze the displacement of tech workers since early 2020. More than 750,000 technology professionals lost their positions across 2,500 companies during this five-year period.

The historical trend shows that 2023 was the single most severe year on record with 264,320 layoffs. The correction continued through 2024 and 2025 with 152,922 and 124,201 cuts respectively. The first five months of 2026 recorded an additional 113,000 displaced workers, which averages 837 jobs lost per day.

Workforce restructuring in 2025 shifted heavily toward automated systems. An estimated 70,000 layoffs during the year were directly attributed to the adoption of machine learning tools. Customer support teams saw the deepest cuts at 34 percent of all automation-driven displacements, followed closely by quality assurance engineering at 28 percent.

The transition to new employment now takes significantly longer. The average job search duration after a tech layoff has doubled since 2021 to 5.5 months. Approximately 42 percent of displaced professionals leave the traditional technology sector entirely to join industries such as finance, consulting, and healthcare.

CVin.Bio provides interactive web profile portals to help candidates establish clear search visibility. The platform hosts high-performance portfolio links that replace static CV files to capture recruiter attention. The complete research findings and industry breakdowns are accessible on the official CVin.Bio website.`,

  // PR 2: Remote Talent Report 2026
  `CVin.Bio Publishes Research on the Global Contraction of Remote Tech Work

SINGAPORE, May 25, 2026, portfolio platform CVin.Bio released its Remote Talent Report 2026 today. The study examines work arrangements, remote compensation premiums, and retention statistics using a database of 68,000 active job postings. The findings show that the office return has largely succeeded, with 85 percent of newly listed knowledge-worker positions requiring full on-site presence.

Fully remote openings contracted to 13 percent of the active market. True hybrid arrangements that are explicitly advertised represent just 2 percent of total listings. Despite the overall decline in remote volume, the remaining flexible positions are distributed evenly across departments including sales and marketing.

Competitive talent pressure has created a compensation premium for distributed employees. Fully remote positions command a median base salary of 152,000 dollars, compared to 142,000 dollars for on-site roles. This seven percent premium rises to over 12 percent for senior engineering professionals at growth-stage startups.

The debate regarding worker output is largely resolved. Randomized trials show zero productivity difference between hybrid and full in-office schedules over a two-year tracking period. However, voluntary attrition rates dropped by 33 percent when companies offered flexible work options.

Only 12 percent of executives with remote teams implemented a strict office mandate in 2025. Employers use flexible work to retain high-performance engineers without increasing base salary costs. The complete remote market report is available on the CVin.Bio web portal.`,

  // PR 3: Tech Talent Report 2026
  `CVin.Bio Identifies Regional Skill Profiles and Engineering Demand in Global Study

SINGAPORE, May 25, 2026, CVin.Bio released its Tech Talent Report 2026 today to analyze regional hiring patterns and technical skill requirements. The study tracks 68,000 active job listings from over 2,000 companies across 18 countries. The data shows that 35.8 percent of all open positions are for highly technical roles.

Software engineering represents the single largest category, accounting for 29.8 percent of all active listings. The demand for machine learning capabilities is growing rapidly, with AI skills specified in 21 percent of all open roles. Companies also prioritize platform and database infrastructure engineering to support heavy computational loads.

Geographical analysis reveals distinct hiring personalities across global tech hubs. The United States and India focus heavily on technical development, with engineering making up 35 percent of their listings. Japan stands out as a sales-first market where business development roles represent 38 percent of openings and engineering represents 12 percent.

Bilingual sales teams remain essential for foreign companies entering the Japanese market. In contrast, the United Kingdom maintains a balanced distribution across engineering, sales, and corporate leadership. Singapore shows strong fintech specialization, with 33 percent of all listings focused on engineering.

Candidates can improve their job search outcomes by replacing static document files with active web links. Interactive CV portals help engineers stand out during automated parser reviews. The full report with comprehensive regional statistics is hosted on CVin.Bio.`
];

let failed = false;

prs.forEach((pr, i) => {
  console.log(`Checking PR ${i + 1}...`);
  
  // Check colons
  if (pr.includes(':')) {
    console.error(`❌ PR ${i + 1} contains a colon!`);
    failed = true;
  }

  // Check emdashes or en-dashes
  if (pr.includes('—') || pr.includes('–')) {
    console.error(`❌ PR ${i + 1} contains an em-dash or en-dash!`);
    failed = true;
  }
  
  // Check banned phrases
  banned.forEach(word => {
    if (pr.toLowerCase().includes(word)) {
      console.error(`❌ PR ${i + 1} contains banned phrase: "${word}"`);
      failed = true;
    }
  });

  // Check paragraph length (max 3 sentences)
  const paragraphs = pr.split('\n\n');
  paragraphs.forEach((p, pi) => {
    // Split sentences safely while ignoring common abbreviations or decimals (like "CVin.Bio", "5.5", "29.8", etc.)
    // We clean the text temporarily by replacing known decimal dots and dots in names so we can split purely on end-of-sentence punctuation.
    const cleanParagraph = p.replace(/(\d+)\.(\d+)/g, '$1_$2').replace(/CVin\.Bio/gi, 'CVin_Bio');
    const sentences = cleanParagraph.trim()
      .split(/[.!?]\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
      
    if (sentences.length > 3) {
      console.error(`❌ PR ${i + 1} Paragraph ${pi + 1} has ${sentences.length} sentences (exceeds limit of 3)!`);
      sentences.forEach((s, idx) => console.log(`   [Sentence ${idx + 1}]: "${s}"`));
      failed = true;
    }
  });
});

if (!failed) {
  console.log('✅ All CVin.Bio press releases passed strict guidelines verification! Zero banned words, colons, dashes, or paragraph length issues.');
} else {
  process.exit(1);
}
