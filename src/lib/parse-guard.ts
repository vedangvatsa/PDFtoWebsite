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

export function splitSkills(skills: unknown[] | null | undefined): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (val: string) => {
    val = val.trim();
    if (!val || val.length > 80 || seen.has(val.toLowerCase())) return;
    seen.add(val.toLowerCase());
    out.push(val);
  };
  for (const s of skills || []) {
    let val = typeof s === 'string' ? s : String((s as any)?.name ?? '');
    if (!val) continue;
    const parts = val.split(/[,;|]+/).map((p) => p.trim()).filter(Boolean);
    for (const p of parts) push(p);
    if (out.length >= 30) break;
  }
  return out.slice(0, 30);
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
  } else if (/^unknown$/i.test(name)) {
    issues.push('name parsed as "Unknown"');
    critical = true;
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
  if (!name && hints?.fileName) {
    // "Yash_Kathait_CV.pdf" → "Yash Kathait"
    name = hints.fileName
      .replace(/\.[^.]+$/, '')
      .replace(/[_\-]+/g, ' ')
      .replace(/\b(cv|resume|curriculum|vitae|final|new|copy|updated)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    name = normalizeName(name) || name.replace(/\b\w/g, (c) => c.toUpperCase());
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

export function repairParsedData(data: any): any {
  if (!data || typeof data !== 'object') return data;

  if (data.personalInfo && typeof data.personalInfo === 'object') {
    data.personalInfo.fullName = normalizeName(data.personalInfo.fullName);
    data.personalInfo.location = cleanLocation(data.personalInfo.location);
    for (const k of ['email', 'phone', 'website', 'github', 'linkedin']) {
      if (typeof data.personalInfo[k] === 'string') data.personalInfo[k] = data.personalInfo[k].trim();
    }
    // If location empty but name had a city, try personalInfo already cleaned
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
        company: String(w.company || '').trim(),
        location: cleanLocation(w.location),
        startDate: cleanDate(w.startDate),
        endDate: cleanDate(w.endDate),
        description: cleanDescription(w.description, 1500),
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
