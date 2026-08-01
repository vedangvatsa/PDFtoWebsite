import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        A senior recruiter opens your profile at 9:12 AM. She has forty applications in her queue before lunch. She will not read your career story like a novel. She scans it. Name, title, company names, numbers, stack keywords. Decision in under thirty seconds. Pass or close tab.
      </p>
      <p>
        Highly qualified candidates lose interviews because they bury their best work at the bottom of dense paragraphs. The recruiter never gets there. Understanding scan behavior is not about tricking anyone. It is about putting your strongest signals where human eyes actually land.
      </p>

      <h2 className={h2}>The Z-pattern in practice</h2>
      <p>
        On a standard resume layout, eyes move in a loose Z. Top left: name and headline. Sweep right: contact or location. Diagonal down the left margin: job titles and company names. Bottom sweep: skills or education. Critical keywords must hit during that path or they never register.
      </p>
      <p>
        Timing breakdown many recruiters report:
      </p>
      <ul className={ul}>
        <li>0 to 2 seconds: name, current title, location match.</li>
        <li>2 to 8 seconds: most recent role, company recognition, left-margin scan.</li>
        <li>8 to 20 seconds: one or two bullets if something hooked the eye.</li>
        <li>20 to 30 seconds: skills check, education if junior, then keep or reject.</li>
      </ul>
      <p>
        If nothing hooks by second eight, the rest is optional reading. That is not laziness. It is volume math.
      </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 680 350" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="180" y="20" width="320" height="310" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" />
          <rect x="200" y="36" width="140" height="10" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
          <rect x="200" y="78" width="60" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
          <rect x="200" y="136" width="80" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
          <rect x="200" y="248" width="40" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
          <line x1="198" y1="38" x2="484" y2="38" className="stroke-emerald-500" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.8" />
          <line x1="484" y1="38" x2="198" y2="270" className="stroke-emerald-500" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.8" />
          <line x1="198" y1="270" x2="440" y2="270" className="stroke-emerald-500" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.8" />
          <circle cx="198" cy="38" r="5" className="fill-emerald-500" />
          <text x="24" y="42" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">0-2s</text>
          <text x="24" y="160" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">2-8s</text>
          <text x="24" y="274" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">8-20s</text>
          <text x="340" y="345" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
            You have seconds. Make every zone count.
          </text>
        </svg>
      </div>

      <h2 className={h2}>Front-loading your value</h2>
      <p>
        Restructure bullets so the highest-value word leads. Revenue saved, latency cut, language used, users served: put it in the first three words.
      </p>
      <p>
        Weak: &quot;Collaborated with a cross-functional team over six months to successfully launch a new Python microservice.&quot;
      </p>
      <p>
        Strong: &quot;Launched Python microservice with five engineers in under six months; handles 2M requests daily.&quot;
      </p>
      <p>
        The weak version buries Python at word twelve. The strong version hits Python at word two and a scale metric at the end. Same work. Different scan outcome.
      </p>

      <div className={callout}>
        <h3 className={h3}>The left margin test</h3>
        <p>
          Cover the right half of your screen. Read only the first three words of each bullet. If those words do not signal a skill or win, rewrite the bullet. Delete filler openers like &quot;Responsible for&quot; and &quot;Worked on.&quot; Start with the verb or the noun that matters.
        </p>
      </div>

      <h2 className={h2}>What recruiters look for in each zone</h2>

      <h3 className={h3}>Header zone (top)</h3>
      <p>
        Clear name. Title that matches the role you want, even when it differs from your current employer title. &quot;Backend Engineer&quot; beats &quot;Software Developer II&quot; when you are applying to backend roles. Location or &quot;Remote, GMT+5:30&quot; if relevant. One link: <Link href="/pdf-to-website" className={link}>CV website</Link> or LinkedIn, not six icons.
      </p>

      <h3 className={h3}>Recent role zone (upper third)</h3>
      <p>
        Company name recruiters recognize, or industry plus size if NDA blocks the name (&quot;Series B fintech, 120 employees&quot;). Three bullets max for scan pass. Each bullet: action, tool, outcome. Most recent role gets the most eye time.
      </p>

      <h3 className={h3}>Older roles zone (middle)</h3>
      <p>
        Shorter bullets. Two per role. Recruiters skim here for progression and tenure patterns. See <Link href="/tenure" className={link}>short stint explanations</Link> if you have many brief roles.
      </p>

      <h3 className={h3}>Skills and education zone (bottom)</h3>
      <p>
        Quick match against job post requirements. Orphan skills that never appear in bullets trigger distrust. Read <Link href="/trust" className={link}>how recruiters spot fake skills</Link>.
      </p>

      <h2 className={h2}>Layout mistakes that break scanning</h2>
      <ul className={ul}>
        <li>Two-column layouts that split job title from dates.</li>
        <li>Right-aligned dates that fall outside the Z-path.</li>
        <li>Icons replacing text (ATS and eyes both struggle).</li>
        <li>Dense paragraphs instead of bullets.</li>
        <li>Summary blocks longer than three lines.</li>
        <li>Critical metrics buried in the middle of long sentences.</li>
        <li>White text on colored boxes that parsers cannot read.</li>
      </ul>
      <p>
        A <Link href="/cv-website-vs-pdf" className={link}>CV website</Link> with a single-column mobile layout sidesteps many PDF layout failures. Recruiters reviewing on phone get a linear scroll that matches scan behavior.
      </p>

      <h2 className={h2}>Embrace blank space</h2>
      <p>
        Dense walls of text repel tired eyes. When a manager sees an unbroken gray block, she assumes the read will take too long and starts skimming faster, which means she misses more.
      </p>
      <p>
        Use generous line height. One idea per bullet. Limit older roles to two bullets. Whitespace is not wasted space. It is a signal that you respect the reader&apos;s time.
      </p>

      <h2 className={h2}>Mobile changes everything</h2>
      <p>
        Over half of initial profile reviews happen on phones. PDFs force pinch-zoom. Web profiles scroll naturally. If your headline and most recent role do not fit above the fold on a 390px screen, you lose the scan war before it starts. Test on your phone. Not a resized desktop window. Your actual device.
      </p>

      <h2 className={h2}>Worked scenario</h2>
      <p>
        Candidate A: summary paragraph, four bullets per role since 2018, skills block with 35 terms. Recruiter sees title, skims one bullet, closes at 18 seconds.
      </p>
      <p>
        Candidate B: two-line summary, three front-loaded bullets on recent role, two on older roles, eight skills all mentioned in bullets. Recruiter sees Python, 40% latency cut, Stripe. Schedules screen at 25 seconds.
      </p>
      <p>
        Same years of experience. Different information architecture.
      </p>

      <h2 className={h2}>Checklist before you send</h2>
      <ol className={ol}>
        <li>Run the left margin test on every bullet.</li>
        <li>Put target role title in headline.</li>
        <li>Limit most recent role to three strong bullets.</li>
        <li>Lead each bullet with tool, metric, or action verb.</li>
        <li>Remove paragraphs; use bullets only.</li>
        <li>Test on phone; confirm top third tells your story.</li>
        <li>Ensure skills appear in work history, never isolated in a footer block alone.</li>
      </ol>

      <h2 className={h2}>Senior vs junior scan priorities</h2>
      <p>
        Junior recruiters scan for keyword match against the job description. Senior engineers and hiring managers scan for scope and judgment signals. Did you own a system end to end? Did you reduce incident load? Did you mentor anyone? Put those signals in the first bullet of your most recent role regardless of level.
      </p>
      <p>
        For staff and principal applications, the scan extends to thirty to forty-five seconds if the first bullet hooks. Add one bullet about cross-team influence: RFCs written, standards adopted, cost avoided. Title alone does not communicate staff scope. The first two bullets must.
      </p>

      <h2 className={h2}>Testing your own resume</h2>
      <p>
        Set a timer for thirty seconds. Open your resume. When the timer ends, write down: your headline, last company, one metric you remember, one tool you remember. If any field is blank, rewrite that section. Repeat until you pass your own test. Then ask someone outside your industry to do the same. If they cannot parse it, a tired recruiter will not either.
      </p>

      <h2 className={h2}>Heat map of attention</h2>
      <p>
        Top center gets the most attention: name, title, summary. Upper left third of first page gets second most: recent job title and first bullet. Bottom of page two gets almost none unless you are senior with a long history. Do not hide your best project on page two. Do not put your only metric in the last bullet of your oldest job.
      </p>
      <p>
        On web profiles, the fold on mobile is even smaller. First 400 pixels must answer: who are you, what do you do, why should I keep scrolling. Everything else is bonus reading for interested managers.
      </p>

      <h2 className={h2}>Bullet count guidelines</h2>
      <p>
        Current role: three to four bullets. Previous role: two to three. Roles older than five years: one to two or consolidate. Internships from a decade ago: remove or one line total. Recruiters count bullets subconsciously. Twenty bullets across eight jobs feels like noise. Twelve strong bullets feels focused.
      </p>

      <h2 className={h2}>Color, font, and scan speed</h2>
      <p>
        Light gray body text looks elegant and fails on phone screens in bright sunlight. Stick to high contrast black on white or near-white. Fancy fonts slow reading. System fonts parse cleanly and scan fast. Color accents on section headers are fine. Color as the only way to distinguish job titles is not fine for parsers or aging eyes.
      </p>
      <p>
        Bold the first three words of each bullet if your template allows. Do not bold entire paragraphs. Selective bold guides the Z-path without shouting.
      </p>

      <h2 className={h2}>First job out of school</h2>
      <p>
        New grads compete on projects, internships, and GPA only if strong. Lead with internship bullets that name tools and outcomes. Put education below projects if your GitHub has real code. Recruiters spending thirty seconds on new grad piles look for company names they recognize (FAANG internship, known startup) or one metric from a capstone. Give them one number in the first bullet: users, test coverage, latency, team size.
      </p>

      <h2 className={h2}>Agency recruiters vs hiring managers</h2>
      <p>
        Agency recruiters often scan for keyword match in under fifteen seconds. They Ctrl+F the job post terms against your PDF. Put exact strings from the posting in your summary line and first bullet when you truly have the experience. Hiring managers scan for judgment: scope, tradeoffs, team size. Same resume, two audiences. Lead with keywords for agency screeners; keep depth in bullets for manager reads.
      </p>

      <h2 className={h2}>Panel screen share test</h2>
      <p>
        Before a loop, ask a friend to share your resume on a video call at 100% zoom. Watch where their eyes stop in the first ten seconds. If they scroll before reading your title, your header is too tall or your summary is too long. Panelists often have your PDF in a small window beside their notes. Design for that cramped viewport, not a full monitor.
      </p>

      <h2 className={h2}>Related reading</h2>
      <ul className={ul}>
        <li><Link href="/design" className={link}>CV design principles for engineers</Link></li>
        <li><Link href="/spacing" className={link}>CV spacing and margin standards</Link></li>
        <li><Link href="/fonts" className={link}>Best fonts for ATS readability</Link></li>
        <li><Link href="/mobile" className={link}>Why your resume must work on mobile</Link></li>
      </ul>
    </div>
  );
}
