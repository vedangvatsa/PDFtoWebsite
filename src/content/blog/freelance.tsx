import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>A freelance software engineer sits down for an interview with a recruiter. The recruiter looks at their profile and notes that they have ten different clients listed in the last two years. The recruiter asks if the engineer was fired from these positions or if there is a reason they cannot hold down a job. The engineer is shocked. They believed their freelance history proved they were in high demand. But the recruiter just saw a messy list of short term gigs.</p>
      
      <p>This is the classic presentation problem that freelancers face. When you list every contract project as a separate job entry you look like an unstable job hopper. The recruiter does not realize you were running your own business. They just see a fragmented timeline with short gaps. You must structure your contracting history to project stability.</p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 300" className="w-full h-auto" role="img" aria-label="Visual comparison of a messy freelance gig list versus a structured project show.">
          <text x="170" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">Messy Gig List (Looks like job hopping)</text>
          
          <rect x="20" y="50" width="300" height="200" rx="6" className="fill-zinc-50 dark:fill-zinc-800/40 stroke-red-200 dark:stroke-red-900/50" strokeWidth="1" />
          
          <text x="35" y="80" fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Client A · Jan 2024 to Mar 2024</text>
          <text x="35" y="95" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Fixed bugs on landing page</text>
          
          <text x="35" y="130" fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Client B · Apr 2024 to Jun 2024</text>
          <text x="35" y="145" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Wrote database scripts</text>
          
          <text x="35" y="180" fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Client C · Jul 2024 to Sep 2024</text>
          <text x="35" y="195" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Built React component</text>
          
          <text x="170" y="235" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">Looks fragmented and temporary</text>
          
          <text x="530" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Structured Project show</text>
          
          <rect x="380" y="50" width="300" height="200" rx="6" className="fill-emerald-50/50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-900/50" strokeWidth="1" />
          
          <text x="395" y="80" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Independent Consultant</text>
          <text x="395" y="98" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Total Tenure · Jan 2024 to Present</text>
          
          <rect x="395" y="115" width="270" height="75" rx="4" className="fill-emerald-100/50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-900/30" strokeWidth="1" />
          <text x="405" y="132" fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">FinTech Dashboard API</text>
          <text x="405" y="150" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Built Go backend processing $10M daily</text>
          <text x="405" y="165" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Tech stack Go · Redis · PostgreSQL</text>
          
          <text x="530" y="235" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Shows expert ownership</text>
          
          <line x1="350" y1="20" x2="350" y2="270" className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      <h2 className={h2}>The Single Umbrella Employer Pattern</h2>
      <p>The best way to format freelance work is to create a single company entry for your contracting business. You can use your LLC name or list your title as Independent Consultant. This umbrella entry covers the entire period you spent freelancing.</p>
      
      <p>By using this format you create a continuous block of employment. The reader sees that you stayed in business for years. The individual projects become details within that block rather than standalone jobs. This layout instantly removes the appearance of job hopping.</p>
      
      <p>It also simplifies your timeline. Instead of explaining five different start and end dates you show one continuous block of professional activity. This makes your career look stable and planned rather than random.</p>

      <h2 className={h2}>How to Describe Contract Projects</h2>
      <p>Under your main consultancy heading you must group your work by project. Treat each major client project like a product entry. Give the project a clear title and list the specific technologies you used.</p>
      
      <p>Focus on the business problem you solved for the client. Do list the coding tasks you finished. Explain why the client hired you and what the outcome was. This shows that you work with a business mindset.</p>

      <p>For example write that you rebuilt a legacy database schema to speed up reports. Mention that this change reduced customer wait times. This proves that you brought real value to the client organization during your short contract.</p>

      <div className={callout}>
        <h3 className={h3}>The Project Focus</h3>
        <p>Look at your project descriptions. If they read like a list of instructions from a project manager rewrite them. Explain the system architecture and the results you achieved. Show that you were an expert consultant rather than a junior coder.</p>
      </div>

      <h2 className={h2}>Dividing Your Core Services</h2>
      <p>As an independent developer you might feel tempted to state that you do everything. This is a mistake. Clients hire freelancers to solve specific issues not to be general workers. You must define your core services clearly.</p>

      <p>Group your projects under service categories like backend APIs or frontend tuning. This structure helps the hiring manager see your area of specialization immediately. It builds trust in your expertise.</p>

      <p>For each service area write a brief summary of your technical approach. Explain the stacks you prefer and why you use them. This shows that you have a planned methodology for your work rather than just guessing.</p>

      <h2 className={h2}>Dealing with Non Disclosure Agreements</h2>
      <p>Freelancers often sign non disclosure agreements that prevent them from naming their clients. This can make writing your profile difficult. But you must not let these legal contracts stop you from showing your value.</p>

      <p>You can describe your clients by industry and size instead of naming them. For example write that you built a backend for a major healthcare provider or tuned a dashboard for a logistics firm. This protects the client identity while proving you worked in complex environments.</p>

      <p>Focus on the technical challenges you solved. The parser does not care about the company name. It cares about the skills and tools you used to build the solution. Describe your architecture and metrics in detail to prove your capability.</p>

      <h2 className={h2}>Grouping Minor Gigs to Save Space</h2>
      <p>If you did many small gigs like fixing single bugs or setting up basic landing pages you must not list them all. This creates visual clutter and dilutes your major accomplishments. You must group these minor tasks together.</p>

      <p>Create a single bullet point or section for miscellaneous projects. Write that you delivered five small integrations using web technologies. This shows you were active without overwhelming the page with tiny entries.</p>

      <p>Keep the focus on your high impact work. Recruiters want to see that you can handle large systems and long projects. Grouping small tasks shows you know how to prioritize your most important experience.</p>

      <h2 className={h2}>Quantifying Your Consulting Results</h2>
      <p>As a freelancer you are hired to solve specific problems fast. This means you must show speed and efficiency in your bullet points. Use metrics to prove that you delivered the project on time and within budget.</p>

      <p>Write about how your work cut operating costs or automated manual tasks. Mention the number of users who interact with the system you built. These numbers prove to the hiring manager that your work had a lasting impact on the client business.</p>

      <p>If you cannot find business revenue data focus on engineering metrics. Write about test coverage increases or pipeline speed improvements. These numbers show you maintain high technical standards even under tight contract deadlines.</p>

      <h2 className={h2}>Transitioning From Freelance to Full Time</h2>
      <p>When you apply for a full time role after years of freelancing recruiters have specific concerns. They worry that you will struggle to adapt to a manager or get bored working on a single product. You must address these concerns in your profile.</p>

      <p>Use your introductory summary to explain your desire for long term ownership. State that you are looking to focus your efforts on growing a single product. This turns your transition into a deliberate career step rather than a fallback option.</p>

      <p>Highlight projects where you worked closely with internal client teams. Prove that you can collaborate with product managers and other developers. This shows you are a team player who can fit into their existing organization.</p>

      <h2 className={h2}>Why Web Link Portfolios Match Freelance Work Best</h2>
      <p>Static documents make it hard to show a freelance portfolio. If you have code repositories or live apps you have to write out long links that recruiters cannot click easily. The document becomes cluttered with text representations of web addresses.</p>

      <p>A web profile solves this issue by letting you embed live links directly in the text. The recruiter can click on a project title and view the live website immediately. This provides instant proof of your work and reduces friction in the hiring process.</p>

      <p>A digital profile also allows you to structure your projects into interactive grids. You can show your technical stack next to the project summary without taking up valuable vertical space. This layout is perfect for freelancers who need to show a wide variety of skills.</p>

      <h2 className={h2}>Client References Without Breaking NDAs</h2>
      <p>Freelancers rarely get formal reference letters. You can still add credibility by listing client titles and industries. Write that a VP of Engineering at a Series C fintech can confirm your API rebuild on request.</p>

      <p>Offer to connect serious employers with past clients over email after an initial screen. This step proves your project history is real without publishing client names on a public page. Full-time hiring managers respect candidates who protect prior employers.</p>

      <p>Keep a private document with contact details for three references ready before interviews start. When a recruiter asks for proof you send the list within an hour. Speed here separates organized consultants from people scrambling to find a name.</p>

      <div className={callout}>
        <h3 className={h3}>Rate history stays off the CV</h3>
        <p>Do not list hourly rates on your public profile. Rates belong in contract negotiations, not in a document recruiters forward to five colleagues. Your CV should sell outcomes and systems, not price tags.</p>
      </div>

      <h2 className={h2}>Read Next</h2>
      <p>Once you have organized your freelance projects you should review your layout spacing. Read our guide on the <Link href="/spacing" className={link}>best CV spacing standards</Link> to ensure your page looks clean. You should also check out the <Link href="/fonts" className={link}>best fonts for screen legibility</Link> to make sure your project details are easy to read.</p>
    </div>
  );
}
