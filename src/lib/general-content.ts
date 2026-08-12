/**
 * Curated GENERAL role information, appended when a job page falls short of
 * the word floor. Static, true, universal — never claims about a specific
 * job, company, pay, or location. Written to pass the site's own gates:
 * no banned lexicon, no em dashes, no vague openers, no salary figures.
 */

type FamilyBlock = { about: string[]; interview: string[]; career: string[] };

const FAMILIES: Record<string, FamilyBlock> = {
  swe: {
    about: [
      'Software engineers turn product ideas into working code. Engineers work in small teams, review each other\'s work, and ship in small batches. Most teams follow agile practices such as sprints and daily standups. Engineers also write tests, fix bugs, and improve performance. The field values clear communication as much as technical skill.',
    ],
    interview: [
      'Hiring for engineering roles usually starts with a recruiter screen, followed by one or two technical rounds. Candidates often solve a coding problem, discuss past projects, and answer system design questions. Some loops include a take-home task. Final rounds typically cover team fit and give candidates a chance to ask questions.',
    ],
    career: [
      'Engineering careers usually progress from individual contributor to senior, staff, and principal levels. Some engineers move into management and lead teams of five to twenty people. Others stay on the technical track. Growth follows demonstrated impact, not tenure alone.',
    ],
  },
  data: {
    about: [
      'Data roles turn raw information into decisions. Analysts query databases and build dashboards. Data scientists build models that predict outcomes. Data engineers build the pipelines that move and store data. All three work closely with business teams and need a mix of statistics, coding, and communication.',
    ],
    interview: [
      'Data interviews commonly include a SQL or coding exercise, a statistics question, and a case study. Candidates may be asked to design a metric, interpret an experiment, or build a small model. Some companies give a take-home analysis. Expect questions about past projects and the business impact of your work.',
    ],
    career: [
      'Data careers grow toward senior analyst, staff data scientist, or data engineering lead. Many professionals specialize in machine learning, analytics, or infrastructure. Cross-functional work with product and engineering teams becomes more important at senior levels.',
    ],
  },
  product: {
    about: [
      'Product managers decide what a team builds and why. They gather customer feedback, define requirements, and set priorities. Product work spans engineering, design, and business teams and ships products that solve real problems. The role combines research, writing, analysis, and decision making under uncertainty.',
    ],
    interview: [
      'Product interviews often include a product sense round, an analytical round, and a behavioral round. Candidates may be asked to design a feature, prioritize a backlog, or estimate a metric. Some loops include a case exercise. Strong candidates show structured thinking and customer empathy.',
    ],
    career: [
      'Product careers usually move from associate to product manager, then to senior, group, or director levels. Some people specialize in growth, platform, or enterprise products. Others move into general management. Success depends on shipped outcomes rather than shipped output.',
    ],
  },
  design: {
    about: [
      'Designers shape how products look and feel. Designers create user flows, wireframes, prototypes, and polished visuals. They test ideas with users and iterate on feedback. Design work spans research, interaction design, and visual design. Collaboration with product and engineering happens daily.',
    ],
    interview: [
      'Design interviews usually include a portfolio review, a design exercise, and a team conversation. Candidates present past work and explain their process and decisions. Some loops include a live design challenge. Communication matters as much as the visual output.',
    ],
    career: [
      'Design careers grow from junior to senior, staff, and principal levels. Some designers move into design management or design operations. Specializations include UX research, interaction design, and brand design. Cross-functional influence grows with seniority.',
    ],
  },
  sales: {
    about: [
      'Sales roles connect a company\'s product with the customers who need it. Representatives research accounts, run demos, handle objections, and close deals. The work is quota driven and moves quickly. Strong sellers combine listening skills with product knowledge and steady follow through.',
    ],
    interview: [
      'Sales hiring often includes a role play, a discovery call simulation, and a presentation. Candidates may be asked to pitch a product to a panel or handle a tough objection. Behavioral questions focus on past quota attainment and deal history. Energy and preparation matter.',
    ],
    career: [
      'Sales careers can move from SDR or associate to account executive, senior AE, manager, and director roles. Some sellers move into partnerships, account management, or revenue operations. Compensation typically mixes a base with commission tied to results.',
    ],
  },
  'customer-success': {
    about: [
      'Customer success teams keep customers happy after the sale. They onboard new accounts, answer questions, and help users get value from a product. They watch usage signals and step in before customers churn. The role mixes support, training, and account management.',
    ],
    interview: [
      'Customer success interviews usually include a support scenario, a communication exercise, and behavioral questions. Candidates may be asked to handle an upset customer or plan an onboarding call. Some loops test product knowledge. Empathy and clear writing are the core skills.',
    ],
    career: [
      'Customer success careers grow from specialist to manager and director levels. Some people move toward account management or solutions engineering. Deep product knowledge and cross-functional work with support, sales, and product teams become key at senior levels.',
    ],
  },
  marketing: {
    about: [
      'Marketing teams grow awareness and demand for a company\'s products. They write copy, run campaigns, manage channels, and measure results. The work spans content, paid ads, email, events, and search. Marketing roles combine creativity with data and constant testing.',
    ],
    interview: [
      'Marketing interviews often include a portfolio review, a campaign exercise, and analytics questions. Candidates may be asked to plan a launch, write a brief, or improve a funnel. Some loops include a presentation. Results from past campaigns carry the most weight.',
    ],
    career: [
      'Marketing careers move from associate to manager, director, and VP levels. Specializations include growth, brand, product marketing, and content. Generalists often start, then specialize as they advance. Measured impact on pipeline and revenue drives progression.',
    ],
  },
  'hr-people': {
    about: [
      'People teams handle hiring, development, and employee experience. Recruiters find and screen candidates. HR partners advise managers on policy and performance. People operations run payroll, benefits, and compliance. The work requires discretion, fairness, and clear communication.',
    ],
    interview: [
      'People team interviews usually include a case scenario, a policy question, and behavioral rounds. Candidates may be asked to design an interview process or handle a sensitive employee situation. Confidentiality and judgment are tested throughout. Structured answers with empathy land best.',
    ],
    career: [
      'People careers grow from coordinator to generalist, manager, and director levels. Recruiters can move into talent leadership. HR partners can move into people operations leadership. Business acumen becomes more important at each level.',
    ],
  },
  finance: {
    about: [
      'Finance teams manage money, forecasts, and reporting. Analysts build models and explain variance. Controllers run accounting and compliance. FP&A professionals support decisions with budgets and forecasts. The work is precise, deadline driven, and tied to business results.',
    ],
    interview: [
      'Finance interviews usually include technical questions on accounting or modeling, a case study, and behavioral rounds. Candidates may be asked to build a forecast or explain a variance. Spreadsheet skills are tested in most loops. Accuracy and clear explanations matter.',
    ],
    career: [
      'Finance careers move from analyst to senior analyst, manager, and controller or FP&A director levels. Some people earn certifications such as CPA or CFA. Cross-functional work with operations and leadership grows with seniority.',
    ],
  },
  analyst: {
    about: [
      'Analysts turn data into clear answers. They pull numbers, clean data, build dashboards, and explain what changed and why. The work supports decisions across sales, product, marketing, and operations. Strong analysts pair technical skill with business curiosity.',
    ],
    interview: [
      'Analyst interviews often include a SQL or spreadsheet exercise, a case question, and behavioral rounds. Candidates may be asked to analyze a dataset, define a metric, or estimate an outcome. Presenting findings clearly is tested as often as the analysis itself.',
    ],
    career: [
      'Analyst careers can grow into senior analyst, analytics manager, or data science roles. Some analysts move into product or business operations. Deeper technical skills or broader business ownership are the two main paths.',
    ],
  },
  security: {
    about: [
      'Security professionals protect systems, data, and users. They review code, run tests, monitor threats, and respond to incidents. The field spans application security, infrastructure security, and governance. Security work is careful, evidence based, and constantly evolving.',
    ],
    interview: [
      'Security interviews usually include a technical assessment, a threat modeling exercise, and behavioral rounds. Candidates may be asked to review a code sample for vulnerabilities or design a secure system. Practical knowledge and clear risk communication are the core skills.',
    ],
    career: [
      'Security careers grow from analyst or engineer to senior, staff, and leadership roles. Specializations include cloud security, application security, and security operations. Certifications help early; demonstrated impact matters later.',
    ],
  },
  'devops-platform': {
    about: [
      'Platform and DevOps engineers build the systems that run everything else. They manage infrastructure, CI/CD pipelines, observability, and reliability. The work is about automation, scaling, and removing friction for product teams. Systems thinking is the core skill.',
    ],
    interview: [
      'Platform interviews usually include an infrastructure scenario, a scripting or coding exercise, and operational questions. Candidates may be asked to design a deployment pipeline or debug an outage. Incident experience and an automation mindset are tested.',
    ],
    career: [
      'Platform careers grow from engineer to senior, staff, and platform lead roles. Some people move into SRE leadership or cloud architecture. Breadth across networking, storage, and reliability becomes more important at senior levels.',
    ],
  },
  'content-writing': {
    about: [
      'Content writers produce the words that explain products and ideas. They write articles, landing pages, emails, and social posts. The work combines research, editing, and search awareness. Good writers adapt their voice to the audience and the channel.',
    ],
    interview: [
      'Content hiring usually starts with a writing test or portfolio review. Candidates may be asked to rewrite a passage, outline an article, or draft a landing page. Editing skill is tested as often as original writing. Clear structure and attention to detail matter.',
    ],
    career: [
      'Content careers grow from writer to senior writer, editor, and content lead roles. Some people specialize in search, technical writing, or brand voice. Proving measurable impact, such as traffic or conversion lift, drives progression.',
    ],
  },
  'healthcare-social': {
    about: [
      'Healthcare and social care roles support people directly. Clinicians provide treatment and care. Support staff coordinate services and casework. The work is regulated, rewarding, and demanding. Safeguarding, documentation, and teamwork are part of every role.',
    ],
    interview: [
      'Care sector interviews usually include scenario questions, a values conversation, and checks of registration or qualifications. Candidates may be asked how they would handle a difficult case or manage risk. Empathy, boundaries, and clear communication are assessed.',
    ],
    career: [
      'Careers in healthcare and social work grow through senior practitioner, team lead, and manager roles. Registration and continuous learning are required in many countries. Specialization is common, from mental health to children\'s services.',
    ],
  },
  leadership: {
    about: [
      'Leaders set direction and build the conditions for their teams to succeed. They hire, coach, and hold people accountable. Leadership work spans strategy, communication, and decision making. Effective leaders give clear context and remove obstacles for the people who report to them.',
    ],
    interview: [
      'Leadership hiring usually includes a strategy case, a people scenario, and a values conversation. Candidates may be asked to turn around a struggling team or plan for growth. Past results are examined closely, especially how decisions were made.',
    ],
    career: [
      'Leadership careers move from manager to senior manager, director, and executive roles. Each step adds more scope and more responsibility for outcomes. The best leaders keep learning how to delegate, communicate, and decide.',
    ],
  },
  intern: {
    about: [
      'Internships are structured early-career programs. Interns work on real tasks, learn from experienced colleagues, and get feedback on their growth. Programs usually run for several months, and strong performance can lead to a full-time offer. The value comes from doing work that matters.',
    ],
    interview: [
      'Internship hiring usually involves a resume review, a behavioral conversation, and sometimes a skills exercise. Candidates are evaluated for potential, curiosity, and communication rather than deep experience. Show interest, ask questions, and prepare examples from projects or coursework.',
    ],
    career: [
      'Internships are a bridge to early careers. A strong internship leads to a full-time offer and a head start on experience. Interns who take ownership, ask questions, and document their work get the most out of the program.',
    ],
  },
  operations: {
    about: [
      'Operations teams keep a business running smoothly. They manage processes, vendors, and logistics across the company. The work includes planning, coordination, and continuous improvement. Strong operators are organized, pragmatic, and comfortable with change.',
    ],
    interview: [
      'Operations interviews usually include a process scenario, an analytics question, and behavioral rounds. Candidates may be asked to improve a workflow or plan an event. Attention to detail and clear communication are tested throughout.',
    ],
    career: [
      'Operations careers grow from coordinator to manager, director, and chief operating officer roles. Some people specialize in supply chain, facilities, or program management. Success depends on reliability and on improving the systems you own.',
    ],
  },
  legal: {
    about: [
      'Legal roles protect a company against risk while keeping business moving. Lawyers advise on contracts, deals, and disputes. Compliance teams make sure the company follows the rules that apply to it. Paralegals keep the paperwork, filings, and deadlines in order. Precision and judgment are the core skills.',
    ],
    interview: [
      'Legal interviews usually include a contract review exercise, a compliance scenario, and behavioral rounds. Candidates may be asked to flag issues in a sample agreement or explain a regulatory question. Past experience with specific practice areas carries the most weight.',
    ],
    career: [
      'Legal careers grow from associate to senior counsel, general counsel, and chief legal officer roles. Compliance specialists can move into risk or governance leadership. Specialization by practice area, from employment law to corporate transactions, is common.',
    ],
  },
  research: {
    about: [
      'Research roles build new knowledge and test ideas. Researchers design studies, run experiments, and analyze results. The work spans academic labs, corporate R&D, and product research. Rigor, reproducibility, and clear reporting are the standards that matter.',
    ],
    interview: [
      'Research interviews usually include a presentation of past work, a technical discussion, and sometimes a research proposal exercise. Candidates may be asked to design a study or critique a method. Depth of understanding is tested more than speed.',
    ],
    career: [
      'Research careers grow from junior researcher to senior scientist, principal, and lab or research director roles. Some people move into applied research and product work. Publication record or demonstrable impact drives progression, depending on the setting.',
    ],
  },
  qa: {
    about: [
      'QA and test roles make sure software works before users see it. Testers design test cases, run manual and automated checks, and report defects. QA engineers build test frameworks that run with every release. Attention to detail and clear defect reports are the core skills.',
    ],
    interview: [
      'QA interviews usually include a test design exercise, a bug report scenario, and a coding or scripting question for automation roles. Candidates may be asked to test a login flow or prioritize fixes for a release. Structured, thorough thinking is what interviewers look for.',
    ],
    career: [
      'QA careers grow from manual tester to QA engineer, test lead, and quality manager roles. Automation experience opens the fastest path. Some people move into developer or release engineering roles as skills deepen.',
    ],
  },
  hospitality: {
    about: [
      'Hospitality roles deliver service that people remember. Front-of-house staff welcome guests, take orders, and keep service moving. Back-of-house teams prepare food and drinks behind the scenes. The work is physical, social, and moves quickly. Consistency and teamwork keep venues running.',
    ],
    interview: [
      'Hospitality interviews usually focus on experience, availability, and how you handle busy service. Candidates may be asked about a difficult customer or a busy shift. Enthusiasm, reliability, and a willingness to learn matter more than formal qualifications.',
    ],
    career: [
      'Hospitality careers grow from entry roles to supervisor, manager, and venue leadership positions. Many professionals move between hotels, restaurants, and events. Skills in scheduling, ordering, and guest relations open management paths.',
    ],
  },
  education: {
    about: [
      'Education roles shape how people learn. Teachers plan lessons, run classes, and assess progress. Trainers and instructors run courses inside companies too. The work mixes preparation, delivery, and feedback. Patience, clarity, and adaptability are the core skills.',
    ],
    interview: [
      'Education interviews usually include a sample lesson or training session, a planning exercise, and behavioral questions. Candidates may be asked to explain how they adapt to different learners. Qualifications and relevant teaching experience carry the most weight.',
    ],
    career: [
      'Education careers grow from teacher or trainer to lead, head of department, and program director roles. Some professionals move into curriculum design, edtech, or training leadership. Evidence of learner outcomes drives progression.',
    ],
  },
  generic: {
    about: [
      'Every role in this field shares a few habits: clear communication, structured thinking, and steady follow through. Teams hold regular meetings, review progress, and adjust plans. Success usually depends on how well you work with others, not just how hard you try.',
      'Most organizations organize this kind of work into small teams with a clear owner for each project. People are expected to set priorities, share progress, and ask for help early. Written communication matters because decisions are often recorded and revisited.',
    ],
    interview: [
      'Hiring processes usually combine a screening conversation with one or more interview rounds. Candidates can expect questions about their experience, a scenario or case, and a chance to ask their own questions. Preparation and specific examples from past work carry the most weight.',
      'Interviews in this field typically test judgment, communication, and fit as much as technical skill. Be ready to describe a challenge you faced, what you did, and what you learned. Most companies value honest answers over polished ones.',
    ],
    career: [
      'Careers in this field grow through a mix of experience, responsibility, and demonstrated results. Early years build skills; later years build ownership. Many professionals switch focus areas or companies to keep growing.',
      'Career growth comes from taking on harder problems and making your work visible. Look for opportunities to own outcomes, mentor others, and learn the business beyond your team.',
    ],
  },
};

