// parse-guard.ts
// Defense layer that runs on EVERY parse result (AI or fallback) before it can
// reach the database. Guarantees structurally valid, non-corrupt profile data:
//  - deterministic repair of common AI mistakes (name case, glued skills,
//    glued locations, junk experience entries, placeholder dates)
//  - critical-failure detection so a bad parse is rejected / re-parsed instead
//    of being persisted (the historical corruption root cause).

export interface ParseValidation {
  issues: string[];
  critical: boolean;
}

const DOC_LABEL_RE =
  /^(curriculum vitae|cv|resume|r[eé]sum[eé]|profile|bio|portfolio|applicant|my profile|my resume|candidate)$/i;

const SECTION_MARKER_RE =
  /PROFESSIONAL SUMMARY|CAREER SUMMARY|TECHNICAL SKILLS|CORE SKILLS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT HISTORY|KEY PROJECTS|PROJECTS|CERTIFICATIONS|CERTIFICATES|ACHIEVEMENTS|AWARDS|HONORS|EDUCATION\b|EXPERIENCE\b|SUMMARY\b|ABOUT ME|ABOUT\b|__PROT\s*\d+\s*__/i;

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;

const CONTACT_RE =
  /(?:\b(?:\+\d{1,3}[\s-]?)?\d{3,5}[\s.-]?\d{3}[\s.-]?\d{3,5}\b)|(?:\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b)/gi;

const PLACEHOLDER_DATE_RE =
  /still ongoing|ongoing|currently|till now|till date|to date|in progress|present\b/i;

function titleCaseWord(w: string): string {
  if (!w) return w;
  return w[0].toUpperCase() + w.slice(1);
}

export function normalizeName(raw: string): string {
  let name = (raw || '').replace(/\s+/g, ' ').trim();
  if (!name) return '';
  // Strip leading document labels ("Resume: John Doe" -> "John Doe")
  name = name.replace(/^(curriculum vitae|cv|resume|r[eé]sum[eé]|profile|bio)\s*[:.-]\s*/i, '').trim();
  name = name.replace(/^[•\-\*▪▸►‣○●"“”']+\s*/, '').trim();
  // Split on first comma/newline and keep only the name part
  name = name.split(/[,/|]/)[0].trim();
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
  return name.replace(/\s{2,}/g, ' ').trim();
}

export function cleanLocation(raw: string): string {
  let loc = (raw || '').replace(/\s+/g, ' ').trim();
  if (!loc) return '';
  // Fix glued "City,Country" / "City,State" with a single space after the comma
  loc = loc.replace(/\s*,\s*/g, ', ');
  // Normalize internal punctuation spacing
  loc = loc.replace(/\s+-\s+/g, ' - ').replace(/\s*\/\s*/g, ' / ').trim();
  // Title-case the first letter of each comma-separated segment (e.g. "pune" -> "Pune")
  loc = loc
    .split(',')
    .map((s) => {
      s = s.trim();
      return s ? s[0].toUpperCase() + s.slice(1) : s;
    })
    .join(', ');
  // "Remote" / "Hybrid" should stay as-is
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
  // Strip wrapping quotes and decorative bullets
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
    if (!val || val.length > 80 || seen.has(val)) return;
    seen.add(val);
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

function isEducationDump(edu: any): boolean {
  if (!edu) return false;
  const head = `${edu.degree || ''} ${edu.institution || ''}`;
  const blob = `${head} ${edu.description || ''}`;
  if (head.length > 180) return true;
  if (SECTION_MARKER_RE.test(head)) return true;
  if (EMAIL_RE.test(blob)) return true;
  if ((edu.description || '').length > 600) return true;
  return false;
}

export function validateParsedData(data: any): ParseValidation {
  const issues: string[] = [];
  const name = normalizeName(data?.personalInfo?.fullName);
  if (!name) issues.push('name is missing or not a real person name');
  else if (/^unknown$/i.test(name)) issues.push('name parsed as "Unknown"');

  const edu = Array.isArray(data?.education) ? data.education : [];
  for (const e of edu) {
    if (isEducationDump(e)) {
      issues.push(`education entry is a full-resume dump: "${(e?.institution || e?.degree || '').slice(0, 50)}"`);
    }
  }

  const exp = Array.isArray(data?.workExperience) ? data.workExperience : [];
  for (const w of exp) {
    if (w && !w.title && !w.company && (w.description === 'NA' || w.description === 'N/A' || !w.description)) {
      issues.push('empty / placeholder work experience entry');
    }
  }

  const skills = Array.isArray(data?.skills) ? data.skills : [];
  for (const s of skills) {
    if (typeof s === 'string' && /[,;|]/.test(s) && s.length > 25) {
      issues.push('glued comma-separated skills block');
      break;
    }
  }

  const allEmpty =
    (Array.isArray(data?.workExperience) ? data.workExperience.length : 0) === 0 &&
    (Array.isArray(data?.education) ? data.education.length : 0) === 0 &&
    (Array.isArray(data?.skills) ? data.skills.length : 0) === 0 &&
    !data?.summary;
  if (allEmpty) issues.push('parse returned no content at all');

  return { issues, critical: issues.length > 0 };
}

export function repairParsedData(data: any): any {
  if (!data || typeof data !== 'object') return data;

  if (data.personalInfo && typeof data.personalInfo === 'object') {
    data.personalInfo.fullName = normalizeName(data.personalInfo.fullName);
    data.personalInfo.location = cleanLocation(data.personalInfo.location);
    for (const k of ['email', 'phone', 'website', 'github', 'linkedin']) {
      if (typeof data.personalInfo[k] === 'string') data.personalInfo[k] = data.personalInfo[k].trim();
    }
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
    data.education = data.education
      .filter((e: any) => e && (e.institution?.trim() || e.degree?.trim()))
      .map((e: any) => ({
        ...e,
        institution: String(e.institution || '').trim(),
        degree: String(e.degree || '').trim(),
        fieldOfStudy: String(e.fieldOfStudy || '').trim(),
        startDate: cleanDate(e.startDate),
        endDate: cleanDate(e.endDate),
        // Never allow a full-resume dump or contact details inside a description
        description: cleanDescription(e.description, 500).replace(CONTACT_RE, '').replace(/\s{2,}/g, ' ').trim(),
      }));
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
