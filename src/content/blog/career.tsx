import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>Switching careers is hard enough without your resume working against you. The problem is simple: your work history says one thing, but you want to do something else. Every recruiter who opens your file sees the mismatch in about three seconds.</p>
        <p>The fix is not to pretend your old career did not happen. It is to reshape how you present it so the hiring manager can see a clear line from where you have been to where you are going. These eight strategies work, especially if you are moving into tech.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 640 320" className="w-full h-auto" role="img" aria-label="Before and after comparison of career changer resume layouts">
            <style>{`
              .svg-title { font: 600 14px system-ui; }
              .svg-label { font: 500 11px system-ui; }
              .svg-small { font: 400 10px system-ui; }
              .svg-badge { font: 600 10px system-ui; }
            `}</style>
            {/* Before resume */}
            <text x="160" y="24" textAnchor="middle" className="svg-title fill-zinc-400 dark:fill-zinc-500">❌ Before</text>
            <rect x="30" y="36" width="260" height="270" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <rect x="50" y="52" width="140" height="14" rx="3" className="fill-zinc-300 dark:fill-zinc-600" />
            <text x="50" y="86" className="svg-small fill-zinc-400 dark:fill-zinc-500">Operations Manager · 2019. 2024</text>
            <rect x="50" y="96" width="220" height="8" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="50" y="110" width="200" height="8" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="50" y="124" width="210" height="8" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <text x="50" y="152" className="svg-small fill-zinc-400 dark:fill-zinc-500">Store Supervisor · 2016. 2019</text>
            <rect x="50" y="162" width="220" height="8" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="50" y="176" width="190" height="8" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <text x="50" y="204" className="svg-small fill-zinc-400 dark:fill-zinc-500">Retail Associate · 2014. 2016</text>
            <rect x="50" y="214" width="210" height="8" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="50" y="228" width="180" height="8" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <text x="50" y="260" className="svg-small fill-zinc-400 dark:fill-zinc-500">Skills: Excel, Inventory, Scheduling</text>
            <text x="160" y="294" textAnchor="middle" className="svg-badge fill-zinc-400 dark:fill-zinc-500">Job titles drive the story</text>
            {/* After resume */}
            <text x="480" y="24" textAnchor="middle" className="svg-title fill-emerald-600 dark:fill-emerald-400">✓ After</text>
            <rect x="350" y="36" width="260" height="270" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="1.5" />
            <rect x="370" y="52" width="140" height="14" rx="3" className="fill-zinc-300 dark:fill-zinc-600" />
            <text x="370" y="84" className="svg-small fill-emerald-600 dark:fill-emerald-400">Data Analyst · Career Changer</text>
            <rect x="370" y="94" width="220" height="20" rx="4" className="fill-emerald-50 dark:fill-emerald-900/30 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
            <text x="380" y="108" className="svg-small fill-emerald-700 dark:fill-emerald-300">SQL · Python · Tableau · Excel</text>
            <text x="370" y="134" className="svg-badge fill-emerald-600 dark:fill-emerald-400">PROJECTS</text>
            <rect x="370" y="142" width="220" height="8" rx="2" className="fill-emerald-100 dark:fill-emerald-900/40" />
            <rect x="370" y="156" width="200" height="8" rx="2" className="fill-emerald-100 dark:fill-emerald-900/40" />
            <text x="370" y="184" className="svg-badge fill-emerald-600 dark:fill-emerald-400">CERTIFICATIONS</text>
            <rect x="370" y="192" width="220" height="8" rx="2" className="fill-emerald-100 dark:fill-emerald-900/40" />
            <rect x="370" y="206" width="180" height="8" rx="2" className="fill-emerald-100 dark:fill-emerald-900/40" />
            <text x="370" y="234" className="svg-small fill-zinc-400 dark:fill-zinc-500">Relevant Experience (rewritten)</text>
            <rect x="370" y="244" width="220" height="8" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="370" y="258" width="200" height="8" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <text x="480" y="294" textAnchor="middle" className="svg-badge fill-emerald-600 dark:fill-emerald-400">Skills and projects drive the story</text>
          </svg>
        </div>

        <h2 className={h2}>1. Lead With Transferable Skills</h2>
        <p>Your job titles are the weakest part of your resume right now. A title like &quot;Operations Manager&quot; or &quot;High School Teacher&quot; tells a tech recruiter nothing useful. But the skills behind those titles often translate directly.</p>
        <p>Project management, data analysis, stakeholder communication, process improvement, and team coordination show up in every industry. The trick is naming them in the language your new field uses. If you managed a department budget in Excel, you did data analysis. If you coordinated a team across time zones, you did project management.</p>
        <p>Put a skills section right after your summary. List the skills that matter in your target role, not the ones from your old career that nobody in tech will search for.</p>

        <h2 className={h2}>2. Rewrite Your Bullets</h2>
        <p>This is where most career changers fail. They copy their bullet points from their old resume word for word. A bullet that says &quot;Managed inventory for 3 retail locations&quot; means nothing to an engineering hiring manager. But the same work, rewritten, might.</p>
        <div className={callout}>
          <h3 className={h3}>Before and after examples</h3>
          <p><span className={bold}>Before:</span> &quot;Managed inventory tracking for 3 retail locations.&quot;</p>
          <p><span className={bold}>After:</span> &quot;Built and maintained spreadsheet system tracking 5,000+ SKUs across 3 locations, reducing stock errors by 30%.&quot;</p>
          <p><span className={bold}>Before:</span> &quot;Taught math to 120 students per semester.&quot;</p>
          <p><span className={bold}>After:</span> &quot;Designed curriculum for 120 users per cycle, measured learning outcomes with data, and iterated based on results.&quot;</p>
        </div>
        <p>The second version of each bullet uses language that a tech recruiter recognizes: systems, data, iteration, scale. The work is the same. The framing is different. This matters more than almost anything else on your resume. If you are not sure how to quantify your past work, our guide on <Link href="/impact" className={link}>measuring impact without hard data</Link> can help.</p>

        <h2 className={h2}>3. Show Projects That Prove It</h2>
        <p>Talk is cheap. If you say you are switching into software engineering, the first thing a hiring manager wants to see is code you have actually written. Side projects are the single best way to prove you can do the job you are asking for.</p>
        <p>These do not need to be massive. A deployed web app, a small CLI tool, a data pipeline that cleans and visualizes a public dataset. What matters is that the project exists, it works, and someone can look at it. A GitHub link to a real project beats three paragraphs about your &quot;passion for technology.&quot;</p>
        <p>Read our guide on <Link href="/code" className={link}>showing your code on your resume</Link> for specifics on what to include and how to present it. The short version: link to the project, describe what it does in one sentence, and mention what you built it with.</p>

        <h2 className={h2}>4. Drop Irrelevant Experience</h2>
        <p>This feels wrong. You spent years building that experience. But a resume is not a biography. It is a sales document for a specific job.</p>
        <p>If your five years as a dental hygienist has no connection to a product management role, leave it off. Every line of irrelevant experience pushes relevant content further down the page. And recruiters do not scroll. They scan from the top.</p>
        <p>You do not need to account for every year of your life. Gaps are fine when your recent section clearly shows you building toward the role you want. What hurts you more than a gap is a resume full of unrelated work that makes the recruiter wonder why you applied.</p>

        <h2 className={h2}>5. Use a Hybrid Format</h2>
        <p>The standard reverse-chronological resume format works against career changers. It puts your most recent (and often most irrelevant) job title front and center. A hybrid format fixes this by leading with skills and projects, then following with a shorter employment history.</p>
        <p>The structure looks like this: summary at the top, then a skills section, then projects or portfolio, and finally a condensed work history at the bottom. This way, the recruiter sees what you can do before they see where you have worked.</p>
        <p>This format is sometimes called a functional resume, but pure functional resumes raise red flags because they hide dates entirely. The hybrid keeps dates visible. It just reorders the sections so skills come first.</p>

        <h2 className={h2}>6. Put Certifications Up Front</h2>
        <p>If you completed a bootcamp, earned an AWS certification, finished a Google Career Certificate, or got any credential related to your new field, that goes near the top. Not buried at the bottom under &quot;Additional Information.&quot;</p>
        <p>For career changers, certifications serve a specific purpose: they signal commitment. A hiring manager sees your background is in marketing, but you spent 6 months doing a full-stack bootcamp and passed the AWS Solutions Architect exam. That tells them this is not a whim. You invested real time and effort.</p>
        <p>Put your certifications right after your skills section. Include the name, the issuing organization, and the date. If the cert has a verification URL, include that too. People coming from <Link href="/academic" className={link}>academic backgrounds into commercial roles</Link> find this especially useful because it bridges the credibility gap.</p>

        <h2 className={h2}>7. Use a Web Profile URL</h2>
        <p>A one-page resume cannot tell your full story, and that is extra true when you are changing careers. You need more space to show projects, explain the transition, and present yourself as someone who belongs in the new field.</p>
        <p>A web profile gives you that space. A link like <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">cvin.bio/yourname</code> at the top of your resume lets the recruiter click through to a tailored version of your background. On your web profile, you control the layout. You can put your projects first, your bootcamp second, and your old career last. Or leave the old career off entirely.</p>
        <p>This also helps when someone shares your profile with a hiring manager. They send a link, not a file. The hiring manager sees the version of you that makes sense for this role.</p>

        <h2 className={h2}>8. Write a Bridge Summary</h2>
        <p>The very top of your resume should include a two-sentence summary that explains the switch directly. Do not make the recruiter figure out why a former teacher is applying for a data analyst role. Tell them.</p>
        <p>A good bridge summary sounds like this: &quot;Former operations manager with 6 years of experience in process tuning and data-driven decision making. Completed a data science bootcamp and built 3 end-to-end ML projects focused on supply chain forecasting.&quot;</p>
        <p>That is two sentences. Sentence one says where you are coming from and names the transferable skills. Sentence two says what you did to make the switch real. No fluff. No &quot;passionate self-starter.&quot; Just the facts that connect point A to point B.</p>
        <div className={callout}>
          <h3 className={h3}>Bridge summary formula</h3>
          <p><span className={bold}>Sentence 1:</span> &quot;[Former role] with [X years] of experience in [transferable skill 1] and [transferable skill 2].&quot;</p>
          <p><span className={bold}>Sentence 2:</span> &quot;[Completed certification/bootcamp] and [built/shipped specific proof of new skill].&quot;</p>
        </div>

        <h2 className={h2}>The Order Matters</h2>
        <p>If you only do two things from this list, rewrite your bullet points (#2) and write a bridge summary (#8). Those two changes alone will make a bigger difference than anything else because they directly address the objection in the recruiter&apos;s head: &quot;Why is this person applying for this job?&quot;</p>
        <p>Side projects (#3) and certifications (#6) are your strongest proof. Everything else is about presentation, and presentation matters, but proof matters more.</p>
        <p>Start with the bridge summary and bullet rewrites this weekend. Ship one deployed project next week. Add your web profile link once both are done. Small weekly updates beat one massive rewrite you never finish.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/academic" className={link}>How to move from academia to a commercial role</Link></li>
          <li><Link href="/code" className={link}>How to show your code on your resume</Link></li>
          <li><Link href="/impact" className={link}>Measuring impact when you do not have hard data</Link></li>
        </ul>
      </div>
  );
}
