import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>Most people think of job searching as a thing humans do. You write a resume, you send it somewhere, a person reads it, and somebody calls you back or does not. That model worked for decades because the bottleneck was always on the employer side. Recruiters could only review so many PDFs per day, so candidates competed to land inside that limited attention window.</p>
        <p>That bottleneck is dissolving. In the past twelve months, a set of open protocols shipped that let software autonomously browse talent databases, compare candidates against job specs, and produce ranked shortlists. No human in the loop for the initial screen. The recruiter shows up after the shortlist is already built.</p>
        <p>If your professional identity is a PDF sitting in your downloads folder, these systems do not know you exist.</p>

        <h2 className={h2}>A Brief History of the 402 Status Code</h2>
        <p>When the architects of the early web designed HTTP in the 1990s, they reserved a status code that never got used. <span className={bold}>402 Payment Required.</span> The idea was that servers would eventually need a way to say &quot;this resource costs money, pay me first&quot; directly inside the protocol. But there was no internet-native money in 1995, so the code sat dormant for three decades.</p>
        <p>In May 2025, Coinbase finally activated it. Their x402 protocol turns that forgotten status code into a real payment rail. When an AI agent hits an API that requires payment, the server responds with a 402 and a price tag. The agent reads the price, signs a stablecoin transaction, retries the request with proof of payment attached, and gets the data. The whole exchange takes less than a second and costs a few cents.</p>
        <p>This matters for hiring because it removes the last friction point in machine-to-machine recruiting. Before x402, an AI agent that wanted to search a premium talent database needed a human to sign a contract, set up billing, and manage API keys. Now the agent just pays as it goes. No procurement cycle. No sales call. The agent has a wallet and a budget. It spends what it needs and stops.</p>

        <h2 className={h2}>The Three Protocols That Changed Recruiting</h2>
        <p>x402 handles the money. But two other protocols handle discovery and coordination, and together the three of them form something genuinely new.</p>
        <p><span className={bold}>Model Context Protocol</span> was built by Anthropic and gives AI agents a standardized way to connect to external data sources. Think of it like a universal adapter. An agent running on Claude or ChatGPT can plug into any database that exposes an MCP server and query it using natural language. &quot;Find senior React developers in Singapore with fintech backgrounds&quot; becomes a structured database query behind the scenes. The agent never needs to learn anyone&apos;s proprietary API.</p>
        <p><span className={bold}>Agent-to-Agent protocol</span>, from Google, lets agents delegate work to other agents. A recruiting agent finds a promising candidate and asks a verification agent to check their credentials. That verification agent asks a data agent to pull publication history from OpenAlex. The whole chain runs autonomously. Each agent is specialized. None of them need human supervision for the routine work.</p>
        <p>The <span className={bold}>x402 protocol</span> sits underneath both of these as the settlement layer. Whenever any agent in the chain hits a paid resource, x402 handles the transaction silently. The cost of searching a talent database, pulling a verified credential, checking a GitHub contribution graph. All micropayments, all automatic, all settled in USDC on Base.</p>
        <div className={callout}>
          <h3 className={h3}>Who is behind this</h3>
          <p>These are not side projects. The x402 Foundation operates under the Linux Foundation with backing from Google, AWS, Cloudflare, Visa, Mastercard, and Anthropic. MCP is an open standard with adoption from every major AI lab. A2A is backed by Google with over 60 partner organizations. The infrastructure is industrial grade.</p>
        </div>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 700 220" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Box 1: Hiring Manager */}
            <rect x="10" y="75" width="110" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="65" y="105" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Hiring Manager</text>
            <text x="65" y="122" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">types query</text>

            {/* Arrow 1→2 */}
            <line x1="120" y1="110" x2="155" y2="110" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="155,105 165,110 155,115" className="fill-zinc-400 dark:fill-zinc-500" />

            {/* Box 2: AI Agent */}
            <rect x="168" y="75" width="100" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="218" y="105" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">AI Agent</text>
            <text x="218" y="122" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">orchestrates</text>

            {/* Arrow 2→3 */}
            <line x1="268" y1="110" x2="303" y2="110" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="303,105 313,110 303,115" className="fill-zinc-400 dark:fill-zinc-500" />

            {/* Box 3: MCP Server */}
            <rect x="316" y="75" width="110" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="371" y="100" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">MCP Server</text>
            <text x="371" y="117" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">queries</text>
            <text x="371" y="132" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">talent DB</text>

            {/* Arrow 3→4 */}
            <line x1="426" y1="110" x2="461" y2="110" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="461,105 471,110 461,115" className="fill-zinc-400 dark:fill-zinc-500" />

            {/* Box 4: x402 Payment */}
            <rect x="474" y="75" width="90" height="70" rx="6" className="fill-amber-50 dark:fill-amber-900/30 stroke-amber-300 dark:stroke-amber-700" strokeWidth="1.5" />
            <text x="519" y="100" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">x402</text>
            <text x="519" y="117" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">micropayment</text>
            <text x="519" y="132" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-amber-600 dark:fill-amber-400">$0.02/query</text>

            {/* Arrow 4→5 */}
            <line x1="564" y1="110" x2="599" y2="110" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="599,105 609,110 599,115" className="fill-zinc-400 dark:fill-zinc-500" />

            {/* Box 5: Ranked Shortlist */}
            <rect x="612" y="75" width="80" height="70" rx="6" className="fill-emerald-50 dark:fill-emerald-900/30 stroke-emerald-400 dark:stroke-emerald-700" strokeWidth="1.5" />
            <text x="652" y="100" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Ranked</text>
            <text x="652" y="117" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Shortlist</text>
            <text x="652" y="134" textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Top 5</text>

            {/* Bottom label */}
            <text x="350" y="185" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Agent pays per query · Returns structured results</text>
          </svg>
        </div>

        <h2 className={h2}>What Actually Happens When an Agent Recruits</h2>
        <p>A hiring manager opens Claude and types a paragraph describing who they need. Something like &quot;I need a backend engineer who has actually shipped payments infrastructure, ideally someone who has worked at a Series B or later fintech in Southeast Asia, strong in Go or Rust, and I do not want anyone who has only done frontend and is trying to pivot.&quot;</p>
        <p>The agent parses this into structured requirements. It connects to every talent data source it has access to through MCP. It searches CVin.Bio, checks GitHub profiles, pulls academic records from OpenAlex. For data sources that charge per query, x402 handles the payment. A few cents per search. Maybe fifty cents for a full profile with verified credentials.</p>
        <p>Within minutes the agent produces a ranked list. Five candidates. Each one has a structured profile with skills represented as typed arrays, work history with real dates and company names, education with verified institutions. The agent did not &quot;read&quot; these profiles the way a person reads a resume. It compared structured data against structured requirements. There is no ambiguity, no guessing whether &quot;familiar with Go&quot; means two weeks or two years.</p>
        <p>The hiring manager reviews five profiles instead of two hundred applications. The recruiter did not post a job listing. They did not wait two weeks for applicants. They did not run keyword filters through an ATS. The agent went out and found people.</p>

        <h2 className={h2}>Why Your PDF Does Not Exist in This World</h2>
        <p>This is the part most people have not internalized yet. An AI agent operating through MCP and x402 never touches a PDF. It never downloads an email attachment. It never opens a Word document. These agents query structured databases and receive structured responses.</p>
        <p>Think about what your PDF resume actually is. It is a rendering of text laid out for a piece of paper. The visual arrangement is the product. But agents do not care about visual arrangement. They care about typed data. Is &quot;React&quot; in this person&apos;s skills array? How many years between their first and last senior engineering role? Does their education include a degree from an institution the agent recognizes?</p>
        <p>A PDF cannot answer any of these questions programmatically. It is a picture of text. An agent would need OCR to extract characters, natural language processing to guess what the characters mean, and heuristics to convert unstructured prose into typed fields. Every step introduces error. Every step is slower than just reading structured data from a database.</p>
        <div className={callout}>
          <h3 className={h3}>The real comparison</h3>
          <p>A structured web profile gives the agent <span className={bold}>your skills as a searchable array, your experience as typed objects with ISO dates, and your education as credential records with institution names.</span> There is nothing to parse. Nothing to guess. The agent compares your data against the job requirements the same way a database compares two rows in a table. Your beautiful Canva PDF with the gradient sidebar is not wrong. It is just invisible to this entire system.</p>
        </div>

        <h2 className={h2}>This Is Just SEO Again</h2>
        <p>If you were running a business in 2010 and your website was not indexed by Google, you were invisible to anyone who searched for your product. The businesses that understood this early optimized their sites with proper meta tags, semantic HTML, and structured data. The ones that did not lost a decade of organic discovery to competitors who did.</p>
        <p>The same dynamic is playing out right now with professional profiles. Candidates who publish structured, machine-readable profiles on the open web will get discovered by AI agents first. It is not more complicated than that. The agents are already running. The MCP server directories already list talent databases. The candidates in those databases are already getting surfaced.</p>
        <p>A machine-readable profile means your name, title, skills, work history, and education are published in a format that software can parse without guessing. Schema.org Person markup tells agents exactly who you are. Typed skills arrays let them filter by technology. Permanent URLs let them bookmark you and come back later when a matching role opens up.</p>
        <p>CVin.Bio builds this structured layer automatically for every profile. You upload your CV, and behind the human-readable page at <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">cvin.bio/yourname</code> there is schema.org markup, structured skills data, typed experience records, and an <Link href="/discover" className={link}>MCP server</Link> that lets any AI agent search the entire candidate database using natural language.</p>

        <h2 className={h2}>The Cost Structure That Makes This Inevitable</h2>
        <p>Traditional recruiting is extraordinarily expensive. A retained search firm takes 20 to 30 percent of first-year salary. A LinkedIn job post costs $300 to $500. Internal recruiters spend an average of 23 hours per hire. Technical roles take 42 days to fill on average.</p>
        <p>An AI agent with MCP access to three or four talent databases can produce a qualified shortlist in an afternoon. The total cost in x402 micropayments might be $10 to $20. Two cents per search query. Five cents per full profile. No invoices, no procurement, no enterprise sales cycle.</p>
        <p>This does not mean recruiters disappear. It means the first pass, the part where someone reads two hundred applications and picks fifteen to call, gets compressed from two weeks to two hours. The recruiter still does the interviews. The hiring manager still makes the final call. But the discovery phase, finding the right ten people to talk to, becomes an agent task.</p>
        <div className={callout}>
          <h3 className={h3}>Where the money goes</h3>
          <p>A company that currently pays a search firm $30,000 to fill a senior engineering role will eventually have an internal team that pays an AI agent $15 in micropayments to build the same shortlist. <span className={bold}>The $29,985 difference is why this shift is inevitable.</span> It is not about replacing humans. It is about eliminating the absurd cost of the initial search.</p>
        </div>

        <h2 className={h2}>What This Means For You</h2>
        <p>You do not need to understand stablecoins or HTTP status codes or protocol specifications. None of that is your problem. Your problem is simpler. You need to make sure your professional identity exists as structured data on the open web.</p>
        <p>Concretely that means getting off the PDF and onto a permanent URL with proper markup. It means making your skills explicit in a list, not buried in a narrative paragraph where an agent would have to guess what technologies you actually know. It means keeping your profile updated, because agents revisit data sources regularly and a profile touched this week ranks higher than one abandoned in 2024.</p>
        <p>And it means being present on platforms that agents already query. CVin.Bio exposes every profile through the Model Context Protocol. When an agent asks &quot;find me someone who knows TypeScript and has worked in healthcare&quot;, it searches our database directly. If your profile is there and your skills are tagged, you show up. If you are a PDF in someone&apos;s email, you do not.</p>
        <p>The hiring world is splitting quietly into two tracks. One track is the old one. Send PDF, wait, hear nothing, repeat. The other track runs on structured data, autonomous agents, and micropayment rails that did not exist eighteen months ago. The agents are already browsing. Whether they find you depends entirely on whether your profile is readable by machines or just readable by humans.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/attachments" className={link}>Why you should stop sending PDF resumes</Link></li>
          <li><Link href="/link" className={link}>Why a URL is the ultimate professional move</Link></li>
          <li><Link href="/bots" className={link}>How to beat smart AI resume bots</Link></li>
        </ul>
      </div>
  );
}
