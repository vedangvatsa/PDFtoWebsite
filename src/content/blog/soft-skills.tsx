import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        &quot;Excellent communicator.&quot; &quot;Natural leader.&quot; &quot;Team player.&quot; &quot;Detail-oriented.&quot; Four lines at the top of a summary. The recruiter&apos;s eyes glaze over. She has read those exact words on two hundred profiles this quarter. Every weak performer claims them too. Abstract traits without evidence carry zero weight.
      </p>
      <p>
        Soft skills matter enormously in hiring. Managers reject brilliant engineers who cannot coordinate across teams. They promote mid-level engineers who unblock others and write clear docs. The mistake is stating traits instead of showing incidents where you used them.
      </p>

      <h2 className={h2}>Claims vs proof</h2>
      <p>
        Replace every adjective with a specific event and outcome:
      </p>
      <ul className={ul}>
        <li>&quot;Excellent communicator&quot; becomes &quot;Ran weekly eng-marketing sync; cut feature misalignment tickets by 30%.&quot;</li>
        <li>&quot;Strong leader&quot; becomes &quot;Mentored 3 juniors; 2 promoted to mid-level within 14 months.&quot;</li>
        <li>&quot;Team player&quot; becomes &quot;Authored deploy SOP now used by 40 engineers.&quot;</li>
      </ul>
      <p>
        Same underlying skills. One version is noise. The other is evidence a recruiter can repeat to a hiring manager in one sentence.
      </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 680 300" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="130" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">The Claim</text>
          <text x="520" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">The Proof</text>
          <rect x="20" y="50" width="220" height="52" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
          <text x="130" y="82" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">&quot;Excellent communicator&quot;</text>
          <line x1="240" y1="76" x2="310" y2="76" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
          <polygon points="310,72 318,76 310,80" className="fill-zinc-400 dark:fill-zinc-500" />
          <rect x="320" y="50" width="340" height="52" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
          <text x="490" y="82" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Ran weekly cross-team syncs bridging eng and marketing</text>
          <rect x="20" y="120" width="220" height="52" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
          <text x="130" y="152" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">&quot;Strong leader&quot;</text>
          <rect x="320" y="120" width="340" height="52" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
          <text x="490" y="152" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Mentored 3 juniors into senior promotions in 12 months</text>
          <text x="340" y="275" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
            Vague claims become credible when paired with specific evidence.
          </text>
        </svg>
      </div>

      <h2 className={h2}>Deconstruct your interpersonal wins</h2>
      <p>
        Pick three conflicts or coordination problems you actually solved. Write each as a mini story in one bullet: situation, action, result.
      </p>
      <p>
        Situation: backend team and product disagreed on API scope for a launch. Action: you ran a 45-minute workshop, produced a one-page contract with request/response examples, got both leads to sign off in Slack. Result: launch shipped on date; zero post-launch scope disputes.
      </p>
      <p>
        That bullet proves communication, facilitation, and technical writing without using any of those words.
      </p>

      <div className={callout}>
        <h3 className={h3}>The metric of mentorship</h3>
        <p>
          Leadership is measured in growth of people around you. State how many reports you onboarded, how many you mentored into promotion, or how many engineers adopted a process you created. Numbers make soft skills auditable.
        </p>
      </div>

      <h2 className={h2}>Soft skills by role level</h2>

      <h3 className={h3}>Junior engineers</h3>
      <p>
        Prove learning speed and ask-for-help judgment. &quot;Pair-programmed with senior on payment module; shipped first solo PR within 3 weeks of start.&quot; &quot;Documented local setup steps; cut new hire env issues from 2 days to 4 hours.&quot;
      </p>

      <h3 className={h3}>Mid-level engineers</h3>
      <p>
        Prove cross-team delivery. &quot;Coordinated with design and QA on checkout redesign; zero P1 bugs first week live.&quot; &quot;Led retro after outage; action items reduced repeat incidents by half.&quot;
      </p>

      <h3 className={h3}>Senior and staff engineers</h3>
      <p>
        Prove influence without authority. &quot;Drove RFC adoption for service mesh; 6 of 8 teams migrated within two quarters.&quot; &quot;Presented architecture review to VP; secured headcount for platform squad.&quot;
      </p>

      <h2 className={h2}>Documentation is scalable empathy</h2>
      <p>
        Written docs are underrated proof of teamwork. Code helps today. A clear runbook helps every engineer for years. Bullet example: &quot;Wrote incident response playbook; mean time to recovery dropped from 90 to 35 minutes across on-call rotation.&quot;
      </p>
      <p>
        Onboarding guides, API references, and architecture decision records all count. Link to internal docs in interview if public sharing is blocked. Describe scope and adoption count on the resume itself.
      </p>

      <h2 className={h2}>Remote and async collaboration</h2>
      <p>
        Do not list Slack and Zoom as skills. Show async wins: &quot;Authored design doc for billing migration; async review across 3 time zones; shipped without overtime meetings.&quot; Read <Link href="/remote" className={link}>remote work on your resume</Link> for more patterns.
      </p>

      <h2 className={h2}>What to remove</h2>
      <ul className={ul}>
        <li>Skills section entries: Communication, Leadership, Problem Solving.</li>
        <li>Summary adjectives with no following evidence bullets.</li>
        <li>&quot;Passionate about technology&quot; (says everyone).</li>
        <li>&quot;Fast learner&quot; without a learning story attached.</li>
        <li>Personality test results (MBTI, Enneagram) on technical resumes.</li>
      </ul>

      <h2 className={h2}>Interview alignment</h2>
      <p>
        Every soft-skill bullet on your resume should map to a story you can tell for five minutes. Behavioral questions (tell me about conflict, failure, leadership) pull from the same inventory. If it is on the page, prepare the story. If you cannot prepare the story, remove the bullet.
      </p>

      <h2 className={h2}>Worked example: full summary rewrite</h2>
      <p>
        Before: &quot;Motivated team player with excellent communication skills seeking challenging role.&quot;
      </p>
      <p>
        After: &quot;Full-stack engineer, 5 years fintech. Ran cross-team launch process for 3 major releases. Mentored 4 juniors, 2 now mid-level. Looking for staff-track role on payments infrastructure.&quot;
      </p>
      <p>
        Same person. Second version gives a recruiter three concrete hooks in ten seconds. Pair with <Link href="/impact" className={link}>quantifying impact without revenue numbers</Link> for technical metrics alongside people metrics.
      </p>

      <h2 className={h2}>Checklist</h2>
      <ol className={ol}>
        <li>Delete abstract trait lists from skills section.</li>
        <li>Convert each trait you care about into one evidence bullet.</li>
        <li>Add numbers: people mentored, teams coordinated, time saved.</li>
        <li>Include at least one documentation or process bullet.</li>
        <li>Prepare five-minute stories for every people bullet.</li>
        <li>Front-load strongest interpersonal win in recent role section.</li>
      </ol>

      <h2 className={h2}>Conflict and feedback examples</h2>
      <p>
        Disagreement bullets work when they show resolution, not drama. &quot;Disagreed with product on scope for v2 launch; proposed phased rollout; shipped core flow on time with  zero rollback.&quot; That proves negotiation and delivery. Avoid bullets that sound like complaints about former coworkers.
      </p>
      <p>
        Feedback culture: &quot;Introduced blameless postmortem template; team adopted across 3 squads within one quarter.&quot; Shows you improve systems for others, a staff-level soft skill even at mid-level titles.
      </p>

      <h2 className={h2}>Stakeholder management without the buzzword</h2>
      <p>
        Replace &quot;managed stakeholders&quot; with names and outcomes. &quot;Presented quarterly roadmap to CFO and legal; secured budget for second platform engineer.&quot; &quot;Aligned security and product on auth redesign; reduced review cycle from 3 weeks to 5 days.&quot; Specific audiences and results beat generic stakeholder language.
      </p>

      <h2 className={h2}>Hiring manager perspective</h2>
      <p>
        When I forward a candidate internally, I paste one technical bullet and one people bullet. Give me material I can forward. &quot;Cut deploy time 40%&quot; plus &quot;Wrote runbook adopted by 40 engineers&quot; is an easy Slack message. &quot;Great team player&quot; is not forwardable. Write bullets your referrer can copy without rewriting.
      </p>

      <h2 className={h2}>Cross-functional roles</h2>
      <p>
        Product managers, tech leads, and engineering managers need soft-skill proof even more than IC engineers. Your bullets should show decisions that involved multiple teams. &quot;Facilitated prioritization workshop with eng, design, and support; reduced backlog thrash by one third over two quarters.&quot; That sentence proves facilitation, alignment, and measurable process improvement without using the word leader once.
      </p>

      <h2 className={h2}>Customer-facing technical roles</h2>
      <p>
        Solutions engineers, support engineers, and developer advocates should cite customer outcomes. &quot;Resolved 40 enterprise tickets/month with 95% CSAT&quot; or &quot;Presented API workshop to 200 developers at annual user conference.&quot; External-facing proof is easy to verify and hard to fake.
      </p>
      <p>
        Sales engineering candidates: include one bullet about a deal you helped close or a POC you built that converted. Revenue-adjacent metrics are fair game in those roles even when pure engineers avoid dollar claims.
      </p>

      <h2 className={h2}>Writing and speaking as soft skills</h2>
      <p>
        Published blog posts, conference talks, and internal tech talks count. Link the recording or slides. &quot;Gave talk on idempotency patterns to 80 engineers; became required onboarding viewing.&quot; Clear technical communication is a soft skill with a hard artifact. It separates senior candidates who influence org thinking from strong coders who never explain their work.
      </p>
      <p>
        Code review culture: &quot;Reviewed 200+ PRs/quarter; caught two security issues before prod deploy.&quot; Shows attention to team quality without claiming a personality trait.
      </p>

      <h2 className={h2}>Onboarding others as proof</h2>
      <p>
        If you designed onboarding for new hires, say how many people went through it and what improved. &quot;Built two-week onboarding curriculum; new hire time-to-first-PR dropped from 10 days to 4.&quot; That is empathy with a metric. It matters for senior roles where you multiply team output beyond personal output alone.
      </p>
      <p>
        Pair people bullets with technical bullets on the same resume. Pure people skills with no technical anchor reads as manager track only. Pure technical with no people signal reads as hard to place on collaborative teams. Balance both if you want staff-level consideration.
      </p>

      <h2 className={h2}>Support and customer-facing proof</h2>
      <p>
        Support engineers and customer success engineers often undersell soft skills because their wins look operational. Translate ticket work into people outcomes. &quot;Owned tier-2 queue for enterprise accounts; reduced repeat escalations 35% by writing root-cause summaries product could act on.&quot; That proves patience, writing, and cross-team coordination without calling yourself a communicator.
      </p>
      <p>
        Developer advocates should cite audience size and follow-up. &quot;Ran office hours for 60 developers migrating to v2 API; cut open support threads from 40/week to 12 within one month.&quot; The metric is support deflection. The soft skill is teaching under pressure.
      </p>

      <h2 className={h2}>Onboarding others as a resume bullet</h2>
      <p>
        Knowledge transfer is one of the clearest soft-skill proofs for mid-level and senior ICs. &quot;Onboarded 5 engineers to payments service; average time to first prod PR dropped from 3 weeks to 8 days after checklist rollout.&quot; You did not need to say you are helpful. The timeline proves it.
      </p>
      <p>
        Pair onboarding bullets with a doc link in interview if NDAs allow. &quot;Wrote service ownership guide adopted by 3 teams&quot; is stronger when you can show the table of contents live. Written artifacts make soft skills auditable months after you left the company.
      </p>

      <h2 className={h2}>Related reading</h2>
      <ul className={ul}>
        <li><Link href="/impact" className={link}>Quantify your resume without numbers</Link></li>
        <li><Link href="/remote" className={link}>Remote work on your resume</Link></li>
        <li><Link href="/summaries" className={link}>Technical summaries for senior roles</Link></li>
        <li><Link href="/replacements" className={link}>Career objective replacements</Link></li>
      </ul>
    </div>
  );
}
