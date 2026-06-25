import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>Taking extended time away from work is normal. But candidates have been scared into thinking a gap of more than three months will ruin their career. This fear causes people to do foolish things on their profiles — stretching old job dates to cover empty months or removing months and only listing years.</p>
        <p>When you hide a career gap, you risk an automatic failure during background checks. If they discover you lied about a start or end date, all professional trust is gone. The recruiter will assume the worst and pull the offer. Do not hide the gap.</p>
        
        <h2 className={h2}>The Power of Explicit Labelling</h2>
        <p>The best way to handle a career break is to own it. Treat the missing time like a formal job entry. Put the start and end dates clearly on the page and give the gap an explicit title. Label it as a Planned Sabbatical or Full-Time Caregiver and the guessing game is over.</p>
        <p>When a hiring manager sees an unexplained gap, they assume you spent that time job hunting and getting rejected. When they see the same gap labeled as a deliberate choice, they respect it.</p>
        
        <div className={callout}>
          <h3 className={h3}>Transforming Shadows into Projects</h3>
          <p>If you spent your six-month gap learning a new programming language or building an independent application, name the gap after the project. List yourself as an Independent Developer and outline the technical stack you worked with. Self-directed engineering is respected by technical managers.</p>
        </div>

        {/* Visual: Two timelines — one with blank gap (bad), one with labeled gap (good) */}
        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* === TOP TIMELINE: Bad (unlabeled gap) === */}
            <text x="20" y="24" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-red-400">
              ✗ Without explanation
            </text>

            {/* Timeline axis */}
            <line x1="20" y1="60" x2="660" y2="60" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

            {/* Job block 1 */}
            <rect x="20" y="40" width="150" height="40" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
            <text x="95" y="57" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">
              Frontend Dev
            </text>
            <text x="95" y="70" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              2019–2021
            </text>

            {/* Job block 2 */}
            <rect x="180" y="40" width="140" height="40" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
            <text x="250" y="57" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">
              Sr. Engineer
            </text>
            <text x="250" y="70" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              2021–2022
            </text>

            {/* GAP — empty, question mark */}
            <text x="390" y="57" textAnchor="middle" fontSize="16" fontFamily="system-ui, sans-serif" className="fill-red-400">?</text>
            <text x="390" y="72" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-red-400">
              9 months
            </text>

            {/* Job block 3 */}
            <rect x="460" y="40" width="190" height="40" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
            <text x="555" y="57" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">
              Staff Engineer
            </text>
            <text x="555" y="70" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              2023–Present
            </text>

            {/* === Divider === */}
            <line x1="20" y1="110" x2="660" y2="110" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

            {/* === BOTTOM TIMELINE: Good (labeled gap) === */}
            <text x="20" y="140" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-500">
              ✓ With explanation
            </text>

            {/* Timeline axis */}
            <line x1="20" y1="176" x2="660" y2="176" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

            {/* Job block 1 */}
            <rect x="20" y="156" width="150" height="40" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
            <text x="95" y="173" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">
              Frontend Dev
            </text>
            <text x="95" y="186" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              2019–2021
            </text>

            {/* Job block 2 */}
            <rect x="180" y="156" width="140" height="40" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
            <text x="250" y="173" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">
              Sr. Engineer
            </text>
            <text x="250" y="186" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              2021–2022
            </text>

            {/* GAP — labeled */}
            <rect x="330" y="156" width="120" height="40" rx="4" className="fill-emerald-50 dark:fill-emerald-950 stroke-emerald-400 dark:stroke-emerald-700" strokeWidth="1" strokeDasharray="4 2" />
            <text x="390" y="171" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">
              Planned Sabbatical
            </text>
            <text x="390" y="183" textAnchor="middle" fontSize="8" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">
              Self-directed React
            </text>
            <text x="390" y="193" textAnchor="middle" fontSize="8" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">
              + AWS study
            </text>

            {/* Job block 3 */}
            <rect x="460" y="156" width="190" height="40" rx="4" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
            <text x="555" y="173" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">
              Staff Engineer
            </text>
            <text x="555" y="186" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              2023–Present
            </text>

            {/* Takeaway */}
            <text x="340" y="250" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              A blank gap invites suspicion. A labeled gap earns respect.
            </text>
          </svg>
        </div>

        <h2 className={h2}>Controlling the Interview Narrative</h2>
        <p>Once you label the gap on your profile, it becomes a strength instead of a secret. When you get asked about it during the phone screen, you can answer directly without fumbling.</p>
        <p>State that you took time away to handle family matters or travel, then pivot back to your readiness. Saying you stepped away and are now looking for a high-ownership role signals stability. Managers hire people who know what they want.</p>
      </div>
  );
}
