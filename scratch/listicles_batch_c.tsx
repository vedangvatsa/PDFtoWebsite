// === ARTICLE: best-ways-beat-ai-screening ===
/*
{
  slug: 'best-ways-beat-ai-screening',
  title: 'Best Ways to Get Past AI Resume Screening',
  excerpt: 'Seven tactics ranked by how well they actually work against automated screening, from the one that skips the filter entirely to the small fixes that add up.',
  date: 'Jun 04, 2026',
  faqs: [
    { question: 'How do AI resume screening systems work?', answer: 'Most AI screening tools parse your uploaded file into text, extract keywords and section data, then score you against the job description. If your formatting confuses the parser or your language does not match, you score low and get filtered out before a human sees you.' },
    { question: 'Can I trick AI resume screening with hidden keywords?', answer: 'No. Modern screening tools detect white-on-white text and hidden keyword stuffing. They will flag or reject your application. The better approach is to use the same language as the job posting in visible, contextual sentences.' },
    { question: 'What file format is best for AI resume screening?', answer: 'If a system requires a file upload, plain .docx is the safest format. It parses more reliably than PDF across most applicant tracking systems. But the best option is a web profile URL that the recruiter reads directly, bypassing file parsing entirely.' },
  ],
  author: {
    name: 'Priya K.',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&q=80'
  },
  content: (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

      <p>AI screening is the first wall between you and a real conversation with a hiring manager. Roughly 75% of resumes get rejected by automated systems before a person ever looks at them. Some of those rejections are fair. But a lot of good candidates get tossed because of formatting issues, missing keywords, or file types the parser chokes on.</p>
      <p>These seven tactics are ranked by how much they actually move the needle. The first one is the most effective because it removes the screening step entirely. The rest help you survive the filter when you have no choice but to go through it.</p>

      <h2 className={h2}>1. Send a Web Profile Link</h2>
      <p>This is the single best thing you can do. When a recruiter clicks a URL and reads your profile in a browser, there is no AI filter between you and them. No parsing. No keyword scoring. No risk that a two-column layout confuses the system. They just read your profile the way you designed it.</p>
      <p>A clean link like <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">cvin.bio/yourname</code> works everywhere. Drop it in an email, a LinkedIn message, or a Slack thread. The recruiter sees your profile instantly. This is why <Link href="/cv-web-link" className={link}>putting a URL on your resume</Link> is worth doing even if you still submit a file through the portal.</p>
      <p>Best for: anyone who can email or message a recruiter directly, networking contacts, referrals, and any situation where you are not forced into a portal upload.</p>

      <h2 className={h2}>2. Match the Job Posting Language</h2>
      <p>AI screeners compare your resume text against the job description. If the posting says &quot;CI/CD pipelines&quot; and you wrote &quot;continuous integration and deployment workflows,&quot; the system might not connect the two. It sounds obvious, but most people do not do this.</p>
      <p>Open the job posting in one tab and your resume in another. Go line by line through the requirements. If they say &quot;React,&quot; write &quot;React.&quot; Not &quot;ReactJS.&quot; Not &quot;React.js.&quot; Use their exact phrasing. You can read more about this in our guide to <Link href="/beat-smart-ai-bots" className={link}>beating AI resume bots</Link>.</p>
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
      <p>Tables are even worse. Most parsers extract table content as a flat string with no structure. Graphics, icons, and progress bars for skills? The parser sees nothing. Those are invisible. If you want to understand the full scope of this problem, read <Link href="/pdf-breaks-ats" className={link}>how PDFs break in applicant tracking systems</Link>.</p>
      <p>Best for: anyone submitting through an online portal or applicant tracking system.</p>

      <h2 className={h2}>5. Put Keywords in Context</h2>
      <p>A skills block at the top that says &quot;Python, AWS, Docker, Terraform, PostgreSQL&quot; is fine. But newer AI screeners also look at where and how you used those technologies. A keyword sitting alone in a list carries less weight than one embedded in a real accomplishment.</p>
      <p>Instead of just listing &quot;Terraform,&quot; write something like: &quot;Built Terraform modules that cut provisioning time from 4 hours to 15 minutes across 3 AWS regions.&quot; Now the system sees Terraform, AWS, and a quantified result all in one sentence.</p>
      <p>This also helps when a human eventually reads your resume. A list of 30 technologies tells them nothing. A few well-placed keywords inside real stories tell them everything.</p>

      <h2 className={h2}>6. Save as Plain .docx</h2>
      <p>If the application portal requires a file upload, use .docx over PDF. This is not a style preference. It is a parsing reliability issue. The .docx format stores text as structured XML that machines can read cleanly. PDFs store text as positioned characters on a virtual page, which means the parser has to guess where one word ends and another begins.</p>
      <p>Keep the .docx simple. One column. Standard fonts like Arial or Calibri. No text boxes, no headers/footers with contact info (many parsers skip those), and no images.</p>
      <div className={callout}>
        <h3 className={h3}>When PDF is okay</h3>
        <p>If you are emailing your resume directly to a person (not uploading to a portal), PDF is fine because no parser is involved. The human just opens the file. But the moment you are going through an ATS, switch to .docx.</p>
      </div>

      <h2 className={h2}>7. Add a Clean URL at the Top</h2>
      <p>Even when you have to submit a file, put a link to your full web profile right below your name. Something like: &quot;Full profile: cvin.bio/yourname.&quot; This gives the recruiter a way out of the ATS view. Many recruiters will click the link just to see a better-formatted version of your background.</p>
      <p>This also future-proofs you. When the recruiter shares you with the hiring manager later, they forward the URL, not the file. Your web profile has your latest updates, proper formatting, and no parsing artifacts. You can learn more about this approach in our post on <Link href="/bypass-ats" className={link}>bypassing applicant tracking systems</Link>.</p>

      <h2 className={h2}>What Matters Most</h2>
      <p>The top of this list matters the most. Sending a web link (#1) removes AI screening from the equation entirely. Matching the job language (#2) and using standard headers (#3) are the two changes that give you the biggest improvement when you do go through a portal.</p>
      <p>The bottom of the list still matters. But if you only have 20 minutes before a deadline, spend those minutes on tactics 1 through 3.</p>
      <div className={callout}>
        <h3 className={h3}>The short version</h3>
        <p><span className={bold}>Skip the filter entirely</span> by sending a direct link. When that is not possible, <span className={bold}>speak the same language as the job posting</span> and keep your formatting dead simple. Everything else is an optimization on top of those basics.</p>
      </div>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/bypass-ats" className={link}>How to get your resume past ATS filters</Link></li>
        <li><Link href="/beat-smart-ai-bots" className={link}>How to beat smart AI resume bots</Link></li>
        <li><Link href="/pdf-breaks-ats" className={link}>Why your PDF breaks inside an ATS</Link></li>
      </ul>
    </div>
  )
}
*/
// === END ===

