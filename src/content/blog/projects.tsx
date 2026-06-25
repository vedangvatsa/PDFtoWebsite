import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="flex flex-col gap-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        An interviewer reviews a stack of portfolio links. 
        He clicks on the first project link. 
        It is a weather application built with React and a free weather API. 
        The repository contains the default boilerplate readme file and three basic components.
      </p>
      <p>
        He opens the second project. 
        It is a local todo app that saves list items to browser local storage. 
        He closes both tabs and sighs. 
        These projects do not show that the candidate can handle production systems.
      </p>
      <p>
        Personal projects are the best way to prove your skills when you lack commercial experience. 
        However, most developers build the wrong things. 
        They build tutorial projects that carry zero weight with hiring managers. 
        A strong project must demonstrate production-level engineering challenges.
      </p>

      <h2 className={h2}>The Low Signal Tutorial Trap</h2>
      <p>
        Bootcamps and online courses recommend building cloned web apps. 
        They tell students to build clones of Netflix, Spotify, or Twitter. 
        These projects are useless because everyone builds them.
      </p>
      <p>
        Hiring managers know that these apps are built by following video guides. 
        They do not prove that you can solve novel technical challenges. 
        They show that you can copy code from a screen.
      </p>
      <p>
        Worse, these projects lack real operational constraints. 
        A local database with five mock items has no scaling issues. 
        A static frontend with no active backend requires no deployment skills. 
        These apps fail to show that you understand the physics of software systems.
      </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="A diagram contrasting low-signal tutorial projects with production-grade personal projects.">
          <rect width="700" height="350" rx="12" className="fill-zinc-50 dark:fill-zinc-900/40" />
          
          <rect x="50" y="50" width="260" height="250" rx="8" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="2" />
          <text x="180" y="35" textAnchor="middle" className="fill-red-600 dark:fill-red-400 font-bold text-sm font-sans">Tutorial Projects (Rejected)</text>
          
          <rect x="70" y="80" width="220" height="35" rx="4" className="fill-zinc-100 dark:fill-zinc-800/80 stroke-zinc-200 dark:stroke-zinc-700" />
          <text x="180" y="102" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-xs font-mono">React Weather Clone</text>
          
          <rect x="70" y="130" width="220" height="35" rx="4" className="fill-zinc-100 dark:fill-zinc-800/80 stroke-zinc-200 dark:stroke-zinc-700" />
          <text x="180" y="152" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-xs font-mono">Local Storage Todo App</text>
          
          <text x="180" y="210" textAnchor="middle" className="fill-zinc-400 text-xs font-sans">Zero scale or deployment complexity</text>
          
          <circle cx="180" cy="255" r="18" className="fill-red-500/10 stroke-red-500" strokeWidth="2" />
          <path d="M 173 248 L 187 262 M 187 248 L 173 262" className="stroke-red-500" strokeWidth="2.5" />

          <rect x="390" y="50" width="260" height="250" rx="8" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="2" />
          <text x="520" y="35" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 font-bold text-sm font-sans">Production-Grade (Accepted)</text>
          
          <rect x="410" y="80" width="220" height="35" rx="4" className="fill-zinc-100 dark:fill-zinc-800/80 stroke-zinc-200 dark:stroke-zinc-700" />
          <text x="520" y="102" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-200 text-xs font-mono font-bold">Distributed Web Crawler</text>
          
          <rect x="410" y="130" width="220" height="35" rx="4" className="fill-zinc-100 dark:fill-zinc-800/80 stroke-zinc-200 dark:stroke-zinc-700" />
          <text x="520" y="152" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-200 text-xs font-mono font-bold">Custom Database Engine</text>
          
          <text x="520" y="210" textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-300 text-xs font-sans font-semibold">Active hosting + traffic + metrics</text>
          
          <circle cx="520" cy="255" r="18" className="fill-emerald-500/10 stroke-emerald-500" strokeWidth="2" />
          <path d="M 513 255 L 518 260 L 527 248" className="stroke-emerald-500" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      <h2 className={h2}>Characteristics of Production Grade Projects</h2>
      <p>
        A valuable personal project mimics a commercial software system. 
        It must be deployed to a live cloud provider. 
        It should handle real traffic, even if the user base is small.
      </p>
      <p>
        Deploy your project to AWS, GCP, or a platform like Fly.io. 
        Set up a real domain name with HTTPS enabled. 
        Configure basic logging and monitoring tools like Prometheus or Datadog.
      </p>
      <p>
        A live deployment with monitoring proves you can manage a real runtime environment — not just code that runs on localhost.
      </p>

      <h2 className={h2}>Selecting a Production Grade Tech Stack</h2>
      <p>
        Your project tech stack must reflect the jobs you want. 
        If you want to build backend APIs, do not build a project that uses static mock JSON files. 
        Use real database engines like PostgreSQL or Redis.
      </p>
      <p>
        Containerize your application using Docker. 
        Write a clean Dockerfile that builds a minimal production image. 
        Configure docker-compose configurations to orchestrate your application layers locally.
      </p>
      <p>
        Containerization signals you can ship code that runs consistently anywhere. Most junior developers skip this step entirely, which is exactly why it sets you apart.
      </p>

      <h2 className={h2}>Build Systems That Solve Real Scale Problems</h2>
      <p>
        Focus on backend architectures and database efficiency. 
        Build a distributed crawler that indexes web pages. 
        Create a custom query engine that parses structured files.
      </p>
      <p>
        Measure the speed and throughput of your applications. 
        Write about how your tool parses five gigabytes of data in under thirty seconds. 
        Document the database optimizations that lowered memory usage.
      </p>
      <p>
        Hard performance numbers make hiring managers lean forward. To see how to showcase code links effectively, visit our guide on <Link href="/code" className={link}>showing your code instead of listing skills</Link>.
      </p>

      <div className={callout}>
        <p className={bold}>Recommended Project Focus Areas</p>
        <p className="mt-2">
          Focus on building command line utilities, custom compiler tools, or high-performance APIs. 
          Deploy them to live servers. 
          Measure and document their performance variables under simulated load.
        </p>
      </div>

      <h2 className={h2}>Anatomy of an Engineering Readme</h2>
      <p>
        A great project with terrible documentation will be ignored. 
        Recruiters do not have time to build your project locally to see if it works. 
        They rely on your repository readme file to understand your achievements.
      </p>
      <p>
        Your readme file must act as an engineering brief. 
        Lead with a clear description of the problem your tool solves. 
        Include an architectural diagram showing how data flows through your components.
      </p>
      <p>
        Provide clean installation commands and usage examples. 
        Include a dedicated performance section detailing your benchmarking results. 
        This shows that you treat documentation as a core part of the engineering process.
      </p>
      <p>
        Detail the trade-offs you made during development. 
        Explain why you chose one database engine over another. 
        This demonstrates senior-level decision making.
      </p>

      <h2 className={h2}>Measuring System Metrics with Load Testing</h2>
      <p>
        Do not just guess how fast your system runs under load. 
        Run realistic load tests using tools like K6 or Locust. 
        Simulate hundreds of concurrent users hitting your API endpoints.
      </p>
      <p>
        Document how your application handles database connection pools during spikes. 
        Measure the p99 latency values under load. 
        Write down these metrics directly in your documentation.
      </p>
      <p>
        This level of testing shows that you write production-ready code. 
        It proves that you design systems that can survive real-world traffic conditions. 
        It is a massive signal to hiring directors.
      </p>

      <h2 className={h2}>Choosing the Right Repository Management Practices</h2>
      <p>
        Your repository structure tells a story about your working habits. 
        A single commit containing ten thousand lines of code is a warning sign. 
        It indicates that you copied the project from a tutorial.
      </p>
      <p>
        Commit your code in small and logical increments. 
        Write clear and descriptive commit messages that explain your changes. 
        Use branch systems and pull requests to merge new features.
      </p>
      <p>
        Clean git hygiene signals that you understand commercial workflows and can collaborate on large codebases — the kind of developer who does not need hand-holding on day one.
      </p>

      <h2 className={h2}>Handling Secrets and Environment Configuration</h2>
      <p>
        Security is a core requirement for production applications. 
        Never commit API keys or database passwords to public repositories. 
        Use environment variables to manage configuration values.
      </p>
      <p>
        Include a clean environment configuration template file in your repo. 
        Label it environment-template to guide other developers. 
        Explain how to set up the credentials safely.
      </p>
      <p>
        Getting security right on a personal project tells a hiring manager you will get it right on their production systems too.
      </p>

      <h2 className={h2}>Establishing User Feedback Loops</h2>
      <p>
        A deployed project is much more valuable when people actually use it. 
        Share your tool with other developers on GitHub or Reddit. 
        Gather their feedback and track the issues they report.
      </p>
      <p>
        Solve the bugs that users discover. 
        Document these bug fixes in your git history. 
        This shows that you can maintain an active codebase.
      </p>
      <p>
        Engineers who build tools that solve real problems for real users stand out immediately. That feedback loop — ship, listen, fix — is exactly what hiring teams want to see.
      </p>

      <h2 className={h2}>How to Link Projects on Your CV</h2>
      <p>
        Do not hide your project links at the bottom of your page. 
        Put them directly in your primary experience sections. 
        If you built a tool to solve a specific problem, present it like a job block.
      </p>
      <p>
        Link the title of the project to your live deployment URL. 
        Link the subtitle to the public repository. 
        This gives the reader immediate access to your proof.
      </p>
      <p>
        Web-based profiles allow you to insert rich interactive links. 
        Recruiters can navigate to your repositories in a single click. 
        You can read more about sharing links in our article on <Link href="/link" className={link}>resumes as web links</Link>.
      </p>

      <h2 className={h2}>Verifying Project Value Through Testing</h2>
      <p>
        Before putting a project on your CV, ensure it passes basic checks. 
        Ask a friend to run your installation script on a different machine. 
        If it crashes due to missing dependencies, fix your configuration files.
      </p>
      <p>
        Check the loading speed of your live deployment. 
        If your website takes ten seconds to boot due to cold starts, find a better hosting platform. 
        Recruiters will close the tab before the page renders.
      </p>
      <p>
        Review your code quality. 
        Ensure you remove temporary debug logs and messy comments. 
        Use a standard linter to clean up your formatting.
      </p>

      <h2 className={h2}>Common Portfolio Pitfalls to Avoid</h2>
      <p>
        Avoid listing too many minor projects. 
        Two high-impact projects are much better than ten simple widgets. 
        A long list of simple apps dilutes your best achievements.
      </p>
      <p>
        Never upload copy-paste code from classes. 
        Hiring managers recognize course boilerplates instantly. 
        If your repo history shows only one massive commit with no branch history, it raises doubts.
      </p>
      <p>
        Keep your projects updated. 
        A repository that has not been touched in three years signals that you stopped learning. 
        Regularly update your dependencies to show active maintenance.
      </p>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/code" className={link}>Proving technical skills with live software links</Link></li>
        <li><Link href="/degrees" className={link}>Why skills matter more than academic credentials</Link></li>
        <li><Link href="/keywords" className={link}>Selecting target keywords for engineering roles</Link></li>
      </ul>
    </div>
  );
}
