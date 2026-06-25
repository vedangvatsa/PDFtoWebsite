import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>The sudden explosion of generative artificial intelligence has created massive confusion in the professional hiring market. Candidates are terrified of falling behind the technical curve so they aggressively plaster the phrase Prompt Engineer or AI Expert directly at the top of their public profiles. This strategy almost always guarantees immediate rejection. Unless you are literally writing the mathematical architecture for a new neural network calling yourself an AI expert makes you look like a trend chasing scammer.</p>
        <p>Hiring managers do not want to hire philosophers who just talk about the abstract future of artificial intelligence. We want to hire pragmatic operators who use large language models as basic utilities to accelerate their daily corporate output. You need to prove that you deploy AI exactly the same way an accountant uses a spreadsheet. It is just a lever you pull to multiply your personal speed.</p>
        
        <h2 className={h2}>Bury the Keywords in the Work</h2>
        <p>The absolute worst place to list your artificial intelligence capabilities is in a dedicated skills section. Giving ChatGPT its own standalone bullet point is incredibly amateur. You must weave your prompt usage directly into the chronological narrative of your actual prior jobs. When you tether the AI tool to a specific historical business outcome it instantly transforms from empty hype into verifiable technical credibility.</p>
        <p>Describe precisely how you used a coding assistant to refactor a massive legacy monolithic application in three weeks instead of the projected three months. Tell the hiring manager that you systematically built an automated text extraction wrapper using an API to instantly process thousands of messy incoming customer emails. When you pair the new technology with an irrefutable business win you completely eliminate the suspicion of fraud.</p>
        
        <div className={callout}>
          <h3 className={h3}>Measure the Acceleration</h3>
          <p>The only metric that matters when pitching your artificial intelligence competence is pure quantifiable acceleration. Explicitly calculate the exact number of hours or budget dollars you saved the corporation by deploying a language model. Do not tell us you are good at prompting. Prove to us that your prompting mathematically doubled your physical output.</p>
        </div>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 310" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Divider */}
            <line x1="340" y1="10" x2="340" y2="300" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

            {/* LEFT: Wrong */}
            <text x="160" y="26" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-400">✗ Wrong</text>

            {/* Resume mockup - left */}
            <rect x="40" y="42" width="240" height="240" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

            {/* Name placeholder */}
            <rect x="60" y="54" width="100" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="60" y="66" width="140" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* AI Skills section - highlighted wrong */}
            <rect x="54" y="84" width="212" height="80" rx="4" className="fill-red-50 dark:fill-red-900/15 stroke-red-300 dark:stroke-red-700" strokeWidth="1" />
            <text x="64" y="100" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-400">AI Skills</text>
            <text x="64" y="116" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">• Prompt Engineering</text>
            <text x="64" y="130" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">• ChatGPT</text>
            <text x="64" y="144" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">• Midjourney</text>
            <text x="64" y="158" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">• AI Automation</text>

            {/* Work History - small */}
            <text x="64" y="182" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Work History</text>
            <rect x="64" y="190" width="170" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="64" y="198" width="150" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="64" y="206" width="180" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="64" y="214" width="120" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Standalone label */}
            <text x="160" y="260" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500" fontStyle="italic">Standalone section = no context</text>

            {/* RIGHT: Right */}
            <text x="510" y="26" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓ Right</text>

            {/* Resume mockup - right */}
            <rect x="390" y="42" width="240" height="240" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

            {/* Name placeholder */}
            <rect x="410" y="54" width="100" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="410" y="66" width="140" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Work History - with AI woven in */}
            <text x="410" y="90" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Work History</text>

            <rect x="410" y="98" width="180" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="404" y="106" width="212" height="22" rx="3" className="fill-emerald-50 dark:fill-emerald-900/15 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.5" />
            <text x="410" y="121" fontSize="8" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Used ChatGPT to automate QA → 40% faster</text>

            <rect x="410" y="136" width="160" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="404" y="144" width="212" height="22" rx="3" className="fill-emerald-50 dark:fill-emerald-900/15 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.5" />
            <text x="410" y="159" fontSize="8" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Prompt-engineered content pipeline, 3x output</text>

            <rect x="410" y="174" width="190" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="404" y="182" width="212" height="22" rx="3" className="fill-emerald-50 dark:fill-emerald-900/15 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.5" />
            <text x="410" y="197" fontSize="8" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Midjourney for brand assets, saved $12K agency</text>

            <rect x="410" y="212" width="170" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="410" y="220" width="140" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Woven label */}
            <text x="510" y="260" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500" fontStyle="italic">AI skills woven into real results</text>
          </svg>
        </div>

        <h2 className={h2}>Avoid the Guru Trap</h2>
        <p>Never under any circumstances list yourself as an AI Thought Leader. The technology is evolving so violently fast that anyone claiming absolute mastery of the entire space is instantly flagged as a liar by technical recruiters. We respect humility and brutal pragmatism over grandiose titles.</p>
        <p>State clearly that you are aggressively and consistently learning how to use new developer tools to ship code faster. This framing proves you possess the hunger required to adapt to a shifting world while firmly keeping your feet planted in the reality of building functional products.</p>
      </div>
  );
}
