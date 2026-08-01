import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        Career advice tells you to attach dollar signs to everything. &quot;Generated $2.3M in revenue.&quot; Great if you work in sales or growth and have dashboard access. Most engineers build internal tools, fix queries, and ship features without ever seeing the P&amp;L line their work affected.
      </p>
      <p>
        That gap pushes talented people to list programming languages instead of outcomes. Languages are easy to copy from job posts. Outcomes require thought. Here is how to quantify impact when nobody hands you a revenue number.
      </p>

      <h2 className={h2}>Focus on relative physics</h2>
      <p>
        Measure speed, volume, reliability, and efficiency. A hiring manager does not need a dollar sign to know that cutting API latency from 2 seconds to 200 milliseconds matters.
      </p>
      <ul className={ul}>
        <li>Latency: p50, p95, p99 before and after.</li>
        <li>Throughput: requests per second, jobs per hour, rows processed.</li>
        <li>Scale: users served, transactions handled, data volume.</li>
        <li>Reliability: uptime, error rate, incident count.</li>
        <li>Time: deploy frequency, build time, onboarding ramp.</li>
      </ul>
      <p>
        These are the variables engineers actually control. They translate directly to business value even when you cannot quote revenue.
      </p>

      <div className={callout}>
        <h3 className={h3}>The percentage multiplier</h3>
        <p>
          When raw numbers are confidential, use percent change. &quot;Reduced database query time by 60%.&quot; &quot;Cut CI pipeline duration by 40%.&quot; Recruiters infer cost and velocity gains without you leaking financials.
        </p>
      </div>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 680 290" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="150" y="24" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">VAGUE CLAIM</text>
          <text x="530" y="24" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">WITH METRICS</text>
          <rect x="16" y="42" width="268" height="64" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
          <text x="32" y="78" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">&quot;Improved onboarding process&quot;</text>
          <rect x="396" y="42" width="268" height="64" rx="6" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1" />
          <text x="412" y="78" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">&quot;Cut new hire ramp-up from 3 weeks to 5 days&quot;</text>
          <rect x="16" y="122" width="268" height="64" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
          <text x="32" y="158" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">&quot;Helped reduce bugs&quot;</text>
          <rect x="396" y="122" width="268" height="64" rx="6" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1" />
          <text x="412" y="158" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">&quot;Lowered P1 incidents from 12/month to 2/month&quot;</text>
          <rect x="16" y="202" width="268" height="64" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
          <text x="32" y="238" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">&quot;Managed a team&quot;</text>
          <rect x="396" y="202" width="268" height="64" rx="6" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1" />
          <text x="412" y="238" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">&quot;Led 4 engineers shipping 3 features per sprint&quot;</text>
        </svg>
      </div>

      <h2 className={h2}>Metric types by engineering domain</h2>

      <h3 className={h3}>Backend and infrastructure</h3>
      <p>
        Request latency, error rates, cache hit ratio, deploy frequency, mean time to recovery, infrastructure cost per request (if you have it), database connection pool utilization, queue depth reduction.
      </p>
      <p>
        Example bullet: &quot;Refactored checkout API; p95 latency 1.8s to 220ms; error rate 0.4% to 0.05%.&quot;
      </p>

      <h3 className={h3}>Frontend and product</h3>
      <p>
        Page load time, Core Web Vitals, conversion step completion, bounce rate on key flows, accessibility audit scores, bundle size reduction.
      </p>
      <p>
        Example: &quot;Lazy-loaded dashboard charts; LCP improved from 4.2s to 1.9s on 3G.&quot;
      </p>

      <h3 className={h3}>Data and ML</h3>
      <p>
        Model accuracy, precision/recall, pipeline runtime, data freshness SLA, rows processed per hour, false positive rate reduction.
      </p>
      <p>
        Example: &quot;Retrained fraud model; false positives down 22% at same recall threshold.&quot;
      </p>

      <h3 className={h3}>Platform and developer experience</h3>
      <p>
        Build time, test flake rate, time to first PR for new hires, number of teams on shared tooling, internal NPS if you surveyed.
      </p>
      <p>
        Example: &quot;Built shared CI template; median pipeline time dropped 35% across 8 repos.&quot;
      </p>

      <h2 className={h2}>The internal user metric</h2>
      <p>
        Internal tools save paid hours. You do not need salary data to prove worth. State adoption: &quot;Deployment CLI used daily by 40 engineers.&quot; &quot;Admin panel replaced 6-hour weekly manual CSV workflow for ops team of 5.&quot;
      </p>
      <p>
        Multiply users by time saved if you can estimate safely. &quot;Saved ~10 engineer-hours per week across platform team.&quot; Round honestly. Wild guesses hurt you in interview.
      </p>

      <h2 className={h2}>How to find metrics you do not have yet</h2>
      <ol className={ol}>
        <li>Check monitoring dashboards: Datadog, Grafana, CloudWatch, Sentry.</li>
        <li>Ask your manager: &quot;Do we have before/after for the migration I led?&quot;</li>
        <li>Pull git stats for deploy frequency or PR cycle time (use carefully, not as vanity).</li>
        <li>Run Lighthouse or WebPageTest on frontend changes you shipped.</li>
        <li>Estimate from ticket counts: incidents closed, bugs filed vs resolved.</li>
      </ol>
      <p>
        Document metrics when you ship, not six months later when you update your resume. Keep a private brag doc with numbers as projects close.
      </p>

      <h2 className={h2}>Overcoming NDAs and secrecy</h2>
      <p>
        Defense, finance, and health companies restrict names and figures. You can still write scale without identifiers:
      </p>
      <ul className={ul}>
        <li>&quot;Zero-downtime migration across 12 production regions.&quot;</li>
        <li>&quot;Payment system processing 50K transactions daily.&quot;</li>
        <li>&quot;Maintained 99.95% uptime over 18 months on classified network.&quot;</li>
      </ul>
      <p>
        Replace client names with industry and size: &quot;Fortune 500 retailer,&quot; &quot;Series C healthtech.&quot; Outcomes stay concrete. Names stay private.
      </p>

      <h2 className={h2}>When metrics backfire</h2>
      <ul className={ul}>
        <li>Obviously fabricated round numbers on every bullet.</li>
        <li>Metrics with no context (&quot;improved performance 500%&quot;).</li>
        <li>Claiming revenue you never had access to.</li>
        <li>Team metrics you cannot explain in interview.</li>
        <li>Vanity metrics (lines of code, GitHub stars bought or irrelevant).</li>
      </ul>
      <p>
        One honest metric beats five invented ones. Interviewers ask how you measured. Be ready.
      </p>

      <h2 className={h2}>Pair metrics with front-loaded bullets</h2>
      <p>
        Put the number early so scanners see it. Weak: &quot;Worked on performance improvements that eventually reduced latency.&quot; Strong: &quot;Cut p95 API latency 82% (1.8s to 320ms) via query indexing and Redis cache.&quot; See <Link href="/scan" className={link}>how recruiters scan resumes</Link> for placement rules.
      </p>

      <h2 className={h2}>Technical debt as impact</h2>
      <p>
        Refactors count when you measure downstream effect. &quot;Split monolith into 4 services; deploy frequency went from monthly to daily.&quot; &quot;Removed 40K lines of dead code; build time 18 min to 9 min.&quot; Debt work is underrated on resumes. Frame it as speed and risk reduction.
      </p>

      <h2 className={h2}>Worked scenario</h2>
      <p>
        Internal tools engineer, no revenue visibility. Before: &quot;Built tools for the data team.&quot; After: &quot;Built self-serve report builder; replaced 12 hours/week of analyst SQL requests; adopted by 25 users across finance and ops.&quot; Same job. Second bullet tells a hiring manager exactly what changed.
      </p>

      <h2 className={h2}>Checklist</h2>
      <ol className={ol}>
        <li>Every major bullet has at least one number or percent.</li>
        <li>Prefer before/after pairs over single isolated figures.</li>
        <li>Use domain-appropriate metrics (latency, uptime, users, time).</li>
        <li>Start bullets with the metric or tool, not &quot;Responsible for.&quot;</li>
        <li>Keep a brag doc with source links to dashboards or tickets.</li>
        <li>Respect NDAs; use scale and industry instead of client names.</li>
        <li>Prepare interview explanation for how each metric was measured.</li>
      </ol>

      <h2 className={h2}>Estimating when exact data is gone</h2>
      <p>
        You left a job three years ago and no longer have dashboard access. Reconstruct from memory with conservative rounding. &quot;Reduced build time by roughly 35% (about 20 minutes to 13 minutes)&quot; is honest. &quot;Improved build time 347%&quot; sounds invented. If you truly cannot remember, describe scale without a percent: &quot;Owned CI pipeline for team of 12; daily deploys vs weekly before migration.&quot;
      </p>

      <h2 className={h2}>Combining people and system metrics</h2>
      <p>
        Strong bullets blend both: &quot;Led refactor of billing service; cut on-call pages 60% and freed 2 engineers from firefighting to feature work.&quot; The first number proves technical impact. The second proves organizational impact. Hiring managers at senior levels look for both.
      </p>

      <h2 className={h2}>Impact in summaries</h2>
      <p>
        Your summary can carry one headline metric if it is your best. &quot;Backend engineer, 8 years. Cut platform costs 30% last year through cache layer and query tuning.&quot; Do not stuff the summary with five numbers. One anchor metric plus domain and level is enough. Save the rest for role bullets where they belong in context.
      </p>

      <h2 className={h2}>Quality and reliability metrics</h2>
      <p>
        Not every win is speed. Test coverage moving from 40% to 75% on a critical service matters. Crash-free sessions rising from 98.5% to 99.7% on mobile matters. Mean time between failures extending from 30 days to 180 days matters. Pick the metric your team actually tracked. If nobody measured anything, start measuring on your next project so your next resume update has real numbers.
      </p>

      <h2 className={h2}>Scope without vanity metrics</h2>
      <p>
        Lines of code written is a negative signal. Number of PRs merged is weak unless you explain impact per PR. Strong scope metrics: teams depending on your service, countries served, transactions per day, records migrated, environments supported. Scale proves you operated real systems.
      </p>
      <p>
        Junior candidates can cite class project scale honestly: &quot;Handled 10K concurrent websocket connections in load test.&quot; That is valid if you ran the test and can explain setup in interview.
      </p>

      <h2 className={h2}>Cost metrics when you have them</h2>
      <p>
        Some platform and infra roles do see cloud bills. If your manager shared that your cache layer saved $40K annually, use it. If you only know percentage reduction on instance count, use that. &quot;Retired 12 idle RDS instances; cut AWS spend 22% on data tier.&quot; Cost language is fair when it came from your work and you can explain the mechanism.
      </p>
      <p>
        Product engineers rarely get revenue numbers. Growth engineers sometimes get funnel metrics. Know which metrics your role type typically owns and hunt for those before defaulting to lines of code.
      </p>

      <h2 className={h2}>Before and after in one bullet</h2>
      <p>
        The strongest metric bullets show change: from X to Y, by Z percent, over N weeks. &quot;Reduced checkout errors from 3.2% to 0.4% over two releases.&quot; Single-point metrics (&quot;handled 1M requests&quot;) are good. Change metrics are better because they imply you measured baseline and improved it deliberately.
      </p>
      <p>
        If you only have after state, compare to industry norm or team norm verbally in interview. On the resume, still write the absolute number. &quot;99.95% uptime over 12 months on payments API&quot; stands alone.
      </p>

      <h2 className={h2}>Security and compliance outcomes</h2>
      <p>
        Security work has metrics too. &quot;Closed 47 critical findings from annual pen test; mean remediation time 9 days vs 28-day industry benchmark.&quot; &quot;Rolled out SSO to 1,200 employees; password-reset tickets fell 70%.&quot; Compliance engineers can cite audit cycles passed, controls automated, or evidence collection time cut from weeks to hours.
      </p>

      <h2 className={h2}>Support deflection and ops load</h2>
      <p>
        Internal tools and self-serve flows produce numbers when revenue does not. &quot;Built admin panel for refund requests; support handled 400 fewer tickets/month.&quot; &quot;Added runbook automation to PagerDuty; on-call pages per engineer dropped from 12/week to 4.&quot; Ops impact is fair game on platform and full-stack resumes.
      </p>

      <h2 className={h2}>Related reading</h2>
      <ul className={ul}>
        <li><Link href="/summaries" className={link}>Technical summaries for senior roles</Link></li>
        <li><Link href="/soft-skills" className={link}>Prove soft skills on your resume</Link></li>
        <li><Link href="/scan" className={link}>How recruiters read resumes in 30 seconds</Link></li>
        <li><Link href="/freelance" className={link}>Format freelance work on a CV</Link></li>
      </ul>
    </div>
  );
}
