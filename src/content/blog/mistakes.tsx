import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>Every resume has mistakes. Most people know about the obvious ones like typos and bad formatting. But some mistakes do far more damage than others. A missing comma is annoying. Misspelling the company name you are applying to is a death sentence.</p>
        <p>I ranked the ten most common resume mistakes by how much they actually hurt your chances. The list starts with the ones that get you rejected immediately and works down to the ones that quietly hold you back.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 640 520" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Severity chart ranking 10 resume mistakes from most to least damaging">
            <style>{`
              .sev-title { font: bold 13px system-ui; }
              .sev-rank { font: bold 13px system-ui; fill: white; }
              .sev-label { font: 12px system-ui; fill: white; }
              .sev-zone { font: bold 10px system-ui; text-anchor: middle; }
            `}</style>
            <text x="320" y="22" className="sev-title fill-zinc-900 dark:fill-zinc-100" textAnchor="middle">Resume Mistakes. Damage Severity Scale</text>
            {/* Zone labels */}
            <text x="24" y="80" className="sev-zone" fill="#dc2626" transform="rotate(-90 24 80)" style={{letterSpacing: '2px'}}>CRITICAL</text>
            <text x="24" y="240" className="sev-zone" fill="#ea580c" transform="rotate(-90 24 240)" style={{letterSpacing: '2px'}}>SERIOUS</text>
            <text x="24" y="400" className="sev-zone" fill="#ca8a04" transform="rotate(-90 24 400)" style={{letterSpacing: '2px'}}>MODERATE</text>
            {/* #1 */}
            <rect x="44" y="38" width="576" height="40" rx="6" fill="#dc2626" opacity="0.95" />
            <text x="60" y="63" className="sev-rank">#1</text>
            <text x="96" y="63" className="sev-label">Typos in company names. instant rejection</text>
            {/* #2 */}
            <rect x="44" y="84" width="540" height="40" rx="6" fill="#dc2626" opacity="0.82" />
            <text x="60" y="109" className="sev-rank">#2</text>
            <text x="96" y="109" className="sev-label">Generic objective statements. says nothing useful</text>
            {/* #3 */}
            <rect x="44" y="130" width="504" height="40" rx="6" fill="#ea580c" opacity="0.85" />
            <text x="60" y="155" className="sev-rank">#3</text>
            <text x="96" y="155" className="sev-label">Overstuffed bullet points. eyes glaze over</text>
            {/* #4 */}
            <rect x="44" y="176" width="468" height="40" rx="6" fill="#ea580c" opacity="0.78" />
            <text x="60" y="201" className="sev-rank">#4</text>
            <text x="96" y="201" className="sev-label">Skill bars and ratings. no real meaning</text>
            {/* #5 */}
            <rect x="44" y="222" width="432" height="40" rx="6" fill="#d97706" opacity="0.8" />
            <text x="60" y="247" className="sev-rank">#5</text>
            <text x="96" y="247" className="sev-label">Non-responsive formatting. unreadable on mobile</text>
            {/* #6 */}
            <rect x="44" y="268" width="396" height="40" rx="6" fill="#d97706" opacity="0.72" />
            <text x="60" y="293" className="sev-rank">#6</text>
            <text x="96" y="293" className="sev-label">Wrong file format. blocked or broken</text>
            {/* #7 */}
            <rect x="44" y="314" width="360" height="40" rx="6" fill="#ca8a04" opacity="0.75" />
            <text x="60" y="339" className="sev-rank">#7</text>
            <text x="96" y="339" className="sev-label">Missing keywords. filtered by ATS</text>
            {/* #8 */}
            <rect x="44" y="360" width="324" height="40" rx="6" fill="#ca8a04" opacity="0.65" />
            <text x="60" y="385" className="sev-rank">#8</text>
            <text x="96" y="385" className="sev-label">Gaps with no explanation. invites assumptions</text>
            {/* #9 */}
            <rect x="44" y="406" width="288" height="40" rx="6" fill="#a3a3a3" opacity="0.7" />
            <text x="60" y="431" className="sev-rank">#9</text>
            <text x="96" y="431" className="sev-label">Outdated contact info. silent missed calls</text>
            {/* #10 */}
            <rect x="44" y="452" width="252" height="40" rx="6" fill="#a3a3a3" opacity="0.55" />
            <text x="60" y="477" className="sev-rank">#10</text>
            <text x="96" y="477" className="sev-label">No way to verify claims. low trust</text>
            {/* Footer */}
            <text x="320" y="510" textAnchor="middle" style={{font: '11px system-ui'}} className="fill-zinc-400 dark:fill-zinc-500">Bar length = relative impact on your chances of getting an interview</text>
          </svg>
        </div>

        <h2 className={h2}>#1: Typos in Company Names</h2>
        <p>This is the single most damaging mistake you can make. If your resume says &quot;Gogle&quot; or &quot;Micosoft&quot; or &quot;Amzon,&quot; the recruiter assumes you did not proofread a document that represents the most important parts of your career. They stop reading.</p>
        <p>It gets worse when you misspell the company you are applying to. That tells the recruiter this is a mass-blasted application where you did not even swap in the right name. I talked to a recruiter at a Series B startup who said she rejects about 5% of applications purely for this reason.</p>
        <p>The fix is simple. Read your resume out loud before you send it. Spell-check catches &quot;teh&quot; but it does not catch &quot;Googel&quot; because that is not a dictionary word. Your eyes need to do this work.</p>

        <h2 className={h2}>#2: Generic Objective Statements</h2>
        <p>&quot;Seeking a challenging position where I can apply my skills and grow professionally.&quot; This sentence appears on thousands of resumes and says absolutely nothing. It tells the recruiter you could not be bothered to write something specific to their role.</p>
        <p>The deeper problem is that <Link href="/objective" className={link}>objective statements center the resume around what you want</Link> instead of what you offer. The recruiter does not care what you are seeking. They care what you can do for them. Replace the objective with a two-sentence summary of your strongest relevant experience.</p>

        <h2 className={h2}>#3: Overstuffed Bullet Points</h2>
        <p>You know the type. A single bullet point that runs four lines long, lists six technologies, mentions three projects, and somehow also includes a soft skill. The recruiter&apos;s eyes glaze over after the first line. They skip the bullet entirely and probably the rest of your experience section too.</p>
        <p>Good bullet points do one thing: state a result. <Link href="/bullets" className={link}>Each bullet should be one accomplishment with one measurable outcome</Link>. If your bullet point has the word &quot;and&quot; more than once, it needs to be split into two bullets or trimmed down.</p>

        <h2 className={h2}>#4: Skill Bars and Ratings</h2>
        <p>Those visual bars that show you are &quot;85% proficient in JavaScript&quot; look nice in Canva templates. They are useless to recruiters. What does 85% even mean? Compared to whom? A senior engineer at Google would rate themselves differently than a bootcamp graduate, and the bar gives no context for either.</p>
        <p>Skill bars also <Link href="/skill-bars" className={link}>actively hurt your credibility</Link>. If you rate yourself 4 out of 5 in React, the interviewer will test you at that level. If you are actually at a 2, you just set yourself up to fail. Drop the bars. List your skills as plain text, and let your project descriptions prove your depth.</p>

        <div className={callout}>
          <h3 className={h3}>A quick self-test</h3>
          <p>Open your resume right now. Count how many of these first four mistakes you have. If the answer is two or more, your resume is likely getting filtered out before a human ever reads it. The good news: all four are fixable in twenty minutes.</p>
        </div>

        <h2 className={h2}>#5: Non-Responsive Formatting</h2>
        <p>Your two-column PDF with the sidebar looks great on your laptop. It looks terrible on a recruiter&apos;s phone. Over 60% of initial resume screens happen on mobile now. If your resume requires pinch-zooming to read, most recruiters will close it and move on to the next candidate.</p>
        <p>The fix is to either simplify your PDF to a single column or switch to a <Link href="/mobile" className={link}>web-based profile that adapts to any screen size</Link> automatically. Your content stays the same. The reading experience just stops being painful.</p>

        <h2 className={h2}>#6: Wrong File Format</h2>
        <p>Sending a.pages file to a Windows user. Exporting a Canva design as a JPEG instead of a PDF. Submitting a Google Doc link that requires sign-in. Every wrong file format is a barrier between you and the person trying to read your resume.</p>
        <p>If you must send a file, PDF is the safest bet. But even PDFs get stripped by corporate email security. The most reliable approach is a permanent web link that works for everyone, on every device, with no software required.</p>

        <h2 className={h2}>#7: Missing Keywords</h2>
        <p>Many companies use applicant tracking systems that scan for specific terms before a human ever sees your resume. If the job posting says &quot;Kubernetes&quot; and your resume only says &quot;container orchestration,&quot; you might get filtered out even though you clearly know the tool.</p>
        <p>This does not mean you should stuff your resume with buzzwords. It means you should <Link href="/trust" className={link}>mirror the language from the job description</Link> when it honestly describes your experience. Read the posting carefully. If they say &quot;React,&quot; write &quot;React.&quot; If they say &quot;CI/CD,&quot; write &quot;CI/CD.&quot; Do not make the software guess.</p>

        <h2 className={h2}>#8: Gaps With No Explanation</h2>
        <p>A one-year gap on your resume is not a problem. A one-year gap with no explanation is. Recruiters will fill in the blank with their worst assumption. They might think you were fired and could not find work. The reality might be that you were freelancing, caring for family, or traveling.</p>
        <p>You do not need a long story. A single line like &quot;2022-2023: Freelance consulting for early-stage startups&quot; or &quot;2023: Career break for family care&quot; removes the mystery. <Link href="/gaps" className={link}>Brief, honest gap explanations</Link> actually build trust. Silence does the opposite.</p>

        <h2 className={h2}>#9: Outdated Contact Info</h2>
        <p>This one is quieter than the others but still costly. If a recruiter tries to call the number on your resume and gets a disconnected line, or emails an address you stopped checking two years ago, that opportunity is gone. You will never know it happened.</p>
        <p>Check your resume right now. Is the email address current? Does the phone number work? Is there a LinkedIn URL that goes to the right profile? If you use a web-based profile, you can update contact details in one place and every link you have ever shared stays current.</p>

        <h2 className={h2}>#10: No Way to Verify Claims</h2>
        <p>You say you &quot;increased revenue by 40%.&quot; The recruiter thinks: &quot;Says who?&quot; Resumes are self-reported documents with no built-in way to check if anything is true. That is fine when your claims are modest. But the bigger the claim, the more skepticism it generates.</p>
        <p>The best way to back up your resume is to link to evidence. GitHub repos, live projects, published articles, or a portfolio page. A web profile makes this easy because you can embed links directly alongside each claim. A PDF can only print a URL that nobody will bother to type into a browser.</p>

        <div className={callout}>
          <h3 className={h3}>Fix all ten in under an hour</h3>
          <p>None of these mistakes require a full resume rewrite. Proofread for typos (5 min). Kill the objective statement (2 min). Trim your bullets (10 min). Remove skill bars (2 min). Test on your phone (3 min). Check your file format (1 min). Add missing keywords (10 min). Explain gaps (5 min). Verify contact info (2 min). Add one portfolio link (5 min). Total: about 45 minutes for a dramatically better resume.</p>
        </div>

        <h2 className={h2}>Why Small Mistakes Stack</h2>
        <p>Each mistake on this list creates a separate reason to reject you. They compound. A typo plus skill bars plus a generic objective is three strikes before the recruiter finishes page one.</p>
        <p>Fix them in severity order. The top four items take about twenty minutes and remove the biggest risks. The rest is polish, but polish still matters when you are competing against hundreds of applicants for one role.</p>
        <p>Run the same checklist before every application. A resume that passed last month might have a stale phone number or a broken project link today.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/objective" className={link}>Why objective statements are dead</Link></li>
          <li><Link href="/bullets" className={link}>How to write resume bullets that get read</Link></li>
          <li><Link href="/skill-bars" className={link}>Why skill bars hurt more than they help</Link></li>
        </ul>
      </div>
  );
}
