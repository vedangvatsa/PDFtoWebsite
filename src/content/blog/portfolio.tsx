import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
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
        <p>If you want to <Link href="/code" className={link}>show your code as proof of work</Link>, GitHub Pages is a natural fit. Just make sure the site itself does not look abandoned.</p>

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
        <p>The limitation is that ReadCV leans heavily toward design portfolios. If your best work is a distributed system or a CLI tool, ReadCV does not give you a great way to present that. It also does not generate structured data that machines can parse, which matters more every year as <Link href="/ai" className={link}>AI agents start browsing candidate profiles</Link> programmatically.</p>

        <h2 className={h2}>6. CVin.Bio</h2>
        <p><span className={bold}>Best for:</span> Developers who want a professional profile that works for both humans and machines.</p>
        <p>CVin.Bio turns your resume into a hosted web profile at a clean URL like <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">cvin.bio/yourname</code>. You upload your existing CV and it builds a responsive page with your experience, skills, and projects structured as proper data.</p>
        <p>The thing that sets it apart is the machine-readable layer. Behind the page you see, there is schema.org markup and structured data that AI agents and ATS systems can parse directly. Your skills show up as a typed array, not words buried in a paragraph. This is the same idea behind putting a <Link href="/link" className={link}>URL on your resume instead of a file</Link>.</p>
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
          <p>No platform fixes weak projects. The platform is just a frame. If you want to stand out, <Link href="/code" className={link}>show real code and real results</Link>. The portfolio platform just needs to stay out of the way and present your work clearly.</p>
        </div>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/code" className={link}>How to show your code on a resume</Link></li>
          <li><Link href="/link" className={link}>Why a URL is the best way to share your resume</Link></li>
          <li><Link href="/ai" className={link}>AI agents are already browsing your resume</Link></li>
        </ul>
      </div>
  );
}
