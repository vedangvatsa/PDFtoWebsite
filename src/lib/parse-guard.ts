// parse-guard.ts
// Defense layer that runs on EVERY parse result before it can reach the DB.
//  - deterministic repair of common AI mistakes
//  - critical-failure detection so garbage is re-parsed / rejected
//    instead of being persisted (education dumps, contact-as-name, etc.)

export interface ParseValidation {
  issues: string[];
  critical: boolean;
}

const DOC_LABEL_RE =
  /^(curriculum vitae|cv|resume|r[eé]sum[eé]|profile|bio|portfolio|applicant|my profile|my resume|candidate)$/i;

// Phone/desktop screenshot default names (iOS "Screenshot 2026 08 04 …", Android "IMG_2026…")
const SCREENSHOT_NAME_RE =
  /^(screenshot|screen\s*shot|screen\s*recording|img[-_\s]?\d|image[-_\s]?\d|photo[-_\s]?\d|dsc[-_\s]?\d|dcim|whatsapp\s*image|signal[-_\s]?image|simulator\s*screen)/i;

// Do NOT use the /g flag on patterns used with .test() — lastIndex causes flaky misses.
// Avoid bare "Education"/"Experience" — they match "Secondary Education" / school names.
const SECTION_MARKER_RE =
  /PROFESSIONAL SUMMARY|CAREER SUMMARY|TECHNICAL SKILLS|CORE SKILLS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT HISTORY|KEY PROJECTS|\bPROJECTS\b|CERTIFICATIONS|CERTIFICATES|\bACHIEVEMENTS\b|\bAWARDS\b|\bHONORS\b|ABOUT ME|__PROT\s*\d+\s*__/i;
// Multi-section dump: several distinct resume sections glued into one field
const MULTI_SECTION_DUMP_RE =
  /\b(Technical Skills|Work Experience|Professional Experience|Key Projects|Certifications|Achievements|Internship|Projects)\b/gi;

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_RE = /(?:\+\d{1,3}[\s-]?)?(?:\d[\s.-]?){8,15}\d/;
const URL_IN_FIELD_RE = /(?:https?:\/\/|www\.|linkedin\.com|github\.com)/i;
const CONTACT_STRIP_RE =
  /(?:\b(?:\+\d{1,3}[\s-]?)?\d{3,5}[\s.-]?\d{3}[\s.-]?\d{3,5}\b)|(?:\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b)/gi;

const PLACEHOLDER_DATE_RE =
  /still ongoing|ongoing|currently|till now|till date|to date|in progress|present\b/i;

// Trailing location tokens wrongly glued to names ("Yash Kathait New Delhi")
const TRAILING_LOCATION_RE =
  /\s+(?:New\s+Delhi|Delhi|Noida|Gurgaon|Gurugram|Mumbai|Bombay|Bengaluru|Bangalore|Hyderabad|Chennai|Pune|Kolkata|Calcutta|Ahmedabad|Jaipur|Chandigarh|Lucknow|Indore|Bhopal|Patna|Remote|India|USA|UK|UAE|Canada|Australia|Singapore|London|San\s+Francisco|New\s+York|NYC|California|Texas|Ontario|Toronto|Dubai)$/i;

const MULTI_LOCATION_TAIL_RE =
  /\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:,\s*(?:India|USA|UK|UAE|Canada|Australia|Singapore))?$/;

