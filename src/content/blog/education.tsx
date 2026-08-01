import React from 'react';
import Link from 'next/link';
import { h2, h3, callout, ul, bold, link } from '@/lib/blog-styles';

export default function ArticleContent() {
  return (
    <div className="space-y-6 text-lg text-zinc-800 dark:text-zinc-300 transition-colors leading-relaxed">
      <p>
 A bootcamp graduate sits at a desk submitting application after application. They spent six months learning software engineering. They list their bootcamp training at the very top of their profile. They format the entry to look exactly like a university degree. When the applicant tracking system parses the document, the machine gets confused by the non-degree credentials. The parser flags the profile as incomplete and the candidate receives a fast rejection.
 </p>

      <p>
 Formatting your academic history incorrectly is a major barrier for entry level developers. Many candidates mix university degrees with short vocational training. They assume that listing a bootcamp as a degree will make them look more qualified. In reality, it confuses the parsing algorithms. You must structure your educational credentials so that both machines and hiring managers can read them instantly.
 </p>

      <p>
 The rules are simple. Separate formal degrees from vocational training. Use standard degree names that parsers recognize. Place the education section based on how much professional experience you already have. Get these three things right and your credentials stop working against you.
 </p>

      <div className="my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 p-4 sm:p-6">
        <svg viewBox="0 0 700 350" className="w-full h-auto" role="img" aria-label="A diagram showing the right and wrong way to format education and bootcamps on a professional profile.">
          <rect x="0" y="0" width="700" height="350" rx="8" className="fill-zinc-50 dark:fill-zinc-950" />
          <text x="350" y="30" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100 font-bold text-sm">Educational Formatting Layout Comparison</text>
          
          {/* Confusing Format */}
          <rect x="40" y="60" width="280" height="250" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="180" y="85" textAnchor="middle" className="fill-red-500 font-semibold text-xs">Confusing Mixed Layout</text>
          
          <rect x="60" y="115" width="240" height="110" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="75" y="137" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[11px]">Education</text>
          <text x="75" y="157" className="fill-zinc-500 dark:fill-zinc-400 text-[10px]">• BS in Software Engineering (6-Month Bootcamp)</text>
          <text x="75" y="177" className="fill-zinc-500 dark:fill-zinc-400 text-[10px]">• BA in English (State University)</text>
          <text x="75" y="197" className="fill-zinc-500 dark:fill-zinc-400 text-[10px]">• AWS Certificate (Online Course)</text>

          <rect x="80" y="245" width="200" height="50" rx="6" className="fill-red-50 dark:fill-red-950/20 stroke-red-200 dark:stroke-red-900" />
          <text x="180" y="265" textAnchor="middle" className="fill-red-600 dark:fill-red-400 text-[10px] font-semibold">Low Parser Rating</text>
          <text x="180" y="282" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">Bootcamp labeled as degree confusing algorithms</text>

          {/* Clean Format */}
          <rect x="380" y="60" width="280" height="250" rx="8" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" strokeWidth="1.5" />
          <text x="520" y="85" textAnchor="middle" className="fill-emerald-500 font-semibold text-xs">Structured Split Layout</text>
          
          <rect x="400" y="115" width="240" height="110" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700" />
          <text x="415" y="137" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[11px]">Education</text>
          <text x="415" y="157" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">• BA in English - State University (2020)</text>
          
          <text x="415" y="180" className="fill-zinc-800 dark:fill-zinc-200 font-semibold text-[11px]">Training and Certifications</text>
          <text x="415" y="200" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">• Web Development Bootcamp - Tech Academy (2025)</text>
          <text x="415" y="215" className="fill-zinc-500 dark:fill-zinc-400 text-[9px]">• Cloud Practitioner - AWS (2026)</text>

          <rect x="420" y="245" width="200" height="50" rx="6" className="fill-emerald-50 dark:fill-emerald-950/20 stroke-emerald-200 dark:stroke-emerald-900" />
          <text x="520" y="265" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[10px] font-semibold">High Parser Rating</text>
          <text x="520" y="282" textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-300 text-[9px] font-medium">Clean separation of academic and tech training</text>
        </svg>
      </div>

      <h2 className={h2}>Separating Degrees From Short Training Programs</h2>
      <p>
 The most important rule of educational formatting is separation. You must not list a six month coding bootcamp under your university degree section. Tracking systems are designed to identify standard academic degrees. If you write that your bootcamp is a Bachelor of Science, the parser will flag this entry as fraudulent.
 </p>

      <p>
 Create two distinct sections on your profile. The first section should be for university degrees. Label it Academic Education. The second section should be for vocational schools and courses. Label it Technical Training and Certifications.
 </p>

      <p>
 This division helps the parsing software read your data without errors. It also helps the human recruiter see your background immediately. They can verify your college degree and check your technical training in two separate steps.
 </p>

      <p>
 If you do not have a college degree, do not hide it. Focus on building a strong certification section. Many modern technology companies do not require formal degrees if you have verified technical training.
 </p>

      <p>
 When you combine bootcamps with academic degrees, you confuse the hierarchy of your profile. Recruiters look for specific signals when they scan education. They want to know your highest level of formal schooling first, followed by your technical specializations. Mixing the two makes it look like you are trying to hide something or inflate your credentials.
 </p>

      <h2 className={h2}>How to Format University Degrees for Parsing Systems</h2>
      <p>
 University degrees must be formatted in a strict, linear order. Start with the name of the degree, followed by the university, the city, and the year of graduation. Do not use complex tables or multi-column grids for this data.
 </p>

      <p>
 Use standard names for your major. Write Bachelor of Science in Computer Science rather than B.S. in CS. The parser looks for standard educational terms to categorize your education.
 </p>

      <p>
 If you graduated more than five years ago, you can omit the graduation year. This prevents potential bias based on age. It also keeps the focus on your recent professional experience.
 </p>

      <p>
 Avoid listing your grade point average unless it is exceptionally high and you are a recent graduate. A grade point average is rarely checked by technical managers. They care far more about your projects and systems experience.
 </p>

      <p>
 Do not list your high school education. If you are applying for software engineering roles, your high school diploma is assumed. Listing it only takes up valuable space that should be used for your development skills.
 </p>

      <div className={callout}>
        <h3 className={h3}>Keep it simple</h3>
        <p>
 Write the degree name on the first line and the school name on the second line. This simple structure ensures that the parser associates your degree with the correct institution.
 </p>
      </div>

      <h2 className={h2}>Formatting Coding Bootcamps and Online Courses</h2>
      <p>
 Coding bootcamps are vocational training, not academic degrees. You should treat them as professional development. List the name of the school, the name of the course, and the year you completed the training.
 </p>

      <p>
 Describe what you learned in the bootcamp by focusing on the projects you built. Do not list the curriculum. Instead of saying you learned JavaScript, write that you built a distributed chat application using Node.
 </p>

      <p>
 This project-based description is much stronger than a list of tools. It proves that you can apply what you learned to solve real development problems. It shows that you have practical experience.
 </p>

      <p>
 You should also list the hours of training completed. If the bootcamp was a twelve-week full-time course, state that you completed five hundred hours of intensive software engineering instruction. This metric shows the depth of your training.
 </p>

      <p>
 If you took online courses on platforms like Coursera or edX, group them under a single heading. Do not create a new entry for every single course. List the platform name and the major track name, such as Front End Specialization or Algorithms Series.
 </p>

      <h2 className={h2}>The Self Taught Developer Formatting Strategy</h2>
      <p>
 If you did not attend a university or a formal bootcamp, you must build a self-directed education entry. Label this section Self Directed Study. Focus on the structured curricula you followed.
 </p>

      <p>
 List the books and major platforms you used to learn core computer science concepts. Mention books on algorithms and database design. This shows you did learn syntax, but studied the foundational systems principles.
 </p>

      <p>
 You must connect this self-directed study to concrete projects. Create a list of the applications you built to test these concepts. Provide links to the repository code.
 </p>

      <p>
 This proof of self-motivation is highly valued by engineering teams. It shows you have the drive to learn complex technologies without external pressure. It transforms a lack of formal education into a proof of autonomy.
 </p>

      <h2 className={h2}>The Placement of the Education Section</h2>
      <p>
 The position of your education section depends on your experience level. If you are a recent graduate with no professional experience, place the education section near the top. This signals to the recruiter that you are seeking entry-level roles.
 </p>

      <p>
 If you have more than two years of software experience, move the education section to the bottom of the page. Your professional history is far more valuable than your school degree. The recruiter will search for your work history first.
 </p>

      <p>
 Placing education at the bottom keeps the focus on your recent work achievements. It allows recruiters to see your system accomplishments first. It shows that you understand what matters to the hiring team.
 </p>

      <p>
 A web profile link makes this placement easy to adjust. You can update the layout in minutes to reflect your growing work history.
 </p>

      <h2 className={h2}>Formatting Certifications From Cloud Providers</h2>
      <p>
 Cloud provider certificates are highly valued by technical recruiters. List these certificates under your technical training section. Write the full name of the certification and the date you received it.
 </p>

      <p>
 Include a link to the verification page if possible. This allows recruiters to verify your credentials with a single click. It builds trust in your technical qualifications.
 </p>

      <p>
 Do not list expired certificates. If your cloud certification expired last year, remove it from your profile. Keeping outdated certificates signals that you do not maintain your skills.
 </p>

      <p>
 For more information about how degrees compare to projects, read our article on why <Link href="/degrees" className={link}>college degrees matter less now</Link> in the software market. If you are applying for your first role, read our guide on the <Link href="/junior" className={link}>portfolio sections junior developers need</Link> to stand out. You can also explore how to craft <Link href="/career" className={link}>CV strategies for career changers</Link> if you are transitioning from another field.
 </p>

      <h2 className={h2}>Common Education Formatting Mistakes</h2>
      <p>
 The worst mistake bootcamp graduates make is inflating credentials. Writing "Bachelor equivalent" next to a twelve-week program triggers instant rejection from both parsers and humans. Be honest about what you completed. A strong project portfolio matters more than pretending a bootcamp was a four-year degree.
 </p>

      <p>
 Another common error is listing every micro-course as a separate credential. Fifteen Coursera certificates in a row look like padding. Group them under one platform heading with the specialization name. Reserve individual entries for substantial programs that took months to complete.
 </p>

      <p>
 Finally, do not bury your strongest credential. If you have a computer science degree from a recognized university, list it first even if your bootcamp is more recent. The degree carries more weight with enterprise hiring teams. Your bootcamp belongs in the training section below it, supported by project links that prove you can ship production code.
 </p>

      <h2 className={h2}>Read Next</h2>
      <ul className={ul}>
        <li><Link href="/degrees" className={link}>Why College Degrees Matter Less Now</Link></li>
        <li><Link href="/skills" className={link}>Best Ways to Prove Skills Without a Degree</Link></li>
        <li><Link href="/career" className={link}>Best CV Strategies for Career Changers</Link></li>
      </ul>
    </div>
  );
}
