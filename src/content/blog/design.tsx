import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="flex flex-col gap-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
 A hiring manager sits in a dark office. 
 Three hundred applicants just applied for a single senior backend engineering role. 
 She has exactly ten minutes before her next product meeting to filter this pile down to five candidates.
 </p>
      <p>
 She opens the first document on her wide screen. 
 It is a complex two-column layout featuring purple accent bars, circular skill progress meters, and a massive headshot in the top left corner. 
 Her automated screen reader scrambles the columns and joins the dates into the project descriptions. 
 She closes the tab immediately and moves to the next candidate.
 </p>
      <p>
 Your visual design determines whether your code is ever read by human eyes. 
 Software engineers often treat layout design as an afterthought. 
 They assume their technical achievements will speak for themselves. 
 However, if the visual system fails, the reading ends before it starts.
 </p>

      <h2 className={h2}>The Death of the Multi-Column Grid</h2>
      <p>
 Graphic designers love two-column layouts because they look like print magazines. 
 They put contact details on the left side and professional experience on the right. 
 This is a terrible mistake for software engineering applications.
 </p>
      <p>
 Applicant tracking systems parse files from left to right. 
 When they encounter two columns, they often merge the text across the horizontal plane. 
 Your employment dates will blend directly into your technical summaries. 
 The parser sees a wall of scrambled sentences.
 </p>
      <p>
 Parsing algorithms calculate the bounding boxes of characters. 
 If two blocks of text occupy the same vertical range, the parser assumes they are part of the same line. 
 This merges your skills lists with your job history. 
 It ruins the logical structure of your document.
 </p>
      <p>
 Single-column layouts guarantee a linear reading path for both machines and humans. 
 The human eye naturally scans pages in a top-down direction. 
 A single-column layout ensures that your chronological history remains clean. 
 The parser reads your experience in the exact order you wrote it.
 </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="A diagram showing how a multi-column layout scrambles the parser reading order, while a single-column layout maintains linear flow.">
          <rect width="700" height="350" rx="12" className="fill-zinc-50 dark:fill-zinc-900/40" />
          <rect x="50" y="50" width="260" height="250" rx="8" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="2" />
          <text x="180" y="35" textAnchor="middle" className="fill-red-600 dark:fill-red-400 font-bold text-sm font-sans">Multi-Column Layout (Scrambled)</text>
          
          <rect x="65" y="70" width="70" height="210" rx="4" className="fill-zinc-100 dark:fill-zinc-800/80 stroke-zinc-200 dark:stroke-zinc-700" />
          <rect x="145" y="70" width="150" height="210" rx="4" className="fill-zinc-100 dark:fill-zinc-800/80 stroke-zinc-200 dark:stroke-zinc-700" />
          
          <path d="M 65 100 L 295 120" className="stroke-red-500/60" strokeWidth="2" strokeDasharray="4,4" fill="none" />
          <path d="M 65 160 L 295 180" className="stroke-red-500/60" strokeWidth="2" strokeDasharray="4,4" fill="none" />
          <circle cx="180" cy="140" r="22" className="fill-red-500/10 stroke-red-500" strokeWidth="2" />
          <path d="M 172 132 L 188 148 M 188 132 L 172 148" className="stroke-red-500" strokeWidth="3" />

          <rect x="390" y="50" width="260" height="250" rx="8" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="2" />
          <text x="520" y="35" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 font-bold text-sm font-sans">Single-Column Flow (Linear)</text>
          
          <rect x="405" y="70" width="230" height="40" rx="4" className="fill-zinc-100 dark:fill-zinc-800/80 stroke-zinc-200 dark:stroke-zinc-700" />
          <rect x="405" y="125" width="230" height="70" rx="4" className="fill-zinc-100 dark:fill-zinc-800/80 stroke-zinc-200 dark:stroke-zinc-700" />
          <rect x="405" y="210" width="230" height="70" rx="4" className="fill-zinc-100 dark:fill-zinc-800/80 stroke-zinc-200 dark:stroke-zinc-700" />
          
          <path d="M 520 80 L 520 260" className="stroke-emerald-500/60" strokeWidth="2.5" markerEnd="url(#arrow)" fill="none" />
          <circle cx="520" cy="160" r="22" className="fill-emerald-500/10 stroke-emerald-500" strokeWidth="2" />
          <path d="M 512 160 L 517 165 L 528 152" className="stroke-emerald-500" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      <h2 className={h2}>Font Selection and Hierarchy Rules</h2>
      <p>
 Custom typography can crash rendering engines. 
 If a recruiter does not have your unique font file installed on their operating system, their browser will default to a basic fallback. 
 This change will ruin your carefully planned line breaks and page boundaries.
 </p>
      <p>
 System fonts are safer and render much faster. 
 Arial, Helvetica, or system-ui work perfectly on every platform. 
 These fonts scale cleanly on mobile devices and remain readable at tiny sizes.
 </p>
      <p>
 Limit your font sizes to three distinct values. 
 Your name should be large. 
 Section headers should be medium. 
 Body text must be small. 
 Varying font sizes beyond this range creates visual clutter.
 </p>
      <p>
 Ensure you maintain a consistent line height. 
 Text that is packed too tightly causes reading fatigue. 
 A line height of 1.5 is standard for screen reading.
 </p>

      <h2 className={h2}>The Mathematical Application of Whitespace</h2>
      <p>
 Dense documents signal panic. 
 Engineers who cram every project they ever built into a single page leave no breathing room. 
 The recruiter feels exhausted before reading the first line.
 </p>
      <p>
 Set your margins to at least three quarters of an inch on all sides. 
 Leave clear gaps between your job blocks. 
 This empty space guides the reader down the page.
 </p>
      <p>
 Web-based profiles solve this problem automatically. 
 They allow infinite vertical scrolling. 
 The reader can scroll smoothly without worrying about physical page boundaries. 
 You can review how this works in our guide on <Link href="/two-pages" className={link}>the single-page myth</Link>.
 </p>
      <p>
 Whitespace acts as a visual separator. 
 It signals to the brain that a new topic has started. 
 Without it, your achievements blend into a gray wall.
 </p>

      <div className={callout}>
        <p className={bold}>Core Layout Metrics</p>
        <p className="mt-2">
 Margins should be set to 0.75 inches minimum. 
 Line height must be set between 1.4 and 1.5. 
 Use system font stacks to prevent rendering errors across different operating systems.
 </p>
      </div>

      <h2 className={h2}>Color Systems for Software Engineering Profiles</h2>
      <p>
 Bright colors look unprofessional. 
 Neon green headers or blue background panels distract from your technical credentials. 
 Your content must be the focus.
 </p>
      <p>
 Limit your color system to black, white, and a single neutral slate gray. 
 Use dark gray for body text to reduce eye strain. 
 Use pure black for section titles.
 </p>
      <p>
 Dark mode support is mandatory for modern tech recruiters. 
 Many developers keep their systems set to dark themes. 
 If your CV is a bright white PDF, it will shock their eyes. 
 A responsive web link handles theme changes automatically.
 </p>
      <p>
 Ensure your colors meet standard accessibility contrast ratios. 
 Text that is too light gray against a white background cannot be read by visually impaired recruiters. 
 A contrast ratio of 4.5 to 1 is the minimum standard.
 </p>

      <h2 className={h2}>The Formatting Rules for Technical Blocks</h2>
      <p>
 Listing forty skills in a huge block is useless. 
 Recruiters cannot find the tools they are looking for in a giant word soup. 
 They will assume you have no deep experience in any of them.
 </p>
      <p>
 Group your skills by category. 
 Create separate rows for languages, databases, and infrastructure. 
 This grouping helps the reader scan your stack in seconds.
 </p>
      <p>
 Link your skills directly to your experience points. 
 Do claim you know a tool. 
 Show exactly how you used that tool to tune a production system. 
 For more advice on this, read our article on <Link href="/trust" className={link}>avoiding fake skills lists</Link>.
 </p>
      <p>
 Be honest about your technical stack. 
 Listing tools you only used once damages your credibility. 
 Focus on the technologies you can explain in depth during an interview.
 </p>

      <h2 className={h2}>Semantic HTML Elements Over Plain Text Formatting</h2>
      <p>
 Standard word processors save documents as flat files. 
 They lack the structural metadata that machines use to understand text. 
 A parser must guess where a section ends and another begins.
 </p>
      <p>
 Web-based profiles use semantic HTML tags. 
 A main header tag signals your name. 
 List item tags indicate separate responsibilities. 
 This structure eliminates the coordinate guessing game for automated parsers.
 </p>
      <p>
 Semantic tags also improve search engine tuning. 
 Search crawlers index semantic content much better than flat files. 
 This makes your profile easier to discover online.
 </p>
      <p>
 Also, screen readers can jump directly to specific sections. 
 This makes your profile easier to use for everyone.
 </p>

      <h2 className={h2}>Designing for Mobile Recruiters on the Go</h2>
      <p>
 Recruiters spend half their day on mobile phones. 
 They review candidates during their commutes or between meetings. 
 If your document forces them to pinch and zoom, they will skip it.
 </p>
      <p>
 A mobile-responsive layout scales down to fit small screens. 
 Text wraps naturally without breaking. 
 The reader can scan your experience with a thumb scroll.
 </p>
      <p>
 A responsive design shows that you understand modern web standards. 
 It demonstrates that you care about the user experience of your audience. 
 It is a subtle signal of professionalism.
 </p>
      <p>
 You can see how this mobile shift impacts hiring in our deep dive on <Link href="/mobile" className={link}>mobile-friendly layouts</Link>. 
 Making your profile responsive is the easiest way to stand out.
 </p>

      <h2 className={h2}>How to Test Your CV Design Layout</h2>
      <p>
 Never assume your layout works because it looks good on your screen. 
 You must test it against different rendering engines. 
 Open your profile on a phone and a desktop.
 </p>
      <p>
 Copy the text from your document and paste it into a plain text file. 
 Check if the words are joined together or if characters are missing. 
 If the text is messy, the parser will fail.
 </p>
      <p>
 Use a web link instead of a static file. 
 This guarantees that the reader sees the exact layout you designed. 
 It also allows you to update your details instantly if you spot a typo.
 </p>
      <p>
 Testing your layout prevents embarrassing parsing errors before you apply. 
 A clean layout keeps you in the pipeline.
 </p>

      <h2 className={h2}>Layout Pitfalls to Avoid</h2>
      <p>
 Progress bars look clean but convey no information. 
 Rating yourself four out of five stars in a language is meaningless. 
 It does not tell the hiring manager what you built.
 </p>
      <p>
 Tables are dangerous for text extraction. 
 Many parsers ignore tables entirely or merge the columns incorrectly. 
 Use simple unordered lists with clean margins instead.
 </p>
      <p>
 Avoid using headers and footers for critical contact data. 
 Some search engines and databases ignore header zones during import. 
 Put your contact details directly in the main body flow.
 </p>
      <p>
 Keep your design layout simple and focused. 
 Let your actual engineering work stand out.
 </p>
      <p>
 Large decorative photos consume screen space without adding signal. 
 A small avatar is enough. 
 Recruiters hire engineers for code quality, not for portrait photography.
 </p>
      <p>
 If you use color at all, restrict it to section dividers or one accent line. 
 Anything louder pulls attention away from your project links and work history.
 </p>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/pdf" className={link}>Why complex layouts break parser algorithms</Link></li>
        <li><Link href="/mobile" className={link}>tuning your document for mobile screens</Link></li>
        <li><Link href="/tech-keywords" className={link}>Structuring keywords for a thirty-second scan</Link></li>
      </ul>
    </div>
  );
}
