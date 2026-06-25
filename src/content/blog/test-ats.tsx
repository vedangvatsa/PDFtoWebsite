import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="flex flex-col gap-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>You upload your professional CV to a corporate job portal. The web screen blinks. A profile form appears with your name listed as your last employer and your university degree missing entirely.</p>
      
      <p>This situation happens because the tracking system failed to extract your details. Corporate databases rely on automated software to parse your files. If the software fails to read your layout you get ignored by recruiters.</p>

      <p>You can identify these errors before you send your application. Testing your profile against parsing software reveals exactly what the human recruiter sees. Here is how to audit your document for parser errors.</p>

      <h2 className={h2}>The Raw Text Export Check</h2>
      <p>Open your CV document in a standard PDF viewer. Press the select all keyboard shortcut to highlight the entire document. Copy this text and paste it into a basic plain text editor.</p>

      <p>Examine the reading order of the pasted text. Parsers read your text from left to right and top to bottom. If your contact information appears mixed into your job history the parser will fail to log your profile.</p>

      <p>Look for merged words or missing spaces. Poor document formatting tools often push characters together. The software reads these as single long words and fails to match your technical capabilities.</p>

      <div className={callout}>
        <h3 className={h3}>The Plain Text Benchmark</h3>
        <p>If a simple text editor cannot display your layout cleanly a machine cannot read it. Always design your layout for linear reading first. Visual decoration must always follow readability.</p>
      </div>

      <h2 className={h2}>Checking the JSON Output from a Parser API</h2>
      <p>Many developers use open source tools to test their documents. You can write a small script to send your document to a resume parser API. This shows you the raw JSON data that applicant tracking systems generate.</p>

      <p>Inspect the JSON fields for errors. Verify that your start dates and end dates are correctly associated with the right employers. Check if your university major is listed in the education array.</p>

      <p>If the JSON output contains empty objects or incorrect values you must change your layout. A clean single column layout helps the parser associate dates with job titles. This ensures your profile survives the initial automated scan.</p>

      <h2 className={h2}>Identifying Font Encoding and Character Map Issues</h2>
      <p>Some PDF generation tools do not embed font character maps. When the parser attempts to read the characters it receives garbled text or empty squares. This makes your entire profile look blank to the system.</p>

      <p>Test for encoding errors by searching for specific words in your PDF. If the search tool cannot find basic words your character map is broken. You must regenerate the document using standard system fonts.</p>

      <p>Standard fonts like Arial or Helvetica have reliable character maps. Avoid custom web fonts that require special rendering engines. Safe fonts guarantee that every parsing system reads your letters correctly.</p>

      {/* Inline SVG using only safe elements rect, circle, line, text */}
      <div className="not-prose my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Diagram showing the CV parsing stages">
          <rect width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-900/30" />
          
          {/* Step 1 */}
          <rect x="30" y="80" width="160" height="80" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" />
          <text x="110" y="120" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-100 font-semibold" fontSize="14">Input CV Document</text>
          <text x="110" y="140" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="12">PDF or DOCX File</text>

          {/* Connection 1 */}
          <line x1="190" y1="120" x2="250" y2="120" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
          <text x="242" y="125" className="fill-zinc-400 dark:fill-zinc-500 font-semibold" fontSize="16">→</text>

          {/* Step 2 */}
          <rect x="260" y="80" width="180" height="80" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" />
          <text x="350" y="120" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-100 font-semibold" fontSize="14">Text Extraction Engine</text>
          <text x="350" y="140" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="12">Reads unicode data</text>

          {/* Connection 2 */}
          <line x1="440" y1="120" x2="500" y2="120" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
          <text x="492" y="125" className="fill-zinc-400 dark:fill-zinc-500 font-semibold" fontSize="16">→</text>

          {/* Step 3 */}
          <rect x="510" y="80" width="160" height="80" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" />
          <text x="590" y="120" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-100 font-semibold" fontSize="14">Semantic Tagging</text>
          <text x="590" y="140" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="12">Finds skills and dates</text>

          {/* Connection Down */}
          <line x1="590" y1="160" x2="590" y2="220" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
          <text x="585" y="215" className="fill-zinc-400 dark:fill-zinc-500 font-semibold" fontSize="16" transform="rotate(90 590 215)">→</text>

          {/* Step 4 */}
          <rect x="430" y="230" width="240" height="80" rx="8" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="2" />
          <text x="550" y="270" textAnchor="middle" className="fill-emerald-900 dark:fill-emerald-300 font-semibold" fontSize="14">Structured JSON Database</text>
          <text x="550" y="290" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400" fontSize="12">Ready for recruiter search</text>

          {/* Feedback loop */}
          <line x1="430" y1="270" x2="180" y2="270" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" strokeDasharray="5,5" />
          <text x="188" y="275" className="fill-zinc-400 dark:fill-zinc-500 font-semibold" fontSize="16" transform="rotate(180 185 270)">→</text>

          {/* Test Box */}
          <rect x="30" y="230" width="140" height="80" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" />
          <text x="100" y="270" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-100 font-semibold" fontSize="14">Verification Audit</text>
          <text x="100" y="290" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="12">Find layout bugs</text>
        </svg>
      </div>

      <h2 className={h2}>Visual Layout vs Parser Logical Flow</h2>
      <p>Visual templates often use columns to save space. While humans find columns easy to scan software reads them in a linear flow. This linear reading can merge unrelated sections together.</p>

      <p>For example a two column CV might put your job history on the left and your technical skills on the right. The parser reads across both columns. It sees your job title and immediately merges it with your skill list.</p>

      <p>This creates a corrupted profile in the database. The recruiter searches for candidates with specific skills but your skills are not associated with the correct jobs. Using a single column layout removes this risk.</p>

      <h2 className={h2}>The System Metadata and Hidden Fields Hazard</h2>
      <p>PDF documents contain hidden metadata fields. These fields include the author name and the document title. Some parsing software reads this metadata instead of your written header.</p>

      <p>If you used a shared template the author field might contain another person name. The parser will log that name as the candidate name. This means your application is saved under the wrong identity.</p>

      <p>Clear the metadata before saving your final document. Open the file properties in your document software. Delete all author details and set the title to your legal name.</p>

      <h2 className={h2}>Testing for Layout Breaks and Invisible Characters</h2>
      <p>Many templates use hidden tables to align dates and text. While these tables look neat to human eyes they confuse extraction algorithms. The parser might read the cells out of order.</p>

      <p>Check for invisible characters by exporting your document to a plain text file. If the exported file contains random tab characters or strange symbols you must simplify the layout. Avoid using complex tables for alignment.</p>

      <p>Replace nested tables with simple margins. Use standard tabs and space characters to align your dates. This creates a clean text stream that any machine can easily parse without errors.</p>

      <h2 className={h2}>Verify Live URL Previews and Links</h2>
      <p>Your web links must be clickable. Modern parsers extract URLs to find your online code repositories. If your links are flattened into static text the parser will ignore them.</p>

      <p>Test your PDF by hovering over the links. If the cursor does not change the link is not active. You must reinsert the hyperlinks before exporting the final file.</p>

      <p>A live link to an interactive profile gives recruiters immediate access to your work. A web profile link bypasses parsing errors by displaying your data in a responsive web layout. This guarantees that your skills are visible on any screen size.</p>

      <h2 className={h2}>Running the Final Checklist Before Applying</h2>
      <p>Do not rely on a single test. Run multiple checks to ensure your document is ready for application portals. Follow this checklist for every job application.</p>

      <ul className={ul}>
        <li>Confirm the copied text has a logical reading order from start to finish</li>
        <li>Check that dates are positioned next to the correct job titles</li>
        <li>Remove all personal details from the document metadata fields</li>
        <li>Verify that every link is active and points to the correct destination</li>
        <li>Ensure there are no tables or multi column containers in your layout</li>
      </ul>

      <p>Taking ten minutes to test your layout prevents your profile from getting lost in database systems. A clean document structure combined with a live web link ensures you get noticed by engineering managers.</p>

      <h2 className={h2}>Read Next</h2>
      <p>To learn more about improving your document layout check out these helpful guides.</p>
      
      <p>
        Learn why PDF files often fail in systems by reading <Link href="/pdf" className={link}>Why Complex PDFs Break Recruiter Algorithms</Link>.
      </p>
      <p>
        Understand how to format your layout by checking <Link href="/spacing" className={link}>Best CV Spacing and Margin Standards for a Professional Look</Link>.
      </p>
      <p>
        Discover how to present your profile by reading <Link href="/bypass" className={link}>Bypassing Formatting Destruction with Dual-Submissions</Link>.
      </p>
    </div>
  );
}
