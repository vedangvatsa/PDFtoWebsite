import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        The interview ends. You close the video calling software or walk out of the company offices. Your hands are slightly sweaty. You think you did well. You answered the system design questions, wrote clean code in the editor, and got along with the engineering lead. Now, the waiting game starts.
      </p>
      <p>
        One day passes. Then three days. Then a week. You hear nothing. You check your email client every ten minutes. You feel anxious. You wonder if you should send a message. You think: "Should I ask if they made a decision? Will I look desperate? Will they reject me if I nudge them?"
      </p>
      <p>
        Most developers handle the follow-up process poorly. They either send desperate notes asking for updates, or they stay completely silent. Both approaches are mistakes. A follow-up is not just a polite task. It is a chance to show your engineering habits. It is another opportunity to prove you are a high-value candidate.
      </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Technical interview follow up timeline showing the best times to send emails">
          {/* Background grid */}
          <rect x="0" y="0" width="700" height="350" rx="12" className="fill-zinc-50 dark:fill-zinc-950 stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1" />
          
          {/* Timeline Line */}
          <line x1="100" y1="180" x2="600" y2="180" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="4" />
          
          {/* Step 1: Hour 2 */}
          <g transform="translate(150, 0)">
            <circle cx="0" cy="180" r="16" className="fill-emerald-500 stroke-white dark:stroke-zinc-950" strokeWidth="3" />
            <text x="0" y="150" textAnchor="middle" fontSize="12" fontWeight="600" className="fill-zinc-800 dark:fill-zinc-200">Hour 2</text>
            <text x="0" y="220" textAnchor="middle" fontSize="12" fontWeight="bold" className="fill-zinc-900 dark:fill-zinc-100">The Thank You</text>
            <text x="0" y="240" textAnchor="middle" fontSize="10" className="fill-zinc-500 dark:fill-zinc-400">Short, specific note</text>
            <text x="0" y="255" textAnchor="middle" fontSize="10" className="fill-zinc-500 dark:fill-zinc-400">mentioning design talk</text>
          </g>

          {/* Step 2: Day 3 */}
          <g transform="translate(350, 0)">
            <circle cx="0" cy="180" r="16" className="fill-emerald-500 stroke-white dark:stroke-zinc-950" strokeWidth="3" />
            <text x="0" y="150" textAnchor="middle" fontSize="12" fontWeight="600" className="fill-zinc-800 dark:fill-zinc-200">Day 3</text>
            <text x="0" y="220" textAnchor="middle" fontSize="12" fontWeight="bold" className="fill-zinc-900 dark:fill-zinc-100">The Value Add</text>
            <text x="0" y="240" textAnchor="middle" fontSize="10" className="fill-zinc-500 dark:fill-zinc-400">Send code repository fix</text>
            <text x="0" y="255" textAnchor="middle" fontSize="10" className="fill-zinc-500 dark:fill-zinc-400">or design doc update</text>
          </g>

          {/* Step 3: Day 7 */}
          <g transform="translate(550, 0)">
            <circle cx="0" cy="180" r="16" className="fill-zinc-400 dark:fill-zinc-600 stroke-white dark:stroke-zinc-950" strokeWidth="3" />
            <text x="0" y="150" textAnchor="middle" fontSize="12" fontWeight="600" className="fill-zinc-800 dark:fill-zinc-200">Day 7</text>
            <text x="0" y="220" textAnchor="middle" fontSize="12" fontWeight="bold" className="fill-zinc-900 dark:fill-zinc-100">The Recruiter Nudge</text>
            <text x="0" y="240" textAnchor="middle" fontSize="10" className="fill-zinc-500 dark:fill-zinc-400">Polite schedule check</text>
            <text x="0" y="255" textAnchor="middle" fontSize="10" className="fill-zinc-500 dark:fill-zinc-400">keep details light</text>
          </g>
          
          <text x="350" y="50" textAnchor="middle" fontSize="14" fontWeight="bold" className="fill-zinc-900 dark:fill-zinc-100">Technical Follow-Up Timeline</text>
          <text x="350" y="75" textAnchor="middle" fontSize="12" className="fill-zinc-400 dark:fill-zinc-500">Every message should offer context or value. Never just ask for status.</text>
        </svg>
      </div>

      <h2 className={h2}>The Silent Period After Technical Interviews</h2>
      <p>
        The silence after an interview is rarely a sign of rejection. In most cases, it is simply the result of corporate friction. Recruiters are scheduling other candidates, managers are busy launching products, and human resources teams are debating salaries. The people who interviewed you have regular work to finish. Your hiring status is just one task on their long list.
      </p>
      <p>
        Knowing this helps you stay calm. It also changes how you follow up. If you send an email saying, "Hi, just checking in to see if you have any updates," you are adding work to their day. The recruiter has to reply with a generic update because they do not have a final decision yet. This makes you look impatient.
      </p>
      <p>
        Instead, you should treat the follow-up as a way to share more value. If you discussed a technical challenge during the interview, use your follow-up to show you are still thinking about it. This changes the message from a demand to a contribution.
      </p>

      <h2 className={h2}>Why Generic Thank You Notes Get Ignored</h2>
      <p>
        Most candidates send a polite, generic thank-you note within two hours of their interview. "Thank you for your time today. I enjoyed meeting the team and learning about the company. I look forward to hearing from you."
      </p>
      <p>
        These notes do not hurt your chances, but they do not help them either. They are visual noise. The recruiter reads it, replies with "Thanks John," and forgets about it. The message has zero signal.
      </p>
      <p>
        A great thank-you note must be highly specific. It should mention a particular topic from your conversation. If the engineering manager explained how they handle database replication lag, mention that. If the frontend lead talked about their styling libraries, mention that. This proves that you were listening carefully and that you care about their engineering problems.
      </p>
      <p>
        When you make your follow-ups technical, you stand out from candidates who only write polite templates. It shows you think like a developer, not just a job applicant. It also gives you a reason to link back to your public work, which is why having an active web profile is so useful.
      </p>

      <h2 className={h2}>The Value Add Follow Up Strategy</h2>
      <p>
        The best way to follow up is to deliver a small piece of engineering work based on your interview. This is called the "value-add follow-up." It is a powerful way to prove your interest and skills.
      </p>
      <p>
        Think about the coding challenge or system design discussion you had. Did you make a small mistake on the whiteboard? Did you suggest an architecture that could be improved? Did the interviewer mention a edge case you did not handle?
      </p>
      <div className={callout}>
        <h3 className={h3}>Fix the code or expand the design</h3>
        <p>
          Go home, write the fix, and host it. Or write a short document explaining how you would solve the edge case. Send a link to this update. Say, "I was thinking about the database scaling scenario we discussed. I wrote a quick proof of concept to handle the replication lag. You can see the code and run it at cvin.bio/priya."
        </p>
      </div>
      <p>
        This strategy is incredibly effective. It shows that you do not just code for interviews. It proves that you are curious, that you take feedback well, and that you write code to solve problems. It turns a theoretical discussion into a concrete deliverable.
      </p>

      <h2 className={h2}>Templates For Every Stage of The Process</h2>
      <p>
        Here are three templates you can use at different times after your interview.
      </p>
      <p>
        Template One is the "Immediate Specific Thank You." Send this two hours after the meeting: <span className={bold}>"Hi Sarah, thanks for taking the time to explain the database setup today. I loved hearing about how your team manages replication lag with Go. Our conversation got me thinking about query caching. I look forward to the next steps."</span>
      </p>
      <p>
        Template Two is the "Day Three Code Fix." Use this to share a technical update: <span className={bold}>"Hey Jordan, I was thinking about the API edge case we discussed on Tuesday. I wrote a small middleware function to handle that rate-limiting scenario. You can see the code and system specs at cvin.bio/priya. Let me know if that aligns with how your team handles it."</span>
      </p>
      <p>
        Template Three is the "Recruiter Nudge." Send this seven days after the interview if you have heard nothing: <span className={bold}>"Hi Alex, I hope you are having a great week. I wanted to check in on the schedule for the backend role. I am still very interested in the team after my talk with Jordan. Let me know if you need any further technical details or links."</span>
      </p>

      <h2 className={h2}>Keeping Your Professional Profile Updated in Real Time</h2>
      <p>
        If you use the value-add follow-up strategy, you must have a quick way to share your updates. If you attach a PDF to every email, you will create a mess. The manager will have to download multiple files, and version control becomes impossible.
      </p>
      <p>
        A live web profile is the ideal solution. When you host your CV at a permanent link, you can add new project links and code samples anytime. If you write a fix for the interview challenge, you can add it to your profile in seconds. When the hiring manager opens your link, they will see your latest work.
      </p>
      <p>
        This gives you a massive advantage. Your professional profile is not a static document. It is a live dashboard of your engineering capabilities. For more ideas on how to manage this, read our guide on <Link href="/update" className={link}>how to update your CV after sending it</Link>.
      </p>

      <h2 className={h2}>Frequently Asked Questions</h2>
      <div className="space-y-6">
        <div>
          <h3 className={h3}>What if I made a major coding mistake in the interview?</h3>
          <p>
            Write the fix immediately and send it. Do not apologize for the mistake. Simply say, "I realized there was a cleaner way to write that function. Here is the updated code." Interviewers care more about your ability to fix mistakes than your ability to be perfect under pressure.
          </p>
        </div>
        <div>
          <h3 className={h3}>How many times should I follow up before giving up?</h3>
          <p>
            Follow up twice. Once with a thank-you note, and once a week later to check the schedule. If you get no reply after the second message, stop. Continuing to write makes you look desperate and wastes your energy.
          </p>
        </div>
        <div>
          <h3 className={h3}>Should I follow up with the recruiter or the engineering manager?</h3>
          <p>
            Send the thank-you note and code updates to the engineering manager because they appreciate the technical context. Send scheduling questions to the recruiter because they handle the hiring pipeline.
          </p>
        </div>
      </div>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/update" className={link}>The Hidden Advantage of Fixing Typos Anytime</Link></li>
        <li><Link href="/send" className={link}>Best Ways to Send Your CV to a Recruiter</Link></li>
        <li><Link href="/code-samples" className={link}>Best Ways to Display Code Samples to Recruiters</Link></li>
      </ul>
    </div>
  );
}
