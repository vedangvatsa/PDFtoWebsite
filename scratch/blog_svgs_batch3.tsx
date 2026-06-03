{/* ============================================================
   ARTICLE 13: short-tenures-tech — Timeline Bar Chart
   Insert after the first major section.
   ============================================================ */}

{/* Visual: Horizontal bar chart showing 3 short job tenures with contextual labels */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 660 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Title */}
    <text x="330" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      Short Tenures — With Context
    </text>

    {/* Row 1: 8 months */}
    <text x="20" y="75" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      Role 1
    </text>
    <rect x="80" y="60" width="160" height="24" rx="4" className="fill-emerald-500" opacity="0.85" />
    <text x="90" y="77" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-white">
      8 months
    </text>
    <text x="252" y="77" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      Company acquired
    </text>

    {/* Row 2: 14 months */}
    <text x="20" y="125" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      Role 2
    </text>
    <rect x="80" y="110" width="280" height="24" rx="4" className="fill-emerald-500" opacity="0.85" />
    <text x="90" y="127" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-white">
      14 months
    </text>
    <text x="372" y="127" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      Team pivot to new product
    </text>

    {/* Row 3: 6 months */}
    <text x="20" y="175" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      Role 3
    </text>
    <rect x="80" y="160" width="120" height="24" rx="4" className="fill-emerald-500" opacity="0.85" />
    <text x="90" y="177" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-white">
      6 months
    </text>
    <text x="212" y="177" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      Contract role
    </text>

    {/* Scale marks */}
    <line x1="80" y1="200" x2="80" y2="206" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
    <text x="80" y="218" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">0</text>

    <line x1="200" y1="200" x2="200" y2="206" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
    <text x="200" y="218" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">6 mo</text>

    <line x1="320" y1="200" x2="320" y2="206" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
    <text x="320" y="218" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">12 mo</text>

    <line x1="440" y1="200" x2="440" y2="206" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
    <text x="440" y="218" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">18 mo</text>

    {/* Baseline */}
    <line x1="80" y1="200" x2="440" y2="200" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

    {/* Takeaway */}
    <text x="330" y="252" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      Short stays are normal — when context is visible.
    </text>
  </svg>
</div>


{/* ============================================================
   ARTICLE 14: keyword-trust — Skills Audit Diagram
   Insert after the section about contextual tool anchoring.
   ============================================================ */}

