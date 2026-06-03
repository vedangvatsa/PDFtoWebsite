import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>The top two inches of your resume do most of the work. Recruiters scan from the top down, and the first thing they see determines whether they keep reading or move on. Studies on <Link href="/scan" className={link}>how recruiters actually read resumes</Link> confirm this. The initial glance is fast. You get about 6 seconds before they decide if you are worth a closer look.</p>
        <p>That means what you put at the very top is not a design choice. It is a strategic one. Here is what works best, ranked by how much it helps during that first scan.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 400 420" className="w-full h-auto" role="img" aria-label="Resume mockup highlighting the top 2 inches with labeled zones">
            <style>{`
              .mock-title { font: 700 16px system-ui; }
              .mock-label { font: 600 11px system-ui; }
              .mock-small { font: 400 10px system-ui; }
              .mock-badge { font: 600 9px system-ui; letter-spacing: 0.5px; }
              .mock-arrow { font: 500 10px system-ui; }
            `}</style>
            {/* Resume page */}
            <rect x="80" y="10" width="240" height="400" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" />
            {/* Top zone highlight */}
            <rect x="80" y="10" width="240" height="170" rx="4" className="fill-blue-50/80 dark:fill-blue-900/20" />
            <rect x="80" y="10" width="240" height="170" rx="4" className="fill-none stroke-blue-400 dark:stroke-blue-500" strokeWidth="1.5" strokeDasharray="4 3" />
            {/* Zone 1: Name */}
            <rect x="100" y="26" width="120" height="16" rx="3" className="fill-zinc-800 dark:fill-zinc-200" />
            <text x="340" y="38" className="mock-label fill-blue-600 dark:fill-blue-400">← Name</text>
            {/* Zone 2: Headline */}
            <rect x="100" y="50" width="180" height="10" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
            <text x="340" y="58" className="mock-label fill-blue-600 dark:fill-blue-400">← Headline</text>
            {/* Zone 3: URL */}
            <rect x="100" y="70" width="100" height="8" rx="2" className="fill-blue-300 dark:fill-blue-600" />
            <text x="340" y="78" className="mock-label fill-blue-600 dark:fill-blue-400">← URL</text>
            {/* Zone 4: Summary */}
            <rect x="100" y="92" width="200" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="100" y="106" width="190" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <text x="340" y="104" className="mock-label fill-blue-600 dark:fill-blue-400">← Summary</text>
            {/* Zone 5: Skills */}
            <rect x="100" y="128" width="50" height="18" rx="9" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="156" y="128" width="60" height="18" rx="9" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="222" y="128" width="45" height="18" rx="9" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="100" y="152" width="55" height="18" rx="9" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="161" y="152" width="48" height="18" rx="9" className="fill-zinc-200 dark:fill-zinc-700" />
            <text x="340" y="148" className="mock-label fill-blue-600 dark:fill-blue-400">← Skills</text>
            {/* Bracket and label */}
            <text x="40" y="100" textAnchor="middle" className="mock-badge fill-blue-500 dark:fill-blue-400" transform="rotate(-90 40 100)">TOP 2 INCHES</text>
            {/* Grayed out rest */}
            <rect x="100" y="194" width="150" height="10" rx="2" className="fill-zinc-200/60 dark:fill-zinc-700/40" />
            <rect x="100" y="212" width="200" height="8" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="226" width="190" height="8" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="240" width="180" height="8" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="254" width="200" height="8" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="278" width="140" height="10" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="296" width="200" height="8" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="310" width="190" height="8" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="324" width="170" height="8" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="348" width="130" height="10" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="366" width="200" height="8" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="380" width="180" height="8" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            {/* Annotation */}
            <text x="340" y="290" className="mock-small fill-zinc-400 dark:fill-zinc-500">Rest of resume</text>
            <text x="340" y="304" className="mock-small fill-zinc-400 dark:fill-zinc-500">(most recruiters</text>
            <text x="340" y="318" className="mock-small fill-zinc-400 dark:fill-zinc-500">never get here)</text>
          </svg>
        </div>

        <h2 className={h2}>1. Your Name and a Headline</h2>
        <p>Your name should be the largest text on the page. Not huge, but clearly the first thing the eye lands on. Right below it, add a one-line headline that tells the recruiter exactly who you are and what you do.</p>
        <p>A good headline looks like this: &quot;Senior Backend Engineer · Payments · Go/Rust.&quot; That is three pieces of info in under ten words: your level, your domain, and your tools. The recruiter now knows if you are in the right ballpark before reading a single bullet point.</p>
        <p>A bad headline is your job title alone: &quot;Software Engineer.&quot; That tells them nothing they could not guess from the fact that you sent a resume for an engineering role.</p>
        <div className={callout}>
          <h3 className={h3}>Headline formula</h3>
          <p><span className={bold}>[Seniority + Role] · [Domain/Industry] · [Top 2 Technologies]</span></p>
          <p>Examples: &quot;Staff Frontend Engineer · E-commerce · React/TypeScript&quot; or &quot;DevOps Lead · FinTech · AWS/Kubernetes&quot; or &quot;Data Engineer · ML Pipelines · Python/Spark.&quot;</p>
        </div>

        <h2 className={h2}>2. A URL to Your Full Profile</h2>
        <p>Put a link to your web profile right below your name and headline. A clean URL like <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">cvin.bio/yourname</code> works well. It is short, easy to remember, and gives the recruiter a way to see your full background in a properly formatted layout.</p>
        <p>This matters because your resume is a summary. It cannot hold everything. A profile link lets the recruiter dig deeper on their own terms. It also makes you easy to share. When the recruiter forwards you to the hiring manager, they paste the URL into Slack instead of attaching a file. You can read more about why this works in our guide on <Link href="/link" className={link}>putting a URL on your resume</Link>.</p>
        <p>Best for: anyone in tech. Recruiters expect to see a link to something, whether it is GitHub, a portfolio, or a profile page. Having nothing clickable at the top is a missed opportunity.</p>

        <h2 className={h2}>3. A Two-Sentence Value Summary</h2>
        <p>Not an objective statement. Not a paragraph. Two sentences that tell the recruiter what you bring and why it matters. Think of it as your answer to &quot;why should we talk to this person?&quot;</p>
        <p>Good example: &quot;Backend engineer with 7 years building payment systems that handle $2B+ in annual transactions. Led the team that cut checkout latency by 40% at a Series C fintech.&quot;</p>
        <p>Bad example: &quot;Passionate software engineer seeking a challenging role where I can grow my skills and contribute to an exciting team.&quot; That second one is an <Link href="/objective" className={link}>objective statement</Link>, and it tells the recruiter nothing useful. It is about what you want, not what you offer.</p>

        <h2 className={h2}>4. Your Strongest Skills</h2>
        <p>List four or five of your strongest technical skills right after your summary. Not fifteen. Not twenty. Just the ones that are most relevant to the kinds of roles you are applying for.</p>
        <p>This works because it gives the recruiter a quick filter. They scan your skills, see &quot;Go, PostgreSQL, gRPC, AWS, Terraform&quot; and immediately know if your stack matches their team. If you list too many, you dilute the signal. The recruiter does not know if &quot;Docker&quot; means you ran it once in a tutorial or you manage 200 containers in production.</p>
        <p>Pick the skills you could talk about for 30 minutes in an interview. Leave everything else for the experience section where you can show how you used it.</p>

        <h2 className={h2}>What NOT to Put at the Top</h2>
        <p>Some things waste your most valuable real estate. Here is what to remove or move further down.</p>
        <p><span className={bold}>Objective statements.</span> &quot;Seeking a role where I can grow&quot; does not help the recruiter decide if you are qualified. Replace it with a value summary that describes what you bring.</p>
        <p><span className={bold}>Your full home address.</span> City and country are enough if the role is location-sensitive. Nobody needs your street name and zip code at the top of your resume. It is a privacy risk and a waste of space.</p>
        <p><span className={bold}>A photo.</span> In many countries, including the US, adding a photo can trigger bias concerns. Even where photos are common, they eat up space at the top that your headline and summary need more.</p>
        <p><span className={bold}>Date of birth.</span> Irrelevant to your qualifications and creates age bias risk. Leave it off entirely.</p>
        <div className={callout}>
          <h3 className={h3}>The test</h3>
          <p>Cover everything below the top two inches of your resume. Can a recruiter tell from just that visible area what you do, what level you are at, and what makes you worth calling? If not, rearrange until they can.</p>
        </div>

        <h2 className={h2}>How Recruiters Actually Read</h2>
        <p>Eye-tracking studies show that recruiters follow a rough F-pattern. They read the top line fully, scan down the left side, and occasionally dart right when something catches their attention. This means the left side of your top section gets the most eyeball time.</p>
        <p>Put your name and headline flush left. Put your URL directly below. Put your summary next. By the time the recruiter has finished their F-pattern scan of your top section, they should know your level, your specialty, your top skills, and where to learn more. That is enough for them to decide you are worth a real read.</p>
        <p>If your top section is cluttered with a mailing address, a photo, and an objective about what you hope to learn, the recruiter finishes their F-scan without learning anything useful. You just lost your window.</p>

        <h2 className={h2}>Putting It Together</h2>
        <p>Here is what the top of your resume should look like, in order:</p>
        <ol className={ol}>
          <li><span className={bold}>Your name</span> in the largest font on the page</li>
          <li><span className={bold}>A one-line headline</span> with your role, domain, and top tools</li>
          <li><span className={bold}>Your profile URL</span> and email on the same line</li>
          <li><span className={bold}>A two-sentence value summary</span> describing what you bring</li>
          <li><span className={bold}>Four or five top skills</span> listed as simple text</li>
        </ol>
        <p>That is it. Everything else goes below. Your experience, education, projects, and certifications all get their own sections further down. But the top is reserved for the information that <Link href="/inbox" className={link}>makes you stand out</Link> in the first 6 seconds.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/scan" className={link}>How recruiters really read your resume</Link></li>
          <li><Link href="/objective" className={link}>Why objective statements are dead</Link></li>
          <li><Link href="/link" className={link}>Why a URL is the best thing on your resume</Link></li>
        </ul>
      </div>
  );
}
