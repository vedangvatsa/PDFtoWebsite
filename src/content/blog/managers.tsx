import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        You spend three hours filling out application forms on corporate job boards. You upload your details, fill in the same information in twenty different text boxes, and answer long questionnaires. You click submit. You feel productive. You think: "I applied to ten jobs today. Surely one of them will call me."
      </p>
      <p>
        They probably will not. Modern job portals are black holes. They are managed by automated sorting software that filters candidates based on keywords. If your formatting does not match their schema, your profile is deleted before a human eye ever sees it. You are wasting your time.
      </p>
      <p>
        The best jobs are not landed through portal submissions. They are landed by finding the engineering leaders who are actually building the teams. These leaders are active on professional networks like Twitter and LinkedIn. If you can locate them and pitch them directly, you bypass the bots entirely. Let us look at how to find them.
      </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Search queries for finding hiring managers on Twitter and LinkedIn">
          {/* Background grid */}
          <rect x="0" y="0" width="700" height="350" rx="12" className="fill-zinc-50 dark:fill-zinc-950 stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1" />
          
          {/* Left Block: LinkedIn Search */}
          <g transform="translate(30, 40)">
            <rect x="0" y="0" width="300" height="230" rx="8" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1" />
            <text x="20" y="30" fontSize="14" fontWeight="bold" className="fill-zinc-900 dark:fill-zinc-100">LinkedIn Search String</text>
            <rect x="20" y="50" width="260" height="40" rx="4" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
            <text x="30" y="74" fontSize="10" className="fill-zinc-600 dark:fill-zinc-300 font-mono">"engineering manager" AND "hiring"</text>
            
            <text x="20" y="120" fontSize="12" fontWeight="600" className="fill-zinc-800 dark:fill-zinc-200">How to filter results</text>
            <text x="20" y="145" fontSize="11" className="fill-zinc-500 dark:fill-zinc-400">• Filter by "Posts" instead of people</text>
            <text x="20" y="165" fontSize="11" className="fill-zinc-500 dark:fill-zinc-400">• Select "Past week" for active roles</text>
            <text x="20" y="185" fontSize="11" className="fill-zinc-500 dark:fill-zinc-400">• Find managers writing original updates</text>
          </g>

          {/* Right Block: Twitter Search */}
          <g transform="translate(370, 40)">
            <rect x="0" y="0" width="300" height="230" rx="8" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1" />
            <text x="20" y="30" fontSize="14" fontWeight="bold" className="fill-zinc-900 dark:fill-zinc-100">Twitter Search Operator</text>
            <rect x="20" y="50" width="260" height="40" rx="4" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
            <text x="30" y="74" fontSize="10" className="fill-zinc-600 dark:fill-zinc-300 font-mono">hiring ("react" OR "golang") engineer</text>
            
            <text x="20" y="120" fontSize="12" fontWeight="600" className="fill-zinc-800 dark:fill-zinc-200">How to filter results</text>
            <text x="20" y="145" fontSize="11" className="fill-zinc-500 dark:fill-zinc-400">• Filter by "Latest" tab for real-time tweets</text>
            <text x="20" y="165" fontSize="11" className="fill-zinc-500 dark:fill-zinc-400">• Look for replies in tech threads</text>
            <text x="20" y="185" fontSize="11" className="fill-zinc-500 dark:fill-zinc-400">• Direct message immediately with proof</text>
          </g>
          
          <text x="350" y="315" textAnchor="middle" fontSize="12" className="fill-zinc-400 dark:fill-zinc-500">Advanced query filters help you bypass the applicant databases.</text>
        </svg>
      </div>

      <h2 className={h2}>The Hidden Gatekeepers of Tech Hiring</h2>
      <p>
        Recruiters do not make the final hiring decisions. They manage the process. The actual decision-makers are the engineering managers and technical leads. They are the ones who feel the pain of being understaffed. They are the ones who have to write code on weekends because they lack backend developers.
      </p>
      <p>
        When you pitch a recruiter, they look at you as a list of bullet points. When you pitch an engineering manager, they look at you as a solution to their daily stress. If they see that you can write clean code and build systems, they will bypass the human resources queue to talk to you.
      </p>
      <p>
        However, these managers are busy. They do not spend their days reading applications in the corporate databases. You must go to the platforms where they share their thoughts and discuss technical challenges. This is where Twitter and LinkedIn become highly valuable tools.
      </p>

      <h2 className={h2}>Why Applying Through Portals Is A Loss Leader</h2>
      <p>
        Applying through a corporate portal is the least effective way to get a job. Let us look at why this is true.
      </p>
      <p>
        First, the competition is intense. A single posting on a job board can attract thousands of applications in a few days. Your profile becomes a single entry in a massive spreadsheet. The odds of being selected are tiny.
      </p>
      <p>
        Second, corporate portals use old-fashioned parsers. These tools strip your formatting, convert your text to flat data, and score you against a template. If you did not write your work history in the exact way the parser wants, you score zero. This is a common issue discussed in our article on <Link href="/pdf" className={link}>why complex PDFs break recruiter algorithms</Link>.
      </p>
      <p>
        Third, portals do not let you show your personality or proof of work. You cannot embed video links, responsive project layouts, or live code links. You are restricted to a text document. By finding managers directly, you change the game. You can send them a direct link to your live code.
      </p>

      <h2 className={h2}>How To Find Hiring Managers On LinkedIn</h2>
      <p>
        LinkedIn is the largest professional database in the world. But most people use the search bar incorrectly. They search for "Engineering Manager" and look at the "People" tab. This gives you a list of thousands of people, most of whom are not hiring.
      </p>
      <p>
        Instead, you should search for posts. Use the search operator string: <span className={bold}>"engineering manager" AND "hiring"</span>. Once the results load, click the "Posts" filter. Then, filter by date and select "Past week."
      </p>
      <p>
        Now you have a list of real engineering leaders who wrote posts saying they are looking for developers. They did not just post a job link. They wrote a personal note explaining what their team does and what skills they need.
      </p>
      <div className={callout}>
        <h3 className={h3}>Read the comments and reactions</h3>
        <p>
          Look at who commented on the post. Often, other managers or team leads will tag colleagues or share details about sub-teams that are also hiring. This is a gold mine of warm leads who are actively looking for talent.
        </p>
      </div>
      <p>
        Once you find a manager, do not just send a connection request. Read their profile. Look at their past articles. Find out what stack they build with. When you connect, send a personalized note mentioning their specific work.
      </p>

      <h2 className={h2}>How To Find Hiring Managers On Twitter</h2>
      <p>
        Twitter, now X, is where technical leaders share their honest thoughts. Many managers hate using LinkedIn because it is full of sales pitches. They prefer Twitter because it is conversational and code-focused.
      </p>
      <p>
        To find them, use advanced search operators. Search for queries like: <span className={bold}>hiring ("react" OR "golang") engineer</span>. Click the "Latest" tab to see real-time updates.
      </p>
      <p>
        Look for tweets where managers ask their followers for recommendations. These tweets often contain lines like: "My team at Stripe is looking for a frontend developer. DMs are open." This is a direct invitation to pitch them.
      </p>
      <p>
        Another trick is to follow developer lists and tech discussions. When a popular developer tweets about a technical problem, check the replies. Engineering managers often join these discussions. You can learn what problems they are solving and connect with them naturally.
      </p>

      <h2 className={h2}>Reaching Out With Your Web Profile Link</h2>
      <p>
        When you contact a manager on Twitter or LinkedIn, you must keep your pitch extremely short. Do not ask for a phone call immediately. Do not ask them to read a long message. Do not attach files. Send a brief message explaining how you can help, and include a link to your live profile.
      </p>
      <p>
        A link like cvin.bio/tomas is perfect. It loads instantly on their phone. They do not have to download an attachment. They can see your profile picture, read your values, check your code, and click your live project URLs. It is a seamless experience for a busy manager.
      </p>
      <p>
        Your pitch should highlight your strongest technical accomplishment. Do not say "I am a frontend developer looking for a job." Say "I recently built a Next.js frontend that renders search results in under 100 milliseconds." This is specific, interesting, and proves you understand system performance.
      </p>
      <p>
        If the manager is interested, they will click your link. They will see your clean layout, your hosted projects, and your active code repositories. They will get a clear picture of your engineering skills in ten seconds. They can then share your link directly with their team leads on Slack.
      </p>
      <p>
        This value-first pitch shows that you are a modern builder. It proves that you respect their time. If your live profile is clean and fast, it speaks for itself. For more tips on formatting your online profile, check out our guide on <Link href="/portfolio" className={link}>best portfolio platforms for developers</Link>.
      </p>

      <h2 className={h2}>Frequently Asked Questions</h2>
      <div className="space-y-6">
        <div>
          <h3 className={h3}>Is it unprofessional to DM a manager on Twitter?</h3>
          <p>
            No, if they state that their DMs are open for hiring. If their profile says "we are hiring," they want to hear from you. Keep it professional, focus on code, and do not spam.
          </p>
        </div>
        <div>
          <h3 className={h3}>What if a hiring manager has their DMs closed?</h3>
          <p>
            Reply to their public tweet with a short note. Say, "I saw you are looking for a Go engineer. I built a query parser that scales to 10k requests. I would love to share my work details." If they are interested, they will open their DMs or ask you to email them.
          </p>
        </div>
        <div>
          <h3 className={h3}>Should I follow up if they read my DM but do not reply?</h3>
          <p>
            Wait five days, then send a polite update showing a new project commit or fix. If they do not reply, do not push further. They may not have an active role that fits you right now.
          </p>
        </div>
      </div>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/send" className={link}>Best Ways to Send Your CV to a Recruiter</Link></li>
        <li><Link href="/linkedin" className={link}>Best LinkedIn Alternatives for Developers</Link></li>
        <li><Link href="/portfolio" className={link}>Best Portfolio Platforms for Developers</Link></li>
      </ul>
    </div>
  );
}
