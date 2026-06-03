import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>A software engineer sat down to build a new portfolio website. They wanted to show off their skills. They spent three weeks setting up a custom Node.js server. They configured a PostgreSQL database. They added user authentication. They spent late nights debugging container configurations. When they finally launched the site it took three seconds to load. A week later the database crashed because of a bad update. The site went offline right when a recruiter was trying to view it.</p>

      <p>This is a classic developer mistake. You build a complex system when you only need to show a simple page of text and links. You treat your portfolio like a startup product. You add servers databases and APIs. This adds latency. It adds security risks. It adds monthly hosting costs. Worst of all it creates multiple points of failure for a page that should never go down.</p>

      <p>If you want a professional web presence you should use a static site generator. These tools build your site into flat HTML CSS and Javascript files. You do not need a database. You do not need a server. Your site becomes a set of static assets that you can host for free on a global content delivery network. It loads in milliseconds. It never crashes. It is the most reliable way to display your work to employers.</p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Visual representation of static site generation versus database rendering">
          {/* Background grid */}
          <rect width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1" />
          
          {/* Top Half - Complex Server Architecture */}
          <rect x="25" y="25" width="650" height="135" rx="6" className="fill-red-50/30 dark:fill-red-950/10 stroke-red-200 dark:stroke-red-900/40" />
          <text x="40" y="50" className="fill-red-600 dark:fill-red-400 font-bold text-xs" fontFamily="system-ui, sans-serif">RUNTIME ARCHITECTURE (SLOW AND BRITTLE)</text>
          
          {/* Server Flow */}
          <text x="80" y="95" className="fill-zinc-700 dark:fill-zinc-300 font-bold text-xs" fontFamily="system-ui, sans-serif">User Request</text>
          <line x1="160" y1="90" x2="210" y2="90" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
          <polygon points="210,87 218,90 210,93" className="fill-zinc-400 dark:fill-zinc-500" />
          
          <rect x="230" y="70" width="80" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="270" y="94" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-200 text-xs font-semibold" fontFamily="system-ui, sans-serif">Web Server</text>
          
          <line x1="320" y1="90" x2="370" y2="90" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
          <polygon points="370,87 378,90 370,93" className="fill-zinc-400 dark:fill-zinc-500" />
          
          <rect x="390" y="70" width="80" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="430" y="94" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-200 text-xs font-semibold" fontFamily="system-ui, sans-serif">Database</text>
          
          <line x1="480" y1="90" x2="530" y2="90" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
          <polygon points="530,87 538,90 530,93" className="fill-zinc-400 dark:fill-zinc-500" />
          
          <text x="550" y="95" className="fill-zinc-700 dark:fill-zinc-300 font-bold text-xs" fontFamily="system-ui, sans-serif">HTML Render</text>

          {/* Bottom Half - Static Architecture */}
          <rect x="25" y="185" width="650" height="135" rx="6" className="fill-emerald-50/30 dark:fill-emerald-950/10 stroke-emerald-200 dark:stroke-emerald-900/40" />
          <text x="40" y="210" className="fill-emerald-600 dark:fill-emerald-400 font-bold text-xs" fontFamily="system-ui, sans-serif">STATIC CDN ARCHITECTURE (FAST & ULTRA-RELIABLE)</text>
          
          {/* Static Flow */}
          <text x="80" y="255" className="fill-zinc-700 dark:fill-zinc-300 font-bold text-xs" fontFamily="system-ui, sans-serif">User Request</text>
          <line x1="160" y1="250" x2="270" y2="250" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
          <polygon points="270,247 278,250 270,253" className="fill-zinc-400 dark:fill-zinc-500" />
          
          <rect x="290" y="230" width="120" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="350" y="254" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-200 text-xs font-semibold" fontFamily="system-ui, sans-serif">Global Edge CDN</text>
          
          <line x1="420" y1="250" x2="530" y2="250" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
          <polygon points="530,247 538,250 530,253" className="fill-zinc-400 dark:fill-zinc-500" />
          
          <text x="550" y="255" className="fill-emerald-600 dark:fill-emerald-400 font-bold text-xs" fontFamily="system-ui, sans-serif">Pre-built HTML</text>
        </svg>
      </div>

      <h2 className={h2}>Why Static Beats Server Side Rendering for Job Seekers</h2>
      <p>When you apply for a job you want to remove all friction. If a recruiter clicks your link they expect it to open instantly. If they have to wait for a spinning wheel they will close the page. Studies show that a one second delay in load time reduces reader satisfaction. For a technical candidate a slow page is a direct reflection of your engineering capability.</p>

      <p>Static sites are fast because there is no computational work happening on the server. When a request comes in the network simply sends the pre-built files to the browser. This process takes milliseconds. You can host these files on edge servers all over the world. This means a manager in London gets the same fast load time as a manager in San Francisco.</p>

      <p>Security is another major benefit. A server rendered site has database ports and administrative log-in screens. These can be attacked. A static site has no database or runtime code. There is nothing to hack. You do not need to spend time updating server packages or database security patches. Once you deploy a static site it stays secure forever.</p>

      <p>Finally static hosting is completely free. Platforms like Vercel Netlify and GitHub Pages do not charge for static sites. You can run your portfolio for years without paying a single dollar. If you want to compare different options you can look at our analysis of <Link href="/portfolio" className={link}>developer portfolio platforms</Link> to find the best fit.</p>

      <h2 className={h2}>Next.js for React Developers</h2>
      <p>Next.js is the most popular framework in the React ecosystem. It is built by Vercel. It is a great choice if you are a frontend developer who already uses React. Next.js supports static exports. You can write your pages using React components and compile them into flat HTML files.</p>

      <p>Next.js is powerful because it lets you mix static and server rendered features. If you want to pull data from a public API at build time you can do that. If you want to write your blog posts in Markdown files Next.js can parse them and build the pages. The framework handles code splitting and image optimization automatically.</p>

      <p>The downside of Next.js is that it can be too heavy for a simple site. It ships a React runtime to the browser. This increases the total size of your page. If you only want to show a single page of text Next.js might be too complex. But if you want to show off your React skills and build interactive components it is a top choice.</p>

      <h2 className={h2}>Astro for Content Focused Sites</h2>
      <p>Astro is a newer static site generator. It has become very popular among web developers. Astro is designed specifically for content rich sites like portfolios and blogs. It uses a novel architecture called islands. This structure lets you write components using React Vue or Svelte but it strips out all the Javascript before shipping the page.</p>

      <p>This means your site is pure HTML by default. It makes Astro sites incredibly fast. The browser does not have to download or run heavy Javascript frameworks. If you need an interactive element like a contact form Astro lets you load Javascript only for that specific component.</p>

      <p>Astro is also very easy to use. It supports Markdown and MDX out of the box. You can write your articles and project details in simple text files. The templating language is very similar to HTML. If you want a fast site but still want to use modern component design Astro is the best tool available today.</p>

      <div className={callout}>
        <h3 className={h3}>The Astro Advantage</h3>
        <p>Astro ships zero Javascript by default. This makes it much faster than Next.js for basic portfolio pages. It supports multiple frontend frameworks in the same project. If you want to show you can write both React and Vue components Astro is the perfect sandbox.</p>
      </div>

      <h2 className={h2}>Hugo for Go Developers and Speed Seekers</h2>
      <p>Hugo is a static site generator written in Go. It is famous for its extreme build speed. If you have a site with thousands of pages Hugo can compile it in less than a second. For a simple portfolio the build time is instantaneous.</p>

      <p>Hugo does not rely on Node.js. You install it as a single binary. It has no complex dependency tree. This means you will never have to deal with broken package updates or security alerts from npm. It is incredibly stable.</p>

      <p>The drawback of Hugo is its templating language. It uses Go templates. This can be difficult to learn if you are used to Javascript. It does not use components like React. You write HTML layouts with special Go tags. But if you want a tool that is fast simple and will work ten years from now without any maintenance Hugo is unmatched.</p>

      <h2 className={h2}>Eleventy for Pure Web Standards</h2>
      <p>Eleventy is a JavaScript static site generator. It is designed to be a simpler alternative to Gatsby or Next.js. It does not force you to use React or any other framework. You can write your templates using plain HTML and your choice of templating languages like Nunjucks or Liquid.</p>

      <p>Eleventy is extremely flexible. It does not ship any client side Javascript. It builds pure static HTML. This gives you total control over the output. It is a great choice if you want to build a site that conforms to clean web standards.</p>

      <p>Because it is written in JavaScript Eleventy is very easy to configure if you are a frontend developer. You can use standard npm packages to build your assets. It is a lightweight tool that stays out of your way and lets you focus on raw HTML and CSS.</p>

      <h2 className={h2}>Selecting Your Domain and Hosting</h2>
      <p>Once you choose your static site generator you need to deploy it. The best workflow is to push your code to GitHub and link it to a hosting platform. Every time you push a change to your main branch the platform will run your build tool and publish the update.</p>

      <p>Vercel is the natural choice for Next.js. Netlify is excellent for Astro and Eleventy. GitHub Pages is a great free option for all static sites. All these platforms provide free SSL certificates and global CDN distribution.</p>

      <p>You should also buy a custom domain name. A professional domain looks much better than a generic subdomain. You can read our advice on <Link href="/domains" className={link}>choosing a domain name for portfolios</Link> to make sure you get a clean address. Once your static site is live on a custom domain you will have a fast secure and permanent home for your professional profile.</p>

      <p>Do not waste time building complex backends for your portfolio. Choose a static site generator. Keep your code simple and your pages fast. A fast static site shows employers that you understand software efficiency and respect their time.</p>
    </div>
  );
}
