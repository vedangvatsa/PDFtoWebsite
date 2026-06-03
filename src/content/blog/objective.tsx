import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>I have reviewed over ten thousand applications in my career as a senior technical recruiter. If there is one massive mistake that instantly ruins a candidate profile it is the classic objective statement. Years ago people wrote what they wanted from a job at the very top of their paper resumes. They would literally write that they sought a challenging role at a dynamic company to grow their personal skills.</p>
        <p>This practice is entirely dead. If you do this today managers will think you are fundamentally out of touch with modern business realities. Companies do not hire you to fulfill your personal dreams. They hire you because they have expensive problems that need fixing right now.</p>
        
        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 660 260" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Before box */}
            <rect x="16" y="16" width="628" height="100" rx="6" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            {/* Red left border */}
            <rect x="16" y="16" width="5" height="100" rx="2" className="fill-red-400" />

            {/* Before label */}
            <text x="40" y="42" fontSize="11" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">BEFORE</text>

            {/* Before text */}
            <text x="40" y="68" fontSize="13" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400" fontStyle="italic">"Seeking a challenging position where I can leverage</text>
            <text x="40" y="88" fontSize="13" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400" fontStyle="italic">my skills and grow professionally."</text>

            {/* Arrow between boxes */}
            <line x1="330" y1="120" x2="330" y2="140" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="326,140 330,148 334,140" className="fill-zinc-400 dark:fill-zinc-500" />

            {/* After box */}
            <rect x="16" y="152" width="628" height="100" rx="6" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            {/* Green left border */}
            <rect x="16" y="152" width="5" height="100" rx="2" className="fill-emerald-500" />

            {/* After label */}
            <text x="40" y="178" fontSize="11" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">AFTER</text>

            {/* After text */}
            <text x="40" y="204" fontSize="13" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">"Full-stack engineer. 6 years shipping payment systems</text>
            <text x="40" y="224" fontSize="13" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">at scale. Last project cut checkout failures by 40%."</text>
          </svg>
        </div>

        <h2 className={h2}>The Brutal Truth About Hiring</h2>
        <p>When an engineering manager or a marketing director opens a job requisition they are usually doing it out of pain. Their team is probably overworked. They are missing deadlines. Someone just quit and left behind a massive mess of undocumented code or failing ad campaigns. The manager reading your application is tired and stressed.</p>
        <p>When they read a paragraph about your desire for mentorship and growth they immediately skip to the next applicant. They do not have the time or energy to be your career counselor. They need a specialist who can step in and stop the active bleeding on their team.</p>

        <h2 className={h2}>Replace It With a Value Summary</h2>
        <p>You must completely delete your objective statement and replace it with a professional summary. This new section acts as your elevator pitch. It tells the reader exactly what specific technical or operational problems you have solved recently and what you can solve for them tomorrow.</p>
        <p>A strong summary does not use future tense. It relies entirely on the past tense and the present tense. It proves your authority rather than stating your hopes.</p>
        
        <div className={callout}>
          <h3 className={h3}>The Winning Summary Formula</h3>
          <p>Writing a perfect summary is actually very simple if you follow a strict formula. First state your current seniority and your core discipline. Next name the two tools or methodologies you execute best. Finally name your single biggest tangible win in the last three years. Do not mention your own needs or what you are looking for in a new job.</p>
        </div>

        <h2 className={h2}>Reviewing Real Examples</h2>
        <p>Let us look at a terrible objective statement. Seeking a senior developer role where I can use my Javascript skills and learn backend architecture to advance my career. This sentence offers absolutely zero value to the company. It only asks the company to spend money training the candidate.</p>
        <p>Now look at a strong value summary. Senior Frontend Engineer with six years of experience building high performance React interfaces. I specialize in reducing load times and fixing memory leaks in complex financial dashboards. I recently rebuilt a core application that survived a traffic spike of two million daily active users.</p>
        <p>The difference is night and day. The second example does not ask for anything. It simply declares competence and proves a track record of handling extreme pressure.</p>

        <h2 className={h2}>Space Is Your Most Valuable Asset</h2>
        <p>The top quarter of your application is the most expensive real estate you own. This is the only section that every single recruiter is guaranteed to read. If you waste that prime space talking about your personal journey you force the reader to scroll down just to find out if you even know the required coding languages.</p>
        <p>Never make a tired manager hunt for your core skills. Put your value plainly at the top and let your accomplishments speak for themselves.</p>
      </div>
  );
}
