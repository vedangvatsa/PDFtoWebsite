import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <h2 className={h2}>Stop Burying Your Keywords</h2>
        <p>Most resumes bury critical information inside dense paragraphs. A recruiter looking for React experience has to read through three sentences about team size and timelines before finding &quot;React&quot; mentioned casually on line four. <span className={bold}>By that point, they have already left.</span> This is why many candidates <Link href="/inbox" className={link}>fail the initial scan</Link> entirely.</p>
        <div className={callout}>
          <h3 className={h3}>How recruiters actually scan</h3>
          <p>Eyes follow an <span className={bold}>F-shaped pattern</span>: read the top line, drop down the left edge, scan again. If your keywords are not in those zones, they literally do not register. This behavior is amplified when they are <Link href="/mobile" className={link}>scanning on a small phone screen</Link>.</p>
        </div>
        <p>The fix is simple:</p>
        <ul className={ul}>
          <li><span className={bold}>Pull keywords out of paragraphs</span> and into standalone positions</li>
          <li>Use clear headings like &quot;Stack&quot; instead of burying tools in sentences</li>
          <li>Front-load every bullet with the technology name first</li>
        </ul>

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

        <h2 className={h2}>Managing Cognitive Load</h2>
        <p>Every time a recruiter has to hunt for information, their cognitive load increases. When they get tired or frustrated, they default to "No." Your goal is to make the "Yes" decision as physically effortless as possible. This means perfect contrast, large enough fonts, and a layout that tells them exactly where to look next.</p>

        <h2 className={h2}>White Space Is a Feature</h2>
        <p>When every inch of your resume is packed with text, <span className={bold}>nothing stands out</span>. Everything blurs into a single grey block. Adding generous margins around headings and breathing room between bullets makes each piece of information distinct and scannable.</p>
        <p>A web-based profile enforces this naturally because the template handles spacing, fonts, and hierarchy for you. You do not have to fight the urge to "fill the page." This is a core benefit of <Link href="/attachments" className={link}>ditching the restricted A4/Letter format</Link>.</p>

        <h2 className={h2}>Visual Anchors and Scanning Signals</h2>
        <p>Use visual anchors like bold text for job titles and skill names. These act as "scanning signals" that help the recruiter jump from one relevant point to the next. If they can see "Senior Dev," "Node.js," and "AWS" in under two seconds, they will commit to reading the rest of the page.</p>

        <h2 className={h2}>Common Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>Should I bold every technology name?</h3>
            <p>Be strategic. If you bold everything, nothing is bold. Bold only the core technologies that define your role to help the eye land on the most important points first.</p>
          </div>
          <div>
            <h3 className={h3}>Is a one-page limit still relevant for web profiles?</h3>
            <p>No. On the web, people are used to scrolling. Vertical space is free. Focus on clear hierarchy rather than cramming everything into a specific physical height.</p>
          </div>
          <div>
            <h3 className={h3}>What is the ideal font size for a resume?</h3>
            <p>For web profiles, we recommend 16px to 18px for body text. This ensures accessibility and makes the text "jump" off the screen during a fast scan.</p>
          </div>
        </div>

        <h2 className={h2}>Recommended Guides</h2>
        <ul className={ul}>
          <li><Link href="/mobile" className={link}>Designing for the tiny screen: Mobile responsiveness guide</Link></li>
          <li><Link href="/inbox" className={link}>Standing out in the inbox: Using preview cards and URLs</Link></li>
        </ul>
      </div>
  );
}
