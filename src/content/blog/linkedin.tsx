import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
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
            {/* Node 1: GitHub. top center */}
            <rect x="200" y="28" width="120" height="52" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="260" y="50" textAnchor="middle" className="spoke-name fill-zinc-800 dark:fill-zinc-200">GitHub</text>
            <text x="260" y="68" textAnchor="middle" className="spoke-desc fill-zinc-500 dark:fill-zinc-400">code proof</text>
            {/* Node 2: Personal Site. top left */}
            <rect x="18" y="82" width="140" height="52" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="88" y="104" textAnchor="middle" className="spoke-name fill-zinc-800 dark:fill-zinc-200">Personal Site</text>
            <text x="88" y="122" textAnchor="middle" className="spoke-desc fill-zinc-500 dark:fill-zinc-400">total control</text>
            {/* Node 3: CVin.Bio. top right */}
            <rect x="370" y="82" width="124" height="52" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="432" y="104" textAnchor="middle" className="spoke-name fill-zinc-800 dark:fill-zinc-200">CVin.Bio</text>
            <text x="432" y="122" textAnchor="middle" className="spoke-desc fill-zinc-500 dark:fill-zinc-400">structured data</text>
            {/* Node 4: Read.cv. bottom left */}
            <rect x="18" y="262" width="140" height="52" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="88" y="284" textAnchor="middle" className="spoke-name fill-zinc-800 dark:fill-zinc-200">Read.cv</text>
            <text x="88" y="302" textAnchor="middle" className="spoke-desc fill-zinc-500 dark:fill-zinc-400">design-first</text>
            {/* Node 5: Polywork. bottom right */}
            <rect x="370" y="262" width="124" height="52" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="432" y="284" textAnchor="middle" className="spoke-name fill-zinc-800 dark:fill-zinc-200">Polywork</text>
            <text x="432" y="302" textAnchor="middle" className="spoke-desc fill-zinc-500 dark:fill-zinc-400">project-based</text>
            {/* Node 6: Mastodon. bottom center */}
            <rect x="200" y="320" width="120" height="52" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="260" y="342" textAnchor="middle" className="spoke-name fill-zinc-800 dark:fill-zinc-200">Mastodon</text>
            <text x="260" y="360" textAnchor="middle" className="spoke-desc fill-zinc-500 dark:fill-zinc-400">community ties</text>
          </svg>
        </div>


        <h2 className={h2}>1. GitHub Profile</h2>
        <p>Your GitHub profile is your code-first identity. Recruiters at engineering-heavy companies check GitHub before they check LinkedIn. A well-maintained profile with pinned repos, a README, and real commit history tells a hiring manager more about you than any resume bullet point can.</p>
        <p>The strength of GitHub is proof. It is not a claim that you know React. It is a repo where someone can read your React code, see your commit messages, and look at how you handle pull requests. For more on this, see why you should <Link href="/code" className={link}>show your code</Link> as part of your job search.</p>
        <p>The downside is that GitHub is not built for career storytelling. There is no place for your work history, your impact at previous jobs, or the context behind your projects. A repo called &quot;payment-gateway&quot; does not explain that it processed $50M in transactions. And not everyone has the time or permission to maintain public repos alongside their day job.</p>
        <p><span className={bold}>Best for:</span> developers with active open-source work or personal projects they are proud of.</p>

        <h2 className={h2}>2. Personal Website</h2>
        <p>A personal website gives you total control. You decide what goes on it, how it looks, and what story it tells. You can include a resume, a portfolio, blog posts, talks, and anything else that shows what you know. Nobody else&apos;s algorithm decides what people see.</p>
        <p>The trade-off is effort. Building and maintaining a personal site takes time. You need to buy a domain, choose a framework, deploy it somewhere, and actually keep the content updated. A lot of developers launch a site, write two blog posts, and let it sit for three years with outdated information. A stale personal site can actually hurt you more than not having one.</p>
        <p>If you enjoy web development and writing, a personal site is the most powerful option on this list. If you do not, it becomes a chore that collects dust.</p>
        <p><span className={bold}>Best for:</span> developers who enjoy writing and want full creative control over their online presence.</p>

        <h2 className={h2}>3. CVin.Bio</h2>
        <p>CVin.Bio sits between a personal website and a LinkedIn profile. You get a structured page with your experience, skills, and projects, formatted in a clean layout with a short shareable URL. It is designed to be the page a recruiter lands on when they want to see your background quickly.</p>
        <p>The advantage over a personal website is speed. You do not need to build anything from scratch. Upload your resume or fill in the fields, and you get a page that works. The advantage over LinkedIn is readability. No feed, no endorsements, no &quot;open to work&quot; banners. Just your professional background on a clean page. And because it is a real web page, it works well when <Link href="/ai" className={link}>AI agents browse your resume</Link>.</p>
        <p>The limitation is flexibility. You are working within a template. If you want a blog, a portfolio of design work, or a page that looks nothing like a resume, a personal site gives you more room. CVin.Bio is best when you want something that works right now without ongoing maintenance.</p>
        <p><span className={bold}>Best for:</span> developers who want a shareable profile page without building or maintaining a website.</p>

        <div className={callout}>
          <h3 className={h3}>The link test</h3>
          <p>Ask yourself: if a recruiter asked for a link to your work, what would you send? If the only answer is your LinkedIn URL, you are leaving impact on the table. Having a second link to something that shows your actual work, whether that is GitHub, a personal site, or a <Link href="/link" className={link}>web profile</Link>, gives recruiters more signal about who you are.</p>
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
        <p>To get the most out of whatever platform you choose, read about how to <Link href="/inbox" className={link}>stand out in a recruiter&apos;s inbox</Link>.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/code" className={link}>Why showing your code matters in a job search</Link></li>
          <li><Link href="/link" className={link}>Why a URL is the best thing on your resume</Link></li>
          <li><Link href="/ai" className={link}>How AI agents read your online resume</Link></li>
        </ul>
      </div>
  );
}
