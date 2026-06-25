import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        Listing database names on a CV is a lazy habit. Many developers write a skills block that lists PostgreSQL, MySQL, Redis, and MongoDB. This list does not tell a recruiter what you can actually do. It does not show if you can write a basic query or design a multi-node cluster. It lacks context and detail.
      </p>
      <p>
        Hiring managers look for candidates who understand database internals and infrastructure limits. They want to know if you can handle locking issues, optimize query plans, and manage storage costs. To prove these skills, you must describe the scale of your databases and the architectural decisions you made. This guide shows you how to write about database experience.
      </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Showing database skills on a CV">
          <rect x="0" y="0" width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-950" />
          <text x="350" y="30" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100 font-bold text-sm">Listing Database Skills Effectively</text>
          
          {/* Weak List */}
          <rect x="40" y="60" width="280" height="250" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="180" y="85" textAnchor="middle" className="fill-red-500 font-semibold text-xs">Generic Skills Block</text>
          
          <rect x="60" y="110" width="240" height="120" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="75" y="132" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[11px]">Databases</text>
          <text x="75" y="152" className="fill-zinc-500 dark:fill-zinc-400 text-[10px]">• PostgreSQL (3 years)</text>
          <text x="75" y="170" className="fill-zinc-500 dark:fill-zinc-400 text-[10px]">• MySQL (2 years)</text>
          <text x="75" y="188" className="fill-zinc-500 dark:fill-zinc-400 text-[10px]">• MongoDB (1 year)</text>
          <text x="75" y="206" className="fill-zinc-500 dark:fill-zinc-400 text-[10px]">• Redis</text>

          <rect x="80" y="250" width="200" height="45" rx="6" className="fill-red-50 dark:fill-red-950/20 stroke-red-200 dark:stroke-red-900" />
          <text x="180" y="268" textAnchor="middle" className="fill-red-600 dark:fill-red-400 text-[10px] font-semibold">Low Trust Rating</text>
          <text x="180" y="282" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Just a list of keywords without scale</text>

          {/* Strong List */}
          <rect x="380" y="60" width="280" height="250" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="520" y="85" textAnchor="middle" className="fill-emerald-500 font-semibold text-xs">Contextual Infrastructure Proof</text>
          
          <rect x="400" y="110" width="240" height="120" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="415" y="132" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[11px]">Database Achievements</text>
          <text x="415" y="152" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">• Optimized PostgreSQL queries using composite indexes</text>
          <text x="415" y="167" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">• Reduced P99 search latency from 800ms to 45ms</text>
          <text x="415" y="182" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">• Deployed Redis cache layer for session storage</text>
          <text x="415" y="197" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">• Sharded a 500GB Postgres database into 8 nodes</text>

          <rect x="420" y="250" width="200" height="45" rx="6" className="fill-emerald-50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-900" />
          <text x="520" y="268" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[10px] font-semibold">High Trust Rating</text>
          <text x="520" y="282" textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-300 text-[9px] font-medium">Proves capacity, scale, and performance wins</text>
        </svg>
      </div>

      <h2 className={h2}>Quantifying Database Scale</h2>
      <p>
        Database engines behave differently depending on the volume of data they hold. A query that runs in ten milliseconds on a database with one thousand rows can crash a server with one hundred million rows. Therefore, stating the size of your dataset is the fastest way to prove your technical depth.
      </p>
      <p>
        Mention the physical storage size of your databases. Use gigabytes or terabytes. This gives hiring managers a clear picture of the operational challenges you faced. Managing a ten gigabyte database is simple, but a database that exceeds one terabyte requires careful planning.
      </p>
      <p>
        You should also state the row count of your largest tables. For example, you can write that you maintained tables containing eighty million records. This indicates that you know how to handle massive table scans and composite index configurations.
      </p>
      <p>
        Finally, write about request volumes. If your system handled three thousand database operations per second, include that metric. It proves you understand connection pools, thread allocation, and read write split configurations.
      </p>

      <h2 className={h2}>Relational and Document Store Choices</h2>
      <p>
        Many modern stacks use multiple database engines. You might use PostgreSQL for your primary store and Redis for caching. You might use MongoDB for storing unstructured document streams.
      </p>
      <p>
        Explain why you chose these systems. Do not write as if you used tools because they were popular. Managers want to see logical engineering decisions.
      </p>
      <p>
        For instance, describe how you designed a schema for an order system. Explain that you selected PostgreSQL because you required ACID transaction guarantees to prevent payment conflicts. Stating this design rationale shows you understand data integrity.
      </p>
      <p>
        Then, explain why you used a NoSQL database like DynamoDB or Cassandra. You could write that you selected a document store to handle high write volumes from a web activity stream. Detail how you chose the primary partition key to avoid write hot spots.
      </p>
      <p>
        This level of detail shows that you understand the strengths and limits of different data stores. It proves you do not have a one size fits all approach to system architecture.
      </p>

      <div className={callout}>
        <h3 className={h3}>Detail database migration</h3>
        <p>
          Moving data from one store to another without losing transactions is highly complex. If you successfully executed a migration, describe the plan. Mention how you ran dual writes, verified data parity, and completed the DNS cutover.
        </p>
      </div>

      <h2 className={h2}>Describing Indexing and Query Tuning</h2>
      <p>
        Writing complex SQL queries is a basic developer skill. Optimizing slow queries is a senior engineering skill. If you want to impress recruiters, write about your performance optimization accomplishments.
      </p>
      <p>
        Explain how you found slow database calls. Mention query logs or performance monitoring tools. Talk about how you used execution plans to identify missing indexes or expensive sequential scans.
      </p>
      <p>
        Instead of saying you optimized SQL queries, describe the index type you introduced. Mention B-tree indexes, partial indexes, or composite keys. Stating that you built a composite index on user ID and created date to speed up search lookups shows real expertise.
      </p>
      <p>
        Quantify the performance improvement. Stating that you cut database response times by eighty percent is strong. It tells the reader that you know how to configure database systems for peak efficiency.
      </p>
      <p>
        Discuss how you handled write performance. Adding indexes speeds up reads but slows down writes. If you balanced this trade-off successfully, write about it.
      </p>

      <h2 className={h2}>Listing Caching and Infrastructure Patterns</h2>
      <p>
        Databases rarely run in isolation. Production environments rely on caching, replication, and connection pooling to handle heavy user traffic.
      </p>
      <p>
        Describe your caching strategies. If you used Redis, detail what you cached. Did you store session tokens or product catalog metadata? Explain your cache invalidation policy. Stating that you used a write through cache with a twelve hour time to live proves you understand data fresh challenges.
      </p>
      <p>
        Mention connection pooling utilities. If you used PostgreSQL, write about PgBouncer configurations. Explain how setting up connection pooling prevented database crash failures during traffic surges.
      </p>
      <p>
        Talk about replication topologies. Describe how you configured read replicas to handle dashboard analytics traffic. This partition strategy keeps your primary database free to process checkout transactions without latency delays.
      </p>
      <p>
        These infrastructure achievements belong in your job history bullets. They show that you think about system reliability, not just writing code.
      </p>

      <h2 className={h2}>How to Format Database Achievements on a CV</h2>
      <p>
        Avoid generic skills sections. Instead, integrate database achievements directly into your work experience bullets. Use concrete action verbs and measurable performance results.
      </p>
      <p>
        Here are bullet points you can adapt for your professional profile.
      </p>
      <p>
        First example. Restructured database indexes on a PostgreSQL cluster handling forty million events daily. This change lowered server CPU load from ninety percent to fifteen percent.
      </p>
      <p>
        Second example. Scaled read throughput by setting up three database replicas to handle analytics traffic. This design prevented primary node database lockups during heavy billing cycles.
      </p>
      <p>
        Third example. Designed a Redis cache strategy for user session storage. This cut overall application response latency by seventy-five percent and reduced database connection counts.
      </p>
      <p>
        Do not forget database security and recovery. Mentioning your experience setting up automated backup pipelines and testing restore procedures is a strong signal. It shows you do not just care about the happy path but are prepared for disasters. If you configured row-level security or database access control policies, include those details. This proves you understand modern data protection compliance rules.
      </p>
      <p>
        Similarly, mention your experience with database connection pools. Discussing how you configured PgBouncer or connection limits to prevent client connection exhaustion under sudden traffic spikes is a great proof point. It highlights that you understand the boundary between application code and database resources.
      </p>
      <p>
        Ensure your CV has a clean typography style. A structured single column format makes it easy for tech recruiters to find database metrics quickly. You can read about <Link href="/design" className={link}>layout principles for software engineers</Link> to build a clean profile.
      </p>
      <p>
        If you want to know what keywords to include beside databases, read about <Link href="/keywords" className={link}>best keywords for technical CVs</Link> to ensure your writing passes ATS parsers.
      </p>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/design" className={link}>Best CV Design Principles for Software Engineers</Link></li>
        <li><Link href="/keywords" className={link}>Best Technical Keywords for Your CV</Link></li>
        <li><Link href="/system-design" className={link}>Best Ways to Prove System Design Skills on a CV</Link></li>
      </ul>
    </div>
  );
}
