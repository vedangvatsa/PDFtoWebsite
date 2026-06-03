import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        Whiteboard diagrams do not prove you can build software. A candidate can draw boxes and label them database, queue, or cache. That is easy. It shows you memorized basic patterns from a video course. Recruiters and hiring managers see through this instantly. They want proof that you understand system physics, trade-offs, and operational realities.
      </p>
      <p>
        The challenge is showing this on a short document. You cannot paste your system design document. You cannot show proprietary code. You have to use text to convey deep engineering expertise. You must shift from listing tools to explaining choices. This article will show you how to write about systems on your CV.
      </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Whiteboard boxes versus actual system metrics on a CV">
          <rect x="0" y="0" width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-950" />
          <text x="350" y="30" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100 font-bold text-sm">System Design Details on a CV</text>
          
          {/* Left Column - Generic whiteboards */}
          <rect x="40" y="60" width="280" height="250" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="180" y="85" textAnchor="middle" className="fill-red-500 font-semibold text-xs">Generic Whiteboard Layout</text>
          
          {/* Box Diagram */}
          <rect x="70" y="110" width="60" height="30" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="100" y="128" textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-400 text-[10px]">Client</text>
          
          <path d="M 130 125 L 180 125" className="stroke-zinc-400" markerEnd="url(#arrow)" />
          
          <rect x="180" y="110" width="80" height="30" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="220" y="128" textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-400 text-[10px]">API Gateway</text>
          
          <path d="M 220 140 L 220 180" className="stroke-zinc-400" />
          
          <rect x="170" y="180" width="100" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="220" y="198" textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-400 text-[10px]">Microservices</text>
          <text x="220" y="212" textAnchor="middle" className="fill-zinc-400 text-[8px] italic">"Designed systems"</text>
          
          <rect x="110" y="250" width="200" height="45" rx="6" className="fill-red-50 dark:fill-red-950/20 stroke-red-200 dark:stroke-red-900" />
          <text x="210" y="268" textAnchor="middle" className="fill-red-600 dark:fill-red-400 text-[10px] font-semibold">Low Recruiter Signal</text>
          <text x="210" y="282" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Lacks constraints, scale, or metrics</text>

          {/* Right Column - Verifiable Proof */}
          <rect x="380" y="60" width="280" height="250" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="520" y="85" textAnchor="middle" className="fill-emerald-500 font-semibold text-xs">Production Grade Proof</text>
          
          <rect x="400" y="110" width="240" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="410" y="125" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[10px]">Throughput and Load</text>
          <text x="410" y="140" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Scaled API from 200 to 8000 requests per second</text>
          
          <rect x="400" y="160" width="240" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="410" y="175" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[10px]">Data Layout and Latency</text>
          <text x="410" y="190" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Sharded database, reduced P99 latency by 75%</text>

          <rect x="400" y="210" width="240" height="85" rx="6" className="fill-emerald-50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-900" />
          <text x="520" y="228" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[10px] font-semibold">High Recruiter Signal</text>
          <text x="520" y="245" textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-300 text-[9px] font-medium">Connects system physics to business outcome</text>
          <text x="520" y="260" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[8px]">Details partition strategies and consistency models</text>
          <text x="520" y="275" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[8px]">Shows deep understanding of failures</text>

          {/* SVG Definitions */}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-zinc-400" />
            </marker>
          </defs>
        </svg>
      </div>

      <h2 className={h2}>The Shift to Systems Physics</h2>
      <p>
        System design is not about tool names. Saying you used AWS or Kubernetes does not show engineering skill. You could have used those tools poorly. You could have built a slow system that costs too much. To prove your skill, you must write about systems physics.
      </p>
      <p>
        Systems physics includes throughput, latency, and space. It includes network round-trips and database input output operations. It includes how data flows when a server dies. When you describe your work, lead with these constraints.
      </p>
      <p>
        For instance, consider a system that imports user data. A weak description says you built an importer tool. A strong description focuses on the physics of the process. It states how many gigabytes of data entered the system. It states the speed of the processing. It explains the bottleneck you hit and how you solved it.
      </p>
      <p>
        Recruiters read hundreds of profiles daily. They scan for key numbers that match the scale of their own company. If your profile mentions specific load metrics, you stand out. You prove you did not just use a tool but actually managed a system.
      </p>

      <h2 className={h2}>Quantifying System Performance</h2>
      <p>
        If you want to catch the eye of an engineering manager, you must use metrics. You should not say a service was fast. You should state the latency percentile. Mentioning P95 or P99 latency shows you understand real performance. It tells the reader that you know some users experienced slow times and that you fixed those outliers.
      </p>
      <p>
        Throughput is another vital metric. Use requests per second or messages per minute. If you worked on background processing, write about queue depth and drain rates. These numbers give a sense of scale. A system handling ten requests per second is designed differently than one handling ten thousand.
      </p>
      <p>
        Here are examples of how to rewrite your project descriptions.
      </p>
      <p>
        Instead of saying you optimized backend queries, write about the result. You could say you reduced database CPU utilization from eighty percent to twenty percent. Explain that you achieved this by restructuring indexes and removing redundant joints. This tells the manager you saved money and made the database stable.
      </p>
      <p>
        Instead of writing that you set up a cache, specify the hit rate. Stating that you designed a cache strategy that achieved a ninety-two percent hit rate is impressive. It shows you selected the right keys and eviction policy. It proves you understand memory limits.
      </p>

      <div className={callout}>
        <h3 className={h3}>Measure what matters</h3>
        <p>
          Do not list random metrics. Only show numbers that directly represent system health or cost. Cutting latency in half is great, but it is better if you explain how that change allowed the system to run on smaller, cheaper servers.
        </p>
      </div>

      <h2 className={h2}>Describing Architectural Choices and Trade-offs</h2>
      <p>
        Every system design decision has a downside. If you choose eventual consistency, you sacrifice immediate accuracy. If you normalize your database, you pay a price in joins. If you shard your data, you make cross-shard queries slow and complex.
      </p>
      <p>
        Your professional profile should show you understand these trade-offs. Do not write as if every project was perfect. Write about the choices you had to make. Explain why one path was chosen over another.
      </p>
      <p>
        For example, you could write about data store selection. Do not just say you used PostgreSQL. Explain that you selected PostgreSQL because you needed ACID transactions for a payment flow. If you chose a NoSQL database, explain that you needed horizontal write scale for user event logging.
      </p>
      <p>
        You can also talk about partition strategies. If you sharded a database, explain the key you used. Did you shard by user ID or by region? What were the hot spot risks? How did you avoid them? Answering these questions in your project bullet points proves senior engineering capability.
      </p>
      <p>
        Managers respect candidates who can discuss failures. If a system failed during a migration, write about the roll-back mechanism you designed. This shows you build safe software that can survive the real world.
      </p>

      <h2 className={h2}>Proven Templates for System Design Bullet Points</h2>
      <p>
        To keep your writing clean, use a structured format for your accomplishments. Lead with the system action and the scale. Then state the technical mechanism. Finish with the measurable business or system outcome.
      </p>
      <p>
        Here are three templates you can adapt for your experience section.
      </p>
      <p>
        First template. Scaled a ingestion pipeline to process four terabytes of daily sensor data by introducing Kafka partition groups. This change eliminated message loss and cut processing delays by sixty percent.
      </p>
      <p>
        Second template. Reduced API latency for the checkout service from three hundred milliseconds to forty-five milliseconds. This was done by replacing synchronous database queries with Redis cached lookups. It kept the database stable during peak sale traffic.
      </p>
      <p>
        Third template. Migrated a legacy user profile database to a sharded Postgres cluster. This partition strategy prevented write bottlenecks and saved seventy thousand dollars in annual hosting fees.
      </p>
      <p>
        These templates put the technical details first. They use active verbs and avoid generic corporate jargon. They do not say the system was exceptional. They let the numbers prove the quality of the work.
      </p>

      <h2 className={h2}>Proving System Ownership</h2>
      <p>
        Many junior engineers work on large systems, but they only write small features. To stand out as a senior engineer, you must show ownership. You must prove you designed the architecture rather than just writing code for it.
      </p>
      <p>
        You can show ownership by writing about migrations. Migrating a live system without downtime is one of the hardest tasks in software engineering. If you planned and ran a migration, highlight it. Explain the dual-write phase, the verification checks, and the final cutover steps.
      </p>
      <p>
        Another way to show ownership is describing how you handled system alerts. Write about how you set up monitoring and tracing. Mention tools like Prometheus or OpenTelemetry. Explain how you used that telemetry to find and fix a bottleneck in production.
      </p>
      <p>
        When you write your profile, link to your portfolio or web page. Sharing a live link allows recruiters to check your work easily. You can read about how <Link href="/link" className={link}>sharing a web link helps you stand out</Link>.
      </p>
      <p>
        Ensure your profile has a clean layout. A good structure makes it easy for hiring managers to scan your technical details quickly. You can read about <Link href="/spacing" className={link}>margins and layout principles for a professional look</Link> to ensure your writing is readable.
      </p>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/link" className={link}>Sharing a Live Web Link Instead of a Flat PDF File</Link></li>
        <li><Link href="/spacing" className={link}>Best Spacing and Margin Standards for a Professional Look</Link></li>
        <li><Link href="/projects" className={link}>Best Personal Projects to Put on a Software CV</Link></li>
      </ul>
    </div>
  );
}
