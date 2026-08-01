import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <h2 className={h2}>The Annoyance of Scrolling Sideways</h2>
        <p>Open any traditional PDF resume on your phone right now. You will immediately notice the text is too small to read. This is one major reason <Link href="/attachments" className={link}>why PDFs are losing to web profiles</Link>. To read one line, you pinch-zoom and then scroll right. For the next line, scroll down and back left. <span className={bold}>Every single line requires this tedious zigzag.</span></p>
        <p>This is called forced horizontal scrolling, and every usability study in the last twenty years classifies it as a <span className={bold}>critical interface failure</span>.</p>
        <div className={callout}>
          <h3 className={h3}>The math of the 6-second scan</h3>
          <p>The average recruiter spends <span className={bold}>6-8 seconds</span> on an initial resume scan. If two of those seconds are wasted just scrolling around, you have lost a third of your window. They will not fight your formatting. They will close the file and open the next one.</p>
        </div>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 620 320" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* LEFT PHONE. PDF on Phone */}
            <text x="165" y="24" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">PDF on Phone</text>

            {/* Phone outline */}
            <rect x="100" y="38" width="130" height="240" rx="16" className="fill-zinc-50 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="2" />
            {/* Screen area */}
            <rect x="110" y="58" width="110" height="195" rx="4" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            {/* Notch */}
            <rect x="145" y="42" width="40" height="8" rx="4" className="fill-zinc-300 dark:fill-zinc-600" />

            {/* Tiny unreadable text lines. cramped and messy */}
            <line x1="118" y1="78" x2="208" y2="78" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="2" />
            <line x1="118" y1="84" x2="195" y2="84" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="2" />
            <line x1="118" y1="90" x2="202" y2="90" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1.5" />
            <line x1="118" y1="96" x2="190" y2="96" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1.5" />
            <line x1="118" y1="102" x2="205" y2="102" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
            <line x1="118" y1="107" x2="198" y2="107" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
            <line x1="118" y1="112" x2="210" y2="112" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
            <line x1="118" y1="117" x2="185" y2="117" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
            <line x1="118" y1="122" x2="200" y2="122" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
            <line x1="118" y1="127" x2="195" y2="127" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="0.75" />
            <line x1="118" y1="131" x2="208" y2="131" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="0.75" />
            <line x1="118" y1="135" x2="190" y2="135" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="0.75" />

            {/* Zoom gesture icon. two arrows pointing outward */}
            <circle cx="165" cy="195" r="18" className="fill-zinc-100 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-500" strokeWidth="1" />
            {/* Pinch arrows */}
            <line x1="155" y1="205" x2="148" y2="212" className="stroke-zinc-400 dark:stroke-zinc-400" strokeWidth="1.5" />
            <line x1="175" y1="185" x2="182" y2="178" className="stroke-zinc-400 dark:stroke-zinc-400" strokeWidth="1.5" />
            <polygon points="147,208 146,214 152,213" className="fill-zinc-400 dark:fill-zinc-400" />
            <polygon points="183,182 184,176 178,177" className="fill-zinc-400 dark:fill-zinc-400" />
            <text x="165" y="233" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">pinch to zoom</text>

            {/* RIGHT PHONE. Web Profile */}
            <text x="455" y="24" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Web Profile on Phone</text>

            {/* Phone outline */}
            <rect x="390" y="38" width="130" height="240" rx="16" className="fill-zinc-50 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="2" />
            {/* Screen area */}
            <rect x="400" y="58" width="110" height="195" rx="4" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            {/* Notch */}
            <rect x="435" y="42" width="40" height="8" rx="4" className="fill-zinc-300 dark:fill-zinc-600" />

            {/* Clean readable content */}
            {/* Avatar circle */}
            <circle cx="455" cy="82" r="14" className="fill-emerald-100 dark:fill-emerald-800 stroke-emerald-300 dark:stroke-emerald-600" strokeWidth="1" />
            <text x="455" y="86" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-300">JS</text>

            {/* Name */}
            <rect x="415" y="104" width="80" height="8" rx="2" className="fill-zinc-700 dark:fill-zinc-200" />
            {/* Title */}
            <rect x="420" y="118" width="70" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-500" />

            {/* Section divider */}
            <line x1="415" y1="134" x2="495" y2="134" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />

            {/* Clean readable text lines. well spaced */}
            <rect x="415" y="144" width="80" height="5" rx="1.5" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="415" y="156" width="72" height="5" rx="1.5" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="415" y="168" width="78" height="5" rx="1.5" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="415" y="180" width="65" height="5" rx="1.5" className="fill-zinc-300 dark:fill-zinc-600" />

            {/* Section divider */}
            <line x1="415" y1="196" x2="495" y2="196" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />

            {/* Skills pills */}
            <rect x="415" y="206" width="32" height="14" rx="7" className="fill-emerald-100 dark:fill-emerald-900/40 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.75" />
            <rect x="452" y="206" width="40" height="14" rx="7" className="fill-emerald-100 dark:fill-emerald-900/40 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.75" />
            <rect x="415" y="226" width="36" height="14" rx="7" className="fill-emerald-100 dark:fill-emerald-900/40 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.75" />

            {/* Checkmark */}
            <text x="455" y="300" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-emerald-500 dark:fill-emerald-400">Readable without zooming ✓</text>

            {/* VS label */}
            <text x="310" y="165" textAnchor="middle" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-zinc-300 dark:fill-zinc-600">vs</text>
          </svg>
        </div>

        <h2 className={h2}>The Power of Font Legibility</h2>
        <p>On a mobile screen, font choice is about style. It is about physical readability. A web-based profile uses web fonts tuned for back-lit screens, not paper. The contrast is higher, the character spacing is wider, and the eye does not have to work as hard.</p>
        <p>This matters especially if you want to ensure your <Link href="/tech-keywords" className={link}>technical keywords actually get seen</Link> during a fast mobile scan.</p>
        <p>When a reader does not have to strain to understand your words, they focus on your achievements. Physical comfort in reading leads to higher retention of what you actually did.</p>

        <h2 className={h2}>Websites Fix This Automatically</h2>
        <p>A web-based profile solves this through responsive design:</p>
        <ul className={ul}>
          <li><span className={bold}>Two columns on desktop</span> collapse into one column on mobile</li>
          <li>Text sizes adjust to stay readable across different resolutions</li>
          <li>Interactive elements like buttons are sized for finger-taps, not mouse-clicks</li>
          <li>The reader just scrolls down, the most natural phone gesture</li>
        </ul>

        <h2 className={h2}>Interactivity and Detail</h2>
        <p>A non-responsive PDF is static. A web profile can have expandable sections. If a recruiter is interested in a specific project, they can click to see more details without cluttering the main page view. This allows you to provide high-level summaries and detailed exploration in the same document without overwhelming the reader.</p>

        <h2 className={h2}>Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>Does a responsive profile work on older phones?</h3>
            <p>Yes. Our templates use standard modern CSS that works on any smartphone from the last decade. If they have a browser, your resume will look perfect.</p>
          </div>
          <div>
            <h3 className={h3}>Will my multi-column layout look confusing on mobile?</h3>
            <p>No. On mobile, columns are intelligently stacked vertically. Your sidebars and skills move naturally below your main summary so the text remains wide and legible.</p>
          </div>
          <div>
            <h3 className={h3}>Can recruiters see the desktop version on their phone?</h3>
            <p>It is best that they don&apos;t. Forcing the desktop view on a phone creates the "pinch-zoom" problem we are trying to solve. The responsive layout is designed specifically for their context.</p>
          </div>
        </div>

        <p>Test on your own phone after every profile edit. Rotate landscape. Check that nothing forces horizontal scroll. If you can read comfortably without zoom, most recruiters can too.</p>

        <h2 className={h2}>Thumb zone layout</h2>
        <p>Mobile readers hold the phone in one hand. Their thumb reaches the bottom center of the screen comfortably, not the top corners. Put primary actions and key facts where thumbs land: lower half of the first screen, large tap targets for links to GitHub, email, and portfolio.</p>
        <p>PDFs have no tap targets. URLs in tiny footers are nearly impossible to hit. Web profiles turn links into buttons. One tap opens your repo. Another opens your calendar. The recruiter stays in flow instead of fighting zoom.</p>

        <h2 className={h2}>Dark Mode and Bright Environments</h2>
        <p>Recruiters read on trains, in cafes, and in bed. Auto dark mode on a web profile keeps contrast readable without them adjusting settings. PDFs stay white or stay dark depending on how they were exported. Glare on a white PDF at night is a real friction point you never hear about because they simply close the file.</p>
        <div className={callout}>
          <h3 className={h3}>Contrast ratios matter</h3>
          <p>Light gray body text on cream backgrounds looks elegant in design blogs. On a phone at 7 AM it fails WCAG contrast and strains eyes. <span className={bold}>Readable beats pretty</span> for hiring documents. CVin.Bio templates default to accessible contrast on every breakpoint.</p>
        </div>

        <h2 className={h2}>Network Speed and PDF Weight</h2>
        <p>A designed PDF with embedded images can exceed 2 MB. On a weak LTE connection the download stalls. The recruiter switches apps. A lightweight web page loads in under a second on the same connection because HTML and CSS cache globally.</p>
        <p>Mobile performance also affects how <Link href="/bots" className={link}>automated screening tools</Link> score you if they crawl your public profile. Fast pages rank higher in internal search tools some teams build on top of candidate databases.</p>

        <h2 className={h2}>Screen Size Diversity</h2>
        <p>iPhone SE, Galaxy Ultra, and iPad split view all need to work. Responsive breakpoints reflow content at 320px, 768px, and 1024px widths. PDFs scale uniformly smaller, which is the opposite of what small screens need. They need larger text and stacked layout, not shrunken desktop mockups.</p>
        <p>Test on your own phone after every profile edit. Rotate landscape. Check that nothing forces horizontal scroll. If you can read comfortably without zoom, most recruiters can too.</p>

        <h2 className={h2}>Notifications and Deep Links</h2>
        <p>Recruiters open links from push notifications on locked phones. Your profile should load without requiring desktop layout. Login walls kill conversion. Password protected portfolios force recruiters to request access and wait. Public CVin.Bio pages load instantly with your strongest material above the fold.</p>
        <p>Deep links to specific projects help when a recruiter forwards your profile to a specialist. One URL for the overview, anchor links for case studies if your template supports them.</p>

        <h2 className={h2}>Orientation and One Handed Use</h2>
        <p>Many recruiters read while walking. One handed scroll means they skip tiny links at the top right corner. Put critical links in the thumb zone. Phone numbers as tap to call links beat plain text numbers they have to memorize.</p>
        <p>Landscape mode on phones should not break your layout. Tables that overflow horizontally are a common failure. Stacked cards survive rotation.</p>

        <h2 className={h2}>Accessibility Standards Help Everyone</h2>
        <p>Screen reader compatibility, large tap targets, and high contrast help recruiters with vision strain as much as they help compliance audits. Mobile friendly profiles tend to ace these checks because they were built for small screens and variable lighting.</p>
        <p>PDFs rarely expose heading structure to assistive tools unless exported with care. HTML profiles expose headings, lists, and links natively. Another reason parsers and humans both prefer the web format.</p>

        <h2 className={h2}>Recruiter Workflow on Mobile</h2>
        <p>Typical flow: notification, tap link, skim for six seconds, star candidate or archive. Star requires confidence in title, stack, and recency. Archive happens when pinch zoom is required. Design for the star path. Large title, visible dates, tappable project links.</p>
        <p>Second session may happen on desktop later. Mobile first design still wins the first gate.</p>

        <h2 className={h2}>Split View and Tablet Recruiting</h2>
        <p>iPad split screen is common for recruiters comparing two candidates side by side. Narrow columns force tighter layouts. Responsive profiles reflow instead of clipping. PDFs in split view become illegible thumbnails.</p>
        <p>Test your profile at 50 percent browser width on desktop to simulate split view. If it still reads cleanly, you are ready for tablet workflows.</p>
        <p>Mobile recruiting is not a niche behavior. It is the first gate in most pipelines. Win mobile and you earn the desktop deep read. Fail mobile and the desktop read never happens.</p>
        <p>Pin your profile link in your phone notes app and open it yourself every Monday. If you cringe at tiny text or broken layout, fix it before a recruiter feels the same friction on their commute.</p>
        <p>Responsive profiles turn six second scans into sixty second reads because reading stays comfortable. That extra minute is where your best bullets finally get seen.</p>
        <p>Test on the smallest phone you own. If it works there, it works everywhere recruiters actually read. That single test prevents most mobile resume failures before you apply.</p>
        <p>Mobile layout is part of your professional brand. Treat it with the same care you give code review before merge.</p>
        <p>Recruiters notice when a profile respects their device. They notice faster when it fights them.</p>
        <p>Fix mobile first. Everything else in your hiring stack depends on that first click loading cleanly.</p>
        <p>Your profile should read like a good mobile app: fast, legible, and obvious where to tap next.</p>
        <p>Mobile first is recruiter first in most hiring funnels today.</p>
        <p>Test on phone before you test on desktop.</p>

        <h2 className={h2}>Email clients and link previews</h2>
        <p>Recruiters open profiles from Gmail, Outlook, and Superhuman on phones. A bare URL with no preview text looks suspicious. A CVin.Bio link shows your name and title in the preview card. PDF attachments show a paperclip and a filename. The preview card wins the tap when someone is triaging fifty messages on a commute.</p>
        <p>Put the link on its own line in outreach emails. Long URLs wrapped mid-string break tap targets. Short branded paths are easier to thumb-tap than deep attachment menus buried under three dots.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/load-time" className={link}>Why load time affects recruiter patience</Link></li>
          <li><Link href="/fonts" className={link}>Font choices for screen reading</Link></li>
        </ul>
      </div>
  );
}
