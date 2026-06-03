import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>One of the most destructive and enduring pieces of career advice ever created is the absolute strict mandate that your professional history must perfectly fit onto a single physical piece of paper. This rule was invented forty years ago when human resources departments literally stored applicant sheets in giant steel filing cabinets and extra paper cost physical money. Applying this ancient physical constraint to modern digital rendering is complete strategic insanity.</p>
        <p>When professionals with seven years of deep technical experience blindly obey the single page rule they inevitably completely destroy their own formatting. They aggressively shrink their fonts to microscopically unreadable levels and completely delete their margins creating an overwhelming wall of dense black text. When a recruiter opens a dense claustrophobic document their brain instantly fatigues and they instinctively close the tab.</p>
        
        <h2 className={h2}>The Infinite Digital Scroll</h2>
        <p>The entire framework of pagination is utterly meaningless in the era of web links and digital profiles. A hiring manager using a modern high resolution display or a mobile phone does not experience your history as discrete physical pages. They experience it as a continuous vertical scroll. If your content is genuinely compelling and beautifully formatted they will happily flick their thumb and scroll for as long as it takes to ingest your value.</p>
        <p>You must completely stop treating white space as your enemy. Blank space is a premium luxurious design tool that forces the readers eye to naturally pause and absorb your most critical achievements. If adding proper margins and spacing forces your digital summary to extend to what would traditionally be considered a second page you should celebrate the increased readability.</p>

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

        
        <div className={callout}>
          <h3 className={h3}>The Seniority Threshold</h3>
          <p>The single page rule only applies if you possess fewer than three years of professional experience. If you are entirely new to the industry stretching your background across two pages clearly signals that you are aggressively padding your history with irrelevant fluff. However the moment you cross the threshold into mid level architecture a heavily truncated one page profile signals that you failed to achieve anything complex enough to warrant detailed explanation.</p>
        </div>

        <h2 className={h2}>Ruthless Pruning is Still Required</h2>
        <p>Expanding your digital footprint does not give you permission to hoard ancient irrelevant data. You must still aggressively delete the bizarre side jobs you held a decade ago that possess absolutely zero intersection with the role you want today. Giving yourself permission to use more vertical space simply means you are dedicating that premium space entirely to fully unpacking the technical complexity of your three most recent and massive career victories.</p>
        <p>Treat your expanded real estate with immense respect. Every extra line you take must mathematically justify its existence by delivering a highly specific quantifiable business outcome.</p>
      </div>
  );
}
