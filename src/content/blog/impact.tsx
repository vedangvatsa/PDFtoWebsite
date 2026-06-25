import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">

        <p>Almost every piece of modern career advice demands that you attach a massive dollar sign to your work history. They tell you to prove exactly how much revenue your code generated. This advice is incredibly frustrating for engineers and designers because it ignores corporate reality.</p>
        <p>Unless you work directly in enterprise sales or growth marketing you probably have absolutely zero access to the financial dashboard. If you build internal tooling or optimize database queries the company does not share the exact monetary value of your labor. This reality causes many brilliant technical workers to just list their coding languages instead of their actual business impact.</p>
        
        <h2 className={h2}>Focus on Relative Physics</h2>
        <p>If you cannot measure money you must measure the physics of the system. You measure speed and volume. A hiring manager does not need to see a dollar sign to understand that making a system twice as fast is incredibly lucrative for the business.</p>
        <p>Did your code reduce the API latency from two seconds down to two hundred milliseconds. Did you migrate a legacy frontend application that successfully served a sudden spike of three million users without crashing. These are massive engineering achievements that speak entirely for themselves.</p>
        
        <div className={callout}>
          <h3 className={h3}>The Percentage Multiplier</h3>
          <p>When raw numbers are held secret by your boss you can always safely use percentage improvements. Simply state that your architecture redesign increased data processing efficiency by forty percent. The hiring recruiter will naturally do the math and assume you saved the company a fortune in server costs.</p>
        </div>

        <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
          <svg viewBox="0 0 680 290" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Header row */}
            <text x="150" y="24" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">VAGUE CLAIM</text>
            <text x="530" y="24" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="0.05em" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">WITH METRICS</text>

            {/* Row 1 */}
            <rect x="16" y="42" width="268" height="64" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <rect x="16" y="42" width="4" height="64" rx="2" className="fill-red-400" />
            <text x="32" y="68" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">"Improved the</text>
            <text x="32" y="86" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">onboarding process"</text>

            {/* Arrow 1 */}
            <line x1="296" y1="74" x2="382" y2="74" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="382,70 390,74 382,78" className="fill-zinc-400 dark:fill-zinc-500" />

            <rect x="396" y="42" width="268" height="64" rx="6" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1" />
            <rect x="396" y="42" width="4" height="64" rx="2" className="fill-emerald-500" />
            <text x="412" y="68" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">"Cut new hire ramp-up</text>
            <text x="412" y="86" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">from 3 weeks to 5 days"</text>

            {/* Row 2 */}
            <rect x="16" y="122" width="268" height="64" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <rect x="16" y="122" width="4" height="64" rx="2" className="fill-red-400" />
            <text x="32" y="148" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">"Helped reduce</text>
            <text x="32" y="166" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">bugs"</text>

            {/* Arrow 2 */}
            <line x1="296" y1="154" x2="382" y2="154" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="382,150 390,154 382,158" className="fill-zinc-400 dark:fill-zinc-500" />

            <rect x="396" y="122" width="268" height="64" rx="6" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1" />
            <rect x="396" y="122" width="4" height="64" rx="2" className="fill-emerald-500" />
            <text x="412" y="148" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">"Lowered P1 incidents</text>
            <text x="412" y="166" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">from 12/month to 2/month"</text>

            {/* Row 3 */}
            <rect x="16" y="202" width="268" height="64" rx="6" className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <rect x="16" y="202" width="4" height="64" rx="2" className="fill-red-400" />
            <text x="32" y="228" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">"Managed</text>
            <text x="32" y="246" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-600 dark:fill-zinc-400">a team"</text>

            {/* Arrow 3 */}
            <line x1="296" y1="234" x2="382" y2="234" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
            <polygon points="382,230 390,234 382,238" className="fill-zinc-400 dark:fill-zinc-500" />

            <rect x="396" y="202" width="268" height="64" rx="6" className="fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="1" />
            <rect x="396" y="202" width="4" height="64" rx="2" className="fill-emerald-500" />
            <text x="412" y="228" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">"Led 4 engineers shipping</text>
            <text x="412" y="246" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-800 dark:fill-zinc-200">3 features per sprint"</text>
          </svg>
        </div>

        <h2 className={h2}>The Internal User Metric</h2>
        <p>Do not forget the value of internal adoption. If you build tools that help other employees work faster you are saving the company thousands of hours of paid labor. You do not need the exact dollar value of their salaries to prove your worth.</p>
        <p>Simply state how many developers relied on your architecture. Writing that you maintained a deployment pipeline used daily by forty senior engineers clearly establishes your competency and the trust the organization placed in your work.</p>

        <h2 className={h2}>Overcoming Non Disclosure Agreements</h2>
        <p>Many hardware developers and defense contractors work under strict legal silence. They cannot even mention the name of the projects they build. If you face this barrier you must focus entirely on the scale of the environments you managed.</p>
        <p>You can write that you maintained zero downtime across a large distributed network of secure environments. Replace the secret project details with operational reliability metrics. Reliability is a universal language that every hiring manager understands.</p>
      </div>
  );
}
