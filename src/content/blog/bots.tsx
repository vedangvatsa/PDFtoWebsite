import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, ol, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
        In 2015, beating an ATS meant repeating &quot;JavaScript&quot; twelve times in white font at the bottom of your resume. The parser counted keywords and ranked you. Candidates gamed it. Vendors adapted.
      </p>
      <p>
        In 2026, Greenhouse, Lever, Workday, and iCIMS run semantic models on top of extraction pipelines. They read whether your claimed skills connect to described work. They flag skill blocks that float disconnected from experience. Keyword density tricks hurt more than they help.
      </p>
      <p>
        You still need to pass automated screening. The playbook changed from stuffing to storytelling with evidence.
      </p>

      <h2 className={h2}>Old ATS vs new ATS</h2>
      <p>
        Old systems: count keyword frequency, match job description terms, score and sort. Gaming: paste synonyms in hidden text, mirror every JD phrase whether true or not.
      </p>
      <p>
        New systems: extract entities (skills, companies, dates), embed sentences into vector space, compare candidate narrative to role requirements, penalize inconsistencies. Gaming: write honest bullets where tools appear next to outcomes. That is it.
      </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 680 290" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="340" y1="10" x2="340" y2="280" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="4 3" />
          <text x="170" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Old ATS</text>
          <text x="170" y="44" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Keyword Counter</text>
          <text x="50" y="90" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">React: 5 mentions</text>
          <text x="50" y="122" fontSize="12" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Docker: 0 mentions</text>
          <text x="510" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">New ATS</text>
          <text x="510" y="44" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-400 dark:fill-zinc-500">Semantic Parser</text>
          <text x="380" y="85" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">React</text>
          <text x="380" y="100" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Built payment dashboard</text>
          <text x="380" y="148" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">Python</text>
          <text x="380" y="163" fontSize="10" fontFamily="system-ui, sans-serif" className="fill-zinc-500 dark:fill-zinc-400">Listed only, no project context</text>
          <text x="340" y="243" textAnchor="middle" fontSize="11" fontWeight="500" fontFamily="system-ui, sans-serif" className="fill-zinc-900 dark:fill-zinc-100">New systems read meaning, not word counts.</text>
        </svg>
      </div>

      <h2 className={h2}>The demand for contextual validation</h2>
      <p>
        To rank well today, build coherent technical narratives. Link tools to actions and outcomes in the same sentence. Surround keywords with verbs and metrics parsers can parse.
      </p>
      <p>
        Job requires Docker. Weak: &quot;Skills: Docker, Kubernetes, AWS.&quot; Strong: &quot;Containerized legacy Java app with Docker; cut deploy time from 45 minutes to 6 across 50 developer machines.&quot;
      </p>
      <p>
        The strong sentence gives the model subject, tool, action, and measurable result. That pattern repeats across every bullet you want ranked.
      </p>

      <div className={callout}>
        <h3 className={h3}>The action adjacency principle</h3>
        <p>
          Place important tools immediately next to a clear business action. &quot;Deployed churn model in PyTorch; reduced monthly cancellations by 12%.&quot; Cause and effect grammar scores higher than isolated noun lists. Parsers and humans use the same heuristic.
        </p>
      </div>

      <h2 className={h2}>Format rules that still matter</h2>
      <p>
        Semantic reading improved. Layout extraction did not. Multi-column PDFs, tables, headers in text boxes, and graphic skill bars still scramble into gibberish when parsers pull text.
      </p>
      <ul className={ul}>
        <li>Single column for ATS uploads.</li>
        <li>Standard fonts: Arial, Calibri, Helvetica.</li>
        <li>No text in images or icons.</li>
        <li>Dates in consistent format: Mar 2022 or 03/2022, not mixed.</li>
        <li>Section headers as plain text: Experience, Education, Skills.</li>
        <li>File type: PDF unless portal asks for DOCX.</li>
      </ul>
      <p>
        A <Link href="/pdf-to-website" className={link}>CV website</Link> with clean HTML gives parsers and humans a linear structure. Upload the plain PDF for the form; share the link for review. Dual submission wins both passes.
      </p>

      <h2 className={h2}>Tailoring without lying</h2>
      <p>
        Mirror job post language only where you have real experience. If the post says &quot;event-driven architecture&quot; and you built Kafka consumers, use that phrase in a bullet. If you never touched events, do not paste the phrase into a skills footer.
      </p>
      <p>
        Safe tailoring checklist per application:
      </p>
      <ol className={ol}>
        <li>Highlight three JD requirements you genuinely meet.</li>
        <li>Reorder bullets so the most relevant win is first under recent role.</li>
        <li>Adjust summary two sentences to name target stack and domain.</li>
        <li>Do not add skills you cannot defend in interview.</li>
      </ol>

      <h2 className={h2}>What gets you penalized</h2>
      <ul className={ul}>
        <li>Hidden white-text keyword blocks (detected and flagged).</li>
        <li>Skills listed with zero supporting bullets.</li>
        <li>Job titles inflated beyond experience depth.</li>
        <li>Identical generic resume submitted to every role with no relevance signal.</li>
        <li>Broken extraction from fancy Canva templates.</li>
        <li>Uploading a scanned image PDF with no selectable text.</li>
      </ul>
      <p>
        Penalties vary by vendor. The pattern is consistent: inconsistency between claim and evidence drops your rank.
      </p>

      <h2 className={h2}>Bypassing the filter entirely</h2>
      <p>
        Referrals skip many automated queues. A employee submission often lands in a human inbox first. Recruiter outreach on LinkedIn bypasses the portal until later stages. Public portfolio links indexed well can bring inbound interest without an application form.
      </p>
      <p>
        You still need an ATS-friendly PDF for formal applications. You do not need to rely on ATS as your only channel. See <Link href="/screening" className={link}>ways to get past AI resume screening</Link> for a ranked tactic list.
      </p>

      <h2 className={h2}>Worked example</h2>
      <p>
        Role: Senior Backend Engineer, Go, Postgres, Kubernetes, fintech.
      </p>
      <p>
        Before: 40-skill footer, bullets about &quot;team collaboration&quot; with no stack names, two-column PDF.
      </p>
      <p>
        After: summary mentions Go and payments; three bullets with Go, Postgres, K8s each tied to latency or throughput metrics; plain PDF; cvin.bio link in portfolio field. Parser extracts clean text. Semantic match scores rise because tools and outcomes co-occur.
      </p>

      <h2 className={h2}>Simplicity survives the machine</h2>
      <p>
        Surrender the urge to design a wild document. Sterile linear text wins extraction. Let your bullets carry personality and proof. Save visual polish for your web profile where layout does not break parsers.
      </p>

      <h2 className={h2}>Checklist</h2>
      <ol className={ol}>
        <li>Export plain single-column PDF for uploads.</li>
        <li>Weave JD keywords into bullets where honestly true.</li>
        <li>Pair every major skill with action and metric.</li>
        <li>Remove orphan skills from footer blocks.</li>
        <li>Paste CV website URL in every optional link field.</li>
        <li>Pursue referrals to reduce ATS dependence.</li>
        <li>Test PDF text selection: if you cannot copy text, parsers cannot read it.</li>
      </ol>

      <h2 className={h2}>Vendor-specific quirks</h2>
      <p>
        Workday parsers sometimes struggle with tables inside PDFs. Greenhouse handles plain text well but strips hyperlinks from uploads (another reason to paste your CV website URL in a separate field). Lever extracts LinkedIn imports differently from PDF uploads. You cannot control every vendor. You can control sending clean input: one column, standard fonts, consistent dates, no graphics-as-text.
      </p>
      <p>
        If you apply through a portal and hear nothing, your resume may have parsed incorrectly. Reapply with a simpler PDF or contact the recruiter with a direct link. Parsing failures are more common than candidates assume. A human nudge with a clean link rescues many stuck applications.
      </p>

      <h2 className={h2}>Building a master resume document</h2>
      <p>
        Keep a master file with every bullet you might use. For each application, copy the master into a tailored version: reorder bullets, adjust summary, trim irrelevant roles. Never maintain ten divergent versions that drift out of sync on dates. One source of truth, many exports. Your CV website can be that source if you update it first and export PDF from the same content.
      </p>

      <h2 className={h2}>Cover letters and ATS</h2>
      <p>
        Many portals parse cover letters separately. Repeat two or three role keywords in natural sentences, not a keyword dump. &quot;I spent four years building Go microservices for payment routing&quot; beats a paragraph of buzzwords. Link your CV website at the end of the letter. Some systems store the letter text for semantic search alongside your resume.
      </p>
      <p>
        Skip cover letters when optional and weak. A bad generic letter hurts. A strong tailored letter with one metric and one link helps. If you have ninety seconds to invest, rewrite your top bullet instead of writing a template letter.
      </p>

      <h2 className={h2}>Volume applications vs quality</h2>
      <p>
        Spraying identical resumes to five hundred postings fails semantic matching because none of the bullets echo the specific role language. Better: fifty tailored applications with adjusted summaries and reordered bullets. ATS rank is relative within each job posting pool. Relevance beats volume.
      </p>

      <h2 className={h2}>LinkedIn Easy Apply and ATS</h2>
      <p>
        Easy Apply uploads your LinkedIn PDF export, which is often poorly structured for parsing. If you use Easy Apply, also maintain a clean standalone PDF and ensure your LinkedIn experience bullets match your master resume. Better: apply on the company site where you control the file and paste your CV website link in optional fields.
      </p>
      <p>
        Recruiter InMail and direct email bypass ATS ranking entirely for the first touch. A strong link in a personalized message to the hiring manager or recruiter beats being candidate #847 in a portal queue.
      </p>

      <h2 className={h2}>Re-applying to the same company</h2>
      <p>
        ATS systems often store prior applications. If you applied six months ago with a stuffed skills block, update the profile before re-applying. Some systems surface prior submissions to recruiters. A visibly improved resume signals growth. An identical re-submit signals spam.
      </p>
      <p>
        Change the summary, add a new project, fix parsing issues. Note in a cover message what changed since last time if you have a recruiter contact.
      </p>

      <h2 className={h2}>Test what the parser actually extracted</h2>
      <p>
        Before you blame a ghosted application on fit, copy text out of your uploaded PDF. If company names merged with dates or your skills block vanished, the bot ranked a corrupted profile. Fix layout, re-upload, and email the recruiter a clean link. Many candidates never learn their resume parsed as gibberish.
      </p>
      <p>
        Quick test: open PDF, select all, paste into a plain text editor. Reading order should match human reading order top to bottom. If &quot;Senior Engineer&quot; appears after your 2019 internship, your columns broke extraction. Single column fixes it.
      </p>

      <h2 className={h2}>How relevance scoring shows up in practice</h2>
      <p>
        Imagine a posting that mentions Go, Postgres, and PCI compliance. Candidate A lists all three in a skills footer with no bullets. Candidate B never says PCI but describes &quot;tokenized card storage migration meeting SAQ-A scope.&quot; Semantic systems score B higher because the sentence implies compliance work even without the acronym.
      </p>
      <p>
        Write bullets the way you would explain the job to a peer. Tools beside verbs beside outcomes. The bot and the tired human reviewer use the same shortcut.
      </p>

      <h2 className={h2}>Related reading</h2>
      <ul className={ul}>
        <li><Link href="/trust" className={link}>How recruiters spot fake skills</Link></li>
        <li><Link href="/scan" className={link}>How recruiters read resumes in 30 seconds</Link></li>
        <li><Link href="/design" className={link}>CV design principles for engineers</Link></li>
        <li><Link href="/bypass" className={link}>Dual-submission approach for applications</Link></li>
      </ul>
    </div>
  );
}
