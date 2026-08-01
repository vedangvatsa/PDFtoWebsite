import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        An engineering manager has thirty minutes between meetings. She opens your application. Bullet one says &quot;Proficient in React, Node, and PostgreSQL.&quot; Bullet two says &quot;Built scalable web applications.&quot; She has read that exact pair on eighty profiles this month. She closes yours and opens the next candidate, who linked a live URL. The app loads. She clicks around for ninety seconds and forwards the profile to her team.
      </p>
      <p>
        Text claims are free. Anyone can type React on a profile after a tutorial. Recruiters assume exaggeration until you attach proof. Showing beats telling every time.
      </p>

      <h2 className={h2}>The trust hierarchy</h2>
      <p>
        Ranked from weakest to strongest signal:
      </p>
      <ol className={ol}>
        <li><span className={bold}>Listed skill</span> with no evidence.</li>
        <li><span className={bold}>Course certificate</span> with verification link.</li>
        <li><span className={bold}>GitHub repository</span> with readable code and README.</li>
        <li><span className={bold}>Merged open source PR</span> to a known project.</li>
        <li><span className={bold}>Live deployed URL</span> anyone can use right now.</li>
      </ol>
      <p>
        Climb the ladder. A junior candidate with one live app and clean README often beats a senior candidate with twelve bullets and zero links.
      </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 680 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="60" y1="230" x2="620" y2="230" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <rect x="80" y="170" width="150" height="60" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="155" y="205" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Listed Skill</text>
          <rect x="110" y="148" width="90" height="18" rx="4" className="fill-zinc-200 dark:fill-zinc-700" />
          <text x="155" y="161" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Low trust</text>
          <rect x="265" y="120" width="150" height="110" rx="6" className="fill-sky-50 dark:fill-sky-900/20 stroke-sky-300 dark:stroke-sky-700" strokeWidth="1" />
          <text x="340" y="175" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">GitHub Repo</text>
          <rect x="290" y="98" width="100" height="18" rx="4" className="fill-sky-100 dark:fill-sky-900/30" />
          <text x="340" y="111" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-sky-600 dark:fill-sky-400">Medium trust</text>
          <rect x="450" y="60" width="150" height="170" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
          <text x="525" y="130" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Live Deployed URL</text>
          <rect x="480" y="38" width="90" height="18" rx="4" className="fill-emerald-100 dark:fill-emerald-900/30" />
          <text x="525" y="51" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">High trust</text>
          <line x1="230" y1="200" x2="265" y2="175" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" strokeDasharray="4 3" />
          <line x1="415" y1="175" x2="450" y2="145" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" strokeDasharray="4 3" />
        </svg>
      </div>

      <h2 className={h2}>The live URL mandate</h2>
      <p>
        Include a hyperlink to a working application you built. Screenshots are weak. Zip files imply you never deployed. When a manager clicks, loads your UI, and tries to break a form, she respects your operational competence in under two minutes.
      </p>
      <p>
        Deployment proves you survived the hardest phase many juniors skip: production config, env vars, database hosting, SSL, error monitoring. Tutorial completers stop at localhost. Finishers ship URLs.
      </p>
      <p>
        Minimum bar for a portfolio project link:
      </p>
      <ul className={ul}>
        <li>Loads in under three seconds on mobile.</li>
        <li>HTTPS, no browser security warnings.</li>
        <li>README explains problem, stack, and how to run locally.</li>
        <li>No expired domain or &quot;This site can&apos;t be reached.&quot;</li>
      </ul>
      <p>
        A dead link is worse than no link. It signals neglect.
      </p>

      <div className={callout}>
        <h3 className={h3}>Clean up the source repository</h3>
        <p>
          Pin your three best repos on GitHub. Root README must explain architecture, database choice, and trade-offs in plain English. Managers read docs before code. Messy repos with no README get closed in ten seconds.
        </p>
      </div>

      <h2 className={h2}>How to write project bullets</h2>
      <p>
        Each project entry needs four parts: name, link, one-line problem, one-line outcome with metric.
      </p>
      <p>
        Example: &quot;InvoiceFlow (invoiceflow.app). Small businesses emailed PDF invoices manually. Built React + Supabase app; 120 weekly active users after launch on Product Hunt.&quot;
      </p>
      <p>
        Put the URL inline or as a labeled link. Do not bury it in a generic &quot;Portfolio&quot; footer. Recruiters will not hunt.
      </p>
      <p>
        For work under NDA, describe by industry and scale: &quot;Internal ops dashboard for 200-seat logistics company; reduced manual data entry from 4 hours to 20 minutes daily.&quot; No client name required. Outcome still counts.
      </p>

      <h2 className={h2}>GitHub hygiene</h2>
      <ul className={ul}>
        <li>Green contribution graph helps but is not required; quality beats quantity.</li>
        <li>Remove fork spam and empty init repos from pinned list.</li>
        <li>Consistent commit messages on flagship project (not &quot;fix&quot; x50 only).</li>
        <li>License file if you want reuse signals.</li>
        <li>No secrets in history (run a scan before you link).</li>
      </ul>
      <p>
        Read <Link href="/open-source" className={link}>how to present open source contributions</Link> for PR-specific advice.
      </p>

      <h2 className={h2}>Public collaboration artifacts</h2>
      <p>
        Merged PRs to known libraries carry weight. A link to your merged auth fix in a popular npm package beats ten tutorial repos. Code review by senior engineers at established companies is third-party validation you cannot fake.
      </p>
      <p>
        Stack Overflow answers, technical blog posts, and conference talks rank below live code but above bare skills lists. Link them in a Projects or Writing section if they are strong.
      </p>

      <h2 className={h2}>Where projects live on your profile</h2>
      <p>
        Career changers and bootcamp grads: projects section at top, above education. Mid-career with strong job history: two featured projects under summary or after most recent role. Every candidate: at least one project bullet inside relevant job entry if the work was employer-sponsored and linkable.
      </p>
      <p>
        A <Link href="/pdf-to-website" className={link}>CV website</Link> renders project links as tappable buttons on mobile. PDF links work but feel clunkier on phone review.
      </p>

      <h2 className={h2}>Projects that hurt you</h2>
      <ul className={ul}>
        <li>Tutorial clones with zero customization (todo app #4,792).</li>
        <li>Broken deploy links on every pinned repo.</li>
        <li>Massive monorepos with no README and no entry point.</li>
        <li>Projects using stacks unrelated to the role you want.</li>
        <li>Claiming team size you did not have (&quot;we built&quot; when it was solo).</li>
      </ul>
      <p>
        See <Link href="/projects" className={link}>best personal projects for a software CV</Link> for what to build instead.
      </p>

      <h2 className={h2}>Worked scenario</h2>
      <p>
        Two backend candidates apply for the same role. Both list Python and FastAPI. Candidate A has bullets only. Candidate B links a repo with FastAPI service, Docker compose, and a Render deploy URL. Manager clones repo, runs docker compose up, hits /health endpoint. Candidate B gets the phone screen. Same stated skills. Different proof.
      </p>

      <h2 className={h2}>Checklist</h2>
      <ol className={ol}>
        <li>At least one live URL that loads on mobile.</li>
        <li>README on every pinned GitHub repo.</li>
        <li>Project bullets include problem, stack, metric, link.</li>
        <li>Remove dead links and empty repos.</li>
        <li>Pin best three repos; hide the rest.</li>
        <li>Match project stack to target role.</li>
        <li>Put links where <Link href="/scan" className={link}>recruiters scan first</Link>: top third of profile.</li>
      </ol>

      <h2 className={h2}>Case study format for senior roles</h2>
      <p>
        Senior candidates can add a short case study section: Problem, Approach, Result, Link. Four lines per project. Keeps scan-friendly structure while giving depth for hiring managers who read longer.
      </p>
      <p>
        Example: &quot;Checkout abandonment (Problem). Rebuilt cart state in Redis with optimistic UI (Approach). Cart completion up 14% in A/B test (Result). github.com/you/cart-refactor (Link).&quot; That block proves product sense, stack, metric, and verifiable code in one glance.
      </p>

      <h2 className={h2}>Student and bootcamp portfolios</h2>
      <p>
        If you have three tutorial clones and one original project, lead with the original. Move clones to a collapsed GitHub folder or omit them from the resume entirely. One strong deployed app with 50 real users beats five identical todo apps. Quality of proof beats quantity of repos.
      </p>
      <p>
        Capstone projects from bootcamps count if you extended them after graduation. &quot;Bootcamp capstone plus six months of production hardening&quot; is a legitimate story. Link the current deployed version, not the week-eight snapshot.
      </p>

      <h2 className={h2}>Demo videos when deploy is hard</h2>
      <p>
        Mobile apps, hardware projects, and enterprise-only tools sometimes cannot be publicly deployed. A ninety-second Loom walkthrough linked from your resume is weaker than a live URL but stronger than nothing. Show the UI, show the test passing, show the README. Label it clearly: &quot;Demo video (NDA, no public deploy).&quot;
      </p>
      <p>
        Do not substitute slides for demos. Slides prove presentation skills, not shipping skills. Recruiters hiring engineers want to see running software or running tests.
      </p>

      <h2 className={h2}>Maintaining projects over time</h2>
      <p>
        A project link that 404s in six months is negative signal. Pin projects you will maintain for at least the duration of your job search. Remove links to expired domains. Set a monthly calendar check on your top three URLs. Uptime of your portfolio is part of your professional brand.
      </p>

      <h2 className={h2}>Employer-sponsored work you cannot link</h2>
      <p>
        Most engineers spend years shipping code they cannot show publicly. Describe outcomes without repo links. &quot;Built fraud detection pipeline processing 2M events/day; reduced false positives 18%.&quot; Offer to walk through architecture on a whiteboard in interview. Bring a sanitized diagram if NDAs allow. Proof in interview compensates for missing public repos when the bullet is specific enough to invite deep questions.
      </p>
      <p>
        Some employers allow a private demo during onsite. Ask your recruiter if showing redacted internal tools is permitted. Many say yes when the candidate asks professionally.
      </p>

      <h2 className={h2}>Architecture diagrams in README</h2>
      <p>
        One simple diagram in your README beats three pages of prose. Box for client, box for API, box for database, arrows labeled with protocol names. Managers skim the diagram in ten seconds and decide whether to read code. Students and career changers especially benefit because the diagram proves you think in systems beyond copy-paste tutorials.
      </p>

      <h2 className={h2}>Merged issues and small OSS wins</h2>
      <p>
        You do not need a flagship open source project. A merged bug fix in a library your target team uses is enough proof for a phone screen. Link the PR directly on your resume: &quot;Fixed race condition in popular Redis client (PR #1842, merged).&quot; The hiring manager sees your GitHub handle, reads the diff, and knows you can read unfamiliar code and pass review.
      </p>
      <p>
        Issue triage counts too if you have no merge yet. &quot;Reproduced memory leak in Next.js image loader; filed minimal repro adopted by maintainers&quot; shows debugging skill. Attach the issue URL. Public thread is third-party validation cheaper than any certificate.
      </p>

      <h2 className={h2}>Architecture writeups when repos stay private</h2>
      <p>
        When code cannot ship publicly, ship a diagram and a narrative. One page: system boxes, data flow arrows, one paragraph on the tradeoff you chose. Host it on your CV website as a case study. Interviewers whiteboard from your writeup instead of guessing from a black-box employer name.
      </p>
      <p>
        Example structure: &quot;Payments retry service (private). Problem: duplicate charges on network blips. Approach: idempotent keys in Postgres plus SQS dead-letter queue. Result: charge disputes down 22%.&quot; No repo link required. Specific enough to invite deep questions you can answer.
      </p>

      <h2 className={h2}>Related reading</h2>
      <ul className={ul}>
        <li><Link href="/projects" className={link}>Best personal projects for a software CV</Link></li>
        <li><Link href="/open-source" className={link}>Open source contributions on your CV</Link></li>
        <li><Link href="/skills" className={link}>Ways to prove skills without a degree</Link></li>
        <li><Link href="/degrees" className={link}>Do you need a degree for a tech job?</Link></li>
      </ul>
    </div>
  );
}
