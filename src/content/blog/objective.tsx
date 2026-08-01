import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>I have reviewed over ten thousand applications in my career as a senior technical recruiter. If there is one massive mistake that instantly ruins a candidate profile it is the classic objective statement. Years ago people wrote what they wanted from a job at the very top of their paper resumes. They would literally write that they sought a challenging role at a dynamic company to grow their personal skills.</p>
        <p>This practice is entirely dead. If you do this today managers will think you are completely out of touch with modern business realities. Companies do not hire you to fulfill your personal dreams. They hire you because they have expensive problems that need fixing right now.</p>
        
        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 660 260" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Before box */}
            <rect x="16" y="16" width="628" height="100" rx="6" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            {/* Red left border */}
            <rect x="16" y="16" width="5" height="100" rx="2" className="fill-red-400" />

            {/* Before label */}
            <text x="40" y="42" fontSize="11" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">BEFORE</text>

            {/* Before text */}
            <text x="40" y="68" fontSize="13" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400" fontStyle="italic">"Seeking a challenging position where I can use</text>
            <text x="40" y="88" fontSize="13" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400" fontStyle="italic">my skills and grow professionally."</text>

            {/* Arrow between boxes */}
            <line x1="330" y1="120" x2="330" y2="140" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="326,140 330,148 334,140" className="fill-zinc-400 dark:fill-zinc-500" />

            {/* After box */}
            <rect x="16" y="152" width="628" height="100" rx="6" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            {/* Green left border */}
            <rect x="16" y="152" width="5" height="100" rx="2" className="fill-emerald-500" />

            {/* After label */}
            <text x="40" y="178" fontSize="11" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">AFTER</text>

            {/* After text */}
            <text x="40" y="204" fontSize="13" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">"Full-stack engineer. 6 years shipping payment systems</text>
            <text x="40" y="224" fontSize="13" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">at scale. Last project cut checkout failures by 40%."</text>
          </svg>
        </div>

        <h2 className={h2}>The Brutal Truth About Hiring</h2>
        <p>When an engineering manager or a marketing director opens a job requisition they are usually doing it out of pain. Their team is probably overworked. They are missing deadlines. Someone just quit and left behind a massive mess of undocumented code or failing ad campaigns. The manager reading your application is tired and stressed.</p>
        <p>When they read a paragraph about your desire for mentorship and growth they immediately skip to the next applicant. They do not have the time or energy to be your career counselor. They need a specialist who can step in and stop the active bleeding on their team.</p>

        <h2 className={h2}>Replace It With a Value Summary</h2>
        <p>You must completely delete your objective statement and replace it with a professional summary. This new section acts as your elevator pitch. It tells the reader exactly what specific technical or operational problems you have solved recently and what you can solve for them tomorrow.</p>
        <p>A strong summary does not use future tense. It relies entirely on the past tense and the present tense. It proves your authority rather than stating your hopes.</p>
        
        <div className={callout}>
          <h3 className={h3}>The Winning Summary Formula</h3>
          <p>Writing a perfect summary is actually very simple if you follow a strict formula. First state your current seniority and your core discipline. Next name the two tools or methodologies you execute best. Finally name your single biggest tangible win in the last three years. Do not mention your own needs or what you are looking for in a new job.</p>
        </div>

        <h2 className={h2}>Reviewing Real Examples</h2>
        <p>Let us look at a terrible objective statement. Seeking a senior developer role where I can use my Javascript skills and learn backend architecture to advance my career. This sentence offers absolutely zero value to the company. It only asks the company to spend money training the candidate.</p>
        <p>Now look at a strong value summary. Senior Frontend Engineer with six years of experience building high performance React interfaces. I specialize in reducing load times and fixing memory leaks in complex financial dashboards. I recently rebuilt a core application that survived a traffic spike of two million daily active users.</p>
        <p>The difference is night and day. The second example does not ask for anything. It simply declares competence and proves a track record of handling extreme pressure.</p>

        <h2 className={h2}>Space Is Your Most Valuable Asset</h2>
        <p>The top quarter of your application is the most expensive real estate you own. This is the only section that every single recruiter is guaranteed to read. If you waste that prime space talking about your personal journey you force the reader to scroll down just to find out if you even know the required coding languages.</p>
        <p>Never make a tired manager hunt for your core skills. Put your value plainly at the top and let your accomplishments speak for themselves.</p>

        <h2 className={h2}>What Hiring Managers Scan in Six Seconds</h2>
        <p>Eye-tracking studies on recruiter behavior consistently show the same pattern. Name and current title first. Most recent employer second. One number that proves impact third. Skills list fourth if they still have attention.</p>
        <p>An objective statement about seeking growth does not appear anywhere on that list because it answers a question nobody asked. A value summary that says <span className={bold}>cut API latency 40% at a fintech with 2M daily users</span> hits items two and three immediately.</p>

        <h2 className={h2}>Objective Statements by Role Type</h2>
        <p>Junior candidates often think objectives help because they lack long work history. They hurt juniors the most. Without achievements, an objective is pure wishful thinking. Replace it with a skills-forward summary: your stack, your strongest academic or internship project, and one metric from that project.</p>
        <p>Senior candidates who write objectives look like they have not hired anyone in years. Leaders know hiring is problem solving. Open with the problems you have solved at scale.</p>
        <p>Career changers should frame translation, not desire. <span className={bold}>Product manager with eight years in clinical research, shipped two HIPAA-compliant patient portals</span> tells the reader how your past maps to the new field. <span className={bold}>Seeking to transition into product</span> tells them nothing.</p>

        <div className={callout}>
          <h3 className={h3}>The headline field counts</h3>
          <p>On CVin.Bio and LinkedIn, your headline is the summary most people see without scrolling. Treat it like the replacement for an objective. One line: role, years, domain, flagship win.</p>
        </div>

        <h2 className={h2}>Summary Templates That Work</h2>
        <p>Template for engineers: <span className={bold}>[Role] with [X] years building [domain]. Deep in [tool A] and [tool B]. Last shipped [outcome with number].</span></p>
        <p>Template for designers: <span className={bold}>[Role] across [industry]. Led [project type] from research through launch. [Metric] improvement on [surface].</span></p>
        <p>Template for managers: <span className={bold}>[Role] leading teams of [size] on [product area]. Grew [metric] from [A] to [B] over [timeframe].</span></p>
        <p>Swap the bracketed pieces with your real data. Delete any sentence that does not contain a concrete noun or number.</p>

        <h2 className={h2}>Where Objectives Still Appear</h2>
        <p>University career centers still hand out objective examples. Older Word templates on Google still have placeholder objectives. Job boards in some regions expect them. Ignore those defaults for tech and product roles in 2026.</p>
        <p>If a legacy form has a required <span className={bold}>career goals</span> text box, write two sentences about what you deliver, not what you want. Never mention <span className={bold}>challenging opportunities</span> or <span className={bold}>dynamic teams</span>. Those phrases are empty calories.</p>

        <h2 className={h2}>Pair Your Summary With Short Bullets</h2>
        <p>The summary sets the frame. Bullets under each job provide evidence. Read our guide on <Link href="/bullets" className={link}>keeping bullets to one sentence</Link> so the top of your profile stays tight. A strong summary plus three crisp bullets per role beats a half-page objective plus dense paragraphs every time.</p>

        <h2 className={h2}>ATS Fields That Replace Objectives</h2>
        <p>Many portals now ask for a <span className={bold}>professional summary</span> or <span className={bold}>elevator pitch</span> in a dedicated text box. Treat that field exactly like the value summary on your CV. Same three sentences. Same past-tense proof. No wishes about future growth.</p>
        <p>If the form still labels the field <span className={bold}>objective</span>, ignore the label and write value anyway. The parser indexes the text, not the field name on the recruiter screen.</p>

        <h2 className={h2}>LinkedIn About Section vs Resume Summary</h2>
        <p>Your LinkedIn About block and your CV summary should tell the same story with different length. CV gets three sentences. LinkedIn gets one short paragraph with the same numbers. Do not write a motivational objective on LinkedIn and a value summary on your CV. Recruiters cross-check both.</p>
        <p>First person is fine on LinkedIn. Third person or fragment style is fine on a formal CV. The facts must match.</p>

        <h2 className={h2}>Executive and Board-Ready Summaries</h2>
        <p>VP and C-level candidates sometimes write objectives about visionary leadership. Boards want receipts. Open with P&amp;L scope, team size, and a turnaround metric. <span className={bold}>Operator who took a $40M ARR product from negative growth to 18% YoY in fourteen months by rebuilding the enterprise sales motion.</span> That is a summary. <span className={bold}>Passionate leader seeking visionary opportunities</span> is noise.</p>
        <p>Keep it under four lines even at executive level. Density beats length when every word carries a number or a named outcome.</p>

        <h2 className={h2}>Freelancers and Contract Summaries</h2>
        <p>Contractors often write objectives about seeking long-term employment. Clients hiring six-month sprints want speed and domain fit. Lead with stack, timezone overlap, and two shipped client outcomes. Mention availability dates in the contact block, not in the summary paragraph that should sell capability.</p>
        <p>Your summary should answer what you build, not what you hope the client becomes for your career.</p>

        <h2 className={h2}>Students and New Grads</h2>
        <p>Replace the objective with your strongest proof of work: capstone project, internship outcome, or open source contribution with a number. <span className={bold}>CS grad. Built a campus events app used by 4,000 students. Internship: automated test suite that cut release QA time from three days to six hours.</span> Employers hire potential when it is backed by shipped output.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/bullets" className={link}>How long resume bullets should be</Link></li>
          <li><Link href="/impact" className={link}>Quantifying impact without confidential revenue data</Link></li>
          <li><Link href="/headings" className={link}>ATS-friendly section headings that parsers recognize</Link></li>
        </ul>
      </div>
  );
}
