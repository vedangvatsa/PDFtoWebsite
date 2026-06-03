{/* ============================================================
   BLOG SVG VISUALS — BATCH 4 (Articles 19–24)
   ============================================================ */}

{/* ============================================================
   19. generic-skill-bars
   Insert after: 'The Trap of Stated Weakness' section
   ============================================================ */}
{/* Visual: Skill bars (silly) vs contextual proof (effective) */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 680 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Divider */}
    <line x1="340" y1="10" x2="340" y2="270" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

    {/* Left Column Header */}
    <text x="170" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-400">What You Have</text>

    {/* Skill Bar 1: Python 80% */}
    <text x="30" y="68" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Python</text>
    <rect x="90" y="56" width="200" height="16" rx="3" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="90" y="56" width="160" height="16" rx="3" className="fill-zinc-400 dark:fill-zinc-500" />
    <text x="300" y="68" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">80%</text>

    {/* Skill Bar 2: AWS 60% */}
    <text x="30" y="108" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">AWS</text>
    <rect x="90" y="96" width="200" height="16" rx="3" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="90" y="96" width="120" height="16" rx="3" className="fill-zinc-400 dark:fill-zinc-500" />
    <text x="300" y="108" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">60%</text>

    {/* Skill Bar 3: Docker 40% */}
    <text x="30" y="148" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Docker</text>
    <rect x="90" y="136" width="200" height="16" rx="3" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="90" y="136" width="80" height="16" rx="3" className="fill-zinc-400 dark:fill-zinc-500" />
    <text x="300" y="148" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">40%</text>

    {/* Silly label */}
    <text x="170" y="185" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500" fontStyle="italic">80% of what? Says who?</text>

    {/* Right Column Header */}
    <text x="510" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-500">What Works</text>

    {/* Proof 1 */}
    <text x="360" y="64" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Python</text>
    <text x="360" y="80" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Built concurrent parser processing</text>
    <text x="360" y="93" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">2M records/day</text>

    {/* Proof 2 */}
    <text x="360" y="124" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">AWS</text>
    <text x="360" y="140" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Migrated monolith to Lambda,</text>
    <text x="360" y="153" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">cut hosting costs 50%</text>

    {/* Proof 3 */}
    <text x="360" y="184" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Docker</text>
    <text x="360" y="200" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Containerized 12 microservices</text>
    <text x="360" y="213" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">for CI/CD pipeline</text>

    {/* Bottom labels */}
    <rect x="100" y="240" width="140" height="26" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
    <text x="170" y="257" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-red-400">Meaningless numbers</text>

    <rect x="440" y="240" width="140" height="26" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1" />
    <text x="510" y="257" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-500">Verifiable proof</text>
  </svg>
</div>


