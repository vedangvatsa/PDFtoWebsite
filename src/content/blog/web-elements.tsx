import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="flex flex-col gap-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>An engineering director sits with thirty open tabs of PDF profiles on their screen. They all look identical with the same layout and the same list of technologies. The director clicks the thirty-first link and a clean web CV loads. A small interactive toggle lets them filter the entire project history by Docker and Go. The director stops skimming and begins to click around the live page.</p>

      <p>Traditional static profiles force recruiters to read a linear timeline. A web-based CV lets them control how they consume your history. By adding clean interactive elements you turn a boring list of tasks into an active demonstration of your front-end capabilities.</p>

      <p>Interactivity should never be a gimmick. Sound effects or floating particles will get you rejected immediately. Focus instead on functional interaction that reduces reading friction and highlights your engineering skills.</p>

      <h2 className={h2}>Dynamic Technology Filters</h2>
      <p>A typical skills list is a massive wall of text that recruiters struggle to match with their open roles. You can solve this problem by implementing a dynamic technology filter. This component allows readers to click a skill badge and instantly highlight the projects where you used that tool.</p>

      <p>When a hiring manager selects PostgreSQL they should see every relevant bullet point glow. The unrelated experience should fade slightly to guide their eyes. This keeps the reader focused on the exact skills they want to hire.</p>

      <p>Building this filter is also a great way to showcase clean state management. You prove you can write clean interactive code without relying on heavy third-party libraries. Keep the transitions fast and the layout stable during filtering.</p>

      <div className={callout}>
        <h3 className={h3}>Keep Layout Shifts Under Control</h3>
        <p>Ensure that filtering projects does not cause layout shifts. Use CSS transitions or absolute heights to keep the page content stable. A jumpy interface looks sloppy and frustrates human readers.</p>
      </div>

      <h2 className={h2}>Interactive Architecture Diagrams</h2>
      <p>Listing database engines and messaging queues in a list does not prove you can design systems. An interactive system diagram shows how your components communicate in production. You can use standard vector graphics to map your past systems.</p>

      <p>Allow the reader to hover over a service to reveal its performance metrics. They can click on a database node to see the schema design or query optimization details. This provides deep technical context without cluttering the page.</p>

      <p>Use simple hover states to explain your scaling choices. Describe why you chose Redis as a cache rather than a simple in-memory store. This turns a static diagram into a deep technical brief.</p>

      <p>Make sure the diagram works perfectly on mobile devices. Use responsive wrappers and touch events to handle mobile screens. Many recruiters will view your CV on their phones during transit.</p>

      <h2 className={h2}>Live Command Line Mockups</h2>
      <p>A web CV lets you showcase your familiarity with tools in unique ways. An embedded terminal mockup is a powerful way to engage technical managers. You can build a simple interactive command line component that responds to basic inputs.</p>

      <p>Let users type help to see a list of custom commands. They can run tests to trigger a mock test suite that prints passing assertions. They can type info to print your contact details in a JSON object.</p>

      <p>This element proves your terminal fluency far better than listing command line tools in a skills list. It shows you enjoy building fun systems. Keep the commands simple and handle typos gracefully.</p>

      {/* SVG: Interactive technology filter mockup */}
      <div className="not-prose my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 400" className="w-full h-auto" role="img" aria-label="Mockup of an interactive technology filter that highlights matching projects when a skill badge is clicked">
          <style>{`
            .we-title { font: 600 13px system-ui, sans-serif; }
            .we-label { font: 500 11px system-ui, sans-serif; }
            .we-small { font: 400 10px system-ui, sans-serif; }
            .we-badge { font: 700 8px system-ui, sans-serif; letter-spacing: 0.05em; }
            .we-code { font: 500 9px 'SF Mono', 'Fira Code', monospace; }
          `}</style>

          {/* Filter bar section */}
          <text x="350" y="22" textAnchor="middle" className="we-title fill-zinc-900 dark:fill-zinc-100">Interactive Technology Filter</text>
          <text x="350" y="38" textAnchor="middle" className="we-small fill-zinc-500 dark:fill-zinc-400">Click a skill → matching projects highlight, others fade</text>

          {/* Skill badges row */}
          <rect x="40" y="52" width="620" height="40" rx="6" className="fill-zinc-50 dark:fill-zinc-800/40 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
          <text x="55" y="68" className="we-badge fill-zinc-400 dark:fill-zinc-500">FILTER BY SKILL</text>

          {/* Active badge: React (selected) */}
          <rect x="165" y="58" width="60" height="26" rx="13" className="fill-blue-500 stroke-blue-600" strokeWidth="1" />
          <text x="195" y="75" textAnchor="middle" className="we-badge fill-white">REACT ✓</text>

          {/* Inactive badges */}
          <rect x="235" y="58" width="40" height="26" rx="13" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="255" y="75" textAnchor="middle" className="we-badge fill-zinc-500 dark:fill-zinc-400">GO</text>

          <rect x="285" y="58" width="62" height="26" rx="13" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="316" y="75" textAnchor="middle" className="we-badge fill-zinc-500 dark:fill-zinc-400">DOCKER</text>

          <rect x="357" y="58" width="82" height="26" rx="13" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="398" y="75" textAnchor="middle" className="we-badge fill-zinc-500 dark:fill-zinc-400">POSTGRESQL</text>

          <rect x="449" y="58" width="62" height="26" rx="13" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="480" y="75" textAnchor="middle" className="we-badge fill-zinc-500 dark:fill-zinc-400">PYTHON</text>

          <rect x="521" y="58" width="50" height="26" rx="13" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="546" y="75" textAnchor="middle" className="we-badge fill-zinc-500 dark:fill-zinc-400">AWS</text>

          {/* Project 1: MATCHES React */}
          <rect x="40" y="105" width="300" height="120" rx="6" className="fill-white dark:fill-zinc-900 stroke-blue-300 dark:stroke-blue-600" strokeWidth="2" />
          <rect x="40" y="105" width="300" height="3" rx="6" className="fill-blue-500" />
          <text x="55" y="128" className="we-label fill-zinc-900 dark:fill-zinc-100" fontWeight="700">Payment Dashboard</text>
          <text x="290" y="128" className="we-badge fill-blue-500 dark:fill-blue-400">MATCH</text>
          <text x="55" y="145" className="we-small fill-zinc-600 dark:fill-zinc-400">Built real-time dashboard processing $2M daily</text>
          <text x="55" y="160" className="we-small fill-zinc-600 dark:fill-zinc-400">transactions with live charts and alert systems</text>

          {/* Tech stack badges for project 1 */}
          <rect x="55" y="172" width="44" height="18" rx="9" className="fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700" strokeWidth="1" />
          <text x="77" y="184" textAnchor="middle" className="we-badge fill-blue-600 dark:fill-blue-400">REACT</text>
          <rect x="105" y="172" width="38" height="18" rx="9" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="124" y="184" textAnchor="middle" className="we-badge fill-zinc-500 dark:fill-zinc-400">D3.js</text>
          <rect x="149" y="172" width="46" height="18" rx="9" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="172" y="184" textAnchor="middle" className="we-badge fill-zinc-500 dark:fill-zinc-400">NODE</text>

          <text x="55" y="212" className="we-badge fill-emerald-600 dark:fill-emerald-400">IMPACT</text>
          <text x="105" y="212" className="we-small fill-zinc-600 dark:fill-zinc-400">40% faster load · 99.9% uptime</text>

          {/* Project 2: MATCHES React */}
          <rect x="360" y="105" width="300" height="120" rx="6" className="fill-white dark:fill-zinc-900 stroke-blue-300 dark:stroke-blue-600" strokeWidth="2" />
          <rect x="360" y="105" width="300" height="3" rx="6" className="fill-blue-500" />
          <text x="375" y="128" className="we-label fill-zinc-900 dark:fill-zinc-100" fontWeight="700">Healthcare Portal</text>
          <text x="610" y="128" className="we-badge fill-blue-500 dark:fill-blue-400">MATCH</text>
          <text x="375" y="145" className="we-small fill-zinc-600 dark:fill-zinc-400">Patient-facing portal with HIPAA-compliant</text>
          <text x="375" y="160" className="we-small fill-zinc-600 dark:fill-zinc-400">data handling serving 50K monthly users</text>

          <rect x="375" y="172" width="44" height="18" rx="9" className="fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700" strokeWidth="1" />
          <text x="397" y="184" textAnchor="middle" className="we-badge fill-blue-600 dark:fill-blue-400">REACT</text>
          <rect x="425" y="172" width="72" height="18" rx="9" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="461" y="184" textAnchor="middle" className="we-badge fill-zinc-500 dark:fill-zinc-400">TYPESCRIPT</text>
          <rect x="503" y="172" width="38" height="18" rx="9" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="522" y="184" textAnchor="middle" className="we-badge fill-zinc-500 dark:fill-zinc-400">AWS</text>

          <text x="375" y="212" className="we-badge fill-emerald-600 dark:fill-emerald-400">IMPACT</text>
          <text x="425" y="212" className="we-small fill-zinc-600 dark:fill-zinc-400">WCAG AA · 3s avg load time</text>

          {/* Project 3: FADED (no React match) */}
          <rect x="40" y="240" width="300" height="100" rx="6" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" opacity="0.4" />
          <text x="55" y="263" className="we-label fill-zinc-400 dark:fill-zinc-500" fontWeight="600" opacity="0.5">CLI Build Tool</text>
          <text x="270" y="263" className="we-badge fill-zinc-300 dark:fill-zinc-600">NO MATCH</text>
          <text x="55" y="280" className="we-small fill-zinc-300 dark:fill-zinc-600" opacity="0.5">Custom build pipeline for monorepo</text>
          <rect x="55" y="292" width="28" height="18" rx="9" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" opacity="0.4" />
          <text x="69" y="304" textAnchor="middle" className="we-badge fill-zinc-300 dark:fill-zinc-600">GO</text>
          <rect x="89" y="292" width="48" height="18" rx="9" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" opacity="0.4" />
          <text x="113" y="304" textAnchor="middle" className="we-badge fill-zinc-300 dark:fill-zinc-600">BASH</text>

          {/* Project 4: FADED (no React match) */}
          <rect x="360" y="240" width="300" height="100" rx="6" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" opacity="0.4" />
          <text x="375" y="263" className="we-label fill-zinc-400 dark:fill-zinc-500" fontWeight="600" opacity="0.5">Data Pipeline</text>
          <text x="590" y="263" className="we-badge fill-zinc-300 dark:fill-zinc-600">NO MATCH</text>
          <text x="375" y="280" className="we-small fill-zinc-300 dark:fill-zinc-600" opacity="0.5">ETL system for analytics warehouse</text>
          <rect x="375" y="292" width="52" height="18" rx="9" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" opacity="0.4" />
          <text x="401" y="304" textAnchor="middle" className="we-badge fill-zinc-300 dark:fill-zinc-600">PYTHON</text>
          <rect x="433" y="292" width="58" height="18" rx="9" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" opacity="0.4" />
          <text x="462" y="304" textAnchor="middle" className="we-badge fill-zinc-300 dark:fill-zinc-600">SPARK</text>

          {/* Summary */}
          <text x="350" y="372" textAnchor="middle" className="we-small fill-zinc-500 dark:fill-zinc-400">Matching projects stay prominent · Non-matching projects fade · Zero layout shift</text>
          <text x="350" y="390" textAnchor="middle" className="we-badge fill-blue-500 dark:fill-blue-400">SHOWING 2 OF 4 PROJECTS MATCHING "REACT"</text>
        </svg>
      </div>

      <h2 className={h2}>Expandable Technical Deep Dives</h2>
      <p>You cannot fit all your technical achievements onto a standard static page. Trying to explain complex architectural decisions in a single bullet point is impossible. Expandable blocks solve this problem by hiding details until requested.</p>

      <p>Write a short summary of the project that everyone can read. Add an expand button that reveals a detailed breakdown of the challenges you solved. This lets interested engineering managers read the full story.</p>

      <p>In these deep dives you should discuss the trade-offs you made during the project. Explain why you chose one library over another. Detail the profiling tools you used to find and fix performance bottlenecks.</p>

      <p>This layout keeps your profile clean for initial scans while offering depth for technical reviews. Recruiters get a fast overview of your skills. Engineering managers get the deep details they need to trust your work.</p>

      <h2 className={h2}>Responsive Dark Mode Controls</h2>
      <p>Many developers and recruiters prefer reading dark layouts. Offering a clean dark mode toggle shows you care about user preferences. It is also an opportunity to demonstrate your CSS design skills.</p>

      <p>Ensure your transitions are smooth and do not cause flashing screens. Use standard CSS variables or Tailwind classes to handle colors. Avoid using heavy libraries to build simple theme switches.</p>

      <p>Test your color contrast in both light and dark themes. Your text must remain readable under all conditions. A dark mode that strains the reader's eyes is worse than having no dark mode at all.</p>

      <h2 className={h2}>Interactive Code Sandbox Embeds</h2>
      <p>If you build open-source libraries or UI components you should let recruiters play with them. Embedding a live code editor or component sandbox on your CV is incredibly powerful. Readers can modify parameters and see the changes in real time.</p>

      <p>This embed acts as proof of your skills. It shows that your components work in production environments. It also keeps recruiters on your page longer which increases your chance of getting a response.</p>

      <p>Keep these sandbox embeds isolated to prevent them from crashing your main page. Use lazy loading to ensure they do not slow down your initial page load. A slow CV will get closed before the reader sees your work.</p>

      <h2 className={h2}>Avoiding Common Interactive Pitfalls</h2>
      <p>Adding interaction is only useful if it makes your CV easier to read. Avoid elements that create friction for the recruiter. Auto-playing music or heavy video backgrounds will cause immediate rejection.</p>

      <p>Do not use scrolljacking on your web profile. Readers want standard scroll behavior when scanning your history. Messing with how the page scrolls is annoying and makes the site feel slow.</p>

      <p>Ensure that all interactive elements are optional. A recruiter should be able to read your entire CV without clicking a single button. The interaction must enhance the experience rather than hide basic facts.</p>

      <p>Test your page on multiple web browsers to ensure compatibility. A broken interactive component is worse than a static page. Keep your JavaScript clean and use modern fallback methods.</p>

      <h2 className={h2}>Read Next</h2>
      <p>For more advice on building professional web profiles and portfolios read these detailed guides.</p>
      
      <p>
        Explore how to choose alternative formats to PDF by reading <Link href="/alternatives" className={link}>Best Alternatives to PDF CVs for Frontend Developers</Link>.
      </p>
      <p>
        Learn how to build interactive resumes for creative roles by reading <Link href="/interactive" className={link}>Best Interactive Resumes for UI and UX Designers</Link>.
      </p>
      <p>
        Discover where to publish your live profile by reading <Link href="/portfolio" className={link}>Best Portfolio Platforms for Developers</Link>.
      </p>
    </div>
  );
}
