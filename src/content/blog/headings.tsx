import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="flex flex-col gap-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>A software engineer spends three nights polishing their CV layout. They change their work history header to a creative title like My Professional Journey. They upload the document to a portal and the system categorizes all their employment dates under hobbies.</p>
      
      <p>This situation happens because section classifiers use strict dictionaries to parse your files. If the classifier does not recognize a heading it ignores all the text that follows. You must use standard labels to avoid this failure.</p>

      <p>Creative headings might look interesting to a human recruiter. However the machine reads the document first. If the machine cannot categorize your content your profile will not reach the hiring team.</p>

      <h2 className={h2}>How Section Classifiers Read Your CV</h2>
      <p>When you upload a file the extraction tool converts your layout into a single stream of text. The system then scans this stream for specific keywords to identify section boundaries. These keywords are called anchors.</p>

      <p>An anchor is a standard word like Experience or Education. Once the classifier finds an anchor it assigns all subsequent lines to that category. It continues this assignment until it finds another known anchor.</p>

      <p>If you use a non standard anchor the system fails to split the text. It might group your work history and your technical skills into a single massive block. This destroys the searchability of your qualifications.</p>

      <div className={callout}>
        <h3 className={h3}>Keep Headings Simple</h3>
        <p>Avoid adding icons or symbols next to your section titles. Parsers read icons as unknown unicode characters. A simple text title is the safest choice for every system.</p>
      </div>

      <h2 className={h2}>Standard Terms vs Creative Labels</h2>
      <p>Some designers recommend using unique section titles to stand out. They suggest terms like Technical Expertise instead of Skills or Career Milestones instead of Work History. This advice is dangerous for applicants.</p>

      <p>Most enterprise database software relies on a strict dictionary of allowed headings. If a heading does not match a dictionary term the system flags it as miscellaneous text. Recruiters rarely search the miscellaneous text fields.</p>

      <p>Stick to standard names for every major section of your document. Use Experience for your employment history. Use Education for your academic degrees and Skills for your programming languages.</p>

      {/* SVG: Standard vs. creative headings — ATS recognition table */}
      <div className="not-prose my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 400" className="w-full h-auto" role="img" aria-label="Reference table comparing standard resume section headings that ATS systems recognize versus creative headings that fail to parse">
          <style>{`
            .hd-title { font: 600 13px system-ui, sans-serif; }
            .hd-label { font: 500 11px system-ui, sans-serif; }
            .hd-small { font: 400 10px system-ui, sans-serif; }
            .hd-badge { font: 700 8px system-ui, sans-serif; letter-spacing: 0.05em; }
          `}</style>

          {/* Left: Standard headings that work */}
          <text x="170" y="22" textAnchor="middle" className="hd-title fill-emerald-600 dark:fill-emerald-400">✓ Standard Headings (ATS Safe)</text>

          <rect x="20" y="38" width="310" height="340" rx="8" className="fill-emerald-50/30 dark:fill-emerald-950/10 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1.5" />

          {/* Standard heading entries */}
          <rect x="35" y="52" width="280" height="36" rx="4" className="fill-white dark:fill-zinc-900 stroke-emerald-200 dark:stroke-emerald-700" strokeWidth="1" />
          <text x="50" y="74" className="hd-label fill-zinc-900 dark:fill-zinc-100" fontWeight="700">Work Experience</text>
          <text x="270" y="74" className="hd-badge fill-emerald-600 dark:fill-emerald-400">✓ PARSED</text>

          <rect x="35" y="96" width="280" height="36" rx="4" className="fill-white dark:fill-zinc-900 stroke-emerald-200 dark:stroke-emerald-700" strokeWidth="1" />
          <text x="50" y="118" className="hd-label fill-zinc-900 dark:fill-zinc-100" fontWeight="700">Technical Skills</text>
          <text x="270" y="118" className="hd-badge fill-emerald-600 dark:fill-emerald-400">✓ PARSED</text>

          <rect x="35" y="140" width="280" height="36" rx="4" className="fill-white dark:fill-zinc-900 stroke-emerald-200 dark:stroke-emerald-700" strokeWidth="1" />
          <text x="50" y="162" className="hd-label fill-zinc-900 dark:fill-zinc-100" fontWeight="700">Education</text>
          <text x="270" y="162" className="hd-badge fill-emerald-600 dark:fill-emerald-400">✓ PARSED</text>

          <rect x="35" y="184" width="280" height="36" rx="4" className="fill-white dark:fill-zinc-900 stroke-emerald-200 dark:stroke-emerald-700" strokeWidth="1" />
          <text x="50" y="206" className="hd-label fill-zinc-900 dark:fill-zinc-100" fontWeight="700">Projects</text>
          <text x="270" y="206" className="hd-badge fill-emerald-600 dark:fill-emerald-400">✓ PARSED</text>

          <rect x="35" y="228" width="280" height="36" rx="4" className="fill-white dark:fill-zinc-900 stroke-emerald-200 dark:stroke-emerald-700" strokeWidth="1" />
          <text x="50" y="250" className="hd-label fill-zinc-900 dark:fill-zinc-100" fontWeight="700">Certifications</text>
          <text x="270" y="250" className="hd-badge fill-emerald-600 dark:fill-emerald-400">✓ PARSED</text>

          <rect x="35" y="272" width="280" height="36" rx="4" className="fill-white dark:fill-zinc-900 stroke-emerald-200 dark:stroke-emerald-700" strokeWidth="1" />
          <text x="50" y="294" className="hd-label fill-zinc-900 dark:fill-zinc-100" fontWeight="700">Summary</text>
          <text x="270" y="294" className="hd-badge fill-emerald-600 dark:fill-emerald-400">✓ PARSED</text>

          <text x="175" y="332" textAnchor="middle" className="hd-small fill-emerald-600 dark:fill-emerald-400">Parser maps data to the correct</text>
          <text x="175" y="346" textAnchor="middle" className="hd-small fill-emerald-600 dark:fill-emerald-400">searchable fields in the database</text>
          <text x="175" y="368" textAnchor="middle" className="hd-badge fill-emerald-700 dark:fill-emerald-400">RESULT: PROFILE IS SEARCHABLE</text>

          {/* Right: Creative headings that fail */}
          <text x="530" y="22" textAnchor="middle" className="hd-title fill-red-500 dark:fill-red-400">✗ Creative Headings (ATS Fails)</text>

          <rect x="370" y="38" width="310" height="340" rx="8" className="fill-red-50/30 dark:fill-red-950/10 stroke-red-200 dark:stroke-red-800" strokeWidth="1.5" />

          {/* Creative heading entries */}
          <rect x="385" y="52" width="280" height="36" rx="4" className="fill-white dark:fill-zinc-900 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
          <text x="400" y="74" className="hd-label fill-zinc-900 dark:fill-zinc-100" fontWeight="700">My Professional Journey</text>
          <text x="620" y="74" className="hd-badge fill-red-500 dark:fill-red-400">✗ MISSED</text>

          <rect x="385" y="96" width="280" height="36" rx="4" className="fill-white dark:fill-zinc-900 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
          <text x="400" y="118" className="hd-label fill-zinc-900 dark:fill-zinc-100" fontWeight="700">What I Know Best</text>
          <text x="620" y="118" className="hd-badge fill-red-500 dark:fill-red-400">✗ MISSED</text>

          <rect x="385" y="140" width="280" height="36" rx="4" className="fill-white dark:fill-zinc-900 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
          <text x="400" y="162" className="hd-label fill-zinc-900 dark:fill-zinc-100" fontWeight="700">Where I Studied</text>
          <text x="620" y="162" className="hd-badge fill-red-500 dark:fill-red-400">✗ MISSED</text>

          <rect x="385" y="184" width="280" height="36" rx="4" className="fill-white dark:fill-zinc-900 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
          <text x="400" y="206" className="hd-label fill-zinc-900 dark:fill-zinc-100" fontWeight="700">Things I Have Built</text>
          <text x="620" y="206" className="hd-badge fill-red-500 dark:fill-red-400">✗ MISSED</text>

          <rect x="385" y="228" width="280" height="36" rx="4" className="fill-white dark:fill-zinc-900 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
          <text x="400" y="250" className="hd-label fill-zinc-900 dark:fill-zinc-100" fontWeight="700">📜 Credentials</text>
          <text x="620" y="250" className="hd-badge fill-red-500 dark:fill-red-400">✗ MISSED</text>

          <rect x="385" y="272" width="280" height="36" rx="4" className="fill-white dark:fill-zinc-900 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
          <text x="400" y="294" className="hd-label fill-zinc-900 dark:fill-zinc-100" fontWeight="700">Career Milestones & Impact</text>
          <text x="620" y="294" className="hd-badge fill-red-500 dark:fill-red-400">✗ MISSED</text>

          <text x="525" y="332" textAnchor="middle" className="hd-small fill-red-500 dark:fill-red-400">All content dumped into a single</text>
          <text x="525" y="346" textAnchor="middle" className="hd-small fill-red-500 dark:fill-red-400">"miscellaneous" field — unsearchable</text>
          <text x="525" y="368" textAnchor="middle" className="hd-badge fill-red-500 dark:fill-red-400">RESULT: PROFILE IS INVISIBLE</text>

          {/* Divider */}
          <line x1="350" y1="22" x2="350" y2="385" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      <h2 className={h2}>Font Weights and Visual Separation</h2>
      <p>Section classifiers do not only read the text characters. Modern systems also analyze the font properties and spacing to confirm section boundaries. They look for visual cues that indicate a new block starts.</p>

      <p>Ensure your headings are visibly larger than the body text. Use bold formatting to help the parser identify the title line. Add extra spacing before each heading to create a clear physical gap.</p>

      <p>Do not put your headings inside graphical boxes. Avoid using background colors or underlines to style your titles. These visual decorations often convert into weird character strings that scramble the text anchor.</p>

      <h2 className={h2}>Dealing with Dual Section Boundaries</h2>
      <p>Some candidates group different topics under a single heading. They write Skills and Projects as one section title. This confuses the classifier because it cannot decide how to map the data.</p>

      <p>The system might assign the entire block to your skills profile. This means your project descriptions will not be searchable as work history. Split these topics into separate sections with distinct headings.</p>

      <p>Give projects their own heading. Keep your skills separate from your employment timeline. This clean separation helps the database index your experience under the correct search filters.</p>

      <h2 className={h2}>The Best Headings for Technical Roles</h2>
      <p>Technical applicants must be direct. Use headers that align with recruiter search queries. Here are the safest section titles for your profile.</p>

      <ul className={ul}>
        <li>Work Experience</li>
        <li>Technical Skills</li>
        <li>Personal Projects</li>
        <li>Education</li>
        <li>Certifications</li>
      </ul>

      <p>Avoid using personal pronouns in your headers. Do not write Things I Have Built or Where I Have Worked. The parser looks for nouns not sentences.</p>

      <p>If you have a short work history you might want to highlight your open source contributions. Use the title Open Source Contributions. Do not merge this with your employment section unless you were paid for the work.</p>

      <p>Recruiters search for candidates using specific databases. These databases have pre-defined filters for experience and education. If your headings match these filters your profile appears higher in search results.</p>

      <h2 className={h2}>How Formatting Choices Affect Scanners</h2>
      <p>Paragraph breaks are important for defining section ends. When the parsing software finishes reading a block it expects a clear space before the next title. If you remove spacing the scanner merges the blocks.</p>

      <p>Do not use horizontal rules to separate sections. While lines look clean to humans they often convert to long dashes or underscore strings in the text stream. These strings confuse the parser pattern matching.</p>

      <p>Use whitespace instead of lines. A simple blank line is the most effective separator. It creates a physical boundary that both humans and machines recognize without errors.</p>

      <h2 className={h2}>The Interactive Link Alternative</h2>
      <p>If you want to use creative designs you should host your profile online. A web profile allows you to present your skills in a custom layout. Recruiters can view this responsive page on any device.</p>

      <p>An online profile bypasses database file parsing. The visitor reads your details directly from a web link. This keeps your formatting perfect while allowing you to use elegant layouts.</p>

      <p>You can share this link in your email applications. The recruiter clicks the URL and sees your structured profile immediately. This removes the risk of a system scrambling your headings.</p>

      <h2 className={h2}>Common Heading Pitfalls to Avoid</h2>
      <p>Do not use abbreviations in your section headings. Writing Exp instead of Experience or Projects and Certs confuses the matching algorithms. Spell out the words completely to ensure accuracy.</p>

      <p>Verify that your headings are not hidden inside headers or footers. Many PDF tools place repeating titles at the very top or bottom of the page. Parsers often ignore header and footer regions during text extraction.</p>

      <p>Place all content inside the main body of the document. Keep your contact info at the top of the first page. This ensures the parsing software logs your email and phone number correctly.</p>

      <p>Do not mix languages in your headings. If you apply for a job in English use English headings throughout the document. Mixing English and local language headings confuses the section classifier.</p>

      <p>Skip nested heading levels. Keep your structure flat with one level of section titles. This simple hierarchy ensures that the parser maps your details without nesting errors.</p>

      <p>Test your final layout using a plain text export. If your headings are merged with the body text add more blank lines. Clean spacing is the best way to guarantee parsing success.</p>

      <h2 className={h2}>Read Next</h2>
      <p>For more advice on formatting your application check out these helpful articles.</p>
      
      <p>
        Learn how to write effective summaries by reading <Link href="/summaries" className={link}>Best Ways to Write Technical Summaries for Senior Roles</Link>.
      </p>
      <p>
        Understand spacing requirements by reading <Link href="/spacing" className={link}>Best CV Spacing and Margin Standards for a Professional Look</Link>.
      </p>
      <p>
        Discover how to choose the right keywords by reading <Link href="/keywords" className={link}>Best Keywords for Tech Jobs</Link>.
      </p>
    </div>
  );
}
