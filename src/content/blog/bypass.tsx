import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <h2 className={h2}>How Parsers Destroy Your Resume</h2>
        <p>Systems like <span className={bold}>Taleo, Workday, Greenhouse, and Lever</span> all process resumes by ripping out every character of text and dropping it into a database. A recruiter then runs keyword searches against that database.</p>
        <p>The problem: the extraction engine reads text from top-left to bottom-right based on character coordinates. It does not understand columns. This is even worse if your <Link href="/pdf" className={link}>PDF contains complex layers</Link> that confuse the robot even more.</p>
        <div className={callout}>
          <h3 className={h3}>What actually happens</h3>
          <p>If your skills are on the left and job history on the right, the parser merges them line by line. Your profile becomes gibberish like <span className={bold}>&quot;Python Senior Engineer 2019&quot;</span> where your skill got smashed into your job title. A keyword search for &quot;Python&quot; will not match this mangled string.</p>
        </div>

        <h2 className={h2}>The Human Factor in the ATS</h2>
        <p>Even if the robot parses your text correctly, the human recruiter eventually has to read it. Most ATS interfaces show the parsed text in a very ugly, Courier-style plain text box. Your design is gone. Your hierarchy is gone. Your personality is gone.</p>
        <p>By providing a link, you provide a choice. You give the recruiter a chance to leave the ugly ATS interface and see the "real" you on your professional profile.</p>

        <h2 className={h2}>The Dual-Submission Fix</h2>
        <p>Submit two things:</p>
        <ol className={ol}>
          <li><span className={bold}>A plain, single-column text document</span> into the ATS upload. Zero columns, zero graphics, zero fancy fonts. Designed for the robot.</li>
          <li><span className={bold}>Your web profile URL</span> at the very top of that document, right below your name. Designed for the human.</li>
        </ol>

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

        <h2 className={h2}>Keyword Optimization for the Robot</h2>
        <p>In your plain text document, you can afford to be repetitive. You can include a "Skills Tag Cloud" at the bottom that lists every technology you have ever touched. The robot loves this. It ranks you higher for more searches. But you would never do this on your "real" resume because it looks desperate to a human. This dual-submission flow lets you be optimized for keywords and optimized for design simultaneously. This ensures your <Link href="/tech-keywords" className={link}>visual hierarchy actually works</Link> for the people who view your profile.</p>

        <h2 className={h2}>Common Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>Do ATS systems strip URLs from documents?</h3>
            <p>No. In fact, most modern ATS platforms auto-detect links and make them clickable for the recruiter in the dashboard view. It is often the only way they can see your real design.</p>
          </div>
          <div>
            <h3 className={h3}>Will a two-column PDF really fail that often?</h3>
            <p>Independent tests show that complex two-column layouts have a <span className={bold}>30-40% failure rate</span> in extracting contact info or job dates correctly. It is a massive risk to take.</p>
          </div>
          <div>
            <h3 className={h3}>Should I only provide a link and no file?</h3>
            <p>No. Most application portals require a file upload to continue. Use a plain text version for that upload and put your URL at the very top. This is the "Dual-Submission" gold standard.</p>
          </div>
        </div>

        <h2 className={h2}>Related Analysis</h2>
        <ul className={ul}>
          <li><Link href="/pdf" className={link}>Analysis: Why complex PDFs break recruiter algorithms</Link></li>
          <li><Link href="/tech-keywords" className={link}>Guide: Mapping visual hierarchy for technical recruiters</Link></li>
        </ul>
      </div>
  );
}
