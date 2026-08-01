import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="flex flex-col gap-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>A candidate builds a beautiful responsive web profile with interactive project filtering and a dark mode toggle. They apply to a large enterprise company only to find a portal that strictly requires a file upload. They press the print button in their browser and save the page to a PDF. The output is a messy layout with broken grids and split sentences that look completely unprofessional.</p>

      <p>Legacy corporate systems still rely on flat file submissions for their initial application processes. If you do not tune your web CV for print layout you risk sending a corrupted document to the hiring team. You must use print style sheets to convert your web profile into a clean document.</p>

      <p>tuning for print is not about abandoning web design. It is about writing simple styles that instruct the browser how to rearrange content on a physical page size. This ensures your profile looks great on screens and remains readable when printed.</p>

      <h2 className={h2}>The Power of Media Print Style Sheets</h2>
      <p>Web browsers use screen media styles by default to render layout pages. To control how your page looks when printed you must write custom media print rules. These rules override screen layouts and apply only during the print phase.</p>

      <p>Start by hiding all interactive elements that carry no value on paper. Remove your theme toggles and navigation bars from the printed output. Recruiters do not need to click social links or submit contact forms on a physical document.</p>

      <p>Use simple CSS classes to hide these elements from the printed layout. This keeps the document focused entirely on your core experience and skills. A clean layout on paper builds immediate trust with the hiring team.</p>

      <div className={callout}>
        <h3 className={h3}>Hide the Interfaces</h3>
        <p>Ensure that all web UI components are completely excluded from the printed document. Use display none rules in your media styles to strip away headers and sidebars. This leaves only your raw professional content on the page.</p>
      </div>

      <h2 className={h2}>Preventing Messy Page Breaks</h2>
      <p>One of the most common issues with printed web profiles is random page breaks. The browser might split a single job entry across two separate pages. This leaves your job title on page one and your achievements on page two.</p>

      <p>You can solve this problem by using CSS break avoidance rules. Apply break avoidance to all your major layout blocks to keep them intact on a single page. This forces the browser to move the entire block to the next page if space is low.</p>

      <p>Set page boundaries for your experience entries and education blocks. This keeps your details grouped together logically and prevents awkward reading splits. A clean flow makes the document easy for recruiters to scan.</p>

      <p>Test your page layout with different margins to ensure your content fits. Adjust padding and font sizes to prevent minor content overflows that create empty pages. A compact design fits perfectly on standard document formats.</p>

      <h2 className={h2}>Typography and Color Adjustments for Paper</h2>
      <p>Dark backgrounds look sleek on screens but waste massive ink when printed on paper. Web pages often use light gray text that lacks contrast when printed in black and white. You must reset your colors for high-contrast reading.</p>

      <p>Force a pure white background and solid black text inside your print styles. This saves printer ink and ensures your text remains sharp. Avoid using custom web fonts that might fail to render during PDF generation.</p>

      <p>Adjust your font sizes slightly to match standard document scale. Printed text looks larger than screen text and requires more breathing room. Use relative units to keep your layout responsive during rendering.</p>

      {/* SVG Diagram: Before/After Print CSS comparison */}
      <div className="not-prose my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 420" className="w-full h-auto" role="img" aria-label="Before and after comparison showing how @media print CSS transforms a web resume into a clean PDF">
          <style>{`
            .print-title { font: 600 13px system-ui, sans-serif; }
            .print-label { font: 500 11px system-ui, sans-serif; }
            .print-small { font: 400 10px system-ui, sans-serif; }
            .print-code { font: 500 10px 'SF Mono', 'Fira Code', monospace; }
            .print-badge { font: 700 9px system-ui, sans-serif; letter-spacing: 0.05em; }
          `}</style>

          {/* Left: Without print CSS */}
          <text x="160" y="22" textAnchor="middle" className="print-title fill-red-500 dark:fill-red-400">❌ Printed Without @media print</text>
          <rect x="20" y="34" width="300" height="340" rx="8" className="fill-zinc-800 dark:fill-zinc-700 stroke-red-300 dark:stroke-red-700" strokeWidth="1.5" />

          {/* Dark navbar still visible */}
          <rect x="20" y="34" width="300" height="28" rx="8" className="fill-zinc-900 dark:fill-zinc-800" />
          <rect x="20" y="50" width="300" height="12" className="fill-zinc-900 dark:fill-zinc-800" />
          <text x="35" y="52" className="print-small fill-zinc-400 dark:fill-zinc-500">Home About Projects Contact ☾</text>

          {/* Content on dark background = invisible */}
          <text x="35" y="85" className="print-label fill-zinc-400 dark:fill-zinc-500">Jane Developer</text>
          <rect x="35" y="95" width="200" height="7" rx="2" className="fill-zinc-600 dark:fill-zinc-600" />
          <rect x="35" y="108" width="170" height="7" rx="2" className="fill-zinc-600 dark:fill-zinc-600" />
          <text x="200" y="85" className="print-badge fill-red-400 dark:fill-red-500">← WASTES INK</text>

          {/* Broken 2-col grid */}
          <rect x="35" y="130" width="130" height="90" rx="4" className="fill-zinc-700 dark:fill-zinc-600 stroke-zinc-600 dark:stroke-zinc-500" strokeWidth="1" />
          <rect x="175" y="130" width="130" height="90" rx="4" className="fill-zinc-700 dark:fill-zinc-600 stroke-zinc-600 dark:stroke-zinc-500" strokeWidth="1" />
          <text x="100" y="160" textAnchor="middle" className="print-small fill-zinc-400 dark:fill-zinc-500">Project A</text>
          <text x="240" y="160" textAnchor="middle" className="print-small fill-zinc-400 dark:fill-zinc-500">Project B</text>
          <text x="170" y="245" textAnchor="middle" className="print-badge fill-red-400 dark:fill-red-500">GRID BREAKS ON PAPER</text>

          {/* Page split indicator */}
          <line x1="20" y1="260" x2="320" y2="260" className="stroke-red-400 dark:stroke-red-500" strokeWidth="1.5" strokeDasharray="6 4" />
          <text x="170" y="275" textAnchor="middle" className="print-badge fill-red-400 dark:fill-red-500">⚠ PAGE BREAK SPLITS CONTENT</text>

          {/* Orphaned content after split */}
          <rect x="35" y="290" width="270" height="7" rx="2" className="fill-zinc-600 dark:fill-zinc-600" />
          <rect x="35" y="303" width="230" height="7" rx="2" className="fill-zinc-600 dark:fill-zinc-600" />
          <text x="35" y="340" className="print-small fill-zinc-400 dark:fill-zinc-500">© 2024 · Built with Next.js</text>
          <text x="200" y="340" className="print-badge fill-red-400 dark:fill-red-500">← FOOTER PRINTS</text>

          {/* Right: With proper print CSS */}
          <text x="530" y="22" textAnchor="middle" className="print-title fill-emerald-600 dark:fill-emerald-400">✓ Printed With @media print</text>
          <rect x="380" y="34" width="300" height="340" rx="8" className="fill-white dark:fill-zinc-100 stroke-emerald-300 dark:stroke-emerald-600" strokeWidth="1.5" />

          {/* Clean header. no nav */}
          <text x="395" y="60" className="print-label fill-zinc-900 dark:fill-zinc-900" fontWeight="700">Jane Developer</text>
          <text x="395" y="75" className="print-small fill-zinc-600 dark:fill-zinc-600">Full-Stack Engineer · jane.dev · github.com/jane</text>
          <text x="610" y="60" className="print-badge fill-emerald-600 dark:fill-emerald-600">NAV HIDDEN</text>

          {/* Clean single-column content */}
          <text x="395" y="100" className="print-badge fill-zinc-700 dark:fill-zinc-700">EXPERIENCE</text>
          <text x="395" y="115" className="print-small fill-zinc-900 dark:fill-zinc-900" fontWeight="600">Senior Engineer · Acme Corp</text>
          <rect x="395" y="122" width="260" height="6" rx="2" className="fill-zinc-200 dark:fill-zinc-300" />
          <rect x="395" y="133" width="240" height="6" rx="2" className="fill-zinc-200 dark:fill-zinc-300" />
          <rect x="395" y="144" width="250" height="6" rx="2" className="fill-zinc-200 dark:fill-zinc-300" />

          {/* break-inside: avoid shown */}
          <rect x="390" y="163" width="275" height="80" rx="4" className="fill-emerald-50 dark:fill-emerald-100 stroke-emerald-200 dark:stroke-emerald-300" strokeWidth="1" strokeDasharray="4 3" />
          <text x="395" y="180" className="print-badge fill-emerald-700 dark:fill-emerald-700">PROJECTS. break-inside: avoid</text>
          <text x="400" y="198" className="print-small fill-zinc-800 dark:fill-zinc-800" fontWeight="600">Payment Dashboard</text>
          <rect x="400" y="205" width="250" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-300" />
          <text x="400" y="225" className="print-small fill-zinc-800 dark:fill-zinc-800" fontWeight="600">API Gateway</text>
          <rect x="400" y="232" width="240" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-300" />

          {/* Links exposed */}
          <text x="395" y="265" className="print-badge fill-zinc-700 dark:fill-zinc-700">LINKS</text>
          <text x="395" y="280" className="print-small fill-zinc-700 dark:fill-zinc-700">Portfolio → jane.dev</text>
          <text x="395" y="294" className="print-small fill-zinc-700 dark:fill-zinc-700">GitHub → github.com/jane</text>
          <text x="610" y="280" className="print-badge fill-emerald-600 dark:fill-emerald-600">URLs SHOWN</text>

          {/* Key CSS rules at bottom */}
          <rect x="395" y="310" width="265" height="50" rx="4" className="fill-zinc-100 dark:fill-zinc-200" />
          <text x="405" y="325" className="print-code fill-zinc-600 dark:fill-zinc-700">@media print {'{'}</text>
          <text x="415" y="338" className="print-code fill-zinc-600 dark:fill-zinc-700">nav, footer {'{'} display: none {'}'}</text>
          <text x="415" y="351" className="print-code fill-zinc-600 dark:fill-zinc-700">body {'{'} background: #fff {'}'} {'}'}</text>

          {/* Divider */}
          <line x1="355" y1="25" x2="355" y2="390" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      <h2 className={h2}>Printing Hyperlinks and Custom URLs</h2>
      <p>On a web CV hyperlinks allow readers to visit your projects with a single click. When printed onto a physical document these links become completely useless because the URL is hidden. You must expose the target URLs in your print style sheet.</p>

      <p>Use CSS pseudo-selectors to automatically print the destination link next to your text. When a recruiter prints your page they will see the web address written in parenthetical statements. This lets them type the links into their browser manually.</p>

      <p>Keep these printed URLs short and clean to avoid wrapping lines. If a link is too long use descriptive anchors or link shorteners. This keeps the text looking professional on paper.</p>

      <p>Ensure that only essential links are printed. You do not need to print target links for minor styling files or background components. Focus on your GitHub profile and live project endpoints.</p>

      <h2 className={h2}>Automating PDF Exports with Headless Scripts</h2>
      <p>If you update your web profile frequently exporting it to PDF manually is tedious. You can automate this process using headless browser tools. These tools run in your background build pipelines and save your page to a PDF automatically.</p>

      <p>Use Puppeteer or Playwright to open your local web page and print it to a file on every new commit. This ensures that your downloadable PDF is always in sync with your latest web content. You do not have to worry about updating multiple documents.</p>

      <p>Configure the export script to use standard print parameters. Set the page size to A4 or Letter and adjust the margins to match your layout design. Store the output file in your public directory so recruiters can download it directly from your web CV.</p>

      <p>This automation removes human error from the build process. It guarantees that the downloadable version of your profile is always perfect and up to date. It is a highly efficient setup for active job hunters.</p>

      <h2 className={h2}>Testing Your Print Layout on Multiple Browsers</h2>
      <p>Different web browsers use slightly different print engines. A layout that renders perfectly in Chrome might split content awkwardly in Firefox or Safari. You must test your print stylesheet across multiple platforms.</p>

      <p>Use print preview tools to check the layout boundaries before committing changes. Look for cut off text blocks and missing page elements. Pay close attention to how your margins behave on different screen widths.</p>

      <p>Ask a friend to test your printed file on their local printer if possible. Physical page margins can vary slightly depending on printer hardware. A final physical check ensures your profile is ready for corporate review.</p>

      <h2 className={h2}>When to Print Versus When to Send a Link</h2>
      <p>Default to sending a web link. Print only when the application portal requires a file upload or when you are handing someone a physical document at an event. A link stays current. A printed PDF is frozen the moment you save it.</p>

      <p>If you must upload a file, generate it from your web profile using print styles rather than exporting from a word processor. The web version is your source of truth. The PDF is a snapshot for systems that have not caught up yet.</p>

      <p>CVin.Bio profiles include built-in print styling. The platform strips navigation, forces high-contrast text, and keeps experience blocks intact across page breaks. You get a clean PDF from the browser print dialog without writing custom CSS.</p>

      <h2 className={h2}>Common Print Failures to Avoid</h2>
      <p>Printing directly from a dark-mode page without print overrides produces gray text on gray backgrounds. Always preview before saving. Using browser zoom above 100% shifts margins and creates unexpected page breaks. Print at actual size.</p>

      <p>Background images and gradients often print as solid ink blobs. Disable background graphics in the print dialog unless you have tested the output. Fixed-position elements like sticky headers repeat on every printed page and waste space.</p>

      <p>Long URLs in the body text wrap across lines and look broken on paper. Use short profile links and let print CSS append full URLs only for essential outbound links.</p>

      <div className={callout}>
        <h3 className={h3}>The print preview checklist</h3>
        <p>Before saving any PDF: no navigation bar, no dark backgrounds, no split job entries, all links visible as text, margins at least 0.75 inches, body font at least 10 point. If any item fails, fix your print CSS before submitting.</p>
      </div>

      <h2 className={h2}>Read Next</h2>
      <p>For more advice on layouts and designing profiles that satisfy both human and machine readers read these guides.</p>
      
      <p>
 Explore why complex structures fail automated scans by reading <Link href="/pdf" className={link}>Why Complex PDFs Break Recruiter Algorithms</Link>.
 </p>
      <p>
 Learn how to layout your profile for maximum scanning speed by reading <Link href="/design" className={link}>Best CV Design Principles for Software Engineers</Link>.
 </p>
      <p>
 Discover spacing standards for clean layouts by reading <Link href="/spacing" className={link}>Best CV Spacing and Margin Standards for a Professional Look</Link>.
 </p>
    </div>
  );
}
