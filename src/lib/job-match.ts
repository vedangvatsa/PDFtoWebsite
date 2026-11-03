/**
 * Job board matching: company keys, language filter, role families, match score.
 */
import { COMPANY_NAME_MAP, toCompanyKey } from '@/lib/company-directory';

export function normalizeCompany(name: string): string {
  const key = (name || '').toLowerCase().trim();
  return toCompanyKey(COMPANY_NAME_MAP[key] || name || '');
}

// ── Non-English title detection ──
// Matches titles that are clearly non-English (German, French, Spanish, etc.)
const NON_ENGLISH_PATTERNS = [
  // German
  /\b(und|oder|für|mit|bei|zur|zum|ein|eine|des|dem|den|als|auf|nach|aus|über|unter|vor|zwischen|durch|gegen|ohne|während)\b/i,
  /\b(Stellvertretend|Abteilung|Geschäftsführ|Sachbearbeit|Fachangestellt|Mitarbeiter|Leiter|Berater|Steuer|Buchhalt|Werkstudent|Praktikant|Ausbildung|Kaufm[aä]nn|Entwickl)\w*/,
  /\b(gmbh|gesellschaft|verwaltung|beratung|betrieb|abteilung|fachkraft)\b/i,
  // French
  /\b(responsable|ingénieur|développeur|chargé|adjoint|directeur|gestionnaire|conseiller|technicien)\b/i,
  /\b(avec|dans|pour|chez|entre|cette|sont|nous|vous|leur|mais|donc|alors)\b/i,
  // Spanish
  /\b(ingeniero|desarrollador|gerente|coordinador|analista|ejecutivo|técnico|especialista|asesor)\b/i,
  /\b(para|como|está|este|esta|pero|también|desde|donde|cuando|porque)\b/i,
  // Portuguese
  /\b(engenheiro|desenvolvedor|analista|gerente|coordenador|especialista|técnico)\b/i,
  // Dutch
  /\b(medewerker|adviseur|beheerder|directeur|coördinator|verantwoordelijk)\b/i,
  // Detect extended non-ASCII chars heavily used in European languages (ä,ö,ü,ß,ñ,ç etc.)
  /[äöüßñçàèìòùâêîôûëïãõ]{2,}/i,
];

export function isNonEnglishTitle(title: string): boolean {
  if (!title) return false;
  return NON_ENGLISH_PATTERNS.some(p => p.test(title));
}

