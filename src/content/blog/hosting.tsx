import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
 If your project only runs on your local machine, it does not exist. Hiring managers will not clone your repository. They will not install your dependencies. They will not debug your database connection. If they cannot click a link and see your work in a browser, your project has zero value in your job search.
 </p>
      <p>
 Getting a project online is easier than ever, but doing it wrong can hurt your chances. A slow site or a broken database connection will make you look careless. You need to host your work on platforms that are fast, cheap, and reliable. This guide covers the best practices for getting your code in front of recruiters without spending a fortune.
 </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Hosting tier comparison for personal projects">
          <rect x="0" y="0" width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-950" />
          <text x="350" y="30" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100 font-bold text-sm">Personal Project Hosting Options</text>
          
          {/* Static Hosting */}
          <rect x="30" y="60" width="190" height="230" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="125" y="85" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100 font-bold text-xs">Static Sites</text>
          <text x="125" y="105" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[10px]">Vercel, Netlify, GitHub Pages</text>
          
          <circle cx="125" cy="150" r="24" className="fill-emerald-100 dark:fill-emerald-950/40 stroke-emerald-500" strokeWidth="1.5" />
          <text x="125" y="154" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 font-bold text-xs">Free</text>
          
          <text x="125" y="200" textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-400 text-[10px]">Zero cost forever</text>
          <text x="125" y="215" textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-400 text-[10px]">Fast global CDN</text>
          <text x="125" y="230" textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-400 text-[10px]">Perfect for portfolios</text>
          <rect x="55" y="250" width="140" height="22" rx="4" className="fill-emerald-50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-900" />
          <text x="125" y="264" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[9px] font-semibold">Highly Recommended</text>

          {/* PaaS Dynamic */}
          <rect x="255" y="60" width="190" height="230" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="350" y="85" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100 font-bold text-xs">Dynamic PaaS</text>
          <text x="350" y="105" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[10px]">Render, Railway, Fly.io</text>
          
          <circle cx="350" cy="150" r="24" className="fill-amber-100 dark:fill-amber-950/40 stroke-amber-500" strokeWidth="1.5" />
          <text x="350" y="154" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 font-bold text-[10px]">$0 - $7/mo</text>
          
          <text x="350" y="200" textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-400 text-[10px]">Supports databases</text>
          <text x="350" y="215" textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-400 text-[10px] font-semibold text-amber-600 dark:text-amber-400">Warning: Cold Starts</text>
          <text x="350" y="230" textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-400 text-[10px]">Containers go to sleep</text>
          <rect x="280" y="250" width="140" height="22" rx="4" className="fill-amber-50 dark:fill-amber-950/20 stroke-amber-200 dark:stroke-amber-900" />
          <text x="350" y="264" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 text-[9px] font-semibold">Keep Awake Strategy Required</text>

          {/* Cloud VPS */}
          <rect x="480" y="60" width="190" height="230" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="575" y="85" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100 font-bold text-xs">VPS Hosting</text>
          <text x="575" y="105" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[10px]">DigitalOcean, Hetzner</text>
          
          <circle cx="575" cy="150" r="24" className="fill-blue-100 dark:fill-blue-950/40 stroke-blue-500" strokeWidth="1.5" />
          <text x="575" y="154" textAnchor="middle" className="fill-blue-600 dark:fill-blue-400 font-bold text-[10px]">$4 - $10/mo</text>
          
          <text x="575" y="200" textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-400 text-[10px]">Full control of OS</text>
          <text x="575" y="215" textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-400 text-[10px]">No cold starts ever</text>
          <text x="575" y="230" textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-400 text-[10px]">Requires Linux management</text>
          <rect x="505" y="250" width="140" height="22" rx="4" className="fill-blue-50 dark:fill-blue-950/20 stroke-blue-200 dark:stroke-blue-900" />
          <text x="575" y="264" textAnchor="middle" className="fill-blue-600 dark:fill-blue-400 text-[9px] font-semibold">Best for Senior Devs</text>
        </svg>
      </div>

      <h2 className={h2}>The Cold Start Problem</h2>
      <p>
 If a recruiter clicks your link, you have about ten seconds to catch their interest. If your page takes fifteen seconds to load, they will close the tab. Free hosting plans for backend applications are famous for this behavior. Platforms like Render or Fly.io put your application containers to sleep when they do not receive traffic.
 </p>
      <p>
 When a new visitor clicks the link, the platform has to start the container from scratch. This is a cold start. It takes time. A recruiter does not know this is a cold start. They just think your application is broken or slow.
 </p>
      <p>
 You must solve this problem before sending your link. If you use a free tier, set up a cron service to keep the container awake. You can use a free ping tool to hit your endpoint every ten minutes. Set it to run only during business hours to conserve your free plan credits.
 </p>
      <p>
 If you want a simpler solution, pay the five dollars a month for a basic paid tier. Paid containers do not sleep. That small investment prevents recruiters from encountering a blank loading screen.
 </p>

      <h2 className={h2}>Choosing the Right Hosting Stack</h2>
      <p>
 You do not need a complex setup. Keep your architecture simple. Frontend applications should go to static hosting networks. Vercel, Netlify, and GitHub Pages are excellent options. They are free, they have global servers, and they scale without configuration.
 </p>
      <p>
 For backend applications, Render or Railway are good starting points. They handle deployment directly from your git branches. They auto-update when you push to main.
 </p>
      <p>
 If you are a senior developer, consider using a cheap Virtual Private Server. A basic node on DigitalOcean or Hetzner costs less than a fancy coffee. It gives you full control over the operating system. It shows you can manage Linux servers, configure reverse proxies, and handle firewalls.
 </p>
      <p>
 A VPS requires more setup, but it proves system administration capability. You can install Docker and run your entire stack on a single small machine. It is a great way to show production deployment skills.
 </p>

      <div className={callout}>
        <h3 className={h3}>Keep it simple</h3>
        <p>
 Do not build a Kubernetes cluster for a simple portfolio app. It looks silly. It shows you do not understand cost efficiency. Use the simplest hosting path that satisfies the demands of your application.
 </p>
      </div>

      <h2 className={h2}>The Importance of a Custom Domain</h2>
      <p>
 A domain name costs about ten dollars a year. Using a default platform subdomain makes your project look like a school assignment. It signals that you did not care enough to spend a few dollars on your own work.
 </p>
      <p>
 Buy a clean domain that matches your project name. Do not use complex words or long strings of numbers. Connect the domain to your hosting platform.
 </p>
      <p>
 Use a free DNS service like Cloudflare. Cloudflare handles your domain registration, provides free SSL certificates, and shields your site from basic attacks. Having HTTPS on your URL is not optional. Modern browsers display scary warnings on HTTP sites. A recruiter will not click through a security warning to see your project.
 </p>
      <p>
 A custom domain also makes your URL short and easy to write. You can print it on your document or share it in an email. It looks professional and clean.
 </p>

      <h2 className={h2}>Providing Realistic Demo Data</h2>
      <p>
 When a hiring manager logs into your application, they should not see an empty dashboard. They should not see empty charts or blank tables. An empty application feels dead. It does not show how the system behaves under normal use.
 </p>
      <p>
 You must seed your database with realistic data. Write a script that generates hundreds of sample transactions, user profiles, or forum posts. Use realistic names and dates. Avoid using placeholder text like lorem ipsum.
 </p>
      <p>
 Make the login process frictionless. Do not force the user to sign up. Do not force them to verify their email address. They will not do it.
 </p>
      <p>
 Create a guest access option. Place a large button on the landing page that says log in as guest. When clicked, it should log them in automatically with pre-filled test credentials. This allows the recruiter to explore the application in under three seconds.
 </p>

      <h2 className={h2}>Adding Monitoring and Logging</h2>
      <p>
 A production system needs monitoring. If your project crashes while a recruiter is using it, you need to know immediately. You also need to know how they interacted with the system.
 </p>
      <p>
 Install a free monitoring agent. Tools like Sentry or Logtail are easy to add. They alert you when an uncaught exception occurs. If you receive an alert, you can fix the issue before the next user encounters it.
 </p>
      <p>
 You should also set up basic analytics. Do not use heavy tracking scripts that slow down page loads. Use a light, privacy-friendly analytics tool. This tells you if someone visited your project from a city where a company you applied to is located. It is a good way to see if your profile link is actually getting clicked.
 </p>
      <p>
 When you publish your projects, make sure you keep your secrets safe. Never commit database passwords or API keys to GitHub. Use environment variables on your hosting platform. Committed secrets are a security failure that will get you rejected immediately.
 </p>
      <p>
 Finally, write a brief engineering document for each hosted project. Put a README.md file in the root of your repository. This file must explain the problem the project solves, the architectural choices you made, and the performance benchmarks. List instructions on how to run the project locally, but make sure the live URL is at the very top of the file.
 </p>
      <p>
 Hiring managers appreciate when you document your work. It shows that you write software for a team, for yourself. It proves you understand that communication is part of the engineering job.
 </p>
      <p>
 If you want a clean way to share your live projects, use a web profile page. It groups your links in one professional dashboard. Learn about <Link href="/link" className={link}>sending your CV as a web link instead of a static PDF file</Link>.
 </p>
      <p>
 If you are preparing your profile for application submissions, read about <Link href="/top" className={link}>what to put at the top of your profile</Link> to capture attention immediately.
 </p>

      <h2 className={h2}>Database Hosting on Free Tiers</h2>
      <p>
 Many portfolio apps need a database. Free tiers from Neon, Supabase, or Railway work well for demos. They give you Postgres without running your own server. The catch is idle timeouts. Free database instances pause after a week of no traffic, just like sleeping containers.
 </p>
      <p>
 Warm your database before you send links to recruiters. Open the app yourself the morning you apply. Run a query that hits the database so the connection pool wakes up. A recruiter who sees a five second spinner on first load may never wait for the second page.
 </p>
      <p>
 Store only demo data on free tiers. Never put real user information on a hobby project database. Use environment variables for connection strings and rotate credentials if you ever expose them by mistake.
 </p>

      <h2 className={h2}>Pre-Launch Checklist for Shared Links</h2>
      <p>
 Before you paste a project URL into an application, run through a short checklist. Open the link in a private browser window with no cached login. Confirm guest access works. Click every navigation item. Submit one form if your app has forms.
 </p>
      <p>
 Check mobile layout on a phone as well as your laptop. Many recruiters review candidates on commutes. Broken responsive design looks worse than a missing feature.
 </p>
      <p>
 Verify HTTPS and that your custom domain resolves worldwide. A link that works on your home network but fails on corporate DNS will cost you interviews. Fix DNS before you send, not after a recruiter reports a blank page.
 </p>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/link" className={link}>Sending Your CV as a Web Link Instead of a PDF File</Link></li>
        <li><Link href="/top" className={link}>Best Things to Put at the Top of Your Profile</Link></li>
        <li><Link href="/projects" className={link}>Best Personal Projects to Put on a Software CV</Link></li>
      </ul>
    </div>
  );
}
