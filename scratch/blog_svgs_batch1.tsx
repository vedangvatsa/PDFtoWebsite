{/* ============================================================
   BLOG SVG VISUALS — BATCH 1 (Articles 1–6)
   Each snippet is self-contained JSX ready to paste into an article.
   ============================================================ */}


{/* ----------------------------------------------------------
   1. ai-agents-browsing-resume — Flow Diagram
   Insert after the 'The Three Protocols That Changed Recruiting' section.
   ---------------------------------------------------------- */}

{/* Visual: AI agent recruiting pipeline — query → agent → MCP → payment → shortlist */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 700 220" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Box 1: Hiring Manager */}
    <rect x="10" y="75" width="110" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
    <text x="65" y="105" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Hiring Manager</text>
    <text x="65" y="122" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">types query</text>

    {/* Arrow 1→2 */}
    <line x1="120" y1="110" x2="155" y2="110" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="155,105 165,110 155,115" className="fill-zinc-400 dark:fill-zinc-500" />

    {/* Box 2: AI Agent */}
    <rect x="168" y="75" width="100" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
    <text x="218" y="105" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">AI Agent</text>
    <text x="218" y="122" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">orchestrates</text>

    {/* Arrow 2→3 */}
    <line x1="268" y1="110" x2="303" y2="110" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="303,105 313,110 303,115" className="fill-zinc-400 dark:fill-zinc-500" />

    {/* Box 3: MCP Server */}
    <rect x="316" y="75" width="110" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
    <text x="371" y="100" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">MCP Server</text>
    <text x="371" y="117" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">queries</text>
    <text x="371" y="132" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">talent DB</text>

    {/* Arrow 3→4 */}
    <line x1="426" y1="110" x2="461" y2="110" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="461,105 471,110 461,115" className="fill-zinc-400 dark:fill-zinc-500" />

    {/* Box 4: x402 Payment */}
    <rect x="474" y="75" width="90" height="70" rx="6" className="fill-amber-50 dark:fill-amber-900/30 stroke-amber-300 dark:stroke-amber-700" strokeWidth="1.5" />
    <text x="519" y="100" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">x402</text>
    <text x="519" y="117" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">micropayment</text>
    <text x="519" y="132" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-amber-600 dark:fill-amber-400">$0.02/query</text>

    {/* Arrow 4→5 */}
    <line x1="564" y1="110" x2="599" y2="110" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="599,105 609,110 599,115" className="fill-zinc-400 dark:fill-zinc-500" />

    {/* Box 5: Ranked Shortlist */}
    <rect x="612" y="75" width="80" height="70" rx="6" className="fill-emerald-50 dark:fill-emerald-900/30 stroke-emerald-400 dark:stroke-emerald-700" strokeWidth="1.5" />
    <text x="652" y="100" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Ranked</text>
    <text x="652" y="117" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Shortlist</text>
    <text x="652" y="134" textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Top 5</text>

    {/* Bottom label */}
    <text x="350" y="185" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Agent pays per query · Returns structured results</text>
  </svg>
</div>


{/* ----------------------------------------------------------
   2. cv-attachments — Before/After Comparison
   Insert after the 'Files Look Different Everywhere' section.
   ---------------------------------------------------------- */}

{/* Visual: PDF attachment friction vs. web link simplicity */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 660 300" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left Column Header */}
    <text x="165" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">PDF Attachment</text>

    {/* Right Column Header */}
    <text x="495" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Web Link</text>

    {/* Divider */}
    <line x1="330" y1="10" x2="330" y2="290" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

    {/* LEFT COLUMN — 6 painful steps */}
    {/* Step 1 */}
    <rect x="90" y="48" width="150" height="32" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
    <text x="165" y="69" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Open Email</text>

    <line x1="165" y1="80" x2="165" y2="96" className="stroke-red-300 dark:stroke-red-700" strokeWidth="1.5" />
    <polygon points="160,93 165,100 170,93" className="fill-red-300 dark:fill-red-700" />

    {/* Step 2 */}
    <rect x="90" y="100" width="150" height="32" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
    <text x="165" y="121" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Download File</text>

    <line x1="165" y1="132" x2="165" y2="148" className="stroke-red-300 dark:stroke-red-700" strokeWidth="1.5" />
    <polygon points="160,145 165,152 170,145" className="fill-red-300 dark:fill-red-700" />

    {/* Step 3 */}
    <rect x="90" y="152" width="150" height="32" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
    <text x="165" y="173" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Find in Downloads</text>

    <line x1="165" y1="184" x2="165" y2="200" className="stroke-red-300 dark:stroke-red-700" strokeWidth="1.5" />
    <polygon points="160,197 165,204 170,197" className="fill-red-300 dark:fill-red-700" />

    {/* Step 4 */}
    <rect x="90" y="204" width="150" height="32" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
    <text x="165" y="225" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Open PDF Viewer</text>

    <line x1="165" y1="236" x2="165" y2="252" className="stroke-red-300 dark:stroke-red-700" strokeWidth="1.5" />
    <polygon points="160,249 165,256 170,249" className="fill-red-300 dark:fill-red-700" />

    {/* Step 5 */}
    <rect x="90" y="256" width="150" height="32" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
    <text x="165" y="277" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Pinch-Zoom to Read</text>

    {/* Friction label */}
    <text x="165" y="300" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-red-400 dark:fill-red-500">5 steps of friction</text>

    {/* RIGHT COLUMN — 3 smooth steps */}
    {/* Step 1 */}
    <rect x="420" y="90" width="150" height="36" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
    <text x="495" y="113" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Click Link</text>

    <line x1="495" y1="126" x2="495" y2="150" className="stroke-emerald-400 dark:stroke-emerald-600" strokeWidth="1.5" />
    <polygon points="490,147 495,154 500,147" className="fill-emerald-400 dark:fill-emerald-600" />

    {/* Step 2 */}
    <rect x="420" y="155" width="150" height="36" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
    <text x="495" y="178" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">View Profile</text>

    <line x1="495" y1="191" x2="495" y2="215" className="stroke-emerald-400 dark:stroke-emerald-600" strokeWidth="1.5" />
    <polygon points="490,212 495,219 500,212" className="fill-emerald-400 dark:fill-emerald-600" />

    {/* Step 3 */}
    <rect x="420" y="220" width="150" height="36" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
    <text x="495" y="243" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Share ✓</text>

    {/* Smooth label */}
    <text x="495" y="274" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-emerald-500 dark:fill-emerald-400">Zero friction</text>
  </svg>
</div>


{/* ----------------------------------------------------------
   3. mobile-responsive-cv — Device Comparison
   Insert after the 'The Annoyance of Scrolling Sideways' section.
   ---------------------------------------------------------- */}

{/* Visual: PDF on phone vs. web profile on phone */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 620 320" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* LEFT PHONE — PDF on Phone */}
    <text x="165" y="24" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">PDF on Phone</text>

    {/* Phone outline */}
    <rect x="100" y="38" width="130" height="240" rx="16" className="fill-zinc-50 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="2" />
    {/* Screen area */}
    <rect x="110" y="58" width="110" height="195" rx="4" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
    {/* Notch */}
    <rect x="145" y="42" width="40" height="8" rx="4" className="fill-zinc-300 dark:fill-zinc-600" />

    {/* Tiny unreadable text lines — cramped and messy */}
    <line x1="118" y1="78" x2="208" y2="78" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="2" />
    <line x1="118" y1="84" x2="195" y2="84" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="2" />
    <line x1="118" y1="90" x2="202" y2="90" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1.5" />
    <line x1="118" y1="96" x2="190" y2="96" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1.5" />
    <line x1="118" y1="102" x2="205" y2="102" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
    <line x1="118" y1="107" x2="198" y2="107" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
    <line x1="118" y1="112" x2="210" y2="112" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
    <line x1="118" y1="117" x2="185" y2="117" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
    <line x1="118" y1="122" x2="200" y2="122" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
    <line x1="118" y1="127" x2="195" y2="127" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="0.75" />
    <line x1="118" y1="131" x2="208" y2="131" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="0.75" />
    <line x1="118" y1="135" x2="190" y2="135" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="0.75" />

    {/* Zoom gesture icon — two arrows pointing outward */}
    <circle cx="165" cy="195" r="18" className="fill-zinc-100 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-500" strokeWidth="1" />
    {/* Pinch arrows */}
    <line x1="155" y1="205" x2="148" y2="212" className="stroke-zinc-400 dark:stroke-zinc-400" strokeWidth="1.5" />
    <line x1="175" y1="185" x2="182" y2="178" className="stroke-zinc-400 dark:stroke-zinc-400" strokeWidth="1.5" />
    <polygon points="147,208 146,214 152,213" className="fill-zinc-400 dark:fill-zinc-400" />
    <polygon points="183,182 184,176 178,177" className="fill-zinc-400 dark:fill-zinc-400" />
    <text x="165" y="233" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">pinch to zoom</text>

    {/* RIGHT PHONE — Web Profile */}
    <text x="455" y="24" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Web Profile on Phone</text>

    {/* Phone outline */}
    <rect x="390" y="38" width="130" height="240" rx="16" className="fill-zinc-50 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="2" />
    {/* Screen area */}
    <rect x="400" y="58" width="110" height="195" rx="4" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
    {/* Notch */}
    <rect x="435" y="42" width="40" height="8" rx="4" className="fill-zinc-300 dark:fill-zinc-600" />

    {/* Clean readable content */}
    {/* Avatar circle */}
    <circle cx="455" cy="82" r="14" className="fill-emerald-100 dark:fill-emerald-800 stroke-emerald-300 dark:stroke-emerald-600" strokeWidth="1" />
    <text x="455" y="86" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-300">JS</text>

    {/* Name */}
    <rect x="415" y="104" width="80" height="8" rx="2" className="fill-zinc-700 dark:fill-zinc-200" />
    {/* Title */}
    <rect x="420" y="118" width="70" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-500" />

    {/* Section divider */}
    <line x1="415" y1="134" x2="495" y2="134" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />

    {/* Clean readable text lines — well spaced */}
    <rect x="415" y="144" width="80" height="5" rx="1.5" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="415" y="156" width="72" height="5" rx="1.5" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="415" y="168" width="78" height="5" rx="1.5" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="415" y="180" width="65" height="5" rx="1.5" className="fill-zinc-300 dark:fill-zinc-600" />

    {/* Section divider */}
    <line x1="415" y1="196" x2="495" y2="196" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />

    {/* Skills pills */}
    <rect x="415" y="206" width="32" height="14" rx="7" className="fill-emerald-100 dark:fill-emerald-900/40 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.75" />
    <rect x="452" y="206" width="40" height="14" rx="7" className="fill-emerald-100 dark:fill-emerald-900/40 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.75" />
    <rect x="415" y="226" width="36" height="14" rx="7" className="fill-emerald-100 dark:fill-emerald-900/40 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.75" />

    {/* Checkmark */}
    <text x="455" y="300" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-emerald-500 dark:fill-emerald-400">Readable without zooming ✓</text>

    {/* VS label */}
    <text x="310" y="165" textAnchor="middle" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-zinc-300 dark:fill-zinc-600">vs</text>
  </svg>
</div>


{/* ----------------------------------------------------------
   4. cv-web-link — Link Preview Card
   Insert after the 'The Preview Card Effect' section.
   ---------------------------------------------------------- */}

{/* Visual: Plain attachment vs. rich link preview in a chat */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 660 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">

    {/* TOP SCENARIO — Boring Attachment */}
    <text x="30" y="24" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">What they see: Attachment</text>

    {/* Chat bubble */}
    <rect x="30" y="36" width="340" height="52" rx="10" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

    {/* Paperclip icon (simplified) */}
    <path d="M52 54 L52 70 Q52 76 58 76 Q64 76 64 70 L64 58 Q64 50 56 50 Q48 50 48 58 L48 70" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" fill="none" strokeLinecap="round" />

    {/* Filename */}
    <text x="78" y="62" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">Resume_John_2026.pdf</text>
    <text x="78" y="78" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">245 KB · PDF Document</text>

    {/* Red X — boring */}
    <text x="400" y="68" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-red-400 dark:fill-red-500">← Forgettable</text>

    {/* Divider */}
    <line x1="30" y1="115" x2="630" y2="115" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

    {/* BOTTOM SCENARIO — Rich Link Preview */}
    <text x="30" y="142" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">What they see: Link</text>

    {/* Chat bubble with link text */}
    <rect x="30" y="154" width="340" height="36" rx="10" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
    <text x="50" y="177" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-blue-500 dark:fill-blue-400">cvin.bio/john-doe</text>

    {/* Rich preview card */}
    <rect x="30" y="196" width="340" height="72" rx="8" className="fill-white dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1.5" />

    {/* Left color bar on preview */}
    <rect x="30" y="196" width="4" height="72" rx="2" className="fill-emerald-500" />

    {/* Avatar square */}
    <rect x="46" y="208" width="44" height="44" rx="6" className="fill-emerald-100 dark:fill-emerald-800" />
    <text x="68" y="234" textAnchor="middle" fontSize="16" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-300">JD</text>

    {/* Name & role */}
    <text x="104" y="224" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">John Doe</text>
    <text x="104" y="240" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Senior Product Designer · 8 yrs exp</text>
    <text x="104" y="256" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">cvin.bio</text>

    {/* Green arrow — eye-catching */}
    <text x="400" y="240" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500 dark:fill-emerald-400">← Eye-catching</text>
  </svg>
</div>


{/* ----------------------------------------------------------
   5. bypass-ats — Dual Submission Flow
   Insert after the 'The Dual-Submission Fix' section.
   ---------------------------------------------------------- */}

{/* Visual: Dual track — plain text for ATS robot + URL for human recruiter */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 680 250" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">

    {/* Origin node: You Submit */}
    <rect x="16" y="95" width="90" height="50" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
    <text x="61" y="117" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">You</text>
    <text x="61" y="132" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Submit</text>

    {/* Fork — line going up to top track */}
    <line x1="106" y1="110" x2="145" y2="60" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="141,56 148,56 145,63" className="fill-zinc-400 dark:fill-zinc-500" />

    {/* Fork — line going down to bottom track */}
    <line x1="106" y1="130" x2="145" y2="180" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="141,184 148,184 145,177" className="fill-zinc-400 dark:fill-zinc-500" />

    {/* ===== TOP TRACK: For the Robot ===== */}
    <text x="148" y="28" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">For the Robot</text>

    {/* Box: Plain Text Doc */}
    <rect x="148" y="40" width="120" height="40" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
    <text x="208" y="65" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Plain Text Doc</text>

    {/* Arrow */}
    <line x1="268" y1="60" x2="310" y2="60" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="307,55 317,60 307,65" className="fill-zinc-400 dark:fill-zinc-500" />

    {/* Box: ATS Parser */}
    <rect x="320" y="40" width="120" height="40" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
    <text x="380" y="65" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">ATS Parser</text>

    {/* Arrow */}
    <line x1="440" y1="60" x2="482" y2="60" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="479,55 489,60 479,65" className="fill-zinc-400 dark:fill-zinc-500" />

    {/* Box: Keyword Match */}
    <rect x="492" y="40" width="140" height="40" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
    <text x="562" y="58" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Keyword Match</text>
    <text x="562" y="73" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>

    {/* ===== BOTTOM TRACK: For the Human ===== */}
    <text x="148" y="170" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">For the Human</text>

    {/* Box: URL at Top */}
    <rect x="148" y="180" width="120" height="40" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
    <text x="208" y="200" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-blue-500 dark:fill-blue-400">Your URL</text>
    <text x="208" y="214" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">at top of resume</text>

    {/* Arrow */}
    <line x1="268" y1="200" x2="310" y2="200" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="307,195 317,200 307,205" className="fill-zinc-400 dark:fill-zinc-500" />

    {/* Box: Recruiter Clicks */}
    <rect x="320" y="180" width="120" height="40" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
    <text x="380" y="205" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Recruiter Clicks</text>

    {/* Arrow */}
    <line x1="440" y1="200" x2="482" y2="200" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="479,195 489,200 479,205" className="fill-zinc-400 dark:fill-zinc-500" />

    {/* Box: Beautiful Profile */}
    <rect x="492" y="180" width="140" height="40" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
    <text x="562" y="198" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Beautiful Profile</text>
    <text x="562" y="213" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>

    {/* Bottom label */}
    <text x="340" y="244" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Same application · Two audiences · Both satisfied</text>
  </svg>
</div>


{/* ----------------------------------------------------------
   6. stand-out-inbox — Inbox Stack
   Insert after the '300 Identical Attachments' section.
   ---------------------------------------------------------- */}

{/* Visual: Email inbox with 5 identical grey rows and 1 standout link preview */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 620 310" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">

    {/* Inbox header bar */}
    <rect x="60" y="10" width="500" height="32" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
    <text x="310" y="31" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Inbox — Senior Designer Role (312 applicants)</text>

    {/* Row 1 */}
    <rect x="60" y="48" width="500" height="36" rx="4" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />
    {/* Paperclip */}
    <path d="M82 58 L82 72 Q82 76 86 76 Q90 76 90 72 L90 62 Q90 56 85 56 Q80 56 80 62 L80 72" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" strokeLinecap="round" />
    <text x="102" y="71" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Resume_Smith.pdf</text>
    <text x="480" y="71" textAnchor="end" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-300 dark:fill-zinc-600">245 KB</text>

    {/* Row 2 */}
    <rect x="60" y="88" width="500" height="36" rx="4" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />
    <path d="M82 98 L82 112 Q82 116 86 116 Q90 116 90 112 L90 102 Q90 96 85 96 Q80 96 80 102 L80 112" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" strokeLinecap="round" />
    <text x="102" y="111" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">CV_Johnson_Final_v3.pdf</text>
    <text x="480" y="111" textAnchor="end" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-300 dark:fill-zinc-600">312 KB</text>

    {/* Row 3 */}
    <rect x="60" y="128" width="500" height="36" rx="4" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />
    <path d="M82 138 L82 152 Q82 156 86 156 Q90 156 90 152 L90 142 Q90 136 85 136 Q80 136 80 142 L80 152" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" strokeLinecap="round" />
    <text x="102" y="151" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Resume_Williams_2026.pdf</text>
    <text x="480" y="151" textAnchor="end" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-300 dark:fill-zinc-600">198 KB</text>

    {/* Row 4 */}
    <rect x="60" y="168" width="500" height="36" rx="4" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />
    <path d="M82 178 L82 192 Q82 196 86 196 Q90 196 90 192 L90 182 Q90 176 85 176 Q80 176 80 182 L80 192" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" strokeLinecap="round" />
    <text x="102" y="191" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">CV_Brown.pdf</text>
    <text x="480" y="191" textAnchor="end" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-300 dark:fill-zinc-600">276 KB</text>

    {/* Row 5 — identical grey */}
    <rect x="60" y="208" width="500" height="36" rx="4" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />
    <path d="M82 218 L82 232 Q82 236 86 236 Q90 236 90 232 L90 222 Q90 216 85 216 Q80 216 80 222 L80 232" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" strokeLinecap="round" />
    <text x="102" y="231" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Resume_Taylor_Updated.pdf</text>
    <text x="480" y="231" textAnchor="end" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-300 dark:fill-zinc-600">220 KB</text>

    {/* Row 6 — THE STANDOUT */}
    <rect x="60" y="252" width="500" height="50" rx="6" className="fill-white dark:fill-zinc-800 stroke-emerald-400 dark:stroke-emerald-600" strokeWidth="2" />

    {/* Left accent bar */}
    <rect x="60" y="252" width="4" height="50" rx="2" className="fill-emerald-500" />

    {/* Avatar square */}
    <rect x="76" y="259" width="34" height="34" rx="5" className="fill-emerald-100 dark:fill-emerald-800" />
    <text x="93" y="281" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-300">D</text>

    {/* Name & headline */}
    <text x="122" y="274" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">David Chen — Senior Product Designer</text>
    <text x="122" y="290" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">8 yrs · Figma, Systems, Research · Ex-Spotify</text>

    {/* URL label */}
    <text x="480" y="280" textAnchor="end" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-500 dark:fill-emerald-400">cvin.bio/david</text>

    {/* Annotation arrow on right side pointing to standout row */}
    <line x1="575" y1="150" x2="575" y2="270" className="stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="1.5" />
    <polygon points="570,267 575,277 580,267" className="fill-emerald-400 dark:fill-emerald-500" />
    <text x="575" y="140" textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-500 dark:fill-emerald-400">This one</text>
    <text x="575" y="152" textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-500 dark:fill-emerald-400">gets clicked</text>
  </svg>
</div>
