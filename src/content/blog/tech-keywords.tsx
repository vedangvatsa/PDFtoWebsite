import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <h2 className={h2}>Stop Burying Your Keywords</h2>
        <p>Most resumes bury critical information inside dense paragraphs. A recruiter looking for React experience has to read through three sentences about team size and timelines before finding &quot;React&quot; mentioned casually on line four. <span className={bold}>By that point, they have already left.</span> This is why many candidates <Link href="/inbox" className={link}>fail the initial scan</Link> entirely.</p>
        <div className={callout}>
          <h3 className={h3}>How recruiters actually scan</h3>
          <p>Eyes follow an <span className={bold}>F-shaped pattern</span>: read the top line, drop down the left edge, scan again. If your keywords are not in those zones, they literally do not register. This behavior is amplified when they are <Link href="/mobile" className={link}>scanning on a small phone screen</Link>.</p>
        </div>
        <p>The fix is simple:</p>
        <ul className={ul}>
          <li><span className={bold}>Pull keywords out of paragraphs</span> and into standalone positions</li>
          <li>Use clear headings like &quot;Stack&quot; instead of burying tools in sentences</li>
          <li>Front-load every bullet with the technology name first</li>
        </ul>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 660 340" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Title */}
            <text x="330" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">The 6-Second Z-Scan</text>

            {/* Resume rectangle */}
            <rect x="160" y="46" width="340" height="280" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" />

            {/* Left margin accent strip */}
            <rect x="160" y="46" width="6" height="280" rx="3" className="fill-amber-400/40 dark:fill-amber-500/30" />
            <text x="148" y="186" textAnchor="end" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-amber-600 dark:fill-amber-400" transform="rotate(-90 148 186)">Eye lingers here</text>

            {/* Fake resume content. header area */}
            <rect x="190" y="62" width="140" height="10" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="190" y="78" width="90" height="6" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="350" y="62" width="130" height="10" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="380" y="78" width="100" height="6" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Divider */}
            <line x1="180" y1="98" x2="480" y2="98" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

            {/* Section lines. experience */}
            <rect x="190" y="110" width="80" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="190" y="128" width="280" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="190" y="140" width="260" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="190" y="152" width="240" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="190" y="164" width="270" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Section lines. skills */}
            <rect x="190" y="186" width="60" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="190" y="204" width="250" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="190" y="216" width="230" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Section lines. education */}
            <rect x="190" y="238" width="80" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="190" y="256" width="200" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="190" y="268" width="160" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Bottom lines */}
            <rect x="190" y="290" width="240" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="190" y="302" width="200" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Z-scan arrow path */}
            {/* Top-left to top-right */}
            <line x1="192" y1="67" x2="472" y2="67" className="stroke-blue-500 dark:stroke-blue-400" strokeWidth="2.5" strokeDasharray="6 3" />
            <polygon points="472,63 480,67 472,71" className="fill-blue-500 dark:fill-blue-400" />

            {/* Diagonal: top-right to bottom-left */}
            <line x1="475" y1="72" x2="195" y2="285" className="stroke-blue-500 dark:stroke-blue-400" strokeWidth="2.5" strokeDasharray="6 3" />
            <polygon points="199,281 191,289 195,290" className="fill-blue-500 dark:fill-blue-400" />

            {/* Bottom-left to bottom-right */}
            <line x1="195" y1="296" x2="472" y2="296" className="stroke-blue-500 dark:stroke-blue-400" strokeWidth="2.5" strokeDasharray="6 3" />
            <polygon points="472,292 480,296 472,300" className="fill-blue-500 dark:fill-blue-400" />

            {/* Numbered dots at each Z corner */}
            <circle cx="190" cy="67" r="10" className="fill-blue-500 dark:fill-blue-400" />
            <text x="190" y="71" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-white">1</text>

            <circle cx="480" cy="67" r="10" className="fill-blue-500 dark:fill-blue-400" />
            <text x="480" y="71" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-white">2</text>

            <circle cx="190" cy="290" r="10" className="fill-blue-500 dark:fill-blue-400" />
            <text x="190" y="294" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-white">3</text>

            <circle cx="480" cy="296" r="10" className="fill-blue-500 dark:fill-blue-400" />
            <text x="480" y="300" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-white">4</text>

            {/* Legend labels */}
            <text x="530" y="70" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-blue-600 dark:fill-blue-400">Name / Title</text>
            <text x="530" y="186" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-blue-600 dark:fill-blue-400">Diagonal scan</text>
            <text x="530" y="299" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-blue-600 dark:fill-blue-400">Skills / Dates</text>
          </svg>
        </div>

        <h2 className={h2}>Managing Cognitive Load</h2>
        <p>Every time a recruiter has to hunt for information, their cognitive load increases. When they get tired or frustrated, they default to "No." Your goal is to make the "Yes" decision as physically effortless as possible. This means perfect contrast, large enough fonts, and a layout that tells them exactly where to look next.</p>

        <h2 className={h2}>White Space Is a Feature</h2>
        <p>When every inch of your resume is packed with text, <span className={bold}>nothing stands out</span>. Everything blurs into a single grey block. Adding generous margins around headings and breathing room between bullets makes each piece of information distinct and scannable.</p>
        <p>A web-based profile enforces this naturally because the template handles spacing, fonts, and hierarchy for you. You do not have to fight the urge to "fill the page." This is a core benefit of <Link href="/attachments" className={link}>ditching the restricted A4/Letter format</Link>.</p>

        <h2 className={h2}>Visual Anchors and Scanning Signals</h2>
        <p>Use visual anchors like bold text for job titles and skill names. These act as "scanning signals" that help the recruiter jump from one relevant point to the next. If they can see "Senior Dev," "Node.js," and "AWS" in under two seconds, they will commit to reading the rest of the page.</p>

        <h2 className={h2}>Common Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>Should I bold every technology name?</h3>
            <p>Be strategic. If you bold everything, nothing is bold. Bold only the core technologies that define your role to help the eye land on the most important points first.</p>
          </div>
          <div>
            <h3 className={h3}>Is a one-page limit still relevant for web profiles?</h3>
            <p>No. On the web, people are used to scrolling. Vertical space is free. Focus on clear hierarchy rather than cramming everything into a specific physical height.</p>
          </div>
          <div>
            <h3 className={h3}>What is the ideal font size for a resume?</h3>
            <p>For web profiles, we recommend 16px to 18px for body text. This ensures accessibility and makes the text "jump" off the screen during a fast scan.</p>
          </div>
        </div>

        <h2 className={h2}>The Left Margin Is Prime Real Estate</h2>
        <p>On desktop, eyes snap to the left third of the screen first. Put your current title, top three technologies, and most recent company in that column or in the first lines under your name. On mobile, that same zone is what appears before the first scroll. Do not waste it on a generic summary paragraph about being a passionate team player.</p>
        <p>Try this layout: Name, title, location, then a single line stack list. &quot;TypeScript · React · Node · AWS · PostgreSQL.&quot; A recruiter searching for PostgreSQL sees it in under two seconds. Buried in paragraph four, it might never register.</p>

        <h2 className={h2}>Front Load Every Bullet</h2>
        <p>Write bullets as <span className={bold}>Technology + action + outcome</span>. Bad: &quot;Worked with the payments team to improve checkout performance using Redis.&quot; Good: &quot;Redis: cut checkout p99 latency from 2.1s to 320ms by rewriting session cache layer.&quot; The technology is the hook. The outcome is the proof.</p>
        <div className={callout}>
          <h3 className={h3}>Mirror the job description safely</h3>
          <p>Copy exact tool names from the posting if you truly used them. Do not invent skills. ATS filters match strings. Humans match stories. Both need the same keywords visible early. See <Link href="/alignment" className={link}>safe skill alignment</Link> for the ethical line.</p>
        </div>

        <h2 className={h2}>Headings Beat Clever Labels</h2>
        <p>Call your sections Experience, Skills, Education. Creative headings like &quot;Where I Have Been&quot; confuse parsers and slow humans. Standard labels route eyes correctly. Under Experience, repeat company names in bold and dates on the same line. Under Skills, use a flat list or grouped tags, never tables.</p>
        <p>Web profiles handle this automatically. CVin.Bio renders semantic headings and skill tags that both recruiters and <Link href="/bots" className={link}>AI resume bots</Link> can read without guessing.</p>

        <h2 className={h2}>Test Your Own Scan Speed</h2>
        <p>Open your profile on your phone. Set a timer for six seconds. Close your eyes, open them, look for six seconds, look away. Write down every fact you remember. If you cannot recall your title, top skill, and biggest metric, your hierarchy failed. Reorder until those three stick.</p>
        <p>Ask a friend to do the same test. Compare notes. This costs five minutes and beats guessing what recruiters see during a <Link href="/scan" className={link}>30 second scan</Link>.</p>

        <h2 className={h2}>Density Versus Clarity</h2>
        <p>Junior candidates often confuse keyword density with keyword clarity. Stuffing fifteen tools into one paragraph creates noise. Listing five tools in a clean line under your name creates signal. Recruiters remember signal.</p>
        <p>Repeat important keywords in context, not in repetition. React in your stack line, React in a bullet about the checkout rewrite, React in a project link. Three appearances in meaningful places beat ten appearances in a skills paragraph nobody reads.</p>

        <h2 className={h2}>Role Specific Keyword Sets</h2>
        <p>Backend roles want infrastructure keywords above the fold. Frontend roles want framework and performance keywords. Data roles want warehouse and pipeline keywords. Copy the same profile structure but swap the top line stack list when you pivot targets. Live URLs make that swap a five minute edit.</p>
        <p>Keep a master list of every keyword you have ever earned through work. Tag each with a project reference. When a posting emphasizes GraphQL, you know which bullet to move up without inventing new experience.</p>

        <h2 className={h2}>Secondary Scan Zones</h2>
        <p>After the Z scan, recruiters read your most recent job block if the header hooked them. Put your strongest role first even if another job has a bigger brand name. Stripe intern beats unknown startup lead if the startup bullet is weaker. Hierarchy is attention management, not chronological worship.</p>
        <p>Education scans last. Keep it short unless you are a recent grad. Ten years of industry work means three lines for school, not half a page.</p>

        <h2 className={h2}>Tools Recruiters Use to Skim</h2>
        <p>Many recruiters use browser extensions or ATS side panels that extract skills automatically. Those tools read structured tags first. A flat paragraph of prose may never enter their shortlist filter. Tags and bold job titles feed the tools. Prose feeds humans after you pass the filter.</p>
        <p>CVin.Bio exports skills as readable tags in the page structure. You get human hierarchy and machine extraction without maintaining two documents.</p>

        <h2 className={h2}>Night Mode and Evening Scans</h2>
        <p>Recruiters review candidates at night on OLED screens. Harsh white PDFs glare. Balanced web themes with dark mode support reduce fatigue and extend reading time. More reading time correlates with more interview invites when the content is strong.</p>
        <p>Keywords still need to sit in the header and first role. Dark mode does not change scan paths. It changes how long someone tolerates staying on your page.</p>
        <p>Run the six second phone test after every major profile edit. If your top stack line and latest job title stick, your keyword hierarchy is working. If not, move content up until it does.</p>
        <p>Recruiters are not lazy. They are overloaded. Keyword hierarchy respects overload by putting signal where eyes already go. Respect that pattern and you borrow their attention instead of begging for it.</p>
        <p>Build your profile once on CVin.Bio with hierarchy baked in. Then every share benefits from the same scan friendly structure without re exporting PDFs for each application.</p>
        <p>Keywords are not magic words. They are anchors for human memory under time pressure. Place anchors where eyes land first and your experience gets the reading time it deserves.</p>
        <p>Front load the stack line, front load the bullets, front load the proof. Everything else on the page supports what the reader already saw in the first pass.</p>
        <p>Hierarchy is habit. Build it once on your profile template and every application inherits the same scan advantage.</p>
        <p>Good hierarchy feels invisible until you compare your profile to a wall of dense paragraph resumes.</p>
        <p>Make the first screen undeniable and the rest of the profile earns the read.</p>
        <p>Scan paths are predictable. Use them.</p>

        <h2 className={h2}>Acronyms and alternate spellings</h2>
        <p>Job posts vary language for the same tool. One posting says Kubernetes, another says K8s, a third says container orchestration. If you ran production clusters, use the exact term from the posting in one bullet and spell out the full name once elsewhere. &quot;K8s: cut deploy time 40% after Helm chart standardization&quot; plus a later mention of Kubernetes in a summary line covers both search styles without stuffing.</p>
        <p>Same rule for JavaScript versus TypeScript, Postgres versus PostgreSQL, and AWS versus Amazon Web Services. Mirror the posting where honest. Humans and parsers both pattern-match strings before they read stories.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/keywords" className={link}>Keyword placement for technical CVs</Link></li>
          <li><Link href="/headings" className={link}>ATS friendly section headings</Link></li>
        </ul>
      </div>
  );
}
