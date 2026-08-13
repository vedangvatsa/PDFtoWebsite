export interface ParsedResume {
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    github?: string;
    linkedin?: string;
  };
  summary: string;
  workExperience: {
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }[];
  skills: { name: string }[];
}

// ─── Regexes ─────────────────────────────────────────────────────────────────

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;

// Phone: handles international formats, parentheses, dots, dashes, continuous digits with country code
const PHONE_RE = /(?:(?:tel:\s*)?\+?\d{1,4}[\s.\-/]?)?\(?\d{2,5}\)?[\s.\-/]?\d{2,5}[\s.\-/]?\d{2,5}(?:[\s.\-/]?\d{1,5})?/;

// URL patterns - broader to catch LinkedIn, GitHub, personal sites.
// Leading lookbehind prevents matching "email.com" inside an email address,
// and the 2+ char domain prefix prevents matching degree abbreviations like
// "B.Tech" or "M.Sc".
const URL_RE = /(?<![\w.+-@])(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com\/in\/[\w-]+|github\.com\/[\w-]+|[\w-]{2,}\.(?:com|org|net|io|dev|me|co|app|xyz|tech|design|page|site|portfolio|bio|ai|in|info|online|link|live|us|uk|de|fr|ca|au|blog|studio)(?:\/[\w./-]*)?)/i;
const STRICT_URL_RE = /https?:\/\/[^\s<>"]+/i;

// Month names (full or abbreviated)
const MONTH = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
// Date token: "Jan 2021" | "01/2021" | "2021" | "Jan. 2021" | "January, 2021"
// Bare 4-digit years are restricted to 19xx/20xx so phone-number runs like
// "173384" are never mistaken for dates and stripped from the text.
const DATE_TOKEN = `(?:${MONTH}[,.\\/\\s]*\\d{4}|\\d{1,2}\\/\\d{2,4}|(?:19|20)\\d{2})`;
const DATE_RE = new RegExp(DATE_TOKEN, 'i');
// Document labels that are never a person's name ("Curriculum Vitae", "Resume", "CV").
const RESUME_LABEL_RE = /^(curriculum\s*vitae|cv|r[eé]sum[eé]|resumes?|professional\s+profile|professional\s+summary|career\s+summary|executive\s+summary|profile|bio(?:data)?|bio|objective|about\s*me|summary|education|experience|skills?)$/i;
// Acronyms / initials-only strings ("H.R.M", "A.K.S") — not full names.
const INITIALS_ONLY_RE = /^([A-Z]\.?)\s*([A-Z]\.?)(\s*([A-Z]\.?))?$/;
// Date range: <date> – <date|present>
const DATE_RANGE_RE = new RegExp(
  `(${DATE_TOKEN})\\s*(?:[-–—]+|\\bto\\b|\\btill\\b|\\buntil\\b)\\s*(${DATE_TOKEN}|[Pp]resent|[Cc]urrent|[Nn]ow|[Oo]ngoing|[Tt]oday)`,
  'i'
);

// Section headers — comprehensive pattern matching
const SECTION_MAP: Array<[string, RegExp]> = [
  ['summary',    /^(summary|profile|objective|about\s*me?|professional\s+summary|career\s+(summary|objective)|executive\s+summary|overview|highlights|personal\s+statement|introduction)/i],
  ['experience', /^(experiences?|work\s+(experience|history)|employment(\s+history)?|professional\s+experience|career\s+history|positions?\s+held|work\s+background|relevant\s+experience|jobs?|internships?|professional\s+background|working\s+experience)/i],
  ['education',  /^(education(al)?(\s+&?\s+training)?|training\s+(&|and)?\s*education|academic\s+(background|history|qualifications?)?|qualifications?|degrees?|schooling|universities|colleges?|academic\s+credentials?)/i],
  ['skills',     /^(skills?(\s+&?\s+expertise)?|technical\s+skills?|core\s+competenc(ies|y)|competencies|technologies|tech\s+stack|tools?(\s+&\s+technologies)?|proficiencies|expertise|programming|languages?(\s+&\s+tools)?|software|technical\s+proficiency|areas?\s+of\s+expertise|key\s+skills?|additional\s+skills?|strengths?)/i],
  ['projects',   /^(projects?|personal\s+projects?|side\s+projects?|open[\s-]source|portfolio|notable\s+projects?|key\s+projects?|academic\s+projects?|technical\s+(hands[\s-]?on\s+)?projects?|hands[\s-]?on\s+projects?)/i],
  ['certifications', /^(certifications?|certificates?|licenses?|accreditations?|credentials?|awards?(\s+&?\s+certifications?)?|achievements?|honors?(\s+&?\s+awards?)?|professional\s+development)/i],
  ['languages',  /^(languages?(\s+spoken)?|language\s+proficiency|spoken\s+languages?|language\s+skills?)/i],
  ['volunteer',  /^(volunteer(ing)?(\s+experience)?|community\s+(service|involvement)|social\s+work|extracurricular(\s+activities)?|leadership(\s+&?\s+activities)?|activities)/i],
  ['publications', /^(publications?|research|papers?|conference\s+presentations?)/i],
  ['references', /^(references?|referees?)/i],
  ['interests',  /^(interests?|hobbies|personal\s+interests?)/i],
];

// Job title keywords - expanded
const JOB_TITLE_RE = /\b(engineer|developer|manager|director|analyst|designer|consultant|architect|lead|senior|junior|intern|associate|specialist|coordinator|officer|president|vp|cto|ceo|cfo|coo|cio|head\s+of|product|software|data|full[\s-]?stack|front[\s-]?end|back[\s-]?end|devops|qa|scrum|agile|marketing|sales|hr|recruiter|accountant|nurse|doctor|teacher|professor|researcher|scientist|administrator|technician|support|advisor|strategist|founder|co[\s-]?founder|partnerships?|partner|executive|assistant|clerk|programmer|operator|supervisor|representative|trainee|apprentice|fellow|postdoc|lecturer|instructor|tutor|correspondent|editor|writer|content|graphic|ui[\s\/]?ux|mobile|cloud|security|network|database|systems?\s+admin|web\s+developer|project\s+manager|program\s+manager|team\s+lead|tech\s+lead|engineering\s+manager)\b/i;

// Degree keywords - expanded
const DEGREE_RE = /\b(bachelor'?s?|b\.?\s*s\.?|b\.?\s*a\.?|b\.?\s*e\.?|b\.?\s*tech\.?|b\.?\s*sc\.?|b\.?\s*com\.?|master'?s?|m\.?\s*s\.?|m\.?\s*a\.?|m\.?\s*e\.?|m\.?\s*tech\.?|m\.?\s*sc\.?|m\.?\s*com\.?|mba|m\.?\s*b\.?\s*a\.?|ph\.?\s*d\.?|phd|doctor(ate)?|diploma|certificate|associate'?s?|llb|ll\.?\s*b\.?|llm|ll\.?\s*m\.?|a\.?\s*s\.?|a\.?\s*a\.?|high\s+school|secondary|undergraduate|postgraduate|honours?|hons\.?|degree|bca|mca|bba|b\.?\s*des\.?|m\.?\s*des\.?|b\.?\s*arch\.?|m\.?\s*arch\.?|b\.?\s*ed\.?|m\.?\s*ed\.?|b\.?\s*pharm\.?|mbbs|md|j\.?\s*d\.?|dba)\b/i;

// Institution keywords - expanded
const INSTITUTION_RE = /\b(university|college|institute|school|academy|polytechnic|iit|nit|iiit|bits|mit|stanford|oxford|cambridge|harvard|yale|princeton|caltech|berkeley|eth|imperial|ucl|nyu|ucla|columbia|cornell|brown|dartmouth|upenn|penn\s+state|georgia\s+tech|carnegie\s+mellon|faculty|department|conservatory|seminary|iisc|isb|xlri|iim|jnu|du|bhu|anna\s+university)\b/i;

// LinkedIn pattern
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i;
const GITHUB_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i;

// ─── PDF Space Reconstruction ────────────────────────────────────────────────
// pdf-parse often loses spaces between words. This function inserts likely
// missing spaces using regex heuristics before the text is sent to Gemini.

// Common abbreviations and tech terms that should NOT be split by camelCase
const NO_SPLIT_CAMELCASE = new Set([
  'JavaScript', 'TypeScript', 'NodeJS', 'ReactJS', 'VueJS', 'NextJS',
  'GitHub', 'GitLab', 'YouTube', 'LinkedIn', 'WhatsApp', 'FaceBook',
  'PowerPoint', 'AccessDB', 'MySpace', 'ChatGPT',
]);

// URL/email protection marker. NOTE: the space-reconstruction rules below run
// AFTER tokenization and can split a token like "__PROT0__" into "__PROT 0__"
// (letter→digit rule). The restore regex must therefore tolerate optional
// whitespace, and we harden the whole function with a final fail-safe pass so
// no raw token can ever leak into the text sent downstream.
const TOKEN_RE = /__PROT\s*(\d+)\s*__/g;

/** Undo common PDF letter↔digit splits that already landed in stored CV text. */
export function healCollapsedTechTokens(text: string): string {
  return String(text || '')
    .replace(/\bEC\s+2\b/gi, 'EC2')
    .replace(/\bS\s+3\b/gi, 'S3')
    .replace(/\bCloud\s+Watch\b/gi, 'CloudWatch')
    .replace(/\bCloud\s+Front\b/gi, 'CloudFront')
    .replace(/\bRoute\s+53\b/gi, 'Route 53');
}

export function reconstructMissingSpaces(text: string): string {
  // Protect known multi-word terms and tech names from being split
  const protections: string[] = [];
  let safe = text;

  // ORDER MATTERS: emails must be protected BEFORE URLs. URL_RE's generic
  // "word.tld" alternative otherwise matches "email.com" inside an email
  // address ("veer.b@email.com" → grabs "email.com"), which steals the slot
  // and leaves the real URL unprotected.
  safe = safe.replace(/[\w.+-]+@[\w-]+\.[a-z]{2,}/gi, (m) => {
    protections.push(m);
    return `__PROT${protections.length - 1}__`;
  });

  // Protect URLs, file paths, and other web references. Emails are already
  // tokens by this point, so the generic "word.tld" alternative below can no
  // longer steal "email.com" out of an email address.
  safe = safe.replace(/(?:https?:\/\/|www\.)\S+/gi, (m) => {
    protections.push(m);
    return `__PROT${protections.length - 1}__`;
  });
  safe = safe.replace(URL_RE, (m) => {
    protections.push(m);
    return `__PROT${protections.length - 1}__`;
  });

  // Protect known camelCase tech terms
  for (const term of NO_SPLIT_CAMELCASE) {
    const re = new RegExp(term, 'gi');
    safe = safe.replace(re, (m) => {
      protections.push(m);
      return `__PROT${protections.length - 1}__`;
    });
  }

  // Protect file extensions and version numbers like ".js", "v2.0", "C++"
  safe = safe.replace(/\b[A-Za-z]\+\+/g, (m) => {
    protections.push(m);
    return `__PROT${protections.length - 1}__`;
  });
  safe = safe.replace(/\.\w{1,4}\b/g, (m) => {
    protections.push(m);
    return `__PROT${protections.length - 1}__`;
  });

  // 1. Insert space at lowercase→uppercase boundary (camelCase)
  //    "indraftingRFPs" → "indrafting RFPs"
  //    But NOT for all-caps sequences like "RFPs" or acronyms
  safe = safe.replace(/([a-z])([A-Z][a-z])/g, '$1 $2');

  // 2. Insert space at lowercase→uppercase acronym boundary
  //    "winningcontractworth" has no camelCase, so also handle all-lowercase runs
  //    "proactive&reactiveselling" → "proactive & reactiveselling"
  safe = safe.replace(/([a-z])&/gi, '$1 & ');
  safe = safe.replace(/&([a-zA-Z])/gi, '& $1');

  // 3. Insert space around + when between word characters
  //    "10+clients" → "10+ clients", "proactive+reactive" → "proactive+ reactive"
  safe = safe.replace(/([a-zA-Z])\+([a-zA-Z])/g, '$1+ $2');
  safe = safe.replace(/(\d)\+([a-zA-Z])/g, '$1+ $2');

  // 4. Insert space at letter↔number boundary for year/phone-sized runs only.
  //    Keep B2B / iOS / C4 / v2 intact; still split "Apr2024" and "Thakur2024".
  safe = safe.replace(/([a-zA-Z])(\$)/g, '$1 $2');
  safe = safe.replace(/(\$)([a-zA-Z])/g, '$1 $2');
  safe = safe.replace(/([a-zA-Z])(\d{3,})/g, '$1 $2');
  safe = safe.replace(/(\d{3,})([a-zA-Z])/g, '$1 $2');

  // 5. Insert space after comma/period/semicolon when directly followed by a letter
  safe = safe.replace(/,([a-zA-Z])/g, ', $1');
  safe = safe.replace(/\.([A-Z][a-z])/g, '. $1');

  // 6. Insert space before bullet character if jammed against preceding word
  safe = safe.replace(/([a-zA-Z])•/g, '$1 •');

  // 7. Insert space after closing paren before a letter
  safe = safe.replace(/\)([a-zA-Z])/g, ') $1');

  // 8. Insert space before opening paren after a letter
  safe = safe.replace(/([a-zA-Z])\(/g, '$1 (');

  // Collapse horizontal whitespace only — NEVER eat newlines.
  // Salvage reflow inserts \n before section headers; collapsing \s+ to a
  // single space destroyed that structure and left every regex fallback empty.
  safe = safe
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Restore protected tokens. The space-insertion rules above can split a
  // token ("__PROT0__" → "__PROT 0__"), so tolerate whitespace around the id.
  safe = safe.replace(TOKEN_RE, (m, i) => {
    const idx = parseInt(i);
    if (idx >= 0 && idx < protections.length) return protections[idx];
    return '';
  });

  // Fail-safe: if any token could not be restored (shouldn't happen), strip
  // the artifact instead of letting raw markers leak into the downstream text.
  if (/__PROT\s*\d+\s*__/.test(safe)) {
    safe = safe.replace(TOKEN_RE, '');
  }

  return safe;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cleanLine(line: string): string {
  return line
    // Remove null bytes and BOM
    .replace(/\u0000|\uFEFF/g, '')
    // Replace non-breaking spaces
    .replace(/\u00a0/g, ' ')
    // Remove zero-width characters
    .replace(/[\u200b-\u200f\u2028\u2029]/g, '')
    // Fix common ligature issues from PDF extraction
    .replace(/ﬁ/g, 'fi')
    .replace(/ﬂ/g, 'fl')
    .replace(/ﬀ/g, 'ff')
    .replace(/ﬃ/g, 'ffi')
    .replace(/ﬄ/g, 'ffl')
    // Normalize dashes
    .replace(/[\u2013\u2014]/g, '–')
    // Normalize quotes
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    // Normalize bullet points
    .replace(/[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25CF\u25CB\u25A0\u25A1\u2605\u2606]/g, '•')
    // Remove image/binary artifacts (common from PDF image extraction)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    // Remove PDF stream markers and binary-looking content
    .replace(/(?:endstream|endobj|stream|obj)\b/gi, '')
    .replace(/\/[A-Z][a-z]+(?:\s+\d+){0,3}/g, '') // PDF operators like /Type 0 0 R
    // Remove coordinate/transform strings (from image positioning)
    .replace(/\b\d+\.\d+\s+\d+\.\d+\s+\d+\.\d+\s+\d+\.\d+\b/g, '')
    .replace(/\b(?:cm|m|l|re|W|n|q|Q|BT|ET|Tf|Td|TJ|Tj)\b/g, '')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

function isGarbageLine(line: string): boolean {
  if (line.length < 2) return true;
  // Lines that are mostly non-alphanumeric (binary/image data)
  const alphaCount = (line.match(/[a-zA-Z]/g) || []).length;
  if (line.length > 5 && alphaCount / line.length < 0.3) return true;
  // Lines with excessive special characters
  if (/^[^a-zA-Z0-9\s]{3,}$/.test(line)) return true;
  // Very short lines that are just numbers or symbols
  if (line.length < 4 && !/[a-zA-Z]/.test(line)) return true;
  // Lines that look like PDF internal references
  if (/^\d+\s+\d+\s+R$/.test(line)) return true;
  if (/^\/[A-Z]/.test(line) && line.length < 30) return true;
  // Encoded image data fragments (base64) — only when the line itself has no
  // spaces. Stripping spaces first falsely flagged normal titles like
  // "Senior Product Manager" / "MBA Stanford University" (20+ letters).
  if (!/\s/.test(line) && /^[A-Za-z0-9+/=]{32,}$/.test(line)) return true;
  return false;
}

function splitIntoLines(text: string): string[] {
  return text
    .split(/\r?\n|\f/)
    .map(cleanLine)
    .filter(l => !isGarbageLine(l));
}

function normalizeHeader(line: string): string {
  return line
    .replace(/^[\d]+[.)]\s*/, '') // Strip numbered headers like "1. " or "2)"
    .replace(/[:\-_•*|#=~\[\]()]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSectionHeader(line: string): string | null {
  // Check original line for ALL CAPS pattern (common in resumes)
  const cleanedLine = line.replace(/[:\-_•*|#=~\[\]()]+/g, '').trim();

  // Lines that are very long can't be section headers
  if (cleanedLine.length > 80 || cleanedLine.length < 3) return null;
  if (cleanedLine.split(/\s+/).length > 8) return null;

  const norm = normalizeHeader(line);
  if (norm.length > 80 || norm.length < 3) return null;
  if (norm.split(/\s+/).length > 8) return null;

  // A line with a date range is almost always a job/education entry, never a
  // header ("Software Engineer - Acme Corp 2020-2024").
  if (DATE_RANGE_RE.test(line)) return null;

  // A header candidate must be the keyword (plus a short rest). If the rest of
  // the line after the matched keyword contains job-title words, it is a job
  // line, not a header (e.g. "Software Engineer at Acme" starts with
  // "software" but is a role, not a skills section).
  const matchKeyword = (re: RegExp, text: string): boolean => {
    if (!re.test(text)) return false;
    const rest = text.replace(re, '').trim();
    if (rest.length > 40) return false;
    if (JOB_TITLE_RE.test(rest)) return false;
    if (DATE_RE.test(rest)) return false;
    return true;
  };

  for (const [key, re] of SECTION_MAP) {
    if (matchKeyword(re, norm)) return key;
  }

  // Also check if the line is ALL CAPS and matches
  if (cleanedLine === cleanedLine.toUpperCase() && cleanedLine.length > 3 && cleanedLine.length < 40) {
    const lower = cleanedLine.toLowerCase();
    for (const [key, re] of SECTION_MAP) {
      if (matchKeyword(re, lower)) return key;
    }
  }

  return null;
}

function extractDateRange(text: string): { startDate: string; endDate?: string } | null {
  const m = text.match(DATE_RANGE_RE);
  if (m) {
    return {
      startDate: m[1].trim(),
      endDate: /present|current|now|ongoing|today/i.test(m[2]) ? 'Present' : m[2].trim(),
    };
  }
  const single = text.match(DATE_RE);
  if (single) return { startDate: single[0].trim() };
  return null;
}

function stripDates(line: string): string {
  return line
    .replace(DATE_RANGE_RE, '')
    .replace(DATE_RE, '')
    // Only trim leftover separators at the ends. Do NOT eat mid-line
    // en/em dashes — those separate title from company / degree from school.
    .replace(/^[-–—|,·•\s]+/, '')
    .replace(/[-–—|,·•\s]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripBullet(line: string): string {
  return line.replace(/^[•\-*▪▸►◆→✓✔‣⁃◦·○●■□▻▷>\s]+/, '').trim();
}

// ─── Contact Info ─────────────────────────────────────────────────────────────

/** Tech / org acronyms that are never a last name when glued after ALL-CAPS given names. */
const TRAILING_NAME_ACRONYM_RE =
  /^(AWS|GCP|IBM|SAP|ERP|CRM|IAM|CEO|CTO|CFO|COO|CIO|CISO|VP|SVP|HR|IT|AI|ML|UX|UI|SDE|SWE|QA|PM)$/i;

function titleCaseNameToken(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

/** "LOKESH TRIVEDI AWS Cloud…" → "Lokesh Trivedi" (stop before AWS / job words). */
function extractLeadingAllCapsName(line: string): string {
  const m = String(line || '').match(/^((?:[A-Z]{2,}(?:[\s.'-]+[A-Z]{2,}){0,4}))/);
  if (!m) return '';
  const words = m[1].trim().split(/\s+/).filter(Boolean);
  const kept: string[] = [];
  for (const w of words) {
    if (TRAILING_NAME_ACRONYM_RE.test(w) && kept.length >= 1) break;
    if (JOB_TITLE_RE.test(w) && kept.length >= 1) break;
    kept.push(w);
  }
  if (kept.length < 2 || kept.length > 5) return '';
  const name = kept.map(titleCaseNameToken).join(' ');
  if (JOB_TITLE_RE.test(name) || DEGREE_RE.test(name) || /\d/.test(name)) return '';
  return name;
}

function expandContactLines(lines: string[]): string[] {
  const result: string[] = [];
  for (const line of lines) {
    // Split on common separators: | · • , (but not commas in location like "City, State")
    if (/[|·•]/.test(line) && line.length < 300) {
      result.push(...line.split(/\s*[|·•]\s*/).map(s => s.trim()).filter(Boolean));
    } else if (/\s{3,}/.test(line) && line.length < 300) {
      // Handle lines with large gaps (common in PDF column merging)
      result.push(...line.split(/\s{3,}/).map(s => s.trim()).filter(Boolean));
    } else {
      result.push(line);
    }
  }
  return result;
}

function extractPersonalInfo(lines: string[]): ParsedResume['personalInfo'] {
  // Search more lines for contact info (some resumes put it further down)
  const searchLines = lines.slice(0, 40);
  const expanded = expandContactLines(searchLines);

  let email = '';
  let phone: string | undefined;
  let website: string | undefined;
  let github: string | undefined;
  let linkedin: string | undefined;
  let location: string | undefined;
  let fullName = '';

  // First pass: find explicitly labeled fields
  for (const line of expanded) {
    const lower = line.toLowerCase();
    
    // Email
    if (!email) {
      const m = line.match(EMAIL_RE);
      if (m) { email = m[0]; }
    }
    
    // LinkedIn
    if (!linkedin) {
      const match = line.match(LINKEDIN_RE);
      if (match) { linkedin = match[0]; continue; }
    }
    
    // GitHub
    if (!github) {
      const match = line.match(GITHUB_RE);
      if (match) { github = match[0]; continue; }
    }
    
    // Website (if not already matched as LinkedIn or GitHub)
    if (!website) {
      const strictUrl = line.match(STRICT_URL_RE);
      if (strictUrl && !EMAIL_RE.test(strictUrl[0])) { website = strictUrl[0]; continue; }
      
      const url = line.match(URL_RE);
      if (url && !EMAIL_RE.test(url[0]) && !LINKEDIN_RE.test(url[0]) && !GITHUB_RE.test(url[0])) { website = url[0]; continue; }
    }
    
    // Phone (explicit IN / E.164 first — the generic PHONE_RE misses some +91- forms)
    if (!phone) {
      const inMobile = line.match(/\+91[\s.-]?\d{10}\b/);
      if (inMobile) {
        phone = inMobile[0];
        continue;
      }
      // Skip lines that are clearly not phone numbers
      if (lower.includes('page') || lower.includes('gpa') || lower.includes('zip') || lower.includes('postal')) continue;
      // Check for labeled phone lines first
      const labeledPhone = line.match(/(?:phone|tel|mobile|cell|contact|ph)[:\s]*([+\d][\d\s.\-()]{6,})/i);
      if (labeledPhone) {
        const candidate = labeledPhone[1].trim();
        const digits = candidate.replace(/\D/g, '');
        if (digits.length >= 7 && digits.length <= 15) {
          phone = candidate;
          continue;
        }
      }
      const m = line.match(PHONE_RE);
      if (m) {
        const candidate = m[0].trim();
        const digits = candidate.replace(/\D/g, '');
        // Must be 7-15 digits, and the line shouldn't be a date
        if (digits.length >= 7 && digits.length <= 15 && !DATE_RE.test(candidate)) {
          phone = candidate;
        }
      }
    }
    
    // Location: "City, STATE" or "City, Country" or labeled
    if (!location) {
      if (/^(?:location|address|city)\s*[:]\s*/i.test(line)) {
        location = line.replace(/^(?:location|address|city)\s*[:]\s*/i, '').trim();
        continue;
      }
      // "City, STATE" or "City, State" or "City, ST ZIP"
      const locMatch = line.match(/^([A-Za-z\s'-]+),\s*([A-Z]{2}(?:\s+\d{5})?|[A-Za-z]+(?:\s[A-Za-z]+)?)$/);
      if (locMatch && line.length < 60 && !EMAIL_RE.test(line) && !URL_RE.test(line) && !PHONE_RE.test(line)) {
        location = line;
        continue;
      }
      // "City, State, Country"
      const locMatch2 = line.match(/^([A-Za-z\s'-]+),\s*([A-Za-z\s]+),\s*([A-Za-z]+)$/);
      if (locMatch2 && line.length < 80 && !EMAIL_RE.test(line)) {
        location = line;
        continue;
      }
      // Trailing "City, State" on a headline/contact line
      if (!location) {
        const tailLoc = line.match(/\b([A-Z][A-Za-z.'-]+),\s*([A-Z][A-Za-z.'-]+)(?:\s*[|·•]|$)/);
        if (
          tailLoc &&
          tailLoc[0].length < 40 &&
          !EMAIL_RE.test(tailLoc[0]) &&
          !/^(aws|linux|cloud|and)\b/i.test(tailLoc[1])
        ) {
          location = `${tailLoc[1]}, ${tailLoc[2]}`;
        }
      }
      // Just "City, State" within a broader line
      if (!location && EMAIL_RE.test(line)) {
        const parts = line.split(/\s*[|·•]\s*/);
        for (const part of parts) {
          const trimmed = part.trim();
          if (/^[A-Za-z\s'-]+,\s*[A-Z]{2}/.test(trimmed) && trimmed.length < 40) {
            location = trimmed;
            break;
          }
        }
      }
    }
  }

  // Find name: first short line that looks like a proper name
  for (const line of lines.slice(0, 15)) {
    if (isSectionHeader(line)) break;
    
    const clean = line
      .replace(/^(dr\.?|mr\.?|ms\.?|mrs\.?|prof\.?|rev\.?)\s+/i, '')
      .replace(/[,|·•].*$/, '') // Remove trailing separators and content
      .trim();

    // Leading ALL-CAPS person name, stopping before tech acronyms / job titles
    // ("LOKESH TRIVEDI AWS Cloud & Linux Administrator …").
    const leadingCaps = extractLeadingAllCapsName(clean);
    if (leadingCaps) {
      fullName = leadingCaps;
      break;
    }
    
    // Candidate 1: whole line is a clean 1-5 word proper name (no contact info)
    if (
      !EMAIL_RE.test(clean) &&
      !URL_RE.test(clean) &&
      !PHONE_RE.test(clean) &&
      /^[A-Za-z'-]+(?:\s+[A-Za-z.'-]+){1,4}$/.test(clean) &&
      clean.length >= 4 &&
      clean.length < 60 &&
      !JOB_TITLE_RE.test(clean) &&
      !DEGREE_RE.test(clean) &&
      !INSTITUTION_RE.test(clean) &&
      !/^\d/.test(clean) &&
      !DATE_RE.test(clean) &&
      !/^(phone|email|address|location|linkedin|github|website|portfolio)/i.test(clean)
      && !RESUME_LABEL_RE.test(clean)
      && !INITIALS_ONLY_RE.test(clean)
    ) {
      // Convert ALL CAPS to Title Case
      fullName = clean === clean.toUpperCase()
        ? clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
        : clean;
      break;
    }
  }

  return { fullName: fullName || '', email, phone, location, website, github, linkedin };
}

// ─── Section Splitter ─────────────────────────────────────────────────────────

function splitSections(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = {
    header: [], summary: [], experience: [], education: [],
    skills: [], projects: [], certifications: [], languages: [],
    volunteer: [], publications: [], references: [], interests: [], other: [],
  };

  let current = 'header';
  let headerDone = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const section = isSectionHeader(line);
    
    if (section) {
      if (section in sections) {
        current = section;
      } else {
        current = 'other';
      }
      headerDone = true;
      continue;
    }
    
    // Before the first section header, decide if lines go to header or summary
    if (!headerDone && current === 'header') {
      // Contact info lines go to header
      if (EMAIL_RE.test(line) || PHONE_RE.test(line) || URL_RE.test(line)) {
        sections.header.push(line);
        continue;
      }
      // Short lines are likely part of header (name, title, location)
      if (line.length < 80 && i < 10) {
        sections.header.push(line);
        continue;
      }
      // Longer text before first section is likely a summary
      if (line.length > 60 && i > 2) {
        current = 'summary';
      }
    }
    
    sections[current].push(line);
  }

  return sections;
}

function hasAnySections(sections: Record<string, string[]>): boolean {
  return sections.experience.length > 0 || sections.education.length > 0 || sections.skills.length > 0;
}

// ─── Work Experience Parser ───────────────────────────────────────────────────

function groupIntoJobBlocks(lines: string[]): string[][] {
  const blocks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const hasDateRange = DATE_RANGE_RE.test(line);
    const hasTitle = JOB_TITLE_RE.test(line) && line.length < 120;
    const currentHasDate = current.some((l) => DATE_RANGE_RE.test(l));
    // Title (+ optional company) awaiting its date line — common after reflow:
    // "UX/UI Designer & Front-End Lead" then "Qscript Software | Apr 2024 – Present"
    const awaitingDateMeta =
      current.length > 0 &&
      current.length <= 2 &&
      !currentHasDate &&
      current.every((l) => l.length < 120 && !/^[•\-*▪●]/.test(l));

    // Start a new block when we see a date range (primary signal) or a clear job title
    if (hasDateRange && current.length > 0) {
      if (awaitingDateMeta) {
        current.push(line);
      } else if (currentHasDate) {
        blocks.push(current);
        current = [line];
      } else {
        // Longer untitled preamble — treat date line as start of a job
        blocks.push(current);
        current = [line];
      }
    } else if (hasTitle && !hasDateRange && current.length > 2) {
      // If we see a title-like line after description lines, start new block
      const prevLinesAreBullets = current.slice(-2).every(l => /^[•\-*]/.test(l) || l.length > 80);
      if (prevLinesAreBullets) {
        blocks.push(current);
        current = [line];
      } else {
        current.push(line);
      }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) blocks.push(current);
  if (blocks.length === 0 && lines.length > 0) return [lines];
  return blocks;
}

function parseJobBlock(block: string[]): ParsedResume['workExperience'][0] | null {
  let title = '';
  let company = '';
  let startDate = '';
  let endDate: string | undefined;
  const descLines: string[] = [];
  let metaLinesDone = false;

  for (let i = 0; i < block.length; i++) {
    const line = block[i];

    // Extract dates
    const dateRange = extractDateRange(line);
    if (dateRange && !startDate) {
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
      const rest = stripDates(line);
      if (rest.length > 2) {
        // Parse "Title at Company", "Title @ Company", "Company – Title"
        const atMatch = rest.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i);
        const sepMatch = rest.match(/^(.+?)\s*[|·•]\s*(.+)$/);
        if (atMatch) {
          if (!title) title = atMatch[1].trim();
          if (!company) company = atMatch[2].trim();
        } else if (sepMatch) {
          // Determine which part is title and which is company
          const part1 = sepMatch[1].trim();
          const part2 = sepMatch[2].trim();
          if (JOB_TITLE_RE.test(part1)) {
            if (!title) title = part1;
            if (!company) company = part2;
          } else {
            if (!company) company = part1;
            if (!title) title = part2;
          }
        } else if (!title) {
          // "Title – Scope — Company" (em/en dash company separator)
          const emParts = rest.split(/\s+[—–]\s+/).map((p) => p.trim()).filter(Boolean);
          if (emParts.length >= 2 && JOB_TITLE_RE.test(emParts[0])) {
            company = emParts[emParts.length - 1];
            title = emParts.slice(0, -1).join(' – ');
          } else {
            title = rest;
          }
        } else if (!company && rest.length > 1 && !/^[•\-*▪●]/.test(rest)) {
          // Title already on previous line; rest of date line is the company
          company = rest;
        }
      }
      continue;
    }

    if (!metaLinesDone) {
      // Handle "Title at Company" pattern
      const atMatch = line.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i);
      if (atMatch && !title) {
        title = atMatch[1].trim();
        company = atMatch[2].trim();
        continue;
      }
      
      // Handle "Title | Company" or "Company | Title" pattern
      const sepMatch = line.match(/^(.+?)\s*[|·•]\s*(.+)$/);
      if (sepMatch && !title) {
        const part1 = sepMatch[1].trim();
        const part2 = sepMatch[2].trim();
        // If part1 looks like a job title
        if (JOB_TITLE_RE.test(part1)) {
          title = part1;
          company = part2;
        } else if (JOB_TITLE_RE.test(part2)) {
          company = part1;
          title = part2;
        } else {
          title = part1;
          company = part2;
        }
        continue;
      }
      
      // Handle "Title, Company" pattern (comma separated on single line)
      const commaMatch = line.match(/^(.+?),\s+(.+)$/);
      if (commaMatch && !title && !DATE_RE.test(line) && line.length < 100) {
        const part1 = commaMatch[1].trim();
        const part2 = commaMatch[2].trim();
        // Only treat as title/company if parts look right
        if (JOB_TITLE_RE.test(part1) && part2.length < 60) {
          title = part1;
          company = part2;
          continue;
        }
      }
      
      if (!title && line.length < 100 && !DATE_RE.test(line) && !/^[•\-*▪●]/.test(line)) {
        title = line;
        continue;
      }
      if (!company && line.length < 100 && !DATE_RE.test(line) && !JOB_TITLE_RE.test(line) && !/^[•\-*▪●]/.test(line)) {
        company = line;
        metaLinesDone = true;
        continue;
      }
      // If we already have title but the next line is a stronger job title
      // and the current title does not look like one, swap (company was first).
      if (title && !company && JOB_TITLE_RE.test(line) && line.length < 100) {
        if (!JOB_TITLE_RE.test(title)) {
          company = title;
          title = line;
          metaLinesDone = true;
          continue;
        }
        company = line;
        metaLinesDone = true;
        continue;
      }
    }

    const stripped = stripBullet(line);
    if (stripped.length > 3) descLines.push(stripped);
  }

  if (!title && !company) return null;

  return {
    title: title || 'Position',
    company: company || '',
    location: '',
    startDate,
    endDate,
    description: descLines.join('\n'),
  };
}

function parseWorkExperience(lines: string[]): ParsedResume['workExperience'] {
  if (lines.length === 0) return [];
  const jobs = groupIntoJobBlocks(lines)
    .map(parseJobBlock)
    .filter((j): j is ParsedResume['workExperience'][0] => j !== null);

  // Forward-fill company for promotion blocks: if a block has the default
  // placeholder 'Company' but the previous block has a real company name,
  // inherit it (handles "multiple roles under one company heading" CVs)
  for (let i = 1; i < jobs.length; i++) {
    if (jobs[i].company === 'Company' && jobs[i - 1].company !== 'Company') {
      jobs[i].company = jobs[i - 1].company;
    }
  }

  return jobs;
}

// ─── Education Parser ─────────────────────────────────────────────────────────

function parseEducation(lines: string[]): ParsedResume['education'] {
  const entries: ParsedResume['education'] = [];
  if (lines.length === 0) return entries;

  const blocks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    // Start new block on institution/degree keywords or date ranges
    if ((INSTITUTION_RE.test(line) || DEGREE_RE.test(line)) && current.length > 0) {
      blocks.push(current);
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) blocks.push(current);
  if (blocks.length === 0 && lines.length > 0) blocks.push(lines);

  for (const block of blocks) {
    if (block.length === 0) continue;

    let institution = '';
    let degree = '';
    let startDate = '';
    let endDate: string | undefined;

    for (const rawLine of block) {
      const line = stripBullet(rawLine);
      // Extract dates
      const dateRange = extractDateRange(line);
      if (dateRange && !startDate) {
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
        const rest = stripDates(line).replace(/\(\s*\)/g, '').replace(/\s{2,}/g, ' ').trim();
        if (rest.length > 2) {
          const emParts = rest.split(/\s+[—–-]\s+/);
          if (emParts.length >= 2 && (DEGREE_RE.test(emParts[0]) || INSTITUTION_RE.test(emParts[1]))) {
            if (DEGREE_RE.test(emParts[0]) && !degree) degree = emParts[0].trim();
            const inst = emParts.slice(1).join(' — ').trim();
            if (!institution && inst.length > 3 && !/^&/.test(inst)) institution = inst;
          } else if (DEGREE_RE.test(rest) && !degree) degree = rest;
          else if (INSTITUTION_RE.test(rest) && !institution) institution = rest;
          else if (!institution && rest.length < 120) institution = rest;
        }
        continue;
      }
      
      // Handle "Institution – Degree" or "Degree | Institution" patterns
      const sepMatch = line.match(/^(.+?)\s*[|–—-]\s*(.+)$/);
      if (sepMatch && (!institution || !degree)) {
        const part1 = sepMatch[1].trim();
        const part2 = sepMatch[2].trim();
        if (INSTITUTION_RE.test(part1)) {
          if (!institution) institution = part1;
          if (!degree) degree = part2;
        } else if (DEGREE_RE.test(part1)) {
          if (!degree) degree = part1;
          if (!institution) institution = part2;
        } else if (INSTITUTION_RE.test(part2)) {
          if (!institution) institution = part2;
          if (!degree) degree = part1;
        }
        continue;
      }
      
      if (DEGREE_RE.test(line) && !degree) {
        // "MBA Stanford University" / "B.Tech Computer Science IIT Delhi"
        if (INSTITUTION_RE.test(line) && !institution) {
          const degreeMatch = line.match(DEGREE_RE);
          if (degreeMatch) {
            const idx = line.toLowerCase().indexOf(degreeMatch[0].toLowerCase());
            const after = line.slice(idx + degreeMatch[0].length).trim();
            const before = line.slice(0, idx).trim();
            degree = degreeMatch[0].replace(/\b\w/g, (c) => c.toUpperCase());
            if (/^in\s+/i.test(after)) {
              // "Bachelor of Science in Computer Science, MIT" — keep fuller degree string
              degree = line;
            } else if (INSTITUTION_RE.test(after)) {
              degree = before ? `${before} ${degreeMatch[0]}`.trim() : degreeMatch[0];
              institution = after;
            } else if (INSTITUTION_RE.test(before)) {
              institution = before;
              degree = after ? `${degreeMatch[0]} ${after}`.trim() : degreeMatch[0];
            } else {
              degree = line;
            }
          } else {
            degree = line;
          }
        } else {
          degree = line;
        }
        continue;
      }
      if (INSTITUTION_RE.test(line) && !institution) { institution = line; continue; }
      if (!institution && line.length < 120 && !DATE_RE.test(line)) { institution = line; continue; }
      if (!degree && line.length < 120 && !DATE_RE.test(line)) { degree = line; continue; }
    }

    if (/^[&\d\s./-]+$/.test(institution) || institution.length < 3) institution = '';
    if (!institution && degree) {
      const board = degree.match(/\(([^)]{3,40})\)/);
      if (board) institution = board[1].trim();
    }
    if (institution || degree) {
      entries.push({
        institution: institution || degree || 'Institution',
        degree: degree || institution || 'Degree',
        startDate,
        endDate,
      });
    }
  }

  return entries;
}

// ─── Skills Parser ────────────────────────────────────────────────────────────

function parseSkills(lines: string[]): ParsedResume['skills'] {
  const seen = new Set<string>();
  const skills: ParsedResume['skills'] = [];

  const addSkill = (s: string) => {
    let clean = healCollapsedTechTokens(s)
      .trim()
      .replace(/^[•\-*▪▸►◆→]+\s*/, '')
      .replace(/\s*\([^)]*\)\s*/g, ' ')
      .replace(/[()]+$/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (clean.length < 2 || clean.length > 60) return;
    if (/^\d+$/.test(clean)) return;
    if (clean.split(/\s+/).length > 6) return;
    // Skip obvious non-skills / leaked section words
    if (
      /^(and|or|the|etc|years?|months?|experience|proficient|expert|beginner|intermediate|advanced|professional|technical|hands-?on|projects?|education|training|summary|tools?)$/i.test(
        clean
      )
    ) {
      return;
    }
    if (/\.$/.test(clean) || /^and\s/i.test(clean)) return;
    const key = clean.toLowerCase();
    if (!seen.has(key)) { seen.add(key); skills.push({ name: clean }); }
  };

  for (const line of lines) {
    // Handle "Category: Skill1, Skill2 — extra prose" format
    const colonMatch = line.match(/^[^:]{1,50}:\s*(.+)$/);
    let content = colonMatch ? colonMatch[1] : line;
    // Tools after an em/en dash are usually duties, not skill names
    content = content.split(/\s+[—–]\s+/)[0];
    // Drop parenthetical level notes before splitting so "Bash (basic) (automation, cron)"
    // does not become the token "Bash (automation"
    content = content.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();

    if (/[,|;•\/]/.test(content)) {
      content.split(/[,|;•\/]+/).forEach(addSkill);
    } else {
      addSkill(content);
    }
  }

  return skills;
}

// ─── Summary ──────────────────────────────────────────────────────────────────

function extractSummary(lines: string[], workExp: ParsedResume['workExperience']): string {
  if (lines.length > 0) {
    let summary = lines.join(' ').trim();
    // Orphaned next-section word glued by a bad reflow ("…support. TECHNICAL")
    summary = summary.replace(
      /\s+\b(TECHNICAL|PROFESSIONAL|EDUCATION|TRAINING|SKILLS?|EXPERIENCES?|PROJECTS?|STRENGTHS|CERTIFICATIONS?)\s*$/i,
      ''
    ).trim();
    // If summary is too short (just a fragment), return empty
    if (summary.length < 10) return '';
    return summary;
  }
  if (workExp.length > 0) {
    const latest = workExp[0];
    const company = latest.company && !/^company$/i.test(latest.company) ? latest.company : '';
    const title = latest.title && !/^position$/i.test(latest.title) ? latest.title : '';
    const role = [title, company].filter(Boolean).join(' at ');
    return role ? `${role}.` : '';
  }
  return '';
}

// ─── Fallback: no section headers detected ────────────────────────────────────

function fallbackParse(lines: string[]): Pick<ParsedResume, 'workExperience' | 'education' | 'skills' | 'summary'> {
  const workExperience: ParsedResume['workExperience'] = [];
  const education: ParsedResume['education'] = [];
  const skills: ParsedResume['skills'] = [];
  const summaryLines: string[] = [];
  const processedIndices = new Set<number>();

  // First pass: find all date ranges and build experience/education entries
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (DATE_RANGE_RE.test(line)) {
      const dr = extractDateRange(line)!;
      const prevLine = i > 0 ? lines[i - 1] : '';
      const descLines: string[] = [];

      // Collect description lines after the date
      for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
        if (DATE_RANGE_RE.test(lines[j])) break;
        if (isSectionHeader(lines[j])) break;
        if (lines[j].length > 3) {
          descLines.push(stripBullet(lines[j]));
          processedIndices.add(j);
        }
      }
      processedIndices.add(i);
      if (i > 0) processedIndices.add(i - 1);

      if (DEGREE_RE.test(prevLine) || INSTITUTION_RE.test(prevLine) || DEGREE_RE.test(line) || INSTITUTION_RE.test(line)) {
        const rest = stripDates(line);
        // PDF extraction can merge the ENTIRE resume into a single line. Guard
        // against storing a giant blob as the institution/degree name.
        const restIsGiant = rest.length > 160;
        const instLine = restIsGiant ? rest.slice(0, 120) : rest;
        const degLine = restIsGiant ? '' : rest;
        education.push({
          institution: INSTITUTION_RE.test(prevLine) ? prevLine : instLine || prevLine || 'Institution',
          degree: DEGREE_RE.test(prevLine) ? prevLine : DEGREE_RE.test(line) ? degLine : prevLine || 'Degree',
          startDate: dr.startDate,
          endDate: dr.endDate,
          description: restIsGiant ? rest : undefined,
        });
      } else {
        const rest = stripDates(line);
        const restIsGiant = rest.length > 300;
        workExperience.push({
          title: JOB_TITLE_RE.test(prevLine) ? prevLine : restIsGiant ? 'Position' : rest || prevLine || 'Position',
          company: restIsGiant ? 'Company' : rest || 'Company',
          startDate: dr.startDate,
          endDate: dr.endDate,
          description: restIsGiant ? rest : descLines.join('\n'),
        });
      }
    }
  }
  
  // Second pass: find skill-like lines and summary paragraphs
  for (let i = 0; i < lines.length; i++) {
    if (processedIndices.has(i)) continue;
    const line = lines[i];
    
    // Comma-separated skill lines
    if (/,/.test(line) && line.split(',').length >= 3 && line.length < 200) {
      const parts = line.split(',').map(s => s.trim()).filter(s => s.length > 1 && s.length < 50);
      if (parts.every(p => p.split(' ').length <= 4)) {
        parts.forEach(name => {
          const key = name.toLowerCase();
          if (![...skills].some(s => s.name.toLowerCase() === key)) {
            skills.push({ name });
          }
        });
        continue;
      }
    }
    
    // Long paragraph-like text early in the resume could be a summary
    if (i < 15 && line.length > 80 && !DATE_RE.test(line) && !EMAIL_RE.test(line)) {
      summaryLines.push(line);
    }
  }

  return { workExperience, education, skills, summary: summaryLines.join(' ').trim() };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function parseResumeText(text: string): ParsedResume {
  const lines = splitIntoLines(text);
  const sections = splitSections(lines);
  const personalInfo = extractPersonalInfo(lines);

  let workExperience: ParsedResume['workExperience'];
  let education: ParsedResume['education'];
  let skills: ParsedResume['skills'];
  let summary: string;

  if (hasAnySections(sections)) {
    workExperience = parseWorkExperience(sections.experience);
    education = parseEducation(sections.education);
    skills = parseSkills([
      ...sections.skills,
      ...sections.languages,
      ...sections.certifications,
    ]);
    summary = extractSummary(sections.summary, workExperience);
  } else {
    const fb = fallbackParse(lines);
    workExperience = fb.workExperience;
    education = fb.education;
    skills = fb.skills;
    summary = fb.summary;
  }

  // Also try to extract skills from projects section
  if (sections.projects?.length > 0) {
    const projectSkills: string[] = [];
    for (const line of sections.projects) {
      const techMatch = line.match(/(?:technologies?|tech\s+stack|built\s+with|using|tools?)\s*:?\s*(.+)/i);
      if (techMatch) {
        techMatch[1].split(/[,|;]+/).forEach(s => {
          const clean = s.trim();
          if (clean.length > 1 && clean.length < 50 && !skills.some(sk => sk.name.toLowerCase() === clean.toLowerCase())) {
            skills.push({ name: clean });
          }
        });
      }
    }
  }

  return { personalInfo, summary, workExperience, education, skills };
}

/** API / editor shape used by `/api/parse-resume` (matches AI schema + parse-guard). */
export type StructuredResumeParse = {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    github: string;
    linkedin: string;
    additionalLinks: { label: string; url: string }[];
  };
  summary: string;
  workExperience: {
    company: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  skills: string[];
  customSections: {
    sectionTitle: string;
    items: { title: string; subtitle: string; description: string; date: string }[];
  }[];
};

/** Rough richness score so we can prefer regex over an empty AI shell. */
export function resumeParseContentScore(data: {
  personalInfo?: { fullName?: string; email?: string } | null;
  summary?: string | null;
  workExperience?: unknown[] | null;
  education?: unknown[] | null;
  skills?: unknown[] | null;
  customSections?: unknown[] | null;
} | null | undefined): number {
  if (!data) return 0;
  const name = String(data.personalInfo?.fullName || '').trim();
  const email = String(data.personalInfo?.email || '').trim();
  const realName =
    name &&
    !/^(your name|unknown|curriculum vitae|cv|resume|r[eé]sum[eé])$/i.test(name);
  // Never let editor-only salvage dumps inflate the score — otherwise a
  // wall-of-text import beats a thin-but-real AI structure.
  const publicCustom = (Array.isArray(data.customSections) ? data.customSections : []).filter(
    (cs: unknown) => {
      const title = String((cs as { sectionTitle?: string })?.sectionTitle || '');
      return !/imported\s+cv\s+text|raw\s+cv\s+text|parse\s+salvage|unparsed\s+cv/i.test(title);
    }
  );
  const summary = String(data.summary || '').trim();
  // Dump summaries don't count as content
  const summaryScore =
    summary.length >= 40 &&
    !/\b(Education|Experiences?|Skills?)\b/.test(summary) &&
    !(summary.length > 400 && /@/.test(summary) && /\d{8,}/.test(summary))
      ? 3
      : 0;
  return (
    (Array.isArray(data.workExperience) ? data.workExperience.length : 0) * 10 +
    (Array.isArray(data.education) ? data.education.length : 0) * 5 +
    (Array.isArray(data.skills) ? data.skills.length : 0) +
    publicCustom.length * 2 +
    summaryScore +
    (realName ? 3 : 0) +
    (email ? 2 : 0)
  );
}

/**
 * Insert line breaks into space-collapsed PDF/OCR dumps so section headers and
 * bullets become parseable (e.g. "…Behance Experiences UX/UI Designer…").
 */
/** Full section labels only — never bare "Project" (that splits "Project Manager"). */
const REFLOW_SECTION_HEADERS = [
  'PROFESSIONAL SUMMARY',
  'EXECUTIVE SUMMARY',
  'CAREER SUMMARY',
  'PROFESSIONAL EXPERIENCE',
  'WORK EXPERIENCE',
  'EMPLOYMENT HISTORY',
  'TECHNICAL HANDS-ON PROJECTS',
  'TECHNICAL HANDS ON PROJECTS',
  'HANDS-ON PROJECTS',
  'HANDS ON PROJECTS',
  'KEY PROJECTS',
  'PERSONAL PROJECTS',
  'TECHNICAL SKILLS',
  'CORE SKILLS',
  'CORE COMPETENCIES',
  'TRAINING & EDUCATION',
  'TRAINING AND EDUCATION',
  'EDUCATION & TRAINING',
  'EDUCATION AND TRAINING',
  'WORK HISTORY',
  'CERTIFICATIONS',
  'ACHIEVEMENTS',
  'PUBLICATIONS',
  'LANGUAGES',
  'STRENGTHS',
  'INTERESTS',
  'AWARDS',
  'SUMMARY',
  'EXPERIENCE',
  'EXPERIENCES',
  'EDUCATION',
  'PROJECTS',
  'SKILLS',
].sort((a, b) => b.length - a.length);

export function reflowCollapsedResumeText(text: string): string {
  let t = healCollapsedTechTokens(String(text || '').replace(/\r\n/g, '\n').trim());
  if (!t) return t;
  // Already has structure
  if ((t.match(/\n/g) || []).length >= 5) return t;

  // ALL-CAPS name at start → own line. Stop before AWS / Title Case job words.
  t = t.replace(
    /^((?:[A-Z]{2,}(?:\s+[A-Z]{2,}){0,3}))\s+(?=(?:AWS|GCP|IBM)\b|(?:[A-Z][a-z]|UI\/|UX\/|Senior|Junior|Lead|Head|Manager|Director|Engineer|Developer|Designer|Vice|Chief|President))/g,
    '$1\n'
  );

  t = t.replace(/\s*[•▪●]\s*/g, '\n• ');
  // Longest header first so "PROFESSIONAL EXPERIENCE" is not split into EXPERIENCE.
  const headerUnion = REFLOW_SECTION_HEADERS.map((h) =>
    h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
  ).join('|');
  t = t.replace(new RegExp(`\\b(${headerUnion})\\b`, 'gi'), (full, hit: string) => {
    const words = hit.trim().split(/\s+/);
    const isAllCaps = hit === hit.toUpperCase() && /[A-Z]/.test(hit);
    const isTitleCase = words.every((w) => /^[A-Z][\w&/-]*$/.test(w));
    // Single-word headers ("PROJECTS", "EXPERIENCE") only when ALL CAPS —
    // otherwise "Infrastructure Projects" / "operations experience" split.
    if (words.length === 1 && !isAllCaps) return full;
    if (!isAllCaps && !isTitleCase) return full;
    return `\n${hit.trim()}\n`;
  });
  // Numbered project headings jammed after a period ("…journalctl. Project 2:")
  t = t.replace(/\s+(Project\s+\d+\s*:)/gi, '\n$1 ');
  // "Job Title Company Name | Mon YYYY" → split title / company using last Capitalized tokens
  t = t.replace(
    /([^\n|]+?)\s*\|\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}(?:\s*[–—\-]\s*(?:Present|Current|Now|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}))?)/gi,
    (full, left, date) => {
      const parts = String(left).trim().split(/\s+/).filter(Boolean);
      if (parts.length < 3) return full;
      const last = parts[parts.length - 1];
      const prev = parts[parts.length - 2];
      // Never treat role words as the company
      if (/^(Lead|Senior|Junior|Engineer|Developer|Designer|Manager|Intern|Head|Chief|Officer|Associate|Analyst|Consultant)$/i.test(last)) {
        return full;
      }
      let companyLen = 1;
      if (
        parts.length >= 4 &&
        /^[A-Z]/.test(prev) &&
        /^[A-Z]/.test(last) &&
        !/^(Lead|Senior|Junior|Front-End|Back-End|Full-Stack|&)$/i.test(prev)
      ) {
        companyLen = 2;
      }
      const company = parts.slice(-companyLen).join(' ');
      const title = parts.slice(0, -companyLen).join(' ');
      if (title.length < 5) return full;
      return `${title}\n${company} | ${date}`;
    }
  );
  // Prose jammed after a date range ("…Present Led roadmap for B2B…")
  t = t.replace(
    /((?:Present|Current|Now|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4}))\s+(?=[A-Z][a-z]{2,}(?:\s|$))/g,
    '$1\n'
  );
  return t
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * Best-effort non-AI salvage: structured regex parse, and when that is thin,
 * keep the raw CV text in a custom section so the user never loses content.
 * That section is editor-only (see isEditorOnlyCustomSection) — never shown publicly.
 */
function parseProjectItems(
  lines: string[]
): { title: string; subtitle: string; description: string; date: string }[] {
  const items: { title: string; subtitle: string; description: string; date: string }[] = [];
  let cur: { title: string; subtitle: string; description: string; date: string } | null = null;
  const push = () => {
    if (cur && (cur.title || cur.description)) items.push(cur);
    cur = null;
  };
  for (const line of lines) {
    const m = line.match(/^Project\s+(\d+)\s*[:\-–—.]?\s*(.*)$/i);
    if (m) {
      push();
      let heading = (m[2] || `Project ${m[1]}`).trim();
      let tools = '';
      const toolSplit = heading.match(/^(.*?)\s+Tools?\s*:\s*(.+)$/i);
      if (toolSplit) {
        heading = toolSplit[1].trim();
        tools = toolSplit[2].trim();
      }
      cur = {
        title: heading || `Project ${m[1]}`,
        subtitle: tools,
        description: '',
        date: '',
      };
      continue;
    }
    if (!cur) {
      if (line.length > 8 && line.length < 160 && !/^[•\-*]/.test(line)) {
        cur = { title: stripBullet(line), subtitle: '', description: '', date: '' };
      }
      continue;
    }
    if (/^tools?\s*:/i.test(line)) {
      cur.subtitle = line.replace(/^tools?\s*:\s*/i, '').trim();
      continue;
    }
    const bit = stripBullet(line);
    if (bit) cur.description = [cur.description, bit].filter(Boolean).join('\n');
  }
  push();
  return items;
}

export function salvageResumeFromText(text: string): StructuredResumeParse {
  // Reconstruct spaces first (preserving newlines), then reflow collapsed
  // one-liners into section/bullet lines, THEN parse — never reverse that order.
  const spaced = reconstructMissingSpaces(healCollapsedTechTokens(String(text || ''))).trim();
  const cleaned = reflowCollapsedResumeText(spaced);
  // Call the line parser on already-reflowed text so newlines survive
  // (avoid a second reconstructMissingSpaces pass).
  const parsed = parseResumeText(cleaned);
  const data: StructuredResumeParse = {
    personalInfo: {
      fullName: parsed.personalInfo?.fullName || '',
      email: parsed.personalInfo?.email || '',
      phone: parsed.personalInfo?.phone || '',
      location: parsed.personalInfo?.location || '',
      website: parsed.personalInfo?.website || '',
      github: parsed.personalInfo?.github || '',
      linkedin: parsed.personalInfo?.linkedin || '',
      additionalLinks: [],
    },
    summary: parsed.summary || '',
    workExperience: (parsed.workExperience || []).map((w) => ({
      company: w.company || '',
      title: w.title || '',
      location: w.location || '',
      startDate: w.startDate || '',
      endDate: w.endDate || '',
      description: w.description || '',
    })),
    education: (parsed.education || []).map((e) => ({
      institution: e.institution || '',
      degree: e.degree || '',
      fieldOfStudy: '',
      startDate: e.startDate || '',
      endDate: e.endDate || '',
      description: e.description || '',
    })),
    skills: (parsed.skills || [])
      .map((s) => (typeof s === 'string' ? s : s?.name || ''))
      .map((s) => String(s).trim())
      .filter(Boolean),
    customSections: [],
  };

  const sections = splitSections(splitIntoLines(cleaned));
  const projectItems = parseProjectItems(sections.projects || []);
  if (projectItems.length) {
    data.customSections.push({
      sectionTitle: 'Projects',
      items: projectItems,
    });
  }

  const score = resumeParseContentScore(data);

  if (cleaned.length < 80) return data;

  // Always keep the full uploaded text in an editor-only section so nothing is lost,
  // even when structured fields look complete.
  const alreadyHasImport = (data.customSections || []).some(
    (cs) => /imported cv text|raw cv text|parse salvage/i.test(String(cs.sectionTitle || ''))
  );
  if (!alreadyHasImport) {
    // Prefer a short headline line for summary when empty — never paste the whole CV into about
    if (!String(data.summary || '').trim() && score < 15) {
      const headline = cleaned
        .split(/\n+/)
        .map((l) => l.trim())
        .find(
          (l) =>
            l.length >= 8 &&
            l.length <= 120 &&
            !/^(phone|email|linkedin|experiences?|education|skills|summary)/i.test(l) &&
            !l.includes('•') &&
            !/@/.test(l) &&
            !/\d{8,}/.test(l)
        );
      if (headline) {
        data.summary = headline.replace(
          /^(?:(?:professional|career|executive|personal)\s+)?(?:summary|profile|objective|overview|statement)\s*[:\-–—.]?\s*/i,
          ''
        );
      }
    }
    data.customSections = [
      ...(data.customSections || []),
      {
        sectionTitle: 'Imported CV text',
        items: [
          {
            title: 'Review and move into the right sections',
            subtitle: '',
            description: cleaned,
            date: '',
          },
        ],
      },
    ];
  }

  return data;
}
