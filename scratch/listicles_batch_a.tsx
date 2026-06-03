// ============================================================
// BATCH A — Two listicle articles for blog-data.tsx
// Each article object below can be copy-pasted into the
// blogPosts array in src/lib/blog-data.tsx.
//
// These reference the shared CSS class constants (h2, h3,
// callout, ul, ol, bold, link) already defined in that file.
// ============================================================


// === ARTICLE: best-ways-send-resume ===
/*
  {
    slug: 'best-ways-send-resume',
    title: 'Best Ways to Send Your Resume to a Recruiter',
    excerpt: 'You have five options for getting your resume in front of a recruiter, and most people default to the worst one.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'What is the best way to send a resume to a recruiter?', answer: 'A web profile link is the most effective method. It loads instantly on any device, always shows your latest info, and creates a rich preview card when shared on Slack or LinkedIn. PDF attachments still work but add friction for the reader.' },
      { question: 'Should I paste my resume in the email body?', answer: 'Plain text in the email body works well for cold outreach because it removes all download friction. The recruiter sees your qualifications immediately. The downside is you lose all formatting, so keep it short and link to your full profile.' },
      { question: 'Is it okay to send a Google Doc link as my resume?', answer: 'Google Doc links are better than file attachments because the recruiter does not need to download anything. However, they can look unprofessional if permission settings are wrong, and they still require Google account access to view properly on mobile.' },
    ],
    author: {
      name: 'Priya K.',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>A recruiter asks for your resume. You have maybe thirty seconds before the conversation moves on. What you send next matters more than most people think. Not just the content of your resume, but the <span className={bold}>format you deliver it in</span>.</p>
        <p>I&apos;ve talked to dozens of recruiters about how they actually receive and review resumes. The differences between methods are real, and they affect whether your resume gets read or gets buried. Here are the five most common ways to send a resume, ranked from best to worst.</p>

        <h2 className={h2}>1. Web Profile Link</h2>
        <p>This is the best option by a wide margin. You send a URL like <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">cvin.bio/yourname</code> and the recruiter taps it. Your profile loads instantly on their phone or laptop. No downloads. No file hunting. No wondering if they have the right software to open it.</p>
        <p>The real advantage shows up when the recruiter wants to share you with the hiring manager. They paste your link into Slack, and it shows a rich preview card with your name, photo, and headline. Compare that to forwarding an email with a PDF buried three replies deep.</p>
        <p>Web profiles also solve the versioning problem. If you fix a typo or add a new project after sending the link, the recruiter sees the updated version automatically. With a file, you would need to send a second email saying &quot;please use this one instead.&quot;</p>
        <div className={callout}>
          <h3 className={h3}>Best for</h3>
          <p>Every situation. Networking events, LinkedIn DMs, email applications, and cold outreach. A URL works anywhere you can type or paste text. Tools like <Link href="/cv-web-link" className={link}>CVin.Bio</Link> give you a permanent profile URL with your own name in it.</p>
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
        <p>This is the default choice for most job seekers, and it has real problems. Start with the fact that <Link href="/cv-attachments" className={link}>enterprise email systems often strip or quarantine attachments</Link>. Your beautifully designed PDF might sit in a security sandbox for 24 hours while other candidates get reviewed.</p>
        <p>Even when the PDF arrives, the recruiter has to download it, find it in their downloads folder, and open it in a viewer. If they are on their phone, your carefully designed two-column layout becomes a tiny, unreadable mess that requires pinch-zooming. Over 60% of initial resume screens happen on mobile devices now.</p>
        <p>There is also the version lock problem. Once you send that file, it is frozen in time. Found a better way to describe your last project? Too bad. That old version is what the recruiter has.</p>
        <p><span className={bold}>Pros:</span> Familiar format, preserves design on desktop. <span className={bold}>Cons:</span> Gets blocked by security filters, terrible on mobile, impossible to update after sending.</p>

        <h2 className={h2}>5. Word Document</h2>
        <p>Sending a .docx file is the worst option. Every problem with PDFs applies here, plus new ones. Word documents render differently depending on which version of Word (or which alternative app) the recruiter uses. Your fonts change. Your margins shift. Your carefully aligned sections fall apart.</p>
        <p>Word files are also a bigger security risk than PDFs. They can contain macros, which means corporate email filters flag them more aggressively. Some companies block .docx attachments entirely.</p>
        <p>The only time a Word doc makes sense is when a recruiter at a staffing agency specifically asks for one. They do this because they want to strip your contact info and add their agency branding before forwarding you to the client. If that is the situation, send the .docx. Otherwise, avoid it.</p>
        <p><span className={bold}>Pros:</span> Easy to edit, some agencies require it. <span className={bold}>Cons:</span> Renders inconsistently, higher security risk, gets flagged by email filters.</p>

        <h2 className={h2}>Picking the Right Method</h2>
        <p>The situation matters. Here are a few real scenarios and what to do in each one.</p>
        <p><span className={bold}>You&apos;re at a networking event</span> and someone asks for your resume. Pull out your phone and text them your profile link. That is it. No fumbling with files. They tap the link and see everything. If you have a CVin.Bio profile, the URL is short enough to say out loud.</p>
        <p><span className={bold}>A recruiter DMs you on LinkedIn.</span> Drop your web profile link in the chat. LinkedIn renders a preview card automatically. The recruiter sees your headline and photo without leaving the conversation. If you send a PDF, LinkedIn wraps it in a download prompt that most people skip.</p>
        <p><span className={bold}>You&apos;re applying through a job portal</span> that requires a file upload. Upload a simple, clean PDF with minimal formatting. Put your profile URL at the very top of the document. The ATS parses the simple text. The human who reads it later clicks your link and sees the full, well-designed version.</p>

        <div className={callout}>
          <h3 className={h3}>The one rule that always applies</h3>
          <p>No matter which method you use, make the recruiter&apos;s job easier. Every extra step between &quot;I received this&quot; and &quot;I can read this&quot; is a chance for them to move on to someone else. The best format is the one with the <Link href="/stand-out-inbox" className={link}>fewest barriers between you and their attention</Link>.</p>
        </div>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/cv-attachments" className={link}>Why PDF attachments are losing to web profiles</Link></li>
          <li><Link href="/cv-web-link" className={link}>Should you put a URL on your resume?</Link></li>
          <li><Link href="/stand-out-inbox" className={link}>How to stand out in a recruiter&apos;s inbox</Link></li>
        </ul>
      </div>
    )
  },
*/
// === END ===