export function normalizeName(raw: string): string {
  let name = (raw || '').replace(/\s+/g, ' ').trim();
  if (!name) return '';
  // Contact / URL as name is never valid
  if (EMAIL_RE.test(name) || URL_IN_FIELD_RE.test(name) || PHONE_RE.test(name)) return '';
  // Strip leading document labels ("Resume: John Doe" -> "John Doe")
  name = name.replace(/^(curriculum vitae|cv|resume|r[eé]sum[eé]|profile|bio)\s*[:.-]\s*/i, '').trim();
  name = name.replace(/^[•\-\*▪▸►‣○●"“”']+\s*/, '').trim();
  // Split on first comma/newline and keep only the name part
  name = name.split(/[,/|·•]/)[0].trim();
  // Strip trailing locations ("Yash Kathait New Delhi" → "Yash Kathait")
  name = name.replace(TRAILING_LOCATION_RE, '').trim();
  // If still 4+ tokens and ends with Capitalized City-like word, drop last token once
  const tokens = name.split(/\s+/);
  if (tokens.length >= 3) {
    const last = tokens[tokens.length - 1];
    // Drop a trailing single capitalized word that isn't a common name particle
    if (
      /^[A-Z][a-z]{2,}$/.test(last) &&
      !/^(Jr|Sr|II|III|IV|PhD|MD)$/i.test(last) &&
      tokens.length >= 4
    ) {
      // "First Middle Last City" — only strip if last looks location-ish (short list already handled)
    }
  }
  // Title Case only when the name is ALL-CAPS or ALL-lowercase
  const isAllCaps = name === name.toUpperCase() && /[A-Z]/.test(name);
  const isAllLower = name === name.toLowerCase() && /[a-z]/.test(name);
  if (isAllCaps || isAllLower) {
    name = name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
  // Guard against all-uppercase acronym labels like "H.R.M"
  if (/^[A-Z](\.[A-Z])+\.?$/.test(name)) return '';
  if (name.length < 2) return '';
  if (DOC_LABEL_RE.test(name)) return '';
  // Device screenshot / camera roll filenames are never a person's name
  if (SCREENSHOT_NAME_RE.test(name)) return '';
  // "Screenshot 2026 08" style: screenshot + mostly digits
  if (/\bscreenshot\b/i.test(name) || (/\b20\d{2}\b/.test(name) && /\d{1,2}/.test(name) && name.split(/\s+/).length <= 5 && !/[a-z]{3,}/i.test(name.replace(/\b20\d{2}\b|\d+/g, '')))) {
    return '';
  }
  // Pure date-like or "Screenshot YYYY MM DD" residual after partial strip
  if (/^[\d\s.\-_]+$/.test(name)) return '';
  // Names shouldn't be longer than ~5 tokens (contact lines sneak in)
  if (name.split(/\s+/).length > 5) {
    name = name.split(/\s+/).slice(0, 3).join(' ');
  }
  return name.replace(/\s{2,}/g, ' ').trim();
}

export function cleanLocation(raw: string): string {
  let loc = (raw || '').replace(/\s+/g, ' ').trim();
  if (!loc) return '';
  // Contact blocks are not locations
  if (EMAIL_RE.test(loc) || URL_IN_FIELD_RE.test(loc)) {
    // Try to keep a trailing "City, Country" fragment if present
    const m = loc.match(/([A-Za-z][A-Za-z\s]+,\s*[A-Za-z][A-Za-z\s]+)\s*$/);
    loc = m ? m[1].trim() : '';
    if (!loc) return '';
  }
  loc = loc.replace(/\s*,\s*/g, ', ');
  loc = loc.replace(/\s+-\s+/g, ' - ').replace(/\s*\/\s*/g, ' / ').trim();
  loc = loc
    .split(',')
    .map((s) => {
      s = s.trim();
      return s ? s[0].toUpperCase() + s.slice(1) : s;
    })
    .join(', ');
  return loc;
}

export function cleanDate(raw: string): string {
  if (raw === null || raw === undefined) return '';
  const v = String(raw).trim();
  if (!v) return '';
  if (PLACEHOLDER_DATE_RE.test(v)) return 'Present';
  return v;
}

export function cleanDescription(raw: string, maxLen: number): string {
  if (!raw) return '';
  let text = String(raw).replace(/\s+/g, ' ').trim();
  text = text.replace(/^["“”'`\s]+|["“”'`\s]+$/g, '').trim();
  text = text.replace(/^[•\-\*▪▸►‣○●]\s*/, '').trim();
  if (text.length > maxLen) {
    const cut = text.slice(0, maxLen);
    const last = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('.'));
    text = (last > maxLen * 0.5 ? cut.slice(0, last + 1) : cut).trim();
  }
  return text;
}

/**
 * Format job bullets + project sub-headers so mashed project blocks become readable.
 * e.g. "...teams. Outbound-Inbound Caller • Built..." → newlines before project title.
 */
export function formatJobDescription(raw: string, maxLen = 2000): string {
  let text = String(raw || '').replace(/\r\n/g, '\n').trim();
  if (!text) return '';
  // Normalize mid-line bullets to newline bullets
  text = text.replace(/\s*[•▪▸►‣○●]\s*/g, '\n• ').replace(/\s+-\s+(?=[A-Z])/g, '\n• ');
  // Project / product titles sitting before a bullet after a sentence end
  text = text.replace(
    /([.!?])\s+([A-Z][A-Za-z0-9][A-Za-z0-9 /&+.-]{1,48})\s*\n•/g,
    '$1\n\n$2\n•'
  );
  // Collapse excess blank lines / spaces
  text = text
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .filter((l, i, arr) => l || (i > 0 && arr[i - 1]))
    .join('\n')
    .trim();
  if (text.length > maxLen) text = text.slice(0, maxLen).trim();
  return text;
}

/** Prefer a clean company label (avoid "Qryde, HBSS (Dispatch360)" looking broken). */
export function cleanCompany(raw: string): string {
  let c = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!c) return '';
  // "A, B (Product)" where both A and B look like org names → "A / B (Product)"
  const m = c.match(/^([^,(]{2,40}?)\s*,\s*([A-Za-z][^,]{1,60})$/);
  if (m) {
    const a = m[1].trim();
    const b = m[2].trim();
    // Don't split "City, ST" style
    if (!/^[A-Z]{2}$/.test(b) && !/^\d/.test(b) && a.split(/\s+/).length <= 5) {
      return `${a} / ${b}`;
    }
  }
  return c;
}

/**
 * If fullName is a single token (or empty), try to recover last name from email/github/linkedin handle.
 * "Shivam" + shivamrajput2362@… → "Shivam Rajput"
 */
export function enrichNameFromContact(
  fullName: string,
  opts?: { email?: string; github?: string; linkedin?: string; authName?: string }
): string {
  let name = normalizeName(fullName);
  if (name && name.split(/\s+/).length >= 2) return name;

  // Prefer verified auth display name when parse only got a first name / garbage
  if (opts?.authName) {
    const auth = normalizeName(opts.authName);
    if (auth && auth.split(/\s+/).length >= 2) return auth;
    if (!name && auth) name = auth;
  }

  const first = (name || '').split(/\s+/)[0] || '';
  const compactFirst = first.toLowerCase().replace(/[^a-z]/g, '');

  const handles = [opts?.email?.split('@')[0], opts?.github, opts?.linkedin]
    .filter(Boolean)
    .map((s) =>
      String(s)
        .replace(/^(?:https?:\/\/)?(?:www\.)?(?:github\.com|linkedin\.com\/in)\//i, '')
        .replace(/\/$/, '')
        .split(/[/?#]/)[0]
    );

  for (const h of handles) {
    const letters = h.toLowerCase().replace(/[^a-z]/g, '');
    if (!letters || letters.length < 5) continue;
    if (compactFirst && letters.startsWith(compactFirst) && letters.length >= compactFirst.length + 3) {
      const rest = letters.slice(compactFirst.length);
      // single last-name token
      if (/^[a-z]{3,16}$/.test(rest)) {
        const last = rest.charAt(0).toUpperCase() + rest.slice(1);
        return normalizeName(`${first} ${last}`) || `${first} ${last}`;
      }
    }
    // handle is first.last or first_last
    const parts = h
      .toLowerCase()
      .replace(/[0-9]+/g, ' ')
      .replace(/[._-]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter((p) => p.length >= 2 && !/^(cv|resume|mail|email|official)$/i.test(p));
    if (parts.length >= 2) {
      const candidate = parts
        .slice(0, 3)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');
      const n = normalizeName(candidate);
      if (n && n.split(/\s+/).length >= 2) return n;
    }
  }
  return name;
}

/** Shared: default signup / garbage public slugs that must never stick. */
export function isDisposableProfileSlug(slug: string | null | undefined): boolean {
  if (!slug) return true;
  const s = String(slug).toLowerCase().trim();
  if (s.length < 2 || s.length > 48) return true;
  if (/^user\d+$/i.test(s)) return true;
  if (/^profile\d*$/i.test(s)) return true;
  if (/^(your-?name|test|demo|temp|tmp|asdf|guest)$/i.test(s)) return true;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s)) return true;
  if (s.includes('http') || s.includes('linkedin') || s.includes('github')) return true;
  if (/^(https?|www)/.test(s) || s.includes('linkedincom') || s.includes('githubcom')) return true;
  if (SCREENSHOT_NAME_RE.test(s)) return true;
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(s)) return true;
  return false;
}

export function nameToProfileSlug(name: string): string {
  const parts = String(name || '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((p) => p.replace(/[^a-z0-9]/g, ''))
    .filter((p) => p && !['https', 'http', 'www', 'com', 'linkedin', 'github', 'in', 'cv', 'resume'].includes(p));
  if (!parts.length) return 'profile';
  return parts.slice(0, 3).join('-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'profile';
}

export function splitSkills(skills: unknown[] | null | undefined): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  // base form without *version* suffixes only: "python 3.11+" → "python"
  // Do NOT strip language names like C++ / C#
  const baseOf = (val: string) =>
    val
      .toLowerCase()
      .replace(/\s*\d+(\.\d+)*\+?\s*$/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const push = (val: string) => {
    val = val.trim().replace(/\s+/g, ' ');
    if (!val || val.length > 60) return;
    // Drop pure version noise
    if (/^\d+(\.\d+)*\+?$/.test(val)) return;
    const key = val.toLowerCase();
    if (seen.has(key)) return;
    // Prefer "Python" over "Python 3.11+" if both appear — keep shorter base first
    const base = baseOf(val);
    if (base && base !== key) {
      // if we already have bare base, skip versioned; if we only have versioned, upgrade later
      if (seen.has(base)) return;
      // if a longer version of same base exists, replace it
      const longerIdx = out.findIndex((s) => baseOf(s) === base && s.toLowerCase() !== base);
      if (longerIdx >= 0 && val.length < out[longerIdx].length) {
        seen.delete(out[longerIdx].toLowerCase());
        out.splice(longerIdx, 1);
      } else if (longerIdx >= 0) {
        return;
      }
    }
    seen.add(key);
    if (base) seen.add(base);
    out.push(val);
  };

  for (const s of skills || []) {
    let val = typeof s === 'string' ? s : String((s as any)?.name ?? '');
    if (!val) continue;
    const parts = val.split(/[,;|]+/).map((p) => p.trim()).filter(Boolean);
    for (const p of parts) push(p);
    if (out.length >= 30) break;
  }
  // Second pass: drop versioned skills when bare base also present
  const bases = new Set(out.map(baseOf));
  return out
    .filter((s) => {
      const b = baseOf(s);
      if (b && b !== s.toLowerCase() && out.some((o) => o.toLowerCase() === b)) return false;
      return true;
    })
    .slice(0, 30);
}

/** True when an education row is actually a contact header or full-resume dump. */
function isEducationDump(edu: any): boolean {
  if (!edu) return false;
  const institution = String(edu.institution || '');
  const degree = String(edu.degree || '');
  const description = String(edu.description || '');
  const head = `${degree} ${institution}`;
  const blob = `${head} ${description}`;

  // Contact / URL in institution or degree
  if (EMAIL_RE.test(institution) || EMAIL_RE.test(degree)) return true;
  if (PHONE_RE.test(institution) || URL_IN_FIELD_RE.test(institution)) return true;
  if (URL_IN_FIELD_RE.test(degree)) return true;

  // Entire contact line used as institution
  if (institution.length > 80 && (PHONE_RE.test(institution) || /@/.test(institution))) return true;
  if (head.length > 160) return true;

  // Strong section headers in institution/degree (not "Secondary Education")
  if (SECTION_MARKER_RE.test(head)) return true;

  // Full resume dumped into description
  if (description.length > 400) {
    const markers = description.match(MULTI_SECTION_DUMP_RE) || [];
    const distinct = new Set(markers.map((m) => m.toLowerCase()));
    // 2+ different resume sections inside one education description → dump
    if (distinct.size >= 2) return true;
    if (description.length > 900) return true;
  }

  // Email/phone in the education blob (contact header dump)
  if (EMAIL_RE.test(blob) || (PHONE_RE.test(institution) && institution.length > 40)) return true;

  return false;
}

function isContactyInstitution(s: string): boolean {
  if (!s) return false;
  return EMAIL_RE.test(s) || PHONE_RE.test(s) || URL_IN_FIELD_RE.test(s) || s.length > 120;
}

export function validateParsedData(data: any): ParseValidation {
  const issues: string[] = [];
  let critical = false;

  const rawName = String(data?.personalInfo?.fullName || '');
  const name = normalizeName(rawName);
  if (!name) {
    issues.push('name is missing or not a real person name');
    critical = true;
  } else if (/^unknown$/i.test(name) || /^your name$/i.test(name)) {
    issues.push('name parsed as placeholder');
    critical = true;
  } else if (SCREENSHOT_NAME_RE.test(rawName) || /\bscreenshot\b/i.test(rawName)) {
    issues.push('name looks like a screenshot filename');
    critical = true;
  } else if (name.split(/\s+/).length < 2) {
    // Single-token names often drop last name — try corrective re-parse once
    issues.push('name looks like first name only (missing last name)');
    const enriched = enrichNameFromContact(name, {
      email: data?.personalInfo?.email,
      github: data?.personalInfo?.github,
      linkedin: data?.personalInfo?.linkedin,
    });
    // If we can already fix from email/handle, don't burn a full re-parse
    if (enriched.split(/\s+/).length < 2) critical = true;
  }

  const edu = Array.isArray(data?.education) ? data.education : [];
  let dumpCount = 0;
  for (const e of edu) {
    if (isEducationDump(e) || isContactyInstitution(String(e?.institution || ''))) {
      dumpCount++;
      issues.push(
        `education entry is a full-resume dump: "${String(e?.institution || e?.degree || '').slice(0, 50)}"`
      );
      critical = true; // must re-extract — dump holds the real resume
    }
  }

  const exp = Array.isArray(data?.workExperience) ? data.workExperience : [];
  for (const w of exp) {
    if (w && !w.title && !w.company && (w.description === 'NA' || w.description === 'N/A' || !w.description)) {
      issues.push('empty / placeholder work experience entry'); // soft — repair drops these
    }
    const d = String(w?.description || '');
    if (d.length > 800 && SECTION_MARKER_RE.test(d) && EMAIL_RE.test(d)) {
      issues.push('work experience description looks like a full-resume dump');
      critical = true;
    }
    // Two project titles mashed mid-description (common AI glitch)
    if (
      d.length > 400 &&
      /[a-z0-9]\s+[A-Z][A-Za-z0-9][A-Za-z0-9 /&-]{2,40}\s*[•▪]/.test(d) &&
      (d.match(/[•▪]/g) || []).length >= 4
    ) {
      issues.push('work experience may mash multiple projects into one description');
      // soft: formatJobDescription repairs layout; don't force re-parse forever
    }
  }

  const skills = Array.isArray(data?.skills) ? data.skills : [];
  for (const s of skills) {
    if (typeof s === 'string' && /[,;|]/.test(s) && s.length > 25) {
      issues.push('glued comma-separated skills block'); // soft — repair splits
      break;
    }
  }

  if (dumpCount > 0 && edu.length === dumpCount) {
    issues.push('all education entries are corrupt dumps');
    critical = true;
  }

  // Experience-heavy CV with zero summary is incomplete (user96)
  const summary = String(data?.summary || '').trim();
  if (exp.length >= 1 && summary.length < 40) {
    issues.push('missing professional summary while experience exists');
    // soft — repair synthesizes; still flag for correction pass once
    if (exp.length >= 2 && summary.length === 0) critical = true;
  }

  // Rich CV that only has a summary (prashant screenshot path)
  if (exp.length === 0 && edu.length === 0 && skills.length === 0 && summary.length > 40) {
    issues.push('only summary extracted — experience/education/skills missing');
    critical = true;
  }

  const allEmpty =
    exp.length === 0 &&
    edu.filter((e: any) => !isEducationDump(e)).length === 0 &&
    skills.length === 0 &&
    !data?.summary;
  if (allEmpty) {
    issues.push('parse returned no content at all');
    critical = true;
  }

  return { issues, critical };
}

/**
 * Pull the longest dump blob (education/work description) so we can re-parse
 * it as the actual resume text when the model collapsed the CV into one field.
 */
export function extractSalvageResumeText(data: any): string {
  if (!data || typeof data !== 'object') return '';
  let best = '';
  const consider = (s: string) => {
    const t = String(s || '').trim();
    if (t.length > best.length) best = t;
  };
  for (const e of data.education || []) {
    if (isEducationDump(e) || isContactyInstitution(String(e?.institution || ''))) {
      consider(`${e.institution || ''}\n${e.degree || ''}\n${e.description || ''}`);
    } else {
      consider(e?.description || '');
    }
  }
  for (const w of data.workExperience || []) {
    consider(w?.description || '');
  }
  for (const cs of data.customSections || []) {
    for (const it of cs?.items || []) consider(it?.description || '');
  }
  // Prefer blobs that look like multi-section resumes
  if (best.length < 200) return '';
  return best;
}

/** Never return a broken shape to the client — always a usable empty-or-partial profile. */
export function ensureMinimalProfile(data: any, hints?: { fileName?: string }): any {
  const out = data && typeof data === 'object' ? data : {};
  if (!out.personalInfo || typeof out.personalInfo !== 'object') out.personalInfo = {};
  const pi = out.personalInfo;
  let name = normalizeName(pi.fullName || '');
  if (!name && hints?.fileName && !SCREENSHOT_NAME_RE.test(hints.fileName)) {
    // "Yash_Kathait_CV.pdf" → "Yash Kathait" (never use Screenshot/IMG filenames)
    name = hints.fileName
      .replace(/\.[^.]+$/, '')
      .replace(/[_\-]+/g, ' ')
      .replace(/\b(cv|resume|curriculum|vitae|final|new|copy|updated|screenshot|image|photo|img)\b/gi, ' ')
      .replace(/\b20\d{2}\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    name = normalizeName(name);
  }
  if (!name) name = 'Your Name';
  pi.fullName = name;
  for (const k of ['email', 'phone', 'location', 'website', 'github', 'linkedin']) {
    if (typeof pi[k] !== 'string') pi[k] = '';
  }
  if (!Array.isArray(pi.additionalLinks)) pi.additionalLinks = [];
  if (typeof out.summary !== 'string') out.summary = '';
  if (!Array.isArray(out.workExperience)) out.workExperience = [];
  if (!Array.isArray(out.education)) out.education = [];
  if (!Array.isArray(out.skills)) out.skills = [];
  if (!Array.isArray(out.customSections)) out.customSections = [];
  return out;
}

export function repairParsedData(data: any, hints?: { authName?: string }): any {
  if (!data || typeof data !== 'object') return data;

  if (data.personalInfo && typeof data.personalInfo === 'object') {
    for (const k of ['email', 'phone', 'website', 'github', 'linkedin']) {
      if (typeof data.personalInfo[k] === 'string') data.personalInfo[k] = data.personalInfo[k].trim();
    }
    // Strip path junk from github/linkedin handles
    for (const k of ['github', 'linkedin'] as const) {
      let v = String(data.personalInfo[k] || '');
      if (!v) continue;
      v = v
        .replace(/^(?:https?:\/\/)?(?:www\.)?/i, '')
        .replace(/^(?:github\.com|linkedin\.com)\/(?:in\/)?/i, '')
        .replace(/\/$/, '')
        .split(/[?#]/)[0]
        .trim();
      data.personalInfo[k] = v;
    }
    data.personalInfo.fullName = enrichNameFromContact(data.personalInfo.fullName || '', {
      email: data.personalInfo.email,
      github: data.personalInfo.github,
      linkedin: data.personalInfo.linkedin,
      authName: hints?.authName,
    });
    data.personalInfo.location = cleanLocation(data.personalInfo.location);
    if (Array.isArray(data.personalInfo.additionalLinks)) {
      data.personalInfo.additionalLinks = data.personalInfo.additionalLinks
        .filter((l: any) => l && l.url && l.label)
        .map((l: any) => ({ label: String(l.label).trim(), url: String(l.url).trim() }));
    }
  }

  if (typeof data.summary === 'string') {
    data.summary = cleanDescription(data.summary, 1200);
  }

  if (Array.isArray(data.workExperience)) {
    data.workExperience = data.workExperience
      .filter((w: any) => w && (w.title?.trim() || w.company?.trim()))
      .map((w: any) => ({
        ...w,
        title: String(w.title || '').trim(),
        company: cleanCompany(String(w.company || '').trim()),
        location: cleanLocation(w.location),
        startDate: cleanDate(w.startDate),
        endDate: cleanDate(w.endDate),
        description: formatJobDescription(w.description, 2000),
      }));
  }

  if (Array.isArray(data.education)) {
    // IMPORTANT: drop dump entries entirely — do NOT truncate them into looking valid
    data.education = data.education
      .filter((e: any) => e && (e.institution?.trim() || e.degree?.trim()))
      .filter((e: any) => !isEducationDump(e) && !isContactyInstitution(String(e.institution || '')))
      .map((e: any) => ({
        ...e,
        institution: String(e.institution || '')
          .replace(CONTACT_STRIP_RE, '')
          .replace(URL_IN_FIELD_RE, '')
          .replace(/\s+/g, ' ')
          .trim(),
        degree: String(e.degree || '').trim(),
        fieldOfStudy: String(e.fieldOfStudy || '').trim(),
        startDate: cleanDate(e.startDate),
        endDate: cleanDate(e.endDate),
        description: cleanDescription(e.description, 500)
          .replace(CONTACT_STRIP_RE, '')
          .replace(/\s{2,}/g, ' ')
          .trim(),
      }))
      .filter((e: any) => e.institution.length > 1 || e.degree.length > 1);
  }

  if (Array.isArray(data.skills)) {
    data.skills = splitSkills(data.skills);
  }

  // Synthesize a short summary when model omitted it but we have roles (after skill cleanup)
  if (!String(data.summary || '').trim() && Array.isArray(data.workExperience) && data.workExperience.length) {
    const top = data.workExperience[0];
    const bits = [
      top.title && top.company ? `${top.title} at ${top.company}` : top.title || top.company,
      data.workExperience[1]?.company ? `Previously at ${data.workExperience[1].company}` : null,
      Array.isArray(data.skills) && data.skills.length
        ? `Skills include ${data.skills.slice(0, 6).join(', ')}`
        : null,
    ].filter(Boolean);
    if (bits.length) {
      data.summary = cleanDescription(bits.join('. ') + '.', 400);
    }
  }

  if (Array.isArray(data.customSections)) {
    data.customSections = data.customSections
      .filter((cs: any) => cs && String(cs.sectionTitle || '').trim())
      .map((cs: any) => ({
        ...cs,
        sectionTitle: String(cs.sectionTitle || '').trim(),
        items: Array.isArray(cs.items)
          ? cs.items.map((item: any) => ({
              ...item,
              title: String(item.title || '').trim(),
              subtitle: String(item.subtitle || '').trim(),
              date: String(item.date || '').trim(),
              description: cleanDescription(item.description, 800),
            }))
          : [],
      }));
  }

  return data;
}

export { isEducationDump };
