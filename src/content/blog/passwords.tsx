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

      {/* SVG Diagram showing Token Authentication Flow */}
      <div className="not-prose my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Diagram of Token-Based Portfolio Project Access">
          <rect width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-900/30" />
          
          {/* Box 1 */}
          <rect x="40" y="140" width="160" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" />
          <text x="120" y="175" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-100 font-semibold" fontSize="13">Hiring Link</text>
          <text x="120" y="195" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="11">portfolio.com?token=abc</text>

          {/* Connection 1 */}
          <line x1="200" y1="175" x2="260" y2="175" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
          <text x="252" y="180" className="fill-zinc-400 dark:fill-zinc-500 font-semibold" fontSize="16">→</text>

          {/* Box 2 */}
          <rect x="270" y="140" width="160" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" />
          <text x="350" y="175" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-100 font-semibold" fontSize="13">Token Validation</text>
          <text x="350" y="195" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="11">Checks URL parameters</text>

          {/* Connection 2 */}
          <line x1="430" y1="175" x2="490" y2="175" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
          <text x="482" y="180" className="fill-zinc-400 dark:fill-zinc-500 font-semibold" fontSize="16">→</text>

          {/* Box 3 */}
          <rect x="500" y="140" width="160" height="70" rx="6" className="fill-emerald-50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-900" strokeWidth="2" />
          <text x="580" y="175" textAnchor="middle" className="fill-emerald-900 dark:fill-emerald-300 font-semibold" fontSize="13">Revealed Project</text>
          <text x="580" y="195" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400" fontSize="11">Loads system diagram</text>
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
        Learn how to handle remote employment terms by reading <Link href="/blog/contracts" className={link}>Best Methods to Negotiate Remote Software Contracts</Link>.
      </p>
      <p>
        Understand how to gather feedback on your work by reading <Link href="/blog/feedback" className={link}>Best Ways to Request Portfolio Feedback from Senior Engineers</Link>.
      </p>
      <p>
        Discover how to host your personal projects securely by reading <Link href="/blog/hosting" className={link}>Best Practices for Hosting Personal Projects for Job Hunts</Link>.
      </p>
    </div>
  );
}
