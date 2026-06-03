import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>Modern application workflows rely almost entirely on automated software parsers for the initial screening pass. When candidates finally figure this out their instinct is to immediately game the system. They respond by dumping fifty different programming languages and trending technology acronyms into a gigantic block of text at the absolute bottom of their profile just to forcefully bypass the keyword filters.</p>
        <p>While this lazy tactic might trick a rudimentary software script it actively destroys your credibility the moment an experienced human recruiter finally opens the page. We instantly recognize this behavior as skill stuffing and it throws your entire history into extreme doubt.</p>
        
        <h2 className={h2}>The Rule of Technical Evidence</h2>
        <p>If you claim to be an elite expert in Docker or Kubernetes the technical recruiter is going to actively search your recent job bullet points looking for that exact word. We want to see how you used it to solve a corporate problem. If a trending word appears in your huge skills block but never shows up a single time in an actual practical project description we will safely assume you just watched a weekend tutorial on YouTube.</p>
        <p>Hiring managers do not buy abstract knowledge. They buy operational experience. We must clearly see the tool securely anchored to a verifiable business outcome otherwise it is just meaningless noise.</p>
        
        <div className={callout}>
          <h3 className={h3}>Contextual Tool Anchoring</h3>
          <p>Write detailed bullet points that explicitly anchor the specific technology to the pain point. Do not just list Cloud Storage under your skills section. Tell us inside your work history that you migrated a monolithic legacy service into AWS Lambda to cut weekly server hosting costs by half.</p>
        </div>

        {/* Visual: Skills audit showing which listed skills actually appear in work history */}
        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 660 320" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Column Headers */}
            <text x="40" y="28" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              Skill
            </text>
            <text x="300" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              In Skills Block
            </text>
            <text x="500" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">
              Used in Work History
            </text>

            {/* Divider */}
            <line x1="20" y1="40" x2="640" y2="40" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

            {/* Row 1: React — Both ✓ */}
            <text x="40" y="68" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">React</text>
            <circle cx="300" cy="63" r="8" className="fill-emerald-500" opacity="0.15" />
            <text x="300" y="67" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>
            <circle cx="500" cy="63" r="8" className="fill-emerald-500" opacity="0.15" />
            <text x="500" y="67" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>

            {/* Row 2: Python — Both ✓ */}
            <rect x="20" y="82" width="620" height="36" rx="4" className="fill-zinc-100 dark:fill-zinc-800" opacity="0.5" />
            <text x="40" y="105" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Python</text>
            <circle cx="300" cy="100" r="8" className="fill-emerald-500" opacity="0.15" />
            <text x="300" y="104" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>
            <circle cx="500" cy="100" r="8" className="fill-emerald-500" opacity="0.15" />
            <text x="500" y="104" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>

            {/* Row 3: TypeScript — Both ✓ */}
            <text x="40" y="142" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">TypeScript</text>
            <circle cx="300" cy="137" r="8" className="fill-emerald-500" opacity="0.15" />
            <text x="300" y="141" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>
            <circle cx="500" cy="137" r="8" className="fill-emerald-500" opacity="0.15" />
            <text x="500" y="141" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>

            {/* Row 4: SQL — Both ✓ */}
            <rect x="20" y="156" width="620" height="36" rx="4" className="fill-zinc-100 dark:fill-zinc-800" opacity="0.5" />
            <text x="40" y="179" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">SQL</text>
            <circle cx="300" cy="174" r="8" className="fill-emerald-500" opacity="0.15" />
            <text x="300" y="178" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>
            <circle cx="500" cy="174" r="8" className="fill-emerald-500" opacity="0.15" />
            <text x="500" y="178" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>

            {/* Row 5: Kubernetes — ✓ and ✗ (flagged) */}
            <text x="40" y="216" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Kubernetes</text>
            <circle cx="300" cy="211" r="8" className="fill-emerald-500" opacity="0.15" />
            <text x="300" y="215" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>
            <circle cx="500" cy="211" r="8" className="fill-red-400" opacity="0.15" />
            <text x="500" y="216" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-400">✗</text>

            {/* Row 6: GraphQL — ✓ and ✗ (flagged) */}
            <rect x="20" y="230" width="620" height="36" rx="4" className="fill-red-50 dark:fill-red-950" opacity="0.5" />
            <text x="40" y="253" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">GraphQL</text>
            <circle cx="300" cy="248" r="8" className="fill-emerald-500" opacity="0.15" />
            <text x="300" y="252" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>
            <circle cx="500" cy="248" r="8" className="fill-red-400" opacity="0.15" />
            <text x="500" y="253" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-400">✗</text>

            {/* Warning label */}
            <line x1="20" y1="278" x2="640" y2="278" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />
            <text x="330" y="305" textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">
              Skills listed but never referenced in work history look like keyword stuffing.
            </text>
          </svg>
        </div>

        <h2 className={h2}>Aggressive Self Pruning Matters</h2>
        <p>You must ruthlessly delete any tool from your list that you cannot confidently discuss for at least ten minutes during a high pressure technical interview. Candidates often list legacy languages they touched once five years ago just to make the list look longer and more impressive.</p>
        <p>Claiming ancient technologies you barely remember only sets you up for a fatal technical screening round. The interviewer will spot the lie and drill aggressively into your weak spot. Always prioritize a short list of absolute mastery over a long list of dangerous fakes.</p>
      </div>
  );
}