// === ARTICLE: best-things-top-resume ===
/*
{
  slug: 'best-things-top-resume',
  title: 'Best Things to Put at the Top of Your Resume',
  excerpt: 'Recruiters spend about 6 seconds on their first look at your resume, and most of that time is spent on the top two inches.',
  date: 'Jun 04, 2026',
  faqs: [
    { question: 'What should the top of my resume look like?', answer: 'Your name in a large clear font, a one-line headline with your role and specialty, a link to your full profile, a two-sentence summary of your value, and your four or five strongest technical skills. That is it. Nothing else needs to be above the fold.' },
    { question: 'Should I put an objective statement on my resume?', answer: 'No. Objective statements tell the recruiter what you want, not what you offer. A value summary that describes what you bring to the team is far more effective and takes up the same amount of space.' },
    { question: 'Should I include my full home address on my resume?', answer: 'No. City and country are enough if location matters for the role. A full street address wastes space at the top of your resume and creates a privacy risk with no upside.' },
  ],
  author: {
    name: 'Marcus T.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
  },
  content: (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

      <p>The top two inches of your resume do most of the work. Recruiters scan from the top down, and the first thing they see determines whether they keep reading or move on. Studies on <Link href="/the-30-second-scan" className={link}>how recruiters actually read resumes</Link> confirm this. The initial glance is fast. You get about 6 seconds before they decide if you are worth a closer look.</p>
      <p>That means what you put at the very top is not a design choice. It is a strategic one. Here is what works best, ranked by how much it helps during that first scan.</p>

      <h2 className={h2}>1. Your Name and a Headline</h2>
      <p>Your name should be the largest text on the page. Not huge, but clearly the first thing the eye lands on. Right below it, add a one-line headline that tells the recruiter exactly who you are and what you do.</p>
      <p>A good headline looks like this: &quot;Senior Backend Engineer · Payments · Go/Rust.&quot; That is three pieces of info in under ten words: your level, your domain, and your tools. The recruiter now knows if you are in the right ballpark before reading a single bullet point.</p>
      <p>A bad headline is your job title alone: &quot;Software Engineer.&quot; That tells them nothing they could not guess from the fact that you sent a resume for an engineering role.</p>
      <div className={callout}>
        <h3 className={h3}>Headline formula</h3>
        <p><span className={bold}>[Seniority + Role] · [Domain/Industry] · [Top 2 Technologies]</span></p>
        <p>Examples: &quot;Staff Frontend Engineer · E-commerce · React/TypeScript&quot; or &quot;DevOps Lead · FinTech · AWS/Kubernetes&quot; or &quot;Data Engineer · ML Pipelines · Python/Spark.&quot;</p>
      </div>

      <h2 className={h2}>2. A URL to Your Full Profile</h2>
      <p>Put a link to your web profile right below your name and headline. A clean URL like <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">cvin.bio/yourname</code> works well. It is short, easy to remember, and gives the recruiter a way to see your full background in a properly formatted layout.</p>
      <p>This matters because your resume is a summary. It cannot hold everything. A profile link lets the recruiter dig deeper on their own terms. It also makes you easy to share. When the recruiter forwards you to the hiring manager, they paste the URL into Slack instead of attaching a file. You can read more about why this works in our guide on <Link href="/cv-web-link" className={link}>putting a URL on your resume</Link>.</p>
      <p>Best for: anyone in tech. Recruiters expect to see a link to something, whether it is GitHub, a portfolio, or a profile page. Having nothing clickable at the top is a missed opportunity.</p>

      <h2 className={h2}>3. A Two-Sentence Value Summary</h2>
      <p>Not an objective statement. Not a paragraph. Two sentences that tell the recruiter what you bring and why it matters. Think of it as your answer to &quot;why should we talk to this person?&quot;</p>
      <p>Good example: &quot;Backend engineer with 7 years building payment systems that handle $2B+ in annual transactions. Led the team that cut checkout latency by 40% at a Series C fintech.&quot;</p>
      <p>Bad example: &quot;Passionate software engineer seeking a challenging role where I can grow my skills and contribute to an exciting team.&quot; That second one is an <Link href="/objective-statement-death" className={link}>objective statement</Link>, and it tells the recruiter nothing useful. It is about what you want, not what you offer.</p>

      <h2 className={h2}>4. Your Strongest Skills</h2>
      <p>List four or five of your strongest technical skills right after your summary. Not fifteen. Not twenty. Just the ones that are most relevant to the kinds of roles you are applying for.</p>
      <p>This works because it gives the recruiter a quick filter. They scan your skills, see &quot;Go, PostgreSQL, gRPC, AWS, Terraform&quot; and immediately know if your stack matches their team. If you list too many, you dilute the signal. The recruiter does not know if &quot;Docker&quot; means you ran it once in a tutorial or you manage 200 containers in production.</p>
      <p>Pick the skills you could talk about for 30 minutes in an interview. Leave everything else for the experience section where you can show how you used it.</p>

      <h2 className={h2}>What NOT to Put at the Top</h2>
      <p>Some things waste your most valuable real estate. Here is what to remove or move further down.</p>
      <p><span className={bold}>Objective statements.</span> &quot;Seeking a role where I can grow&quot; does not help the recruiter decide if you are qualified. Replace it with a value summary that describes what you bring.</p>
      <p><span className={bold}>Your full home address.</span> City and country are enough if the role is location-sensitive. Nobody needs your street name and zip code at the top of your resume. It is a privacy risk and a waste of space.</p>
      <p><span className={bold}>A photo.</span> In many countries, including the US, adding a photo can trigger bias concerns. Even where photos are common, they eat up space at the top that your headline and summary need more.</p>
      <p><span className={bold}>Date of birth.</span> Irrelevant to your qualifications and creates age bias risk. Leave it off entirely.</p>
      <div className={callout}>
        <h3 className={h3}>The test</h3>
        <p>Cover everything below the top two inches of your resume. Can a recruiter tell from just that visible area what you do, what level you are at, and what makes you worth calling? If not, rearrange until they can.</p>
      </div>

      <h2 className={h2}>How Recruiters Actually Read</h2>
      <p>Eye-tracking studies show that recruiters follow a rough F-pattern. They read the top line fully, scan down the left side, and occasionally dart right when something catches their attention. This means the left side of your top section gets the most eyeball time.</p>
      <p>Put your name and headline flush left. Put your URL directly below. Put your summary next. By the time the recruiter has finished their F-pattern scan of your top section, they should know your level, your specialty, your top skills, and where to learn more. That is enough for them to decide you are worth a real read.</p>
      <p>If your top section is cluttered with a mailing address, a photo, and an objective about what you hope to learn, the recruiter finishes their F-scan without learning anything useful. You just lost your window.</p>

      <h2 className={h2}>Putting It Together</h2>
      <p>Here is what the top of your resume should look like, in order:</p>
      <ol className={ol}>
        <li><span className={bold}>Your name</span> in the largest font on the page</li>
        <li><span className={bold}>A one-line headline</span> with your role, domain, and top tools</li>
        <li><span className={bold}>Your profile URL</span> and email on the same line</li>
        <li><span className={bold}>A two-sentence value summary</span> describing what you bring</li>
        <li><span className={bold}>Four or five top skills</span> listed as simple text</li>
      </ol>
      <p>That is it. Everything else goes below. Your experience, education, projects, and certifications all get their own sections further down. But the top is reserved for the information that <Link href="/stand-out-inbox" className={link}>makes you stand out</Link> in the first 6 seconds.</p>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/the-30-second-scan" className={link}>How recruiters really read your resume</Link></li>
        <li><Link href="/objective-statement-death" className={link}>Why objective statements are dead</Link></li>
        <li><Link href="/cv-web-link" className={link}>Why a URL is the best thing on your resume</Link></li>
      </ul>
    </div>
  )
}
*/
// === END ===
