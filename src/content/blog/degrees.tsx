import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>The traditional corporate obsession with elite university credentials is rapidly collapsing across the entire technology sector. A decade ago failing to possess a computer science degree from a prestigious engineering institution would instantly disqualify you from passing the initial automated resume screen. Today the most powerful technology companies on the planet have formally and publicly ripped the college degree requirement out of their job descriptions.</p>
        <p>This massive structural shift occurred because engineering managers finally realized that surviving four years of theoretical mathematics in a classroom has almost zero correlation with the ability to ship a functioning web application under immense pressure. The industry has aggressively pivoted toward pure skills based hiring. We no longer care where you sat for four years. We only care what you built yesterday.</p>
        
        <h2 className={h2}>Flipping the Traditional Hierarchy</h2>
        <p>If you lack a famous degree you must completely restructure the visual hierarchy of your specific profile. The classic template demands you put your education at the very absolute top of the page. You must completely ignore this obsolete rule. You need to aggressively force your massive commercial project wins and detailed technical deployments to the very top margin where the eye naturally lands.</p>
        <p>Bury your formal education section at the absolute furthest bottom corner of the digital page. Treat it exactly like a minor administrative footnote. When a recruiter is instantly blown away by the massive enterprise platforms you architected in the first ten seconds of reading they will entirely forget to even check if you actually went to college.</p>

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
          <p>Never operate from a posture of shame regarding your self taught background. In the hyper accelerated modern technology market the ability to aggressively teach yourself complex new frameworks over the weekend is the single most valuable skill a human can possess. Explicitly highlighting that you taught yourself full stack development while working a chaotic retail job proves you possess terrifying levels of grit and discipline.</p>
        </div>

        <h2 className={h2}>Bootcamps are Tools Not Diplomas</h2>
        <p>If you used an accelerated coding bootcamp to transition into the industry you must treat it appropriately. A twelve week camp is a phenomenal acceleration tool but it is absolutely not a replacement for a university degree and you should not format it like one. List the dense technical curriculum you survived but immediately follow it with the standalone applications you built outside of their guided tutorials.</p>
        <p>Hiring managers want to see that you have completely broken away from the scripted safety of the bootcamp environment. Prove that you can fly solo without a famous instructor holding your hand.</p>
      </div>
  );
}
