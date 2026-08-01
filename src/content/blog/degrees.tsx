import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        Google, Apple, IBM, and Dell dropped degree requirements for many technical roles between 2020 and 2024. Stripe, Shopify, and countless Series B startups never cared much in the first place. A decade ago, missing a CS degree from a top school could disqualify you before a human opened your file. Today the first screen is what you built, not where you sat for four years.
      </p>
      <p>
        This shift happened because engineering managers learned that four years of theory has weak correlation with shipping software under deadline pressure. The industry moved toward skills-based hiring. Nobody asks where you studied until after they see proof you can do the job.
      </p>
      <p>
        That does not mean degrees are worthless. A strong CS program still opens doors, especially for new grads and research-heavy roles. It means that if you do not have a famous diploma, you can win by restructuring your profile so projects and deployments land first.
      </p>

      <h2 className={h2}>Flipping the traditional hierarchy</h2>
      <p>
        If you lack a well-known degree, restructure your profile. The classic template puts education at the top. Ignore that rule. Put commercial project wins and technical deployments where the eye lands in the first ten seconds.
      </p>
      <p>
        Push education to the bottom. Treat it like a footnote. When a recruiter sees the payment platform you built before she scrolls to your bootcamp certificate, the school name matters less.
      </p>
      <p>
        Order for no-degree or unknown-school candidates:
      </p>
      <ol className={ol}>
        <li>Two-sentence summary with stack and domain (fintech, infra, ML).</li>
        <li>Top three projects or roles with metrics and live links.</li>
        <li>Skills anchored to work history, not a floating keyword block.</li>
        <li>Certifications that match the target role (AWS, Security+, etc.).</li>
        <li>Education last, one or two lines.</li>
      </ol>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 680 300" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="140" y="24" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Old Layout</text>
          <rect x="30" y="38" width="220" height="240" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <rect x="44" y="50" width="192" height="100" rx="4" className="fill-amber-50 dark:fill-amber-900/15 stroke-amber-300 dark:stroke-amber-700" strokeWidth="1" />
          <text x="140" y="72" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Education</text>
          <text x="140" y="90" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">B.S. Computer Science</text>
          <rect x="44" y="162" width="192" height="50" rx="4" className="fill-zinc-50 dark:fill-zinc-800/50 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
          <text x="140" y="182" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Projects</text>
          <line x1="275" y1="158" x2="390" y2="158" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
          <polygon points="390,153 405,158 390,163" className="fill-zinc-400 dark:fill-zinc-500" />
          <text x="530" y="24" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">New Layout</text>
          <rect x="420" y="38" width="220" height="240" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <rect x="434" y="50" width="192" height="120" rx="4" className="fill-emerald-50 dark:fill-emerald-900/15 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
          <text x="530" y="72" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Projects and Experience</text>
          <text x="530" y="90" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Payment dashboard, React</text>
          <text x="530" y="104" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">CLI tool, 200 GitHub stars</text>
          <rect x="434" y="230" width="192" height="38" rx="4" className="fill-zinc-50 dark:fill-zinc-800/50 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
          <text x="530" y="248" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Education (footnote)</text>
        </svg>
      </div>

      <h2 className={h2}>Proof that replaces a diploma</h2>
      <p>
        Recruiters rank evidence. Here is what carries weight without a degree, from strongest to weakest:
      </p>
      <ul className={ul}>
        <li><span className={bold}>Live deployed product</span> with real users or revenue.</li>
        <li><span className={bold}>Merged open source PRs</span> to known repositories.</li>
        <li><span className={bold}>Paid contract or freelance work</span> with verifiable clients.</li>
        <li><span className={bold}>Industry certifications</span> with public verification IDs.</li>
        <li><span className={bold}>Bootcamp capstone</span> plus independent projects beyond the curriculum.</li>
        <li><span className={bold}>Skills listed as words</span> with no linked proof.</li>
      </ul>
      <p>
        Read the full ranking in <Link href="/skills" className={link}>ways to prove skills without a degree</Link>. Your job is to climb that ladder with links, not adjectives.
      </p>

      <div className={callout}>
        <h3 className={h3}>The autodidact advantage</h3>
        <p>
          Do not apologize for being self-taught. Teaching yourself full-stack development while working retail proves discipline. Say it plainly in your summary: &quot;Self-taught engineer, four years shipping production React and Node apps for two fintech clients.&quot; Grit reads better than a generic diploma line.
        </p>
      </div>

      <h2 className={h2}>Bootcamps are tools, not diplomas</h2>
      <p>
        A twelve-week bootcamp accelerates learning. It is not a university degree and should not be formatted like one. List the curriculum briefly, then immediately show what you built outside guided tutorials.
      </p>
      <p>
        Bad: three bullets describing classroom modules with no shipped work.
      </p>
      <p>
        Good: &quot;General Assembly Web Dev Immersive (2023). Post-grad: deployed expense tracker with 400 weekly active users; contributed auth fix to open source billing library.&quot;
      </p>
      <p>
        Hiring managers want independent builders. Prove you ship without an instructor walking you through every step.
      </p>

      <h2 className={h2}>Certifications that actually help</h2>
      <p>
        Certs do not replace projects. They signal baseline knowledge to HR screens and non-technical recruiters. Match cert to role:
      </p>
      <ul className={ul}>
        <li>Cloud: AWS Solutions Architect, Google Cloud Professional Cloud Architect.</li>
        <li>Security: CompTIA Security+, CISSP for senior roles.</li>
        <li>Data: Google Data Analytics Certificate, dbt fundamentals.</li>
        <li>Frontend: no cert beats a live portfolio; skip generic &quot;web dev&quot; badges.</li>
      </ul>
      <p>
        Put the verification URL on your profile. A cert without a link is a claim.
      </p>

      <h2 className={h2}>Companies and roles where degrees still matter</h2>
      <p>
        Be realistic. Some paths still favor formal credentials:
      </p>
      <ul className={ul}>
        <li>Quant finance and certain hedge funds.</li>
        <li>Defense contractors with clearance requirements tied to education history.</li>
        <li>Research labs and ML roles expecting PhD-level publication records.</li>
        <li>Some government civil service grades with hard degree minimums.</li>
      </ul>
      <p>
        If your target list is mostly product startups and mid-size tech, skills-based hiring is the norm. If your target is Goldman or a national lab, plan accordingly or target different employers.
      </p>

      <h2 className={h2}>Application tactics without a degree</h2>
      <p>
        Apply through referrals when possible. A warm intro gets your profile past the &quot;filter by education&quot; checkbox a junior recruiter might use. Lead with a <Link href="/pdf-to-website" className={link}>CV website link</Link> that puts projects above the fold. In cover notes, name one deployed project and one metric in the first sentence.
      </p>
      <p>
        Skip job posts that say &quot;BS required, no exceptions&quot; unless you have a strong referral. Focus energy on &quot;degree or equivalent experience&quot; language. That phrase is an open door if your portfolio is strong.
      </p>

      <h2 className={h2}>Interview prep when they ask about school</h2>
      <p>
        Expect the question once. Answer in one sentence: &quot;I am self-taught and started building production apps in 2019; my path is in the project section.&quot; Then redirect: &quot;Happy to walk through the payments migration at Client X.&quot; Do not get defensive. Do not over-explain. Let the work talk.
      </p>

      <h2 className={h2}>Common mistakes</h2>
      <ul className={ul}>
        <li>Leading with bootcamp name and no shipped projects.</li>
        <li>Hiding lack of degree and hoping nobody asks (they will).</li>
        <li>Listing fifty skills to compensate for no school (reads as stuffing).</li>
        <li>Applying only to companies that still require elite CS degrees.</li>
        <li>No live links: GitHub empty, no deployed URL, no verifiable proof.</li>
      </ul>

      <h2 className={h2}>Checklist</h2>
      <ol className={ol}>
        <li>Move projects and experience to the top third of your profile.</li>
        <li>Add live links to every major project.</li>
        <li>Bury education at the bottom unless you went to a top program.</li>
        <li>Get one relevant cert with a public verification link if you lack work history.</li>
        <li>Write a summary that states your path in one honest sentence.</li>
        <li>Target employers with skills-based hiring language in job posts.</li>
        <li>Publish a <Link href="/cv-website-vs-pdf" className={link}>CV website</Link> so projects render well on mobile.</li>
      </ol>

      <h2 className={h2}>Building proof from zero</h2>
      <p>
        No degree, no job history, no portfolio yet. Start here: ship one small app with a real URL this month. Write three bullets about what it does and who could use it. Add one cert with a verification link next month. Apply to junior roles and contract gigs that say &quot;equivalent experience.&quot; Six months of consistent public work beats a blank profile with perfect formatting.
      </p>
      <p>
        Community college courses, Coursera specializations, and local meetup talks count as supporting evidence when paired with projects. List them under Training, not Education, unless you earned a degree. The hierarchy stays: shipped work first, credentials second, coursework third.
      </p>

      <h2 className={h2}>When you do have a strong degree</h2>
      <p>
        If you graduated from a program recruiters recognize and you are a new grad, education can stay near the top. The flip advice targets candidates whose school name does not open doors on its own. Senior engineers with ten years of experience should move education to the bottom regardless of school prestige. Your recent work outweighs where you studied in 2012.
      </p>

      <h2 className={h2}>Self-taught path in interviews</h2>
      <p>
        Expect one question about your learning path. Have a crisp answer: what you built first, what you read or watched, what production experience followed. Avoid apologizing. Avoid claiming you know everything a CS grad knows. Claim you ship, you learn fast, and here is the evidence on your profile.
      </p>
      <p>
        Technical interviews are the real filter for no-degree candidates. Your resume gets you to the screen. Code and system design get you the offer. Invest interview prep time proportional to how much your resume leans on projects over credentials.
      </p>

      <h2 className={h2}>Networking without an alumni network</h2>
      <p>
        Degree holders tap alumni databases. Self-taught candidates tap communities: local meetups, Discord servers, open source maintainers, Twitter engineers who post hiring threads. Your public work is your network entry ticket. Comment thoughtfully on a maintainer&apos;s PR, then DM with a specific question. Cold applications alone are slower without school brand. Community presence compensates.
      </p>

      <h2 className={h2}>Salary and level without pedigree</h2>
      <p>
        No degree does not mean no senior roles. It means your proof must be undeniable at the level you claim. Staff engineer without a degree is common at product companies. Principal at a bank may still want credentials. Research the employer. Match your title claims to what your public artifacts support. A GitHub full of toy apps does not support a staff claim. Production systems at scale do.
      </p>
      <p>
        Negotiate on demonstrated impact, not on educational deficit. Never bring up the missing degree in salary conversation unless they raise it. Lead with market rate for the scope you have already proven.
      </p>

      <h2 className={h2}>Related reading</h2>
      <ul className={ul}>
        <li><Link href="/skills" className={link}>Ways to prove skills without a degree</Link></li>
        <li><Link href="/code" className={link}>How to show projects on your resume</Link></li>
        <li><Link href="/projects" className={link}>Best personal projects for a software CV</Link></li>
        <li><Link href="/career" className={link}>Resume strategies for career changers</Link></li>
      </ul>
    </div>
  );
}
