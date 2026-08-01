import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <h2 className={h2}>Files Look Different Everywhere</h2>
        <p>You spent hours getting the margins right in Google Docs, exported a clean PDF, and sent it off. The problem? The recruiter opened it on their phone during lunch.</p>
        <p>Your two-column layout is now a jumbled mess of overlapping text that requires pinching and zooming just to read your name. This is a common issue with <Link href="/mobile" className={link}>non-responsive resumes</Link>. They close it and move on.</p>
        <div className={callout}>
          <h3 className={h3}>The hard truth about PDF rendering</h3>
          <ul className={ul}>
            <li><span className={bold}>60%+ of initial screens</span> now happen on mobile devices</li>
            <li>A PDF is locked to 8.5×11 inches, which is terrible for a 6-inch phone</li>
            <li>Custom fonts can fail to embed, wrecking your spacing entirely</li>
            <li>Transparent overlays from Canva sometimes render as opaque blocks</li>
          </ul>
        </div>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 660 300" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Left Column Header */}
            <text x="165" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-red-500 dark:fill-red-400">PDF Attachment</text>

            {/* Right Column Header */}
            <text x="495" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-400">Web Link</text>

            {/* Divider */}
            <line x1="330" y1="10" x2="330" y2="290" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

            {/* LEFT COLUMN. 6 painful steps */}
            {/* Step 1 */}
            <rect x="90" y="48" width="150" height="32" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
            <text x="165" y="69" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Open Email</text>

            <line x1="165" y1="80" x2="165" y2="96" className="stroke-red-300 dark:stroke-red-700" strokeWidth="1.5" />
            <polygon points="160,93 165,100 170,93" className="fill-red-300 dark:fill-red-700" />

            {/* Step 2 */}
            <rect x="90" y="100" width="150" height="32" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
            <text x="165" y="121" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Download File</text>

            <line x1="165" y1="132" x2="165" y2="148" className="stroke-red-300 dark:stroke-red-700" strokeWidth="1.5" />
            <polygon points="160,145 165,152 170,145" className="fill-red-300 dark:fill-red-700" />

            {/* Step 3 */}
            <rect x="90" y="152" width="150" height="32" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
            <text x="165" y="173" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Find in Downloads</text>

            <line x1="165" y1="184" x2="165" y2="200" className="stroke-red-300 dark:stroke-red-700" strokeWidth="1.5" />
            <polygon points="160,197 165,204 170,197" className="fill-red-300 dark:fill-red-700" />

            {/* Step 4 */}
            <rect x="90" y="204" width="150" height="32" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
            <text x="165" y="225" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Open PDF Viewer</text>

            <line x1="165" y1="236" x2="165" y2="252" className="stroke-red-300 dark:stroke-red-700" strokeWidth="1.5" />
            <polygon points="160,249 165,256 170,249" className="fill-red-300 dark:fill-red-700" />

            {/* Step 5 */}
            <rect x="90" y="256" width="150" height="32" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-200 dark:stroke-red-800" strokeWidth="1" />
            <text x="165" y="277" textAnchor="middle" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Pinch-Zoom to Read</text>

            {/* Friction label */}
            <text x="165" y="300" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-red-400 dark:fill-red-500">5 steps of friction</text>

            {/* RIGHT COLUMN. 3 smooth steps */}
            {/* Step 1 */}
            <rect x="420" y="90" width="150" height="36" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
            <text x="495" y="113" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Click Link</text>

            <line x1="495" y1="126" x2="495" y2="150" className="stroke-emerald-400 dark:stroke-emerald-600" strokeWidth="1.5" />
            <polygon points="490,147 495,154 500,147" className="fill-emerald-400 dark:fill-emerald-600" />

            {/* Step 2 */}
            <rect x="420" y="155" width="150" height="36" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
            <text x="495" y="178" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">View Profile</text>

            <line x1="495" y1="191" x2="495" y2="215" className="stroke-emerald-400 dark:stroke-emerald-600" strokeWidth="1.5" />
            <polygon points="490,212 495,219 500,212" className="fill-emerald-400 dark:fill-emerald-600" />

            {/* Step 3 */}
            <rect x="420" y="220" width="150" height="36" rx="6" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
            <text x="495" y="243" textAnchor="middle" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-700 dark:fill-zinc-300">Share ✓</text>

            {/* Smooth label */}
            <text x="495" y="274" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-emerald-500 dark:fill-emerald-400">Zero friction</text>
          </svg>
        </div>

        <h2 className={h2}>Security Rules Kill Attachments</h2>
        <p>Enterprise email systems at large companies <span className={bold}>strip PDFs from emails entirely</span> or quarantine them for 24 hours. By the time your resume clears, fifty other candidates who sent <Link href="/link" className={link}>clean profile links</Link> have already been reviewed.</p>
        <p>Even when it goes through, every attachment requires the recipient to download a file, which is a real friction point. Modern hiring is about speed.</p>
        
        <h2 className={h2}>The Versioning Nightmare</h2>
        <p>When you send an attachment, you lose control of the content. If you find a better way to describe your current project or catch a minor error, that PDF in their inbox is now a historical relic. You cannot update it. This is why many candidates are <Link href="/update" className={link}>switching to live profiles</Link> where they can fix typos instantly.</p>
        <div className={callout}>
          <h3 className={h3}>The advantage of the living document</h3>
          <p>A web profile is always current. If a recruiter clicks your link three days after you sent it, they see your latest accomplishments. You can even tailor the content specifically for different phases of the interview process without ever sending a second file.</p>
        </div>

        <h2 className={h2}>Common Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>What if a job portal strictly requires a file upload?</h3>
            <p>If an ATS system absolutely mandates a document upload, we recommend submitting a simple, plain-text document and pasting your CVin.Bio URL prominently at the top. This guarantees the automated parser reads your keywords perfectly, while the human recruiter gets to click your link to view your beautifully formatted profile.</p>
          </div>
          <div>
            <h3 className={h3}>What if the recruiter does not have internet?</h3>
            <p>In modern corporate hiring, this is virtually impossible. Recruiters use cloud-based tools (ATS, LinkedIn, Slack) all day. If they cannot access your URL, they cannot access their job posting either.</p>
          </div>
          <div>
            <h3 className={h3}>Is a link less professional than a file?</h3>
            <p>Currently, it is perceived as more professional in the tech industry. It shows technical fluency and a focus on the recipient&apos;s user experience.</p>
          </div>
        </div>

        <h2 className={h2}>What Happens Inside the ATS</h2>
        <p>When you attach a PDF to a job portal, the file lands in a parser before any human sees it. The parser extracts text, maps fields, and stores a profile record. If extraction fails, your application still exists, but your skills array might be empty and your job titles might be gibberish. Recruiters filter on structured fields. Empty fields mean you never appear in search results.</p>
        <p>A URL sidesteps that pipeline for the human review stage. The recruiter clicks, reads a rendered page, and forms an opinion in seconds. You still upload a plain file if the form requires it, but the link is what they remember. This is why <Link href="/bypass" className={link}>dual submission strategies</Link> work: plain text for the bot, rich profile for the person.</p>

        <h2 className={h2}>Email Clients Treat Attachments as Risk</h2>
        <p>Corporate inboxes flag unknown attachments. Recruiters get dozens of resumes per day from strangers. Security training tells them not to open unexpected files. A link to a known domain feels safer than a binary download. Gmail and Outlook also preview links with titles and snippets. Your name and headline show up before they click. Attachments show a paperclip icon and a file size.</p>
        <div className={callout}>
          <h3 className={h3}>The preview card advantage</h3>
          <p>Paste your CVin.Bio URL into Slack or email and watch the preview load. <span className={bold}>Your face, title, and first line of summary appear inline.</span> That is free marketing in the inbox. PDFs do not get previews. They get ignored.</p>
        </div>

        <h2 className={h2}>Sharing and Forwarding</h2>
        <p>Hiring is a team sport. The recruiter forwards your profile to the engineering manager, who forwards it to a tech lead. With a PDF, each forward attaches another copy. Version chaos starts immediately. With a URL, everyone sees the same live page. If you <Link href="/update" className={link}>fix a typo or add a project</Link> at 3 PM, the whole panel sees the update before the 4 PM debrief.</p>
        <p>URLs also work in every tool: ATS notes, LinkedIn messages, Greenhouse comments, Notion hiring docs. PDFs need to be downloaded, re uploaded, and re opened. Links just work.</p>

        <h2 className={h2}>When You Still Need a File</h2>
        <p>Some government contractors and legacy portals only accept uploads. Export a single column, 11pt Arial PDF with no graphics. Put your profile URL in the header next to your email. The parser gets clean text. The human gets the real experience. Never send only the file if you have any channel to send the link.</p>
        <p>For cold outreach, lead with the link in the first sentence. &quot;Profile: cvin.bio/yourname&quot; beats &quot;Attached please find my resume&quot; every time. Respect the reader&apos;s time and device. They are probably on a phone between meetings.</p>

        <h2 className={h2}>Attachment Size and Mobile Downloads</h2>
        <p>Large PDFs fail on mobile networks before they fail in ATS. A 3 MB file on a subway connection blocks the recruiter from reading anything. They move to the next candidate whose link loaded instantly. Keep files small if you must attach, but default to URLs that load in under two seconds on 4G.</p>
        <p>Calendar invites and scheduling links also work better as URLs embedded in email signatures. The recruiter books your screen without downloading your life story first.</p>

        <h2 className={h2}>Legal and Compliance Filters</h2>
        <p>Some enterprises block executable attachments and unknown file types. PDFs usually pass, but macro enabled documents do not. Links to HTTPS profiles pass more consistently because security teams whitelist major hosting patterns. A cvin.bio link looks like any other professional site request.</p>
        <p>Healthcare and finance recruiters often work inside strict DLP tools. Minimize friction. One click beats one download that triggers a security review queue.</p>

        <h2 className={h2}>Candidate Experience Is Recruiter Experience</h2>
        <p>Every friction step you add is a micro rejection. Download, open, zoom, scroll sideways, hunt for email, copy email, open mail client. Each step loses a fraction of readers. Links collapse that chain to one tap. Treat your application like a product funnel with measurable drop off. Remove steps.</p>
        <p>Ask a friend to open your application package on their phone while timed. Count seconds to your strongest bullet. Compare PDF package versus link package. The gap usually shocks candidates who designed on a 27 inch monitor.</p>

        <h2 className={h2}>Subject Line Plus Link Wins</h2>
        <p>Email subject lines with your target role and one metric outperform generic subjects. Body text should be three sentences max with the profile URL above the fold. Attachments below the fold get ignored even when the email opens.</p>
        <p>Recruiters forward short emails. They rarely forward attachment heavy threads. Make the forwardable unit a link and two lines of context.</p>

        <h2 className={h2}>Closing the Loop After You Share a Link</h2>
        <p>When a recruiter clicks your profile, they often decide in one session. Make the top third complete: current role, contact method, strongest metric, link to best project. Missing email or broken LinkedIn in that zone wastes the click you earned.</p>
        <p>Follow up three days later with one new line of value, not a second attachment. &quot;Added the case study you asked about to my profile&quot; beats &quot;see revised PDF attached.&quot;</p>
        <p>Treat every outbound application as a product funnel. Measure clicks if you can. Shorten the path from inbox to your best bullet. Remove every step that does not increase clarity or trust.</p>
        <p>The best candidates make recruiters feel safe clicking. Known domain, clear preview, zero download. That safety converts to interviews faster than polished attachments from strangers.</p>
        <p>Default to links in 2026. Keep a plain PDF in reserve for legacy portals. Lead with the format that respects how recruiters actually open candidate materials on phones.</p>
        <p>Every attachment is a request for trust without giving convenience first. Links offer convenience upfront. In competitive inboxes convenience wins attention.</p>
        <p>Make the link the hero of every application and watch how much faster conversations start.</p>

        <h2 className={h2}>Filename hygiene for the backup PDF</h2>
        <p>Name files Firstname_Lastname_Role.pdf, not resume_final_v9.pdf. Recruiters search downloads folders by your name days later. Generic filenames get deleted with temp files. The PDF is a fallback. Make it findable when someone finally opens it on desktop.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/pdf" className={link}>Why complex PDFs break recruiter algorithms</Link></li>
          <li><Link href="/inbox" className={link}>Standing out in crowded application inboxes</Link></li>
        </ul>
      </div>
  );
}
