import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        Junior developers face a classic paradox. You need experience to get a job, but you need a job to get experience. A portfolio is your only tool to break this loop. Yet, most junior portfolios fail to impress. They are filled with identical bootcamp clones and todo list applications.
      </p>
      <p>
        Hiring managers do not need more todo list apps. They want to see that you can write production code, collaborate with others, and solve real business problems. Your portfolio must go beyond the basics. This article details the specific sections you must include on your page to prove you are ready for a commercial role.
      </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Junior developer portfolio layout comparison">
          <rect x="0" y="0" width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-950" />
          <text x="350" y="30" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100 font-bold text-sm">Junior Developer Portfolio Structure</text>
          
          {/* Weak Layout */}
          <rect x="40" y="60" width="280" height="250" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="180" y="85" textAnchor="middle" className="fill-red-500 font-semibold text-xs">Generic Junior Page</text>
          
          <rect x="60" y="110" width="240" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" />
          <text x="70" y="125" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[10px]">Todo List App (React)</text>
          <text x="70" y="140" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Standard tutorial clone project</text>
          
          <rect x="60" y="160" width="240" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" />
          <text x="70" y="175" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[10px]">Skills List</text>
          <text x="70" y="190" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">HTML, CSS, JS, React, Node, SQL...</text>

          <rect x="60" y="240" width="240" height="55" rx="6" className="fill-red-50 dark:fill-red-950/20 stroke-red-200 dark:stroke-red-900" />
          <text x="180" y="258" textAnchor="middle" className="fill-red-600 dark:fill-red-400 text-[10px] font-semibold">Recruiter Skepticism</text>
          <text x="180" y="272" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Looks like a student, not a professional</text>

          {/* Strong Layout */}
          <rect x="380" y="60" width="280" height="250" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="520" y="85" textAnchor="middle" className="fill-emerald-500 font-semibold text-xs">High Impact Page Sections</text>
          
          <rect x="400" y="110" width="240" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="410" y="125" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[10px]">1. Deployed Commercial Tools</text>
          <text x="410" y="140" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Features user traffic and database metrics</text>
          
          <rect x="400" y="160" width="240" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="410" y="175" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[10px]">2. Open Source Merged PRs</text>
          <text x="410" y="190" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Proves git workflow and code review skills</text>

          <rect x="400" y="210" width="240" height="85" rx="6" className="fill-emerald-50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-900" />
          <text x="520" y="228" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[10px] font-semibold">Immediate Technical Trust</text>
          <text x="520" y="245" textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-300 text-[9px] font-medium">Shows collaboration and production readiness</text>
          <text x="520" y="260" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[8px]">Includes guest logins for instant testing</text>
          <text x="520" y="275" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[8px]">Features clear API or system design writeups</text>
        </svg>
      </div>

      <h2 className={h2}>The Deployed Work Section</h2>
      <p>
        The most important section of your page must showcase live applications. Do not just link to GitHub repositories. Most recruiters do not know how to run local terminals. They will not clone your repository to check if it works. If your project is not live, they will assume it is broken.
      </p>
      <p>
        Each project in this section must have three key details. First, a live link that loads in under three seconds. Second, a guest login button so recruiters do not have to register. Third, a short description of the problem your tool solves.
      </p>
      <p>
        Avoid generic names for your projects. Instead of calling your app a chat tool, describe the architecture. You can write that it is a concurrent communication service built with websockets. This changes the conversation from what the app is to how you built it.
      </p>
      <p>
        Limit this section to your two or three best projects. Quality is far more important than quantity. One polished application that has users is worth more than ten half-finished tutorial clones.
      </p>

      <h2 className={h2}>Open Source Contributions</h2>
      <p>
        Working in a team is very different from writing code alone. Junior developers often struggle with version control, code review standards, and API documentation. To prove you can work on a professional team, add an open source section.
      </p>
      <p>
        This section should link directly to public pull requests you have merged. It does not matter if the change was small. Merging code into a public repository shows you can follow guidelines. It proves you can accept feedback from maintainers.
      </p>
      <p>
        Describe the issues you solved. You could write about fixing a bug in an API helper or adding test coverage to a component library. These details tell hiring managers you understand unit tests and continuous integration loops.
      </p>
      <p>
        Listing open source contributions sets you apart from other junior candidates. It shows you do not need hand-holding on basic git commands. It proves you can read someone else&apos;s code and make meaningful improvements.
      </p>
      <p>
        Finding open source projects to contribute to can feel intimidating at first. Start by looking for repositories that have a label for issues suited for beginners. Many active projects mark these issues as good first issue or documentation. Solving these problems helps you learn the contribution workflow without getting overwhelmed by complex codebase rules.
      </p>
      <p>
        Once you merge a few pull requests, write a short summary of what you learned. Explain how the code review process helped you improve your coding style. This shows you are not just looking for a badge on your profile but are actively reflecting on your growth as an engineer.
      </p>

      <div className={callout}>
        <h3 className={h3}>Focus on real code reviews</h3>
        <p>
          Merged pull requests are the best proof of collaboration. They show you can respond to technical critiques and adapt your code to meet the standards of senior engineers.
        </p>
      </div>

      <h2 className={h2}>Technical Writing and System Documentation</h2>
      <p>
        Software engineering is as much about communication as it is about coding. Senior developers spend hours writing specifications, architectural plans, and API guides. If you want to show senior potential, you must demonstrate strong writing skills.
      </p>
      <p>
        Create a section for technical writing or system documentation. You can link to articles you published on engineering blogs. Write about technical challenges you solved while building your projects.
      </p>
      <p>
        For instance, explain how you set up database index patterns or how you debugged a memory leak. Writing about these topics proves you did not just copy code. It shows you studied the underlying principles of the technologies you use.
      </p>
      <p>
        If you have not written articles, write detailed system manuals for your projects. Document the database schema and the API endpoints. Include an architectural diagram. This documentation proves you can explain complex systems to other engineers.
      </p>
      <p>
        Hiring managers look for juniors who can document their work. It means they will spend less time training you on how to write API specs and code comments.
      </p>

      <h2 className={h2}>Structured Learning and Certifications</h2>
      <p>
        Many junior developers do not have computer science degrees. To prove your foundational knowledge, you can list structured learning milestones. However, do not just list bootcamps or completion certificates from video courses.
      </p>
      <p>
        Focus on recognized cloud and security certifications. An AWS Cloud Practitioner or a Google Cloud Associate certificate carries weight. It proves you understand server hosting, database scaling, and network security concepts.
      </p>
      <p>
        When listing certifications, provide a verification link. Recruiters want to verify that your credentials are valid. An unverified certificate has very little trust value.
      </p>
      <p>
        Keep this section brief. It should act as a footnote to your projects and open source contributions. Your actual code remains the primary filter recruiters use.
      </p>

      <h2 className={h2}>How to Format Your Junior Profile</h2>
      <p>
        Avoid cluttering your page with massive skills blocks. Do not list tools you only used for one afternoon. Keep your layout clean and easy to scan.
      </p>
      <p>
        Group your skills by category. For example, have a section for languages, one for frameworks, and one for databases. This organization helps technical recruiters scan your profile in under six seconds.
      </p>
      <p>
        In addition, include a short section explaining your career goals and what you are studying next. It shows that you are proactive about learning. If you are currently learning system design or containerization, mention it. Managers like to see that you are eager to level up your engineering skills.
      </p>
      <p>
        Finally, make it easy for recruiters to contact you. Put your email address and GitHub link at the top of your page. Do not hide them under multiple clicks. Having clean and clickable links makes the application process smooth for everyone involved.
      </p>
      <p>
        You should also make sure your profile is mobile friendly. Many recruiters will view your links on their phones. If your page layout breaks on smaller screens, they will reject you. You can read about <Link href="/mobile" className={link}>why your CV must be mobile responsive</Link> to understand screen optimization rules.
      </p>
      <p>
        If you want to know what tools to use for building your page, look at the <Link href="/portfolio" className={link}>best portfolio platforms for developers</Link> to choose a reliable platform.
      </p>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/mobile" className={link}>Why Your CV Must Be Mobile Responsive</Link></li>
        <li><Link href="/portfolio" className={link}>Best Portfolio Platforms for Developers</Link></li>
        <li><Link href="/skills" className={link}>Best Ways to Prove Skills Without a Degree</Link></li>
      </ul>
    </div>
  );
}
