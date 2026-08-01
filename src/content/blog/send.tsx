import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>A recruiter asks for your resume. You have maybe thirty seconds before the conversation moves on. What you send next matters more than most people think. the content of your resume, but the <span className={bold}>format you deliver it in</span>.</p>
        <p>I&apos;ve talked to dozens of recruiters about how they actually receive and review resumes. The differences between methods are real, and they affect whether your resume gets read or gets buried. Here are the five most common ways to send a resume, ranked from best to worst.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 640 310" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tier list ranking 5 resume delivery methods from best to worst">
            <style>{`
              .tier-title { font: bold 13px system-ui; }
              .tier-rank { font: bold 18px system-ui; fill: white; }
              .tier-label { font: bold 13px system-ui; }
              .tier-desc { font: 11px system-ui; }
            `}</style>
            <text x="320" y="22" className="tier-title fill-zinc-900 dark:fill-zinc-100" textAnchor="middle">Resume Delivery Methods. Ranked Best to Worst</text>
            {/* Tier 1: Web Link. green */}
            <rect x="40" y="40" width="560" height="44" rx="8" fill="#16a34a" opacity="0.9" />
            <text x="68" y="67" className="tier-rank">#1</text>
            <text x="108" y="59" className="tier-label" fill="white">Web Profile Link</text>
            <text x="108" y="74" className="tier-desc" fill="#bbf7d0">Loads instantly, always current, rich previews when shared</text>
            {/* Tier 2: Google Doc. lime */}
            <rect x="40" y="92" width="560" height="44" rx="8" fill="#65a30d" opacity="0.85" />
            <text x="68" y="119" className="tier-rank">#2</text>
            <text x="108" y="111" className="tier-label" fill="white">Google Doc Link</text>
            <text x="108" y="126" className="tier-desc" fill="#ecfccb">No download, updatable. but permission issues and informal look</text>
            {/* Tier 3: Plain text. yellow */}
            <rect x="40" y="144" width="560" height="44" rx="8" fill="#ca8a04" opacity="0.85" />
            <text x="68" y="171" className="tier-rank">#3</text>
            <text x="108" y="163" className="tier-label" fill="white">Plain Text in Email</text>
            <text x="108" y="178" className="tier-desc" fill="#fef9c3">Zero friction to read. but no formatting, works only for short summaries</text>
            {/* Tier 4: PDF. orange */}
            <rect x="40" y="196" width="560" height="44" rx="8" fill="#ea580c" opacity="0.85" />
            <text x="68" y="223" className="tier-rank">#4</text>
            <text x="108" y="215" className="tier-label" fill="white">PDF Attachment</text>
            <text x="108" y="230" className="tier-desc" fill="#ffedd5">Familiar but gets blocked, terrible on mobile, frozen in time</text>
            {/* Tier 5: Word Doc. red */}
            <rect x="40" y="248" width="560" height="44" rx="8" fill="#dc2626" opacity="0.85" />
            <text x="68" y="275" className="tier-rank">#5</text>
            <text x="108" y="267" className="tier-label" fill="white">Word Document</text>
            <text x="108" y="282" className="tier-desc" fill="#fecaca">Renders inconsistently, security risk, flagged by email filters</text>
            {/* Footer */}
            <text x="320" y="306" textAnchor="middle" style={{font: '11px system-ui'}} className="fill-zinc-400 dark:fill-zinc-500">Based on recruiter feedback on friction, readability, and shareability</text>
          </svg>
        </div>

        <h2 className={h2}>1. Web Profile Link</h2>
        <p>This is the best option by a wide margin. You send a URL like <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">cvin.bio/yourname</code> and the recruiter taps it. Your profile loads instantly on their phone or laptop. No downloads. No file hunting. No wondering if they have the right software to open it.</p>
        <p>The real advantage shows up when the recruiter wants to share you with the hiring manager. They paste your link into Slack, and it shows a rich preview card with your name, photo, and headline. Compare that to forwarding an email with a PDF buried three replies deep.</p>
        <p>Web profiles also solve the versioning problem. If you fix a typo or add a new project after sending the link, the recruiter sees the updated version automatically. With a file, you would need to send a second email saying &quot;please use this one instead.&quot;</p>
        <div className={callout}>
          <h3 className={h3}>Best for</h3>
          <p>Every situation. Networking events, LinkedIn DMs, email applications, and cold outreach. A URL works anywhere you can type or paste text. Tools like <Link href="/link" className={link}>CVin.Bio</Link> give you a permanent profile URL with your own name in it.</p>
        </div>

        <h2 className={h2}>2. Google Doc Link</h2>
        <p>A Google Doc link is a decent middle ground. The recruiter clicks it and sees your resume in their browser. No download needed. You can update the document after sending, and the link always points to the latest version.</p>
        <p>The problems start with permissions. If you forget to set sharing to &quot;anyone with the link,&quot; the recruiter hits an access request page. That kills momentum instantly. Some corporate firewalls also block Google Docs entirely, which means your resume never loads.</p>
        <p>Google Docs also look like, well, Google Docs. The toolbar is visible. There is a blue banner at the top. It signals &quot;draft document&quot; rather than &quot;polished professional profile.&quot; For an early-career role that might be fine. For a senior position, it can feel underdone.</p>
        <p><span className={bold}>Pros:</span> No download, always current, easy to create. <span className={bold}>Cons:</span> Permission headaches, looks informal, breaks on some corporate networks.</p>

        <h2 className={h2}>3. Plain Text in the Email Body</h2>
        <p>This one surprises people. Pasting a stripped-down version of your resume directly into the email body is actually more effective than attaching a file. The recruiter reads your qualifications the second they open the email. Zero friction.</p>
        <p>I know a hiring manager at a mid-size startup who told me she prefers plain text cold emails over anything else. Her reasoning: &quot;I&apos;m reading email on my phone between meetings. If I have to download something, I&apos;ll do it later. Later usually means never.&quot;</p>
        <p>The obvious downside is you lose all formatting. No columns, no bold headers, no skills section with nice spacing. You need to be ruthless about editing. Keep it to your name, target role, three to four best achievements, and a link to your full profile. Think of it as a trailer, not the full movie.</p>
        <p><span className={bold}>Pros:</span> Instant visibility, works on every device, no attachments to block. <span className={bold}>Cons:</span> No formatting, only works for short summaries.</p>

        <h2 className={h2}>4. PDF Attachment</h2>
        <p>This is the default choice for most job seekers, and it has real problems. Start with the fact that <Link href="/attachments" className={link}>enterprise email systems often strip or quarantine attachments</Link>. Your beautifully designed PDF might sit in a security sandbox for 24 hours while other candidates get reviewed.</p>
        <p>Even when the PDF arrives, the recruiter has to download it, find it in their downloads folder, and open it in a viewer. If they are on their phone, your carefully designed two-column layout becomes a tiny, unreadable mess that requires pinch-zooming. Over 60% of initial resume screens happen on mobile devices now.</p>
        <p>There is also the version lock problem. Once you send that file, it is frozen in time. Found a better way to describe your last project? Too bad. That old version is what the recruiter has.</p>
        <p><span className={bold}>Pros:</span> Familiar format, preserves design on desktop. <span className={bold}>Cons:</span> Gets blocked by security filters, terrible on mobile, impossible to update after sending.</p>

        <h2 className={h2}>5. Word Document</h2>
        <p>Sending a.docx file is the worst option. Every problem with PDFs applies here, plus new ones. Word documents render differently depending on which version of Word (or which alternative app) the recruiter uses. Your fonts change. Your margins shift. Your carefully aligned sections fall apart.</p>
        <p>Word files are also a bigger security risk than PDFs. They can contain macros, which means corporate email filters flag them more aggressively. Some companies block.docx attachments entirely.</p>
        <p>The only time a Word doc makes sense is when a recruiter at a staffing agency specifically asks for one. They do this because they want to strip your contact info and add their agency branding before forwarding you to the client. If that is the situation, send the.docx. Otherwise, avoid it.</p>
        <p><span className={bold}>Pros:</span> Easy to edit, some agencies require it. <span className={bold}>Cons:</span> Renders inconsistently, higher security risk, gets flagged by email filters.</p>

        <h2 className={h2}>Picking the Right Method</h2>
        <p>The situation matters. Here are a few real scenarios and what to do in each one.</p>
        <p><span className={bold}>You&apos;re at a networking event</span> and someone asks for your resume. Pull out your phone and text them your profile link. That is it. No fumbling with files. They tap the link and see everything. If you have a CVin.Bio profile, the URL is short enough to say out loud.</p>
        <p><span className={bold}>A recruiter DMs you on LinkedIn.</span> Drop your web profile link in the chat. LinkedIn renders a preview card automatically. The recruiter sees your headline and photo without leaving the conversation. If you send a PDF, LinkedIn wraps it in a download prompt that most people skip.</p>
        <p><span className={bold}>You&apos;re applying through a job portal</span> that requires a file upload. Upload a simple, clean PDF with minimal formatting. Put your profile URL at the very top of the document. The ATS parses the simple text. The human who reads it later clicks your link and sees the full, well-designed version.</p>

        <h2 className={h2}>Cold Email Subject Lines That Get Opens</h2>
        <p>The delivery method only works if the recruiter opens the message. A subject line with your target role and one concrete metric beats a generic application. Write Senior Backend Engineer, cut API latency forty percent rather than Job Application or Resume Attached.</p>
        <p>Keep the email body under one hundred fifty words when you attach nothing. Lead with the metric. Follow with your web profile link on its own line so the preview card renders cleanly. End with a single sentence about availability for a fifteen minute call.</p>
        <p>Do not attach a file and paste a web link in the same email unless a portal requires both. Pick one primary format. Two competing formats split recruiter attention and often mean neither gets read.</p>

        <div className={callout}>
          <h3 className={h3}>Track which method each company prefers</h3>
          <p>Keep a simple spreadsheet noting whether each recruiter asked for a PDF, a link, or plain text. When they reply asking for a different format, switch immediately. Matching their workflow beats defending your preferred delivery method.</p>
        </div>

        <div className={callout}>
          <h3 className={h3}>The one rule that always applies</h3>
          <p>No matter which method you use, make the recruiter&apos;s job easier. Every extra step between &quot;I received this&quot; and &quot;I can read this&quot; is a chance for them to move on to someone else. The best format is the one with the <Link href="/inbox" className={link}>fewest barriers between you and their attention</Link>.</p>
        </div>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/attachments" className={link}>Why PDF attachments are losing to web profiles</Link></li>
          <li><Link href="/link" className={link}>Should you put a URL on your resume?</Link></li>
          <li><Link href="/inbox" className={link}>How to stand out in a recruiter&apos;s inbox</Link></li>
        </ul>
      </div>
  );
}
