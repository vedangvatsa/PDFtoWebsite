import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>There are hundreds of job search tools out there, and most of them want your credit card before you can do anything useful. The good news is that the best tools in each category are either free or have a free tier that covers what you actually need.</p>
        <p>I grouped these into five categories based on what they help with. Pick one tool from each category that fits your workflow. You don&apos;t need all ten. You need the right three or four for your situation.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 700 310" className="w-full h-auto" role="img" aria-label="Five job search tool categories with two tools each">
            <style>{`
              .cat-title { font: 600 12px system-ui; }
              .cat-tool { font: 400 10px system-ui; }
              .cat-icon { font: 400 22px system-ui; }
              .cat-heading { font: 600 13px system-ui; }
            `}</style>
            <text x="350" y="22" textAnchor="middle" className="cat-heading fill-zinc-500 dark:fill-zinc-400">Your Job Search Toolkit. One from Each Category</text>
            {/* Category 1: Resume & Profile */}
            <rect x="10" y="38" width="128" height="260" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="74" y="72" textAnchor="middle" className="cat-icon fill-zinc-400 dark:fill-zinc-500">📄</text>
            <text x="74" y="92" textAnchor="middle" className="cat-title fill-zinc-800 dark:fill-zinc-200">Resume &amp;</text>
            <text x="74" y="106" textAnchor="middle" className="cat-title fill-zinc-800 dark:fill-zinc-200">Profile</text>
            <line x1="34" y1="116" x2="114" y2="116" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <rect x="24" y="126" width="100" height="28" rx="5" className="fill-white dark:fill-zinc-900/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="74" y="144" textAnchor="middle" className="cat-tool fill-zinc-600 dark:fill-zinc-400">Google Docs</text>
            <rect x="24" y="162" width="100" height="28" rx="5" className="fill-white dark:fill-zinc-900/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="74" y="180" textAnchor="middle" className="cat-tool fill-zinc-600 dark:fill-zinc-400">CVin.Bio</text>
            {/* Category 2: Job Tracking */}
            <rect x="150" y="38" width="128" height="260" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="214" y="72" textAnchor="middle" className="cat-icon fill-zinc-400 dark:fill-zinc-500">☑️</text>
            <text x="214" y="92" textAnchor="middle" className="cat-title fill-zinc-800 dark:fill-zinc-200">Job</text>
            <text x="214" y="106" textAnchor="middle" className="cat-title fill-zinc-800 dark:fill-zinc-200">Tracking</text>
            <line x1="174" y1="116" x2="254" y2="116" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <rect x="164" y="126" width="100" height="28" rx="5" className="fill-white dark:fill-zinc-900/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="214" y="144" textAnchor="middle" className="cat-tool fill-zinc-600 dark:fill-zinc-400">Notion</text>
            <rect x="164" y="162" width="100" height="28" rx="5" className="fill-white dark:fill-zinc-900/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="214" y="180" textAnchor="middle" className="cat-tool fill-zinc-600 dark:fill-zinc-400">Teal / Huntr</text>
            {/* Category 3: Interview Prep */}
            <rect x="290" y="38" width="128" height="260" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="354" y="72" textAnchor="middle" className="cat-icon fill-zinc-400 dark:fill-zinc-500">💬</text>
            <text x="354" y="92" textAnchor="middle" className="cat-title fill-zinc-800 dark:fill-zinc-200">Interview</text>
            <text x="354" y="106" textAnchor="middle" className="cat-title fill-zinc-800 dark:fill-zinc-200">Prep</text>
            <line x1="314" y1="116" x2="394" y2="116" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <rect x="304" y="126" width="100" height="28" rx="5" className="fill-white dark:fill-zinc-900/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="354" y="144" textAnchor="middle" className="cat-tool fill-zinc-600 dark:fill-zinc-400">Pramp</text>
            <rect x="304" y="162" width="100" height="28" rx="5" className="fill-white dark:fill-zinc-900/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="354" y="180" textAnchor="middle" className="cat-tool fill-zinc-600 dark:fill-zinc-400">Interviewing.io</text>
            {/* Category 4: Networking */}
            <rect x="430" y="38" width="128" height="260" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="494" y="72" textAnchor="middle" className="cat-icon fill-zinc-400 dark:fill-zinc-500">👥</text>
            <text x="494" y="92" textAnchor="middle" className="cat-title fill-zinc-800 dark:fill-zinc-200">Networking</text>
            <text x="494" y="106" textAnchor="middle" className="cat-title fill-zinc-800 dark:fill-zinc-200">&nbsp;</text>
            <line x1="454" y1="116" x2="534" y2="116" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <rect x="444" y="126" width="100" height="28" rx="5" className="fill-white dark:fill-zinc-900/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="494" y="144" textAnchor="middle" className="cat-tool fill-zinc-600 dark:fill-zinc-400">LinkedIn</text>
            <rect x="444" y="162" width="100" height="28" rx="5" className="fill-white dark:fill-zinc-900/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="494" y="180" textAnchor="middle" className="cat-tool fill-zinc-600 dark:fill-zinc-400">Twitter / X</text>
            {/* Category 5: Skills Testing */}
            <rect x="570" y="38" width="128" height="260" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="634" y="72" textAnchor="middle" className="cat-icon fill-zinc-400 dark:fill-zinc-500">⌨️</text>
            <text x="634" y="92" textAnchor="middle" className="cat-title fill-zinc-800 dark:fill-zinc-200">Skills</text>
            <text x="634" y="106" textAnchor="middle" className="cat-title fill-zinc-800 dark:fill-zinc-200">Testing</text>
            <line x1="594" y1="116" x2="674" y2="116" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <rect x="584" y="126" width="100" height="28" rx="5" className="fill-white dark:fill-zinc-900/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="634" y="144" textAnchor="middle" className="cat-tool fill-zinc-600 dark:fill-zinc-400">LeetCode</text>
            <rect x="584" y="162" width="100" height="28" rx="5" className="fill-white dark:fill-zinc-900/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="634" y="180" textAnchor="middle" className="cat-tool fill-zinc-600 dark:fill-zinc-400">HackerRank</text>
            {/* Bottom tip */}
            <text x="350" y="228" textAnchor="middle" className="cat-tool fill-zinc-400 dark:fill-zinc-500">Pick one from each column. You don&apos;t need all ten.</text>
          </svg>
        </div>


        <h2 className={h2}>Resume and Profile Tools</h2>

        <h3 className={h3}>1. Google Docs</h3>
        <p>Google Docs is still the best free tool for writing your resume. It sounds boring, and it is. That is exactly why it works. You get a clean single-column document that exports to.docx without breaking your formatting. It auto-saves, supports comments from friends who review your drafts, and runs in any browser.</p>
        <p>The main limit is design. Google Docs resumes look plain. If you are going for a role where visual design matters, you will want something with more layout control. But for most tech roles, clean and readable beats pretty every time.</p>
        <p><span className={bold}>Best for:</span> anyone who wants a simple, ATS-friendly resume they can edit from any device.</p>

        <h3 className={h3}>2. CVin.Bio</h3>
        <p>CVin.Bio turns your resume into a web page with a short URL you can share anywhere. Instead of attaching a PDF that might break inside an applicant tracking system, you send a link like <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">cvin.bio/yourname</code>. The recruiter reads your profile in a browser. No file to download, no parsing issues.</p>
        <p>The free tier gives you a public profile page. It is a good option if you want something more than a static document but don&apos;t want to build a full personal website. The limitation is that you are working within a template, so if you want total control over your layout, a personal site gives you more freedom. You can read more about why <Link href="/link" className={link}>adding a URL to your resume helps</Link>.</p>
        <p><span className={bold}>Best for:</span> developers and tech workers who want a shareable profile without building a site from scratch.</p>

        <h2 className={h2}>Job Tracking Tools</h2>

        <h3 className={h3}>3. Notion Job Tracker Templates</h3>
        <p>Notion has dozens of free job tracker templates shared by the community. You get a database where you log each application with columns for company, role, status, date applied, follow-up date, and notes. It is flexible enough to customize without spending hours setting things up.</p>
        <p>The downside is that Notion is a general-purpose tool. It does not auto-import job postings or connect to job boards. You are doing the data entry yourself. For some people that is fine. For others it becomes a chore that gets abandoned after two weeks.</p>
        <p><span className={bold}>Best for:</span> people who already use Notion and want their job search in the same workspace as their notes.</p>

        <h3 className={h3}>4. Teal</h3>
        <p>Teal is a dedicated job tracking tool with a free tier that covers the basics. It has a browser extension that saves job postings with one click, a CRM-style board for tracking applications, and a resume builder that helps you tailor your resume to specific postings.</p>
        <p>The free version limits how many resumes you can save and some AI-powered features are behind the paywall. But for tracking applications and keeping everything organized, the free tier does the job. Teal is good at connecting job postings to your applications so you can see which version of your resume went where.</p>
        <p><span className={bold}>Best for:</span> people applying to many roles who need structure to stay on top of follow-ups.</p>

        <h3 className={h3}>5. Huntr</h3>
        <p>Huntr gives you a Kanban board for your job search. You move applications through columns like &quot;Wishlist,&quot; &quot;Applied,&quot; &quot;Interview,&quot; and &quot;Offer.&quot; It is visual and simple. If you think in boards rather than spreadsheets, this might click better than Notion.</p>
        <p>The free plan limits you to 40 jobs on the board at a time. That is enough for most searches, but if you are doing a high-volume spray-and-pray approach, you will hit the ceiling fast. Huntr also has a job search feature built in, though it pulls from the same sources you probably already check.</p>
        <p><span className={bold}>Best for:</span> visual thinkers who prefer drag-and-drop boards over tables and spreadsheets.</p>

        <div className={callout}>
          <h3 className={h3}>A note on tracking</h3>
          <p>The specific tool matters less than the habit. Pick any tracker and actually use it. The worst outcome is applying to roles and losing track of where you stand. When a recruiter emails you three weeks later about a role, you want to remember which job posting it was and what resume you sent.</p>
        </div>

        <h2 className={h2}>Interview Prep Tools</h2>

        <h3 className={h3}>6. Pramp</h3>
        <p>Pramp pairs you with another person for live mock interviews. You take turns being the interviewer and the candidate. It is free and covers coding, system design, and behavioral interviews. The peer matching is random, so quality varies, but the practice of talking through problems out loud is valuable no matter who you are paired with.</p>
        <p>The big advantage is that it feels like a real interview. You are on camera with a stranger, working through a problem with a time limit. That pressure is hard to simulate by practicing alone. The downside is scheduling. You need to book a slot and show up, which takes more effort than grinding problems solo.</p>
        <p><span className={bold}>Best for:</span> anyone who gets nervous in live interviews and needs practice with the social pressure of performing in front of someone.</p>

        <h3 className={h3}>7. Interviewing.io</h3>
        <p>Interviewing.io offers anonymous mock interviews with engineers from real companies. The free tier gives you access to peer practice. Paid options get you paired with FAANG engineers who give detailed feedback. Even on the free side, the anonymous format removes the pressure of your real identity being attached to a bad performance.</p>
        <p>The main limit on the free plan is availability. Slots fill up and you may wait days to get a match. But if you are serious about interview prep and want feedback from people who have been on hiring committees, it is worth the wait. It is particularly good for system design rounds where talking through your thinking matters as much as the answer.</p>
        <p><span className={bold}>Best for:</span> mid-to-senior engineers preparing for technical interviews at competitive companies.</p>

        <h2 className={h2}>Networking Tools</h2>

        <h3 className={h3}>8. LinkedIn</h3>
        <p>LinkedIn is obvious, and that is why it belongs on this list. It is where most recruiters search for candidates. Having a complete LinkedIn profile is not optional for job seekers in 2026. Your profile shows up in search results, and recruiters use it to vet candidates before reaching out.</p>
        <p>The free version does everything most people need: a profile, messaging, job listings, and the ability to connect with people. You can also see who viewed your profile and follow companies you are interested in. The feed is noisy and full of humble-brag posts, but you can ignore that entirely and just use it as a professional directory.</p>
        <p>For advice on getting past automated screening, check out how to <Link href="/bypass" className={link}>bypass ATS filters</Link>.</p>
        <p><span className={bold}>Best for:</span> literally everyone. It is the baseline, not the ceiling.</p>

        <h3 className={h3}>9. Twitter/X</h3>
        <p>Twitter/X is underrated as a job search tool, especially in tech. Many hiring managers post openings on their personal accounts before they hit job boards. Following engineers, VPs of engineering, and CTOs at companies you want to join gives you a direct line to opportunities that never show up on LinkedIn.</p>
        <p>The catch is that Twitter/X requires you to be active. You need to post, reply, and engage with the community to build visibility. It is not something you can set up and forget. But if you enjoy writing short takes about your work, it can open doors that a polished resume alone cannot.</p>
        <p><span className={bold}>Best for:</span> developers who enjoy public writing and want to build relationships with people at companies they are targeting.</p>

        <h2 className={h2}>Skills Testing Tools</h2>

        <h3 className={h3}>10. LeetCode and HackerRank</h3>
        <p>I am listing these together because they serve the same purpose: practicing the coding problems you will face in technical interviews. LeetCode has the larger problem set and more active discussion forums. HackerRank has a cleaner interface and is used directly by some companies as their screening tool.</p>
        <p>Both have generous free tiers. LeetCode&apos;s free plan gives you access to most problems. HackerRank lets you practice across multiple languages and domains. The downside of both is that they can become a trap. People spend months grinding problems instead of actually applying to jobs. Use them for targeted practice, not as a way to avoid putting yourself out there.</p>
        <p>If you want to know how to handle AI screening on top of the human interviews, read about <Link href="/bots" className={link}>beating AI resume bots</Link>.</p>
        <p><span className={bold}>Best for:</span> engineers preparing for coding interviews at companies that use algorithmic problem-solving as a filter.</p>

        <div className={callout}>
          <h3 className={h3}>The tool trap</h3>
          <p>Setting up tools feels productive. Customizing your Notion board with color-coded tags and automated reminders feels like progress. It is not. The only thing that moves your job search forward is submitting applications, talking to people, and practicing for interviews. Pick your tools quickly and spend your energy on the actual work.</p>
        </div>

        <h2 className={h2}>How to Pick Your Stack</h2>
        <p>Start with one tool from each category that matters to you. At minimum you need a way to write your resume (Google Docs), a way to share it beyond file attachments (a web profile link), and a way to track where you have applied (any tracker). Add interview prep tools when you start getting callbacks.</p>
        <p>Don&apos;t sign up for everything on this list today. You will spend more time managing your tools than using them. Start lean. Add tools only when you feel a specific gap in your process.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/link" className={link}>Why a URL is the best thing on your resume</Link></li>
          <li><Link href="/bypass" className={link}>How to get your resume past ATS filters</Link></li>
          <li><Link href="/bots" className={link}>How to beat smart AI resume bots</Link></li>
        </ul>
      </div>
  );
}
