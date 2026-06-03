// === ARTICLE: best-portfolio-platforms-developers ===
// {
//   slug: 'best-portfolio-platforms-developers',
//   title: 'Best Portfolio Platforms for Developers',
//   excerpt: 'Seven real options for showing your work online, from free GitHub Pages to a fully custom domain. Here is what each one actually does well.',
//   date: 'Jun 04, 2026',
//   faqs: [
//     { question: 'What is the best free portfolio platform for developers?', answer: 'GitHub Pages is completely free and works well if you already have public repos. For something more polished without writing code, ReadCV or CVin.Bio both offer free tiers with clean layouts.' },
//     { question: 'Do I need a custom domain for my developer portfolio?', answer: 'No. A custom domain looks professional but it is not required. A clean URL on any reputable platform works fine. What matters more is that the content is up to date and easy to read.' },
//     { question: 'Should I build my portfolio site from scratch?', answer: 'Only if you enjoy frontend work and want the site itself to be a portfolio piece. Otherwise the time spent building and maintaining a custom site could go toward actual projects that demonstrate your skills.' },
//   ],
//   author: {
//     name: 'Priya K.',
//     avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'
//   },
//   content: (
//     <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
//
//       <p>Every developer needs a place to show their work. The problem is not a lack of options. The problem is too many options, and most of them are built for different kinds of people.</p>
//       <p>A frontend engineer who loves building UIs will be happy deploying a custom React site on Vercel. A backend developer who just wants a clean page with project links needs something simpler. Picking the wrong tool means you either spend weeks on your portfolio instead of coding, or you end up with a page that does not represent you well.</p>
//       <p>Here are seven real options. For each one, I will tell you what it does well, where it falls short, and who should actually use it.</p>
//
//       <h2 className={h2}>1. GitHub Pages</h2>
//       <p><span className={bold}>Best for:</span> Developers who want something free and already live on GitHub.</p>
//       <p>GitHub Pages lets you host a static site directly from a repo. If you have public repositories with good READMEs, your GitHub profile already works as a rough portfolio. Adding a Pages site on top gives you a landing page at <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">username.github.io</code>.</p>
//       <p>The upside is obvious: it is free, it lives where your code already lives, and recruiters who check your GitHub will find it naturally. The downside is that you are responsible for the design, the layout, and keeping it updated. Most GitHub Pages sites end up as plain markdown or a template that has not been touched in two years.</p>
//       <p>If you want to <Link href="/show-your-code" className={link}>show your code as proof of work</Link>, GitHub Pages is a natural fit. Just make sure the site itself does not look abandoned.</p>
//
//       <h2 className={h2}>2. Vercel or Netlify</h2>
//       <p><span className={bold}>Best for:</span> Frontend developers who want a custom site that doubles as a project.</p>
//       <p>Vercel and Netlify let you deploy a React, Next.js, or any static site with a single push. The developer experience is excellent. You get instant previews, automatic deploys from Git, and free SSL on a custom domain.</p>
//       <p>The catch is that you need to build the site first. That means choosing a framework, designing layouts, writing CSS, and maintaining it over time. For a frontend developer, the portfolio site itself is a showcase of your skills. For everyone else, it is a time sink that pulls you away from work that actually matters to employers.</p>
//       <div className={callout}>
//         <h3 className={h3}>When building your own site makes sense</h3>
//         <p>If you are applying for frontend or full-stack roles, a well-built personal site on Vercel shows that you can ship. If you are a backend or data engineer, your time is better spent on something that highlights your actual domain.</p>
//       </div>
//
//       <h2 className={h2}>3. Notion</h2>
//       <p><span className={bold}>Best for:</span> Anyone who needs something online in 30 minutes.</p>
//       <p>Notion pages can be published publicly with one click. You already know the editor. You can drop in text, links, images, and toggles without touching any code. It is the fastest way to get a portfolio online.</p>
//       <p>The tradeoff is that it looks like a Notion page. Every Notion portfolio has the same structure, the same fonts, and the same constraints. There is no custom domain on the free plan. And Notion pages load slowly, which matters when a recruiter clicks your link and waits for the spinner.</p>
//       <p>Use Notion as a stopgap. Get something online today, then move to a better home when you have time.</p>
//
//       <h2 className={h2}>4. LinkedIn</h2>
//       <p><span className={bold}>Best for:</span> Being findable by recruiters who search LinkedIn all day.</p>
//       <p>Everyone has a LinkedIn profile. That is both its strength and its limitation. Recruiters search LinkedIn constantly, so having a complete profile there is non-negotiable. But LinkedIn forces your work into its rigid format. You cannot control the layout, the visual hierarchy, or how your projects are displayed.</p>
//       <p>LinkedIn is great for discovery but bad for differentiation. Two developers with similar experience look nearly identical on LinkedIn. You need somewhere else to show what makes your work different. Think of LinkedIn as the directory listing and your portfolio as the actual storefront.</p>
//
//       <h2 className={h2}>5. ReadCV</h2>
//       <p><span className={bold}>Best for:</span> Designers and creative developers who want a clean, visual profile.</p>
//       <p>ReadCV gives you a beautiful one-page profile with a curated feel. The design is minimal and polished. You can add project cards with images, which works well if your work has a visual component.</p>
//       <p>The limitation is that ReadCV leans heavily toward design portfolios. If your best work is a distributed system or a CLI tool, ReadCV does not give you a great way to present that. It also does not generate structured data that machines can parse, which matters more every year as <Link href="/ai-agents-browsing-resume" className={link}>AI agents start browsing candidate profiles</Link> programmatically.</p>
//
//       <h2 className={h2}>6. CVin.Bio</h2>
//       <p><span className={bold}>Best for:</span> Developers who want a professional profile that works for both humans and machines.</p>
//       <p>CVin.Bio turns your resume into a hosted web profile at a clean URL like <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">cvin.bio/yourname</code>. You upload your existing CV and it builds a responsive page with your experience, skills, and projects structured as proper data.</p>
//       <p>The thing that sets it apart is the machine-readable layer. Behind the page you see, there is schema.org markup and structured data that AI agents and ATS systems can parse directly. Your skills show up as a typed array, not words buried in a paragraph. This is the same idea behind putting a <Link href="/cv-web-link" className={link}>URL on your resume instead of a file</Link>.</p>
//       <p>The downside is that it is less customizable than a fully custom site. You are working within a template, not building from scratch. If you want pixel-level control over every element, this is not the right tool. But if you want a professional profile that is always current and readable by both recruiters and software, it does that well.</p>
//
//       <h2 className={h2}>7. Your Own Domain</h2>
//       <p><span className={bold}>Best for:</span> Developers who want maximum control and long-term ownership.</p>
//       <p>Buying a domain like <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">janedoe.dev</code> and building whatever you want gives you complete freedom. You own the URL forever. You can redesign it whenever you want. You can add a blog, case studies, interactive demos, or anything else.</p>
//       <p>The cost is maintenance. Domains expire. SSL certificates need renewing. Hosting needs monitoring. The design needs updating. Most personal developer sites go through a cycle: excited launch, six months of neglect, guilt, another redesign, more neglect. Be honest with yourself about whether you will keep it updated.</p>
//       <div className={callout}>
//         <h3 className={h3}>The maintenance test</h3>
//         <p>Before you buy a domain and build a custom site, ask yourself: did you update your LinkedIn profile in the last three months? If the answer is no, a custom site will not get updated either. Start with something that requires less upkeep and graduate to a custom domain when you have the habit.</p>
//       </div>
//
//       <h2 className={h2}>Which One Should You Pick?</h2>
//       <p>There is no single right answer. But here is a simple way to decide.</p>
//       <p>If you are a frontend developer who enjoys building UIs, go with Vercel or Netlify and make the site itself a portfolio piece. If you are a backend, DevOps, or data person who just needs a professional presence online, use CVin.Bio or ReadCV and spend your time on actual projects instead. If you are just starting out and need something online today, publish a Notion page and upgrade later.</p>
//       <p>The biggest mistake is spending so long choosing a platform that you never publish anything. A live page with three good projects beats a planned custom site that never ships.</p>
//
//       <div className={callout}>
//         <h3 className={h3}>The real portfolio is the work</h3>
//         <p>No platform fixes weak projects. The platform is just a frame. If you want to stand out, <Link href="/show-your-code" className={link}>show real code and real results</Link>. The portfolio platform just needs to stay out of the way and present your work clearly.</p>
//       </div>
//
//       <h2 className={h2}>Read Next</h2>
//       <ul className={ul}>
//         <li><Link href="/show-your-code" className={link}>How to show your code on a resume</Link></li>
//         <li><Link href="/cv-web-link" className={link}>Why a URL is the best way to share your resume</Link></li>
//         <li><Link href="/ai-agents-browsing-resume" className={link}>AI agents are already browsing your resume</Link></li>
//       </ul>
//     </div>
//   )
// }
// === END ===

