import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        An engineer applies for two different developer roles on the same afternoon. One company uses Workday for its application portal. The other company uses Greenhouse. The engineer uploads the exact same PDF document to both websites. Workday immediately parses the file into a garbled mess of form fields, listing their university degree as their last job and their name as their email address. Greenhouse reads the file cleanly but strips away the custom layout, replacing it with a plain text summary for the recruiter.
      </p>

      <p>
        This experience is common because applicant tracking systems do not process files the same way. Candidates treat all application portals as identical upload boxes. In reality, each platform has its own parser engine and display rules. If you do not adapt your profile to these differences, you risk being filtered out before a human recruiter ever sees your work.
      </p>

      <p>
        This guide will explain how to handle the major tracking platforms. We will cover systems like Workday, Greenhouse, Lever, and Taleo. We will also discuss modern startup systems like Ashby and Jobvite. We will show you the exact strategies you need to use to keep your formatting clean on each system.
      </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="A diagram demonstrating how different applicant tracking systems process and display CV files.">
          <rect x="0" y="0" width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-950" />
          <text x="350" y="30" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100 font-bold text-sm">Tracking Platform Processing Styles</text>
          
          {/* File Input */}
          <rect x="30" y="130" width="130" height="90" rx="6" className="fill-white dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="95" y="170" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-xs">Profile Upload</text>
          <text x="95" y="190" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">PDF or Web Link</text>

          {/* Connectors */}
          <path d="M 160 175 L 230 100" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="1.5" fill="none" />
          <path d="M 160 175 L 230 175" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="1.5" fill="none" />
          <path d="M 160 175 L 230 250" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="1.5" fill="none" />

          {/* Workday */}
          <rect x="250" y="60" width="160" height="70" rx="6" className="fill-white dark:fill-zinc-900 stroke-red-200 dark:stroke-red-900" strokeWidth="1" />
          <text x="330" y="90" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-200 font-bold text-xs">Workday Parser</text>
          <text x="330" y="108" textAnchor="middle" className="fill-red-500 dark:fill-red-400 text-[9px]">Struggles with layout, forces manual input</text>

          {/* Greenhouse */}
          <rect x="250" y="140" width="160" height="70" rx="6" className="fill-white dark:fill-zinc-900 stroke-emerald-200 dark:stroke-emerald-900" strokeWidth="1" />
          <text x="330" y="170" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-200 font-bold text-xs">Greenhouse Viewer</text>
          <text x="330" y="188" textAnchor="middle" className="fill-emerald-500 dark:fill-emerald-400 text-[9px]">Preserves original document context</text>

          {/* Lever */}
          <rect x="250" y="220" width="160" height="70" rx="6" className="fill-white dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1" />
          <text x="330" y="250" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-200 font-bold text-xs">Lever Indexer</text>
          <text x="330" y="268" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Scrapes links and social coding details</text>

          {/* Final Outputs */}
          <path d="M 410 95 L 490 145" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="1.5" fill="none" />
          <path d="M 410 175 L 490 175" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="1.5" fill="none" />
          <path d="M 410 255 L 490 205" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="1.5" fill="none" />

          {/* Recruiter Interface */}
          <rect x="510" y="130" width="160" height="90" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="1.5" />
          <text x="590" y="170" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-50 font-bold text-xs">Recruiter View</text>
          <text x="590" y="190" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Unified candidate evaluation card</text>
        </svg>
      </div>

      <h2 className={h2}>The Enterprise Giant Workday Strategy</h2>
      <p>
        Workday is the most common system used by large enterprises. It is also the most frustrating for candidates. The system uses an older parsing model that decomposes files into database fields. If your document has any layout complexity, the parser will fail.
      </p>

      <p>
        When you apply through a Workday portal, you are often forced to review the parsed text in a multi-step form. If the form is full of errors, you must spend time correcting them. To avoid this, you should submit a document with the simplest possible structure.
      </p>

      <p>
        Use a single column layout with standard headings. Avoid using side bars or headers that span multiple columns. Do not use icons or decorative elements near your job titles. Keep the text format strictly linear to prevent the parser from mixing your dates with your descriptions.
      </p>

      <p>
        You can also bypass this problem by using a web profile link. A structured web link allows you to present a clean layout directly to recruiters while providing clean data to the system. This saves you from manually correcting dozens of fields on every application.
      </p>

      <h2 className={h2}>The Modern Challenger Greenhouse Strategy</h2>
      <p>
        Greenhouse is highly popular among modern technology startups and mid-size companies. The platform is designed to be candidate-friendly. It does not force you to retype your work history into endless form fields.
      </p>

      <p>
        Greenhouse displays your uploaded document directly to the hiring team in a split-screen viewer. This means the visual design of your profile matters. If your document looks cluttered, the hiring manager will notice immediately.
      </p>

      <p>
        However, Greenhouse still indexes the text for keywords. To pass the initial screening, you must ensure your technical keywords are easy to parse. Place your core technologies in a clean section near the top of the page.
      </p>

      <p>
        Ensure your links are active and clickable. Greenhouse allows reviewers to click links directly from the document viewer. This is a great opportunity to direct them to your live projects or code repositories.
      </p>

      <div className={callout}>
        <h3 className={h3}>Verify link parameters</h3>
        <p>
          Make sure your links use the secure HTTPS protocol. Test them in a private browser window to confirm they load without permissions issues.
        </p>
      </div>

      <h2 className={h2}>The Collaborative Platform Lever Strategy</h2>
      <p>
        Lever is another modern platform that focuses on collaboration. It is designed to help recruiting teams share candidates and discuss qualifications.
      </p>

      <p>
        Lever automatically extracts social links from your profile. If you include links to your GitHub or LinkedIn, Lever will pull these profiles into a unified view. This allows recruiters to see your code contributions beside your application.
      </p>

      <p>
        To make the most of Lever, keep your profiles up to date. Ensure your GitHub readme is clean and showcases your best work. If you link to a portfolio, ensure it loads quickly on mobile screens.
      </p>

      <p>
        Lever also tracks candidate sources. If you apply with a direct referral link, your profile is flagged for fast review. You should always try to find an internal contact before submitting your application.
      </p>

      <h2 className={h2}>The Fast Growing Startup Platforms Ashby and Jobvite</h2>
      <p>
        Ashby has rapidly become the favorite tracking system for fast-growing technology companies. It features a highly advanced parser that rarely makes errors when scraping text. Ashby focuses on speed and gives recruiters powerful filters to sort candidates by specific technical achievements.
      </p>

      <p>
        Because Ashby users are usually scaling quickly, they filter profiles aggressively. They build custom pipelines that look for specific database or system optimization experience. Your profile must highlight these achievements clearly in your project details.
      </p>

      <p>
        Jobvite is another popular system that focuses on social referrals. It matches candidates based on their shared connections. To succeed in a Jobvite system, you should highlight your collaborative work and group projects.
      </p>

      <p>
        Both platforms favor clear formatting and direct writing. Avoid using complex graphics or progress bars. Stick to text-based achievements that prove your engineering capability.
      </p>

      <h2 className={h2}>The Legacy Enterprise Taleo Strategy</h2>
      <p>
        Taleo is one of the oldest tracking systems in the industry. It is used by massive corporations and government contractors. It relies heavily on exact keyword matching.
      </p>

      <p>
        Taleo struggles with modern document formats. It often rejects files that use custom fonts or styling. To survive a Taleo scan, you must use a standard font like Arial or Calibri.
      </p>

      <p>
        Ensure your job titles match the standard industry terms. If the job description is for a Senior Software Engineer, write Senior Software Engineer as your title if it matches your past work. Avoid using custom titles like Full Stack Wizard or backend guru.
      </p>

      <p>
        List your skills in a clear list at the end of the document. This gives the keyword indexer a clean set of terms to process. It prevents your technical skills from being lost in your descriptions.
      </p>

      <h2 className={h2}>The Unified Approach for All Tracking Systems</h2>
      <p>
        Instead of managing different versions of your files, you should adopt a unified strategy. Focus on creating a clean, single column profile that meets the standards of all parsers.
      </p>

      <p>
        Use standard headings like Work History, Skills, and Education. Do not use creative titles like Where I Have Worked or Tech Stack. The parser engine looks for standard terms to organize your profile data.
      </p>

      <p>
        Provide your work history in reverse chronological order. Start with your current role and work backward. This structure is universally understood by both machines and recruiters.
      </p>

      <p>
        Using a web profile link is the best way to maintain visual control. You can share your link in the website field of the application portal. This ensures the recruiter can view your profile exactly as you designed it, regardless of the system they use.
      </p>

      <p>
        To learn more about how tracking systems process your document, read our guide on how to <Link href="/screening" className={link}>get past AI screening</Link>. If you want to know why complex designs fail, check out our analysis of <Link href="/pdf" className={link}>why complex PDFs break algorithms</Link> in modern recruitment. If you want to use a dual submission approach, read about <Link href="/bypass" className={link}>formatting destruction and dual submissions</Link> to secure your layout.
      </p>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/screening" className={link}>Best Ways to Get Past AI CV Screening</Link></li>
        <li><Link href="/pdf" className={link}>Why Complex PDFs Break Recruiter Algorithms</Link></li>
        <li><Link href="/bypass" className={link}>Bypassing Formatting Destruction with Dual-Submissions</Link></li>
      </ul>
    </div>
  );
}
