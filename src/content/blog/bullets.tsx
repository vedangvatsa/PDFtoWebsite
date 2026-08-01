import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>One of the most common psychological traps that candidates fall into is the fear of omission. When you spend two or three years at a company you inevitably complete thousands of minor tasks. When it comes time to update your profile you feel a strong urge to list every single one of those tasks to prove how hard you worked. This is a fatal mistake that destroys your perceived value.</p>
        <p>When you dump ten massive bullet points under a single job title you trigger a cognitive bias in the recruiter called the dilution effect. The reader does not add up the value of all your bullets to reach a high score. Instead their brain automatically averages the impressiveness of all your statements together.</p>
        
        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 300" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Left side. Too Dense */}
            <rect x="16" y="16" width="310" height="268" rx="6" className="fill-red-50 dark:fill-red-950/30 stroke-red-200 dark:stroke-red-900/50" strokeWidth="1" />
            <text x="171" y="44" textAnchor="middle" fontSize="12" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">TOO DENSE</text>

            {/* Bullet dot */}
            <circle cx="36" cy="70" r="3" className="fill-red-400" />

            {/* Dense text block */}
            <text x="48" y="74" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Responsible for designing, developing,</text>
            <text x="48" y="92" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">testing, and deploying a full-stack web</text>
            <text x="48" y="110" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">application using React, Node.js, and</text>
            <text x="48" y="128" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">PostgreSQL that improved internal team</text>
            <text x="48" y="146" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">productivity by consolidating three</text>
            <text x="48" y="164" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">legacy tools into a single dashboard</text>
            <text x="48" y="182" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">used by 200+ employees across four</text>
            <text x="48" y="200" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">departments including engineering,</text>
            <text x="48" y="218" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">support, sales, and operations teams</text>

            {/* X icon */}
            <circle cx="171" cy="256" r="12" className="fill-red-500/15 stroke-red-400" strokeWidth="1.5" />
            <path d="M166 251 L176 261 M176 251 L166 261" className="stroke-red-400" strokeWidth="2" strokeLinecap="round" />

            {/* Divider */}
            <line x1="340" y1="36" x2="340" y2="270" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 4" />

            {/* Right side. Clean */}
            <rect x="354" y="16" width="310" height="268" rx="6" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-900/50" strokeWidth="1" />
            <text x="509" y="44" textAnchor="middle" fontSize="12" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">CLEAN</text>

            {/* Clean bullet 1 */}
            <circle cx="374" cy="76" r="3" className="fill-emerald-500" />
            <text x="386" y="80" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">Built unified dashboard (React +</text>
            <text x="386" y="98" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">Node.js) replacing 3 legacy tools</text>

            {/* Clean bullet 2 */}
            <circle cx="374" cy="130" r="3" className="fill-emerald-500" />
            <text x="386" y="134" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">Adopted by 200+ employees across</text>
            <text x="386" y="152" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">4 departments</text>

            {/* Visual space indicator */}
            <text x="509" y="200" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500" fontStyle="italic">↑ Room to breathe ↑</text>

            {/* Check icon */}
            <circle cx="509" cy="256" r="12" className="fill-emerald-500/15 stroke-emerald-500" strokeWidth="1.5" />
            <path d="M503 256 L507 260 L516 250" className="stroke-emerald-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className={h2}>How Dilution Ruins Your Best Work</h2>
        <p>Imagine your biggest achievement at your last job was rebuilding the entire payment gateway to stop a huge fraud leak. That is an incredible high value win. But if you place that massive win right next to a bullet point that says you attended daily standup meetings and reviewed basic pull requests you dilute the magic.</p>
        <p>The manager reads the brilliant payment gateway achievement and assigns it a perfect score. Then they read that you attend meetings and they average it out. Suddenly your perfect score drops to a mediocre score. You bury your own brilliance under a mountain of mandatory corporate boredom.</p>

        <h2 className={h2}>The Rule of Three</h2>
        <p>To combat this you must ruthlessly enforce the rule of three. Impose a strict limit on yourself. You are only allowed to present the top three most impressive business wins for your current role. If a fourth bullet does not utterly destroy the third bullet for impact you must delete it entirely.</p>
        <p>This forced constraint makes your profile feel incredibly dense with talent. It proves to the hiring manager that you understand the difference between high-impact results and basic operational noise.</p>
        
        <div className={callout}>
          <h3 className={h3}>The Deletion Test</h3>
          <p>Read each bullet point out loud. Ask yourself if a totally average person with your exact job title would also do this task. If the answer is yes you must delete the bullet immediately. Do not waste space telling us that a software engineer writes software. Tell us what unique barriers you broke through.</p>
        </div>

        <h2 className={h2}>Brevity Signals Leadership</h2>
        <p>Senior leaders speak in short sentences. They do not waffle or hide behind giant walls of text. When you submit a profile filled with sprawling paragraphs you accidentally signal that you are a junior employee who lacks executive presence.</p>
        <p>Writing short punchy job details proves you respect the time of the reader. It shows you can distill months of chaotic project work into a single line of pure business value. That exact communication skill is what gets you promoted during an interview.</p>

        <h2 className={h2}>The One-Sentence Hard Limit</h2>
        <p>Every bullet on your profile should end at the first period. If you need a second sentence you are trying to pack two ideas into one slot. Split the weaker idea or delete it. Recruiters scan vertically. A bullet that wraps to five lines on a laptop becomes eight lines on a phone and never gets finished.</p>
        <p>Count characters if it helps. A strong bullet for a senior role often lands between 120 and 180 characters. That is enough room for a verb, a scope, a technology, and a measurable outcome. Anything longer usually means you are narrating a project timeline instead of stating a result.</p>
        <ol className={ol}>
          <li>Start with a past-tense verb: Built, Reduced, Led, Shipped, Migrated</li>
          <li>Name the system or surface you touched</li>
          <li>Add one number: latency, revenue, users, error rate, team size</li>
          <li>Stop. Do not explain how unless the method is the achievement</li>
        </ol>

        <h2 className={h2}>Rewriting Dense Bullets Into Clean Ones</h2>
        <p>Take a typical overloaded bullet: <span className={bold}>Responsible for designing, developing, testing, and deploying a full-stack web application using React, Node.js, and PostgreSQL that improved internal team productivity by consolidating three legacy tools into a single dashboard used by 200+ employees across four departments.</span> That is one sentence technically, but it reads like a job description pasted from an HR portal.</p>
        <p>Cut it to two bullets maximum:</p>
        <ul className={ul}>
          <li>Built a React and Node.js dashboard that replaced three legacy internal tools</li>
          <li>Reached 200+ daily active users across engineering, support, and sales within one quarter</li>
        </ul>
        <p>The second version gives a tired manager two scannable wins. The first version asks them to parse a paragraph while fifty other profiles wait in the queue.</p>

        <div className={callout}>
          <h3 className={h3}>The verb test</h3>
          <p>Weak bullets start with <span className={bold}>Responsible for</span>, <span className={bold}>Helped with</span>, or <span className={bold}>Worked on</span>. Strong bullets start with verbs that imply ownership. If you cannot find a strong verb, the work may not belong on your profile at all.</p>
        </div>

        <h2 className={h2}>How Many Bullets Per Role</h2>
        <p>Your current job gets up to three bullets. Your previous job gets two. Anything older than seven years gets one unless it is directly relevant to the role you want next. This hierarchy mirrors how recruiters allocate attention. They read the top of the page with full focus and skim the bottom with half focus.</p>
        <p>Internships and university projects from a decade ago do not need six lines each. One line that names the stack and the outcome is enough. Save the dense storytelling for your <Link href="/portfolio" className={link}>portfolio case studies</Link> where a hiring manager has chosen to spend time.</p>

        <h2 className={h2}>Bullets on Web Profiles vs PDF Files</h2>
        <p>A PDF locks your bullet count to page length. Candidates add filler bullets to avoid whitespace. A web profile removes that pressure. You can keep three tight bullets per role and link out to deeper write-ups for anyone who wants detail.</p>
        <p>That structure pairs well with <Link href="/link" className={link}>sharing a live URL</Link> instead of an attachment. The recruiter gets scannable wins on the first screen and can click through to proof when something catches their eye. You are not forced to choose between brevity and depth on a single page.</p>

        <h2 className={h2}>Common Mistakes That Inflate Bullet Count</h2>
        <p>Listing every technology you touched on a project is not a bullet. Listing every meeting you attended is not a bullet. Describing your team structure without stating your personal contribution is not a bullet. These patterns pad length without adding signal.</p>
        <p>Another trap is splitting one achievement across three bullets to look productive. If all three lines describe the same dashboard launch, merge them into one stronger line with the best number you have. Recruiters notice repetition faster than they notice omission.</p>

        <h2 className={h2}>Numbers Without Breaking Confidentiality</h2>
        <p>You can cite percentages and relative scale even when dollar figures are NDA-bound. <span className={bold}>Reduced p99 latency 35%</span> and <span className={bold}>supported 3x traffic during launch week</span> are safe patterns. Pair this with our <Link href="/impact" className={link}>impact quantification guide</Link> for more examples.</p>
        <p>One number per bullet is enough. Two numbers in the same line often means you are cramming unrelated metrics together.</p>

        <h2 className={h2}>Action Verbs by Seniority</h2>
        <p>Juniors overuse <span className={bold}>assisted</span> and <span className={bold}>participated</span>. Seniors overuse <span className={bold}>oversaw</span> without saying what shipped. Staff-plus candidates should lead with verbs that imply technical direction: <span className={bold}>defined</span>, <span className={bold}>architected</span>, <span className={bold}>unblocked</span>, <span className={bold}>standardized</span>.</p>
        <p>Match verb weight to the role you want next, not the role you had three years ago. A lead applying for staff should sound like someone who changed how a team builds, not someone who closed tickets.</p>

        <h2 className={h2}>Volunteer and Side Project Bullets</h2>
        <p>Open source maintainership, conference talks, and advisory work deserve one bullet each when they prove skills the job needs. Treat them like jobs: verb, scope, outcome. <span className={bold}>Maintained npm package with 40k weekly downloads and cut issue backlog 60% in one release cycle.</span> Skip listing the talk title unless speaking is part of the target role.</p>

        <h2 className={h2}>Editing Bullets With a Timer</h2>
        <p>Set a five-minute timer per role. Draft three bullets, run the deletion test on each, read aloud once, ship. Perfectionism keeps mediocre bullets on the page because you fear empty space. Empty space is a feature. It signals confidence in what you left in.</p>
        <p>Ship the shorter version. You can always add detail in a portfolio link.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/objective" className={link}>Replace your objective with a three-sentence value summary</Link></li>
          <li><Link href="/impact" className={link}>How to quantify impact when you do not have revenue numbers</Link></li>
          <li><Link href="/spacing" className={link}>Spacing and margin standards that keep bullets readable</Link></li>
        </ul>
      </div>
  );
}
