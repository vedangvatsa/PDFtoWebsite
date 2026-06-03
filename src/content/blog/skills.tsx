import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>A degree used to be the default proof that you knew what you were doing. That has changed. Google, Apple, IBM, and dozens of other major companies have dropped degree requirements for technical roles. But dropping the requirement does not mean they stopped caring about proof. It means they want different proof.</p>
        <p>The question is not whether you can get hired without a degree. You can. The question is what you show instead. Not all proof is equal. A link to a live project you built carries far more weight than a paragraph describing what you &quot;know.&quot; Here are seven types of proof, ranked by how much trust they actually build with recruiters and hiring managers.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 480 380" className="w-full h-auto" role="img" aria-label="Proof strength ranking from strongest to weakest">
            <style>{`
              .tier-label { font: 600 12px system-ui; }
              .tier-text { font: 500 11px system-ui; }
              .tier-num { font: 700 11px system-ui; fill: white; }
              .tier-heading { font: 600 14px system-ui; }
            `}</style>
            <text x="240" y="22" textAnchor="middle" className="tier-heading fill-zinc-500 dark:fill-zinc-400">Proof Strength — Strongest to Weakest</text>
            {/* Tier 1 */}
            <rect x="40" y="36" width="400" height="42" rx="6" className="fill-emerald-100 dark:fill-emerald-900/40 stroke-emerald-400 dark:stroke-emerald-600" strokeWidth="1.5" />
            <circle cx="66" cy="57" r="12" className="fill-emerald-600 dark:fill-emerald-500" />
            <text x="66" y="61" textAnchor="middle" className="tier-num">1</text>
            <text x="88" y="53" className="tier-label fill-emerald-800 dark:fill-emerald-300">Live Deployed Project</text>
            <text x="88" y="68" className="tier-text fill-emerald-600 dark:fill-emerald-400">Clickable, working, proves you can ship</text>
            {/* Tier 2 */}
            <rect x="40" y="84" width="400" height="42" rx="6" className="fill-emerald-50 dark:fill-emerald-900/25 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1.5" />
            <circle cx="66" cy="105" r="12" className="fill-emerald-500 dark:fill-emerald-500" />
            <text x="66" y="109" textAnchor="middle" className="tier-num">2</text>
            <text x="88" y="101" className="tier-label fill-emerald-700 dark:fill-emerald-300">Open Source Contributions</text>
            <text x="88" y="116" className="tier-text fill-emerald-600 dark:fill-emerald-400">Merged PRs on real codebases with code review</text>
            {/* Tier 3 */}
            <rect x="40" y="132" width="400" height="42" rx="6" className="fill-lime-50 dark:fill-lime-900/20 stroke-lime-300 dark:stroke-lime-700" strokeWidth="1.5" />
            <circle cx="66" cy="153" r="12" className="fill-lime-600 dark:fill-lime-500" />
            <text x="66" y="157" textAnchor="middle" className="tier-num">3</text>
            <text x="88" y="149" className="tier-label fill-lime-800 dark:fill-lime-300">Industry Certifications</text>
            <text x="88" y="164" className="tier-text fill-lime-600 dark:fill-lime-400">Standardized, verifiable, proctored exams</text>
            {/* Tier 4 */}
            <rect x="40" y="180" width="400" height="42" rx="6" className="fill-yellow-50 dark:fill-yellow-900/15 stroke-yellow-300 dark:stroke-yellow-700" strokeWidth="1.5" />
            <circle cx="66" cy="201" r="12" className="fill-yellow-600 dark:fill-yellow-500" />
            <text x="66" y="205" textAnchor="middle" className="tier-num">4</text>
            <text x="88" y="197" className="tier-label fill-yellow-800 dark:fill-yellow-300">Bootcamp + Capstone</text>
            <text x="88" y="212" className="tier-text fill-yellow-600 dark:fill-yellow-400">Structured learning with a real shipped project</text>
            {/* Tier 5 */}
            <rect x="40" y="228" width="400" height="42" rx="6" className="fill-amber-50 dark:fill-amber-900/15 stroke-amber-300 dark:stroke-amber-700" strokeWidth="1.5" />
            <circle cx="66" cy="249" r="12" className="fill-amber-600 dark:fill-amber-500" />
            <text x="66" y="253" textAnchor="middle" className="tier-num">5</text>
            <text x="88" y="245" className="tier-label fill-amber-800 dark:fill-amber-300">Freelance / Contract Work</text>
            <text x="88" y="260" className="tier-text fill-amber-600 dark:fill-amber-400">Someone paid you real money to do the work</text>
            {/* Tier 6 */}
            <rect x="40" y="276" width="400" height="42" rx="6" className="fill-orange-50 dark:fill-orange-900/15 stroke-orange-300 dark:stroke-orange-700" strokeWidth="1.5" />
            <circle cx="66" cy="297" r="12" className="fill-orange-500 dark:fill-orange-500" />
            <text x="66" y="301" textAnchor="middle" className="tier-num">6</text>
            <text x="88" y="293" className="tier-label fill-orange-800 dark:fill-orange-300">Technical Writing / Talks</text>
            <text x="88" y="308" className="tier-text fill-orange-600 dark:fill-orange-400">Proves understanding, not just ability</text>
            {/* Tier 7 */}
            <rect x="40" y="324" width="400" height="42" rx="6" className="fill-zinc-50 dark:fill-zinc-800/50 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" />
            <circle cx="66" cy="345" r="12" className="fill-zinc-400 dark:fill-zinc-500" />
            <text x="66" y="349" textAnchor="middle" className="tier-num">7</text>
            <text x="88" y="341" className="tier-label fill-zinc-600 dark:fill-zinc-300">Hackathons / Competitions</text>
            <text x="88" y="356" className="tier-text fill-zinc-500 dark:fill-zinc-400">Time-limited, often unfinished, context-dependent</text>
          </svg>
        </div>

        <h2 className={h2}>1. A Live Deployed Project</h2>
        <p>This is the strongest signal you can send. A project that is live, working, and accessible through a URL tells a hiring manager everything they need to know in about 60 seconds. They click the link, use the thing, and form an opinion based on real output. No guessing. No trust required.</p>
        <p>Strong examples: a full-stack web app with authentication and a database, an API that other developers actually use, a data dashboard that pulls live data and updates on a schedule. Weak examples: a to-do app from a tutorial, a clone of a popular app with no original features, or anything that is just a README with screenshots but no working demo.</p>
        <p>The difference between strong and weak is originality and scope. A to-do app shows you can follow instructions. A custom app that solves a real problem shows you can think, design, and ship. For more on presenting projects the right way, check out our guide on <Link href="/code" className={link}>showing your code</Link>.</p>
        <p>Best for: software engineers, frontend developers, data engineers, and anyone whose work can be seen in a browser.</p>

        <h2 className={h2}>2. Open Source Contributions</h2>
        <p>Contributing to open source projects is proof that you can work with other developers on real codebases. It shows you can read someone else&apos;s code, follow contribution guidelines, write clean pull requests, and respond to code review. These are exactly the skills companies test for in interviews.</p>
        <p>A strong contribution is a merged PR on a well-known project that fixes a real bug or adds a real feature. A weak contribution is a typo fix in a README or an issue comment saying &quot;I&apos;d like to work on this.&quot;</p>
        <p>You do not need to contribute to React or Kubernetes. Smaller projects with active maintainers are often better because your PR is more likely to get reviewed and merged. Look for repos with &quot;good first issue&quot; labels. One meaningful merged PR on a project with 500 stars is better than 20 cosmetic fixes.</p>
        <p>Best for: backend engineers, systems programmers, and anyone targeting companies that value open source culture.</p>

        <h2 className={h2}>3. Industry Certifications</h2>
        <p>Certifications sit in an interesting spot. They are not as strong as deployed projects or open source work because they test knowledge, not applied skill. But they are standardized, verifiable, and widely recognized. A recruiter who sees &quot;AWS Solutions Architect, Associate&quot; knows exactly what that means.</p>
        <p>The strongest certifications are the ones that match real job requirements. AWS, Google Cloud Professional, and Azure certifications are valued for cloud roles. CompTIA Security+ is a baseline for security positions. The Certified Kubernetes Administrator (CKA) is respected in DevOps. Cisco&apos;s CCNA still matters for networking.</p>
        <p>Weak certifications are the ones from platforms nobody has heard of, or ones that only require watching videos with no real exam. If the cert does not have a proctored test or a hands-on component, it does not carry much weight.</p>
        <div className={callout}>
          <h3 className={h3}>What makes a cert strong</h3>
          <p>It comes from a recognized company (AWS, Google, Microsoft, CompTIA). It has a proctored exam that you can fail. And it maps directly to a job requirement listed in real postings. If a cert meets all three, it is worth getting.</p>
        </div>
        <p>Best for: cloud engineers, security analysts, network engineers, and anyone applying to companies with compliance requirements.</p>

        <h2 className={h2}>4. Bootcamp With a Capstone</h2>
        <p>A bootcamp completion alone is moderate proof. It says you spent 12 to 16 weeks learning a stack, but plenty of people complete bootcamps and still struggle in interviews. What makes a bootcamp meaningful is the capstone project.</p>
        <p>A good capstone is a real application that you built, deployed, and can demo. If your bootcamp ended with a group project and you can clearly describe what you personally built (not what the team built), that is solid. If you can point to the live app, even better.</p>
        <p>Be specific about what you learned. Instead of saying &quot;Completed General Assembly Software Engineering Immersive,&quot; try: &quot;Built a full-stack React/Node.js app with PostgreSQL that processes real-time transit data for 3 city bus routes. Deployed on AWS.&quot; The first version tells the recruiter you attended. The second tells them you can build things.</p>
        <p>Best for: career changers, junior developers, and anyone entering tech for the first time. Pairs well with <Link href="/degrees" className={link}>the case for why college degrees matter less in tech</Link>.</p>

        <h2 className={h2}>5. Freelance and Contract Work</h2>
        <p>Paid work is proof, period. If someone gave you money to do the job, that is a strong signal that you can do the job. Freelance and contract work counts even if the client was small or the project was short.</p>
        <p>The key is specificity. &quot;Freelance web developer&quot; on your resume means almost nothing. &quot;Built a custom Shopify theme and checkout flow for a DTC brand processing 2,000 orders per month&quot; means a lot. Name the technologies. Describe the scale. If the client will serve as a reference, mention that.</p>
        <p>Platforms like Upwork and Toptal give you a verifiable track record with reviews and completed project counts. These are not as prestigious as a full-time role at a known company, but they are real proof that clients trusted you with their money and their product.</p>
        <p>Best for: designers, frontend developers, mobile developers, and anyone building a portfolio through client work.</p>

        <h2 className={h2}>6. Technical Writing and Talks</h2>
        <p>Writing a technical blog post or giving a conference talk proves something deeper than skill. It proves understanding. You cannot clearly explain distributed systems or database indexing to other people unless you actually understand those topics yourself.</p>
        <p>Strong examples: a blog post walking through how you solved a real debugging problem, a conference talk on a specific technical decision your team made, or a tutorial that other developers have bookmarked and shared. Weak examples: a post that summarizes documentation without adding anything, or a talk that is just a product demo.</p>
        <p>The best technical writing is specific and experience-based. &quot;How I reduced our API response time from 800ms to 120ms&quot; is interesting. &quot;An Introduction to REST APIs&quot; is not. Recruiters and hiring managers share technical posts internally all the time. If your post shows up in a Slack channel before your resume does, that is a massive advantage.</p>
        <p>Best for: senior engineers, developer advocates, and anyone targeting roles where communication matters as much as code.</p>

        <h2 className={h2}>7. Hackathons and Competitions</h2>
        <p>Winning a hackathon or placing in a coding competition is real proof, but it is the weakest type on this list because it is time-limited and context-dependent. A hackathon project is built in 24 to 48 hours. It is usually rough, unfinished, and not maintained after the event. That is fine for the hackathon. It is less convincing as lasting proof of skill.</p>
        <p>What makes hackathon results strong is specificity and outcome. &quot;Won first place at HackMIT 2025 for building a real-time sign language translation tool using MediaPipe and React&quot; is meaningful. &quot;Participated in a hackathon&quot; is not.</p>
        <p>Coding competitions like LeetCode contests, Advent of Code leaderboards, or Kaggle competitions carry weight in specific contexts. Kaggle rankings matter for data science roles. LeetCode contest ratings can be relevant for companies that do heavy algorithm interviews. But for most roles, a deployed project (#1) is a better use of your time than competitive coding.</p>
        <p>Best for: students, early-career developers, and anyone applying to companies that run their own hackathons.</p>

        <h2 className={h2}>Putting All Your Proof Together</h2>
        <p>Having multiple types of proof is better than having just one. A deployed project plus a certification plus a couple of open source PRs tells a much stronger story than any single item alone. The challenge is presenting it in a way that is clean and easy to scan.</p>
        <p>This is where a web profile helps. On a page like CVin.Bio, you can lay out your projects with live links, list your certifications with verification URLs, and link to your GitHub contributions all in one place. Instead of stuffing everything onto a one-page resume, put the highlights on paper and link to the full picture.</p>
        <div className={callout}>
          <h3 className={h3}>The proof stack</h3>
          <p>The strongest candidates without degrees typically have at least three types of proof: a live project they can demo, a recognized certification, and one more thing (open source, freelance work, or a technical blog). Stack your proof and make it all clickable.</p>
        </div>
        <p>Avoid the trap of listing skills as plain text without evidence. Writing &quot;Python, AWS, Docker&quot; in a skills section tells the recruiter nothing about your ability. Linking to a project built with those tools tells them everything. We wrote about this pattern in our piece on <Link href="/skill-bars" className={link}>why generic skill bars hurt your resume</Link>.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/code" className={link}>How to show your code on your resume</Link></li>
          <li><Link href="/degrees" className={link}>Why college degrees matter less in tech</Link></li>
          <li><Link href="/skill-bars" className={link}>Why generic skill bars hurt your resume</Link></li>
        </ul>
      </div>
  );
}
