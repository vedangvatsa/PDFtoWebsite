import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>A shocking number of highly qualified professionals assume that hiring managers will read their entire work history from top to bottom like a novel. They hide their most impressive technical achievements at the very end of long sprawling paragraphs. This guarantees failure because absolutely no one reads a career page word for word on the first pass. We scan it.</p>
        <p>A senior recruiter will typically spend less than thirty seconds looking at your profile before deciding if you move to the interview phase. We use a Z shaped reading pattern. We quickly sweep the top banner then drag our eyes quickly down the left margin looking for recognizable company names and core technical keywords before jumping to the bottom. If you do not hook us immediately we close the tab.</p>

        {/* Visual: Simplified resume mockup with Z-shaped eye-tracking path */}
        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 350" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Resume page outline */}
            <rect x="180" y="20" width="320" height="310" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" />

            {/* Header section */}
            <rect x="200" y="36" width="140" height="10" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="200" y="52" width="90" height="6" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Contact info (right side of header) */}
            <rect x="400" y="36" width="80" height="6" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="420" y="48" width="60" height="6" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Experience lines */}
            <rect x="200" y="78" width="60" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="200" y="94" width="260" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="200" y="105" width="240" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="200" y="116" width="250" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            <rect x="200" y="136" width="80" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="200" y="152" width="260" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="200" y="163" width="230" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="200" y="174" width="250" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            <rect x="200" y="194" width="70" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="200" y="210" width="260" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="200" y="221" width="240" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Skills section at bottom */}
            <rect x="200" y="248" width="40" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="200" y="264" width="50" height="16" rx="8" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="258" y="264" width="60" height="16" rx="8" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="326" y="264" width="45" height="16" rx="8" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="379" y="264" width="55" height="16" rx="8" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="200" y="288" width="65" height="16" rx="8" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="273" y="288" width="50" height="16" rx="8" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Z-Path overlay */}
            {/* Leg 1: Top-left to Top-right */}
            <line x1="198" y1="38" x2="484" y2="38" className="stroke-emerald-500" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.8" />
            {/* Leg 2: Top-right to Bottom-left (diagonal) */}
            <line x1="484" y1="38" x2="198" y2="270" className="stroke-emerald-500" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.8" />
            {/* Leg 3: Bottom-left to Bottom-right */}
            <line x1="198" y1="270" x2="440" y2="270" className="stroke-emerald-500" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.8" />

            {/* Z dots */}
            <circle cx="198" cy="38" r="5" className="fill-emerald-500" />
            <circle cx="484" cy="38" r="4" className="fill-emerald-500" />
            <circle cx="198" cy="270" r="4" className="fill-emerald-500" />
            <circle cx="440" cy="270" r="4" className="fill-emerald-500" />

            {/* Timing labels */}
            <text x="24" y="42" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">
              0–2s
            </text>
            <text x="24" y="54" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              Name &amp; title
            </text>

            <text x="24" y="160" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">
              2–4s
            </text>
            <text x="24" y="172" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              Left margin scan
            </text>

            <text x="24" y="274" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">
              4–6s
            </text>
            <text x="24" y="286" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              Bottom skills check
            </text>

            {/* Label */}
            <text x="340" y="345" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              You have 6 seconds. Make every zone count.
            </text>
          </svg>
        </div>

        <h2 className={h2}>Front Loading Your Value</h2>
        <p>You must completely restructure your bullet points for extreme visual impact. Every single sentence must be front loaded. This means you mathematically pull the highest value piece of information the massive revenue saved or the core programming language directly to the very first few words of the line.</p>
        <p>Do not write that you collaborated with a diverse team of software engineers over a period of six months to successfully launch a new Python microservice. That buries the critical word Python way too deep. We will never see it. Write it like this. Launched Python microservice with five engineers in under six months. The technical trigger word hits our eyes instantly.</p>
        
        <div className={callout}>
          <h3 className={h3}>The Left Margin Test</h3>
          <p>Cover up the entire right half of your screen. Look only at the first three words of every bullet point you have written. If those three words do not instantly communicate a highly valuable technical skill or a massive business win you are failing the scan test. Delete the introductory filler and start the sentence with the winning word.</p>
        </div>

        <h2 className={h2}>Embrace Blank Space</h2>
        <p>Dense walls of text actively repel human eyes. When a tired manager sees a giant block of unbroken words their brain immediately assumes the reading task is too difficult and they start skimming. You must treat whitespace as a luxurious design asset.</p>
        <p>Use very tight spacing. Break concepts apart. Limit yourself strictly to one sentence per bullet point. This visual breathing room forces the eye to naturally stop and ingest the information rather than sliding hopelessly over a massive block of gray text.</p>
      </div>
  );
}
