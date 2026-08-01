import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
 A software engineer wants to apply for a senior infrastructure role. The job description lists AWS, Kubernetes, and Terraform as mandatory requirements. The engineer has used AWS and Kubernetes in production for years. However, they have never configured Terraform, having used CloudFormation for all their infrastructure tasks instead. They are tempted to add Terraform to their skills list to pass the automated screening.
 </p>

      <p>
 They hesitate because they know that listing tools they have not used is dangerous. If they get asked a deep architectural question about Terraform state files in the technical interview, they will fail immediately. Faking skills kills your credibility with engineering managers. You must align your actual background with the job requirements honestly without pretending to be someone you are not.
 </p>

      <p>
 This guide will explain how to align your experience with job postings safely. We will discuss how to highlight related technologies to prove you can do the work. We will show you how to frame your architectural knowledge to satisfy both parsers and hiring managers. We will also describe how to manage conversations about technical gaps during your interview loop.
 </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="A diagram demonstrating how to align skills conceptually with a job description.">
          <rect x="0" y="0" width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-950" />
          <text x="350" y="30" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100 font-bold text-sm">Conceptual Skill Alignment Mapping</text>
          
          {/* Job Requirements */}
          <rect x="40" y="70" width="220" height="230" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="150" y="95" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-xs">Job Description Stack</text>
          
          <rect x="60" y="120" width="180" height="150" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="75" y="145" className="fill-zinc-500 dark:fill-zinc-400 text-[10px]">• AWS Cloud Platform</text>
          <text x="75" y="175" className="fill-zinc-500 dark:fill-zinc-400 text-[10px]">• Kubernetes Container Orchestration</text>
          <text x="75" y="205" className="fill-zinc-500 dark:fill-zinc-400 text-[10px]">• Terraform Infrastructure as Code</text>

          {/* Alignment Arrows */}
          <path d="M 270 140 L 410 140" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
          <path d="M 270 170 L 410 170" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
          <path d="M 270 200 L 410 230" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />

          {/* Candidate Profile */}
          <rect x="440" y="70" width="220" height="230" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="550" y="95" textAnchor="middle" className="fill-emerald-500 font-semibold text-xs">Safe Profile Alignment</text>
          
          <rect x="460" y="120" width="180" height="150" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="475" y="145" className="fill-zinc-800 dark:fill-zinc-200 font-9px">• AWS (Direct Match)</text>
          <text x="475" y="175" className="fill-zinc-800 dark:fill-zinc-200 font-9px">• Kubernetes (Direct Match)</text>
          <text x="475" y="205" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">• CloudFormation (Conceptual match)</text>
          <text x="475" y="220" className="fill-zinc-800 dark:fill-zinc-200 font-medium text-[8px]">Highlighted as Infrastructure as Code</text>
        </svg>
      </div>

      <h2 className={h2}>The Difference Between Faking and Translating</h2>
      <p>
 There is a big difference between faking a skill and translating your experience. Faking is claiming you used a tool in a production environment when you have never touched it. Translating is explaining that your experience with one tool makes you competent in a similar tool.
 </p>

      <p>
 Recruiters write job descriptions based on the specific tools their team currently uses. If they use Terraform, they write Terraform on the posting. However, engineering managers know that infrastructure principles are the same across different systems.
 </p>

      <p>
 If you used CloudFormation to build networks, you understand the core concepts of infrastructure definition, resource mapping, and change management. You can translate this experience to Terraform. You simply need to learn a new configuration format.
 </p>

      <p>
 Describe your achievements using conceptual language. Instead of writing that you are a Terraform expert, write that you built infrastructure as code pipelines using CloudFormation. This shows you understand the underlying engineering discipline.
 </p>

      <p>
 Faking tools leads to immediate interview failure. When an interviewer asks you to detail the debugging of a state lock or a resource corruption in Terraform, a self-taught helper course will not cover the reality. You will look dishonest, and that ends your candidacy.
 </p>

      <h2 className={h2}>How to Map Your Experience to Missing Technologies</h2>
      <p>
 When you identify a gap in your technical stack, you must map your experience to the missing tool. Identify the category of the tool and check if you have used a competitor.
 </p>

      <p>
 For instance, if the job description requires Vue but you have used React, highlight your deep knowledge of component architectures, state management, and virtual document object models. Explain how these concepts apply to Vue.
 </p>

      <p>
 Write about your ability to adapt to new frameworks. You could write a bullet point describing how you onboarded to a new framework in under two weeks. This proves to the hiring team that you are a fast learner.
 </p>

      <p>
 This conceptual mapping satisfies the screening systems that look for technical depth. It tells the recruiter that you have the foundational skills needed to succeed in the role.
 </p>

      <p>
 Consider the case of cloud platforms. If a job requires Google Cloud Platform but you only know AWS, the underlying patterns remain identical. Virtual machines, object storage, and access policies exist in both ecosystems. Explain that you understand cloud security and compute scaling, and mention your AWS achievements as proof.
 </p>

      <h2 className={h2}>Understanding T-Shaped Skill Frameworks</h2>
      <p>
 A great way to structure your technical alignment is to think of your skills as a T-shaped profile. The vertical bar of the T represents your deep expertise in a specific area. The horizontal bar represents your broad understanding of other engineering concepts.
 </p>

      <p>
 Hiring managers look for candidates with this structure. They know that a developer who is deep in one backend language can quickly pick up another language. Your profile should highlight your depth while showing your adaptability.
 </p>

      <p>
 If a posting requires a specific tool you lack, look at your depth. Show that your core engineering skills are strong enough to compensate for the missing tool. This makes the gap look minor to the reviewer.
 </p>

      <div className={callout}>
        <h3 className={h3}>Highlight concepts</h3>
        <p>
 Write about the design principles of the systems you built. This shows you understand why tools are used, how to run them.
 </p>
      </div>

      <h2 className={h2}>The Proof of Concept Project Strategy</h2>
      <p>
 If you want to list a missing tool on your profile honestly, you should build a proof of concept project. Spend a weekend learning the basics of the technology. Build a simple, hosted application that uses the tool.
 </p>

      <p>
 List this project on your profile. State clearly that you built this application to test the capabilities of the technology. Include a link to the code repository.
 </p>

      <p>
 This project proves that you can learn new tools quickly. It shows you have the initiative to bridge your own technical gaps. It changes a missing skill into an active learning achievement.
 </p>

      <p>
 Hacking your profile by listing keywords without projects is lazy. Building a real system to learn a tool shows that you are a proactive developer. It is a highly respected signal in technical recruiting.
 </p>

      <p>
 You can even write about what you learned during the project build. Compare the new tool with the competitor you already know. This analytical comparison shows high technical maturity.
 </p>

      <h2 className={h2}>Avoiding the Copy Paste Trap</h2>
      <p>
 Some candidates try to improve their profiles by copying the job description text word-for-word. They insert the exact phrases of the posting into their experience bullets. You must avoid this technique.
 </p>

      <p>
 Modern tracking systems are programmed to identify exact matches. If your profile reads like a duplicate of the job posting, the system will flag it as suspicious. The recruiter will assume you are cheating the system.
 </p>

      <p>
 You must rephrase the requirements in your own voice. Use your own metrics and details to describe your work. This shows that your achievements are real and unique to your career history.
 </p>

      <p>
 Using a web profile link is a great way to handle this mapping. You can write custom summaries for different roles without changing the core details of your work history.
 </p>

      <p>
 If you want to know more about proving skills honestly, read our guide on how to avoid <Link href="/trust" className={link}>fake skills lists</Link> on your CV. If you want to know how keywords are scanned, read our guide on how to <Link href="/screening" className={link}>get past AI screening</Link> systems. If you want to know how to present personal learning achievements, check out our guide on the <Link href="/projects" className={link}>best personal projects for developers</Link> to show capabilities.
 </p>

      <h2 className={h2}>Talking About Gaps in the Interview</h2>
      <p>When a manager asks about a tool you listed as adjacent experience, answer with transfer steps. <span className={bold}>I have not run Terraform in production, but I managed CloudFormation stacks for three years including state drift recovery and module versioning. I would ramp on Terraform syntax in the first sprint.</span> That answer is honest and competent.</p>
      <p>Never bluff through a live whiteboard on unfamiliar tooling. Interviewers remember integrity failures longer than skill gaps they expected to train anyway.</p>

      <h2 className={h2}>Tailoring Without Rewriting History</h2>
      <p>Reorder bullets so the most relevant project sits first under your current role. Swap the summary sentence that names the target domain. Link to the case study that matches the posting. Your employment dates and employers stay fixed. Only emphasis changes.</p>
      <p>A hosted profile on <Link href="/link" className={link}>a single URL</Link> makes that emphasis swap fast. You are not regenerating PDFs per company.</p>

      <h2 className={h2}>Red Flags That Scream Misalignment</h2>
      <p>Listing every tool in the job description without project backing is the fastest way to fail a technical screen. Another red flag is identical bullets copied from the posting with your company names swapped in. Recruiters run similarity checks more often than candidates expect.</p>
      <p>Safe alignment sounds like your voice, names your real employers, and ties each tool to a shipped outcome you can whiteboard on demand.</p>

      <h2 className={h2}>Working With Recruiters on Skill Translation</h2>
      <p>Agency recruiters often ask you to add buzzwords to get past client filters. Push back with a conceptual mapping they can sell honestly. <span className={bold}>Candidate operated CloudFormation at scale; Terraform is a syntax change, not a discipline change.</span> Good recruiters prefer that script because it survives the hiring manager phone screen.</p>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/trust" className={link}>Stop Faking Your Skills List</Link></li>
        <li><Link href="/screening" className={link}>Best Ways to Get Past AI CV Screening</Link></li>
        <li><Link href="/projects" className={link}>Best Personal Projects to Put on a Software CV</Link></li>
      </ul>
    </div>
  );
}
