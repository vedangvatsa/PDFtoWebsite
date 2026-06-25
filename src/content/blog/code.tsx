import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>The modern technical hiring world is completely flooded with perfectly formatted documents claiming absolute mastery of every programming language on earth. Because of the massive proliferation of online tutorials and bootcamps it costs a candidate literally zero effort to type the word React or Postgres onto their public profile. Due to this extreme saturation technical recruiters have developed an immense distrust of plain text declarations.</p>
        <p>We assume every single technical skill you list is an aggressive exaggeration until you prove otherwise. If you want to bypass the massive pile of generic applicants and instantly trigger an interview request you must stop demanding that we trust your words. You must force us to interact directly with your compiled functional code. Showing always defeats telling.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Baseline */}
            <line x1="60" y1="230" x2="620" y2="230" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

            {/* Arrow along bottom */}
            <line x1="80" y1="260" x2="580" y2="260" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="580,255 595,260 580,265" className="fill-zinc-400 dark:fill-zinc-500" />
            <text x="340" y="276" textAnchor="middle" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Recruiter Trust →</text>

            {/* Step 1: Listed Skill — short block */}
            <rect x="80" y="170" width="150" height="60" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
            <text x="155" y="196" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Listed Skill</text>
            <text x="155" y="212" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">"I know React"</text>
            {/* Trust label */}
            <rect x="110" y="148" width="90" height="18" rx="4" className="fill-zinc-200 dark:fill-zinc-700" />
            <text x="155" y="161" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Low trust</text>

            {/* Step 2: GitHub Repo — medium block */}
            <rect x="265" y="120" width="150" height="110" rx="6" className="fill-sky-50 dark:fill-sky-900/20 stroke-sky-300 dark:stroke-sky-700" strokeWidth="1" />
            <text x="340" y="160" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">GitHub Repo</text>
            <text x="340" y="178" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Code reviewable</text>
            <text x="340" y="193" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">by anyone</text>
            {/* Trust label */}
            <rect x="290" y="98" width="100" height="18" rx="4" className="fill-sky-100 dark:fill-sky-900/30" />
            <text x="340" y="111" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-sky-600 dark:fill-sky-400">Medium trust</text>

            {/* Step 3: Live URL — tall block */}
            <rect x="450" y="60" width="150" height="170" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
            <text x="525" y="110" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Live Deployed URL</text>
            <text x="525" y="128" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Working app anyone</text>
            <text x="525" y="143" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">can try right now</text>
            {/* Trust label */}
            <rect x="480" y="38" width="90" height="18" rx="4" className="fill-emerald-100 dark:fill-emerald-900/30" />
            <text x="525" y="51" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">High trust</text>

            {/* Step connectors */}
            <line x1="230" y1="200" x2="265" y2="175" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" strokeDasharray="4 3" />
            <line x1="415" y1="175" x2="450" y2="145" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" strokeDasharray="4 3" />
          </svg>
        </div>

        
        <h2 className={h2}>The Live URL Mandate</h2>
        <p>You absolutely must include a hyperlinked URL that points directly to a living breathing application you architected. A static screenshot is practically useless and a zip file implies you possess zero deployment skills. When an engineering manager can click a link instantly interact with your user interface and attempt to break your form validations they immediately respect your operational competence.</p>
        <p>Deploying a project proves you survived the most difficult and frustrating phase of software engineering. Millions of juniors can follow a clean local tutorial but very few possess the grit required to successfully configure a production server set up database scaling and secure a custom domain network. A live link proves you are a finisher.</p>
        
        <div className={callout}>
          <h3 className={h3}>Clean Up the Source Repository</h3>
          <p>When you link to your public code repository explicitly pin your three most impressive projects to the top of your profile. Make absolutely sure the root folder contains a pristine descriptive markdown file that clearly explains the architecture the database choices and the specific reasons you selected the overarching technical stack. Managers read the documentation before they ever look at the pure code.</p>
        </div>

        <h2 className={h2}>Public Collaboration Artifacts</h2>
        <p>Submitting code to massive open source libraries is universally recognized as the ultimate proof of elite software engineering. When you link to a public system where your isolated code branch was heavily scrutinized reviewed and eventually merged by senior engineers working at major corporations you establish unassailable technical credibility.</p>
        <p>Even linking to a deeply technical conversation where you methodically helped a stranger debug a complex race condition dramatically boosts your hiring profile. We want to hire developers who communicate complex technical architecture clearly in plain public view. Your public internet artifacts are your actual profile.</p>
      </div>
  );
}
