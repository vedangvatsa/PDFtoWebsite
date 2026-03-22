import React from 'react';

export type Author = {
  name: string;
  avatarUrl: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: Author;
  content: React.ReactNode;
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'cv-attachments',
    title: 'Why You Should Stop Sending PDF Resumes',
    excerpt: 'That PDF you carefully designed is probably getting mangled before anyone reads it. Here is what actually happens when you email a resume as an attachment.',
    date: 'Mar 15, 2026',
    author: {
      name: 'Marcus T.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">Files Look Different Everywhere</h2>
        <p>You spent hours getting the margins right in Google Docs, exported a clean PDF, and sent it off. The problem is that the recruiter opened it on their phone during lunch. Your two-column layout is now a jumbled mess of overlapping text that requires pinching and zooming just to read your name. They close it and move on to the next candidate.</p>
        <p>This is not a rare edge case. Over sixty percent of initial resume screens now happen on mobile devices. A PDF is locked to the dimensions of a piece of paper, which is roughly 8.5 by 11 inches. That is a terrible fit for a 6-inch phone screen. There is no reflow, no responsive breakpoints, and no way for the document to adapt. What looks polished on your laptop looks broken on their iPhone.</p>
        <p>Even on desktop, PDF rendering varies wildly between Preview on Mac, Adobe Reader on Windows, and the browser-embedded viewers in Chrome and Firefox. Custom fonts can fail to embed, causing the entire document to fall back to a system font that wrecks your spacing. Transparent overlays designed in Canva sometimes render as opaque blocks in certain viewers, hiding content underneath.</p>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">Security Rules Make Attachments Annoying</h2>
        <p>Enterprise email systems at large companies run aggressive attachment scanning. Some strip PDFs from emails entirely. Others quarantine them in a sandbox for 24 hours before releasing them to the recipient. By the time your resume clears the scan, the hiring manager has already reviewed fifty other candidates who sent links that opened instantly.</p>
        <p>There is also the friction of downloading. Every attachment requires the recipient to actively download a file onto their device, figure out where their browser saved it, open it in the correct application, and then delete it when they are done. That is four extra steps compared to clicking a link, which opens immediately in their browser with zero disk overhead.</p>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">The Better Way</h2>
        <p>A web link sidesteps every single one of these problems. The browser handles rendering natively. The content reflows to fit any screen size. There is nothing to download, nothing to scan, and nothing to delete afterward. The recruiter clicks, reads, and closes the tab. Done.</p>
        <p>Beyond the practical logistics, a link also communicates something about you as a candidate. It shows you understand how information travels on the internet. If you are applying for any role adjacent to technology, product, design, or marketing, demonstrating that you can deliver information in the most frictionless possible format is itself a signal of competence. Your resume is your first project deliverable. Make it a good one.</p>
        <p>The shift from attachments to links is not a trend. It is the same transition that happened when companies stopped mailing paper resumes and started accepting email. The medium moved forward. The smartest candidates moved with it.</p>
      </div>
    )
  },
  {
    slug: 'mobile-responsive-cv',
    title: 'The Silent Killer: How Non-Responsive Resumes Cost You Interviews',
    excerpt: 'Recruiters are scanning candidates on their phones between meetings. If your resume forces them to pinch-zoom and scroll sideways, you have already lost.',
    date: 'Mar 16, 2026',
    author: {
      name: 'Elena R.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">The Annoyance of Scrolling Sideways</h2>
        <p>Open any traditional PDF resume on your phone right now. Go ahead, try it. You will immediately notice the text is too small to read. You pinch to zoom in on the top-left corner and can now read your name. But to read the line next to it, you need to scroll right. To get to the next line, you scroll down and then back to the left. Every single line requires this tedious zigzag motion.</p>
        <p>This is called forced horizontal scrolling, and every usability study conducted in the last twenty years categorizes it as a critical interface failure. It is the digital equivalent of printing your resume on a three-foot-wide banner and handing it to someone in a hallway. Sure, all the information is there, but they physically cannot consume it without an unreasonable amount of effort.</p>
        <p>The average recruiter spends between six and eight seconds on an initial resume scan. If two of those seconds are wasted just trying to navigate the document, you have lost a third of your window. The recruiter is not going to fight your formatting. They are going to close the file and open the next one.</p>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">Websites Fix This Automatically</h2>
        <p>A web-based profile solves this problem completely through responsive design. The same content that displays as two columns on a wide desktop monitor automatically collapses into a single scrollable column on a phone. Text sizes adjust. Images scale. Spacing adapts. The reader never has to do anything except scroll down, which is the most natural gesture on a touchscreen.</p>
        <p>This is not magic. It is CSS that has been standard in every web browser since roughly 2012. When your career profile lives on the web, you inherit over a decade of browser engineering specifically designed to make text readable on any screen size. A PDF gives you none of this. It is frozen at the exact pixel dimensions it was created at, forever.</p>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">Getting Back to You Faster</h2>
        <p>There is a downstream effect that most candidates never consider. When a recruiter can easily read your profile on their phone, they can make a decision faster. They can forward your link to the hiring manager in a text message. The hiring manager clicks it on their phone, reads it during a break, and responds with a thumbs up. A phone screen gets scheduled that afternoon.</p>
        <p>Compare that to the PDF flow: recruiter downloads the file, cannot read it on mobile, mentally notes to check it later on their laptop, forgets about it during back-to-back meetings, and your resume sits unread in their Downloads folder for a week. Responsiveness is not just about aesthetics. It directly affects the speed at which you move through the hiring pipeline.</p>
      </div>
    )
  },
  {
    slug: 'cv-web-link',
    title: 'Why a URL is the Ultimate Professional Move',
    excerpt: 'Sharing a clean URL instead of an attachment changes how people perceive you before they even read a single word of your experience.',
    date: 'Mar 17, 2026',
    author: {
      name: 'James L.',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">Making It Easy to Share</h2>
        <p>Think about how links work in practice. A recruiter receives your URL and wants to share you with the hiring manager. They copy the link, paste it into Slack, and hit send. The hiring manager sees a rich preview card with your photo, your name, and your headline — all rendered automatically by the chat platform using your OpenGraph metadata. They click it and your full profile loads in half a second.</p>
        <p>Now think about how a PDF works in that same scenario. The recruiter has to find your attachment in their email, download it, navigate to Slack, click the upload button, find the file in their Downloads folder, wait for it to upload, and then send it. The hiring manager gets a generic file icon with the label "Resume_Final_v3.pdf" and has to download it themselves. Neither person saw a preview of the content. Both had to wait for downloads.</p>
        <p>The difference is not just about convenience. The link creates an immediate visual impression. The PDF creates a speed bump. Every speed bump in a hiring process is a place where candidates get lost.</p>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">Those Great-Looking Preview Cards</h2>
        <p>When you drop a URL into Slack, LinkedIn, iMessage, WhatsApp, Discord, or virtually any modern messaging platform, the system automatically fetches the page metadata and renders a preview card. This card shows your custom image, your title, and a description. It looks polished, intentional, and professional.</p>
        <p>This is not a feature you have to build. It is baked into every messaging platform as an open standard called the Open Graph protocol. All you need is a web page with the right meta tags, and every platform on the internet will automatically generate a mini-billboard for your profile whenever someone shares your link. That is free advertising for your candidacy, triggered every single time your URL gets pasted anywhere.</p>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">Looking Good Without Trying</h2>
        <p>There is a subtle psychological effect at work here. When someone receives a clean, short URL like "cvin.bio/james" versus a file called "James_Lee_SeniorDev_Resume_March2026_FINAL.pdf," the URL feels more credible. It feels like this person has their act together. It feels like they have done this before.</p>
        <p>Recruiters process thousands of candidates. Anything that reduces their cognitive load builds goodwill. A link is effortless. An attachment is work. When you make the recruiter's job easier, they unconsciously associate that ease with your candidacy. You become the candidate who was easy to review, easy to share, and easy to move forward.</p>
      </div>
    )
  },
  {
    slug: 'bypass-ats',
    title: 'Bypassing Formatting Destruction with Dual-Submissions',
    excerpt: 'Your beautifully designed resume gets fed into a parser that strips every visual element. Here is how to satisfy the robot and impress the human at the same time.',
    date: 'Mar 18, 2026',
    author: {
      name: 'Sarah K.',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">How Things Break</h2>
        <p>Applicant Tracking Systems like Taleo, Workday, Greenhouse, and Lever all process resumes by running text extraction on the uploaded file. They rip out every character of text and drop it into a structured database. Then a recruiter runs a keyword search against that database to find candidates matching the role requirements.</p>
        <p>The problem is that the extraction engine is primitive. It reads text in order from top-left to bottom-right, strictly based on the coordinates of each character on the page. It does not understand columns. If you have your skills listed on the left and your job history on the right, the parser will merge those two columns line by line, producing sentences like "Python Senior Engineer 2019" where it smashed your skill name into your job title.</p>
        <p>The recruiter then searches for "Python" as a standalone keyword. Your mangled entry does not match because the word Python is concatenated with other text. Your resume scores a zero on their filter, and you never hear back despite being perfectly qualified.</p>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">The Two-Step Solution</h2>
        <p>The fix is straightforward once you understand the problem. You submit two things: a plain, ugly, single-column text document into the ATS portal upload field, and — prominently displayed at the top of that document — a link to your actual web profile.</p>
        <p>The plain document is designed exclusively for the robot. It has zero columns, zero graphics, zero fancy fonts. Just your name, contact info, a flat list of skills, and your employment history in basic chronological order with clear section headings. The parser will read it flawlessly because there is nothing complex to misinterpret.</p>
        <p>The link at the top is designed for the human. When the recruiter opens your parsed profile in the ATS interface, the first thing they see is a clickable URL. They click it and land on your beautifully designed web profile with proper typography, clean spacing, and all the visual hierarchy that makes your experience easy to scan.</p>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">Getting Them to Click</h2>
        <p>You might wonder whether recruiters actually click those links. They do, if you make it obvious. Put the URL right below your name and above everything else. Format the surrounding text to make it clear that your full profile is at that link. Something like "View my complete profile at cvin.bio/sarah" is enough.</p>
        <p>Recruiters are humans who prefer good user experiences. When they see a clean link promising a better version of what they are currently reading in the clunky ATS interface, they click it out of sheer relief. You have essentially hacked the system by giving both the algorithm and the person exactly what they want, in the format they each need.</p>
      </div>
    )
  },
  {
    slug: 'stand-out-inbox',
    title: 'Using Clean URLs to Stand Out in Application Inboxes',
    excerpt: 'When every candidate sends the same file type with the same naming convention, breaking that pattern is the fastest way to get noticed.',
    date: 'Mar 19, 2026',
    author: {
      name: 'David C.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">The Wall of Identical Attachments</h2>
        <p>Picture a recruiter's inbox after posting a Senior Frontend Engineer role on LinkedIn. Within 48 hours, they have received 300 applications. Each one shows up as an email with a PDF attachment. The filenames are variations of the same theme: "John_Smith_Resume.pdf," "Resume_JohnSmith_2026.pdf," "JS_FrontendDev_Final.pdf." They all look identical before being opened.</p>
        <p>The recruiter clicks the first one, downloads it, waits for it to render, scans it for six seconds, closes it. Opens the next one. Downloads. Renders. Scans. Closes. This cycle repeats dozens of times per hour, day after day. Every single file looks and feels the same. The cognitive experience is numbing.</p>
        <p>Now imagine that one of those 300 emails does not contain an attachment. Instead, it has a clean sentence: "My profile is at cvin.bio/david." The recruiter clicks the link. Their browser opens to a beautifully designed page with a hero section, clear section breaks, and a professional headshot. It loads in under a second. No download. No waiting. No hunting through their file manager.</p>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">The Preview Card Advantage</h2>
        <p>Most modern email clients support link previews. When you paste a URL with proper OpenGraph tags into an email, the client renders a visual preview card showing your image, your name, and a short tagline. This card appears inline, directly in the recruiter's email view, before they even click anything.</p>
        <p>So instead of seeing a grey paperclip icon and a generic filename, the recruiter sees your face, your headline, and a polished image. You have claimed a massive chunk of their visual attention without them taking a single action. This is not a small advantage. In a field of 300 identical attachments, being the one candidate with a visual presence in the inbox is a genuine competitive edge.</p>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">Easy to Forward, Easy to Remember</h2>
        <p>There is a practical benefit that compounds over time. Links are easy to forward. When the recruiter wants to share your profile with the hiring manager, they just copy the URL and drop it into Slack or a group chat. Everyone on the team can view it instantly without downloading anything.</p>
        <p>Links are also easy to remember. "cvin.bio/david" sticks in someone's head. "David_Chen_FrontendSenior_Resume_v4_March2026.pdf" does not. If the recruiter wants to pull up your profile during a debrief meeting two days later, remembering your URL is infinitely easier than remembering a filename in a Downloads folder with hundreds of other PDFs.</p>
      </div>
    )
  },
  {
    slug: 'pdf-breaks-ats',
    title: 'Why Complex PDFs Break Recruiter Algorithms',
    excerpt: 'That gorgeous two-column Canva resume is getting turned into garbled text by the very systems designed to evaluate it. Here is exactly how and why.',
    date: 'Mar 20, 2026',
    author: {
      name: 'Anna M.',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">Fonts Turning Into Pictures</h2>
        <p>Many popular resume design tools, including Canva, Figma, and various online templates, handle custom fonts by converting them into vector outlines rather than embedding the actual font data. Visually, the result is identical. But underneath, the text is no longer text. It is a collection of shapes that happen to look like letters.</p>
        <p>When an ATS parser encounters these shapes, it runs optical character recognition to try to convert them back into text. OCR is imperfect. It frequently confuses similar-looking characters, drops spaces between words, and misreads stylized typography altogether. Your carefully written "5 years of experience with React and TypeScript" might get extracted as "5years ofexperience wxth Reac7 and TypeScripl." That garbled string will never match a recruiter's keyword search.</p>
        <p>You can test this yourself. Open your designed PDF, select all the text, copy it, and paste it into a plain text editor like Notepad. If the result is a mess of broken text, missing spaces, and jumbled words, that is exactly what the ATS is seeing.</p>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">Messy Background Layers</h2>
        <p>Designed resumes often use background colors, gradient bars, or decorative elements behind text sections. These are implemented as separate layers in the PDF structure. The text extraction algorithm does not understand layers. It sees characters at certain coordinates and reads them in geometric order, regardless of which visual layer they belong to.</p>
        <p>If a decorative sidebar contains your section headings and the main area contains your descriptions, the parser might interleave characters from both areas. The result: "ExSenior Software Engineerperience" where it merged your sidebar heading "Experience" with your job title character by character based on their vertical positions.</p>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">Why The Web Just Works</h2>
        <p>HTML does not have any of these problems. A web page is built from a document tree where every element has explicit semantic meaning. A heading is tagged as a heading. A paragraph is tagged as a paragraph. A list is tagged as a list. There are no ambiguous coordinates, no overlapping layers, and no character recognition needed.</p>
        <p>When a crawler or parser reads an HTML page, it gets perfect text every single time because the text was never converted into shapes or embedded into visual layers. It is actual text, stored as actual characters, wrapped in tags that explicitly describe what each piece of content is. This is why web-based profiles are inherently machine-readable in a way that designed PDFs will never be.</p>
      </div>
    )
  },
  {
    slug: 'tech-resume-keywords',
    title: 'Mapping Visual Hierarchy for Technical Recruiters',
    excerpt: 'Technical recruiters spend four seconds scanning before deciding to read further. Where your keywords physically sit on the page determines whether you pass that scan.',
    date: 'Mar 21, 2026',
    author: {
      name: 'Alex B.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">Stop Writing Walls of Text</h2>
        <p>Most resumes bury critical information inside dense paragraphs. A recruiter looking for React experience has to read through three sentences about your team size, project timeline, and deployment process before they find the word "React" mentioned casually in the middle of line four. By that point, they have already left.</p>
        <p>Technical recruiters are not reading. They are scanning. Their eyes follow a predictable F-shaped pattern: they read the first line, drop down and scan the left edge, then drop further down and scan again. If your keywords are not in those specific visual zones, the recruiter's brain literally does not register them.</p>
        <p>The fix is simple. Pull your most important keywords out of your paragraphs and put them in standalone positions that the eye naturally hits. Bold skill names. Use clear section headings like "Stack" or "Technologies" rather than burying tools inside sentence descriptions. Front-load every bullet point with the specific technology before describing what you did with it.</p>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">Keep It Clean and Spacious</h2>
        <p>White space is not wasted space. It is a focusing mechanism. When every inch of your resume is packed with text, nothing stands out. Everything blurs into a single grey block that the eye glazes over. But when you add generous margins around your section headings and leave breathing room between your bullet points, each individual piece of information becomes distinct and scannable.</p>
        <p>A web-based profile naturally enforces this because you are working with a template designed by someone who understands readability. The spacing, font sizes, and section structures are all pre-tuned for optimal scanning. You just fill in your content and the visual hierarchy takes care of itself. A Word document or Canva template gives you total design freedom, which sounds great until you realize that total freedom is how you end up with 9-point font and quarter-inch margins.</p>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">Front-Load Your Bullets</h2>
        <p>Every bullet point under each role should start with the most important word. Not "Worked on the migration of our primary database from MySQL to PostgreSQL" but "PostgreSQL migration: led the transition of the primary database from MySQL, reducing query latency by 40%." The keyword hits the recruiter's eye immediately. The context follows for those who want to read further.</p>
        <p>This is the same principle that newspaper headline writers have used for a hundred years. Lead with the important thing. Let the details follow. Recruiters are scanning, not reading. Give them what they are looking for in the first three words of every line, and they will flag you as a match in seconds.</p>
      </div>
    )
  },
  {
    slug: 'update-cv-anytime',
    title: 'The Hidden Advantage of Fixing Typos Anytime',
    excerpt: 'You sent your resume and then noticed a typo. With a PDF, it is too late. With a web profile, you fix it in thirty seconds and nobody ever sees the mistake.',
    date: 'Mar 22, 2026',
    author: {
      name: 'Michelle P.',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80'
    },
    content: (
      <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">Fixing Things On The Fly</h2>
        <p>You submitted your application at 10 AM. At 10:15 AM, while brushing your teeth, you suddenly realize you wrote "Javscript" instead of "JavaScript" right in the skills section. With a PDF, there is nothing you can do. The file is sitting in someone's inbox with a typo in it, and sending a correction email ("Sorry, please disregard the previous attachment and use this one instead") looks worse than the typo itself.</p>
        <p>With a web-based profile, you open the editor, fix the typo, and save. The change goes live immediately. When the recruiter eventually clicks your link at 2 PM, they see the corrected version. They never knew the typo existed. There is no awkward follow-up email, no version confusion, and no embarrassment.</p>
        <p>This might seem like a small thing, but typos in technology names are taken surprisingly seriously by technical recruiters. Misspelling the name of a framework or language you claim expertise in is an immediate red flag. Being able to catch and fix these mistakes after submission is a genuine safety net.</p>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">Testing What Works Best</h2>
        <p>Beyond typo corrections, the ability to update your profile in real-time opens up a much more powerful capability: iteration. You can submit your profile for a role, watch whether you get a response, and if not, tweak your headline, reorder your projects, or emphasize different skills before applying to the next one.</p>
        <p>With PDF resumes, every iteration means creating a new file, naming it something different (inevitably leading to the "Resume_v7_FINAL_actuallyFINAL.pdf" naming disaster), and keeping track of which version you sent to whom. With a web profile, there is only one version, and it is always the latest one. Every recruiter who has your link automatically sees your most recent and best work.</p>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-10 mb-4 transition-colors">Adding New Skills Mid-Interview</h2>
        <p>The most powerful use of real-time updates happens during an active interview process. Say you have a phone screen on Monday and the interviewer mentions that the team is migrating to Kubernetes. You happen to have Kubernetes experience but did not include it on your profile because it was not in the job description. Before your on-site interview on Thursday, you add a Kubernetes section to your profile and reorder your projects to highlight container orchestration work.</p>
        <p>When the interview panel reviews your profile link before Thursday's meeting, they see a candidate whose experience aligns perfectly with their current priorities. It feels like you are the exact right fit, not because you lied about anything, but because you strategically surfaced the most relevant parts of your genuine experience. A PDF cannot do this. Once it is sent, it is frozen. A link is alive.</p>
      </div>
    )
  }
];
