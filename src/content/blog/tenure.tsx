import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>In the traditional corporate world staying at a company for only ten months was considered a massive red flag. Recruiters viewed fast exits as irrefutable proof of either severe performance issues or toxic personality conflicts. Many hiring managers would completely throw away an application if they spotted two short stints back to back.</p>
        <p>The modern startup world has entirely shattered those old rules. Rapid layoffs and sudden pivot mandates happen constantly. Companies run out of venture funding overnight forcing entire engineering departments to hunt for new jobs on the exact same weekend. However even though short tenures are common today you still must completely control the narrative on your profile.</p>

        {/* Visual: Horizontal bar chart showing 3 short job tenures with contextual labels */}
        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 660 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Title */}
            <text x="330" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              Short Tenures — With Context
            </text>

            {/* Row 1: 8 months */}
            <text x="20" y="75" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              Role 1
            </text>
            <rect x="80" y="60" width="160" height="24" rx="4" className="fill-emerald-500" opacity="0.85" />
            <text x="90" y="77" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-white">
              8 months
            </text>
            <text x="252" y="77" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              Company acquired
            </text>

            {/* Row 2: 14 months */}
            <text x="20" y="125" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              Role 2
            </text>
            <rect x="80" y="110" width="280" height="24" rx="4" className="fill-emerald-500" opacity="0.85" />
            <text x="90" y="127" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-white">
              14 months
            </text>
            <text x="372" y="127" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              Team pivot to new product
            </text>

            {/* Row 3: 6 months */}
            <text x="20" y="175" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              Role 3
            </text>
            <rect x="80" y="160" width="120" height="24" rx="4" className="fill-emerald-500" opacity="0.85" />
            <text x="90" y="177" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-white">
              6 months
            </text>
            <text x="212" y="177" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              Contract role
            </text>

            {/* Scale marks */}
            <line x1="80" y1="200" x2="80" y2="206" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
            <text x="80" y="218" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">0</text>

            <line x1="200" y1="200" x2="200" y2="206" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
            <text x="200" y="218" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">6 mo</text>

            <line x1="320" y1="200" x2="320" y2="206" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
            <text x="320" y="218" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">12 mo</text>

            <line x1="440" y1="200" x2="440" y2="206" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
            <text x="440" y="218" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">18 mo</text>

            {/* Baseline */}
            <line x1="80" y1="200" x2="440" y2="200" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

            {/* Takeaway */}
            <text x="330" y="252" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              Short stays are normal — when context is visible.
            </text>
          </svg>
        </div>

        <h2 className={h2}>The Silent Danger of the Gap</h2>
        <p>When you present a string of six month jobs without any written explanation you give the recruiter permission to imagine the worst possible scenario. Human nature is naturally anxious especially when placing a permanent hire. If you leave the reason for your exit blank the reader will simply assume that you failed the probationary review period and were quietly fired.</p>
        <p>You must actively remove the guesswork. You have the total power to reframe a negative short sprint into a highly positive story of adaptability and speed.</p>
        
        <h2 className={h2}>Contract Labelling Reverses Risk</h2>
        <p>If a role was genuinely intended to be a short burst of contract work you must label it with perfect clarity. Appending the exact word Contract or Temporary Engagement next to the job title completely removes all the negative stigma associated with a fast exit.</p>
        <p>Suddenly a three month job is no longer a failure. It becomes proof that a company trusted you enough to drop you into a crisis and you successfully delivered a fixed product on a tight legal deadline.</p>

        <div className={callout}>
          <h3 className={h3}>Addressing Corporate Layoffs</h3>
          <p>For genuine full time roles that were cruelly cut short by mass layoffs you should focus entirely on how incredibly fast you delivered value. Write clearly that the role was eliminated due to a corporate restructuring but immediately follow that up with proof that you shipped real production code by month two. This frames you as a high velocity contributor who simply caught bad luck.</p>
        </div>

        <h2 className={h2}>Grouping Micro Experiences</h2>
        <p>If you spent three miserable years jumping between highly unstable early stage startups that kept running out of money you should not list them individually. An endless list of tiny jobs looks visually chaotic and screams career instability.</p>
        <p>Instead group all of those short sprint startups together. Call yourself an Independent Startup Consultant for that three year block. Underneath that overarching title you can confidently list the three different apps you built. This entirely smooths out the visual timeline and upgrades your title to an authoritative advisor level.</p>
      </div>
  );
}
