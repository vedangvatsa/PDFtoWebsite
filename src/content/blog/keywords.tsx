import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>Keywords are how software finds you. When a recruiter searches their ATS for &quot;React TypeScript&quot;, your resume either shows up or it does not. There is no partial credit.</p>
        <p>But listing every technology under the sun backfires too. A resume stuffed with 40 keywords looks like spam to a human reader, and modern AI screening tools can tell the difference between a keyword dropped into a skills list and a keyword backed by real experience. The goal is to pick the right words and put them in the right places.</p>
        <p>Here is what matters by role in 2026, which keywords are gaining weight, and which ones are losing relevance.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 300" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Horizontal bar chart showing keyword demand by tech category">
            <style>{`
              .bar-title { font: bold 13px system-ui; }
              .bar-label { font: 13px system-ui; }
              .bar-value { font: bold 11px system-ui; }
              .bar-axis { font: 10px system-ui; }
            `}</style>
            <text x="340" y="22" className="bar-title fill-zinc-900 dark:fill-zinc-100" textAnchor="middle">2026 Job Market Demand by Keyword Category</text>
            {/* Axis line */}
            <line x1="140" y1="42" x2="140" y2="260" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            {/* Frontend */}
            <text x="132" y="72" textAnchor="end" className="bar-label fill-zinc-700 dark:fill-zinc-300">Frontend</text>
            <rect x="140" y="56" width="420" height="24" rx="4" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="140" y="56" width="420" height="24" rx="4" fill="#3b82f6" opacity="0.8" />
            <text x="568" y="73" className="bar-value fill-white">Very High</text>
            {/* Backend */}
            <text x="132" y="116" textAnchor="end" className="bar-label fill-zinc-700 dark:fill-zinc-300">Backend</text>
            <rect x="140" y="100" width="460" height="24" rx="4" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="140" y="100" width="460" height="24" rx="4" fill="#6366f1" opacity="0.8" />
            <text x="608" y="117" className="bar-value fill-white">Highest</text>
            {/* DevOps */}
            <text x="132" y="160" textAnchor="end" className="bar-label fill-zinc-700 dark:fill-zinc-300">DevOps</text>
            <rect x="140" y="144" width="370" height="24" rx="4" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="140" y="144" width="370" height="24" rx="4" fill="#8b5cf6" opacity="0.8" />
            <text x="518" y="161" className="bar-value fill-white">High</text>
            {/* Data */}
            <text x="132" y="204" textAnchor="end" className="bar-label fill-zinc-700 dark:fill-zinc-300">Data</text>
            <rect x="140" y="188" width="340" height="24" rx="4" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="140" y="188" width="340" height="24" rx="4" fill="#a78bfa" opacity="0.8" />
            <text x="488" y="205" className="bar-value fill-white">High</text>
            {/* AI/ML */}
            <text x="132" y="248" textAnchor="end" className="bar-label fill-zinc-700 dark:fill-zinc-300">AI / ML</text>
            <rect x="140" y="232" width="490" height="24" rx="4" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="140" y="232" width="490" height="24" rx="4" fill="#ec4899" opacity="0.8" />
            <text x="638" y="249" className="bar-value fill-white">Fastest Growing</text>
            {/* Footer */}
            <text x="340" y="285" textAnchor="middle" className="bar-axis fill-zinc-400 dark:fill-zinc-500">Bar length = relative number of open positions mentioning category keywords</text>
          </svg>
        </div>

        <h2 className={h2}>Frontend Keywords</h2>
        <p><span className={bold}>High signal in 2026:</span> React, TypeScript, Next.js, Tailwind CSS, Vite, React Server Components, Zustand, Playwright, Web Components.</p>
        <p>React still dominates frontend hiring. But in 2026, saying &quot;React&quot; alone is not enough. Hiring managers expect you to specify what flavor: are you writing client-side SPAs, or are you building with React Server Components in Next.js? The distinction matters because the skills are different.</p>
        <p>TypeScript is no longer optional. Job postings that say &quot;JavaScript&quot; almost always mean &quot;TypeScript in practice.&quot; If you list JavaScript without TypeScript, it reads as outdated.</p>
        <p><span className={bold}>Losing weight:</span> jQuery (unless you are maintaining legacy code), Webpack (replaced by Vite in most new projects), Redux (Zustand and React context have taken over for most use cases), Sass (Tailwind has eaten this market).</p>
        <div className={callout}>
          <h3 className={h3}>Placement over count</h3>
          <p>Listing &quot;React&quot; in your skills section is worth less than writing &quot;Built a patient intake form in React with server-side validation that reduced submission errors by 40%.&quot; The keyword lands harder when it is tied to a result. Read more about <Link href="/tech-keywords" className={link}>where to place keywords on your resume</Link> for maximum impact.</p>
        </div>

        <h2 className={h2}>Backend Keywords</h2>
        <p><span className={bold}>High signal in 2026:</span> Node.js, Python, Go, Rust, PostgreSQL, Redis, GraphQL, gRPC, event-driven architecture, microservices.</p>
        <p>Python and Node.js are the two biggest backend ecosystems by job volume. Go is growing fast at infrastructure-heavy companies. Rust shows up in performance-sensitive roles at companies like Cloudflare, Discord, and Figma.</p>
        <p>For databases, PostgreSQL has become the default choice for new projects. If you know Postgres well, say so explicitly. Listing &quot;SQL&quot; alone is too vague. Hiring managers want to know which database you used and what kind of queries you wrote.</p>
        <p><span className={bold}>Losing weight:</span> PHP (still has jobs but declining demand), MongoDB (its hype peaked years ago, though it is still widely used), Express.js alone without any larger framework context, SOAP APIs.</p>

        <h2 className={h2}>DevOps and Infrastructure</h2>
        <p><span className={bold}>High signal in 2026:</span> Docker, Kubernetes, Terraform, AWS (with specific services like ECS, Lambda, RDS), GitHub Actions, ArgoCD, Datadog, Pulumi.</p>
        <p>Generic cloud experience is not enough anymore. Saying &quot;AWS&quot; is like saying &quot;I know computers.&quot; Specify the services: &quot;Managed ECS clusters serving 50k requests per minute&quot; tells a different story than &quot;Experience with AWS.&quot;</p>
        <p>Terraform is the standard for infrastructure as code. If you also know Pulumi, mention it because the TypeScript-based approach is gaining adoption. For CI/CD, GitHub Actions has become the default for most teams, so list it by name rather than just saying &quot;CI/CD pipelines.&quot;</p>
        <p><span className={bold}>Losing weight:</span> Jenkins (still common but seen as legacy), Ansible for cloud provisioning (Terraform won), Heroku (the free tier shutdown hurt its mindshare), Chef and Puppet.</p>

        <h2 className={h2}>Data Engineering Keywords</h2>
        <p><span className={bold}>High signal in 2026:</span> SQL, Python, dbt, Apache Spark, Airflow, Snowflake, BigQuery, Kafka, Databricks, Delta Lake.</p>
        <p>SQL is the one keyword that never loses relevance in data roles. But again, be specific. &quot;Wrote complex analytical queries in BigQuery processing 2TB daily&quot; says more than &quot;proficient in SQL.&quot;</p>
        <p>dbt has become the standard for data transformation. If you work in analytics engineering and do not mention dbt, you look out of touch. Spark and Kafka still matter for large-scale processing, but make sure you mention the scale you worked at. Running Spark on a laptop for a tutorial is different from managing Spark jobs processing billions of events.</p>
        <p><span className={bold}>Losing weight:</span> Hadoop (replaced by Spark and cloud-native tools), Hive (absorbed into other tools), Informatica and SSIS (enterprise ETL tools that younger companies avoid), Tableau as a primary skill (it is still useful but BI tools are now table stakes).</p>

        <h2 className={h2}>AI and ML Keywords</h2>
        <p><span className={bold}>High signal in 2026:</span> PyTorch, fine-tuning, RAG (retrieval-augmented generation), prompt engineering, LangChain, vector databases, RLHF, model evaluation, MLOps, Hugging Face.</p>
        <p>The AI/ML keyword world shifted dramatically in the last two years. Before 2024, the important keywords were TensorFlow, scikit-learn, and feature engineering. Those still matter for traditional ML roles, but the market has moved toward large language models.</p>
        <p>If you work with LLMs, say so directly. Mention whether you are fine-tuning, building RAG pipelines, doing prompt engineering, or evaluating model outputs. These are distinct skills and hiring managers know the difference.</p>
        <p><span className={bold}>Losing weight:</span> TensorFlow (still used but PyTorch won the research and startup market), Keras (absorbed into TensorFlow), basic scikit-learn without production context, &quot;machine learning&quot; as a standalone keyword without specifics.</p>

        <h2 className={h2}>The Keyword Stuffing Trap</h2>
        <p>There is a temptation to list every keyword from the job posting. Do not do this. Modern <Link href="/bots" className={link}>AI-powered screening tools</Link> check whether your keywords appear in context. If &quot;Kubernetes&quot; shows up in your skills section but never in any of your experience bullets, that is a red flag.</p>
        <p>Every keyword on your resume should pass a simple test: can you talk about it for five minutes in an interview? If the answer is no, remove it. A shorter list of genuine skills builds more <Link href="/trust" className={link}>keyword trust</Link> than a long list of buzzwords.</p>
        <div className={callout}>
          <h3 className={h3}>The five-minute rule</h3>
          <p>For each keyword on your resume, ask yourself: could I explain a real project where I used this technology, what problems I hit, and what I would do differently? If yes, keep it. If you would stumble, drop it. Interviewers will test your list.</p>
        </div>

        <h2 className={h2}>Placement Beats Quantity</h2>
        <p>Where you put a keyword changes how much weight it carries. A technology mentioned in your title or summary gets noticed first. A technology mentioned at the start of a bullet point gets scanned. A technology buried at the end of the third sentence in a paragraph gets missed.</p>
        <p>The most effective structure is to lead every experience bullet with the technology, followed by what you built and what the result was. &quot;Built a real-time analytics dashboard in React with D3.js, reducing report generation time from 4 hours to 2 minutes&quot; puts both keywords up front and ties them to an outcome.</p>
        <p>For a detailed breakdown of where exactly keywords should land on the page, read the full guide on <Link href="/tech-keywords" className={link}>keyword placement for tech resumes</Link>.</p>

        <div className={callout}>
          <h3 className={h3}>A quick audit for your resume</h3>
          <p>Open your resume right now. Read only the first three words of every bullet point. If those words are &quot;Responsible for the&quot; or &quot;Worked on a&quot;, your keywords are buried. Rewrite each bullet so the technology or skill comes first.</p>
        </div>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/tech-keywords" className={link}>Where to place keywords on a tech resume</Link></li>
          <li><Link href="/trust" className={link}>Why keyword trust matters more than keyword count</Link></li>
          <li><Link href="/bots" className={link}>How to get past AI resume screening tools</Link></li>
        </ul>
      </div>
  );
}
