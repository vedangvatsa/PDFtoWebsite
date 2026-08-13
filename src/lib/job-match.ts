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
const ROLE_FAMILIES: Record<string, string[]> = {
  frontend:    ['frontend', 'front-end', 'front end', 'react', 'vue', 'angular', 'ui engineer', 'ui developer', 'css', 'next.js', 'nextjs'],
  backend:     ['backend', 'back-end', 'back end', 'server', 'api', 'node', 'python', 'java', 'golang', 'go developer', 'ruby', 'django', 'flask', 'express', 'spring'],
  fullstack:   ['full stack', 'fullstack', 'full-stack'],
  mobile:      ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin'],
  devops:      ['devops', 'sre', 'site reliability', 'infrastructure', 'platform engineer', 'cloud engineer', 'kubernetes', 'docker', 'terraform', 'ci/cd'],
  data:        ['data engineer', 'data scientist', 'data analyst', 'analytics', 'etl', 'data platform', 'business intelligence', 'bi engineer'],
  ml:          ['machine learning', 'ml engineer', 'ai engineer', 'deep learning', 'nlp', 'computer vision', 'llm'],
  security:    ['security', 'cybersecurity', 'infosec', 'penetration', 'appsec'],
  design:      ['designer', 'ux', 'ui/ux', 'product design', 'design system', 'figma'],
  product:     ['product manager', 'program manager', 'product owner', 'product lead', 'tpm'],
  qa:          ['qa', 'quality', 'test engineer', 'sdet', 'automation engineer'],
  embedded:    ['embedded', 'firmware', 'hardware', 'iot', 'fpga'],
};

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
 * Weights:
 * - Skills overlap:     40 points max
 * - Title/role match:   25 points max
 * - Seniority match:    10 points max
 * - Location match:     25 points max
 */
export function computeMatchScore(
  user: MatchUserProfile,
  job: { title: string; tags: string[]; location: string; company: string }
): { score: number; matchedSkills: string[]; signals: string[] } {
  const signals: string[] = [];
  let score = 0;

  // ── 1. Skills overlap (40 pts) ──
  const userSkillsLower = user.skills.map(s => s.toLowerCase());
  const jobTagsLower = (job.tags || []).map(t => t.toLowerCase());
  const jobTitleLower = job.title.toLowerCase();
  // Match against both tags AND job title (bidirectional: skill⊂tag OR tag⊂skill)
  const matchedSkills = user.skills.filter(s => {
    const sl = s.toLowerCase();
    // Split compound skills like "AI & Automation" into parts
    const parts = sl.split(/[\s&,/]+/).filter(p => p.length > 2);
    return jobTagsLower.some(t => t.includes(sl) || sl.includes(t) || parts.some(p => t === p || t.includes(p)))
      || parts.some(p => jobTitleLower.includes(p));
  });
  if (matchedSkills.length > 0) {
    const skillScore = Math.min(40, matchedSkills.length * 10);
    score += skillScore;
    signals.push(`${matchedSkills.length} skill${matchedSkills.length > 1 ? 's' : ''}`);
  }

  // ── 2. Title/role match (30 pts) ──
  // Extract role families from user's most recent job titles
  const userRoleFamilies = new Set<string>();
  for (const exp of (user.experience || []).slice(0, 3)) {
    if (exp.title) {
      for (const f of extractRoleFamilies(exp.title)) {
        userRoleFamilies.add(f);
      }
    }
  }
  // Also extract from user's about/summary
  if (user.about) {
    for (const f of extractRoleFamilies(user.about)) {
      userRoleFamilies.add(f);
    }
  }
  // Also extract from skills (e.g., "React" → frontend)
  const skillText = userSkillsLower.join(' ');
  for (const f of extractRoleFamilies(skillText)) {
    userRoleFamilies.add(f);
  }

  const jobRoleFamilies = new Set(extractRoleFamilies(job.title));
  // Also check job tags for role families
  const tagText = jobTagsLower.join(' ');
  for (const f of extractRoleFamilies(tagText)) {
    jobRoleFamilies.add(f);
  }

  const roleOverlap = [...userRoleFamilies].filter(f => jobRoleFamilies.has(f));
  if (roleOverlap.length > 0) {
    const roleScore = Math.min(25, roleOverlap.length * 12);
    score += roleScore;
    signals.push(`role: ${roleOverlap.join(', ')}`);
  }

  // ── 3. Seniority match (15 pts) ──
  // Get user's seniority from most recent title
  const userTitles = (user.experience || []).slice(0, 2).map(e => e.title || '');
  const userSeniority = userTitles.length > 0 ? Math.max(...userTitles.map(extractSeniority)) : 3;
  const jobSeniority = extractSeniority(job.title);
  const seniorityDiff = Math.abs(userSeniority - jobSeniority);
  if (seniorityDiff === 0) {
    score += 10;
    signals.push('seniority: exact');
  } else if (seniorityDiff === 1) {
    score += 7;
    signals.push('seniority: close');
  } else if (seniorityDiff === 2) {
    score += 3;
  }

  // ── 4. Location match (25 pts) ──
  if (job.location) {
    const jobLoc = normalizeMatchLocation(job.location);

    if (user.location) {
      const userLoc = normalizeMatchLocation(user.location);
      if (userLoc.tokens.some(t => jobLoc.tokens.includes(t))) {
        // City/country overlap — strongest signal
        score += 25;
        signals.push('location: match');
      } else if (jobLoc.isRemote) {
        // Remote jobs are a good match for everyone with a location
        score += 20;
        signals.push('location: remote');
      }
    } else {
      // No user location — boost remote jobs
      if (jobLoc.isRemote) {
        score += 25;
        signals.push('location: remote');
      }
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
