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

      {/* SVG Diagram showing Search Crawler Parsing Pipeline */}
      <div className="not-prose my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Diagram of Search Crawler Parsing Pipeline">
          <rect width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-900/30" />
          
          {/* Box 1 */}
          <rect x="30" y="60" width="180" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" />
          <text x="120" y="95" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-100 font-semibold" fontSize="13">Search Query</text>
          <text x="120" y="115" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="11">Amazon Web Services</text>

          {/* Connection 1 */}
          <line x1="210" y1="95" x2="270" y2="95" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
          <text x="262" y="100" className="fill-zinc-400 dark:fill-zinc-500 font-semibold" fontSize="16">→</text>

          {/* Box 2 */}
          <rect x="280" y="60" width="180" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" />
          <text x="370" y="95" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-100 font-semibold" fontSize="13">Acronym Expansion</text>
          <text x="370" y="115" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="11">AWS OR Amazon Web Services</text>

          {/* Connection 2 */}
          <line x1="370" y1="130" x2="370" y2="190" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
          <text x="365" y="185" className="fill-zinc-400 dark:fill-zinc-500 font-semibold" fontSize="16" transform="rotate(90 370 185)">→</text>

          {/* Box 3 */}
          <rect x="280" y="200" width="180" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" />
          <text x="370" y="235" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-100 font-semibold" fontSize="13">Database Index Scan</text>
          <text x="370" y="255" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="11">Searches CV contents</text>

          {/* Connection 3 */}
          <line x1="460" y1="235" x2="520" y2="235" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
          <text x="512" y="240" className="fill-zinc-400 dark:fill-zinc-500 font-semibold" fontSize="16">→</text>

          {/* Box 4 */}
          <rect x="530" y="200" width="140" height="70" rx="6" className="fill-emerald-50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-900" strokeWidth="2" />
          <text x="600" y="235" textAnchor="middle" className="fill-emerald-900 dark:fill-emerald-300 font-semibold" fontSize="13">Match Score</text>
          <text x="600" y="255" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400" fontSize="11">Profile is selected</text>
        </svg>
      </div>

      <h2 className={h2}>Positioning Technical Terms in Context</h2>
      <p>Classifiers do not only look for words. They also analyze where the words are placed in your document structure. Keywords in your job experience carry more weight than keywords in a generic list.</p>

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
