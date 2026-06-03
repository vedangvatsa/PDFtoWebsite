import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        Your phone buzzes. It is a notification from your mail client. You swipe it away. Later, you sit at your desk and open your inbox. You see fifty unread messages. Some have subject lines like "URGENT: Quick Question" or "Freelance Developer Seeking Work." You delete them. You do not even read them. You do not have time.
      </p>
      <p>
        Now think about a technical recruiter or an engineering manager. Their inbox is a war zone. They receive hundreds of cold pitches every single day. If your email subject line looks like an automated template, it goes straight to the trash. It does not matter if your code is clean or your CV is perfect. If they do not open the message, you do not exist.
      </p>
      <p>
        To get an email opened, you must write a subject line that looks like a message from a teammate. It must be short, direct, and focused on value. It should not look like a sales pitch. Let us look at what works and why.
      </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Inbox subject line comparison showing a generic bad subject line rejected and a specific good subject line clicked">
          {/* Background grid */}
          <rect x="0" y="0" width="700" height="350" rx="12" className="fill-zinc-50 dark:fill-zinc-950 stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1" />
          
          {/* Header */}
          <rect x="20" y="20" width="660" height="40" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-800" />
          <circle cx="45" cy="40" r="6" className="fill-red-400" />
          <circle cx="65" cy="40" r="6" className="fill-yellow-400" />
          <circle cx="85" cy="40" r="6" className="fill-green-400" />
          <text x="350" y="45" textAnchor="middle" fontSize="12" className="fill-zinc-400 dark:fill-zinc-500 font-mono">recruiter@company.com — Inbox</text>
          
          {/* Bad Email Example */}
          <g transform="translate(0, 80)">
            <rect x="40" y="10" width="620" height="80" rx="8" className="fill-white dark:fill-zinc-900 stroke-red-200 dark:stroke-red-950" strokeWidth="1" />
            <rect x="40" y="10" width="6" height="80" rx="3" className="fill-red-400" />
            <text x="70" y="38" fontSize="14" className="fill-zinc-400 dark:fill-zinc-600 font-mono">Subject: Job Application for Software Engineer Position</text>
            <text x="70" y="62" fontSize="12" className="fill-zinc-300 dark:fill-zinc-500">From: john.dev99@gmail.com (Declined · Wastes inbox space)</text>
            <circle cx="610" cy="50" r="12" className="fill-red-50 dark:fill-red-950/30 stroke-red-200 dark:stroke-red-800" />
            <path d="M604 44 L616 56 M616 44 L604 56" className="stroke-red-500 dark:stroke-red-400" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Good Email Example */}
          <g transform="translate(0, 190)">
            <rect x="40" y="10" width="620" height="80" rx="8" className="fill-white dark:fill-zinc-900 stroke-emerald-200 dark:stroke-emerald-950" strokeWidth="2" />
            <rect x="40" y="10" width="6" height="80" rx="3" className="fill-emerald-500" />
            <text x="70" y="38" fontSize="14" className="fill-zinc-800 dark:fill-zinc-100 font-semibold font-mono">Subject: David Chen / React performance stats (P99 down 300ms)</text>
            <text x="70" y="62" fontSize="12" className="fill-zinc-500 dark:fill-zinc-400">From: david@cvin.bio (Opened · High signal and proof)</text>
            <circle cx="610" cy="50" r="12" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-800" />
            <path d="M604 50 L608 54 L616 46" fill="none" className="stroke-emerald-500 dark:stroke-emerald-400" strokeWidth="2" strokeLinecap="round" />
          </g>
          
          {/* Legend */}
          <text x="350" y="320" textAnchor="middle" fontSize="12" className="fill-zinc-400 dark:fill-zinc-500">Recruiters spend 2 seconds scanning subjects. Make your value obvious.</text>
        </svg>
      </div>

      <h2 className={h2}>The Recruiter Inbox Is A Visual Filter</h2>
      <p>
        When you send a cold email, your subject line is a tiny billboard. It has a single task to perform. It must convince the recipient that the message inside is worth their attention. Most developers think about their email content first and their subject line last. This is backwards. If the subject line is bad, the rest of the email remains unread.
      </p>
      <p>
        To stand out, you need to know how recruiters process mail. They do not read every word. They scan the sender name and the subject line. They look for patterns. They look for automated spam. They look for generic job seekers. When you write a subject line like "Software Engineer Application," you are telling them that you are just another applicant in a long queue. You are not a human peer. You are a ticket to be processed.
      </p>
      <p>
        Instead of using formal applicant language, write like you are already on the team. Use informal but professional syntax. Use lowercase words where appropriate. Avoid sales talk. Your subject line should sound like something an engineering leader would send to their director.
      </p>

      <h2 className={h2}>Why Generic Subject Lines Fail Instantly</h2>
      <p>
        Generic subject lines fail because they lack context and signal. They tell the recruiter what you want, not what you can do. Let us look at a few bad examples that fill trash folders daily.
      </p>
      <p>
        "Seeking opportunities at your company." This subject line is entirely about you. It offers zero value to the reader. It does not mention your skills, your experience, or what you can build. It asks the recruiter to do the work of figuring out who you are and where you fit.
      </p>
      <p>
        "Experienced frontend developer looking for a job." This is slightly better because it mentions your role. But it is still weak. "Experienced" is a filler word. Anyone can say they are experienced. It is a claim without proof.
      </p>
      <p>
        "Application for open roles." This looks like an automated message. Recruiters assume that if the subject line is generic, the email body is a template sent to a thousand other companies. They want to know you researched their team.
      </p>
      <p>
        If you want to be treated like an elite candidate, you must present yourself differently. You must change the conversation from "I need a job" to "I can help you build this." This is why sharing a polished <Link href="/link" className={link}>link to your professional profile</Link> works so much better than sending a giant file attachment.
      </p>

      <h2 className={h2}>The Three Subject Line Rules That Actually Work</h2>
      <p>
        To write subject lines that get opened, you must follow three simple rules. These rules are based on how humans prioritize tasks under stress.
      </p>
      <div className={callout}>
        <h3 className={h3}>Keep it short and punchy</h3>
        <p>
          Subject lines should be under fifty characters. Many recruiters read emails on their mobile devices. If your subject line is too long, the email client will truncate it. The most important words must be at the very front.
        </p>
      </div>
      <p>
        The second rule is to use concrete metrics. Do not tell them you are good at database design. State that you reduced query latency. Do not say you write fast code. Tell them you cut load times. Nouns and numbers capture visual attention. They provide instant credibility because they imply that you track your work and care about outcomes.
      </p>
      <p>
        The third rule is to make it personal. Mention a project the company recently launched. Mention a technical challenge they are facing. If you read their engineering blog and noticed they are migrating to Go, mention Go in your subject line. This shows that you are not spamming. It shows you know who they are.
      </p>

      <h2 className={h2}>Proven Subject Line Formulas For Developers</h2>
      <p>
        Here are four formulas that work. You can adapt them to your specific engineering stack and experience level.
      </p>
      <p>
        Formula One is the "Name / Metric / Skill" formula. It looks like this: <span className={bold}>"Sarah Miller / Next.js load time down 40%."</span> This is short and lists a specific, impressive result. It tells the reader that you are an engineer who delivers speed.
      </p>
      <p>
        Formula Two is the "Specific Tech / System Solution" formula. It looks like this: <span className={bold}>"Go backend dev / handling 10k requests per second."</span> If a company is struggling to scale their services, this subject line is a direct solution to their problem. It is much more powerful than a generic title.
      </p>
      <p>
        Formula Three is the "Shared Connection / Value" formula. It looks like this: <span className={bold}>"From GitHub / your open source contribution."</span> If you contributed to their open source project or wrote a fix for one of their repositories, lead with that. It proves your skills before they even read the message.
      </p>
      <p>
        Formula Four is the "Engineering Blog Ref" formula. It looks like this: <span className={bold}>"Thoughts on your database migration article."</span> This subject line is almost impossible for an engineering manager to ignore. It looks like a peer sharing thoughts on their writing. It starts a conversation instead of making a demand.
      </p>

      <h2 className={h2}>How To Link Your Profile Without Adding Friction</h2>
      <p>
        Once you get the email opened, the next hurdle is the call to action. Do not attach a heavy PDF file. If you do, you risk getting flagged by security tools, or forcing the reader to download a document they do not want. Instead, include a clean link.
      </p>
      <p>
        A web profile hosted on a custom domain shows that you are a modern builder. When you write, "You can see my recent builds at cvin.bio/sarah," you make it simple for them. They click, the page loads instantly on their phone, and they can browse your code repositories.
      </p>
      <p>
        This strategy keeps your message light. It reduces the steps between their inbox and your work history. It shows respect for their time and technical authority. For more advice on this, check out our guide on <Link href="/send" className={link}>how to send your CV to recruiters</Link>.
      </p>

      <h2 className={h2}>Frequently Asked Questions</h2>
      <div className="space-y-6">
        <div>
          <h3 className={h3}>Should I use emoji in my subject lines?</h3>
          <p>
            No. Emojis look like marketing emails or newsletter spam. They do not look like messages from a technical colleague. Keep it to clean, professional text.
          </p>
        </div>
        <div>
          <h3 className={h3}>Is it okay to use lowercase letters in my subject line?</h3>
          <p>
            Yes. A subject line like "next.js performance fix" written in lowercase looks like an informal note from a coworker. It stands out in a sea of capitalized sales pitches.
          </p>
        </div>
        <div>
          <h3 className={h3}>Should I include the word CV or portfolio in the subject?</h3>
          <p>
            Only if you combine it with a clear, specific result. A subject line like "Sarah Miller CV" is weak. "Sarah Miller / React performance engineer" is far stronger.
          </p>
        </div>
      </div>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/send" className={link}>Best Ways to Send Your CV to a Recruiter</Link></li>
        <li><Link href="/inbox" className={link}>Using Clean URLs to Stand Out in Application Inboxes</Link></li>
        <li><Link href="/link" className={link}>Sending Your CV as a Web Link Instead of a PDF File</Link></li>
      </ul>
    </div>
  );
}
