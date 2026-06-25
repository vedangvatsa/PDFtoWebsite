import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>For the last decade beating an Applicant Tracking System was a relatively primitive game. The software engines simply counted how many times specific technical terms appeared on your document and scored you based on that raw mathematical density. Candidates easily weaponized this by blindly pasting massive invisible blocks of tech keywords into the footer to score points.</p>
        <p>That era is completely dead. Modern enterprise recruiting software is powered by advanced large language models that actually read and comprehend the contextual narrative of your career history. These new smart systems actively detect semantic disjoints. If you paste a massive list of cloud certifications at the bottom of the page the AI immediately realizes you never actually wrote a single intelligent sentence about using them at your previous job.</p>
        
        <h2 className={h2}>The Demand for Contextual Validation</h2>
        <p>To rank at the absolute top of a modern AI tracking system you must construct highly coherent technical narratives. The language model algorithms are explicitly trained to reward profiles that link specific tools to specific corporate actions. You must surround every valuable keyword with strong verbs and tangible outcomes.</p>
        <p>If the job requires Docker do not just throw the word into an isolated bullet block. Integrate it deeply. Write a structured sentence explaining that you containerized a legacy application using Docker to guarantee identical deployment behaviors across fifty independent developer machines. The AI parser reads that sentence and instantly verifies your deep operational mastery.</p>
        
        <div className={callout}>
          <h3 className={h3}>The Action Adjacency Principle</h3>
          <p>Always physically position your most important technical tools immediately adjacent to a clear business action. State firmly that you deployed a predictive algorithm using PyTorch to reduce customer churn by twelve percent. The parser algorithms heavily reward clear cause and effect structures in your grammar.</p>
        </div>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 290" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Divider */}
            <line x1="340" y1="10" x2="340" y2="280" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

            {/* Left: Old ATS */}
            <text x="170" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Old ATS</text>
            <text x="170" y="44" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Keyword Counter</text>

            {/* Keyword box */}
            <rect x="30" y="60" width="280" height="130" rx="6" className="fill-zinc-50 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

            {/* Row 1 */}
            <text x="50" y="90" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">React</text>
            <text x="140" y="90" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">5 mentions</text>
            <text x="260" y="90" fontSize="14" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>

            {/* Row 2 */}
            <text x="50" y="122" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Python</text>
            <text x="140" y="122" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">3 mentions</text>
            <text x="260" y="122" fontSize="14" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>

            {/* Row 3 */}
            <text x="50" y="154" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Docker</text>
            <text x="140" y="154" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">0 mentions</text>
            <text x="260" y="154" fontSize="14" fontFamily="system-ui, sans-serif" className="fill-red-400">✗</text>

            {/* Separator lines */}
            <line x1="50" y1="100" x2="290" y2="100" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.5" />
            <line x1="50" y1="132" x2="290" y2="132" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.5" />

            {/* Right: New ATS */}
            <text x="510" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">New ATS</text>
            <text x="510" y="44" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Semantic Parser</text>

            {/* Semantic box */}
            <rect x="360" y="60" width="300" height="130" rx="6" className="fill-zinc-50 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

            {/* Semantic Row 1 */}
            <text x="380" y="85" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">React</text>
            <text x="380" y="100" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Used to build payment dashboard</text>
            <rect x="380" y="106" width="70" height="18" rx="4" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.5" />
            <text x="387" y="119" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓ Verified</text>

            <line x1="380" y1="130" x2="640" y2="130" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.5" />

            {/* Semantic Row 2 */}
            <text x="380" y="148" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Python</text>
            <text x="380" y="163" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Listed in skills, no project context</text>
            <rect x="380" y="169" width="70" height="18" rx="4" className="fill-amber-50 dark:fill-amber-900/20 stroke-amber-300 dark:stroke-amber-700" strokeWidth="0.5" />
            <text x="387" y="182" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-amber-500">⚠ Flagged</text>

            {/* Bottom insight */}
            <rect x="160" y="220" width="360" height="50" rx="6" className="fill-zinc-50 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="340" y="243" textAnchor="middle" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">New systems read meaning, not just count words.</text>
            <text x="340" y="259" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Every keyword needs a story behind it.</text>
          </svg>
        </div>

        <h2 className={h2}>Simplicity Survives the Machine</h2>
        <p>While the reading comprehension of parsing bots has evolved incredibly fast their ability to unentangle chaotic visual layouts remains surprisingly terrible. Complex multi column designs complex grid graphics and overlapping text boxes constantly cause the extraction engines to scramble your sentences into total gibberish.</p>
        <p>You must completely surrender your desire to create a visually wild document. Using a rigorously clean linear website link or a dead simple text structure guarantees that the language model ingests every single syllable of your history in perfect sequential order giving you the absolute highest possible match score.</p>
      </div>
  );
}
