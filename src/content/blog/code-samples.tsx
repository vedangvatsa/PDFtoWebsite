import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>A software engineer applied for a senior backend role. They wanted to show they could write clean high performance code. They zip up their entire local database project. The zip file contained thousands of files including local configuration secrets and node modules. They attached the large zip file to their application email. They hit send. They waited for weeks. They never heard back. They did not know that the corporate firewall flagged the zip file as a security threat and deleted the email before the recruiter ever saw it.</p>

      <p>This is a common disaster. Developers assume that hiring teams will download extract and run random files from the internet. They will not. Recruiters work on locked down corporate laptops. Their systems actively block zip archives and raw script files to prevent security breaches. Even if your file gets through the security filter a busy recruiter is not going to run npm install just to see if you can write an API endpoint.</p>

      <p>If you want people to look at your code you must make it easy. You must remove all download steps. You must provide your code in a format that can be read in a web browser in five seconds. If you fail to do this your application will be ignored no matter how good your software is.</p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Visual illustration of security firewalls blocking zip attachments while letting clean web links pass through">
          {/* Background grid */}
          <rect width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1" />
          
          {/* Top Half - Zip File path */}
          <rect x="25" y="25" width="650" height="135" rx="6" className="fill-red-50/30 dark:fill-red-950/10 stroke-red-200 dark:stroke-red-900/40" />
          <text x="40" y="50" className="fill-red-600 dark:fill-red-400 font-bold text-xs" fontFamily="system-ui, sans-serif">ATTACHED ZIP ARCHIVE (BLOCKED BY SECURITY)</text>
          
          {/* Zip Path Elements */}
          <text x="60" y="95" className="fill-zinc-700 dark:fill-zinc-300 font-bold text-xs" fontFamily="system-ui, sans-serif">Email Attachment</text>
          <line x1="170" y1="90" x2="260" y2="90" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
          <polygon points="260,87 268,90 260,93" className="fill-zinc-400 dark:fill-zinc-500" />
          
          {/* Firewall Block */}
          <rect x="280" y="65" width="120" height="50" rx="4" className="fill-red-100 dark:fill-red-950 stroke-red-300 dark:stroke-red-800" />
          <text x="340" y="88" textAnchor="middle" className="fill-red-700 dark:fill-red-400 text-xs font-bold" fontFamily="system-ui, sans-serif">Corporate</text>
          <text x="340" y="104" textAnchor="middle" className="fill-red-700 dark:fill-red-400 text-xs font-bold" fontFamily="system-ui, sans-serif">Firewall Filter</text>
          
          <line x1="410" y1="90" x2="500" y2="90" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
          <polygon points="500,87 508,90 500,93" className="fill-zinc-400 dark:fill-zinc-500" />
          
          <text x="520" y="95" className="fill-red-600 dark:fill-red-400 font-bold text-xs" fontFamily="system-ui, sans-serif">DELETED / SPAM</text>

          {/* Bottom Half - Clean Web Link path */}
          <rect x="25" y="185" width="650" height="135" rx="6" className="fill-emerald-50/30 dark:fill-emerald-950/10 stroke-emerald-200 dark:stroke-emerald-900/40" />
          <text x="40" y="210" className="fill-emerald-600 dark:fill-emerald-400 font-bold text-xs" fontFamily="system-ui, sans-serif">CLEAN WEB LINK (INSTANT ACCESS)</text>
          
          {/* Web Link Flow */}
          <text x="60" y="255" className="fill-zinc-700 dark:fill-zinc-300 font-bold text-xs" fontFamily="system-ui, sans-serif">HTTPS Web Link</text>
          <line x1="170" y1="250" x2="300" y2="250" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
          <polygon points="300,247 308,250 300,253" className="fill-zinc-400 dark:fill-zinc-500" />
          
          {/* Web preview represent */}
          <rect x="320" y="225" width="140" height="50" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="390" y="248" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-200 text-xs font-semibold" fontFamily="system-ui, sans-serif">GitHub or Sandbox</text>
          <text x="390" y="262" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[10px]" fontFamily="system-ui, sans-serif">Safe & Sandbox Sandbox</text>
          
          <line x1="470" y1="250" x2="500" y2="250" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
          <polygon points="500,247 508,250 500,253" className="fill-zinc-400 dark:fill-zinc-500" />
          
          <text x="520" y="255" className="fill-emerald-600 dark:fill-emerald-400 font-bold text-xs" fontFamily="system-ui, sans-serif">INSTANT REVIEW</text>
        </svg>
      </div>

      <h2 className={h2}>The Threat of Attached Files</h2>
      <p>Corporate laptops are heavily monitored. Security teams block file downloads to protect their systems. If you send a ZIP archive or a raw executable file it will likely trigger an alert. In many companies this immediately quarantines the email. The recipient never knows you sent it.</p>

      <p>Even if the file gets through most managers will not risk their system security to open it. Opening files from an unknown sender is bad security practice. If a candidate cannot understand this basic security rule it shows they lack professional judgment. You want to show you respect system boundaries. You want to make your code safe to inspect. You can read more about file parsing issues in our article explaining <Link href="/pdf" className={link}>why complex files fail automated checks</Link>.</p>

      <p>The solution is simple. Host your code on a trusted platform. Send a link. A link to a public GitHub repository is safe. It is clean. It shows you know how to use industry standard tools to share your work.</p>

      <h2 className={h2}>Pasting Code in Emails and Text Fields</h2>
      <p>Some developers try to avoid attachments by pasting their code directly into the body of an email or application form. This is also a bad idea. Plain text areas strip out indentation. They break line wraps. They remove syntax highlighting. Your beautiful code turns into a giant block of unreadable text.</p>

      <p>Reading code without syntax highlighting is exhausting. It takes three times longer to understand. A manager who has to read fifty lines of raw unformatted Javascript will lose patience immediately. They will assume you do not care about code presentation.</p>

      <p>If you want to share a small snippet of code use a service like GitHub Gist. These tools let you paste code and get a clean URL with proper formatting and line numbers. It keeps the presentation clean and readable without filling an inbox with raw text.</p>

      <div className={callout}>
        <h3 className={h3}>The Code Formatting Checklist</h3>
        <p>Before you send a link check your code formatting. Run a linter to clean up spacing. Ensure your variable names are descriptive. Remove any commented out lines of old code. Clean code shows attention to detail and professional pride.</p>
      </div>

      <h2 className={h2}>The GitHub Repository Gold Standard</h2>
      <p>A public GitHub repository is the best way to share code samples. It is the platform that technical managers use every day. They know how to explore files on it. They can read your commits and branch history.</p>

      <p>To make your repository useful you must write a README file. Do not leave the README blank. A blank file shows laziness. The README is the introduction to your code. Use it to explain what the project does what problem it solves and what technologies you chose. Write clear instructions on how to install and run the code locally.</p>

      <p>Keep your repositories focused. Do not share a single repository that has fifty random playground files. Create a dedicated repository for each major project. Keep the folder structure clean and organized. If you want to optimize your profile check out our guide on <Link href="/readme" className={link}>building a GitHub Profile README</Link> to stand out.</p>

      <h2 className={h2}>Using Interactive Web Sandboxes</h2>
      <p>If you are a frontend developer a static code repository is not enough. Managers want to see your user interface in action. They want to see how the animations run. They want to see how the layout handles different screen sizes. They do not want to pull your repository and set up a local build just to see your UI.</p>

      <p>You should use interactive web sandboxes like StackBlitz CodeSandbox or CodePen. These platforms compile and run your code directly in the web browser. The viewer can see the live running application on the right side of the screen and the source code on the left side.</p>

      <p>This is extremely convenient for the reader. They can change a line of CSS and instantly see the result. They can test your forms and buttons. It shows you understand modern web tools and want to provide a great experience for the reviewer. You can see how this compares to listing skills in our guide on <Link href="/code" className={link}>showing your code instead of listing it</Link>.</p>

      <h2 className={h2}>How to Showcase Work from Private Jobs</h2>
      <p>A huge problem for software developers is that their best code is locked behind private corporate repositories. You signed a non-disclosure agreement. You cannot copy code from your day job. If you do you risk legal trouble. But you still need to prove your capabilities to your next employer.</p>

      <p>The solution is to build a sanitised mock system. If you built a complex microservice at work do not copy it. Instead write a simple open source library that uses the same architecture pattern. If you used a specific event driven architecture with Kafka write a mini system that shows how you handle message serialization and retry queues in a clean way. This proves you understand the architectural concepts without leaking any proprietary corporate logic.</p>

      <p>You only need to write a few hundred lines of high quality code. Focus on the hard parts. Write deep comments explaining why you chose a specific data structure. This shows the manager that you understand system physics even when you are working on a small personal project.</p>

      <h2 className={h2}>The Structure of a Perfect Code Sample</h2>
      <p>When a technical reviewer opens your repository they look at the structure first. If they see a messy root folder with random temporary files they will assume you are messy in your work. A professional repository must look like a production library.</p>

      <p>Use a linter and formatter to keep the style consistent. Add automated tests. Even a few simple unit tests show that you care about code safety and correctness. Make sure your project has a clean directory layout. Separate your source code your tests and your build configurations into clear folders.</p>

      <p>If you use configuration files or environment variables provide a template file that shows what values are needed. Never check database secrets or API keys into your public repositories. This is a massive security risk that will immediately disqualify you from any senior engineering role. Show that you know how to handle configuration safety properly.</p>

      <h2 className={h2}>Make the Entry Point Simple</h2>
      <p>No matter what method you choose to share your code make sure the first step is simple. Place your best links at the top of your web profile. Label them clearly. Instead of writing My Project write View Rust Database Engine Code or Run Live Payment UI Demo.</p>

      <p>This clear labeling tells the reader exactly what to expect. It builds interest. It guides the recruiter directly to your strongest work. It ensures your application is judged on your actual engineering capability rather than getting blocked by a security filter.</p>

      <p>Review your application links today. Remove any zip files or raw code blocks. Replace them with clean public web links on trusted platforms. Give hiring managers a safe fast way to see your code in action.</p>
    </div>
  );
}
