import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>A recruiter opens your profile and scans the top section. They see a block of text that says seeking an opportunity to use my talents and expand my career. The recruiter rolls their eyes and moves on. This statement tells the reader absolutely nothing about your capabilities. It only explains what you want from the employer. It wastes the most valuable real estate on your page.</p>
      
      <p>This is the classic failure of the career objective statement. It is a self centered paragraph filled with generic fluff words. In the modern job market employers do not care about your personal wishes. They care about the problems you can solve. You must replace this outdated intro with a value statement.</p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 300" className="w-full h-auto" role="img" aria-label="Visual comparison of outdated career objective versus modern technical value proposition.">
          <text x="170" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">Outdated Career Objective</text>
          
          <rect x="20" y="50" width="300" height="200" rx="6" className="fill-zinc-50 dark:fill-zinc-800/40 stroke-red-200 dark:stroke-red-900/50" strokeWidth="1" />
          
          <rect x="40" y="80" width="260" height="110" rx="4" className="fill-red-100/50 dark:fill-red-950/20 stroke-red-200 dark:stroke-red-900/30" strokeWidth="1" />
          <text x="50" y="105" fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-red-600 dark:fill-red-400">"Seeking an opportunity to grow..."</text>
          <text x="50" y="125" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Self-centered focus on what you want</text>
          <text x="50" y="145" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Zero proof of capability</text>
          <text x="50" y="165" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Generic filler words</text>
          
          <text x="170" y="235" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">Recruiters skip this instantly</text>
          
          <text x="530" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Modern Value Proposition</text>
          
          <rect x="380" y="50" width="300" height="200" rx="6" className="fill-emerald-50/50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-900/50" strokeWidth="1" />
          
          <rect x="400" y="80" width="260" height="110" rx="4" className="fill-emerald-100/50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-900/30" strokeWidth="1" />
          <text x="410" y="105" fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">"Full Stack Dev with 4y experience..."</text>
          <text x="410" y="125" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Built concurrent backend services</text>
          <text x="410" y="145" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Reduced API latencies by 30%</text>
          <text x="410" y="165" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Proven skills with numbers</text>
          
          <text x="530" y="235" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Grabs attention with proof</text>
          
          <line x1="350" y1="20" x2="350" y2="270" className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      <h2 className={h2}>Why Objective Statements Fail Completely</h2>
      <p>An objective statement is passive. It places the burden on the company to fulfill your desires. It reads like a list of demands rather than an offer of help. Recruiters have no interest in funding your education or helping you discover your interests.</p>
      
      <p>Furthermore these statements are packed with filler words that convey zero meaning. Phrases like passionate team player or hard worker are completely subjective. Anyone can write them. They hold no weight with hiring managers who want to see evidence.</p>
      
      <p>The top of your profile is what recruiters see first. If you waste this space on boring corporate phrases you lose the opportunity to make a strong impression. You must replace the fluff with hard facts and metrics.</p>

      <h2 className={h2}>Replacement One The Professional Summary</h2>
      <p>The first option is the professional summary. This is a short block of text that summarizes your career achievements. It focuses on your years of experience and your core skills. It tells the reader exactly who you are and what you can do.</p>
      
      <p>A good summary starts with your title and experience level. For example you can write Software Engineer with five years of experience building web applications. This is clear and direct. It sets the context for the rest of the document.</p>

      <p>You then list two or three major achievements. Focus on projects you led or systems you built. Keep this section short and punchy. It should act as an elevator pitch for your career.</p>

      <div className={callout}>
        <h3 className={h3}>The Evidence Rule</h3>
        <p>Never state that you have a skill without providing context. If you write that you know React you must follow it with an example of what you built. This proves your knowledge is real and ready for production.</p>
      </div>

      <h2 className={h2}>Replacement Two The Technical Value Proposition</h2>
      <p>The second option is the technical value proposition. This is a highly focused statement that explains the specific value you bring to a team. It is ideal for developers who specialize in a particular technology stack.</p>

      <p>To write this you must identify the primary pain point of the team you want to join. If they are struggling with slow deployments your value proposition should focus on infrastructure. Explain how your skills can solve their speed issues.</p>

      <p>Use active verbs to describe your work. Write that you design backend systems or optimize frontends. Avoid generic words. Be specific about the tools you use and the results you deliver.</p>

      <h2 className={h2}>Replacement Three Selected Core Highlights</h2>
      <p>The third option is a bulleted list of highlights. This replaces a paragraph with three or four high impact achievements. This layout is excellent for candidates who want to emphasize results over narrative.</p>

      <p>Each highlight must include a number to prove your impact. Write about how you reduced server costs or increased page load speed. These metrics show that you are focused on business outcomes rather than just writing code.</p>

      <p>This layout is very easy to scan. The recruiter can read your top achievements in five seconds. It grabs their attention and encourages them to read the rest of your history.</p>

      <h2 className={h2}>Formatting Rules for Your Intro Section</h2>
      <p>Once you choose your style you must format it correctly. Keep the length under three sentences or sixty words. If you write a long block of text the recruiter will skip it. You want to make it easy for them to find your main selling points.</p>

      <p>You can use a slightly larger font size for this intro section to make it stand out. A twelve point font is ideal if your body text is ten point. Do not use italics for the entire block. Italics are hard to read on computer monitors and look messy.</p>

      <p>Avoid using bullet points inside your paragraph summary. Mixing styles looks disorganized. If you want to use bullets choose the highlight style instead. Keep the layout clean and consistent throughout the page.</p>

      <h2 className={h2}>Vetting Your Summary Against the So What Test</h2>
      <p>Before you publish your profile you must test every sentence. Read your intro aloud and ask yourself the so what question. If a sentence does not pass this test you must rewrite it or delete it.</p>

      <p>For example if you write that you are a skilled Java developer the reader will ask so what. This is a basic requirement not an achievement. You must add the impact of your skill to make it valuable.</p>

      <p>Instead write that you used Java to build a data pipeline that processed two million records per day. This answers the question instantly. It tells the recruiter exactly why your skill matters to their business.</p>

      <h2 className={h2}>Writing Without Corporate Buzzwords</h2>
      <p>To make your intro stand out you must remove all corporate buzzwords. Delete words like synergize or interface. These words make your writing look generic and hide your actual skills.</p>

      <p>Instead use simple and direct language. Write that you worked with other teams rather than saying you collaborated across silos. Simple words are much easier to read and sound more authentic.</p>

      <p>When you write in a direct voice you show confidence. You do not need to hide behind fancy terms. Your actual achievements are enough to prove your value to the company.</p>

      <h2 className={h2}>How Web Profiles Support Your Value Statement</h2>
      <p>Static files keep your summary locked at the top of a document. If you want to change it for a different job you have to edit the file and export it again. This makes targeting different roles very tedious.</p>

      <p>A web profile allows you to update your intro in real time. You can adapt your value proposition to match the jobs you are targeting. This flexibility keeps your application fresh and aligned with current market demands.</p>

      <p>A digital profile also allows you to link your summary directly to live projects. If you mention a system you built in your intro the recruiter can click a link to view it. This provides instant proof of your work and builds trust.</p>

      <h2 className={h2}>Read Next</h2>
      <p>After upgrading your career objective you should review your layout spacing. Read our guide on the <Link href="/spacing" className={link}>best CV spacing standards</Link> to ensure your page is easy to read. You should also check out the <Link href="/fonts" className={link}>best fonts for screen rendering</Link> to make sure your text looks crisp.</p>
    </div>
  );
}
