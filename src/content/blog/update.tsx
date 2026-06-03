import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <h2 className={h2}>The 10:15 AM Panic</h2>
        <p>You submitted at 10 AM. At 10:15, you realize you wrote <span className={bold}>&quot;Javscript&quot;</span> instead of &quot;JavaScript&quot; in your skills section. With a PDF, your options are limited and awkward. You can do nothing and hope they do not notice, or send a correction email that looks even worse than the typo. This is a common stressor we address in <Link href="/attachments" className={link}>Why PDF attachments are a relic of the past</Link>.</p>
        <p>With a web profile, you open the editor, fix the typo, and save. The recruiter clicks your link at 2 PM and sees the corrected version. <span className={bold}>They never knew the typo existed.</span></p>

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

        <h2 className={h2}>Iterate Between Applications</h2>
        <p>Real-time updates let you do something PDFs never could: <span className={bold}>run experiments</span>. Submit your profile, see if you hear back. If not, <Link href="/tech-keywords" className={link}>tweak your visual hierarchy</Link> and reorder your projects. Apply to the next role with an improved version. There is only one version, and it is always your latest and best work.</p>

        <h2 className={h2}>Adapting to Industry Trends</h2>
        <p>The tech landscape moves fast. If a new framework becomes the "must-have" for your target roles, you can add your relevant experience to your profile tonight and every recruiter who has your link will see it tomorrow. You do not have to re-send files to everyone you have talked to this month. This is the <Link href="/link" className={link}>power of the modern professional URL</Link>.</p>

        <h2 className={h2}>The Mid-Interview Pivot</h2>
        <p>This advantage is most powerful during an active interview process. Phone screen on Monday where the interviewer mentions the team is migrating to <span className={bold}>Kubernetes</span>. You have Kubernetes experience but did not highlight it. Before Thursday&apos;s on-site, you add a Kubernetes section and reorder your projects.</p>
        <div className={callout}>
          <h3 className={h3}>The "Right Candidate" Effect</h3>
          <p>The panel reviews your link and sees a candidate who <span className={bold}>perfectly matches their current priorities</span>. It feels like fate to the hiring manager. It is actually just smart use of a live, editable profile. A PDF cannot do this. Once sent, it is frozen. <span className={bold}>A link is alive.</span></p>
        </div>

        <h2 className={h2}>Common Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>Does a refresh happen instantly?</h3>
            <p>Yes. As soon as you hit save in our editor, your live URL is updated globally. Any recruiter who reloads the page (or clicks your link for the first time) sees the new version.</p>
          </div>
          <div>
            <h3 className={h3}>Can I revert to an older version of my profile?</h3>
            <p>We are currently working on a version history feature. For now, we recommend doing a "Select All" and saving a copy of your current text before making major changes.</p>
          </div>
          <div>
            <h3 className={h3}>Is there a limit to how many changes I can make?</h3>
            <p>No. You can update your profile as often as you like. We encourage making small tweaks for different job applications to ensure you always have the best product-market fit.</p>
          </div>
        </div>

        <h2 className={h2}>Further Discovery</h2>
        <ul className={ul}>
          <li><Link href="/attachments" className={link}>Ditching PDFs and mastering the psychological advantage</Link></li>
          <li><Link href="/tech-keywords" className={link}>How to optimize your profile hierarchy for fast scans</Link></li>
        </ul>
      </div>
  );
}
