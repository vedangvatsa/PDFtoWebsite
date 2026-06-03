import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        You are five minutes into an introductory phone call with a corporate recruiter. The conversation is friendly and you are discussing your backend experience. Suddenly the recruiter asks for your salary expectations. You feel a surge of panic. You do not want to state a number that is too high and get rejected. You do not want to say a number that is too low and leave money on the table.
      </p>
      <p>
        You blurt out a random number you saw on an online forum. The recruiter writes it down. The call continues but the trap has already sprung. If your number was low you just saved the company thousands of dollars at your own expense. If your number was high the recruiter will silently flag you as too expensive and end your candidacy.
      </p>
      <p>
        Giving a salary number early in the interview loop is a major tactical mistake. Recruiters ask this question to filter candidates out as fast as possible. You must learn how to deflect this question and keep the negotiation open. This article outlines the best strategies to handle early salary questions and protect your market value.
      </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="Salary negotiation path comparison">
          <rect x="0" y="0" width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-950" />
          <text x="350" y="30" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100 font-bold text-sm">Salary Question Decision Tree</text>
          
          {/* Path A - Give Number */}
          <rect x="40" y="60" width="280" height="250" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="180" y="85" textAnchor="middle" className="fill-red-500 font-semibold text-xs">Path A. Give a Number First</text>
          
          <rect x="60" y="110" width="240" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" />
          <text x="70" y="125" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[10px]">Quote a specific salary amount</text>
          <text x="70" y="140" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Establish a hard ceiling on compensation</text>
          
          <rect x="60" y="160" width="240" height="45" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" />
          <text x="70" y="175" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[10px]">Immediate screening outcome</text>
          <text x="70" y="193" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Filtered out if too high or locked into low pay</text>

          <rect x="60" y="240" width="240" height="55" rx="6" className="fill-red-50 dark:fill-red-950/20 stroke-red-200 dark:stroke-red-900" />
          <text x="180" y="258" textAnchor="middle" className="fill-red-600 dark:fill-red-400 text-[10px] font-semibold">Loss of Negotiation Power</text>
          <text x="180" y="272" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Company owns the pricing power</text>

          {/* Path B - Deflect */}
          <rect x="380" y="60" width="280" height="250" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="520" y="85" textAnchor="middle" className="fill-emerald-500 font-semibold text-xs">Path B. Deflect and Delay</text>
          
          <rect x="400" y="110" width="240" height="40" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="410" y="125" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[10px]">Ask for their budgeted range</text>
          <text x="410" y="140" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Forces them to share their numbers first</text>
          
          <rect x="400" y="160" width="240" height="45" rx="4" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="410" y="175" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[10px]">Negotiable package framing</text>
          <text x="410" y="193" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Link salary to system scope and total benefits</text>

          <rect x="400" y="210" width="240" height="85" rx="6" className="fill-emerald-50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-900" />
          <text x="520" y="228" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[10px] font-semibold">Preserve Financial Upside</text>
          <text x="520" y="245" textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-300 text-[9px] font-medium">Keep doors open for maximum offers</text>
          <text x="520" y="260" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[8px]">Let them evaluate your actual skills first</text>
          <text x="520" y="275" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[8px]">Adjust number based on technical interview depth</text>
        </svg>
      </div>

      <h2 className={h2}>Understand the Recruiter Target</h2>
      <p>
        Recruiters do not ask about money because they are curious. They ask because they have strict guidelines. Every role has a pre-approved budget. If the range is eighty thousand to one hundred thousand and you say you want one hundred and twenty thousand the recruiter will end the call.
      </p>
      <p>
        They do this because they do not want to waste time on a candidate they cannot afford. However they also want to get the best talent for the lowest cost. If you say you will accept seventy thousand the company will happily write that into your contract.
      </p>
      <p>
        By giving a number first you give away all your bargaining power. You establish a ceiling for your potential salary. You can never negotiate up from a number you volunteered.
      </p>
      <p>
        Your goal during the first call is to prove you can do the job. Once the team decides they want to hire you your bargaining power increases. That is when you negotiate.
      </p>
      <p>
        It is also helpful to understand how recruiting agencies work. External recruiters are paid a percentage of your starting salary as a placement fee. Internal recruiters are evaluated on their ability to hire within budget limits. Both sides have different motivations but both need to know if you are in the ball park before spending hours on interviews.
      </p>

      <h2 className={h2}>The Budget Deflection Technique</h2>
      <p>
        When the question comes up you should turn it back to the recruiter. Ask them what range they have budgeted for the role.
      </p>
      <p>
        You can say that you are open to a competitive offer and would like to know what range they are targetting. This is a standard professional question.
      </p>
      <p>
        Most recruiters will share the range. Once you have their numbers you can confirm if the range matches your expectations.
      </p>
      <p>
        If the recruiter shares a range of ninety thousand to one hundred and ten thousand you can say that sounds like a reasonable place to start. This keeps you in the process without committing to a specific number.
      </p>
      <p>
        In many jurisdictions companies are legally required to share the salary range on the job posting. You should look up these pay transparency laws before your call. If they are legally required to post the range you can mention that you saw the posted range and want to confirm if it is still accurate. This shows you are informed and keeps the conversation professional.
      </p>

      <div className={callout}>
        <h3 className={h3}>Keep the response simple</h3>
        <p>
          Do not give long explanations for why you want a certain salary. Keep your deflection short and professional. Ask for their range and listen to their answer.
        </p>
      </div>

      <h2 className={h2}>Focus on the Whole Package</h2>
      <p>
        Salary is only one component of your total compensation. You must also consider equity, retirement matching, healthcare, and remote work policies.
      </p>
      <p>
        When a recruiter presses for a number explain that you need to understand the full package first. You can mention that you value flexible remote work or specific learning opportunities.
      </p>
      <p>
        State that you are flexible on base salary if other benefits are strong. This framing allows you to negotiate different aspects of the offer later.
      </p>
      <p>
        If you are looking for remote contracts you can read about the <Link href="/remote" className={link}>best methods to format remote work</Link> to show your autonomy. A strong history of remote work helps you demand higher rates.
      </p>
      <p>
        For instance a lower base salary can be acceptable if the company offers significant equity or a flexible work schedule. You must calculate the cost savings of working from home. Saving time and money on daily commuting can balance a slightly lower cash offer. Always consider the net value of the entire compensation package.
      </p>

      <h2 className={h2}>Delay the Number Until the Technical Loop</h2>
      <p>
        If the recruiter refuses to share their budget you must still delay giving a number. Explain that you cannot quote a price without knowing the exact system challenges.
      </p>
      <p>
        State that you want to talk to the engineering team first. Explain that you need to see the complexity of the codebase and the scope of the responsibilities.
      </p>
      <p>
        This is a logical technical response. A senior engineer would not estimate a project scope before seeing the requirements. You should treat your salary estimation the same way.
      </p>
      <p>
        This response proves you are a professional who takes their work seriously. It shifts the discussion from a quick price check to a serious evaluation of your technical skills.
      </p>

      <h2 className={h2}>Handling the Application Form Fields</h2>
      <p>
        Many online job portals force you to enter a number in the salary expectations field. You cannot submit the application without filling it in.
      </p>
      <p>
        If the field allows text write negotiable or open. This tells the recruiter you are flexible and prevents you from being filtered out by automated parsers.
      </p>
      <p>
        If the field only accepts numbers do not write zero. An entry of zero can cause parsing errors in the applicant database. Instead write a realistic market rate for the role or use a placeholder that matches the average range.
      </p>
      <p>
        You can research average salaries for your target city using developer databases. Use that data to pick a number that is safe but does not limit your upside.
      </p>
      <p>
        If you want to ensure your profile parses correctly look at <Link href="/trust" className={link}>how recruiters spot fake skills</Link> to build a trusted profile. A clean layout ensures your application passes the initial automated screening.
      </p>

      <h2 className={h2}>Practice Your Scripts</h2>
      <p>
        The key to a successful deflection is your tone of voice. If you sound defensive or nervous the recruiter will keep pushing.
      </p>
      <p>
        Practice saying your deflection script out loud until it feels natural. You should sound calm and confident.
      </p>
      <p>
        Remember that the recruiter is not your enemy. They are just trying to do their job. Treat the conversation as a mutual evaluation rather than a test.
      </p>
      <p>
        By holding back your number you protect your value. You ensure that when an offer is made it will reflect your true capabilities.
      </p>
      <p>
        If you are working on a contract basis you can also read about <Link href="/freelance" className={link}>freelance portfolio formatting tips</Link> to structure your past projects for maximum value. Presenting your work clearly helps you command the rate you deserve.
      </p>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/remote" className={link}>Best Methods to Format Remote Work Experience on a CV</Link></li>
        <li><Link href="/freelance" className={link}>Best Freelance Portfolio Formatting Tips for Software Engineers</Link></li>
        <li><Link href="/trust" className={link}>Stop Faking Your Skills List</Link></li>
      </ul>
    </div>
  );
}
