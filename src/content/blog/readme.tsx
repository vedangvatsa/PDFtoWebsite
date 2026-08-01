import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>Imagine a technical manager who has just spent three hours scanning boring PDF documents. They click the link to your GitHub profile. They want to see your code. Instead of seeing clean projects they are hit with a wall of animated graphics. There are spinning shields. There are progress bars showing you are ninety percent good at CSS. There is a massive grid of social media icons. The manager has to scroll past three screens of visual noise just to find your repositories.</p>

      <p>This is what happens when you follow generic advice about building a GitHub profile. You build something that looks like a personal fan page from the late nineties. It is a massive waste of attention. A recruiter or manager spends only a few seconds on your profile. If they cannot understand what you build and how well you build it in those first few seconds they will close the tab.</p>

      <p>Your profile README is not a canvas for decorations. It is a landing page for your professional work. It is a sales letter for your software capabilities. If you want to stand out to employers you must write it with absolute discipline.</p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Visual layout comparing a noisy README with a clean, high impact README">
          {/* Background grid */}
          <rect width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1" />
          
          {/* Left panel - Noisy layout */}
          <rect x="25" y="25" width="300" height="300" rx="6" className="fill-red-50/50 dark:fill-red-950/20 stroke-red-200 dark:stroke-red-900/50" strokeWidth="1" />
          <text x="175" y="50" textAnchor="middle" className="fill-red-600 dark:fill-red-400 font-bold text-sm" fontFamily="system-ui, sans-serif">NOISY README</text>
          
          {/* Noisy elements representing badges */}
          <rect x="50" y="70" width="80" height="15" rx="3" className="fill-red-200/50 dark:fill-red-900/40" />
          <rect x="140" y="70" width="80" height="15" rx="3" className="fill-red-200/50 dark:fill-red-900/40" />
          <rect x="230" y="70" width="45" height="15" rx="3" className="fill-red-200/50 dark:fill-red-900/40" />
          
          <circle cx="65" cy="110" r="15" className="fill-zinc-200 dark:fill-zinc-800" />
          <circle cx="110" cy="110" r="15" className="fill-zinc-200 dark:fill-zinc-800" />
          <circle cx="155" cy="110" r="15" className="fill-zinc-200 dark:fill-zinc-800" />
          <circle cx="200" cy="110" r="15" className="fill-zinc-200 dark:fill-zinc-800" />
          <circle cx="245" cy="110" r="15" className="fill-zinc-200 dark:fill-zinc-800" />
          
          {/* Fake stats box */}
          <rect x="50" y="145" width="250" height="120" rx="4" className="fill-zinc-100 dark:fill-zinc-800/80 stroke-zinc-200 dark:stroke-zinc-700" />
          <text x="65" y="170" className="fill-zinc-400 font-bold text-xs" fontFamily="system-ui, sans-serif">GITHUB STATS</text>
          <line x1="65" y1="185" x2="285" y2="185" className="stroke-zinc-300 dark:stroke-zinc-700" />
          <rect x="65" y="195" width="100" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
          <rect x="65" y="210" width="150" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
          <rect x="65" y="225" width="80" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
          <rect x="65" y="240" width="120" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
          
          <text x="175" y="305" textAnchor="middle" className="fill-zinc-400 dark:fill-zinc-500 text-xs" fontFamily="system-ui, sans-serif">Scattered attention and slow load times</text>

          {/* Right panel - Clean layout */}
          <rect x="375" y="25" width="300" height="300" rx="6" className="fill-emerald-50/50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-900/50" strokeWidth="1" />
          <text x="525" y="50" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 font-bold text-sm" fontFamily="system-ui, sans-serif">HIGH IMPACT README</text>
          
          {/* Simple header */}
          <text x="400" y="80" className="fill-zinc-800 dark:fill-zinc-100 font-bold text-sm" fontFamily="system-ui, sans-serif">Senior Systems Architect</text>
          <text x="400" y="100" className="fill-zinc-500 dark:fill-zinc-400 text-xs" fontFamily="system-ui, sans-serif">Building cloud engines that do not crash</text>
          
          {/* Primary project section */}
          <rect x="400" y="125" width="250" height="75" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" />
          <text x="412" y="145" className="fill-zinc-800 dark:fill-zinc-200 font-bold text-xs" fontFamily="system-ui, sans-serif">Featured project - CoreDB</text>
          <text x="412" y="162" className="fill-zinc-500 dark:fill-zinc-400 text-[10px]" fontFamily="system-ui, sans-serif">Custom key-value storage engine in Rust</text>
          <text x="412" y="178" className="fill-emerald-600 dark:fill-emerald-400 text-[9px] font-bold" fontFamily="system-ui, sans-serif">View Code | Live Demo</text>
          
          {/* Secondary project section */}
          <rect x="400" y="215" width="250" height="75" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" />
          <text x="412" y="235" className="fill-zinc-800 dark:fill-zinc-200 font-bold text-xs" fontFamily="system-ui, sans-serif">Second project - AsyncCrawler</text>
          <text x="412" y="252" className="fill-zinc-500 dark:fill-zinc-400 text-[10px]" fontFamily="system-ui, sans-serif">High speed web crawler with backpressure</text>
          <text x="412" y="268" className="fill-emerald-600 dark:fill-emerald-400 text-[9px] font-bold" fontFamily="system-ui, sans-serif">View Code | Live Demo</text>

          <text x="525" y="305" textAnchor="middle" className="fill-zinc-400 dark:fill-zinc-500 text-xs" fontFamily="system-ui, sans-serif">Instant proof of raw coding ability</text>
        </svg>
      </div>

      <h2 className={h2}>The Psychology of the Technical Reviewer</h2>
      <p>To write a good profile you must understand who reads it. Recruiter visits are quick. They look for keywords and proof of active work. They do not know how databases work. They only want to see if your experience matches the open job. If they see a messy page they will get confused and leave.</p>
      
      <p>Technical managers are different. They do know how databases work. They will inspect your code. They want to see if your style is clean. They want to see if you write tests. They want to see if you document your decisions. They click your GitHub link to see the real engineer behind the paper application. When you hide your projects behind animated widgets you signal that you care more about visual gimmicks than software physics.</p>

      <p>You want to design your profile README to serve both readers. Give the recruiter a fast path to your CV and contact info. Give the technical manager a fast path to your absolute best repositories.</p>

      <h2 className={h2}>Deleting the Visual Clutter</h2>
      <p>The first step in fixing your profile is to delete the noise. Remove the stats widgets. The stats cards that show your total commits or your pull request counts are meaningless. They do not show code quality. A developer can make one thousand commits that only fix spelling errors. A senior engineer might make three commits that save the company millions of dollars. Managers know this.</p>

      <p>Remove the progress bars showing skill percentages. Nobody knows what it means to be seventy five percent good at Javascript. It is a fake metric. It only shows you lack a professional frame of reference. If you can build production software with a tool list it in your skills. If you cannot do not list it. Keep it binary.</p>

      <p>Remove the badges that show every tool you have ever touched. If you list fifty different tools it looks like you copy and pasted a glossary. It dilute your real expertise. Focus your profile on the core stack that you actually use to solve difficult problems.</p>

      <div className={callout}>
        <h3 className={h3}>The Profile Clean Up Test</h3>
        <p>Open your GitHub page. If it takes more than two seconds to load because of third party badges delete them. If you have more than ten icons for tools you only used once delete them. If your biography is longer than three sentences shorten it. Keep the interface fast and direct.</p>
      </div>

      <h2 className={h2}>The Perfect Three Part README Blueprint</h2>
      <p>A professional profile README should follow a simple three part structure. It should fit on one screen without requiring heavy scrolling. This keeps the reader focused on your core value.</p>

      <p>First write a short header. State your current role title. Add one sentence explaining your main area of focus. You can mention the specific systems you build. Keep it simple and clear. Do not use generic corporate language about being a passionate learner.</p>

      <p>Second feature your top two projects. Do not list ten repositories. Nobody will click ten links. Choose your absolute best two projects. Write a two sentence summary for each. Explain the exact problem you solved and the tools you used. Provide a clear link to the code and a link to the live hosted application. This is where you prove your skill. You can learn more about formatting these in our guide on <Link href="/code" className={link}>how to display code samples</Link> effectively.</p>

      <p>Third provide a direct call to action. Give the reader a clear path to contact you. Link to your live professional web profile. Let them download your clean CV. Do not make them search your website for an email address. Make the transition from your code to your contact details completely frictionless.</p>

      <h2 className={h2}>Writing High Impact Project Summaries</h2>
      <p>When you present your projects do write the name of the tool. Explain the architectural challenge. A project named Task Manager with a description that says a todo app built with React is useless. Every junior developer builds a todo app. It does not prove you can build commercial software.</p>

      <p>Instead focus on performance and systems. If you built a todo app explain how you handled state storage or offline synchronization. Explain how you tuned rendering for large datasets. Use specific terms that show you understand computing limits.</p>

      <p>Look at this example of a weak description. A weather application that shows the current temperature using a public API. It is built with Vue and tailwind. Now look at a strong description. A caching proxy for public weather queries. Built with Go and Redis to handle peak traffic. It reduced external API calls by eighty percent and dropped response times to under ten milliseconds.</p>

      <p>The second example shows you understand system design. It shows you think about cost and speed. It gives the manager a reason to look at your source code. If you have open source work make sure to present it cleanly. Check out our tips on <Link href="/open-source" className={link}>how to show open source work</Link> to make those entries stand out.</p>

      <h2 className={h2}>Building the Call to Action</h2>
      <p>Many developers forget the primary goal of their GitHub profile. The goal is to get an interview. If a manager loves your code they need an easy way to hire you. Do not expect them to search for your contact info.</p>

      <p>Add a clear section at the bottom of your README. Call it Contact or Hire. Provide a link to your live web profile. A web link is much better than a static PDF. It loads instantly and stays updated. You can read about the benefits of using a web link in our article on <Link href="/link" className={link}>sending your CV as a link</Link> instead of an attachment.</p>

      <p>Provide your professional email. Make it a clickable mailto link. If you have a clean portfolio page link to that as well. Keep the layout professional and clean. Remove any links to inactive social accounts or personal gaming profiles. You want to maintain a focused corporate presence.</p>

      <h2 className={h2}>Maintain Your Profile Over Time</h2>
      <p>A good GitHub profile is not a static project. You should update it as your career grows. If you learn a new system update your featured projects. If you write a new technical article link to it. Keep the green contribution graph active by making small consistent updates to your open repositories.</p>

      <p>An active profile shows you are a practicing engineer. It shows you care about your craft. When a manager sees a clean README followed by a history of consistent code updates they know they are looking at a serious candidate. They will want to talk to you.</p>

      <p>Pin your two featured repositories to the top of your GitHub profile. GitHub allows six pins, but two strong projects beat six mediocre ones every time.</p>

      <p>Spend an hour tonight cleaning up your page. Delete the noise. Highlight your best two repositories. Add a direct link to your professional web CV. Make it easy for employers to see your value and make contact.</p>
    </div>
  );
}
