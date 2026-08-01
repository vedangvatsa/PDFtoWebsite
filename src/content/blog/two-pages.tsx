import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>One of the most destructive and persistent pieces of career advice ever created is the absolute strict mandate that your professional history must perfectly fit onto a single physical piece of paper. This rule was invented forty years ago when human resources departments literally stored applicant sheets in giant steel filing cabinets and extra paper cost physical money. Applying this ancient physical constraint to modern digital rendering is complete strategic insanity.</p>
        <p>When professionals with seven years of deep technical experience blindly obey the single page rule they inevitably completely destroy their own formatting. They aggressively shrink their fonts to microscopically unreadable levels and completely delete their margins creating an overwhelming wall of dense black text. When a recruiter opens a dense claustrophobic document their brain instantly fatigues and they instinctively close the tab.</p>
        
        <h2 className={h2}>The Infinite Digital Scroll</h2>
        <p>The entire framework of pagination is utterly meaningless in the era of web links and digital profiles. A hiring manager using a modern high resolution display or a mobile phone does not experience your history as discrete physical pages. They experience it as a continuous vertical scroll. If your content is genuinely interesting and beautifully formatted they will happily flick their thumb and scroll for as long as it takes to ingest your value.</p>
        <p>You must completely stop treating white space as your enemy. Blank space is a premium luxurious design tool that forces the readers eye to naturally pause and absorb your most critical achievements. If adding proper margins and spacing forces your digital summary to extend to what would traditionally be considered a second page you should celebrate the increased readability.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 320" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Divider */}
            <line x1="340" y1="10" x2="340" y2="310" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

            {/* LEFT: Cramped */}
            <text x="160" y="24" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-400">Cramped 1 Page</text>

            <rect x="40" y="38" width="220" height="240" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

            {/* Dense text lines - very tight spacing */}
            {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26].map((i) => (
              <rect
                key={`dense-${i}`}
                x="48"
                y={44 + i * 8.5}
                width={160 + (i % 3) * 15 - (i % 5) * 8}
                height="3"
                rx="1"
                className="fill-zinc-400 dark:fill-zinc-500"
              />
            ))}

            {/* Margin indicators */}
            <line x1="44" y1="38" x2="44" y2="278" className="stroke-red-300 dark:stroke-red-600" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="256" y1="38" x2="256" y2="278" className="stroke-red-300 dark:stroke-red-600" strokeWidth="0.5" strokeDasharray="2 2" />

            {/* Label */}
            <rect x="60" y="286" width="180" height="22" rx="4" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="0.5" />
            <text x="150" y="301" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-red-400">8pt font · 0.3in margins · painful</text>

            {/* RIGHT: Spacious */}
            <text x="510" y="24" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-500">Spacious Layout</text>

            <rect x="410" y="38" width="230" height="240" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

            {/* Section 1 header */}
            <rect x="436" y="52" width="80" height="5" rx="1" className="fill-zinc-400 dark:fill-zinc-500" />
            {/* Section 1 body */}
            <rect x="436" y="66" width="170" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="436" y="78" width="150" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="436" y="90" width="175" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />

            {/* Section 2 header */}
            <rect x="436" y="116" width="90" height="5" rx="1" className="fill-zinc-400 dark:fill-zinc-500" />
            {/* Section 2 body */}
            <rect x="436" y="130" width="160" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="436" y="142" width="140" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="436" y="154" width="170" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />

            {/* Section 3 header */}
            <rect x="436" y="180" width="70" height="5" rx="1" className="fill-zinc-400 dark:fill-zinc-500" />
            {/* Section 3 body */}
            <rect x="436" y="194" width="155" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="436" y="206" width="130" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="436" y="218" width="165" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />

            {/* Good margin indicators */}
            <line x1="428" y1="38" x2="428" y2="278" className="stroke-emerald-300 dark:stroke-emerald-600" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="632" y1="38" x2="632" y2="278" className="stroke-emerald-300 dark:stroke-emerald-600" strokeWidth="0.5" strokeDasharray="2 2" />

            {/* Label */}
            <rect x="430" y="286" width="180" height="22" rx="4" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="0.5" />
            <text x="520" y="301" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-500">11pt font · proper margins · inviting</text>
          </svg>
        </div>

        
        <div className={callout}>
          <h3 className={h3}>The Seniority Threshold</h3>
          <p>The single page rule only applies if you possess fewer than three years of professional experience. If you are entirely new to the industry stretching your background across two pages clearly signals that you are aggressively padding your history with irrelevant fluff. However the moment you cross the threshold into mid level architecture a heavily truncated one page profile signals that you failed to achieve anything complex enough to warrant detailed explanation.</p>
        </div>

        <h2 className={h2}>Ruthless Pruning is Still Required</h2>
        <p>Expanding your digital footprint does not give you permission to hoard ancient irrelevant data. You must still aggressively delete the bizarre side jobs you held a decade ago that possess absolutely zero intersection with the role you want today. Giving yourself permission to use more vertical space simply means you are dedicating that premium space entirely to fully unpacking the technical complexity of your three most recent and massive career victories.</p>
        <p>Treat your expanded real estate with immense respect. Every extra line you take must mathematically justify its existence by delivering a highly specific quantifiable business outcome.</p>

        <h2 className={h2}>Where the One Page Rule Came From</h2>
        <p>Human recruiters in the 1980s physically stacked paper on desks. Extra pages fell off, got lost, or annoyed busy executives. The rule was logistics, not quality judgment. Today your resume lives on screens that scroll for miles. TikTok trains people to swipe. LinkedIn feeds never end. Expecting a senior engineer to compress fifteen years into 400 words is absurd.</p>
        <p>Junior candidates still benefit from brevity. If you have one internship and a bootcamp project, one page is plenty. The mistake is applying that junior rule to a staff level candidate who led a platform migration across four teams.</p>

        <h2 className={h2}>Two Pages on the Web Is Not Two Pages on Paper</h2>
        <p>A two page PDF on a laptop feels cramped. A two page scroll on a web profile feels normal. Sections breathe. Headings create stops. The reader controls pace. This is why <Link href="/attachments" className={link}>links beat attachments</Link> for experienced hires. You are not fighting a print driver. You are designing for a browser.</p>
        <div className={callout}>
          <h3 className={h3}>Scroll depth is engagement</h3>
          <p>Analytics on portfolio sites routinely show readers who scroll past the fold spend more time on page, not less. <span className={bold}>Long profiles work when every screen has a payoff.</span> Dense one page PDFs often get closed before the fold because the font is already tiny.</p>
        </div>

        <h2 className={h2}>What to Put on Page Two</h2>
        <p>Page two is not a dumping ground for every job since college. Use it for depth on your three most recent roles. Add a second bullet where the first one teased a complex migration. Explain the tradeoff you made. Name the metric that moved.</p>
        <ul className={ul}>
          <li>Architecture decisions with constraints and outcomes</li>
          <li>Cross team leadership with headcount and timeline</li>
          <li>Links to write ups, talks, or postmortems for curious readers</li>
        </ul>
        <p>Skip the college club presidency. Skip the unrelated retail job from 2012 unless you are a career switcher and it explains the pivot.</p>

        <h2 className={h2}>Seniority and Length Expectations</h2>
        <p>Recruiters expect more detail from senior candidates, not less. A principal engineer who lists only titles and dates looks evasive. A mid level developer with four pages of fluff looks lost. Match length to signal density. Every line should earn its pixels.</p>
        <p>Web profiles on CVin.Bio remove the artificial ceiling entirely. Use <Link href="/tech-keywords" className={link}>clear hierarchy</Link> so scanners see the right words first. Use <Link href="/spacing" className={link}>generous spacing</Link> so nothing feels cramped. Length becomes a function of content quality, not paper size.</p>

        <h2 className={h2}>Print Still Happens Sometimes</h2>
        <p>Occasionally a hiring manager prints your profile for an onsite packet. Web pages print cleaner than cramped PDFs because the browser reflows for paper width. You do not design for print first, but you do not break print either. One page printed summary plus live link on the header covers both worlds.</p>
        <p>The one page rule survives only in industries that still fax contracts. Tech hiring lives on screens. Design for screens.</p>

        <h2 className={h2}>Metrics That Justify Length</h2>
        <p>Each extra bullet should answer a skeptic question. How big was the system? How many users? How much money moved? How many engineers reported to you? Vague expansion reads as padding. Metric expansion reads as evidence.</p>
        <p>If you cannot add metrics, add mechanism. Explain the architecture decision, the tradeoff, and the failure mode you avoided. Senior readers respect mechanism even when revenue numbers are confidential.</p>

        <h2 className={h2}>Hiring Manager Reading Sessions</h2>
        <p>Panel reviews often happen on a shared screen in a conference room. Someone scrolls your profile while five people watch. Dense one page PDFs force constant zooming on the projector. A clean scrolling web page lets the room read together at a comfortable font size. You win visibility in the room and on individual laptops.</p>
        <p>Prepare a profile that survives both solo mobile scan and group desktop review. Same URL, two contexts, zero extra files.</p>

        <h2 className={h2}>International Candidates and Page Limits</h2>
        <p>Some countries still teach strict one page CV rules for visa paperwork. Separate immigration documents from your tech hiring profile. The visa CV can stay short. Your CVin.Bio profile can carry the depth US and EU tech hiring expects for senior roles.</p>
        <p>Confusing those two documents costs candidates either a thin web profile or an overstuffed visa form. Keep purposes separate.</p>

        <h2 className={h2}>Length and Senior Promotions</h2>
        <p>Promotion packets inside companies often want long internal CVs. External hiring profiles can be shorter than internal promotion docs but longer than college one page rules. Match external profiles to the role level you want next, not the title you already hold.</p>
        <p>Staff and principal candidates should look dense with decisions, not dense with words. More pages of vague duties hurt. More pages of specific tradeoffs help.</p>
        <p>When you feel pressure to cut content, cut old roles first. Keep depth on the last five years. That rule alone usually frees enough space without shrinking fonts.</p>
        <p>Page count is a PDF anxiety metric. Scroll depth is a web engagement metric. Aim for engagement on the format you actually send.</p>
        <p>Senior hires should look senior on screen. Give your strongest work room to breathe. The one page myth mainly protected recruiters from bad layout, not from good content.</p>
        <p>If your best project needs four bullets to explain, use four bullets. Compression that hides scope hurts senior candidates more than extra scroll length ever could.</p>
        <p>Give complex work the space it deserves on a web profile. The scroll is free. The interview slot is not.</p>
        <p>Stop counting pages. Start counting proof per screen.</p>
        <p>Readable depth wins interviews. Cramped brevity loses them.</p>

        <h2 className={h2}>Consulting blocks on long profiles</h2>
        <p>Five similar six-month contracts can read as job hopping on two pages. Group them under one heading: &quot;Independent consulting (2021 to 2023)&quot; with three outcome bullets across clients. You keep depth without repeating company logos. Web profiles handle grouped sections cleanly; cramped PDFs force ugly abbreviations.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/truncation" className={link}>How to avoid parser truncation on long profiles</Link></li>
          <li><Link href="/bullets" className={link}>Write shorter, heavier job detail bullets</Link></li>
          <li><Link href="/update" className={link}>Fix and expand your profile after you share the link</Link></li>
        </ul>
      </div>
  );
}
