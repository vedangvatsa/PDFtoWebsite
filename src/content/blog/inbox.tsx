import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>It is 7:42 AM on a Tuesday. A technical recruiter opens their inbox before the standup meeting. Forty-seven new messages since yesterday. Thirty-one of them contain the same attachment pattern: a PDF, a generic subject line, and a paragraph that starts with <span className={bold}>Please find my resume attached</span>.</p>
        <p>They have eleven minutes before their first call. They will open maybe six files. The rest get archived unread. The emails that survive are the ones that require zero setup: a link that renders a preview, a name they can pronounce, and a headline that tells them why this person matters for the role they are filling.</p>
        <p>Standing out in a recruiter inbox is not about gimmicks. It is about reducing friction at the exact moment attention is scarcest.</p>

        <h2 className={h2}>300 Identical Attachments</h2>
        <p>Picture a recruiter&apos;s inbox after posting a Senior Frontend role on LinkedIn. Within 48 hours: <span className={bold}>300 applications</span>. Each one is an email with a PDF. The filenames are all variations of the same thing:</p>
        <ul className={ul}>
          <li>&quot;John_Smith_Resume.pdf&quot;</li>
          <li>&quot;Resume_JohnSmith_2026.pdf&quot;</li>
          <li>&quot;JS_FrontendDev_Final.pdf&quot;</li>
        </ul>
        <p>Click. Download. Wait. Scan for six seconds. Close. Repeat, dozens of times per hour. The cognitive fatigue is real. This is why <Link href="/attachments" className={link}>attachments are a UX disaster</Link> for the recipient.</p>
        <p>Now imagine one email does not have an attachment. Instead, it says: <span className={bold}>&quot;My profile is at cvin.bio/david.&quot;</span> The recruiter clicks it. A polished page loads in under a second. No download. No hunting through files.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 620 310" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">

            {/* Inbox header bar */}
            <rect x="60" y="10" width="500" height="32" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="310" y="31" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Inbox. Senior Designer Role (312 applicants)</text>

            {/* Row 1 */}
            <rect x="60" y="48" width="500" height="36" rx="4" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />
            {/* Paperclip */}
            <path d="M82 58 L82 72 Q82 76 86 76 Q90 76 90 72 L90 62 Q90 56 85 56 Q80 56 80 62 L80 72" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" strokeLinecap="round" />
            <text x="102" y="71" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Resume_Smith.pdf</text>
            <text x="480" y="71" textAnchor="end" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-300 dark:fill-zinc-600">245 KB</text>

            {/* Row 2 */}
            <rect x="60" y="88" width="500" height="36" rx="4" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />
            <path d="M82 98 L82 112 Q82 116 86 116 Q90 116 90 112 L90 102 Q90 96 85 96 Q80 96 80 102 L80 112" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" strokeLinecap="round" />
            <text x="102" y="111" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">CV_Johnson_Final_v3.pdf</text>
            <text x="480" y="111" textAnchor="end" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-300 dark:fill-zinc-600">312 KB</text>

            {/* Row 3 */}
            <rect x="60" y="128" width="500" height="36" rx="4" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />
            <path d="M82 138 L82 152 Q82 156 86 156 Q90 156 90 152 L90 142 Q90 136 85 136 Q80 136 80 142 L80 152" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" strokeLinecap="round" />
            <text x="102" y="151" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Resume_Williams_2026.pdf</text>
            <text x="480" y="151" textAnchor="end" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-300 dark:fill-zinc-600">198 KB</text>

            {/* Row 4 */}
            <rect x="60" y="168" width="500" height="36" rx="4" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />
            <path d="M82 178 L82 192 Q82 196 86 196 Q90 196 90 192 L90 182 Q90 176 85 176 Q80 176 80 182 L80 192" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" strokeLinecap="round" />
            <text x="102" y="191" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">CV_Brown.pdf</text>
            <text x="480" y="191" textAnchor="end" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-300 dark:fill-zinc-600">276 KB</text>

            {/* Row 5. identical grey */}
            <rect x="60" y="208" width="500" height="36" rx="4" className="fill-zinc-50 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="0.75" />
            <path d="M82 218 L82 232 Q82 236 86 236 Q90 236 90 232 L90 222 Q90 216 85 216 Q80 216 80 222 L80 232" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" fill="none" strokeLinecap="round" />
            <text x="102" y="231" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Resume_Taylor_Updated.pdf</text>
            <text x="480" y="231" textAnchor="end" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-300 dark:fill-zinc-600">220 KB</text>

            {/* Row 6. THE STANDOUT */}
            <rect x="60" y="252" width="500" height="50" rx="6" className="fill-white dark:fill-zinc-800 stroke-emerald-400 dark:stroke-emerald-600" strokeWidth="2" />

            {/* Left accent bar */}
            <rect x="60" y="252" width="4" height="50" rx="2" className="fill-emerald-500" />

            {/* Avatar square */}
            <rect x="76" y="259" width="34" height="34" rx="5" className="fill-emerald-100 dark:fill-emerald-800" />
            <text x="93" y="281" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-300">D</text>

            {/* Name & headline */}
            <text x="122" y="274" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">David Chen. Senior Product Designer</text>
            <text x="122" y="290" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">8 yrs · Figma, Systems, Research · Ex-Spotify</text>

            {/* URL label */}
            <text x="480" y="280" textAnchor="end" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-emerald-500 dark:fill-emerald-400">cvin.bio/david</text>

            {/* Annotation arrow on right side pointing to standout row */}
            <line x1="575" y1="150" x2="575" y2="270" className="stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="1.5" />
            <polygon points="570,267 575,277 580,267" className="fill-emerald-400 dark:fill-emerald-500" />
            <text x="575" y="140" textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-500 dark:fill-emerald-400">This one</text>
            <text x="575" y="152" textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-500 dark:fill-emerald-400">gets clicked</text>
          </svg>
        </div>

        <h2 className={h2}>The Forwarding Chain</h2>
        <p>Resumes are rarely read by one person. They are forwarded from recruiters to hiring managers, and from managers to team leads. With a PDF, this chain creates multiple copies of the file floating around Slack and Email. If you find a mistake and send a "corrected" version, you have now doubled the number of files in the chain. This is a common pain point discussed in our guide on <Link href="/update" className={link}>fixing typos in real time</Link>.</p>
        <div className={callout}>
          <h3 className={h3}>The link is the single source of truth</h3>
          <p>When you share a link, everyone in the chain is looking at the same thing. If you update your profile, the entire chain is updated instantly. There is no risk of the CEO looking at "Resume_v1" while the manager looks at "Resume_Final_v3."</p>
        </div>

        <h2 className={h2}>The Visual Preview Advantage</h2>
        <p>Most email clients render link previews inline. With proper OpenGraph tags, the recruiter sees your profile card <span className={bold}>before even clicking</span>:</p>
        <div className={callout}>
          <ul className={ul}>
            <li>Your photo and headline appear inline in the email body</li>
            <li>You claim a massive chunk of visual attention with zero extra effort</li>
            <li>In a field of 300 grey paperclip icons, you are the one with an actual visual presence</li>
          </ul>
        </div>

        <h2 className={h2}>Interactive Portfolios</h2>
        <p>A web profile is for text. You can embed links to live projects, GitHub repositories, or even video introductions. A PDF that says "I built a trading platform" is a claim. A web profile with a "View Live" button that opens the actual platform is proof. Recruiters value proof over claims every single time. This contributes to the <Link href="/link" className={link}>ultimate professional brand image</Link>.</p>

        <h2 className={h2}>Subject Lines That Get Opened</h2>
        <p>Recruiters scan subject lines on mobile lock screens. Vague subjects die unread.</p>
        <ul className={ul}>
          <li><span className={bold}>Weak:</span> Application for Senior Role</li>
          <li><span className={bold}>Better:</span> Senior React engineer, 6 yrs fintech, profile at cvin.bio/alex</li>
          <li><span className={bold}>Weak:</span> Following up on LinkedIn</li>
          <li><span className={bold}>Better:</span> Re: Acme backend role, shipped payments at scale</li>
        </ul>
        <p>Put your headline and URL in the subject when the platform allows it. Some ATS inboxes strip subjects, but direct email to a hiring manager still respects this pattern.</p>

        <h2 className={h2}>Email Body Length</h2>
        <p>Three sentences is enough for a cold outreach email. Sentence one: why you are writing and which role. Sentence two: your strongest proof point with a number. Sentence three: your profile link with anchor text.</p>
        <p>Do not paste your entire CV into the email body. Attachments and pasted walls of text trigger spam filters and mobile scroll fatigue. The email is a trailer. The profile is the film.</p>
        <div className={callout}>
          <h3 className={h3}>Deliverability matters</h3>
          <p>Heavy PDF attachments increase bounce risk on corporate mail servers. A single HTTPS link with plain text weighs a few kilobytes. Your message is more likely to land in the primary tab instead of promotions or spam.</p>
        </div>

        <h2 className={h2}>Standing Out on LinkedIn InMail</h2>
        <p>LinkedIn messages compete with connection requests and recruiter spam. Paste your CVin.Bio URL and LinkedIn generates a large preview card with your OpenGraph image. That card occupies more vertical space than a text-only pitch.</p>
        <p>Lead with the link, then one line of context. Managers on LinkedIn often decide to click before they decide to read. Visual presence wins the first second.</p>

        <h2 className={h2}>Timing and Follow-Up</h2>
        <p>Tuesday through Thursday mornings see the highest recruiter response rates in most US and European markets. Monday inboxes are backlog. Friday afternoon is shutdown mode.</p>
        <p>If you sent a link, check view analytics before following up. A follow-up that says <span className={bold}>I saw you opened my profile yesterday</span> is creepy. A follow-up that adds one new data point, like a shipped feature or a talk you gave, is useful.</p>
        <p>Wait at least five business days before a second touch unless they asked for materials on a deadline.</p>

        <h2 className={h2}>When Attachments Are Still Required</h2>
        <p>Government contractors, some banks, and legacy HR portals still mandate file uploads. Send the required file and include your URL in the cover letter and the first line of the document. You are covering both compliance and convenience.</p>
        <p>Our <Link href="/bypass" className={link}>dual-submission guide</Link> explains how to format the robot-safe file while keeping the human path open.</p>

        <h2 className={h2}>Internal Referrals and Slack Shares</h2>
        <p>When an employee forwards your name in Slack, a URL becomes a rich unfurl with your photo and headline. A PDF becomes a file download prompt that many people ignore on mobile. Referral candidates already have an advantage. Do not waste it with attachment friction.</p>
        <p>Ask your referrer to paste your link directly in the internal thread. One click for the hiring manager beats <span className={bold}>can someone forward me their CV</span> two days later.</p>

        <h2 className={h2}>Mobile Preview Is the Real Interview</h2>
        <p>Most first opens happen on a phone. Send yourself your outreach email and open it on cellular data, not office WiFi. Tap your link. If your profile takes more than two seconds to show your name and headline, fix speed before sending more applications. Our <Link href="/load-time" className={link}>load time guide</Link> covers the technical fixes.</p>
        <p>A recruiter standing in a coffee queue will not pinch-zoom a PDF. They will tap a link or delete the thread.</p>

        <h2 className={h2}>Naming Files When You Must Attach</h2>
        <p>If a portal forces an attachment, name it <span className={bold}>Firstname_Lastname_Role.pdf</span>. No version numbers. No ALL CAPS. No emoji. Boring names scan cleanly in ATS file lists and look professional when a recruiter searches their downloads folder later.</p>
        <p>Put the same URL in the first line of that PDF so the attachment and the live profile never diverge.</p>

        <h2 className={h2}>Cold Outreach vs Warm Introductions</h2>
        <p>Cold email needs a sharper subject line and a link above the fold. Warm intros from employees can be shorter because trust is preloaded. In both cases, never attach a second file when the referrer already shared your URL in the internal thread. Duplicate materials create version confusion and make you look disorganized.</p>
        <p>Thank the referrer with the exact link you want forwarded so they copy-paste without improvising.</p>
        <p>One clean URL in a warm intro thread beats three attachments every time.</p>

        <h2 className={h2}>Archive Old Applications Mentally, Not Physically</h2>
        <p>When a role closes, you do not need to email a new PDF to everyone who passed. Your live profile already reflects new work. The next outreach starts fresh with the same URL and a updated subject line. That continuity is impossible when every touchpoint used a frozen file from last month.</p>

        <h2 className={h2}>Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>What if a recruiter cannot click links for security reasons?</h3>
            <p>In highly regulated industries (defense, federal government), this is common. However, for 95% of commercial companies, links are the primary way information is shared. We recommend including your URL but also providing a plain document just in case.</p>
          </div>
          <div>
            <h3 className={h3}>Does a link work in LinkedIn messages?</h3>
            <p>Yes. LinkedIn creates a beautiful, large preview card when you paste a CVin.Bio link. It takes up much more space than a tiny PDF icon, making it more likely to be clicked.</p>
          </div>
          <div>
            <h3 className={h3}>Can I track who clicked my link?</h3>
            <p>You can see total view counts. This tells you that your application was opened and even which city the viewer is in, providing a strong signal of interest.</p>
          </div>
        </div>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/link" className={link}>How URLs change your professional perception</Link></li>
          <li><Link href="/attachments" className={link}>Stop sending attachments: The technical case against PDFs</Link></li>
          <li><Link href="/load-time" className={link}>Why slow portfolios lose recruiters in under three seconds</Link></li>
        </ul>
      </div>
  );
}
