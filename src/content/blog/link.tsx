import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>A recruiter finishes a thirty-minute panel debrief and opens Slack to share two finalists with the hiring manager. One candidate attached a PDF named <span className={bold}>Resume_Final_v4.pdf</span>. The other sent a single line: <span className={bold}>cvin.bio/sarah-kim</span>. The manager clicks the link on their phone between meetings. A profile loads in under a second with a photo, headline, and three recent wins above the fold.</p>
        <p>The PDF candidate is still waiting for someone to download a file, find the right version, and forward it to three people who may each save a different copy to their desktop. The URL candidate is already in front of the decision maker with a preview card that shows up in the thread before anyone clicks.</p>
        <p>That gap is not about design taste. It is about friction, shareability, and whether your professional identity travels cleanly through the channels where hiring actually happens.</p>

        <h2 className={h2}>Sharing Is Effortless</h2>
        <p>A recruiter receives your URL and wants to share you with the hiring manager. They copy the link, paste it into Slack, and hit send. The hiring manager sees a <span className={bold}>rich preview card</span> with your photo, name, and headline, all rendered automatically.</p>
        <p>Now think about the PDF version of the same workflow. It involves downloading, hunting for the file, and re-uploading. This is why many hiring teams are choosing <Link href="/inbox" className={link}>candidates who simplify their inbox</Link>. Every step is a chance for the momentum to die.</p>

        <h2 className={h2}>Building a Personal Brand</h2>
        <p>A custom URL like cvin.bio/yourname is the beginning of your professional brand. It shows you have taken the time to shape your online presence. It moves you from being a "file on a server" to a "person with a platform." This subtle shift in status makes you more memorable when the team discusses candidates at the end of the week.</p>

        <h2 className={h2}>The Preview Card Effect</h2>
        <p>When you drop a URL into Slack, LinkedIn, iMessage, or WhatsApp, the platform automatically fetches your page metadata and renders a preview card showing:</p>
        <ul className={ul}>
          <li>Your custom OpenGraph image with your name</li>
          <li>Your current role and most impressive accolade</li>
          <li>A clean, professional summary that hooks the reader</li>
        </ul>
        <div className={callout}>
          <h3 className={h3}>Free advertising, every time</h3>
          <p>This is built into every messaging platform as the Open Graph protocol. You get a <span className={bold}>mini-billboard for your candidacy</span> every single time your URL gets pasted anywhere, completely free.</p>
        </div>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 660 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">

            {/* TOP SCENARIO. Boring Attachment */}
            <text x="30" y="24" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">What they see: Attachment</text>

            {/* Chat bubble */}
            <rect x="30" y="36" width="340" height="52" rx="10" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />

            {/* Paperclip icon (simplified) */}
            <path d="M52 54 L52 70 Q52 76 58 76 Q64 76 64 70 L64 58 Q64 50 56 50 Q48 50 48 58 L48 70" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Filename */}
            <text x="78" y="62" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">Resume_John_2026.pdf</text>
            <text x="78" y="78" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">245 KB · PDF Document</text>

            {/* Red X. boring */}
            <text x="400" y="68" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-red-400 dark:fill-red-500">← Forgettable</text>

            {/* Divider */}
            <line x1="30" y1="115" x2="630" y2="115" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />

            {/* BOTTOM SCENARIO. Rich Link Preview */}
            <text x="30" y="142" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">What they see: Link</text>

            {/* Chat bubble with link text */}
            <rect x="30" y="154" width="340" height="36" rx="10" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <text x="50" y="177" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-blue-500 dark:fill-blue-400">cvin.bio/john-doe</text>

            {/* Rich preview card */}
            <rect x="30" y="196" width="340" height="72" rx="8" className="fill-white dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1.5" />

            {/* Left color bar on preview */}
            <rect x="30" y="196" width="4" height="72" rx="2" className="fill-emerald-500" />

            {/* Avatar square */}
            <rect x="46" y="208" width="44" height="44" rx="6" className="fill-emerald-100 dark:fill-emerald-800" />
            <text x="68" y="234" textAnchor="middle" fontSize="16" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-emerald-600 dark:fill-emerald-300">JD</text>

            {/* Name & role */}
            <text x="104" y="224" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">John Doe</text>
            <text x="104" y="240" fontSize="11" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Senior Product Designer · 8 yrs exp</text>
            <text x="104" y="256" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">cvin.bio</text>

            {/* Green arrow. eye-catching */}
            <text x="400" y="240" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-emerald-500 dark:fill-emerald-400">← Eye-catching</text>
          </svg>
        </div>

        <h2 className={h2}>The Analytics Benefit</h2>
        <p>One thing an attachment can never tell you is when it has been opened. With a web profile, you can track views. Knowing that your profile was viewed three times in the last hour from a specific city gives you a clear indication that a team is currently discussing you. This information is really useful for managing your own nerves and following up at the right time.</p>

        <h2 className={h2}>The Psychology of Clean URLs</h2>
        <p>There is a subtle effect at work. When someone receives <span className={bold}>&quot;cvin.bio/james&quot;</span> versus a file called &quot;James_Lee_SeniorDev_Resume_March2026_FINAL.pdf,&quot; the URL feels more credible. This person has their act together. They are looking for a job. They are managing a career.</p>
        <p>File names with version numbers signal chaos. FINAL_v3 implies there was a v2 with a typo someone noticed at midnight. A stable URL implies you maintain one source of truth and update it in place. That is how professionals operate in every other domain. Nobody emails a new company logo PDF every time the brand team tweaks a hex code.</p>

        <h2 className={h2}>Where to Put Your URL on Every Application</h2>
        <p>Your link should appear in every channel a recruiter might touch, including the optional portfolio field buried at the bottom of an application form.</p>
        <ul className={ul}>
          <li>First line below your name on any uploaded document</li>
          <li>LinkedIn featured section and contact info</li>
          <li>Email signature while you are actively searching</li>
          <li>GitHub profile README if you are an engineer</li>
          <li>Cover letter closing paragraph with anchor text like <span className={bold}>View my full profile</span></li>
        </ul>
        <p>Repeat the same URL everywhere. Do not use a different subdomain for each platform. Consistency builds recognition. When a hiring manager sees <span className={bold}>cvin.bio/yourname</span> for the third time in a week, you stick in memory.</p>

        <h2 className={h2}>Measuring Whether Your Link Gets Clicks</h2>
        <p>View counts on a hosted profile tell you whether anyone opened your materials after an application. A spike the same day you applied to three companies is a useful signal. Zero views two weeks later might mean your link was buried in an ATS sidebar or your email landed in spam.</p>
        <p>Use that data to decide when to follow up, not to obsess over daily numbers. Recruiting timelines are noisy. One view from the right city on the right day is often enough to know you are still in consideration.</p>

        <h2 className={h2}>Custom Domains vs Hosted Profile Links</h2>
        <p>Buying <span className={bold}>yourname.dev</span> is a strong move if you already run a personal site and want full control over layout. It costs roughly twelve to twenty dollars per year plus hosting. The tradeoff is maintenance. You own uptime, SSL certificates, and mobile layout bugs.</p>
        <p>A hosted profile on CVin.Bio gives you a clean URL without server work. You upload a CV once, get schema.org markup, OpenGraph previews, and a page that stays fast on mobile. For most candidates the hosted path wins on time to ship. You can always point a custom domain at the profile later if you want both.</p>
        <div className={callout}>
          <h3 className={h3}>What recruiters actually check</h3>
          <p>They verify the link resolves over HTTPS, loads on a phone, and shows your name within two seconds. Fancy domain extensions matter less than reliability. A broken custom site hurts more than a simple hosted URL that always works.</p>
        </div>

        <h2 className={h2}>What Happens When You Fix a Typo After Sending</h2>
        <p>PDF workflows punish late corrections. You spot a wrong graduation year after hitting submit. You resend a corrected file. Now the recruiter has two attachments with similar names and no clear signal which is current. Some teams never open the second one because the first already got filed.</p>
        <p>With a URL, you fix the typo once on the live page. Everyone who bookmarked or forwarded the link sees the correction automatically. That is the same reason product teams ship web apps instead of emailed screenshots. Single source of truth scales when more than one person reads your materials.</p>
        <p>This pairs directly with <Link href="/update" className={link}>updating your profile in real time</Link> during an active search. You are not asking anyone to re-download anything.</p>

        <h2 className={h2}>URLs and Applicant Tracking Systems</h2>
        <p>Most modern ATS products detect hyperlinks in uploaded documents and render them as clickable fields in the recruiter view. Greenhouse, Lever, and Ashby all surface links in candidate profiles. The parser may still garble your layout, but the URL often survives as plain text even when columns fail.</p>
        <p>That is why the dual-submission pattern from our <Link href="/bypass" className={link}>ATS bypass guide</Link> works: plain text file for the robot, prominent URL for the human. You are not betting your candidacy on one fragile format.</p>

        <h2 className={h2}>Security Concerns Recruiters Raise</h2>
        <p>Some enterprise security teams train recruiters to avoid unknown attachments. Links get less scrutiny than executables and macro-enabled documents because they do not install software locally. A reputable HTTPS profile on a known host is closer to visiting LinkedIn than opening a stranger&apos;s PDF.</p>
        <p>Still, use a recognizable domain. Random free hosting subdomains with long strings look like phishing. A path like <span className={bold}>cvin.bio/firstname-lastname</span> reads intentional and professional in the same way <span className={bold}>github.com/username</span> does.</p>

        <h2 className={h2}>Print and PDF Export From Your Live Profile</h2>
        <p>Some HR teams still ask for a PDF on day one of onboarding. Generate it from your live profile when needed instead of maintaining a separate Word file that drifts out of date. The web version stays canonical. The PDF becomes a snapshot, not a second career narrative you have to sync by hand.</p>
        <p>That workflow also helps when a legacy portal requires an upload but you still want recruiters to see your designed page. Upload the export, paste the URL on line two. Both paths stay aligned.</p>

        <h2 className={h2}>Common Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className={h3}>Will people think my URL is spam?</h3>
            <p>Not if you use a clean, professional domain like cvin.bio. In modern tech recruiting, URLs for portfolios and GitHub are the standard expectation.</p>
          </div>
          <div>
            <h3 className={h3}>Can I hide my profile if I am not currently looking?</h3>
            <p>Yes. You can toggle your profile to "Private" or "Draft" anytime. Unlike a PDF, you maintain full control over who sees your data and when.</p>
          </div>
          <div>
            <h3 className={h3}>How do I change my URL?</h3>
            <p>You can customize your slug (the "james" in cvin.bio/james) once per account. We recommend using your first and last name for maximum searchability.</p>
          </div>
        </div>

        <h2 className={h2}>Next Steps</h2>
        <ul className={ul}>
          <li><Link href="/inbox" className={link}>How to use clean URLs to stand out in a crowded inbox</Link></li>
          <li><Link href="/update" className={link}>The hidden benefit of being able to fix typos in real time</Link></li>
          <li><Link href="/mobile" className={link}>Why your profile must load cleanly on a phone</Link></li>
          <li><Link href="/discover" className={link}>How machine-readable profiles get found by AI agents</Link></li>
        </ul>
      </div>
  );
}
