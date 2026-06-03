import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>A senior software engineer applied for a high paying remote role. They had a great career history. They had built scalable database systems. But their portfolio website was hosted on a strange domain name. They had purchased super-coder-ninja-fortress.biz because it was cheap. They also used a free email address from an old provider they registered when they were in high school. The recruiter saw the domain name and immediately assumed the candidate was a hobbyist. The application was deleted before anyone looked at the actual projects.</p>

      <p>Your domain name is the front door to your professional digital life. It is the first thing an employer sees when you share your work. If your domain looks cheap or silly it ruins your credibility before the reader clicks the link. You want a name that looks professional clean and serious.</p>

      <p>Many developers spend weeks building their website but only spend five minutes choosing a domain name. They buy names with hyphens numbers or weird extensions. This is a major mistake. A clean domain name signals that you are an established professional who understands the web. It is an investment in your personal brand.</p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Visual layout comparing confusing domain structures with professional domain structures">
          {/* Background grid */}
          <rect width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1" />
          
          {/* Left Panel - Unprofessional Domains */}
          <rect x="25" y="25" width="300" height="300" rx="6" className="fill-red-50/50 dark:fill-red-950/20 stroke-red-200 dark:stroke-red-900/50" strokeWidth="1" />
          <text x="175" y="50" textAnchor="middle" className="fill-red-600 dark:fill-red-400 font-bold text-sm" fontFamily="system-ui, sans-serif">CONFUSING DOMAINS</text>
          
          {/* Red items */}
          <rect x="50" y="80" width="250" height="45" rx="4" className="fill-white dark:fill-zinc-800 stroke-red-200 dark:stroke-red-900/40" />
          <text x="65" y="108" className="fill-zinc-700 dark:fill-zinc-300 font-mono text-xs" fontFamily="monospace">super-coder-ninja-99.biz</text>
          
          <rect x="50" y="145" width="250" height="45" rx="4" className="fill-white dark:fill-zinc-800 stroke-red-200 dark:stroke-red-900/40" />
          <text x="65" y="173" className="fill-zinc-700 dark:fill-zinc-300 font-mono text-xs" fontFamily="monospace">john-smith-developer-1.info</text>
          
          <rect x="50" y="210" width="250" height="45" rx="4" className="fill-white dark:fill-zinc-800 stroke-red-200 dark:stroke-red-900/40" />
          <text x="65" y="238" className="fill-zinc-700 dark:fill-zinc-300 font-mono text-xs" fontFamily="monospace">react-guy-portfolio.xyz</text>
          
          <text x="175" y="300" textAnchor="middle" className="fill-red-600 dark:fill-red-400 font-bold text-xs" fontFamily="system-ui, sans-serif">SPAM FILTER RISK</text>

          {/* Right Panel - Professional Domains */}
          <rect x="375" y="25" width="300" height="300" rx="6" className="fill-emerald-50/50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-900/50" strokeWidth="1" />
          <text x="525" y="50" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 font-bold text-sm" fontFamily="system-ui, sans-serif">PROFESSIONAL DOMAINS</text>
          
          {/* Green items */}
          <rect x="400" y="80" width="250" height="45" rx="4" className="fill-white dark:fill-zinc-800 stroke-emerald-200 dark:stroke-emerald-900/40" />
          <text x="415" y="108" className="fill-zinc-800 dark:fill-zinc-100 font-mono text-xs" fontFamily="monospace">johnsmith.com</text>
          
          <rect x="400" y="145" width="250" height="45" rx="4" className="fill-white dark:fill-zinc-800 stroke-emerald-200 dark:stroke-emerald-900/40" />
          <text x="415" y="173" className="fill-zinc-800 dark:fill-zinc-100 font-mono text-xs" fontFamily="monospace">smith.dev</text>
          
          <rect x="400" y="210" width="250" height="45" rx="4" className="fill-white dark:fill-zinc-800 stroke-emerald-200 dark:stroke-emerald-900/40" />
          <text x="415" y="238" className="fill-zinc-800 dark:fill-zinc-100 font-mono text-xs" fontFamily="monospace">johnsmith.bio</text>

          <text x="525" y="300" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 font-bold text-xs" fontFamily="system-ui, sans-serif">TRUSTED BRAND</text>
        </svg>
      </div>

      <h2 className={h2}>The Domain Extension Hierarchy</h2>
      <p>Not all domain extensions are equal. The system of top level domains has a clear hierarchy in the minds of recruiters and email systems. The classic dot com extension remains the gold standard. It is the most trusted extension in the world. If you can get your name with a dot com extension you should buy it immediately.</p>

      <p>If your name is taken as a dot com there are other high quality options. For software developers the dot dev extension is excellent. It is operated by Google and requires HTTPS security by default. It instantly signals that you work in technology. Another great option is dot bio which is perfect for personal profile pages.</p>

      <p>Avoid cheap or spammy extensions. Extensions like dot biz dot info dot top or dot zip are frequently used by bad actors. Because these domains are very cheap to register spam filters flag them. If you send an email from a dot biz domain it has a higher chance of landing in the spam folder. You want to stay far away from these choices. You can read more about how your link structure affects recruiter delivery in our guide on <Link href="/inbox" className={link}>using clean URLs to stand out</Link>.</p>

      <h2 className={h2}>Naming Patterns that Establish Authority</h2>
      <p>When you choose the text of your domain keep it simple. The absolute best pattern is your first name followed by your last name. If your name is John Smith try to buy johnsmith dot com. It is clean and easy to remember.</p>

      <p>If that name is taken you can try variations. You can use your middle initial or last name first. You can use your first name and last name with a dot dev extension. For example johnsmith dot dev or jsmith dot com are strong professional choices.</p>

      <p>Do not add filler words like code dev or portfolio to your name. Names like johnsmithcoding dot com look cluttered. They are harder to spell. You want a name that you can say over the phone without having to repeat yourself. If a manager cannot spell your domain after hearing it once it is too complex.</p>

      <div className={callout}>
        <h3 className={h3}>The Spelling Test</h3>
        <p>Say your domain name out loud to a friend. Ask them to write it down. If they ask how to spell a word or if they get confused about hyphens your name is too difficult. Choose a name that uses standard spelling and zero special characters.</p>
      </div>

      <h2 className={h2}>The Risk of Hyphens and Numbers</h2>
      <p>Some developers buy domains with hyphens or numbers because their clean name is taken. For example they buy john-smith-99 dot com. This is a bad idea. Hyphens are annoying to type on mobile keyboards. Numbers look unprofessional and suggest that you are late to the internet.</p>

      <p>Hyphens also create confusion. If you tell someone your site is john hyphen smith dot com they might forget the hyphen and visit your competitor. It is much better to change your extension to dot dev or dot bio than to add hyphens to a dot com name. Keep the text letters only.</p>

      <p>Numbers also raise questions. A manager might wonder if there are ninety eight other John Smiths at your company. It looks like a default username. You want your domain to represent a unique professional brand. Avoid numbers completely.</p>

      <h2 className={h2}>Setting Up Professional Email</h2>
      <p>Once you have a clean domain name do not just use it for your website. Use it to set up a professional email address. An email like contact at johnsmith dot com looks infinitely better than a free email from an old provider.</p>

      <p>Using a custom email address shows you understand how domain hosting works. It proves you can configure DNS records like MX and SPF settings. This is a basic technical skill that every developer should have. It also prevents your emails from getting flagged by enterprise spam filters.</p>

      <p>Setting up custom email is very cheap. You can use services like Google Workspace or Fastmail for a few dollars a month. It is a small price to pay for a massive increase in professional credibility. If you want to see how to integrate this link cleanly with your CV check our article on <Link href="/link" className={link}>sending your CV as a web link</Link>.</p>

      <h2 className={h2}>DNS Records that Ensure Delivery</h2>
      <p>Owning a domain name is only the first step. You must also configure the domain settings to ensure your emails actually reach recruiters. If you do not set up proper security protocols your custom emails will end up in spam folders.</p>

      <p>You need to configure three specific types of records in your domain settings. The first is SPF which lists the servers allowed to send mail for your domain. The second is DKIM which adds a digital signature to your messages to verify they came from you. The third is DMARC which tells other servers what to do if an email fails the SPF or DKIM checks.</p>

      <p>Setting these up is simple. Your email provider will give you text records to add to your registrar dashboard. Adding these records shows that you understand the mechanics of the internet. It guarantees that when you reply to an interview invitation your email will arrive in the inbox instead of getting lost in a spam filter.</p>

      <h2 className={h2}>Choosing the Right Domain Registrar</h2>
      <p>Where you buy your domain name also matters. Some popular registrars use manipulative designs to sell you services you do not need. They will try to charge you extra for privacy protection or email forwarding. These features should always be free.</p>

      <p>Look for modern registrars that offer transparent pricing and clean interfaces. Cloudflare Porkbun and Namecheap are excellent choices. They do not add hidden fees when your domain renews after the first year. They also provide free WHOIS privacy which hides your phone number and home address from public databases.</p>

      <p>Avoiding registrars that spam you with advertisements is a good practice. You want a tool that lets you manage your records quickly without sorting through confusing offers. A clean interface makes it easy to update your IP addresses when you change hosting providers.</p>

      <h2 className={h2}>Integrating Your Domain with Your Portfolio</h2>
      <p>When you have your domain ready link it to your web profile. If you use a platform to host your work make sure it supports custom domains. You do not want to show a long complex address with subdomains from a hosting provider.</p>

      <p>A custom domain makes your portfolio feel like an independent product. It shows you take your career seriously. It makes your profile easy to share on your CV on GitHub and on social platforms. You can check out different hosting options in our guide on <Link href="/portfolio" className={link}>best portfolio platforms for developers</Link> to see which ones support custom domains easily.</p>

      <p>Do not ignore the power of a clean domain. Spend the time to find a name that is short professional and easy to spell. It is the foundation of your digital presence and the first step in winning the attention of top engineering managers.</p>
    </div>
  );
}
