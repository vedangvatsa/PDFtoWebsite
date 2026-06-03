import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <h2 className={h2}>The Annoyance of Scrolling Sideways</h2>
        <p>Open any traditional PDF resume on your phone right now. You will immediately notice the text is too small to read. This is one major reason <Link href="/attachments" className={link}>why PDFs are losing to web profiles</Link>. To read one line, you pinch-zoom and then scroll right. For the next line, scroll down and back left. <span className={bold}>Every single line requires this tedious zigzag.</span></p>
        <p>This is called forced horizontal scrolling, and every usability study in the last twenty years classifies it as a <span className={bold}>critical interface failure</span>.</p>
        <div className={callout}>
          <h3 className={h3}>The math of the 6-second scan</h3>
          <p>The average recruiter spends <span className={bold}>6-8 seconds</span> on an initial resume scan. If two of those seconds are wasted navigating, you have lost a third of your window. They will not fight your formatting. They will close the file and open the next one.</p>
        </div>

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

        <h2 className={h2}>The Power of Font Legibility</h2>
        <p>On a mobile screen, font choice is not just about style. It is about physical readability. A web-based profile uses web fonts optimized for back-lit screens, not paper. The contrast is higher, the character spacing is wider, and the eye does not have to work as hard.</p>
        <p>This matters especially if you want to ensure your <Link href="/tech-keywords" className={link}>technical keywords actually get seen</Link> during a fast mobile scan.</p>
        <p>When a reader does not have to strain to understand your words, they focus on your achievements. Physical comfort in reading leads to higher retention of what you actually did.</p>

        <h2 className={h2}>Websites Fix This Automatically</h2>
        <p>A web-based profile solves this through responsive design:</p>
        <ul className={ul}>
          <li><span className={bold}>Two columns on desktop</span> collapse into one column on mobile</li>
          <li>Text sizes adjust to stay readable across different resolutions</li>
          <li>Interactive elements like buttons are sized for finger-taps, not mouse-clicks</li>
          <li>The reader just scrolls down, the most natural phone gesture</li>
        </ul>

        <h2 className={h2}>Interactivity and Detail</h2>
        <p>A non-responsive PDF is static. A web profile can have expandable sections. If a recruiter is interested in a specific project, they can click to see more details without cluttering the main page view. This allows you to provide high-level summaries and detailed exploration in the same document without overwhelming the reader.</p>

        <h2 className={h2}>Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>Does a responsive profile work on older phones?</h3>
            <p>Yes. Our templates use standard modern CSS that works on any smartphone from the last decade. If they have a browser, your resume will look perfect.</p>
          </div>
          <div>
            <h3 className={h3}>Will my multi-column layout look confusing on mobile?</h3>
            <p>No. On mobile, columns are intelligently stacked vertically. Your sidebars and skills move naturally below your main summary so the text remains wide and legible.</p>
          </div>
          <div>
            <h3 className={h3}>Can recruiters see the desktop version on their phone?</h3>
            <p>It is best that they don&apos;t. Forcing the desktop view on a phone creates the "pinch-zoom" problem we are trying to solve. The responsive layout is designed specifically for their context.</p>
          </div>
        </div>

        <h2 className={h2}>Recommended Guides</h2>
        <ul className={ul}>
          <li><Link href="/tech-keywords" className={link}>How visual hierarchy impacts recruiter scanning</Link></li>
          <li><Link href="/attachments" className={link}>Why email attachments are a security and UX risk</Link></li>
        </ul>
      </div>
  );
}
