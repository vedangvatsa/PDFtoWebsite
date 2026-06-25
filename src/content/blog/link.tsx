import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <h2 className={h2}>Sharing Is Effortless</h2>
        <p>A recruiter receives your URL and wants to share you with the hiring manager. They copy the link, paste it into Slack, and hit send. The hiring manager sees a <span className={bold}>rich preview card</span> with your photo, name, and headline, all rendered automatically.</p>
        <p>Now think about the PDF version of the same workflow. It involves downloading, hunting for the file, and re-uploading. This is why many hiring teams are choosing <Link href="/inbox" className={link}>candidates who simplify their inbox</Link>. Every step is a chance for the momentum to die.</p>

        <h2 className={h2}>Building a Personal Brand</h2>
        <p>A custom URL like cvin.bio/yourname is the beginning of your professional brand. It shows you have taken the time to shape your online presence. It moves you from being a "file on a server" to a "person with a platform." This subtle shift in status makes you more memorable when the team discusses candidates at the end of the week.</p>

        <h2 className={h2}>The Preview Card Effect</h2>
        <p>When you drop a URL into Slack, LinkedIn, iMessage, or WhatsApp, the platform automatically fetches your page metadata and renders a preview card showing:</p>
        <ul className={ul}>
          <li>Your custom OpenGraph image with your name</li>
          <li>Your current role and most impressive accolade</li>
          <li>A clean, professional summary that hooks the reader</li>
        </ul>
        <div className={callout}>
          <h3 className={h3}>Free advertising, every time</h3>
          <p>This is built into every messaging platform as the Open Graph protocol. You get a <span className={bold}>mini-billboard for your candidacy</span> every single time your URL gets pasted anywhere, completely free.</p>
        </div>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 660 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">

            {/* TOP SCENARIO — Boring Attachment */}
            <text x="30" y="24" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">What they see: Attachment</text>

            {/* Chat bubble */}
            <rect x="30" y="36" width="340" height="52" rx="10" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

            {/* Paperclip icon (simplified) */}
            <path d="M52 54 L52 70 Q52 76 58 76 Q64 76 64 70 L64 58 Q64 50 56 50 Q48 50 48 58 L48 70" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Filename */}
            <text x="78" y="62" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">Resume_John_2026.pdf</text>
            <text x="78" y="78" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">245 KB · PDF Document</text>

            {/* Red X — boring */}
            <text x="400" y="68" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-red-400 dark:fill-red-500">← Forgettable</text>

            {/* Divider */}
            <line x1="30" y1="115" x2="630" y2="115" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

            {/* BOTTOM SCENARIO — Rich Link Preview */}
            <text x="30" y="142" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">What they see: Link</text>

            {/* Chat bubble with link text */}
            <rect x="30" y="154" width="340" height="36" rx="10" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="50" y="177" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-blue-500 dark:fill-blue-400">cvin.bio/john-doe</text>

            {/* Rich preview card */}
            <rect x="30" y="196" width="340" height="72" rx="8" className="fill-white dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1.5" />

            {/* Left color bar on preview */}
            <rect x="30" y="196" width="4" height="72" rx="2" className="fill-emerald-500" />

            {/* Avatar square */}
            <rect x="46" y="208" width="44" height="44" rx="6" className="fill-emerald-100 dark:fill-emerald-800" />
            <text x="68" y="234" textAnchor="middle" fontSize="16" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-300">JD</text>

            {/* Name & role */}
            <text x="104" y="224" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">John Doe</text>
            <text x="104" y="240" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Senior Product Designer · 8 yrs exp</text>
            <text x="104" y="256" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">cvin.bio</text>

            {/* Green arrow — eye-catching */}
            <text x="400" y="240" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500 dark:fill-emerald-400">← Eye-catching</text>
          </svg>
        </div>

        <h2 className={h2}>The Analytics Benefit</h2>
        <p>One thing an attachment can never tell you is when it has been opened. With a web profile, you can track views. Knowing that your profile was viewed three times in the last hour from a specific city gives you a clear indication that a team is currently discussing you. This information is really useful for managing your own nerves and following up at the right time.</p>

        <h2 className={h2}>The Psychology of Clean URLs</h2>
        <p>There is a subtle effect at work. When someone receives <span className={bold}>&quot;cvin.bio/james&quot;</span> versus a file called &quot;James_Lee_SeniorDev_Resume_March2026_FINAL.pdf,&quot; the URL feels more credible. This person has their act together. They are not just looking for a job. They are managing a career.</p>

        <h2 className={h2}>Common Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>Will people think my URL is spam?</h3>
            <p>Not if you use a clean, professional domain like cvin.bio. In modern tech recruiting, URLs for portfolios and GitHub are the standard expectation.</p>
          </div>
          <div>
            <h3 className={h3}>Can I hide my profile if I am not currently looking?</h3>
            <p>Yes. You can toggle your profile to "Private" or "Draft" anytime. Unlike a PDF, you maintain full control over who sees your data and when.</p>
          </div>
          <div>
            <h3 className={h3}>How do I change my URL?</h3>
            <p>You can customize your slug (the "james" in cvin.bio/james) once per account. We recommend using your first and last name for maximum searchability.</p>
          </div>
        </div>

        <h2 className={h2}>Next Steps</h2>
        <ul className={ul}>
          <li><Link href="/inbox" className={link}>How to use clean URLs to stand out in a crowded inbox</Link></li>
          <li><Link href="/update" className={link}>The hidden benefit of being able to fix typos in real time</Link></li>
        </ul>
      </div>
  );
}
