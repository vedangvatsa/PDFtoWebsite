import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="flex flex-col gap-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        An engineering director scrolls through a heap of senior applications. 
        He has just finished a frustrating meeting about database scaling. 
        He needs someone who can take ownership of a crumbling system architecture without hand-holding.
      </p>
      <p>
        He reads the first summary. 
        It states that the candidate is a results-oriented leader who enjoys solving complex challenges. 
        It lists twenty different skills in a single long sentence. 
        He sighs and closes the browser window.
      </p>
      <p>
        Senior professionals often ruin their first impression with generic summaries. 
        They write about their passion for technology instead of showing their concrete achievements. 
        A strong technical summary must prove your engineering value in three sentences or less.
      </p>

      <h2 className={h2}>The Failure of Abstract Leadership Claims</h2>
      <p>
        Recruiters do not care if you describe yourself as a collaborative team player. 
        Every candidate writes the exact same description. 
        These words carry zero weight because they are impossible to verify.
      </p>
      <p>
        Hiring managers look for evidence of operational scale and systems ownership. 
        They want to know the size of the infrastructure you managed. 
        They need to see the complexity of the problems you solved.
      </p>
      <p>
        Replace abstract claims with hard engineering facts. 
        State the size of your engineering teams. 
        Describe the traffic volumes your systems handled. 
        This approach builds trust immediately.
      </p>
      <p>
        Self-praise raises red flags for senior reviewers. 
        They assume that candidates who use excessive buzzwords are hiding a lack of technical depth. 
        Let your metrics do the bragging for you.
      </p>

      <h2 className={h2}>The Three Sentence Summary Formula</h2>
      <p>
        A perfect senior summary follows a rigid three-sentence structure. 
        Each sentence has a specific job to do. 
        This formula eliminates fluff and presents your value clearly.
      </p>
      <p>
        Your first sentence must establish your scope and scale. 
        State your primary role and your years of experience. 
        Include a metric that shows the size of your system operations.
      </p>
      <p>
        Your second sentence should highlight your architectural expertise. 
        Explain a major system migration or redesign you completed. 
        Mention the core technologies you used to build it.
      </p>
      <p>
        Your third sentence must deliver a measurable engineering result. 
        Quantify how your work improved system speed or lowered costs. 
        Focus on variables like latency reductions or database optimizations.
      </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="A diagram explaining the three-sentence formula for writing technical summaries for senior roles.">
          <rect width="700" height="350" rx="12" className="fill-zinc-50 dark:fill-zinc-900/40" />
          
          {/* Box 1: Sentence 1 */}
          <rect x="50" y="40" width="600" height="75" rx="6" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="70" y="70" className="fill-zinc-900 dark:fill-zinc-100 font-bold text-sm font-sans">Sentence 1. Scope &amp; Operational Scale</text>
          <text x="70" y="95" className="fill-zinc-500 dark:fill-zinc-400 text-xs font-sans">Years of experience + primary engineering domain + system traffic metrics</text>

          {/* Box 2: Sentence 2 */}
          <rect x="50" y="135" width="600" height="75" rx="6" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="70" y="165" className="fill-zinc-900 dark:fill-zinc-100 font-bold text-sm font-sans">Sentence 2. Architectural Leadership</text>
          <text x="70" y="190" className="fill-zinc-500 dark:fill-zinc-400 text-xs font-sans">Major system migration or rebuild + specific core tools used</text>

          {/* Box 3: Sentence 3 */}
          <rect x="50" y="230" width="600" height="75" rx="6" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="70" y="260" className="fill-zinc-900 dark:fill-zinc-100 font-bold text-sm font-sans">Sentence 3. Quantitative Engineering Outcome</text>
          <text x="70" y="285" className="fill-zinc-500 dark:fill-zinc-400 text-xs font-sans">Performance speedups + cost reductions + database load improvements</text>
        </svg>
      </div>

      <h2 className={h2}>Quantifying Your Engineering Physics</h2>
      <p>
        Many senior developers struggle to find financial metrics. 
        They do not have access to sales data or company revenue. 
        This is not a problem for technical summaries.
      </p>
      <p>
        Focus on the physical limits of your systems. 
        Measure request rates, queue lengths, or server response times. 
        These technical metrics prove your capabilities directly to engineering managers.
      </p>
      <p>
        For instance, write about how you reduced database query times by sixty percent. 
        Mention how you scaled a pipeline to handle ten thousand requests per second. 
        These metrics show that you understand the mechanics of system load. 
        You can read more about this in our guide on <Link href="/impact" className={link}>quantifying impact without revenue numbers</Link>.
      </p>
      <p>
        Talk about the reduction in hardware resources. 
        Saving CPU cycles or memory allocation shows that you code efficiently. 
        It proves you can optimize applications at scale.
      </p>

      <div className={callout}>
        <p className={bold}>Example of a Strong Summary</p>
        <p className="mt-2">
          Senior infrastructure engineer with nine years of experience managing high-throughput cloud environments. 
          Designed and executed the migration of a core message queue system from RabbitMQ to Apache Kafka. 
          This change reduced data ingestion latency by fifty percent and eliminated message loss during peak traffic.
        </p>
      </div>

      <h2 className={h2}>Selecting Your Tech Stack Strategically</h2>
      <p>
        A senior summary should not be a dump of every technology you have touched. 
        If you list twenty tools, you dilute your core expertise. 
        The reader will assume you are a generalist who lacks depth.
      </p>
      <p>
        Select three or four core tools that define your specialty. 
        Include the languages and frameworks that match the roles you want next. 
        Leave the secondary tools for your specific job history bullet points.
      </p>
      <p>
        This strategy keeps your summary clean and readable. 
        It ensures that your primary skills stand out. 
        For more advice on keyword choices, read our article on <Link href="/keywords" className={link}>the best tech keywords</Link>.
      </p>
      <p>
        Hiring managers look for stack alignment. 
        If they need an expert in Go, seeing Go listed next to ten other unrelated languages raises doubts. 
        Make your primary alignment obvious.
      </p>

      <h2 className={h2}>How to Adapt Your Summary for Diverse Engineering Roles</h2>
      <p>
        Do not use the same summary for every job application. 
        A platform engineer needs a different pitch than a frontend developer. 
        Each role has unique priorities.
      </p>
      <p>
        Review the target job description to find the primary problems the team is facing. 
        If they mention server scaling issues, highlight your infrastructure wins. 
        If they highlight page performance, focus on your client-side speedups.
      </p>
      <p>
        Tweak your metrics to match their specific needs. 
        This does not mean making up achievements. 
        It means choosing the most relevant facts from your real career history.
      </p>

      <h2 className={h2}>The Visual Formatting of the Summary Block</h2>
      <p>
        Where you put your summary matters. 
        It must sit at the absolute top of your page. 
        It should be the first text block after your contact details.
      </p>
      <p>
        Use a slightly larger font size for the summary text. 
        Ensure there is generous whitespace surrounding the paragraph. 
        This formatting isolates the text and draws the eye.
      </p>
      <p>
        Avoid splitting your summary into bullet points. 
        Keep it as a cohesive paragraph of narrative prose. 
        This style separates it visually from the chronological experience lists below.
      </p>

      <h2 className={h2}>The Importance of Front Loading</h2>
      <p>
        Hiring managers scan documents in a Z-shaped pattern. 
        They look at the top left corner first, then sweep across the page. 
        You must put your most important details at the absolute beginning of your sentences.
      </p>
      <p>
        Do not start a sentence with introductory fluff. 
        Avoid phrases like "I was responsible for" or "My role involved." 
        Start immediately with strong nouns and action verbs.
      </p>
      <p>
        For example, write "Designed a serverless billing service" instead of "I was tasked with designing a system." 
        This style captures attention in the first three seconds of a scan. 
        It makes your writing feel direct and powerful.
      </p>

      <h2 className={h2}>Writing for the Automated Parser</h2>
      <p>
        Automated parsers search for nouns and active verbs. 
        They build a profile of your skills based on where keywords appear. 
        Having your primary skills in your summary boosts your ranking.
      </p>
      <p>
        Modern systems use natural language processing to extract skills. 
        The algorithms analyze the relationship between your tools and your achievements. 
        Bare keyword lists without grammatical context get flagged as low-quality.
      </p>
      <p>
        Ensure that every technical term is part of a complete sentence. 
        Using a web-based link ensures that parsers read your summary correctly. 
        It keeps your text structured without formatting glitches. 
        You can check our guide on <Link href="/bypass" className={link}>bypassing parser damage</Link> for more information.
      </p>

      <h2 className={h2}>Common Summary Mistakes to Purge</h2>
      <p>
        Never include personal objectives in your senior summary. 
        Hiring managers do not care about your personal learning goals. 
        They care about what you can do for their team.
      </p>
      <p>
        Avoid using passive language. 
        Do not write that you assisted with a project. 
        Describe your direct contribution and your specific ownership.
      </p>
      <p>
        Keep your summary short. 
        A wall of text will be ignored by busy reviewers. 
        Three lines of high-impact text are much stronger than a long page of fluff.
      </p>

      <h2 className={h2}>Testing Your Summary</h2>
      <p>
        Read your summary aloud. 
        If you run out of breath, your sentences are too long. 
        Break them into shorter statements.
      </p>
      <p>
        Show your summary to an engineering colleague. 
        Ask them if they can quickly identify your primary stack and your scale. 
        If they hesitate, you need to rewrite it.
      </p>
      <p>
        Your summary is your pitch. 
        Make sure it is sharp, readable, and backed by hard metrics.
      </p>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/objective" className={link}>Why you must drop the objective section</Link></li>
        <li><Link href="/scan" className={link}>Writing for the thirty-second recruiter scan</Link></li>
        <li><Link href="/tech-keywords" className={link}>Mapping visual hierarchy for technical roles</Link></li>
      </ul>
    </div>
  );
}
