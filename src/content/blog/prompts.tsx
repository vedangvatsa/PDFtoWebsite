import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
 A tired hiring manager sits in front of a laptop late at night. They have a stack of four hundred applications for a single senior developer role. Instead of reading each page, they open an AI interface. They copy the entire text of the job description and upload a zip file of the applications. They type a short paragraph instructing the model to reject anyone without heavy database scaling experience or who lists generic soft skills.
 </p>
      
      <p>
 The AI model finishes the work in twelve seconds. It outputs a neat list of ten candidates and provides a brief summary explaining why it rejected the other three hundred and ninety people. The hiring manager never looks at the rejected profiles. Your years of hard work were summarized and dismissed by a software algorithm in a fraction of a second.
 </p>

      <p>
 Large language models have replaced the keyword scanning tools of the past decade. They do look for exact word matches. They read your entire profile to evaluate your technical depth and career trajectory. To survive this filter, you must understand the exact instructions these systems receive.
 </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="A diagram illustrating how large language models screen applications based on prompt instructions.">
          <rect x="0" y="0" width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-950" />
          <text x="350" y="30" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100 font-bold text-sm">Large Language Model Screening Flow</text>
          
          {/* Inputs */}
          <rect x="30" y="70" width="200" height="80" rx="6" className="fill-white dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="130" y="100" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-xs">Profile Text Input</text>
          <text x="130" y="125" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[10px]">Unstructured work history data</text>

          <rect x="30" y="180" width="200" height="80" rx="6" className="fill-white dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="130" y="210" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-xs">System Prompt Input</text>
          <text x="130" y="235" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[10px]">Manager instructions and constraints</text>

          {/* Connection Arrows to LLM */}
          <path d="M 230 110 L 320 160" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
          <path d="M 230 220 L 320 180" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />

          {/* LLM Engine */}
          <rect x="340" y="120" width="120" height="100" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" />
          <text x="400" y="165" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-50 font-bold text-xs">LLM Engine</text>
          <text x="400" y="185" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[10px]">Context Analysis</text>

          {/* Connection Arrows from LLM */}
          <path d="M 460 170 L 520 170" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" fill="none" />

          {/* Output */}
          <rect x="540" y="70" width="130" height="80" rx="6" className="fill-emerald-50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-900" strokeWidth="1.5" />
          <text x="605" y="105" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 font-bold text-xs">Shortlist Pass</text>
          <text x="605" y="125" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Quantifiable achievements</text>

          <rect x="540" y="180" width="130" height="80" rx="6" className="fill-red-50 dark:fill-red-950/20 stroke-red-200 dark:stroke-red-900" strokeWidth="1.5" />
          <text x="605" y="215" textAnchor="middle" className="fill-red-600 dark:fill-red-400 font-bold text-xs">Rejected Stack</text>
          <text x="605" y="235" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Vague descriptions</text>
        </svg>
      </div>

      <h2 className={h2}>How Companies Structure AI Screening Prompts</h2>
      <p>
 Modern companies do not use simple search terms anymore. They write detailed, multi-step instructions for large models to analyze candidate data. These instructions are called system prompts. They define the criteria for what makes a candidate acceptable or not.
 </p>
      
      <p>
 A typical system prompt starts by defining a role for the model. The model is told to act as an expert technical recruiter who has twenty years of experience in hiring software engineers. The prompt then provides a set of strict rules for evaluating the text of the application.
 </p>

      <p>
 The prompt instructs the model to scan for evidence of system ownership and scale. It explicitly tells the model to ignore generic list of technologies that lack context. It commands the model to look for physical numbers and percentage improvements in the work history section.
 </p>

      <p>
 Finally, the prompt specifies negative filters. It tells the model to downrate profiles that use empty corporate phrases. The model is ordered to flag profiles that show short job stays without contract explanations. This structured instruction turns the model into an aggressive filter.
 </p>

      <h2 className={h2}>The Outlier Filter Prompt</h2>
      <p>
 The most common screening prompt format is the outlier filter. Recruiters write prompts that ask the model to identify candidates who stand out from the average pool. The prompt instructs the model to search for specific architectural achievements rather than everyday coding tasks.
 </p>
      
      <p>
 For instance, the prompt might instruct the model to look for candidates who have managed databases larger than five hundred gigabytes. It tells the model to seek out engineers who have resolved memory issues in production. It asks the model to isolate candidates who have migrated infrastructure without downtime.
 </p>

      <p>
 If your profile only states that you built web applications, you will fail this filter. The model will compare your generic phrasing against the specific requirements in the prompt. It will conclude that you lack the deep system knowledge required for the role.
 </p>

      <p>
 To pass this filter, you must rewrite your achievements. You must describe the size of your user base and the speed of your systems. You must show that you understand the details of the tools you use.
 </p>

      <div className={callout}>
        <h3 className={h3}>Detail system parameters</h3>
        <p>
 State the scale of your systems. Mention transaction rates and storage limits. This gives the AI model the physical numbers it needs to score your profile highly.
 </p>
      </div>

      <h2 className={h2}>The Soft Skill Purge Prompt</h2>
      <p>
 Recruiters are tired of reading profiles that list communication and leadership as skills. They write prompts that tell the model to ignore these claims. The prompt instructs the model to search for behavioral proof instead of simple declarations.
 </p>

      <p>
 For example, the prompt might say to ignore phrases like team player or self starter. It tells the model to look for bullets that describe mentoring junior engineers or writing system design documents. It asks for proof of collaboration across different teams.
 </p>

      <p>
 If you list soft skills in a dedicated block, the model will disregard them. It will search your work history for evidence of these traits. If the evidence is not there, the model will mark your profile as weak.
 </p>

      <p>
 Instead of claiming you have great communication skills, describe how you worked. Explain how you documented a complex API to help three other teams integrate their services. This concrete detail proves your value to the model.
 </p>

      <h2 className={h2}>The Technology Context Prompt</h2>
      <p>
 Another popular prompt format focuses on technology context. The prompt instructs the model to check if the candidate has used tools in a professional setting. It tells the model to verify if the skills list is supported by the work history bullets.
 </p>

      <p>
 The prompt tells the model to identify how long you used each technology. It instructs the model to flag profiles that list thirty different tools but only explain four of them in the job descriptions. The model detects this as a sign of keyword stuffing.
 </p>

      <p>
 You must ensure your skills list matches your experience. If you list a database engine at the top of your page, you must write a bullet point about it in your work history. You must describe how you used that database to solve a real problem.
 </p>

      <p>
 This alignment build trust with both the AI model and the human recruiter. It shows that you have practical experience with the tools you claim to know. It protects your profile from being flagged as misleading.
 </p>

      <h2 className={h2}>How to Design Your Profile to Beat LLM Prompts</h2>
      <p>
 Beating these prompts does not require complex tricks. You do not need to hide white text in the background of your document. You simply need to write your profile with the structure that the model is looking for.
 </p>

      <p>
 Use a clean single column layout. This layout ensures the model can read your work history in a logical sequence. It prevents parsing errors that occur when models read across multiple columns.
 </p>

      <p>
 Write short sentences that start with action verbs. Describe your achievements with clear metrics. State the tools you used and the results you achieved in every single bullet point.
 </p>

      <p>
 Using a web profile link is a great way to handle this. Web profiles offer clean structural data that is easy for models to parse. They prevent formatting errors that occur when converting documents to text.
 </p>

      <p>
 You should also ensure your writing is direct. Avoid long introductions and get straight to the facts. The model will score your profile based on the density of your technical achievements.
 </p>

      <p>
 For more advice on getting past AI models, read our guide on how to <Link href="/screening" className={link}>get past AI screening</Link> systems. If you want to clean up your skills list, check out our guide on avoiding <Link href="/trust" className={link}>fake skills lists</Link> to build professional trust.
 </p>

      <h2 className={h2}>The Ranking and Scoring Prompt</h2>
      <p>
 Some companies go beyond pass or fail. They ask the model to rank every candidate on a scale from one to ten and return only the top five. The prompt instructs the model to weight recent experience more heavily, penalize unexplained job gaps, and reward quantified outcomes.
 </p>
      <p>
 A profile with three strong bullets scoring eight out of ten beats a profile with twelve weak bullets scoring five. Density of proof matters more than length. Cut filler paragraphs. Replace them with one sentence that includes a number.
 </p>
      <p>
 The ranking prompt also compares candidates against each other. If everyone in the pool lists React, the model looks for who shipped something meaningful with it. Generic project descriptions collapse in relative scoring. Specific deployment stories rise.
 </p>

      <h2 className={h2}>Industry-Specific Prompt Variations</h2>
      <p>
 A fintech hiring prompt weights compliance and transaction volume. A healthcare prompt looks for HIPAA experience and audit trail configuration. A startup prompt cares about zero-to-one product launches and small team ownership.
 </p>
      <p>
 Read the job posting carefully. The language in the posting often mirrors the screening prompt. If the posting mentions SOC 2, PCI, or FDA validation, those terms should appear in your work history with context. Not in a skills list. In a bullet that explains what you built.
 </p>
      <p>
 Staffing agencies sometimes run their own prompts before forwarding candidates to clients. Their prompts tend to be stricter on title matching and years of experience. Keep your job titles standard and your dates accurate.
 </p>

      <h2 className={h2}>Testing Your Profile Against a Prompt</h2>
      <p>
 You can simulate screening yourself. Paste the job description and your resume into an AI chat. Ask it to act as a technical recruiter and score your fit on a scale of one to ten. Ask it to list what is missing. The gaps it identifies are the gaps a real screener will find.
 </p>
      <p>
 Run this test before every application where the role is a stretch. If the model scores you below six, either tailor your resume more aggressively or save your energy for a better match. Applying to roles where your profile clearly fails the prompt wastes everyone&apos;s time.
 </p>

      <div className={callout}>
        <h3 className={h3}>Write for the prompt reader</h3>
        <p>
 Every bullet should answer: what did you build, with what tools, at what scale, with what result? If a bullet cannot answer all four, rewrite it or delete it.
 </p>
      </div>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/screening" className={link}>Best Ways to Get Past AI CV Screening</Link></li>
        <li><Link href="/trust" className={link}>Best Ways to Prove Skills and Build Trust</Link></li>
        <li><Link href="/bullets" className={link}>Best Ways to Write Short CV Bullet Points</Link></li>
      </ul>
    </div>
  );
}
