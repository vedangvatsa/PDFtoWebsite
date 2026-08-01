import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        <span className={bold}>Direct answer:</span> Use a{' '}
        <span className={bold}>CV website link</span> as your primary share format. Keep a simple
        one-column PDF only when a portal forces a file upload. For most email, Slack, LinkedIn, and
        WhatsApp outreach, the link wins.
      </p>

      <div className={callout}>
        <h3 className={h3}>Best for whom</h3>
        <p>
          <span className={bold}>CV website:</span> cold outreach, referrals, communities, and any
          human who will open your profile on a phone.
          <br />
          <span className={bold}>PDF:</span> ATS upload forms that reject URLs, or print-only events.
        </p>
      </div>

      <h2 className={h2}>Side-by-side</h2>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-left text-base border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="py-2 pr-4 font-semibold text-zinc-900 dark:text-zinc-100">Factor</th>
              <th className="py-2 pr-4 font-semibold text-zinc-900 dark:text-zinc-100">CV website</th>
              <th className="py-2 font-semibold text-zinc-900 dark:text-zinc-100">PDF</th>
            </tr>
          </thead>
          <tbody className="text-zinc-700 dark:text-zinc-300">
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2 pr-4">Phone reading</td>
              <td className="py-2 pr-4">Native mobile layout</td>
              <td className="py-2">Often needs zoom</td>
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2 pr-4">Sharing</td>
              <td className="py-2 pr-4">Link + preview card</td>
              <td className="py-2">Download / re-upload</td>
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2 pr-4">Updates after apply</td>
              <td className="py-2 pr-4">Edit live</td>
              <td className="py-2">Must resend file</td>
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2 pr-4">ATS portals</td>
              <td className="py-2 pr-4">Paste in other / portfolio field</td>
              <td className="py-2">Required on many forms</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Tracking</td>
              <td className="py-2 pr-4">Views possible</td>
              <td className="py-2">Usually none</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className={h2}>Practical rule</h2>
      <ul className={ul}>
        <li>
          Put your <Link href="/pdf-to-website" className={link}>CVin.Bio link</Link> in your email
          signature, LinkedIn, and cold messages.
        </li>
        <li>
          When a job site demands a file, upload a plain PDF and still include the URL in the
          cover note or portfolio field (
          <Link href="/bypass" className={link}>dual-submission approach</Link>
          ).
        </li>
      </ul>

      <h2 className={h2}>Honest limits</h2>
      <p>
        Some government and enterprise portals only accept PDF or DOC. A website cannot replace those
        uploads. It replaces the PDF as your default way of introducing yourself to people.
      </p>

      <h2 className={h2}>Related</h2>
      <ul className={ul}>
        <li>
          <Link href="/pdf-to-website" className={link}>Convert a PDF resume to a website</Link>
        </li>
        <li>
          <Link href="/attachments" className={link}>Why recruiters skip unreadable CV attachments</Link>
        </li>
        <li>
          <Link href="/inbox" className={link}>Stand out with a clean URL in inboxes</Link>
        </li>
      </ul>
    </div>
  );
}