// === ARTICLE: best-resume-mistakes ===
/*
  {
    slug: 'best-resume-mistakes',
    title: 'Best Resume Mistakes to Fix Before Applying',
    excerpt: 'Ten resume mistakes ranked by how much damage they actually do, starting with the one that gets you rejected in under three seconds.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'What is the worst mistake you can make on a resume?', answer: 'Misspelling the company name you are applying to. It tells the recruiter you did not care enough to double-check the most basic detail, and it usually results in an immediate rejection before they read anything else.' },
      { question: 'Do skill bars on resumes actually hurt you?', answer: 'Yes. Rating yourself 4 out of 5 in Python gives the recruiter no useful information and raises more questions than it answers. Replace skill bars with concrete examples of what you built and the results it produced.' },
      { question: 'How many resume mistakes does a typical applicant have?', answer: 'Most resumes have at least three of the ten common mistakes. The good news is that all of them are fixable in under an hour if you know what to look for.' },
    ],
    author: {
      name: 'Tomás R.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>Every resume has mistakes. Most people know about the obvious ones like typos and bad formatting. But some mistakes do far more damage than others. A missing comma is annoying. Misspelling the company name you are applying to is a death sentence.</p>
        <p>I ranked the ten most common resume mistakes by how much they actually hurt your chances. The list starts with the ones that get you rejected immediately and works down to the ones that quietly hold you back.</p>

        <h2 className={h2}>#1: Typos in Company Names</h2>
        <p>This is the single most damaging mistake you can make. If your resume says &quot;Gogle&quot; or &quot;Micosoft&quot; or &quot;Amzon,&quot; the recruiter assumes you did not proofread a document that represents the most important parts of your career. They stop reading.</p>
        <p>It gets worse when you misspell the company you are applying to. That tells the recruiter this is a mass-blasted application where you did not even swap in the right name. I talked to a recruiter at a Series B startup who said she rejects about 5% of applications purely for this reason.</p>
        <p>The fix is simple. Read your resume out loud before you send it. Spell-check catches &quot;teh&quot; but it does not catch &quot;Googel&quot; because that is not a dictionary word. Your eyes need to do this work.</p>

        <h2 className={h2}>#2: Generic Objective Statements</h2>
        <p>&quot;Seeking a challenging position where I can apply my skills and grow professionally.&quot; This sentence appears on thousands of resumes and says absolutely nothing. It tells the recruiter you could not be bothered to write something specific to their role.</p>
        <p>The deeper problem is that <Link href="/objective-statement-death" className={link}>objective statements center the resume around what you want</Link> instead of what you offer. The recruiter does not care what you are seeking. They care what you can do for them. Replace the objective with a two-sentence summary of your strongest relevant experience.</p>

        <h2 className={h2}>#3: Overstuffed Bullet Points</h2>
        <p>You know the type. A single bullet point that runs four lines long, lists six technologies, mentions three projects, and somehow also includes a soft skill. The recruiter&apos;s eyes glaze over after the first line. They skip the bullet entirely and probably the rest of your experience section too.</p>
        <p>Good bullet points do one thing: state a result. <Link href="/overstuffing-bullets" className={link}>Each bullet should be one accomplishment with one measurable outcome</Link>. If your bullet point has the word &quot;and&quot; more than once, it needs to be split into two bullets or trimmed down.</p>

        <h2 className={h2}>#4: Skill Bars and Ratings</h2>
        <p>Those visual bars that show you are &quot;85% proficient in JavaScript&quot; look nice in Canva templates. They are useless to recruiters. What does 85% even mean? Compared to whom? A senior engineer at Google would rate themselves differently than a bootcamp graduate, and the bar gives no context for either.</p>
        <p>Skill bars also <Link href="/generic-skill-bars" className={link}>actively hurt your credibility</Link>. If you rate yourself 4 out of 5 in React, the interviewer will test you at that level. If you are actually at a 2, you just set yourself up to fail. Drop the bars. List your skills as plain text, and let your project descriptions prove your depth.</p>

        <div className={callout}>
          <h3 className={h3}>A quick self-test</h3>
          <p>Open your resume right now. Count how many of these first four mistakes you have. If the answer is two or more, your resume is likely getting filtered out before a human ever reads it. The good news: all four are fixable in twenty minutes.</p>
        </div>

        <h2 className={h2}>#5: Non-Responsive Formatting</h2>
        <p>Your two-column PDF with the sidebar looks great on your laptop. It looks terrible on a recruiter&apos;s phone. Over 60% of initial resume screens happen on mobile now. If your resume requires pinch-zooming to read, most recruiters will close it and move on to the next candidate.</p>
        <p>The fix is to either simplify your PDF to a single column or switch to a <Link href="/mobile-responsive-cv" className={link}>web-based profile that adapts to any screen size</Link> automatically. Your content stays the same. The reading experience just stops being painful.</p>

        <h2 className={h2}>#6: Wrong File Format</h2>
        <p>Sending a .pages file to a Windows user. Exporting a Canva design as a JPEG instead of a PDF. Submitting a Google Doc link that requires sign-in. Every wrong file format is a barrier between you and the person trying to read your resume.</p>
        <p>If you must send a file, PDF is the safest bet. But even PDFs get stripped by corporate email security. The most reliable approach is a permanent web link that works for everyone, on every device, with no software required.</p>

        <h2 className={h2}>#7: Missing Keywords</h2>
        <p>Many companies use applicant tracking systems that scan for specific terms before a human ever sees your resume. If the job posting says &quot;Kubernetes&quot; and your resume only says &quot;container orchestration,&quot; you might get filtered out even though you clearly know the tool.</p>
        <p>This does not mean you should stuff your resume with buzzwords. It means you should <Link href="/keyword-trust" className={link}>mirror the language from the job description</Link> when it honestly describes your experience. Read the posting carefully. If they say &quot;React,&quot; write &quot;React.&quot; If they say &quot;CI/CD,&quot; write &quot;CI/CD.&quot; Do not make the software guess.</p>

        <h2 className={h2}>#8: Gaps With No Explanation</h2>
        <p>A one-year gap on your resume is not a problem. A one-year gap with no explanation is. Recruiters will fill in the blank with their worst assumption. They might think you were fired and could not find work. The reality might be that you were freelancing, caring for family, or traveling.</p>
        <p>You do not need a long story. A single line like &quot;2022-2023: Freelance consulting for early-stage startups&quot; or &quot;2023: Career break for family care&quot; removes the mystery. <Link href="/gap-explanation" className={link}>Brief, honest gap explanations</Link> actually build trust. Silence does the opposite.</p>

        <h2 className={h2}>#9: Outdated Contact Info</h2>
        <p>This one is quieter than the others but still costly. If a recruiter tries to call the number on your resume and gets a disconnected line, or emails an address you stopped checking two years ago, that opportunity is gone. You will never know it happened.</p>
        <p>Check your resume right now. Is the email address current? Does the phone number work? Is there a LinkedIn URL that goes to the right profile? If you use a web-based profile, you can update contact details in one place and every link you have ever shared stays current.</p>

        <h2 className={h2}>#10: No Way to Verify Claims</h2>
        <p>You say you &quot;increased revenue by 40%.&quot; The recruiter thinks: &quot;Says who?&quot; Resumes are self-reported documents with no built-in way to check if anything is true. That is fine when your claims are modest. But the bigger the claim, the more skepticism it generates.</p>
        <p>The best way to back up your resume is to link to evidence. GitHub repos, live projects, published articles, or a portfolio page. A web profile makes this easy because you can embed links directly alongside each claim. A PDF can only print a URL that nobody will bother to type into a browser.</p>

        <div className={callout}>
          <h3 className={h3}>Fix all ten in under an hour</h3>
          <p>None of these mistakes require a full resume rewrite. Proofread for typos (5 min). Kill the objective statement (2 min). Trim your bullets (10 min). Remove skill bars (2 min). Test on your phone (3 min). Check your file format (1 min). Add missing keywords (10 min). Explain gaps (5 min). Verify contact info (2 min). Add one portfolio link (5 min). Total: about 45 minutes for a dramatically better resume.</p>
        </div>

        <h2 className={h2}>Read Next</h2>
        <ul className={ul}>
          <li><Link href="/objective-statement-death" className={link}>Why objective statements are dead</Link></li>
          <li><Link href="/overstuffing-bullets" className={link}>How to write resume bullets that get read</Link></li>
          <li><Link href="/generic-skill-bars" className={link}>Why skill bars hurt more than they help</Link></li>
        </ul>
      </div>
    )
  },
*/
// === END ===
