import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>Graduating from an intense academic program often instills a dangerous mindset when entering the commercial job market. Many candidates who spend six years earning a doctorate naturally assume that corporate hiring managers will instantly bow to their deep theoretical expertise. Unfortunately the modern technology sector operates on an entirely different axis of value. Businesses survive on shipped products not published theories.</p>
        <p>When a hiring manager reviews a heavily academic profile they experience an immediate twinge of fear. They worry that you will treat every basic database query like a six month research grant. They fear you possess zero urgency and lack the brutal pragmatism required to launch a messy but profitable feature by Friday afternoon. You must aggressively rewrite your academic history to destroy this bias.</p>
        
        <h2 className={h2}>Reframing the Laboratory as a Startup</h2>
        <p>The secret to successfully pitching a doctorate is translation. You must strip away all the prestigious sounding university jargon and describe your research laboratory exactly as if it were a high growth technology startup. Your complex dissertation was fundamentally just a multi year product lifecycle. Your frantic test scripts were early valid tests for real customer behavior patterns.</p>
        <p>Write about your academic tenure using strictly commercial verbs. Say that you architected and maintained a massive data pipeline that processed terabytes of messy inputs daily. Detail how you secured strict funding approvals by successfully pitching your architecture directly to skeptical institutional stakeholders. This frames you as a battle tested operator.</p>
        
        <div className={callout}>
          <h3 className={h3}>Delete the Deep Theory</h3>
          <p>Your future corporate boss does not understand the nuanced theoretical math inside your published papers and they do not want to learn it. Delete the long academic titles of your research entirely. Focus purely on the massive computational scale you handled and how you optimized the server costs to keep your lab budget from exploding.</p>
        </div>

        {/* Visual: Academic language translated to commercial equivalents with arrows */}
        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 310" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Column Headers */}
            <text x="140" y="26" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              Academic Language
            </text>
            <text x="540" y="26" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              Commercial Translation
            </text>

            {/* Row 1 */}
            <rect x="20" y="44" width="240" height="44" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="140" y="71" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              Dissertation research
            </text>

            <line x1="260" y1="66" x2="400" y2="66" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="400,62 408,66 400,70" className="fill-zinc-400 dark:fill-zinc-500" />

            <rect x="410" y="44" width="252" height="44" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
            <text x="536" y="71" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              Multi-year product lifecycle
            </text>

            {/* Row 2 */}
            <rect x="20" y="100" width="240" height="44" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="140" y="127" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              Secured grant funding
            </text>

            <line x1="260" y1="122" x2="400" y2="122" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="400,118 408,122 400,126" className="fill-zinc-400 dark:fill-zinc-500" />

            <rect x="410" y="100" width="252" height="44" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
            <text x="536" y="121" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              Pitched architecture
            </text>
            <text x="536" y="134" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              to stakeholders
            </text>

            {/* Row 3 */}
            <rect x="20" y="156" width="240" height="44" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="140" y="176" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              Published in peer-
            </text>
            <text x="140" y="189" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              reviewed journal
            </text>

            <line x1="260" y1="178" x2="400" y2="178" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="400,174 408,178 400,182" className="fill-zinc-400 dark:fill-zinc-500" />

            <rect x="410" y="156" width="252" height="44" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
            <text x="536" y="176" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              Shipped technical
            </text>
            <text x="536" y="189" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              documentation
            </text>

            {/* Row 4 */}
            <rect x="20" y="212" width="240" height="44" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="140" y="239" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              Managed lab resources
            </text>

            <line x1="260" y1="234" x2="400" y2="234" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="400,230 408,234 400,238" className="fill-zinc-400 dark:fill-zinc-500" />

            <rect x="410" y="212" width="252" height="44" rx="6" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800" strokeWidth="1" />
            <text x="536" y="232" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              Managed team budget
            </text>
            <text x="536" y="245" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              and tooling
            </text>

            {/* Takeaway */}
            <text x="340" y="292" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              Same work. Different framing. Entirely different perception.
            </text>
          </svg>
        </div>

        <h2 className={h2}>Proving Extreme Velocity</h2>
        <p>Because the primary fear regarding academics is sluggish perfectionism you must constantly highlight your speed. Dedicate a massive section of your profile to a specific moment where you abandoned theory and built a dirty script overnight just to hit a brutal deadline. Prove that you know when to be a meticulous scientist and when to be a fast shipping hacker.</p>
        <p>Highlight moments where you collaborated with external departments or presented data to non technical audiences. Showing that you can explain complex algorithms to business majors instantly raises your corporate value and completely separates you from the stereotype of the isolated researcher.</p>
      </div>
  );
}
