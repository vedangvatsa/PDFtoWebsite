import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        Designers who send flat PDF files when applying for jobs are missing a major opportunity. A PDF is static and silent. It does not show how you handle hover states, layout transitions, or user flows. If you are a UI or UX designer, your application is a reflection of your work.
      </p>
      <p>
        An interactive resume allows you to show off your design system in a living environment. It proves you understand how code and design work together. It demonstrates your ability to build accessible, responsive interfaces that work on any screen size. This guide covers how to design and build an interactive profile that gets you hired.
      </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Static PDF versus interactive web layout comparison for UI UX designers">
          <rect x="0" y="0" width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-950" />
          <text x="350" y="30" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100 font-bold text-sm">Static PDF vs Interactive Web Layout</text>
          
          {/* Static PDF */}
          <rect x="40" y="60" width="280" height="250" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="180" y="85" textAnchor="middle" className="fill-red-500 font-semibold text-xs">Static PDF File</text>
          
          <rect x="60" y="110" width="240" height="90" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" />
          <rect x="75" y="125" width="210" height="6" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
          <rect x="75" y="140" width="180" height="4" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
          <rect x="75" y="152" width="190" height="4" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
          <rect x="75" y="164" width="150" height="4" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

          <rect x="80" y="225" width="200" height="60" rx="6" className="fill-red-50 dark:fill-red-950/20 stroke-red-200 dark:stroke-red-900" />
          <text x="180" y="243" textAnchor="middle" className="fill-red-600 dark:fill-red-400 text-[10px] font-semibold">Low Engagement</text>
          <text x="180" y="258" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">No animations, no hover states</text>
          <text x="180" y="271" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Just plain text on a white sheet</text>

          {/* Interactive Profile */}
          <rect x="380" y="60" width="280" height="250" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="520" y="85" textAnchor="middle" className="fill-emerald-500 font-semibold text-xs">Interactive Web Page</text>
          
          <rect x="400" y="110" width="240" height="90" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          {/* Animated Header Mockup */}
          <rect x="415" y="125" width="100" height="8" rx="2" className="fill-zinc-400 dark:fill-zinc-600" />
          <circle cx="615" cy="129" r="8" className="fill-emerald-500" />
          
          {/* Interactive Button */}
          <rect x="415" y="145" width="80" height="20" rx="4" className="fill-emerald-100 dark:fill-emerald-950/40 stroke-emerald-500" strokeWidth="1" />
          <text x="455" y="157" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[8px] font-semibold">Try Prototype</text>
          
          {/* Micro-interaction highlight */}
          <rect x="415" y="175" width="210" height="15" rx="3" className="fill-zinc-50 dark:fill-zinc-850 stroke-zinc-200 dark:stroke-zinc-700" />
          <text x="422" y="186" className="fill-zinc-500 dark:fill-zinc-400 text-[8px]">Hover on cards to trigger transitions</text>

          <rect x="420" y="225" width="200" height="60" rx="6" className="fill-emerald-50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-900" />
          <text x="520" y="243" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[10px] font-semibold">High Engagement</text>
          <text x="520" y="258" textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-300 text-[9px] font-medium">Showcases real system interactions</text>
          <text x="520" y="271" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[8px]">Demonstrates frontend coding capability</text>
        </svg>
      </div>

      <h2 className={h2}>Why Static Files Limit Designers</h2>
      <p>
        A static document cannot show how an interface responds to user inputs. You cannot demonstrate form validation behaviors. You cannot show how a side panel slides open, or how a card transitions on hover. These details are the core of modern user experience design.
      </p>
      <p>
        By using a static format, you force hiring managers to read about your designs instead of feeling them. A live page, however, acts as an active demonstration of your product thinking.
      </p>
      <p>
        Building a web profile proves you can write clean HTML and CSS. Many companies value designers who can bridge the gap between design tools and frontend code. If you can build the layouts you design, you become twice as valuable to a product team.
      </p>
      <p>
        A web link is also easier to share. Hiring managers can check your profile on their phones during a meeting. A PDF often looks cramped and unreadable on small screens.
      </p>
      <p>
        Beyond that, flat documents limit your ability to show your design systems in action. In modern product development, designers do not just create static mockups. They build reusable component libraries and define token systems. An interactive page allows you to show these systems working in code, proving you can collaborate effectively with developers.
      </p>

      <h2 className={h2}>Core Sections of a Designer Web Profile</h2>
      <p>
        Your interactive resume should have a structured layout that prioritizes readability. The header must state your role and your design philosophy in a single clear sentence. Avoid using vague jargon.
      </p>
      <p>
        The main section must feature your case studies. Do not just upload final polished screens. Show the progression of your design process. Explain the research steps, the initial wireframes, the user tests, and the final outcomes.
      </p>
      <p>
        Include a section that highlights your design system work. Show your typography choices, spacing rules, and color palettes. This proves you design with consistency and build systems that scale.
      </p>
      <p>
        Finally, add a section with embedded Figma files or interactive prototypes. This allows recruiters to click through your workflows without leaving your page. It shows you build logical, intuitive user paths.
      </p>
      <p>
        Do not forget to write about user outcomes. A beautiful interface is meaningless if users cannot achieve their goals. For each case study, explain how your design choices affected key product metrics. Did sign-up conversion rates increase? Did task completion times decrease? Sharing these numbers proves you design for business results rather than just visual appeal. This approach makes your case studies much more convincing to product managers. It shows you think about the business, not just the pixels.
      </p>

      <div className={callout}>
        <h3 className={h3}>Keep the layout clean</h3>
        <p>
          Do not make your page complex. Use a single column format for your text. Ensure there is plenty of whitespace between sections. A cluttered layout looks unprofessional and hurts the user experience.
        </p>
      </div>

      <h2 className={h2}>Designing with Micro-interactions</h2>
      <p>
        Subtle animations can make your web page feel alive and polished. You can use hover states on cards, smooth scrolls when clicking navigation links, and simple fade transitions.
      </p>
      <p>
        However, you must avoid over-animating. Too many moving elements are distracting. If text blocks fly in from all directions, they become hard to read.
      </p>
      <p>
        Use animations only to guide the reader&apos;s eye. A slight color shift on a button shows it is clickable. A smooth expansion of a text box reveals more details without page reloads. Keep all transitions under three hundred milliseconds to ensure they feel fast and responsive.
      </p>
      <p>
        Make sure your page load speed is fast. Large image files can slow down your site. Optimize your screenshots and design assets. Having a slow page is a major user experience failure.
      </p>
      <p>
        Recruiters will close the tab if your images take ages to load. A fast site shows you respect the user&apos;s time.
      </p>

      <h2 className={h2}>Accessibility is Not Optional</h2>
      <p>
        As a designer, you must build products that everyone can use. This rule applies to your personal profile page as well. An inaccessible site proves you do not understand UX principles.
      </p>
      <p>
        Ensure your text has proper color contrast. Dark grey text on a slightly lighter grey background is hard to read. Use high contrast colors that are easy on the eyes.
      </p>
      <p>
        Make your site keyboard friendly. A user should be able to move through all links using only the tab key. Provide clear focus indicators on active elements.
      </p>
      <p>
        Add alternative text descriptions to all your project images. This allows screen readers to describe your designs to visually impaired users. Designing with accessibility in mind shows you care about all users.
      </p>

      <h2 className={h2}>Testing Your Interactive Profile</h2>
      <p>
        Before you send your link to companies, test it thoroughly. Open your page on different web browsers. A layout that looks perfect in Chrome might look broken in Safari or Firefox. Test all clickable elements to ensure they respond correctly.
      </p>
      <p>
        Ask a friend to look at your site. Watch them interact with it. Do they know where to click? Do they understand what your projects are about? Observing a real user will highlight usability issues you might have missed.
      </p>
      <p>
        Similarly, check your loading speeds. You can use free web tools to audit your page speed. If your images are too large, compress them. A fast loading site is key to keeping busy recruiters on your page.
      </p>

      <h2 className={h2}>How to Host and Share Your Work</h2>
      <p>
        Once your interactive profile is ready, you need a reliable hosting platform. You can use services like Vercel or Netlify to publish your code for free. They connect to your GitHub repository and build your site automatically.
      </p>
      <p>
        Buy a custom domain to make your link look professional. A clean URL is easy to share in emails and message pitches.
      </p>
      <p>
        Having a single web link is the best way to get noticed by design leaders. Read about <Link href="/link" className={link}>why sharing a web link is better than sending a static file</Link> for your job search.
      </p>
      <p>
        If you want to ensure your web page looks great on mobile, check out our guide on <Link href="/mobile" className={link}>making your CV mobile friendly</Link> to improve your mobile layout.
      </p>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/link" className={link}>Sharing a Live Web Link Instead of a Flat PDF File</Link></li>
        <li><Link href="/mobile" className={link}>Why Your CV Must Be Mobile Responsive</Link></li>
        <li><Link href="/portfolio" className={link}>Best Portfolio Platforms for Developers and Designers</Link></li>
      </ul>
    </div>
  );
}