// === ARTICLE: best-resume-keywords-tech ===
// {
//   slug: 'best-resume-keywords-tech',
//   title: 'Best Resume Keywords for Tech Jobs',
//   excerpt: 'The right keywords get you past the filter. The wrong ones make you look like you copied a job posting. Here is what actually matters by role in 2026.',
//   date: 'Jun 04, 2026',
//   faqs: [
//     { question: 'How many keywords should I put on a tech resume?', answer: 'There is no magic number. Focus on 8 to 12 technologies you have actually used in production. Each one should appear in context within your experience section, not just in a skills list at the top.' },
//     { question: 'Should I list every technology I have ever touched?', answer: 'No. A long list of 30 technologies signals that you are a generalist who is not deep in anything. Hiring managers want to see depth. Pick the skills that match the role and show real experience with them.' },
//     { question: 'Do ATS systems still scan for exact keyword matches?', answer: 'Most modern ATS systems use some form of semantic matching, so they can recognize that React.js and ReactJS are the same thing. But older systems still do exact matching, so use the most common spelling of each technology name.' },
//   ],
//   author: {
//     name: 'Marcus W.',
//     avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
//   },
//   content: (
//     <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
//
//       <p>Keywords are how software finds you. When a recruiter searches their ATS for &quot;React TypeScript&quot;, your resume either shows up or it does not. There is no partial credit.</p>
//       <p>But listing every technology under the sun backfires too. A resume stuffed with 40 keywords looks like spam to a human reader, and modern AI screening tools can tell the difference between a keyword dropped into a skills list and a keyword backed by real experience. The goal is to pick the right words and put them in the right places.</p>
//       <p>Here is what matters by role in 2026, which keywords are gaining weight, and which ones are losing relevance.</p>
//
//       <h2 className={h2}>Frontend Keywords</h2>
//       <p><span className={bold}>High signal in 2026:</span> React, TypeScript, Next.js, Tailwind CSS, Vite, React Server Components, Zustand, Playwright, Web Components.</p>
//       <p>React still dominates frontend hiring. But in 2026, saying &quot;React&quot; alone is not enough. Hiring managers expect you to specify what flavor: are you writing client-side SPAs, or are you building with React Server Components in Next.js? The distinction matters because the skills are different.</p>
//       <p>TypeScript is no longer optional. Job postings that say &quot;JavaScript&quot; almost always mean &quot;TypeScript in practice.&quot; If you list JavaScript without TypeScript, it reads as outdated.</p>
//       <p><span className={bold}>Losing weight:</span> jQuery (unless you are maintaining legacy code), Webpack (replaced by Vite in most new projects), Redux (Zustand and React context have taken over for most use cases), Sass (Tailwind has eaten this market).</p>
//       <div className={callout}>
//         <h3 className={h3}>Placement over count</h3>
//         <p>Listing &quot;React&quot; in your skills section is worth less than writing &quot;Built a patient intake form in React with server-side validation that reduced submission errors by 40%.&quot; The keyword lands harder when it is tied to a result. Read more about <Link href="/tech-resume-keywords" className={link}>where to place keywords on your resume</Link> for maximum impact.</p>
//       </div>
//
//       <h2 className={h2}>Backend Keywords</h2>
//       <p><span className={bold}>High signal in 2026:</span> Node.js, Python, Go, Rust, PostgreSQL, Redis, GraphQL, gRPC, event-driven architecture, microservices.</p>
//       <p>Python and Node.js are the two biggest backend ecosystems by job volume. Go is growing fast at infrastructure-heavy companies. Rust shows up in performance-sensitive roles at companies like Cloudflare, Discord, and Figma.</p>
//       <p>For databases, PostgreSQL has become the default choice for new projects. If you know Postgres well, say so explicitly. Listing &quot;SQL&quot; alone is too vague. Hiring managers want to know which database you used and what kind of queries you wrote.</p>
//       <p><span className={bold}>Losing weight:</span> PHP (still has jobs but declining demand), MongoDB (its hype peaked years ago, though it is still widely used), Express.js alone without any larger framework context, SOAP APIs.</p>
//
//       <h2 className={h2}>DevOps and Infrastructure</h2>
//       <p><span className={bold}>High signal in 2026:</span> Docker, Kubernetes, Terraform, AWS (with specific services like ECS, Lambda, RDS), GitHub Actions, ArgoCD, Datadog, Pulumi.</p>
//       <p>Generic cloud experience is not enough anymore. Saying &quot;AWS&quot; is like saying &quot;I know computers.&quot; Specify the services: &quot;Managed ECS clusters serving 50k requests per minute&quot; tells a different story than &quot;Experience with AWS.&quot;</p>
//       <p>Terraform is the standard for infrastructure as code. If you also know Pulumi, mention it because the TypeScript-based approach is gaining adoption. For CI/CD, GitHub Actions has become the default for most teams, so list it by name rather than just saying &quot;CI/CD pipelines.&quot;</p>
//       <p><span className={bold}>Losing weight:</span> Jenkins (still common but seen as legacy), Ansible for cloud provisioning (Terraform won), Heroku (the free tier shutdown hurt its mindshare), Chef and Puppet.</p>
//
//       <h2 className={h2}>Data Engineering Keywords</h2>
//       <p><span className={bold}>High signal in 2026:</span> SQL, Python, dbt, Apache Spark, Airflow, Snowflake, BigQuery, Kafka, Databricks, Delta Lake.</p>
//       <p>SQL is the one keyword that never loses relevance in data roles. But again, be specific. &quot;Wrote complex analytical queries in BigQuery processing 2TB daily&quot; says more than &quot;proficient in SQL.&quot;</p>
//       <p>dbt has become the standard for data transformation. If you work in analytics engineering and do not mention dbt, you look out of touch. Spark and Kafka still matter for large-scale processing, but make sure you mention the scale you worked at. Running Spark on a laptop for a tutorial is different from managing Spark jobs processing billions of events.</p>
//       <p><span className={bold}>Losing weight:</span> Hadoop (replaced by Spark and cloud-native tools), Hive (absorbed into other tools), Informatica and SSIS (enterprise ETL tools that younger companies avoid), Tableau as a primary skill (it is still useful but BI tools are now table stakes).</p>
//
//       <h2 className={h2}>AI and ML Keywords</h2>
//       <p><span className={bold}>High signal in 2026:</span> PyTorch, fine-tuning, RAG (retrieval-augmented generation), prompt engineering, LangChain, vector databases, RLHF, model evaluation, MLOps, Hugging Face.</p>
//       <p>The AI/ML keyword landscape shifted dramatically in the last two years. Before 2024, the important keywords were TensorFlow, scikit-learn, and feature engineering. Those still matter for traditional ML roles, but the market has moved toward large language models.</p>
//       <p>If you work with LLMs, say so directly. Mention whether you are fine-tuning, building RAG pipelines, doing prompt engineering, or evaluating model outputs. These are distinct skills and hiring managers know the difference.</p>
//       <p><span className={bold}>Losing weight:</span> TensorFlow (still used but PyTorch won the research and startup market), Keras (absorbed into TensorFlow), basic scikit-learn without production context, &quot;machine learning&quot; as a standalone keyword without specifics.</p>
//
//       <h2 className={h2}>The Keyword Stuffing Trap</h2>
//       <p>There is a temptation to list every keyword from the job posting. Do not do this. Modern <Link href="/beat-smart-ai-bots" className={link}>AI-powered screening tools</Link> check whether your keywords appear in context. If &quot;Kubernetes&quot; shows up in your skills section but never in any of your experience bullets, that is a red flag.</p>
//       <p>Every keyword on your resume should pass a simple test: can you talk about it for five minutes in an interview? If the answer is no, remove it. A shorter list of genuine skills builds more <Link href="/keyword-trust" className={link}>keyword trust</Link> than a long list of buzzwords.</p>
//       <div className={callout}>
//         <h3 className={h3}>The five-minute rule</h3>
//         <p>For each keyword on your resume, ask yourself: could I explain a real project where I used this technology, what problems I hit, and what I would do differently? If yes, keep it. If you would stumble, drop it. Interviewers will test your list.</p>
//       </div>
//
//       <h2 className={h2}>Placement Beats Quantity</h2>
//       <p>Where you put a keyword changes how much weight it carries. A technology mentioned in your title or summary gets noticed first. A technology mentioned at the start of a bullet point gets scanned. A technology buried at the end of the third sentence in a paragraph gets missed.</p>
//       <p>The most effective structure is to lead every experience bullet with the technology, followed by what you built and what the result was. &quot;Built a real-time analytics dashboard in React with D3.js, reducing report generation time from 4 hours to 2 minutes&quot; puts both keywords up front and ties them to an outcome.</p>
//       <p>For a detailed breakdown of where exactly keywords should land on the page, read the full guide on <Link href="/tech-resume-keywords" className={link}>keyword placement for tech resumes</Link>.</p>
//
//       <div className={callout}>
//         <h3 className={h3}>A quick audit for your resume</h3>
//         <p>Open your resume right now. Read only the first three words of every bullet point. If those words are &quot;Responsible for the&quot; or &quot;Worked on a&quot;, your keywords are buried. Rewrite each bullet so the technology or skill comes first.</p>
//       </div>
//
//       <h2 className={h2}>Read Next</h2>
//       <ul className={ul}>
//         <li><Link href="/tech-resume-keywords" className={link}>Where to place keywords on a tech resume</Link></li>
//         <li><Link href="/keyword-trust" className={link}>Why keyword trust matters more than keyword count</Link></li>
//         <li><Link href="/beat-smart-ai-bots" className={link}>How to get past AI resume screening tools</Link></li>
//       </ul>
//     </div>
//   )
// }
// === END ===
