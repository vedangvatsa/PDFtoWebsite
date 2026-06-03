import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        You stand in a crowded circle at a local backend meetup. The air is warm and smells of cold pizza. A senior developer from a major cloud database company turns to you and asks what you do. You freeze. You ramble about your college degree, mention that you are looking for any entry-level job, and list five different languages you studied in school.
      </p>
      <p>
        The senior developer nods politely. Their eyes scan the room looking for someone else to talk to. Your conversation ends in thirty seconds. You leave the meetup with zero new contacts and a pocket full of business cards you will never use.
      </p>
      <p>
        Your pitch failed because it was a list of facts instead of a story about a problem. Technical recruiters and senior engineers do not care about generic lists of skills. They want to hear about systems you built and constraints you solved. This guide explains how to build a short verbal pitch that gets developers excited to see your work.
      </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Elevator pitch structure comparison">
          <rect x="0" y="0" width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-950" />
          <text x="350" y="30" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100 font-bold text-sm">Technical Pitch Blueprint</text>
          
          {/* Rambling Pitch */}
          <rect x="40" y="60" width="280" height="250" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="180" y="85" textAnchor="middle" className="fill-red-500 font-semibold text-xs">Rambling Pitch (Glazed Eyes)</text>
          
          <rect x="60" y="110" width="240" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" />
          <text x="70" y="125" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[10px]">Lists ten different coding tools</text>
          <text x="70" y="140" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Confuses the listener about your specialty</text>
          
          <rect x="60" y="160" width="240" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" />
          <text x="70" y="175" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[10px]">Focuses on what you want from them</text>
          <text x="70" y="190" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Says hire me instead of offering value</text>

          <rect x="60" y="240" width="240" height="55" rx="6" className="fill-red-50 dark:fill-red-950/20 stroke-red-200 dark:stroke-red-900" />
          <text x="180" y="258" textAnchor="middle" className="fill-red-600 dark:fill-red-400 text-[10px] font-semibold">Ninety Second Monologue</text>
          <text x="180" y="272" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Listener checks phone and gets distracted</text>

          {/* Targeted Pitch */}
          <rect x="380" y="60" width="280" height="250" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="520" y="85" textAnchor="middle" className="fill-emerald-500 font-semibold text-xs">Targeted Pitch (Instant Connection)</text>
          
          <rect x="400" y="110" width="240" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="410" y="125" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[10px]">Mentions one specific system win</text>
          <text x="410" y="140" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Focuses on reducing database latency</text>
          
          <rect x="400" y="160" width="240" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="410" y="175" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[10px]">Ends with an easy action step</text>
          <text x="410" y="190" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Let them scan a clean link on your screen</text>

          <rect x="400" y="210" width="240" height="85" rx="6" className="fill-emerald-50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-900" />
          <text x="520" y="228" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[10px] font-semibold">Thirty Second Hook</text>
          <text x="520" y="245" textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-300 text-[9px] font-medium">Invites the listener to ask questions</text>
          <text x="520" y="260" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[8px]">Starts with a clear statement of value</text>
          <text x="520" y="275" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[8px]">Details a project they can test live</text>
        </svg>
      </div>

      <h2 className={h2}>Eradicate the Skills List</h2>
      <p>
        Do not begin your pitch by listing programming languages. Saying that you write JavaScript, Python, Rust, and Go is a red flag. It makes you look like a beginner who has only finished basic syntax tutorials.
      </p>
      <p>
        Instead, pick one primary language and one system domain. You should tell the listener you build real-time communication tools with Node or optimize database performance in Go.
      </p>
      <p>
        This gives the listener a clear picture of what you actually do. It makes you look like a specialist who knows how to solve problems. Generalists are hard to place in a team. Specialists get hired because they can fix the specific bottlenecks a company faces.
      </p>
      <p>
        Keep your list of tools to a minimum. Mentioning too many libraries makes your message weak. It prevents the listener from remembering your core strength.
      </p>

      <h2 className={h2}>Highlight One Technical Win</h2>
      <p>
        Your pitch must include a concrete example of a project you built. Do not just say you build web apps. Talk about a specific application that is currently live.
      </p>
      <p>
        Explain the main challenge you solved. For example you can say you built a distributed crawler that handles twenty thousand requests per minute. You can mention that you reduced database query response times by forty percent.
      </p>
      <p>
        These numbers give your pitch credibility. They prove you have dealt with real-world system issues. It changes the topic from what you studied to what you have actually shipped.
      </p>
      <p>
        If you have not built high-traffic applications focus on the database structures you designed. Explain why you selected a specific index structure. This proves you understand system architecture.
      </p>

      <div className={callout}>
        <h3 className={h3}>Focus on the performance metrics</h3>
        <p>
          Always include a performance metric in your project description. Mentioning request times or latency values shows you think like a systems engineer.
        </p>
      </div>

      <h2 className={h2}>Adapt the Pitch for Engineers</h2>
      <p>
        When you talk to an engineering manager or a senior developer you must use systems language. They do not care about broad marketing terms or generic project names.
      </p>
      <p>
        Explain your work in terms of architecture and code quality. Speak about how you handle database connections or structure your React components. Discuss the trade-offs you made when choosing your state management tool.
      </p>
      <p>
        An engineer wants to know if they would enjoy reviewing your code. They want to see if you understand standard practices like git workflows and unit testing. If you show that you care about these details you will build trust immediately.
      </p>
      <p>
        Keep the conversation technical but focused. Do not get lost in minor details unless they ask a specific question. Let them guide the depth of the discussion.
      </p>

      <h2 className={h2}>Adapt the Pitch for Recruiters</h2>
      <p>
        Recruiters do not write code. If you talk about connection pools or memory allocation to a non-technical recruiter their eyes will glaze over immediately.
      </p>
      <p>
        When pitching to a recruiter you must map your skills to the requirements in their job description. Focus on the core stack they are searching for. Mention your experience working in team settings and meeting shipping deadlines.
      </p>
      <p>
        Recruiters are looking for risk factors. They want to know if you are reliable and can work well with others. Speak about your collaboration on open source projects or how you helped coordinate tasks during a hackathon.
      </p>
      <p>
        Translate your technical achievements into business value. Explain how your database optimization saved money on hosting or allowed the team to onboard new users faster. This helps the recruiter understand your impact without needing to know the underlying code.
      </p>

      <h2 className={h2}>Structure the Call to Action</h2>
      <p>
        Every good pitch must end with a clear action step. Do not just stop talking and hope they ask a question. Give them a simple way to see your work.
      </p>
      <p>
        Ask if they would like to see a live demo of your application. Keep the URL ready on your phone. You can use a QR code that points directly to your web profile.
      </p>
      <p>
        This is much faster than exchanging emails or searching for names on social sites. It allows the engineer to check your work in seconds. They can see your code and architecture write-up immediately.
      </p>
      <p>
        To make sharing your details easy you can read about <Link href="/link" className={link}>sending your CV as a web link</Link> instead of a paper format. A clean link is the best tool for live networking.
      </p>

      <h2 className={h2}>Adapt for Hackathons</h2>
      <p>
        Pitching at a hackathon is different from pitching at a meetup. At a hackathon you are looking for team members or trying to impress judges.
      </p>
      <p>
        Focus your pitch on the problem you want to solve during the event. Explain the user impact and the technical stack you plan to use.
      </p>
      <p>
        State exactly what skills you need on your team. You can say you have the backend architecture ready and need a designer to build the interface.
      </p>
      <p>
        This clarity helps other developers self-select. It prevents you from wasting time talking to people who do not match your project requirements. It keeps the team formation process moving fast.
      </p>
      <p>
        Keep your pitch focused on what can actually be built in forty-eight hours. Judges and potential teammates will reject plans that are too complex to finish during the weekend.
      </p>

      <h2 className={h2}>Practice the Delivery</h2>
      <p>
        Your pitch must sound natural. If you sound like you are reading a script the listener will lose interest.
      </p>
      <p>
        Practice saying your pitch out loud. Record yourself and listen to the speed of your voice. You should aim to speak slowly and clearly.
      </p>
      <p>
        Keep the total length under thirty seconds. This ensures you do not dominate the conversation. It leaves room for the listener to respond and ask questions.
      </p>
      <p>
        Remember that a pitch is the beginning of a conversation. It is not a complete lecture about your career history. Your goal is simply to get them interested enough to click your link.
      </p>
      <p>
        If you want to know what projects carry the most weight in a pitch look at the <Link href="/projects" className={link}>best personal projects for a software CV</Link> to select a project to discuss. Choosing the right project makes your pitch much more effective.
      </p>
      <p>
        Make sure you also practice how you respond to follow-up questions. When an engineer asks a deeper question about your architecture answer honestly. If you do not know the answer admit it and explain how you would research the solution.
      </p>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/link" className={link}>Sending Your CV as a Web Link Instead of a PDF File</Link></li>
        <li><Link href="/projects" className={link}>Best Personal Projects to Put on a Software CV</Link></li>
        <li><Link href="/portfolio" className={link}>Best Portfolio Platforms for Developers</Link></li>
      </ul>
    </div>
  );
}
