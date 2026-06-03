{/* ============================================================
   BLOG SVG BATCH 2 — Articles 7–12
   ============================================================ */}

{/* ============================================================
   7. Slug: pdf-breaks-ats
   Insert after: the "Fonts Turning Into Pictures" section (after its h2)
   Visual: Text corruption comparison — clean text vs garbled ATS output
   ============================================================ */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 680 260" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left column background */}
    <rect x="16" y="16" width="310" height="228" rx="6" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
    {/* Right column background */}
    <rect x="354" y="16" width="310" height="228" rx="6" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

    {/* Left label */}
    <text x="171" y="50" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">What You Wrote</text>
    {/* Right label */}
    <text x="509" y="50" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">What The ATS Reads</text>

    {/* Divider lines */}
    <line x1="40" y1="64" x2="302" y2="64" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
    <line x1="378" y1="64" x2="640" y2="64" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

    {/* Left clean text */}
    <text x="171" y="100" textAnchor="middle" fontSize="13" fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-300">5 years of experience</text>
    <text x="171" y="125" textAnchor="middle" fontSize="13" fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-300">with React and</text>
    <text x="171" y="150" textAnchor="middle" fontSize="13" fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-300">TypeScript</text>

    {/* Check icon */}
    <circle cx="171" cy="190" r="14" className="fill-emerald-500/15 stroke-emerald-500" strokeWidth="1.5" />
    <path d="M163 190 L169 196 L180 184" className="stroke-emerald-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <text x="171" y="222" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Clean & parseable</text>

    {/* Right garbled text */}
    <text x="509" y="100" textAnchor="middle" fontSize="13" fontFamily="ui-monospace, monospace" className="fill-red-500 dark:fill-red-400">5years  ofexperience</text>
    <text x="509" y="125" textAnchor="middle" fontSize="13" fontFamily="ui-monospace, monospace" className="fill-red-500 dark:fill-red-400">wxth Reac7 and</text>
    <text x="509" y="150" textAnchor="middle" fontSize="13" fontFamily="ui-monospace, monospace" className="fill-red-500 dark:fill-red-400">TypeScripl</text>

    {/* Red squiggly underlines on garbled words */}
    <path d="M440,105 q3,-4 6,0 t6,0 t6,0 t6,0 t6,0 t6,0 t6,0 t6,0 t6,0 t6,0 t6,0 t6,0" className="stroke-red-400" strokeWidth="1.5" fill="none" />
    <path d="M460,130 q3,-4 6,0 t6,0 t6,0 t6,0" className="stroke-red-400" strokeWidth="1.5" fill="none" />
    <path d="M523,130 q3,-4 6,0 t6,0 t6,0 t6,0" className="stroke-red-400" strokeWidth="1.5" fill="none" />
    <path d="M466,155 q3,-4 6,0 t6,0 t6,0 t6,0 t6,0 t6,0 t6,0" className="stroke-red-400" strokeWidth="1.5" fill="none" />

    {/* X icon */}
    <circle cx="509" cy="190" r="14" className="fill-red-500/15 stroke-red-400" strokeWidth="1.5" />
    <path d="M503 184 L515 196 M515 184 L503 196" className="stroke-red-400" strokeWidth="2" strokeLinecap="round" />
    <text x="509" y="222" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">Corrupted by ATS</text>

    {/* Center arrow */}
    <line x1="330" y1="130" x2="350" y2="130" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="350,126 358,130 350,134" className="fill-zinc-400 dark:fill-zinc-500" />
  </svg>
</div>


{/* ============================================================
   8. Slug: tech-resume-keywords
   Insert after: the first section that discusses the scanning pattern (after its h2)
   Visual: Z-scan pattern overlaid on a simplified resume layout
   ============================================================ */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 660 340" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Title */}
    <text x="330" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">The 6-Second Z-Scan</text>

    {/* Resume rectangle */}
    <rect x="160" y="46" width="340" height="280" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" />

    {/* Left margin accent strip */}
    <rect x="160" y="46" width="6" height="280" rx="3" className="fill-amber-400/40 dark:fill-amber-500/30" />
    <text x="148" y="186" textAnchor="end" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-amber-600 dark:fill-amber-400" transform="rotate(-90 148 186)">Eye lingers here</text>

    {/* Fake resume content — header area */}
    <rect x="190" y="62" width="140" height="10" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="190" y="78" width="90" height="6" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="350" y="62" width="130" height="10" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="380" y="78" width="100" height="6" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

    {/* Divider */}
    <line x1="180" y1="98" x2="480" y2="98" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

    {/* Section lines — experience */}
    <rect x="190" y="110" width="80" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="190" y="128" width="280" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="190" y="140" width="260" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="190" y="152" width="240" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="190" y="164" width="270" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

    {/* Section lines — skills */}
    <rect x="190" y="186" width="60" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="190" y="204" width="250" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="190" y="216" width="230" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

    {/* Section lines — education */}
    <rect x="190" y="238" width="80" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="190" y="256" width="200" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="190" y="268" width="160" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

    {/* Bottom lines */}
    <rect x="190" y="290" width="240" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="190" y="302" width="200" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

    {/* Z-scan arrow path */}
    {/* Top-left to top-right */}
    <line x1="192" y1="67" x2="472" y2="67" className="stroke-blue-500 dark:stroke-blue-400" strokeWidth="2.5" strokeDasharray="6 3" />
    <polygon points="472,63 480,67 472,71" className="fill-blue-500 dark:fill-blue-400" />

    {/* Diagonal: top-right to bottom-left */}
    <line x1="475" y1="72" x2="195" y2="285" className="stroke-blue-500 dark:stroke-blue-400" strokeWidth="2.5" strokeDasharray="6 3" />
    <polygon points="199,281 191,289 195,290" className="fill-blue-500 dark:fill-blue-400" />

    {/* Bottom-left to bottom-right */}
    <line x1="195" y1="296" x2="472" y2="296" className="stroke-blue-500 dark:stroke-blue-400" strokeWidth="2.5" strokeDasharray="6 3" />
    <polygon points="472,292 480,296 472,300" className="fill-blue-500 dark:fill-blue-400" />

    {/* Numbered dots at each Z corner */}
    <circle cx="190" cy="67" r="10" className="fill-blue-500 dark:fill-blue-400" />
    <text x="190" y="71" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-white">1</text>

    <circle cx="480" cy="67" r="10" className="fill-blue-500 dark:fill-blue-400" />
    <text x="480" y="71" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-white">2</text>

    <circle cx="190" cy="290" r="10" className="fill-blue-500 dark:fill-blue-400" />
    <text x="190" y="294" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-white">3</text>

    <circle cx="480" cy="296" r="10" className="fill-blue-500 dark:fill-blue-400" />
    <text x="480" y="300" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-white">4</text>

    {/* Legend labels */}
    <text x="530" y="70" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-blue-600 dark:fill-blue-400">Name / Title</text>
    <text x="530" y="186" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-blue-600 dark:fill-blue-400">Diagonal scan</text>
    <text x="530" y="299" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-blue-600 dark:fill-blue-400">Skills / Dates</text>
  </svg>
</div>


{/* ============================================================
   9. Slug: update-cv-anytime
   Insert after: the section about versioning (after its h2)
   Visual: Version control timeline — PDF workflow vs URL workflow
   ============================================================ */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 680 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Row 1: PDF Workflow */}
    <text x="16" y="28" fontSize="12" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">PDF Workflow</text>

    {/* Timeline line */}
    <line x1="50" y1="70" x2="620" y2="70" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" />

    {/* Event 1: Send v1 */}
    <circle cx="80" cy="70" r="6" className="fill-zinc-400 dark:fill-zinc-500" />
    <text x="80" y="56" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">Send v1</text>

    {/* Event 2: Find typo */}
    <circle cx="200" cy="70" r="6" className="fill-amber-500" />
    <text x="200" y="56" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-amber-600 dark:fill-amber-400">Find typo</text>

    {/* Event 3: Send v2 */}
    <circle cx="320" cy="70" r="6" className="fill-zinc-400 dark:fill-zinc-500" />
    <text x="320" y="56" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">Send v2</text>

    {/* Event 4: Recruiter has v1 */}
    <circle cx="460" cy="70" r="6" className="fill-red-400" />
    <text x="460" y="56" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">Recruiter has v1</text>

    {/* Event 5: Confusion */}
    <circle cx="600" cy="70" r="14" className="fill-red-500/15 stroke-red-400" strokeWidth="1.5" />
    <path d="M594 64 L606 76 M606 64 L594 76" className="stroke-red-400" strokeWidth="2" strokeLinecap="round" />
    <text x="600" y="100" textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">Confusion</text>

    {/* Divider */}
    <line x1="16" y1="130" x2="664" y2="130" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 4" />

    {/* Row 2: URL Workflow */}
    <text x="16" y="160" fontSize="12" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">URL Workflow</text>

    {/* Timeline line */}
    <line x1="50" y1="200" x2="620" y2="200" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" />

    {/* Event 1: Share link */}
    <circle cx="100" cy="200" r="6" className="fill-zinc-400 dark:fill-zinc-500" />
    <text x="100" y="186" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">Share link</text>

    {/* Event 2: Fix typo */}
    <circle cx="260" cy="200" r="6" className="fill-emerald-500" />
    <text x="260" y="186" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Fix typo</text>

    {/* Event 3: Recruiter sees latest */}
    <circle cx="420" cy="200" r="6" className="fill-emerald-500" />
    <text x="420" y="186" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Recruiter sees latest</text>

    {/* Event 4: Always current */}
    <circle cx="580" cy="200" r="14" className="fill-emerald-500/15 stroke-emerald-500" strokeWidth="1.5" />
    <path d="M572 200 L578 206 L589 194" className="stroke-emerald-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <text x="580" y="230" textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Always current</text>

    {/* Row labels (colored side bars) */}
    <rect x="0" y="42" width="4" height="70" rx="2" className="fill-red-400" />
    <rect x="0" y="172" width="4" height="70" rx="2" className="fill-emerald-500" />
  </svg>
</div>


{/* ============================================================
   10. Slug: objective-statement-death
   Insert after: the first major content section (after its h2)
   Visual: Before/After text block — vague objective vs specific value proposition
   ============================================================ */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 660 260" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Before box */}
    <rect x="16" y="16" width="628" height="100" rx="6" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
    {/* Red left border */}
    <rect x="16" y="16" width="5" height="100" rx="2" className="fill-red-400" />

    {/* Before label */}
    <text x="40" y="42" fontSize="11" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">BEFORE</text>

    {/* Before text */}
    <text x="40" y="68" fontSize="13" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400" fontStyle="italic">"Seeking a challenging position where I can leverage</text>
    <text x="40" y="88" fontSize="13" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400" fontStyle="italic">my skills and grow professionally."</text>

    {/* Arrow between boxes */}
    <line x1="330" y1="120" x2="330" y2="140" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="326,140 330,148 334,140" className="fill-zinc-400 dark:fill-zinc-500" />

    {/* After box */}
    <rect x="16" y="152" width="628" height="100" rx="6" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
    {/* Green left border */}
    <rect x="16" y="152" width="5" height="100" rx="2" className="fill-emerald-500" />

    {/* After label */}
    <text x="40" y="178" fontSize="11" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">AFTER</text>

    {/* After text */}
    <text x="40" y="204" fontSize="13" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">"Full-stack engineer. 6 years shipping payment systems</text>
    <text x="40" y="224" fontSize="13" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">at scale. Last project cut checkout failures by 40%."</text>
  </svg>
</div>


{/* ============================================================
   11. Slug: overstuffing-bullets
   Insert after: the first section about long bullet points (after its h2)
   Visual: Density comparison — bloated bullet vs clean bullet
   ============================================================ */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 680 300" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left side — Too Dense */}
    <rect x="16" y="16" width="310" height="268" rx="6" className="fill-red-50 dark:fill-red-950/30 stroke-red-200 dark:stroke-red-900/50" strokeWidth="1" />
    <text x="171" y="44" textAnchor="middle" fontSize="12" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">TOO DENSE</text>

    {/* Bullet dot */}
    <circle cx="36" cy="70" r="3" className="fill-red-400" />

    {/* Dense text block */}
    <text x="48" y="74" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Responsible for designing, developing,</text>
    <text x="48" y="92" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">testing, and deploying a full-stack web</text>
    <text x="48" y="110" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">application using React, Node.js, and</text>
    <text x="48" y="128" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">PostgreSQL that improved internal team</text>
    <text x="48" y="146" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">productivity by consolidating three</text>
    <text x="48" y="164" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">legacy tools into a single dashboard</text>
    <text x="48" y="182" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">used by 200+ employees across four</text>
    <text x="48" y="200" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">departments including engineering,</text>
    <text x="48" y="218" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">support, sales, and operations teams</text>

    {/* X icon */}
    <circle cx="171" cy="256" r="12" className="fill-red-500/15 stroke-red-400" strokeWidth="1.5" />
    <path d="M166 251 L176 261 M176 251 L166 261" className="stroke-red-400" strokeWidth="2" strokeLinecap="round" />

    {/* Divider */}
    <line x1="340" y1="36" x2="340" y2="270" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 4" />

    {/* Right side — Clean */}
    <rect x="354" y="16" width="310" height="268" rx="6" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-900/50" strokeWidth="1" />
    <text x="509" y="44" textAnchor="middle" fontSize="12" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">CLEAN</text>

    {/* Clean bullet 1 */}
    <circle cx="374" cy="76" r="3" className="fill-emerald-500" />
    <text x="386" y="80" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">Built unified dashboard (React +</text>
    <text x="386" y="98" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">Node.js) replacing 3 legacy tools</text>

    {/* Clean bullet 2 */}
    <circle cx="374" cy="130" r="3" className="fill-emerald-500" />
    <text x="386" y="134" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">Adopted by 200+ employees across</text>
    <text x="386" y="152" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">4 departments</text>

    {/* Visual space indicator */}
    <text x="509" y="200" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500" fontStyle="italic">↑ Room to breathe ↑</text>

    {/* Check icon */}
    <circle cx="509" cy="256" r="12" className="fill-emerald-500/15 stroke-emerald-500" strokeWidth="1.5" />
    <path d="M503 256 L507 260 L516 250" className="stroke-emerald-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</div>


{/* ============================================================
   12. Slug: measuring-impact-no-data
   Insert after: the section explaining how to reframe without dollar amounts (after its h2)
   Visual: Metric reframe chart — vague claims transformed to specific metrics
   ============================================================ */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 680 290" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Header row */}
    <text x="150" y="24" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">VAGUE CLAIM</text>
    <text x="530" y="24" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">WITH METRICS</text>

    {/* Row 1 */}
    <rect x="16" y="42" width="268" height="64" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
    <rect x="16" y="42" width="4" height="64" rx="2" className="fill-red-400" />
    <text x="32" y="68" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">"Improved the</text>
    <text x="32" y="86" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">onboarding process"</text>

    {/* Arrow 1 */}
    <line x1="296" y1="74" x2="382" y2="74" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="382,70 390,74 382,78" className="fill-zinc-400 dark:fill-zinc-500" />

    <rect x="396" y="42" width="268" height="64" rx="6" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1" />
    <rect x="396" y="42" width="4" height="64" rx="2" className="fill-emerald-500" />
    <text x="412" y="68" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">"Cut new hire ramp-up</text>
    <text x="412" y="86" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">from 3 weeks to 5 days"</text>

    {/* Row 2 */}
    <rect x="16" y="122" width="268" height="64" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
    <rect x="16" y="122" width="4" height="64" rx="2" className="fill-red-400" />
    <text x="32" y="148" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">"Helped reduce</text>
    <text x="32" y="166" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">bugs"</text>

    {/* Arrow 2 */}
    <line x1="296" y1="154" x2="382" y2="154" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="382,150 390,154 382,158" className="fill-zinc-400 dark:fill-zinc-500" />

    <rect x="396" y="122" width="268" height="64" rx="6" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1" />
    <rect x="396" y="122" width="4" height="64" rx="2" className="fill-emerald-500" />
    <text x="412" y="148" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">"Lowered P1 incidents</text>
    <text x="412" y="166" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">from 12/month to 2/month"</text>

    {/* Row 3 */}
    <rect x="16" y="202" width="268" height="64" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
    <rect x="16" y="202" width="4" height="64" rx="2" className="fill-red-400" />
    <text x="32" y="228" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">"Managed</text>
    <text x="32" y="246" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">a team"</text>

    {/* Arrow 3 */}
    <line x1="296" y1="234" x2="382" y2="234" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="382,230 390,234 382,238" className="fill-zinc-400 dark:fill-zinc-500" />

    <rect x="396" y="202" width="268" height="64" rx="6" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1" />
    <rect x="396" y="202" width="4" height="64" rx="2" className="fill-emerald-500" />
    <text x="412" y="228" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">"Led 4 engineers shipping</text>
    <text x="412" y="246" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">3 features per sprint"</text>
  </svg>
</div>
