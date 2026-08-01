import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="flex flex-col gap-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>A software engineer submits a detailed three page CV to a major enterprise job portal. The database system processes the file and saves it in a candidate profile table. Because the database uses a legacy text column the system truncates the text at exactly four thousand characters.</p>
      
      <p>All the engineer's recent accomplishments are silently deleted from the record. The recruiter only sees the older experience at the top of the file. This silent truncation happens on many enterprise portals without showing any warnings.</p>

      <p>You can prevent this data loss by managing your document length. Keeping your text dense and using web links ensures recruiters see all your achievements. Here is how enterprise database limits quietly destroy your applications.</p>

      <h2 className={h2}>Understanding Database String Limits</h2>
      <p>Applicant tracking systems rely on database engines to store candidate records. Many older databases use fixed character fields for the text extract. These fields often have limits of four thousand or eight thousand characters.</p>

      <p>If your extracted text exceeds this limit the system discards the extra characters. This discard happens after parsing is finished. It means the system might match your keywords but the human recruiter sees a broken page.</p>

      <p>This is why excessively long files fail. A file that contains ten pages of detailed text is likely to get cut off. Keeping your document under two pages reduces the risk of character truncation.</p>

      <div className={callout}>
        <h3 className={h3}>Keep the Text Lean</h3>
        <p>Do not repeat the same skills across multiple job descriptions. List your tools once in a skills block. Keep your job details focused on unique accomplishments to save character space.</p>
      </div>

      <h2 className={h2}>Counting Characters and Whitespace</h2>
      <p>Characters are letters and numbers. Every space, tab, and punctuation mark counts toward the database limit. In addition hidden formatting characters from Word or PDF exports consume your character budget.</p>

      <p>A single page of text typically contains three thousand characters. If you use a complex layout you might reach the database limit on a single page. This occurs because the layout tools insert hundreds of invisible tab blocks.</p>

      <p>Many text encoding systems use UTF-8 representation. In UTF-8 some special characters and accents consume up to four bytes instead of one byte. This means that a document filled with non-standard bullet symbols or complex quote markers will reach database limits much faster than one using simple characters.</p>

      <p>You should test the character count of your raw text. Copy all text from your CV and paste it into a word counter. If the character count exceeds six thousand you must edit the content.</p>

      {/* SVG Diagram showing Text Truncation Process */}
      <div className="not-prose my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Diagram showing the Text Truncation Process in Database Systems">
          <rect width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-900/30" />
          
          {/* Box 1 */}
          <rect x="30" y="60" width="180" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" />
          <text x="120" y="95" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-100 font-semibold" fontSize="13">Text Input Stream</text>
          <text x="120" y="115" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="11">10,000 characters</text>

          {/* Connection 1 */}
          <line x1="210" y1="95" x2="270" y2="95" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
          <text x="262" y="100" className="fill-zinc-400 dark:fill-zinc-500 font-semibold" fontSize="16">→</text>

          {/* Box 2 */}
          <rect x="280" y="60" width="180" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" />
          <text x="370" y="95" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-100 font-semibold" fontSize="13">Character Limit Check</text>
          <text x="370" y="115" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="11">Threshold set at 4,096</text>

          {/* Connection 2 */}
          <line x1="370" y1="130" x2="370" y2="190" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
          <text x="365" y="185" className="fill-zinc-400 dark:fill-zinc-500 font-semibold" fontSize="16" transform="rotate(90 370 185)">→</text>

          {/* Decision Box */}
          <rect x="280" y="200" width="180" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" />
          <text x="370" y="235" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-100 font-semibold" fontSize="13">Truncation Event</text>
          <text x="370" y="255" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="11">Splits input stream</text>

          {/* Connection Left (Save) */}
          <line x1="280" y1="235" x2="160" y2="235" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
          <text x="168" y="240" className="fill-zinc-400 dark:fill-zinc-500 font-semibold" fontSize="16" transform="rotate(180 165 235)">→</text>
          <text x="220" y="225" textAnchor="middle" className="fill-emerald-500 font-semibold" fontSize="11">First 4K</text>

          {/* Box Left */}
          <rect x="20" y="200" width="130" height="70" rx="6" className="fill-emerald-50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-900" strokeWidth="2" />
          <text x="85" y="235" textAnchor="middle" className="fill-emerald-900 dark:fill-emerald-300 font-semibold" fontSize="13">Saved Profile</text>
          <text x="85" y="255" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400" fontSize="11">Stored safely</text>

          {/* Connection Right (Discard) */}
          <line x1="460" y1="235" x2="540" y2="235" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
          <text x="532" y="240" className="fill-zinc-400 dark:fill-zinc-500 font-semibold" fontSize="16">→</text>
          <text x="500" y="225" textAnchor="middle" className="fill-red-500 font-semibold" fontSize="11">Remainder</text>

          {/* Box Right */}
          <rect x="550" y="200" width="130" height="70" rx="6" className="fill-red-50 dark:fill-red-950/20 stroke-red-200 dark:stroke-red-900" strokeWidth="2" />
          <text x="615" y="235" textAnchor="middle" className="fill-red-900 dark:fill-red-300 font-semibold" fontSize="13">Silent Discard</text>
          <text x="615" y="255" textAnchor="middle" className="fill-red-700 dark:fill-red-400" fontSize="11">Data is lost</text>
        </svg>
      </div>

      <h2 className={h2}>Writing Dense Achievement Statements</h2>
      <p>You can reduce your character count without losing impact by writing dense statements. Strip away all unnecessary filler words and corporate adjectives. Use direct action verbs to start every sentence.</p>

      <p>Do not write that you were responsible for managing databases. Write that you managed databases instead. This small change saves space and makes your writing more active.</p>

      <p>Focus on the absolute best wins. Delete minor tasks that do not highlight your core skills. A few strong statements carry more weight than ten weak sentences.</p>

      <h2 className={h2}>Splitting Content with a Web Link</h2>
      <p>The best way to bypass database limits is to use a hybrid submission. Keep your uploaded text document short and include a link to your interactive web profile. This link points to your complete history.</p>

      <p>The tracking system will store the short text file without truncation. The recruiter clicks your link to view the complete profile on the web. This web profile has no character limits.</p>

      <p>A web profile also allows you to display interactive projects and live code. This keeps your application engaging while satisfying the system storage constraints. This dual method gives you the best of both worlds.</p>

      <h2 className={h2}>How Formatting Bloat Consumes Storage</h2>
      <p>Many candidates use online builders to create styled PDF documents. These tools insert heavy CSS styling and layout metadata directly into the file binary. When a parser extracts this text it often pulls in raw styling strings.</p>

      <p>These styling strings count toward the character limit of the database. The recruiter might see a file that is cut in half because the styling strings consumed the storage buffer. Use plain text formatting tools to export your files.</p>

      <p>A simple document editor exports cleaner files. It keeps the text stream clean and free of CSS data. This ensures that every character stored represents your actual skills and work history.</p>

      <h2 className={h2}>Auditing Your Profile for Truncation</h2>
      <p>You can audit your files for truncation issues before applying. Copy the text from your exported document. Save it in a plain text file using a simple text editor.</p>

      <p>Check the size of the text file on your disk. A file size of under six kilobytes is safe for almost all database fields. If the file is larger than eight kilobytes you must remove content.</p>

      <p>You should also inspect how third-party ATS integrations handle your data. When an applicant tracking system sends your profile to a secondary testing platform or background check system it often uses custom APIs with even smaller character buffers. A document that passed the initial portal might still get truncated during these background transfers.</p>

      <p>Read through the text export to find formatting blocks that converted poorly. Replace strange characters with standard spaces. Clean up the spacing to reduce the file footprint.</p>

      <h2 className={h2}>The Hazard of Legacy Enterprise Systems</h2>
      <p>Many large corporations use database software that was built twenty years ago. These legacy systems are rarely updated by internal teams. They operate on rigid storage structures that cannot handle modern long files.</p>

      <p>If you apply to a major bank or insurance company you are likely submitting to a legacy system. These environments have the strictest character boundaries. Keeping your document under one page is the safest strategy for these targets.</p>

      <p>You do not need to list every job you held ten years ago. Focus on your last three roles. Delete older entries to keep your character count low while showing your current skills.</p>

      <h2 className={h2}>Maximizing the Value of Saved Space</h2>
      <p>When you edit your writing to save space you also improve readability. Recruiters appreciate concise documents that get straight to the point. A short document forces you to highlight your best achievements.</p>

      <p>Every sentence must prove your value. Use metrics to quantify your achievements. Stating that you reduced database latency by twenty percent is short and highly effective.</p>

      <p>Think of your text CV as an index page. The index must contain enough keywords to match searches but it does not need to tell your entire life history. Save the deep stories and interactive demos for your hosted web profile where visitors can explore them at leisure.</p>

      <p>This approach saves character budget while showing recruiters you are a high impact developer. Combining dense text with a live web link ensures your complete story is available to hiring managers.</p>

      <h2 className={h2}>Priority Order When You Must Cut Content</h2>
      <p>If your text export exceeds six thousand characters, cut in a fixed order. First remove duplicate skill lists from older jobs. Second trim jobs older than ten years to one line each. Third shorten education to degree, school, and year.</p>

      <p>Never cut your most recent role to save space. Recruiters weight the last three years heavily. A truncated current job makes you look unemployed or inexperienced even when the problem is database limits.</p>

      <p>Move long project narratives to your web profile. Keep a single sentence and a URL in the file upload. The index stays searchable. The story stays intact online.</p>

      <h2 className={h2}>Why Recruiters See a Different Version Than You Sent</h2>
      <p>Enterprise portals often reformat parsed text inside their own UI. Line breaks disappear. Bullets become plain dashes. Your carefully spaced sections look like one paragraph. That display problem is separate from truncation but feels the same to candidates.</p>

      <p>Submitting a shorter file reduces both risks. Less text means fewer places for the UI to break. A web link bypasses the reformatting layer entirely because the recruiter views your page in a normal browser.</p>

      <p>Ask recruiters which view they use when they say your CV looked incomplete. Sometimes they opened the attachment. Sometimes they read the parsed preview. Knowing the source tells you which version to fix.</p>

      <h2 className={h2}>Read Next</h2>
      <p>For more advice on layout design and concise formatting read these detailed guides.</p>
      
      <p>
 Learn how to format your page by checking <Link href="/spacing" className={link}>Best CV Spacing and Margin Standards for a Professional Look</Link>.
 </p>
      <p>
 Understand how to edit your bullets by reading <Link href="/bullets" className={link}>How Long Should Bullets Be</Link>.
 </p>
      <p>
 Discover how to share your profile by reading <Link href="/link" className={link}>Sending Your CV as a Web Link Instead of a PDF File</Link>.
 </p>
    </div>
  );
}
