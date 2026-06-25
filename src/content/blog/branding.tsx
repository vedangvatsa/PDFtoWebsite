import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="flex flex-col gap-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>A senior software engineer applies for a high-paying staff role using a link that points to a generic hosting subdomain. The URL is long and contains multiple random numbers that look like a temporary test environment. The next candidate submits a clean URL pointing to their name dot dev domain. The recruiter clicks the clean link immediately because it looks polished and professional.</p>

      <p>Your web profile link is the very first impression you make on a prospective employer. Hosting your CV on a generic third-party subdomain signals a lack of investment in your personal brand. A custom domain shows that you treat your career like a professional enterprise.</p>

      <p>Configuring a custom domain is also a direct demonstration of your technical skills. It proves you understand domain name systems and web security standards. Setting up DNS records and SSL certificates is standard engineering practice that every developer should master.</p>

      <h2 className={h2}>Why Custom Domains Matter for Job Hunters</h2>
      <p>Generic web addresses are difficult to remember and look highly unprofessional in job applications. They are easy to mistype and often get cut off in candidate tracking databases. A short custom domain solves these problems by offering a clean brand presence.</p>

      <p>A custom domain gives you total ownership over your online presence. You can move your portfolio to different hosting platforms without changing your contact links. This stability ensures your application links remain active for years.</p>

      <p>Web search engines also prefer custom domains over generic subdomains. Hosting your CV on a dedicated domain increases your search ranking for your own name. This makes it easier for recruiters to find your work when they search for you online.</p>

      <div className={callout}>
        <h3 className={h3}>Keep the Name Simple</h3>
        <p>Choose a domain name that consists of your first and last name if possible. Avoid adding numbers or confusing abbreviations that make the address hard to remember. A clean simple name is easy for recruiters to type and share.</p>
      </div>

      <h2 className={h2}>Selecting the Right Domain Extension</h2>
      <p>The domain extension you choose affects how people perceive your professional focus. While dot com is the standard for businesses developers have multiple modern options. Select an extension that matches your target industry.</p>

      <p>The dot dev extension is highly respected in the software engineering community. It instantly signals that the site belongs to a developer or technical professional. The dot me extension is great for personal portfolios and creative profiles.</p>

      <p>Avoid using obscure or cheap extensions that look like spam links. Extensions like dot biz or dot info can trigger email spam filters and look unprofessional. Stick to recognized extensions to ensure your links are clicked.</p>

      <p>Check the renewal pricing before purchasing your domain. Some modern extensions are cheap to register but expensive to renew. Choose a domain you can afford to maintain over your entire career.</p>

      <h2 className={h2}>Configuring Your DNS Records Correctly</h2>
      <p>To connect your domain to your hosting server you must configure your DNS records. This setup translates your human-readable domain name into an IP address. Incorrect DNS configurations will cause your site to load slowly or fail entirely.</p>

      <p>Set up your A and AAAA records to point directly to your hosting provider's servers. These records handle IPv4 and IPv6 traffic and ensure global accessibility. Use CNAME records for subdomains like www to route users to your main site.</p>

      <p>Set your TTL values to balance speed and flexibility. A lower time-to-live value lets you update server IPs quickly during migrations. A higher value reduces DNS lookup times for your visitors.</p>

      <p>Use DNS propagation checkers to verify your configurations globally. It can take up to twenty-four hours for DNS changes to spread across the web. Ensure your site is fully accessible before sending links to employers.</p>

      {/* SVG Diagram: Unbranded vs. Branded portfolio identity */}
      <div className="not-prose my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 380" className="w-full h-auto" role="img" aria-label="Before and after comparison showing an unbranded generic portfolio versus a branded portfolio with custom domain, colors, and typography">
          <style>{`
            .br-title { font: 600 13px system-ui, sans-serif; }
            .br-label { font: 500 11px system-ui, sans-serif; }
            .br-small { font: 400 10px system-ui, sans-serif; }
            .br-code { font: 500 9px 'SF Mono', 'Fira Code', monospace; }
            .br-badge { font: 700 8px system-ui, sans-serif; letter-spacing: 0.05em; }
          `}</style>

          {/* Left: Unbranded */}
          <text x="160" y="22" textAnchor="middle" className="br-title fill-red-500 dark:fill-red-400">❌ Unbranded Portfolio</text>
          <rect x="20" y="36" width="300" height="320" rx="8" className="fill-zinc-50 dark:fill-zinc-800/40 stroke-red-200 dark:stroke-red-800" strokeWidth="1.5" />

          {/* URL bar */}
          <rect x="35" y="50" width="270" height="22" rx="4" className="fill-white dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="45" y="65" className="br-code fill-zinc-400 dark:fill-zinc-500">jsmith2847.github.io/portfolio</text>
          <text x="235" y="65" className="br-badge fill-red-400 dark:fill-red-500">GENERIC</text>

          {/* Generic page */}
          <rect x="35" y="80" width="270" height="180" rx="4" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
          <rect x="35" y="80" width="270" height="24" rx="4" className="fill-zinc-100 dark:fill-zinc-800" />
          <rect x="35" y="100" width="270" height="4" className="fill-zinc-100 dark:fill-zinc-800" />
          <text x="45" y="96" className="br-small fill-zinc-400 dark:fill-zinc-500">Portfolio    Resume    Contact</text>

          <text x="170" y="125" textAnchor="middle" className="br-label fill-zinc-900 dark:fill-zinc-100" fontWeight="600">John Smith</text>
          <text x="170" y="140" textAnchor="middle" className="br-small fill-zinc-500 dark:fill-zinc-400">Developer</text>
          <rect x="50" y="150" width="240" height="6" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
          <rect x="50" y="162" width="200" height="6" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />
          <rect x="50" y="174" width="220" height="6" rx="2" className="fill-zinc-200 dark:fill-zinc-700" />

          {/* Default colors indicator */}
          <text x="50" y="200" className="br-badge fill-zinc-400 dark:fill-zinc-500">COLORS</text>
          <rect x="100" y="192" width="16" height="12" rx="2" className="fill-blue-500" />
          <rect x="120" y="192" width="16" height="12" rx="2" className="fill-zinc-400" />
          <rect x="140" y="192" width="16" height="12" rx="2" className="fill-white stroke-zinc-300" strokeWidth="1" />
          <text x="164" y="202" className="br-small fill-red-400 dark:fill-red-500">Browser defaults</text>

          {/* No favicon */}
          <text x="50" y="225" className="br-badge fill-zinc-400 dark:fill-zinc-500">FAVICON</text>
          <rect x="100" y="215" width="14" height="14" rx="2" className="fill-zinc-200 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
          <text x="120" y="226" className="br-small fill-red-400 dark:fill-red-500">Missing</text>

          {/* No OG */}
          <text x="50" y="248" className="br-badge fill-zinc-400 dark:fill-zinc-500">LINK PREVIEW</text>
          <rect x="50" y="253" width="240" height="30" rx="3" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
          <text x="60" y="272" className="br-small fill-zinc-400 dark:fill-zinc-500">jsmith2847.github.io — No preview</text>

          <text x="160" y="305" textAnchor="middle" className="br-badge fill-red-400 dark:fill-red-500">LOOKS LIKE EVERY OTHER PORTFOLIO</text>
          <text x="160" y="320" textAnchor="middle" className="br-small fill-zinc-500 dark:fill-zinc-400">Zero recognition · Forgotten in seconds</text>

          {/* Right: Branded */}
          <text x="530" y="22" textAnchor="middle" className="br-title fill-emerald-600 dark:fill-emerald-400">✓ Branded Portfolio</text>
          <rect x="380" y="36" width="300" height="320" rx="8" className="fill-emerald-50/30 dark:fill-emerald-950/10 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1.5" />

          {/* URL bar with custom domain */}
          <rect x="395" y="50" width="270" height="22" rx="4" className="fill-white dark:fill-zinc-900 stroke-emerald-300 dark:stroke-emerald-600" strokeWidth="1" />
          <text x="405" y="65" className="br-code fill-zinc-700 dark:fill-zinc-300">🔒 janedev.io</text>
          <text x="530" y="65" className="br-badge fill-emerald-600 dark:fill-emerald-400">CUSTOM DOMAIN</text>

          {/* Branded page */}
          <rect x="395" y="80" width="270" height="180" rx="4" className="fill-zinc-900 dark:fill-zinc-900 stroke-emerald-200 dark:stroke-emerald-700" strokeWidth="1" />
          <rect x="395" y="80" width="270" height="24" rx="4" className="fill-zinc-800 dark:fill-zinc-800" />
          <rect x="395" y="100" width="270" height="4" className="fill-zinc-800 dark:fill-zinc-800" />
          <circle cx="410" cy="92" r="5" className="fill-emerald-500" />
          <text x="420" y="96" className="br-small fill-zinc-300">JD    Work    About</text>

          <text x="530" y="125" textAnchor="middle" className="br-label fill-white" fontWeight="700">Jane Developer</text>
          <text x="530" y="140" textAnchor="middle" className="br-small fill-emerald-400">Full-Stack Engineer · React · Go</text>
          <rect x="410" y="150" width="240" height="6" rx="2" className="fill-zinc-700" />
          <rect x="410" y="162" width="200" height="6" rx="2" className="fill-zinc-700" />
          <rect x="410" y="174" width="220" height="6" rx="2" className="fill-zinc-700" />

          {/* Custom colors */}
          <text x="410" y="200" className="br-badge fill-zinc-400">COLORS</text>
          <rect x="460" y="192" width="16" height="12" rx="2" className="fill-emerald-500" />
          <rect x="480" y="192" width="16" height="12" rx="2" className="fill-zinc-900" />
          <rect x="500" y="192" width="16" height="12" rx="2" className="fill-zinc-100" />
          <text x="524" y="202" className="br-small fill-emerald-500 dark:fill-emerald-400">Curated palette</text>

          {/* Custom favicon */}
          <text x="410" y="225" className="br-badge fill-zinc-400">FAVICON</text>
          <rect x="460" y="215" width="14" height="14" rx="2" className="fill-emerald-500" />
          <text x="467" y="225" textAnchor="middle" className="fill-white" style={{fontSize: '8px', fontWeight: 700}}>JD</text>
          <text x="480" y="226" className="br-small fill-emerald-500 dark:fill-emerald-400">Custom logo</text>

          {/* OG preview */}
          <text x="410" y="248" className="br-badge fill-zinc-400">LINK PREVIEW</text>
          <rect x="410" y="253" width="240" height="30" rx="3" className="fill-emerald-50 dark:fill-emerald-900/30 stroke-emerald-200 dark:stroke-emerald-700" strokeWidth="1" />
          <rect x="414" y="257" width="22" height="22" rx="2" className="fill-emerald-200 dark:fill-emerald-800" />
          <text x="442" y="268" className="br-small fill-zinc-900 dark:fill-zinc-100" fontWeight="600">Jane Developer — Portfolio</text>
          <text x="442" y="280" className="br-code fill-zinc-500 dark:fill-zinc-400">Full-stack engineer with 6 years...</text>

          <text x="530" y="305" textAnchor="middle" className="br-badge fill-emerald-600 dark:fill-emerald-400">INSTANTLY RECOGNIZABLE IDENTITY</text>
          <text x="530" y="320" textAnchor="middle" className="br-small fill-zinc-500 dark:fill-zinc-400">Professional · Memorable · Shareable</text>

          {/* Divider */}
          <line x1="355" y1="22" x2="355" y2="365" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      <h2 className={h2}>Securing Your Site with HTTPS</h2>
      <p>A web browser will show a warning screen if a user visits a site without SSL security. This warning page will terrify non-technical recruiters and cause them to close your link immediately. You must secure your custom domain with HTTPS.</p>

      <p>Most modern hosting platforms offer automatic SSL certificates with zero setup. They generate and renew your certificates using free open certificate authorities. This keeps your domain secure and accessible without manual work.</p>

      <p>Set up automatic redirects to force all visitors onto the secure HTTPS version of your site. This protects user privacy and meets modern browser security standards. A secure lock icon next to your URL builds immediate trust.</p>

      <p>Check your site security configuration using online tools to find vulnerabilities. Keep your server software updated and avoid loading insecure assets onto your pages. A clean security report protects both you and your visitors.</p>

      <h2 className={h2}>Setting Up a Professional Custom Email</h2>
      <p>Applying for jobs using a generic email address from a free provider looks sloppy. It signals you have not invested in your professional presence. A custom domain lets you set up a dedicated email address that matches your brand.</p>

      <p>Use your domain to create an address like hello at your name dot dev. This matches your web profile URL and reinforces your professional brand. It shows that you pay attention to minor details in your business communications.</p>

      <p>Set up email forwarding or link your custom address to your preferred email client. This ensures you receive all recruiter messages in a single inbox and can reply quickly. Fast response times are critical during active job hunts.</p>

      <p>Add SPF and DKIM records to verify your email server's identity. This prevents your professional emails from ending up in recruiter spam folders. Deliverability is just as important as the content of your message.</p>

      <h2 className={h2}>Avoiding Common Domain Mistakes</h2>
      <p>Many job hunters make the mistake of choosing domain names that are too long. A domain with thirty characters is difficult to type on a phone and takes up too much space on a page. Keep your address under fifteen characters if possible.</p>

      <p>Avoid using hyphens or special symbols in your domain name. These characters make the address hard to communicate verbally and increase typing errors. Stick to letters to ensure a clean memorable link.</p>

      <p>Set up automatic renewal for your domain registration. Losing ownership of your domain during a job application process is a complete disaster. It breaks all your sent links and allows others to purchase your name.</p>

      <p>Check the spelling of your domain name carefully before purchasing. A typo in your professional URL looks extremely sloppy and confuses prospective employers. Take time to double-check every letter before paying.</p>

      <h2 className={h2}>Read Next</h2>
      <p>For more advice on branding and managing your web presence read these detailed articles.</p>
      
      <p>
        Learn how to choose domain names for portfolios by reading <Link href="/domains" className={link}>Best Domain Names for Developer Portfolios and Web Resumes</Link>.
      </p>
      <p>
        Explore how to host your personal projects by reading <Link href="/hosting" className={link}>Best Practices for Hosting Personal Projects for Job Hunts</Link>.
      </p>
      <p>
        Discover how clean URLs help you stand out by reading <Link href="/inbox" className={link}>Using Clean URLs to Stand Out in Application Inboxes</Link>.
      </p>
    </div>
  );
}
