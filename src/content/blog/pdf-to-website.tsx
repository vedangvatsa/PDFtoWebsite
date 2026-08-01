import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        <span className={bold}>Direct answer:</span> Upload your PDF (or Word) resume to{' '}
        <Link href="/" className={link}>CVin.Bio</Link>, let AI extract the content, then publish a
        public profile at <span className={bold}>cvin.bio/your-name</span>. That link is the website
        version of your CV. Free to create. No design tools required.
      </p>

      <div className={callout}>
        <h3 className={h3}>Best for</h3>
        <p>
          Job seekers who need a clean, mobile-friendly resume link in under five minutes. Not a
          custom coded portfolio. Not a Canva export. A live page recruiters can open instantly.
        </p>
      </div>

      <h2 className={h2}>Why convert a PDF to a website</h2>
      <p>
        PDFs break in email, look wrong on phones, and cannot update after you hit send. A web CV
        opens in one tap, shows a preview card in Slack or WhatsApp, and lets you fix typos after
        applying. For the full case against attachments, see{' '}
        <Link href="/send" className={link}>how to send your resume</Link>.
      </p>

      <h2 className={h2}>Steps</h2>
      <ol className={ol}>
        <li>Go to <Link href="/" className={link}>cvin.bio</Link> and upload your PDF, Word, or image CV.</li>
        <li>Review the parsed profile (experience, education, skills).</li>
        <li>Pick a short URL slug and publish.</li>
        <li>Share <span className={bold}>cvin.bio/your-slug</span> in applications and DMs.</li>
      </ol>

      <h2 className={h2}>What you get vs a PDF</h2>
      <ul className={ul}>
        <li>Mobile layout that does not need pinch-zoom</li>
        <li>Open Graph preview when the link is pasted</li>
        <li>Edits that apply to every link you already sent</li>
        <li>Structured data that search and AI crawlers can read</li>
      </ul>

      <h2 className={h2}>Honest limits</h2>
      <p>
        CVin.Bio is a professional profile page, not a full marketing site. If you need a custom
        portfolio with case-study galleries, pair this link with a project site. For most
        applications, the CV website is enough.
      </p>

      <h2 className={h2}>Related</h2>
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
      </ul>
    </div>
  );
}
