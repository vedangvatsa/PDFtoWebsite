import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="flex flex-col gap-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>A backend developer spends two years building a high speed transaction engine for a major investment bank. They sign a strict non disclosure agreement that protects all proprietary technology. When they search for their next role they write a vague job bullet that says worked on database systems. Recruiter scanning profiles skip the entry because it lacks technical detail.</p>
      
      <p>This challenge is common for engineers working in defense, finance, and enterprise consulting. You must prove your systems engineering capabilities without violating legal agreements. Many candidates assume they must choose between silence and legal trouble.</p>

      <p>The secret is structural abstraction. You can describe complex architectures and performance metrics without naming clients or disclosing secret tools. This approach satisfies both legal teams and hiring managers.</p>

      <h2 className={h2}>The Risk of Naming Specific Nouns</h2>
      <p>Violating a non disclosure agreement is a fast way to destroy your career. Companies actively search the web for leaked project details. If a company finds their proprietary tool names on your public profile they will take legal action.</p>

      <p>Naming internal projects also reveals company strategy to competitors. For example writing that you built project falcon for a streaming client reveals active product lifecycles. This leak can lead to immediate termination.</p>

      <p>You must strip all proprietary branding from your history. Replace internal code names with generic industry descriptions. This change protects your past employer while preserving your technical contribution.</p>

      <div className={callout}>
        <h3 className={h3}>Focus on Universal Physics</h3>
        <p>Do not write about corporate project names or specific business targets. Focus your writing on computational load, database schemas, and networking constraints. These physical details are not proprietary and prove your engineering depth.</p>
      </div>

      <h2 className={h2}>The Abstraction Technique for Company Names</h2>
      <p>If you cannot name the company you worked for describe them by their scale and sector. This description gives hiring managers enough context to judge your experience. It proves you have worked in complex environments.</p>

      <p>For example do not name a confidential healthcare client. Write that you built systems for a national healthcare provider processing millions of daily records instead. This description details both industry and scale.</p>

      <p>Use relative scaling metrics instead of absolute numbers. If you cannot share the exact dollar amount of transactions write about the percentage growth. This framing shows business impact safely.</p>

      {/* SVG Diagram showing NDA Safe Abstraction */}
      <div className="not-prose my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Comparison of an NDA breach versus safe technical abstraction on a CV">
          <rect width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-900/30" />
          
          {/* Left Side: NDA Breach */}
          <text x="180" y="30" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 font-bold" fontSize="12">NDA BREACH (LEGAL RISK)</text>
          <rect x="30" y="50" width="300" height="260" rx="8" className="fill-red-50/10 dark:fill-red-950/10 stroke-red-200 dark:stroke-red-900" strokeWidth="1" />
          
          {/* Bad text items */}
          <rect x="50" y="70" width="260" height="45" rx="4" className="fill-zinc-100 dark:fill-zinc-800" />
          <text x="60" y="88" className="fill-red-600 dark:fill-red-400 font-bold" fontSize="11">Named Client Chase Bank</text>
          <text x="60" y="103" className="fill-zinc-500 dark:fill-zinc-400" fontSize="10">Leaks client identity and specific division</text>

          <rect x="50" y="130" width="260" height="45" rx="4" className="fill-zinc-100 dark:fill-zinc-800" />
          <text x="60" y="148" className="fill-red-600 dark:fill-red-400 font-bold" fontSize="11">Tool Built internal HydraDB engine</text>
          <text x="60" y="163" className="fill-zinc-500 dark:fill-zinc-400" fontSize="10">Reveals proprietary database technology</text>

          <rect x="50" y="190" width="260" height="45" rx="4" className="fill-zinc-100 dark:fill-zinc-800" />
          <text x="60" y="208" className="fill-red-600 dark:fill-red-400 font-bold" fontSize="11">Metric Handled 4.2B transactions</text>
          <text x="60" y="223" className="fill-zinc-500 dark:fill-zinc-400" fontSize="10">Leaks sensitive internal financial scale</text>

          <text x="180" y="295" textAnchor="middle" className="fill-red-600 dark:fill-red-400 font-semibold" fontSize="11">Violates legal non disclosure agreements</text>

          {/* Vertical Divider */}
          <rect x="349" y="20" width="2" height="310" className="fill-zinc-200 dark:fill-zinc-800" />

          {/* Right Side: Safe Abstraction */}
          <text x="520" y="30" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 font-bold" fontSize="12">SAFE ABSTRACTION (COMPLIANT)</text>
          <rect x="370" y="50" width="300" height="260" rx="8" className="fill-emerald-50/10 dark:fill-emerald-950/10 stroke-emerald-200 dark:stroke-emerald-900" strokeWidth="1" />
          
          {/* Good text items */}
          <rect x="390" y="70" width="260" height="45" rx="4" className="fill-zinc-100 dark:fill-zinc-800" />
          <text x="400" y="88" className="fill-emerald-600 dark:fill-emerald-400 font-bold" fontSize="11">Client Top tier global financial institution</text>
          <text x="400" y="103" className="fill-zinc-500 dark:fill-zinc-400" fontSize="10">Protects brand identity while retaining scale</text>

          <rect x="390" y="130" width="260" height="45" rx="4" className="fill-zinc-100 dark:fill-zinc-800" />
          <text x="400" y="148" className="fill-emerald-600 dark:fill-emerald-400 font-bold" fontSize="11">Tool Custom high throughput database layer</text>
          <text x="400" y="163" className="fill-zinc-500 dark:fill-zinc-400" fontSize="10">Describes function using standard industry terms</text>

          <rect x="390" y="190" width="260" height="45" rx="4" className="fill-zinc-100 dark:fill-zinc-800" />
          <text x="400" y="208" className="fill-emerald-600 dark:fill-emerald-400 font-bold" fontSize="11">Metric Scaled writes by 40% under peak load</text>
          <text x="400" y="223" className="fill-zinc-500 dark:fill-zinc-400" fontSize="10">Uses relative ratios instead of bank numbers</text>

          <text x="520" y="295" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 font-semibold" fontSize="11">Fully legal and highlights senior skills</text>
        </svg>
      </div>

      <h2 className={h2}>Describing Proprietary Frameworks as Industry Standards</h2>
      <p>Many large companies build their own development tools. If you use custom database engines or deployment systems you cannot mention them on your profile. These names are meaningless to external recruiters anyway.</p>

      <p>Translate these tools into their open source equivalents. If you used an internal key value store compare it to Redis. State that you managed a distributed data store similar to Redis to handle application session caching.</p>

      <p>This comparison gives the hiring manager an immediate mental model of your skill. It proves you understand the underlying architectural patterns. It also ensures you match standard database search terms.</p>

      <h2 className={h2}>How to Describe NDA Projects in Experience Bullets</h2>
      <p>Your work history bullets must remain detailed and action oriented. You do not need to drop details because the project was secret. Use this structure to write safe bullet points.</p>

      <ul className={ul}>
        <li><span className={bold}>System Architecture</span> Architected a microservice orchestration layer handling millions of daily requests for a major telecom client.</li>
        <li><span className={bold}>Performance Tuning</span> Optimized query execution paths on a distributed database system to reduce read latency by forty percent.</li>
        <li><span className={bold}>Security Compliance</span> Deployed token based authentication layers following strict industry standards for health data access.</li>
      </ul>

      <p>This structure proves you solved real scaling problems. It omits the company name and internal project names completely. The hiring manager gets the technical signal they need without violating any trust.</p>

      <h2 className={h2}>Framing Financial Metrics as Percentage Improvements</h2>
      <p>Absolute numbers can be confidential. Stating that you grew revenue from ten million to fifty million dollars will trigger warnings from legal compliance departments. Use percentages instead.</p>

      <p>Write that you increased transaction throughput by four hundred percent. State that your refactoring work reduced server infrastructure bills by thirty percent. These percentage ratios prove your value without leaking financial scale.</p>

      <p> Hiding the absolute numbers also focuses the conversation on your technical competence. Engineering managers care about performance ratios. They want to know how you optimized resources rather than absolute business budgets.</p>

      <h2 className={h2}>Structuring Interviews Around Abstracted Projects</h2>
      <p>Talking about confidential work in job interviews requires confidence. When an interviewer asks about a secret project do not refuse to answer. Explain that you will describe the technical challenges using standard industry terminology.</p>

      <p>Focus the conversation on architectural trade offs. Explain why you chose a relational schema instead of a document store for key services. Discuss how you handled caching invalidation and distributed transactions.</p>

      <p>State that your NDA prevents you from naming the client but allows you to detail the systems design. This response shows professional boundaries. Interviewers respect candidates who guard past client secrets carefully.</p>

      <h2 className={h2}>Handling Background Checks and Verification</h2>
      <p>Using abstracted company names can create questions during background verification checks. The verification agency will not find a company named Top Tier Financial Group on corporate registries. You must prepare for this verification.</p>

      <p>Use the actual legal name of your employer or agency on official verification forms. You only use the abstracted description on public profiles and CV links. Background check forms are private and secure.</p>

      <p>Inform your reference contacts about the abstracted descriptions you used. Ensure they know to verify your title and dates of employment without naming secret projects. This preparation prevents verification delays.</p>

      <p>Keep a clean record of your tax forms or employment letters. If a verification agency cannot reach your past employer they will request these documents. Redact any sensitive project details before sending them.</p>

      <h2 className={h2}>The Advantage of a Managed Web CV</h2>
      <p>Public search engines scan files index their details. If you publish a PDF containing confidential details it remains in search engine archives forever. Even if you delete the file the data exists in search caches.</p>

      <p>A web profile gives you absolute control over your visibility. You can modify your descriptions instantly if your legal department requests changes. This speed minimizes legal exposure.</p>

      <p>Web profiles also allow you to control access to specific sections. You can host your general abstracted profile publicly and share deep details only during private interviews. This control is critical for high level clearance roles.</p>

      <p>Using CVin.Bio allows you to manage these details cleanly. You get a professional web link that is easy to edit. You can keep your public profile fully compliant while presenting your engineering skills in a clean responsive format.</p>

      <h2 className={h2}>Read Next</h2>
      <p>For more advice on formatting freelance work and presenting technical design read these detailed articles.</p>
      
      <p>
        Learn how to layout consulting contracts by reading <Link href="/blog/freelance" className={link}>Best Freelance Portfolio Formatting Tips for Software Engineers</Link>.
      </p>
      <p>
        Understand how to build trust with technical details by reading <Link href="/blog/trust" className={link}>Stop Faking Your Skills List</Link>.
      </p>
      <p>
        Discover how to prove architecture design by reading <Link href="/blog/system-design" className={link}>Best Ways to Prove System Design Skills on a CV</Link>.
      </p>
    </div>
  );
}
