import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        A hiring manager opens your profile. She sees Senior Engineer at Acme Corp ending March 2022, then nothing until Staff Engineer at Nova Labs starting January 2023. Nine blank months. Her first guess: you were job hunting and getting rejected. Her second guess: something went wrong and you are hiding it.
      </p>
      <p>
        Taking extended time away from work is normal. Parental leave, burnout recovery, caregiving, immigration paperwork, a deliberate sabbatical. Candidates have been scared into thinking a gap longer than three months ruins a career. That fear pushes people to stretch old job dates or list only years instead of months. Both tactics fail background checks and kill offers.
      </p>
      <p>
        When you hide a career gap, you risk automatic rejection during verification. If they discover you lied about a start or end date, trust is gone. The recruiter assumes the worst and pulls the offer. Do not hide the gap. Label it.
      </p>

      <h2 className={h2}>The power of explicit labeling</h2>
      <p>
        The best way to handle a career break is to own it. Treat the missing time like a formal job entry. Put the start and end dates clearly on the page and give the gap an explicit title. Label it Planned Sabbatical, Full-Time Caregiver, or Career Transition and the guessing game is over.
      </p>
      <p>
        When a hiring manager sees an unexplained gap, she assumes you spent that time job hunting without success. When she sees the same gap labeled as a deliberate choice with a one-line explanation, she moves on to your skills. The gap stops being a mystery and becomes a footnote.
      </p>
      <p>
        Format it like any other role:
      </p>
      <ul className={ul}>
        <li><span className={bold}>Title:</span> Independent Study / Sabbatical</li>
        <li><span className={bold}>Dates:</span> April 2022 to December 2022</li>
        <li><span className={bold}>One bullet:</span> Completed AWS Solutions Architect cert; built inventory API used in portfolio demos.</li>
      </ul>
      <p>
        That is nine months accounted for. No deception. No awkward interview surprise.
      </p>

      <div className={callout}>
        <h3 className={h3}>Transforming gaps into projects</h3>
        <p>
          If you spent six months learning Rust or building a side app, name the gap after the work. List yourself as Independent Developer and outline the stack, users, or certifications earned. Self-directed engineering reads as intentional, not idle. Technical managers respect people who used downtime to sharpen skills.
        </p>
      </div>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 680 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="20" y="24" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-red-400">
            Without explanation
          </text>
          <line x1="20" y1="60" x2="660" y2="60" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <rect x="20" y="40" width="150" height="40" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="95" y="57" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Frontend Dev</text>
          <text x="95" y="70" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">2019 to 2021</text>
          <rect x="180" y="40" width="140" height="40" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="250" y="57" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Sr. Engineer</text>
          <text x="250" y="70" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">2021 to 2022</text>
          <text x="390" y="57" textAnchor="middle" fontSize="16" fontFamily="system-ui, sans-serif" className="fill-red-400">?</text>
          <text x="390" y="72" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-red-400">9 months</text>
          <rect x="460" y="40" width="190" height="40" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="555" y="57" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Staff Engineer</text>
          <text x="555" y="70" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">2023 to Present</text>
          <line x1="20" y1="110" x2="660" y2="110" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />
          <text x="20" y="140" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-500">With explanation</text>
          <line x1="20" y1="176" x2="660" y2="176" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <rect x="20" y="156" width="150" height="40" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="95" y="173" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Frontend Dev</text>
          <rect x="180" y="156" width="140" height="40" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="250" y="173" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Sr. Engineer</text>
          <rect x="330" y="156" width="120" height="40" rx="4" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-400 dark:stroke-emerald-700" strokeWidth="1" strokeDasharray="4 2" />
          <text x="390" y="171" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Planned Sabbatical</text>
          <text x="390" y="183" textAnchor="middle" fontSize="8" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">React + AWS study</text>
          <rect x="460" y="156" width="190" height="40" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="555" y="173" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Staff Engineer</text>
          <text x="340" y="250" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
            A blank gap invites suspicion. A labeled gap earns respect.
          </text>
        </svg>
      </div>

      <h2 className={h2}>Gap types and how to label them</h2>

      <h3 className={h3}>Parental or caregiving leave</h3>
      <p>
        Title: Parental Leave or Family Caregiver. One line: &quot;Full-time care for newborn; maintained part-time open source contributions.&quot; No apology needed. Companies with mature HR policies expect this. Hiding it looks worse than stating it plainly.
      </p>

      <h3 className={h3}>Health or burnout recovery</h3>
      <p>
        You owe strangers minimal detail. Title: Personal Leave or Health Sabbatical. Dates only. One neutral bullet if you did anything professional: &quot;Completed online courses in distributed systems during recovery period.&quot; Interviewers may ask gently. A short honest answer plus pivot to readiness works.
      </p>

      <h3 className={h3}>Immigration or visa gaps</h3>
      <p>
        Title: Work Authorization Transition or Relocation. Many candidates between countries have legally required gaps. Label the period. Hiring managers who work with global talent understand paperwork delays.
      </p>

      <h3 className={h3}>Layoff and extended search</h3>
      <p>
        If you were laid off in March and started a new role in November, do not pretend you were employed. Title: Career Transition or Independent Consulting. If you did contract work, list clients or project types. If you studied, list certs and projects. A labeled search period beats fabricated employment every time.
      </p>

      <h3 className={h3}>Deliberate sabbatical</h3>
      <p>
        Travel, rest, or skill building by choice. Title: Sabbatical. Bullet what you shipped or learned. Managers who value long-term performers respect intentional breaks more than burned-out employees who quit mid-project.
      </p>

      <h2 className={h2}>What never to do</h2>
      <ul className={ul}>
        <li>Stretch end dates at your last job to cover the gap.</li>
        <li>List only years (2022 to 2023) to hide a 14-month hole.</li>
        <li>Invent freelance clients you never had.</li>
        <li>Delete the gap and hope no one asks.</li>
        <li>Use &quot;present&quot; on a job you left two years ago.</li>
      </ul>
      <p>
        Background checks compare dates with tax records, references, and prior employers. A two-month discrepancy is a conversation. A twelve-month lie is a rescinded offer. See <Link href="/tenure" className={link}>how to explain short stints</Link> for related timeline issues.
      </p>

      <h2 className={h2}>Controlling the interview narrative</h2>
      <p>
        Once you label the gap on your profile, it becomes a strength instead of a secret. When asked on a phone screen, answer in two sentences and pivot.
      </p>
      <p>
        Example script: &quot;I took nine months after leaving Acme for a planned sabbatical. I used part of that time to get AWS certified and ship a small inventory API that is in my portfolio. I am fully available and looking for a staff-level backend role.&quot;
      </p>
      <p>
        No over-explaining. No apology tour. State the fact, mention one productive detail, return to what you want next. Managers hire people who know what they want and tell the truth under light pressure.
      </p>

      <div className={callout}>
        <h3 className={h3}>LinkedIn vs resume</h3>
        <p>
          Keep dates consistent across LinkedIn, your CV website, and any PDF you upload. Recruiters cross-check. A gap labeled on your resume but missing on LinkedIn raises the same questions as an unlabeled hole. Sync everything before you apply.
        </p>
      </div>

      <h2 className={h2}>Where gaps matter less than you think</h2>
      <p>
        Contract-heavy industries normalize gaps. Creative fields expect portfolio bursts between gigs. Tech after 2023 layoffs: many strong candidates have six-to-twelve-month searches on their record. Recruiters adjusted. What still hurts is deception, not the gap itself.
      </p>
      <p>
        A <Link href="/pdf-to-website" className={link}>live CV website</Link> helps here too. You update one page after a break ends instead of re-exporting PDFs and fixing LinkedIn separately. Consistency is easier when you maintain a single source of truth.
      </p>

      <h2 className={h2}>Checklist before you apply</h2>
      <ol className={ol}>
        <li>List every gap longer than two months with start and end dates.</li>
        <li>Give each gap a clear title (no vague &quot;break&quot; labels).</li>
        <li>Add one bullet of substance: project, cert, caregiving, or travel with purpose.</li>
        <li>Match dates on LinkedIn, PDF, and CV website.</li>
        <li>Prepare a two-sentence interview answer for each gap.</li>
        <li>Never alter employment dates to hide empty months.</li>
      </ol>

      <h2 className={h2}>Addressing gaps in cover letters</h2>
      <p>
        Your resume should label the gap. Your cover letter can add one human sentence if the gap is recent and relevant. &quot;I took six months after Acme to care for a family member and completed my AWS cert during that period.&quot; Then move to why you want this specific role. Do not write a full paragraph of personal medical history. The resume entry carries the factual record. The letter adds tone.
      </p>

      <h2 className={h2}>Gaps and ATS systems</h2>
      <p>
        Applicant tracking systems parse employment history as a timeline. A labeled gap entry parses like any other role. A blank hole sometimes triggers automated flags for incomplete profiles. Labeling is better for bots and humans. Use the same title string on PDF uploads and your <Link href="/pdf-to-website" className={link}>CV website</Link> so extracted data matches.
      </p>
      <p>
        If you did contract work during a search period, list each contract or group them under Independent Consultant with nested client bullets. Fragmented three-month gigs read better as intentional consulting than as job-hopping without context.
      </p>

      <h2 className={h2}>Long gaps (two years or more)</h2>
      <p>
        Longer breaks need slightly more substance but still not a memoir. Two or three bullets under the gap entry: what you learned, what you shipped, what changed about your goals. A two-year caregiving gap with one bullet about an open source contribution and a returned-to-work cert is enough. Interviewers want signal that you stayed connected to the field, not that you have a perfect excuse.
      </p>

      <h2 className={h2}>Multiple small gaps vs one long gap</h2>
      <p>
        Three separate four-month gaps across five years reads differently from one continuous eighteen-month gap. Multiple short gaps may suggest contract work or layoff cycles. Label each or group contract periods under one consulting heading. One long gap needs one clear label and one proof-of-activity bullet. Do not scatter unexplained two-month holes between every job if you can consolidate the story.
      </p>
      <p>
        Freelancers often have natural gaps between clients. That is normal. Format as Independent Consultant with client projects nested underneath rather than a series of unexplained blanks. Continuity of narrative matters more than continuity of W-2 employment.
      </p>

      <h2 className={h2}>What recruiters actually ask</h2>
      <p>
        Phone screen questions about gaps are usually neutral fact-finding: &quot;Walk me through 2022.&quot; They are rarely traps if your resume already answers the question. A thirty-second honest answer ends the topic. Defensive or evasive answers extend it. Prepare one sentence per gap. Practice out loud once.
      </p>
      <p>
        Red flag answers: blaming former employers at length, refusing to discuss the period, or giving a different timeline than your resume shows. Green flag answers: clear label, one productive detail, pivot to current job search goals.
      </p>

      <h2 className={h2}>Related reading</h2>
      <ul className={ul}>
        <li><Link href="/tenure" className={link}>How to explain short stints on your resume</Link></li>
        <li><Link href="/career" className={link}>Resume strategies for career changers</Link></li>
        <li><Link href="/freelance" className={link}>How to format freelance work on a CV</Link></li>
        <li><Link href="/trust" className={link}>How recruiters spot fake skills on a resume</Link></li>
      </ul>
    </div>
  );
}
