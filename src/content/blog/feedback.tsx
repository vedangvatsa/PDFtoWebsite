import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
 You send a direct message on Discord to a senior staff engineer you admire. The message contains a link to your fresh new portfolio site. You ask if they can take a look and give some feedback when they have a free second. You wait three days. You check your sent messages and see a read receipt. There is no reply.
 </p>
      <p>
 This silence is not because the senior engineer is mean. It is not because they hate junior developers or want to keep you out of the industry. The problem is your request. You asked them to do a lot of work without giving them a clear path. A general review of a website requires deep cognitive effort. Most senior engineers do not have that kind of free time.
 </p>
      <p>
 If you want a response from a busy engineer you must change how you ask. You must make the task small and highly specific. You must show that you have already done the hard work of identifying your own problem areas. This guide details the best methods to get senior developers to review your portfolio and write back with useful suggestions.
 </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Comparison between weak and strong feedback requests">
          <rect x="0" y="0" width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-950" />
          <text x="350" y="30" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100 font-bold text-sm">Feedback Request Structure</text>
          
          {/* Weak Request */}
          <rect x="40" y="60" width="280" height="250" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="180" y="85" textAnchor="middle" className="fill-red-500 font-semibold text-xs">Vague Request (Ignored)</text>
          
          <rect x="60" y="110" width="240" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" />
          <text x="70" y="125" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[10px]">What do you think of my portfolio?</text>
          <text x="70" y="140" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Requires checking every page and link</text>
          
          <rect x="60" y="160" width="240" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" />
          <text x="70" y="175" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[10px]">No specific constraints mentioned</text>
          <text x="70" y="190" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Hiring goals and target role are mystery</text>

          <rect x="60" y="240" width="240" height="55" rx="6" className="fill-red-50 dark:fill-red-950/20 stroke-red-200 dark:stroke-red-900" />
          <text x="180" y="258" textAnchor="middle" className="fill-red-600 dark:fill-red-400 text-[10px] font-semibold">High Friction Task</text>
          <text x="180" y="272" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Feels like unpaid consulting work</text>

          {/* Strong Request */}
          <rect x="380" y="60" width="280" height="250" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="520" y="85" textAnchor="middle" className="fill-emerald-500 font-semibold text-xs">Targeted Request (Answered)</text>
          
          <rect x="400" y="110" width="240" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="410" y="125" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[10px]">How is my database design on line 42?</text>
          <text x="410" y="140" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Focuses on one file and single question</text>
          
          <rect x="400" y="160" width="240" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="410" y="175" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[10px]">Live URL with guest login</text>
          <text x="410" y="190" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Zero friction to test the live code</text>

          <rect x="400" y="210" width="240" height="85" rx="6" className="fill-emerald-50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-900" />
          <text x="520" y="228" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[10px] font-semibold">Low Friction Task</text>
          <text x="520" y="245" textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-300 text-[9px] font-medium">Can be answered in two minutes</text>
          <text x="520" y="260" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[8px]">Shows deep respect for their schedule</text>
          <text x="520" y="275" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[8px]">Provides all necessary technical facts</text>
        </svg>
      </div>

      <h2 className={h2}>Avoid the Vague Request</h2>
      <p>
 The most common mistake is asking for a general critique. When you say check out my site you are forcing the engineer to figure out where to start. They have to open the link and inspect the design. They must check if the site works on mobile. They have to read your project descriptions and look for code bugs.
 </p>
      <p>
 This is a massive job. It can easily take an hour of focused attention to write a quality review. Because senior engineers already have full lists of tasks they will put your message on the back burner. Eventually they will forget about it.
 </p>
      <p>
 To get their help you must remove this work. Do not ask for a general review. Instead of asking what they think you should ask about a specific component. Focus their eyes on a single challenge you are trying to solve. This shows you value their time.
 </p>
      <p>
 When you make the task small they can answer in a few minutes. A senior engineer is much more likely to reply if they can do it while drinking their morning tea.
 </p>

      <h2 className={h2}>Define a Specific Technical Scope</h2>
      <p>
 Keep your request focused on a single technical problem. For example you can ask about your database schema or your API structure. You can ask if your layout looks correct on smaller screens.
 </p>
      <p>
 You should present the request with two clear options or a specific question. If you are worried about your database design ask them to look at a specific file. Give them a direct link to the lines of code on GitHub.
 </p>
      <p>
 Ask if they would recommend using a relational store or a document database for that specific data structure. This is a question an experienced engineer can answer instantly. It allows them to share their knowledge without having to search through your entire codebase.
 </p>
      <p>
 By narrowing the scope you make the interaction feel like a quick check rather than a massive auditing project. It turns a heavy chore into a simple conversation.
 </p>

      <div className={callout}>
        <h3 className={h3}>Keep code snippets under fifty lines</h3>
        <p>
 If you are asking for code feedback send a direct link to a short snippet. Do not ask them to read multiple files. A short snippet allows them to spot issues immediately and reply.
 </p>
      </div>

      <h2 className={h2}>Provide the Target Role Context</h2>
      <p>
 A portfolio for a frontend developer looks very different from a portfolio for a backend developer. If the reviewer does not know what job you want their feedback will not be helpful.
 </p>
      <p>
 Tell the engineer exactly what role you are targeting. Mention the size of the companies you want to join. A startup needs developers who can build features fast. An enterprise company values testing and database security.
 </p>
      <p>
 Give this context in one short sentence. You can write that you are applying for junior frontend roles at mid-sized SaaS companies. This single fact helps the engineer frame their advice. They will know if they should focus on your UI polish or your system architecture.
 </p>
      <p>
 Without this context their suggestions might be completely wrong for your goals. It prevents wasted effort for both of you.
 </p>

      <h2 className={h2}>Remove All Setup Friction</h2>
      <p>
 If the engineer has to register an account or run terminal commands to see your work they will stop immediately. You must make it possible to evaluate your portfolio in one click.
 </p>
      <p>
 Ensure your portfolio is live on a fast hosting service. If your projects require authentication provide a guest login button that fills in credentials automatically. Do not make the reviewer check their email for a verification code.
 </p>
      <p>
 Test your site speed before sending the link. A page that takes five seconds to load will be closed before the engineer sees your projects. Use static hosting or content delivery networks to keep things fast.
 </p>
      <p>
 You can read about the <Link href="/portfolio" className={link}>best portfolio platforms for developers</Link> to find tools that keep your page fast. Having a stable page ensures your reviewer has a good experience.
 </p>

      <h2 className={h2}>Propose a Trade of Value</h2>
      <p>
 Senior developers do not need your money. However they do appreciate developers who are willing to contribute back to the community.
 </p>
      <p>
 Offer to help them with something in return. You can offer to write documentation for their open source projects. You can offer to test a new tool they are building and write a bug report.
 </p>
      <p>
 This gesture shows you understand that feedback is a professional transaction. It proves you are looking for a free handout. Even if they decline your help they will remember your professional attitude.
 </p>
      <p>
 It sets you apart from the hundreds of other developers who only send links and ask for help. It builds a real professional relationship.
 </p>

      <h2 className={h2}>Follow Up with Action</h2>
      <p>
 If a senior engineer takes the time to write a detailed reply you must show that you used their advice. Do say thank you and do nothing.
 </p>
      <p>
 Make the changes they suggested. Update your code or fix the layout bugs they pointed out. Once the changes are live send a short follow up message.
 </p>
      <p>
 Explain exactly what you changed based on their feedback. Show them the live result. This follow up is the best way to say thank you. It proves you are serious about learning and growing as an engineer.
 </p>
      <p>
 It also makes them feel good about the time they spent helping you. They will be much more likely to help you again in the future if you show that their advice made a difference.
 </p>
      <p>
 To make sure your portfolio stands out you can also read about <Link href="/junior" className={link}>best portfolio sections for junior developers</Link> to organize your site content. Proving your skills is easier when your page has the correct structure.
 </p>

      <h2 className={h2}>Where to Find Engineers Who Actually Reply</h2>
      <p>
 Cold messages to strangers on LinkedIn have low response rates. Better channels exist. Local meetup organizers often know senior engineers who mentor. Open source maintainers reply faster when you open a thoughtful issue than when you ask for career advice in direct messages.
 </p>
      <p>
 Company public Slack communities and Discord servers for tools you use daily are another source. Participate for a few weeks before asking for feedback. Answer someone else question first. Reciprocity works better than a link drop on day one.
 </p>
      <p>
 Alumni networks from bootcamps and universities run review threads during hiring season. Post your specific question there instead of broadcasting to the whole internet. Context and shared background increase reply rates.
 </p>

      <h2 className={h2}>Timing and Format of Your Request</h2>
      <p>
 Send requests early in the week and early in the day for the recipient time zone. Friday afternoon messages get buried under weekend backlog. Tuesday morning catches people before sprint planning eats their calendar.
 </p>
      <p>
 Keep the message under one hundred words. Put the link on its own line. State your single question in bold plain language. Offer an easy out such as no pressure if you are slammed this week. Busy engineers reply more when they do not feel trapped.
 </p>
      <p>
 Never send the same request to five engineers in the same company at once. They talk. Duplicate asks look sloppy and waste goodwill across the whole team.
 </p>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/junior" className={link}>Best Portfolio Sections for Junior Developers to Include</Link></li>
        <li><Link href="/portfolio" className={link}>Best Portfolio Platforms for Developers</Link></li>
        <li><Link href="/skills" className={link}>Best Ways to Prove Skills Without a Degree</Link></li>
      </ul>
    </div>
  );
}
