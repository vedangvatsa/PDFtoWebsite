import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        You find a job listing at a great tech company. The role fits your skills perfectly. You click apply, upload your files, and wait. Days turn into weeks. Nothing happens. Your application is sitting in a database with five hundred others. You realize you need a referral to get noticed.
      </p>
      <p>
        So you open LinkedIn. You find three engineers who work at the target company. You send them connection requests. When they accept, you send a long message: "Hello, I saw an open role at your company. I would love to join your team. Could you refer me? Here is my file."
      </p>
      <p>
        The engineers do not reply. They do not know you. They have no reason to trust your skills. When you ask a stranger for a referral immediately, you are asking them to risk their professional reputation for you. It is a high-risk request with zero upside for them.
      </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="LinkedIn DM flow diagram showing a bad request ignored and a good value-first pitch accepted">
          {/* Background grid */}
          <rect x="0" y="0" width="700" height="350" rx="12" className="fill-zinc-50 dark:fill-zinc-950 stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1" />
          
          {/* Header */}
          <rect x="20" y="20" width="660" height="40" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-800" />
          <circle cx="45" cy="40" r="6" className="fill-zinc-300 dark:fill-zinc-700" />
          <text x="350" y="45" textAnchor="middle" fontSize="12" className="fill-zinc-400 dark:fill-zinc-500 font-mono">LinkedIn Messages</text>
          
          {/* Left Column: Bad Request */}
          <g transform="translate(20, 80)">
            <rect x="10" y="10" width="300" height="200" rx="8" className="fill-white dark:fill-zinc-900 stroke-red-200 dark:stroke-red-950" strokeWidth="1" />
            <text x="25" y="35" fontSize="12" fontWeight="600" className="fill-red-500">The Asking-First Trap</text>
            <text x="25" y="65" fontSize="11" className="fill-zinc-500 dark:fill-zinc-400">"Hey, can you refer me to this role?"</text>
            <text x="25" y="85" fontSize="11" className="fill-zinc-500 dark:fill-zinc-400">"Here is my attached document."</text>
            <text x="25" y="105" fontSize="11" className="fill-zinc-500 dark:fill-zinc-400">"Thanks in advance!"</text>
            
            <line x1="25" y1="130" x2="295" y2="130" className="stroke-zinc-100 dark:stroke-zinc-800" />
            <text x="25" y="155" fontSize="11" className="fill-red-400 font-semibold">Outcome: Ignored (High risk, no context)</text>
          </g>

          {/* Right Column: Good Request */}
          <g transform="translate(360, 80)">
            <rect x="10" y="10" width="300" height="200" rx="8" className="fill-white dark:fill-zinc-900 stroke-emerald-200 dark:stroke-emerald-950" strokeWidth="2" />
            <text x="25" y="35" fontSize="12" fontWeight="600" className="fill-emerald-500">The Value-First Approach</text>
            <text x="25" y="65" fontSize="11" className="fill-zinc-800 dark:fill-zinc-200">"Hey, read your post on DB indexing."</text>
            <text x="25" y="85" fontSize="11" className="fill-zinc-800 dark:fill-zinc-200">"Built a custom Go parser for queries."</text>
            <text x="25" y="105" fontSize="11" className="fill-zinc-800 dark:fill-zinc-200">"Code is live at cvin.bio/daniel"</text>
            
            <line x1="25" y1="130" x2="295" y2="130" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="2" />
            <text x="25" y="155" fontSize="11" className="fill-emerald-500 font-semibold">Outcome: Reply & Refer (Low friction, proof first)</text>
          </g>
          
          {/* Footer note */}
          <text x="350" y="315" textAnchor="middle" fontSize="11" className="fill-zinc-400 dark:fill-zinc-500">Strangers refer you when they see clean work. Build proof, then ask.</text>
        </svg>
      </div>

      <h2 className={h2}>The LinkedIn Referral Trap</h2>
      <p>
        Getting a referral is the fastest way to bypass automated screening filters. But asking for one requires tact. Most developers fall into a simple trap. They treat LinkedIn like a transaction engine. They think that if they send enough messages, someone will eventually say yes.
      </p>
      <p>
        This transactional mindset does not work. When an engineer refers a candidate, their name is tied to that application. If the candidate performs poorly or behaves unprofessionally in the interview, it reflects badly on the person who referred them. No one wants to risk their reputation for a stranger who sent a generic message.
      </p>
      <p>
        To get a referral, you must build trust quickly. You do not need to become best friends. You simply need to prove that you are a competent developer who respects their time and works hard. You must offer signal instead of noise.
      </p>

      <h2 className={h2}>Why Generic Connection Requests Fail</h2>
      <p>
        When you send a message on LinkedIn, the recipient makes a decision in seconds. They read your introductory text and decide whether to reply or archive the thread. Let us look at why common approaches fail.
      </p>
      <p>
        First, long paragraphs of text look like hard work to read. When you send a five-hundred-word message detailing your entire career history, the reader feels overwhelmed. They close the chat and promise themselves they will look at it later. They never do.
      </p>
      <p>
        Second, sending file attachments adds technical friction. If you attach a heavy document, the reader has to download it, open it in another app, and scan it. Many corporate networks block external attachments, or the reader might be on their phone where opening files is annoying.
      </p>
      <p>
        Third, generic pitches tell the reader that you did not do any research. If you ask for a referral without explaining why you want to work at their specific company, they will assume you are sending the same message to everyone. This is why having a clean web presence is useful. It shows that you care about your personal brand.
      </p>

      <h2 className={h2}>The Anatomy Of A High Signal Cold DM</h2>
      <p>
        A high-signal message is short, specific, and focused on value. It should fit on a mobile screen without scrolling. Let us break down the components of a message that gets replies.
      </p>
      <div className={callout}>
        <h3 className={h3}>Start with a shared context</h3>
        <p>
          Do not start with a request. Start with something you have in common. Mention a technical post they wrote, a public project they contribute to, or a mutual colleague. This breaks the ice and shows that you are active in the developer community.
        </p>
      </div>
      <p>
        Next, state your value quickly. Do not list your job titles. State a specific problem you solved that relates to their team. If they work on database scaling, mention how you optimized slow queries at your last job. Use concrete numbers.
      </p>
      <p>
        Finally, include a low-friction link. Do not send a file. Provide a clean link to your live profile. Say, "You can see my recent system architecture diagram and code commits at cvin.bio/daniel." This lets the reader inspect your work in one click without downloading files.
      </p>

      <h2 className={h2}>Four Message Templates That Get Answers</h2>
      <p>
        Here are four templates you can use, depending on how you connect with the recipient.
      </p>
      <p>
        Template One is the "Shared Tech Stack" template. It works well when contacting an engineer on a team you want to join: <span className={bold}>"Hey Jordan, noticed your team is migrating to Go. I recently built a Go parser that handles large query datasets. You can see the code and system stats at cvin.bio/daniel. If you are open to a brief chat about how your team structures database schemas, I would love to connect."</span>
      </p>
      <p>
        Template Two is the "Engineering Blog Reference" template. Use this when they publish technical articles: <span className={bold}>"Hi Sarah, read your article on Next.js component loading. I applied your custom caching pattern to my live project and reduced P99 latency by 300ms (cvin.bio/daniel). Thanks for sharing the detailed code details. I would love to follow your work here."</span>
      </p>
      <p>
        Template Three is the "Open Source Contributor" template. Use this if they maintain public repositories: <span className={bold}>"Hey Alex, I noticed your team maintains the open source database tool. I just submitted a pull request fixing the connection pooling issue. You can see my profile and active project links at cvin.bio/daniel. Let me know if you need any adjustments on the code structure."</span>
      </p>
      <p>
        Template Four is the "Direct Professional Referral" template. Use this only after establishing a brief connection: <span className={bold}>"Hey Jordan, thanks for the thoughts on my project. I saw an open backend role on your team and would love to apply. Since we discussed database architecture, would you be comfortable sharing a referral link? You can find all my current work details at cvin.bio/daniel to share with the manager."</span>
      </p>

      <h2 className={h2}>How To Link Your Professional Profile Directly</h2>
      <p>
        When you send a message, your goal is to get the reader to look at your work. You want them to say, "This developer knows what they are doing." You cannot achieve this with a flat text file. You need a modern web profile.
      </p>
      <p>
        A live URL hosted on a custom domain shows that you are a serious professional. It loads instantly on mobile, presents your skills in a readable format, and contains links to your live repositories. It behaves like a digital business card that does the selling for you.
      </p>
      <p>
        When you make it easy for the engineer to review your code, you reduce the friction of the referral process. They can skim your work in thirty seconds and feel confident recommending you to their manager. For more strategies on setting up your online presence, read our guide on <Link href="/linkedin" className={link}>LinkedIn alternatives for developers</Link>.
      </p>

      <h2 className={h2}>Frequently Asked Questions</h2>
      <div className="space-y-6">
        <div>
          <h3 className={h3}>Should I ask recruiters or engineers for referrals?</h3>
          <p>
            Ask engineers. Recruiters receive too many pitches and cannot verify your technical skills. Engineers can review your code, and their recommendation carries more weight with the hiring manager.
          </p>
        </div>
        <div>
          <h3 className={h3}>What if an engineer accepts my connection but does not reply?</h3>
          <p>
            Do not spam them. Wait a week, then send a polite update showing a new project you built or a technical problem you solved. If they still do not reply, move on to other contacts.
          </p>
        </div>
        <div>
          <h3 className={h3}>Is it okay to offer a referral bonus split?</h3>
          <p>
            No. This looks unprofessional and desperate. Engineers refer people because they want to build a strong team, not for a quick payout. Let your skills be the reason they say yes.
          </p>
        </div>
      </div>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/linkedin" className={link}>Best LinkedIn Alternatives for Developers</Link></li>
        <li><Link href="/portfolio" className={link}>Best Portfolio Platforms for Developers</Link></li>
        <li><Link href="/send" className={link}>Best Ways to Send Your CV to a Recruiter</Link></li>
      </ul>
    </div>
  );
}
