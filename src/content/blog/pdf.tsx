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
            <text x="509" y="100" textAnchor="middle" fontSize="13" fontFamily="ui-monospace, monospace" className="fill-red-500 dark:fill-red-400">5years ofexperience</text>
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
        <p>Recruiters rely on automated filters. If the ATS reads your "2023" as "2O23" (using the letter O instead of the number zero), you might be filtered out of a search for candidates with recent experience. Subtle glitches in OCR create massive gaps in your data integrity. Web profiles provide the raw text, ensuring 100% accuracy for every tool that reads them. This accuracy is important for your <Link href="/tech-keywords" className={link}>visual hierarchy to remain effective</Link>.</p>

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
            <p>Almost all of them do. They handle thousands of applications per day, and manual data entry is impossible. If their machine cannot read your file, you are basically invisible.</p>
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

        <h2 className={h2}>PDF Export Settings That Still Fail</h2>
        <p>Even careful exporters get tripped by print oriented settings. Exporting for print embeds fonts as vectors. Exporting with compression flattens layers. Password protection blocks parsers entirely. Some ATS vendors strip metadata and garble unicode accents in names. A candidate named José becomes Jose or a random symbol pair.</p>
        <p>If you must ship a PDF, export from Google Docs or Word with standard fonts, single column, no text boxes, no headers and footers duplicated in body. Run the copy paste test on every new version before you upload.</p>

        <h2 className={h2}>Scanned PDFs Are the Worst Case</h2>
        <p>Printing your resume and scanning it back creates a pure image file. OCR quality drops sharply. Handwritten notes in margins become noise. Staple holes become black blobs. Yet candidates still do this when a portal asks for PDF and they only have a paper copy from a career fair. Digital native hiring expects digital native documents.</p>
        <div className={callout}>
          <h3 className={h3}>The recruiter side of the pipeline</h3>
          <p>After parsing, recruiters search inside the ATS for strings like &quot;Kubernetes&quot; or &quot;staff engineer.&quot; If OCR mangled those strings, you fail search even when a human would understand the PDF visually. <span className={bold}>Machine readability is gate one.</span> Human readability is gate two.</p>
        </div>

        <h2 className={h2}>Column Layouts Destroy Chronology</h2>
        <p>Two column PDFs are the default design on template sites. They look sharp on a monitor. Parsers read left to right across the full page width. Your left column dates mash into right column job titles. The stored record might show your 2019 internship dates next to your 2024 senior role. Automated filters then think you have fifteen years of experience or duplicate entries.</p>
        <p>Single column layouts feel boring. They parse correctly. That tradeoff matters more than aesthetics when your application competes with four hundred others in the same ATS queue.</p>

        <h2 className={h2}>Icons and Graphics Become Noise</h2>
        <p>Phone icons, envelope icons, and skill stars look clean in Figma. To a parser they are empty squares or random unicode. Some systems strip them. Others insert placeholder characters that break keyword matching. Plain text contact lines survive every pipeline: email, phone, city, URL.</p>
        <div className={callout}>
          <h3 className={h3}>The copy paste audit</h3>
          <p>Before you upload any PDF, copy all text and paste into Notepad. If line breaks look wrong or words merge, assume the ATS sees the same mess. <span className={bold}>Fix the source file or switch to a web profile.</span></p>
        </div>

        <h2 className={h2}>Hidden Text Triggers Fraud Flags</h2>
        <p>Old advice told candidates to stuff white keywords in margins. Modern parsers detect color mismatches and font size anomalies. Fraud scores rise. Recruiters get automatic warnings. You are worse off than if you had sent an honest plain document.</p>
        <p>Put keywords in visible bullets where they belong. If you used Kubernetes, say what you did with it. Authentic density beats invisible tricks.</p>

        <h2 className={h2}>Why Web Profiles Win the Parser Game</h2>
        <p>HTML gives every element a type. Headings, lists, links, dates in structured fields. No coordinate guessing. No OCR. When a recruiter shares your CVin.Bio link internally, the data stays intact. When they forward a PDF, each copy might parse differently depending on the reader software.</p>
        <p>Upload your CV once to generate the structured profile. Keep a minimal PDF for forms that demand uploads. Lead humans to the URL every time. Read <Link href="/test-ats" className={link}>how to test ATS parsing</Link> on any file you still send.</p>

        <h2 className={h2}>Vendor Differences Matter Less Than You Think</h2>
        <p>Workday, Greenhouse, Lever, and Taleo all parse differently, but they share the same failure modes: columns, graphics, and OCR. A plain single column document survives most of them. A designed Canva export fails most of them. Do not tune for one vendor. Tune for plain structure.</p>
        <p>When a portal lets you paste a URL, paste it. The human reviewer often has more authority than the parser score. Give them something readable while the parser chews on your plain upload.</p>

        <h2 className={h2}>Building a Parser Safe PDF Backup</h2>
        <p>Keep a boring PDF in your downloads folder for portals that demand uploads. Same text as your web profile, zero design flourishes. Update it whenever you update your live page so both stay aligned. Name the file with your name and role, not resume_final_v7.pdf.</p>
        <p>Run the copy paste test after every edit. If the boring PDF fails, fix text in the source profile and export again. The web profile remains your primary artifact. The PDF is a compatibility shim.</p>

        <h2 className={h2}>When Humans Never See Your PDF</h2>
        <p>Some pipelines auto reject below a parser confidence score. You never get a human. Garbled PDFs die there. If you suspect auto rejection, simplify the file radically and reapply where allowed, or route outreach to humans with your web link through email and referrals.</p>
        <p>Parser failure is silent. Response silence after perfect qualifications often traces back to formatting, not fit.</p>

        <h2 className={h2}>PDF metadata recruiters rarely see but parsers use</h2>
        <p>Some ATS tools read PDF title and author fields. Set title to Your Name - Software Engineer Resume and author to your email. Empty metadata is not fatal. Correct metadata is one more signal that you treat the application seriously. Export from the same source as your web profile so title, dates, and bullets stay aligned.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/attachments" className={link}>Why recruiters skip unreadable attachments</Link></li>
          <li><Link href="/parsers" className={link}>How resume parsing APIs actually work</Link></li>
        </ul>

        <p>Your hiring document strategy for 2026 should be simple. Web profile first, plain PDF second, designed PDF never. Recruiters who care about design will visit your link. Bots that care about structure will parse your plain backup. Nobody needs a gradient sidebar that breaks both channels.</p>
        <p>Spend design energy on project pages and case studies linked from your profile. Let the resume layer stay boring and legible. Boring wins parsers. Case studies win humans.</p>
        <p>When someone asks for your resume, send the link. When a portal demands a file, send the plain export. When someone compliments your Canva layout, redirect them to the project that actually proves you can build.</p>
        <p>Plain structure is a feature, not a failure of creativity. Recruiters reward clarity over decoration every time they open a candidate file.</p>
      </div>
  );
}
