import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        Tuesday morning. A recruiter opens your application on her phone between two standups. She taps the attachment. The PDF loads sideways. She pinches to zoom. The skills section sits off-screen. She closes it and opens the next candidate.
      </p>
      <p>
        <span className={bold}>Direct answer:</span> Use a{' '}
        <span className={bold}>CV website link</span> as your default share format. Keep a plain one-column PDF only when a portal forces a file upload. For email, Slack, LinkedIn, WhatsApp, and most referral intros, the link wins.
      </p>

      <div className={callout}>
        <h3 className={h3}>Best for whom</h3>
        <p>
          <span className={bold}>CV website:</span> cold outreach, referrals, communities, and any human who will open your profile on a phone.
          <br />
          <span className={bold}>PDF:</span> ATS upload forms that reject URLs, government portals, or print-only career fairs.
        </p>
      </div>

      <h2 className={h2}>What each format actually does</h2>
      <p>
        A PDF is a frozen document. Once you export it, every typo, broken link, and outdated job title travels with that file forever. A CV website is a live page. You fix a date, add a project, or tighten a bullet, and every link you already sent reflects the change.
      </p>
      <p>
        Recruiters notice this more than candidates expect. I have forwarded a candidate link to a hiring manager, watched them open it three days later, and seen an updated project section that was not in the original application PDF. That signals someone who maintains their public profile. A stale PDF signals someone who applied once and moved on.
      </p>

      <h2 className={h2}>Channel by channel advice</h2>

      <h3 className={h3}>Email</h3>
      <p>
        Put your CV website URL in the first screen of the message body, not buried below four paragraphs. Subject line plus one sentence plus link. Attach a PDF only if they asked for an attachment or if you are applying through a system that will strip links from the body.
      </p>
      <p>
        Worked example: &quot;Hi Priya, Marcus suggested I reach out about the platform role. Here is my profile: cvin.bio/alex-chen. Happy to walk through the payments migration work on a call.&quot; That message takes eight seconds to read. A PDF attachment forces a download, a file picker, and a zoom gesture on mobile.
      </p>
      <ul className={ul}>
        <li>Lead with the link in cold email and warm intros.</li>
        <li>Keep the PDF filename boring: FirstName-LastName-Resume.pdf.</li>
        <li>Repeat the URL in your email signature so every thread carries it.</li>
      </ul>

      <h3 className={h3}>WhatsApp and iMessage</h3>
      <p>
        Chat apps render link previews. A CV website shows your name, headline, and sometimes a profile image before anyone taps. A PDF shows a generic document icon and a file size. On a phone, that difference is the entire first impression.
      </p>
      <p>
        When a recruiter asks &quot;can you send your CV?&quot; in WhatsApp, send the link first. If they reply &quot;our HR system needs a PDF,&quot; then send the file. Do not lead with the attachment by default. Most informal hiring conversations in Southeast Asia, India, and Europe now start in chat. Meet people where they are.
      </p>

      <h3 className={h3}>LinkedIn</h3>
      <p>
        Your LinkedIn profile is not your CV. It is a discovery page. Put your CV website in the Featured section, the contact info field, and the first line of your About section. When you apply through LinkedIn Easy Apply, you still upload a PDF because the form demands it. Paste the same URL into the &quot;website&quot; or &quot;portfolio&quot; field if one exists.
      </p>
      <p>
        For InMail replies and connection notes, the link beats an attachment. LinkedIn mobile does not make PDF review pleasant. A single tap to a clean profile page keeps the conversation moving. See <Link href="/link" className={link}>how to send your CV as a web link</Link> for message templates.
      </p>

      <h3 className={h3}>ATS portals and company career sites</h3>
      <p>
        Greenhouse, Workday, Lever, and Taleo still want a file in the resume upload box. That requirement is not going away this year. Upload a plain, single-column PDF with standard fonts. Then look for secondary fields: portfolio URL, personal website, additional information, cover letter body. Put your CV website link in every optional text field that accepts a URL.
      </p>
      <p>
        This is the <Link href="/bypass" className={link}>dual-submission approach</Link>: satisfy the parser with a file, give the human a link. Hiring managers often review candidates in a different tool than the one that parsed your upload. The link is what they forward to the team.
      </p>

      <h2 className={h2}>Side-by-side comparison</h2>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-left text-base border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="py-2 pr-4 font-semibold text-zinc-900 dark:text-zinc-100">Factor</th>
              <th className="py-2 pr-4 font-semibold text-zinc-900 dark:text-zinc-100">CV website</th>
              <th className="py-2 font-semibold text-zinc-900 dark:text-zinc-100">PDF</th>
            </tr>
          </thead>
          <tbody className="text-zinc-700 dark:text-zinc-300">
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2 pr-4">Phone reading</td>
              <td className="py-2 pr-4">Native mobile layout</td>
              <td className="py-2">Often needs zoom</td>
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2 pr-4">Sharing</td>
              <td className="py-2 pr-4">Link plus preview card</td>
              <td className="py-2">Download and re-upload</td>
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2 pr-4">Updates after apply</td>
              <td className="py-2 pr-4">Edit live</td>
              <td className="py-2">Must resend file</td>
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2 pr-4">ATS portals</td>
              <td className="py-2 pr-4">Paste in portfolio field</td>
              <td className="py-2">Required on many forms</td>
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2 pr-4">Search and AI crawlers</td>
              <td className="py-2 pr-4">Structured HTML text</td>
              <td className="py-2">Harder to index</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Offline review</td>
              <td className="py-2 pr-4">Needs connection</td>
              <td className="py-2">Works offline once saved</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className={h2}>Worked scenario: referral to offer</h2>
      <p>
        Jordan gets a referral into a 40-person fintech. The referrer sends a Slack message to the VP Engineering with Jordan&apos;s CV website link. The VP opens it on a laptop during a one-on-one, clicks through to a live project, and schedules a screen. Jordan still uploads a PDF when the official application opens in Greenhouse. Same week, Jordan fixes a typo on the website. The VP sees the corrected version before the onsite. No one asks for a new PDF.
      </p>
      <p>
        If Jordan had only sent a PDF in Slack, the VP might not have opened it at all. Slack PDF previews are small. Links get full-width preview cards. That friction difference matters at the margin where most candidates live.
      </p>

      <h2 className={h2}>Common mistakes</h2>
      <ul className={ul}>
        <li>
          <span className={bold}>PDF only, everywhere.</span> You apply through a portal and never give humans a link. The hiring manager never sees your best format.
        </li>
        <li>
          <span className={bold}>Link only, no PDF backup.</span> You refuse to upload when the form requires a file. Your application stays incomplete.
        </li>
        <li>
          <span className={bold}>Broken or ugly URLs.</span> A Google Drive link with a 47-character ID reads as sloppy. Use cvin.bio/your-name or a clean custom domain.
        </li>
        <li>
          <span className={bold}>Website and PDF disagree.</span> Dates, titles, or skills differ between formats. Recruiters notice and trust drops.
        </li>
        <li>
          <span className={bold}>Designed PDF, parser-hostile PDF.</span> Two columns, icons, and text boxes break ATS extraction. Keep the upload file boring. Save design for the web page.
        </li>
        <li>
          <span className={bold}>Password-protected links.</span> If a recruiter hits a login wall, they stop. Public profile, always.
        </li>
      </ul>

      <div className={callout}>
        <h3 className={h3}>The sync rule</h3>
        <p>
          Your PDF and your CV website should tell the same story. Same job titles, same date ranges, same top three wins. Update both after a promotion or new project. Treat the PDF as a snapshot export of the website, not a separate document you maintain on its own.
        </p>
      </div>

      <h2 className={h2}>Practical checklist</h2>
      <ol className={ol}>
        <li>Publish a CV website at a short, readable URL.</li>
        <li>Export a plain one-column PDF from the same source content.</li>
        <li>Add the link to email signature, LinkedIn Featured, and GitHub bio.</li>
        <li>Default to sending the link in chat and email.</li>
        <li>Upload the PDF when a portal requires it; paste the link in every optional URL field.</li>
        <li>Test both formats on your phone before your next application batch.</li>
        <li>Re-export the PDF after any major website update.</li>
      </ol>

      <h2 className={h2}>Honest limits</h2>
      <p>
        Some government agencies, defense contractors, and legacy enterprise HR systems only accept PDF or DOC. A website cannot replace those uploads. It replaces the PDF as your default introduction to people.
      </p>
      <p>
        A few recruiters still print packets for committee review. A link does not help in a room with no Wi-Fi. Keep a PDF ready. For everyone else, lead with the page they can open in one tap.
      </p>
      <p>
        If you do not have a website yet, <Link href="/pdf-to-website" className={link}>convert your existing PDF to a CV website</Link> in a few minutes. You are not choosing between formats forever. You are choosing which one opens the door first.
      </p>

      <h2 className={h2}>International and remote candidates</h2>
      <p>
        If you are applying across time zones, your CV website loads faster than downloading a PDF on spotty mobile data in transit hubs and coworking spaces. Recruiters in London reviewing Singapore candidates at 6 AM often read on phones. A link that renders immediately beats a 2 MB attachment that stalls.
      </p>
      <p>
        Include your time zone in the headline or contact line: &quot;Based in Berlin (CET).&quot; Remote hiring managers scan for overlap hours. The website format makes that visible without opening a separate doc.
      </p>
      <p>
        Visa status is sensitive. Put work authorization in one factual line if relevant to the role. Do not bury it in paragraph three of a cover letter. Recruiters filtering for sponsorship need to see it early or everyone wastes time.
      </p>

      <h2 className={h2}>When PDF still wins</h2>
      <p>
        Print career fairs and some campus recruiting booths still collect paper packets. Academic fellowship applications sometimes require Word originals. Legal immigration filings may specify PDF attachments with exact formatting rules. In those narrow cases, lead with the required file and follow up with your website link in email.
      </p>
      <p>
        Archival systems at large enterprises store the uploaded PDF as the official record. Your live website can still be the version humans actually read during the hiring process. Think of the PDF as compliance and the link as persuasion.
      </p>

      <h2 className={h2}>Related reading</h2>
      <ul className={ul}>
        <li>
          <Link href="/pdf-to-website" className={link}>Convert a PDF resume to a website</Link>
        </li>
        <li>
          <Link href="/attachments" className={link}>Why recruiters skip unreadable CV attachments</Link>
        </li>
        <li>
          <Link href="/inbox" className={link}>Stand out with a clean URL in inboxes</Link>
        </li>
        <li>
          <Link href="/mobile" className={link}>Why your resume must work on mobile</Link>
        </li>
        <li>
          <Link href="/send" className={link}>How to send your resume to recruiters</Link>
        </li>
      </ul>
    </div>
  );
}
