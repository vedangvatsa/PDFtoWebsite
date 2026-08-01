import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>AI screening is the first wall between you and a real conversation with a hiring manager. Roughly 75% of resumes get rejected by automated systems before a person ever looks at them. Some of those rejections are fair. But a lot of good candidates get tossed because of formatting issues, missing keywords, or file types the parser chokes on.</p>
        <p>These seven tactics are ranked by how much they actually change results. The first one is the most effective because it removes the screening step entirely. The rest help you survive the filter when you have no choice but to go through it.</p>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 560 260" className="w-full h-auto" role="img" aria-label="Two paths to a recruiter: through ATS filter vs direct web link">
            <style>{`
              .flow-label { font: 600 12px system-ui; }
              .flow-small { font: 500 10px system-ui; }
              .flow-heading { font: 600 14px system-ui; }
              .flow-tag { font: 700 10px system-ui; }
            `}</style>
            {/* Path A - Through ATS */}
            <text x="280" y="20" textAnchor="middle" className="flow-heading fill-zinc-500 dark:fill-zinc-400">Two Paths to the Recruiter</text>
            <text x="56" y="50" className="flow-tag fill-zinc-400 dark:fill-zinc-500">PATH A: FILE UPLOAD</text>
            {/* You box */}
            <rect x="20" y="60" width="80" height="40" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="60" y="84" textAnchor="middle" className="flow-label fill-zinc-700 dark:fill-zinc-300">You</text>
            {/* Arrow to ATS */}
            <line x1="100" y1="80" x2="148" y2="80" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" markerEnd="url(#arrowGray)" />
            <text x="124" y="72" textAnchor="middle" className="flow-small fill-zinc-400 dark:fill-zinc-500">.docx</text>
            {/* ATS box */}
            <rect x="150" y="60" width="100" height="40" rx="6" className="fill-red-50 dark:fill-red-900/20 stroke-red-300 dark:stroke-red-600" strokeWidth="1.5" />
            <text x="200" y="78" textAnchor="middle" className="flow-label fill-red-600 dark:fill-red-400">AI Filter</text>
            <text x="200" y="92" textAnchor="middle" className="flow-small fill-red-400 dark:fill-red-500">ATS / Bot</text>
            {/* Rejected branch */}
            <line x1="200" y1="100" x2="200" y2="140" className="stroke-red-300 dark:stroke-red-600" strokeWidth="1.5" />
            <rect x="160" y="142" width="80" height="30" rx="5" className="fill-red-100 dark:fill-red-900/30 stroke-red-300 dark:stroke-red-600" strokeWidth="1" />
            <text x="200" y="161" textAnchor="middle" className="flow-small fill-red-500 dark:fill-red-400">✕ Rejected</text>
            <text x="200" y="186" textAnchor="middle" className="flow-small fill-red-400 dark:fill-red-500">~75% of resumes</text>
            {/* Passed branch */}
            <line x1="250" y1="80" x2="320" y2="80" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" markerEnd="url(#arrowGray)" />
            <text x="285" y="72" textAnchor="middle" className="flow-small fill-zinc-400 dark:fill-zinc-500">if passed</text>
            {/* Recruiter box for Path A */}
            <rect x="322" y="60" width="90" height="40" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
            <text x="367" y="84" textAnchor="middle" className="flow-label fill-zinc-700 dark:fill-zinc-300">Recruiter</text>
            {/* Path B - Direct link */}
            <text x="56" y="220" className="flow-tag fill-emerald-600 dark:fill-emerald-400">PATH B: WEB LINK ★</text>
            {/* You box */}
            <rect x="20" y="228" width="80" height="40" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="1.5" />
            <text x="60" y="252" textAnchor="middle" className="flow-label fill-zinc-700 dark:fill-zinc-300">You</text>
            {/* Arrow directly to recruiter */}
            <line x1="100" y1="248" x2="320" y2="248" className="stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="2" markerEnd="url(#arrowGreen)" />
            <text x="210" y="240" textAnchor="middle" className="flow-small fill-emerald-600 dark:fill-emerald-400">cvin.bio/you → no filter, no parsing</text>
            {/* Recruiter box for Path B */}
            <rect x="322" y="228" width="90" height="40" rx="6" className="fill-emerald-50 dark:fill-emerald-900/30 stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="1.5" />
            <text x="367" y="252" textAnchor="middle" className="flow-label fill-emerald-700 dark:fill-emerald-300">Recruiter</text>
            {/* Winner badge */}
            <rect x="432" y="232" width="110" height="32" rx="6" className="fill-emerald-100 dark:fill-emerald-900/40 stroke-emerald-400 dark:stroke-emerald-600" strokeWidth="1" />
            <text x="487" y="252" textAnchor="middle" className="flow-label fill-emerald-700 dark:fill-emerald-300">100% read rate</text>
            {/* Arrow markers */}
            <defs>
              <marker id="arrowGray" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8" className="fill-none stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
              </marker>
              <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8" className="fill-none stroke-emerald-500 dark:stroke-emerald-400" strokeWidth="1.5" />
              </marker>
            </defs>
          </svg>
        </div>

        <h2 className={h2}>1. Send a Web Profile Link</h2>
        <p>This is the single best thing you can do. When a recruiter clicks a URL and reads your profile in a browser, there is no AI filter between you and them. No parsing. No keyword scoring. No risk that a two-column layout confuses the system. They just read your profile the way you designed it.</p>
        <p>A clean link like <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">cvin.bio/yourname</code> works everywhere. Drop it in an email, a LinkedIn message, or a Slack thread. The recruiter sees your profile instantly. This is why <Link href="/link" className={link}>putting a URL on your resume</Link> is worth doing even if you still submit a file through the portal.</p>
        <p>Best for: anyone who can email or message a recruiter directly, networking contacts, referrals, and any situation where you are not forced into a portal upload.</p>

        <h2 className={h2}>2. Match the Job Posting Language</h2>
        <p>AI screeners compare your resume text against the job description. If the posting says &quot;CI/CD pipelines&quot; and you wrote &quot;continuous integration and deployment workflows,&quot; the system might not connect the two. It sounds obvious, but most people do not do this.</p>
        <p>Open the job posting in one tab and your resume in another. Go line by line through the requirements. If they say &quot;React,&quot; write &quot;React.&quot; Not &quot;ReactJS.&quot; Not &quot;React.js.&quot; Use their exact phrasing. You can read more about this in our guide to <Link href="/bots" className={link}>beating AI resume bots</Link>.</p>
        <div className={callout}>
          <h3 className={h3}>Quick example</h3>
          <p>Job posting says: &quot;Experience with Kubernetes and containerized deployments.&quot;</p>
          <p>Bad: &quot;Worked with Docker and cloud infrastructure.&quot;</p>
          <p>Good: &quot;Managed Kubernetes clusters and containerized deployments for 12 microservices in production.&quot;</p>
        </div>

        <h2 className={h2}>3. Use Standard Section Headers</h2>
        <p>AI parsers look for specific section names to figure out what part of your resume they are reading. When you get creative with headers like &quot;Where I&apos;ve Made an Impact&quot; instead of &quot;Experience,&quot; the parser may dump that entire section into an &quot;other&quot; bucket. Then your five years of engineering work gets ignored.</p>
        <p>Stick with headers the machines expect: <span className={bold}>Experience, Education, Skills, Projects, Certifications.</span> Save the creativity for your bullet points, where it actually helps.</p>

        <h2 className={h2}>4. Skip Tables, Columns, and Graphics</h2>
        <p>Two-column layouts look great on a screen. They also confuse most resume parsers. The system reads left-to-right, top-to-bottom. When your content is in two columns, it might read the left column header followed by the right column content. Your &quot;Senior Engineer at Stripe&quot; gets mashed together with &quot;Python, Go, SQL&quot; from the sidebar.</p>
        <p>Tables are even worse. Most parsers extract table content as a flat string with no structure. Graphics, icons, and progress bars for skills? The parser sees nothing. Those are invisible. If you want to understand the full scope of this problem, read <Link href="/pdf" className={link}>how PDFs break in applicant tracking systems</Link>.</p>
        <p>Best for: anyone submitting through an online portal or applicant tracking system.</p>

        <h2 className={h2}>5. Put Keywords in Context</h2>
        <p>A skills block at the top that says &quot;Python, AWS, Docker, Terraform, PostgreSQL&quot; is fine. But newer AI screeners also look at where and how you used those technologies. A keyword sitting alone in a list carries less weight than one embedded in a real accomplishment.</p>
        <p>Instead of just listing &quot;Terraform,&quot; write something like: &quot;Built Terraform modules that cut provisioning time from 4 hours to 15 minutes across 3 AWS regions.&quot; Now the system sees Terraform, AWS, and a quantified result all in one sentence.</p>
        <p>This also helps when a human eventually reads your resume. A list of 30 technologies tells them nothing. A few well-placed keywords inside real stories tell them everything.</p>

        <h2 className={h2}>6. Save as Plain.docx</h2>
        <p>If the application portal requires a file upload, use.docx over PDF. This is not a style preference. It is a parsing reliability issue. The.docx format stores text as structured XML that machines can read cleanly. PDFs store text as positioned characters on a virtual page, which means the parser has to guess where one word ends and another begins.</p>
        <p>Keep the.docx simple. One column. Standard fonts like Arial or Calibri. No text boxes, no headers/footers with contact info (many parsers skip those), and no images.</p>
        <div className={callout}>
          <h3 className={h3}>When PDF is okay</h3>
          <p>If you are emailing your resume directly to a person (not uploading to a portal), PDF is fine because no parser is involved. The human just opens the file. But the moment you are going through an ATS, switch to.docx.</p>
        </div>

        <h2 className={h2}>7. Add a Clean URL at the Top</h2>
        <p>Even when you have to submit a file, put a link to your full web profile right below your name. Something like: &quot;Full profile: cvin.bio/yourname.&quot; This gives the recruiter a way out of the ATS view. Many recruiters will click the link just to see a better-formatted version of your background.</p>
        <p>This also future-proofs you. When the recruiter shares you with the hiring manager later, they forward the URL, not the file. Your web profile has your latest updates, proper formatting, and no parsing artifacts. You can learn more about this approach in our post on <Link href="/bypass" className={link}>bypassing applicant tracking systems</Link>.</p>

        <h2 className={h2}>What Matters Most</h2>
        <p>The top of this list matters the most. Sending a web link (#1) removes AI screening from the equation entirely. Matching the job language (#2) and using standard headers (#3) are the two changes that give you the biggest improvement when you do go through a portal.</p>
        <p>The bottom of the list still matters. But if you only have 20 minutes before a deadline, spend those minutes on tactics 1 through 3.</p>
        <div className={callout}>
          <h3 className={h3}>The short version</h3>
          <p><span className={bold}>Skip the filter entirely</span> by sending a direct link. When that is not possible, <span className={bold}>speak the same language as the job posting</span> and keep your formatting dead simple. Everything else is tuning on top of those basics.</p>
        </div>

        <h2 className={h2}>Testing Your Resume Before You Submit</h2>
        <p>Before you upload to a portal, paste your resume text into a plain text editor. If the structure looks scrambled, the ATS will see the same mess. Job titles mixed with skills, dates separated from company names, bullet points running together into one paragraph. That preview takes thirty seconds and catches most formatting failures.</p>
        <p>Some tools let you upload a resume and see the parsed output. Jobscan and Resume Worded are popular options. They are not perfect mirrors of every ATS, but they flag obvious problems like missing section headers or unreadable columns.</p>
        <p>Another quick test: copy your resume into ChatGPT and ask it to extract your job titles, companies, and dates into a table. If the model struggles, a production parser will struggle too.</p>

        <h2 className={h2}>What Happens After You Pass the Filter</h2>
        <p>Passing AI screening only gets you into the recruiter queue. You still compete against every other candidate who passed. At this stage the recruiter opens your file and spends thirty to sixty seconds deciding if you are worth a phone screen.</p>
        <p>That means your top section still matters after the bot approves you. The recruiter is looking for a reason to call you, not a reason to reject you. Clear headlines, quantified bullets, and a working profile link all help at this stage. A resume that survived parsing but reads like a wall of undifferentiated text will still get passed over.</p>
        <p>Think of screening as two gates. The first gate is the machine. The second gate is a tired human with forty more resumes to review today. Win both.</p>

        <h2 className={h2}>Common Mistakes That Kill Good Candidates</h2>
        <p>Uploading a PDF when the portal accepts.docx. Using a Canva template with icons and color blocks that parsers cannot read. Listing skills in a graphic chart instead of plain text. Putting contact info in the document header, which many parsers skip entirely.</p>
        <p>Another frequent failure: applying with a resume tailored for a different role. If your headline says frontend engineer but the posting is for a backend role, the keyword match score drops even if your experience section mentions the right tools.</p>
        <p>Finally, do not rely on a cover letter to rescue a poorly formatted resume. Most screeners never read the cover letter. Some systems do not even parse it. Fix the resume first.</p>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/bypass" className={link}>How to get your resume past ATS filters</Link></li>
          <li><Link href="/bots" className={link}>How to beat smart AI resume bots</Link></li>
          <li><Link href="/pdf" className={link}>Why your PDF breaks inside an ATS</Link></li>
        </ul>
      </div>
  );
}
