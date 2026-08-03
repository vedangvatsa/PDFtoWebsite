import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>For several years a terrible design trend has plagued the professional hiring market. Candidates frequently download highly visual templates that encourage them to rate their own technical skills using graphic progress bars or abstract star ratings. You have likely seen profiles where a candidate gives themselves four out of five little gray dots for their mastery of Javascript.</p>
        <p>This formatting choice is an absolute disaster from a recruiting perspective. A graphic progress bar conveys absolutely zero verifiable information. If you rate yourself at eighty percent capacity for database management the manager has zero context for what that actually means. Does it mean you are eighty percent as good as the senior engineer at Google or does it mean you are just slightly better than the junior intern sitting next to you.</p>
        
        <h2 className={h2}>The Trap of Stated Weakness</h2>
        <p>The most devastating consequence of using visual skill bars is that you inevitably force yourself to document your own incompetence. If you design a beautiful five star scale and boldly claim five stars in Python you are naturally pressured to give yourself only three stars in AWS so you appear honest.</p>
        <p>By visually showing a three star rating you immediately flag to the hiring manager that you are seriously weak at AWS infrastructure. Why would you ever permanently carve a declaration of your own mediocrity directly into the prime real estate of your public profile. It makes absolutely no strategic sense.</p>
        
        <div className={callout}>
          <h3 className={h3}>The Binary Competence Rule</h3>
          <p>Technical skills exist in a purely binary state when applying for jobs. Either you possess the competence to confidently build commercial products with a tool or you do not. If you can pass a punishing technical interview on the subject you simply list the name of the tool as plain text. If you cannot you delete it entirely.</p>
        </div>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Divider */}
            <line x1="340" y1="10" x2="340" y2="270" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

            {/* Left Column Header */}
            <text x="170" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-400">What You Have</text>

            {/* Skill Bar 1: Python 80% */}
            <text x="30" y="68" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Python</text>
            <rect x="90" y="56" width="200" height="16" rx="3" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="90" y="56" width="160" height="16" rx="3" className="fill-zinc-400 dark:fill-zinc-500" />
            <text x="300" y="68" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">80%</text>

            {/* Skill Bar 2: AWS 60% */}
            <text x="30" y="108" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">AWS</text>
            <rect x="90" y="96" width="200" height="16" rx="3" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="90" y="96" width="120" height="16" rx="3" className="fill-zinc-400 dark:fill-zinc-500" />
            <text x="300" y="108" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">60%</text>

            {/* Skill Bar 3: Docker 40% */}
            <text x="30" y="148" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Docker</text>
            <rect x="90" y="136" width="200" height="16" rx="3" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="90" y="136" width="80" height="16" rx="3" className="fill-zinc-400 dark:fill-zinc-500" />
            <text x="300" y="148" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">40%</text>

            {/* Silly label */}
            <text x="170" y="185" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500" fontStyle="italic">80% of what? Says who?</text>

            {/* Right Column Header */}
            <text x="510" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-500">What Works</text>

            {/* Proof 1 */}
            <text x="360" y="64" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Python</text>
            <text x="360" y="80" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Built concurrent parser processing</text>
            <text x="360" y="93" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">2M records/day</text>

            {/* Proof 2 */}
            <text x="360" y="124" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">AWS</text>
            <text x="360" y="140" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Migrated monolith to Lambda,</text>
            <text x="360" y="153" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">cut hosting costs 50%</text>

            {/* Proof 3 */}
            <text x="360" y="184" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Docker</text>
            <text x="360" y="200" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Containerized 12 microservices</text>
            <text x="360" y="213" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">for CI/CD pipeline</text>

            {/* Bottom labels */}
            <rect x="100" y="240" width="140" height="26" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
            <text x="170" y="257" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-red-400">Meaningless numbers</text>

            <rect x="440" y="240" width="140" height="26" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1" />
            <text x="510" y="257" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-500">Verifiable proof</text>
          </svg>
        </div>

        <h2 className={h2}>Replacing Graphics with Architecture</h2>
        <p>Instead of drawing colorful abstract shapes you must prove your mastery purely through the architecture of your past projects. The hiring manager will know your Python skills are absolute perfection if they read a bullet point explaining how you wrote a concurrent Python script that parses millions of financial records daily without dropping a single packet.</p>
        <p>Competence is proven naturally within the context of the work you deliver. The moment you strip away the silly graphic ratings and force your project history to carry the weight of validation you instantly raise yourself from a junior applicant to a serious technical operator.</p>

        <h2 className={h2}>Why Recruiters Distrust Self Grades</h2>
        <p>Every skill bar is a self assessment with no referee. A candidate who rates Python at 90 percent and AWS at 40 percent forces the reader to do mental math. Is the 90 percent real? Is the 40 percent honest or sandbagging? The recruiter has no way to verify either number, so they ignore both.</p>
        <p>Worse, skill bars train you to think in vague gradients instead of concrete tasks. &quot;I am pretty good at Docker&quot; is useless. &quot;Containerized twelve microservices and wired them into a GitHub Actions pipeline that deploys in under four minutes&quot; is a fact. Facts survive interviews. Gradients do not.</p>
        <div className={callout}>
          <h3 className={h3}>What hiring managers actually search for</h3>
          <p>They Ctrl+F for tool names and scan the surrounding sentence for proof. <span className={bold}>React, Kubernetes, PostgreSQL.</span> If the word appears next to a shipped outcome, you pass. If it appears next to a colored bar, you waste their time.</p>
        </div>

        <h2 className={h2}>Replace Bars With a Stack Section</h2>
        <p>A plain list of technologies you have used in production is enough for the first pass. Group them if you want: Languages, Infrastructure, Data. No ratings. No icons. Just names the ATS and the human can both read.</p>
        <p>Then put the proof in your experience bullets. Front load the technology, back load the result. &quot;<span className={bold}>PostgreSQL:</span> redesigned indexing strategy on the orders table, cut p95 query latency from 800ms to 45ms.&quot; The skill section tells them what you touch. The bullets tell them what you did with it.</p>
        <ul className={ul}>
          <li>Delete any skill you would fail a live interview on today</li>
          <li>Never rate yourself below maximum on a tool you list</li>
          <li>Link to repos or dashboards when the proof lives outside the resume</li>
        </ul>

        <h2 className={h2}>Design Templates Are the Real Culprit</h2>
        <p>Canva and many Word resume templates include skill bars because they look pretty on Instagram. They were never designed for hiring logic. When you export those templates to PDF, the bars often become images anyway, which breaks <Link href="/pdf" className={link}>ATS parsing</Link> and removes the keywords entirely.</p>
        <p>A web profile template on CVin.Bio avoids this trap. Skills render as text tags. Experience stays in semantic HTML. Recruiters on <Link href="/mobile" className={link}>mobile phones</Link> see readable lists instead of shrunken bar charts. You get clean design without sacrificing machine readability.</p>

        <h2 className={h2}>Senior Engineers Skip the Skills Section Entirely</h2>
        <p>After ten years, many strong candidates drop the standalone skills block and let their job history speak. Every bullet mentions the stack implicitly. The reader infers depth from scope: team size, traffic, revenue, uptime. That is the level you are aiming for.</p>
        <p>If you are earlier in your career, keep a short skills list but treat it as an index, not a scorecard. Pair it with <Link href="/code" className={link}>live code links</Link> wherever possible. One working demo outweighs five stars on a PDF graphic.</p>

        <h2 className={h2}>Interview Follow Ups on Self Ratings</h2>
        <p>If you put AWS at 60 percent on a bar chart, the interviewer will ask what 60 percent means. You will stumble. If you write &quot;migrated billing service to Lambda, cut AWS bill 40 percent,&quot; the interviewer asks how you designed the migration. You want the second conversation.</p>
        <p>Skill bars also age poorly. You rated Docker 50 percent in 2022. You have not touched it since. The bar still sits on your PDF like a confession. Plain lists let you delete stale tools without visual guilt.</p>

        <h2 className={h2}>ATS and Skill Bars Combined Failure</h2>
        <p>Some templates render bars as images. The ATS never sees &quot;Python&quot; at all. You fail keyword search and look unqualified to humans who never open the file. Double loss. Text lists fix both channels at once.</p>
        <p>When you migrate to a web profile, audit old PDFs for bar graphics. Replace every rated skill with a bullet that proves usage. The migration itself becomes a credibility upgrade.</p>

        <h2 className={h2}>Designer Resumes Versus Engineer Resumes</h2>
        <p>Designers sometimes use visual skill maps for creative roles. Engineering hiring still punishes the same pattern. If you are a design engineer hybrid, use visuals in your portfolio site, not in the resume facts layer. Keep the resume machine readable and push aesthetics to project pages where they belong.</p>
        <p>Hiring managers forgive plain text. They do not forgive missing keywords or self downgrades hidden in cute graphics.</p>

        <h2 className={h2}>Quantified Proof Beats Any Rating</h2>
        <p>Replace every bar with a number tied to work. Lines of code matter less than outcomes. Uptime percentages, latency cuts, cost reductions, and release frequency tell the story bars pretend to tell. If you lack numbers, use scope: teams, services, regions, customers.</p>
        <p>Publish the rewrite on CVin.Bio and delete the old PDF with bars from your downloads folder so you never accidentally send the wrong version again.</p>

        <h2 className={h2}>One Final Rule</h2>
        <p>If you would not rate a colleague&apos;s skill in public with a number, do not rate your own. Peer review uses stories and outcomes. Hiring works the same way. Cut the bars, keep the proof, and let your project history argue your level for you.</p>
        <p>Strong candidates rarely debate their skill level in prose. They show the repo, the dashboard, the postmortem, and the release notes. Copy that pattern on your public profile and recruiters stop asking for imaginary percentages.</p>
        <p>Delete skill bars from your old templates today. Replace them with three bullets that mention the same tools in production context. That single edit often lifts both human perception and ATS keyword match rates in the same afternoon.</p>
        <p>Recruiters remember candidates who made review easy. Plain skill lists plus proof bullets are easy. Bars plus paragraphs are hard. Choose easy for the reader.</p>
        <p>Your profile is a hiring document, not a personality quiz. Strip the graphics that ask strangers to grade you. Give them facts they can verify in an interview instead.</p>
        <p>One afternoon of bullet rewrites beats years of wondering why your pretty resume underperforms plain profiles from candidates with clearer proof.</p>

        <h2 className={h2}>Before and after: one candidate rewrite</h2>
        <p>Left column: Python 85%, React 70%, SQL 55% bars with no bullets mentioning those tools. Right column: three bullets only. &quot;Python: batch ETL for 3M rows/night.&quot; &quot;React: rebuilt checkout; cart abandonment down 11%.&quot; &quot;PostgreSQL: index rewrite; p95 queries 600ms to 40ms.&quot; Same person. Second version survives Ctrl+F, interview questions, and ATS extraction. Delete the bars entirely.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/trust" className={link}>How recruiters spot fake skills</Link></li>
          <li><Link href="/code" className={link}>How to show projects on your resume</Link></li>
        </ul>
      </div>
  );
}
