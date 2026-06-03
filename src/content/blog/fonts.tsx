import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>A designer spends two weeks building a beautiful portfolio. They select a rare custom font they purchased online. They believe the stylized letters show their artistic personality and attention to detail. But when they submit the file to an application system the software scanner breaks. The parser cannot extract the text. It registers the entire document as a string of empty boxes and gibberish. The application is automatically filtered out before a human ever looks at it.</p>
      
      <p>This is the hidden trap of custom fonts. What looks beautiful to your eye can be unreadable to a machine. Application systems rely on standard character encoding to read files. When you use non standard fonts you risk complete parser failure. You must prioritize compatibility over decoration.</p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 300" className="w-full h-auto" role="img" aria-label="Visual comparison of unsafe custom fonts failing parsing versus clean standard fonts succeeding.">
          <text x="170" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">Complex Unsafe Fonts</text>
          
          <rect x="20" y="50" width="300" height="200" rx="6" className="fill-zinc-50 dark:fill-zinc-800/40 stroke-red-200 dark:stroke-red-900/50" strokeWidth="1" />
          
          <path d="M 60 100 C 80 80, 90 120, 110 100 C 130 80, 140 120, 160 100" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="3" fill="none" />
          <text x="60" y="140" fontSize="20" fontFamily="Georgia, serif" fontStyle="italic" className="fill-zinc-400 dark:fill-zinc-500">Decorative Cursive</text>
          
          <rect x="60" y="170" width="220" height="30" rx="4" className="fill-red-100 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
          <text x="170" y="190" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">Parser Output: [Error/Gibberish]</text>
          
          <text x="530" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Clean Standard Fonts</text>
          
          <rect x="380" y="50" width="300" height="200" rx="6" className="fill-emerald-50/50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-900/50" strokeWidth="1" />
          
          <text x="420" y="95" fontSize="18" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Inter & Arial</text>
          <text x="420" y="115" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Standard clean sans-serif geometry</text>
          
          <text x="420" y="150" fontSize="18" fontWeight="700" fontFamily="Georgia, serif" className="fill-zinc-900 dark:fill-zinc-100">Georgia & Garamond</text>
          <text x="420" y="170" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Traditional readable serif details</text>
          
          <rect x="420" y="195" width="220" height="30" rx="4" className="fill-emerald-100 dark:fill-emerald-900/20 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1" />
          <text x="530" y="215" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Parser Output: 100% Readable</text>
          
          <line x1="350" y1="20" x2="350" y2="270" className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      <h2 className={h2}>Why Parsing Software Struggles with Custom Fonts</h2>
      <p>Parsing programs do not look at images of letters. They read code representation underneath. Every letter you type corresponds to a standard unicode value. Standard fonts map these unicode values to standard letter shapes.</p>
      
      <p>Custom or stylized fonts often mess up this mapping. They might use custom tables that translate standard keystrokes into strange shapes. When the parser reads the file it sees the wrong characters. It might extract a word like developer as a string of symbols. This makes it impossible for the search algorithms to match you with job openings.</p>
      
      <p>To avoid this issue you must stick to system fonts. These are fonts that are preinstalled on almost all computers. They have perfect unicode maps. They are guaranteed to parse correctly in every modern tracking system.</p>

      <h2 className={h2}>The Best Sans Serif Options for Screens</h2>
      <p>Sans serif fonts are clean and have no small decorative strokes at the ends of letters. They render beautifully on modern high resolution screens. They are the best choice for tech jobs.</p>
      
      <p>Arial is the most compatible sans serif font in the world. It is preinstalled on every operating system. It parses perfectly in every software system. While some designers find it boring its utility is unmatched.</p>

      <p>Calibri is another solid option. It is the default font for Microsoft Word for many years. It is slightly softer than Arial and looks professional on screen. Inter is a modern favorite for developers. It is built specifically for computer screens and has great letter spacing.</p>

      <div className={callout}>
        <h3 className={h3}>The Font Test</h3>
        <p>Export your profile to a standard text file. If the resulting text has missing characters or weird spacing your font choice is broken. Switch to Arial or Calibri immediately. This will restore clean computer readability.</p>
      </div>

      <h2 className={h2}>Serif Options for Traditional Industries</h2>
      <p>Serif fonts have small decorative feet on the ends of the letters. They are traditional and formal. They work well for roles in finance or law where structure is highly valued.</p>

      <p>Times New Roman is the classic choice. It is highly readable in print and on screen. However it can look a bit dated to tech recruiters. If you want a more modern serif choice consider Georgia.</p>

      <p>Georgia was designed specifically for low resolution screens. It has larger lowercase letters and generous spacing. It looks warm and authoritative without looking old. Garamond is another elegant choice that saves space on the page because it is slightly narrower.</p>

      <h2 className={h2}>Font Metrics and Screen Legibility</h2>
      <p>When selecting a font you must understand the concept of x height. This metric defines the height of the lowercase letters compared to the uppercase letters. Fonts with a high x height are much easier to read on small screens. Inter and Verdana have high x heights. This design ensures that tiny letters do not blur together when read on a phone.</p>

      <p>You must also pay attention to letter spacing. If the characters are too close together the machine scanner can misread them. For example a lowercase r and a lowercase n can merge to look like a lowercase m. This crowding confuses parser dictionaries. Choose a font with built in breathing room between characters to prevent these errors.</p>

      <p>Proper kerning is another benefit of standard fonts. Kerning is the adjustment of space between specific pairs of letters. Standard fonts have refined kerning tables that prevent rendering bugs across different web browsers. This keeps your text clean and uniform no matter what device the recruiter is using.</p>

      <h2 className={h2}>System UI Fonts vs Custom Web Fonts</h2>
      <p>System UI fonts are the native typefaces used by computer operating systems. Apple uses San Francisco. Microsoft uses Segoe UI. Google Android uses Roboto. Linux uses DejaVu. When you set your profile to use system fonts it instantly feels native to the user device.</p>

      <p>These native fonts require zero loading time. They are already stored on the device hardware. This makes your web page load incredibly fast. Fast load times improve your discoverability on search engines because page speed is a ranking signal.</p>

      <p>Custom web fonts can be gorgeous but they require network requests. If the recruiter has a weak mobile signal the font file might fail to load. This causes the browser to show raw unstyled text. Stick to system font stacks to ensure your presentation remains solid under any network conditions.</p>

      <h2 className={h2}>Fonts You Must Avoid at All Costs</h2>
      <p>You must never use script or cursive fonts on your profile. They are impossible for machine scanners to read. They also look unprofessional to human recruiters who want to scan information quickly.</p>

      <p>Avoid novelty fonts like Comic Sans or Impact. They destroy your professional credibility instantly. You should also avoid using light or thin font weights. Thin fonts disappear on bright screens and make the text look washed out.</p>

      <p>Do not use multiple font families on the same page. This looks chaotic and messy. Stick to one font family for the entire document. You can use bold weights of that same family to create your visual hierarchy.</p>

      <h2 className={h2}>The Danger of Converting to Outlines</h2>
      <p>Some designers try to bypass font issues by converting their text to vector paths or outlines in design software. This preserves the exact look of their custom font on any screen. But this is a disaster for applications.</p>

      <p>When you convert text to paths you destroy the text layer. The file becomes a collection of shapes rather than words. The parsing software will read the document as a completely blank page. You must always keep your text editable and highlightable.</p>

      <p>A good rule of thumb is to try selecting the text in your final file. If you cannot highlight individual words with your cursor the parser cannot read them either. Always test this before submitting your application.</p>

      <h2 className={h2}>How Web Profiles Standardize Your Font Delivery</h2>
      <p>Static documents rely on the font files being installed on the reader's computer. If the recruiter does not have your custom font installed their system will swap it for a generic default. This default swap can break your spacing and push your text onto new pages.</p>

      <p>A web profile solves this delivery issue. It packages the clean font files directly into the web code. The page loads the exact same typography on the recruiter's phone as it does on your screen. This ensures your layout remains perfect and professional.</p>

      <p>It also allows you to use modern web fonts like Inter or Roboto without worrying about local system compatibility. The web browser handles the rendering work. This guarantees a clean presentation every single time.</p>

      <h2 className={h2}>Read Next</h2>
      <p>Once you have chosen a clean font you must set the correct margins. Read our guide on the <Link href="/spacing" className={link}>best CV spacing standards</Link> to polish your layout. You should also check out the <Link href="/replacements" className={link}>best career objective replacements</Link> to make sure your content is as strong as your formatting.</p>
    </div>
  );
}
