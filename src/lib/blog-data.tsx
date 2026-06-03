import React from 'react';
import Link from 'next/link';

export type Author = {
  name: string;
  avatarUrl: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: Author;
  content: React.ReactNode;
  faqs?: {
    question: string;
    answer: string;
  }[];
};

const h2 = "text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors";
const h3 = "text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2 transition-colors";
const callout = "bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 my-6 transition-colors";
const ul = "list-disc pl-6 space-y-2";
const ol = "list-decimal pl-6 space-y-2";
const bold = "font-semibold text-zinc-900 dark:text-zinc-50 transition-colors";
const link = "text-primary underline hover:text-primary/80 transition-colors font-medium";

export const blogPosts: BlogPost[] = [
  {
    slug: 'best-job-seeker-tools',
    title: 'Best Free Tools for Job Seekers in 2026',
    excerpt: 'Ten free tools across five categories that actually help you land interviews, not just feel productive.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'What free tools should every job seeker use?', answer: 'At minimum you need a solid resume drafting tool like Google Docs, a job tracking system like Notion or Teal, and a web profile link you can share with recruiters. Those three cover the basics of creating, organizing, and sharing your job search.' },
      { question: 'Are free job search tools good enough or do I need to pay?', answer: 'For most people, yes. Free tiers of tools like Teal, Pramp, and LeetCode cover 90% of what you need. Paid plans usually add features like unlimited tracking or premium problem sets, which matter more for heavy users than casual job seekers.' },
      { question: 'How many job search tools should I use at once?', answer: 'Pick one from each category that matters to you. One drafting tool, one tracker, one interview prep platform. Using too many tools creates busywork that feels productive but does not actually move you closer to an offer.' },
    ],
    author: {
      name: 'Sarah M.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    },
    content: (
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
            <text x="350" y="22" textAnchor="middle" className="cat-heading fill-zinc-500 dark:fill-zinc-400">Your Job Search Toolkit — One from Each Category</text>
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
        <p>Google Docs is still the best free tool for writing your resume. It sounds boring, and it is. That is exactly why it works. You get a clean single-column document that exports to .docx without breaking your formatting. It auto-saves, supports comments from friends who review your drafts, and runs in any browser.</p>
        <p>The main limit is design. Google Docs resumes look plain. If you are going for a role where visual design matters, you will want something with more layout control. But for most tech roles, clean and readable beats pretty every time.</p>
        <p><span className={bold}>Best for:</span> anyone who wants a simple, ATS-friendly resume they can edit from any device.</p>

        <h3 className={h3}>2. CVin.Bio</h3>
        <p>CVin.Bio turns your resume into a web page with a short URL you can share anywhere. Instead of attaching a PDF that might break inside an applicant tracking system, you send a link like <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">cvin.bio/yourname</code>. The recruiter reads your profile in a browser. No file to download, no parsing issues.</p>
        <p>The free tier gives you a public profile page. It is a good option if you want something more than a static document but don&apos;t want to build a full personal website. The limitation is that you are working within a template, so if you want total control over your layout, a personal site gives you more freedom. You can read more about why <Link href="/cv-web-link" className={link}>adding a URL to your resume helps</Link>.</p>
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
        <p>For advice on getting past automated screening, check out how to <Link href="/bypass-ats" className={link}>bypass ATS filters</Link>.</p>
        <p><span className={bold}>Best for:</span> literally everyone. It is the baseline, not the ceiling.</p>

        <h3 className={h3}>9. Twitter/X</h3>
        <p>Twitter/X is underrated as a job search tool, especially in tech. Many hiring managers post openings on their personal accounts before they hit job boards. Following engineers, VPs of engineering, and CTOs at companies you want to join gives you a direct line to opportunities that never show up on LinkedIn.</p>
        <p>The catch is that Twitter/X requires you to be active. You need to post, reply, and engage with the community to build visibility. It is not something you can set up and forget. But if you enjoy writing short takes about your work, it can open doors that a polished resume alone cannot.</p>
        <p><span className={bold}>Best for:</span> developers who enjoy public writing and want to build relationships with people at companies they are targeting.</p>

        <h2 className={h2}>Skills Testing Tools</h2>

        <h3 className={h3}>10. LeetCode and HackerRank</h3>
        <p>I am listing these together because they serve the same purpose: practicing the coding problems you will face in technical interviews. LeetCode has the larger problem set and more active discussion forums. HackerRank has a cleaner interface and is used directly by some companies as their screening tool.</p>
        <p>Both have generous free tiers. LeetCode&apos;s free plan gives you access to most problems. HackerRank lets you practice across multiple languages and domains. The downside of both is that they can become a trap. People spend months grinding problems instead of actually applying to jobs. Use them for targeted practice, not as a way to avoid putting yourself out there.</p>
        <p>If you want to know how to handle AI screening on top of the human interviews, read about <Link href="/beat-smart-ai-bots" className={link}>beating AI resume bots</Link>.</p>
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
          <li><Link href="/cv-web-link" className={link}>Why a URL is the best thing on your resume</Link></li>
          <li><Link href="/bypass-ats" className={link}>How to get your resume past ATS filters</Link></li>
          <li><Link href="/beat-smart-ai-bots" className={link}>How to beat smart AI resume bots</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'best-linkedin-alternatives-developers',
    title: 'Best LinkedIn Alternatives for Developers',
    excerpt: 'Seven places to build a professional presence without the LinkedIn noise, and why most developers should use at least two.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'Should developers delete their LinkedIn profile?', answer: 'No. LinkedIn has the largest recruiter network and the most job listings. The smart move is to keep LinkedIn active while building a presence on one or two other platforms that better show your actual work. Think of LinkedIn as your baseline, not your only option.' },
      { question: 'What is the best LinkedIn alternative for software engineers?', answer: 'It depends on what you want. GitHub is best for showing your code. A personal website gives you total control. CVin.Bio splits the difference with a structured resume page that is easy to set up. Most developers benefit from picking one that plays to their strengths.' },
      { question: 'Do recruiters look at platforms other than LinkedIn?', answer: 'Yes, especially in tech. Many recruiters check GitHub profiles, personal websites, and portfolio links before making contact. Some companies specifically search GitHub and Stack Overflow for candidates. Having a strong presence outside LinkedIn gives recruiters more to work with when they evaluate you.' },
    ],
    author: {
      name: 'Daniel R.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>LinkedIn is fine. It works. Recruiters use it. But a lot of developers feel like their LinkedIn profile does not actually represent what they do. Your best work is code, writing, and projects. LinkedIn turns all of that into a list of job titles and buzzword-filled descriptions.</p>
        <p>The good news is you have options. Here are seven alternatives, what each one is good at, and who should use them. I will say up front: most developers should keep LinkedIn AND have at least one of these. The point is not to replace LinkedIn entirely. It is to have a place where your work speaks louder than your job titles.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 520 400" className="w-full h-auto" role="img" aria-label="Hub and spoke diagram showing LinkedIn in the center with six alternatives radiating outward">
            <style>{`
              .hub-label { font: 600 13px system-ui; }
              .spoke-name { font: 600 11px system-ui; }
              .spoke-desc { font: 400 9px system-ui; }
              .hub-title { font: 600 14px system-ui; }
            `}</style>
            {/* Connecting lines from center to each node */}
            <line x1="260" y1="200" x2="260" y2="62" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="260" y1="200" x2="260" y2="338" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="260" y1="200" x2="88" y2="112" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="260" y1="200" x2="432" y2="112" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="260" y1="200" x2="88" y2="288" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="260" y1="200" x2="432" y2="288" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" strokeDasharray="4 3" />
            {/* Center hub: LinkedIn */}
            <circle cx="260" cy="200" r="42" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" />
            <text x="260" y="196" textAnchor="middle" className="hub-label fill-zinc-700 dark:fill-zinc-300">LinkedIn</text>
            <text x="260" y="210" textAnchor="middle" className="spoke-desc fill-zinc-400 dark:fill-zinc-500">baseline</text>
            {/* Node 1: GitHub — top center */}
            <rect x="200" y="28" width="120" height="52" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="260" y="50" textAnchor="middle" className="spoke-name fill-zinc-800 dark:fill-zinc-200">GitHub</text>
            <text x="260" y="68" textAnchor="middle" className="spoke-desc fill-zinc-500 dark:fill-zinc-400">code proof</text>
            {/* Node 2: Personal Site — top left */}
            <rect x="18" y="82" width="140" height="52" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="88" y="104" textAnchor="middle" className="spoke-name fill-zinc-800 dark:fill-zinc-200">Personal Site</text>
            <text x="88" y="122" textAnchor="middle" className="spoke-desc fill-zinc-500 dark:fill-zinc-400">total control</text>
            {/* Node 3: CVin.Bio — top right */}
            <rect x="370" y="82" width="124" height="52" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="432" y="104" textAnchor="middle" className="spoke-name fill-zinc-800 dark:fill-zinc-200">CVin.Bio</text>
            <text x="432" y="122" textAnchor="middle" className="spoke-desc fill-zinc-500 dark:fill-zinc-400">structured data</text>
            {/* Node 4: Read.cv — bottom left */}
            <rect x="18" y="262" width="140" height="52" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="88" y="284" textAnchor="middle" className="spoke-name fill-zinc-800 dark:fill-zinc-200">Read.cv</text>
            <text x="88" y="302" textAnchor="middle" className="spoke-desc fill-zinc-500 dark:fill-zinc-400">design-first</text>
            {/* Node 5: Polywork — bottom right */}
            <rect x="370" y="262" width="124" height="52" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="432" y="284" textAnchor="middle" className="spoke-name fill-zinc-800 dark:fill-zinc-200">Polywork</text>
            <text x="432" y="302" textAnchor="middle" className="spoke-desc fill-zinc-500 dark:fill-zinc-400">project-based</text>
            {/* Node 6: Mastodon — bottom center */}
            <rect x="200" y="320" width="120" height="52" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="260" y="342" textAnchor="middle" className="spoke-name fill-zinc-800 dark:fill-zinc-200">Mastodon</text>
            <text x="260" y="360" textAnchor="middle" className="spoke-desc fill-zinc-500 dark:fill-zinc-400">community ties</text>
          </svg>
        </div>


        <h2 className={h2}>1. GitHub Profile</h2>
        <p>Your GitHub profile is your code-first identity. Recruiters at engineering-heavy companies check GitHub before they check LinkedIn. A well-maintained profile with pinned repos, a README, and real commit history tells a hiring manager more about you than any resume bullet point can.</p>
        <p>The strength of GitHub is proof. It is not a claim that you know React. It is a repo where someone can read your React code, see your commit messages, and look at how you handle pull requests. For more on this, see why you should <Link href="/show-your-code" className={link}>show your code</Link> as part of your job search.</p>
        <p>The downside is that GitHub is not built for career storytelling. There is no place for your work history, your impact at previous jobs, or the context behind your projects. A repo called &quot;payment-gateway&quot; does not explain that it processed $50M in transactions. And not everyone has the time or permission to maintain public repos alongside their day job.</p>
        <p><span className={bold}>Best for:</span> developers with active open-source work or personal projects they are proud of.</p>

        <h2 className={h2}>2. Personal Website</h2>
        <p>A personal website gives you total control. You decide what goes on it, how it looks, and what story it tells. You can include a resume, a portfolio, blog posts, talks, and anything else that shows what you know. Nobody else&apos;s algorithm decides what people see.</p>
        <p>The trade-off is effort. Building and maintaining a personal site takes time. You need to buy a domain, choose a framework, deploy it somewhere, and actually keep the content updated. A lot of developers launch a site, write two blog posts, and let it sit for three years with outdated information. A stale personal site can actually hurt you more than not having one.</p>
        <p>If you enjoy web development and writing, a personal site is the most powerful option on this list. If you do not, it becomes a chore that collects dust.</p>
        <p><span className={bold}>Best for:</span> developers who enjoy writing and want full creative control over their online presence.</p>

        <h2 className={h2}>3. CVin.Bio</h2>
        <p>CVin.Bio sits between a personal website and a LinkedIn profile. You get a structured page with your experience, skills, and projects, formatted in a clean layout with a short shareable URL. It is designed to be the page a recruiter lands on when they want to see your background quickly.</p>
        <p>The advantage over a personal website is speed. You do not need to build anything from scratch. Upload your resume or fill in the fields, and you get a page that works. The advantage over LinkedIn is readability. No feed, no endorsements, no &quot;open to work&quot; banners. Just your professional background on a clean page. And because it is a real web page, it works well when <Link href="/ai-agents-browsing-resume" className={link}>AI agents browse your resume</Link>.</p>
        <p>The limitation is flexibility. You are working within a template. If you want a blog, a portfolio of design work, or a page that looks nothing like a resume, a personal site gives you more room. CVin.Bio is best when you want something that works right now without ongoing maintenance.</p>
        <p><span className={bold}>Best for:</span> developers who want a shareable profile page without building or maintaining a website.</p>

        <div className={callout}>
          <h3 className={h3}>The link test</h3>
          <p>Ask yourself: if a recruiter asked for a link to your work, what would you send? If the only answer is your LinkedIn URL, you are leaving impact on the table. Having a second link to something that shows your actual work, whether that is GitHub, a personal site, or a <Link href="/cv-web-link" className={link}>web profile</Link>, gives recruiters more signal about who you are.</p>
        </div>

        <h2 className={h2}>4. Read.cv</h2>
        <p>Read.cv is a clean, design-focused professional profile. It leans toward the creative and product side of tech. The layouts are beautiful, and the platform attracts designers, product managers, and developers who care about aesthetics. If you want your profile to look like a well-designed portfolio page without doing the design yourself, Read.cv nails that.</p>
        <p>The community is smaller than LinkedIn, which means less recruiter traffic. You will not get cold outreach from recruiters on Read.cv the way you do on LinkedIn. It works better as a link you share than a platform people discover you on.</p>
        <p><span className={bold}>Best for:</span> developers with a design sensibility who want a beautiful profile they can link to from other platforms.</p>

        <h2 className={h2}>5. Polywork</h2>
        <p>Polywork organizes your profile around projects and accomplishments rather than job titles. Instead of &quot;Software Engineer at Acme Corp, 2022-2024,&quot; you show individual things you built, shipped, or contributed to. This works well for people who do work across multiple roles or freelance.</p>
        <p>The platform is still growing and recruiter adoption is limited. Think of it as a supplement, not a replacement. If your career is a straight line of one job after another, LinkedIn tells that story just fine. If your career is a web of projects, side work, open source, and freelance gigs, Polywork shows that better.</p>
        <p><span className={bold}>Best for:</span> freelancers, consultants, and developers whose work spans multiple projects and roles.</p>

        <h2 className={h2}>6. Mastodon and the Fediverse</h2>
        <p>Mastodon is not really a professional networking tool. It is a community-first social network. But in tech circles, certain Mastodon instances have become hubs where developers share work, discuss tools, and occasionally post or find job openings. The culture is more technical and less performative than LinkedIn.</p>
        <p>The limit is reach. Mastodon&apos;s user base is a fraction of LinkedIn&apos;s. You will not find most recruiters there. It works as a community tool where you build genuine relationships with other developers, which can turn into referrals and job leads over time. But it is a slow burn, not a quick job search tool.</p>
        <p><span className={bold}>Best for:</span> developers who value community interaction and want to build real relationships with peers in their area of tech.</p>

        <h2 className={h2}>7. Twitter/X</h2>
        <p>Twitter/X is where many tech leaders share ideas, announce hiring, and build their personal brand. If you follow the right people, your timeline becomes a feed of job openings, technical discussions, and industry takes that you will not find on LinkedIn. Plenty of engineers have landed jobs because someone they follow posted &quot;we are hiring&quot; and they replied.</p>
        <p>The cost is that you need to participate. A Twitter/X account with zero posts and ten followers does nothing for your career. You need to tweet about your work, reply to threads, and build a small audience. That takes time and a certain personality type. Not everyone enjoys writing short takes in public, and that is fine.</p>
        <p>If you are already active on Twitter/X for personal reasons, leaning into tech content there is an easy win. If you have never used it, starting from zero is a bigger investment.</p>
        <p><span className={bold}>Best for:</span> developers who enjoy writing short-form content and want visibility with hiring managers who are active on the platform.</p>

        <div className={callout}>
          <h3 className={h3}>Why LinkedIn still matters</h3>
          <p>LinkedIn has two things no alternative matches: network size and recruiter volume. Most recruiters start their candidate search on LinkedIn. Most hiring managers check LinkedIn before an interview. Having a strong LinkedIn profile is the price of entry. The alternatives on this list add depth on top of that baseline.</p>
        </div>

        <h2 className={h2}>The Right Combination</h2>
        <p>Most developers should have LinkedIn plus one other platform. Which one depends on your strengths. If you write code in public, that is GitHub. If you enjoy writing, that is a blog or personal site. If you want something low-maintenance that looks professional, a web profile works.</p>
        <p>The goal is not to be everywhere. It is to give recruiters more than one way to find and evaluate you. A LinkedIn profile tells them your job history. A second link tells them what you actually do. When a recruiter opens your profile and sees a link to real work, you move from &quot;maybe&quot; to &quot;let&apos;s talk&quot; faster.</p>
        <p>Pick the platform that fits how you already work. If you are going to abandon it in two months, it is worse than not having it. The best alternative to LinkedIn is the one you will actually keep updated.</p>
        <p>To get the most out of whatever platform you choose, read about how to <Link href="/stand-out-inbox" className={link}>stand out in a recruiter&apos;s inbox</Link>.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/show-your-code" className={link}>Why showing your code matters in a job search</Link></li>
          <li><Link href="/cv-web-link" className={link}>Why a URL is the best thing on your resume</Link></li>
          <li><Link href="/ai-agents-browsing-resume" className={link}>How AI agents read your online resume</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'best-career-changer-resume-tips',
    title: 'Best Resume Strategies for Career Changers',
    excerpt: 'Eight things that actually work when your resume says one career but you want a completely different one.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'How do I write a resume when changing careers?', answer: 'Focus on transferable skills, not job titles. Rewrite your bullet points to connect old work to the new field, put certifications and side projects near the top, and include a two-sentence summary that explains the switch directly.' },
      { question: 'Should I remove old work experience when switching careers?', answer: 'Yes, if it has no connection to your new field. Keeping irrelevant experience makes your resume longer without making it stronger. Remove anything that does not help a hiring manager picture you doing the new job.' },
      { question: 'What resume format is best for career changers?', answer: 'A hybrid format works well. It leads with a skills section that highlights what you can do, then follows with a shorter work history. This lets you control the story instead of letting your job titles tell it for you.' },
    ],
    author: {
      name: 'Tanya R.',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>Switching careers is hard enough without your resume working against you. The problem is simple: your work history says one thing, but you want to do something else. Every recruiter who opens your file sees the mismatch in about three seconds.</p>
        <p>The fix is not to pretend your old career did not happen. It is to reshape how you present it so the hiring manager can see a clear line from where you have been to where you are going. These eight strategies work, especially if you are moving into tech.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 640 320" className="w-full h-auto" role="img" aria-label="Before and after comparison of career changer resume layouts">
            <style>{`
              .svg-title { font: 600 14px system-ui; }
              .svg-label { font: 500 11px system-ui; }
              .svg-small { font: 400 10px system-ui; }
              .svg-badge { font: 600 10px system-ui; }
            `}</style>
            {/* Before resume */}
            <text x="160" y="24" textAnchor="middle" className="svg-title fill-zinc-400 dark:fill-zinc-500">❌ Before</text>
            <rect x="30" y="36" width="260" height="270" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <rect x="50" y="52" width="140" height="14" rx="3" className="fill-zinc-300 dark:fill-zinc-600" />
            <text x="50" y="86" className="svg-small fill-zinc-400 dark:fill-zinc-500">Operations Manager · 2019–2024</text>
            <rect x="50" y="96" width="220" height="8" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="50" y="110" width="200" height="8" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="50" y="124" width="210" height="8" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <text x="50" y="152" className="svg-small fill-zinc-400 dark:fill-zinc-500">Store Supervisor · 2016–2019</text>
            <rect x="50" y="162" width="220" height="8" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="50" y="176" width="190" height="8" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <text x="50" y="204" className="svg-small fill-zinc-400 dark:fill-zinc-500">Retail Associate · 2014–2016</text>
            <rect x="50" y="214" width="210" height="8" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="50" y="228" width="180" height="8" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <text x="50" y="260" className="svg-small fill-zinc-400 dark:fill-zinc-500">Skills: Excel, Inventory, Scheduling</text>
            <text x="160" y="294" textAnchor="middle" className="svg-badge fill-zinc-400 dark:fill-zinc-500">Job titles drive the story</text>
            {/* After resume */}
            <text x="480" y="24" textAnchor="middle" className="svg-title fill-emerald-600 dark:fill-emerald-400">✓ After</text>
            <rect x="350" y="36" width="260" height="270" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="1.5" />
            <rect x="370" y="52" width="140" height="14" rx="3" className="fill-zinc-300 dark:fill-zinc-600" />
            <text x="370" y="84" className="svg-small fill-emerald-600 dark:fill-emerald-400">Data Analyst · Career Changer</text>
            <rect x="370" y="94" width="220" height="20" rx="4" className="fill-emerald-50 dark:fill-emerald-900/30 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
            <text x="380" y="108" className="svg-small fill-emerald-700 dark:fill-emerald-300">SQL · Python · Tableau · Excel</text>
            <text x="370" y="134" className="svg-badge fill-emerald-600 dark:fill-emerald-400">PROJECTS</text>
            <rect x="370" y="142" width="220" height="8" rx="2" className="fill-emerald-100 dark:fill-emerald-900/40" />
            <rect x="370" y="156" width="200" height="8" rx="2" className="fill-emerald-100 dark:fill-emerald-900/40" />
            <text x="370" y="184" className="svg-badge fill-emerald-600 dark:fill-emerald-400">CERTIFICATIONS</text>
            <rect x="370" y="192" width="220" height="8" rx="2" className="fill-emerald-100 dark:fill-emerald-900/40" />
            <rect x="370" y="206" width="180" height="8" rx="2" className="fill-emerald-100 dark:fill-emerald-900/40" />
            <text x="370" y="234" className="svg-small fill-zinc-400 dark:fill-zinc-500">Relevant Experience (rewritten)</text>
            <rect x="370" y="244" width="220" height="8" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="370" y="258" width="200" height="8" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <text x="480" y="294" textAnchor="middle" className="svg-badge fill-emerald-600 dark:fill-emerald-400">Skills and projects drive the story</text>
          </svg>
        </div>

        <h2 className={h2}>1. Lead With Transferable Skills</h2>
        <p>Your job titles are the weakest part of your resume right now. A title like &quot;Operations Manager&quot; or &quot;High School Teacher&quot; tells a tech recruiter nothing useful. But the skills behind those titles often translate directly.</p>
        <p>Project management, data analysis, stakeholder communication, process improvement, and team coordination show up in every industry. The trick is naming them in the language your new field uses. If you managed a department budget in Excel, you did data analysis. If you coordinated a team across time zones, you did project management.</p>
        <p>Put a skills section right after your summary. List the skills that matter in your target role, not the ones from your old career that nobody in tech will search for.</p>

        <h2 className={h2}>2. Rewrite Your Bullets</h2>
        <p>This is where most career changers fail. They copy their bullet points from their old resume word for word. A bullet that says &quot;Managed inventory for 3 retail locations&quot; means nothing to an engineering hiring manager. But the same work, rewritten, might.</p>
        <div className={callout}>
          <h3 className={h3}>Before and after examples</h3>
          <p><span className={bold}>Before:</span> &quot;Managed inventory tracking for 3 retail locations.&quot;</p>
          <p><span className={bold}>After:</span> &quot;Built and maintained spreadsheet system tracking 5,000+ SKUs across 3 locations, reducing stock errors by 30%.&quot;</p>
          <p><span className={bold}>Before:</span> &quot;Taught math to 120 students per semester.&quot;</p>
          <p><span className={bold}>After:</span> &quot;Designed curriculum for 120 users per cycle, measured learning outcomes with data, and iterated based on results.&quot;</p>
        </div>
        <p>The second version of each bullet uses language that a tech recruiter recognizes: systems, data, iteration, scale. The work is the same. The framing is different. This matters more than almost anything else on your resume. If you are not sure how to quantify your past work, our guide on <Link href="/measuring-impact-no-data" className={link}>measuring impact without hard data</Link> can help.</p>

        <h2 className={h2}>3. Show Projects That Prove It</h2>
        <p>Talk is cheap. If you say you are switching into software engineering, the first thing a hiring manager wants to see is code you have actually written. Side projects are the single best way to prove you can do the job you are asking for.</p>
        <p>These do not need to be massive. A deployed web app, a small CLI tool, a data pipeline that cleans and visualizes a public dataset. What matters is that the project exists, it works, and someone can look at it. A GitHub link to a real project beats three paragraphs about your &quot;passion for technology.&quot;</p>
        <p>Read our guide on <Link href="/show-your-code" className={link}>showing your code on your resume</Link> for specifics on what to include and how to present it. The short version: link to the project, describe what it does in one sentence, and mention what you built it with.</p>

        <h2 className={h2}>4. Drop Irrelevant Experience</h2>
        <p>This feels wrong. You spent years building that experience. But a resume is not a biography. It is a sales document for a specific job.</p>
        <p>If your five years as a dental hygienist has no connection to a product management role, leave it off. Every line of irrelevant experience pushes relevant content further down the page. And recruiters do not scroll. They scan from the top.</p>
        <p>You do not need to account for every year of your life. Gaps are fine when your recent section clearly shows you building toward the role you want. What hurts you more than a gap is a resume full of unrelated work that makes the recruiter wonder why you applied.</p>

        <h2 className={h2}>5. Use a Hybrid Format</h2>
        <p>The standard reverse-chronological resume format works against career changers. It puts your most recent (and often most irrelevant) job title front and center. A hybrid format fixes this by leading with skills and projects, then following with a shorter employment history.</p>
        <p>The structure looks like this: summary at the top, then a skills section, then projects or portfolio, and finally a condensed work history at the bottom. This way, the recruiter sees what you can do before they see where you have worked.</p>
        <p>This format is sometimes called a functional resume, but pure functional resumes raise red flags because they hide dates entirely. The hybrid keeps dates visible. It just reorders the sections so skills come first.</p>

        <h2 className={h2}>6. Put Certifications Up Front</h2>
        <p>If you completed a bootcamp, earned an AWS certification, finished a Google Career Certificate, or got any credential related to your new field, that goes near the top. Not buried at the bottom under &quot;Additional Information.&quot;</p>
        <p>For career changers, certifications serve a specific purpose: they signal commitment. A hiring manager sees your background is in marketing, but you spent 6 months doing a full-stack bootcamp and passed the AWS Solutions Architect exam. That tells them this is not a whim. You invested real time and effort.</p>
        <p>Put your certifications right after your skills section. Include the name, the issuing organization, and the date. If the cert has a verification URL, include that too. People coming from <Link href="/academic-to-commercial" className={link}>academic backgrounds into commercial roles</Link> find this especially useful because it bridges the credibility gap.</p>

        <h2 className={h2}>7. Use a Web Profile URL</h2>
        <p>A one-page resume cannot tell your full story, and that is extra true when you are changing careers. You need more space to show projects, explain the transition, and present yourself as someone who belongs in the new field.</p>
        <p>A web profile gives you that space. A link like <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">cvin.bio/yourname</code> at the top of your resume lets the recruiter click through to a curated version of your background. On your web profile, you control the layout. You can put your projects first, your bootcamp second, and your old career last. Or leave the old career off entirely.</p>
        <p>This also helps when someone shares your profile with a hiring manager. They send a link, not a file. The hiring manager sees the version of you that makes sense for this role.</p>

        <h2 className={h2}>8. Write a Bridge Summary</h2>
        <p>The very top of your resume should include a two-sentence summary that explains the switch directly. Do not make the recruiter figure out why a former teacher is applying for a data analyst role. Tell them.</p>
        <p>A good bridge summary sounds like this: &quot;Former operations manager with 6 years of experience in process optimization and data-driven decision making. Completed a data science bootcamp and built 3 end-to-end ML projects focused on supply chain forecasting.&quot;</p>
        <p>That is two sentences. Sentence one says where you are coming from and names the transferable skills. Sentence two says what you did to make the switch real. No fluff. No &quot;passionate self-starter.&quot; Just the facts that connect point A to point B.</p>
        <div className={callout}>
          <h3 className={h3}>Bridge summary formula</h3>
          <p><span className={bold}>Sentence 1:</span> &quot;[Former role] with [X years] of experience in [transferable skill 1] and [transferable skill 2].&quot;</p>
          <p><span className={bold}>Sentence 2:</span> &quot;[Completed certification/bootcamp] and [built/shipped specific proof of new skill].&quot;</p>
        </div>

        <h2 className={h2}>The Order Matters</h2>
        <p>If you only do two things from this list, rewrite your bullet points (#2) and write a bridge summary (#8). Those two changes alone will make a bigger difference than anything else because they directly address the objection in the recruiter&apos;s head: &quot;Why is this person applying for this job?&quot;</p>
        <p>Side projects (#3) and certifications (#6) are your strongest proof. Everything else is about presentation, and presentation matters, but proof matters more.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/academic-to-commercial" className={link}>How to move from academia to a commercial role</Link></li>
          <li><Link href="/show-your-code" className={link}>How to show your code on your resume</Link></li>
          <li><Link href="/measuring-impact-no-data" className={link}>Measuring impact when you do not have hard data</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'best-ways-prove-skills-no-degree',
    title: 'Best Ways to Prove Skills Without a Degree',
    excerpt: 'Seven types of proof ranked by how much recruiters actually trust them, from the strongest signal to the weakest.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'Can I get a tech job without a college degree?', answer: 'Yes. Many companies, including Google, Apple, and IBM, have dropped degree requirements for technical roles. What matters is proof that you can do the work. A deployed project, open source contributions, or a respected certification carries more weight than a diploma at most companies.' },
      { question: 'What is the best certification for getting a tech job without a degree?', answer: 'It depends on your target role. For cloud engineering, AWS Solutions Architect or Google Cloud Professional are strong. For security, CompTIA Security+ is widely recognized. For data, the Google Data Analytics Certificate is a solid entry point. Pick the certification that matches the jobs you are applying for.' },
      { question: 'How do I show proof of skills on my resume?', answer: 'Link directly to the proof. A GitHub profile, a live project URL, a certification verification page, or a portfolio site. Do not just list skills as words. Point to something the recruiter can click and verify in 30 seconds.' },
    ],
    author: {
      name: 'Jordan M.',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>A degree used to be the default proof that you knew what you were doing. That has changed. Google, Apple, IBM, and dozens of other major companies have dropped degree requirements for technical roles. But dropping the requirement does not mean they stopped caring about proof. It means they want different proof.</p>
        <p>The question is not whether you can get hired without a degree. You can. The question is what you show instead. Not all proof is equal. A link to a live project you built carries far more weight than a paragraph describing what you &quot;know.&quot; Here are seven types of proof, ranked by how much trust they actually build with recruiters and hiring managers.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 480 380" className="w-full h-auto" role="img" aria-label="Proof strength ranking from strongest to weakest">
            <style>{`
              .tier-label { font: 600 12px system-ui; }
              .tier-text { font: 500 11px system-ui; }
              .tier-num { font: 700 11px system-ui; fill: white; }
              .tier-heading { font: 600 14px system-ui; }
            `}</style>
            <text x="240" y="22" textAnchor="middle" className="tier-heading fill-zinc-500 dark:fill-zinc-400">Proof Strength — Strongest to Weakest</text>
            {/* Tier 1 */}
            <rect x="40" y="36" width="400" height="42" rx="6" className="fill-emerald-100 dark:fill-emerald-900/40 stroke-emerald-400 dark:stroke-emerald-600" strokeWidth="1.5" />
            <circle cx="66" cy="57" r="12" className="fill-emerald-600 dark:fill-emerald-500" />
            <text x="66" y="61" textAnchor="middle" className="tier-num">1</text>
            <text x="88" y="53" className="tier-label fill-emerald-800 dark:fill-emerald-300">Live Deployed Project</text>
            <text x="88" y="68" className="tier-text fill-emerald-600 dark:fill-emerald-400">Clickable, working, proves you can ship</text>
            {/* Tier 2 */}
            <rect x="40" y="84" width="400" height="42" rx="6" className="fill-emerald-50 dark:fill-emerald-900/25 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1.5" />
            <circle cx="66" cy="105" r="12" className="fill-emerald-500 dark:fill-emerald-500" />
            <text x="66" y="109" textAnchor="middle" className="tier-num">2</text>
            <text x="88" y="101" className="tier-label fill-emerald-700 dark:fill-emerald-300">Open Source Contributions</text>
            <text x="88" y="116" className="tier-text fill-emerald-600 dark:fill-emerald-400">Merged PRs on real codebases with code review</text>
            {/* Tier 3 */}
            <rect x="40" y="132" width="400" height="42" rx="6" className="fill-lime-50 dark:fill-lime-900/20 stroke-lime-300 dark:stroke-lime-700" strokeWidth="1.5" />
            <circle cx="66" cy="153" r="12" className="fill-lime-600 dark:fill-lime-500" />
            <text x="66" y="157" textAnchor="middle" className="tier-num">3</text>
            <text x="88" y="149" className="tier-label fill-lime-800 dark:fill-lime-300">Industry Certifications</text>
            <text x="88" y="164" className="tier-text fill-lime-600 dark:fill-lime-400">Standardized, verifiable, proctored exams</text>
            {/* Tier 4 */}
            <rect x="40" y="180" width="400" height="42" rx="6" className="fill-yellow-50 dark:fill-yellow-900/15 stroke-yellow-300 dark:stroke-yellow-700" strokeWidth="1.5" />
            <circle cx="66" cy="201" r="12" className="fill-yellow-600 dark:fill-yellow-500" />
            <text x="66" y="205" textAnchor="middle" className="tier-num">4</text>
            <text x="88" y="197" className="tier-label fill-yellow-800 dark:fill-yellow-300">Bootcamp + Capstone</text>
            <text x="88" y="212" className="tier-text fill-yellow-600 dark:fill-yellow-400">Structured learning with a real shipped project</text>
            {/* Tier 5 */}
            <rect x="40" y="228" width="400" height="42" rx="6" className="fill-amber-50 dark:fill-amber-900/15 stroke-amber-300 dark:stroke-amber-700" strokeWidth="1.5" />
            <circle cx="66" cy="249" r="12" className="fill-amber-600 dark:fill-amber-500" />
            <text x="66" y="253" textAnchor="middle" className="tier-num">5</text>
            <text x="88" y="245" className="tier-label fill-amber-800 dark:fill-amber-300">Freelance / Contract Work</text>
            <text x="88" y="260" className="tier-text fill-amber-600 dark:fill-amber-400">Someone paid you real money to do the work</text>
            {/* Tier 6 */}
            <rect x="40" y="276" width="400" height="42" rx="6" className="fill-orange-50 dark:fill-orange-900/15 stroke-orange-300 dark:stroke-orange-700" strokeWidth="1.5" />
            <circle cx="66" cy="297" r="12" className="fill-orange-500 dark:fill-orange-500" />
            <text x="66" y="301" textAnchor="middle" className="tier-num">6</text>
            <text x="88" y="293" className="tier-label fill-orange-800 dark:fill-orange-300">Technical Writing / Talks</text>
            <text x="88" y="308" className="tier-text fill-orange-600 dark:fill-orange-400">Proves understanding, not just ability</text>
            {/* Tier 7 */}
            <rect x="40" y="324" width="400" height="42" rx="6" className="fill-zinc-50 dark:fill-zinc-800/50 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" />
            <circle cx="66" cy="345" r="12" className="fill-zinc-400 dark:fill-zinc-500" />
            <text x="66" y="349" textAnchor="middle" className="tier-num">7</text>
            <text x="88" y="341" className="tier-label fill-zinc-600 dark:fill-zinc-300">Hackathons / Competitions</text>
            <text x="88" y="356" className="tier-text fill-zinc-500 dark:fill-zinc-400">Time-limited, often unfinished, context-dependent</text>
          </svg>
        </div>

        <h2 className={h2}>1. A Live Deployed Project</h2>
        <p>This is the strongest signal you can send. A project that is live, working, and accessible through a URL tells a hiring manager everything they need to know in about 60 seconds. They click the link, use the thing, and form an opinion based on real output. No guessing. No trust required.</p>
        <p>Strong examples: a full-stack web app with authentication and a database, an API that other developers actually use, a data dashboard that pulls live data and updates on a schedule. Weak examples: a to-do app from a tutorial, a clone of a popular app with no original features, or anything that is just a README with screenshots but no working demo.</p>
        <p>The difference between strong and weak is originality and scope. A to-do app shows you can follow instructions. A custom app that solves a real problem shows you can think, design, and ship. For more on presenting projects the right way, check out our guide on <Link href="/show-your-code" className={link}>showing your code</Link>.</p>
        <p>Best for: software engineers, frontend developers, data engineers, and anyone whose work can be seen in a browser.</p>

        <h2 className={h2}>2. Open Source Contributions</h2>
        <p>Contributing to open source projects is proof that you can work with other developers on real codebases. It shows you can read someone else&apos;s code, follow contribution guidelines, write clean pull requests, and respond to code review. These are exactly the skills companies test for in interviews.</p>
        <p>A strong contribution is a merged PR on a well-known project that fixes a real bug or adds a real feature. A weak contribution is a typo fix in a README or an issue comment saying &quot;I&apos;d like to work on this.&quot;</p>
        <p>You do not need to contribute to React or Kubernetes. Smaller projects with active maintainers are often better because your PR is more likely to get reviewed and merged. Look for repos with &quot;good first issue&quot; labels. One meaningful merged PR on a project with 500 stars is better than 20 cosmetic fixes.</p>
        <p>Best for: backend engineers, systems programmers, and anyone targeting companies that value open source culture.</p>

        <h2 className={h2}>3. Industry Certifications</h2>
        <p>Certifications sit in an interesting spot. They are not as strong as deployed projects or open source work because they test knowledge, not applied skill. But they are standardized, verifiable, and widely recognized. A recruiter who sees &quot;AWS Solutions Architect, Associate&quot; knows exactly what that means.</p>
        <p>The strongest certifications are the ones that match real job requirements. AWS, Google Cloud Professional, and Azure certifications are valued for cloud roles. CompTIA Security+ is a baseline for security positions. The Certified Kubernetes Administrator (CKA) is respected in DevOps. Cisco&apos;s CCNA still matters for networking.</p>
        <p>Weak certifications are the ones from platforms nobody has heard of, or ones that only require watching videos with no real exam. If the cert does not have a proctored test or a hands-on component, it does not carry much weight.</p>
        <div className={callout}>
          <h3 className={h3}>What makes a cert strong</h3>
          <p>It comes from a recognized company (AWS, Google, Microsoft, CompTIA). It has a proctored exam that you can fail. And it maps directly to a job requirement listed in real postings. If a cert meets all three, it is worth getting.</p>
        </div>
        <p>Best for: cloud engineers, security analysts, network engineers, and anyone applying to companies with compliance requirements.</p>

        <h2 className={h2}>4. Bootcamp With a Capstone</h2>
        <p>A bootcamp completion alone is moderate proof. It says you spent 12 to 16 weeks learning a stack, but plenty of people complete bootcamps and still struggle in interviews. What makes a bootcamp meaningful is the capstone project.</p>
        <p>A good capstone is a real application that you built, deployed, and can demo. If your bootcamp ended with a group project and you can clearly describe what you personally built (not what the team built), that is solid. If you can point to the live app, even better.</p>
        <p>Be specific about what you learned. Instead of saying &quot;Completed General Assembly Software Engineering Immersive,&quot; try: &quot;Built a full-stack React/Node.js app with PostgreSQL that processes real-time transit data for 3 city bus routes. Deployed on AWS.&quot; The first version tells the recruiter you attended. The second tells them you can build things.</p>
        <p>Best for: career changers, junior developers, and anyone entering tech for the first time. Pairs well with <Link href="/college-degrees-matter-less" className={link}>the case for why college degrees matter less in tech</Link>.</p>

        <h2 className={h2}>5. Freelance and Contract Work</h2>
        <p>Paid work is proof, period. If someone gave you money to do the job, that is a strong signal that you can do the job. Freelance and contract work counts even if the client was small or the project was short.</p>
        <p>The key is specificity. &quot;Freelance web developer&quot; on your resume means almost nothing. &quot;Built a custom Shopify theme and checkout flow for a DTC brand processing 2,000 orders per month&quot; means a lot. Name the technologies. Describe the scale. If the client will serve as a reference, mention that.</p>
        <p>Platforms like Upwork and Toptal give you a verifiable track record with reviews and completed project counts. These are not as prestigious as a full-time role at a known company, but they are real proof that clients trusted you with their money and their product.</p>
        <p>Best for: designers, frontend developers, mobile developers, and anyone building a portfolio through client work.</p>

        <h2 className={h2}>6. Technical Writing and Talks</h2>
        <p>Writing a technical blog post or giving a conference talk proves something deeper than skill. It proves understanding. You cannot clearly explain distributed systems or database indexing to other people unless you actually understand those topics yourself.</p>
        <p>Strong examples: a blog post walking through how you solved a real debugging problem, a conference talk on a specific technical decision your team made, or a tutorial that other developers have bookmarked and shared. Weak examples: a post that summarizes documentation without adding anything, or a talk that is just a product demo.</p>
        <p>The best technical writing is specific and experience-based. &quot;How I reduced our API response time from 800ms to 120ms&quot; is interesting. &quot;An Introduction to REST APIs&quot; is not. Recruiters and hiring managers share technical posts internally all the time. If your post shows up in a Slack channel before your resume does, that is a massive advantage.</p>
        <p>Best for: senior engineers, developer advocates, and anyone targeting roles where communication matters as much as code.</p>

        <h2 className={h2}>7. Hackathons and Competitions</h2>
        <p>Winning a hackathon or placing in a coding competition is real proof, but it is the weakest type on this list because it is time-limited and context-dependent. A hackathon project is built in 24 to 48 hours. It is usually rough, unfinished, and not maintained after the event. That is fine for the hackathon. It is less convincing as lasting proof of skill.</p>
        <p>What makes hackathon results strong is specificity and outcome. &quot;Won first place at HackMIT 2025 for building a real-time sign language translation tool using MediaPipe and React&quot; is meaningful. &quot;Participated in a hackathon&quot; is not.</p>
        <p>Coding competitions like LeetCode contests, Advent of Code leaderboards, or Kaggle competitions carry weight in specific contexts. Kaggle rankings matter for data science roles. LeetCode contest ratings can be relevant for companies that do heavy algorithm interviews. But for most roles, a deployed project (#1) is a better use of your time than competitive coding.</p>
        <p>Best for: students, early-career developers, and anyone applying to companies that run their own hackathons.</p>

        <h2 className={h2}>Putting All Your Proof Together</h2>
        <p>Having multiple types of proof is better than having just one. A deployed project plus a certification plus a couple of open source PRs tells a much stronger story than any single item alone. The challenge is presenting it in a way that is clean and easy to scan.</p>
        <p>This is where a web profile helps. On a page like CVin.Bio, you can lay out your projects with live links, list your certifications with verification URLs, and link to your GitHub contributions all in one place. Instead of stuffing everything onto a one-page resume, put the highlights on paper and link to the full picture.</p>
        <div className={callout}>
          <h3 className={h3}>The proof stack</h3>
          <p>The strongest candidates without degrees typically have at least three types of proof: a live project they can demo, a recognized certification, and one more thing (open source, freelance work, or a technical blog). Stack your proof and make it all clickable.</p>
        </div>
        <p>Avoid the trap of listing skills as plain text without evidence. Writing &quot;Python, AWS, Docker&quot; in a skills section tells the recruiter nothing about your ability. Linking to a project built with those tools tells them everything. We wrote about this pattern in our piece on <Link href="/generic-skill-bars" className={link}>why generic skill bars hurt your resume</Link>.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/show-your-code" className={link}>How to show your code on your resume</Link></li>
          <li><Link href="/college-degrees-matter-less" className={link}>Why college degrees matter less in tech</Link></li>
          <li><Link href="/generic-skill-bars" className={link}>Why generic skill bars hurt your resume</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'best-ways-beat-ai-screening',
    title: 'Best Ways to Get Past AI Resume Screening',
    excerpt: 'Seven tactics ranked by how well they actually work against automated screening, from the one that skips the filter entirely to the small fixes that add up.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'How do AI resume screening systems work?', answer: 'Most AI screening tools parse your uploaded file into text, extract keywords and section data, then score you against the job description. If your formatting confuses the parser or your language does not match, you score low and get filtered out before a human sees you.' },
      { question: 'Can I trick AI resume screening with hidden keywords?', answer: 'No. Modern screening tools detect white-on-white text and hidden keyword stuffing. They will flag or reject your application. The better approach is to use the same language as the job posting in visible, contextual sentences.' },
      { question: 'What file format is best for AI resume screening?', answer: 'If a system requires a file upload, plain .docx is the safest format. It parses more reliably than PDF across most applicant tracking systems. But the best option is a web profile URL that the recruiter reads directly, bypassing file parsing entirely.' },
    ],
    author: {
      name: 'Priya K.',
      avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>AI screening is the first wall between you and a real conversation with a hiring manager. Roughly 75% of resumes get rejected by automated systems before a person ever looks at them. Some of those rejections are fair. But a lot of good candidates get tossed because of formatting issues, missing keywords, or file types the parser chokes on.</p>
        <p>These seven tactics are ranked by how much they actually move the needle. The first one is the most effective because it removes the screening step entirely. The rest help you survive the filter when you have no choice but to go through it.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 560 260" className="w-full h-auto" role="img" aria-label="Two paths to a recruiter: through ATS filter vs direct web link">
            <style>{`
              .flow-label { font: 600 12px system-ui; }
              .flow-small { font: 500 10px system-ui; }
              .flow-heading { font: 600 14px system-ui; }
              .flow-tag { font: 700 10px system-ui; }
            `}</style>
            {/* Path A - Through ATS */}
            <text x="280" y="20" textAnchor="middle" className="flow-heading fill-zinc-500 dark:fill-zinc-400">Two Paths to the Recruiter</text>
            <text x="56" y="50" className="flow-tag fill-zinc-400 dark:fill-zinc-500">PATH A: FILE UPLOAD</text>
            {/* You box */}
            <rect x="20" y="60" width="80" height="40" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="60" y="84" textAnchor="middle" className="flow-label fill-zinc-700 dark:fill-zinc-300">You</text>
            {/* Arrow to ATS */}
            <line x1="100" y1="80" x2="148" y2="80" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" markerEnd="url(#arrowGray)" />
            <text x="124" y="72" textAnchor="middle" className="flow-small fill-zinc-400 dark:fill-zinc-500">.docx</text>
            {/* ATS box */}
            <rect x="150" y="60" width="100" height="40" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-300 dark:stroke-red-600" strokeWidth="1.5" />
            <text x="200" y="78" textAnchor="middle" className="flow-label fill-red-600 dark:fill-red-400">AI Filter</text>
            <text x="200" y="92" textAnchor="middle" className="flow-small fill-red-400 dark:fill-red-500">ATS / Bot</text>
            {/* Rejected branch */}
            <line x1="200" y1="100" x2="200" y2="140" className="stroke-red-300 dark:stroke-red-600" strokeWidth="1.5" />
            <rect x="160" y="142" width="80" height="30" rx="5" className="fill-red-100 dark:fill-red-900/30 stroke-red-300 dark:stroke-red-600" strokeWidth="1" />
            <text x="200" y="161" textAnchor="middle" className="flow-small fill-red-500 dark:fill-red-400">✕ Rejected</text>
            <text x="200" y="186" textAnchor="middle" className="flow-small fill-red-400 dark:fill-red-500">~75% of resumes</text>
            {/* Passed branch */}
            <line x1="250" y1="80" x2="320" y2="80" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" markerEnd="url(#arrowGray)" />
            <text x="285" y="72" textAnchor="middle" className="flow-small fill-zinc-400 dark:fill-zinc-500">if passed</text>
            {/* Recruiter box for Path A */}
            <rect x="322" y="60" width="90" height="40" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="367" y="84" textAnchor="middle" className="flow-label fill-zinc-700 dark:fill-zinc-300">Recruiter</text>
            {/* Path B - Direct link */}
            <text x="56" y="220" className="flow-tag fill-emerald-600 dark:fill-emerald-400">PATH B: WEB LINK ★</text>
            {/* You box */}
            <rect x="20" y="228" width="80" height="40" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="1.5" />
            <text x="60" y="252" textAnchor="middle" className="flow-label fill-zinc-700 dark:fill-zinc-300">You</text>
            {/* Arrow directly to recruiter */}
            <line x1="100" y1="248" x2="320" y2="248" className="stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="2" markerEnd="url(#arrowGreen)" />
            <text x="210" y="240" textAnchor="middle" className="flow-small fill-emerald-600 dark:fill-emerald-400">cvin.bio/you → no filter, no parsing</text>
            {/* Recruiter box for Path B */}
            <rect x="322" y="228" width="90" height="40" rx="6" className="fill-emerald-50 dark:fill-emerald-900/30 stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="1.5" />
            <text x="367" y="252" textAnchor="middle" className="flow-label fill-emerald-700 dark:fill-emerald-300">Recruiter</text>
            {/* Winner badge */}
            <rect x="432" y="232" width="110" height="32" rx="6" className="fill-emerald-100 dark:fill-emerald-900/40 stroke-emerald-400 dark:stroke-emerald-600" strokeWidth="1" />
            <text x="487" y="252" textAnchor="middle" className="flow-label fill-emerald-700 dark:fill-emerald-300">100% read rate</text>
            {/* Arrow markers */}
            <defs>
              <marker id="arrowGray" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8" className="fill-none stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
              </marker>
              <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8" className="fill-none stroke-emerald-500 dark:stroke-emerald-400" strokeWidth="1.5" />
              </marker>
            </defs>
          </svg>
        </div>

        <h2 className={h2}>1. Send a Web Profile Link</h2>
        <p>This is the single best thing you can do. When a recruiter clicks a URL and reads your profile in a browser, there is no AI filter between you and them. No parsing. No keyword scoring. No risk that a two-column layout confuses the system. They just read your profile the way you designed it.</p>
        <p>A clean link like <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">cvin.bio/yourname</code> works everywhere. Drop it in an email, a LinkedIn message, or a Slack thread. The recruiter sees your profile instantly. This is why <Link href="/cv-web-link" className={link}>putting a URL on your resume</Link> is worth doing even if you still submit a file through the portal.</p>
        <p>Best for: anyone who can email or message a recruiter directly, networking contacts, referrals, and any situation where you are not forced into a portal upload.</p>

        <h2 className={h2}>2. Match the Job Posting Language</h2>
        <p>AI screeners compare your resume text against the job description. If the posting says &quot;CI/CD pipelines&quot; and you wrote &quot;continuous integration and deployment workflows,&quot; the system might not connect the two. It sounds obvious, but most people do not do this.</p>
        <p>Open the job posting in one tab and your resume in another. Go line by line through the requirements. If they say &quot;React,&quot; write &quot;React.&quot; Not &quot;ReactJS.&quot; Not &quot;React.js.&quot; Use their exact phrasing. You can read more about this in our guide to <Link href="/beat-smart-ai-bots" className={link}>beating AI resume bots</Link>.</p>
        <div className={callout}>
          <h3 className={h3}>Quick example</h3>
          <p>Job posting says: &quot;Experience with Kubernetes and containerized deployments.&quot;</p>
          <p>Bad: &quot;Worked with Docker and cloud infrastructure.&quot;</p>
          <p>Good: &quot;Managed Kubernetes clusters and containerized deployments for 12 microservices in production.&quot;</p>
        </div>

        <h2 className={h2}>3. Use Standard Section Headers</h2>
        <p>AI parsers look for specific section names to figure out what part of your resume they are reading. When you get creative with headers like &quot;Where I&apos;ve Made an Impact&quot; instead of &quot;Experience,&quot; the parser may dump that entire section into an &quot;other&quot; bucket. Then your five years of engineering work gets ignored.</p>
        <p>Stick with headers the machines expect: <span className={bold}>Experience, Education, Skills, Projects, Certifications.</span> Save the creativity for your bullet points, where it actually helps.</p>

        <h2 className={h2}>4. Skip Tables, Columns, and Graphics</h2>
        <p>Two-column layouts look great on a screen. They also confuse most resume parsers. The system reads left-to-right, top-to-bottom. When your content is in two columns, it might read the left column header followed by the right column content. Your &quot;Senior Engineer at Stripe&quot; gets mashed together with &quot;Python, Go, SQL&quot; from the sidebar.</p>
        <p>Tables are even worse. Most parsers extract table content as a flat string with no structure. Graphics, icons, and progress bars for skills? The parser sees nothing. Those are invisible. If you want to understand the full scope of this problem, read <Link href="/pdf-breaks-ats" className={link}>how PDFs break in applicant tracking systems</Link>.</p>
        <p>Best for: anyone submitting through an online portal or applicant tracking system.</p>

        <h2 className={h2}>5. Put Keywords in Context</h2>
        <p>A skills block at the top that says &quot;Python, AWS, Docker, Terraform, PostgreSQL&quot; is fine. But newer AI screeners also look at where and how you used those technologies. A keyword sitting alone in a list carries less weight than one embedded in a real accomplishment.</p>
        <p>Instead of just listing &quot;Terraform,&quot; write something like: &quot;Built Terraform modules that cut provisioning time from 4 hours to 15 minutes across 3 AWS regions.&quot; Now the system sees Terraform, AWS, and a quantified result all in one sentence.</p>
        <p>This also helps when a human eventually reads your resume. A list of 30 technologies tells them nothing. A few well-placed keywords inside real stories tell them everything.</p>

        <h2 className={h2}>6. Save as Plain .docx</h2>
        <p>If the application portal requires a file upload, use .docx over PDF. This is not a style preference. It is a parsing reliability issue. The .docx format stores text as structured XML that machines can read cleanly. PDFs store text as positioned characters on a virtual page, which means the parser has to guess where one word ends and another begins.</p>
        <p>Keep the .docx simple. One column. Standard fonts like Arial or Calibri. No text boxes, no headers/footers with contact info (many parsers skip those), and no images.</p>
        <div className={callout}>
          <h3 className={h3}>When PDF is okay</h3>
          <p>If you are emailing your resume directly to a person (not uploading to a portal), PDF is fine because no parser is involved. The human just opens the file. But the moment you are going through an ATS, switch to .docx.</p>
        </div>

        <h2 className={h2}>7. Add a Clean URL at the Top</h2>
        <p>Even when you have to submit a file, put a link to your full web profile right below your name. Something like: &quot;Full profile: cvin.bio/yourname.&quot; This gives the recruiter a way out of the ATS view. Many recruiters will click the link just to see a better-formatted version of your background.</p>
        <p>This also future-proofs you. When the recruiter shares you with the hiring manager later, they forward the URL, not the file. Your web profile has your latest updates, proper formatting, and no parsing artifacts. You can learn more about this approach in our post on <Link href="/bypass-ats" className={link}>bypassing applicant tracking systems</Link>.</p>

        <h2 className={h2}>What Matters Most</h2>
        <p>The top of this list matters the most. Sending a web link (#1) removes AI screening from the equation entirely. Matching the job language (#2) and using standard headers (#3) are the two changes that give you the biggest improvement when you do go through a portal.</p>
        <p>The bottom of the list still matters. But if you only have 20 minutes before a deadline, spend those minutes on tactics 1 through 3.</p>
        <div className={callout}>
          <h3 className={h3}>The short version</h3>
          <p><span className={bold}>Skip the filter entirely</span> by sending a direct link. When that is not possible, <span className={bold}>speak the same language as the job posting</span> and keep your formatting dead simple. Everything else is an optimization on top of those basics.</p>
        </div>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/bypass-ats" className={link}>How to get your resume past ATS filters</Link></li>
          <li><Link href="/beat-smart-ai-bots" className={link}>How to beat smart AI resume bots</Link></li>
          <li><Link href="/pdf-breaks-ats" className={link}>Why your PDF breaks inside an ATS</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'best-things-top-resume',
    title: 'Best Things to Put at the Top of Your Resume',
    excerpt: 'Recruiters spend about 6 seconds on their first look at your resume, and most of that time is spent on the top two inches.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'What should the top of my resume look like?', answer: 'Your name in a large clear font, a one-line headline with your role and specialty, a link to your full profile, a two-sentence summary of your value, and your four or five strongest technical skills. That is it. Nothing else needs to be above the fold.' },
      { question: 'Should I put an objective statement on my resume?', answer: 'No. Objective statements tell the recruiter what you want, not what you offer. A value summary that describes what you bring to the team is far more effective and takes up the same amount of space.' },
      { question: 'Should I include my full home address on my resume?', answer: 'No. City and country are enough if location matters for the role. A full street address wastes space at the top of your resume and creates a privacy risk with no upside.' },
    ],
    author: {
      name: 'Marcus T.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>The top two inches of your resume do most of the work. Recruiters scan from the top down, and the first thing they see determines whether they keep reading or move on. Studies on <Link href="/the-30-second-scan" className={link}>how recruiters actually read resumes</Link> confirm this. The initial glance is fast. You get about 6 seconds before they decide if you are worth a closer look.</p>
        <p>That means what you put at the very top is not a design choice. It is a strategic one. Here is what works best, ranked by how much it helps during that first scan.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 400 420" className="w-full h-auto" role="img" aria-label="Resume mockup highlighting the top 2 inches with labeled zones">
            <style>{`
              .mock-title { font: 700 16px system-ui; }
              .mock-label { font: 600 11px system-ui; }
              .mock-small { font: 400 10px system-ui; }
              .mock-badge { font: 600 9px system-ui; letter-spacing: 0.5px; }
              .mock-arrow { font: 500 10px system-ui; }
            `}</style>
            {/* Resume page */}
            <rect x="80" y="10" width="240" height="400" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" />
            {/* Top zone highlight */}
            <rect x="80" y="10" width="240" height="170" rx="4" className="fill-blue-50/80 dark:fill-blue-900/20" />
            <rect x="80" y="10" width="240" height="170" rx="4" className="fill-none stroke-blue-400 dark:stroke-blue-500" strokeWidth="1.5" strokeDasharray="4 3" />
            {/* Zone 1: Name */}
            <rect x="100" y="26" width="120" height="16" rx="3" className="fill-zinc-800 dark:fill-zinc-200" />
            <text x="340" y="38" className="mock-label fill-blue-600 dark:fill-blue-400">← Name</text>
            {/* Zone 2: Headline */}
            <rect x="100" y="50" width="180" height="10" rx="2" className="fill-zinc-400 dark:fill-zinc-500" />
            <text x="340" y="58" className="mock-label fill-blue-600 dark:fill-blue-400">← Headline</text>
            {/* Zone 3: URL */}
            <rect x="100" y="70" width="100" height="8" rx="2" className="fill-blue-300 dark:fill-blue-600" />
            <text x="340" y="78" className="mock-label fill-blue-600 dark:fill-blue-400">← URL</text>
            {/* Zone 4: Summary */}
            <rect x="100" y="92" width="200" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="100" y="106" width="190" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <text x="340" y="104" className="mock-label fill-blue-600 dark:fill-blue-400">← Summary</text>
            {/* Zone 5: Skills */}
            <rect x="100" y="128" width="50" height="18" rx="9" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="156" y="128" width="60" height="18" rx="9" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="222" y="128" width="45" height="18" rx="9" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="100" y="152" width="55" height="18" rx="9" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="161" y="152" width="48" height="18" rx="9" className="fill-zinc-200 dark:fill-zinc-700" />
            <text x="340" y="148" className="mock-label fill-blue-600 dark:fill-blue-400">← Skills</text>
            {/* Bracket and label */}
            <text x="40" y="100" textAnchor="middle" className="mock-badge fill-blue-500 dark:fill-blue-400" transform="rotate(-90 40 100)">TOP 2 INCHES</text>
            {/* Grayed out rest */}
            <rect x="100" y="194" width="150" height="10" rx="2" className="fill-zinc-200/60 dark:fill-zinc-700/40" />
            <rect x="100" y="212" width="200" height="8" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="226" width="190" height="8" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="240" width="180" height="8" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="254" width="200" height="8" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="278" width="140" height="10" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="296" width="200" height="8" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="310" width="190" height="8" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="324" width="170" height="8" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="348" width="130" height="10" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="366" width="200" height="8" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            <rect x="100" y="380" width="180" height="8" rx="2" className="fill-zinc-200/40 dark:fill-zinc-700/30" />
            {/* Annotation */}
            <text x="340" y="290" className="mock-small fill-zinc-400 dark:fill-zinc-500">Rest of resume</text>
            <text x="340" y="304" className="mock-small fill-zinc-400 dark:fill-zinc-500">(most recruiters</text>
            <text x="340" y="318" className="mock-small fill-zinc-400 dark:fill-zinc-500">never get here)</text>
          </svg>
        </div>

        <h2 className={h2}>1. Your Name and a Headline</h2>
        <p>Your name should be the largest text on the page. Not huge, but clearly the first thing the eye lands on. Right below it, add a one-line headline that tells the recruiter exactly who you are and what you do.</p>
        <p>A good headline looks like this: &quot;Senior Backend Engineer · Payments · Go/Rust.&quot; That is three pieces of info in under ten words: your level, your domain, and your tools. The recruiter now knows if you are in the right ballpark before reading a single bullet point.</p>
        <p>A bad headline is your job title alone: &quot;Software Engineer.&quot; That tells them nothing they could not guess from the fact that you sent a resume for an engineering role.</p>
        <div className={callout}>
          <h3 className={h3}>Headline formula</h3>
          <p><span className={bold}>[Seniority + Role] · [Domain/Industry] · [Top 2 Technologies]</span></p>
          <p>Examples: &quot;Staff Frontend Engineer · E-commerce · React/TypeScript&quot; or &quot;DevOps Lead · FinTech · AWS/Kubernetes&quot; or &quot;Data Engineer · ML Pipelines · Python/Spark.&quot;</p>
        </div>

        <h2 className={h2}>2. A URL to Your Full Profile</h2>
        <p>Put a link to your web profile right below your name and headline. A clean URL like <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">cvin.bio/yourname</code> works well. It is short, easy to remember, and gives the recruiter a way to see your full background in a properly formatted layout.</p>
        <p>This matters because your resume is a summary. It cannot hold everything. A profile link lets the recruiter dig deeper on their own terms. It also makes you easy to share. When the recruiter forwards you to the hiring manager, they paste the URL into Slack instead of attaching a file. You can read more about why this works in our guide on <Link href="/cv-web-link" className={link}>putting a URL on your resume</Link>.</p>
        <p>Best for: anyone in tech. Recruiters expect to see a link to something, whether it is GitHub, a portfolio, or a profile page. Having nothing clickable at the top is a missed opportunity.</p>

        <h2 className={h2}>3. A Two-Sentence Value Summary</h2>
        <p>Not an objective statement. Not a paragraph. Two sentences that tell the recruiter what you bring and why it matters. Think of it as your answer to &quot;why should we talk to this person?&quot;</p>
        <p>Good example: &quot;Backend engineer with 7 years building payment systems that handle $2B+ in annual transactions. Led the team that cut checkout latency by 40% at a Series C fintech.&quot;</p>
        <p>Bad example: &quot;Passionate software engineer seeking a challenging role where I can grow my skills and contribute to an exciting team.&quot; That second one is an <Link href="/objective-statement-death" className={link}>objective statement</Link>, and it tells the recruiter nothing useful. It is about what you want, not what you offer.</p>

        <h2 className={h2}>4. Your Strongest Skills</h2>
        <p>List four or five of your strongest technical skills right after your summary. Not fifteen. Not twenty. Just the ones that are most relevant to the kinds of roles you are applying for.</p>
        <p>This works because it gives the recruiter a quick filter. They scan your skills, see &quot;Go, PostgreSQL, gRPC, AWS, Terraform&quot; and immediately know if your stack matches their team. If you list too many, you dilute the signal. The recruiter does not know if &quot;Docker&quot; means you ran it once in a tutorial or you manage 200 containers in production.</p>
        <p>Pick the skills you could talk about for 30 minutes in an interview. Leave everything else for the experience section where you can show how you used it.</p>

        <h2 className={h2}>What NOT to Put at the Top</h2>
        <p>Some things waste your most valuable real estate. Here is what to remove or move further down.</p>
        <p><span className={bold}>Objective statements.</span> &quot;Seeking a role where I can grow&quot; does not help the recruiter decide if you are qualified. Replace it with a value summary that describes what you bring.</p>
        <p><span className={bold}>Your full home address.</span> City and country are enough if the role is location-sensitive. Nobody needs your street name and zip code at the top of your resume. It is a privacy risk and a waste of space.</p>
        <p><span className={bold}>A photo.</span> In many countries, including the US, adding a photo can trigger bias concerns. Even where photos are common, they eat up space at the top that your headline and summary need more.</p>
        <p><span className={bold}>Date of birth.</span> Irrelevant to your qualifications and creates age bias risk. Leave it off entirely.</p>
        <div className={callout}>
          <h3 className={h3}>The test</h3>
          <p>Cover everything below the top two inches of your resume. Can a recruiter tell from just that visible area what you do, what level you are at, and what makes you worth calling? If not, rearrange until they can.</p>
        </div>

        <h2 className={h2}>How Recruiters Actually Read</h2>
        <p>Eye-tracking studies show that recruiters follow a rough F-pattern. They read the top line fully, scan down the left side, and occasionally dart right when something catches their attention. This means the left side of your top section gets the most eyeball time.</p>
        <p>Put your name and headline flush left. Put your URL directly below. Put your summary next. By the time the recruiter has finished their F-pattern scan of your top section, they should know your level, your specialty, your top skills, and where to learn more. That is enough for them to decide you are worth a real read.</p>
        <p>If your top section is cluttered with a mailing address, a photo, and an objective about what you hope to learn, the recruiter finishes their F-scan without learning anything useful. You just lost your window.</p>

        <h2 className={h2}>Putting It Together</h2>
        <p>Here is what the top of your resume should look like, in order:</p>
        <ol className={ol}>
          <li><span className={bold}>Your name</span> in the largest font on the page</li>
          <li><span className={bold}>A one-line headline</span> with your role, domain, and top tools</li>
          <li><span className={bold}>Your profile URL</span> and email on the same line</li>
          <li><span className={bold}>A two-sentence value summary</span> describing what you bring</li>
          <li><span className={bold}>Four or five top skills</span> listed as simple text</li>
        </ol>
        <p>That is it. Everything else goes below. Your experience, education, projects, and certifications all get their own sections further down. But the top is reserved for the information that <Link href="/stand-out-inbox" className={link}>makes you stand out</Link> in the first 6 seconds.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/the-30-second-scan" className={link}>How recruiters really read your resume</Link></li>
          <li><Link href="/objective-statement-death" className={link}>Why objective statements are dead</Link></li>
          <li><Link href="/cv-web-link" className={link}>Why a URL is the best thing on your resume</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'best-portfolio-platforms-developers',
    title: 'Best Portfolio Platforms for Developers',
    excerpt: 'Seven real options for showing your work online, from free GitHub Pages to a fully custom domain. Here is what each one actually does well.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'What is the best free portfolio platform for developers?', answer: 'GitHub Pages is completely free and works well if you already have public repos. For something more polished without writing code, ReadCV or CVin.Bio both offer free tiers with clean layouts.' },
      { question: 'Do I need a custom domain for my developer portfolio?', answer: 'No. A custom domain looks professional but it is not required. A clean URL on any reputable platform works fine. What matters more is that the content is up to date and easy to read.' },
      { question: 'Should I build my portfolio site from scratch?', answer: 'Only if you enjoy frontend work and want the site itself to be a portfolio piece. Otherwise the time spent building and maintaining a custom site could go toward actual projects that demonstrate your skills.' },
    ],
    author: {
      name: 'Priya K.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>Every developer needs a place to show their work. The problem is not a lack of options. The problem is too many options, and most of them are built for different kinds of people.</p>
        <p>A frontend engineer who loves building UIs will be happy deploying a custom React site on Vercel. A backend developer who just wants a clean page with project links needs something simpler. Picking the wrong tool means you either spend weeks on your portfolio instead of coding, or you end up with a page that does not represent you well.</p>
        <p>Here are seven real options. For each one, I will tell you what it does well, where it falls short, and who should actually use it.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 720 380" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Comparison matrix of 7 portfolio platforms across 4 criteria">
            <style>{`
              .matrix-header { font: bold 13px system-ui; }
              .matrix-label { font: 14px system-ui; }
              .matrix-col { font: bold 11px system-ui; text-anchor: middle; }
            `}</style>
            {/* Column headers */}
            <text x="360" y="22" className="matrix-header fill-zinc-900 dark:fill-zinc-100" textAnchor="middle">Portfolio Platform Comparison</text>
            <line x1="40" y1="62" x2="700" y2="62" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="350" y="52" className="matrix-col fill-zinc-500 dark:fill-zinc-400">Free Tier?</text>
            <text x="460" y="52" className="matrix-col fill-zinc-500 dark:fill-zinc-400">Custom Domain?</text>
            <text x="575" y="52" className="matrix-col fill-zinc-500 dark:fill-zinc-400">Machine Readable?</text>
            <text x="672" y="52" className="matrix-col fill-zinc-500 dark:fill-zinc-400">Maintenance</text>
            {/* Row backgrounds */}
            <rect x="40" y="68" width="660" height="40" rx="6" className="fill-zinc-50 dark:fill-zinc-800/50" />
            <rect x="40" y="148" width="660" height="40" rx="6" className="fill-zinc-50 dark:fill-zinc-800/50" />
            <rect x="40" y="228" width="660" height="40" rx="6" className="fill-zinc-50 dark:fill-zinc-800/50" />
            <rect x="40" y="308" width="660" height="40" rx="6" className="fill-zinc-50 dark:fill-zinc-800/50" />
            {/* Row 1: GitHub Pages */}
            <text x="56" y="93" className="matrix-label fill-zinc-800 dark:fill-zinc-200">GitHub Pages</text>
            <text x="350" y="94" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" style={{font: '18px system-ui'}}>✓</text>
            <text x="460" y="94" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" style={{font: '18px system-ui'}}>✓</text>
            <text x="575" y="94" textAnchor="middle" className="fill-red-500 dark:fill-red-400" style={{font: '18px system-ui'}}>✗</text>
            <text x="672" y="93" textAnchor="middle" className="matrix-col fill-amber-600 dark:fill-amber-400">HIGH</text>
            {/* Row 2: Vercel / Netlify */}
            <text x="56" y="133" className="matrix-label fill-zinc-800 dark:fill-zinc-200">Vercel / Netlify</text>
            <text x="350" y="134" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" style={{font: '18px system-ui'}}>✓</text>
            <text x="460" y="134" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" style={{font: '18px system-ui'}}>✓</text>
            <text x="575" y="134" textAnchor="middle" className="fill-red-500 dark:fill-red-400" style={{font: '18px system-ui'}}>✗</text>
            <text x="672" y="133" textAnchor="middle" className="matrix-col fill-red-500 dark:fill-red-400">HIGH</text>
            {/* Row 3: Notion */}
            <text x="56" y="173" className="matrix-label fill-zinc-800 dark:fill-zinc-200">Notion</text>
            <text x="350" y="174" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" style={{font: '18px system-ui'}}>✓</text>
            <text x="460" y="174" textAnchor="middle" className="fill-red-500 dark:fill-red-400" style={{font: '18px system-ui'}}>✗</text>
            <text x="575" y="174" textAnchor="middle" className="fill-red-500 dark:fill-red-400" style={{font: '18px system-ui'}}>✗</text>
            <text x="672" y="173" textAnchor="middle" className="matrix-col fill-emerald-600 dark:fill-emerald-400">LOW</text>
            {/* Row 4: LinkedIn */}
            <text x="56" y="213" className="matrix-label fill-zinc-800 dark:fill-zinc-200">LinkedIn</text>
            <text x="350" y="214" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" style={{font: '18px system-ui'}}>✓</text>
            <text x="460" y="214" textAnchor="middle" className="fill-red-500 dark:fill-red-400" style={{font: '18px system-ui'}}>✗</text>
            <text x="575" y="214" textAnchor="middle" className="fill-red-500 dark:fill-red-400" style={{font: '18px system-ui'}}>✗</text>
            <text x="672" y="213" textAnchor="middle" className="matrix-col fill-emerald-600 dark:fill-emerald-400">LOW</text>
            {/* Row 5: ReadCV */}
            <text x="56" y="253" className="matrix-label fill-zinc-800 dark:fill-zinc-200">ReadCV</text>
            <text x="350" y="254" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" style={{font: '18px system-ui'}}>✓</text>
            <text x="460" y="254" textAnchor="middle" className="fill-red-500 dark:fill-red-400" style={{font: '18px system-ui'}}>✗</text>
            <text x="575" y="254" textAnchor="middle" className="fill-red-500 dark:fill-red-400" style={{font: '18px system-ui'}}>✗</text>
            <text x="672" y="253" textAnchor="middle" className="matrix-col fill-emerald-600 dark:fill-emerald-400">LOW</text>
            {/* Row 6: CVin.Bio */}
            <text x="56" y="293" className="matrix-label fill-zinc-800 dark:fill-zinc-200">CVin.Bio</text>
            <text x="350" y="294" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" style={{font: '18px system-ui'}}>✓</text>
            <text x="460" y="294" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" style={{font: '18px system-ui'}}>✓</text>
            <text x="575" y="294" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" style={{font: '18px system-ui'}}>✓</text>
            <text x="672" y="293" textAnchor="middle" className="matrix-col fill-emerald-600 dark:fill-emerald-400">LOW</text>
            {/* Row 7: Own Domain */}
            <text x="56" y="333" className="matrix-label fill-zinc-800 dark:fill-zinc-200">Own Domain</text>
            <text x="350" y="334" textAnchor="middle" className="fill-red-500 dark:fill-red-400" style={{font: '18px system-ui'}}>✗</text>
            <text x="460" y="334" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" style={{font: '18px system-ui'}}>✓</text>
            <text x="575" y="334" textAnchor="middle" className="fill-red-500 dark:fill-red-400" style={{font: '18px system-ui'}}>✗</text>
            <text x="672" y="333" textAnchor="middle" className="matrix-col fill-red-500 dark:fill-red-400">HIGH</text>
            {/* Bottom border */}
            <line x1="40" y1="358" x2="700" y2="358" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="360" y="375" textAnchor="middle" style={{font: '11px system-ui'}} className="fill-zinc-400 dark:fill-zinc-500">✓ = Yes  ✗ = No  |  Maintenance = effort to keep updated</text>
          </svg>
        </div>

        <h2 className={h2}>1. GitHub Pages</h2>
        <p><span className={bold}>Best for:</span> Developers who want something free and already live on GitHub.</p>
        <p>GitHub Pages lets you host a static site directly from a repo. If you have public repositories with good READMEs, your GitHub profile already works as a rough portfolio. Adding a Pages site on top gives you a landing page at <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">username.github.io</code>.</p>
        <p>The upside is obvious: it is free, it lives where your code already lives, and recruiters who check your GitHub will find it naturally. The downside is that you are responsible for the design, the layout, and keeping it updated. Most GitHub Pages sites end up as plain markdown or a template that has not been touched in two years.</p>
        <p>If you want to <Link href="/show-your-code" className={link}>show your code as proof of work</Link>, GitHub Pages is a natural fit. Just make sure the site itself does not look abandoned.</p>

        <h2 className={h2}>2. Vercel or Netlify</h2>
        <p><span className={bold}>Best for:</span> Frontend developers who want a custom site that doubles as a project.</p>
        <p>Vercel and Netlify let you deploy a React, Next.js, or any static site with a single push. The developer experience is excellent. You get instant previews, automatic deploys from Git, and free SSL on a custom domain.</p>
        <p>The catch is that you need to build the site first. That means choosing a framework, designing layouts, writing CSS, and maintaining it over time. For a frontend developer, the portfolio site itself is a showcase of your skills. For everyone else, it is a time sink that pulls you away from work that actually matters to employers.</p>
        <div className={callout}>
          <h3 className={h3}>When building your own site makes sense</h3>
          <p>If you are applying for frontend or full-stack roles, a well-built personal site on Vercel shows that you can ship. If you are a backend or data engineer, your time is better spent on something that highlights your actual domain.</p>
        </div>

        <h2 className={h2}>3. Notion</h2>
        <p><span className={bold}>Best for:</span> Anyone who needs something online in 30 minutes.</p>
        <p>Notion pages can be published publicly with one click. You already know the editor. You can drop in text, links, images, and toggles without touching any code. It is the fastest way to get a portfolio online.</p>
        <p>The tradeoff is that it looks like a Notion page. Every Notion portfolio has the same structure, the same fonts, and the same constraints. There is no custom domain on the free plan. And Notion pages load slowly, which matters when a recruiter clicks your link and waits for the spinner.</p>
        <p>Use Notion as a stopgap. Get something online today, then move to a better home when you have time.</p>

        <h2 className={h2}>4. LinkedIn</h2>
        <p><span className={bold}>Best for:</span> Being findable by recruiters who search LinkedIn all day.</p>
        <p>Everyone has a LinkedIn profile. That is both its strength and its limitation. Recruiters search LinkedIn constantly, so having a complete profile there is non-negotiable. But LinkedIn forces your work into its rigid format. You cannot control the layout, the visual hierarchy, or how your projects are displayed.</p>
        <p>LinkedIn is great for discovery but bad for differentiation. Two developers with similar experience look nearly identical on LinkedIn. You need somewhere else to show what makes your work different. Think of LinkedIn as the directory listing and your portfolio as the actual storefront.</p>

        <h2 className={h2}>5. ReadCV</h2>
        <p><span className={bold}>Best for:</span> Designers and creative developers who want a clean, visual profile.</p>
        <p>ReadCV gives you a beautiful one-page profile with a curated feel. The design is minimal and polished. You can add project cards with images, which works well if your work has a visual component.</p>
        <p>The limitation is that ReadCV leans heavily toward design portfolios. If your best work is a distributed system or a CLI tool, ReadCV does not give you a great way to present that. It also does not generate structured data that machines can parse, which matters more every year as <Link href="/ai-agents-browsing-resume" className={link}>AI agents start browsing candidate profiles</Link> programmatically.</p>

        <h2 className={h2}>6. CVin.Bio</h2>
        <p><span className={bold}>Best for:</span> Developers who want a professional profile that works for both humans and machines.</p>
        <p>CVin.Bio turns your resume into a hosted web profile at a clean URL like <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">cvin.bio/yourname</code>. You upload your existing CV and it builds a responsive page with your experience, skills, and projects structured as proper data.</p>
        <p>The thing that sets it apart is the machine-readable layer. Behind the page you see, there is schema.org markup and structured data that AI agents and ATS systems can parse directly. Your skills show up as a typed array, not words buried in a paragraph. This is the same idea behind putting a <Link href="/cv-web-link" className={link}>URL on your resume instead of a file</Link>.</p>
        <p>The downside is that it is less customizable than a fully custom site. You are working within a template, not building from scratch. If you want pixel-level control over every element, this is not the right tool. But if you want a professional profile that is always current and readable by both recruiters and software, it does that well.</p>

        <h2 className={h2}>7. Your Own Domain</h2>
        <p><span className={bold}>Best for:</span> Developers who want maximum control and long-term ownership.</p>
        <p>Buying a domain like <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">janedoe.dev</code> and building whatever you want gives you complete freedom. You own the URL forever. You can redesign it whenever you want. You can add a blog, case studies, interactive demos, or anything else.</p>
        <p>The cost is maintenance. Domains expire. SSL certificates need renewing. Hosting needs monitoring. The design needs updating. Most personal developer sites go through a cycle: excited launch, six months of neglect, guilt, another redesign, more neglect. Be honest with yourself about whether you will keep it updated.</p>
        <div className={callout}>
          <h3 className={h3}>The maintenance test</h3>
          <p>Before you buy a domain and build a custom site, ask yourself: did you update your LinkedIn profile in the last three months? If the answer is no, a custom site will not get updated either. Start with something that requires less upkeep and graduate to a custom domain when you have the habit.</p>
        </div>

        <h2 className={h2}>Which One Should You Pick?</h2>
        <p>There is no single right answer. But here is a simple way to decide.</p>
        <p>If you are a frontend developer who enjoys building UIs, go with Vercel or Netlify and make the site itself a portfolio piece. If you are a backend, DevOps, or data person who just needs a professional presence online, use CVin.Bio or ReadCV and spend your time on actual projects instead. If you are just starting out and need something online today, publish a Notion page and upgrade later.</p>
        <p>The biggest mistake is spending so long choosing a platform that you never publish anything. A live page with three good projects beats a planned custom site that never ships.</p>

        <div className={callout}>
          <h3 className={h3}>The real portfolio is the work</h3>
          <p>No platform fixes weak projects. The platform is just a frame. If you want to stand out, <Link href="/show-your-code" className={link}>show real code and real results</Link>. The portfolio platform just needs to stay out of the way and present your work clearly.</p>
        </div>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/show-your-code" className={link}>How to show your code on a resume</Link></li>
          <li><Link href="/cv-web-link" className={link}>Why a URL is the best way to share your resume</Link></li>
          <li><Link href="/ai-agents-browsing-resume" className={link}>AI agents are already browsing your resume</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'best-resume-keywords-tech',
    title: 'Best Resume Keywords for Tech Jobs',
    excerpt: 'The right keywords get you past the filter. The wrong ones make you look like you copied a job posting. Here is what actually matters by role in 2026.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'How many keywords should I put on a tech resume?', answer: 'There is no magic number. Focus on 8 to 12 technologies you have actually used in production. Each one should appear in context within your experience section, not just in a skills list at the top.' },
      { question: 'Should I list every technology I have ever touched?', answer: 'No. A long list of 30 technologies signals that you are a generalist who is not deep in anything. Hiring managers want to see depth. Pick the skills that match the role and show real experience with them.' },
      { question: 'Do ATS systems still scan for exact keyword matches?', answer: 'Most modern ATS systems use some form of semantic matching, so they can recognize that React.js and ReactJS are the same thing. But older systems still do exact matching, so use the most common spelling of each technology name.' },
    ],
    author: {
      name: 'Marcus W.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>Keywords are how software finds you. When a recruiter searches their ATS for &quot;React TypeScript&quot;, your resume either shows up or it does not. There is no partial credit.</p>
        <p>But listing every technology under the sun backfires too. A resume stuffed with 40 keywords looks like spam to a human reader, and modern AI screening tools can tell the difference between a keyword dropped into a skills list and a keyword backed by real experience. The goal is to pick the right words and put them in the right places.</p>
        <p>Here is what matters by role in 2026, which keywords are gaining weight, and which ones are losing relevance.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 300" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Horizontal bar chart showing keyword demand by tech category">
            <style>{`
              .bar-title { font: bold 13px system-ui; }
              .bar-label { font: 13px system-ui; }
              .bar-value { font: bold 11px system-ui; }
              .bar-axis { font: 10px system-ui; }
            `}</style>
            <text x="340" y="22" className="bar-title fill-zinc-900 dark:fill-zinc-100" textAnchor="middle">2026 Job Market Demand by Keyword Category</text>
            {/* Axis line */}
            <line x1="140" y1="42" x2="140" y2="260" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            {/* Frontend */}
            <text x="132" y="72" textAnchor="end" className="bar-label fill-zinc-700 dark:fill-zinc-300">Frontend</text>
            <rect x="140" y="56" width="420" height="24" rx="4" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="140" y="56" width="420" height="24" rx="4" fill="#3b82f6" opacity="0.8" />
            <text x="568" y="73" className="bar-value fill-white">Very High</text>
            {/* Backend */}
            <text x="132" y="116" textAnchor="end" className="bar-label fill-zinc-700 dark:fill-zinc-300">Backend</text>
            <rect x="140" y="100" width="460" height="24" rx="4" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="140" y="100" width="460" height="24" rx="4" fill="#6366f1" opacity="0.8" />
            <text x="608" y="117" className="bar-value fill-white">Highest</text>
            {/* DevOps */}
            <text x="132" y="160" textAnchor="end" className="bar-label fill-zinc-700 dark:fill-zinc-300">DevOps</text>
            <rect x="140" y="144" width="370" height="24" rx="4" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="140" y="144" width="370" height="24" rx="4" fill="#8b5cf6" opacity="0.8" />
            <text x="518" y="161" className="bar-value fill-white">High</text>
            {/* Data */}
            <text x="132" y="204" textAnchor="end" className="bar-label fill-zinc-700 dark:fill-zinc-300">Data</text>
            <rect x="140" y="188" width="340" height="24" rx="4" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="140" y="188" width="340" height="24" rx="4" fill="#a78bfa" opacity="0.8" />
            <text x="488" y="205" className="bar-value fill-white">High</text>
            {/* AI/ML */}
            <text x="132" y="248" textAnchor="end" className="bar-label fill-zinc-700 dark:fill-zinc-300">AI / ML</text>
            <rect x="140" y="232" width="490" height="24" rx="4" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="140" y="232" width="490" height="24" rx="4" fill="#ec4899" opacity="0.8" />
            <text x="638" y="249" className="bar-value fill-white">Fastest Growing</text>
            {/* Footer */}
            <text x="340" y="285" textAnchor="middle" className="bar-axis fill-zinc-400 dark:fill-zinc-500">Bar length = relative number of open positions mentioning category keywords</text>
          </svg>
        </div>

        <h2 className={h2}>Frontend Keywords</h2>
        <p><span className={bold}>High signal in 2026:</span> React, TypeScript, Next.js, Tailwind CSS, Vite, React Server Components, Zustand, Playwright, Web Components.</p>
        <p>React still dominates frontend hiring. But in 2026, saying &quot;React&quot; alone is not enough. Hiring managers expect you to specify what flavor: are you writing client-side SPAs, or are you building with React Server Components in Next.js? The distinction matters because the skills are different.</p>
        <p>TypeScript is no longer optional. Job postings that say &quot;JavaScript&quot; almost always mean &quot;TypeScript in practice.&quot; If you list JavaScript without TypeScript, it reads as outdated.</p>
        <p><span className={bold}>Losing weight:</span> jQuery (unless you are maintaining legacy code), Webpack (replaced by Vite in most new projects), Redux (Zustand and React context have taken over for most use cases), Sass (Tailwind has eaten this market).</p>
        <div className={callout}>
          <h3 className={h3}>Placement over count</h3>
          <p>Listing &quot;React&quot; in your skills section is worth less than writing &quot;Built a patient intake form in React with server-side validation that reduced submission errors by 40%.&quot; The keyword lands harder when it is tied to a result. Read more about <Link href="/tech-resume-keywords" className={link}>where to place keywords on your resume</Link> for maximum impact.</p>
        </div>

        <h2 className={h2}>Backend Keywords</h2>
        <p><span className={bold}>High signal in 2026:</span> Node.js, Python, Go, Rust, PostgreSQL, Redis, GraphQL, gRPC, event-driven architecture, microservices.</p>
        <p>Python and Node.js are the two biggest backend ecosystems by job volume. Go is growing fast at infrastructure-heavy companies. Rust shows up in performance-sensitive roles at companies like Cloudflare, Discord, and Figma.</p>
        <p>For databases, PostgreSQL has become the default choice for new projects. If you know Postgres well, say so explicitly. Listing &quot;SQL&quot; alone is too vague. Hiring managers want to know which database you used and what kind of queries you wrote.</p>
        <p><span className={bold}>Losing weight:</span> PHP (still has jobs but declining demand), MongoDB (its hype peaked years ago, though it is still widely used), Express.js alone without any larger framework context, SOAP APIs.</p>

        <h2 className={h2}>DevOps and Infrastructure</h2>
        <p><span className={bold}>High signal in 2026:</span> Docker, Kubernetes, Terraform, AWS (with specific services like ECS, Lambda, RDS), GitHub Actions, ArgoCD, Datadog, Pulumi.</p>
        <p>Generic cloud experience is not enough anymore. Saying &quot;AWS&quot; is like saying &quot;I know computers.&quot; Specify the services: &quot;Managed ECS clusters serving 50k requests per minute&quot; tells a different story than &quot;Experience with AWS.&quot;</p>
        <p>Terraform is the standard for infrastructure as code. If you also know Pulumi, mention it because the TypeScript-based approach is gaining adoption. For CI/CD, GitHub Actions has become the default for most teams, so list it by name rather than just saying &quot;CI/CD pipelines.&quot;</p>
        <p><span className={bold}>Losing weight:</span> Jenkins (still common but seen as legacy), Ansible for cloud provisioning (Terraform won), Heroku (the free tier shutdown hurt its mindshare), Chef and Puppet.</p>

        <h2 className={h2}>Data Engineering Keywords</h2>
        <p><span className={bold}>High signal in 2026:</span> SQL, Python, dbt, Apache Spark, Airflow, Snowflake, BigQuery, Kafka, Databricks, Delta Lake.</p>
        <p>SQL is the one keyword that never loses relevance in data roles. But again, be specific. &quot;Wrote complex analytical queries in BigQuery processing 2TB daily&quot; says more than &quot;proficient in SQL.&quot;</p>
        <p>dbt has become the standard for data transformation. If you work in analytics engineering and do not mention dbt, you look out of touch. Spark and Kafka still matter for large-scale processing, but make sure you mention the scale you worked at. Running Spark on a laptop for a tutorial is different from managing Spark jobs processing billions of events.</p>
        <p><span className={bold}>Losing weight:</span> Hadoop (replaced by Spark and cloud-native tools), Hive (absorbed into other tools), Informatica and SSIS (enterprise ETL tools that younger companies avoid), Tableau as a primary skill (it is still useful but BI tools are now table stakes).</p>

        <h2 className={h2}>AI and ML Keywords</h2>
        <p><span className={bold}>High signal in 2026:</span> PyTorch, fine-tuning, RAG (retrieval-augmented generation), prompt engineering, LangChain, vector databases, RLHF, model evaluation, MLOps, Hugging Face.</p>
        <p>The AI/ML keyword landscape shifted dramatically in the last two years. Before 2024, the important keywords were TensorFlow, scikit-learn, and feature engineering. Those still matter for traditional ML roles, but the market has moved toward large language models.</p>
        <p>If you work with LLMs, say so directly. Mention whether you are fine-tuning, building RAG pipelines, doing prompt engineering, or evaluating model outputs. These are distinct skills and hiring managers know the difference.</p>
        <p><span className={bold}>Losing weight:</span> TensorFlow (still used but PyTorch won the research and startup market), Keras (absorbed into TensorFlow), basic scikit-learn without production context, &quot;machine learning&quot; as a standalone keyword without specifics.</p>

        <h2 className={h2}>The Keyword Stuffing Trap</h2>
        <p>There is a temptation to list every keyword from the job posting. Do not do this. Modern <Link href="/beat-smart-ai-bots" className={link}>AI-powered screening tools</Link> check whether your keywords appear in context. If &quot;Kubernetes&quot; shows up in your skills section but never in any of your experience bullets, that is a red flag.</p>
        <p>Every keyword on your resume should pass a simple test: can you talk about it for five minutes in an interview? If the answer is no, remove it. A shorter list of genuine skills builds more <Link href="/keyword-trust" className={link}>keyword trust</Link> than a long list of buzzwords.</p>
        <div className={callout}>
          <h3 className={h3}>The five-minute rule</h3>
          <p>For each keyword on your resume, ask yourself: could I explain a real project where I used this technology, what problems I hit, and what I would do differently? If yes, keep it. If you would stumble, drop it. Interviewers will test your list.</p>
        </div>

        <h2 className={h2}>Placement Beats Quantity</h2>
        <p>Where you put a keyword changes how much weight it carries. A technology mentioned in your title or summary gets noticed first. A technology mentioned at the start of a bullet point gets scanned. A technology buried at the end of the third sentence in a paragraph gets missed.</p>
        <p>The most effective structure is to lead every experience bullet with the technology, followed by what you built and what the result was. &quot;Built a real-time analytics dashboard in React with D3.js, reducing report generation time from 4 hours to 2 minutes&quot; puts both keywords up front and ties them to an outcome.</p>
        <p>For a detailed breakdown of where exactly keywords should land on the page, read the full guide on <Link href="/tech-resume-keywords" className={link}>keyword placement for tech resumes</Link>.</p>

        <div className={callout}>
          <h3 className={h3}>A quick audit for your resume</h3>
          <p>Open your resume right now. Read only the first three words of every bullet point. If those words are &quot;Responsible for the&quot; or &quot;Worked on a&quot;, your keywords are buried. Rewrite each bullet so the technology or skill comes first.</p>
        </div>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/tech-resume-keywords" className={link}>Where to place keywords on a tech resume</Link></li>
          <li><Link href="/keyword-trust" className={link}>Why keyword trust matters more than keyword count</Link></li>
          <li><Link href="/beat-smart-ai-bots" className={link}>How to get past AI resume screening tools</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'best-ways-send-resume',
    title: 'Best Ways to Send Your Resume to a Recruiter',
    excerpt: 'You have five options for getting your resume in front of a recruiter, and most people default to the worst one.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'What is the best way to send a resume to a recruiter?', answer: 'A web profile link is the most effective method. It loads instantly on any device, always shows your latest info, and creates a rich preview card when shared on Slack or LinkedIn. PDF attachments still work but add friction for the reader.' },
      { question: 'Should I paste my resume in the email body?', answer: 'Plain text in the email body works well for cold outreach because it removes all download friction. The recruiter sees your qualifications immediately. The downside is you lose all formatting, so keep it short and link to your full profile.' },
      { question: 'Is it okay to send a Google Doc link as my resume?', answer: 'Google Doc links are better than file attachments because the recruiter does not need to download anything. However, they can look unprofessional if permission settings are wrong, and they still require Google account access to view properly on mobile.' },
    ],
    author: {
      name: 'Priya K.',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>A recruiter asks for your resume. You have maybe thirty seconds before the conversation moves on. What you send next matters more than most people think. Not just the content of your resume, but the <span className={bold}>format you deliver it in</span>.</p>
        <p>I&apos;ve talked to dozens of recruiters about how they actually receive and review resumes. The differences between methods are real, and they affect whether your resume gets read or gets buried. Here are the five most common ways to send a resume, ranked from best to worst.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 640 310" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tier list ranking 5 resume delivery methods from best to worst">
            <style>{`
              .tier-title { font: bold 13px system-ui; }
              .tier-rank { font: bold 18px system-ui; fill: white; }
              .tier-label { font: bold 13px system-ui; }
              .tier-desc { font: 11px system-ui; }
            `}</style>
            <text x="320" y="22" className="tier-title fill-zinc-900 dark:fill-zinc-100" textAnchor="middle">Resume Delivery Methods — Ranked Best to Worst</text>
            {/* Tier 1: Web Link — green */}
            <rect x="40" y="40" width="560" height="44" rx="8" fill="#16a34a" opacity="0.9" />
            <text x="68" y="67" className="tier-rank">#1</text>
            <text x="108" y="59" className="tier-label" fill="white">Web Profile Link</text>
            <text x="108" y="74" className="tier-desc" fill="#bbf7d0">Loads instantly, always current, rich previews when shared</text>
            {/* Tier 2: Google Doc — lime */}
            <rect x="40" y="92" width="560" height="44" rx="8" fill="#65a30d" opacity="0.85" />
            <text x="68" y="119" className="tier-rank">#2</text>
            <text x="108" y="111" className="tier-label" fill="white">Google Doc Link</text>
            <text x="108" y="126" className="tier-desc" fill="#ecfccb">No download, updatable — but permission issues and informal look</text>
            {/* Tier 3: Plain text — yellow */}
            <rect x="40" y="144" width="560" height="44" rx="8" fill="#ca8a04" opacity="0.85" />
            <text x="68" y="171" className="tier-rank">#3</text>
            <text x="108" y="163" className="tier-label" fill="white">Plain Text in Email</text>
            <text x="108" y="178" className="tier-desc" fill="#fef9c3">Zero friction to read — but no formatting, works only for short summaries</text>
            {/* Tier 4: PDF — orange */}
            <rect x="40" y="196" width="560" height="44" rx="8" fill="#ea580c" opacity="0.85" />
            <text x="68" y="223" className="tier-rank">#4</text>
            <text x="108" y="215" className="tier-label" fill="white">PDF Attachment</text>
            <text x="108" y="230" className="tier-desc" fill="#ffedd5">Familiar but gets blocked, terrible on mobile, frozen in time</text>
            {/* Tier 5: Word Doc — red */}
            <rect x="40" y="248" width="560" height="44" rx="8" fill="#dc2626" opacity="0.85" />
            <text x="68" y="275" className="tier-rank">#5</text>
            <text x="108" y="267" className="tier-label" fill="white">Word Document</text>
            <text x="108" y="282" className="tier-desc" fill="#fecaca">Renders inconsistently, security risk, flagged by email filters</text>
            {/* Footer */}
            <text x="320" y="306" textAnchor="middle" style={{font: '11px system-ui'}} className="fill-zinc-400 dark:fill-zinc-500">Based on recruiter feedback on friction, readability, and shareability</text>
          </svg>
        </div>

        <h2 className={h2}>1. Web Profile Link</h2>
        <p>This is the best option by a wide margin. You send a URL like <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">cvin.bio/yourname</code> and the recruiter taps it. Your profile loads instantly on their phone or laptop. No downloads. No file hunting. No wondering if they have the right software to open it.</p>
        <p>The real advantage shows up when the recruiter wants to share you with the hiring manager. They paste your link into Slack, and it shows a rich preview card with your name, photo, and headline. Compare that to forwarding an email with a PDF buried three replies deep.</p>
        <p>Web profiles also solve the versioning problem. If you fix a typo or add a new project after sending the link, the recruiter sees the updated version automatically. With a file, you would need to send a second email saying &quot;please use this one instead.&quot;</p>
        <div className={callout}>
          <h3 className={h3}>Best for</h3>
          <p>Every situation. Networking events, LinkedIn DMs, email applications, and cold outreach. A URL works anywhere you can type or paste text. Tools like <Link href="/cv-web-link" className={link}>CVin.Bio</Link> give you a permanent profile URL with your own name in it.</p>
        </div>

        <h2 className={h2}>2. Google Doc Link</h2>
        <p>A Google Doc link is a decent middle ground. The recruiter clicks it and sees your resume in their browser. No download needed. You can update the document after sending, and the link always points to the latest version.</p>
        <p>The problems start with permissions. If you forget to set sharing to &quot;anyone with the link,&quot; the recruiter hits an access request page. That kills momentum instantly. Some corporate firewalls also block Google Docs entirely, which means your resume never loads.</p>
        <p>Google Docs also look like, well, Google Docs. The toolbar is visible. There is a blue banner at the top. It signals &quot;draft document&quot; rather than &quot;polished professional profile.&quot; For an early-career role that might be fine. For a senior position, it can feel underdone.</p>
        <p><span className={bold}>Pros:</span> No download, always current, easy to create. <span className={bold}>Cons:</span> Permission headaches, looks informal, breaks on some corporate networks.</p>

        <h2 className={h2}>3. Plain Text in the Email Body</h2>
        <p>This one surprises people. Pasting a stripped-down version of your resume directly into the email body is actually more effective than attaching a file. The recruiter reads your qualifications the second they open the email. Zero friction.</p>
        <p>I know a hiring manager at a mid-size startup who told me she prefers plain text cold emails over anything else. Her reasoning: &quot;I&apos;m reading email on my phone between meetings. If I have to download something, I&apos;ll do it later. Later usually means never.&quot;</p>
        <p>The obvious downside is you lose all formatting. No columns, no bold headers, no skills section with nice spacing. You need to be ruthless about editing. Keep it to your name, target role, three to four best achievements, and a link to your full profile. Think of it as a trailer, not the full movie.</p>
        <p><span className={bold}>Pros:</span> Instant visibility, works on every device, no attachments to block. <span className={bold}>Cons:</span> No formatting, only works for short summaries.</p>

        <h2 className={h2}>4. PDF Attachment</h2>
        <p>This is the default choice for most job seekers, and it has real problems. Start with the fact that <Link href="/cv-attachments" className={link}>enterprise email systems often strip or quarantine attachments</Link>. Your beautifully designed PDF might sit in a security sandbox for 24 hours while other candidates get reviewed.</p>
        <p>Even when the PDF arrives, the recruiter has to download it, find it in their downloads folder, and open it in a viewer. If they are on their phone, your carefully designed two-column layout becomes a tiny, unreadable mess that requires pinch-zooming. Over 60% of initial resume screens happen on mobile devices now.</p>
        <p>There is also the version lock problem. Once you send that file, it is frozen in time. Found a better way to describe your last project? Too bad. That old version is what the recruiter has.</p>
        <p><span className={bold}>Pros:</span> Familiar format, preserves design on desktop. <span className={bold}>Cons:</span> Gets blocked by security filters, terrible on mobile, impossible to update after sending.</p>

        <h2 className={h2}>5. Word Document</h2>
        <p>Sending a .docx file is the worst option. Every problem with PDFs applies here, plus new ones. Word documents render differently depending on which version of Word (or which alternative app) the recruiter uses. Your fonts change. Your margins shift. Your carefully aligned sections fall apart.</p>
        <p>Word files are also a bigger security risk than PDFs. They can contain macros, which means corporate email filters flag them more aggressively. Some companies block .docx attachments entirely.</p>
        <p>The only time a Word doc makes sense is when a recruiter at a staffing agency specifically asks for one. They do this because they want to strip your contact info and add their agency branding before forwarding you to the client. If that is the situation, send the .docx. Otherwise, avoid it.</p>
        <p><span className={bold}>Pros:</span> Easy to edit, some agencies require it. <span className={bold}>Cons:</span> Renders inconsistently, higher security risk, gets flagged by email filters.</p>

        <h2 className={h2}>Picking the Right Method</h2>
        <p>The situation matters. Here are a few real scenarios and what to do in each one.</p>
        <p><span className={bold}>You&apos;re at a networking event</span> and someone asks for your resume. Pull out your phone and text them your profile link. That is it. No fumbling with files. They tap the link and see everything. If you have a CVin.Bio profile, the URL is short enough to say out loud.</p>
        <p><span className={bold}>A recruiter DMs you on LinkedIn.</span> Drop your web profile link in the chat. LinkedIn renders a preview card automatically. The recruiter sees your headline and photo without leaving the conversation. If you send a PDF, LinkedIn wraps it in a download prompt that most people skip.</p>
        <p><span className={bold}>You&apos;re applying through a job portal</span> that requires a file upload. Upload a simple, clean PDF with minimal formatting. Put your profile URL at the very top of the document. The ATS parses the simple text. The human who reads it later clicks your link and sees the full, well-designed version.</p>

        <div className={callout}>
          <h3 className={h3}>The one rule that always applies</h3>
          <p>No matter which method you use, make the recruiter&apos;s job easier. Every extra step between &quot;I received this&quot; and &quot;I can read this&quot; is a chance for them to move on to someone else. The best format is the one with the <Link href="/stand-out-inbox" className={link}>fewest barriers between you and their attention</Link>.</p>
        </div>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/cv-attachments" className={link}>Why PDF attachments are losing to web profiles</Link></li>
          <li><Link href="/cv-web-link" className={link}>Should you put a URL on your resume?</Link></li>
          <li><Link href="/stand-out-inbox" className={link}>How to stand out in a recruiter&apos;s inbox</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'best-resume-mistakes',
    title: 'Best Resume Mistakes to Fix Before Applying',
    excerpt: 'Ten resume mistakes ranked by how much damage they actually do, starting with the one that gets you rejected in under three seconds.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'What is the worst mistake you can make on a resume?', answer: 'Misspelling the company name you are applying to. It tells the recruiter you did not care enough to double-check the most basic detail, and it usually results in an immediate rejection before they read anything else.' },
      { question: 'Do skill bars on resumes actually hurt you?', answer: 'Yes. Rating yourself 4 out of 5 in Python gives the recruiter no useful information and raises more questions than it answers. Replace skill bars with concrete examples of what you built and the results it produced.' },
      { question: 'How many resume mistakes does a typical applicant have?', answer: 'Most resumes have at least three of the ten common mistakes. The good news is that all of them are fixable in under an hour if you know what to look for.' },
    ],
    author: {
      name: 'Tomás R.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>Every resume has mistakes. Most people know about the obvious ones like typos and bad formatting. But some mistakes do far more damage than others. A missing comma is annoying. Misspelling the company name you are applying to is a death sentence.</p>
        <p>I ranked the ten most common resume mistakes by how much they actually hurt your chances. The list starts with the ones that get you rejected immediately and works down to the ones that quietly hold you back.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 640 520" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Severity chart ranking 10 resume mistakes from most to least damaging">
            <style>{`
              .sev-title { font: bold 13px system-ui; }
              .sev-rank { font: bold 13px system-ui; fill: white; }
              .sev-label { font: 12px system-ui; fill: white; }
              .sev-zone { font: bold 10px system-ui; text-anchor: middle; }
            `}</style>
            <text x="320" y="22" className="sev-title fill-zinc-900 dark:fill-zinc-100" textAnchor="middle">Resume Mistakes — Damage Severity Scale</text>
            {/* Zone labels */}
            <text x="24" y="80" className="sev-zone" fill="#dc2626" transform="rotate(-90 24 80)" style={{letterSpacing: '2px'}}>CRITICAL</text>
            <text x="24" y="240" className="sev-zone" fill="#ea580c" transform="rotate(-90 24 240)" style={{letterSpacing: '2px'}}>SERIOUS</text>
            <text x="24" y="400" className="sev-zone" fill="#ca8a04" transform="rotate(-90 24 400)" style={{letterSpacing: '2px'}}>MODERATE</text>
            {/* #1 */}
            <rect x="44" y="38" width="576" height="40" rx="6" fill="#dc2626" opacity="0.95" />
            <text x="60" y="63" className="sev-rank">#1</text>
            <text x="96" y="63" className="sev-label">Typos in company names — instant rejection</text>
            {/* #2 */}
            <rect x="44" y="84" width="540" height="40" rx="6" fill="#dc2626" opacity="0.82" />
            <text x="60" y="109" className="sev-rank">#2</text>
            <text x="96" y="109" className="sev-label">Generic objective statements — says nothing useful</text>
            {/* #3 */}
            <rect x="44" y="130" width="504" height="40" rx="6" fill="#ea580c" opacity="0.85" />
            <text x="60" y="155" className="sev-rank">#3</text>
            <text x="96" y="155" className="sev-label">Overstuffed bullet points — eyes glaze over</text>
            {/* #4 */}
            <rect x="44" y="176" width="468" height="40" rx="6" fill="#ea580c" opacity="0.78" />
            <text x="60" y="201" className="sev-rank">#4</text>
            <text x="96" y="201" className="sev-label">Skill bars and ratings — no real meaning</text>
            {/* #5 */}
            <rect x="44" y="222" width="432" height="40" rx="6" fill="#d97706" opacity="0.8" />
            <text x="60" y="247" className="sev-rank">#5</text>
            <text x="96" y="247" className="sev-label">Non-responsive formatting — unreadable on mobile</text>
            {/* #6 */}
            <rect x="44" y="268" width="396" height="40" rx="6" fill="#d97706" opacity="0.72" />
            <text x="60" y="293" className="sev-rank">#6</text>
            <text x="96" y="293" className="sev-label">Wrong file format — blocked or broken</text>
            {/* #7 */}
            <rect x="44" y="314" width="360" height="40" rx="6" fill="#ca8a04" opacity="0.75" />
            <text x="60" y="339" className="sev-rank">#7</text>
            <text x="96" y="339" className="sev-label">Missing keywords — filtered by ATS</text>
            {/* #8 */}
            <rect x="44" y="360" width="324" height="40" rx="6" fill="#ca8a04" opacity="0.65" />
            <text x="60" y="385" className="sev-rank">#8</text>
            <text x="96" y="385" className="sev-label">Gaps with no explanation — invites assumptions</text>
            {/* #9 */}
            <rect x="44" y="406" width="288" height="40" rx="6" fill="#a3a3a3" opacity="0.7" />
            <text x="60" y="431" className="sev-rank">#9</text>
            <text x="96" y="431" className="sev-label">Outdated contact info — silent missed calls</text>
            {/* #10 */}
            <rect x="44" y="452" width="252" height="40" rx="6" fill="#a3a3a3" opacity="0.55" />
            <text x="60" y="477" className="sev-rank">#10</text>
            <text x="96" y="477" className="sev-label">No way to verify claims — low trust</text>
            {/* Footer */}
            <text x="320" y="510" textAnchor="middle" style={{font: '11px system-ui'}} className="fill-zinc-400 dark:fill-zinc-500">Bar length = relative impact on your chances of getting an interview</text>
          </svg>
        </div>

        <h2 className={h2}>#1: Typos in Company Names</h2>
        <p>This is the single most damaging mistake you can make. If your resume says &quot;Gogle&quot; or &quot;Micosoft&quot; or &quot;Amzon,&quot; the recruiter assumes you did not proofread a document that represents the most important parts of your career. They stop reading.</p>
        <p>It gets worse when you misspell the company you are applying to. That tells the recruiter this is a mass-blasted application where you did not even swap in the right name. I talked to a recruiter at a Series B startup who said she rejects about 5% of applications purely for this reason.</p>
        <p>The fix is simple. Read your resume out loud before you send it. Spell-check catches &quot;teh&quot; but it does not catch &quot;Googel&quot; because that is not a dictionary word. Your eyes need to do this work.</p>

        <h2 className={h2}>#2: Generic Objective Statements</h2>
        <p>&quot;Seeking a challenging position where I can apply my skills and grow professionally.&quot; This sentence appears on thousands of resumes and says absolutely nothing. It tells the recruiter you could not be bothered to write something specific to their role.</p>
        <p>The deeper problem is that <Link href="/objective-statement-death" className={link}>objective statements center the resume around what you want</Link> instead of what you offer. The recruiter does not care what you are seeking. They care what you can do for them. Replace the objective with a two-sentence summary of your strongest relevant experience.</p>

        <h2 className={h2}>#3: Overstuffed Bullet Points</h2>
        <p>You know the type. A single bullet point that runs four lines long, lists six technologies, mentions three projects, and somehow also includes a soft skill. The recruiter&apos;s eyes glaze over after the first line. They skip the bullet entirely and probably the rest of your experience section too.</p>
        <p>Good bullet points do one thing: state a result. <Link href="/overstuffing-bullets" className={link}>Each bullet should be one accomplishment with one measurable outcome</Link>. If your bullet point has the word &quot;and&quot; more than once, it needs to be split into two bullets or trimmed down.</p>

        <h2 className={h2}>#4: Skill Bars and Ratings</h2>
        <p>Those visual bars that show you are &quot;85% proficient in JavaScript&quot; look nice in Canva templates. They are useless to recruiters. What does 85% even mean? Compared to whom? A senior engineer at Google would rate themselves differently than a bootcamp graduate, and the bar gives no context for either.</p>
        <p>Skill bars also <Link href="/generic-skill-bars" className={link}>actively hurt your credibility</Link>. If you rate yourself 4 out of 5 in React, the interviewer will test you at that level. If you are actually at a 2, you just set yourself up to fail. Drop the bars. List your skills as plain text, and let your project descriptions prove your depth.</p>

        <div className={callout}>
          <h3 className={h3}>A quick self-test</h3>
          <p>Open your resume right now. Count how many of these first four mistakes you have. If the answer is two or more, your resume is likely getting filtered out before a human ever reads it. The good news: all four are fixable in twenty minutes.</p>
        </div>

        <h2 className={h2}>#5: Non-Responsive Formatting</h2>
        <p>Your two-column PDF with the sidebar looks great on your laptop. It looks terrible on a recruiter&apos;s phone. Over 60% of initial resume screens happen on mobile now. If your resume requires pinch-zooming to read, most recruiters will close it and move on to the next candidate.</p>
        <p>The fix is to either simplify your PDF to a single column or switch to a <Link href="/mobile-responsive-cv" className={link}>web-based profile that adapts to any screen size</Link> automatically. Your content stays the same. The reading experience just stops being painful.</p>

        <h2 className={h2}>#6: Wrong File Format</h2>
        <p>Sending a .pages file to a Windows user. Exporting a Canva design as a JPEG instead of a PDF. Submitting a Google Doc link that requires sign-in. Every wrong file format is a barrier between you and the person trying to read your resume.</p>
        <p>If you must send a file, PDF is the safest bet. But even PDFs get stripped by corporate email security. The most reliable approach is a permanent web link that works for everyone, on every device, with no software required.</p>

        <h2 className={h2}>#7: Missing Keywords</h2>
        <p>Many companies use applicant tracking systems that scan for specific terms before a human ever sees your resume. If the job posting says &quot;Kubernetes&quot; and your resume only says &quot;container orchestration,&quot; you might get filtered out even though you clearly know the tool.</p>
        <p>This does not mean you should stuff your resume with buzzwords. It means you should <Link href="/keyword-trust" className={link}>mirror the language from the job description</Link> when it honestly describes your experience. Read the posting carefully. If they say &quot;React,&quot; write &quot;React.&quot; If they say &quot;CI/CD,&quot; write &quot;CI/CD.&quot; Do not make the software guess.</p>

        <h2 className={h2}>#8: Gaps With No Explanation</h2>
        <p>A one-year gap on your resume is not a problem. A one-year gap with no explanation is. Recruiters will fill in the blank with their worst assumption. They might think you were fired and could not find work. The reality might be that you were freelancing, caring for family, or traveling.</p>
        <p>You do not need a long story. A single line like &quot;2022-2023: Freelance consulting for early-stage startups&quot; or &quot;2023: Career break for family care&quot; removes the mystery. <Link href="/gap-explanation" className={link}>Brief, honest gap explanations</Link> actually build trust. Silence does the opposite.</p>

        <h2 className={h2}>#9: Outdated Contact Info</h2>
        <p>This one is quieter than the others but still costly. If a recruiter tries to call the number on your resume and gets a disconnected line, or emails an address you stopped checking two years ago, that opportunity is gone. You will never know it happened.</p>
        <p>Check your resume right now. Is the email address current? Does the phone number work? Is there a LinkedIn URL that goes to the right profile? If you use a web-based profile, you can update contact details in one place and every link you have ever shared stays current.</p>

        <h2 className={h2}>#10: No Way to Verify Claims</h2>
        <p>You say you &quot;increased revenue by 40%.&quot; The recruiter thinks: &quot;Says who?&quot; Resumes are self-reported documents with no built-in way to check if anything is true. That is fine when your claims are modest. But the bigger the claim, the more skepticism it generates.</p>
        <p>The best way to back up your resume is to link to evidence. GitHub repos, live projects, published articles, or a portfolio page. A web profile makes this easy because you can embed links directly alongside each claim. A PDF can only print a URL that nobody will bother to type into a browser.</p>

        <div className={callout}>
          <h3 className={h3}>Fix all ten in under an hour</h3>
          <p>None of these mistakes require a full resume rewrite. Proofread for typos (5 min). Kill the objective statement (2 min). Trim your bullets (10 min). Remove skill bars (2 min). Test on your phone (3 min). Check your file format (1 min). Add missing keywords (10 min). Explain gaps (5 min). Verify contact info (2 min). Add one portfolio link (5 min). Total: about 45 minutes for a dramatically better resume.</p>
        </div>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/objective-statement-death" className={link}>Why objective statements are dead</Link></li>
          <li><Link href="/overstuffing-bullets" className={link}>How to write resume bullets that get read</Link></li>
          <li><Link href="/generic-skill-bars" className={link}>Why skill bars hurt more than they help</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'ai-agents-browsing-resume',
    title: 'AI Agents Are Already Browsing Your Resume',
    excerpt: 'The first wave of autonomous recruiting agents is live. They read structured web data, not PDFs. Most candidates have no idea this shift happened.',
    date: 'Apr 06, 2026',
    faqs: [
      { question: 'What are AI recruiting agents?', answer: 'They are autonomous programs that search professional databases, compare candidates against job requirements, and produce ranked shortlists without any human involvement in the initial screening.' },
      { question: 'What is the x402 protocol and how does it affect hiring?', answer: 'x402 revives the old HTTP 402 Payment Required status code to let software pay for API access using stablecoins. This means AI agents can autonomously buy access to talent databases, query by query, without contracts or credit cards.' },
      { question: 'What is a machine readable resume?', answer: 'A professional profile published as structured web data with semantic HTML and schema.org markup. AI agents and search engines can parse your skills, experience, and credentials directly instead of guessing from a flat PDF.' },
      { question: 'How do I make my resume visible to AI agents in 2026?', answer: 'Get your profile onto a permanent URL with schema.org Person markup and structured data for your skills and experience. CVin.Bio generates this automatically for every profile.' },
      { question: 'What is the Model Context Protocol and why does it matter for recruiting?', answer: 'MCP is an open standard from Anthropic that gives AI agents a standard way to connect to external databases. Recruiting platforms with MCP servers let agents like Claude and ChatGPT search their candidate data using plain language queries.' },
    ],
    author: {
      name: 'Daniel R.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>Most people think of job searching as a thing humans do. You write a resume, you send it somewhere, a person reads it, and somebody calls you back or does not. That model worked for decades because the bottleneck was always on the employer side. Recruiters could only review so many PDFs per day, so candidates competed to land inside that limited attention window.</p>
        <p>That bottleneck is dissolving. In the past twelve months, a set of open protocols shipped that let software autonomously browse talent databases, compare candidates against job specs, and produce ranked shortlists. No human in the loop for the initial screen. The recruiter shows up after the shortlist is already built.</p>
        <p>If your professional identity is a PDF sitting in your downloads folder, these systems do not know you exist.</p>

        <h2 className={h2}>A Brief History of the 402 Status Code</h2>
        <p>When the architects of the early web designed HTTP in the 1990s, they reserved a status code that never got used. <span className={bold}>402 Payment Required.</span> The idea was that servers would eventually need a way to say &quot;this resource costs money, pay me first&quot; directly inside the protocol. But there was no internet-native money in 1995, so the code sat dormant for three decades.</p>
        <p>In May 2025, Coinbase finally activated it. Their x402 protocol turns that forgotten status code into a real payment rail. When an AI agent hits an API that requires payment, the server responds with a 402 and a price tag. The agent reads the price, signs a stablecoin transaction, retries the request with proof of payment attached, and gets the data. The whole exchange takes less than a second and costs a few cents.</p>
        <p>This matters for hiring because it removes the last friction point in machine-to-machine recruiting. Before x402, an AI agent that wanted to search a premium talent database needed a human to sign a contract, set up billing, and manage API keys. Now the agent just pays as it goes. No procurement cycle. No sales call. The agent has a wallet and a budget. It spends what it needs and stops.</p>

        <h2 className={h2}>The Three Protocols That Changed Recruiting</h2>
        <p>x402 handles the money. But two other protocols handle discovery and coordination, and together the three of them form something genuinely new.</p>
        <p><span className={bold}>Model Context Protocol</span> was built by Anthropic and gives AI agents a standardized way to connect to external data sources. Think of it like a universal adapter. An agent running on Claude or ChatGPT can plug into any database that exposes an MCP server and query it using natural language. &quot;Find senior React developers in Singapore with fintech backgrounds&quot; becomes a structured database query behind the scenes. The agent never needs to learn anyone&apos;s proprietary API.</p>
        <p><span className={bold}>Agent-to-Agent protocol</span>, from Google, lets agents delegate work to other agents. A recruiting agent finds a promising candidate and asks a verification agent to check their credentials. That verification agent asks a data agent to pull publication history from OpenAlex. The whole chain runs autonomously. Each agent is specialized. None of them need human supervision for the routine work.</p>
        <p>The <span className={bold}>x402 protocol</span> sits underneath both of these as the settlement layer. Whenever any agent in the chain hits a paid resource, x402 handles the transaction silently. The cost of searching a talent database, pulling a verified credential, checking a GitHub contribution graph. All micropayments, all automatic, all settled in USDC on Base.</p>
        <div className={callout}>
          <h3 className={h3}>Who is behind this</h3>
          <p>These are not side projects. The x402 Foundation operates under the Linux Foundation with backing from Google, AWS, Cloudflare, Visa, Mastercard, and Anthropic. MCP is an open standard with adoption from every major AI lab. A2A is backed by Google with over 60 partner organizations. The infrastructure is industrial grade.</p>
        </div>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 700 220" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Box 1: Hiring Manager */}
            <rect x="10" y="75" width="110" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="65" y="105" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Hiring Manager</text>
            <text x="65" y="122" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">types query</text>

            {/* Arrow 1→2 */}
            <line x1="120" y1="110" x2="155" y2="110" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="155,105 165,110 155,115" className="fill-zinc-400 dark:fill-zinc-500" />

            {/* Box 2: AI Agent */}
            <rect x="168" y="75" width="100" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="218" y="105" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">AI Agent</text>
            <text x="218" y="122" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">orchestrates</text>

            {/* Arrow 2→3 */}
            <line x1="268" y1="110" x2="303" y2="110" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="303,105 313,110 303,115" className="fill-zinc-400 dark:fill-zinc-500" />

            {/* Box 3: MCP Server */}
            <rect x="316" y="75" width="110" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="371" y="100" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">MCP Server</text>
            <text x="371" y="117" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">queries</text>
            <text x="371" y="132" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">talent DB</text>

            {/* Arrow 3→4 */}
            <line x1="426" y1="110" x2="461" y2="110" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="461,105 471,110 461,115" className="fill-zinc-400 dark:fill-zinc-500" />

            {/* Box 4: x402 Payment */}
            <rect x="474" y="75" width="90" height="70" rx="6" className="fill-amber-50 dark:fill-amber-900/30 stroke-amber-300 dark:stroke-amber-700" strokeWidth="1.5" />
            <text x="519" y="100" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">x402</text>
            <text x="519" y="117" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">micropayment</text>
            <text x="519" y="132" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-amber-600 dark:fill-amber-400">$0.02/query</text>

            {/* Arrow 4→5 */}
            <line x1="564" y1="110" x2="599" y2="110" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="599,105 609,110 599,115" className="fill-zinc-400 dark:fill-zinc-500" />

            {/* Box 5: Ranked Shortlist */}
            <rect x="612" y="75" width="80" height="70" rx="6" className="fill-emerald-50 dark:fill-emerald-900/30 stroke-emerald-400 dark:stroke-emerald-700" strokeWidth="1.5" />
            <text x="652" y="100" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Ranked</text>
            <text x="652" y="117" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Shortlist</text>
            <text x="652" y="134" textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Top 5</text>

            {/* Bottom label */}
            <text x="350" y="185" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Agent pays per query · Returns structured results</text>
          </svg>
        </div>

        <h2 className={h2}>What Actually Happens When an Agent Recruits</h2>
        <p>A hiring manager opens Claude and types a paragraph describing who they need. Something like &quot;I need a backend engineer who has actually shipped payments infrastructure, ideally someone who has worked at a Series B or later fintech in Southeast Asia, strong in Go or Rust, and I do not want anyone who has only done frontend and is trying to pivot.&quot;</p>
        <p>The agent parses this into structured requirements. It connects to every talent data source it has access to through MCP. It searches CVin.Bio, checks GitHub profiles, pulls academic records from OpenAlex. For data sources that charge per query, x402 handles the payment. A few cents per search. Maybe fifty cents for a full profile with verified credentials.</p>
        <p>Within minutes the agent produces a ranked list. Five candidates. Each one has a structured profile with skills represented as typed arrays, work history with real dates and company names, education with verified institutions. The agent did not &quot;read&quot; these profiles the way a person reads a resume. It compared structured data against structured requirements. There is no ambiguity, no guessing whether &quot;familiar with Go&quot; means two weeks or two years.</p>
        <p>The hiring manager reviews five profiles instead of two hundred applications. The recruiter did not post a job listing. They did not wait two weeks for applicants. They did not run keyword filters through an ATS. The agent went out and found people.</p>

        <h2 className={h2}>Why Your PDF Does Not Exist in This World</h2>
        <p>This is the part most people have not internalized yet. An AI agent operating through MCP and x402 never touches a PDF. It never downloads an email attachment. It never opens a Word document. These agents query structured databases and receive structured responses.</p>
        <p>Think about what your PDF resume actually is. It is a rendering of text laid out for a piece of paper. The visual arrangement is the product. But agents do not care about visual arrangement. They care about typed data. Is &quot;React&quot; in this person&apos;s skills array? How many years between their first and last senior engineering role? Does their education include a degree from an institution the agent recognizes?</p>
        <p>A PDF cannot answer any of these questions programmatically. It is a picture of text. An agent would need OCR to extract characters, natural language processing to guess what the characters mean, and heuristics to convert unstructured prose into typed fields. Every step introduces error. Every step is slower than just reading structured data from a database.</p>
        <div className={callout}>
          <h3 className={h3}>The real comparison</h3>
          <p>A structured web profile gives the agent <span className={bold}>your skills as a searchable array, your experience as typed objects with ISO dates, and your education as credential records with institution names.</span> There is nothing to parse. Nothing to guess. The agent compares your data against the job requirements the same way a database compares two rows in a table. Your beautiful Canva PDF with the gradient sidebar is not wrong. It is just invisible to this entire system.</p>
        </div>

        <h2 className={h2}>This Is Just SEO Again</h2>
        <p>If you were running a business in 2010 and your website was not indexed by Google, you were invisible to anyone who searched for your product. The businesses that understood this early optimized their sites with proper meta tags, semantic HTML, and structured data. The ones that did not lost a decade of organic discovery to competitors who did.</p>
        <p>The same dynamic is playing out right now with professional profiles. Candidates who publish structured, machine-readable profiles on the open web will get discovered by AI agents first. It is not more complicated than that. The agents are already running. The MCP server directories already list talent databases. The candidates in those databases are already getting surfaced.</p>
        <p>A machine-readable profile means your name, title, skills, work history, and education are published in a format that software can parse without guessing. Schema.org Person markup tells agents exactly who you are. Typed skills arrays let them filter by technology. Permanent URLs let them bookmark you and come back later when a matching role opens up.</p>
        <p>CVin.Bio builds this structured layer automatically for every profile. You upload your CV, and behind the human-readable page at <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">cvin.bio/yourname</code> there is schema.org markup, structured skills data, typed experience records, and an <Link href="/ai-discovery" className={link}>MCP server</Link> that lets any AI agent search the entire candidate database using natural language.</p>

        <h2 className={h2}>The Cost Structure That Makes This Inevitable</h2>
        <p>Traditional recruiting is extraordinarily expensive. A retained search firm takes 20 to 30 percent of first-year salary. A LinkedIn job post costs $300 to $500. Internal recruiters spend an average of 23 hours per hire. Technical roles take 42 days to fill on average.</p>
        <p>An AI agent with MCP access to three or four talent databases can produce a qualified shortlist in an afternoon. The total cost in x402 micropayments might be $10 to $20. Two cents per search query. Five cents per full profile. No invoices, no procurement, no enterprise sales cycle.</p>
        <p>This does not mean recruiters disappear. It means the first pass, the part where someone reads two hundred applications and picks fifteen to call, gets compressed from two weeks to two hours. The recruiter still does the interviews. The hiring manager still makes the final call. But the discovery phase, finding the right ten people to talk to, becomes an agent task.</p>
        <div className={callout}>
          <h3 className={h3}>Where the money goes</h3>
          <p>A company that currently pays a search firm $30,000 to fill a senior engineering role will eventually have an internal team that pays an AI agent $15 in micropayments to build the same shortlist. <span className={bold}>The $29,985 difference is why this shift is inevitable.</span> It is not about replacing humans. It is about eliminating the absurd cost of the initial search.</p>
        </div>

        <h2 className={h2}>What This Means For You</h2>
        <p>You do not need to understand stablecoins or HTTP status codes or protocol specifications. None of that is your problem. Your problem is simpler. You need to make sure your professional identity exists as structured data on the open web.</p>
        <p>Concretely that means getting off the PDF and onto a permanent URL with proper markup. It means making your skills explicit in a list, not buried in a narrative paragraph where an agent would have to guess what technologies you actually know. It means keeping your profile updated, because agents revisit data sources regularly and a profile touched this week ranks higher than one abandoned in 2024.</p>
        <p>And it means being present on platforms that agents already query. CVin.Bio exposes every profile through the Model Context Protocol. When an agent asks &quot;find me someone who knows TypeScript and has worked in healthcare&quot;, it searches our database directly. If your profile is there and your skills are tagged, you show up. If you are a PDF in someone&apos;s email, you do not.</p>
        <p>The hiring world is splitting quietly into two tracks. One track is the old one. Send PDF, wait, hear nothing, repeat. The other track runs on structured data, autonomous agents, and micropayment rails that did not exist eighteen months ago. The agents are already browsing. Whether they find you depends entirely on whether your profile is readable by machines or just readable by humans.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/cv-attachments" className={link}>Why you should stop sending PDF resumes</Link></li>
          <li><Link href="/cv-web-link" className={link}>Why a URL is the ultimate professional move</Link></li>
          <li><Link href="/beat-smart-ai-bots" className={link}>How to beat smart AI resume bots</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'cv-attachments',
    title: 'Best Way to Send Your Resume (Not PDF)',
    excerpt: 'That PDF you carefully designed is probably getting mangled before anyone reads it. Here is what actually happens when you email a resume as an attachment.',
    date: 'Mar 22, 2026',
      faqs: [
    { question: 'Why are PDF resumes failing in modern applicant tracking systems?', answer: 'Modern enterprise ATS parsers frequently fail to accurately scrape multi-column or heavily formatted PDF files, resulting in corrupted data extraction and immediate algorithm rejection.' },
    { question: 'Is a web link better than attaching a PDF file?', answer: 'Yes. A web link guarantees absolute visual consistency across all devices and allows the hiring manager to interact with a responsive layout without downloading unknown attachments.' },
    { question: 'Do recruiters accept URL submissions instead of files?', answer: 'Almost all modern corporate application portals explicitly request a website URL or portfolio link. Providing a dedicated CV link demonstrates technical competence.' },
  ],
  author: {
      name: 'Marcus T.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <h2 className={h2}>Files Look Different Everywhere</h2>
        <p>You spent hours getting the margins right in Google Docs, exported a clean PDF, and sent it off. The problem? The recruiter opened it on their phone during lunch.</p>
        <p>Your two-column layout is now a jumbled mess of overlapping text that requires pinching and zooming just to read your name. This is a common issue with <Link href="/mobile-responsive-cv" className={link}>non-responsive resumes</Link>. They close it and move on.</p>
        <div className={callout}>
          <h3 className={h3}>The hard truth about PDF rendering</h3>
          <ul className={ul}>
            <li><span className={bold}>60%+ of initial screens</span> now happen on mobile devices</li>
            <li>A PDF is locked to 8.5×11 inches, which is terrible for a 6-inch phone</li>
            <li>Custom fonts can fail to embed, wrecking your spacing entirely</li>
            <li>Transparent overlays from Canva sometimes render as opaque blocks</li>
          </ul>
        </div>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 660 300" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Left Column Header */}
            <text x="165" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">PDF Attachment</text>

            {/* Right Column Header */}
            <text x="495" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Web Link</text>

            {/* Divider */}
            <line x1="330" y1="10" x2="330" y2="290" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

            {/* LEFT COLUMN — 6 painful steps */}
            {/* Step 1 */}
            <rect x="90" y="48" width="150" height="32" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
            <text x="165" y="69" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Open Email</text>

            <line x1="165" y1="80" x2="165" y2="96" className="stroke-red-300 dark:stroke-red-700" strokeWidth="1.5" />
            <polygon points="160,93 165,100 170,93" className="fill-red-300 dark:fill-red-700" />

            {/* Step 2 */}
            <rect x="90" y="100" width="150" height="32" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
            <text x="165" y="121" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Download File</text>

            <line x1="165" y1="132" x2="165" y2="148" className="stroke-red-300 dark:stroke-red-700" strokeWidth="1.5" />
            <polygon points="160,145 165,152 170,145" className="fill-red-300 dark:fill-red-700" />

            {/* Step 3 */}
            <rect x="90" y="152" width="150" height="32" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
            <text x="165" y="173" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Find in Downloads</text>

            <line x1="165" y1="184" x2="165" y2="200" className="stroke-red-300 dark:stroke-red-700" strokeWidth="1.5" />
            <polygon points="160,197 165,204 170,197" className="fill-red-300 dark:fill-red-700" />

            {/* Step 4 */}
            <rect x="90" y="204" width="150" height="32" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
            <text x="165" y="225" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Open PDF Viewer</text>

            <line x1="165" y1="236" x2="165" y2="252" className="stroke-red-300 dark:stroke-red-700" strokeWidth="1.5" />
            <polygon points="160,249 165,256 170,249" className="fill-red-300 dark:fill-red-700" />

            {/* Step 5 */}
            <rect x="90" y="256" width="150" height="32" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
            <text x="165" y="277" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Pinch-Zoom to Read</text>

            {/* Friction label */}
            <text x="165" y="300" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-red-400 dark:fill-red-500">5 steps of friction</text>

            {/* RIGHT COLUMN — 3 smooth steps */}
            {/* Step 1 */}
            <rect x="420" y="90" width="150" height="36" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
            <text x="495" y="113" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Click Link</text>

            <line x1="495" y1="126" x2="495" y2="150" className="stroke-emerald-400 dark:stroke-emerald-600" strokeWidth="1.5" />
            <polygon points="490,147 495,154 500,147" className="fill-emerald-400 dark:fill-emerald-600" />

            {/* Step 2 */}
            <rect x="420" y="155" width="150" height="36" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
            <text x="495" y="178" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">View Profile</text>

            <line x1="495" y1="191" x2="495" y2="215" className="stroke-emerald-400 dark:stroke-emerald-600" strokeWidth="1.5" />
            <polygon points="490,212 495,219 500,212" className="fill-emerald-400 dark:fill-emerald-600" />

            {/* Step 3 */}
            <rect x="420" y="220" width="150" height="36" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
            <text x="495" y="243" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Share ✓</text>

            {/* Smooth label */}
            <text x="495" y="274" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-emerald-500 dark:fill-emerald-400">Zero friction</text>
          </svg>
        </div>

        <h2 className={h2}>Security Rules Kill Attachments</h2>
        <p>Enterprise email systems at large companies <span className={bold}>strip PDFs from emails entirely</span> or quarantine them for 24 hours. By the time your resume clears, fifty other candidates who sent <Link href="/cv-web-link" className={link}>clean profile links</Link> have already been reviewed.</p>
        <p>Even when it goes through, every attachment requires the recipient to download a file, which is a significant friction point. Modern hiring is about speed.</p>
        
        <h2 className={h2}>The Versioning Nightmare</h2>
        <p>When you send an attachment, you lose control of the content. If you find a better way to describe your current project or catch a minor error, that PDF in their inbox is now a historical relic. You cannot update it. This is why many candidates are <Link href="/update-cv-anytime" className={link}>switching to live profiles</Link> where they can fix typos instantly.</p>
        <div className={callout}>
          <h3 className={h3}>The advantage of the living document</h3>
          <p>A web profile is always current. If a recruiter clicks your link three days after you sent it, they see your latest accomplishments. You can even tailor the content specifically for different phases of the interview process without ever sending a second file.</p>
        </div>

        <h2 className={h2}>Common Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>What if a job portal strictly requires a file upload?</h3>
            <p>If an ATS system absolutely mandates a document upload, we recommend submitting a simple, plain-text document and pasting your CVin.Bio URL prominently at the top. This guarantees the automated parser reads your keywords perfectly, while the human recruiter gets to click your link to view your beautifully formatted profile.</p>
          </div>
          <div>
            <h3 className={h3}>What if the recruiter does not have internet?</h3>
            <p>In modern corporate hiring, this is virtually impossible. Recruiters use cloud-based tools (ATS, LinkedIn, Slack) all day. If they cannot access your URL, they cannot access their job posting either.</p>
          </div>
          <div>
            <h3 className={h3}>Is a link less professional than a file?</h3>
            <p>Currently, it is perceived as more professional in the tech industry. It shows technical fluency and a focus on the recipient&apos;s user experience.</p>
          </div>
        </div>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/mobile-responsive-cv" className={link}>Why mobile responsiveness is the new status quo</Link></li>
          <li><Link href="/cv-web-link" className={link}>How clean URLs build your professional brand</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'mobile-responsive-cv',
    title: 'How to Make Your Resume Mobile-Friendly',
    excerpt: 'Recruiters are scanning candidates on their phones between meetings. If your resume forces them to pinch-zoom and scroll sideways, you have already lost.',
    date: 'Mar 21, 2026',
      faqs: [
    { question: 'Do hiring managers read CVs on mobile phones?', answer: 'Over half of initial CV screenings are now conducted by recruiters and engineering managers on mobile devices during transit or away from their desks.' },
    { question: 'What is a mobile responsive CV?', answer: 'A mobile responsive CV automatically restructures its grid to a single vertical column on smaller screens ensuring absolutely zero horizontal scrolling or pinching is required to read your history.' },
    { question: 'Why do A4 paper formats fail on digital screens?', answer: 'Standard A4 PDF designs force rigid desktop dimensions onto heavy text rendering it virtually unreadable on mobile screens and triggering massive recruiter fatigue.' },
  ],
  author: {
      name: 'Elena R.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <h2 className={h2}>The Annoyance of Scrolling Sideways</h2>
        <p>Open any traditional PDF resume on your phone right now. You will immediately notice the text is too small to read. This is one major reason <Link href="/cv-attachments" className={link}>why PDFs are losing to web profiles</Link>. To read one line, you pinch-zoom and then scroll right. For the next line, scroll down and back left. <span className={bold}>Every single line requires this tedious zigzag.</span></p>
        <p>This is called forced horizontal scrolling, and every usability study in the last twenty years classifies it as a <span className={bold}>critical interface failure</span>.</p>
        <div className={callout}>
          <h3 className={h3}>The math of the 6-second scan</h3>
          <p>The average recruiter spends <span className={bold}>6-8 seconds</span> on an initial resume scan. If two of those seconds are wasted navigating, you have lost a third of your window. They will not fight your formatting. They will close the file and open the next one.</p>
        </div>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 620 320" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* LEFT PHONE — PDF on Phone */}
            <text x="165" y="24" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">PDF on Phone</text>

            {/* Phone outline */}
            <rect x="100" y="38" width="130" height="240" rx="16" className="fill-zinc-50 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="2" />
            {/* Screen area */}
            <rect x="110" y="58" width="110" height="195" rx="4" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            {/* Notch */}
            <rect x="145" y="42" width="40" height="8" rx="4" className="fill-zinc-300 dark:fill-zinc-600" />

            {/* Tiny unreadable text lines — cramped and messy */}
            <line x1="118" y1="78" x2="208" y2="78" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="2" />
            <line x1="118" y1="84" x2="195" y2="84" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="2" />
            <line x1="118" y1="90" x2="202" y2="90" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1.5" />
            <line x1="118" y1="96" x2="190" y2="96" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1.5" />
            <line x1="118" y1="102" x2="205" y2="102" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
            <line x1="118" y1="107" x2="198" y2="107" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
            <line x1="118" y1="112" x2="210" y2="112" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
            <line x1="118" y1="117" x2="185" y2="117" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
            <line x1="118" y1="122" x2="200" y2="122" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
            <line x1="118" y1="127" x2="195" y2="127" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="0.75" />
            <line x1="118" y1="131" x2="208" y2="131" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="0.75" />
            <line x1="118" y1="135" x2="190" y2="135" className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="0.75" />

            {/* Zoom gesture icon — two arrows pointing outward */}
            <circle cx="165" cy="195" r="18" className="fill-zinc-100 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-500" strokeWidth="1" />
            {/* Pinch arrows */}
            <line x1="155" y1="205" x2="148" y2="212" className="stroke-zinc-400 dark:stroke-zinc-400" strokeWidth="1.5" />
            <line x1="175" y1="185" x2="182" y2="178" className="stroke-zinc-400 dark:stroke-zinc-400" strokeWidth="1.5" />
            <polygon points="147,208 146,214 152,213" className="fill-zinc-400 dark:fill-zinc-400" />
            <polygon points="183,182 184,176 178,177" className="fill-zinc-400 dark:fill-zinc-400" />
            <text x="165" y="233" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">pinch to zoom</text>

            {/* RIGHT PHONE — Web Profile */}
            <text x="455" y="24" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Web Profile on Phone</text>

            {/* Phone outline */}
            <rect x="390" y="38" width="130" height="240" rx="16" className="fill-zinc-50 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="2" />
            {/* Screen area */}
            <rect x="400" y="58" width="110" height="195" rx="4" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            {/* Notch */}
            <rect x="435" y="42" width="40" height="8" rx="4" className="fill-zinc-300 dark:fill-zinc-600" />

            {/* Clean readable content */}
            {/* Avatar circle */}
            <circle cx="455" cy="82" r="14" className="fill-emerald-100 dark:fill-emerald-800 stroke-emerald-300 dark:stroke-emerald-600" strokeWidth="1" />
            <text x="455" y="86" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-300">JS</text>

            {/* Name */}
            <rect x="415" y="104" width="80" height="8" rx="2" className="fill-zinc-700 dark:fill-zinc-200" />
            {/* Title */}
            <rect x="420" y="118" width="70" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-500" />

            {/* Section divider */}
            <line x1="415" y1="134" x2="495" y2="134" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />

            {/* Clean readable text lines — well spaced */}
            <rect x="415" y="144" width="80" height="5" rx="1.5" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="415" y="156" width="72" height="5" rx="1.5" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="415" y="168" width="78" height="5" rx="1.5" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="415" y="180" width="65" height="5" rx="1.5" className="fill-zinc-300 dark:fill-zinc-600" />

            {/* Section divider */}
            <line x1="415" y1="196" x2="495" y2="196" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />

            {/* Skills pills */}
            <rect x="415" y="206" width="32" height="14" rx="7" className="fill-emerald-100 dark:fill-emerald-900/40 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.75" />
            <rect x="452" y="206" width="40" height="14" rx="7" className="fill-emerald-100 dark:fill-emerald-900/40 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.75" />
            <rect x="415" y="226" width="36" height="14" rx="7" className="fill-emerald-100 dark:fill-emerald-900/40 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.75" />

            {/* Checkmark */}
            <text x="455" y="300" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-emerald-500 dark:fill-emerald-400">Readable without zooming ✓</text>

            {/* VS label */}
            <text x="310" y="165" textAnchor="middle" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-zinc-300 dark:fill-zinc-600">vs</text>
          </svg>
        </div>

        <h2 className={h2}>The Power of Font Legibility</h2>
        <p>On a mobile screen, font choice is not just about style. It is about physical readability. A web-based profile uses web fonts optimized for back-lit screens, not paper. The contrast is higher, the character spacing is wider, and the eye does not have to work as hard.</p>
        <p>This matters especially if you want to ensure your <Link href="/tech-resume-keywords" className={link}>technical keywords actually get seen</Link> during a fast mobile scan.</p>
        <p>When a reader does not have to strain to understand your words, they focus on your achievements. Physical comfort in reading leads to higher retention of what you actually did.</p>

        <h2 className={h2}>Websites Fix This Automatically</h2>
        <p>A web-based profile solves this through responsive design:</p>
        <ul className={ul}>
          <li><span className={bold}>Two columns on desktop</span> collapse into one column on mobile</li>
          <li>Text sizes adjust to stay readable across different resolutions</li>
          <li>Interactive elements like buttons are sized for finger-taps, not mouse-clicks</li>
          <li>The reader just scrolls down, the most natural phone gesture</li>
        </ul>

        <h2 className={h2}>Interactivity and Detail</h2>
        <p>A non-responsive PDF is static. A web profile can have expandable sections. If a recruiter is interested in a specific project, they can click to see more details without cluttering the main page view. This allows you to provide high-level summaries and detailed exploration in the same document without overwhelming the reader.</p>

        <h2 className={h2}>Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>Does a responsive profile work on older phones?</h3>
            <p>Yes. Our templates use standard modern CSS that works on any smartphone from the last decade. If they have a browser, your resume will look perfect.</p>
          </div>
          <div>
            <h3 className={h3}>Will my multi-column layout look confusing on mobile?</h3>
            <p>No. On mobile, columns are intelligently stacked vertically. Your sidebars and skills move naturally below your main summary so the text remains wide and legible.</p>
          </div>
          <div>
            <h3 className={h3}>Can recruiters see the desktop version on their phone?</h3>
            <p>It is best that they don&apos;t. Forcing the desktop view on a phone creates the "pinch-zoom" problem we are trying to solve. The responsive layout is designed specifically for their context.</p>
          </div>
        </div>

        <h2 className={h2}>Recommended Guides</h2>
        <ul className={ul}>
          <li><Link href="/tech-resume-keywords" className={link}>How visual hierarchy impacts recruiter scanning</Link></li>
          <li><Link href="/cv-attachments" className={link}>Why email attachments are a security and UX risk</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'cv-web-link',
    title: 'Should You Put a URL on Your Resume?',
    excerpt: 'Sharing a clean URL instead of an attachment changes how people perceive you before they even read a single word of your experience.',
    date: 'Mar 20, 2026',
      faqs: [
    { question: 'Should I purchase a custom domain for my resume?', answer: 'Operating your professional CV on a clean dedicated web link signals high technical sophistication and personal brand investment to prospective employers.' },
    { question: 'How do I share a web profile in an email?', answer: 'Simply hyperlink a professional call-to-action text phrase directly to your live profile link rather than forcing the recipient to download and scan a massive local file attachment.' },
    { question: 'Can tracking software process a naked URL?', answer: 'Yes. Most modern parsing engines will automatically follow dedicated URLs inside the primary application field to extract relevant structural metadata.' },
  ],
  author: {
      name: 'James L.',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <h2 className={h2}>Sharing Is Effortless</h2>
        <p>A recruiter receives your URL and wants to share you with the hiring manager. They copy the link, paste it into Slack, and hit send. The hiring manager sees a <span className={bold}>rich preview card</span> with your photo, name, and headline, all rendered automatically.</p>
        <p>Now think about the PDF version of the same workflow. It involves downloading, hunting for the file, and re-uploading. This is why many hiring teams are choosing <Link href="/stand-out-inbox" className={link}>candidates who simplify their inbox</Link>. Every step is a chance for the momentum to die.</p>

        <h2 className={h2}>Building a Personal Brand</h2>
        <p>A custom URL like cvin.bio/yourname is the beginning of your professional brand. It shows you have taken the time to curate your online presence. It moves you from being a "file on a server" to a "person with a platform." This subtle shift in status makes you more memorable when the team discusses candidates at the end of the week.</p>

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
        <p>One thing an attachment can never tell you is when it has been opened. With a web profile, you can track views. Knowing that your profile was viewed three times in the last hour from a specific city gives you a clear indication that a team is currently discussing you. This information is invaluable for managing your own nerves and following up at the right time.</p>

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
          <li><Link href="/stand-out-inbox" className={link}>How to use clean URLs to stand out in a crowded inbox</Link></li>
          <li><Link href="/update-cv-anytime" className={link}>The hidden benefit of being able to fix typos in real time</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'bypass-ats',
    title: 'How to Get Past ATS and Still Look Good',
    excerpt: 'Your beautifully designed resume gets fed into a parser that strips every visual element. Here is how to satisfy the robot and impress the human.',
    date: 'Mar 18, 2026',
      faqs: [
    { question: 'Why does the ATS ruin my resume formatting?', answer: 'Applicant Tracking Systems use raw optical character extraction. They strip away completely all visual layout CSS and positional formatting to read pure raw text data.' },
    { question: 'How do I submit both a URL and a fallback text file?', answer: 'Submit your interactive web link as the primary application endpoint and upload a strictly linear plain-text document as the fail-safe payload for archaic systems.' },
    { question: 'Are visual graphics safe to use on technical profiles?', answer: 'Heavy graphics are incredibly dangerous for automated parsers. Rely entirely on distinct typography weight and structural whitespace rather than embedded images.' },
  ],
  author: {
      name: 'Sarah K.',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <h2 className={h2}>How Parsers Destroy Your Resume</h2>
        <p>Systems like <span className={bold}>Taleo, Workday, Greenhouse, and Lever</span> all process resumes by ripping out every character of text and dropping it into a database. A recruiter then runs keyword searches against that database.</p>
        <p>The problem: the extraction engine reads text from top-left to bottom-right based on character coordinates. It does not understand columns. This is even worse if your <Link href="/pdf-breaks-ats" className={link}>PDF contains complex layers</Link> that confuse the robot even more.</p>
        <div className={callout}>
          <h3 className={h3}>What actually happens</h3>
          <p>If your skills are on the left and job history on the right, the parser merges them line by line. Your profile becomes gibberish like <span className={bold}>&quot;Python Senior Engineer 2019&quot;</span> where your skill got smashed into your job title. A keyword search for &quot;Python&quot; will not match this mangled string.</p>
        </div>

        <h2 className={h2}>The Human Factor in the ATS</h2>
        <p>Even if the robot parses your text correctly, the human recruiter eventually has to read it. Most ATS interfaces show the parsed text in a very ugly, Courier-style plain text box. Your design is gone. Your hierarchy is gone. Your personality is gone.</p>
        <p>By providing a link, you provide a choice. You give the recruiter a chance to leave the ugly ATS interface and see the "real" you on your professional profile.</p>

        <h2 className={h2}>The Dual-Submission Fix</h2>
        <p>Submit two things:</p>
        <ol className={ol}>
          <li><span className={bold}>A plain, single-column text document</span> into the ATS upload. Zero columns, zero graphics, zero fancy fonts. Designed for the robot.</li>
          <li><span className={bold}>Your web profile URL</span> at the very top of that document, right below your name. Designed for the human.</li>
        </ol>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 250" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">

            {/* Origin node: You Submit */}
            <rect x="16" y="95" width="90" height="50" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="61" y="117" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">You</text>
            <text x="61" y="132" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Submit</text>

            {/* Fork — line going up to top track */}
            <line x1="106" y1="110" x2="145" y2="60" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="141,56 148,56 145,63" className="fill-zinc-400 dark:fill-zinc-500" />

            {/* Fork — line going down to bottom track */}
            <line x1="106" y1="130" x2="145" y2="180" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="141,184 148,184 145,177" className="fill-zinc-400 dark:fill-zinc-500" />

            {/* ===== TOP TRACK: For the Robot ===== */}
            <text x="148" y="28" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">For the Robot</text>

            {/* Box: Plain Text Doc */}
            <rect x="148" y="40" width="120" height="40" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="208" y="65" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Plain Text Doc</text>

            {/* Arrow */}
            <line x1="268" y1="60" x2="310" y2="60" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="307,55 317,60 307,65" className="fill-zinc-400 dark:fill-zinc-500" />

            {/* Box: ATS Parser */}
            <rect x="320" y="40" width="120" height="40" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="380" y="65" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">ATS Parser</text>

            {/* Arrow */}
            <line x1="440" y1="60" x2="482" y2="60" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="479,55 489,60 479,65" className="fill-zinc-400 dark:fill-zinc-500" />

            {/* Box: Keyword Match */}
            <rect x="492" y="40" width="140" height="40" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
            <text x="562" y="58" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Keyword Match</text>
            <text x="562" y="73" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>

            {/* ===== BOTTOM TRACK: For the Human ===== */}
            <text x="148" y="170" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">For the Human</text>

            {/* Box: URL at Top */}
            <rect x="148" y="180" width="120" height="40" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="208" y="200" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-blue-500 dark:fill-blue-400">Your URL</text>
            <text x="208" y="214" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">at top of resume</text>

            {/* Arrow */}
            <line x1="268" y1="200" x2="310" y2="200" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="307,195 317,200 307,205" className="fill-zinc-400 dark:fill-zinc-500" />

            {/* Box: Recruiter Clicks */}
            <rect x="320" y="180" width="120" height="40" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="380" y="205" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Recruiter Clicks</text>

            {/* Arrow */}
            <line x1="440" y1="200" x2="482" y2="200" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="479,195 489,200 479,205" className="fill-zinc-400 dark:fill-zinc-500" />

            {/* Box: Beautiful Profile */}
            <rect x="492" y="180" width="140" height="40" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
            <text x="562" y="198" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Beautiful Profile</text>
            <text x="562" y="213" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓</text>

            {/* Bottom label */}
            <text x="340" y="244" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Same application · Two audiences · Both satisfied</text>
          </svg>
        </div>

        <h2 className={h2}>Keyword Optimization for the Robot</h2>
        <p>In your plain text document, you can afford to be repetitive. You can include a "Skills Tag Cloud" at the bottom that lists every technology you have ever touched. The robot loves this. It ranks you higher for more searches. But you would never do this on your "real" resume because it looks desperate to a human. This dual-submission flow lets you be optimized for keywords and optimized for design simultaneously. This ensures your <Link href="/tech-resume-keywords" className={link}>visual hierarchy actually works</Link> for the people who view your profile.</p>

        <h2 className={h2}>Common Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>Do ATS systems strip URLs from documents?</h3>
            <p>No. In fact, most modern ATS platforms auto-detect links and make them clickable for the recruiter in the dashboard view. It is often the only way they can see your real design.</p>
          </div>
          <div>
            <h3 className={h3}>Will a two-column PDF really fail that often?</h3>
            <p>Independent tests show that complex two-column layouts have a <span className={bold}>30-40% failure rate</span> in extracting contact info or job dates correctly. It is a massive risk to take.</p>
          </div>
          <div>
            <h3 className={h3}>Should I only provide a link and no file?</h3>
            <p>No. Most application portals require a file upload to continue. Use a plain text version for that upload and put your URL at the very top. This is the "Dual-Submission" gold standard.</p>
          </div>
        </div>

        <h2 className={h2}>Related Analysis</h2>
        <ul className={ul}>
          <li><Link href="/pdf-breaks-ats" className={link}>Analysis: Why complex PDFs break recruiter algorithms</Link></li>
          <li><Link href="/tech-resume-keywords" className={link}>Guide: Mapping visual hierarchy for technical recruiters</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'stand-out-inbox',
    title: 'How to Stand Out in a Recruiter Inbox',
    excerpt: 'When every candidate sends the same file type with the same naming convention, breaking that pattern is the fastest way to get noticed.',
    date: 'Mar 16, 2026',
      faqs: [
    { question: 'What makes a CV URL look professional?', answer: 'A professional URL should consist entirely of your primary legal name without confusing numerical suffixes or generic third party hosting subdomains.' },
    { question: 'How does a clean link impact inbox delivery?', answer: 'Emails containing clean minimal URLs possess a significantly higher inbox deliverability rate compared to heavy emails bogged down by bloated PDF attachments.' },
    { question: 'Do hiring managers actually click external links?', answer: 'Yes. Technical managers aggressively prefer clicking a fast-loading secure HTTPS link over downloading a heavily formatted unknown file into their local system architecture.' },
  ],
  author: {
      name: 'David C.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <h2 className={h2}>300 Identical Attachments</h2>
        <p>Picture a recruiter&apos;s inbox after posting a Senior Frontend role on LinkedIn. Within 48 hours: <span className={bold}>300 applications</span>. Each one is an email with a PDF. The filenames are all variations of the same thing:</p>
        <ul className={ul}>
          <li>&quot;John_Smith_Resume.pdf&quot;</li>
          <li>&quot;Resume_JohnSmith_2026.pdf&quot;</li>
          <li>&quot;JS_FrontendDev_Final.pdf&quot;</li>
        </ul>
        <p>Click. Download. Wait. Scan for six seconds. Close. Repeat, dozens of times per hour. The cognitive fatigue is real. This is why <Link href="/cv-attachments" className={link}>attachments are a UX disaster</Link> for the recipient.</p>
        <p>Now imagine one email does not have an attachment. Instead, it says: <span className={bold}>&quot;My profile is at cvin.bio/david.&quot;</span> The recruiter clicks it. A polished page loads in under a second. No download. No hunting through files.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 620 310" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">

            {/* Inbox header bar */}
            <rect x="60" y="10" width="500" height="32" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="310" y="31" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Inbox — Senior Designer Role (312 applicants)</text>

            {/* Row 1 */}
            <rect x="60" y="48" width="500" height="36" rx="4" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />
            {/* Paperclip */}
            <path d="M82 58 L82 72 Q82 76 86 76 Q90 76 90 72 L90 62 Q90 56 85 56 Q80 56 80 62 L80 72" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" strokeLinecap="round" />
            <text x="102" y="71" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Resume_Smith.pdf</text>
            <text x="480" y="71" textAnchor="end" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-300 dark:fill-zinc-600">245 KB</text>

            {/* Row 2 */}
            <rect x="60" y="88" width="500" height="36" rx="4" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />
            <path d="M82 98 L82 112 Q82 116 86 116 Q90 116 90 112 L90 102 Q90 96 85 96 Q80 96 80 102 L80 112" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" strokeLinecap="round" />
            <text x="102" y="111" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">CV_Johnson_Final_v3.pdf</text>
            <text x="480" y="111" textAnchor="end" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-300 dark:fill-zinc-600">312 KB</text>

            {/* Row 3 */}
            <rect x="60" y="128" width="500" height="36" rx="4" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />
            <path d="M82 138 L82 152 Q82 156 86 156 Q90 156 90 152 L90 142 Q90 136 85 136 Q80 136 80 142 L80 152" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" strokeLinecap="round" />
            <text x="102" y="151" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Resume_Williams_2026.pdf</text>
            <text x="480" y="151" textAnchor="end" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-300 dark:fill-zinc-600">198 KB</text>

            {/* Row 4 */}
            <rect x="60" y="168" width="500" height="36" rx="4" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />
            <path d="M82 178 L82 192 Q82 196 86 196 Q90 196 90 192 L90 182 Q90 176 85 176 Q80 176 80 182 L80 192" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" strokeLinecap="round" />
            <text x="102" y="191" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">CV_Brown.pdf</text>
            <text x="480" y="191" textAnchor="end" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-300 dark:fill-zinc-600">276 KB</text>

            {/* Row 5 — identical grey */}
            <rect x="60" y="208" width="500" height="36" rx="4" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />
            <path d="M82 218 L82 232 Q82 236 86 236 Q90 236 90 232 L90 222 Q90 216 85 216 Q80 216 80 222 L80 232" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" strokeLinecap="round" />
            <text x="102" y="231" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Resume_Taylor_Updated.pdf</text>
            <text x="480" y="231" textAnchor="end" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-300 dark:fill-zinc-600">220 KB</text>

            {/* Row 6 — THE STANDOUT */}
            <rect x="60" y="252" width="500" height="50" rx="6" className="fill-white dark:fill-zinc-800 stroke-emerald-400 dark:stroke-emerald-600" strokeWidth="2" />

            {/* Left accent bar */}
            <rect x="60" y="252" width="4" height="50" rx="2" className="fill-emerald-500" />

            {/* Avatar square */}
            <rect x="76" y="259" width="34" height="34" rx="5" className="fill-emerald-100 dark:fill-emerald-800" />
            <text x="93" y="281" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-300">D</text>

            {/* Name & headline */}
            <text x="122" y="274" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">David Chen — Senior Product Designer</text>
            <text x="122" y="290" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">8 yrs · Figma, Systems, Research · Ex-Spotify</text>

            {/* URL label */}
            <text x="480" y="280" textAnchor="end" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-500 dark:fill-emerald-400">cvin.bio/david</text>

            {/* Annotation arrow on right side pointing to standout row */}
            <line x1="575" y1="150" x2="575" y2="270" className="stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="1.5" />
            <polygon points="570,267 575,277 580,267" className="fill-emerald-400 dark:fill-emerald-500" />
            <text x="575" y="140" textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-500 dark:fill-emerald-400">This one</text>
            <text x="575" y="152" textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-500 dark:fill-emerald-400">gets clicked</text>
          </svg>
        </div>

        <h2 className={h2}>The Forwarding Chain</h2>
        <p>Resumes are rarely read by one person. They are forwarded from recruiters to hiring managers, and from managers to team leads. With a PDF, this chain creates multiple copies of the file floating around Slack and Email. If you find a mistake and send a "corrected" version, you have now doubled the number of files in the chain. This is a common pain point discussed in our guide on <Link href="/update-cv-anytime" className={link}>fixing typos in real time</Link>.</p>
        <div className={callout}>
          <h3 className={h3}>The link is the single source of truth</h3>
          <p>When you share a link, everyone in the chain is looking at the same thing. If you update your profile, the entire chain is updated instantly. There is no risk of the CEO looking at "Resume_v1" while the manager looks at "Resume_Final_v3."</p>
        </div>

        <h2 className={h2}>The Visual Preview Advantage</h2>
        <p>Most email clients render link previews inline. With proper OpenGraph tags, the recruiter sees your profile card <span className={bold}>before even clicking</span>:</p>
        <div className={callout}>
          <ul className={ul}>
            <li>Your photo and headline appear inline in the email body</li>
            <li>You claim a massive chunk of visual attention with zero extra effort</li>
            <li>In a field of 300 grey paperclip icons, you are the one with an actual visual presence</li>
          </ul>
        </div>

        <h2 className={h2}>Interactive Portfolios</h2>
        <p>A web profile is not just for text. You can embed links to live projects, GitHub repositories, or even video introductions. A PDF that says "I built a trading platform" is a claim. A web profile with a "View Live" button that opens the actual platform is proof. Recruiters value proof over claims every single time. This contributes to the <Link href="/cv-web-link" className={link}>ultimate professional brand image</Link>.</p>

        <h2 className={h2}>Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>What if a recruiter cannot click links for security reasons?</h3>
            <p>In highly regulated industries (defense, federal government), this is common. However, for 95% of commercial companies, links are the primary way information is shared. We recommend including your URL but also providing a plain document just in case.</p>
          </div>
          <div>
            <h3 className={h3}>Does a link work in LinkedIn messages?</h3>
            <p>Yes. LinkedIn creates a beautiful, large preview card when you paste a CVin.Bio link. It takes up much more space than a tiny PDF icon, making it more likely to be clicked.</p>
          </div>
          <div>
            <h3 className={h3}>Can I track who clicked my link?</h3>
            <p>You can see total view counts. This tells you that your application was opened and even which city the viewer is in, providing a strong signal of interest.</p>
          </div>
        </div>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/cv-web-link" className={link}>How URLs change your professional perception</Link></li>
          <li><Link href="/cv-attachments" className={link}>Stop sending attachments: The technical case against PDFs</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'pdf-breaks-ats',
    title: 'Why Your PDF Resume Fails ATS',
    excerpt: 'That gorgeous two-column Canva resume is getting turned into garbled text by the very systems designed to evaluate it.',
    date: 'Mar 15, 2026',
      faqs: [
    { question: 'Why do multi column resumes fail ATS scans?', answer: 'Parsing engines read from left to right. When two columns exist the engine frequently mashes the dates on the left directly into the job titles on the right destroying chronological logic.' },
    { question: 'Does invisible keyword text still work in resumes?', answer: 'No. Modern algorithmic screeners actively detect and aggressively penalize hidden white text tactics explicitly flagging the applicant for manipulative fraud.' },
    { question: 'Should I use tables to format my skills section?', answer: 'Absolutely not. HTML and PDF tables commonly scramble semantic extraction outputs. Use strictly linear standard unordered bullet lists to guarantee flawless data extraction.' },
  ],
  author: {
      name: 'Anna M.',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <h2 className={h2}>Fonts Turning Into Pictures</h2>
        <p>Canva, Figma, and many online templates handle custom fonts by converting them into <span className={bold}>vector outlines</span> instead of embedding font data. Visually identical. But underneath, the text is now a collection of shapes. This is one of the biggest reasons why <Link href="/bypass-ats" className={link}>dual-submission strategies</Link> are now required for technical roles.</p>
        <p>When an ATS encounters these shapes, it runs OCR to convert them back into text. The result:</p>
        <div className={callout}>
          <p><span className={bold}>What you wrote:</span> &quot;5 years of experience with React and TypeScript&quot;</p>
          <p className="mt-2"><span className={bold}>What the ATS reads:</span> &quot;5years ofexperience wxth Reac7 and TypeScripl&quot;</p>
        </div>
        <p><span className={bold}>Test this yourself:</span> open your PDF, select all text, copy it, and paste into Notepad. If it is garbled, that is exactly what the ATS sees.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 260" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Left column background */}
            <rect x="16" y="16" width="310" height="228" rx="6" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            {/* Right column background */}
            <rect x="354" y="16" width="310" height="228" rx="6" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

            {/* Left label */}
            <text x="171" y="50" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">What You Wrote</text>
            {/* Right label */}
            <text x="509" y="50" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">What The ATS Reads</text>

            {/* Divider lines */}
            <line x1="40" y1="64" x2="302" y2="64" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <line x1="378" y1="64" x2="640" y2="64" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

            {/* Left clean text */}
            <text x="171" y="100" textAnchor="middle" fontSize="13" fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-300">5 years of experience</text>
            <text x="171" y="125" textAnchor="middle" fontSize="13" fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-300">with React and</text>
            <text x="171" y="150" textAnchor="middle" fontSize="13" fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-300">TypeScript</text>

            {/* Check icon */}
            <circle cx="171" cy="190" r="14" className="fill-emerald-500/15 stroke-emerald-500" strokeWidth="1.5" />
            <path d="M163 190 L169 196 L180 184" className="stroke-emerald-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <text x="171" y="222" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Clean &amp; parseable</text>

            {/* Right garbled text */}
            <text x="509" y="100" textAnchor="middle" fontSize="13" fontFamily="ui-monospace, monospace" className="fill-red-500 dark:fill-red-400">5years  ofexperience</text>
            <text x="509" y="125" textAnchor="middle" fontSize="13" fontFamily="ui-monospace, monospace" className="fill-red-500 dark:fill-red-400">wxth Reac7 and</text>
            <text x="509" y="150" textAnchor="middle" fontSize="13" fontFamily="ui-monospace, monospace" className="fill-red-500 dark:fill-red-400">TypeScripl</text>

            {/* Red squiggly underlines on garbled words */}
            <path d="M440,105 q3,-4 6,0 t6,0 t6,0 t6,0 t6,0 t6,0 t6,0 t6,0 t6,0 t6,0 t6,0 t6,0" className="stroke-red-400" strokeWidth="1.5" fill="none" />
            <path d="M460,130 q3,-4 6,0 t6,0 t6,0 t6,0" className="stroke-red-400" strokeWidth="1.5" fill="none" />
            <path d="M523,130 q3,-4 6,0 t6,0 t6,0 t6,0" className="stroke-red-400" strokeWidth="1.5" fill="none" />
            <path d="M466,155 q3,-4 6,0 t6,0 t6,0 t6,0 t6,0 t6,0 t6,0" className="stroke-red-400" strokeWidth="1.5" fill="none" />

            {/* X icon */}
            <circle cx="509" cy="190" r="14" className="fill-red-500/15 stroke-red-400" strokeWidth="1.5" />
            <path d="M503 184 L515 196 M515 184 L503 196" className="stroke-red-400" strokeWidth="2" strokeLinecap="round" />
            <text x="509" y="222" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">Corrupted by ATS</text>

            {/* Center arrow */}
            <line x1="330" y1="130" x2="350" y2="130" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="350,126 358,130 350,134" className="fill-zinc-400 dark:fill-zinc-500" />
          </svg>
        </div>

        <h2 className={h2}>The Data Integrity Gap</h2>
        <p>Recruiters rely on automated filters. If the ATS reads your "2023" as "2O23" (using the letter O instead of the number zero), you might be filtered out of a search for candidates with recent experience. Subtle glitches in OCR create massive gaps in your data integrity. Web profiles provide the raw text, ensuring 100% accuracy for every tool that reads them. This accuracy is vital for your <Link href="/tech-resume-keywords" className={link}>visual hierarchy to remain effective</Link>.</p>

        <h2 className={h2}>Messy Background Layers</h2>
        <p>Designed resumes use background colors and sidebars as separate layers. The parser does not understand layers. It reads characters in coordinate order regardless of which visual layer they belong to. This is another reason <Link href="/cv-attachments" className={link}>static PDFs are increasingly unreliable</Link>.</p>
        <p>A sidebar heading &quot;Experience&quot; next to a job title &quot;Senior Software Engineer&quot; can become:</p>
        <div className={callout}>
          <p className="font-mono text-sm">&quot;ExSenior Software Engineerperience&quot;</p>
          <p className="text-sm mt-2 text-zinc-500 dark:text-zinc-400">Characters merged based on vertical position, not visual grouping.</p>
        </div>

        <h2 className={h2}>Semantic Tags for the Win</h2>
        <p>Web profiles use semantic HTML tags. This tells the reader (and the machine) exactly what is what. An h1 tag is always a title. A li tag is always a list item. This eliminates the "coordinate guessing game" that PDF parsers have to play. It is the difference between reading a recipe and trying to guess one from a picture of a meal.</p>

        <h2 className={h2}>Common Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>Do big tech companies use OCR on resumes?</h3>
            <p>Almost all of them do. They handle thousands of applications per day, and manual data entry is impossible. If their machine cannot read your file, you are essentially invisible.</p>
          </div>
          <div>
            <h3 className={h3}>Is an exported Word document better than a Canva PDF?</h3>
            <p>Usually, yes, because Word tends to preserve text layers better. However, it still lacks the screen-responsiveness and brand-authority of a custom web profile.</p>
          </div>
          <div>
            <h3 className={h3}>How can I check if my current PDF is machine-readable?</h3>
            <p>Try to copy a paragraph and paste it into a plain text editor. If the words are joined together or letters are replaced with symbols, it is failing the machine test.</p>
          </div>
        </div>

        <h2 className={h2}>Further Reading</h2>
        <ul className={ul}>
          <li><Link href="/bypass-ats" className={link}>The guide to bypassing ATS formatting destruction</Link></li>
          <li><Link href="/mobile-responsive-cv" className={link}>Why your resume must be mobile-responsive in 2026</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'tech-resume-keywords',
    title: 'Where to Put Keywords on a Tech Resume',
    excerpt: 'Technical recruiters spend four seconds scanning before deciding to read further. Where your keywords sit on the page determines whether you pass that scan.',
    date: 'Mar 14, 2026',
      faqs: [
    { question: 'What is the Z pattern in resume reading?', answer: 'Human eyes natively track screens in a Z formation. They scan the top banner horizontally drag diagonally down the left margin and finally sweep the bottom horizontally.' },
    { question: 'Where should my most important technical skills go?', answer: 'Position your heaviest commercial engineering skills directly in the top left quadrant of your profile to instantly intercept the primary visual scan path.' },
    { question: 'How does whitespace influence recruiter fatigue?', answer: 'Generous white margins explicitly reduce cognitive load. Cramming dense text edge-to-edge signals desperation and makes the document physically exhausting to parse.' },
  ],
  author: {
      name: 'Alex B.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <h2 className={h2}>Stop Burying Your Keywords</h2>
        <p>Most resumes bury critical information inside dense paragraphs. A recruiter looking for React experience has to read through three sentences about team size and timelines before finding &quot;React&quot; mentioned casually on line four. <span className={bold}>By that point, they have already left.</span> This is why many candidates <Link href="/stand-out-inbox" className={link}>fail the initial scan</Link> entirely.</p>
        <div className={callout}>
          <h3 className={h3}>How recruiters actually scan</h3>
          <p>Eyes follow an <span className={bold}>F-shaped pattern</span>: read the top line, drop down the left edge, scan again. If your keywords are not in those zones, they literally do not register. This behavior is amplified when they are <Link href="/mobile-responsive-cv" className={link}>scanning on a small phone screen</Link>.</p>
        </div>
        <p>The fix is simple:</p>
        <ul className={ul}>
          <li><span className={bold}>Pull keywords out of paragraphs</span> and into standalone positions</li>
          <li>Use clear headings like &quot;Stack&quot; instead of burying tools in sentences</li>
          <li>Front-load every bullet with the technology name first</li>
        </ul>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 660 340" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Title */}
            <text x="330" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">The 6-Second Z-Scan</text>

            {/* Resume rectangle */}
            <rect x="160" y="46" width="340" height="280" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" />

            {/* Left margin accent strip */}
            <rect x="160" y="46" width="6" height="280" rx="3" className="fill-amber-400/40 dark:fill-amber-500/30" />
            <text x="148" y="186" textAnchor="end" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-amber-600 dark:fill-amber-400" transform="rotate(-90 148 186)">Eye lingers here</text>

            {/* Fake resume content — header area */}
            <rect x="190" y="62" width="140" height="10" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="190" y="78" width="90" height="6" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="350" y="62" width="130" height="10" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="380" y="78" width="100" height="6" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Divider */}
            <line x1="180" y1="98" x2="480" y2="98" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

            {/* Section lines — experience */}
            <rect x="190" y="110" width="80" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="190" y="128" width="280" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="190" y="140" width="260" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="190" y="152" width="240" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="190" y="164" width="270" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Section lines — skills */}
            <rect x="190" y="186" width="60" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="190" y="204" width="250" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="190" y="216" width="230" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Section lines — education */}
            <rect x="190" y="238" width="80" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="190" y="256" width="200" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="190" y="268" width="160" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Bottom lines */}
            <rect x="190" y="290" width="240" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="190" y="302" width="200" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Z-scan arrow path */}
            {/* Top-left to top-right */}
            <line x1="192" y1="67" x2="472" y2="67" className="stroke-blue-500 dark:stroke-blue-400" strokeWidth="2.5" strokeDasharray="6 3" />
            <polygon points="472,63 480,67 472,71" className="fill-blue-500 dark:fill-blue-400" />

            {/* Diagonal: top-right to bottom-left */}
            <line x1="475" y1="72" x2="195" y2="285" className="stroke-blue-500 dark:stroke-blue-400" strokeWidth="2.5" strokeDasharray="6 3" />
            <polygon points="199,281 191,289 195,290" className="fill-blue-500 dark:fill-blue-400" />

            {/* Bottom-left to bottom-right */}
            <line x1="195" y1="296" x2="472" y2="296" className="stroke-blue-500 dark:stroke-blue-400" strokeWidth="2.5" strokeDasharray="6 3" />
            <polygon points="472,292 480,296 472,300" className="fill-blue-500 dark:fill-blue-400" />

            {/* Numbered dots at each Z corner */}
            <circle cx="190" cy="67" r="10" className="fill-blue-500 dark:fill-blue-400" />
            <text x="190" y="71" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-white">1</text>

            <circle cx="480" cy="67" r="10" className="fill-blue-500 dark:fill-blue-400" />
            <text x="480" y="71" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-white">2</text>

            <circle cx="190" cy="290" r="10" className="fill-blue-500 dark:fill-blue-400" />
            <text x="190" y="294" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-white">3</text>

            <circle cx="480" cy="296" r="10" className="fill-blue-500 dark:fill-blue-400" />
            <text x="480" y="300" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-white">4</text>

            {/* Legend labels */}
            <text x="530" y="70" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-blue-600 dark:fill-blue-400">Name / Title</text>
            <text x="530" y="186" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-blue-600 dark:fill-blue-400">Diagonal scan</text>
            <text x="530" y="299" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-blue-600 dark:fill-blue-400">Skills / Dates</text>
          </svg>
        </div>

        <h2 className={h2}>Managing Cognitive Load</h2>
        <p>Every time a recruiter has to hunt for information, their cognitive load increases. When they get tired or frustrated, they default to "No." Your goal is to make the "Yes" decision as physically effortless as possible. This means perfect contrast, large enough fonts, and a layout that tells them exactly where to look next.</p>

        <h2 className={h2}>White Space Is a Feature</h2>
        <p>When every inch of your resume is packed with text, <span className={bold}>nothing stands out</span>. Everything blurs into a single grey block. Adding generous margins around headings and breathing room between bullets makes each piece of information distinct and scannable.</p>
        <p>A web-based profile enforces this naturally because the template handles spacing, fonts, and hierarchy for you. You do not have to fight the urge to "fill the page." This is a core benefit of <Link href="/cv-attachments" className={link}>ditching the restricted A4/Letter format</Link>.</p>

        <h2 className={h2}>Visual Anchors and Scanning Signals</h2>
        <p>Use visual anchors like bold text for job titles and skill names. These act as "scanning signals" that help the recruiter jump from one relevant point to the next. If they can see "Senior Dev," "Node.js," and "AWS" in under two seconds, they will commit to reading the rest of the page.</p>

        <h2 className={h2}>Common Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>Should I bold every technology name?</h3>
            <p>Be strategic. If you bold everything, nothing is bold. Bold only the core technologies that define your role to help the eye land on the most important points first.</p>
          </div>
          <div>
            <h3 className={h3}>Is a one-page limit still relevant for web profiles?</h3>
            <p>No. On the web, people are used to scrolling. Vertical space is free. Focus on clear hierarchy rather than cramming everything into a specific physical height.</p>
          </div>
          <div>
            <h3 className={h3}>What is the ideal font size for a resume?</h3>
            <p>For web profiles, we recommend 16px to 18px for body text. This ensures accessibility and makes the text "jump" off the screen during a fast scan.</p>
          </div>
        </div>

        <h2 className={h2}>Recommended Guides</h2>
        <ul className={ul}>
          <li><Link href="/mobile-responsive-cv" className={link}>Designing for the tiny screen: Mobile responsiveness guide</Link></li>
          <li><Link href="/stand-out-inbox" className={link}>Standing out in the inbox: Using preview cards and URLs</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'update-cv-anytime',
    title: 'How to Update Your Resume After Sending It',
    excerpt: 'You sent your resume and noticed a typo. With a PDF, it is too late. With a web profile, you fix it in thirty seconds and nobody ever knows.',
    date: 'Mar 12, 2026',
      faqs: [
    { question: 'Can I edit an application after sending a PDF?', answer: 'Once a discrete PDF file is submitted it is permanently sealed in the corporate database. Any critical errors or broken links exist forever on their servers.' },
    { question: 'How does a web link fix the typo problem?', answer: 'A web profile operates dynamically. If you identify a catastrophic spelling error you can instantly edit your live site and the recruiter will instantly see the patched version upon clicking.' },
    { question: 'Do recruiters notice minor spelling mistakes?', answer: 'Yes. Senior engineering managers mercilessly use minor typographical errors as an instant proxy for poor attention to technical detail masking deeper foundational flaws.' },
  ],
  author: {
      name: 'Michelle P.',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <h2 className={h2}>The 10:15 AM Panic</h2>
        <p>You submitted at 10 AM. At 10:15, you realize you wrote <span className={bold}>&quot;Javscript&quot;</span> instead of &quot;JavaScript&quot; in your skills section. With a PDF, your options are limited and awkward. You can do nothing and hope they do not notice, or send a correction email that looks even worse than the typo. This is a common stressor we address in <Link href="/cv-attachments" className={link}>Why PDF attachments are a relic of the past</Link>.</p>
        <p>With a web profile, you open the editor, fix the typo, and save. The recruiter clicks your link at 2 PM and sees the corrected version. <span className={bold}>They never knew the typo existed.</span></p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Row 1: PDF Workflow */}
            <text x="16" y="28" fontSize="12" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">PDF Workflow</text>

            {/* Timeline line */}
            <line x1="50" y1="70" x2="620" y2="70" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" />

            {/* Event 1: Send v1 */}
            <circle cx="80" cy="70" r="6" className="fill-zinc-400 dark:fill-zinc-500" />
            <text x="80" y="56" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">Send v1</text>

            {/* Event 2: Find typo */}
            <circle cx="200" cy="70" r="6" className="fill-amber-500" />
            <text x="200" y="56" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-amber-600 dark:fill-amber-400">Find typo</text>

            {/* Event 3: Send v2 */}
            <circle cx="320" cy="70" r="6" className="fill-zinc-400 dark:fill-zinc-500" />
            <text x="320" y="56" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">Send v2</text>

            {/* Event 4: Recruiter has v1 */}
            <circle cx="460" cy="70" r="6" className="fill-red-400" />
            <text x="460" y="56" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">Recruiter has v1</text>

            {/* Event 5: Confusion */}
            <circle cx="600" cy="70" r="14" className="fill-red-500/15 stroke-red-400" strokeWidth="1.5" />
            <path d="M594 64 L606 76 M606 64 L594 76" className="stroke-red-400" strokeWidth="2" strokeLinecap="round" />
            <text x="600" y="100" textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">Confusion</text>

            {/* Divider */}
            <line x1="16" y1="130" x2="664" y2="130" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 4" />

            {/* Row 2: URL Workflow */}
            <text x="16" y="160" fontSize="12" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">URL Workflow</text>

            {/* Timeline line */}
            <line x1="50" y1="200" x2="620" y2="200" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" />

            {/* Event 1: Share link */}
            <circle cx="100" cy="200" r="6" className="fill-zinc-400 dark:fill-zinc-500" />
            <text x="100" y="186" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">Share link</text>

            {/* Event 2: Fix typo */}
            <circle cx="260" cy="200" r="6" className="fill-emerald-500" />
            <text x="260" y="186" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Fix typo</text>

            {/* Event 3: Recruiter sees latest */}
            <circle cx="420" cy="200" r="6" className="fill-emerald-500" />
            <text x="420" y="186" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Recruiter sees latest</text>

            {/* Event 4: Always current */}
            <circle cx="580" cy="200" r="14" className="fill-emerald-500/15 stroke-emerald-500" strokeWidth="1.5" />
            <path d="M572 200 L578 206 L589 194" className="stroke-emerald-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <text x="580" y="230" textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Always current</text>

            {/* Row labels (colored side bars) */}
            <rect x="0" y="42" width="4" height="70" rx="2" className="fill-red-400" />
            <rect x="0" y="172" width="4" height="70" rx="2" className="fill-emerald-500" />
          </svg>
        </div>

        <h2 className={h2}>Iterate Between Applications</h2>
        <p>Real-time updates let you do something PDFs never could: <span className={bold}>run experiments</span>. Submit your profile, see if you hear back. If not, <Link href="/tech-resume-keywords" className={link}>tweak your visual hierarchy</Link> and reorder your projects. Apply to the next role with an improved version. There is only one version, and it is always your latest and best work.</p>

        <h2 className={h2}>Adapting to Industry Trends</h2>
        <p>The tech landscape moves fast. If a new framework becomes the "must-have" for your target roles, you can add your relevant experience to your profile tonight and every recruiter who has your link will see it tomorrow. You do not have to re-send files to everyone you have talked to this month. This is the <Link href="/cv-web-link" className={link}>power of the modern professional URL</Link>.</p>

        <h2 className={h2}>The Mid-Interview Pivot</h2>
        <p>This advantage is most powerful during an active interview process. Phone screen on Monday where the interviewer mentions the team is migrating to <span className={bold}>Kubernetes</span>. You have Kubernetes experience but did not highlight it. Before Thursday&apos;s on-site, you add a Kubernetes section and reorder your projects.</p>
        <div className={callout}>
          <h3 className={h3}>The "Right Candidate" Effect</h3>
          <p>The panel reviews your link and sees a candidate who <span className={bold}>perfectly matches their current priorities</span>. It feels like fate to the hiring manager. It is actually just smart use of a live, editable profile. A PDF cannot do this. Once sent, it is frozen. <span className={bold}>A link is alive.</span></p>
        </div>

        <h2 className={h2}>Common Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>Does a refresh happen instantly?</h3>
            <p>Yes. As soon as you hit save in our editor, your live URL is updated globally. Any recruiter who reloads the page (or clicks your link for the first time) sees the new version.</p>
          </div>
          <div>
            <h3 className={h3}>Can I revert to an older version of my profile?</h3>
            <p>We are currently working on a version history feature. For now, we recommend doing a "Select All" and saving a copy of your current text before making major changes.</p>
          </div>
          <div>
            <h3 className={h3}>Is there a limit to how many changes I can make?</h3>
            <p>No. You can update your profile as often as you like. We encourage making small tweaks for different job applications to ensure you always have the best product-market fit.</p>
          </div>
        </div>

        <h2 className={h2}>Further Discovery</h2>
        <ul className={ul}>
          <li><Link href="/cv-attachments" className={link}>Ditching PDFs and mastering the psychological advantage</Link></li>
          <li><Link href="/tech-resume-keywords" className={link}>How to optimize your profile hierarchy for fast scans</Link></li>
        </ul>
      </div>
    )
  },
  {
    slug: 'objective-statement-death',
    title: 'Resume Objective vs Summary',
    excerpt: 'Managers do not care what you want. They care what you can do for them. Start your profile with your value instead.',
    date: 'Mar 10, 2026',
      faqs: [
    { question: 'Should I include a resume objective in 2026?', answer: 'You must completely eradicate the objective statement. Stating your personal career desires wastes highly expensive screen real estate that must be reserved for hard technical value.' },
    { question: 'What is a professional value summary?', answer: 'A value summary is a brutal three-sentence paragraph explicitly quantifying your absolute highest commercial achievement and primary technical operational stack.' },
    { question: 'How long should a profile summary be?', answer: 'Your direct top-line summary should absolutely never exceed three tight sentences. Anything beyond that inevitably devolves into generic corporate fluff and loses all impact.' },
  ],
  author: {
      name: 'Sarah G.',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>I have reviewed over ten thousand applications in my career as a senior technical recruiter. If there is one massive mistake that instantly ruins a candidate profile it is the classic objective statement. Years ago people wrote what they wanted from a job at the very top of their paper resumes. They would literally write that they sought a challenging role at a dynamic company to grow their personal skills.</p>
        <p>This practice is entirely dead. If you do this today managers will think you are fundamentally out of touch with modern business realities. Companies do not hire you to fulfill your personal dreams. They hire you because they have expensive problems that need fixing right now.</p>
        
        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 660 260" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Before box */}
            <rect x="16" y="16" width="628" height="100" rx="6" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            {/* Red left border */}
            <rect x="16" y="16" width="5" height="100" rx="2" className="fill-red-400" />

            {/* Before label */}
            <text x="40" y="42" fontSize="11" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">BEFORE</text>

            {/* Before text */}
            <text x="40" y="68" fontSize="13" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400" fontStyle="italic">"Seeking a challenging position where I can leverage</text>
            <text x="40" y="88" fontSize="13" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400" fontStyle="italic">my skills and grow professionally."</text>

            {/* Arrow between boxes */}
            <line x1="330" y1="120" x2="330" y2="140" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="326,140 330,148 334,140" className="fill-zinc-400 dark:fill-zinc-500" />

            {/* After box */}
            <rect x="16" y="152" width="628" height="100" rx="6" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            {/* Green left border */}
            <rect x="16" y="152" width="5" height="100" rx="2" className="fill-emerald-500" />

            {/* After label */}
            <text x="40" y="178" fontSize="11" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">AFTER</text>

            {/* After text */}
            <text x="40" y="204" fontSize="13" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">"Full-stack engineer. 6 years shipping payment systems</text>
            <text x="40" y="224" fontSize="13" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">at scale. Last project cut checkout failures by 40%."</text>
          </svg>
        </div>

        <h2 className={h2}>The Brutal Truth About Hiring</h2>
        <p>When an engineering manager or a marketing director opens a job requisition they are usually doing it out of pain. Their team is probably overworked. They are missing deadlines. Someone just quit and left behind a massive mess of undocumented code or failing ad campaigns. The manager reading your application is tired and stressed.</p>
        <p>When they read a paragraph about your desire for mentorship and growth they immediately skip to the next applicant. They do not have the time or energy to be your career counselor. They need a specialist who can step in and stop the active bleeding on their team.</p>

        <h2 className={h2}>Replace It With a Value Summary</h2>
        <p>You must completely delete your objective statement and replace it with a professional summary. This new section acts as your elevator pitch. It tells the reader exactly what specific technical or operational problems you have solved recently and what you can solve for them tomorrow.</p>
        <p>A strong summary does not use future tense. It relies entirely on the past tense and the present tense. It proves your authority rather than stating your hopes.</p>
        
        <div className={callout}>
          <h3 className={h3}>The Winning Summary Formula</h3>
          <p>Writing a perfect summary is actually very simple if you follow a strict formula. First state your current seniority and your core discipline. Next name the two tools or methodologies you execute best. Finally name your single biggest tangible win in the last three years. Do not mention your own needs or what you are looking for in a new job.</p>
        </div>

        <h2 className={h2}>Reviewing Real Examples</h2>
        <p>Let us look at a terrible objective statement. Seeking a senior developer role where I can use my Javascript skills and learn backend architecture to advance my career. This sentence offers absolutely zero value to the company. It only asks the company to spend money training the candidate.</p>
        <p>Now look at a strong value summary. Senior Frontend Engineer with six years of experience building high performance React interfaces. I specialize in reducing load times and fixing memory leaks in complex financial dashboards. I recently rebuilt a core application that survived a traffic spike of two million daily active users.</p>
        <p>The difference is night and day. The second example does not ask for anything. It simply declares competence and proves a track record of handling extreme pressure.</p>

        <h2 className={h2}>Space Is Your Most Valuable Asset</h2>
        <p>The top quarter of your application is the most expensive real estate you own. This is the only section that every single recruiter is guaranteed to read. If you waste that prime space talking about your personal journey you force the reader to scroll down just to find out if you even know the required coding languages.</p>
        <p>Never make a tired manager hunt for your core skills. Put your value plainly at the top and let your accomplishments speak for themselves.</p>
      </div>
    )
  },
  {
    slug: 'overstuffing-bullets',
    title: 'How Long Should Resume Bullets Be?',
    excerpt: 'Listing every task you ever did hides your best work. Recruiters want to read big results in few words.',
    date: 'Mar 08, 2026',
      faqs: [
    { question: 'How many bullet points are ideal for a single job?', answer: 'Ruthlessly restrict your historical roles to a strict maximum of three bullet points. Only ever highlight massive outlier wins and delete basic operational routines.' },
    { question: 'Why is listing all my tasks a bad strategy?', answer: 'Listing mediocre daily tasks completely triggers the psychological dilution effect where your massive engineering wins are mathematically averaged down by boring administrative noise.' },
    { question: 'How long should a single resume bullet point be?', answer: 'A bullet point must cleanly terminate after precisely one sentence. Stretching a technical concept across multiple messy lines completely guarantees that it will never be read.' },
  ],
  author: {
      name: 'Marcus T.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>One of the most common psychological traps that candidates fall into is the fear of omission. When you spend two or three years at a company you inevitably complete thousands of minor tasks. When it comes time to update your profile you feel a strong urge to list every single one of those tasks to prove how hard you worked. This is a fatal mistake that destroys your perceived value.</p>
        <p>When you dump ten massive bullet points under a single job title you trigger a cognitive bias in the recruiter called the dilution effect. The reader does not add up the value of all your bullets to reach a high score. Instead their brain automatically averages the impressiveness of all your statements together.</p>
        
        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 300" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Left side — Too Dense */}
            <rect x="16" y="16" width="310" height="268" rx="6" className="fill-red-50 dark:fill-red-950/30 stroke-red-200 dark:stroke-red-900/50" strokeWidth="1" />
            <text x="171" y="44" textAnchor="middle" fontSize="12" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">TOO DENSE</text>

            {/* Bullet dot */}
            <circle cx="36" cy="70" r="3" className="fill-red-400" />

            {/* Dense text block */}
            <text x="48" y="74" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Responsible for designing, developing,</text>
            <text x="48" y="92" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">testing, and deploying a full-stack web</text>
            <text x="48" y="110" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">application using React, Node.js, and</text>
            <text x="48" y="128" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">PostgreSQL that improved internal team</text>
            <text x="48" y="146" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">productivity by consolidating three</text>
            <text x="48" y="164" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">legacy tools into a single dashboard</text>
            <text x="48" y="182" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">used by 200+ employees across four</text>
            <text x="48" y="200" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">departments including engineering,</text>
            <text x="48" y="218" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">support, sales, and operations teams</text>

            {/* X icon */}
            <circle cx="171" cy="256" r="12" className="fill-red-500/15 stroke-red-400" strokeWidth="1.5" />
            <path d="M166 251 L176 261 M176 251 L166 261" className="stroke-red-400" strokeWidth="2" strokeLinecap="round" />

            {/* Divider */}
            <line x1="340" y1="36" x2="340" y2="270" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 4" />

            {/* Right side — Clean */}
            <rect x="354" y="16" width="310" height="268" rx="6" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-900/50" strokeWidth="1" />
            <text x="509" y="44" textAnchor="middle" fontSize="12" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">CLEAN</text>

            {/* Clean bullet 1 */}
            <circle cx="374" cy="76" r="3" className="fill-emerald-500" />
            <text x="386" y="80" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">Built unified dashboard (React +</text>
            <text x="386" y="98" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">Node.js) replacing 3 legacy tools</text>

            {/* Clean bullet 2 */}
            <circle cx="374" cy="130" r="3" className="fill-emerald-500" />
            <text x="386" y="134" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">Adopted by 200+ employees across</text>
            <text x="386" y="152" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">4 departments</text>

            {/* Visual space indicator */}
            <text x="509" y="200" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500" fontStyle="italic">↑ Room to breathe ↑</text>

            {/* Check icon */}
            <circle cx="509" cy="256" r="12" className="fill-emerald-500/15 stroke-emerald-500" strokeWidth="1.5" />
            <path d="M503 256 L507 260 L516 250" className="stroke-emerald-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className={h2}>How Dilution Ruins Your Best Work</h2>
        <p>Imagine your biggest achievement at your last job was rebuilding the entire payment gateway to stop a huge fraud leak. That is an incredible high value win. But if you place that massive win right next to a bullet point that says you attended daily standup meetings and reviewed basic pull requests you dilute the magic.</p>
        <p>The manager reads the brilliant payment gateway achievement and assigns it a perfect score. Then they read that you attend meetings and they average it out. Suddenly your perfect score drops to a mediocre score. You bury your own brilliance under a mountain of mandatory corporate boredom.</p>

        <h2 className={h2}>The Rule of Three</h2>
        <p>To combat this you must ruthlessly enforce the rule of three. Impose a strict limit on yourself. You are only allowed to present the top three most impressive business wins for your current role. If a fourth bullet does not utterly destroy the third bullet in terms of impact you must delete it entirely.</p>
        <p>This forced constraint makes your profile feel incredibly dense with talent. It proves to the hiring manager that you understand the difference between high-impact results and basic operational noise.</p>
        
        <div className={callout}>
          <h3 className={h3}>The Deletion Test</h3>
          <p>Read each bullet point out loud. Ask yourself if a totally average person with your exact job title would also do this task. If the answer is yes you must delete the bullet immediately. Do not waste space telling us that a software engineer writes software. Tell us what unique barriers you broke through.</p>
        </div>

        <h2 className={h2}>Brevity Signals Leadership</h2>
        <p>Senior leaders speak in short sentences. They do not waffle or hide behind giant walls of text. When you submit a profile filled with sprawling paragraphs you accidentally signal that you are a junior employee who lacks executive presence.</p>
        <p>Writing short punchy job details proves you respect the time of the reader. It shows you can distill months of chaotic project work into a single line of pure business value. That exact communication skill is what gets you promoted during an interview.</p>
      </div>
    )
  },
  {
    slug: 'measuring-impact-no-data',
    title: 'How to Quantify Your Resume Without Numbers',
    excerpt: 'Engineers rarely know the exact dollar amount their code makes. You can still prove your worth by using speed and scale.',
    date: 'Mar 07, 2026',
      faqs: [
    { question: 'How do software engineers quantify resume impact?', answer: 'If you lack direct access to financial revenue data you must rigorously measure relative physics. Quantify your code impact using raw server speed latency reduction and massive user traffic scaling.' },
    { question: 'What if I cannot use exact financial numbers on my CV?', answer: 'Focus entirely on percentage improvements. Stating that you optimized database queries to run sixty percent faster provides immense structural context without leaking confidential corporate dollars.' },
    { question: 'Does clean code matter if I have no revenue metrics?', answer: 'Yes. Highlight your ability to refactor brittle monolithic systems into scalable architectures. Removing technical debt mathematically accelerates future product shipments.' },
  ],
  author: {
      name: 'Elena R.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>Almost every piece of modern career advice demands that you attach a massive dollar sign to your work history. They tell you to prove exactly how much revenue your code generated. This advice is incredibly frustrating for engineers and designers because it ignores corporate reality.</p>
        <p>Unless you work directly in enterprise sales or growth marketing you probably have absolutely zero access to the financial dashboard. If you build internal tooling or optimize database queries the company does not share the exact monetary value of your labor. This reality causes many brilliant technical workers to just list their coding languages instead of their actual business impact.</p>
        
        <h2 className={h2}>Focus on Relative Physics</h2>
        <p>If you cannot measure money you must measure the physics of the system. You measure speed and volume. A hiring manager does not need to see a dollar sign to understand that making a system twice as fast is incredibly lucrative for the business.</p>
        <p>Did your code reduce the API latency from two seconds down to two hundred milliseconds. Did you migrate a legacy frontend application that successfully served a sudden spike of three million users without crashing. These are massive engineering achievements that speak entirely for themselves.</p>
        
        <div className={callout}>
          <h3 className={h3}>The Percentage Multiplier</h3>
          <p>When raw numbers are held secret by your boss you can always safely use percentage improvements. Simply state that your architecture redesign increased data processing efficiency by forty percent. The hiring recruiter will naturally do the math and assume you saved the company a fortune in server costs.</p>
        </div>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 290" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Header row */}
            <text x="150" y="24" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">VAGUE CLAIM</text>
            <text x="530" y="24" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">WITH METRICS</text>

            {/* Row 1 */}
            <rect x="16" y="42" width="268" height="64" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <rect x="16" y="42" width="4" height="64" rx="2" className="fill-red-400" />
            <text x="32" y="68" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">"Improved the</text>
            <text x="32" y="86" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">onboarding process"</text>

            {/* Arrow 1 */}
            <line x1="296" y1="74" x2="382" y2="74" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="382,70 390,74 382,78" className="fill-zinc-400 dark:fill-zinc-500" />

            <rect x="396" y="42" width="268" height="64" rx="6" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1" />
            <rect x="396" y="42" width="4" height="64" rx="2" className="fill-emerald-500" />
            <text x="412" y="68" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">"Cut new hire ramp-up</text>
            <text x="412" y="86" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">from 3 weeks to 5 days"</text>

            {/* Row 2 */}
            <rect x="16" y="122" width="268" height="64" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <rect x="16" y="122" width="4" height="64" rx="2" className="fill-red-400" />
            <text x="32" y="148" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">"Helped reduce</text>
            <text x="32" y="166" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">bugs"</text>

            {/* Arrow 2 */}
            <line x1="296" y1="154" x2="382" y2="154" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="382,150 390,154 382,158" className="fill-zinc-400 dark:fill-zinc-500" />

            <rect x="396" y="122" width="268" height="64" rx="6" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1" />
            <rect x="396" y="122" width="4" height="64" rx="2" className="fill-emerald-500" />
            <text x="412" y="148" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">"Lowered P1 incidents</text>
            <text x="412" y="166" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">from 12/month to 2/month"</text>

            {/* Row 3 */}
            <rect x="16" y="202" width="268" height="64" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <rect x="16" y="202" width="4" height="64" rx="2" className="fill-red-400" />
            <text x="32" y="228" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">"Managed</text>
            <text x="32" y="246" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">a team"</text>

            {/* Arrow 3 */}
            <line x1="296" y1="234" x2="382" y2="234" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="382,230 390,234 382,238" className="fill-zinc-400 dark:fill-zinc-500" />

            <rect x="396" y="202" width="268" height="64" rx="6" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1" />
            <rect x="396" y="202" width="4" height="64" rx="2" className="fill-emerald-500" />
            <text x="412" y="228" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">"Led 4 engineers shipping</text>
            <text x="412" y="246" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">3 features per sprint"</text>
          </svg>
        </div>

        <h2 className={h2}>The Internal User Metric</h2>
        <p>Do not forget the value of internal adoption. If you build tools that help other employees work faster you are saving the company thousands of hours of paid labor. You do not need the exact dollar value of their salaries to prove your worth.</p>
        <p>Simply state how many developers relied on your architecture. Writing that you maintained a deployment pipeline used daily by forty senior engineers clearly establishes your extreme competency and trust level within the organization.</p>

        <h2 className={h2}>Overcoming Non Disclosure Agreements</h2>
        <p>Many hardware developers and defense contractors work under strict legal silence. They cannot even mention the name of the projects they build. If you face this barrier you must focus entirely on the scale of the environments you managed.</p>
        <p>You can honestly write that you maintained zero downtime across a massive distributed network of secure environments. You replace the secret project details with extreme operational reliability metrics. Reliability is a universal language that every hiring manager understands instantly.</p>
      </div>
    )
  },
  {
    slug: 'short-tenures-tech',
    title: 'How to Explain Short Stints on Your Resume',
    excerpt: 'Leaving jobs after a few months used to look bad. Today it is normal but you still need to explain why it happened.',
    date: 'Mar 06, 2026',
      faqs: [
    { question: 'Are short job tenures an automatic resume rejection?', answer: 'Not necessarily. Short tenures are aggressively normalized in modern technology provided they represent focused intensive consulting contracts rather than a pattern of toxic corporate firing.' },
    { question: 'How do I group freelance work on a CV?', answer: 'Consolidate multiple brief consecutive consulting jobs under a single massive macro heading titled Independent Technical Consultant to establish continuous overarching employment timelines.' },
    { question: 'Should I explain a short stint immediately?', answer: 'Explicitly label short duration roles as Temporary Contract or Specialized Project to instantly nullify the recruiters fear that you inherently lack operational loyalty.' },
  ],
  author: {
      name: 'David C.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>In the traditional corporate world staying at a company for only ten months was considered a massive red flag. Recruiters viewed fast exits as irrefutable proof of either severe performance issues or toxic personality conflicts. Many hiring managers would completely throw away an application if they spotted two short stints back to back.</p>
        <p>The modern startup ecosystem has entirely shattered those old rules. Rapid layoffs and sudden pivot mandates happen constantly. Companies run out of venture funding overnight forcing entire engineering departments to hunt for new jobs on the exact same weekend. However even though short tenures are common today you still must completely control the narrative on your profile.</p>

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
        <p>When you present a string of six month jobs without any written explanation you give the recruiter permission to imagine the worst possible scenario. Human nature is fundamentally anxious especially when placing a permanent hire. If you leave the reason for your exit blank the reader will simply assume that you failed the probationary review period and were quietly fired.</p>
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
    )
  },
  {
    slug: 'keyword-trust',
    title: 'How Recruiters Spot Fake Skills on a Resume',
    excerpt: 'Putting every hit tech word at the bottom of your page kills trust. You must link your skills to real work.',
    date: 'Mar 05, 2026',
      faqs: [
    { question: 'Does blind keyword stuffing work on modern ATS?', answer: 'Absolutely not. Modern enterprise recruitment algorithms use advanced semantic context mapping. They violently penalize isolated massive keyword blocks that lack surrounding syntactic logic.' },
    { question: 'How do I correctly insert technical skills into my CV?', answer: 'You must deeply weave target keywords directly into the active grammatical structure of your outcome bullets. State exactly how you deployed PostgreSQL to solve a specific production crisis.' },
    { question: 'How many times should a keyword appear?', answer: 'Frequency is completely irrelevant compared to contextual density. Using a heavy keyword twice inside an irrefutable business win is significantly stronger than twelve isolated mentions.' },
  ],
  author: {
      name: 'James L.',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80'
    },
    content: (
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
    )
  },
  {
    slug: 'soft-skills-evidence',
    title: 'How to Prove Soft Skills on Your Resume',
    excerpt: 'Saying you are a great leader means nothing. You must show clear proof of your teamwork from real past events.',
    date: 'Mar 04, 2026',
      faqs: [
    { question: 'Should I list communication under my skills section?', answer: 'Never. Abstract personality traits listed out of context possess absolute zero professional credibility because terrible employees routinely make the exact same generic claims.' },
    { question: 'How do I prove I am a team player on a resume?', answer: 'Prove extreme interpersonal empathy by highlighting scalable documentation. Write exactly how you authored the standard operating procedures that dramatically accelerated junior onboarding across the department.' },
    { question: 'What is the best metric for technical leadership?', answer: 'The absolute greatest metric of leadership is quantifiable human growth. Explicitly state the math behind how many direct reports you personally mentored into senior promotions.' },
  ],
  author: {
      name: 'Anna M.',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80'
    },
    content: (
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
    )
  },
  {
    slug: 'the-30-second-scan',
    title: 'How Recruiters Read Resumes in 30 Seconds',
    excerpt: 'You have very little time to grab attention. Every line must put the most important words at the very front.',
    date: 'Mar 02, 2026',
      faqs: [
    { question: 'How long do recruiters spend scanning a profile?', answer: 'A senior technical recruiter will spend a strict maximum of roughly thirty seconds judging your entire visual footprint before instantly deciding to retain or reject your application entirely.' },
    { question: 'What is bullet point front-loading?', answer: 'Front-loading is the physical act of violently dragging the absolute most impressive technical noun or massive numerical result completely to the very first three words of the sentence.' },
    { question: 'Why is right-aligned text bad for resumes?', answer: 'Burying vital technical data on the far right margin completely breaks the natural Z-pattern sweep of the human eye causing critical algorithmic keywords to be instantly bypassed.' },
  ],
  author: {
      name: 'Sarah G.',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80'
    },
    content: (
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
    )
  },
  {
    slug: 'gap-explanation',
    title: 'How to Explain a Career Gap on Your Resume',
    excerpt: 'Hiding a long break in your work looks very bad. Smart people own their breaks and show how the time helped them grow.',
    date: 'Mar 01, 2026',
      faqs: [
    { question: 'Should I hide an employment gap on my resume?', answer: 'Never. Attempting to artificially stretch dates to obscure a gap triggers a catastrophic collapse in trust during the background check immediately resulting in a rescinded offer.' },
    { question: 'How do I correctly explain a long career break?', answer: 'Execute explicit semantic labelling. Treat the empty time like a normal formal job by titling the gap precisely as a Planned Sabbatical or Full-Time Educational Leave.' },
    { question: 'Can a gap be considered professional experience?', answer: 'Absolutely. If you aggressively dedicate the time to learning complex new frameworks label the timeline as an Independent Engineering Sabbatical and detail the heavy projects shipped.' },
  ],
  author: {
      name: 'Alex B.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>Taking extended time away from the corporate grind is completely normal. Unfortunately candidates have been terrified into believing that a gap of more than three months will instantly ruin their entire career track. This fear causes people to do incredibly foolish things on their profiles like stretching old job dates to cover the empty months or completely removing months and only listing years.</p>
        <p>When you attempt to hide a career gap you trigger an automatic failure during the background check phase. Discovering that you actively lied about a start or end date shatters all professional trust. The recruiter will immediately assume you were fired for gross misconduct and simply rescind the job offer. You must never hide the gap.</p>
        
        <h2 className={h2}>The Power of Explicit Labelling</h2>
        <p>The absolute best way to handle a career break is to aggressively own it. Treat the missing time exactly like a formal job entry. Put the start and end dates clearly on the page and give the gap an explicit title. Labelling it as a Planned Sabbatical or Full Time Caregiver completely kills the toxic guessing game.</p>
        <p>When a hiring manager sees an unexplained gap they assume you have been helplessly searching for work and getting rejected for an entire year. When they see the exact same gap labelled carefully as an active life choice they respect your agency.</p>
        
        <div className={callout}>
          <h3 className={h3}>Transforming Shadows into Projects</h3>
          <p>If you spent your six month gap learning a new programming language or building a small independent application you should name the gap after the project. List yourself as an Independent Developer and outline the specific technical stack you conquered. Self directed engineering is highly respected by modern technical managers.</p>
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
        <p>Once you proudly label the gap on your profile it becomes a strength rather than a scary secret. When you inevitably get asked about the time off during the phone screen you can answer directly without any nervous fumbling.</p>
        <p>Simply state that you took targeted time away to handle family matters or travel and quickly pivot back to your readiness. Saying you stepped away but are now fully energized and aggressively seeking a high ownership role signals immense personal stability. Managers love hiring stable people who know exactly what they want.</p>
      </div>
    )
  },
  {
    slug: 'academic-to-commercial',
    title: 'How to Turn a PhD Into a Tech Resume',
    excerpt: 'Companies do not care about school awards. You must flip your school work into terms that tech businesses care about.',
    date: 'Feb 28, 2026',
      faqs: [
    { question: 'Do tech companies care about academic degrees?', answer: 'Commercial software businesses strictly value shipped product iteration over deep academic theory. Graduate candidates must ruthlessly translate theoretical lab work into heavy commercial velocity metrics.' },
    { question: 'How do I translate a PhD into tech industry experience?', answer: 'Strip away all prestigious university jargon entirely. Describe your complex multi-year academic research completely as a high-growth startup product timeline focused intensely on data scaling and rigid resource operations.' },
    { question: 'What is the biggest fear when hiring an academic?', answer: 'Engineering Directors fear academics suffer from sluggish perfectionism. You must completely eradicate this bias by heavily highlighting specific moments where you aggressively shipped code fast to meet brutal deadlines.' },
  ],
  author: {
      name: 'Michelle P.',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80'
    },
    content: (
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
    )
  },
  {
    slug: 'generic-skill-bars',
    title: 'Why Skill Bars on Resumes Don\'t Work',
    excerpt: 'Giving yourself three out of five stars on a coding tool is the fastest way to make a manager skip your page forever.',
    date: 'Feb 26, 2026',
      faqs: [
    { question: 'Should I use visual progress bars for coding skills?', answer: 'Visual skill meters are an absolute structural disaster. Rating yourself eighty percent in a language provides complete zero verifiable context and actively highlights your own relative incompetence.' },
    { question: 'What is the binary rule of technical competence?', answer: 'Technical capability is strictly binary. If you can definitively build a massive commercial system with the tool list it. If you cannot consistently pass an interview in it delete it immediately.' },
    { question: 'How do I prove expert level skills?', answer: 'Replace empty abstract graphics entirely with heavy complex bullet points. Your deep mastery of a language is proven instantly by the architecture of the commercial systems you successfully scaled.' },
  ],
  author: {
      name: 'Marcus T.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    content: (
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
    )
  },
  {
    slug: 'beat-smart-ai-bots',
    title: 'How to Beat AI Resume Screening',
    excerpt: 'Recruiters now use AI tools that read your whole story instead of just counting words. Learn how to write so the bot ranks you higher.',
    date: 'Feb 25, 2026',
      faqs: [
    { question: 'How do AI resume screeners actually work?', answer: 'Modern intelligence parsers use semantic language modelling to actively interpret the grammatical cause and effect relationship between your technical knowledge and your actual applied business outcomes.' },
    { question: 'Why do complex visual resume templates fail?', answer: 'Heavy multi-column layouts extreme graphic overlays and intricate grid systems inherently confuse the extraction engines scrambling your sentences into massive chunks of incoherent data loss.' },
    { question: 'How do I rank higher in an applicant tracking system?', answer: 'Submit an incredibly sterile linear digital text structure using absolute rigorous action-adjacency where every single heavy technical tool is physically paired with an explicit financial or speed variable.' },
  ],
  author: {
      name: 'Elena R.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    },
    content: (
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
        <p>While the reading comprehension of parsing bots has evolved incredibly fast their ability to unentangle chaotic visual layouts remains surprisingly terrible. Complex multi column designs intricate grid graphics and overlapping text boxes constantly cause the extraction engines to scramble your sentences into total gibberish.</p>
        <p>You must completely surrender your desire to create a visually wild document. Using a rigorously clean linear website link or a dead simple text structure guarantees that the language model ingests every single syllable of your history in perfect sequential order giving you the absolute highest possible match score.</p>
      </div>
    )
  },
  {
    slug: 'where-to-put-ai-skills',
    title: 'Where to Put AI Skills on Your Resume',
    excerpt: 'Every manager wants to know if you can use AI to work fast. Learn the perfect place to put your prompt skills without looking cheap.',
    date: 'Feb 22, 2026',
      faqs: [
    { question: 'Should I call myself an AI Expert or Prompt Engineer?', answer: 'Absolutely never. Unless you are mathematically establishing raw neural network topology claiming the massive title of AI Expert marks you instantly as a fraudulent trend chaser.' },
    { question: 'Where do I list generative AI skills on my profile?', answer: 'Aggressively weave your prompt usage directly into the chronological action of previous jobs. Detail exactly how you deployed a coding assistant to strip weeks off a legacy refactor deadline.' },
    { question: 'What is the best way to prove I use AI tools?', answer: 'Highlight brutal speed metrics. Prove exactly how deploying a generative language model actively automated a massive operational bottleneck and mathematically doubled your own personal development velocity.' },
  ],
  author: {
      name: 'James L.',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>The sudden explosion of generative artificial intelligence has created massive confusion in the professional hiring market. Candidates are terrified of falling behind the technical curve so they aggressively plaster the phrase Prompt Engineer or AI Expert directly at the top of their public profiles. This strategy almost always guarantees immediate rejection. Unless you are literally writing the mathematical architecture for a new neural network calling yourself an AI expert makes you look like a trend chasing scammer.</p>
        <p>Hiring managers do not want to hire philosophers who just talk about the abstract future of artificial intelligence. We want to hire pragmatic operators who use large language models as basic utilities to accelerate their daily corporate output. You need to prove that you deploy AI exactly the same way an accountant uses a spreadsheet. It is just a lever you pull to multiply your personal speed.</p>
        
        <h2 className={h2}>Bury the Keywords in the Work</h2>
        <p>The absolute worst place to list your artificial intelligence capabilities is in a dedicated skills section. Giving ChatGPT its own standalone bullet point is incredibly amateur. You must weave your prompt usage directly into the chronological narrative of your actual prior jobs. When you tether the AI tool to a specific historical business outcome it instantly transforms from empty hype into verifiable technical credibility.</p>
        <p>Describe precisely how you used a coding assistant to refactor a massive legacy monolithic application in three weeks instead of the projected three months. Tell the hiring manager that you systematically built an automated text extraction wrapper using an API to instantly process thousands of messy incoming customer emails. When you pair the new technology with an irrefutable business win you completely eliminate the suspicion of fraud.</p>
        
        <div className={callout}>
          <h3 className={h3}>Measure the Acceleration</h3>
          <p>The only metric that matters when pitching your artificial intelligence competence is pure quantifiable acceleration. Explicitly calculate the exact number of hours or budget dollars you saved the corporation by deploying a language model. Do not tell us you are good at prompting. Prove to us that your prompting mathematically doubled your physical output.</p>
        </div>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 310" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Divider */}
            <line x1="340" y1="10" x2="340" y2="300" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

            {/* LEFT: Wrong */}
            <text x="160" y="26" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-400">✗ Wrong</text>

            {/* Resume mockup - left */}
            <rect x="40" y="42" width="240" height="240" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

            {/* Name placeholder */}
            <rect x="60" y="54" width="100" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="60" y="66" width="140" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* AI Skills section - highlighted wrong */}
            <rect x="54" y="84" width="212" height="80" rx="4" className="fill-red-50 dark:fill-red-900/15 stroke-red-300 dark:stroke-red-700" strokeWidth="1" />
            <text x="64" y="100" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-400">AI Skills</text>
            <text x="64" y="116" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">• Prompt Engineering</text>
            <text x="64" y="130" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">• ChatGPT</text>
            <text x="64" y="144" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">• Midjourney</text>
            <text x="64" y="158" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">• AI Automation</text>

            {/* Work History - small */}
            <text x="64" y="182" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Work History</text>
            <rect x="64" y="190" width="170" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="64" y="198" width="150" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="64" y="206" width="180" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="64" y="214" width="120" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Standalone label */}
            <text x="160" y="260" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500" fontStyle="italic">Standalone section = no context</text>

            {/* RIGHT: Right */}
            <text x="510" y="26" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-500">✓ Right</text>

            {/* Resume mockup - right */}
            <rect x="390" y="42" width="240" height="240" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

            {/* Name placeholder */}
            <rect x="410" y="54" width="100" height="8" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="410" y="66" width="140" height="5" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Work History - with AI woven in */}
            <text x="410" y="90" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Work History</text>

            <rect x="410" y="98" width="180" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="404" y="106" width="212" height="22" rx="3" className="fill-emerald-50 dark:fill-emerald-900/15 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.5" />
            <text x="410" y="121" fontSize="8" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Used ChatGPT to automate QA → 40% faster</text>

            <rect x="410" y="136" width="160" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="404" y="144" width="212" height="22" rx="3" className="fill-emerald-50 dark:fill-emerald-900/15 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.5" />
            <text x="410" y="159" fontSize="8" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Prompt-engineered content pipeline, 3x output</text>

            <rect x="410" y="174" width="190" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="404" y="182" width="212" height="22" rx="3" className="fill-emerald-50 dark:fill-emerald-900/15 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="0.5" />
            <text x="410" y="197" fontSize="8" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Midjourney for brand assets, saved $12K agency</text>

            <rect x="410" y="212" width="170" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="410" y="220" width="140" height="4" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Woven label */}
            <text x="510" y="260" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500" fontStyle="italic">AI skills woven into real results</text>
          </svg>
        </div>

        <h2 className={h2}>Avoid the Guru Trap</h2>
        <p>Never under any circumstances list yourself as an AI Thought Leader. The technology is evolving so violently fast that anyone claiming absolute mastery of the entire ecosystem is instantly flagged as a liar by technical recruiters. We respect humility and brutal pragmatism over grandiose titles.</p>
        <p>State clearly that you are aggressively and consistently learning how to use new developer tools to ship code faster. This framing proves you possess the hunger required to adapt to the shifting landscape while firmly keeping your feet planted in the reality of building functional products.</p>
      </div>
    )
  },
  {
    slug: 'show-your-code',
    title: 'How to Show Projects on Your Resume',
    excerpt: 'Companies do not trust text anymore. Dropping a link to a real project gets you hired much faster than a big list of languages.',
    date: 'Feb 20, 2026',
      faqs: [
    { question: 'Do managers actually review GitHub profile links?', answer: 'Yes. Engineering directors massively distrust plain text bullet claims. Providing a single hyperlinked button to a perfectly architected active software repository instantly shatters generic competition.' },
    { question: 'Are live app links better than static resumes?', answer: 'Forcing an evaluator to click and manually interact with your successfully deployed frontend interface generates completely irrefutable proof of your elite operational competence and deployment architecture.' },
    { question: 'What should my open source portfolio include?', answer: 'Ensure your root repository features deeply heavy architectural markdown documentation. Managers aggressively judge your ability to communicate complex database choices long before they ever read the raw structural code.' },
  ],
  author: {
      name: 'David C.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>The modern technical hiring landscape is completely flooded with perfectly formatted documents claiming absolute mastery of every programming language on earth. Because of the massive proliferation of online tutorials and bootcamps it costs a candidate literally zero effort to type the word React or Postgres onto their public profile. Due to this extreme saturation technical recruiters have developed an immense distrust of plain text declarations.</p>
        <p>We assume every single technical skill you list is an aggressive exaggeration until you prove otherwise. If you want to bypass the massive pile of generic applicants and instantly trigger an interview request you must stop demanding that we trust your words. You must force us to interact directly with your compiled functional code. Showing always defeats telling.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Baseline */}
            <line x1="60" y1="230" x2="620" y2="230" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

            {/* Arrow along bottom */}
            <line x1="80" y1="260" x2="580" y2="260" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="580,255 595,260 580,265" className="fill-zinc-400 dark:fill-zinc-500" />
            <text x="340" y="276" textAnchor="middle" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Recruiter Trust →</text>

            {/* Step 1: Listed Skill — short block */}
            <rect x="80" y="170" width="150" height="60" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
            <text x="155" y="196" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Listed Skill</text>
            <text x="155" y="212" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">"I know React"</text>
            {/* Trust label */}
            <rect x="110" y="148" width="90" height="18" rx="4" className="fill-zinc-200 dark:fill-zinc-700" />
            <text x="155" y="161" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Low trust</text>

            {/* Step 2: GitHub Repo — medium block */}
            <rect x="265" y="120" width="150" height="110" rx="6" className="fill-sky-50 dark:fill-sky-900/20 stroke-sky-300 dark:stroke-sky-700" strokeWidth="1" />
            <text x="340" y="160" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">GitHub Repo</text>
            <text x="340" y="178" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Code reviewable</text>
            <text x="340" y="193" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">by anyone</text>
            {/* Trust label */}
            <rect x="290" y="98" width="100" height="18" rx="4" className="fill-sky-100 dark:fill-sky-900/30" />
            <text x="340" y="111" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-sky-600 dark:fill-sky-400">Medium trust</text>

            {/* Step 3: Live URL — tall block */}
            <rect x="450" y="60" width="150" height="170" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
            <text x="525" y="110" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Live Deployed URL</text>
            <text x="525" y="128" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Working app anyone</text>
            <text x="525" y="143" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">can try right now</text>
            {/* Trust label */}
            <rect x="480" y="38" width="90" height="18" rx="4" className="fill-emerald-100 dark:fill-emerald-900/30" />
            <text x="525" y="51" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">High trust</text>

            {/* Step connectors */}
            <line x1="230" y1="200" x2="265" y2="175" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" strokeDasharray="4 3" />
            <line x1="415" y1="175" x2="450" y2="145" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" strokeDasharray="4 3" />
          </svg>
        </div>

        
        <h2 className={h2}>The Live URL Mandate</h2>
        <p>You absolutely must include a hyperlinked URL that points directly to a living breathing application you architected. A static screenshot is practically useless and a zip file implies you possess zero deployment skills. When an engineering manager can click a link instantly interact with your user interface and attempt to break your form validations they immediately respect your operational competence.</p>
        <p>Deploying a project proves you survived the most difficult and frustrating phase of software engineering. Millions of juniors can follow a clean local tutorial but very few possess the grit required to successfully configure a production server set up database scaling and secure a custom domain network. A live link proves you are a finisher.</p>
        
        <div className={callout}>
          <h3 className={h3}>Curate the Source Repository</h3>
          <p>When you link to your public code repository explicitly pin your three most impressive projects to the top of your profile. Make absolutely sure the root folder contains a pristine descriptive markdown file that clearly explains the architecture the database choices and the specific reasons you selected the overarching technical stack. Managers read the documentation before they ever look at the pure code.</p>
        </div>

        <h2 className={h2}>Public Collaboration Artifacts</h2>
        <p>Submitting code to massive open source libraries is universally recognized as the ultimate proof of elite software engineering. When you link to a public system where your isolated code branch was heavily scrutinized reviewed and eventually merged by senior engineers working at major corporations you establish unassailable technical credibility.</p>
        <p>Even linking to a deeply technical conversation where you methodically helped a stranger debug a complex race condition dramatically boosts your hiring profile. We want to hire developers who communicate complex technical architecture clearly in plain public view. Your public internet artifacts are your actual profile.</p>
      </div>
    )
  },
  {
    slug: 'college-degrees-matter-less',
    title: 'Do You Need a Degree for a Tech Job?',
    excerpt: 'Big tech companies are switching to skills based hiring. Learn how to hide your lack of a famous degree behind massive project wins.',
    date: 'Feb 18, 2026',
      faqs: [
    { question: 'Is a computer science degree mandatory for software jobs?', answer: 'The modern technology sector is aggressively pivoting toward pure skills-based verification. Massive enterprise systems routinely drop legacy degree requirements prioritizing raw deployed project wins instead.' },
    { question: 'Where should education go on a senior resume?', answer: 'If you lack a famous degree bury the education block permanently at the absolute bottom margin. Instantly force your massive commercial architecture wins directly into the top reading zone.' },
    { question: 'How do I list a coding bootcamp effectively?', answer: 'Treat accelerated bootcamps explicitly as supplementary tool acquisition. Heavily emphasize the independent massive applications you completely designed and deployed outside the safe guided parameters of their static curriculum.' },
  ],
  author: {
      name: 'Sarah G.',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>The traditional corporate obsession with elite university credentials is rapidly collapsing across the entire technology sector. A decade ago failing to possess a computer science degree from a prestigious engineering institution would instantly disqualify you from passing the initial automated resume screen. Today the most powerful technology companies on the planet have formally and publicly ripped the college degree requirement out of their job descriptions.</p>
        <p>This massive structural shift occurred because engineering managers finally realized that surviving four years of theoretical mathematics in a classroom has almost zero correlation with the ability to ship a functioning web application under immense pressure. The industry has aggressively pivoted toward pure skills based hiring. We no longer care where you sat for four years. We only care what you built yesterday.</p>
        
        <h2 className={h2}>Flipping the Traditional Hierarchy</h2>
        <p>If you lack a famous degree you must completely restructure the visual hierarchy of your specific profile. The classic template demands you put your education at the very absolute top of the page. You must completely ignore this obsolete rule. You need to aggressively force your massive commercial project wins and detailed technical deployments to the very top margin where the eye naturally lands.</p>
        <p>Bury your formal education section at the absolute furthest bottom corner of the digital page. Treat it exactly like a minor administrative footnote. When a recruiter is instantly blown away by the massive enterprise platforms you architected in the first ten seconds of reading they will entirely forget to even check if you actually went to college.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 300" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* LEFT: Old Layout */}
            <text x="140" y="24" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Old Layout</text>

            <rect x="30" y="38" width="220" height="240" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

            {/* Education block - BIG */}
            <rect x="44" y="50" width="192" height="100" rx="4" className="fill-amber-50 dark:fill-amber-900/15 stroke-amber-300 dark:stroke-amber-700" strokeWidth="1" />
            <text x="140" y="72" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Education</text>
            <text x="140" y="90" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">B.S. Computer Science</text>
            <text x="140" y="104" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">University of Example</text>
            <text x="140" y="118" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">GPA 3.8, Dean's List...</text>
            <text x="140" y="136" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Relevant Coursework...</text>

            {/* Projects block - small */}
            <rect x="44" y="162" width="192" height="50" rx="4" className="fill-zinc-50 dark:fill-zinc-800/50 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="140" y="182" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Projects</text>
            <rect x="64" y="192" width="150" height="3" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="64" y="199" width="120" height="3" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Work */}
            <rect x="44" y="222" width="192" height="44" rx="4" className="fill-zinc-50 dark:fill-zinc-800/50 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="140" y="240" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Experience</text>
            <rect x="64" y="248" width="130" height="3" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x="64" y="255" width="150" height="3" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />

            {/* Arrow between */}
            <line x1="275" y1="158" x2="390" y2="158" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="390,153 405,158 390,163" className="fill-zinc-400 dark:fill-zinc-500" />
            <text x="340" y="148" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Flip it</text>

            {/* RIGHT: New Layout */}
            <text x="530" y="24" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">New Layout</text>

            <rect x="420" y="38" width="220" height="240" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

            {/* Projects block - BIG */}
            <rect x="434" y="50" width="192" height="120" rx="4" className="fill-emerald-50 dark:fill-emerald-900/15 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
            <text x="530" y="72" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Projects & Experience</text>
            <text x="530" y="90" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Built payment dashboard — React</text>
            <text x="530" y="104" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Open-source CLI tool — 200 stars</text>
            <text x="530" y="118" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Deployed ML model — 95% accuracy</text>
            <text x="530" y="132" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Freelance app — 1K active users</text>
            <text x="530" y="152" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">...</text>

            {/* Education block - small footnote */}
            <rect x="434" y="230" width="192" height="38" rx="4" className="fill-zinc-50 dark:fill-zinc-800/50 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="530" y="248" textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Education — B.S. CS, University</text>
            <text x="530" y="260" textAnchor="middle" fontSize="8" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">(footnote, not headline)</text>

            {/* Skills row */}
            <rect x="434" y="182" width="192" height="38" rx="4" className="fill-zinc-50 dark:fill-zinc-800/50 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="530" y="200" textAnchor="middle" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Skills & Tools</text>
            <rect x="454" y="208" width="150" height="3" rx="1" className="fill-zinc-200 dark:fill-zinc-700" />
          </svg>
        </div>

        
        <div className={callout}>
          <h3 className={h3}>The Autodidact Advantage</h3>
          <p>Never operate from a posture of shame regarding your self taught background. In the hyper accelerated modern technology market the ability to aggressively teach yourself complex new frameworks over the weekend is the single most valuable skill a human can possess. Explicitly highlighting that you taught yourself full stack development while working a chaotic retail job proves you possess terrifying levels of grit and discipline.</p>
        </div>

        <h2 className={h2}>Bootcamps are Tools Not Diplomas</h2>
        <p>If you used an accelerated coding bootcamp to transition into the industry you must treat it appropriately. A twelve week camp is a phenomenal acceleration tool but it is absolutely not a replacement for a university degree and you should not format it like one. List the dense technical curriculum you survived but immediately follow it with the standalone applications you built outside of their guided tutorials.</p>
        <p>Hiring managers want to see that you have completely broken away from the scripted safety of the bootcamp environment. Prove that you can fly solo without a famous instructor holding your hand.</p>
      </div>
    )
  },
  {
    slug: 'two-page-resume-myth',
    title: 'Is a Two-Page Resume OK?',
    excerpt: 'People stress too much about fitting everything on a single piece of paper. A clean two page web profile actually works much better.',
    date: 'Feb 15, 2026',
      faqs: [
    { question: 'Is the strict one-page resume rule still valid?', answer: 'The archaic single page mandate is completely dead for senior operators. Mutilating margins and microscopic fonts to appease physical paper constraints triggers massive visual fatigue on modern digital displays.' },
    { question: 'How long should a digital CV profile be?', answer: 'Length is completely dictatable by deep continuous value. A web profile simply relies on an infinite vertical scroll. As long as every bullet is a heavy actionable metric readers will naturally descend.' },
    { question: 'Does extending the length allow for more jobs?', answer: 'No. Extra vertical space must never be populated by irrelevant ancient roles. It must be heavily dedicated toward injecting clean luxurious whitespace around your three most recent absolute primary victories.' },
  ],
  author: {
      name: 'Marcus T.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>One of the most destructive and enduring pieces of career advice ever created is the absolute strict mandate that your professional history must perfectly fit onto a single physical piece of paper. This rule was invented forty years ago when human resources departments literally stored applicant sheets in giant steel filing cabinets and extra paper cost physical money. Applying this ancient physical constraint to modern digital rendering is complete strategic insanity.</p>
        <p>When professionals with seven years of deep technical experience blindly obey the single page rule they inevitably completely destroy their own formatting. They aggressively shrink their fonts to microscopically unreadable levels and completely delete their margins creating an overwhelming wall of dense black text. When a recruiter opens a dense claustrophobic document their brain instantly fatigues and they instinctively close the tab.</p>
        
        <h2 className={h2}>The Infinite Digital Scroll</h2>
        <p>The entire framework of pagination is utterly meaningless in the era of web links and digital profiles. A hiring manager using a modern high resolution display or a mobile phone does not experience your history as discrete physical pages. They experience it as a continuous vertical scroll. If your content is genuinely compelling and beautifully formatted they will happily flick their thumb and scroll for as long as it takes to ingest your value.</p>
        <p>You must completely stop treating white space as your enemy. Blank space is a premium luxurious design tool that forces the readers eye to naturally pause and absorb your most critical achievements. If adding proper margins and spacing forces your digital summary to extend to what would traditionally be considered a second page you should celebrate the increased readability.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 320" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Divider */}
            <line x1="340" y1="10" x2="340" y2="310" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

            {/* LEFT: Cramped */}
            <text x="160" y="24" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-400">Cramped 1 Page</text>

            <rect x="40" y="38" width="220" height="240" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

            {/* Dense text lines - very tight spacing */}
            {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26].map((i) => (
              <rect
                key={`dense-${i}`}
                x="48"
                y={44 + i * 8.5}
                width={160 + (i % 3) * 15 - (i % 5) * 8}
                height="3"
                rx="1"
                className="fill-zinc-400 dark:fill-zinc-500"
              />
            ))}

            {/* Margin indicators */}
            <line x1="44" y1="38" x2="44" y2="278" className="stroke-red-300 dark:stroke-red-600" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="256" y1="38" x2="256" y2="278" className="stroke-red-300 dark:stroke-red-600" strokeWidth="0.5" strokeDasharray="2 2" />

            {/* Label */}
            <rect x="60" y="286" width="180" height="22" rx="4" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="0.5" />
            <text x="150" y="301" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-red-400">8pt font · 0.3in margins · painful</text>

            {/* RIGHT: Spacious */}
            <text x="510" y="24" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-500">Spacious Layout</text>

            <rect x="410" y="38" width="230" height="240" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />

            {/* Section 1 header */}
            <rect x="436" y="52" width="80" height="5" rx="1" className="fill-zinc-400 dark:fill-zinc-500" />
            {/* Section 1 body */}
            <rect x="436" y="66" width="170" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="436" y="78" width="150" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="436" y="90" width="175" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />

            {/* Section 2 header */}
            <rect x="436" y="116" width="90" height="5" rx="1" className="fill-zinc-400 dark:fill-zinc-500" />
            {/* Section 2 body */}
            <rect x="436" y="130" width="160" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="436" y="142" width="140" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="436" y="154" width="170" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />

            {/* Section 3 header */}
            <rect x="436" y="180" width="70" height="5" rx="1" className="fill-zinc-400 dark:fill-zinc-500" />
            {/* Section 3 body */}
            <rect x="436" y="194" width="155" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="436" y="206" width="130" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x="436" y="218" width="165" height="4" rx="1" className="fill-zinc-300 dark:fill-zinc-600" />

            {/* Good margin indicators */}
            <line x1="428" y1="38" x2="428" y2="278" className="stroke-emerald-300 dark:stroke-emerald-600" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="632" y1="38" x2="632" y2="278" className="stroke-emerald-300 dark:stroke-emerald-600" strokeWidth="0.5" strokeDasharray="2 2" />

            {/* Label */}
            <rect x="430" y="286" width="180" height="22" rx="4" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="0.5" />
            <text x="520" y="301" textAnchor="middle" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-500">11pt font · proper margins · inviting</text>
          </svg>
        </div>

        
        <div className={callout}>
          <h3 className={h3}>The Seniority Threshold</h3>
          <p>The single page rule only applies if you possess fewer than three years of professional experience. If you are entirely new to the industry stretching your background across two pages clearly signals that you are aggressively padding your history with irrelevant fluff. However the moment you cross the threshold into mid level architecture a heavily truncated one page profile signals that you failed to achieve anything complex enough to warrant detailed explanation.</p>
        </div>

        <h2 className={h2}>Ruthless Pruning is Still Required</h2>
        <p>Expanding your digital footprint does not give you permission to hoard ancient irrelevant data. You must still aggressively delete the bizarre side jobs you held a decade ago that possess absolutely zero intersection with the role you want today. Giving yourself permission to use more vertical space simply means you are dedicating that premium space entirely to fully unpacking the technical complexity of your three most recent and massive career victories.</p>
        <p>Treat your expanded real estate with immense respect. Every extra line you take must mathematically justify its existence by delivering a highly specific quantifiable business outcome.</p>
      </div>
    )
  }
];