const FAMILY_RULES: Array<{ keywords: string[]; family: string }> = [
  { family: 'healthcare-social', keywords: ['social worker', 'mental health', 'nurse', 'clinician', 'therapist', 'counselor', 'healthcare', 'care worker', 'childcare', 'care '] },
  { family: 'data', keywords: ['data scientist', 'data science', 'data engineer', 'data analyst', 'machine learning', 'ml ', 'ml-', 'analytics', 'artificial intelligence', 'ai ', 'data '] },
  { family: 'security', keywords: ['security engineer', 'cyber', 'appsec', 'application security', 'threat', 'ciso', 'soc analyst', 'infosec', 'security '] },
  { family: 'devops-platform', keywords: ['devops', 'sre', 'site reliability', 'platform engineer', 'cloud engineer', 'reliability engineer', 'infrastructure engineer', 'ci/cd'] },
  { family: 'sales', keywords: ['account executive', 'sales ', 'sales rep', 'business development', 'sdr', 'bdr', 'partnership', 'affiliate', 'account manager', 'commercial'] },
  { family: 'customer-success', keywords: ['customer success', 'client success', 'customer support', 'client support', 'client service', 'client ops', 'customer experience', 'support specialist', 'helpdesk'] },
  { family: 'marketing', keywords: ['marketing', 'growth ', 'growth-', 'brand ', 'brand-', 'communications', 'social media', 'content marketing', 'seo', 'sem', 'wavemaker', 'media ', 'campaign'] },
  { family: 'content-writing', keywords: ['copywriter', 'copywriting', 'writer', 'writing', 'editor', 'editorial', 'journalist', 'author'] },
  { family: 'design', keywords: ['designer', 'ux', 'ui ', 'ui-', 'product design', 'graphic design', 'creative ', 'creative-', 'art director'] },
  { family: 'product', keywords: ['product manager', 'product lead', 'product owner', 'head of product', 'director of product', 'product management'] },
  { family: 'hr-people', keywords: ['recruiter', 'recruiting', 'talent ', 'talent-', 'human resources', 'hr ', 'hr-', 'people ', 'people-', 'learning and development', 'l&d'] },
  { family: 'finance', keywords: ['finance', 'accounting', 'accountant', 'controller', 'treasury', 'fp&a', 'audit', 'tax ', 'tax-', 'payroll', 'revenue '] },
  { family: 'analyst', keywords: ['business analyst', 'analyst', 'risk analyst', 'research analyst', 'credit analyst', 'quant'] },
  { family: 'legal', keywords: ['legal', 'lawyer', 'attorney', 'counsel', 'paralegal', 'compliance officer'] },
  { family: 'research', keywords: ['researcher', 'research ', 'research-', 'scientist', 'phd', 'fellow'] },
  { family: 'qa', keywords: ['qa ', 'qa-', 'quality assurance', 'test engineer', 'test automation', 'software test'] },
  { family: 'hospitality', keywords: ['barback', 'bartender', 'bar ', 'bar-', 'server', 'waiter', 'host ', 'chef', 'cook', 'hotel', 'restaurant', 'hospitality', 'banquet', 'kitchen'] },
  { family: 'education', keywords: ['teacher', 'teaching', 'lecturer', 'professor', 'education', 'curriculum', 'trainer', 'instructor'] },
  { family: 'leadership', keywords: ['head of', 'director of', 'vp ', 'vice president', 'chief ', 'cto', 'cfo', 'coo', 'executive', 'president'] },
  { family: 'intern', keywords: ['intern', 'internship', 'trainee', 'apprentice', 'graduate', 'entry level', 'entry-level'] },
  { family: 'operations', keywords: ['operations', 'logistics', 'supply chain', 'program manager', 'project manager', 'coordinator', 'procurement', 'facilities'] },
  { family: 'swe', keywords: ['software', 'frontend', 'front-end', 'backend', 'back-end', 'fullstack', 'full-stack', 'mobile', 'engineer', 'engineering', 'developer', 'programmer', 'web ', 'web-', 'dev '] },
];

