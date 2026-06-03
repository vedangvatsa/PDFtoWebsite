import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>Imagine a recruiter opening your profile and seeing four different jobs listed over a four year span. Their immediate reaction is negative. They see a flighty worker who cannot stay in one place. They assume you will leave their team in a few months. But the truth is completely different. You stayed at the same employer the entire time and earned three successive promotions. Your formatting choice accidentally made you look like an unstable job hopper.</p>
      
      <p>This is a common disaster for high performers. When you separate every internal promotion into a completely separate company entry you destroy your own story. The reader scans the left margin and sees multiple company names or repeated logos. They do not read the fine print. They miss the fact that you were climbing the ladder at a single organization.</p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 300" className="w-full h-auto" role="img" aria-label="Visual comparison of bad repeated company entries versus clean nested promotion stack.">
          <text x="170" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">Repeated Company Entries</text>
          
          <rect x="20" y="50" width="300" height="90" rx="6" className="fill-zinc-50 dark:fill-zinc-800/40 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
          <text x="35" y="75" fontSize="12" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Senior Engineer</text>
          <text x="35" y="95" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Acme Corporation · 2024 to Present</text>
          <rect x="35" y="110" width="220" height="4" rx="2" className="fill-zinc-200 dark:fill-zinc-600" />
          
          <rect x="20" y="155" width="300" height="90" rx="6" className="fill-zinc-50 dark:fill-zinc-800/40 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
          <text x="35" y="180" fontSize="12" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Software Engineer</text>
          <text x="35" y="200" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Acme Corporation · 2022 to 2024</text>
          <rect x="35" y="215" width="220" height="4" rx="2" className="fill-zinc-200 dark:fill-zinc-600" />
          
          <text x="530" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Single Unified Company Block</text>
          
          <rect x="380" y="50" width="300" height="195" rx="6" className="fill-emerald-50/50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-900/50" strokeWidth="1" />
          <text x="395" y="75" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Acme Corporation</text>
          <text x="395" y="93" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Continuous Tenure · 2022 to Present</text>
          
          <line x1="405" y1="110" x2="405" y2="200" className="stroke-emerald-500 dark:stroke-emerald-400" strokeWidth="2" />
          <circle cx="405" cy="110" r="4" className="fill-emerald-500 dark:fill-emerald-400" />
          <circle cx="405" cy="200" r="4" className="fill-zinc-400 dark:fill-zinc-600" />
          
          <text x="420" y="114" fontSize="12" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Senior Engineer</text>
          <text x="420" y="132" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">2024 to Present</text>
          <rect x="420" y="142" width="220" height="4" rx="2" className="fill-zinc-200 dark:fill-zinc-600" />
          
          <text x="420" y="204" fontSize="12" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Software Engineer</text>
          <text x="420" y="222" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">2022 to 2024</text>
          
          <line x1="350" y1="20" x2="350" y2="270" className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      <h2 className={h2}>Why Split Entries Ruin Your Timeline</h2>
      <p>When you list a single company multiple times in a row you trigger visual fatigue. The hiring manager is skimming your profile in thirty seconds. They do not read the company description or the dates. Their eyes jump from one bold heading to the next bold heading. They count the blocks. To their eyes you look like someone who changes employers every twelve months.</p>
      
      <p>This layout choice also dilutes your overall tenure. It makes your time at the organization look short and fragmented. Instead of seeing a loyal contributor who helped the business grow you present yourself as a short term contractor. You want to highlight growth. Your layout should prove that growth instantly without requiring a deep read.</p>
      
      <p>The solution is a nested structure. You must group all internal promotions under one single company header. This layout shows your total time at the company at the very top. Then it lists your different roles underneath. It proves that you stayed in one place while earning more responsibility.</p>

      <h2 className={h2}>The Structure of a Unified Company Block</h2>
      <p>To build a unified block you put the employer name at the top. Next to it you place the total combined years you spent there. This number represents your true loyalty. It shows you survived multiple review cycles and economic changes.</p>
      
      <p>Underneath this main header you list your job titles. Start with your most recent role and work backward. For each title you include the specific start and end dates. This creates a clear timeline of your progression. It shows the reader how fast you climbed the ranks.</p>

      <p>This layout also prevents you from repeating the same company information. You only need to describe the company business model once. This saves valuable space on the page. It keeps the focus on your personal growth and achievements.</p>

      <div className={callout}>
        <h3 className={h3}>The Stacking Test</h3>
        <p>Look at your current layout. If you see the same company name repeated in bold text you must merge them immediately. Keep the company name at the top. Stack the roles below it with a simple indent. This visual adjustment will instantly make your profile look more senior.</p>
      </div>

      <h2 className={h2}>How to Write Bullets for Nested Roles</h2>
      <p>When you have nested roles you must not repeat your responsibilities. If you did something as a junior engineer you do not need to list it again under your senior role. This makes your writing look repetitive and lazy. It hides your current high level work.</p>

      <p>Instead you must write bullets that show a change in scope. Under your junior title you list execution. Focus on shipping code and fixing bugs. Show that you were a reliable worker who finished tasks fast.</p>

      <p>Under your promoted title you list strategy and ownership. Focus on system architecture and mentoring. Show that you were in charge of projects and helped others succeed. This contrast proves to the manager that your promotion was earned through real business value.</p>

      <h2 className={h2}>Quantifying the Step Up</h2>
      <p>To prove your growth was real you need numbers. But you must not just list tasks. You must show the difference in your impact before and after the promotion. This shows you stepped up to meet the new expectations.</p>

      <p>For example you can write that you mentored two junior developers after your promotion. You can state that you took ownership of a system that serves double the traffic. This proves you did not just change your title. It proves you expanded your footprint across the team.</p>

      <p>If you cannot find company revenue numbers you can use operational numbers. Write about team velocity or deploy speeds. Mention how your new responsibilities reduced bugs or saved development hours. These metrics show you understand the physics of your team.</p>

      <h2 className={h2}>Common Mistakes When Nesting Promotions</h2>
      <p>The first major mistake candidates make is omitting dates for the individual sub roles. They list the total company timeline at the top and then stack the titles below with no dates. This is a problem because it makes you look like you held the senior title the entire time. Background checks will flag this discrepancy immediately. You must assign clear dates to each distinct title you held.</p>

      <p>The second mistake is over explaining the transition. Do not write a long paragraph explaining why the company decided to promote you. Avoid corporate stories about reorganizations or manager changes. Recruiters do not care about the politics behind the promotion. They only care about the results you produced in the new role.</p>

      <p>The third mistake is mixing up contract work with permanent employment. If you started as an external contractor and then transitioned to a permanent employee you must state this clearly. You can list the contracting period as a separate role under the company block. Label it as a contract role to maintain complete transparency. This prevents any trust issues during the final vetting stages.</p>

      <h2 className={h2}>Dealing With Lateral Team Switches</h2>
      <p>Not all internal progression goes straight up. Sometimes you move sideways to a different team to learn a new area of the business. For example you might move from the growth team to the infrastructure team. This is a lateral switch that shows great versatility.</p>

      <p>You must format lateral switches the same way you format promotions. Group them under the same company header. In your bullet points you should explain the strategic reason for the switch. Focus on how you brought value from your old team to solve problems on the new team.</p>

      <p>A lateral switch is a great way to show that you are adaptable. It proves you can learn new systems fast. Grouping these roles together prevents your profile from looking fragmented. It tells a cohesive story of a developer who grows by taking on new challenges.</p>

      <h2 className={h2}>Why Web Links Handle Progression Better</h2>
      <p>Traditional PDF files struggle with nested layouts. They have tight margins and rigid structures. When you indent text to show a nested role the lines wrap in strange ways. The layout becomes messy and hard to read on mobile screens.</p>

      <p>A web profile solves this issue. It uses responsive code that adjusts to any screen size. The indents stay clean and the timeline lines render perfectly. The hiring manager can scan your progression on a phone without zooming in or scrolling sideways.</p>

      <p>Using a live web link also allows you to update your titles instantly. If you get promoted tomorrow you do not need to send a new file. You edit your profile online and the recruiter sees the updated career growth immediately.</p>

      <h2 className={h2}>Read Next</h2>
      <p>To make sure your profile looks clean after updating your promotions you should check your spacing. Read our guide on the <Link href="/spacing" className={link}>best CV spacing standards</Link> to build a clean layout. You can also review the <Link href="/fonts" className={link}>best fonts for screen readability</Link> to ensure your timeline looks crisp.</p>
    </div>
  );
}
