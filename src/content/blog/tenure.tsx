import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>In the traditional corporate world staying at a company for only ten months was considered a massive red flag. Recruiters viewed fast exits as irrefutable proof of either severe performance issues or toxic personality conflicts. Many hiring managers would completely throw away an application if they spotted two short stints back to back.</p>
        <p>The modern startup world has entirely shattered those old rules. Rapid layoffs and sudden pivot mandates happen constantly. Companies run out of venture funding overnight forcing entire engineering departments to hunt for new jobs on the exact same weekend. However even though short tenures are common today you still must completely control the narrative on your profile.</p>

        {/* Visual: Horizontal bar chart showing 3 short job tenures with contextual labels */}
        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 660 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Title */}
            <text x="330" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
 Short Tenures. With Context
 </text>

            {/* Row 1: 8 months */}
            <text x="20" y="75" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
 Role 1
 </text>
            <rect x="80" y="60" width="160" height="24" rx="4" className="fill-emerald-500" opacity="0.85" />
            <text x="90" y="77" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-white">
 8 months
 </text>
            <text x="252" y="77" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
 Company acquired
 </text>

            {/* Row 2: 14 months */}
            <text x="20" y="125" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
 Role 2
 </text>
            <rect x="80" y="110" width="280" height="24" rx="4" className="fill-emerald-500" opacity="0.85" />
            <text x="90" y="127" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-white">
 14 months
 </text>
            <text x="372" y="127" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
 Team pivot to new product
 </text>

            {/* Row 3: 6 months */}
            <text x="20" y="175" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
 Role 3
 </text>
            <rect x="80" y="160" width="120" height="24" rx="4" className="fill-emerald-500" opacity="0.85" />
            <text x="90" y="177" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-white">
 6 months
 </text>
            <text x="212" y="177" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
 Contract role
 </text>

            {/* Scale marks */}
            <line x1="80" y1="200" x2="80" y2="206" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
            <text x="80" y="218" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">0</text>

            <line x1="200" y1="200" x2="200" y2="206" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
            <text x="200" y="218" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">6 mo</text>

            <line x1="320" y1="200" x2="320" y2="206" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
            <text x="320" y="218" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">12 mo</text>

            <line x1="440" y1="200" x2="440" y2="206" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
            <text x="440" y="218" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">18 mo</text>

            {/* Baseline */}
            <line x1="80" y1="200" x2="440" y2="200" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

            {/* Takeaway */}
            <text x="330" y="252" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
 Short stays are normal. when context is visible.
 </text>
          </svg>
        </div>

        <h2 className={h2}>The Silent Danger of the Gap</h2>
        <p>When you present a string of six month jobs without any written explanation you give the recruiter permission to imagine the worst possible scenario. Human nature is naturally anxious especially when placing a permanent hire. If you leave the reason for your exit blank the reader will simply assume that you failed the probationary review period and were quietly fired.</p>
        <p>You must actively remove the guesswork. You can reframe a short stint as a story of adaptability and speed. but only if you write the explanation yourself.</p>
        
        <h2 className={h2}>Contract Labelling Reverses Risk</h2>
        <p>If a role was genuinely intended to be a short burst of contract work you must label it with perfect clarity. Appending the exact word Contract or Temporary Engagement next to the job title completely removes all the negative stigma associated with a fast exit.</p>
        <p>Suddenly a three month job is no longer a failure. It becomes proof that a company trusted you enough to drop you into a crisis and you successfully delivered a fixed product on a tight legal deadline.</p>

        <div className={callout}>
          <h3 className={h3}>Addressing Corporate Layoffs</h3>
          <p>For genuine full time roles that were cruelly cut short by mass layoffs you should focus entirely on how incredibly fast you delivered value. Write clearly that the role was eliminated due to a corporate restructuring but immediately follow that up with proof that you shipped real production code by month two. This frames you as a high velocity contributor who simply caught bad luck.</p>
        </div>

        <h2 className={h2}>Grouping Micro Experiences</h2>
        <p>If you spent three miserable years jumping between highly unstable early stage startups that kept running out of money you should not list them individually. An endless list of tiny jobs looks visually chaotic and screams career instability.</p>
        <p>Instead group all of those short sprint startups together. Call yourself an Independent Startup Consultant for that three year block. Underneath that overarching title you can confidently list the three different apps you built. This entirely smooths out the visual timeline and upgrades your title to an authoritative advisor level.</p>

        <h2 className={h2}>Write the Exit Line Before They Ask</h2>
        <p>One sentence under the job title saves ten minutes of interview awkwardness. &quot;Role ended after Series A funding fell through; team dissolved March 2024.&quot; or &quot;Contract completed after MVP launch; client retained internal team.&quot; Facts kill rumor. Silence feeds it.</p>
        <p>Keep the tone neutral. No drama about bad bosses. No legal threats. Hiring managers have seen layoffs. They have seen failed startups. They have not seen clear writing that respects their time.</p>

        <h2 className={h2}>Show Output Per Month</h2>
        <p>Short tenure plus zero shipped work looks like failure. Short tenure plus a shipped feature every month looks like intensity. List what you built in weeks, not years. &quot;Week 2: auth service live. Week 6: billing integration. Week 10: public launch with 4,200 signups.&quot;</p>
        <div className={callout}>
          <h3 className={h3}>The velocity narrative</h3>
          <p>Frame short jobs as sprints. <span className={bold}>You enter, deliver a defined outcome, exit.</span> That pattern matches how modern product teams actually work. Longevity matters less than proof you can compress work into tight windows.</p>
        </div>

        <h2 className={h2}>References and Backchannel Checks</h2>
        <p>If you left a six month role for reasons outside your control, line up one reference who can confirm it. Former manager, tech lead, or client. You do not paste their phone number on your profile. You offer them when asked. Backchannel checks happen. Make sure someone will say you were solid.</p>
        <p>For contract work, link the delivered product or a case study. Live URLs beat tenure length every time. See <Link href="/code" className={link}>how to show code with live links</Link> for formatting tips.</p>

        <h2 className={h2}>Patterns That Still Hurt You</h2>
        <p>Three full time jobs under nine months each with no explanation still triggers alarms. Two short stints with clear context is normal in tech. Six short stints without labels looks like you cannot hold a job. Use grouping, contract tags, and honest one line context to break the pattern.</p>
        <p>If you job hopped for salary alone, be ready to explain the learning curve at each stop. Recruiters want evidence you will stay eighteen months if they hire you. Tie each move to a skill jump or scope increase, not a pay bump alone.</p>

        <h2 className={h2}>Web Profiles Make Timeline Clarity Easier</h2>
        <p>A scrolling timeline on CVin.Bio can show role type badges: Full time, Contract, Acquisition. Color or label beats cramming explanations into tiny PDF margins. You can also <Link href="/update" className={link}>add context after you apply</Link> if you learn what worries the hiring team.</p>

        <h2 className={h2}>Contract Labels in Practice</h2>
        <p>Write the label in the title field, not buried in prose. &quot;Backend Engineer (6 month contract)&quot; scans instantly. A footnote on page two never gets read. If the engagement extended, update the title when you extend. Live profiles make that edit trivial compared to re exporting PDFs for every recruiter in your pipeline.</p>
        <p>References from contract clients carry extra weight for short roles. Ask permission to list them in your CVin.Bio contact section or offer them in the first reply email after a recruiter expresses interest.</p>

        <h2 className={h2}>Layoff Language That Works</h2>
        <p>Say &quot;company eliminated 30 percent of engineering in Q2 layoff&quot; once. Then pivot to output. Managers have seen layoff waves. They want to know you shipped before the axe fell. Two strong bullets after the layoff line usually reset the mood of the section.</p>
        <p>Avoid blaming leadership in writing. Interviews can explore culture fit. The profile should stay factual and forward looking.</p>

        <h2 className={h2}>Patterns Hiring Teams Forgive</h2>
        <p>Two short contracts in one year with clear labels reads fine. One nine month full time role after a funded startup shutdown reads fine. What rarely reads fine is three full time roles under a year with identical vague titles and no context. The fix is always explanation plus output, not hiding dates.</p>
        <p>Recruiters compare you to the market they see today. Layoffs in 2024 and 2025 normalized short tenures for thousands of strong engineers. Context aligns you with market reality instead of looking like an outlier.</p>

        <h2 className={h2}>Interview Timeline Questions</h2>
        <p>When asked why you left after eight months, answer in two beats: external reason in one sentence, value delivered in two sentences. Practice until it sounds conversational, not defensive. Your profile should preview that same structure so the interview feels consistent with the document.</p>
        <p>Short tenure without interview prep still hurts. Short tenure with aligned profile and practiced answer rarely blocks strong candidates.</p>

        <h2 className={h2}>Long Tenure After Short Stints</h2>
        <p>One long stable role after two short contracts resets the visual timeline. Recruiters read patterns, not single entries. Your current role matters most. If you are stable now, lead with current scope and let older short entries shrink with brief context lines.</p>
        <p>Do not hide short history. Explain it, then show the stable chapter that followed.</p>
        <p>Hiring managers remember the narrative arc. Chaos, context, recovery reads human. Mystery gaps read risky. Write the arc explicitly so interview time goes to fit and scope, not detective work.</p>
        <p>Your CVin.Bio timeline can carry short context labels recruiters see before they open the full bullet list. Use that surface area. One line of truth beats five minutes of speculation.</p>
        <p>Short tenure is a formatting problem until you explain it. After context, it becomes a data point. Write the context every time.</p>
        <p>Confidence on your timeline reads as professionalism. Vague dates and missing labels read as avoidance. Choose professionalism in every line a recruiter scans.</p>
        <p>Own the timeline you lived. Clear labels and shipped work beat perfect tenure every time hiring teams compare similar skill levels.</p>
        <p>Write the story recruiters wish every candidate wrote plainly.</p>

        <h2 className={h2}>Label contract endings honestly</h2>
        <p>When a contract ended because the project shipped, say so inline. &quot;Contract through platform launch (Mar to Sep 2024); client retained internal team.&quot; That reads as success, not failure. Omitting the reason forces recruiters to assume layoff or performance issue. One clarifying phrase costs twelve words and saves a phone screen objection.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/gaps" className={link}>How to explain gaps between short roles</Link></li>
          <li><Link href="/freelance" className={link}>Presenting freelance work as one coherent block</Link></li>
          <li><Link href="/contracts" className={link}>Negotiating contract roles on your profile</Link></li>
        </ul>
      </div>
  );
}
