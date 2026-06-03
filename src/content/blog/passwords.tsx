import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="flex flex-col gap-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>A senior backend developer spent eighteen months redesigning a legacy payment system that processed millions of dollars. They want to show this work to prospective employers to prove their architectural capabilities. However their employment contract contains a strict non-disclosure agreement that forbids public sharing. They must find a way to prove their skills without triggering a lawsuit.</p>

      <p>Sharing proprietary code on a public portfolio can get you blacklisted from the industry. Yet hiding all your best achievements makes your profile look weak to hiring managers. Password-protecting specific portfolio sections solves this dilemma by securing sensitive details.</p>

      <p>Any security barrier you add will create reading friction for busy recruiters. If a recruiter has to request access or sign up for an account they will skip your project entirely. You must implement protection methods that keep access simple and fast.</p>

      <h2 className={h2}>The Non-Disclosure Dilemma for Engineers</h2>
      <p>Hiring managers want to see real production systems rather than simple toy projects. They want to know how you handle system load and manage complex database transactions. Unfortunately the details of these systems are almost always corporate property.</p>

      <p>Password-protecting your project pages allows you to share sanitized details with serious employers. You can restrict access to verified recruiters and hiring managers who receive the password in your application email. This shields your work from public scrapers and search engines.</p>

      <p>Before putting any protected project online you must sanitize the content. Remove all company names and database credentials from your screenshots and code samples. Focus on the architectural patterns rather than proprietary business logic.</p>

      <div className={callout}>
        <h3 className={h3}>Keep the Law in Mind</h3>
        <p>Password protection does not automatically shield you from all legal liabilities. It only reduces the risk of public exposure. Never upload raw proprietary code or sensitive customer details even behind a password barrier.</p>
      </div>

      <h2 className={h2}>Static Page Encryption Methods</h2>
      <p>If you host your portfolio on a static site generator you can encrypt your page files directly. This approach does not require a database or a running server. The browser decrypts the page content locally using a key provided by the user.</p>

      <p>You can use simple build tools that compile your HTML files into encrypted scripts. The reader arrives at a clean login prompt where they type the password. If the password matches the page content decrypts instantly.</p>

      <p>This method keeps your hosting costs at zero while securing your projects. It is incredibly easy to set up on static deployment networks. The downside is that anyone with the password can share it which means you have less control over access.</p>

      <p>Ensure that your static encryption does not slow down the browser rendering process. Keep the scripts lightweight and handle incorrect passwords gracefully. A slow decryption step looks like a broken site to the reader.</p>

      <h2 className={h2}>Server-Less Token Based Access</h2>
      <p>A great way to reduce recruiter friction is to use token-based URLs. Instead of forcing managers to type a password you can include the credentials directly inside the link query parameters. The page reads the token and validates access automatically.</p>

      <p>When you send your web CV to a company you provide a custom link. The link contains a unique search parameter that unlocks the project page. The recruiter clicks the URL and views your work with zero typing required.</p>

      <p>This approach gives you complete control over who views your work. You can generate different tokens for different applications and track which companies actually click the links. You can also revoke specific tokens after your application process finishes.</p>

      {/* SVG Diagram: Three access control strategies compared */}
      <div className="not-prose my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 400" className="w-full h-auto" role="img" aria-label="Comparison of three portfolio access control methods: static encryption, token URLs, and server authentication">
          <style>{`
            .pw-title { font: 600 12px system-ui, sans-serif; }
            .pw-label { font: 500 10px system-ui, sans-serif; }
            .pw-small { font: 400 9px system-ui, sans-serif; }
            .pw-code { font: 500 9px 'SF Mono', 'Fira Code', monospace; }
            .pw-badge { font: 700 8px system-ui, sans-serif; letter-spacing: 0.05em; }
          `}</style>

          {/* Column 1: Static Encryption */}
          <text x="115" y="22" textAnchor="middle" className="pw-title fill-amber-600 dark:fill-amber-400">Static Encryption</text>
          <text x="115" y="36" textAnchor="middle" className="pw-badge fill-zinc-400 dark:fill-zinc-500">ZERO SERVER COST</text>

          <rect x="15" y="48" width="200" height="330" rx="8" className="fill-zinc-50 dark:fill-zinc-800/40 stroke-amber-200 dark:stroke-amber-800" strokeWidth="1.5" />

          {/* Password prompt mock */}
          <rect x="30" y="64" width="170" height="100" rx="6" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
          <text x="115" y="82" textAnchor="middle" className="pw-label fill-zinc-900 dark:fill-zinc-100">🔒 Protected Project</text>
          <text x="115" y="98" textAnchor="middle" className="pw-small fill-zinc-500 dark:fill-zinc-400">Enter password to view</text>
          <rect x="45" y="108" width="140" height="20" rx="4" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="55" y="122" className="pw-code fill-zinc-400 dark:fill-zinc-500">••••••••</text>
          <rect x="75" y="134" width="80" height="20" rx="4" className="fill-amber-100 dark:fill-amber-900/30 stroke-amber-300 dark:stroke-amber-700" strokeWidth="1" />
          <text x="115" y="148" textAnchor="middle" className="pw-badge fill-amber-700 dark:fill-amber-300">DECRYPT</text>

          {/* How it works */}
          <text x="30" y="188" className="pw-badge fill-zinc-500 dark:fill-zinc-400">HOW IT WORKS</text>
          <text x="30" y="204" className="pw-small fill-zinc-600 dark:fill-zinc-400">1. HTML encrypted at build time</text>
          <text x="30" y="218" className="pw-small fill-zinc-600 dark:fill-zinc-400">2. Browser decrypts client-side</text>
          <text x="30" y="232" className="pw-small fill-zinc-600 dark:fill-zinc-400">3. No server required</text>

          {/* Pros/Cons */}
          <text x="30" y="258" className="pw-badge fill-emerald-600 dark:fill-emerald-400">PROS</text>
          <text x="30" y="272" className="pw-small fill-zinc-600 dark:fill-zinc-400">✓ Free hosting (GitHub Pages)</text>
          <text x="30" y="286" className="pw-small fill-zinc-600 dark:fill-zinc-400">✓ No backend needed</text>

          <text x="30" y="310" className="pw-badge fill-red-500 dark:fill-red-400">CONS</text>
          <text x="30" y="324" className="pw-small fill-zinc-600 dark:fill-zinc-400">✗ Password can be shared</text>
          <text x="30" y="338" className="pw-small fill-zinc-600 dark:fill-zinc-400">✗ Recruiter must type it</text>

          <text x="115" y="365" textAnchor="middle" className="pw-badge fill-amber-600 dark:fill-amber-400">FRICTION: MEDIUM</text>

          {/* Column 2: Token URLs */}
          <text x="350" y="22" textAnchor="middle" className="pw-title fill-emerald-600 dark:fill-emerald-400">Token-Based URL</text>
          <text x="350" y="36" textAnchor="middle" className="pw-badge fill-zinc-400 dark:fill-zinc-500">ZERO FRICTION ACCESS</text>

          <rect x="250" y="48" width="200" height="330" rx="8" className="fill-emerald-50/50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1.5" />

          {/* URL bar mock */}
          <rect x="265" y="64" width="170" height="100" rx="6" className="fill-white dark:fill-zinc-900 stroke-emerald-200 dark:stroke-emerald-700" strokeWidth="1" />
          <rect x="275" y="74" width="150" height="16" rx="3" className="fill-zinc-100 dark:fill-zinc-800" />
          <text x="280" y="85" className="pw-code fill-zinc-500 dark:fill-zinc-400">portfolio.dev/work</text>
          <text x="280" y="100" className="pw-code fill-emerald-600 dark:fill-emerald-400">?token=f8a2c9e1</text>
          <text x="350" y="120" textAnchor="middle" className="pw-label fill-zinc-900 dark:fill-zinc-100">Project loads instantly</text>
          <text x="350" y="134" textAnchor="middle" className="pw-small fill-zinc-500 dark:fill-zinc-400">Recruiter clicks → sees work</text>
          <rect x="310" y="140" width="80" height="16" rx="3" className="fill-emerald-100 dark:fill-emerald-900/30" />
          <text x="350" y="152" textAnchor="middle" className="pw-badge fill-emerald-700 dark:fill-emerald-300">✓ VERIFIED</text>

          {/* How it works */}
          <text x="265" y="188" className="pw-badge fill-zinc-500 dark:fill-zinc-400">HOW IT WORKS</text>
          <text x="265" y="204" className="pw-small fill-zinc-600 dark:fill-zinc-400">1. Generate unique token per app</text>
          <text x="265" y="218" className="pw-small fill-zinc-600 dark:fill-zinc-400">2. Embed token in URL you send</text>
          <text x="265" y="232" className="pw-small fill-zinc-600 dark:fill-zinc-400">3. Page validates on load</text>

          {/* Pros/Cons */}
          <text x="265" y="258" className="pw-badge fill-emerald-600 dark:fill-emerald-400">PROS</text>
          <text x="265" y="272" className="pw-small fill-zinc-600 dark:fill-zinc-400">✓ Zero typing for recruiter</text>
          <text x="265" y="286" className="pw-small fill-zinc-600 dark:fill-zinc-400">✓ Track who views your work</text>

          <text x="265" y="310" className="pw-badge fill-red-500 dark:fill-red-400">CONS</text>
          <text x="265" y="324" className="pw-small fill-zinc-600 dark:fill-zinc-400">✗ Links can be forwarded</text>
          <text x="265" y="338" className="pw-small fill-zinc-600 dark:fill-zinc-400">✗ Needs simple server logic</text>

          <text x="350" y="365" textAnchor="middle" className="pw-badge fill-emerald-600 dark:fill-emerald-400">FRICTION: LOWEST ★</text>

          {/* Column 3: Server Auth */}
          <text x="585" y="22" textAnchor="middle" className="pw-title fill-violet-600 dark:fill-violet-400">Server Authentication</text>
          <text x="585" y="36" textAnchor="middle" className="pw-badge fill-zinc-400 dark:fill-zinc-500">FULL ACCESS CONTROL</text>

          <rect x="485" y="48" width="200" height="330" rx="8" className="fill-violet-50/50 dark:fill-violet-950/20 stroke-violet-200 dark:stroke-violet-800" strokeWidth="1.5" />

          {/* Login form mock */}
          <rect x="500" y="64" width="170" height="100" rx="6" className="fill-white dark:fill-zinc-900 stroke-violet-200 dark:stroke-violet-700" strokeWidth="1" />
          <text x="585" y="82" textAnchor="middle" className="pw-label fill-zinc-900 dark:fill-zinc-100">Request Access</text>
          <rect x="515" y="90" width="140" height="16" rx="3" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="520" y="102" className="pw-code fill-zinc-400 dark:fill-zinc-500">work email</text>
          <rect x="515" y="112" width="140" height="16" rx="3" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="520" y="124" className="pw-code fill-zinc-400 dark:fill-zinc-500">company name</text>
          <rect x="545" y="134" width="80" height="20" rx="4" className="fill-violet-100 dark:fill-violet-900/30 stroke-violet-300 dark:stroke-violet-700" strokeWidth="1" />
          <text x="585" y="148" textAnchor="middle" className="pw-badge fill-violet-700 dark:fill-violet-300">SIGN IN</text>

          {/* How it works */}
          <text x="500" y="188" className="pw-badge fill-zinc-500 dark:fill-zinc-400">HOW IT WORKS</text>
          <text x="500" y="204" className="pw-small fill-zinc-600 dark:fill-zinc-400">1. Recruiter requests access</text>
          <text x="500" y="218" className="pw-small fill-zinc-600 dark:fill-zinc-400">2. You approve or deny</text>
          <text x="500" y="232" className="pw-small fill-zinc-600 dark:fill-zinc-400">3. Time-limited session</text>

          {/* Pros/Cons */}
          <text x="500" y="258" className="pw-badge fill-emerald-600 dark:fill-emerald-400">PROS</text>
          <text x="500" y="272" className="pw-small fill-zinc-600 dark:fill-zinc-400">✓ Full audit trail</text>
          <text x="500" y="286" className="pw-small fill-zinc-600 dark:fill-zinc-400">✓ Revoke access anytime</text>

          <text x="500" y="310" className="pw-badge fill-red-500 dark:fill-red-400">CONS</text>
          <text x="500" y="324" className="pw-small fill-zinc-600 dark:fill-zinc-400">✗ High friction for recruiters</text>
          <text x="500" y="338" className="pw-small fill-zinc-600 dark:fill-zinc-400">✗ Needs server + database</text>

          <text x="585" y="365" textAnchor="middle" className="pw-badge fill-violet-600 dark:fill-violet-400">FRICTION: HIGHEST</text>

          {/* Vertical dividers */}
          <line x1="235" y1="15" x2="235" y2="385" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="470" y1="15" x2="470" y2="385" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      <h2 className={h2}>Designing the Security Interface</h2>
      <p>The login screen for your protected projects must look highly professional. Avoid confusing templates that look like standard administration portals. A simple clean interface builds immediate trust with the reader.</p>

      <p>Provide a short introductory message on the lock screen. Explain that the project contains proprietary architecture built under strict confidentiality agreements. This explanation frames you as a responsible professional who respects legal boundaries.</p>

      <p>Place the password input field in the center of the screen with clear focus. Add a simple toggle that lets users reveal the characters they type to avoid input errors. Keep the submit button large and easy to click.</p>

      <p>If the user enters an incorrect password show a polite error message. Do not lock them out after a few failed attempts. Recruiters are busy and might easily mistype the password you provided.</p>

      <h2 className={h2}>Sanitized System Diagrams as an Alternative</h2>
      <p>If you cannot use password protection you should write sanitized case studies. You can describe the system challenges without mentioning any proprietary details. Rewrite your architecture diagrams to use generic labels.</p>

      <p>Instead of naming your specific employer refer to them by their industry and scale. You can state that you built a system for a top regional retail company. This provides scale context without exposing corporate details.</p>

      <p>Focus your text on the engineering problems and how you solved them. Discuss the performance metrics you achieved like reducing latency by fifty percent. These details prove your capabilities without revealing secret data.</p>

      <p>This approach allows you to keep your entire portfolio public. It removes all login barriers for recruiters and increases page views. It is often the safest path for developers who want to avoid legal gray zones.</p>

      <h2 className={h2}>Preparing for Technical Review Discussions</h2>
      <p>Securing your portfolio projects is only the first step. You must be ready to discuss the technical details during live interviews. The recruiter will ask you to explain your architectural choices in detail.</p>

      <p>Prepare a clean presentation deck that you can share during a video call. This deck should contain the deep technical diagrams that you left off your public website. You can present these details in a secure environment directly to the team.</p>

      <p>Be ready to discuss the trade-offs of your designs. Explain why you chose specific database models or scaling strategies. This live discussion proves you actually built the systems you claim.</p>

      <p>Practice presenting your work without relying on corporate code. You should be able to explain your system designs using simple sketches on a virtual whiteboard. Whiteboard fluency is highly valued by engineering managers.</p>

      <h2 className={h2}>Read Next</h2>
      <p>For more advice on protecting your data and managing software contracts read these detailed guides.</p>
      
      <p>
        Learn how to handle remote employment terms by reading <Link href="/contracts" className={link}>Best Methods to Negotiate Remote Software Contracts</Link>.
      </p>
      <p>
        Understand how to gather feedback on your work by reading <Link href="/feedback" className={link}>Best Ways to Request Portfolio Feedback from Senior Engineers</Link>.
      </p>
      <p>
        Discover how to host your personal projects securely by reading <Link href="/hosting" className={link}>Best Practices for Hosting Personal Projects for Job Hunts</Link>.
      </p>
    </div>
  );
}
