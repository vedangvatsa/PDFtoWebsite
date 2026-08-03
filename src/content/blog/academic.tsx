import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>Graduating from an intense academic program often instills a dangerous mindset when entering the commercial job market. Many candidates who spend six years earning a doctorate naturally assume that corporate hiring managers will instantly bow to their deep theoretical expertise. Unfortunately the modern technology sector operates on an entirely different axis of value. Businesses survive on shipped products not published theories.</p>
        <p>When a hiring manager reviews a heavily academic profile they experience an immediate twinge of fear. They worry that you will treat every basic database query like a six month research grant. They fear you possess zero urgency and lack the brutal pragmatism required to launch a messy but profitable feature by Friday afternoon. You must aggressively rewrite your academic history to destroy this bias.</p>
        
        <h2 className={h2}>Reframing the Laboratory as a Startup</h2>
        <p>The secret to successfully pitching a doctorate is translation. You must strip away all the prestigious sounding university jargon and describe your research laboratory exactly as if it were a high growth technology startup. Your complex dissertation was really just a multi year product lifecycle. Your frantic test scripts were early valid tests for real customer behavior patterns.</p>
        <p>Write about your academic tenure using strictly commercial verbs. Say that you architected and maintained a massive data pipeline that processed terabytes of messy inputs daily. Detail how you secured strict funding approvals by successfully pitching your architecture directly to skeptical institutional stakeholders. This frames you as a battle tested operator.</p>
        
        <div className={callout}>
          <h3 className={h3}>Delete the Deep Theory</h3>
          <p>Your future corporate boss does not understand the complex theoretical math inside your published papers and they do not want to learn it. Delete the long academic titles of your research entirely. Focus purely on the massive computational scale you handled and how you tuned the server costs to keep your lab budget from exploding.</p>
        </div>

        {/* Visual: Academic language translated to commercial equivalents with arrows */}
        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 310" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Column Headers */}
            <text x="140" y="26" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
 Academic Language
 </text>
            <text x="540" y="26" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
 Commercial Translation
 </text>

            {/* Row 1 */}
            <rect x="20" y="44" width="240" height="44" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="140" y="71" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
 Dissertation research
 </text>

            <line x1="260" y1="66" x2="400" y2="66" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="400,62 408,66 400,70" className="fill-zinc-400 dark:fill-zinc-500" />

            <rect x="410" y="44" width="252" height="44" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
            <text x="536" y="71" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
 Multi-year product lifecycle
 </text>

            {/* Row 2 */}
            <rect x="20" y="100" width="240" height="44" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="140" y="127" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
 Secured grant funding
 </text>

            <line x1="260" y1="122" x2="400" y2="122" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="400,118 408,122 400,126" className="fill-zinc-400 dark:fill-zinc-500" />

            <rect x="410" y="100" width="252" height="44" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
            <text x="536" y="121" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
 Pitched architecture
 </text>
            <text x="536" y="134" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
 to stakeholders
 </text>

            {/* Row 3 */}
            <rect x="20" y="156" width="240" height="44" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="140" y="176" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
 Published in peer-
 </text>
            <text x="140" y="189" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
 reviewed journal
 </text>

            <line x1="260" y1="178" x2="400" y2="178" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="400,174 408,178 400,182" className="fill-zinc-400 dark:fill-zinc-500" />

            <rect x="410" y="156" width="252" height="44" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
            <text x="536" y="176" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
 Shipped technical
 </text>
            <text x="536" y="189" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
 documentation
 </text>

            {/* Row 4 */}
            <rect x="20" y="212" width="240" height="44" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="140" y="239" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
 Managed lab resources
 </text>

            <line x1="260" y1="234" x2="400" y2="234" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="400,230 408,234 400,238" className="fill-zinc-400 dark:fill-zinc-500" />

            <rect x="410" y="212" width="252" height="44" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
            <text x="536" y="232" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
 Managed team budget
 </text>
            <text x="536" y="245" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
 and tooling
 </text>

            {/* Takeaway */}
            <text x="340" y="292" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
 Same work. Different framing. Entirely different perception.
 </text>
          </svg>
        </div>

        <h2 className={h2}>Proving Extreme Velocity</h2>
        <p>Because the primary fear regarding academics is sluggish perfectionism you must constantly highlight your speed. Dedicate a massive section of your profile to a specific moment where you abandoned theory and built a dirty script overnight just to hit a brutal deadline. Prove that you know when to be a careful scientist and when to be a fast shipping hacker.</p>
        <p>Highlight moments where you collaborated with external departments or presented data to non technical audiences. Showing that you can explain complex algorithms to business majors instantly raises your corporate value and completely separates you from the stereotype of the isolated researcher.</p>

        <h2 className={h2}>Translate Publications Into Ship Logs</h2>
        <p>A hiring manager scanning your profile does not care that your paper appeared in a journal with a 40 character title. They care whether you can ship. Take every publication and rewrite it as a production incident report. Instead of &quot;Novel Bayesian Framework for Sparse Tensor Recovery&quot; write &quot;Built a custom inference pipeline that cut model training time from 14 days to 3 days on a 200 node cluster.&quot;</p>
        <p>List the stack you actually used. Python, PyTorch, CUDA, Slurm, whatever ran in your lab. Name the data volume. &quot;Processed 4.2 terabytes of sensor logs per week.&quot; Name the failure you fixed. &quot;Reduced false positives by 34 percent after rewriting the batch ingestion layer.&quot; These lines read like senior engineering bullets. That is the goal.</p>
        <div className={callout}>
          <h3 className={h3}>The one line test</h3>
          <p>Read each bullet aloud. If it sounds like a grant proposal, delete it. If it sounds like something a startup CTO would paste into a board deck, keep it. <span className={bold}>Academic language hides your real output.</span> Commercial language exposes it.</p>
        </div>

        <h2 className={h2}>Handle Interview Skepticism Head On</h2>
        <p>Expect the question: &quot;Why industry instead of academia?&quot; Do not answer with passion for products. Answer with a specific story where you shipped under pressure. Maybe you rebuilt a broken ETL job the night before a conference deadline because the lab&apos;s demo depended on live data. Maybe you open sourced a tool because three other labs asked for it.</p>
        <p>Technical recruiters also worry you cannot work in messy codebases. Counter that by linking to GitHub repos with real commit history, not polished homework. If your dissertation code is a nightmare, fork it, refactor one module, and describe that refactor on your <Link href="/code" className={link}>live code samples</Link>. Proof beats promises.</p>
        <ul className={ul}>
          <li>Prepare two stories about deadline pressure with dates and outcomes</li>
          <li>Prepare one story about disagreeing with a PI and still delivering</li>
          <li>Prepare one story about teaching or mentoring non technical stakeholders</li>
        </ul>

        <h2 className={h2}>Structure Your Web Profile for Tech Hiring</h2>
        <p>Put your strongest commercial translation at the top, not your degree. Lead with a headline like &quot;Machine Learning Engineer | Shipped inference systems at scale&quot; instead of &quot;PhD Candidate in Computational Statistics.&quot; Your education section should be short. Institution, degree, year. Done.</p>
        <p>Dedicate the largest section to three roles or projects with heavy metrics. Use the same <Link href="/tech-keywords" className={link}>visual hierarchy rules</Link> as any senior engineer: bold job titles, stack names at the start of bullets, numbers at the end. A web profile on CVin.Bio gives you unlimited vertical space so you never have to crush your best work onto one page.</p>
        <p>Many PhDs also bury teaching experience. Reframe it. &quot;Designed and delivered a 12 week data science curriculum for 80 undergraduates. 92 percent completion rate.&quot; That reads as leadership and communication, not a side gig.</p>

        <h2 className={h2}>When the Degree Still Helps</h2>
        <p>Some roles still want the doctorate. Research labs at big tech companies, quant firms, and health AI startups often list PhD as preferred. In those cases, put the degree in the headline but still write the body in commercial language. The degree opens the door. The bullets get you the offer.</p>
        <p>If you are targeting pure product engineering at a Series B SaaS company, the degree matters less than a deployed side project. Spend your energy on proof. Upload your CV, publish a profile, and make sure every line answers the question a hiring manager actually asks: <span className={bold}>can this person ship on my team by next month?</span></p>

        <h2 className={h2}>Sample Bullets That Work</h2>
        <p>Compare weak academic bullets to strong commercial ones. Weak: &quot;Investigated novel tensor factorization methods under NSF grant.&quot; Strong: &quot;Built Python pipeline processing 1.8M lab samples nightly; cut compute spend 22 percent by rewriting Spark jobs.&quot; Weak: &quot;Mentored two graduate students on thesis methodology.&quot; Strong: &quot;Led two junior researchers; both shipped conference demos on schedule.&quot;</p>
        <p>Weak bullets describe intent. Strong bullets describe output with numbers, stack names, and deadlines. Rewrite every line from your CV using that filter before you publish.</p>
        <ul className={ul}>
          <li>Replace passive voice with verbs: built, shipped, cut, migrated, automated</li>
          <li>Replace theory words with ops words: pipeline, uptime, latency, budget, headcount</li>
          <li>Replace journal names with user counts, error rates, or dollars saved</li>
        </ul>

        <h2 className={h2}>Leaving the Lab Without Apologizing</h2>
        <p>Many PhDs feel they must downplay the doctorate to fit in. You do not hide it. You contextualize it. The degree proves you can learn hard things and finish long projects. The bullets prove you can apply that ability under commercial constraints. Both can be true.</p>
        <p>On CVin.Bio your headline can read &quot;PhD, Machine Learning Engineer&quot; if the role values research depth. Your experience section should still read like a startup operator log. Recruiters from Google Research want different emphasis than recruiters from a fintech Series C. Tailor the top third, keep the proof dense everywhere else.</p>

        <h2 className={h2}>First Ninety Days After the Pivot</h2>
        <p>Your first industry role is a translation exercise in real time. Keep a weekly log of commercial tasks you complete: incident response, sprint planning, code review, customer bug triage. Those logs become bullet material for your next move. Academia rarely documents week by week output. Industry hiring loves week by week proof.</p>
        <p>Network with other PhDs who left the lab. Their bullet patterns show what hiring managers in your target niche actually reward. Copy structure, not content. Your experiments are yours.</p>

        <h2 className={h2}>Publishing Your Profile Early</h2>
        <p>Do not wait until your industry rewrite feels perfect. Publish a first version on CVin.Bio, share it with two trusted peers, and iterate from feedback. Academic perfectionism delays commercial entry. A live profile with three strong bullets beats a polished PDF you never send. Ship the profile, then improve it weekly.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/skill-bars" className={link}>Why skill progress bars hurt technical profiles</Link></li>
          <li><Link href="/tenure" className={link}>How to explain short job stints after leaving academia</Link></li>
          <li><Link href="/impact" className={link}>How to show value without dollar metrics</Link></li>
        </ul>
      </div>
  );
}