/** Classify a job title into a role family for general content.
 * Specificity scoring: the family with the most matching keywords wins, so
 * "Data Engineer" lands in data, not software, and "Security Engineer" lands
 * in security. Ties break by rule order (more specific families first). */
function roleFamilyFor(title?: string | null, tags?: string[] | null): string {
  const hay = ` ${String(title || '').toLowerCase()} ${(tags || []).join(' ').toLowerCase()} `;
  let best = 'generic';
  let bestScore = 0;
  for (const rule of FAMILY_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (hay.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = rule.family;
    }
  }
  return best;
}

function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type GeneralBlock = { heading: string; body: string };

/** Family-specific extra sentences that lengthen the base blocks so the
 * general content alone can carry the page past the word floor. */
const EXTENDERS: Record<string, FamilyBlock> = {
  swe: {
    about: [
      'Engineers spend part of every week on planning, code review, and debugging, not just writing new code. The ability to explain a technical decision in plain words separates strong engineers from the rest.',
    ],
    interview: [
      'Interviewers look for how you break down an unfamiliar problem, not just whether you reach the answer. Practicing a few problems aloud and reviewing your own past projects are the best preparation.',
    ],
    career: [
      'A typical engineering ladder has clear levels with defined expectations for scope, quality, and mentorship. Moving up usually requires owning outcomes end to end rather than completing assigned tickets.',
    ],
  },
  data: {
    about: [
      'Nearly every modern company runs on data teams, from startups to banks. A strong portfolio of past analyses matters more than degrees in many hiring decisions.',
    ],
    interview: [
      'Interviewers often evaluate how you communicate uncertainty and business impact, not only the math. Bringing a clean write-up of a past analysis to the interview is well received.',
    ],
    career: [
      'The field changes quickly, so continuous learning is part of the job. Professionals who can translate numbers into decisions tend to advance fastest.',
    ],
  },
  product: {
    about: [
      'Product work happens at the intersection of user needs, business goals, and technical feasibility. Most product managers own a roadmap and are judged by the outcomes their teams ship.',
    ],
    interview: [
      'Interviewers want to see how you prioritize when everything matters. Walking through your decision criteria out loud is a strong habit in product interviews.',
    ],
    career: [
      'Product careers often reward generalists early and specialists later. Experience shipping measurable outcomes is the strongest signal for promotion.',
    ],
  },
  design: {
    about: [
      'Design decisions are judged by outcomes such as usability, conversion, and customer satisfaction. Most design teams keep a living design system to keep products consistent.',
    ],
    interview: [
      'Portfolios are strongest when they show the problem, the constraints, and the iteration, not just the final screens. Interviewers also watch how you take feedback.',
    ],
    career: [
      'Senior designers are expected to influence product strategy, not just execute visuals. Building a habit of user research strengthens any design career.',
    ],
  },
  sales: {
    about: [
      'Sales roles reward consistent activity and honest qualification of deals. Most companies use a defined sales process, and reps are trained on it before being left on their own.',
    ],
    interview: [
      'Interviewers often simulate the job in the interview itself, so be ready to run a short discovery call or demo. Practicing your own sales pitch out loud helps.',
    ],
    career: [
      'High performers in sales typically move into larger accounts, team leadership, or sales operations. Quota history and references carry the most weight in promotion.',
    ],
  },
  'customer-success': {
    about: [
      'Customer success teams are measured on retention, usage, and customer satisfaction. Most companies provide structured onboarding so new team members learn the product deeply first.',
    ],
    interview: [
      'Interviewers often ask how you would bring an unhappy account back on track. Structure your answer around listening, a plan, and follow up.',
    ],
    career: [
      'Success careers reward product depth and relationship skills equally. Many leaders in this function started in support or account management.',
    ],
  },
  marketing: {
    about: [
      'Marketing teams usually run experiments every week and keep the work that performs. Most companies hire specialists in channels such as paid search, email, or content.',
    ],
    interview: [
      'Interviewers ask about specific campaigns you ran and what the numbers said. Preparing a short case of one campaign with its results is strong preparation.',
    ],
    career: [
      'Marketing careers reward measurable results and adaptability. Channel experience plus business sense usually beats a general resume.',
    ],
  },
  'hr-people': {
    about: [
      'People teams support employees through every stage, from hiring to exit. Most companies run structured processes for reviews, compensation, and policy changes.',
    ],
    interview: [
      'Interviewers often test how you handle sensitive information and disagreement. Framing answers around policy, fairness, and company values works well.',
    ],
    career: [
      'People careers reward breadth across recruitment, development, and operations. Experience with tools such as HRIS and ATS systems helps at every level.',
    ],
  },
  finance: {
    about: [
      'Finance teams follow tight calendars, with monthly closes and annual planning cycles. Accuracy and auditability are expected on every deliverable.',
    ],
    interview: [
      'Interviewers may give a real dataset and ask for a quick analysis. Showing your work and explaining assumptions matters as much as the final number.',
    ],
    career: [
      'Finance careers reward precision early and business partnership later. Learning the operations of the company beyond the numbers accelerates growth.',
    ],
  },
  analyst: {
    about: [
      'Analysts are the bridge between data and decisions. Most analysts own recurring reports and are expected to improve them over time.',
    ],
    interview: [
      'Interviewers often test speed and clarity with a timed exercise. Explaining what the numbers mean, not just what they are, is the differentiator.',
    ],
    career: [
      'Analyst roles are a common on-ramp into product, marketing, or operations leadership. Building deep domain knowledge alongside analytics is the fastest path.',
    ],
  },
  security: {
    about: [
      'Security teams work in a landscape of constant change, with new threats and new rules every year. Most companies invest heavily in training and tooling for their teams.',
    ],
    interview: [
      'Interviewers often ask how you triage and communicate risk. Showing calm judgment under pressure matters as much as technical depth.',
    ],
    career: [
      'Security careers reward specialization and a track record of finding and fixing real issues. Written communication of risk is a core skill at senior levels.',
    ],
  },
  'devops-platform': {
    about: [
      'Platform teams are measured by developer velocity and system reliability. Most companies run on-call rotations, and understanding incident response is part of the role.',
    ],
    interview: [
      'Interviewers often ask about a past outage and how you handled it. Structured post-incident thinking, not heroics, is what they look for.',
    ],
    career: [
      'Platform careers reward breadth and calm under pressure. Experience automating your own work is the strongest signal for senior roles.',
    ],
  },
  'content-writing': {
    about: [
      'Content teams plan around editorial calendars and measure performance with traffic and engagement. Most writers revise their own work several times before publishing.',
    ],
    interview: [
      'Interviewers often assign a timed writing test. Following the brief exactly and editing ruthlessly are the two habits that score highest.',
    ],
    career: [
      'Content careers reward a visible portfolio and proven business results. Writers who understand their company\'s product and audience grow fastest.',
    ],
  },
  'healthcare-social': {
    about: [
      'Care sector work is guided by codes of practice, and professional standards are taken seriously. Most employers provide supervision and regular check-ins for staff.',
    ],
    interview: [
      'Interviewers often ask how you balance care with boundaries and risk. Reflecting on real cases you have handled, with the outcome, is the strongest preparation.',
    ],
    career: [
      'Care careers reward reliability and reflective practice. Many senior practitioners move into supervision, training, or service leadership over time.',
    ],
  },
  leadership: {
    about: [
      'Leadership roles are measured by team outcomes, retention, and delivery. Most organizations expect leaders to be visible, predictable, and generous with context.',
    ],
    interview: [
      'Interviewers dig into specific decisions you made and their consequences. Preparing two or three decision stories with numbers and lessons is the best use of time.',
    ],
    career: [
      'Leadership careers reward a record of building and developing people. The higher you go, the more your communication shapes the whole organization.',
    ],
  },
  intern: {
    about: [
      'Internships usually include mentorship, structured feedback, and a final evaluation. Employers look for interns who are curious, reliable, and easy to work with.',
    ],
    interview: [
      'Interviewers at this level care most about motivation and coachability. Real examples from projects, classes, or clubs beat generic answers.',
    ],
    career: [
      'Interns who treat the program like a real job, with follow through and visible ownership, convert to full-time offers at the highest rates.',
    ],
  },
  operations: {
    about: [
      'Operations teams run on routines, checklists, and clear escalation paths. Most companies expect operators to document what they do so anyone can step in.',
    ],
    interview: [
      'Interviewers often ask how you would fix a process that is failing. Walking through diagnosis, a plan, and measurement is the winning structure.',
    ],
    career: [
      'Operations careers reward reliability and continuous improvement. Operators who quantify the impact of their fixes move into leadership fastest.',
    ],
  },
  legal: {
    about: [
      'Legal teams manage risk while enabling deals and launches. Most work is deadline driven, and confidentiality is a constant requirement.',
    ],
    interview: [
      'Interviewers often present a sample contract and ask what you would flag. Working through it out loud, risk by risk, is the strongest approach.',
    ],
    career: [
      'Legal careers reward precision and commercial awareness. In-house roles value speed and judgment over exhaustive analysis.',
    ],
  },
  research: {
    about: [
      'Research work is evaluated on rigor and reproducibility. Most researchers keep detailed lab books or version-controlled analysis code.',
    ],
    interview: [
      'Interviewers often ask you to present your past work in depth. Being ready to defend every methodological choice is the core preparation.',
    ],
    career: [
      'Research careers reward a strong publication or delivery record. Applied research roles value impact on products as much as novelty.',
    ],
  },
  qa: {
    about: [
      'QA teams protect release quality and user trust. Most teams combine manual checks with automated suites that run on every commit.',
    ],
    interview: [
      'Interviewers often ask how you would test a specific feature. Listing happy paths, edge cases, and failure modes in order is the winning structure.',
    ],
    career: [
      'QA careers reward automation skills and a systematic eye. Testers who can articulate product risk influence release decisions.',
    ],
  },
  hospitality: {
    about: [
      'Hospitality venues run on shift schedules, and reliability is the most valued trait. Most roles include on-the-job training, so attitude matters more than experience.',
    ],
    interview: [
      'Interviewers at venues often look for energy, availability, and calm under pressure. Mentioning specific venues or events you have worked adds credibility.',
    ],
    career: [
      'Hospitality careers reward versatility and service instinct. Staff who learn ordering, scheduling, and guest relations quickly are promoted first.',
    ],
  },
  education: {
    about: [
      'Education roles are evaluated by learner outcomes and feedback. Most employers provide lesson planning frameworks and regular observation.',
    ],
    interview: [
      'Interviewers often ask for a sample lesson or training plan. Showing how you adapt to different learners is the strongest signal.',
    ],
    career: [
      'Education careers reward learner results and leadership within teams. Curriculum design and teacher development open the senior paths.',
    ],
  },
  generic: {
    about: [
      'Successful professionals in any field share a few habits: they take notes, keep commitments, and communicate in writing. Teams value people who make their work easy to review and build on.',
    ],
    interview: [
      'Whatever the role, preparation is visible. Reviewing the company\'s product, the job description, and your own past work before the conversation is the strongest step.',
    ],
    career: [
      'Growth in any career comes from scope, results, and reputation. Take on work that is slightly uncomfortable, and make sure others can see the outcomes.',
    ],
  },
};

