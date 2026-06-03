import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>For several years a terrible design trend has plagued the professional hiring market. Candidates frequently download highly visual templates that encourage them to rate their own technical skills using graphic progress bars or abstract star ratings. You have likely seen profiles where a candidate gives themselves four out of five little gray dots for their mastery of Javascript.</p>
        <p>This formatting choice is an absolute disaster from a recruiting perspective. A graphic progress bar conveys absolutely zero verifiable information. If you rate yourself at eighty percent capacity for database management the manager has zero context for what that actually means. Does it mean you are eighty percent as good as the senior engineer at Google or does it mean you are just slightly better than the junior intern sitting next to you.</p>
        
        <h2 className={h2}>The Trap of Stated Weakness</h2>
        <p>The most devastating consequence of using visual skill bars is that you inevitably force yourself to document your own incompetence. If you design a beautiful five star scale and boldly claim five stars in Python you are naturally pressured to give yourself only three stars in AWS so you appear honest.</p>
        <p>By visually highlighting a three star rating you immediately flag to the hiring manager that you are fundamentally weak at AWS infrastructure. Why would you ever permanently carve a declaration of your own mediocrity directly into the prime real estate of your public profile. It makes absolutely no strategic sense.</p>
        
        <div className={callout}>
          <h3 className={h3}>The Binary Competence Rule</h3>
          <p>Technical skills exist in a purely binary state when applying for jobs. Either you possess the competence to confidently build commercial products with a tool or you do not. If you can pass a punishing technical interview on the subject you simply list the name of the tool as plain text. If you cannot you delete it entirely.</p>
        </div>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Divider */}
            <line x1="340" y1="10" x2="340" y2="270" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

            {/* Left Column Header */}
            <text x="170" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-400">What You Have</text>

            {/* Skill Bar 1: Python 80% */}
            <text x="30" y="68" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Python</text>
            <rect x="90" y="56" width="200" height="16" rx="3" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="90" y="56" width="160" height="16" rx="3" className="fill-zinc-400 dark:fill-zinc-500" />
            <text x="300" y="68" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">80%</text>

            {/* Skill Bar 2: AWS 60% */}
            <text x="30" y="108" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">AWS</text>
            <rect x="90" y="96" width="200" height="16" rx="3" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="90" y="96" width="120" height="16" rx="3" className="fill-zinc-400 dark:fill-zinc-500" />
            <text x="300" y="108" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">60%</text>

            {/* Skill Bar 3: Docker 40% */}
            <text x="30" y="148" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Docker</text>
            <rect x="90" y="136" width="200" height="16" rx="3" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="90" y="136" width="80" height="16" rx="3" className="fill-zinc-400 dark:fill-zinc-500" />
            <text x="300" y="148" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">40%</text>

            {/* Silly label */}
            <text x="170" y="185" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500" fontStyle="italic">80% of what? Says who?</text>

            {/* Right Column Header */}
            <text x="510" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-500">What Works</text>

            {/* Proof 1 */}
            <text x="360" y="64" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Python</text>
            <text x="360" y="80" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Built concurrent parser processing</text>
            <text x="360" y="93" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">2M records/day</text>

            {/* Proof 2 */}
            <text x="360" y="124" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">AWS</text>
            <text x="360" y="140" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Migrated monolith to Lambda,</text>
            <text x="360" y="153" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">cut hosting costs 50%</text>

            {/* Proof 3 */}
            <text x="360" y="184" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Docker</text>
            <text x="360" y="200" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Containerized 12 microservices</text>
            <text x="360" y="213" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">for CI/CD pipeline</text>

            {/* Bottom labels */}
            <rect x="100" y="240" width="140" height="26" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
            <text x="170" y="257" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-red-400">Meaningless numbers</text>

            <rect x="440" y="240" width="140" height="26" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1" />
            <text x="510" y="257" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-500">Verifiable proof</text>
          </svg>
        </div>

        <h2 className={h2}>Replacing Graphics with Architecture</h2>
        <p>Instead of drawing colorful abstract shapes you must prove your mastery purely through the architecture of your past projects. The hiring manager will know your Python skills are absolute perfection if they read a bullet point explaining how you wrote a concurrent Python script that parses millions of financial records daily without dropping a single packet.</p>
        <p>Competence is proven naturally within the context of the work you deliver. The moment you strip away the silly graphic ratings and force your project history to carry the weight of validation you instantly raise yourself from a junior applicant to a serious technical operator.</p>
      </div>
  );
}
