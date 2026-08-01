import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        A recruiter opens your profile at 4:47 PM. She has eleven tabs open and a calendar reminder in four minutes. Her eyes hit the skills section: Kubernetes, GraphQL, Terraform, Rust, blockchain, machine learning, prompt engineering. Forty terms in a gray box. She scrolls your work history. Kubernetes appears zero times. GraphQL appears zero times. She closes the tab.
      </p>
      <p>
        That is skill stuffing. Candidates dump trending acronyms into a footer block to pass keyword filters. It worked on primitive ATS tools ten years ago. Today it fails twice: automated parsers flag disconnected keywords, and humans spot the pattern in seconds.
      </p>
      <p>
        Modern screening relies on semantic matching and quick human audit. If you claim Docker expertise, we search your bullet points for Docker used in context. No context means no trust.
      </p>

      <h2 className={h2}>The rule of technical evidence</h2>
      <p>
        If you list Kubernetes, a technical recruiter will Ctrl+F your experience section for that word. We want to see how you used it on a real system. If a skill appears in a giant skills block but never in a project description, we assume you watched a weekend tutorial.
      </p>
      <p>
        Hiring managers buy operational experience, not vocabulary. Every tool must connect to a verifiable outcome. Otherwise it is noise.
      </p>
      <p>
        Strong pattern: skill in bullets, skill in skills list, same spelling both places.
      </p>
      <p>
        Weak pattern: 30 skills listed, 8 mentioned in work history, 22 orphaned.
      </p>

      <div className={callout}>
        <h3 className={h3}>Contextual tool anchoring</h3>
        <p>
          Do list cloud storage under skills if you use it. Better: write in work history that you migrated a monolithic service to AWS Lambda and cut weekly hosting costs by 48%. The skill and the proof live in the same sentence. That is what passes both bots and humans.
        </p>
      </div>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 660 320" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="40" y="28" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Skill</text>
          <text x="300" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">In Skills Block</text>
          <text x="500" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Used in Work History</text>
          <line x1="20" y1="40" x2="640" y2="40" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
          <text x="40" y="68" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">React</text>
          <text x="300" y="67" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>
          <text x="500" y="67" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>
          <text x="40" y="105" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Python</text>
          <text x="300" y="104" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>
          <text x="500" y="104" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>
          <text x="40" y="142" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Kubernetes</text>
          <text x="300" y="141" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>
          <text x="500" y="141" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-400">✗</text>
          <text x="40" y="179" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">GraphQL</text>
          <text x="300" y="178" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>
          <text x="500" y="178" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-400">✗</text>
          <text x="330" y="305" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
            Skills listed but never referenced in work history look like keyword stuffing.
          </text>
        </svg>
      </div>

      <h2 className={h2}>How recruiters audit skills in 60 seconds</h2>
      <p>
        Here is the internal checklist many of us run, consciously or not:
      </p>
      <ol className={ol}>
        <li>Read the job post top five requirements.</li>
        <li>Scan skills block for overlap.</li>
        <li>Search work history for each claimed skill.</li>
        <li>Flag orphans (listed but never used in context).</li>
        <li>Check dates: Rust in 2024 but no Rust bullets since 2019?</li>
        <li>Glance at GitHub or live links if provided.</li>
      </ol>
      <p>
        Three or more orphans and we downgrade the whole profile. One orphan might be a recent course. Ten orphans is a pattern of dishonesty.
      </p>

      <h2 className={h2}>What fake skills look like</h2>
      <ul className={ul}>
        <li>Skills block longer than your entire experience section.</li>
        <li>Every trending buzzword from the job description copied verbatim.</li>
        <li>Senior titles with junior depth (Staff Engineer, two years total experience).</li>
        <li>White font keywords hidden in PDF footers (yes, we still find these).</li>
        <li>Identical skills list across unrelated role applications with no tailoring.</li>
        <li>Tools listed that did not exist during your claimed employment dates.</li>
      </ul>
      <p>
        AI screeners now detect semantic gaps too. A block that says &quot;led Kubernetes migration&quot; with no surrounding infrastructure vocabulary scores lower than a single honest bullet about Docker Compose on a side project.
      </p>

      <h2 className={h2}>How to list skills honestly</h2>
      <p>
        Split skills into tiers if it helps clarity:
      </p>
      <ul className={ul}>
        <li><span className={bold}>Production:</span> used in paid work, can whiteboard architecture.</li>
        <li><span className={bold}>Familiar:</span> shipped a side project or completed a cert.</li>
        <li><span className={bold}>Learning:</span> omit from applications unless the role explicitly welcomes juniors.</li>
      </ul>
      <p>
        Better yet: delete the skills block entirely and weave tools into bullets only. Many strong profiles have no separate skills section. Every technology appears next to an outcome. That format survives <Link href="/bots" className={link}>AI resume screening</Link> and human review.
      </p>

      <h2 className={h2}>Worked example: before and after</h2>
      <p>
        Before: Skills list includes Redis, Kafka, Elasticsearch, GraphQL, gRPC. Work history mentions only PostgreSQL and REST APIs. Recruiter assumes stuffing.
      </p>
      <p>
        After: Skills list trimmed to PostgreSQL, Redis, React, TypeScript, AWS. Bullets include: &quot;Added Redis cache layer; cut p95 API latency from 800ms to 120ms.&quot; &quot;Built React dashboard consumed by 12 internal ops users daily.&quot; Fewer words. More proof.
      </p>

      <div className={callout}>
        <h3 className={h3}>The ten-minute interview test</h3>
        <p>
          For every skill you list, ask: could I talk about this for ten minutes under pressure, with follow-up questions? If no, remove it before you apply. Interviewers drill into listed skills. A long list of fakes sets up a fatal technical screen.
        </p>
      </div>

      <h2 className={h2}>Aggressive self-pruning</h2>
      <p>
        Delete tools you touched once five years ago. Delete languages you studied in college but never used professionally. Delete &quot;familiar with&quot; entries that exist only to pad the block.
      </p>
      <p>
        A short list of real mastery beats a long list of dangerous claims. Priority order: depth on five tools relevant to the target role, not breadth across twenty.
      </p>
      <p>
        Tailor per application. Applying to a Go backend role? Lead with Go, Postgres, gRPC in bullets. Drop the unrelated frontend framework from the skills block for that submission. Same core profile, different emphasis. See <Link href="/scan" className={link}>how recruiters read resumes in 30 seconds</Link> for where those keywords must appear.
      </p>

      <h2 className={h2}>Links beat adjectives</h2>
      <p>
        The fastest way to prove a skill: link to code or a live app. &quot;React&quot; in a skills block is a claim. A deployed URL with a working UI is evidence. Read <Link href="/code" className={link}>how to show projects on your resume</Link> for the trust hierarchy from listed skill to live deployment.
      </p>

      <h2 className={h2}>Checklist</h2>
      <ol className={ol}>
        <li>Run Ctrl+F: every listed skill should appear in at least one bullet.</li>
        <li>Remove orphans and outdated tools.</li>
        <li>Anchor each kept skill to a metric or outcome in work history.</li>
        <li>Delete hidden keyword tricks from PDF footers.</li>
        <li>Add GitHub or live links for your top three claims.</li>
        <li>Tailor skills emphasis to each job post.</li>
        <li>Pass the ten-minute interview test for every remaining item.</li>
      </ol>

      <h2 className={h2}>Red flags in technical interviews</h2>
      <p>
        Skill stuffing on a resume sets up a painful interview. The interviewer picks the most exotic tool on your list and asks for architecture details. If you listed Terraform but only ran apply on someone else&apos;s modules, the next twenty minutes hurt. Your resume should predict the interview. List only what you want to be grilled on.
      </p>
      <p>
        Conversely, underselling real skills also costs offers. If you led a Kafka migration and buried Kafka under &quot;messaging systems,&quot; the interviewer might never ask and you lose a chance to differentiate. Name the tool explicitly in a bullet where you used it. Precision builds trust. Vague aggregation hides real wins.
      </p>

      <h2 className={h2}>Recovering from a stuffed profile</h2>
      <p>
        Audit your current resume tonight. Export a list of every skill in your skills block. Search each one in your experience section. Delete orphans. For each remaining skill, add or rewrite one bullet that names the tool and an outcome. Re-export your PDF and update your CV website the same night. One focused hour fixes most trust problems.
      </p>

      <h2 className={h2}>Skills block vs inline only</h2>
      <p>
        Some strong candidates delete the skills section entirely. Every technology appears in context inside bullets. That format forces proof by design and survives both human scan and semantic ATS. If you keep a skills block, treat it as an index of what appears above, not a wish list of what you want to learn next quarter.
      </p>
      <p>
        Group skills by category if length is needed: Languages, Infrastructure, Data. Keep each category under eight items. Long ungrouped lists look like stuffing even when every item is honest. Presentation signals judgment.
      </p>

      <h2 className={h2}>Reference checks and skill claims</h2>
      <p>
        Reference calls sometimes verify specific claims. If your resume says you led a Kubernetes migration, your former manager may be asked about it. Align with your references before you apply. Send them the tailored resume version so they hear the same story recruiters read. Misalignment between your bullets and a reference answer kills offers late in the process.
      </p>

      <h2 className={h2}>Trend chasing on resumes</h2>
      <p>
        Every year brings a new buzzword stack. Listing every trend from the last Hacker News front page dates your resume to this month and looks desperate. Pick tools you actually used in the last two years. If you are learning something new, build with it first, then add it after one shipped project. Recruiters in 2026 have seen a thousand resumes that list AI, blockchain, and Web3 in the same skills footer.
      </p>
      <p>
        Depth on PostgreSQL and Redis beats shallow mentions of twelve databases. Hiring managers hire for problems solved, not for encyclopedic vocabulary.
      </p>

      <h2 className={h2}>Junior vs senior skill lists</h2>
      <p>
        Juniors may list fewer skills with honest depth. Seniors listing forty skills look like they have not specialized. A principal engineer resume with eight well-anchored technologies beats twenty with twelve orphans. Level-appropriate restraint signals maturity.
      </p>

      <h2 className={h2}>Certifications next to work proof</h2>
      <p>
        A cloud certificate without a matching bullet looks like exam prep, not production experience. Pair each cert with one sentence of real usage. &quot;AWS Solutions Architect (2024); designed VPC peering for multi-account billing isolation.&quot; The cert opens the door. The bullet keeps you in the room when the interviewer asks follow-up questions.
      </p>

      <h2 className={h2}>Related reading</h2>
      <ul className={ul}>
        <li><Link href="/bots" className={link}>How to beat AI resume screening</Link></li>
        <li><Link href="/screening" className={link}>Ways to get past AI resume screening</Link></li>
        <li><Link href="/code" className={link}>How to show projects on your resume</Link></li>
        <li><Link href="/skills" className={link}>Ways to prove skills without a degree</Link></li>
      </ul>
    </div>
  );
}
