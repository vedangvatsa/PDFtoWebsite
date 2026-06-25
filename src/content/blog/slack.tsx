import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="flex flex-col gap-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>A software developer joins a regional developer community on Slack. They find the hiring channel and immediately upload a file named document.pdf with a generic message asking for work. The message disappears up the screen in five minutes and gets zero clicks.</p>
      
      <p>This scene happens every single day across thousands of professional chat groups. Chat channels are not traditional job boards. They are fast rivers of text where attention is the most expensive currency.</p>

      <p>Posting a raw file is the fastest way to get ignored. People do not trust random downloads from strangers. You need a modern strategy to stand out in a high velocity feed.</p>

      <h2 className={h2}>Why PDF Attachments Fail in Slack Feeds</h2>
      <p>Uploading a file adds massive friction to the reading process. The reader must click the file and wait for Slack to download it. On mobile devices this process frequently fails or opens a separate reader application.</p>

      <p>A static file cannot adapt to a six inch phone screen. The recruiter must pinch and scroll horizontally to read your text. This friction causes immediate reader fatigue and leads to rejection.</p>

      <p>Static files also look like spam. A channel filled with generic PDF icons becomes a blur to hiring managers. You must use visual elements to capture attention immediately.</p>

      <div className={callout}>
        <h3 className={h3}>Avoid Raw File Uploads</h3>
        <p>Do not upload your CV as a static document in chat rooms. It creates security alerts for corporate users and requires too many steps to read. Use a web link that loads instantly in any browser instead.</p>
      </div>

      <h2 className={h2}>The OpenGraph Advantage of a Web Link</h2>
      <p>Sharing a web link changes how your application looks in the feed. Slack reads the metadata of your web page to create a rich visual preview. This preview block appears automatically below your message.</p>

      <p>A good preview contains your name and primary engineering role. It displays a clean description of your stack and a direct call to action. This preview turns a simple text post into a visual banner.</p>

      <p>A web link also allows you to update your details in real time. If you find a typo you can edit your profile immediately. Anyone who clicks the link will view the updated version.</p>

      {/* SVG Diagram showing Slack PDF vs Link Preview */}
      <div className="not-prose my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Comparison of a PDF attachment versus a web link preview on Slack">
          <rect width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-900/30" />
          
          {/* Left Side PDF File Post */}
          <text x="180" y="30" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 font-bold" fontSize="12">STATIC PDF METHOD</text>
          <rect x="30" y="50" width="300" height="260" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
          
          {/* Mock Slack Message 1 */}
          <circle cx="60" cy="80" r="15" className="fill-zinc-300 dark:fill-zinc-600" />
          <rect x="85" y="70" width="100" height="8" rx="4" className="fill-zinc-400 dark:fill-zinc-500" />
          <rect x="85" y="85" width="220" height="6" rx="3" className="fill-zinc-300 dark:fill-zinc-600" />
          
          {/* PDF Attachment Icon Box */}
          <rect x="85" y="110" width="220" height="60" rx="6" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <rect x="100" y="125" width="30" height="30" rx="4" className="fill-red-500" />
          <text x="115" y="143" textAnchor="middle" className="fill-white font-bold" fontSize="11">PDF</text>
          <rect x="142" y="128" width="120" height="6" rx="3" className="fill-zinc-400 dark:fill-zinc-500" />
          <rect x="142" y="142" width="80" height="5" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
          
          <text x="180" y="270" textAnchor="middle" className="fill-red-600 dark:fill-red-400 font-semibold" fontSize="11">Requires Download and Pinch Zoom</text>
          <text x="180" y="290" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="10">High friction - Low response rate</text>

          {/* Vertical Divider */}
          <rect x="349" y="20" width="2" height="310" className="fill-zinc-200 dark:fill-zinc-800" />

          {/* Right Side Web Link Post */}
          <text x="520" y="30" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 font-bold" fontSize="12">WEB LINK PREVIEW METHOD</text>
          <rect x="370" y="50" width="300" height="260" rx="8" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
          
          {/* Mock Slack Message 2 */}
          <circle cx="400" cy="80" r="15" className="fill-zinc-300 dark:fill-zinc-600" />
          <rect x="425" y="70" width="100" height="8" rx="4" className="fill-zinc-400 dark:fill-zinc-500" />
          {/* Message text with link */}
          <rect x="425" y="85" width="130" height="6" rx="3" className="fill-zinc-300 dark:fill-zinc-600" />
          <rect x="560" y="85" width="80" height="6" rx="3" className="fill-emerald-500 dark:fill-emerald-400" />
          
          {/* OG Preview Box */}
          <rect x="425" y="110" width="230" height="110" rx="6" className="fill-zinc-50 dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
          <rect x="425" y="110" width="4" height="110" className="fill-emerald-500" />
          
          <text x="440" y="132" className="fill-zinc-900 dark:fill-zinc-100 font-bold" fontSize="11">Alex Miller | React Developer</text>
          <text x="440" y="152" className="fill-zinc-500 dark:fill-zinc-400" fontSize="10">Specialist in frontend performance and build tools</text>
          
          {/* Skill Badges inside preview */}
          <rect x="440" y="170" width="45" height="16" rx="4" className="fill-zinc-200 dark:fill-zinc-800" />
          <text x="462" y="181" textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-300" fontSize="8">React</text>
          
          <rect x="490" y="170" width="55" height="16" rx="4" className="fill-zinc-200 dark:fill-zinc-800" />
          <text x="517" y="181" textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-300" fontSize="8">TypeScript</text>
          
          <rect x="550" y="170" width="45" height="16" rx="4" className="fill-zinc-200 dark:fill-zinc-800" />
          <text x="572" y="181" textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-300" fontSize="8">NextJS</text>
          
          <text x="440" y="205" className="fill-emerald-600 dark:fill-emerald-400 font-semibold" fontSize="10">cvin.bio/alex-miller</text>

          <text x="520" y="270" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 font-semibold" fontSize="11">One Click Web Access</text>
          <text x="520" y="290" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="10">Interactive - High engagement</text>
        </svg>
      </div>

      <h2 className={h2}>Crafting the Perfect Slack Introduction Message</h2>
      <p>Your introduction message must be short and focused on engineering realities. Do not write a long essay about your childhood passion for software. Busy managers will scroll past long walls of text.</p>

      <p>Structure your pitch to highlight your stack and your location status. Start with your primary job title. Mention if you are looking for remote work or if you can work in a specific timezone.</p>

      <p>Detail your most impressive technical achievements using percentages. Mention how you reduced server response times or improved frontend bundle sizes. Keep this section to a single sentence.</p>

      <p>End your message with a call to action and your web link. Put the link on its own line. This placement allows Slack to generate the card preview cleanly without text overlapping.</p>

      <h2 className={h2}>Examples of Slack Pitch Structures</h2>
      <p>Use a structured layout to make your message easy to read. Bullet lists help readers scan your information in under two seconds. Here is a strong template you can adapt.</p>

      <ul className={ul}>
        <li><span className={bold}>Role</span> Senior Backend Engineer with eight years of commercial experience.</li>
        <li><span className={bold}>Primary Technologies</span> Node, PostgreSQL, and AWS systems.</li>
        <li><span className={bold}>Core Win</span> Reduced database query latencies by fifty percent on a high traffic application.</li>
        <li><span className={bold}>Availability</span> Seeking remote roles in European timezones.</li>
      </ul>

      <p>Contrast this structure with a weak pitch. Vague statements like searching for a software developer role because I love coding carry zero signal. Recruiters need concrete details to match you with active jobs.</p>

      <p>Keep your language clean and professional. Avoid corporate buzzwords and generic claims. Focus purely on technical metrics and tools you have used in production.</p>

      <h2 className={h2}>Interacting with Hiring Managers in Private Messages</h2>
      <p>Hiring managers often post detailed job descriptions in Slack channels. When you find a posting that matches your skills do not reply in the public thread. Send a direct message to show professional courtesy.</p>

      <p>Open your direct message with a reference to the specific posting. State that you read their requirement for a developer. Keep your greeting formal and polite.</p>

      <p>Summarize your match in three short sentences. Explain how your stack aligns with their project requirements. Share your live profile link so they can view your projects.</p>

      <p>Do not ask for a meeting in your first message. Simply present your details and let the quality of your profile build interest. If your web page is clean they will request an interview.</p>

      <h2 className={h2}>Managing Follow Ups Without Being Annoying</h2>
      <p>Patience is required when searching for work in chat rooms. Hiring managers receive dozens of messages daily and cannot reply to everyone instantly. Give them time to review your profile.</p>

      <p>Wait three business days before sending a follow up message. If you write back too quickly you will look desperate. Keep the update short and focus on new details.</p>

      <p>Share a new project you built or a code optimization you completed. This addition shows that you are active and productive. It provides a natural reason to start the conversation again.</p>

      <p>If they do not reply to your second message you should stop writing. Move on to other communities. Continuing to message a silent contact will get your profile flagged as spam.</p>

      <h2 className={h2}>Ethical Standards for Technical Channels</h2>
      <p>Every Slack workspace has community rules you must follow. Respecting these rules shows that you are a good colleague. Breaking rules will get you banned from the community.</p>

      <p>Never post your pitch in general discussion rooms. Only post in channels designated for hiring or self promotion. Keeping your job search in the right channels shows respect for the community.</p>

      <p>Do not tag workspace admins or channel members in your posts. Tagging people who do not know you is intrusive. Let managers find your post naturally through search filters.</p>

      <p>Keep your profile details consistent across different workspaces. Hiring managers often belong to multiple regional channels. If they see you posting conflicting details they will reject your profile.</p>

      <h2 className={h2}>The Advantage of a Hosted Technical Profile</h2>
      <p>A web profile centralizes everything a recruiter needs — your stack, your projects, your contact info — behind one link. When you share a web link you invite recruiters to interact with your work.</p>

      <p>Your web profile can link directly to your GitHub repository and live demonstrations. It allows recruiters to verify your skills with a single click. This speed is critical in fast moving chat feeds.</p>

      <p>Web profiles also bypass the parsing errors common in static files. The recruiter views your clean layout exactly as you built it. This presentation shows that you care about design and technology.</p>

      <p>Using a tool like CVin.Bio allows you to build a clean web link in minutes. You get a mobile responsive page that generates rich previews across all major chat tools. This setup gives you an immediate advantage in competitive hiring channels.</p>

      <h2 className={h2}>Read Next</h2>
      <p>For more advice on sharing your work and finding hidden roles read these detailed articles.</p>
      
      <p>
        Discover private channels and job markets by reading <Link href="/communities" className={link}>Best Communities for Finding the Hidden Job Market</Link>.
      </p>
      <p>
        Learn how to write to hiring managers by reading <Link href="/send" className={link}>Best Ways to Send Your CV to a Recruiter</Link>.
      </p>
      <p>
        Explore the advantages of online profiles by reading <Link href="/link" className={link}>Sending Your CV as a Web Link Instead of a PDF File</Link>.
      </p>
    </div>
  );
}
