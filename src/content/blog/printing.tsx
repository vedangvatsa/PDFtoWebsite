import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="flex flex-col gap-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>A candidate builds a beautiful responsive web profile with interactive project filtering and a dark mode toggle. They apply to a large enterprise company only to find a portal that strictly requires a file upload. They press the print button in their browser and save the page to a PDF. The output is a messy layout with broken grids and split sentences that look completely unprofessional.</p>

      <p>Legacy corporate systems still rely on flat file submissions for their initial application processes. If you do not optimize your web CV for print layout you risk sending a corrupted document to the hiring team. You must use print style sheets to convert your web profile into a clean document.</p>

      <p>Optimizing for print is not about abandoning web design. It is about writing simple styles that instruct the browser how to rearrange content on a physical page size. This ensures your profile looks great on screens and remains readable when printed.</p>

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

      {/* SVG Diagram showing PDF Printing Flow */}
      <div className="not-prose my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Diagram of Web to PDF Printing Engine">
          <rect width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-900/30" />
          
          {/* Box 1 */}
          <rect x="40" y="140" width="160" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" />
          <text x="120" y="175" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-100 font-semibold" fontSize="13">Interactive Web CV</text>
          <text x="120" y="195" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="11">Rich styles & state</text>

          {/* Connection 1 */}
          <line x1="200" y1="175" x2="260" y2="175" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
          <text x="252" y="180" className="fill-zinc-400 dark:fill-zinc-500 font-semibold" fontSize="16">→</text>

          {/* Box 2 */}
          <rect x="270" y="140" width="160" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" />
          <text x="350" y="175" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-100 font-semibold" fontSize="13">Media Print CSS</text>
          <text x="350" y="195" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="11">Overrides screen style</text>

          {/* Connection 2 */}
          <line x1="430" y1="175" x2="490" y2="175" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
          <text x="482" y="180" className="fill-zinc-400 dark:fill-zinc-500 font-semibold" fontSize="16">→</text>

          {/* Box 3 */}
          <rect x="500" y="140" width="160" height="70" rx="6" className="fill-emerald-50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-900" strokeWidth="2" />
          <text x="580" y="175" textAnchor="middle" className="fill-emerald-900 dark:fill-emerald-300 font-semibold" fontSize="13">Clean PDF File</text>
          <text x="580" y="195" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400" fontSize="11">Linearized layout</text>
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

      <h2 className={h2}>Read Next</h2>
      <p>For more advice on layouts and designing profiles that satisfy both human and machine readers read these guides.</p>
      
      <p>
        Explore why complex structures fail automated scans by reading <Link href="/blog/pdf" className={link}>Why Complex PDFs Break Recruiter Algorithms</Link>.
      </p>
      <p>
        Learn how to layout your profile for maximum scanning speed by reading <Link href="/blog/design" className={link}>Best CV Design Principles for Software Engineers</Link>.
      </p>
      <p>
        Discover spacing standards for clean layouts by reading <Link href="/blog/spacing" className={link}>Best CV Spacing and Margin Standards for a Professional Look</Link>.
      </p>
    </div>
  );
}
