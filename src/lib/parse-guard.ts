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

/** Section headings that models / regex salvage sometimes put in fullName. Never a person. */
const SECTION_TITLE_NAME_RE =
  /^(?:(?:(?:professional|career|executive|personal)\s+)?(?:summary|profile|objective|overview|statement|introduction|highlights)|about(?:\s+me)?|(?:work\s+)?experience|employment(?:\s+history)?|education|(?:top|core|key|technical|professional)?\s*skills?|projects?|certifications?|contact(?:\s+information)?|references?|interests?|hobbies|languages?|awards?|achievements?|publications?)$/i;

/** Salvage / staging custom sections — OK in the editor, never on the public site. */
export const EDITOR_ONLY_SECTION_RE =
  /^imported\s+cv\s+text$|^raw\s+cv\s+text$|^parse\s+salvage$|^unparsed\s+cv$/i;

export function isEditorOnlyCustomSection(
  section: { sectionTitle?: string | null } | null | undefined
): boolean {
  return EDITOR_ONLY_SECTION_RE.test(String(section?.sectionTitle || '').trim());
}

function splitMashedProjects(itemTitle: string, itemSubtitle: string, itemDesc: string, originalItem: any): any[] {
  if (!itemDesc || itemDesc.length < 120) {
    return [{ ...originalItem, description: itemDesc }];
  }

  const lines = itemDesc.split(/\r?\n/);
  const blocks: Array<{ title: string; subtitle: string; lines: string[] }> = [];

  let currentTitle = itemTitle || '';
  let currentSubtitle = itemSubtitle || '';
  let currentLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const isSubTitle =
      i > 0 &&
      line.length >= 6 &&
      line.length <= 85 &&
      !line.endsWith('.') &&
      !line.endsWith(':') &&
      !/^[•\-\*▪▸►‣○●]/.test(line) &&
      !/^(developed|built|designed|created|implemented|worked|supported|analyzed|applied|maintained)\b/i.test(line) &&
      (line.includes(' - ') || line.includes(' : ') || /^[A-Z][A-Za-z0-9\s()&/-]+$/.test(line)) &&
      (lines[i + 1] ? lines[i + 1].trim().length > 0 : true);

    if (isSubTitle) {
      if (currentLines.length > 0 || currentTitle) {
        blocks.push({
          title: currentTitle,
          subtitle: currentSubtitle,
          lines: currentLines,
        });
      }
      currentTitle = line;
      currentSubtitle = '';
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0 || currentTitle) {
    blocks.push({
      title: currentTitle,
      subtitle: currentSubtitle,
      lines: currentLines,
    });
  }

  if (blocks.length <= 1) {
    return [{ ...originalItem, description: itemDesc }];
  }

  return blocks.map((b, idx) => ({
    ...originalItem,
    id: `${originalItem.id || 'item'}-${idx}`,
    title: b.title || originalItem.title,
    subtitle: b.subtitle || '',
    description: b.lines.join('\n').trim(),
  }));
}

export function publicCustomSections<T extends { sectionTitle?: string | null; items?: any[] }>(
  sections: T[] | null | undefined
): T[] {
  return (Array.isArray(sections) ? sections : [])
    .filter((s) => !isEditorOnlyCustomSection(s))
    .map((s) => {
      if (!Array.isArray(s.items)) return s;
      const items = s.items.flatMap((item: any) => {
        const title = String(item?.title || '').trim();
        const subtitle = String(item?.subtitle || '').trim();
        const desc = String(item?.description || '').trim();

        if (/review and move into the right sections/i.test(title) || /review and move/i.test(subtitle)) {
          return [];
        }
        if (/imported cv text|raw cv text|unparsed cv|parse salvage/i.test(title)) {
          return [];
        }
        if (desc.length > 300 && (desc.includes('PERSONAL STATEMENT') || desc.includes('WORK EXPERIENCE') || desc.includes('EDUCATION'))) {
          return [];
        }

        const cleanDesc = desc.replace(/JavaScriptScript/gi, 'JavaScript/TypeScript');
        return splitMashedProjects(title, subtitle, cleanDesc, item);
      });

      return { ...s, items };
    })
    .filter((s) => !Array.isArray(s.items) || s.items.length > 0);
}

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
  /\s+(?:New\s+Delhi|Delhi|Noida|Gurgaon|Gurugram|Mumbai|Bombay|Bengaluru|Bangalore|Hyderabad|Chennai|Pune|Kolkata|Calcutta|Ahmedabad|Jaipur|Chandigarh|Lucknow|Indore|Bhopal|Patna|Vadodara|Surat|Nagpur|Kochi|Coimbatore|Mysore|Mysuru|Visakhapatnam|Remote|India|USA|UK|UAE|Canada|Australia|Singapore|London|San\s+Francisco|New\s+York|NYC|California|Texas|Ontario|Toronto|Dubai)$/i;

const MULTI_LOCATION_TAIL_RE =
  /\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:,\s*(?:India|USA|UK|UAE|Canada|Australia|Singapore))?$/;

