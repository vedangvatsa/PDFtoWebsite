import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <h2 className={h2}>Files Look Different Everywhere</h2>
        <p>You spent hours getting the margins right in Google Docs, exported a clean PDF, and sent it off. The problem? The recruiter opened it on their phone during lunch.</p>
        <p>Your two-column layout is now a jumbled mess of overlapping text that requires pinching and zooming just to read your name. This is a common issue with <Link href="/mobile" className={link}>non-responsive resumes</Link>. They close it and move on.</p>
        <div className={callout}>
          <h3 className={h3}>The hard truth about PDF rendering</h3>
          <ul className={ul}>
            <li><span className={bold}>60%+ of initial screens</span> now happen on mobile devices</li>
            <li>A PDF is locked to 8.5×11 inches, which is terrible for a 6-inch phone</li>
            <li>Custom fonts can fail to embed, wrecking your spacing entirely</li>
            <li>Transparent overlays from Canva sometimes render as opaque blocks</li>
          </ul>
        </div>

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

        <h2 className={h2}>Security Rules Kill Attachments</h2>
        <p>Enterprise email systems at large companies <span className={bold}>strip PDFs from emails entirely</span> or quarantine them for 24 hours. By the time your resume clears, fifty other candidates who sent <Link href="/link" className={link}>clean profile links</Link> have already been reviewed.</p>
        <p>Even when it goes through, every attachment requires the recipient to download a file, which is a significant friction point. Modern hiring is about speed.</p>
        
        <h2 className={h2}>The Versioning Nightmare</h2>
        <p>When you send an attachment, you lose control of the content. If you find a better way to describe your current project or catch a minor error, that PDF in their inbox is now a historical relic. You cannot update it. This is why many candidates are <Link href="/update" className={link}>switching to live profiles</Link> where they can fix typos instantly.</p>
        <div className={callout}>
          <h3 className={h3}>The advantage of the living document</h3>
          <p>A web profile is always current. If a recruiter clicks your link three days after you sent it, they see your latest accomplishments. You can even tailor the content specifically for different phases of the interview process without ever sending a second file.</p>
        </div>

        <h2 className={h2}>Common Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>What if a job portal strictly requires a file upload?</h3>
            <p>If an ATS system absolutely mandates a document upload, we recommend submitting a simple, plain-text document and pasting your CVin.Bio URL prominently at the top. This guarantees the automated parser reads your keywords perfectly, while the human recruiter gets to click your link to view your beautifully formatted profile.</p>
          </div>
          <div>
            <h3 className={h3}>What if the recruiter does not have internet?</h3>
            <p>In modern corporate hiring, this is virtually impossible. Recruiters use cloud-based tools (ATS, LinkedIn, Slack) all day. If they cannot access your URL, they cannot access their job posting either.</p>
          </div>
          <div>
            <h3 className={h3}>Is a link less professional than a file?</h3>
            <p>Currently, it is perceived as more professional in the tech industry. It shows technical fluency and a focus on the recipient&apos;s user experience.</p>
          </div>
        </div>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/mobile" className={link}>Why mobile responsiveness is the new status quo</Link></li>
          <li><Link href="/link" className={link}>How clean URLs build your professional brand</Link></li>
        </ul>
      </div>
  );
}
