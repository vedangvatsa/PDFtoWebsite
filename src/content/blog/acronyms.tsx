import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="flex flex-col gap-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>A backend engineer builds a complex distributed database system. They write about their experience using AWS and SQL. They submit the document to a company database and never receive a response because the recruiter searched for Amazon Web Services.</p>
      
      <p>Many applicants assume that scanning software automatically translates abbreviations. While modern tools have basic dictionaries they often fail to map industry terms correctly. You must write out the full names to guarantee matches.</p>

      <p>Writing both the acronym and the expanded name is the safest way to satisfy search systems. This approach ensures your profile is indexed for both search styles. Let us inspect how search crawlers analyze your technical skills.</p>

      <h2 className={h2}>How Search Crawlers Index Your Skills</h2>
      <p>Search crawlers scan your document to build a personalized search index. This index works like a library catalog. If a recruiter types a query that does not exist in your index your profile will not appear in the results.</p>

      <p>Some search systems use semantic matching to connect related terms. For example a system might know that AWS refers to Amazon Web Services. However older databases require exact matches to score your profile.</p>

      <p>Older systems are still common in large enterprise companies. If you only write the abbreviation you risk getting filtered out by archaic database software. Writing the full name alongside the abbreviation eliminates this problem.</p>

      <div className={callout}>
        <h3 className={h3}>Avoid Overuse of Acronyms</h3>
        <p>Do not stuff your sentences with too many abbreviations. Writing too many shortened terms makes your text unreadable to humans. Focus on the core skills that match the target role.</p>
      </div>

      <h2 className={h2}>The Expansion Technique for Technical Terms</h2>
      <p>The best way to write your skills is to use the expansion technique. Write the common acronym first and put the full spelling in parenthetical statements immediately after. This satisfies both human readers and software search filters.</p>

      <p>For example write SQL followed by Structured Query Language. Write API followed by Application Programming Interface. This combination covers all possible search queries that a recruiter might enter.</p>

      <p>This technique also shows that you understand the terms you use. Human recruiters are not always technical. Seeing the full name helps non-technical recruiters match your profile with the job description.</p>

      {/* SVG: Acronym expansion reference showing how ATS matches both forms */}
      <div className="not-prose my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 400" className="w-full h-auto" role="img" aria-label="Reference table showing common tech acronyms, their expansions, and how ATS systems match both the abbreviation and full form">
          <style>{`
            .ac-title { font: 600 13px system-ui, sans-serif; }
            .ac-header { font: 700 9px system-ui, sans-serif; letter-spacing: 0.08em; }
            .ac-label { font: 600 11px system-ui, sans-serif; }
            .ac-small { font: 400 10px system-ui, sans-serif; }
            .ac-code { font: 600 10px 'SF Mono', 'Fira Code', monospace; }
            .ac-badge { font: 700 8px system-ui, sans-serif; letter-spacing: 0.05em; }
          `}</style>

          <text x="350" y="22" textAnchor="middle" className="ac-title fill-zinc-900 dark:fill-zinc-100">ATS Acronym Matching. Write Both Forms</text>
          <text x="350" y="38" textAnchor="middle" className="ac-small fill-zinc-500 dark:fill-zinc-400">Recruiters search for either form · Only resumes with both get matched</text>

          {/* Table header */}
          <rect x="30" y="52" width="640" height="28" rx="6" className="fill-zinc-100 dark:fill-zinc-800" />
          <text x="75" y="70" textAnchor="middle" className="ac-header fill-zinc-500 dark:fill-zinc-400">ACRONYM</text>
          <text x="240" y="70" textAnchor="middle" className="ac-header fill-zinc-500 dark:fill-zinc-400">FULL EXPANSION</text>
          <text x="420" y="70" textAnchor="middle" className="ac-header fill-zinc-500 dark:fill-zinc-400">BEST RESUME USAGE</text>
          <text x="590" y="70" textAnchor="middle" className="ac-header fill-zinc-500 dark:fill-zinc-400">ATS COVERAGE</text>

          {/* Row 1 */}
          <rect x="30" y="84" width="640" height="36" rx="0" className="fill-white dark:fill-zinc-900/50" />
          <rect x="45" y="90" width="50" height="22" rx="4" className="fill-blue-100 dark:fill-blue-900/30 stroke-blue-200 dark:stroke-blue-700" strokeWidth="1" />
          <text x="70" y="105" textAnchor="middle" className="ac-code fill-blue-600 dark:fill-blue-400">AWS</text>
          <text x="240" y="106" textAnchor="middle" className="ac-small fill-zinc-700 dark:fill-zinc-300">Amazon Web Services</text>
          <text x="420" y="106" textAnchor="middle" className="ac-small fill-zinc-600 dark:fill-zinc-400">"Deployed on AWS (Amazon Web Services)"</text>
          <text x="590" y="106" textAnchor="middle" className="ac-badge fill-emerald-600 dark:fill-emerald-400">✓ BOTH FORMS</text>

          {/* Row 2 */}
          <rect x="30" y="120" width="640" height="36" rx="0" className="fill-zinc-50 dark:fill-zinc-800/30" />
          <rect x="45" y="126" width="50" height="22" rx="4" className="fill-violet-100 dark:fill-violet-900/30 stroke-violet-200 dark:stroke-violet-700" strokeWidth="1" />
          <text x="70" y="141" textAnchor="middle" className="ac-code fill-violet-600 dark:fill-violet-400">CI/CD</text>
          <text x="240" y="142" textAnchor="middle" className="ac-small fill-zinc-700 dark:fill-zinc-300">Continuous Integration / Delivery</text>
          <text x="420" y="142" textAnchor="middle" className="ac-small fill-zinc-600 dark:fill-zinc-400">"Built CI/CD pipeline with GitHub Actions"</text>
          <text x="590" y="142" textAnchor="middle" className="ac-badge fill-emerald-600 dark:fill-emerald-400">✓ BOTH FORMS</text>

          {/* Row 3 */}
          <rect x="30" y="156" width="640" height="36" rx="0" className="fill-white dark:fill-zinc-900/50" />
          <rect x="45" y="162" width="50" height="22" rx="4" className="fill-amber-100 dark:fill-amber-900/30 stroke-amber-200 dark:stroke-amber-700" strokeWidth="1" />
          <text x="70" y="177" textAnchor="middle" className="ac-code fill-amber-600 dark:fill-amber-400">K8s</text>
          <text x="240" y="178" textAnchor="middle" className="ac-small fill-zinc-700 dark:fill-zinc-300">Kubernetes</text>
          <text x="420" y="178" textAnchor="middle" className="ac-small fill-zinc-600 dark:fill-zinc-400">"Managed Kubernetes (K8s) clusters"</text>
          <text x="590" y="178" textAnchor="middle" className="ac-badge fill-emerald-600 dark:fill-emerald-400">✓ BOTH FORMS</text>

          {/* Row 4 */}
          <rect x="30" y="192" width="640" height="36" rx="0" className="fill-zinc-50 dark:fill-zinc-800/30" />
          <rect x="45" y="198" width="50" height="22" rx="4" className="fill-emerald-100 dark:fill-emerald-900/30 stroke-emerald-200 dark:stroke-emerald-700" strokeWidth="1" />
          <text x="70" y="213" textAnchor="middle" className="ac-code fill-emerald-600 dark:fill-emerald-400">REST</text>
          <text x="240" y="214" textAnchor="middle" className="ac-small fill-zinc-700 dark:fill-zinc-300">Representational State Transfer</text>
          <text x="420" y="214" textAnchor="middle" className="ac-small fill-zinc-600 dark:fill-zinc-400">"Designed RESTful API endpoints"</text>
          <text x="590" y="214" textAnchor="middle" className="ac-badge fill-emerald-600 dark:fill-emerald-400">✓ BOTH FORMS</text>

          {/* Row 5 */}
          <rect x="30" y="228" width="640" height="36" rx="0" className="fill-white dark:fill-zinc-900/50" />
          <rect x="45" y="234" width="50" height="22" rx="4" className="fill-rose-100 dark:fill-rose-900/30 stroke-rose-200 dark:stroke-rose-700" strokeWidth="1" />
          <text x="70" y="249" textAnchor="middle" className="ac-code fill-rose-600 dark:fill-rose-400">GCP</text>
          <text x="240" y="250" textAnchor="middle" className="ac-small fill-zinc-700 dark:fill-zinc-300">Google Cloud Platform</text>
          <text x="420" y="250" textAnchor="middle" className="ac-small fill-zinc-600 dark:fill-zinc-400">"GCP (Google Cloud Platform) certified"</text>
          <text x="590" y="250" textAnchor="middle" className="ac-badge fill-emerald-600 dark:fill-emerald-400">✓ BOTH FORMS</text>

          {/* Bad examples section */}
          <rect x="30" y="280" width="640" height="28" rx="6" className="fill-red-50 dark:fill-red-950/20" />
          <text x="350" y="298" textAnchor="middle" className="ac-header fill-red-500 dark:fill-red-400">COMMON MISTAKES. ACRONYM ONLY (NO EXPANSION)</text>

          {/* Bad Row 1 */}
          <rect x="30" y="312" width="310" height="36" rx="0" className="fill-white dark:fill-zinc-900/50 stroke-red-100 dark:stroke-red-900/30" strokeWidth="1" />
          <text x="50" y="334" className="ac-code fill-red-500 dark:fill-red-400">✗</text>
          <text x="65" y="334" className="ac-small fill-zinc-600 dark:fill-zinc-400">"Proficient in ML and NLP"</text>
          <text x="290" y="334" className="ac-badge fill-red-400 dark:fill-red-500">MISSING EXPANSION</text>

          {/* Bad Row 2 */}
          <rect x="360" y="312" width="310" height="36" rx="0" className="fill-white dark:fill-zinc-900/50 stroke-red-100 dark:stroke-red-900/30" strokeWidth="1" />
          <text x="380" y="334" className="ac-code fill-red-500 dark:fill-red-400">✗</text>
          <text x="395" y="334" className="ac-small fill-zinc-600 dark:fill-zinc-400">"Experience with ORM and ETL"</text>
          <text x="620" y="334" className="ac-badge fill-red-400 dark:fill-red-500">MISSING EXPANSION</text>

          {/* Takeaway */}
          <text x="350" y="372" textAnchor="middle" className="ac-small fill-zinc-500 dark:fill-zinc-400">ATS keyword search looks for exact text matches · Write "Kubernetes (K8s)" "K8s"</text>
          <text x="350" y="390" textAnchor="middle" className="ac-badge fill-emerald-600 dark:fill-emerald-400">RULE: ALWAYS WRITE THE FULL NAME + ABBREVIATION ON FIRST USE</text>
        </svg>
      </div>

      <h2 className={h2}>Positioning Technical Terms in Context</h2>
      <p>Classifiers do look for words. They also analyze where the words are placed in your document structure. Keywords in your job experience carry more weight than keywords in a generic list.</p>

      <p>Avoid listing twenty technical acronyms at the bottom of your page. Instead write about how you used those tools in your daily work. Describe the results you achieved using those specific systems.</p>

      <p>For example write that you used AWS to host your database. Explain that this project reduced page load latency by forty percent. This context proves you have real experience with the technology.</p>

      <h2 className={h2}>Common Synonyms and Versioning Pitfalls</h2>
      <p>Technology versions change quickly. Candidates often write specific versions like ES6 or CSS3. This can prevent you from matching broader searches for JavaScript or CSS.</p>

      <p>Include the parent technology name alongside the version. Write JavaScript when you mention ES6. Write CSS when you write about CSS3. This ensures you match both specific and general searches.</p>

      <p>Be careful with regional synonyms. Some companies search for developer while others search for engineer. Use both terms in your profile to capture all search traffic.</p>

      <p>Many candidates list specific package managers or libraries like npm or yarn. While these details show your operational environment they are rarely the primary search terms. Recruiters search for package management or dependency injection instead of specific commands.</p>

      <p>Another common mistake is listing framework wrappers without the base language. Some applicants write NextJS and NestJS but omit React and Node. If the database engine only indexes base technology names you will miss the query completely.</p>

      <h2 className={h2}>Structuring Your Technical Skills Section</h2>
      <p>A structured skills section helps crawlers index your profile. Group your acronyms under logical headers. This layout shows you understand the technical hierarchy.</p>

      <p>For example create a subheader for Cloud Infrastructure. List your cloud tools under this title. Create another subheader for Database Systems and list your SQL databases.</p>

      <p>This structure helps both human recruiters and software parsers. The human recruiter can scan your skills in two seconds. The parser can easily associate the tools with their proper categories.</p>

      <h2 className={h2}>The Interactive Profile Advantage</h2>
      <p>Static files limit how you display your technical skills. A web profile allows you to create a dynamic layout. You can include links to live projects that prove your skills.</p>

      <p>Web profiles also allow search engines to crawl your content directly. If you host your profile on a public web link Google can index your skills. This makes you visible to recruiters searching the public web.</p>

      <p>Sharing a live link in your email applications shows technical maturity. The recruiter clicks the URL and views your interactive CV. This guarantees that your skills are displayed exactly as you designed them.</p>

      <h2 className={h2}>How Search Algorithms Score Relevance</h2>
      <p>Search engines use term frequency to score candidate profiles. If a skill only appears once in a list the system scores it low. If the skill appears multiple times in your work history the system scores it high.</p>

      <p>Write your core skills in multiple sections. Mention them in your summary. Include them in your job descriptions and list them in your skills section. This repetition signals deep expertise to the system.</p>

      <p>Do not repeat the words without context. Ensure every mention is part of a real achievement description. Repeating keywords without sentences will trigger spam filters and get your profile flagged.</p>

      <h2 className={h2}>Checking for Acronym Typos</h2>
      <p>A spelling error in an acronym prevents the crawler from indexing your skill. If you write AWSS instead of AWS the system will not find your profile. Double check every abbreviation before publishing.</p>

      <p>Verify the spelling of tool names. Some tools use custom capitalization like PostgreSQL or NextJS. While some parsers ignore case others require exact spelling to match database queries.</p>

      <p>Check the exact spacing of your acronyms. Writing Front End instead of Frontend or Dev Ops instead of DevOps can cause match failures. Choose the most common representation to maximize your index overlap.</p>

      <p>Use the plain text export check to verify spelling. Read through the text file to find typos. Ensuring your acronyms are correct is the easiest way to improve search visibility.</p>

      <p>In addition to search crawlers human interviewers will read your acronyms during technical interviews. If you cannot explain the full meaning of an acronym you list they will assume your skills are fake. Knowing the full terms builds immediate technical credibility.</p>

      <h2 className={h2}>Certifications and Vendor Exam Names</h2>
      <p>Cloud certifications use official names that parsers index separately from shorthand. AWS Solutions Architect Associate and Amazon Web Services SAA-C03 may appear as different strings in older databases. Write both the vendor name and the exam code on first mention.</p>

      <p>Security credentials follow the same rule. CISSP and Certified Information Systems Security Professional should appear together once in your certifications section. Recruiters searching for either form will then match your profile.</p>

      <p>Do not list expired certifications without the expiry date. An active badge with a 2026 renewal date signals current knowledge. A decade-old cert with no context looks like keyword stuffing and triggers skepticism in technical screens.</p>

      <div className={callout}>
        <h3 className={h3}>Match the job posting vocabulary</h3>
        <p>Before you submit, copy three technical terms from the job description verbatim. If they write Kubernetes and you only wrote K8s, add the full name once in your experience section. Mirroring their exact spelling costs thirty seconds and prevents silent filtering.</p>
      </div>

      <h2 className={h2}>Read Next</h2>
      <p>For more advice on keyword strategy and technical presentation read these detailed articles.</p>
      
      <p>
 Learn which keywords recruiters look for by reading <Link href="/keywords" className={link}>Best Keywords for Tech Jobs</Link>.
 </p>
      <p>
 Understand how recruiters scan your technical history by reading <Link href="/tech-keywords" className={link}>Mapping Visual Hierarchy for Technical Recruiters</Link>.
 </p>
      <p>
 Discover how to avoid listing fake details by reading <Link href="/trust" className={link}>Stop Faking Your Skills List</Link>.
 </p>
    </div>
  );
}