export function normalizeName(raw: string): string {
  let name = (raw || '').replace(/\s+/g, ' ').trim();
  if (!name) return '';
  // Contact / URL as name is never valid
  if (EMAIL_RE.test(name) || URL_IN_FIELD_RE.test(name) || PHONE_RE.test(name)) return '';
  // Strip leading document labels ("Resume: John Doe" -> "John Doe").
  // Lookahead stops "bio"/"cv" eating "Biology" / "Cvetkova".
  name = name
    .replace(
      /^(?:curriculum\s+vitae|cv|resume|r[eé]sum[eé]|profile|bio|ats)(?=\s|[:.\-]|$)\s*[:.-]?\s*/i,
      ''
    )
    .trim();
  name = name.replace(/^[•\-\*▪▸►‣○●"“”']+\s*/, '').trim();
  // Strip trailing document/file extensions ("Vaishnavee Haridas.pdf" → "Vaishnavee Haridas").
  // The AI frequently reads a PDF filename as the person's name.
  name = name.replace(/\.\s*(pdf|docx?|txt|rtf|pages|png|jpe?g|webp|gif|bmp|tex|odt)\s*$/i, '').trim();
  // Strip filename version / editor noise ("John Doe 5.2.docx" → "John Doe",
  // "John Doe v3 final", "John Doe (1)", "John Doe 3rd draft"). Roman-numeral
  // suffixes (II, III, IV) are not digits, so they are preserved.
  name = name
    .replace(/\s+(?:v|ver\.?|version\s*)?\d+(?:\.\d+)*(?:st|nd|rd|th)?\s*$/i, '')
    .replace(/\s*\(?\b(?:final|new|copy|updated|latest|draft|backup|edited)\b\)?\s*$/i, '')
    .replace(/\s*\(\d+\)\s*$/, '')
    .trim();
  // Slug/filename digits glued to a name token ("Abhinav Thakur03" → "Abhinav Thakur")
  name = name.replace(/\b([A-Za-z]{2,})(\d{2,4})\b/g, '$1').replace(/\s+/g, ' ').trim();
  // Trailing seniority / doc noise wrongly treated as part of the name
  name = name
    .replace(/\s+\b(Senior|Junior|Intern|Fresher|Student|Candidate|Update|ATS|CV|Resume|Portfolio|Professional)\b\s*$/i, '')
    .trim();
  name = name
    .replace(
      /\s+\b(?:(?:cybersecurity|software|product|project|data|marketing)\s+)*(?:analyst|engineer|developer|designer|consultant|manager|architect|specialist|scientist|coordinator|intern)\b\s*$/i,
      ''
    )
    .trim();
  name = name
    .replace(
      /\s+\b(?:IB|IIM[A-C]?|PGP|PGDM|MBA|B\.?Tech|M\.?Tech)\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?(?:\s*20\d{2})?\s*$/i,
      ''
    )
    .trim();
  if (name.split(/\s+/).length >= 3) {
    name = name
      .replace(/\s+\b(Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s*$/i, '')
      .trim();
  }
  // Split on first comma/newline and keep only the name part
  name = name.split(/[,/|·•]/)[0].trim();
  // Strip trailing locations ("Yash Kathait New Delhi" → "Yash Kathait")
  name = name.replace(TRAILING_LOCATION_RE, '').trim();
  // Trailing tech/org acronyms glued after an ALL-CAPS name run ("Lokesh Trivedi Aws")
  name = name.replace(/\s+\b(AWS|GCP|IBM|SAP|ERP|CRM|IAM|CTO|CEO|CFO|COO|CIO|CISO)\b\.?$/i, '').trim();
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
  // Resume section titles are never a person's name ("Professional Summary", "Education")
  if (SECTION_TITLE_NAME_RE.test(name)) return '';
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
  name = collapseDuplicatedName(name);
  name = stripTrailingRoleFromName(name);
  return name.replace(/\s{2,}/g, ' ').trim();
}

/** "Muhammad Ibrahim Khanmuhammad Ibrahim Khan" → "Muhammad Ibrahim Khan" */
function collapseDuplicatedName(name: string): string {
  const compact = name.replace(/\s+/g, '').toLowerCase();
  if (compact.length < 8 || compact.length % 2 !== 0) return name;
  const half = compact.slice(0, compact.length / 2);
  if (half !== compact.slice(compact.length / 2)) return name;
  let count = 0;
  let i = 0;
  while (i < name.length && count < half.length) {
    if (/\S/.test(name[i])) count++;
    i++;
  }
  return name.slice(0, i).trim() || name;
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

/** Truncate without cutting mid-word (and prefer ending on a sentence when possible). */
export function truncateAtWordBoundary(raw: string, maxLen: number): string {
  const text = String(raw || '').trim();
  if (!text || text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const sentenceEnd = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (sentenceEnd > maxLen * 0.5) return cut.slice(0, sentenceEnd + 1).trim();
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > maxLen * 0.6) return cut.slice(0, lastSpace).trim();
  return cut.trim();
}

/** Decode the HTML entities PDF/Word extracts leave in CV prose. */
export function decodeCvHtmlEntities(raw: string): string {
  let t = String(raw || '');
  for (let i = 0; i < 3; i++) {
    const next = t
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
    if (next === t) break;
    t = next;
  }
  return t
    .replace(/&\s*amp;?/gi, '&')
    .replace(/&\s*gt;?/gi, '>')
    .replace(/&\s*lt;?/gi, '<');
}

/**
 * Light cleanup for uploaded CV text. Never truncates — we must keep every
 * character the user uploaded (summary, bullets, Imported CV salvage, etc.).
 */
export function preserveUploadedCvText(raw: string): string {
  if (!raw) return '';
  return decodeCvHtmlEntities(String(raw))
    .replace(/\r\n/g, '\n')
    .replace(/\bpage\s+\d+\s+of\s+\d+\b/gi, ' ')
    .replace(/(\w)-\n(to|in|up|on|off|out)-?/gi, '$1-$2')
    .replace(/(\w)-\n([a-z])/g, '$1$2')
    // PDF text extraction frequently drops the separator after punctuation,
    // plus signs, or a closing parenthesis.
    .replace(/([.!?])(?=[A-Za-z])/g, '$1 ')
    .replace(/([+])(?=[A-Za-z])/g, '$1 ')
    .replace(/([a-z0-9)])(?=\()/gi, '$1 ')
    .replace(/(\))(?=[A-Za-z])/g, '$1 ')
    // Some PDF text layers concatenate common words without preserving the
    // original word boundary (for example "andcross-border" or
    // "provideconsulting"). Keep this list deliberately conservative.
    .replace(
      /\b(?:and(?=(?:cross|training|promote|provid|support|create|collaborat))|without(?=replac)|provide(?=consult)|of(?=special)|with(?=(?:60|expert|complete|diverse)))(?=[a-z0-9])/gi,
      '$& '
    )
    .replace(/([a-z]{4,})([A-Z]{2,})\b/g, '$1 $2')
    .replace(/([a-z]{2,})([A-Z][a-z]{2,})/g, '$1 $2')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .trim();
}

/**
 * Normalize description text. Pass `maxLen` only for non-CV surfaces (SEO meta,
 * synthesized one-liners). Uploaded CV fields must omit maxLen so nothing is cut.
 */
export function cleanDescription(raw: string, maxLen?: number): string {
  if (!raw) return '';
  let text = preserveUploadedCvText(raw).replace(/\s+/g, ' ').trim();
  text = text.replace(/^["“”'`\s]+|["“”'`\s]+$/g, '').trim();
  text = text.replace(/^[•\-\*▪▸►‣○●]\s*/, '').trim();
  // Strip a leading section label the model sometimes glues onto the summary body
  text = text
    .replace(
      /^(?:(?:professional|career|executive|personal)\s+)?(?:summary|profile|objective|overview|statement)\s*[:\-–—.]?\s*/i,
      ''
    )
    .trim();
  if (
    typeof maxLen === 'number' &&
    Number.isFinite(maxLen) &&
    maxLen > 0 &&
    text.length > maxLen
  ) {
    text = truncateAtWordBoundary(text, maxLen);
  }
  return text;
}

/**
 * Format job bullets + project sub-headers so mashed project blocks become readable.
 * e.g. "...teams. Outbound-Inbound Caller • Built..." → newlines before project title.
 * Never truncates uploaded job text unless an explicit maxLen is passed.
 */
/** Join PDF soft-wraps: mid-sentence line breaks → spaces (keep real paragraph breaks). */
function joinSoftWrappedLines(text: string): string {
  const lines = String(text || '').split('\n');
  const out: string[] = [];
  for (const raw of lines) {
    const line = raw.replace(/[ \t]+/g, ' ').trimEnd();
    const trimmed = line.trim();
    const prev = out[out.length - 1];
    if (
      prev &&
      trimmed &&
      !/^[•▪▸►‣○●\uF0B7*\-]/.test(trimmed) &&
      !/^\d+\.\s/.test(trimmed) &&
      /[A-Za-z0-9,'")\]]$/.test(prev.trim()) &&
      /^[a-z0-9(]/.test(trimmed)
    ) {
      out[out.length - 1] = `${prev.trimEnd()} ${trimmed}`;
    } else {
      out.push(line);
    }
  }
  return out.join('\n');
}

export function formatWorkExperienceDescription(raw: string, maxLen?: number): string {
  let text = joinSoftWrappedLines(preserveUploadedCvText(raw).replace(/\r\n/g, '\n').trim());
  if (!text) return '';
  // Normalize mid-line bullets to newline bullets
  text = text.replace(/\s*[•▪▸►‣○●\uF0B7]\s*/g, '\n• ').replace(/\s+-\s+(?=[A-Z])/g, '\n• ');
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
  if (
    typeof maxLen === 'number' &&
    Number.isFinite(maxLen) &&
    maxLen > 0 &&
    text.length > maxLen
  ) {
    text = text.slice(0, maxLen).trim();
  }
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

/** Strong role tokens — not lone "data"/"product"/"senior", which match company names. */
const STRONG_JOB_TITLE_RE =
  /\b(engineer|developer|manager|director|analyst|designer|consultant|architect|specialist|scientist|researcher|programmer|coordinator|officer|founder|intern|assistant|trader|ambassador|associate|replenishment|lead|executive|clerk|representative|administrator|mentor|evangelist|trainer|speaker|faculty|chair|co-?chair|ceo|cto|cfo|advisor|partner)\b/i;

export function looksLikeJobTitle(raw: string): boolean {
  const t = String(raw || '').trim();
  if (!t || t.length > 80) return false;
  return STRONG_JOB_TITLE_RE.test(t);
}

export function looksLikeLocationField(raw: string): boolean {
  const t = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!t || t.length > 90) return false;
  if (looksLikeJobTitle(t) || DURATION_ONLY_RE.test(t)) return false;
  if (/^(remote|hybrid|onsite|wfh|work from home|india|usa|uk|uae|canada|australia|singapore)$/i.test(t)) {
    return true;
  }
  if (/,\s*(india|usa|uk|uae|canada|australia|singapore|germany|france|netherlands|switzerland)\s*$/i.test(t)) {
    return true;
  }
  return /^(pune|mumbai|delhi|new delhi|bengaluru|bangalore|hyderabad|chennai|kolkata|noida|gurgaon|gurugram|nagpur|ahmedabad|jaipur|chandigarh|indore|bhopal|kochi|coimbatore|pune city|pune area)([,\s].*)?$/i.test(
    t
  );
}

const GENERIC_ROLE_RE =
  /^(manager|head|lead|director|associate|executive|officer|specialist|analyst|consultant|coordinator)$/i;
const COMPANY_ABBREV_TAIL_RE =
  /\b(?:pvt\.?\s*ltd|private limited|llc|inc|ltd|gmbh|llp|bros|co|corp|limited)\.?\s*$/i;

function looksLikeProseCompany(raw: string): boolean {
  const t = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!t) return false;
  if (/^[a-z]/.test(t)) return true;
  if (t.length < 40) return /^(for the|the)\b/i.test(t);
  if (
    /\b(is a|is an|that|providing|empowering|orchestrat|gateway to|lectures?|mentoring|serving|executed|collaborated|managing|overseeing|developed|engineered|spearheaded)\b/i.test(
      t
    )
  ) {
    return true;
  }
  // Sentence-length company field (PDF ate the real title/company).
  return t.split(/\s+/).length >= 8 && !COMPANY_ABBREV_TAIL_RE.test(t);
}

/** Title field that is really a wrapped bullet / sentence, not a role name. */
function looksLikeProseTitle(raw: string): boolean {
  const t = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!t) return false;
  if (looksLikeLocationField(t) || DURATION_ONLY_RE.test(t)) return false;
  if (looksLikeRealJobTitle(t)) return false;
  if (t.length > 55) return true;
  if (t.split(/\s+/).length >= 8) return true;
  return /^(led|collaborated|executed|developed|engineered|spearheaded|managed|built|designed|modules)\b/i.test(
    t
  );
}

function looksLikeRealJobTitle(raw: string): boolean {
  const t = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!t || t.length > 70) return false;
  if (/^[•▪▸►‣○●\uF0B7*-]/.test(t)) return false;
  if (/[.!?]$/.test(t)) return false;
  if (t.split(/\s+/).length > 8) return false;
  if (/,/.test(t) && t.length > 40) return false;
  return looksLikeJobTitle(t);
}

function looksLikeDepartment(raw: string): boolean {
  return /^(sales|marketing|operations|finance|engineering|product|design|legal|hr|human resources|retail)(?:\s*[&/]\s*(sales|marketing|operations|finance|retail))?$/i.test(
    String(raw || '').trim()
  );
}

function foldDepartmentIntoTitle(title: string, company: string): { title: string; company: string } {
  if (!looksLikeDepartment(company)) return { title, company };
  const t = title.trim();
  const d = company.trim();
  if (GENERIC_ROLE_RE.test(t)) {
    return { title: `${t}, ${d}`, company: '' };
  }
  return { title: t, company: '' };
}

function looksLikeCompanyName(raw: string): boolean {
  const t = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!t || t.length < 3 || t.length > 90) return false;
  if (looksLikeProseCompany(t) || looksLikeLocationField(t) || DURATION_ONLY_RE.test(t)) return false;
  if (looksLikeDepartment(t) || looksLikeRealJobTitle(t)) return false;
  if (/^[•]/.test(t)) return false;
  if (/[.!?]$/.test(t) && !COMPANY_ABBREV_TAIL_RE.test(t)) return false;
  if (/\b(pvt\.?\s*ltd|private limited|llc|inc\.?|ltd\.?|gmbh|llp|bros\.?)\b/i.test(t)) return true;
  if (/^[A-Z0-9][A-Z0-9 &.'()/-]{2,70}$/.test(t) && /[A-Z]{3,}/.test(t) && t.split(/\s+/).length <= 10) {
    return true;
  }
  // Title-case org names from LinkedIn PDFs ("Maple Labs", "Brocade Communications")
  if (
    /^[A-Z][A-Za-z0-9][A-Za-z0-9 &.'()/-]{0,70}$/.test(t) &&
    t.split(/\s+/).length <= 6 &&
    !/^(the|a|an)\b/i.test(t) &&
    !/\b(supported|delivered|billings|budget|growth|contributions?|impact|availability|fulfiliment)\b/i.test(
      t
    ) &&
    /\b(labs?|inc\.?|corp\.?|systems?|technologies|communications?|software|media|group|partners?|ventures|capital|forum|solutions?|networks?|platform|analytics|consulting)\b/i.test(
      t
    )
  ) {
    return true;
  }
  return false;
}

function peelTrailingCompany(desc: string): { company: string; rest: string } | null {
  const lines = preserveUploadedCvText(desc).split(/\n/).map((l) => l.trimEnd());
  let idx = lines.length - 1;
  while (idx >= 0 && !lines[idx].trim()) idx--;
  if (idx < 0) return null;
  const last = lines[idx].replace(/^[•\-*\uF0B7▪▸►‣○●]\s*/, '').trim();
  if (!looksLikeCompanyName(last)) return null;
  return { company: last, rest: lines.slice(0, idx).join('\n') };
}

function isStatsHighlightRow(w: {
  title?: string | null;
  company?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}): boolean {
  if (w.startDate || w.endDate) return false;
  const title = String(w.title || '').trim();
  const company = String(w.company || '').trim();
  const desc = String(w.description || '');
  if (looksLikeRealJobTitle(title)) return false;
  if (
    /\b(supported|delivered|managed|led|exposure|billings|budget)\b/i.test(company) &&
    !looksLikeCompanyName(company)
  ) {
    return true;
  }
  const metricHits = (desc.match(/(?:^|\n)\s*(?:\d[\d,]*%?|₹|\$)/gm) || []).length;
  return metricHits >= 4;
}

function isContinuationRow(w: {
  title?: string | null;
  company?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}): boolean {
  const title = String(w.title || '').trim();
  const company = String(w.company || '').trim();
  if (/^[•▪▸►‣○●\uF0B7]/.test(title) || /^[•▪▸►‣○●\uF0B7]/.test(company)) return true;
  if (w.startDate || w.endDate) return false;
  if (/[.!?]$/.test(title) || title.length > 70) return true;
  if (!looksLikeRealJobTitle(title) && !looksLikeCompanyName(title)) return true;
  return false;
}

function peelTrailingJobHeader(desc: string): { title: string; company: string; rest: string } | null {
  const lines = preserveUploadedCvText(desc).split(/\n/).map((l) => l.trimEnd());
  const nonempty: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim()) nonempty.push(i);
  }
  if (nonempty.length < 3) return null;
  const lastIdx = nonempty[nonempty.length - 1];
  const prevIdx = nonempty[nonempty.length - 2];
  const last = lines[lastIdx].replace(/^[•\-\*▪▸►‣○●\uF0B7]\s*/, '').trim();
  const prev = lines[prevIdx].replace(/^[•\-\*▪▸►‣○●\uF0B7]\s*/, '').trim();
  if (looksLikeLocationField(prev) || DURATION_ONLY_RE.test(prev)) return null;
  if (prev.length < 3 || prev.length > 90) return null;
  if (/[.!?]$/.test(prev) || prev.split(/\s+/).length > 14) return null;

  // Company then title (LinkedIn wrap: "...\nXPI\nCo-Founder")
  if (looksLikeJobTitle(last) && !looksLikeJobTitle(prev) && !looksLikeLocationField(last)) {
    return { title: last, company: prev, rest: lines.slice(0, prevIdx).join('\n') };
  }

  // Title then company (common LinkedIn export: "...\nTechnical Lead\nMaple Labs")
  if (
    looksLikeRealJobTitle(prev) &&
    looksLikeCompanyName(last) &&
    !looksLikeJobTitle(last) &&
    !looksLikeLocationField(last)
  ) {
    return { title: prev, company: last, rest: lines.slice(0, prevIdx).join('\n') };
  }

  return null;
}

const SECTION_HEADER_FIELD_RE =
  /^(personal\s+information|contact(?:\s+information)?|education|experience|skills?|profile|summary|references?|curriculum vitae|resume|objective)$/i;
const DURATION_ONLY_RE =
  /^\(?\s*\d+\+?\s*(?:years?|yrs?|months?|mos?)(?:\s+\d+\+?\s*(?:months?|mos?))?\s*\)?\.?$/i;
const SENTENCE_COMPANY_RE =
  /^(worked|built|developed|responsible|managed|led|created|designed|implemented|helped|assisted)\b/i;
const PLACEHOLDER_TITLE_RE = /^(position|freshers?|n\/?a|na|title)$/i;

/** Peel job-title tokens off the right of a name, leaving at least two name tokens. */
function stripTrailingRoleFromName(name: string): string {
  const tokens = name.split(/\s+/).filter(Boolean);
  while (tokens.length > 2) {
    const lastTwo = tokens.slice(-2).join(' ');
    const lastThree = tokens.slice(-3).join(' ');
    const last = tokens[tokens.length - 1];
    if (tokens.length > 3 && looksLikeJobTitle(lastThree)) {
      tokens.splice(-3);
      continue;
    }
    if (looksLikeJobTitle(lastTwo)) {
      tokens.splice(-2);
      continue;
    }
    if (looksLikeJobTitle(last)) {
      tokens.pop();
      continue;
    }
    break;
  }
  return tokens.join(' ');
}

function splitTitleCompanyDash(title: string): { title: string; company: string } | null {
  const spaced = String(title || '')
    .split(/\s+[-–—]\s+|\s*[|:]\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (spaced.length < 2) return null;
  const left = spaced[0];
  const right = spaced
    .slice(1)
    .join(' – ')
    .replace(/\s*\((?:ai\s+)?tech company\)/i, '')
    .trim();
  if (looksLikeJobTitle(left) && !looksLikeJobTitle(right)) return { title: left, company: right };
  if (looksLikeJobTitle(right) && !looksLikeJobTitle(left)) return { title: right, company: left };
  return null;
}

export function repairWorkExperienceRow<
  T extends { title?: string; company?: string; description?: string; location?: string | null },
>(w: T): T {
  let title = String(w.title || '').trim();
  let company = cleanCompany(String(w.company || '').trim())
    .replace(/\(\s*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  let description = preserveUploadedCvText(String(w.description || ''));
  let location = String((w as { location?: string | null }).location || '').trim();

  if (DURATION_ONLY_RE.test(title)) title = '';
  if (DURATION_ONLY_RE.test(company)) company = '';
  if (/^page\s+\d+(?:\s+of\s+\d+)?$/i.test(title)) title = '';
  if (/^page\s+\d+(?:\s+of\s+\d+)?$/i.test(company)) company = '';
  if (looksLikeLocationField(company)) {
    if (!location) location = company;
    company = '';
  }
  if (SECTION_HEADER_FIELD_RE.test(company)) company = '';
  if (SECTION_HEADER_FIELD_RE.test(title) || PLACEHOLDER_TITLE_RE.test(title)) title = '';
  if (
    SENTENCE_COMPANY_RE.test(company) ||
    looksLikeProseCompany(company) ||
    (company.length > 55 && /\s/.test(company) && looksLikeJobTitle(title))
  ) {
    const desc = String(description || '');
    if (/[A-Za-z]-\n/.test(desc) && /^[a-z]/.test(company)) {
      description = desc.replace(/([A-Za-z])-\n/, `$1-${company}\n`);
    } else if (/[A-Za-z]-$/.test(desc.trim()) && /^[a-z]/.test(company)) {
      description = desc.trim() + company;
    } else if (desc && /^[a-z]/.test(company)) {
      const lines = desc.split('\n');
      lines[0] = `${lines[0].replace(/\s+$/, '')} ${company}`.replace(/\s+/g, ' ');
      description = lines.join('\n');
    } else {
      description = [company, desc].filter(Boolean).join('\n');
    }
    company = '';
  }

  // Handle embedded title–company separators ("Morrisons – Retail Assistant", "Waitrose – Night Replenishment")
  const split = splitTitleCompanyDash(title);
  if (split) {
    title = split.title;
    if (!company || company.length < 3 || /supermarket|retail|store|company/i.test(company)) {
      company = split.company.replace(TRAILING_LOCATION_RE, '').trim();
    }
  }

  if (company && title && looksLikeJobTitle(company) && !looksLikeJobTitle(title)) {
    const tmp = title;
    title = company;
    company = tmp;
  }

  ({ title, company } = foldDepartmentIntoTitle(title, company));

  if (!title && description) {
    const lines = description.split('\n').map((l) => l.trim()).filter(Boolean);
    const first = lines[0] || '';
    const head = first.split(',')[0].trim();
    if (looksLikeJobTitle(head) && head.length <= 70) {
      title = head;
      const afterComma = first.includes(',') ? first.slice(first.indexOf(',') + 1).trim() : '';
      if (afterComma && !company && !looksLikeJobTitle(afterComma) && afterComma.length <= 90) {
        company = afterComma;
      }
      if (lines.length > 1 || afterComma) {
        description = lines.slice(1).join('\n').trim();
      }
    }
  }

  if (!company && description) {
    const org = description.match(/^(?:The\s+)?([A-Z][^.\n]{8,70}?)\s+(?:is|are)\s/);
    if (org?.[1] && !looksLikeJobTitle(org[1]) && !looksLikeLocationField(org[1])) {
      company = org[1].trim();
    }
  }

  return { ...w, title, company, description, ...(location ? { location } : {}) };
}

export function repairTitleCompanySwap<T extends { title?: string; company?: string }>(w: T): T {
  return repairWorkExperienceRow(w);
}

function isOrphanFragmentRow(w: { title?: string; company?: string; startDate?: string; endDate?: string }): boolean {
  if (w.startDate || w.endDate) return false;
  const title = String(w.title || '').trim().toLowerCase();
  const company = String(w.company || '').trim().toLowerCase();
  if (looksLikeJobTitle(title)) return false;

  if (
    /^(product quality|stock availability|order fulfilment|key achievements|responsibilities|duties|deliver exceptional|work collaboratively|handle checkout|support stock)\b/i.test(title) ||
    /^(stock availability|order fulfilment|product quality|etc)\b/i.test(company) ||
    (company.includes('/') && company.includes('and') && !looksLikeJobTitle(title))
  ) {
    return true;
  }
  return false;
}

export function publicWorkExperience<
  T extends {
    title?: string | null;
    company?: string | null;
    description?: string | null;
    location?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  },
>(rows: T[] | null | undefined): T[] {
  const list = (Array.isArray(rows) ? rows : []).map((w) =>
    repairWorkExperienceRow(w as T & { title?: string; company?: string; description?: string; location?: string })
  );

  const out: T[] = [];
  let pendingCompany = '';

  const applyPending = (w: T) => {
    const cur = String(w.company || '').trim();
    if (pendingCompany && (!cur || looksLikeProseCompany(cur) || looksLikeDepartment(cur) || looksLikeLocationField(cur))) {
      w.company = pendingCompany;
      pendingCompany = '';
    }
  };

  const absorbFromPrevious = (w: T) => {
    if (!out.length) return;
    const last = out[out.length - 1];
    const title = String(w.title || '').trim();
    const cur = String(w.company || '').trim();
    const titleNeedsPeel =
      !title || looksLikeLocationField(title) || looksLikeProseTitle(title);
    if (titleNeedsPeel) {
      const peeled = peelTrailingJobHeader(String(last.description || ''));
      if (peeled) {
        if (looksLikeLocationField(title) && !(w as any).location) {
          (w as any).location = title;
        } else if (title && !looksLikeLocationField(title)) {
          w.description = formatWorkExperienceDescription(
            [title, cur && looksLikeProseCompany(cur) ? cur : '', w.description]
              .filter(Boolean)
              .join('\n')
          );
          if (cur && looksLikeProseCompany(cur)) w.company = '';
        }
        w.title = peeled.title;
        if (
          !String(w.company || '').trim() ||
          looksLikeProseCompany(String(w.company || '')) ||
          looksLikeLocationField(String(w.company || '')) ||
          looksLikeDepartment(String(w.company || ''))
        ) {
          w.company = peeled.company;
        }
        last.description = formatWorkExperienceDescription(peeled.rest);
        return;
      }
    }
    if (!cur || looksLikeProseCompany(cur) || looksLikeDepartment(cur)) {
      const peeledCo = peelTrailingCompany(String(last.description || ''));
      if (peeledCo) {
        w.company = peeledCo.company;
        last.description = formatWorkExperienceDescription(peeledCo.rest);
      }
    }
    if (cur && looksLikeProseCompany(cur)) {
      w.description = formatWorkExperienceDescription([cur, w.description].filter(Boolean).join('\n'));
      w.company = '';
    }
    const lastDesc = String(last.description || '').trim();
    const companyNow = String(w.company || '').trim();
    if (/[A-Za-z]-$/.test(lastDesc) && companyNow && looksLikeProseCompany(companyNow)) {
      last.description = `${lastDesc}${companyNow}`;
      w.company = '';
    }
  };

  for (const w of list) {
    if (isStatsHighlightRow(w as any)) {
      const peeledCo = peelTrailingCompany(String(w.description || ''));
      if (peeledCo?.company) pendingCompany = peeledCo.company;
      continue;
    }

    if (isContinuationRow(w as any)) {
      if (out.length > 0) {
        const last = out[out.length - 1];
        const fragText = [w.title, w.company, w.description].filter(Boolean).join('\n');
        last.description = formatWorkExperienceDescription([last.description, fragText].filter(Boolean).join('\n'));
        const peeledCo = peelTrailingCompany(String(last.description || ''));
        if (peeledCo?.company) {
          pendingCompany = peeledCo.company;
          last.description = formatWorkExperienceDescription(peeledCo.rest);
        }
      } else if (isOrphanFragmentRow(w as any)) {
        continue;
      } else {
        applyPending(w);
        w.description = formatWorkExperienceDescription(String(w.description || ''));
        out.push(w);
      }
      continue;
    }

    applyPending(w);
    absorbFromPrevious(w);
    applyPending(w);

    if (isOrphanFragmentRow(w as any)) {
      if (out.length > 0) {
        const last = out[out.length - 1];
        const fragText = [w.title, w.company, w.description].filter(Boolean).join('\n');
        last.description = [last.description, fragText].filter(Boolean).join('\n\n');
      }
      continue;
    }

    if (
      String(w?.title || '').trim() ||
      String(w?.company || '').trim() ||
      String(w?.description || '').trim().length > 80
    ) {
      w.description = formatWorkExperienceDescription(String(w.description || ''));
      out.push(w);
    }
  }
  return out;
}

function repairEducationList<
  T extends { institution?: string | null; degree?: string | null; startDate?: string | null; endDate?: string | null; description?: string | null },
>(rows: T[]): T[] {
  const result: T[] = [];
  const isSchoolName = (s: string) =>
    /university|college|institute|school|academy|polytechnic|faculty/i.test(s);
  const isGradeOrShort = (s: string) =>
    /^(merit|pass|distinction|first class|hono?urs|cgpa|gpa|grade|score|mark)\b|^\d+(\.\d+)?(\/\d+)?$/i.test(
      s.trim()
    ) || /^cgpa:\s*\d/i.test(s.trim());
  const isDegreeTitle = (s: string) =>
    /\b(m\.?\s?tech|b\.?\s?tech|b\.?\s?e\b|m\.?\s?sc|b\.?\s?sc|m\.?\s?a\b|b\.?\s?a\b|ph\.?\s?d|mba|msc|bsc|btech|mtech|ba|ma|phd|diploma|bachelor|master|degree|associate)\b/i.test(
      s
    );

  const isFieldOfStudy = (s: string) =>
    /^(marketing|finance|commerce|arts|science|management|computer science|business|economics|accounting)$/i.test(
      s.trim()
    );

  for (let i = 0; i < rows.length; i++) {
    let curr = { ...rows[i] };
    let inst = String(curr.institution || '').trim();
    let deg = String(curr.degree || '').trim();

    if (i + 1 < rows.length && isFieldOfStudy(inst) && isDegreeTitle(deg)) {
      const next = rows[i + 1];
      const nextInst = String(next.institution || '').trim();
      const nextDeg = String(next.degree || '').trim();
      if (isSchoolName(nextInst)) {
        curr.institution = nextInst;
        curr.description = [curr.description, !isDegreeTitle(nextDeg) ? nextDeg : '', next.description]
          .filter(Boolean)
          .join('\n');
        if (isDegreeTitle(nextDeg) && !deg) curr.degree = nextDeg;
        i++;
        result.push(curr);
        continue;
      }
    }

    if (inst.toLowerCase() === deg.toLowerCase() && isSchoolName(inst)) {
      deg = '';
    }

    if (i + 1 < rows.length) {
      const next = rows[i + 1];
      const nextInst = String(next.institution || '').trim();
      const nextDeg = String(next.degree || '').trim();

      if (
        isSchoolName(inst) &&
        !deg &&
        isDegreeTitle(nextDeg) &&
        (isGradeOrShort(nextInst) || isSchoolName(nextInst) || nextInst.toLowerCase() === inst.toLowerCase())
      ) {
        curr.degree = nextDeg;
        if (!curr.startDate && next.startDate) curr.startDate = next.startDate;
        if (!curr.endDate && next.endDate) curr.endDate = next.endDate;
        if (next.description) {
          curr.description = [curr.description, next.description].filter(Boolean).join('\n');
        }
        i++; // skip next row
        result.push(curr);
        continue;
      }

      // City-as-institution row after a real school (IIT / Mumbai, Nagpur University / Nagpur)
      if (
        isSchoolName(inst) &&
        looksLikeLocationField(nextInst) &&
        (isDegreeTitle(nextDeg) || isDegreeTitle(deg))
      ) {
        if (isDegreeTitle(nextDeg) && (!deg || nextDeg.length > deg.length)) {
          curr.degree = nextDeg;
        }
        if (!curr.startDate && next.startDate) curr.startDate = next.startDate;
        if (!curr.endDate && next.endDate) curr.endDate = next.endDate;
        if (next.description) {
          curr.description = [curr.description, next.description].filter(Boolean).join('\n');
        }
        i++;
        result.push(curr);
        continue;
      }
    }

    if (isGradeOrShort(inst) && isSchoolName(deg)) {
      const tmp = inst;
      inst = deg;
      deg = tmp;
    }
    curr.institution = inst;
    curr.degree = deg;
    result.push(curr);
  }

  return result.filter(
    (e) => String(e.institution || '').trim().length > 1 || String(e.degree || '').trim().length > 1
  );
}

export function publicEducation<
  T extends { institution?: string | null; degree?: string | null; startDate?: string | null; endDate?: string | null; description?: string | null },
>(rows: T[] | null | undefined): T[] {
  const list = (Array.isArray(rows) ? rows : []).filter(
    (e) =>
      String(e?.institution || '').trim().length > 1 ||
      String(e?.degree || '').trim().length > 1
  );

  return repairEducationList(list as any);
}

/**
 * Parse a LinkedIn/GitHub-style handle into name tokens.
 * Keeps single-letter middle initials ("gayathri-satheesh-l-3b135624a" → Gayathri Satheesh L)
 * and strips trailing id segments that contain digits.
 */
function namePartsFromHandle(raw: string): string[] {
  let h = String(raw || '')
    .trim()
    .replace(/^(?:https?:\/\/)?(?:www\.)?(?:github\.com|linkedin\.com\/in)\//i, '')
    .replace(/\/$/, '')
    .split(/[/?#]/)[0]
    .toLowerCase();
  if (!h) return [];
  // Drop trailing LinkedIn id segments that include digits ("…-3b135624a")
  h = h.replace(/(?:-[a-z]*\d[a-z0-9]*)+$/i, '');
  const parts = h
    .split(/[._-]+/)
    .map((p) => p.trim())
    .filter(
      (p) =>
        p &&
        /^[a-z]+$/i.test(p) &&
        !/^(cv|resume|mail|email|official|in|com|www)$/i.test(p)
    );
  // Allow a single-letter middle/last initial, but not as the only token
  return parts.filter((p, i) => p.length >= 2 || (p.length === 1 && i > 0 && parts.length >= 2));
}

/**
 * If fullName is a single token (or empty), try to recover last name from email/github/linkedin handle.
 * "Shivam" + shivamrajput2362@… → "Shivam Rajput"
 */
function nameLooksIncomplete(name: string): boolean {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return true;
  const last = parts[parts.length - 1];
  // "Lokesh T" is a first name + initial — still recover the last name
  if (last.length === 1) return true;
  return false;
}

export function enrichNameFromContact(
  fullName: string,
  opts?: { email?: string; github?: string; linkedin?: string; authName?: string }
): string {
  let name = normalizeName(fullName);
  if (name && !nameLooksIncomplete(name)) return name;

  // Prefer verified auth display name when parse only got a first name / garbage
  if (opts?.authName) {
    const auth = normalizeName(opts.authName);
    if (auth && auth.split(/\s+/).length >= 2) return auth;
    if (!name && auth) name = auth;
  }

  const first = (name || '').split(/\s+/)[0] || '';
  const compactFirst = first.toLowerCase().replace(/[^a-z]/g, '');

  const handles = [opts?.linkedin, opts?.github, opts?.email?.split('@')[0]]
    .filter(Boolean)
    .map((s) =>
      String(s)
        .replace(/^(?:https?:\/\/)?(?:www\.)?(?:github\.com|linkedin\.com\/in)\//i, '')
        .replace(/\/$/, '')
        .split(/[/?#]/)[0]
    );

  for (const h of handles) {
    // Prefer hyphen/underscore structure so "satheesh-l" never becomes "Satheeshl"
    if (/[._-]/.test(h)) {
      const parts = namePartsFromHandle(h);
      if (parts.length >= 2) {
        const candidate = parts
          .slice(0, 4)
          .map((p) => (p.length === 1 ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1)))
          .join(' ');
        const n = normalizeName(candidate);
        if (n && n.split(/\s+/).length >= 2) return n;
      }
      // Separated handles must not fall through to letter-gluing
      continue;
    }

    const letters = h.toLowerCase().replace(/[^a-z]/g, '');
    if (!letters || letters.length < 5) continue;
    if (compactFirst && letters.startsWith(compactFirst) && letters.length >= compactFirst.length + 3) {
      const rest = letters.slice(compactFirst.length);
      // single last-name token (no glued initials / hash letters)
      if (/^[a-z]{3,16}$/.test(rest)) {
        const lastTok = name.split(/\s+/).pop() || '';
        // Expand "Lokesh T" when email remainder is "trivedi"
        if (lastTok.length === 1 && rest[0] !== lastTok.toLowerCase()) {
          // initial doesn't match — keep looking
        } else {
          const last = rest.charAt(0).toUpperCase() + rest.slice(1);
          return normalizeName(`${first} ${last}`) || `${first} ${last}`;
        }
      }
    }
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
  // Filename-derived tails ("vaishnavee-haridas-pdf") are never real slugs.
  if (/-(?:pdf|docx?|txt|rtf|pages|png|jpe?g|webp|gif|bmp)$/i.test(s)) return true;
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(s)) return true;
  return false;
}

export function nameToProfileSlug(name: string): string {
  const parts = String(name || '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((p) => p.replace(/[^a-z0-9]/g, ''))
    .filter(
      (p) =>
        p &&
        ![
          'https', 'http', 'www', 'com', 'linkedin', 'github', 'in', 'cv', 'resume',
          'pdf', 'docx', 'doc', 'txt', 'rtf', 'pages', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp',
        ].includes(p)
    );
  if (!parts.length) return 'profile';
  return parts.slice(0, 3).join('-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'profile';
}

export function splitSkills(skills: unknown[] | null | undefined): string[] {
  const KNOWN_SKILLS = [
    'Apache Kafka',
    'Amazon Kinesis',
    'Apache Spark',
    'Networking Protocols',
    'Kubernetes',
    'ZeroMQ',
    'Grafana',
    'Python',
    'Redis',
    'SQL',
    'AWS',
  ].sort((a, b) => b.length - a.length);

  const explodePart = (raw: string): string[] => {
    let val = String(raw || '').replace(/\s+/g, ' ').trim();
    if (!val) return [];
    const found: string[] = [];
    let rest = ` ${val} `;
    for (const skill of KNOWN_SKILLS) {
      const re = new RegExp(`\\s${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s`, 'i');
      if (re.test(rest)) {
        found.push(skill);
        rest = rest.replace(re, ' ');
      }
    }
    // CamelCase / acronym joins left after known multi-word products are removed.
    rest = rest
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();
    if (rest) {
      let restPad = ` ${rest} `;
      for (const skill of KNOWN_SKILLS) {
        const re = new RegExp(`\\s${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s`, 'i');
        if (re.test(restPad)) {
          found.push(skill);
          restPad = restPad.replace(re, ' ');
        }
      }
      rest = restPad.replace(/\s+/g, ' ').trim();
    }
    if (found.length) {
      return rest ? [...found, rest] : found;
    }
    return [val];
  };

  let rawList: string[] = [];
  for (const s of skills || []) {
    let val = typeof s === 'string' ? s : String((s as any)?.name ?? '');
    if (!val) continue;
    const parts = val.split(/[,;|]+/).map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      rawList.push(...explodePart(part));
    }
  }

  // Recombine split multi-word skills like "Federated" + "Learning"
  const recombined: string[] = [];
  for (let i = 0; i < rawList.length; i++) {
    const curr = rawList[i];
    const next = rawList[i + 1] || '';
    if (/^(federated|machine|deep|computer|natural|transfer)$/i.test(curr) && /^(learning|vision|processing)$/i.test(next)) {
      recombined.push(`${curr} ${next}`);
      i++; // skip next
    } else {
      recombined.push(curr);
    }
  }

  const out: string[] = [];
  const seen = new Set<string>();
  const baseOf = (val: string) =>
    val
      .toLowerCase()
      .replace(/\s*\d+(\.\d+)*\+?\s*$/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const knownLower = new Set(KNOWN_SKILLS.map((s) => s.toLowerCase()));

  const push = (rawVal: string) => {
    let val = rawVal
      .replace(/\s*[-–—]\s*(Alison\.com|Naan Muthalvan|FaBC|Coursera|Udemy|EdX)\b/gi, '')
      .trim()
      .replace(/\s+/g, ' ');
    if (!val || val.length > 60) return;
    if (/^\d+(\.\d+)*\+?$/.test(val)) return;
    if (/^[&+]/.test(val)) return;
    if (/@$/.test(val) || /\.$/.test(val)) return;
    if (/\b(award|recognition|summit|competency)\b/i.test(val)) return;
    if (/^page\s+\d+/i.test(val)) return;
    if (/^(building|developed|go language)\b/i.test(val)) return;
    if (/\b to \b/.test(val)) return;
    if (
      !knownLower.has(val.toLowerCase()) &&
      /^[A-Z][a-z]+\s+[A-Z][a-z]+$/.test(val) &&
      !/\b(ai|ml|native|script|chain|cloud|data|web|dev)\b/i.test(val)
    ) {
      return;
    }
    if (val.split(/\s+/).length > 5) return;
    const key = val.toLowerCase();
    if (seen.has(key)) return;
    const base = baseOf(val);
    if (base && base !== key) {
      if (seen.has(base)) return;
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

  for (const s of recombined) {
    push(s);
    if (out.length >= 30) break;
  }

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
  } else if (SECTION_TITLE_NAME_RE.test(rawName.trim()) || SECTION_TITLE_NAME_RE.test(name)) {
    issues.push('name looks like a resume section title');
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
      // soft: formatWorkExperienceDescription repairs layout; don't force re-parse forever
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
    if (data.personalInfo.email) {
      data.personalInfo.email = repairSpacedEmail(data.personalInfo.email);
    }
    // Strip path junk from github/linkedin handles
    for (const k of ['github', 'linkedin'] as const) {
      let v = String(data.personalInfo[k] || '');
      if (!v) continue;
      data.personalInfo[k] = sanitizeSocialHandle(v, k);
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
    // Never truncate uploaded summary / about text
    data.summary = isContactHeaderText(data.summary)
      ? ''
      : isResumeDumpText(data.summary)
        ? extractCleanSummary(data.summary)
        : cleanDescription(data.summary);
  }

  if (Array.isArray(data.workExperience)) {
    const cleaned = data.workExperience
      .filter((w: any) => w && (w.title?.trim() || w.company?.trim() || String(w.description || '').trim().length > 80))
      // Drop regex-parser placeholders that never got real fields
      .filter((w: any) => {
        const title = String(w.title || '').trim();
        const company = String(w.company || '').trim();
        const desc = String(w.description || '').trim();
        if (/^position$/i.test(title) && /^company$/i.test(company)) return false;
        if (/^position$/i.test(title) && !company) return false;
        if (/^company$/i.test(company) && !title) return false;
        // Placeholder company with no real title — leftover regex shell
        if (/^company$/i.test(company) && /^position$/i.test(title)) return false;
        // Company field swallowed a bullet — keep the job, fold the line back
        if (/^[•▪●]/.test(company) || company.length > 80) {
          w.description = [company, desc].filter(Boolean).join('\n');
          w.company = '';
        }
        return true;
      })
      .map((w: any) => ({
        ...w,
        location: cleanLocation(w.location),
        startDate: cleanDate(w.startDate),
        endDate: cleanDate(w.endDate),
      }));
    // Cross-row PDF wrap (metrics cards, hyphen splits, trailing employers) must
    // be healed before persist — not only on public render.
    data.workExperience = publicWorkExperience(cleaned).filter(
      (w: any) => String(w.title || '').trim() || String(w.company || '').trim()
    );
  }

  if (Array.isArray(data.education)) {
    // IMPORTANT: drop dump entries entirely — do NOT truncate them into looking valid
    const cleanedEdu = data.education
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
        description: preserveUploadedCvText(e.description)
          .replace(CONTACT_STRIP_RE, '')
          .replace(/\s{2,}/g, ' ')
          .trim(),
      }))
      .filter((e: any) => e.institution.length > 1 || e.degree.length > 1);
    data.education = publicEducation(cleanedEdu);
  }

  if (Array.isArray(data.skills)) {
    data.skills = splitSkills(data.skills);
  }

  // Wall-of-text "summary" that is clearly a full resume dump → extract prose only
  if (isResumeDumpText(String(data.summary || ''))) {
    data.summary = extractCleanSummary(data.summary);
  }

  // Synthesize a short summary when model omitted it but we have roles (after skill cleanup)
  if (!String(data.summary || '').trim() && Array.isArray(data.workExperience) && data.workExperience.length) {
    const top = data.workExperience[0];
    const title = String(top.title || '').trim();
    const company = String(top.company || '').trim();
    const realTitle = title && !/^position$/i.test(title) ? title : '';
    const realCompany = company && !/^company$/i.test(company) ? company : '';
    const bits = [
      realTitle && realCompany ? `${realTitle} at ${realCompany}` : realTitle || realCompany,
      data.workExperience[1]?.company && !/^company$/i.test(String(data.workExperience[1].company))
        ? `Previously at ${data.workExperience[1].company}`
        : null,
      Array.isArray(data.skills) && data.skills.length
        ? `Skills include ${data.skills.slice(0, 6).join(', ')}`
        : null,
    ].filter(Boolean);
    if (bits.length) {
      // Synthesized fallback only — not uploaded CV text
      data.summary = cleanDescription(bits.join('. ') + '.', 400);
    }
  }

  if (Array.isArray(data.customSections)) {
    data.customSections = data.customSections
      .filter((cs: any) => cs && String(cs.sectionTitle || '').trim())
      .map((cs: any) => {
        const title = String(cs.sectionTitle || '').trim();
        return {
          ...cs,
          sectionTitle: title,
          items: Array.isArray(cs.items)
            ? cs.items.map((item: any) => ({
                ...item,
                title: String(item.title || '').trim(),
                subtitle: String(item.subtitle || '').trim(),
                date: String(item.date || '').trim(),
                // Keep full uploaded / salvage text — never truncate
                description: preserveUploadedCvText(item.description),
              }))
            : [],
        };
      });
  }

  return data;
}

/**
 * Name + phone/email/LinkedIn chrome with no prose — often dumped into `about`.
 * Shorter than a full resume dump (those are handled by isResumeDumpText).
 */
export function isContactHeaderText(raw: string): boolean {
  const t = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!t || t.length > 320) return false;
  const hasEmail = EMAIL_RE.test(t);
  const hasPhone = PHONE_RE.test(t) || /\+\d{1,3}[\s.-]?\d{8,12}/.test(t);
  const hasUrl = URL_IN_FIELD_RE.test(t);
  const pipes = (t.match(/\|/g) || []).length;
  const sentences = (t.match(/[.!?](?:\s|$)/g) || []).length;
  if (sentences > 0) return false;
  if ((hasEmail || hasPhone) && (pipes >= 1 || hasUrl)) return true;
  if (hasEmail && hasPhone && t.length < 240) return true;
  return false;
}

/** True when a string looks like a full CV pasted into one field (not a real summary). */
export function isResumeDumpText(raw: string): boolean {
  const t = String(raw || '').trim();
  if (isContactHeaderText(t)) return true;
  if (t.length < 280) return false;
  const markers = t.match(MULTI_SECTION_DUMP_RE) || [];
  const distinct = new Set(markers.map((m) => m.toLowerCase()));
  if (distinct.size >= 2) return true;

  // Multiple resume SECTION HEADERS in one blob (Title Case / ALL CAPS only —
  // do NOT match lowercase "experience" / "skills" inside normal prose).
  const sectionLabels =
    t.match(
      /\b((?:Executive|Professional|Career)\s+Summary|Summary|Education|Experiences?|Employment(?:\s+History)?|Skills?|Projects?|Certifications?|Work\s+Experience|EXECUTIVE\s+SUMMARY|PROFESSIONAL\s+SUMMARY|EDUCATION|EXPERIENCES?|SKILLS?|PROJECTS?|CERTIFICATIONS?)\b/g
    ) || [];
  const distinctSections = new Set(
    sectionLabels.map((s) => s.toLowerCase().replace(/\s+/g, ' ').trim())
  );
  if (distinctSections.size >= 2 && t.length > 350) return true;

  // Contact embedded alongside at least one section header → dump
  if (
    EMAIL_RE.test(t) &&
    PHONE_RE.test(t) &&
    t.length > 400 &&
    distinctSections.size >= 1
  ) {
    return true;
  }

  // Collapsed one-liners: contact chrome + experience header + bullets
  const hasContactChrome =
    /\b(phone|linkedin|mail|email|portfolio|behance|github)\b/i.test(t) &&
    (t.match(/\|/g) || []).length >= 2;
  const hasExp =
    /\b(experiences?|employment|work\s+history)\b/i.test(t) &&
    (t.includes('•') || /\b(20\d{2}|present)\b/i.test(t));
  if (hasContactChrome && hasExp) return true;
  if (t.length > 500 && (t.match(/•/g) || []).length >= 3 && /\b20\d{2}\b/.test(t)) return true;
  return false;
}

/**
 * When `about` is a CV dump, pull a real prose summary (and optional headline)
 * instead of showing the wall of text on the public page.
 */
export function extractCleanSummary(raw: string): string {
  const t = String(raw || '').trim();
  if (!t) return '';
  if (isContactHeaderText(t)) return '';

  // Prefer labeled summary bodies even when the blob is not flagged as a dump
  const sectionBody = t.match(
    /(?:EXECUTIVE\s+SUMMARY|PROFESSIONAL\s+SUMMARY|CAREER\s+SUMMARY|Executive\s+Summary|Professional\s+Summary|Career\s+Summary|Summary|SUMMARY|TENTANG\s+SAYA|Tentang\s+Saya|About\s+Me|ABOUT\s+ME)\s*[:\-–—.]?\s*([\s\S]+?)(?=\s+(?:EDUCATION|EXPERIENCES?|EMPLOYMENT(?:\s+HISTORY)?|SKILLS?|PROJECTS?|CERTIFICATIONS?|Education|Experiences?|Employment(?:\s+History)?|Skills?|Projects?|Certifications?|Work\s+Experience|Technical\s+Skills|PENGALAMAN|PENDIDIKAN|KEAHLIAN)\b|$)/
  );
  if (sectionBody?.[1] && sectionBody[1].trim().length >= 80) {
    return finalizeExtractedSummary(sectionBody[1]);
  }

  if (!isResumeDumpText(t)) return cleanDescription(t);

  // Strip leading ALL-CAPS name + title + contact chrome, keep remaining prose
  let rest = t
    .replace(EMAIL_RE, ' ')
    .replace(PHONE_RE, ' ')
    .replace(URL_IN_FIELD_RE, ' ')
    .replace(
      /^(?:[A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){0,4})\s+/,
      ''
    )
    .replace(
      /^(?:Senior\s+)?(?:Vice\s+President|Director|Manager|Engineer|Developer|Designer|Lead|Head|Founder|Consultant)[^|]{0,80}\|?/i,
      ''
    )
    .replace(/\s*[|·•]\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  // Cut at first later section label if still present (case-sensitive headers only)
  rest = rest.split(
    /\b(?:Education|Experiences?|Employment|Skills?|Projects?|Certifications?|EDUCATION|EXPERIENCES?|SKILLS?)\b/
  )[0];
  return finalizeExtractedSummary(rest);
}

/** Finalize an extracted about/summary body — never length-truncate uploaded prose. */
function finalizeExtractedSummary(raw: string): string {
  let text = preserveUploadedCvText(raw).replace(/\s+/g, ' ').trim();
  // Reject contact-chrome scraps that aren't real prose
  if (text.length < 80) return '';
  if (/^(email|phone|linkedin|github|alamat|address|no\s*:)/i.test(text)) return '';
  if (
    text.length < 180 &&
    (EMAIL_RE.test(text) || URL_IN_FIELD_RE.test(text) || /linkedin\.com|github\.com/i.test(text))
  ) {
    return '';
  }
  // Indonesian / labeled "about me" bodies
  const labeled = text.match(
    /(?:tentang\s+saya|about\s+me|profile)\s*[:\-–—.]?\s*([\s\S]{80,})/i
  );
  if (labeled?.[1]) text = preserveUploadedCvText(labeled[1]).replace(/\s+/g, ' ').trim();

  if (text.length > 120 && !/[.!?]"?$/.test(text)) {
    const lastStop = Math.max(
      text.lastIndexOf('. '),
      text.lastIndexOf('! '),
      text.lastIndexOf('? ')
    );
    if (lastStop > text.length * 0.4) {
      text = text.slice(0, lastStop + 1).trim();
    }
  }
  // Still starts mid-sentence ("and led…") — drop leading conjunction crumbs
  text = text.replace(/^(?:and|or|with|while|including)\s+/i, '').trim();
  if (text.length < 80) return '';
  return text;
}

/** Repair emails that OCR/PDF extraction split ("name 2203 @gmail.com"). */
export function repairSpacedEmail(raw: string): string {
  let s = String(raw || '').trim();
  if (!s) return '';
  s = s
    .replace(/\b([a-z0-9._+-]+)\s+(\d{2,})\s*@\s*([a-z0-9.-]+\.[a-z]{2,})\b/gi, '$1$2@$3')
    .replace(/\b([a-z0-9._+-]+)\s+@\s*([a-z0-9.-]+\.[a-z]{2,})\b/gi, '$1@$2')
    .replace(/\s+/g, '');
  return EMAIL_RE.test(s) ? s.match(EMAIL_RE)![0] : String(raw || '').trim();
}

/** Strip query/hash junk from LinkedIn/GitHub handles (iOS share links, UTMs). */
export function sanitizeSocialHandle(
  raw: string,
  kind: 'linkedin' | 'github' | 'website' = 'linkedin'
): string {
  let v = String(raw || '').trim();
  if (!v) return '';
  v = v
    .replace(/^(?:https?:\/\/)?(?:www\.)?/i, '')
    .replace(/\/$/, '');
  if (kind === 'linkedin') {
    v = v.replace(/^(?:linkedin\.com\/)?(?:in\/)?/i, '');
  } else if (kind === 'github') {
    v = v.replace(/^(?:github\.com\/)/i, '');
  }
  v = v.split(/[?#]/)[0].replace(/\/+$/, '').trim();
  if (kind === 'linkedin' && (/^linkedin$/i.test(v) || /^linkedin\s+profile$/i.test(v))) return '';
  if (kind === 'github' && (/^github$/i.test(v) || /^git$/i.test(v))) return '';
  if (v.length < 3 || /[-_.]$/.test(v) || /^[-_.]/.test(v)) return '';
  return v;
}
