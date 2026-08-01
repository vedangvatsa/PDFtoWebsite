import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        You already have a resume. It lives in a PDF on your laptop, maybe exported from Word or Canva. You do not need to learn Webflow, buy a template, or spend a weekend on CSS. You need a URL that opens cleanly on a recruiter&apos;s phone and stays current after you hit send.
      </p>
      <p>
        <span className={bold}>Direct answer:</span> Upload your PDF (or Word) resume to{' '}
        <Link href="/" className={link}>CVin.Bio</Link>, review the extracted content, then publish a public profile at{' '}
        <span className={bold}>cvin.bio/your-name</span>. That link is the website version of your CV. Free to create. No design tools required.
      </p>

      <div className={callout}>
        <h3 className={h3}>Best for</h3>
        <p>
          Job seekers who need a clean, mobile-friendly resume link in under five minutes. Not a custom coded portfolio with case-study galleries. Not a Canva export that breaks on small screens. A live page recruiters can open instantly.
        </p>
      </div>

      <h2 className={h2}>Why convert a PDF to a website</h2>
      <p>
        PDFs break in email threads. They look wrong on phones. They cannot update after you apply. A web CV opens in one tap, shows a preview card in Slack or WhatsApp, and lets you fix a typo on Friday that every link you sent on Monday already reflects.
      </p>
      <p>
        Recruiters forward links more often than they re-forward attachments. An attachment is a file someone has to save, find, and open. A link is a tap. When a hiring manager reviews twelve candidates on a commute, the candidates with links get opened first. For the full case against attachments, see{' '}
        <Link href="/send" className={link}>how to send your resume</Link>.
      </p>
      <p>
        A CV website also gives you structured text that search engines and AI crawlers can read. Your PDF might be a black box to automated systems. A published profile at cvin.bio/your-name is plain HTML with clear sections. That matters more each year as recruiting tools pull from public profiles and uploaded files alike.
      </p>

      <h2 className={h2}>Step-by-step conversion</h2>
      <ol className={ol}>
        <li>Go to <Link href="/" className={link}>cvin.bio</Link> and upload your PDF, Word doc, or even a photo of a printed resume.</li>
        <li>Wait for AI extraction. Review every section: name, headline, experience, education, skills.</li>
        <li>Fix parsing errors. Dates and company names are the most common mistakes.</li>
        <li>Pick a short URL slug: first name plus last initial, or first-last, nothing cute.</li>
        <li>Publish. Test the link on your phone before you share it anywhere.</li>
        <li>Add the URL to email signature, LinkedIn, and your next application messages.</li>
      </ol>
      <p>
        The whole process takes three to eight minutes if your source PDF is clean. A two-column design or heavy graphics in the source file slows extraction. If parsing struggles, simplify the PDF first: one column, standard fonts, no text boxes.
      </p>

      <h2 className={h2}>What you get vs a PDF alone</h2>
      <ul className={ul}>
        <li>Mobile layout that does not need pinch-zoom</li>
        <li>Open Graph preview when the link is pasted in chat or social</li>
        <li>Edits that apply to every link you already sent</li>
        <li>Structured data that parsers and crawlers can read reliably</li>
        <li>A single URL you can say out loud in an interview: &quot;cvin dot bio slash your name&quot;</li>
        <li>No attachment size limits in email or messaging apps</li>
      </ul>

      <h2 className={h2}>Channel-by-channel: where to use the link</h2>

      <h3 className={h3}>Email applications</h3>
      <p>
        Lead your cover email with the link. &quot;Profile: cvin.bio/sam-okafor&quot; in the first paragraph. Attach a PDF only when the job post explicitly asks for an attachment or when you are uploading through a portal that strips links from the body.
      </p>
      <p>
        Put the same URL in your email signature block. Every reply in a recruiting thread then carries your profile. Hiring managers search their inbox for your name weeks later. The signature link saves them from digging for an old attachment.
      </p>

      <h3 className={h3}>WhatsApp, Telegram, and iMessage</h3>
      <p>
        Recruiters in India, Brazil, the UAE, and much of Europe ask for CVs in chat. Send the link, not the file. Chat apps render link previews with your name and headline. PDFs show a generic document icon. On a five-inch screen, that preview card is your billboard.
      </p>
      <p>
        If they reply that HR needs a PDF for records, send the file second. You already made the good first impression with the website.
      </p>

      <h3 className={h3}>LinkedIn</h3>
      <p>
        Add your cvin.bio URL to the Featured section, the website field in contact info, and the top of your About section. When you Easy Apply, you still upload a PDF because LinkedIn requires it. Paste the same link into any optional portfolio or website field.
      </p>
      <p>
        Connection request notes have a character limit. &quot;Platform engineer, 6 yrs payments infra. cvin.bio/mei-lin&quot; fits. A PDF does not.
      </p>

      <h3 className={h3}>ATS portals (Greenhouse, Workday, Lever)</h3>
      <p>
        Upload your PDF to satisfy the required resume field. Then hunt for optional fields: personal website, portfolio, additional links, cover letter. Paste your CV website URL in every one. Recruiters often review candidates in a different view than the parser used. The link is what gets forwarded to the hiring manager.
      </p>
      <p>
        This dual approach is standard practice now. File for the machine, link for the human. Read more in <Link href="/cv-website-vs-pdf" className={link}>CV website vs PDF resume</Link>.
      </p>

      <h2 className={h2}>Worked example: before and after</h2>
      <p>
        Before: Priya applies to twenty roles. She attaches Resume_Final_v7.pdf to each email. Three recruiters open it on mobile. One replies &quot;can you resend, file won&apos;t open.&quot; She fixes a typo in bullet three and has no way to update the seventeen applications already sitting in inboxes.
      </p>
      <p>
        After: Priya publishes cvin.bio/priya-sharma. She leads every message with the link and uploads a plain PDF only where required. A recruiter she emailed two weeks ago clicks the same link and sees a new project she added yesterday. Her referrer forwards the link in Slack. The hiring manager opens it between meetings and books a screen.
      </p>
      <p>
        Same candidate. Same experience. Different delivery format. The website version removes friction at every step where a human decides whether to keep reading.
      </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 200" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="40" width="140" height="120" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" />
          <text x="90" y="85" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">PDF Upload</text>
          <text x="90" y="105" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">resume.pdf</text>
          <line x1="160" y1="100" x2="220" y2="100" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
          <polygon points="220,95 235,100 220,105" className="fill-zinc-400 dark:fill-zinc-500" />
          <rect x="240" y="40" width="140" height="120" rx="6" className="fill-amber-50 dark:fill-amber-900/20 stroke-amber-300 dark:stroke-amber-700" strokeWidth="1.5" />
          <text x="310" y="85" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">AI Extract</text>
          <text x="310" y="105" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">review edits</text>
          <line x1="380" y1="100" x2="440" y2="100" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
          <polygon points="440,95 455,100 440,105" className="fill-zinc-400 dark:fill-zinc-500" />
          <rect x="460" y="40" width="220" height="120" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1.5" />
          <text x="570" y="85" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Live CV Website</text>
          <text x="570" y="105" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">cvin.bio/your-name</text>
          <text x="350" y="185" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Upload once. Share everywhere. Edit anytime.</text>
        </svg>
      </div>

      <h2 className={h2}>Common mistakes after converting</h2>
      <ul className={ul}>
        <li>
          <span className={bold}>Publishing without proofreading extraction.</span> AI misreads dates, merges two jobs, or drops a skill. Read every line before you share.
        </li>
        <li>
          <span className={bold}>Choosing a long or silly URL slug.</span> cvin.bio/xX_dark_knight_99_Xx reads unprofessional. Use your name.
        </li>
        <li>
          <span className={bold}>Website and PDF out of sync.</span> Update both after a job change. Recruiters compare them.
        </li>
        <li>
          <span className={bold}>Replacing the PDF entirely.</span> Portals still need a file. Keep a plain export for uploads.
        </li>
        <li>
          <span className={bold}>Treating it like a portfolio site.</span> CVin.Bio is a resume page, not a marketing agency homepage. Keep it professional and scannable.
        </li>
        <li>
          <span className={bold}>Never testing on mobile.</span> Open your published link on your phone. If you squint, fix the content or spacing.
        </li>
      </ul>

      <div className={callout}>
        <h3 className={h3}>Source file quality matters</h3>
        <p>
          The cleaner your input PDF, the better the output. One column. Arial or Calibri. No icons replacing bullet points. No text inside shapes. If your current resume is a designed Canva export, export a plain version for upload, then polish the website manually after parsing.
        </p>
      </div>

      <h2 className={h2}>Practical checklist</h2>
      <ol className={ol}>
        <li>Prepare a plain, single-column PDF or Word file.</li>
        <li>Upload to CVin.Bio and review every extracted field.</li>
        <li>Choose a professional URL slug and publish.</li>
        <li>Test the link on phone and desktop.</li>
        <li>Add URL to email signature and LinkedIn Featured.</li>
        <li>Export a matching PDF for ATS uploads.</li>
        <li>Lead with the link in chat and email; attach PDF only when required.</li>
        <li>Update the website after any career change; re-export PDF to match.</li>
      </ol>

      <h2 className={h2}>Honest limits</h2>
      <p>
        CVin.Bio is a professional profile page, not a full marketing site with custom animations and case-study galleries. If you need a portfolio with deep project writeups, pair your cvin.bio link with a project site or GitHub. For most applications, the CV website is enough.
      </p>
      <p>
        Extraction is not perfect on heavily designed PDFs. Budget ten extra minutes to fix parsing on your first upload. After that, edits are fast.
      </p>
      <p>
        Some employers block external links on work networks. Your profile should still load on mobile data and home Wi-Fi. That covers 95% of recruiter review contexts.
      </p>

      <h2 className={h2}>After you publish</h2>
      <p>
        Share the link once with a trusted friend or former colleague. Ask them to open it on their phone and tell you what they see in the first five seconds. If they cannot state your role and strongest project immediately, move content up or rewrite your headline.
      </p>
      <p>
        Set a calendar reminder every 90 days to review the page. Stale profiles with an old job title hurt worse than no website at all. A live CV is a maintenance habit, like updating LinkedIn after a promotion.
      </p>
      <p>
        Track which channels drive the most replies. If WhatsApp intros convert better than cold email for your market, bias your outreach toward chat with the link ready in your clipboard. Format choice is distribution strategy, not vanity.
      </p>

      <h2 className={h2}>Related reading</h2>
      <ul className={ul}>
        <li>
          <Link href="/cv-website-vs-pdf" className={link}>CV website vs PDF resume</Link>
        </li>
        <li>
          <Link href="/mobile" className={link}>Why your resume must be mobile responsive</Link>
        </li>
        <li>
          <Link href="/link" className={link}>Sending your CV as a web link</Link>
        </li>
        <li>
          <Link href="/design" className={link}>CV design principles for engineers</Link>
        </li>
        <li>
          <Link href="/inbox" className={link}>Stand out with a clean URL in inboxes</Link>
        </li>
      </ul>
    </div>
  );
}