/** "Questions to ask" — universal, relevant to every role, adds useful length. */
const QUESTIONS = [
  'Good questions to ask the employer in the interview: what does success look like in the first six months, how is the team structured, what is the current biggest challenge, and how are decisions made. Asking about growth paths and the review process is also well received. Employers expect questions, and good ones show preparation.',
  'Useful questions for the interview: what a typical week looks like, how work is assigned, what tools the team uses, and how feedback works. Asking how the role has changed recently and what the team wishes it had known when joining is also reasonable. Questions about the manager\'s priorities are especially valued.',
  'Worth asking in any interview: how the team measures success, who the role works with daily, what the onboarding looks like, and what the company is trying to achieve this year. Asking what past hires did well is a strong final question. Keep the list short and pick the questions that matter most to you.',
];

/** Curated general-info blocks for the role family, deterministically chosen.
 * Appended only when the page is short — never fabricated, never job-specific. */
export function generalBlocksFor(opts: { title?: string | null; tags?: string[] | null; id?: string | null }): GeneralBlock[] {
  const fam = roleFamilyFor(opts.title, opts.tags);
  const family = FAMILIES[fam] || FAMILIES.generic;
  const ext = EXTENDERS[fam] || EXTENDERS.generic;
  const h = hash32(String(opts.id || opts.title || 'job'));
  const pick = <T>(arr: T[]): T => arr[h % arr.length];
  const join = (base: string[], extra: string[]): string => `${pick(base)} ${extra.join(' ')}`.trim();
  return [
    { heading: 'About this type of role', body: join(family.about, ext.about) },
    { heading: 'Typical interview steps', body: join(family.interview, ext.interview) },
    { heading: 'Career growth', body: join(family.career, ext.career) },
    { heading: 'Questions to ask', body: pick(QUESTIONS) },
  ];
}