{/* ============================================================
   20. beat-smart-ai-bots
   Insert after: 'The Demand for Contextual Validation' section
   ============================================================ */}
{/* Visual: Old keyword-counting ATS vs new semantic-parsing ATS */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 680 290" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Divider */}
    <line x1="340" y1="10" x2="340" y2="280" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

    {/* Left: Old ATS */}
    <text x="170" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Old ATS</text>
    <text x="170" y="44" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Keyword Counter</text>

    {/* Keyword box */}
    <rect x="30" y="60" width="280" height="130" rx="6" className="fill-zinc-50 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

    {/* Row 1 */}
    <text x="50" y="90" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">React</text>
    <text x="140" y="90" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">5 mentions</text>
    <text x="260" y="90" fontSize="14" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>

    {/* Row 2 */}
    <text x="50" y="122" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Python</text>
    <text x="140" y="122" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">3 mentions</text>
    <text x="260" y="122" fontSize="14" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>

    {/* Row 3 */}
    <text x="50" y="154" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Docker</text>
    <text x="140" y="154" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">0 mentions</text>
    <text x="260" y="154" fontSize="14" fontFamily="system-ui, sans-serif" className="fill-red-400">✗</text>

    {/* Separator lines */}
    <line x1="50" y1="100" x2="290" y2="100" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.5" />
    <line x1="50" y1="132" x2="290" y2="132" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.5" />

    {/* Right: New ATS */}
    <text x="510" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">New ATS</text>
    <text x="510" y="44" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Semantic Parser</text>

    {/* Semantic box */}
    <rect x="360" y="60" width="300" height="130" rx="6" className="fill-zinc-50 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

    {/* Semantic Row 1 */}
    <text x="380" y="85" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">React</text>
    <text x="380" y="100" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Used to build payment dashboard</text>
    <rect x="380" y="106" width="70" height="18" rx="4" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.5" />
    <text x="387" y="119" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓ Verified</text>

    <line x1="380" y1="130" x2="640" y2="130" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.5" />

    {/* Semantic Row 2 */}
    <text x="380" y="148" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Python</text>
    <text x="380" y="163" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Listed in skills, no project context</text>
    <rect x="380" y="169" width="70" height="18" rx="4" className="fill-amber-50 dark:fill-amber-900/20 stroke-amber-300 dark:stroke-amber-700" strokeWidth="0.5" />
    <text x="387" y="182" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-amber-500">⚠ Flagged</text>

    {/* Bottom insight */}
    <rect x="160" y="220" width="360" height="50" rx="6" className="fill-zinc-50 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
    <text x="340" y="243" textAnchor="middle" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">New systems read meaning, not just count words.</text>
    <text x="340" y="259" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Every keyword needs a story behind it.</text>
  </svg>
</div>


{/* ============================================================
   21. where-to-put-ai-skills
   Insert after: 'Bury the Keywords in the Work' section
   ============================================================ */}
{/* Visual: Wrong (standalone AI section) vs Right (woven into work history) */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 680 310" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Divider */}
    <line x1="340" y1="10" x2="340" y2="300" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

    {/* LEFT: Wrong */}
    <text x="160" y="26" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-400">✗ Wrong</text>

    {/* Resume mockup - left */}
    <rect x="40" y="42" width="240" height="240" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

    {/* Name placeholder */}
    <rect x="60" y="54" width="100" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="60" y="66" width="140" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

    {/* AI Skills section - highlighted wrong */}
    <rect x="54" y="84" width="212" height="80" rx="4" className="fill-red-50 dark:fill-red-900/15 stroke-red-300 dark:stroke-red-700" strokeWidth="1" />
    <text x="64" y="100" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-400">AI Skills</text>
    <text x="64" y="116" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">• Prompt Engineering</text>
    <text x="64" y="130" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">• ChatGPT</text>
    <text x="64" y="144" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">• Midjourney</text>
    <text x="64" y="158" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">• AI Automation</text>

    {/* Work History - small */}
    <text x="64" y="182" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Work History</text>
    <rect x="64" y="190" width="170" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="64" y="198" width="150" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="64" y="206" width="180" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="64" y="214" width="120" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />

    {/* Standalone label */}
    <text x="160" y="260" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500" fontStyle="italic">Standalone section = no context</text>

    {/* RIGHT: Right */}
    <text x="510" y="26" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓ Right</text>

    {/* Resume mockup - right */}
    <rect x="390" y="42" width="240" height="240" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

    {/* Name placeholder */}
    <rect x="410" y="54" width="100" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="410" y="66" width="140" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

    {/* Work History - with AI woven in */}
    <text x="410" y="90" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Work History</text>

    <rect x="410" y="98" width="180" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="404" y="106" width="212" height="22" rx="3" className="fill-emerald-50 dark:fill-emerald-900/15 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.5" />
    <text x="410" y="121" fontSize="8" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Used ChatGPT to automate QA → 40% faster</text>

    <rect x="410" y="136" width="160" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="404" y="144" width="212" height="22" rx="3" className="fill-emerald-50 dark:fill-emerald-900/15 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.5" />
    <text x="410" y="159" fontSize="8" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Prompt-engineered content pipeline, 3x output</text>

    <rect x="410" y="174" width="190" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="404" y="182" width="212" height="22" rx="3" className="fill-emerald-50 dark:fill-emerald-900/15 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.5" />
    <text x="410" y="197" fontSize="8" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Midjourney for brand assets, saved $12K agency</text>

    <rect x="410" y="212" width="170" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="410" y="220" width="140" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />

    {/* Woven label */}
    <text x="510" y="260" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500" fontStyle="italic">AI skills woven into real results</text>
  </svg>
</div>


{/* ============================================================
   22. show-your-code
   Insert after: the opening paragraphs
   ============================================================ */}
{/* Visual: Three ascending trust steps — Listed Skill → GitHub Repo → Live URL */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 680 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Baseline */}
    <line x1="60" y1="230" x2="620" y2="230" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

    {/* Arrow along bottom */}
    <line x1="80" y1="260" x2="580" y2="260" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="580,255 595,260 580,265" className="fill-zinc-400 dark:fill-zinc-500" />
    <text x="340" y="276" textAnchor="middle" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Recruiter Trust →</text>

    {/* Step 1: Listed Skill — short block */}
    <rect x="80" y="170" width="150" height="60" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
    <text x="155" y="196" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Listed Skill</text>
    <text x="155" y="212" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">"I know React"</text>
    {/* Trust label */}
    <rect x="110" y="148" width="90" height="18" rx="4" className="fill-zinc-200 dark:fill-zinc-700" />
    <text x="155" y="161" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Low trust</text>

    {/* Step 2: GitHub Repo — medium block */}
    <rect x="265" y="120" width="150" height="110" rx="6" className="fill-sky-50 dark:fill-sky-900/20 stroke-sky-300 dark:stroke-sky-700" strokeWidth="1" />
    <text x="340" y="160" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">GitHub Repo</text>
    <text x="340" y="178" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Code reviewable</text>
    <text x="340" y="193" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">by anyone</text>
    {/* Trust label */}
    <rect x="290" y="98" width="100" height="18" rx="4" className="fill-sky-100 dark:fill-sky-900/30" />
    <text x="340" y="111" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-sky-600 dark:fill-sky-400">Medium trust</text>

    {/* Step 3: Live URL — tall block */}
    <rect x="450" y="60" width="150" height="170" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
    <text x="525" y="110" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Live Deployed URL</text>
    <text x="525" y="128" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Working app anyone</text>
    <text x="525" y="143" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">can try right now</text>
    {/* Trust label */}
    <rect x="480" y="38" width="90" height="18" rx="4" className="fill-emerald-100 dark:fill-emerald-900/30" />
    <text x="525" y="51" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">High trust</text>

    {/* Step connectors */}
    <line x1="230" y1="200" x2="265" y2="175" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" strokeDasharray="4 3" />
    <line x1="415" y1="175" x2="450" y2="145" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" strokeDasharray="4 3" />
  </svg>
</div>


{/* ============================================================
   23. college-degrees-matter-less
   Insert after: 'Flipping the Traditional Hierarchy' section
   ============================================================ */}
{/* Visual: Old resume layout (education top) vs new layout (projects top) */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 680 300" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* LEFT: Old Layout */}
    <text x="140" y="24" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Old Layout</text>

    <rect x="30" y="38" width="220" height="240" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

    {/* Education block - BIG */}
    <rect x="44" y="50" width="192" height="100" rx="4" className="fill-amber-50 dark:fill-amber-900/15 stroke-amber-300 dark:stroke-amber-700" strokeWidth="1" />
    <text x="140" y="72" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Education</text>
    <text x="140" y="90" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">B.S. Computer Science</text>
    <text x="140" y="104" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">University of Example</text>
    <text x="140" y="118" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">GPA 3.8, Dean's List...</text>
    <text x="140" y="136" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Relevant Coursework...</text>

    {/* Projects block - small */}
    <rect x="44" y="162" width="192" height="50" rx="4" className="fill-zinc-50 dark:fill-zinc-800/50 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
    <text x="140" y="182" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Projects</text>
    <rect x="64" y="192" width="150" height="3" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="64" y="199" width="120" height="3" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />

    {/* Work */}
    <rect x="44" y="222" width="192" height="44" rx="4" className="fill-zinc-50 dark:fill-zinc-800/50 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
    <text x="140" y="240" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Experience</text>
    <rect x="64" y="248" width="130" height="3" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="64" y="255" width="150" height="3" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />

    {/* Arrow between */}
    <line x1="275" y1="158" x2="390" y2="158" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="390,153 405,158 390,163" className="fill-zinc-400 dark:fill-zinc-500" />
    <text x="340" y="148" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Flip it</text>

    {/* RIGHT: New Layout */}
    <text x="530" y="24" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">New Layout</text>

    <rect x="420" y="38" width="220" height="240" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

    {/* Projects block - BIG */}
    <rect x="434" y="50" width="192" height="120" rx="4" className="fill-emerald-50 dark:fill-emerald-900/15 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
    <text x="530" y="72" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Projects & Experience</text>
    <text x="530" y="90" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Built payment dashboard — React</text>
    <text x="530" y="104" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Open-source CLI tool — 200 stars</text>
    <text x="530" y="118" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Deployed ML model — 95% accuracy</text>
    <text x="530" y="132" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Freelance app — 1K active users</text>
    <text x="530" y="152" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">...</text>

    {/* Education block - small footnote */}
    <rect x="434" y="230" width="192" height="38" rx="4" className="fill-zinc-50 dark:fill-zinc-800/50 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
    <text x="530" y="248" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Education — B.S. CS, University</text>
    <text x="530" y="260" textAnchor="middle" fontSize="8" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">(footnote, not headline)</text>

    {/* Skills row */}
    <rect x="434" y="182" width="192" height="38" rx="4" className="fill-zinc-50 dark:fill-zinc-800/50 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
    <text x="530" y="200" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Skills & Tools</text>
    <rect x="454" y="208" width="150" height="3" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
  </svg>
</div>


{/* ============================================================
   24. two-page-resume-myth
   Insert after: 'The Infinite Digital Scroll' section
   ============================================================ */}
{/* Visual: Cramped 1-page layout vs spacious comfortable layout */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 680 320" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Divider */}
    <line x1="340" y1="10" x2="340" y2="310" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

    {/* LEFT: Cramped */}
    <text x="160" y="24" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-400">Cramped 1 Page</text>

    <rect x="40" y="38" width="220" height="240" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

    {/* Dense text lines - very tight spacing */}
    {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26].map((i) => (
      <rect
        key={`dense-${i}`}
        x="48"
        y={44 + i * 8.5}
        width={160 + (i % 3) * 15 - (i % 5) * 8}
        height="3"
        rx="1"
        className="fill-zinc-400 dark:fill-zinc-500"
      />
    ))}

    {/* Margin indicators */}
    <line x1="44" y1="38" x2="44" y2="278" className="stroke-red-300 dark:stroke-red-600" strokeWidth="0.5" strokeDasharray="2 2" />
    <line x1="256" y1="38" x2="256" y2="278" className="stroke-red-300 dark:stroke-red-600" strokeWidth="0.5" strokeDasharray="2 2" />

    {/* Label */}
    <rect x="60" y="286" width="180" height="22" rx="4" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="0.5" />
    <text x="150" y="301" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-red-400">8pt font · 0.3in margins · painful</text>

    {/* RIGHT: Spacious */}
    <text x="510" y="24" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-500">Spacious Layout</text>

    <rect x="410" y="38" width="230" height="240" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

    {/* Section 1 header */}
    <rect x="436" y="52" width="80" height="5" rx="1" className="fill-zinc-400 dark:fill-zinc-500" />
    {/* Section 1 body */}
    <rect x="436" y="66" width="170" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="436" y="78" width="150" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="436" y="90" width="175" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />

    {/* Section 2 header */}
    <rect x="436" y="116" width="90" height="5" rx="1" className="fill-zinc-400 dark:fill-zinc-500" />
    {/* Section 2 body */}
    <rect x="436" y="130" width="160" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="436" y="142" width="140" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="436" y="154" width="170" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />

    {/* Section 3 header */}
    <rect x="436" y="180" width="70" height="5" rx="1" className="fill-zinc-400 dark:fill-zinc-500" />
    {/* Section 3 body */}
    <rect x="436" y="194" width="155" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="436" y="206" width="130" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="436" y="218" width="165" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />

    {/* Good margin indicators */}
    <line x1="428" y1="38" x2="428" y2="278" className="stroke-emerald-300 dark:stroke-emerald-600" strokeWidth="0.5" strokeDasharray="2 2" />
    <line x1="632" y1="38" x2="632" y2="278" className="stroke-emerald-300 dark:stroke-emerald-600" strokeWidth="0.5" strokeDasharray="2 2" />

    {/* Label */}
    <rect x="430" y="286" width="180" height="22" rx="4" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="0.5" />
    <text x="520" y="301" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-500">11pt font · proper margins · inviting</text>
  </svg>
</div>
