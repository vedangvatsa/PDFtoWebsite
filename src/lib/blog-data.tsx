import React from 'react';

export type Author = {
  name: string;
  avatarUrl: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: Author;
  faqs?: {
    question: string;
    answer: string;
  }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'pdf-to-website',
    title: 'Best Free Way to Convert a PDF Resume into a Website',
    excerpt:
      'Upload your PDF once, publish a live CV at cvin.bio/your-name, and share a link recruiters can open on any phone.',
    date: 'Aug 1, 2026',
    author: {
      name: 'Vedang V.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    },
    faqs: [
      {
        question: 'What is the best free way to turn a PDF resume into a website?',
        answer:
          'Upload the PDF to CVin.Bio, review the extracted profile, and publish at cvin.bio/your-name. The public URL is your CV website. It is free to create and works on mobile.',
      },
      {
        question: 'Do I need design or coding skills to convert my resume to a website?',
        answer:
          'No. CVin.Bio parses your CV with AI and generates the page. You only review details and choose a short URL slug.',
      },
      {
        question: 'Can I still use a PDF after I publish a CV website?',
        answer:
          'Yes. Keep a simple PDF for portals that require a file upload, and use the website link for email, Slack, LinkedIn, and WhatsApp.',
      },
    ],
  },
  {
    slug: 'cv-website-vs-pdf',
    title: 'CV Website vs PDF Resume: Which Should You Send?',
    excerpt:
      'Send a CV website link by default. Keep a plain PDF only when an application form forces a file upload.',
    date: 'Aug 1, 2026',
    author: {
      name: 'Vedang V.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    },
    faqs: [
      {
        question: 'CV website vs PDF resume: which should I send to recruiters?',
        answer:
          'Prefer a CV website link for people and chat. Use a PDF only when the ATS or portal requires a file. Many teams do both: PDF for the form, link in the message.',
      },
      {
        question: 'Why do recruiters prefer a resume link over a PDF attachment?',
        answer:
          'Links open on phones without downloads, show preview cards in chat apps, and stay up to date when you edit. Attachments add friction and often break formatting.',
      },
      {
        question: 'When is a PDF still required?',
        answer:
          'Government and enterprise application portals often accept only PDF or DOC uploads. Use the PDF there, and still include your CV website URL in the cover note or portfolio field.',
      },
    ],
  },
  {
    slug: 'remote',
    title: 'Best Methods to Format Remote Work Experience on a CV',
    excerpt: 'Vague location labels confuse payroll and timezone alignment. Discover the formatting rules that highlight your autonomy and async values.',
    date: 'Feb 13, 2026',
    author: {
      name: 'Tomás R.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    },
    faqs: [
      {
        question: 'What is the correct location format for remote work experience on a CV?',
        answer: 'Format your job title as Job Title (Remote) and list your actual physical city and state in the standard location field. This ensures that parsers read your details correctly and payroll teams can verify regional eligibility.'
      },
      {
        question: 'How do I prove I can work autonomously in a distributed team?',
        answer: 'Highlight your asynchronous communication wins. Write about your experience authoring design documents, architectural logs, and code review feedback that kept projects moving without meeting overhead.'
      },
      {
        question: 'Should I list remote collaboration tools under my technical skills list?',
        answer: 'No. Listing tools like Slack or Zoom is unnecessary and wastes space. Focus your skills list on core engineering technologies like database engines, languages, and container systems.'
      }
    ]
  },
  {
    slug: 'open-source',
    title: 'Best Ways to Showcase Open Source Contributions on your CV',
    excerpt: 'Generic links to massive code repositories are invisible. Learn how to highlight specific merged pull requests and quantify your impact.',
    date: 'Feb 11, 2026',
    author: {
      name: 'Priya K.',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
    },
    faqs: [
      {
        question: 'How should I link my open source contributions on my CV?',
        answer: 'Link directly to the public URLs of your merged pull requests. Avoid linking to the main repository homepage because reviewers will not search through commit histories to find your specific code.'
      },
      {
        question: 'Are documentation contributions to open source projects worth listing?',
        answer: 'Yes. Writing clear API reference documents or tutorial guides shows that you understand software design. It proves you can communicate technical concepts to onboarding developers.'
      },
      {
        question: 'What is the best way to describe an open source contribution in a CV bullet?',
        answer: 'Use the action-oriented structure. State the repository name, describe the specific component you modified, explain the performance trade-offs, and provide a direct link to the merged pull request.'
      }
    ]
  },
  {
    slug: 'projects',
    title: 'Best Personal Projects to Put on a Software CV',
    excerpt: 'Weather apps and simple clones do not prove software capability. Build and host production-grade tools that showcase real performance metrics.',
    date: 'Feb 09, 2026',
    author: {
      name: 'Daniel R.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    faqs: [
      {
        question: 'What types of personal projects carry the most weight on a software CV?',
        answer: 'Production-grade applications that are deployed to live cloud servers carry the most weight. Build distributed web crawlers, custom databases, or compiler utilities that demonstrate real-world system constraints.'
      },
      {
        question: 'Why do course tutorial project clones fail to impress hiring managers?',
        answer: 'Tutorial clones show only that you can copy code. They lack custom architectural design, fail to prove you can solve novel problems, and do not test your deployment or performance optimization capabilities.'
      },
      {
        question: 'What information should the readme file of a portfolio project include?',
        answer: 'The readme file must act as an engineering brief. Include a clear description of the problem solved, an architectural diagram, installation steps, and documented performance benchmarks under load.'
      }
    ]
  },
  {
    slug: 'summaries',
    title: 'Best Ways to Write Technical Summaries for Senior Roles',
    excerpt: 'Vague leadership objectives are useless. Use this rigid three-sentence formula to prove your systems and scale engineering value immediately.',
    date: 'Feb 07, 2026',
    author: {
      name: 'Sarah M.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    },
    faqs: [
      {
        question: 'How long should a professional CV summary be for senior roles?',
        answer: 'A senior technical summary must be three sentences or less. Limit your text to scope and scale in the first sentence, architectural ownership in the second, and a measurable outcome in the third.'
      },
      {
        question: 'How do backend developers measure system impact on a CV summary?',
        answer: 'Backend developers measure impact by using system physics variables. Highlight concrete metrics like server request throughput, database latency reductions, and monthly hardware cost savings.'
      },
      {
        question: 'Should I list all my technical skills in the CV summary block?',
        answer: 'No. Select only three or four core technologies that align with your primary specialty. Leave the rest of your skills for the dedicated skills section and specific chronological bullet points.'
      }
    ]
  },
  {
    slug: 'design',
    title: 'Best CV Design Principles for Software Engineers',
    excerpt: 'Automated parsers and busy hiring managers reject complex layouts. Learn the mathematical design rules that keep your profile readable.',
    date: 'Feb 05, 2026',
    author: {
      name: 'Alex P.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
    },
    faqs: [
      {
        question: 'Why do multi-column CV layouts fail applicant tracking system screening?',
        answer: 'Multi-column CV layouts confuse parsers because the algorithms read text from left to right. When two columns exist, the machine frequently merges unrelated paragraphs horizontally, which ruins the logical chronology of your work history.'
      },
      {
        question: 'What is the best font size scale for a professional software engineering CV?',
        answer: 'The best scale uses three distinct font sizes. Use a large size for your name, a medium size for section titles, and a small size for the body text to reduce visual clutter.'
      },
      {
        question: 'Should I include visual progress bars to rate my coding skills on my CV?',
        answer: 'Visual skill bars should be avoided completely. They do not convey measurable capabilities to hiring managers, and they highlight relative incompetence instead of listing concrete engineering achievements.'
      }
    ]
  },
  {
    slug: 'freelance',
    title: 'Best Freelance Portfolio Formatting Tips for Software Engineers',
    excerpt: 'Stop presenting your freelance work as a messy list of temporary tasks. Learn how to structure contract projects like high-impact product entries.',
    date: 'Feb 23, 2026',
    faqs: [
      { question: 'How do I format freelance work to prevent looking like a job hopper?', answer: 'Create a single company entry for your freelance business. Group all your client projects as nested details under this main heading.' },
      { question: 'How do I list client work if I signed an agreement of non disclosure?', answer: 'Describe the client by their industry and size rather than naming them. Focus on the technical challenges and architecture you built.' },
      { question: 'Should I list minor freelance gigs on my profile?', answer: 'No. Group small tasks into a single bullet point to avoid clutter. Keep the main focus on your high impact projects.' }
    ],
    author: {
      name: 'Tomás R.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    }
  },
  {
    slug: 'replacements',
    title: 'Best Career Objective Replacements that Recruiters Value',
    excerpt: 'Stop wasting the top of your CV on generic career objective statements. Learn how to write value propositions that highlight actual skills and metrics.',
    date: 'Feb 21, 2026',
    faqs: [
      { question: 'Why are career objectives considered outdated?', answer: 'Career objectives focus on what you want from the employer. Recruiters want to know what you can do for them. Replace it with a statement of value.' },
      { question: 'How long should my introductory summary be?', answer: 'Keep it under three sentences or sixty words. A short summary is easy to scan and encourages the recruiter to read your history.' },
      { question: 'What is a technical value proposition?', answer: 'It is a short statement that highlights your core engineering skills and the specific business problems you solve. It focuses on outcomes rather than desires.' }
    ],
    author: {
      name: 'Priya K.',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
    }
  },
  {
    slug: 'fonts',
    title: 'Best Fonts for ATS Readability and Modern Screen Rendering',
    excerpt: 'Stop using decorative fonts that confuse parsers and strain human eyes. Learn which sans serif and serif options guarantee readability on screens and systems.',
    date: 'Feb 19, 2026',
    faqs: [
      { question: 'What is the safest font family to use for applications?', answer: 'Standard sans serif fonts like Arial or Calibri are the safest choice. They are preinstalled on almost all devices and parse perfectly in scanning tools.' },
      { question: 'Can I use custom web fonts for my online profile?', answer: 'Yes. Web browsers can load modern fonts like Inter or Roboto cleanly. But you should ensure you use a reliable system font stack as a backup.' },
      { question: 'Why do decorative or script fonts fail in parsers?', answer: 'Decorative fonts often map letters to non standard unicode values. This confuses the reading software and results in garbled text extraction.' }
    ],
    author: {
      name: 'Daniel R.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    }
  },
  {
    slug: 'spacing',
    title: 'Best CV Spacing and Margin Standards for a Professional Look',
    excerpt: 'Stop squeezing your content onto a single page with tiny margins. Learn the spacing standards that make your CV readable and inviting on digital screens.',
    date: 'Feb 17, 2026',
    faqs: [
      { question: 'What margins should I use for a readable layout?', answer: 'You should use margins of at least three quarters of an inch on all sides. This creates a clean frame and prevents the text from looking cramped.' },
      { question: 'Is single line spacing acceptable for digital reading?', answer: 'No. Single spacing makes text blocks too dense and causes eye strain. Use a line height of one point two or higher to keep your content readable.' },
      { question: 'How do I fit my experience if I use generous spacing?', answer: 'You should edit your writing instead of shrinking your margins. Remove duplicate bullet points and delete outdated experience that does not match your target role.' }
    ],
    author: {
      name: 'Sarah M.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    }
  },
  {
    slug: 'promotions',
    title: 'Best Ways to Highlight Internal Promotions on a CV',
    excerpt: 'Stop dividing your internal career growth into separate entries. Learn how to structure promotions under a single company heading to show continuous tenure.',
    date: 'Feb 15, 2026',
    faqs: [
      { question: 'Why should I not list internal promotions as separate jobs?', answer: 'Listing internal promotions as separate jobs makes your timeline look fragmented. A recruiter skimming your profile might assume you change companies too frequently.' },
      { question: 'How do I show different dates for my promoted roles?', answer: 'You can stack the job titles chronologically under a single company heading. Assign specific dates to each individual title to maintain absolute clarity.' },
      { question: 'What if my duties did not change much after my promotion?', answer: 'Focus on the change in your responsibility and ownership. Highlight how you took on larger systems or began mentoring other team members.' }
    ],
    author: {
      name: 'Alex P.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
    }
  },
  {
    slug: 'tools',
    title: 'Best Free Tools for Job Seekers in 2026',
    excerpt: 'Ten free tools across five categories that actually help you land interviews, not just feel productive.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'What free tools should every job seeker use?', answer: 'At minimum you need a solid resume drafting tool like Google Docs, a job tracking system like Notion or Teal, and a web profile link you can share with recruiters. Those three cover the basics of creating, organizing, and sharing your job search.' },
      { question: 'Are free job search tools good enough or do I need to pay?', answer: 'For most people, yes. Free tiers of tools like Teal, Pramp, and LeetCode cover 90% of what you need. Paid plans usually add features like unlimited tracking or premium problem sets, which matter more for heavy users than casual job seekers.' },
      { question: 'How many job search tools should I use at once?', answer: 'Pick one from each category that matters to you. One drafting tool, one tracker, one interview prep platform. Using too many tools creates busywork that feels productive but does not actually move you closer to an offer.' },
    ],
    author: {
      name: 'Sarah M.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    }
  },
  {
    slug: 'linkedin',
    title: 'Best LinkedIn Alternatives for Developers',
    excerpt: 'Seven places to build a professional presence without the LinkedIn noise, and why most developers should use at least two.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'Should developers delete their LinkedIn profile?', answer: 'No. LinkedIn has the largest recruiter network and the most job listings. The smart move is to keep LinkedIn active while building a presence on one or two other platforms that better show your actual work. Think of LinkedIn as your baseline, not your only option.' },
      { question: 'What is the best LinkedIn alternative for software engineers?', answer: 'It depends on what you want. GitHub is best for showing your code. A personal website gives you total control. CVin.Bio splits the difference with a structured resume page that is easy to set up. Most developers benefit from picking one that plays to their strengths.' },
      { question: 'Do recruiters look at platforms other than LinkedIn?', answer: 'Yes, especially in tech. Many recruiters check GitHub profiles, personal websites, and portfolio links before making contact. Some companies specifically search GitHub and Stack Overflow for candidates. Having a strong presence outside LinkedIn gives recruiters more to work with when they evaluate you.' },
    ],
    author: {
      name: 'Daniel R.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    }
  },
  {
    slug: 'career',
    title: 'Best Resume Strategies for Career Changers',
    excerpt: 'Eight things that actually work when your resume says one career but you want a completely different one.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'How do I write a resume when changing careers?', answer: 'Focus on transferable skills, not job titles. Rewrite your bullet points to connect old work to the new field, put certifications and side projects near the top, and include a two-sentence summary that explains the switch directly.' },
      { question: 'Should I remove old work experience when switching careers?', answer: 'Yes, if it has no connection to your new field. Keeping irrelevant experience makes your resume longer without making it stronger. Remove anything that does not help a hiring manager picture you doing the new job.' },
      { question: 'What resume format is best for career changers?', answer: 'A hybrid format works well. It leads with a skills section that highlights what you can do, then follows with a shorter work history. This lets you control the story instead of letting your job titles tell it for you.' },
    ],
    author: {
      name: 'Tanya R.',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80'
    }
  },
  {
    slug: 'skills',
    title: 'Best Ways to Prove Skills Without a Degree',
    excerpt: 'Seven types of proof ranked by how much recruiters actually trust them, from the strongest signal to the weakest.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'Can I get a tech job without a college degree?', answer: 'Yes. Many companies, including Google, Apple, and IBM, have dropped degree requirements for technical roles. What matters is proof that you can do the work. A deployed project, open source contributions, or a respected certification carries more weight than a diploma at most companies.' },
      { question: 'What is the best certification for getting a tech job without a degree?', answer: 'It depends on your target role. For cloud engineering, AWS Solutions Architect or Google Cloud Professional are strong. For security, CompTIA Security+ is widely recognized. For data, the Google Data Analytics Certificate is a solid entry point. Pick the certification that matches the jobs you are applying for.' },
      { question: 'How do I show proof of skills on my resume?', answer: 'Link directly to the proof. A GitHub profile, a live project URL, a certification verification page, or a portfolio site. Do not just list skills as words. Point to something the recruiter can click and verify in 30 seconds.' },
    ],
    author: {
      name: 'Jordan M.',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80'
    }
  },
  {
    slug: 'screening',
    title: 'Best Ways to Get Past AI Resume Screening',
    excerpt: 'Seven tactics ranked by how well they actually work against automated screening, from the one that skips the filter entirely to the small fixes that add up.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'How do AI resume screening systems work?', answer: 'Most AI screening tools parse your uploaded file into text, extract keywords and section data, then score you against the job description. If your formatting confuses the parser or your language does not match, you score low and get filtered out before a human sees you.' },
      { question: 'Can I trick AI resume screening with hidden keywords?', answer: 'No. Modern screening tools detect white-on-white text and hidden keyword stuffing. They will flag or reject your application. The better approach is to use the same language as the job posting in visible, contextual sentences.' },
      { question: 'What file format is best for AI resume screening?', answer: 'If a system requires a file upload, plain .docx is the safest format. It parses more reliably than PDF across most applicant tracking systems. But the best option is a web profile URL that the recruiter reads directly, bypassing file parsing entirely.' },
    ],
    author: {
      name: 'Priya K.',
      avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&q=80'
    }
  },
  {
    slug: 'top',
    title: 'Best Things to Put at the Top of Your Resume',
    excerpt: 'Recruiters spend about 6 seconds on their first look at your resume, and most of that time is spent on the top two inches.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'What should the top of my resume look like?', answer: 'Your name in a large clear font, a one-line headline with your role and specialty, a link to your full profile, a two-sentence summary of your value, and your four or five strongest technical skills. That is it. Nothing else needs to be above the fold.' },
      { question: 'Should I put an objective statement on my resume?', answer: 'No. Objective statements tell the recruiter what you want, not what you offer. A value summary that describes what you bring to the team is far more effective and takes up the same amount of space.' },
      { question: 'Should I include my full home address on my resume?', answer: 'No. City and country are enough if location matters for the role. A full street address wastes space at the top of your resume and creates a privacy risk with no upside.' },
    ],
    author: {
      name: 'Marcus T.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    }
  },
  {
    slug: 'portfolio',
    title: 'Best Portfolio Platforms for Developers',
    excerpt: 'Seven real options for showing your work online, from free GitHub Pages to a fully custom domain. Here is what each one actually does well.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'What is the best free portfolio platform for developers?', answer: 'GitHub Pages is completely free and works well if you already have public repos. For something more polished without writing code, ReadCV or CVin.Bio both offer free tiers with clean layouts.' },
      { question: 'Do I need a custom domain for my developer portfolio?', answer: 'No. A custom domain looks professional but it is not required. A clean URL on any reputable platform works fine. What matters more is that the content is up to date and easy to read.' },
      { question: 'Should I build my portfolio site from scratch?', answer: 'Only if you enjoy frontend work and want the site itself to be a portfolio piece. Otherwise the time spent building and maintaining a custom site could go toward actual projects that demonstrate your skills.' },
    ],
    author: {
      name: 'Priya K.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'
    }
  },
  {
    slug: 'keywords',
    title: 'Best Resume Keywords for Tech Jobs',
    excerpt: 'The right keywords get you past the filter. The wrong ones make you look like you copied a job posting. Here is what actually matters by role in 2026.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'How many keywords should I put on a tech resume?', answer: 'There is no magic number. Focus on 8 to 12 technologies you have actually used in production. Each one should appear in context within your experience section, not just in a skills list at the top.' },
      { question: 'Should I list every technology I have ever touched?', answer: 'No. A long list of 30 technologies signals that you are a generalist who is not deep in anything. Hiring managers want to see depth. Pick the skills that match the role and show real experience with them.' },
      { question: 'Do ATS systems still scan for exact keyword matches?', answer: 'Most modern ATS systems use some form of semantic matching, so they can recognize that React.js and ReactJS are the same thing. But older systems still do exact matching, so use the most common spelling of each technology name.' },
    ],
    author: {
      name: 'Marcus W.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    }
  },
  {
    slug: 'send',
    title: 'Best Ways to Send Your Resume to a Recruiter',
    excerpt: 'You have five options for getting your resume in front of a recruiter, and most people default to the worst one.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'What is the best way to send a resume to a recruiter?', answer: 'A web profile link is the most effective method. It loads instantly on any device, always shows your latest info, and creates a rich preview card when shared on Slack or LinkedIn. PDF attachments still work but add friction for the reader.' },
      { question: 'Should I paste my resume in the email body?', answer: 'Plain text in the email body works well for cold outreach because it removes all download friction. The recruiter sees your qualifications immediately. The downside is you lose all formatting, so keep it short and link to your full profile.' },
      { question: 'Is it okay to send a Google Doc link as my resume?', answer: 'Google Doc links are better than file attachments because the recruiter does not need to download anything. However, they can look unprofessional if permission settings are wrong, and they still require Google account access to view properly on mobile.' },
    ],
    author: {
      name: 'Priya K.',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
    }
  },
  {
    slug: 'mistakes',
    title: 'Best Resume Mistakes to Fix Before Applying',
    excerpt: 'Ten resume mistakes ranked by how much damage they actually do, starting with the one that gets you rejected in under three seconds.',
    date: 'Jun 04, 2026',
    faqs: [
      { question: 'What is the worst mistake you can make on a resume?', answer: 'Misspelling the company name you are applying to. It tells the recruiter you did not care enough to double-check the most basic detail, and it usually results in an immediate rejection before they read anything else.' },
      { question: 'Do skill bars on resumes actually hurt you?', answer: 'Yes. Rating yourself 4 out of 5 in Python gives the recruiter no useful information and raises more questions than it answers. Replace skill bars with concrete examples of what you built and the results it produced.' },
      { question: 'How many resume mistakes does a typical applicant have?', answer: 'Most resumes have at least three of the ten common mistakes. The good news is that all of them are fixable in under an hour if you know what to look for.' },
    ],
    author: {
      name: 'Tomás R.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    }
  },
  {
    slug: 'ai',
    title: 'AI Agents Are Already Browsing Your Resume',
    excerpt: 'The first wave of autonomous recruiting agents is live. They read structured web data, not PDFs. Most candidates have no idea this shift happened.',
    date: 'Apr 06, 2026',
    faqs: [
      { question: 'What are AI recruiting agents?', answer: 'They are autonomous programs that search professional databases, compare candidates against job requirements, and produce ranked shortlists without any human involvement in the initial screening.' },
      { question: 'What is the x402 protocol and how does it affect hiring?', answer: 'x402 revives the old HTTP 402 Payment Required status code to let software pay for API access using stablecoins. This means AI agents can autonomously buy access to talent databases, query by query, without contracts or credit cards.' },
      { question: 'What is a machine readable resume?', answer: 'A professional profile published as structured web data with semantic HTML and schema.org markup. AI agents and search engines can parse your skills, experience, and credentials directly instead of guessing from a flat PDF.' },
      { question: 'How do I make my resume visible to AI agents in 2026?', answer: 'Get your profile onto a permanent URL with schema.org Person markup and structured data for your skills and experience. CVin.Bio generates this automatically for every profile.' },
      { question: 'What is the Model Context Protocol and why does it matter for recruiting?', answer: 'MCP is an open standard from Anthropic that gives AI agents a standard way to connect to external databases. Recruiting platforms with MCP servers let agents like Claude and ChatGPT search their candidate data using plain language queries.' },
    ],
    author: {
      name: 'Daniel R.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
    }
  },
  {
    slug: 'attachments',
    title: 'Best Way to Send Your Resume (Not PDF)',
    excerpt: 'That PDF you carefully designed is probably getting mangled before anyone reads it. Here is what actually happens when you email a resume as an attachment.',
    date: 'Mar 22, 2026',
    faqs: [
    { question: 'Why are PDF resumes failing in modern applicant tracking systems?', answer: 'Modern enterprise ATS parsers frequently fail to accurately scrape multi-column or heavily formatted PDF files, resulting in corrupted data extraction and immediate algorithm rejection.' },
    { question: 'Is a web link better than attaching a PDF file?', answer: 'Yes. A web link guarantees absolute visual consistency across all devices and allows the hiring manager to interact with a responsive layout without downloading unknown attachments.' },
    { question: 'Do recruiters accept URL submissions instead of files?', answer: 'Almost all modern corporate application portals explicitly request a website URL or portfolio link. Providing a dedicated CV link demonstrates technical competence.' },
  ],
    author: {
      name: 'Marcus T.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    }
  },
  {
    slug: 'mobile',
    title: 'How to Make Your Resume Mobile-Friendly',
    excerpt: 'Recruiters are scanning candidates on their phones between meetings. If your resume forces them to pinch-zoom and scroll sideways, you have already lost.',
    date: 'Mar 21, 2026',
    faqs: [
    { question: 'Do hiring managers read CVs on mobile phones?', answer: 'Over half of initial CV screenings are now conducted by recruiters and engineering managers on mobile devices during transit or away from their desks.' },
    { question: 'What is a mobile responsive CV?', answer: 'A mobile responsive CV automatically restructures its grid to a single vertical column on smaller screens ensuring absolutely zero horizontal scrolling or pinching is required to read your history.' },
    { question: 'Why do A4 paper formats fail on digital screens?', answer: 'Standard A4 PDF designs force rigid desktop dimensions onto heavy text rendering it virtually unreadable on mobile screens and triggering massive recruiter fatigue.' },
  ],
    author: {
      name: 'Elena R.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    }
  },
  {
    slug: 'link',
    title: 'Should You Put a URL on Your Resume?',
    excerpt: 'Sharing a clean URL instead of an attachment changes how people perceive you before they even read a single word of your experience.',
    date: 'Mar 20, 2026',
    faqs: [
    { question: 'Should I purchase a custom domain for my resume?', answer: 'Operating your professional CV on a clean dedicated web link signals high technical sophistication and personal brand investment to prospective employers.' },
    { question: 'How do I share a web profile in an email?', answer: 'Simply hyperlink a professional call-to-action text phrase directly to your live profile link rather than forcing the recipient to download and scan a massive local file attachment.' },
    { question: 'Can tracking software process a naked URL?', answer: 'Yes. Most modern parsing engines will automatically follow dedicated URLs inside the primary application field to extract relevant structural metadata.' },
  ],
    author: {
      name: 'James L.',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80'
    }
  },
  {
    slug: 'bypass',
    title: 'How to Get Past ATS and Still Look Good',
    excerpt: 'Your beautifully designed resume gets fed into a parser that strips every visual element. Here is how to satisfy the robot and impress the human.',
    date: 'Mar 18, 2026',
    faqs: [
    { question: 'Why does the ATS ruin my resume formatting?', answer: 'Applicant Tracking Systems use raw optical character extraction. They strip away completely all visual layout CSS and positional formatting to read pure raw text data.' },
    { question: 'How do I submit both a URL and a fallback text file?', answer: 'Submit your interactive web link as the primary application endpoint and upload a strictly linear plain-text document as the fail-safe payload for archaic systems.' },
    { question: 'Are visual graphics safe to use on technical profiles?', answer: 'Heavy graphics are incredibly dangerous for automated parsers. Rely entirely on distinct typography weight and structural whitespace rather than embedded images.' },
  ],
    author: {
      name: 'Sarah K.',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
    }
  },
  {
    slug: 'inbox',
    title: 'How to Stand Out in a Recruiter Inbox',
    excerpt: 'When every candidate sends the same file type with the same naming convention, breaking that pattern is the fastest way to get noticed.',
    date: 'Mar 16, 2026',
    faqs: [
    { question: 'What makes a CV URL look professional?', answer: 'A professional URL should consist entirely of your primary legal name without confusing numerical suffixes or generic third party hosting subdomains.' },
    { question: 'How does a clean link impact inbox delivery?', answer: 'Emails containing clean minimal URLs possess a significantly higher inbox deliverability rate compared to heavy emails bogged down by bloated PDF attachments.' },
    { question: 'Do hiring managers actually click external links?', answer: 'Yes. Technical managers aggressively prefer clicking a fast-loading secure HTTPS link over downloading a heavily formatted unknown file into their local system architecture.' },
  ],
    author: {
      name: 'David C.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    }
  },
  {
    slug: 'pdf',
    title: 'Why Your PDF Resume Fails ATS',
    excerpt: 'That gorgeous two-column Canva resume is getting turned into garbled text by the very systems designed to evaluate it.',
    date: 'Mar 15, 2026',
    faqs: [
    { question: 'Why do multi column resumes fail ATS scans?', answer: 'Parsing engines read from left to right. When two columns exist the engine frequently mashes the dates on the left directly into the job titles on the right destroying chronological logic.' },
    { question: 'Does invisible keyword text still work in resumes?', answer: 'No. Modern algorithmic screeners actively detect and aggressively penalize hidden white text tactics explicitly flagging the applicant for manipulative fraud.' },
    { question: 'Should I use tables to format my skills section?', answer: 'Absolutely not. HTML and PDF tables commonly scramble semantic extraction outputs. Use strictly linear standard unordered bullet lists to guarantee flawless data extraction.' },
  ],
    author: {
      name: 'Anna M.',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80'
    }
  },
  {
    slug: 'tech-keywords',
    title: 'Where to Put Keywords on a Tech Resume',
    excerpt: 'Technical recruiters spend four seconds scanning before deciding to read further. Where your keywords sit on the page determines whether you pass that scan.',
    date: 'Mar 14, 2026',
    faqs: [
    { question: 'What is the Z pattern in resume reading?', answer: 'Human eyes natively track screens in a Z formation. They scan the top banner horizontally drag diagonally down the left margin and finally sweep the bottom horizontally.' },
    { question: 'Where should my most important technical skills go?', answer: 'Position your heaviest commercial engineering skills directly in the top left quadrant of your profile to instantly intercept the primary visual scan path.' },
    { question: 'How does whitespace influence recruiter fatigue?', answer: 'Generous white margins explicitly reduce cognitive load. Cramming dense text edge-to-edge signals desperation and makes the document physically exhausting to parse.' },
  ],
    author: {
      name: 'Alex B.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
    }
  },
  {
    slug: 'update',
    title: 'How to Update Your Resume After Sending It',
    excerpt: 'You sent your resume and noticed a typo. With a PDF, it is too late. With a web profile, you fix it in thirty seconds and nobody ever knows.',
    date: 'Mar 12, 2026',
    faqs: [
    { question: 'Can I edit an application after sending a PDF?', answer: 'Once a discrete PDF file is submitted it is permanently sealed in the corporate database. Any critical errors or broken links exist forever on their servers.' },
    { question: 'How does a web link fix the typo problem?', answer: 'A web profile operates dynamically. If you identify a catastrophic spelling error you can instantly edit your live site and the recruiter will instantly see the patched version upon clicking.' },
    { question: 'Do recruiters notice minor spelling mistakes?', answer: 'Yes. Senior engineering managers mercilessly use minor typographical errors as an instant proxy for poor attention to technical detail masking deeper foundational flaws.' },
  ],
    author: {
      name: 'Michelle P.',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80'
    }
  },
  {
    slug: 'objective',
    title: 'Resume Objective vs Summary',
    excerpt: 'Managers do not care what you want. They care what you can do for them. Start your profile with your value instead.',
    date: 'Mar 10, 2026',
    faqs: [
    { question: 'Should I include a resume objective in 2026?', answer: 'You must completely eradicate the objective statement. Stating your personal career desires wastes highly expensive screen real estate that must be reserved for hard technical value.' },
    { question: 'What is a professional value summary?', answer: 'A value summary is a brutal three-sentence paragraph explicitly quantifying your absolute highest commercial achievement and primary technical operational stack.' },
    { question: 'How long should a profile summary be?', answer: 'Your direct top-line summary should absolutely never exceed three tight sentences. Anything beyond that inevitably devolves into generic corporate fluff and loses all impact.' },
  ],
    author: {
      name: 'Sarah G.',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80'
    }
  },
  {
    slug: 'bullets',
    title: 'How Long Should Resume Bullets Be?',
    excerpt: 'Listing every task you ever did hides your best work. Recruiters want to read big results in few words.',
    date: 'Mar 08, 2026',
    faqs: [
    { question: 'How many bullet points are ideal for a single job?', answer: 'Ruthlessly restrict your historical roles to a strict maximum of three bullet points. Only ever highlight massive outlier wins and delete basic operational routines.' },
    { question: 'Why is listing all my tasks a bad strategy?', answer: 'Listing mediocre daily tasks completely triggers the psychological dilution effect where your massive engineering wins are mathematically averaged down by boring administrative noise.' },
    { question: 'How long should a single resume bullet point be?', answer: 'A bullet point must cleanly terminate after precisely one sentence. Stretching a technical concept across multiple messy lines completely guarantees that it will never be read.' },
  ],
    author: {
      name: 'Marcus T.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    }
  },
  {
    slug: 'impact',
    title: 'How to Quantify Your Resume Without Numbers',
    excerpt: 'Engineers rarely know the exact dollar amount their code makes. You can still prove your worth by using speed and scale.',
    date: 'Mar 07, 2026',
    faqs: [
    { question: 'How do software engineers quantify resume impact?', answer: 'If you lack direct access to financial revenue data you must rigorously measure relative physics. Quantify your code impact using raw server speed latency reduction and massive user traffic scaling.' },
    { question: 'What if I cannot use exact financial numbers on my CV?', answer: 'Focus entirely on percentage improvements. Stating that you optimized database queries to run sixty percent faster provides immense structural context without leaking confidential corporate dollars.' },
    { question: 'Does clean code matter if I have no revenue metrics?', answer: 'Yes. Highlight your ability to refactor brittle monolithic systems into scalable architectures. Removing technical debt mathematically accelerates future product shipments.' },
  ],
    author: {
      name: 'Elena R.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    }
  },
  {
    slug: 'tenure',
    title: 'How to Explain Short Stints on Your Resume',
    excerpt: 'Leaving jobs after a few months used to look bad. Today it is normal but you still need to explain why it happened.',
    date: 'Mar 06, 2026',
    faqs: [
    { question: 'Are short job tenures an automatic resume rejection?', answer: 'Not necessarily. Short tenures are aggressively normalized in modern technology provided they represent focused intensive consulting contracts rather than a pattern of toxic corporate firing.' },
    { question: 'How do I group freelance work on a CV?', answer: 'Consolidate multiple brief consecutive consulting jobs under a single massive macro heading titled Independent Technical Consultant to establish continuous overarching employment timelines.' },
    { question: 'Should I explain a short stint immediately?', answer: 'Explicitly label short duration roles as Temporary Contract or Specialized Project to instantly nullify the recruiters fear that you inherently lack operational loyalty.' },
  ],
    author: {
      name: 'David C.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    }
  },
  {
    slug: 'trust',
    title: 'How Recruiters Spot Fake Skills on a Resume',
    excerpt: 'Putting every hit tech word at the bottom of your page kills trust. You must link your skills to real work.',
    date: 'Mar 05, 2026',
    faqs: [
    { question: 'Does blind keyword stuffing work on modern ATS?', answer: 'Absolutely not. Modern enterprise recruitment algorithms use advanced semantic context mapping. They violently penalize isolated massive keyword blocks that lack surrounding syntactic logic.' },
    { question: 'How do I correctly insert technical skills into my CV?', answer: 'You must deeply weave target keywords directly into the active grammatical structure of your outcome bullets. State exactly how you deployed PostgreSQL to solve a specific production crisis.' },
    { question: 'How many times should a keyword appear?', answer: 'Frequency is completely irrelevant compared to contextual density. Using a heavy keyword twice inside an irrefutable business win is significantly stronger than twelve isolated mentions.' },
  ],
    author: {
      name: 'James L.',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80'
    }
  },
  {
    slug: 'soft-skills',
    title: 'How to Prove Soft Skills on Your Resume',
    excerpt: 'Saying you are a great leader means nothing. You must show clear proof of your teamwork from real past events.',
    date: 'Mar 04, 2026',
    faqs: [
    { question: 'Should I list communication under my skills section?', answer: 'Never. Abstract personality traits listed out of context possess absolute zero professional credibility because terrible employees routinely make the exact same generic claims.' },
    { question: 'How do I prove I am a team player on a resume?', answer: 'Prove extreme interpersonal empathy by highlighting scalable documentation. Write exactly how you authored the standard operating procedures that dramatically accelerated junior onboarding across the department.' },
    { question: 'What is the best metric for technical leadership?', answer: 'The absolute greatest metric of leadership is quantifiable human growth. Explicitly state the math behind how many direct reports you personally mentored into senior promotions.' },
  ],
    author: {
      name: 'Anna M.',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80'
    }
  },
  {
    slug: 'scan',
    title: 'How Recruiters Read Resumes in 30 Seconds',
    excerpt: 'You have very little time to grab attention. Every line must put the most important words at the very front.',
    date: 'Mar 02, 2026',
    faqs: [
    { question: 'How long do recruiters spend scanning a profile?', answer: 'A senior technical recruiter will spend a strict maximum of roughly thirty seconds judging your entire visual footprint before instantly deciding to retain or reject your application entirely.' },
    { question: 'What is bullet point front-loading?', answer: 'Front-loading is the physical act of violently dragging the absolute most impressive technical noun or massive numerical result completely to the very first three words of the sentence.' },
    { question: 'Why is right-aligned text bad for resumes?', answer: 'Burying vital technical data on the far right margin completely breaks the natural Z-pattern sweep of the human eye causing critical algorithmic keywords to be instantly bypassed.' },
  ],
    author: {
      name: 'Sarah G.',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80'
    }
  },
  {
    slug: 'gaps',
    title: 'How to Explain a Career Gap on Your Resume',
    excerpt: 'Hiding a long break in your work looks very bad. Smart people own their breaks and show how the time helped them grow.',
    date: 'Mar 01, 2026',
    faqs: [
    { question: 'Should I hide an employment gap on my resume?', answer: 'Never. Attempting to artificially stretch dates to obscure a gap triggers a catastrophic collapse in trust during the background check immediately resulting in a rescinded offer.' },
    { question: 'How do I correctly explain a long career break?', answer: 'Execute explicit semantic labelling. Treat the empty time like a normal formal job by titling the gap precisely as a Planned Sabbatical or Full-Time Educational Leave.' },
    { question: 'Can a gap be considered professional experience?', answer: 'Absolutely. If you aggressively dedicate the time to learning complex new frameworks label the timeline as an Independent Engineering Sabbatical and detail the heavy projects shipped.' },
  ],
    author: {
      name: 'Alex B.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
    }
  },
  {
    slug: 'academic',
    title: 'How to Turn a PhD Into a Tech Resume',
    excerpt: 'Companies do not care about school awards. You must flip your school work into terms that tech businesses care about.',
    date: 'Feb 28, 2026',
    faqs: [
    { question: 'Do tech companies care about academic degrees?', answer: 'Commercial software businesses strictly value shipped product iteration over deep academic theory. Graduate candidates must ruthlessly translate theoretical lab work into heavy commercial velocity metrics.' },
    { question: 'How do I translate a PhD into tech industry experience?', answer: 'Strip away all prestigious university jargon entirely. Describe your complex multi-year academic research completely as a high-growth startup product timeline focused intensely on data scaling and rigid resource operations.' },
    { question: 'What is the biggest fear when hiring an academic?', answer: 'Engineering Directors fear academics suffer from sluggish perfectionism. You must completely eradicate this bias by heavily highlighting specific moments where you aggressively shipped code fast to meet brutal deadlines.' },
  ],
    author: {
      name: 'Michelle P.',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80'
    }
  },
  {
    slug: 'skill-bars',
    title: 'Why Skill Bars on Resumes Don\'t Work',
    excerpt: 'Giving yourself three out of five stars on a coding tool is the fastest way to make a manager skip your page forever.',
    date: 'Feb 26, 2026',
    faqs: [
    { question: 'Should I use visual progress bars for coding skills?', answer: 'Visual skill meters are an absolute structural disaster. Rating yourself eighty percent in a language provides complete zero verifiable context and actively highlights your own relative incompetence.' },
    { question: 'What is the binary rule of technical competence?', answer: 'Technical capability is strictly binary. If you can definitively build a massive commercial system with the tool list it. If you cannot consistently pass an interview in it delete it immediately.' },
    { question: 'How do I prove expert level skills?', answer: 'Replace empty abstract graphics entirely with heavy complex bullet points. Your deep mastery of a language is proven instantly by the architecture of the commercial systems you successfully scaled.' },
  ],
    author: {
      name: 'Marcus T.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    }
  },
  {
    slug: 'bots',
    title: 'How to Beat AI Resume Screening',
    excerpt: 'Recruiters now use AI tools that read your whole story instead of just counting words. Learn how to write so the bot ranks you higher.',
    date: 'Feb 25, 2026',
    faqs: [
    { question: 'How do AI resume screeners actually work?', answer: 'Modern intelligence parsers use semantic language modelling to actively interpret the grammatical cause and effect relationship between your technical knowledge and your actual applied business outcomes.' },
    { question: 'Why do complex visual resume templates fail?', answer: 'Heavy multi-column layouts extreme graphic overlays and intricate grid systems inherently confuse the extraction engines scrambling your sentences into massive chunks of incoherent data loss.' },
    { question: 'How do I rank higher in an applicant tracking system?', answer: 'Submit an incredibly sterile linear digital text structure using absolute rigorous action-adjacency where every single heavy technical tool is physically paired with an explicit financial or speed variable.' },
  ],
    author: {
      name: 'Elena R.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    }
  },
  {
    slug: 'ai-skills',
    title: 'Where to Put AI Skills on Your Resume',
    excerpt: 'Every manager wants to know if you can use AI to work fast. Learn the perfect place to put your prompt skills without looking cheap.',
    date: 'Feb 22, 2026',
    faqs: [
    { question: 'Should I call myself an AI Expert or Prompt Engineer?', answer: 'Absolutely never. Unless you are mathematically establishing raw neural network topology claiming the massive title of AI Expert marks you instantly as a fraudulent trend chaser.' },
    { question: 'Where do I list generative AI skills on my profile?', answer: 'Aggressively weave your prompt usage directly into the chronological action of previous jobs. Detail exactly how you deployed a coding assistant to strip weeks off a legacy refactor deadline.' },
    { question: 'What is the best way to prove I use AI tools?', answer: 'Highlight brutal speed metrics. Prove exactly how deploying a generative language model actively automated a massive operational bottleneck and mathematically doubled your own personal development velocity.' },
  ],
    author: {
      name: 'James L.',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80'
    }
  },
  {
    slug: 'code',
    title: 'How to Show Projects on Your Resume',
    excerpt: 'Companies do not trust text anymore. Dropping a link to a real project gets you hired much faster than a big list of languages.',
    date: 'Feb 20, 2026',
    faqs: [
    { question: 'Do managers actually review GitHub profile links?', answer: 'Yes. Engineering directors massively distrust plain text bullet claims. Providing a single hyperlinked button to a perfectly architected active software repository instantly shatters generic competition.' },
    { question: 'Are live app links better than static resumes?', answer: 'Forcing an evaluator to click and manually interact with your successfully deployed frontend interface generates completely irrefutable proof of your elite operational competence and deployment architecture.' },
    { question: 'What should my open source portfolio include?', answer: 'Ensure your root repository features deeply heavy architectural markdown documentation. Managers aggressively judge your ability to communicate complex database choices long before they ever read the raw structural code.' },
  ],
    author: {
      name: 'David C.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    }
  },
  {
    slug: 'degrees',
    title: 'Do You Need a Degree for a Tech Job?',
    excerpt: 'Big tech companies are switching to skills based hiring. Learn how to hide your lack of a famous degree behind massive project wins.',
    date: 'Feb 18, 2026',
    faqs: [
    { question: 'Is a computer science degree mandatory for software jobs?', answer: 'The modern technology sector is aggressively pivoting toward pure skills-based verification. Massive enterprise systems routinely drop legacy degree requirements prioritizing raw deployed project wins instead.' },
    { question: 'Where should education go on a senior resume?', answer: 'If you lack a famous degree bury the education block permanently at the absolute bottom margin. Instantly force your massive commercial architecture wins directly into the top reading zone.' },
    { question: 'How do I list a coding bootcamp effectively?', answer: 'Treat accelerated bootcamps explicitly as supplementary tool acquisition. Heavily emphasize the independent massive applications you completely designed and deployed outside the safe guided parameters of their static curriculum.' },
  ],
    author: {
      name: 'Sarah G.',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80'
    }
  },
  {
    slug: 'two-pages',
    title: 'Is a Two-Page Resume OK?',
    excerpt: 'People stress too much about fitting everything on a single piece of paper. A clean two page web profile actually works much better.',
    date: 'Feb 15, 2026',
    faqs: [
    { question: 'Is the strict one-page resume rule still valid?', answer: 'The archaic single page mandate is completely dead for senior operators. Mutilating margins and microscopic fonts to appease physical paper constraints triggers massive visual fatigue on modern digital displays.' },
    { question: 'How long should a digital CV profile be?', answer: 'Length is completely dictatable by deep continuous value. A web profile simply relies on an infinite vertical scroll. As long as every bullet is a heavy actionable metric readers will naturally descend.' },
    { question: 'Does extending the length allow for more jobs?', answer: 'No. Extra vertical space must never be populated by irrelevant ancient roles. It must be heavily dedicated toward injecting clean luxurious whitespace around your three most recent absolute primary victories.' },
  ],
    author: {
      name: 'Marcus T.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    }
  },
  {
    slug: 'readme',
    title: 'Best GitHub Profile README Tips for Job Hunters',
    excerpt: 'A cluttered GitHub page hides your best work. Here is how to write a profile README that acts as a landing page for recruiters and technical managers.',
    date: 'Feb 25, 2026',
    author: {
      name: 'Sarah M.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    },
    faqs: [
      {
        question: 'Should I use stats badges on my GitHub README?',
        answer: 'No. Remove stats badges and animated progress bars. They slow down the page load and look unprofessional. Focus on direct links to your best work.'
      },
      {
        question: 'How many projects should I feature on my GitHub profile?',
        answer: 'Choose your best two projects. Write a two-sentence summary for each explaining the problem you solved and the tools you used. Provide a clear link to the code and a link to the live hosted application.'
      },
      {
        question: 'What is the primary goal of a GitHub profile README?',
        answer: 'The goal is to get a job interview. Make it easy for readers to contact you by providing a direct link to your web CV and your professional email address.'
      }
    ]
  },
  {
    slug: 'ssg',
    title: 'Best Static Site Generators for Developer Portfolios',
    excerpt: 'A portfolio website should be blazing fast and hostable anywhere. We compare the best static site generators for developers who want total control over their professional footprint.',
    date: 'Feb 27, 2026',
    author: {
      name: 'Daniel R.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    faqs: [
      {
        question: 'Why is a static site generator better than a dynamic backend for my portfolio?',
        answer: 'Static site generators build flat HTML files that load in milliseconds and never crash. They require no database or server upkeep and can be hosted for free on global CDNs.'
      },
      {
        question: 'Is Astro a good choice for a developer portfolio?',
        answer: 'Yes. Astro is excellent because it ships zero Javascript by default. This makes pages load extremely fast while still letting you design with modern components.'
      },
      {
        question: 'Can I use Next.js for a simple static CV site?',
        answer: 'Yes. Next.js supports static exports. It is a great choice if you want to show off React capabilities or build interactive dashboard elements.'
      }
    ]
  },
  {
    slug: 'code-samples',
    title: 'Best Ways to Display Code Samples to Recruiters',
    excerpt: 'Sending raw files or pasting massive text blocks confuses evaluators. Learn how to package your code samples so recruiters and hiring managers can review your work in seconds.',
    date: 'Mar 01, 2026',
    author: {
      name: 'Priya K.',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
    },
    faqs: [
      {
        question: 'Why should I avoid sending code samples as ZIP file attachments?',
        answer: 'Corporate firewalls routinely block ZIP archives to protect their networks. Recruiters will not risk downloading unknown files to their local machines.'
      },
      {
        question: 'What is the gold standard for sharing code samples?',
        answer: 'A public GitHub repository is the best way to share code. Make sure it contains a detailed README file explaining the architectural design and how to run the project.'
      },
      {
        question: 'How do I show frontend code samples effectively?',
        answer: 'Use interactive web sandboxes like CodeSandbox or StackBlitz. These platforms let reviewers see the live running interface and the source code side by side in their browser.'
      }
    ]
  },
  {
    slug: 'domains',
    title: 'Best Domain Names for Developer Portfolios and Web Resumes',
    excerpt: 'Your domain name is your personal brand address on the internet. We look at the best domain extensions and naming patterns for software engineers.',
    date: 'Mar 03, 2026',
    author: {
      name: 'Tomás R.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    },
    faqs: [
      {
        question: 'What is the best domain extension for a developer website?',
        answer: 'The dot com extension is the most trusted. For technical candidates, dot dev and dot bio are also excellent professional choices.'
      },
      {
        question: 'Should I use hyphens or numbers in my domain name?',
        answer: 'No. Hyphens are difficult to type on mobile keyboards. Numbers look unprofessional. Use a variation of your first and last name using letters only.'
      },
      {
        question: 'Why do custom domain emails help with applications?',
        answer: 'Custom emails show technical ability and avoid getting flagged by enterprise spam filters. Ensure you configure SPF and DKIM records properly.'
      }
    ]
  },
  {
    slug: 'alternatives',
    title: 'Best Alternatives to PDF CVs for Frontend Developers',
    excerpt: 'Flat PDF documents cannot show interactive frontend work. Discover the best alternatives that let you present your user interface skills in a live environment.',
    date: 'Mar 05, 2026',
    author: {
      name: 'Alex P.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
    },
    faqs: [
      {
        question: 'Why do PDF files fail to showcase frontend skills?',
        answer: 'PDFs are static paper formats. They cannot show responsive layout behavior, hover states, animations, page speed, or interactive code executions.'
      },
      {
        question: 'What is a responsive web CV?',
        answer: 'A web CV is an online profile hosted on a public URL. It automatically adapts its layout to look perfect on both desktop screens and mobile devices.'
      },
      {
        question: 'How do I apply if a company portal demands a file upload?',
        answer: 'Use a dual submission strategy. Upload a very simple linear text document for the automated systems. Place a link to your interactive web CV at the very top for the manager.'
      }
    ]
  },
  {
    slug: 'system-design',
    title: 'Best Ways to Prove System Design Skills on a CV',
    excerpt: 'Learn how to show database scaling, partition strategies, and performance metrics on your CV without using generic whiteboards.',
    date: 'Mar 07, 2026',
    author: {
      name: 'Sarah M.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    },
    faqs: [
      {
        question: 'How can I show system scale on a CV',
        answer: 'List physical sizes of database stores and request count per second metrics instead of generic tool lists.'
      },
      {
        question: 'Should I detail database partition strategies on my CV',
        answer: 'Yes. Explaining if you sharded by user identity or region proves you understand production data challenges.'
      },
      {
        question: 'What performance metrics are most important for system design descriptions',
        answer: 'Focus on latencies such as P99 response times and throughput metrics like messages processed per second.'
      }
    ]
  },
  {
    slug: 'hosting',
    title: 'Best Practices for Hosting Personal Projects for Job Hunts',
    excerpt: 'A slow or broken project destroys job opportunities. Discover the best hosting tools and strategies to keep your code fast and live.',
    date: 'Mar 09, 2026',
    author: {
      name: 'Daniel R.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    faqs: [
      {
        question: 'How do I prevent container sleep delays on free hosting tiers',
        answer: 'Set up an automated ping script to request your page every ten minutes during the active hours of your job search.'
      },
      {
        question: 'Why is a custom domain name worth the cost for a developer project',
        answer: 'It makes your project look professional and builds trust that you care about the quality of your work.'
      },
      {
        question: 'Should I build a complex Kubernetes cluster to host my portfolio applications',
        answer: 'No. Keep your architecture simple. Use a simple Virtual Private Server or static web hosting instead.'
      }
    ]
  },
  {
    slug: 'databases',
    title: 'Best Ways to List Databases and Infrastructure Skills',
    excerpt: 'Avoid lazy skills blocks listing database names. Prove database expertise by explaining indexing choices, connection pooling, and replication scale.',
    date: 'Mar 11, 2026',
    author: {
      name: 'Priya K.',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
    },
    faqs: [
      {
        question: 'How can I prove PostgreSQL expertise without just listing the name',
        answer: 'Describe specific achievements like writing composite index configurations or reducing database CPU utilization percentages.'
      },
      {
        question: 'Why should I mention connection pooling on a software profile',
        answer: 'Connection pools prevent database crashes during high traffic surges. Explaining this setups proves you build stable production code.'
      },
      {
        question: 'Should I detail database schema decisions on my profile',
        answer: 'Yes. Explaining why you selected a document store over a relational database shows clear analytical thinking.'
      }
    ]
  },
  {
    slug: 'junior',
    title: 'Best Portfolio Sections for Junior Developers to Include',
    excerpt: 'Bootcamp clones and generic todo apps fail to impress. Discover the high impact sections that prove you can write commercial software.',
    date: 'Mar 13, 2026',
    author: {
      name: 'Tomás R.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    },
    faqs: [
      {
        question: 'What is the most important section of a junior developer page',
        answer: 'The live project section is the most important. Ensure your projects are hosted and have instant guest login buttons.'
      },
      {
        question: 'How can a junior developer prove team collaboration skills',
        answer: 'Link to public merged pull requests on open source repositories to prove you can write code for other maintainers.'
      },
      {
        question: 'Why is technical writing helpful for junior developer profiles',
        answer: 'Writing articles or documenting database schemas proves you can communicate complex system details to other developers.'
      }
    ]
  },
  {
    slug: 'interactive',
    title: 'Best Interactive Resumes for UI and UX Designers',
    excerpt: 'Static PDF documents limit your presentation. Discover how interactive layouts and responsive web profiles capture attention.',
    date: 'Mar 15, 2026',
    author: {
      name: 'Alex P.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
    },
    faqs: [
      {
        question: 'Why should designers build interactive web profiles instead of using PDF files',
        answer: 'A web page showcases interactive elements such as hover transitions and responsive layout structures that are static on paper.'
      },
      {
        question: 'How can designers showcase design system skills on their page',
        answer: 'Include a section that highlights your typography styles, spacing rules, and color palettes to prove design consistency.'
      },
      {
        question: 'What is the rule for animations on an interactive profile',
        answer: 'Keep transitions subtle and under three hundred milliseconds. Avoid heavy animations that distract from the readability of the text.'
      }
    ]
  },
  {
    slug: 'prompts',
    title: 'Best LLM Resume Screening Prompts and How to Beat Them',
    excerpt: 'Large language models reject eighty percent of applications in seconds. Discover the exact prompts managers use and how to align your experience.',
    date: 'Mar 27, 2026',
    author: {
      name: 'Alex P.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
    },
    faqs: [
      {
        question: 'How do large language models score technical profiles during screening',
        answer: 'Large language models convert the text of your profile and the job description into vector embeddings to measure semantic similarity.'
      },
      {
        question: 'Can automated screeners detect hidden white-on-white keywords',
        answer: 'Yes, modern parsing systems extract raw text and ignore CSS styles, rendering hidden text visible and triggering spam flags.'
      },
      {
        question: 'What is the best format to avoid parsing errors in AI screening',
        answer: 'A clean single column layout with standard headings is the most reliable format to prevent parsing errors.'
      }
    ]
  },
  {
    slug: 'education',
    title: 'Best Ways to Format Education and Bootcamps for ATS',
    excerpt: 'Mixing short courses with academic degrees confuses automated parsers. Learn the formatting rules that keep your educational history clear.',
    date: 'Mar 29, 2026',
    author: {
      name: 'Sarah M.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    },
    faqs: [
      {
        question: 'How should I list a coding bootcamp on my professional profile',
        answer: 'List your coding bootcamp in a separate section labeled technical training and certifications rather than academic education.'
      },
      {
        question: 'Should I include my graduation date if it was ten years ago',
        answer: 'You can omit graduation dates if you graduated more than five years ago to focus attention on your recent professional achievements.'
      },
      {
        question: 'Is it necessary to list a college degree if I am a self taught engineer',
        answer: 'No, you can focus on building a strong certification section and providing links to hosted projects to prove your engineering capability.'
      }
    ]
  },
  {
    slug: 'platforms',
    title: 'Best Strategies for Navigating Different ATS Platforms',
    excerpt: 'Workday, Greenhouse, and Lever process applications differently. Discover the navigation strategies that protect your formatting.',
    date: 'Mar 31, 2026',
    author: {
      name: 'Daniel R.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    faqs: [
      {
        question: 'Why does Workday force me to manually retype my work history',
        answer: 'Workday uses older parsing models that struggle with complex layouts, causing the system to misalign data fields.'
      },
      {
        question: 'Does Greenhouse display the original PDF format to recruiters',
        answer: 'Yes, Greenhouse preserves your original document layout in a split screen viewer beside the candidate profile card.'
      },
      {
        question: 'How does Lever handle candidate social links on applications',
        answer: 'Lever automatically extracts coding links and social profiles to display your public repositories directly to the hiring team.'
      }
    ]
  },
  {
    slug: 'optimization',
    title: 'Best Keyword Optimization Tools for Technical CVs',
    excerpt: 'Traditional keyword scanners promote stuffing that ruins readability. Learn the modern tools and methods that match semantic systems.',
    date: 'Apr 02, 2026',
    author: {
      name: 'Priya K.',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
    },
    faqs: [
      {
        question: 'Do keyword frequency scanners help you pass modern technical filters',
        answer: 'No, frequency scanners promote keyword stuffing which triggers quality flags and makes your profile look unprofessional.'
      },
      {
        question: 'How can I use AI models to optimize my technical profile',
        answer: 'Use large language models to compare your profile against job descriptions to identify missing tools and technical concepts.'
      },
      {
        question: 'Should I use synonyms for technical skills on my CV',
        answer: 'Yes, modern semantic systems understand synonyms, but you should still use the most common industry terms for older parsers.'
      }
    ]
  },
  {
    slug: 'alignment',
    title: 'Best Ways to Align Skills with Job Descriptions Safely',
    excerpt: 'Faking skills on a CV leads to immediate interview failure. Discover the conceptual mapping strategies that prove your capabilities honestly.',
    date: 'Apr 04, 2026',
    author: {
      name: 'Tomás R.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    },
    faqs: [
      {
        question: 'Is it safe to list a tool on my CV if I have never used it',
        answer: 'No, claiming experience with a tool you do not know will lead to immediate failure during technical interview questions.'
      },
      {
        question: 'How do I align my profile with a job description if I use a competitor tool',
        answer: 'Frame your experience around the conceptual category of the tool, such as describing infrastructure as code achievements.'
      },
      {
        question: 'How can I prove capacity in a technology I only studied recently',
        answer: 'Build a simple hosted proof of concept project using the new technology and provide a direct link to the repository.'
      }
    ]
  },
  {
    slug: 'test-ats',
    title: 'Best Ways to Test Your Resume for ATS Parsing Errors',
    excerpt: 'Automated tracking systems scramble layout structures without warning. Learn how to test your document using raw text and API audits to ensure visibility.',
    date: 'Mar 17, 2026',
    author: {
      name: 'Alex P.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
    },
    faqs: [
      {
        question: 'How do I run a plain text test on my CV',
        answer: 'Copy all text from your document and paste it into a plain text editor. Inspect the reading order to ensure your employment dates and job titles are not merged.'
      },
      {
        question: 'Does font selection affect resume parser accuracy',
        answer: 'Yes. Standard fonts like Arial or Helvetica have reliable character maps. Non-standard or web fonts can result in garbled text output during parsing.'
      },
      {
        question: 'What is the risk of using templates with multi column layouts',
        answer: 'Multi column layouts often read horizontally across columns. This merges unrelated blocks of text and scrambles your professional details.'
      }
    ]
  },
  {
    slug: 'headings',
    title: 'Best ATS-Friendly Section Headings to Avoid Parser Bugs',
    excerpt: 'Creative titles like My Career Milestones confuse scanning software dictionaries. Learn the standard headings that ensure your experience is mapped correctly.',
    date: 'Mar 19, 2026',
    author: {
      name: 'Sarah M.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    },
    faqs: [
      {
        question: 'Why do creative section headings fail in applicant tracking systems',
        answer: 'Section classifiers match headings against strict dictionaries of standard terms. Unknown headers are classified as miscellaneous text which recruiters rarely search.'
      },
      {
        question: 'What are the safest headers for a technical profile',
        answer: 'Use standard terms like Work Experience, Technical Skills, Personal Projects, Education, and Certifications to ensure correct mapping.'
      },
      {
        question: 'Can I add decorative icons next to my section headings',
        answer: 'No. Icons convert to unknown unicode characters which can scramble the heading text and prevent the parser from finding the section anchor.'
      }
    ]
  },
  {
    slug: 'acronyms',
    title: 'Best Methods to Use Tech Acronyms for Search Crawlers',
    excerpt: 'Recruiters query databases using both abbreviations and expanded terms. Discover how the expansion technique helps you match all search queries safely.',
    date: 'Mar 21, 2026',
    author: {
      name: 'Daniel R.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    faqs: [
      {
        question: 'How should I write technical acronyms on my CV',
        answer: 'Write the acronym first followed by the full spelling in parentheses. For example, use AWS (Amazon Web Services) to match both search queries.'
      },
      {
        question: 'Should I list technology versions like ES6 or Java 17',
        answer: 'List the specific version but also include the base technology name. This ensures your profile is indexed for both broad and version-specific queries.'
      },
      {
        question: 'Do search algorithms value keywords in lists more than in descriptions',
        answer: 'No. Keywords inside job descriptions and context bullets carry more weight because they prove you applied the technology in a professional setting.'
      }
    ]
  },
  {
    slug: 'truncation',
    title: 'Best Ways to Avoid Parser Truncation on Enterprise Systems',
    excerpt: 'Legacy databases silently cut off candidate profiles that exceed storage limits. Learn how to write dense bullet points and use web links to protect your history.',
    date: 'Mar 23, 2026',
    author: {
      name: 'Priya K.',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
    },
    faqs: [
      {
        question: 'Why do legacy tracking systems truncate long documents',
        answer: 'Many enterprise databases store parsed text in columns with fixed limits of four thousand or eight thousand characters, discarding everything else.'
      },
      {
        question: 'How can I estimate the character count of my document',
        answer: 'Copy the text from your exported document into a word processor to count the characters. Keep your total count under six thousand characters for safety.'
      },
      {
        question: 'What is the best way to share a long professional history',
        answer: 'Submit a short text document that lists your recent experience and include a link to your interactive web profile which has no character limits.'
      }
    ]
  },
  {
    slug: 'parsers',
    title: 'Best Resume Parsing APIs and How Recruiters Use Them',
    excerpt: 'Applicant tracking systems use parser APIs to extract structured JSON data. Learn how Sovren and Affinda score profiles and how to optimize your layout.',
    date: 'Mar 25, 2026',
    author: {
      name: 'Tomás R.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    },
    faqs: [
      {
        question: 'What is a resume parser API',
        answer: 'A resume parser API is an automated service that extracts contact details, skills, and work experience from files and outputs them as structured JSON data.'
      },
      {
        question: 'How do recruiters search the parsed database',
        answer: 'Recruiters use search filters in their dashboards to query candidates by specific programming languages, location, and years of experience.'
      },
      {
        question: 'How do parser APIs score candidate profiles',
        answer: 'Parsers calculate match percentages by checking the proximity of your skills to your job titles and counting term frequency inside your experience bullets.'
      }
    ]
  },
  {
    slug: 'subjects',
    title: 'Best Cold Email Subject Lines for Software Developers',
    excerpt: 'If your email subject line looks like an automated template, it goes straight to the trash. Learn how to write short, value-first subject lines that get opened.',
    date: 'Apr 06, 2026',
    author: {
      name: 'Sarah M.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    },
    faqs: [
      {
        question: 'Should I use emoji in my subject lines?',
        answer: 'No. Emojis look like marketing emails or newsletter spam. They do not look like messages from a technical colleague.'
      },
      {
        question: 'Is it okay to use lowercase letters in my subject line?',
        answer: 'Yes. A subject line like next.js performance fix written in lowercase looks like an informal note from a coworker and stands out in a recruiter\'s inbox.'
      },
      {
        question: 'Should I include the word CV or portfolio in the subject?',
        answer: 'Only if you combine it with a clear, specific result. A subject line like Sarah Miller CV is weak. Sarah Miller / React performance engineer is far stronger.'
      }
    ]
  },
  {
    slug: 'referrals',
    title: 'Best LinkedIn DM Templates for Getting Referrals',
    excerpt: 'Asking a stranger for a referral immediately is a high-risk request. Learn how to build trust with short, value-first messages and a clean web profile link.',
    date: 'Apr 08, 2026',
    author: {
      name: 'Daniel R.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    faqs: [
      {
        question: 'Should I ask recruiters or engineers for referrals?',
        answer: 'Ask engineers. Recruiters receive too many pitches and cannot verify your technical skills. Engineers can review your code, and their recommendation carries more weight.'
      },
      {
        question: 'What if an engineer accepts my connection but does not reply?',
        answer: 'Do not spam them. Wait a week, then send a polite update showing a new project you built or a technical problem you solved.'
      },
      {
        question: 'Is it okay to offer a referral bonus split?',
        answer: 'No. This looks unprofessional and desperate. Engineers refer people because they want to build a strong team, not for a quick payout.'
      }
    ]
  },
  {
    slug: 'follow-up',
    title: 'Best Ways to Follow Up After Tech Interviews',
    excerpt: 'The silence after a technical interview is normal. Discover how to follow up with value-add updates and code fixes instead of generic thank-you notes.',
    date: 'Apr 10, 2026',
    author: {
      name: 'Priya K.',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
    },
    faqs: [
      {
        question: 'What if I made a major coding mistake in the interview?',
        answer: 'Write the fix immediately and send it. Do not apologize for the mistake. Simply state, I realized there was a cleaner way to write that function. Here is the updated code.'
      },
      {
        question: 'How many times should I follow up before giving up?',
        answer: 'Follow up twice. Once with a thank-you note, and once a week later to check the schedule. If you get no reply after the second message, stop.'
      },
      {
        question: 'Should I follow up with the recruiter or the engineering manager?',
        answer: 'Send the thank-you note and code updates to the engineering manager because they appreciate the technical context. Send scheduling questions to the recruiter.'
      }
    ]
  },
  {
    slug: 'managers',
    title: 'Best Methods to Find Hiring Managers on Twitter and LinkedIn',
    excerpt: 'Job portals are black holes where applications go to die. Bypassing the algorithms by finding and pitching hiring managers directly is the key to landing interviews.',
    date: 'Apr 12, 2026',
    author: {
      name: 'Tomás R.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    },
    faqs: [
      {
        question: 'Is it unprofessional to DM a manager on Twitter?',
        answer: 'No, if they state that their DMs are open for hiring. If their profile says we are hiring, they want to hear from you. Keep it professional, focus on code, and do not spam.'
      },
      {
        question: 'What if a hiring manager has their DMs closed?',
        answer: 'Reply to their public tweet with a short note. Let them know what you built and that you would love to share your work details.'
      },
      {
        question: 'Should I follow up if they read my DM but do not reply?',
        answer: 'Wait five days, then send a polite update showing a new project commit or fix. If they do not reply, do not push further.'
      }
    ]
  },
  {
    slug: 'communities',
    title: 'Best Communities for Finding the Hidden Job Market',
    excerpt: 'The best engineering roles are filled in private communities before they ever reach public boards. Learn where developers hang out and how to join the discussion.',
    date: 'Apr 14, 2026',
    author: {
      name: 'Alex P.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
    },
    faqs: [
      {
        question: 'How do I find local tech Slack channels?',
        answer: 'Search on GitHub or Google for lists of tech Slack communities. Many developer advocates maintain public lists of regional Slack groups sorted by country and city.'
      },
      {
        question: 'Should I post my availability in every channel?',
        answer: 'No. Only post in dedicated career or hiring channels. Posting job requests in general discussion channels violates community guidelines and looks unprofessional.'
      },
      {
        question: 'How do I stand out in Hacker News hiring threads?',
        answer: 'Write a short, clean comment that fits on a single screen. Lead with your location, remote availability, and core tech stack, and include a link to your live profile.'
      }
    ]
  },
  {
    slug: 'feedback',
    title: 'Best Ways to Request Portfolio Feedback from Senior Engineers',
    excerpt: 'Stop sending senior developers vague requests for review. Discover the structured template that gets busy engineers to critique your projects.',
    date: 'Apr 16, 2026',
    author: {
      name: 'Sarah M.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    },
    faqs: [
      {
        question: 'How do I approach a senior engineer for portfolio feedback?',
        answer: 'Write a short message that specifies one project and asks a single technical question about your design choice instead of asking for a general review.'
      },
      {
        question: 'Should I offer to pay a senior engineer for their feedback?',
        answer: 'No. Senior engineers mentor developers to give back to the community, not for small payments. A polite message showing your progress is the best reward.'
      },
      {
        question: 'How do I implement the feedback I receive?',
        answer: 'Apply the changes to your project, push the commits, and send a short follow-up message to the engineer showing them the updated code.'
      }
    ]
  },
  {
    slug: 'pitches',
    title: 'Best Elevator Pitches for Technical Meetups and Hackathons',
    excerpt: 'Rambling about your career history kills interest. Learn the forty-second structure that highlights real system wins and invites collaboration.',
    date: 'Apr 18, 2026',
    author: {
      name: 'Daniel R.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    faqs: [
      {
        question: 'What is the ideal length for a technical elevator pitch?',
        answer: 'Keep your verbal pitch under forty seconds. This is long enough to explain your technical focus and short enough to keep the listener engaged during a busy event.'
      },
      {
        question: 'Should I list all the programming languages I know in my pitch?',
        answer: 'No. Name only your primary language and one core framework that matches the projects you want to build. Listing too many tools dilutes your message.'
      },
      {
        question: 'How do I share my contact details after pitching at a meetup?',
        answer: 'Use a clean web profile link on your phone. Let them scan a barcode or type a simple URL like name dot bio rather than searching for your profile on social networks.'
      }
    ]
  },
  {
    slug: 'salary',
    title: 'Best Strategies for Handling Early Salary Questions',
    excerpt: 'Giving a salary number too early locks you into a low rate. Discover how to deflect the question and force recruiters to share their budget first.',
    date: 'Apr 20, 2026',
    author: {
      name: 'Priya K.',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
    },
    faqs: [
      {
        question: 'How do I respond when a recruiter demands a salary expectation?',
        answer: 'Ask the recruiter for the range they have budgeted for the position before you share your own number.'
      },
      {
        question: 'Is it safe to state a salary expectation on an application form?',
        answer: 'You can write a placeholder or state that compensation is negotiable based on the complete benefits package.'
      },
      {
        question: 'Should I lie about my past salary to get a higher offer?',
        answer: 'No. Many companies run background checks to verify your past employment details and misrepresenting your salary history can destroy trust.'
      }
    ]
  },
  {
    slug: 'contracts',
    title: 'Best Methods to Negotiate Remote Software Contracts',
    excerpt: 'Signing remote contracts without reviewing the legal clauses is highly risky. Learn how to restrict IP assignment and timezone overlap safely.',
    date: 'Apr 22, 2026',
    author: {
      name: 'Tomás R.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    },
    faqs: [
      {
        question: 'What is the most important clause to negotiate in a remote contract?',
        answer: 'The intellectual property assignment clause is the most important to negotiate because you must ensure the company only owns work built during office hours on company equipment.'
      },
      {
        question: 'How do I handle payment terms in remote contracts?',
        answer: 'Request Net fifteen payment terms to ensure you receive cash within two weeks of submitting your invoice instead of waiting for standard Net sixty cycles.'
      },
      {
        question: 'Should I accept timezone requirements that do not match my location?',
        answer: 'Negotiate a small block of core collaborative hours rather than committing to work full days on a foreign schedule.'
      }
    ]
  },
  {
    slug: 'questions',
    title: 'Best Questions to Ask Interviewers in Tech Roles',
    excerpt: 'Saying you have no questions at the end of an interview shows a lack of interest. Learn the questions that prove you understand systems and scale.',
    date: 'Apr 24, 2026',
    author: {
      name: 'Alex P.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
    },
    faqs: [
      {
        question: 'What is the best question to ask a tech interviewer?',
        answer: 'Ask the interviewer how the team handles technical debt and prioritizes refactoring work during their development cycles.'
      },
      {
        question: 'How many questions should I ask at the end of a tech interview?',
        answer: 'Target three focused questions that show you care about code quality and team workflows rather than asking a long list of general questions.'
      },
      {
        question: 'Should I ask about salary or benefits during the technical interview?',
        answer: 'No. Reserve all questions about compensation and benefits for your discussions with the recruitment team at the end of the hiring process.'
      }
    ]
  },
  {
    slug: 'web-elements',
    title: 'Best Interactive Elements for Web-Based CVs',
    excerpt: 'Adding interactive elements to your web CV can grab recruiter attention. Learn which dynamic features prove your skills and which ones just add friction.',
    date: 'May 06, 2026',
    author: {
      name: 'Sarah M.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    },
    faqs: [
      {
        question: 'What interactive elements should I put on a web CV?',
        answer: 'Add dynamic tech stack filters and expandable system design deep dives. These elements help recruiters scan your skills and let engineering managers read technical details without cluttering the main layout.'
      },
      {
        question: 'Will interactive elements break on recruiter screens?',
        answer: 'Yes if you use heavy libraries or complex canvas scripts. Keep your interactions built with native CSS and vanilla state to ensure they render cleanly on all web browsers.'
      },
      {
        question: 'How does interactivity impact page load performance?',
        answer: 'Interactivity can slow down your page if you do not lazy load heavy scripts. Ensure that all interactive sandboxes or terminal mockups are loaded asynchronously after your main content renders.'
      }
    ]
  },
  {
    slug: 'load-time',
    title: 'Best Page Load Times for Portfolios and How to Optimize Them',
    excerpt: 'A slow portfolio site destroys your chances before a recruiter even sees your code. Discover the target load times and modern optimization steps that keep your site fast.',
    date: 'May 08, 2026',
    author: {
      name: 'Daniel R.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    faqs: [
      {
        question: 'What is the target page load time for a developer portfolio?',
        answer: 'You must target a Largest Contentful Paint under one point five seconds. Anything slower than two seconds on mobile networks triggers immediate reader abandonment.'
      },
      {
        question: 'How do I optimize large images for my online profile?',
        answer: 'Convert all images to modern formats like WebP or AVIF and compress them before uploading. Provide responsive image attributes to let the browser select the best size for the user screen.'
      },
      {
        question: 'Should I use server rendering for my portfolio site?',
        answer: 'No because server rendering adds execution latency. Use static site generation to build your pages during deployment so the server sends pre-rendered files instantly.'
      }
    ]
  },
  {
    slug: 'passwords',
    title: 'Best Ways to Password-Protect Sensitive Portfolio Projects',
    excerpt: 'NDA-bound projects and corporate work cannot be shared publicly. Discover how to password-protect sensitive projects without adding friction for busy recruiters.',
    date: 'May 10, 2026',
    author: {
      name: 'Priya K.',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
    },
    faqs: [
      {
        question: 'How can I share sensitive NDA projects on my portfolio?',
        answer: 'Password protect the specific project page and send the credentials directly to recruiters in your application email. This keeps your details safe from public search engines while allowing access for employers.'
      },
      {
        question: 'What is the best way to give recruiters password access?',
        answer: 'Include a token parameter directly in your custom application link. The page validates the token automatically so recruiters can view your work without typing a password.'
      },
      {
        question: 'Is it safe to upload proprietary corporate code behind a password?',
        answer: 'No because password protection only reduces public exposure. You must still sanitize your project details by removing database keys and company names before uploading.'
      }
    ]
  },
  {
    slug: 'printing',
    title: 'Best Methods to Print Web Resumes to PDF Cleanly',
    excerpt: 'Archaic application systems still demand PDF files. Discover the CSS print styling methods that export your interactive web CV to a clean PDF.',
    date: 'May 12, 2026',
    author: {
      name: 'Tomás R.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    },
    faqs: [
      {
        question: 'Why does my printed web CV look broken?',
        answer: 'Web browsers use screen layout rules by default which split grids and sentences. You must write custom media print rules to tell the browser how to linearize your content on a physical page.'
      },
      {
        question: 'How do I prevent job entries from splitting across pages?',
        answer: 'Use CSS page break avoidance rules on your experience blocks. This forces the browser to move the entire job block to the next page if there is not enough room.'
      },
      {
        question: 'How should I handle web hyperlinks on a printed document?',
        answer: 'Use CSS print selectors to automatically write the destination URL next to the link text. This allows readers to view and type the address manually.'
      }
    ]
  },
  {
    slug: 'branding',
    title: 'Best Custom Domains for Personal Job Branding',
    excerpt: 'Generic email hosting domains look unprofessional. Discover how choosing and configuring a custom domain enhances your personal branding and job search.',
    date: 'May 14, 2026',
    author: {
      name: 'Alex P.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
    },
    faqs: [
      {
        question: 'Why should I buy a custom domain for my job search?',
        answer: 'A custom domain looks highly professional and helps you stand out in recruiter databases. It also gives you permanent ownership of your links so you can change hosting platforms without breaking applications.'
      },
      {
        question: 'What domain extension is best for developer portfolios?',
        answer: 'The dot dev extension is highly respected and signals technical focus. Extensions like dot me or dot bio also work well for personal brands.'
      },
      {
        question: 'How long does it take for DNS changes to propagation?',
        answer: 'DNS changes can take up to twenty-four hours to spread globally. You must test your configuration using propagation checkers before sending application links to recruiters.'
      }
    ]
  },
  {
    slug: 'slack',
    title: 'Best Ways to Share Your CV on Slack Communities',
    excerpt: 'Sending a PDF file to a crowded Slack channel makes your experience invisible. Learn how to format your introduction and share a live web link that gets clicked.',
    date: 'Apr 26, 2026',
    author: {
      name: 'Sarah M.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    },
    faqs: [
      {
        question: 'Why should I not upload a PDF to Slack?',
        answer: 'PDF uploads require downloading and opening in separate apps which fails on many mobile viewports. A web link generates a rich inline preview directly in the Slack stream.'
      },
      {
        question: 'How do I ensure my web preview generates correctly on Slack?',
        answer: 'You must configure OpenGraph tags on your web page. These meta tags tell Slack which name and image to display when your link is shared.'
      },
      {
        question: 'What is the best channel to post my CV link?',
        answer: 'Look for channels explicitly named hiring, jobs, or self promotion. Posting in general discussion rooms will get your account flagged as spam.'
      }
    ]
  },
  {
    slug: 'layouts',
    title: 'Best Mobile CV Layouts for Fast Recruiter Clicks',
    excerpt: 'Recruiters scan candidates on their mobile screens during meetings and commutes. Discover how to structure your vertical layout to capture clicks in seconds.',
    date: 'Apr 28, 2026',
    author: {
      name: 'Daniel R.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    faqs: [
      {
        question: 'Why does a multi column layout fail on mobile devices?',
        answer: 'Multi column layouts shrink the font size to fit the narrow viewport which forces readers to pinch and zoom. A single column layout stacks content vertically for easy swiping.'
      },
      {
        question: 'What margins should I use for a mobile responsive CV?',
        answer: 'Keep your side padding at three quarters of an inch. This spacing prevents text from touching the physical screen edges and ensures a comfortable read.'
      },
      {
        question: 'How do I test my CV layout for mobile devices?',
        answer: 'Use browser developer tools to simulate standard phone resolutions like three hundred and sixty pixels. Verify that no text wraps awkwardly or overlaps other blocks.'
      }
    ]
  },
  {
    slug: 'confidential',
    title: 'Best Ways to Handle Confidential Projects on a Public CV',
    excerpt: 'Working under strict non-disclosure agreements can leave holes in your CV. Discover the professional methods to describe high-impact system designs without breaking legal promises.',
    date: 'Apr 30, 2026',
    author: {
      name: 'Priya K.',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
    },
    faqs: [
      {
        question: 'Can I list projects protected by an NDA on my CV?',
        answer: 'Yes if you abstract the details. Omit the specific client name and proprietary tool branding and describe the system challenges using open industry standards.'
      },
      {
        question: 'How do I describe a confidential client?',
        answer: 'Use industry descriptions and scale metrics. Write that you built systems for a top tier global bank rather than naming the specific institution.'
      },
      {
        question: 'What if a background check requires my official work history?',
        answer: 'Use the actual legal employer name on private background check forms. You only use the abstracted description on public profiles.'
      }
    ]
  },
  {
    slug: 'metrics',
    title: 'Best Analytics Metrics to Track on Your Web Resume',
    excerpt: 'Static CVs give you zero feedback on recruiter engagement. Learn which web analytics metrics to track on your interactive profile to optimize your applications.',
    date: 'May 02, 2026',
    author: {
      name: 'Tomás R.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    },
    faqs: [
      {
        question: 'Why should I track metrics on my web CV?',
        answer: 'Tracking metrics allows you to see if recruiters are opening your application link and which sections they read. This feedback helps you optimize your design.'
      },
      {
        question: 'What is a good target read time for a CV?',
        answer: 'You should target an average read time of over forty seconds. This duration proves that the recruiter is scanning your work history and project details.'
      },
      {
        question: 'How do I track which company clicked my CV link?',
        answer: 'Create custom links with query parameters for each application. This setup allows you to identify the specific visitor in your dashboard.'
      }
    ]
  },
  {
    slug: 'qr-code',
    title: 'Best Ways to Use QR Codes for Print and Presentation Resumes',
    excerpt: 'A printed CV is a static medium that cannot show interactive code or live sites. Discover the best practices for embedding QR codes that bridge paper to production.',
    date: 'May 04, 2026',
    author: {
      name: 'Alex P.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
    },
    faqs: [
      {
        question: 'Where should I position a QR code on my CV?',
        answer: 'Place the QR code in the top right header opposite your name. Keep the dimensions around one inch square so it is easy to scan.'
      },
      {
        question: 'What URL should the QR code point to?',
        answer: 'Link directly to your mobile optimized web profile. Do not point the code to a static document or a heavy desktop page.'
      },
      {
        question: 'Can I use free dynamic QR code generators?',
        answer: 'Avoid free dynamic services because they often expire or show ads. Use static QR codes that encode your URL directly.'
      }
    ]
  }
];

