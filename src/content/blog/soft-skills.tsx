import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>A staggering percentage of professionals ruin their initial profile summary by dumping a long list of abstract personality traits onto the page. They proudly describe themselves as a synergistic team player a dynamic leader and an excellent communicator. These abstract declarations possess absolutely zero professional value because the bar to assert them is non existent. Every terrible employee in the world also calls themselves a great team player.</p>
        <p>When an experienced recruiter reads these empty adjectives their eyes simply glaze over. We instantly recognize them as filler text used by people who lack concrete achievements. If you want to convince a hiring manager that you work well with humans you must entirely stop reviewing your own personality and start providing hard historical evidence of your interpersonal mechanics.</p>

        {/* Visual: Three soft-skill claims mapped to concrete proof with arrows */}
        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 300" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Column Headers */}
            <text x="130" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              The Claim
            </text>
            <text x="520" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              The Proof
            </text>

            {/* Row 1 */}
            <rect x="20" y="50" width="220" height="52" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="130" y="73" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              "Excellent communicator"
            </text>

            {/* Arrow 1 */}
            <line x1="240" y1="76" x2="310" y2="76" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="310,72 318,76 310,80" className="fill-zinc-400 dark:fill-zinc-500" />

            <rect x="320" y="50" width="340" height="52" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
            <text x="490" y="69" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              Ran weekly cross-team syncs
            </text>
            <text x="490" y="84" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              bridging eng and marketing
            </text>

            {/* Row 2 */}
            <rect x="20" y="120" width="220" height="52" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="130" y="150" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              "Strong leader"
            </text>

            {/* Arrow 2 */}
            <line x1="240" y1="146" x2="310" y2="146" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="310,142 318,146 310,150" className="fill-zinc-400 dark:fill-zinc-500" />

            <rect x="320" y="120" width="340" height="52" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
            <text x="490" y="139" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              Mentored 3 juniors into senior
            </text>
            <text x="490" y="154" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              promotions in 12 months
            </text>

            {/* Row 3 */}
            <rect x="20" y="190" width="220" height="52" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="130" y="220" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              "Team player"
            </text>

            {/* Arrow 3 */}
            <line x1="240" y1="216" x2="310" y2="216" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="310,212 318,216 310,220" className="fill-zinc-400 dark:fill-zinc-500" />

            <rect x="320" y="190" width="340" height="52" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
            <text x="490" y="209" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              Authored the deploy SOP
            </text>
            <text x="490" y="224" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              now used by 40 engineers
            </text>

            {/* Bottom line */}
            <text x="340" y="275" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              Vague claims become credible when paired with specific evidence.
            </text>
          </svg>
        </div>

        <h2 className={h2}>Deconstruct Your Interpersonal Physics</h2>
        <p>Instead of declaring that you communicate well you must explicitly diagram a complex scenario where your communication solved an expensive corporate crisis. Tell us about the exact moment you intervened when the backend engineering team was completely failing to understand the latest feature requests from the marketing department. Explain the exact mechanism you used to bridge that gap.</p>
        <p>Did you establish a weekly cross functional alignment sync. Did you translate technical constraints into financial timelines that sales leaders could finally understand. When you describe the tactical deployment of your soft skills you instantly prove their existence without ever having to brag about them directly.</p>
        
        <div className={callout}>
          <h3 className={h3}>The Metric of Mentorship</h3>
          <p>Leadership is best measured in the quantifiable growth of the people around you. Do not claim you are a natural born leader. Instead explicitly state that over the past twelve months you directly onboarded three junior developers and actively mentored two of them into formal promotions. That is the irrefutable mathematics of soft skills.</p>
        </div>

        <h2 className={h2}>Documentation is Scalable Empathy</h2>
        <p>One of the strongest and most overlooked forms of teamwork in modern business is written documentation. Writing code only helps the company today but mapping out a strong internal knowledge base helps the entire technical organization for the next five years. You must treat your internal wikis and onboarding manuals as high-impact team accomplishments.</p>
        <p>State clearly that you authored the engineering deployment standard operating procedure that the entire technical department now uses daily to push code safely. That single bullet point screams to the recruiter that you care deeply about your peers and proactively work to make their lives infinitely easier. Documentation proves you possess elite organizational empathy.</p>
      </div>
  );
}
