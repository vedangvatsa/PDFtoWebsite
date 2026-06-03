import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <h2 className={h2}>Fonts Turning Into Pictures</h2>
        <p>Canva, Figma, and many online templates handle custom fonts by converting them into <span className={bold}>vector outlines</span> instead of embedding font data. Visually identical. But underneath, the text is now a collection of shapes. This is one of the biggest reasons why <Link href="/bypass" className={link}>dual-submission strategies</Link> are now required for technical roles.</p>
        <p>When an ATS encounters these shapes, it runs OCR to convert them back into text. The result:</p>
        <div className={callout}>
          <p><span className={bold}>What you wrote:</span> &quot;5 years of experience with React and TypeScript&quot;</p>
          <p className="mt-2"><span className={bold}>What the ATS reads:</span> &quot;5years ofexperience wxth Reac7 and TypeScripl&quot;</p>
        </div>
        <p><span className={bold}>Test this yourself:</span> open your PDF, select all text, copy it, and paste into Notepad. If it is garbled, that is exactly what the ATS sees.</p>

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
            <text x="171" y="222" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Clean &amp; parseable</text>

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

        <h2 className={h2}>The Data Integrity Gap</h2>
        <p>Recruiters rely on automated filters. If the ATS reads your "2023" as "2O23" (using the letter O instead of the number zero), you might be filtered out of a search for candidates with recent experience. Subtle glitches in OCR create massive gaps in your data integrity. Web profiles provide the raw text, ensuring 100% accuracy for every tool that reads them. This accuracy is vital for your <Link href="/tech-keywords" className={link}>visual hierarchy to remain effective</Link>.</p>

        <h2 className={h2}>Messy Background Layers</h2>
        <p>Designed resumes use background colors and sidebars as separate layers. The parser does not understand layers. It reads characters in coordinate order regardless of which visual layer they belong to. This is another reason <Link href="/attachments" className={link}>static PDFs are increasingly unreliable</Link>.</p>
        <p>A sidebar heading &quot;Experience&quot; next to a job title &quot;Senior Software Engineer&quot; can become:</p>
        <div className={callout}>
          <p className="font-mono text-sm">&quot;ExSenior Software Engineerperience&quot;</p>
          <p className="text-sm mt-2 text-zinc-500 dark:text-zinc-400">Characters merged based on vertical position, not visual grouping.</p>
        </div>

        <h2 className={h2}>Semantic Tags for the Win</h2>
        <p>Web profiles use semantic HTML tags. This tells the reader (and the machine) exactly what is what. An h1 tag is always a title. A li tag is always a list item. This eliminates the "coordinate guessing game" that PDF parsers have to play. It is the difference between reading a recipe and trying to guess one from a picture of a meal.</p>

        <h2 className={h2}>Common Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>Do big tech companies use OCR on resumes?</h3>
            <p>Almost all of them do. They handle thousands of applications per day, and manual data entry is impossible. If their machine cannot read your file, you are essentially invisible.</p>
          </div>
          <div>
            <h3 className={h3}>Is an exported Word document better than a Canva PDF?</h3>
            <p>Usually, yes, because Word tends to preserve text layers better. However, it still lacks the screen-responsiveness and brand-authority of a custom web profile.</p>
          </div>
          <div>
            <h3 className={h3}>How can I check if my current PDF is machine-readable?</h3>
            <p>Try to copy a paragraph and paste it into a plain text editor. If the words are joined together or letters are replaced with symbols, it is failing the machine test.</p>
          </div>
        </div>

        <h2 className={h2}>Further Reading</h2>
        <ul className={ul}>
          <li><Link href="/bypass" className={link}>The guide to bypassing ATS formatting destruction</Link></li>
          <li><Link href="/mobile" className={link}>Why your resume must be mobile-responsive in 2026</Link></li>
        </ul>
      </div>
  );
}
