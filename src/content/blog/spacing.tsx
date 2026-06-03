import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>A tired recruiter sits at their desk late in the evening. They have scanned two hundred applications today. They open another file and their eyes instantly strain. The page is a solid block of gray. The margins are a tiny quarter inch. The font is an eight point size with zero breathing room. The text runs edge to edge with no line breaks. The recruiter feels immediate fatigue and closes the tab. Your experience was outstanding but your formatting choices kept it from being read.</p>
      
      <p>This is the real consequence of poor spacing. Candidates think they are being efficient by cramming every detail onto one page. They treat their profile like a suitcase they need to pack to the brim. In reality they are building a visual barrier. Humans naturally avoid massive walls of dense text. You must design your layout to invite the reader in.</p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 300" className="w-full h-auto" role="img" aria-label="Visual comparison of a cramped layout with tiny margins versus a spacious, readable layout.">
          <text x="170" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">Cramped Layout (0.25in margins)</text>
          
          <rect x="20" y="50" width="300" height="200" rx="6" className="fill-zinc-50 dark:fill-zinc-800/40 stroke-red-200 dark:stroke-red-900/50" strokeWidth="1" />
          
          <line x1="30" y1="70" x2="310" y2="70" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="4" />
          <line x1="30" y1="80" x2="280" y2="80" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2.5" />
          
          <line x1="30" y1="100" x2="310" y2="100" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="4" />
          <line x1="30" y1="110" x2="290" y2="110" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2.5" />
          <line x1="30" y1="120" x2="300" y2="120" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2.5" />
          <line x1="30" y1="130" x2="270" y2="130" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2.5" />

          <line x1="30" y1="150" x2="310" y2="150" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="4" />
          <line x1="30" y1="160" x2="295" y2="160" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2.5" />
          <line x1="30" y1="170" x2="285" y2="170" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2.5" />
          
          <text x="170" y="235" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">Tires the reader in 5 seconds</text>
          
          <text x="530" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Spacious Layout (0.75in margins)</text>
          
          <rect x="380" y="50" width="300" height="200" rx="6" className="fill-emerald-50/50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-900/50" strokeWidth="1" />
          
          <line x1="410" y1="75" x2="650" y2="75" className="stroke-zinc-900 dark:stroke-zinc-100" strokeWidth="5" />
          <line x1="410" y1="90" x2="590" y2="90" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="3" />
          
          <line x1="410" y1="120" x2="650" y2="120" className="stroke-zinc-900 dark:stroke-zinc-100" strokeWidth="5" />
          <line x1="410" y1="135" x2="620" y2="135" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="3" />
          <line x1="410" y1="150" x2="600" y2="150" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="3" />
          
          <line x1="410" y1="180" x2="650" y2="180" className="stroke-zinc-900 dark:stroke-zinc-100" strokeWidth="5" />
          <line x1="410" y1="195" x2="610" y2="195" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="3" />
          
          <text x="530" y="235" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Invites the eye to scan</text>
          
          <line x1="350" y1="20" x2="350" y2="270" className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      <h2 className={h2}>The Mathematical Standard for Margins</h2>
      <p>The absolute baseline for margins is three quarters of an inch on all sides. You must never go below this number. If you are struggling to fit your experience you might be tempted to reduce your margins to a half inch or less. This is a mistake. It forces the text to crash into the edges of the screen. It looks desperate and messy.</p>
      
      <p>Having generous margins creates a natural frame for your content. It signals that you are organized and know how to prioritize your information. It gives the reader a place to rest their eyes while they scan your career timeline.</p>
      
      <p>For online profiles this standard is even more important. Mobile screens are narrow. If your text has no side margins it will touch the physical bezel of the phone. This makes reading almost impossible. Your web profile must have automatic responsive padding to protect the reading grid.</p>

      <h2 className={h2}>Line Spacing and Font Hierarchy</h2>
      <p>Line spacing should sit between one point one five and one point five. Single line spacing is too dense for digital reading. It causes the eye to skip lines or lose its place. Generous line height makes each sentence stand out on its own.</p>
      
      <p>Your font size hierarchy should be clear and consistent. Your name at the top should be the largest text on the page. Section headers should be slightly smaller but bold. Job titles and body text must be the smallest but still completely readable. Do not go below ten point font for your body text. Anything smaller forces the reader to pinch and zoom.</p>

      <p>This hierarchy acts as a roadmap. The reader should be able to scan the page from five feet away and identify the different sections. If all your text is the same size and weight the document looks like a single continuous paragraph. The mind naturally rejects this pattern.</p>

      <div className={callout}>
        <h3 className={h3}>The Line Height Check</h3>
        <p>Open your document on your phone. If you have to squint to separate the lines of text your line height is too low. Increase the line spacing to one point two five. This small adjustment will instantly open up the layout and make it feel more professional.</p>
      </div>

      <h2 className={h2}>Section Breaks and Visual Breathing Room</h2>
      <p>You must separate your sections with clear whitespace. Do not rely on thin lines or borders to do this work. Whitespace itself is the best divider. Leave a generous gap between your work experience and your education section.</p>

      <p>These gaps act as mental pauses. They tell the recruiter that one topic has ended and a new one is beginning. This prevents the different parts of your career from blending together. It keeps your timeline clean and distinct.</p>

      <p>Using lines and boxes to separate sections can actually backfire. Too many visual elements make the page look busy. They distract from the actual text. Let the empty space do the work of dividing your content.</p>

      <p>When you are designing layout spacing remember the vertical line test. Imagine drawing a vertical line down the center of your page. If that line intersects dense text continuously without encountering whitespace your layout is too dense. You need to introduce structural padding to allow the eye to wander. A good design has regular horizontal bands of pure whitespace that act as breathing buffers.</p>

      <h2 className={h2}>The Myth of the Single Page Constraint</h2>
      <p>Many candidates ruin their spacing because they are obsessed with the single page rule. They believe that a two page profile is an automatic rejection. This is a legacy concept from the days of physical paper. Recruiters do not print out documents anymore. They scroll on screens.</p>

      <p>It is far better to have a clean two page profile with great spacing than a cramped one page profile with tiny margins. The recruiter will happily scroll down if the content is easy to read. They will not struggle through a dense wall of text just because it fits on one sheet.</p>

      <p>When you use a web link for your application length becomes irrelevant. The user simply swipes up to read more. There are no page boundaries to worry about. You can use generous spacing without worrying about where the page break falls.</p>

      <h2 className={h2}>How to Reclaim Space Without Shrinking Margins</h2>
      <p>If you are worried about your profile becoming too long you must edit your text. Do not shrink your margins. Shrinking margins is a lazy fix that ruins the reading experience. Instead you must look at your writing.</p>

      <p>Delete duplicate bullet points. Remove ancient roles that have no relevance to your current career goals. Clean up your phrasing by using shorter words. This editing process makes your writing stronger while naturally freeing up space on the page.</p>

      <p>Every line on your profile must earn its place. If a bullet point does not prove your value delete it. This ruthless pruning is what makes your document look polished and professional. It shows you respect the time of the hiring manager.</p>

      <h2 className={h2}>Why Digital Layouts Require New Standards</h2>
      <p>Digital displays render text differently than paper. Backlit screens cause eye strain much faster than printed sheets. This means your spacing must be even more generous than it was in the past. You need to give the reader more breathing room to combat screen fatigue.</p>

      <p>This is why static documents are failing. They were designed for print shops not for modern phone screens. A web profile built with modern CSS padding is the best way to handle this shift. It automatically adjusts the spacing based on the device shape and size.</p>

      <p>By using a dedicated link you ensure your formatting stays locked in. You do not have to worry about different software versions mangling your margins. The page will look exactly the same to the recruiter as it does to you.</p>

      <h2 className={h2}>Read Next</h2>
      <p>Once you have fixed your spacing you should choose the right font. Read our article on the <Link href="/fonts" className={link}>best fonts for ATS parsing</Link> to ensure your text is readable. If you want to replace your outdated career goals check out the <Link href="/replacements" className={link}>best career objective replacements</Link> that recruiters actually value.</p>
    </div>
  );
}