{/* Visual: Skills audit showing which listed skills actually appear in work history */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 660 320" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Column Headers */}
    <text x="40" y="28" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      Skill
    </text>
    <text x="300" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      In Skills Block
    </text>
    <text x="500" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      Used in Work History
    </text>

    {/* Divider */}
    <line x1="20" y1="40" x2="640" y2="40" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

    {/* Row 1: React — Both ✓ */}
    <text x="40" y="68" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">React</text>
    <circle cx="300" cy="63" r="8" className="fill-emerald-500" opacity="0.15" />
    <text x="300" y="67" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>
    <circle cx="500" cy="63" r="8" className="fill-emerald-500" opacity="0.15" />
    <text x="500" y="67" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>

    {/* Row 2: Python — Both ✓ */}
    <rect x="20" y="82" width="620" height="36" rx="4" className="fill-zinc-100 dark:fill-zinc-800" opacity="0.5" />
    <text x="40" y="105" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Python</text>
    <circle cx="300" cy="100" r="8" className="fill-emerald-500" opacity="0.15" />
    <text x="300" y="104" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>
    <circle cx="500" cy="100" r="8" className="fill-emerald-500" opacity="0.15" />
    <text x="500" y="104" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>

    {/* Row 3: TypeScript — Both ✓ */}
    <text x="40" y="142" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">TypeScript</text>
    <circle cx="300" cy="137" r="8" className="fill-emerald-500" opacity="0.15" />
    <text x="300" y="141" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>
    <circle cx="500" cy="137" r="8" className="fill-emerald-500" opacity="0.15" />
    <text x="500" y="141" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>

    {/* Row 4: SQL — Both ✓ */}
    <rect x="20" y="156" width="620" height="36" rx="4" className="fill-zinc-100 dark:fill-zinc-800" opacity="0.5" />
    <text x="40" y="179" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">SQL</text>
    <circle cx="300" cy="174" r="8" className="fill-emerald-500" opacity="0.15" />
    <text x="300" y="178" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>
    <circle cx="500" cy="174" r="8" className="fill-emerald-500" opacity="0.15" />
    <text x="500" y="178" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>

    {/* Row 5: Kubernetes — ✓ and ✗ (flagged) */}
    <text x="40" y="216" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Kubernetes</text>
    <circle cx="300" cy="211" r="8" className="fill-emerald-500" opacity="0.15" />
    <text x="300" y="215" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>
    <circle cx="500" cy="211" r="8" className="fill-red-400" opacity="0.15" />
    <text x="500" y="216" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-400">✗</text>

    {/* Row 6: GraphQL — ✓ and ✗ (flagged) */}
    <rect x="20" y="230" width="620" height="36" rx="4" className="fill-red-50 dark:fill-red-950" opacity="0.5" />
    <text x="40" y="253" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">GraphQL</text>
    <circle cx="300" cy="248" r="8" className="fill-emerald-500" opacity="0.15" />
    <text x="300" y="252" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>
    <circle cx="500" cy="248" r="8" className="fill-red-400" opacity="0.15" />
    <text x="500" y="253" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-400">✗</text>

    {/* Warning label */}
    <line x1="20" y1="278" x2="640" y2="278" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />
    <text x="330" y="305" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      Skills listed but never referenced in work history look like keyword stuffing.
    </text>
  </svg>
</div>


{/* ============================================================
   ARTICLE 15: soft-skills-evidence — Claim vs Proof Table
   Insert after the opening paragraphs.
   ============================================================ */}

{/* Visual: Three soft-skill claims mapped to concrete proof with arrows */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 680 300" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Column Headers */}
    <text x="130" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      The Claim
    </text>
    <text x="520" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      The Proof
    </text>

    {/* Row 1 */}
    <rect x="20" y="50" width="220" height="52" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
    <text x="130" y="73" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      "Excellent communicator"
    </text>

    {/* Arrow 1 */}
    <line x1="240" y1="76" x2="310" y2="76" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="310,72 318,76 310,80" className="fill-zinc-400 dark:fill-zinc-500" />

    <rect x="320" y="50" width="340" height="52" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
    <text x="490" y="69" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      Ran weekly cross-team syncs
    </text>
    <text x="490" y="84" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      bridging eng and marketing
    </text>

    {/* Row 2 */}
    <rect x="20" y="120" width="220" height="52" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
    <text x="130" y="150" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      "Strong leader"
    </text>

    {/* Arrow 2 */}
    <line x1="240" y1="146" x2="310" y2="146" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="310,142 318,146 310,150" className="fill-zinc-400 dark:fill-zinc-500" />

    <rect x="320" y="120" width="340" height="52" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
    <text x="490" y="139" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      Mentored 3 juniors into senior
    </text>
    <text x="490" y="154" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      promotions in 12 months
    </text>

    {/* Row 3 */}
    <rect x="20" y="190" width="220" height="52" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
    <text x="130" y="220" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      "Team player"
    </text>

    {/* Arrow 3 */}
    <line x1="240" y1="216" x2="310" y2="216" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="310,212 318,216 310,220" className="fill-zinc-400 dark:fill-zinc-500" />

    <rect x="320" y="190" width="340" height="52" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
    <text x="490" y="209" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      Authored the deploy SOP
    </text>
    <text x="490" y="224" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      now used by 40 engineers
    </text>

    {/* Bottom line */}
    <text x="340" y="275" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      Vague claims become credible when paired with specific evidence.
    </text>
  </svg>
</div>


{/* ============================================================
   ARTICLE 16: the-30-second-scan — Z-Scan Overlay
   Insert after the opening about the Z-pattern scan.
   ============================================================ */}

{/* Visual: Simplified resume mockup with Z-shaped eye-tracking path */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 680 350" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Resume page outline */}
    <rect x="180" y="20" width="320" height="310" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" />

    {/* Header section */}
    <rect x="200" y="36" width="140" height="10" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="200" y="52" width="90" height="6" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

    {/* Contact info (right side of header) */}
    <rect x="400" y="36" width="80" height="6" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="420" y="48" width="60" height="6" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

    {/* Experience lines */}
    <rect x="200" y="78" width="60" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="200" y="94" width="260" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="200" y="105" width="240" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="200" y="116" width="250" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

    <rect x="200" y="136" width="80" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="200" y="152" width="260" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="200" y="163" width="230" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="200" y="174" width="250" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

    <rect x="200" y="194" width="70" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="200" y="210" width="260" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="200" y="221" width="240" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

    {/* Skills section at bottom */}
    <rect x="200" y="248" width="40" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
    <rect x="200" y="264" width="50" height="16" rx="8" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="258" y="264" width="60" height="16" rx="8" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="326" y="264" width="45" height="16" rx="8" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="379" y="264" width="55" height="16" rx="8" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="200" y="288" width="65" height="16" rx="8" className="fill-zinc-200 dark:fill-zinc-700" />
    <rect x="273" y="288" width="50" height="16" rx="8" className="fill-zinc-200 dark:fill-zinc-700" />

    {/* Z-Path overlay */}
    {/* Leg 1: Top-left to Top-right */}
    <line x1="198" y1="38" x2="484" y2="38" className="stroke-emerald-500" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.8" />
    {/* Leg 2: Top-right to Bottom-left (diagonal) */}
    <line x1="484" y1="38" x2="198" y2="270" className="stroke-emerald-500" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.8" />
    {/* Leg 3: Bottom-left to Bottom-right */}
    <line x1="198" y1="270" x2="440" y2="270" className="stroke-emerald-500" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.8" />

    {/* Z dots */}
    <circle cx="198" cy="38" r="5" className="fill-emerald-500" />
    <circle cx="484" cy="38" r="4" className="fill-emerald-500" />
    <circle cx="198" cy="270" r="4" className="fill-emerald-500" />
    <circle cx="440" cy="270" r="4" className="fill-emerald-500" />

    {/* Timing labels */}
    <text x="24" y="42" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">
      0–2s
    </text>
    <text x="24" y="54" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      Name &amp; title
    </text>

    <text x="24" y="160" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">
      2–4s
    </text>
    <text x="24" y="172" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      Left margin scan
    </text>

    <text x="24" y="274" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">
      4–6s
    </text>
    <text x="24" y="286" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      Bottom skills check
    </text>

    {/* Label */}
    <text x="340" y="345" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      You have 6 seconds. Make every zone count.
    </text>
  </svg>
</div>


{/* ============================================================
   ARTICLE 17: gap-explanation — Timeline with Labeled Gap
   Insert after 'The Power of Explicit Labelling' section.
   ============================================================ */}

{/* Visual: Two timelines — one with blank gap (bad), one with labeled gap (good) */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 680 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* === TOP TIMELINE: Bad (unlabeled gap) === */}
    <text x="20" y="24" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-red-400">
      ✗ Without explanation
    </text>

    {/* Timeline axis */}
    <line x1="20" y1="60" x2="660" y2="60" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

    {/* Job block 1 */}
    <rect x="20" y="40" width="150" height="40" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
    <text x="95" y="57" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">
      Frontend Dev
    </text>
    <text x="95" y="70" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      2019–2021
    </text>

    {/* Job block 2 */}
    <rect x="180" y="40" width="140" height="40" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
    <text x="250" y="57" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">
      Sr. Engineer
    </text>
    <text x="250" y="70" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      2021–2022
    </text>

    {/* GAP — empty, question mark */}
    <text x="390" y="57" textAnchor="middle" fontSize="16" fontFamily="system-ui, sans-serif" className="fill-red-400">?</text>
    <text x="390" y="72" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-red-400">
      9 months
    </text>

    {/* Job block 3 */}
    <rect x="460" y="40" width="190" height="40" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
    <text x="555" y="57" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">
      Staff Engineer
    </text>
    <text x="555" y="70" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      2023–Present
    </text>

    {/* === Divider === */}
    <line x1="20" y1="110" x2="660" y2="110" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

    {/* === BOTTOM TIMELINE: Good (labeled gap) === */}
    <text x="20" y="140" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-500">
      ✓ With explanation
    </text>

    {/* Timeline axis */}
    <line x1="20" y1="176" x2="660" y2="176" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

    {/* Job block 1 */}
    <rect x="20" y="156" width="150" height="40" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
    <text x="95" y="173" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">
      Frontend Dev
    </text>
    <text x="95" y="186" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      2019–2021
    </text>

    {/* Job block 2 */}
    <rect x="180" y="156" width="140" height="40" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
    <text x="250" y="173" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">
      Sr. Engineer
    </text>
    <text x="250" y="186" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      2021–2022
    </text>

    {/* GAP — labeled */}
    <rect x="330" y="156" width="120" height="40" rx="4" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-400 dark:stroke-emerald-700" strokeWidth="1" strokeDasharray="4 2" />
    <text x="390" y="171" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">
      Planned Sabbatical
    </text>
    <text x="390" y="183" textAnchor="middle" fontSize="8" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">
      Self-directed React
    </text>
    <text x="390" y="193" textAnchor="middle" fontSize="8" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">
      + AWS study
    </text>

    {/* Job block 3 */}
    <rect x="460" y="156" width="190" height="40" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
    <text x="555" y="173" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">
      Staff Engineer
    </text>
    <text x="555" y="186" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      2023–Present
    </text>

    {/* Takeaway */}
    <text x="340" y="250" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      A blank gap invites suspicion. A labeled gap earns respect.
    </text>
  </svg>
</div>


{/* ============================================================
   ARTICLE 18: academic-to-commercial — Translation Table
   Insert after 'Reframing the Laboratory as a Startup' section.
   ============================================================ */}

{/* Visual: Academic language translated to commercial equivalents with arrows */}
<div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
  <svg viewBox="0 0 680 310" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Column Headers */}
    <text x="140" y="26" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      Academic Language
    </text>
    <text x="540" y="26" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      Commercial Translation
    </text>

    {/* Row 1 */}
    <rect x="20" y="44" width="240" height="44" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
    <text x="140" y="71" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      Dissertation research
    </text>

    <line x1="260" y1="66" x2="400" y2="66" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="400,62 408,66 400,70" className="fill-zinc-400 dark:fill-zinc-500" />

    <rect x="410" y="44" width="252" height="44" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
    <text x="536" y="71" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      Multi-year product lifecycle
    </text>

    {/* Row 2 */}
    <rect x="20" y="100" width="240" height="44" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
    <text x="140" y="127" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      Secured grant funding
    </text>

    <line x1="260" y1="122" x2="400" y2="122" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="400,118 408,122 400,126" className="fill-zinc-400 dark:fill-zinc-500" />

    <rect x="410" y="100" width="252" height="44" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
    <text x="536" y="121" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      Pitched architecture
    </text>
    <text x="536" y="134" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      to stakeholders
    </text>

    {/* Row 3 */}
    <rect x="20" y="156" width="240" height="44" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
    <text x="140" y="176" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      Published in peer-
    </text>
    <text x="140" y="189" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      reviewed journal
    </text>

    <line x1="260" y1="178" x2="400" y2="178" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="400,174 408,178 400,182" className="fill-zinc-400 dark:fill-zinc-500" />

    <rect x="410" y="156" width="252" height="44" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
    <text x="536" y="176" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      Shipped technical
    </text>
    <text x="536" y="189" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      documentation
    </text>

    {/* Row 4 */}
    <rect x="20" y="212" width="240" height="44" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
    <text x="140" y="239" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      Managed lab resources
    </text>

    <line x1="260" y1="234" x2="400" y2="234" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
    <polygon points="400,230 408,234 400,238" className="fill-zinc-400 dark:fill-zinc-500" />

    <rect x="410" y="212" width="252" height="44" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
    <text x="536" y="232" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      Managed team budget
    </text>
    <text x="536" y="245" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
      and tooling
    </text>

    {/* Takeaway */}
    <text x="340" y="292" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
      Same work. Different framing. Entirely different perception.
    </text>
  </svg>
</div>
