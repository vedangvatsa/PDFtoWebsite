import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="flex flex-col gap-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>A designer spends three weeks building custom scroll animations and importing heavy three-dimensional models onto their portfolio. A hiring manager clicks the link while riding on a train with a weak mobile signal. The site loading spinner spins for seven seconds before the manager gets bored and closes the tab. The developer never gets a response because their page did not load fast enough.</p>

      <p>Performance is the most important feature of any web profile. If your portfolio takes more than two seconds to load on a mobile device you will lose half your potential visitors. High-quality design is completely useless if the target audience does not wait around to see it.</p>

      <p>Optimizing page speed is not just about making things fast for recruiters. It is also an active demonstration of your front-end engineering capabilities. A fast loading portfolio proves you care about user experience and understand web standards.</p>

      <h2 className={h2}>Target Load Times for Modern Portfolios</h2>
      <p>You must aim for a Largest Contentful Paint of under one point five seconds. This metric measures when the main content of your page becomes visible to the reader. Anything slower than two seconds triggers immediate reader fatigue.</p>

      <p>Recruiters often review portfolios on their phones between meetings. They do not have fast office fiber connections when they skim profiles. They rely on cellular networks that struggle with heavy assets and large JavaScript files.</p>

      <p>Test your site performance using mobile device emulation. Do not assume your page is fast just because it loads instantly on your local developer machine. A fast local host does not represent real-world network latency.</p>

      <div className={callout}>
        <h3 className={h3}>Measure the Real Metrics</h3>
        <p>Use PageSpeed Insights to test your site performance under simulated mobile conditions. Pay close attention to the blocking time and cumulative layout shift. These metrics show how stable and fast your page feels to a human reader.</p>
      </div>

      <h2 className={h2}>Optimizing Your Web Images</h2>
      <p>Unoptimized images are the single biggest cause of slow portfolios. Candidates often upload giant raw photos directly from their cameras. These files can easily exceed five megabytes and take ages to download.</p>

      <p>Always compress your images before uploading them to your server. Use modern formats like WebP or AVIF instead of legacy formats like JPEG. These modern formats offer superior compression ratios and preserve image details.</p>

      <p>Provide multiple image sizes for different screens. A mobile screen does not need to load a massive desktop image. Use responsive image attributes to let the browser select the best size for the current device.</p>

      <p>Use simple CSS placeholders while your main images are loading. This prevents layout shifts and gives the reader immediate visual feedback. A stable loading process feels much faster than a jumpy page.</p>

      <h2 className={h2}>Reducing JavaScript Payload</h2>
      <p>JavaScript is the most expensive asset you can send to a browser. Unlike images which render as they download JavaScript must be parsed and executed before the page becomes interactive. Large bundles block the main thread and freeze the screen.</p>

      <p>Avoid importing heavy libraries for simple interactive tasks. If you only need a simple modal do not import a massive UI framework. Write native JavaScript to keep your bundle size small.</p>

      <p>Use code splitting to divide your code into smaller chunks. Load only the essential scripts needed for the initial render. Defer the loading of complex interactive widgets until the user actually needs them.</p>

      <p>Analyze your bundle size regularly to identify bloating dependencies. Modern build tools provide visual maps of your code packages. Remove unused modules and replace heavy packages with lighter alternatives.</p>

      {/* SVG Diagram showing Performance Optimization Pipeline */}
      <div className="not-prose my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Diagram of Web Performance Optimization Stages">
          <rect width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-900/30" />
          
          {/* Step 1 */}
          <rect x="30" y="140" width="160" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" />
          <text x="110" y="175" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-100 font-semibold" fontSize="13">Raw Assets</text>
          <text x="110" y="195" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="11">Large images & scripts</text>

          {/* Connection 1 */}
          <line x1="190" y1="175" x2="250" y2="175" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
          <text x="242" y="180" className="fill-zinc-400 dark:fill-zinc-500 font-semibold" fontSize="16">→</text>

          {/* Step 2 */}
          <rect x="260" y="140" width="180" height="70" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" />
          <text x="350" y="175" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-100 font-semibold" fontSize="13">Compression Pipeline</text>
          <text x="350" y="195" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="11">WebP conversion & splitting</text>

          {/* Connection 2 */}
          <line x1="440" y1="175" x2="500" y2="175" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
          <text x="492" y="180" className="fill-zinc-400 dark:fill-zinc-500 font-semibold" fontSize="16">→</text>

          {/* Step 3 */}
          <rect x="510" y="140" width="160" height="70" rx="6" className="fill-emerald-50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-900" strokeWidth="2" />
          <text x="590" y="175" textAnchor="middle" className="fill-emerald-900 dark:fill-emerald-300 font-semibold" fontSize="13">Fast Page Load</text>
          <text x="590" y="195" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400" fontSize="11">Under 1.5s mobile LCP</text>
        </svg>
      </div>

      <h2 className={h2}>Static Site Generation Wins for Portfolios</h2>
      <p>Using complex server rendering for a personal portfolio is unnecessary. Portfolios do not change every minute and do not require real-time server calculations. Static site generation is the best rendering strategy for developer profiles.</p>

      <p>Static generators build your HTML files during the deployment step. When a user requests your page the server sends pre-rendered files instantly. This removes server computation time and reduces the time to first byte.</p>

      <p>Static files are also incredibly cheap to host. You can deploy your entire site to a global content delivery network for free. This ensures your portfolio loads fast for recruiters regardless of their geographic location.</p>

      <p>If you need dynamic elements like contact forms use API endpoints or third-party service integrations. This keeps your main page static and fast while allowing essential interactions. Do not sacrifice basic load speed for unnecessary database calls.</p>

      <h2 className={h2}>CDN Deployment and Edge Caching</h2>
      <p>Hosting your portfolio on a single server in one country causes high latency for international recruiters. A developer in Europe will experience slow loads if your server is based in America. A content delivery network solves this problem by caching your files worldwide.</p>

      <p>CDNs distribute your static files across hundreds of servers globally. When a recruiter clicks your link they download the assets from the closest physical server. This minimizes network travel distance and decreases latency.</p>

      <p>Configure long-term cache headers for your static assets. Things like logos and styling files do not change often and should remain in the browser cache. This makes subsequent page loads near instantaneous for the reader.</p>

      <p>Choose deployment platforms that offer automatic CDN configuration. Most modern developer platforms handle edge caching out of the box with zero setup. This lets you focus on building features rather than managing server networks.</p>

      <h2 className={h2}>Avoiding Common Optimization Mistakes</h2>
      <p>Many developers make the mistake of using heavy web fonts. Loading four different weights of a custom font can delay text rendering for seconds. Use standard system fonts or limit custom font weights to keep page loading fast.</p>

      <p>Avoid using giant video backgrounds on your homepage. If you must use video ensure it is compressed and lazy-loaded. Never start video downloads before the main content has finished rendering.</p>

      <p>Do not use heavy analytical scripts that track every mouse movement. These tools inject heavy tracking codes that block the main thread and slow down interactions. Use lightweight analytics that prioritize reader speed.</p>

      <p>Review your site speed after every major update. It is easy for a new component or image to slow down your page. Keep your optimization steps integrated into your build process to catch issues early.</p>

      <h2 className={h2}>Read Next</h2>
      <p>For more advice on building fast and reliable developer portfolios read these detailed guides.</p>
      
      <p>
        Learn how to choose the right static site generator by reading <Link href="/blog/ssg" className={link}>Best Static Site Generators for Developer Portfolios</Link>.
      </p>
      <p>
        Discover the best hosting options for your projects by reading <Link href="/blog/hosting" className={link}>Best Practices for Hosting Personal Projects for Job Hunts</Link>.
      </p>
      <p>
        Explore top platforms for hosting your profile by reading <Link href="/blog/portfolio" className={link}>Best Portfolio Platforms for Developers</Link>.
      </p>
    </div>
  );
}