// PostgREST or()/ov() filters are parsed as a filter string — strip characters
// that could break out of the intended filter expression (e.g. `,` or `)`).
export function sanitizeFilterTerm(term: string): string {
  return term
    .replace(/[,(){}[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
}

// ── Role keyword families for title matching ──
export const ROLE_FAMILIES: Record<string, string[]> = {
  // Software & Systems Engineering
  swe:         ['software engineer', 'software developer', 'software architect', 'swe', 'programmer', 'developer', 'application engineer', 'staff engineer', 'principal engineer'],
  frontend:    ['frontend', 'front-end', 'front end', 'react', 'vue', 'angular', 'ui engineer', 'ui developer', 'css', 'next.js', 'nextjs'],
  backend:     ['backend', 'back-end', 'back end', 'server engineer', 'api engineer', 'golang', 'node.js developer', 'java engineer', 'python engineer', 'ruby developer', 'c++ developer'],
  fullstack:   ['full stack', 'fullstack', 'full-stack'],
  mobile:      ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin'],
  devops:      ['devops', 'sre', 'site reliability', 'infrastructure engineer', 'platform engineer', 'cloud engineer', 'kubernetes', 'cloud architect', 'systems engineer'],
  qa:          ['qa', 'quality assurance', 'test engineer', 'sdet', 'automation engineer'],
  embedded:    ['embedded', 'firmware', 'hardware engineer', 'iot', 'fpga'],
  security:    ['security engineer', 'cybersecurity', 'infosec', 'penetration tester', 'appsec', 'security analyst'],

  // Data & AI
  data:        ['data engineer', 'data scientist', 'data analyst', 'analytics', 'etl', 'data platform', 'business intelligence', 'bi engineer', 'bi analyst'],
  ml:          ['machine learning', 'ml engineer', 'ai engineer', 'deep learning', 'nlp engineer', 'computer vision', 'ai research', 'llm engineer', 'research scientist'],

  // Product & Design
  product:     ['product manager', 'program manager', 'product owner', 'product lead', 'tpm', 'technical program manager', 'group product manager', 'vp product', 'head of product'],
  design:      ['designer', 'ux', 'ui/ux', 'product design', 'design system', 'figma', 'creative director', 'visual designer', 'graphic designer'],

  // Business & Go-To-Market Domains
  marketing:   ['marketing', 'growth', 'seo', 'sem', 'demand gen', 'brand manager', 'digital marketing', 'content marketing', 'product marketing', 'pmm', 'social media', 'communications'],
  sales:       ['account executive', 'sales', 'business development', 'bdr', 'sdr', 'account manager', 'sales manager', 'sales director', 'revenue', 'enterprise sales', 'partnerships'],
  operations:  ['operations', 'business operations', 'bizops', 'chief of staff', 'operations manager', 'supply chain', 'logistics', 'strategy & operations', 'project manager', 'scrum master'],
  finance:     ['finance', 'financial analyst', 'accountant', 'accounting', 'controller', 'fp&a', 'auditor', 'treasury', 'payroll', 'tax', 'bookkeeper', 'cfo'],
  people:      ['recruiter', 'recruiting', 'talent acquisition', 'sourcer', 'people ops', 'human resources', 'hr', 'hrbp', 'talent partner', 'people partner', 'hr generalist', 'people manager'],
  legal:       ['legal', 'counsel', 'corporate counsel', 'paralegal', 'compliance', 'privacy officer', 'contracts', 'attorney', 'general counsel'],
  support:     ['customer support', 'customer success', 'support specialist', 'csm', 'client services', 'technical support', 'customer service', 'onboarding specialist'],
  content:     ['writer', 'copywriter', 'editor', 'technical writer', 'content creator', 'journalist', 'editorial', 'content strategist'],
};

// Engineering disciplines that strictly require domain engineering experience
export const CORE_ENGINEERING_FAMILIES = new Set([
  'swe', 'frontend', 'backend', 'fullstack', 'mobile', 'devops', 'qa', 'embedded'
]);

// ── Seniority levels and their numeric rank ──
const SENIORITY_MAP: Record<string, number> = {
  intern: 1, internship: 1, trainee: 1, apprentice: 1,
  junior: 2, associate: 2, entry: 2, 'early career': 2,
  mid: 3, intermediate: 3,
  senior: 4, 'sr.': 4, 'sr': 4,
  staff: 5, principal: 5,
  lead: 6, 'team lead': 6, 'tech lead': 6,
  director: 7, head: 7,
  vp: 8, 'vice president': 8,
  cto: 9, ceo: 9, coo: 9, cfo: 9, 'c-level': 9,
};

/** Extract seniority level from a title string */
export function extractSeniority(title: string): number {
  const lower = title.toLowerCase();
  for (const [keyword, level] of Object.entries(SENIORITY_MAP)) {
    if (lower.includes(keyword)) return level;
  }
  return 3; // default to mid-level
}

/** Extract role families from a title string */
export function extractRoleFamilies(title: string): string[] {
  const lower = title.toLowerCase();
  const families: string[] = [];
  for (const [family, keywords] of Object.entries(ROLE_FAMILIES)) {
    if (keywords.some(kw => lower.includes(kw))) {
      families.push(family);
    }
  }
  return families;
}

/** Normalize location string for comparison */
export function normalizeMatchLocation(loc: string): { isRemote: boolean; tokens: string[] } {
  const lower = loc.toLowerCase().trim();
  const isRemote = /remote|anywhere|distributed|worldwide|global/i.test(lower);
  const tokens = lower
    .replace(/[,\-\/|·•]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !['and', 'the', 'or'].includes(t));
  return { isRemote, tokens };
}

export interface MatchUserProfile {
  skills: string[];
  experience: Array<{ title?: string; company?: string; description?: string }>;
  location: string;
  about: string;
}


/**
 * Compute a match score (0–100) between a user profile and a job listing.
 * 
 * Re-balanced Weights:
 * - Title/domain experience: 40 points max (core professional domain alignment)
 * - Skills overlap:          25 points max (domain-relevant execution skills)
 * - Seniority match:         15 points max (career level alignment)
 * - Location match:          20 points max (remote or local geography)
 * 
 * Guardrail:
 * - Domain mismatch penalty: -35 points if a specialized engineering/developer
 *   role is matched against a candidate with zero past engineering experience.
 */
export function computeMatchScore(
  user: MatchUserProfile,
  job: { title: string; tags: string[]; location: string; company: string }
): { score: number; matchedSkills: string[]; signals: string[] } {
  const signals: string[] = [];
  let score = 0;

  const jobTitleLower = job.title.toLowerCase();
  const jobTagsLower = (job.tags || []).map(t => t.toLowerCase());
  const jobRoleFamilies = new Set(extractRoleFamilies(job.title));
  const tagText = jobTagsLower.join(' ');
  for (const f of extractRoleFamilies(tagText)) {
    jobRoleFamilies.add(f);
  }

  // ── 1. Experience & Title/Role Matching (40 pts max) ──
  // Extract verified role families specifically from user's actual job titles
  const userExperienceRoleFamilies = new Set<string>();
  const userExperienceTitles: string[] = [];

  for (const exp of (user.experience || []).slice(0, 5)) {
    if (exp.title) {
      userExperienceTitles.push(exp.title.toLowerCase());
      for (const f of extractRoleFamilies(exp.title)) {
        userExperienceRoleFamilies.add(f);
      }
    }
  }

  // Also check about/summary with lower weight if experience is empty
  const userProfileRoleFamilies = new Set<string>(userExperienceRoleFamilies);
  if (userProfileRoleFamilies.size === 0 && user.about) {
    for (const f of extractRoleFamilies(user.about)) {
      userProfileRoleFamilies.add(f);
    }
  }

  // Check direct overlap with job role families
  const verifiedRoleOverlap = [...userExperienceRoleFamilies].filter(f => jobRoleFamilies.has(f));
  const profileRoleOverlap = [...userProfileRoleFamilies].filter(f => jobRoleFamilies.has(f));

  if (verifiedRoleOverlap.length > 0) {
    // Strongest match: candidate held this exact role domain in their career
    const roleScore = Math.min(40, 25 + (verifiedRoleOverlap.length - 1) * 8);
    score += roleScore;
    signals.push(`role: ${verifiedRoleOverlap.join(', ')}`);
  } else if (profileRoleOverlap.length > 0) {
    // Role mentioned in summary / profile
    const roleScore = Math.min(25, 15 + (profileRoleOverlap.length - 1) * 5);
    score += roleScore;
    signals.push(`role: ${profileRoleOverlap.join(', ')}`);
  } else {
    // Direct title keyword overlap (e.g., "Account Executive", "Product Designer")
    const titleMatch = userExperienceTitles.some(t => {
      const words = t.split(/\s+/).filter(w => w.length > 3);
      return words.some(w => jobTitleLower.includes(w));
    });
    if (titleMatch) {
      score += 15;
      signals.push('title: related');
    }
  }

  // ── 2. Skills overlap (25 pts max) ──
  const userSkillsLower = user.skills.map(s => s.toLowerCase());
  const matchedSkills = user.skills.filter(s => {
    const sl = s.toLowerCase();
    const parts = sl.split(/[\s&,/]+/).filter(p => p.length > 2);
    return jobTagsLower.some(t => t.includes(sl) || sl.includes(t) || parts.some(p => t === p || t.includes(p)))
      || parts.some(p => jobTitleLower.includes(p));
  });

  if (matchedSkills.length > 0) {
    const skillScore = Math.min(25, matchedSkills.length * 5);
    score += skillScore;
    signals.push(`${matchedSkills.length} skill${matchedSkills.length > 1 ? 's' : ''}`);
  }

  // ── 3. Seniority match (15 pts max) ──
  const userTitles = (user.experience || []).slice(0, 2).map(e => e.title || '');
  const userSeniority = userTitles.length > 0 ? Math.max(...userTitles.map(extractSeniority)) : 3;
  const jobSeniority = extractSeniority(job.title);
  const seniorityDiff = Math.abs(userSeniority - jobSeniority);
  if (seniorityDiff === 0) {
    score += 15;
    signals.push('seniority: exact');
  } else if (seniorityDiff === 1) {
    score += 10;
    signals.push('seniority: close');
  } else if (seniorityDiff === 2) {
    score += 5;
  }

  // ── 4. Location match (20 pts max) ──
  if (job.location) {
    const jobLoc = normalizeMatchLocation(job.location);

    if (user.location) {
      const userLoc = normalizeMatchLocation(user.location);
      if (userLoc.tokens.some(t => jobLoc.tokens.includes(t))) {
        score += 20;
        signals.push('location: match');
      } else if (jobLoc.isRemote) {
        score += 15;
        signals.push('location: remote');
      }
    } else {
      if (jobLoc.isRemote) {
        score += 20;
        signals.push('location: remote');
      }
    }
  }

  // ── 5. Domain Relevance Guardrail (Anti-mismatch Penalty) ──
  // If the job belongs to core software/systems engineering, verify that candidate
  // has actual engineering domain experience or relevant tech titles.
  const isJobEngineering = [...jobRoleFamilies].some(f => CORE_ENGINEERING_FAMILIES.has(f)) ||
    /\b(software engineer|software developer|swe|backend engineer|frontend engineer|fullstack engineer|devops engineer|site reliability engineer|systems engineer)\b/i.test(job.title);

  if (isJobEngineering && (user.experience || []).length > 0) {
    const hasEngineeringExp = [...userExperienceRoleFamilies].some(f => CORE_ENGINEERING_FAMILIES.has(f)) ||
      userExperienceTitles.some(t => /\b(engineer|developer|programmer|architect|swe|devops|sre)\b/i.test(t));

    if (!hasEngineeringExp) {
      // Candidate has non-engineering work history; penalize cross-domain engineering recommendations
      score = Math.max(0, score - 35);
      signals.push('domain: outside engineering');
    }
  }

  return { score, matchedSkills, signals };
}

export function guessCategory(job: any): string {
  const t = (job.title || '').toLowerCase();
  const c = (job.category || '').toLowerCase();
  if (/engineer|developer|swe|software|devops|sre|platform|architect|backend|frontend|full.?stack/.test(t) || c === 'engineering') return 'Engineering';
  if (/marketing|growth|seo|sem|content strat|brand/.test(t) || c === 'marketing') return 'Marketing';
  if (/content|writer|editor|copywrite|blog|communi/.test(t) || c === 'content') return 'Content';
  if (/design|ux|ui|creative|graphic/.test(t) || c === 'design') return 'Design';
  if (/\bsale|account exec|business dev|bdm|revenue/.test(t) || c === 'sales') return 'Sales';
  if (/product manag|product own|tpm|program manag/.test(t) || c === 'product') return 'Product';
  if (/data scien|data analy|analytics|bi |data eng|machine learn|ml |ai /.test(t) || c === 'data') return 'Data & AI';
  if (/recrui|talent|people|hr |human res/.test(t)) return 'People';
  if (/financ|account|controller|treasury|fp&a/.test(t)) return 'Finance';
  if (/customer|support|success/.test(t)) return 'Customer Success';
  if (/opera|ops |supply|logistics/.test(t)) return 'Operations';
  if (/legal|counsel|compliance/.test(t)) return 'Legal';
  if (/security|infosec|cyber/.test(t)) return 'Security';
  return 'Other';
}
