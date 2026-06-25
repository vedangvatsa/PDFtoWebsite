import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="flex flex-col gap-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>An engineering manager opens a job opening for a backend developer. By the next morning five hundred applications populate the inbox. Instead of reading each file manually the manager uses a resume parser API to extract all data and rank candidates.</p>
      
      <p>Understanding these parsing systems is critical for applicants. Recruiters rely on automated tools to screen profiles. If your document fails to load into the API your application is hidden from view.</p>

      <p>If you understand how these parsers work, you can design a profile that survives them.</p>

      <h2 className={h2}>What is a Resume Parser API</h2>
      <p>A resume parser API is a service that converts unstructured documents into structured data. It accepts files in PDF or Word formats and extracts contact details, skills, and work history. The output is typically returned as JSON.</p>

      <p>These services use natural language processing to identify entities in your text. They recognize that a phrase like Python Developer represents a job title. They also identify dates to calculate your duration of employment.</p>

      <p>The structured data is then sent to a database. Recruiters use search dashboards to query this database. The search engine filters candidates by specific skills and years of experience.</p>

      <div className={callout}>
        <h3 className={h3}>API Classification Logic</h3>
        <p>Modern parsing engines classify skills into pre-defined taxonomies. If you use a rare tool name the API will map it to a broader category. Make sure to list the parent technology next to specific libraries.</p>
      </div>

      <h2 className={h2}>The Leading Parser APIs on the Market</h2>
      <p>Several technology companies build parsing systems for the recruitment market. Systems like Sovren and Affinda are widely used in enterprise portals. Other tools like HireAbility focus on multilingual support.</p>

      <p>Each parser has different strengths. Some excel at extracting details from complex layouts while others focus on speed. However all of them struggle with non standard headings and tables.</p>

      <p>Most applicant tracking systems integrate one of these APIs. You do not apply to a unique company portal. You apply to a database powered by one of these major providers.</p>

      <p>These APIs also categorize your skills into distinct tiers like primary skills and secondary skills. The categorizations are based on how frequently you mention a technology in your work history. You must mention your core skills in multiple jobs to ensure they are ranked as primary skills.</p>

      {/* SVG: Resume text → Parser JSON output showing extraction accuracy */}
      <div className="not-prose my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 420" className="w-full h-auto" role="img" aria-label="Side by side comparison of raw resume text versus the structured JSON that a parser API extracts, showing which fields are captured accurately and which are commonly lost">
          <style>{`
            .ps-title { font: 600 13px system-ui, sans-serif; }
            .ps-label { font: 500 11px system-ui, sans-serif; }
            .ps-small { font: 400 10px system-ui, sans-serif; }
            .ps-code { font: 500 9px 'SF Mono', 'Fira Code', monospace; }
            .ps-badge { font: 700 8px system-ui, sans-serif; letter-spacing: 0.05em; }
          `}</style>

          {/* Left: Raw Resume */}
          <text x="155" y="22" textAnchor="middle" className="ps-title fill-zinc-900 dark:fill-zinc-100">Raw Resume (PDF)</text>
          <rect x="15" y="36" width="310" height="360" rx="8" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1.5" />

          {/* Mock resume content */}
          <text x="30" y="60" className="ps-label fill-zinc-900 dark:fill-zinc-100" fontWeight="700">Sarah Chen</text>
          <text x="30" y="76" className="ps-small fill-zinc-500 dark:fill-zinc-400">sarah@email.com · (555) 123-4567</text>
          <text x="30" y="90" className="ps-small fill-zinc-500 dark:fill-zinc-400">San Francisco, CA · github.com/sarchen</text>

          <line x1="30" y1="100" x2="310" y2="100" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

          <text x="30" y="118" className="ps-badge fill-zinc-500 dark:fill-zinc-400">EXPERIENCE</text>

          <text x="30" y="136" className="ps-small fill-zinc-900 dark:fill-zinc-100" fontWeight="600">Senior Backend Engineer</text>
          <text x="30" y="150" className="ps-small fill-zinc-500 dark:fill-zinc-400">Acme Corp · Jan 2021 – Present</text>
          <text x="30" y="164" className="ps-small fill-zinc-600 dark:fill-zinc-400">• Rebuilt payment API handling $4M daily</text>
          <text x="30" y="178" className="ps-small fill-zinc-600 dark:fill-zinc-400">• Migrated from PostgreSQL to CockroachDB</text>
          <text x="30" y="192" className="ps-small fill-zinc-600 dark:fill-zinc-400">• Reduced p99 latency from 800ms to 120ms</text>

          <text x="30" y="214" className="ps-small fill-zinc-900 dark:fill-zinc-100" fontWeight="600">Software Engineer</text>
          <text x="30" y="228" className="ps-small fill-zinc-500 dark:fill-zinc-400">StartupX · Mar 2018 – Dec 2020</text>
          <text x="30" y="242" className="ps-small fill-zinc-600 dark:fill-zinc-400">• Built REST APIs with Go and gRPC</text>
          <text x="30" y="256" className="ps-small fill-zinc-600 dark:fill-zinc-400">• Deployed services on K8s clusters</text>

          <line x1="30" y1="270" x2="310" y2="270" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

          <text x="30" y="288" className="ps-badge fill-zinc-500 dark:fill-zinc-400">SKILLS</text>
          <text x="30" y="304" className="ps-small fill-zinc-600 dark:fill-zinc-400">Go · Python · PostgreSQL · Redis · Docker</text>
          <text x="30" y="318" className="ps-small fill-zinc-600 dark:fill-zinc-400">Kubernetes · gRPC · AWS · Terraform</text>

          <line x1="30" y1="330" x2="310" y2="330" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

          <text x="30" y="348" className="ps-badge fill-zinc-500 dark:fill-zinc-400">EDUCATION</text>
          <text x="30" y="364" className="ps-small fill-zinc-900 dark:fill-zinc-100" fontWeight="600">B.S. Computer Science</text>
          <text x="30" y="378" className="ps-small fill-zinc-500 dark:fill-zinc-400">UC Berkeley · 2018</text>

          {/* Arrow between panels */}
          <text x="345" y="200" textAnchor="middle" className="ps-title fill-zinc-400 dark:fill-zinc-500">→</text>
          <text x="345" y="218" textAnchor="middle" className="ps-badge fill-zinc-400 dark:fill-zinc-500">PARSER</text>
          <text x="345" y="230" textAnchor="middle" className="ps-badge fill-zinc-400 dark:fill-zinc-500">API</text>

          {/* Right: JSON Output */}
          <text x="530" y="22" textAnchor="middle" className="ps-title fill-emerald-600 dark:fill-emerald-400">Extracted JSON Output</text>
          <rect x="375" y="36" width="310" height="360" rx="8" className="fill-zinc-900 dark:fill-zinc-950 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1.5" />

          {/* JSON content */}
          <text x="390" y="58" className="ps-code fill-zinc-500">{'{'}</text>

          <text x="400" y="74" className="ps-code fill-violet-400">"name"</text>
          <text x="437" y="74" className="ps-code fill-zinc-500">:</text>
          <text x="447" y="74" className="ps-code fill-emerald-400">"Sarah Chen"</text>
          <text x="590" y="74" className="ps-badge fill-emerald-500">✓ CORRECT</text>

          <text x="400" y="90" className="ps-code fill-violet-400">"email"</text>
          <text x="441" y="90" className="ps-code fill-zinc-500">:</text>
          <text x="451" y="90" className="ps-code fill-emerald-400">"sarah@email.com"</text>
          <text x="590" y="90" className="ps-badge fill-emerald-500">✓ CORRECT</text>

          <text x="400" y="106" className="ps-code fill-violet-400">"location"</text>
          <text x="456" y="106" className="ps-code fill-zinc-500">:</text>
          <text x="466" y="106" className="ps-code fill-emerald-400">"San Francisco, CA"</text>
          <text x="590" y="106" className="ps-badge fill-emerald-500">✓ CORRECT</text>

          <text x="400" y="128" className="ps-code fill-violet-400">"experience"</text>
          <text x="472" y="128" className="ps-code fill-zinc-500">: [</text>
          <text x="410" y="144" className="ps-code fill-zinc-500">{'{'}</text>
          <text x="420" y="160" className="ps-code fill-violet-400">"title"</text>
          <text x="454" y="160" className="ps-code fill-zinc-500">:</text>
          <text x="464" y="160" className="ps-code fill-emerald-400">"Senior Backend Eng"</text>
          <text x="420" y="176" className="ps-code fill-violet-400">"company"</text>
          <text x="470" y="176" className="ps-code fill-zinc-500">:</text>
          <text x="480" y="176" className="ps-code fill-emerald-400">"Acme Corp"</text>
          <text x="420" y="192" className="ps-code fill-violet-400">"start"</text>
          <text x="456" y="192" className="ps-code fill-zinc-500">:</text>
          <text x="466" y="192" className="ps-code fill-emerald-400">"2021-01"</text>
          <text x="590" y="192" className="ps-badge fill-emerald-500">✓ PARSED</text>
          <text x="420" y="208" className="ps-code fill-violet-400">"end"</text>
          <text x="448" y="208" className="ps-code fill-zinc-500">:</text>
          <text x="458" y="208" className="ps-code fill-amber-400">null</text>
          <text x="530" y="208" className="ps-badge fill-amber-400">CURRENT ROLE</text>
          <text x="410" y="224" className="ps-code fill-zinc-500">{'}'}</text>

          <text x="400" y="246" className="ps-code fill-violet-400">"skills"</text>
          <text x="440" y="246" className="ps-code fill-zinc-500">: {'{'}</text>
          <text x="420" y="262" className="ps-code fill-violet-400">"primary"</text>
          <text x="468" y="262" className="ps-code fill-zinc-500">:</text>
          <text x="478" y="262" className="ps-code fill-emerald-400">["Go","Python"]</text>
          <text x="420" y="278" className="ps-code fill-violet-400">"secondary"</text>
          <text x="482" y="278" className="ps-code fill-zinc-500">:</text>
          <text x="492" y="278" className="ps-code fill-emerald-400">["Docker"]</text>
          <text x="420" y="294" className="ps-code fill-violet-400">"missed"</text>
          <text x="464" y="294" className="ps-code fill-zinc-500">:</text>
          <text x="474" y="294" className="ps-code fill-red-400">["gRPC","K8s"]</text>
          <text x="590" y="294" className="ps-badge fill-red-400">✗ LOST</text>
          <text x="410" y="310" className="ps-code fill-zinc-500">{'}'}</text>

          <text x="400" y="330" className="ps-code fill-violet-400">"education"</text>
          <text x="470" y="330" className="ps-code fill-zinc-500">:</text>
          <text x="480" y="330" className="ps-code fill-emerald-400">"B.S. CS, UC Berkeley"</text>
          <text x="590" y="330" className="ps-badge fill-emerald-500">✓ CORRECT</text>

          <text x="400" y="350" className="ps-code fill-violet-400">"years_exp"</text>
          <text x="470" y="350" className="ps-code fill-zinc-500">:</text>
          <text x="480" y="350" className="ps-code fill-emerald-400">7</text>
          <text x="590" y="350" className="ps-badge fill-emerald-500">✓ COMPUTED</text>

          <text x="390" y="370" className="ps-code fill-zinc-500">{'}'}</text>

          {/* Bottom insight */}
          <text x="350" y="408" textAnchor="middle" className="ps-small fill-zinc-500 dark:fill-zinc-400">Abbreviations like "K8s" and "gRPC" are often missed · Always write full names alongside short forms</text>
        </svg>
      </div>

      <h2 className={h2}>How Recruiters Search Parsed Data</h2>
      <p>Recruiters do not read raw JSON files. They use graphical dashboards to filter candidates based on job requirements. They enter specific queries for programming languages and minimum years of experience.</p>

      <p>The system searches the database for matching profiles. If a parser failed to identify your database skills your profile will not appear in the results. The system simply does not know you possess those skills.</p>

      <p>Recruiters also search for tenure. They filter for candidates who stayed at their last job for more than two years. Accurate date extraction is key to surviving this filter.</p>

      <h2 className={h2}>Key Factors in Parser Scoring</h2>
      <p>Most database platforms assign a match score to each candidate profile. This score is calculated by comparing your skills list to the job description. The system ranks profiles by this percentage score.</p>

      <p>The score depends on the context of your skills. An API scores a skill higher if it appears in your recent job description. If a skill only appears in a footer list the score is lower.</p>

      <p>Many systems calculate a relevance index based on proximity. If your skills are grouped closely to the job title the index score increases. Placing unrelated experience between your target role and your skills list will reduce your overall rating.</p>

      <p>To improve your score you must write about your skills inside your work history bullets. Explain how you used each tool to solve a specific problem. This context signals deep expertise to the parser.</p>

      <h2 className={h2}>Optimizing Your Profile for API Scoring</h2>
      <p>You can optimize your document by following standard structure guidelines. Avoid using columns or sidebar sections. Sidebars often cause the extraction tool to read text out of order.</p>

      <p>Use simple headers that match the parser dictionary. Standard names like Experience and Education are safe anchors. They help the system identify where sections start and end.</p>

      <p>Verify that all dates use standard numeric formats or full month names. Using unusual formats like Roman numerals or seasonal descriptions will prevent the API from calculating your experience. Use standard formatting to avoid scoring errors.</p>

      <p>Avoid placing dates next to unrelated text. Keep dates on the same line as your job title. This close proximity helps the system associate the date with the correct role.</p>

      <h2 className={h2}>The Pitfall of AI Profile Summarizers</h2>
      <p>Some newer parsing systems use large language models to summarize candidate files. These systems write a short bio of your skills for the recruiter. While this sounds helpful it introduces bias.</p>

      <p>The language model might misinterpret your achievements or leave out important details. It might ignore a project because it does not fit the model expectations. You must keep your text clear to guide the summarizer.</p>

      <p>Use simple language instead of complex descriptions. Avoid using passive voice or long paragraphs. Concise writing ensures the summarizer captures your core strengths.</p>

      <h2 className={h2}>The Web Link Alternative to API Parsing</h2>
      <p>If you want to bypass API extraction errors you can use a web link. Host your profile as a responsive web page. This guarantees that your layout remains intact.</p>

      <p>You can share this link directly with recruiters. When a hiring manager clicks the URL they view your profile in their browser. They read your original layout instead of a parsed database record.</p>

      <p>A web profile link is a great addition to your application. It provides a visual copy of your achievements that cannot be corrupted by databases. This ensures you make a great first impression on human readers.</p>

      <h2 className={h2}>Testing Your CV Against Parser APIs</h2>
      <p>You can test your document using online demo tools from major parser API providers. Many companies offer free trial accounts on their websites. Upload your file to see the extracted JSON data.</p>

      <p>Inspect the output file for errors or missing sections. If the parser missed your database skills rewrite the skills section. Test the document again until the JSON output is perfect.</p>

      <p>This testing process reveals the weaknesses of your document layout. It helps you fix formatting bugs before they affect your applications. A parsed document is the key to landing more interviews.</p>

      <h2 className={h2}>Read Next</h2>
      <p>To understand more about automated screening systems check out these helpful guides.</p>
      
      <p>
        Learn how artificial intelligence is changing recruitment by reading <Link href="/ai" className={link}>AI Agents Are Already Browsing Your Profile</Link>.
      </p>
      <p>
        Discover how to bypass automated screeners by reading <Link href="/bots" className={link}>How to Beat Smart AI Bots</Link>.
      </p>
      <p>
        Understand visual scanning patterns by reading <Link href="/tech-keywords" className={link}>Mapping Visual Hierarchy for Technical Recruiters</Link>.
      </p>
    </div>
  );
}
