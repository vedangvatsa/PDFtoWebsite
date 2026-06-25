import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>The corporate obsession with elite university credentials is collapsing across the technology sector. A decade ago, not having a CS degree from a top school would disqualify you before a human ever saw your resume. Today, the biggest tech companies have removed the degree requirement from their job descriptions entirely.</p>
        <p>This shift happened because engineering managers realized that four years of theoretical coursework has almost no correlation with the ability to ship working software under pressure. The industry has moved toward skills-based hiring. Nobody cares where you sat for four years. They care what you built.</p>
        
        <h2 className={h2}>Flipping the Traditional Hierarchy</h2>
        <p>If you do not have a well-known degree, restructure your profile hierarchy. The classic template puts education at the top. Ignore that rule. Put your commercial project wins and technical deployments at the top where the eye lands first.</p>
        <p>Push your education section to the bottom of the page. Treat it like a footnote. When a recruiter sees the platforms you built in the first ten seconds of reading, they will not care where you went to school.</p>

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

        
        <div className={callout}>
          <h3 className={h3}>The Autodidact Advantage</h3>
          <p>Do not apologize for being self-taught. In this market, the ability to teach yourself new frameworks quickly is one of the most valuable skills you can have. Highlighting that you taught yourself full-stack development while working a retail job proves real grit and discipline.</p>
        </div>

        <h2 className={h2}>Bootcamps are Tools Not Diplomas</h2>
        <p>If you used a coding bootcamp to transition into the industry, treat it appropriately. A twelve-week camp is a great acceleration tool, but it is not a replacement for a university degree and you should not format it like one. List the technical curriculum you covered, but follow it immediately with the applications you built on your own outside of guided tutorials.</p>
        <p>Hiring managers want to see that you can build things independently. Prove that you can ship code without an instructor walking you through every step.</p>
      </div>
  );
}
