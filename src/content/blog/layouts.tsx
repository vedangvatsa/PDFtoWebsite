import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="flex flex-col gap-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>An engineering manager rides the train home after a long day of meetings. They open their phone to review candidates for a frontend opening. The first application is a two column PDF that renders as tiny gray lines on the six inch screen. The manager tries to pinch and zoom but the document slips. They close the window and move to the next candidate.</p>
      
      <p>This behavior is standard in modern hiring. Recruiters do not wait until they are at their desks to review profiles. They scan candidate profiles on phones during commutes, lunches, and brief intervals between meetings.</p>

      <p>Traditional layouts designed for paper printouts fail on screens. If your CV requires pinch gestures to read you will lose opportunities. You must design for the mobile viewport to capture fast recruiter attention.</p>

      <h2 className={h2}>The Failure of Desktop Multi Column Designs</h2>
      <p>Multi column designs look elegant on widescreen monitors. They allow you to place skills on the side and work history in the middle. However these layouts fail when shrunk down to a mobile screen.</p>

      <p>A static PDF preserves its desktop grid on mobile. This forced formatting makes the text microscopic. The reader must zoom in and pan left to right to read a single sentence. This process creates high cognitive friction.</p>

      <p>Some mobile PDF readers also render columns out of order. They read text from edge to edge and mix the sidebar skills with your job descriptions. This mixing creates a confusing experience for the hiring manager.</p>

      <div className={callout}>
        <h3 className={h3}>Keep Layouts Linear</h3>
        <p>Avoid using sidebars or parallel text blocks in your designs. A single vertical column is the only format that translates cleanly across all devices. This structure guarantees that your text flows logically on screens of any size.</p>
      </div>

      <h2 className={h2}>Designing for the Thumb and the Swipe</h2>
      <p>Mobile reading is an active physical process. Readers use their thumb to scroll rapidly through files. You must align your content structure with this physical habit.</p>

      <p>Put your most impressive qualifications in the top third of the viewport. This area is visible immediately when the page loads. If you fail to hook the reader here they will not scroll further.</p>

      <p>Use generous spacing between sections to prevent accidental clicks. Mobile screens require larger touch targets. Ensure your links have enough empty space around them to prevent user errors.</p>

      {/* SVG Diagram showing Mobile Layout comparison */}
      <div className="not-prose my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Comparison of desktop multi column layouts versus mobile responsive layouts">
          <rect width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-900/30" />
          
          {/* Left Side Desktop Layout on Mobile */}
          <text x="180" y="30" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 font-bold" fontSize="12">DESKTOP PDF ON MOBILE SCREEN</text>
          <rect x="70" y="50" width="220" height="260" rx="12" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="2" />
          {/* Screen notch */}
          <rect x="150" y="50" width="60" height="10" rx="5" className="fill-zinc-300 dark:fill-zinc-700" />
          
          {/* Shrunk content */}
          <rect x="90" y="80" width="50" height="200" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
          <rect x="150" y="80" width="120" height="200" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
          {/* Red zoom circles indicating pinch zoom requirement */}
          <circle cx="180" cy="180" r="25" className="fill-red-500/10 stroke-red-500" strokeWidth="1.5" strokeDasharray="3,3" />
          <text x="180" y="184" textAnchor="middle" className="fill-red-600 dark:fill-red-400 font-bold" fontSize="10">Pinch Zoom</text>
          
          <text x="180" y="295" textAnchor="middle" className="fill-red-600 dark:fill-red-400 font-semibold" fontSize="11">Mangled layout and tiny text</text>

          {/* Divider */}
          <rect x="349" y="20" width="2" height="310" className="fill-zinc-200 dark:fill-zinc-800" />

          {/* Right Side Mobile Responsive Layout */}
          <text x="520" y="30" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 font-bold" fontSize="12">MOBILE RESPONSIVE FLOW</text>
          <rect x="410" y="50" width="220" height="260" rx="12" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="2" />
          {/* Screen notch */}
          <rect x="490" y="50" width="60" height="10" rx="5" className="fill-zinc-300 dark:fill-zinc-700" />
          
          {/* Linear content */}
          {/* Header */}
          <rect x="430" y="75" width="80" height="12" rx="2" className="fill-emerald-500 dark:fill-emerald-400" />
          <rect x="430" y="92" width="120" height="6" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
          
          {/* Bio Summary */}
          <rect x="430" y="110" width="180" height="25" rx="3" className="fill-zinc-200 dark:fill-zinc-700" />
          
          {/* Experience Block 1 */}
          <rect x="430" y="145" width="180" height="45" rx="3" className="fill-zinc-200 dark:fill-zinc-700" />
          <rect x="440" y="152" width="50" height="6" rx="1.5" className="fill-zinc-400 dark:fill-zinc-500" />
          <rect x="440" y="162" width="160" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
          <rect x="440" y="170" width="140" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
          <rect x="440" y="178" width="150" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />

          {/* Experience Block 2 */}
          <rect x="430" y="200" width="180" height="45" rx="3" className="fill-zinc-200 dark:fill-zinc-700" />
          <rect x="440" y="207" width="50" height="6" rx="1.5" className="fill-zinc-400 dark:fill-zinc-500" />
          <rect x="440" y="217" width="160" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
          <rect x="440" y="225" width="130" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
          
          {/* Green swipe gesture arrow indicated with text */}
          <text x="520" y="270" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 font-bold" fontSize="11">Smooth Single Column Scroll</text>
          <text x="520" y="295" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 font-semibold" fontSize="11">Readable without zoom</text>
        </svg>
      </div>

      <h2 className={h2}>Establishing Visual Hierarchy on Mobile Screens</h2>
      <p>Visual hierarchy directs the reader eyes down the page. On small screens this hierarchy must be clean. Use a simple typographic scale to group your sections.</p>

      <p>Set your name as the largest text element on the page. Use bold weights for your company names and job titles. Keep the body text clear and readable.</p>

      <p>Avoid decorative badges or complex icons that add visual clutter. Icons look like tiny blocks when viewed on phones. Rely on clean text alignment and white space to separate your sections.</p>

      <h2 className={h2}>The Rules of Mobile Spacing</h2>
      <p>Spacing determines how readable your document feels on a phone. Tight spacing creates a gray wall of text that repels readers. Generous margins provide breathing room.</p>

      <p>Keep your margins at three quarters of an inch on all sides. This padding keeps your text from touching the edge of the screen. It creates a clean border around your content.</p>

      <p>Use list structures to break up long descriptions. List items are easier to read on mobile than massive paragraphs. Limit each item to a single sentence.</p>

      <h2 className={h2}>Optimizing Your Links for Touch Screens</h2>
      <p>Recruiters click links to view your work. If your links are hard to press the recruiter will skip them. You must optimize your links for physical touch targets.</p>

      <p>Ensure your links have a height of at least forty four pixels. This size matches the standard target for mobile interface designs. It prevents misclicks and frustration.</p>

      <p>Do not paste long URLs directly into your text. A URL like github dot com slash user slash repository slash project wraps awkwardly on mobile screens. Use clean text links like View Project instead.</p>

      <p>Test your links on a real mobile device before sharing. Verify that they open in a new tab without breaking the layout. This verification ensures a professional reading experience.</p>

      <h2 className={h2}>Writing for the Mobile Reading Habit</h2>
      <p>Mobile readers skim content faster than desktop readers. They scan the left margin of the screen looking for key terms. You must write your sentences to fit this behavior.</p>

      <p>Put your primary technical stack at the front of your experience points. Start sentences with action words or technology names. This placement ensures the reader catches your skills during a fast swipe.</p>

      <p>Keep your descriptions brief. Delete historical roles that are over five years old. Limiting your history reduces screen height and keeps the reader focused on your current value.</p>

      <p>Highlight your latest project with a working link. Proving your skills with active code builds immediate trust. It separates you from applicants who only list keywords.</p>

      <h2 className={h2}>Testing Your Layout Across Devices</h2>
      <p>Testing your layout is a critical step in the design process. Do not assume your code renders correctly because it looks good in a desktop window. Open your browser developer tools to simulate different screen widths.</p>

      <p>Check your design on standard phone widths like three hundred and sixty pixels. Ensure that headers do not wrap awkwardly and text margins remain consistent. Verify that your font sizes are large enough to read without straining.</p>

      <p>Inspect how your text wraps inside lists. Ensure that bullet indicators align correctly with the first line of text. Fix any overlapping blocks before sharing your profile with recruiters.</p>

      <h2 className={h2}>Optimizing Fonts and Readability on Mobile</h2>
      <p>Typography choices determine how long a reader will stay on your page. Choose standard sans serif fonts for clean digital rendering. Sans serif fonts look sharp on high resolution mobile screens.</p>

      <p>Use a line height of at least one point four to separate your lines of text. This spacing prevents lines from merging together when read on small screens. It improves reading velocity and reduces eye strain.</p>

      <p>Limit your font weights to three variations. Use a bold weight for section headers, a medium weight for subheadings, and a regular weight for body text. Too many weights create visual noise and ruin your design hierarchy.</p>

      <h2 className={h2}>The Mobile Web Profile Solution</h2>
      <p>Static files cannot achieve perfect mobile responsiveness. A web profile is the only format that adapts dynamically to every screen size. It changes its layout to look perfect on both phones and desktops.</p>

      <p>Web profiles render clean HTML that mobile browsers display instantly. They bypass the download step entirely. The recruiter clicks your link and reads your profile in one step.</p>

      <p>Web profiles also allow search engine indexing. This indexing makes your profile visible to recruiters searching Google. It acts as a continuous marketing tool for your skills.</p>

      <p>Building your web profile on a platform like CVin.Bio guarantees mobile responsiveness. The system automatically creates a clean single column flow on mobile screens. It ensures your profile remains readable and professional regardless of the device.</p>

      <h2 className={h2}>Read Next</h2>
      <p>For more advice on mobile optimization and visual hierarchy read these detailed articles.</p>
      
      <p>
        Understand the importance of responsive design by reading <Link href="/mobile" className={link}>Why Your CV Must Be Mobile Responsive</Link>.
      </p>
      <p>
        Learn how to layout keywords on your page by reading <Link href="/tech-keywords" className={link}>Mapping Visual Hierarchy for Technical Recruiters</Link>.
      </p>
      <p>
        Explore fundamental design layout rules by reading <Link href="/design" className={link}>Best CV Design Principles for Software Engineers</Link>.
      </p>
    </div>
  );
}
