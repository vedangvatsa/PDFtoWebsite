/**
 * Import India internship postings into jobs:
 *  - Indian Army via AICTE portal — list URLs, then each internship-details.php
 *  - MoSPI NIOS cycles via public API
 *  - NITI Aayog Internship Scheme (workforindia.niti.gov.in)
 *
 * Usage: node .github/scripts/import-india-internships.mjs
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY)
 */
import crypto from 'crypto';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { normalizeJobDescriptionForStorage } from './lib/normalize-job-description.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
try {
  require('dotenv').config({ path: resolve(__dirname, '../../.env.local') });
  require('dotenv').config();
} catch {
  /* optional */
}

const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
).replace(/\/$/, '');
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase URL / service role key');
  process.exit(1);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function toCompanyKey(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Noise words dropped when building pretty job slugs. */
const SLUG_STOP = new Set([
  'a', 'an', 'and', 'the', 'of', 'for', 'in', 'on', 'to', 'with', 'by', 'or',
  'intern', 'internship', 'interns', 'required', 'hiring', 'passionate',
  'about', 'related', 'projects', 'project', 'existing', 'based', 'enabled',
  'indian', 'army', 'mospi', 'niti', 'aayog', 'national', 'official', 'statistics', 'nios',
  'phase', 'under', 'including', 'from', 'into', 'using', 'via', 'allied',
  'aspects', 'work', 'module', 'modules', 'application', 'applications',
  'system', 'systems', 'technology', 'technologies',
]);

/** Prefer shorter aliases for common tech tokens. */
const SLUG_ALIAS = {
  artificial: 'ai',
  intelligence: null, // dropped when paired after ai
  machine: 'ml',
  learning: null,
  cybersecurity: 'cyber',
  security: 'sec',
  developer: 'dev',
  development: 'dev',
  engineering: 'eng',
  engineer: 'eng',
  software: 'sw',
  mobile: 'mobile',
  android: 'android',
  robotics: 'robotics',
  autonomous: 'auto',
  unmanned: 'uas',
  aerial: null,
  drone: 'drone',
  uav: 'uav',
  drones: 'drone',
  analysis: 'analytics',
  analyst: 'analytics',
  analytics: 'analytics',
  automation: 'auto',
  digitization: 'digitize',
  digital: 'digital',
  communication: 'comms',
  communications: 'comms',
  media: 'media',
  content: 'content',
  creation: 'create',
  fullstack: 'fullstack',
  'full-stack': 'fullstack',
  stack: null,
  full: 'full',
  enterprise: 'erp',
  resource: null,
  planning: null,
  sap: 'sap',
  erp: 'erp',
  ecc: null,
  zoho: 'zoho',
  creator: 'creator',
  elastic: 'elastic',
  dashboard: 'dash',
  legal: 'legal',
  document: 'docs',
  generator: 'gen',
  wargaming: 'wargame',
  modeling: 'sim',
  simulation: 'sim',
  antenna: 'antenna',
  design: 'design',
  space: 'space',
  domain: 'domain',
  awareness: 'sda',
  hospital: 'hospital',
  medical: 'med',
  workflow: 'workflow',
  optimisation: 'opt',
  optimization: 'opt',
  pattern: 'pattern',
  recognition: 'recog',
  computer: 'cv',
  vision: null,
  natural: 'nlp',
  language: null,
  sql: 'sql',
  large: null,
  models: 'llm',
  model: 'model',
  decision: 'dss',
  support: null,
  infusion: 'infusion',
  operational: 'ops',
  devops: 'devops',
  devsecops: 'devsecops',
  social: 'social',
  graphic: 'design',
  outreach: null,
  financial: 'fin',
  fianacial: 'fin', // portal typo
  management: 'mgmt',
  data: 'data',
  prepation: 'prep',
  preperation: 'prep', // portal typo
  research: 'research',
  reserch: 'research', // portal typo
  tech: 'tech',
  assesment: 'assess',
  assessment: 'assess',
  counter: 'c',
  low: 'lowcode',
  code: null,
  no: null,
  rd: 'rd',
  arch: 'arch',
  layout: null,
  vetting: null,
  web: 'web',
  enhancement: null,
  devp: null,
  upgradation: 'tune',
  fine: null,
  tuning: 'tune',
  post: null,
  training: 'train',
  integration: 'integrate',
  resilience: 'resil',
  risk: 'risk',
  transform: 'xform',
  transformation: 'xform',
  strategic: null,
  mass: null,
  flight: 'flight',
  ofc: null,
  laying: null,
  ground: null,
  information: null,
  ci: null,
  cd: null,
  self: null,
  host: null,
  hosted: null,
};

/**
 * Pretty short job slug (≤12 chars preferred, max 16).
 * MoSPI cycles → nios-p1-26; Army titles → keyword slug.
 * Collision: append 2-char hash only when needed.
 */
function prettyJobSlug(title, uniqueSeed, used) {
  const raw = String(title || '').trim();
  let base = '';

  // MoSPI / NIOS cycles → nios-p{n}-{yy}
  const phaseM = raw.match(/phase\s*(i{1,3}|iv|\d+)/i);
  if (phaseM && /nios|official statistics|mospi/i.test(raw)) {
    const p = phaseM[1].toLowerCase();
    const phaseNum = { i: '1', ii: '2', iii: '3', iv: '4' }[p] || p.replace(/^0+/, '');
    const yearM = raw.match(/20(\d{2})/);
    base = yearM ? `nios-p${phaseNum}-${yearM[1]}` : `nios-p${phaseNum}`;
  } else {
    // Normalize separators, split tokens
    const tokens = raw
      .toLowerCase()
      .replace(/r\s*&\s*d|\br\s+and\s+d\b/gi, ' rd ')
      .replace(/ai\s*[&/]\s*ml|\ba\.?i\.?\s*&\s*m\.?l\.?/gi, ' ai ml ')
      .replace(/full[\s-]*stack/gi, ' fullstack ')
      .replace(/&/g, ' ')
      .replace(/[^a-z0-9\s]+/g, ' ')
      .split(/\s+/)
      .filter((t) => t && !/^\d+$/.test(t)); // drop bare numbering like "1."

    const out = [];
    for (let i = 0; i < tokens.length; i++) {
      let t = tokens[i];
      if (SLUG_STOP.has(t)) continue;
      if (Object.prototype.hasOwnProperty.call(SLUG_ALIAS, t)) {
        const a = SLUG_ALIAS[t];
        if (a == null) continue;
        t = a;
      }
      // Skip repeats (ai … ai, sw … sw)
      if (out.includes(t)) continue;
      const next = out.length ? `${out.join('-')}-${t}` : t;
      // Prefer ≤12; allow up to 16 only if we still have <2 tokens
      if (out.length >= 1 && next.length > 12 && out.length >= 2) break;
      if (out.length >= 1 && next.length > 16) break;
      out.push(t);
      if (out.length >= 3 || next.length >= 10) break;
    }

    base = out.join('-') || 'intern';
    if (base.length > 16) {
      // Drop trailing token rather than mid-word cut
      const parts = base.split('-');
      while (parts.length > 1 && parts.join('-').length > 16) parts.pop();
      base = parts.join('-').slice(0, 16).replace(/-+$/, '');
    }
  }

  base = base.replace(/-+/g, '-').replace(/^-|-$/g, '') || 'intern';
  // Keep within shortJobSlug validator (≤24, but we aim ≤16)
  if (base.length > 16) base = base.slice(0, 16).replace(/-+$/, '');

  let slug = base;
  if (used.has(slug)) {
    const h = crypto.createHash('md5').update(String(uniqueSeed)).digest('hex').slice(0, 2);
    // Collision: prefer first token only when multi-token base is long
    const parts = base.split('-');
    let shortBase = parts.slice(0, 2).join('-');
    if (shortBase.length > 10) shortBase = parts[0].slice(0, 10);
    shortBase = shortBase.replace(/-+$/, '') || 'job';
    slug = `${shortBase}-${h}`;
  }
  // Absolute uniqueness
  let n = 2;
  while (used.has(slug)) {
    const h = crypto.createHash('md5').update(`${uniqueSeed}:${n++}`).digest('hex').slice(0, 2);
    const parts = base.split('-');
    let shortBase = parts.slice(0, 2).join('-');
    if (shortBase.length > 10) shortBase = parts[0].slice(0, 10);
    shortBase = shortBase.replace(/-+$/, '') || 'job';
    slug = `${shortBase}-${h}`;
  }
  used.add(slug);
  return slug;
}

function shortJobExternalId(companySlug, title, uniqueSeed, used) {
  const slug = prettyJobSlug(title, uniqueSeed, used);
  return `${companySlug}_${slug}`;
}

function dedupHash(company, title) {
  return crypto
    .createHash('sha256')
    .update(`${(company || '').toLowerCase().trim()}|${(title || '').toLowerCase().trim()}`)
    .digest('hex')
    .slice(0, 32);
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/?(strong|b|em|i|span|div|section)[^>]*>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#8377;|&rupee;|&#x20b9;/gi, '₹')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function sectionHtml(html, heading) {
  const re = new RegExp(
    `<h4[^>]*>\\s*${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<\\/h4>\\s*([\\s\\S]*?)(?=<h4[^>]*>|<!--\\s*<section|$)`,
    'i'
  );
  const m = html.match(re);
  return m ? m[1] : '';
}

function metaFromDetail(html, label) {
  // <h6>Label</h6><span>value</span>
  const re = new RegExp(
    `<h6[^>]*>\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<\\/h6>\\s*<span[^>]*>([\\s\\S]*?)<\\/span>`,
    'i'
  );
  const m = html.match(re);
  return m ? stripHtml(m[1]) : '';
}

/**
 * Fetch and parse one AICTE internship-details.php page.
 * Only fields present on the official page — nothing invented.
 */
async function fetchAicteDetail(applyUrl) {
  let html = '';
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(applyUrl, {
        headers: {
          'User-Agent': 'CVin.Bio job importer',
          Referer:
            'https://internship.aicte-india.org/dashboard/indianarmy/internship_list.php',
          Accept: 'text/html',
        },
        redirect: 'follow',
      });
      if (!res.ok) {
        await sleep(1000 * (attempt + 1));
        continue;
      }
      html = await res.text();
      break;
    } catch (e) {
      await sleep(1000 * (attempt + 1));
      if (attempt === 3) throw e;
    }
  }
  if (!html) return null;

  // Scope to the internship detail body to avoid footer/modals noise
  const bodyM = html.match(
    /<div class="internship-detail-body">([\s\S]*?)(?:<div class="modal"|Back to Internship List)/i
  );
  const body = bodyM ? bodyM[1] : html;

  const title = stripHtml(
    (body.match(/<h3 class="job-title">([\s\S]*?)<\/h3>/i) || [])[1] || ''
  );
  const company = stripHtml(
    (body.match(/<h5 class="company-name">([\s\S]*?)<\/h5>/i) || [])[1] ||
      'Indian Army'
  );

  const attrs = [
    ...(body.matchAll(/<ul class="job-attributes">([\s\S]*?)<\/ul>/gi) || []),
  ];
  let jobType = '';
  let duration = '';
  let location = '';
  if (attrs[0]) {
    const lis = [...attrs[0][1].matchAll(/<li[^>]*>\s*<span>([\s\S]*?)<\/span>/gi)].map(
      (m) => stripHtml(m[1])
    );
    jobType = lis[0] || '';
    duration = lis[1] || '';
    location = (lis[2] || '').replace(/,\s*$/, '').trim();
  }

  const posted = metaFromDetail(body, 'Date of Posting');
  const start = metaFromDetail(body, 'Start date');
  const stipend = metaFromDetail(body, 'Stipend');
  const credits = metaFromDetail(body, 'No of Credits');
  const deadline = metaFromDetail(body, 'Last Date to Apply');

  const about = stripHtml(sectionHtml(body, 'About the program'));
  const project = stripHtml(sectionHtml(body, 'Description of the Project'));
  const keywords = stripHtml(sectionHtml(body, 'Keywords'));
  const who = stripHtml(sectionHtml(body, 'Who can apply?'));
  const terms = stripHtml(sectionHtml(body, 'Terms of Engagement'));

  const logoM = body.match(
    /<img[^>]+class="img-thumbnail"[^>]+src="([^"]+)"/i
  ) || body.match(/src="(https:\/\/internship\.aicte-india\.org\/dashboard\/indianarmy\/images\/logo\/[^"]+)"/i);
  const logo = logoM ? logoM[1].replace(/&amp;/g, '&') : null;

  return {
    title,
    company: company || 'Indian Army',
    jobType,
    duration,
    location,
    posted,
    start,
    stipend: stipend || null,
    credits,
    deadline,
    about,
    project,
    keywords,
    who,
    terms,
    logo,
  };
}

function normalizeSectionText(text) {
  return String(text || '')
    .replace(/\t+/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Eligibility from AICTE "Who can apply?" — keep every degree line intact.
 * Never drop long specialization lists (B.Tech lines often exceed 250 chars).
 */
function eligibilityBullets(whoText, duration) {
  const who = normalizeSectionText(whoText);
  if (!who) return [];

  // Portal structure: "are from …", "are available …", "have relevant …"
  // Do NOT split on bare "-" (breaks hyphenated words / mid-list dashes).
  const clauses = who
    .replace(/\n-\s+/g, '\n')
    .split(/(?=\bare from\b)|(?=\bare available\b)|(?=\bhave relevant\b)/i)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const out = [];
  for (const raw of clauses) {
    if (/^only those candidates/i.test(raw)) continue;

    if (/^are available for duration/i.test(raw)) {
      const d = raw.match(/duration of\s+([^\n.]+)/i)?.[1]?.trim() || duration;
      out.push(`Available for the full ${d || 'posted'} internship period`);
      continue;
    }
    if (/^have relevant skills/i.test(raw)) {
      out.push('Relevant skills and interest in the project area');
      continue;
    }

    const from = raw.match(/^are from\s+(.+)$/is)?.[1]?.replace(/\s+/g, ' ').trim();
    if (!from) continue;

    const spec = from.match(/^(.*?)\s+with specialisation in\s+(.+)$/i);
    if (spec) {
      // Keep full specialization list — do not truncate
      out.push(`${spec[1].trim()} — ${spec[2].trim()}`);
    } else {
      out.push(from);
    }
  }

  // Cap length only for pathological scrapes; official B.Tech lists are ~300–500 chars
  return [...new Set(out)].filter((s) => s.length > 4 && s.length < 900);
}

/** Count official "are from" degree clauses (unique) for import validation. */
function countOfficialDegreeClauses(whoText) {
  const who = normalizeSectionText(whoText);
  const clauses = who.match(/\bare from\s+.+?(?=\s+are from\b|\s+are available\b|\s+have relevant\b|$)/gi) || [];
  const normalized = clauses.map((c) =>
    c.replace(/\s+/g, ' ').trim().replace(/\s+-\s*$/, '').toLowerCase()
  );
  return new Set(normalized).size;
}

/** Role-specific work themes — labels only, no copied sentences. */
function extractWorkThemes(project, max = 6) {
  const text = normalizeSectionText(project);
  if (!text) return [];

  const themes = [];
  for (const m of text.matchAll(/\d+\.\s*([^:\n]{4,72})/g)) {
    themes.push(m[1].replace(/\s+/g, ' ').trim());
  }
  for (const m of text.matchAll(/(?:^|\n)-\s*([A-Z][^:\n]{4,55}):/g)) {
    themes.push(m[1].replace(/\s+/g, ' ').trim());
  }
  if (/technical requirements/i.test(text) && themes.length < max) {
    themes.push('Technical stack requirements listed on the official posting');
  }

  return [...new Set(themes)]
    .filter((t) => t.length > 3 && !/^technical requirements$/i.test(t))
    .slice(0, max);
}

/** One original sentence describing the role focus (inferred, not copied). */
function roleFocusSentence(title, project, skills) {
  const titleBlob = (title || '').toLowerCase();
  const projectBlob = `${project || ''} ${skills.join(' ')}`.toLowerCase();
  const rules = [
    [/media|communication|content|graphic|social|outreach/i, 'Focus areas include digital media, outreach, and strategic communications.'],
    [/hospital|medical|health|clinical/i, 'Focus areas include healthcare IT, clinical workflows, and medical systems.'],
    [/legal|document generator/i, 'Focus areas include legal-tech tooling, document automation, and compliance workflows.'],
    [/simulation|wargam|modeling|modelling/i, 'Focus areas include modeling, simulation, and operational analysis.'],
    [/space|satellite|antenna|sda/i, 'Focus areas include space-domain systems, RF/antenna work, or related engineering.'],
    [/drone|uav|unmanned|aerial/i, 'Focus areas include drone systems, flight software, and counter-UAS technologies.'],
    [/robot|autonomous/i, 'Focus areas include robotics, autonomous ground systems, and related R&D.'],
    [/data|analytics|dashboard|power bi|excel/i, 'Focus areas include data analysis, reporting, and decision-support tooling.'],
    [/software|android|mobile|full[- ]?stack|erp|sap|zoho|apex|pl\/sql|developer/i, 'Focus areas include software engineering, application development, and platform integration.'],
    [/soc|siem|threat|vetting|zero-trust/i, 'Focus areas include security operations, AI-assisted vetting, and resilient web systems for defence use.'],
    [/cyber|devsecops/i, 'Focus areas include cybersecurity, secure infrastructure, and risk management.'],
    [/ai|ml|llm|machine learning|nlp|computer vision/i, 'Focus areas include AI/ML model work, automation, and applied intelligent systems.'],
  ];
  for (const [re, sentence] of rules) {
    if (re.test(titleBlob)) return sentence;
  }
  for (const [re, sentence] of rules) {
    if (re.test(projectBlob)) return sentence;
  }
  return 'Hands-on internship with military mentors on a live technology project.';
}

/** Only notes that matter for applicants — skip repeated IAIP boilerplate. */
function practicalNotes(detail) {
  const terms = String(detail.terms || '');
  const notes = [];

  const hoursFull = terms.match(/Timings:\s*([^(\n]+).*?Working Days:\s*([^(\n]+)/is);
  const hoursOnly = terms.match(/Timings:\s*([0-9][^(\n]{3,40})/i);
  if (hoursFull) {
    notes.push(`Working hours: ${hoursFull[1].trim()}, ${hoursFull[2].trim()}`);
  } else if (hoursOnly) {
    notes.push(`Working hours: ${hoursOnly[1].trim()}`);
  } else {
    const range = terms.match(
      /(\d{1,2}:\d{2}\s*(?:AM|PM)\s*To\s*\d{1,2}:\d{2}\s*(?:AM|PM))/i
    );
    if (range) notes.push(`Working hours: ${range[1].trim()}`);
  }

  if (/less than 75%\s*attendance/i.test(terms)) {
    notes.push('Stipend is paid after successful completion; under 75% attendance is ineligible');
  }
  if (/police verification is mandatory|Police Verification Certificate/i.test(terms)) {
    notes.push('Police verification is required before joining');
  }
  if (/no accommodation will be provided/i.test(terms)) {
    notes.push('Accommodation is not provided');
  }
  if (/smartphones and laptops are not permitted/i.test(terms)) {
    notes.push('Personal smartphones/laptops are restricted on premises; workstations are provided');
  }

  return notes;
}

/** Tool / skill tokens mentioned on the official page (not full sentences). */
function skillHintsFromProject(project, keywords = '') {
  const text = `${project || ''} ${keywords || ''}`;
  const catalog = [
    'Excel',
    'Google Sheets',
    'Power BI',
    'Python',
    'Node.js',
    'SQL',
    'Android',
    'SAP',
    'ERP',
    'Zoho',
    'Elastic',
    'Elasticsearch',
    'Logstash',
    'Kibana',
    'DevSecOps',
    'CI/CD',
    'Docker',
    'Kubernetes',
    'AWS',
    'Machine Learning',
    'Deep Learning',
    'Computer Vision',
    'NLP',
    'LLM',
    'OpenAI',
    'LangChain',
    'Hugging Face',
    'React',
    'Vue',
    'JavaScript',
    'TypeScript',
    'Java',
    'Drone',
    'UAV',
    'Robotics',
    'Cybersecurity',
    'SIEM',
    'SOAR',
    'Full Stack',
    'Quantum Computing',
    'Cryptography',
  ];
  const found = catalog.filter((k) =>
    new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
  );

  if (keywords?.trim()) {
    for (const kw of keywords.split(/[,;|]/)) {
      const k = kw.trim();
      if (k.length > 1 && k.length < 40) found.push(k);
    }
  }

  return [...new Set(found.map((s) => s.replace(/\s+/g, ' ').trim()))].filter(Boolean);
}

function cleanupBullet(s) {
  return String(s || '')
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/^[•\-*]\s*/, '')
    .replace(/\s+-\s*$/g, '')
    .trim();
}

/** Readable page title from AICTE ALL-CAPS / multi-numbered titles. */
function displayArmyTitle(rawTitle) {
  const t = normalizeSectionText(stripHtml(rawTitle));
  if (!t) return 'Internship opening';

  const multi = [...t.matchAll(/\d+\.\s+(.+?)(?=\s+\d+\.\s|$)/g)];
  if (multi.length >= 2) {
    const blob = t.toLowerCase();
    if (/soc|security operations|vetting|arch layout/i.test(blob)) {
      return 'AI Security & SOC Engineering Internship';
    }
    // Keep both role names when two numbered titles are present
    return multi
      .map((m) => sentenceCaseTitle(m[1].replace(/\.$/, '').trim()))
      .join(' / ')
      .slice(0, 160);
  }

  let cleaned = t.replace(/^\d+\.\s+/, '').replace(/\.$/, '').trim();
  const lettersOnly = cleaned.replace(/[^A-Za-z]/g, '');
  if (lettersOnly.length >= 4 && lettersOnly === lettersOnly.toUpperCase()) {
    cleaned = sentenceCaseTitle(cleaned);
  }
  // Keep the full official title (title-cased) — do not chop mid-phrase
  return cleaned.slice(0, 160);
}

function sentenceCaseTitle(s) {
  const small = new Set(['a', 'an', 'and', 'at', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);
  const acronyms = new Set([
    'ai', 'ml', 'ui', 'ux', 'sql', 'api', 'soc', 'uav', 'erp', 'sap', 'nlp', 'llm', 'ci', 'cd', 'bi',
  ]);
  return String(s || '')
    .toLowerCase()
    .split(/\s+/)
    .map((word, i) => {
      if (acronyms.has(word)) return word.toUpperCase();
      if (i > 0 && small.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/** Parse "1. AI Integration: ... 2. SOC Engineering: ..." from single-line AICTE project text. */
function extractNumberedWorkItems(text) {
  const normalized = normalizeSectionText(text).replace(/&nbsp;/gi, ' ');
  if (!normalized) return [];

  const items = [];
  const parts = normalized.split(/\s+(?=\d{1,2}\.\s+[A-Za-z][^:]{2,72}:\s*)/);

  for (const part of parts) {
    const m = part.match(/^(\d{1,2})\.\s+([^:]+):\s*(.*)$/s);
    if (!m) continue;

    const sectionTitle = cleanupBullet(m[2]);
    let body = cleanupBullet(m[3]);

    if (
      /responsibilit|skill|technical requirement|keyword|document|dress code|working hours|stipend|application/i.test(
        sectionTitle
      )
    ) {
      continue;
    }
    if (/^technical requirements$/i.test(sectionTitle)) break;

    let subLabels = body.split(/\s+-\s+(?=[A-Za-z][^:]{2,48}:\s*)/);
    if (subLabels.length === 1) {
      subLabels = body.split(/\s+(?=[A-Z][A-Za-z]+\s+[A-Z][A-Za-z]+:\s+)/);
    }
    if (subLabels.length > 1 && subLabels.some((s) => /^[A-Za-z].+:\s/.test(s))) {
      for (const sub of subLabels) {
        const sm = sub.match(/^([^:]+):\s*(.+)$/);
        if (sm && sm[1].length < 50 && sm[2].trim()) {
          items.push(
            `${sectionTitle} — ${cleanupBullet(sm[1])}: ${cleanupBullet(sm[2])}`.slice(0, 300)
          );
        } else if (sub.trim().length >= 15) {
          items.push(`${sectionTitle}: ${cleanupBullet(sub)}`.slice(0, 300));
        }
      }
    } else {
      const mainBody = body.split(/\s+(?=\d{1,2}\.\s+[A-Za-z])/)[0].trim();
      if (mainBody.length >= 12) {
        items.push(`${sectionTitle}: ${mainBody}`.slice(0, 300));
      }
    }
  }

  return items;
}

/** Action-oriented sentences from narrative AICTE project text (no portal course blurbs). */
function extractNarrativeDuties(text, max = 8) {
  const normalized = normalizeSectionText(text);
  if (!normalized) return [];

  const skipRe =
    /course description|comprehensive \d+[- ]day|skill development program|designed to provide|theoretical foundation|internship course is|students with a strong/i;
  const duties = [];

  for (const clause of normalized.split(/\s*;\s+|\s+-\s+(?=[A-Z])/)) {
    let t = cleanupBullet(clause);
    if (t.length < 18 || t.length > 240) continue;
    if (skipRe.test(t)) continue;
    if (/^(role|responsibilit|skill|technical requirement|keyword|document|terms|working hours|stipend)/i.test(t)) {
      continue;
    }
    if (/^(the |this |course |internship )/i.test(t) && t.length > 100) continue;
    if (
      /^(develop|build|design|implement|create|assist|support|work|analyze|analyse|research|conduct|maintain|prepare|collaborate|learn|gain|apply|use|study|explore|configure|deploy|test|document)/i.test(
        t
      )
    ) {
      duties.push(t.replace(/[.!?]+$/, '') + (t.endsWith('.') ? '' : '.'));
    }
  }

  if (duties.length < 2) {
    for (const s of normalized.match(/[^.!?]+[.!?]+/g) || []) {
      let t = cleanupBullet(s);
      if (t.length < 25 || t.length > 220) continue;
      if (skipRe.test(t)) continue;
      if (/^(role|responsibilit|skill|technical|keyword|the |this |course )/i.test(t)) continue;
      if (
        /\b(will|shall|must|should)\b/i.test(t) ||
        /^(develop|build|design|implement|create|assist|support|work with|learn|gain hands-on|interns will)/i.test(t)
      ) {
        duties.push(t);
      }
    }
  }

  return [...new Set(duties.map(cleanupBullet))].filter(Boolean).slice(0, max);
}

/** Split responsibility run-on text from AICTE project descriptions. */
function splitResponsibilityItems(block) {
  if (!block?.trim()) return [];
  const normalized = block.replace(/\s+/g, ' ').trim();
  const itemSplit =
    /\s+(?=(?:Create and|Collect,|Perform |Ensure |Support the |Prepare |Develop |Work with |Assist |Design |Build |Implement |Analyze |Manage |Conduct |Review |Update |Monitor |Test |Deploy |Configure |Integrate |Optimize |Document |Research |Collaborate |Experience in |Knowledge of |prepare summary|Create charts))/i;
  return normalized
    .split(itemSplit)
    .map((s) => cleanupBullet(s))
    .filter((s) => s.length >= 15 && s.length < 280);
}

/** Split skills run-on text from AICTE project descriptions. */
function splitSkillItems(block) {
  if (!block?.trim()) return [];
  const normalized = block.replace(/\s+/g, ' ').trim();
  const itemSplit =
    /\s+(?=(?:Excellent |Good knowledge |Good communication |Basic analytical |Attention to |Strong |Proficient |Experience in |Familiarity with |Ability to |Hands-on ))/;
  return normalized
    .split(itemSplit)
    .map((s) => cleanupBullet(s))
    .filter((s) => s.length >= 8 && s.length < 120);
}

function extractNumberedSubItems(text) {
  const items = [];
  for (const m of text.matchAll(/\d+\.\d+\.\s*([^]+?)(?=\d+\.\d+\.|(?:\s\d+\.\s+[A-Z][a-z])|$)/gi)) {
    const item = cleanupBullet(m[1]);
    if (item.length >= 12 && item.length < 320) items.push(item);
  }
  return items;
}

function sliceBetween(text, startLabel, endLabels) {
  const startRe = new RegExp(`(?:^|\\s)${startLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:?\\s*`, 'i');
  const m = text.match(startRe);
  if (!m) return '';
  let rest = text.slice(m.index + m[0].length);
  for (const end of endLabels) {
    const endRe = new RegExp(
      `\\s*(?:${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\s*:`,
      'i'
    );
    const em = rest.match(endRe);
    if (em) rest = rest.slice(0, em.index);
  }
  return rest.trim();
}

/** Parse official "Description of the Project" into role, tasks, and skills. */
function parseProjectDetail(project) {
  const text = normalizeSectionText(project);
  if (!text) {
    return { role: null, intro: null, responsibilities: [], skills: [], workAreas: [] };
  }

  let role =
    text.match(/^Role:\s*(.+?)(?=\s+Responsibilities:?|\s+Skills Required:?|$)/is)?.[1]?.trim() ||
    null;
  if (role) role = role.replace(/\s+Responsibilities.*$/is, '').trim().slice(0, 120);

  let responsibilities = extractNumberedSubItems(text);

  const respBlock = sliceBetween(text, 'Responsibilities', [
    'Skills Required',
    'Technical Requirements',
    'Keywords',
  ]);
  if (respBlock) {
    const cleaned = respBlock.replace(/^\d+\.\s*Responsibilities:?\s*/i, '');
    responsibilities.push(...splitResponsibilityItems(cleaned));
  }

  const numberedItems = extractNumberedWorkItems(text);
  if (numberedItems.length) {
    responsibilities.push(...numberedItems);
  } else {
    for (const m of text.matchAll(
      /(?:^|\n)\d+\.\s+([^:\n]{4,72}):\s*([\s\S]+?)(?=(?:\n\d+\.\s)|$)/g
    )) {
      const title = m[1].trim();
      if (/responsibilit|skill|technical|keyword|document|dress code|working hours|stipend|application/i.test(title)) {
        continue;
      }
      const body = splitResponsibilityItems(m[2]);
      if (body.length) {
        responsibilities.push(...body.map((b) => `${title}: ${b}`));
      } else {
        const short = cleanupBullet(m[2]).slice(0, 200);
        if (short.length >= 12) responsibilities.push(`${title}: ${short}`);
      }
    }
  }

  let intro = null;
  if (!role && responsibilities.length < 2) {
    const narrative = text
      .replace(/^Role:.*$/im, '')
      .replace(/Responsibilities:.*$/is, '')
      .replace(/Skills Required:.*$/is, '')
      .trim();
    const sentences = narrative.match(/[^.!?]+[.!?]+/g) || [];
    if (sentences.length) {
      intro = sentences
        .slice(0, 2)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 340);
    }
  }

  if (responsibilities.length < 2) {
    responsibilities.push(...extractNarrativeDuties(text));
  }

  const skillsBlock = sliceBetween(text, 'Skills Required', [
    'Technical Requirements',
    'Keywords',
    'Terms',
  ]);
  const techBlock = sliceBetween(text, 'Technical Requirements', [
    'Skills Required',
    'Keywords',
  ]);
  const skills = [
    ...splitSkillItems(skillsBlock),
    ...splitSkillItems(techBlock),
  ];

  const workAreas = extractWorkThemes(text);

  responsibilities = [...new Set(responsibilities.map(cleanupBullet))].filter(Boolean).slice(0, 10);
  const merged = [];
  for (const line of responsibilities) {
    if (merged.length && /\band\s*$/i.test(merged[merged.length - 1])) {
      merged[merged.length - 1] = `${merged[merged.length - 1]} ${line}`;
    } else {
      merged.push(line);
    }
  }
  responsibilities = merged;
  const parsedSkills = [...new Set(skills.map(cleanupBullet))].filter(Boolean).slice(0, 12);

  return { role, intro, responsibilities, skills: parsedSkills, workAreas };
}

function buildArmyDescription(detail) {
  const parsed = parseProjectDetail(detail.project);
  const catalogSkills = skillHintsFromProject(detail.project, detail.keywords);
  const skills = [...new Set([...catalogSkills, ...parsed.skills])].filter((s, i, arr) => {
    const lower = s.toLowerCase();
    return !arr.some((other, j) => j !== i && other.length > s.length && other.toLowerCase().includes(lower));
  });
  const eligibility = eligibilityBullets(detail.who, detail.duration);
  const workThemes = [...new Set([...parsed.workAreas, ...extractWorkThemes(detail.project)])].filter(
    (t) => !parsed.responsibilities.some((r) => r.toLowerCase().includes(t.toLowerCase()))
  );
  const notes = practicalNotes(detail);
  const displayTitle = displayArmyTitle(detail.title);

  const officialDegreeCount = countOfficialDegreeClauses(detail.who);
  const storedDegreeCount = eligibility.filter(
    (e) => !/^Available for the full/i.test(e) && !/^Relevant skills/i.test(e)
  ).length;
  if (officialDegreeCount > 0 && storedDegreeCount < officialDegreeCount) {
    console.warn(
      `  ⚠ eligibility drop for "${(detail.title || '').slice(0, 50)}": official degrees=${officialDegreeCount} stored=${storedDegreeCount}`
    );
  }

  const parts = [
    `Indian Army Internship Program (IAIP) — ${displayTitle}.`,
  ];

  if (parsed.role) {
    parts.push(`Role: ${parsed.role}`);
  } else {
    parts.push(roleFocusSentence(detail.title, detail.project, skills));
  }

  parts.push('', 'Key facts');

  const meta = [
    detail.location ? `Location: ${detail.location}` : null,
    detail.duration ? `Duration: ${detail.duration}` : null,
    detail.start ? `Start date: ${detail.start}` : null,
    detail.deadline ? `Last date to apply: ${detail.deadline}` : null,
    detail.posted ? `Date of posting: ${detail.posted}` : null,
    detail.stipend ? `Stipend: ${detail.stipend}` : null,
    detail.credits ? `Credits: ${detail.credits}` : null,
    detail.jobType ? `Engagement type: ${detail.jobType}` : null,
  ].filter(Boolean);
  parts.push(...meta);

  if (parsed.responsibilities.length) {
    parts.push('', "What you'll do", ...parsed.responsibilities.map((r) => `- ${r}`));
  } else if (workThemes.length) {
    parts.push('', 'Work areas', ...workThemes.map((t) => `- ${t}`));
  }

  if (skills.length) {
    parts.push('', 'Skills & tools', ...skills.map((s) => `- ${s}`));
  }

  if (eligibility.length) {
    parts.push('', 'Who can apply', ...eligibility.map((f) => `- ${f}`));
  }

  if (notes.length) {
    parts.push('', 'Practical notes', ...notes.map((n) => `- ${n}`));
  }

  return parts.join('\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 8000);
}

function parseDdMmYyyy(s) {
  if (!s) return null;
  const m = String(s).trim().match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (!m) return null;
  const months = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const mi = months[m[2].toLowerCase()];
  if (mi == null) return null;
  const d = new Date(Date.UTC(Number(m[3]), mi, Number(m[1])));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function extractArmySkillTags(title, project = '') {
  const text = `${title} ${project}`;
  const tags = new Set();
  const add = (...items) => items.forEach((t) => tags.add(t));

  if (/ai|ml|machine learning|llm|nlp|computer vision|deep learning/i.test(text)) {
    add('AI', 'Machine Learning');
  }
  if (/data|analytics|sql|power bi|excel|dashboard/i.test(text)) add('Data Analytics');
  if (/robot|drone|uav|unmanned|autonomous/i.test(text)) add('Robotics', 'Drones');
  if (/cyber|security|devsecops|secops/i.test(text)) add('Cybersecurity');
  if (/software|app|web|full[- ]?stack|mobile|android|erp|sap|zoho/i.test(text)) {
    add('Software Development');
  }
  if (/cloud|devops|ci\/cd|infrastructure/i.test(text)) add('DevOps');
  if (/simulation|wargam|modeling/i.test(text)) add('Simulation');
  if (/antenna|\brf\b|signal/i.test(text)) add('RF Engineering');
  if (/legal|document/i.test(text)) add('Legal Tech');
  if (/media|communication|content|graphic|social media/i.test(text)) add('Communications');
  if (/elastic|elasticsearch|kibana/i.test(text)) add('Elastic Stack');
  if (/space|satellite/i.test(text)) add('Space Systems');
  if (/hospital|medical|health/i.test(text)) add('Healthcare IT');

  return [...tags];
}

// ─── Indian Army (AICTE) ───
async function fetchIndianArmyInternships() {
  console.log('\n── Indian Army (AICTE) ──');
  const endpoint =
    'https://internship.aicte-india.org/dashboard/indianarmy/src/class_internship.php';
  const listings = [];
  const seen = new Set();
  const usedSlugs = new Set();

  // 1) Collect listing URLs from the list API
  for (let page = 1; page <= 6; page++) {
    const body = new URLSearchParams({
      action: 'load_internship',
      location: 'all',
      internship_type: 'all',
      title_search: '',
      domain_search: '',
      location_search: 'Delhi',
      per_page: '20',
      page: String(page),
    });
    let data;
    let ok = false;
    for (let attempt = 0; attempt < 4 && !ok; attempt++) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Referer:
              'https://internship.aicte-india.org/dashboard/indianarmy/internship_list.php',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'CVin.Bio job importer',
          },
          body,
        });
        if (!res.ok) {
          console.warn(`  list page ${page} HTTP ${res.status} (try ${attempt + 1})`);
          await sleep(1500 * (attempt + 1));
          continue;
        }
        data = await res.json();
        ok = true;
      } catch (e) {
        console.warn(`  list page ${page} failed: ${e.message} (try ${attempt + 1})`);
        await sleep(1500 * (attempt + 1));
      }
    }
    if (!ok || !data) {
      console.warn(`  list page ${page} giving up`);
      continue;
    }

    const html = data.list || '';
    const wraps = html.split('<div class="ia-card-wrap">').slice(1);
    console.log(`  list page ${page}: ${wraps.length} cards`);
    if (!wraps.length) break;

    for (const w of wraps) {
      const titleM = w.match(/ia-card__title">(.*?)<\/div>/);
      const linkM = w.match(
        /href="(\.\.\/\.\.\/\.\.\/internship-details\.php\?[^"]+)"/
      );
      const title = stripHtml(titleM?.[1] || '');
      if (!title || !linkM) continue;
      const applyUrl = new URL(
        linkM[1],
        'https://internship.aicte-india.org/dashboard/indianarmy/internship_list.php'
      ).href;
      if (seen.has(applyUrl)) continue;
      seen.add(applyUrl);
      listings.push({ titleHint: title, applyUrl });
    }
    await sleep(300);
  }

  console.log(`  → ${listings.length} detail URLs; fetching each page…`);

  // 2) Fetch each internship-details.php for verified fields only
  const all = [];
  const ARMY_LOGO =
    'https://internship.aicte-india.org/dashboard/indianarmy/images/logo/circle%20indian%20army%20logo.png';

  for (let i = 0; i < listings.length; i++) {
    const { titleHint, applyUrl } = listings[i];
    if (!/internship-details\.php\?/i.test(applyUrl)) {
      console.warn(`  skip non-detail URL: ${applyUrl}`);
      continue;
    }
    let detail;
    try {
      detail = await fetchAicteDetail(applyUrl);
    } catch (e) {
      console.warn(`  detail fail [${i + 1}/${listings.length}] ${titleHint.slice(0, 40)}: ${e.message}`);
      await sleep(800);
      continue;
    }
    if (!detail?.title) {
      console.warn(`  detail empty [${i + 1}/${listings.length}] ${titleHint.slice(0, 40)}`);
      await sleep(400);
      continue;
    }

    const title = displayArmyTitle(detail.title);
    const company = 'Indian Army';
    const companySlug = 'indian-army';
    const location = detail.location
      ? detail.location.includes('India')
        ? detail.location
        : `${detail.location}, India`
      : 'India';
    const description = buildArmyDescription(detail);

    all.push({
      source: 'aicte-indian-army',
      external_id: shortJobExternalId(companySlug, detail.title, applyUrl, usedSlugs),
      dedup_hash: dedupHash(company, applyUrl),
      title: title.slice(0, 200),
      company,
      company_key: toCompanyKey(company),
      company_logo: ARMY_LOGO,
      location,
      job_type: 'internship',
      // Only the stipend string printed on the official detail header — else null
      salary: detail.stipend || null,
      description: description.slice(0, 12000),
      tags: extractArmySkillTags(detail.title, detail.project),
      apply_url: applyUrl,
      category: 'Internship',
      published_at:
        parseDdMmYyyy(detail.posted) ||
        parseDdMmYyyy(detail.start) ||
        new Date().toISOString(),
    });

    if ((i + 1) % 10 === 0 || i === listings.length - 1) {
      console.log(`  details ${i + 1}/${listings.length} (ok ${all.length})`);
    }
    await sleep(350);
  }

  console.log(`  → ${all.length} Indian Army internships with detail pages`);
  for (const j of all.slice(0, 8)) {
    console.log(`     /indian-army/${j.external_id.replace(/^indian-army_/, '')}`);
  }
  return all;
}

// ─── MoSPI NIOS (single consolidated posting) ───
const MOSPI_APPLY_URL = 'https://www.internship.mospi.gov.in';
const MOSPI_LOGO = `${(process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio').replace(/\/$/, '')}/company-logos/mospi.png`;

function decodeMospiJsString(s) {
  return s
    .replace(/\\u2013/g, '–')
    .replace(/\\u2014/g, '—')
    .replace(/\\u201c/g, '"')
    .replace(/\\u201d/g, '"')
    .replace(/\\u2019/g, "'")
    .replace(/\\n/g, '\n');
}

function extractMospiPortalCopy(js) {
  const texts = new Set();
  for (const m of js.matchAll(/children:"([^"]{6,800})"/g)) {
    texts.add(decodeMospiJsString(m[1]));
  }
  for (const m of js.matchAll(/description:"([^"]{6,400})"/g)) {
    texts.add(decodeMospiJsString(m[1]));
  }
  for (const m of js.matchAll(/title:"([^"]{3,120})"/g)) {
    texts.add(decodeMospiJsString(m[1]));
  }
  return [...texts];
}

async function fetchMospiPortalJs() {
  const home = await fetch(MOSPI_APPLY_URL, {
    headers: { 'User-Agent': 'CVin.Bio job importer' },
  });
  const html = await home.text();
  const jsM = html.match(/src="(\/static\/js\/main\.[^"]+\.js)"/);
  if (!jsM) throw new Error('MoSPI main.js not found');
  const jsUrl = new URL(jsM[1], MOSPI_APPLY_URL).href;
  const res = await fetch(jsUrl, { headers: { 'User-Agent': 'CVin.Bio job importer' } });
  return res.text();
}

/** Cycles stay flagged active in the API after their application window closes. */
function filterOpenApplicationCycles(cycles, asOf = new Date()) {
  const today = asOf.toISOString().slice(0, 10);
  return (cycles || []).filter((c) => {
    const end = c?.end_date?.slice(0, 10);
    return c?.is_Active && end && end >= today;
  });
}

function cycleSlotCount(cycle) {
  return (cycle.vacancies || []).reduce((n, v) => n + (Number(v.available_slots) || 0), 0);
}

function shortenCycleTitle(title) {
  const t = String(title || '').trim();
  const phase = t.match(/Phase\s+(I{1,3}|IV|V|\d+)/i)?.[0];
  const year = t.match(/20\d{2}-\d{2}/)?.[0];
  if (phase && year) return `${phase}, NIOS ${year}`;
  return t
    .replace(/\s+of\s+National Internship in Official Statistics \(NIOS\)\s*/i, ', NIOS ')
    .replace(/\s+of\s+MoSPI$/i, '')
    .replace(/,\s*MoSPI\s*/i, ' ')
    .trim();
}

function buildMospiDescription(portalTexts, cycles) {
  const openCycles = filterOpenApplicationCycles(cycles);
  const openSlots = openCycles.reduce((s, c) => s + cycleSlotCount(c), 0);
  const openVacs = openCycles.reduce((s, c) => s + (c.vacancies || []).length, 0);

  const hero =
    portalTexts.find((t) => /Facilitating the students to get familiarized/i.test(t)) ||
    'Facilitating students to get familiarized with the prevailing system of Official Statistics in India.';

  const parts = [
    'National Internship in Official Statistics (NIOS)',
    '',
    'Ministry of Statistics and Programme Implementation (MoSPI), Government of India.',
    '',
    hero,
    '',
    'About the scheme',
    '- Helps students understand how official statistics are produced and used across India',
    '- Hands-on exposure to MoSPI verticals: national accounts, index numbers, energy statistics, SDGs, environment accounts, global indices, and survey programmes (PLFS, ASUSE, ASI, and related collections)',
    '- Covers the full statistical pipeline: data collection, processing and analysis, publication, and dissemination',
    '',
    'Key facts',
    'Location: India — MoSPI headquarters in New Delhi plus central and regional/state statistical offices nationwide',
    'Engagement type: Internship (2–6 months from date of joining)',
    'Stipend: ₹10,000 per month, paid monthly after the nodal officer submits your progress report for the preceding month',
    'Certificate: Issued by the host office on successful completion; leaving early forfeits stipend and certificate',
    'Scale: 200+ internship slots across Group A (Delhi HQ divisions) and Group B (regional/zonal offices)',
  ];

  if (openCycles.length) {
    parts.push('', 'Open application window');
    for (const c of openCycles) {
      const slots = cycleSlotCount(c);
      const vacs = (c.vacancies || []).length;
      const label = shortenCycleTitle(c.title) || c.title;
      parts.push(
        `- ${label}: apply ${c.start_date} to ${c.end_date}${slots ? ` — ${slots} slots across ${vacs} office postings` : ''}`
      );
    }
    if (openSlots) {
      parts.push(`Total open slots in current window: ${openSlots} (${openVacs} office-level postings)`);
    }
  } else {
    parts.push(
      '',
      'Application window',
      'No MoSPI internship application window is open right now. Check the official portal for the next phase announcement.'
    );
  }

  parts.push(
    '',
    'Placement groups',
    '- Group A: Delhi headquarters divisions (e.g. national accounts, economic/social statistics, price statistics)',
    '- Group B: Regional and zonal NSO (FOD) offices and state DES centres across India',
    '- You may apply to Group A or Group B for a given phase, not both',
    '- Choose your preferred office/centre and internship duration (2–6 months) during application',
    '',
    'Who can apply',
    'Bonafide students of any recognized university or institution in India or abroad may apply if they meet one of these paths:',
    '- Undergraduates who have completed or appeared in second-year / 4th-semester exams, with statistics or mathematics in the curriculum, and at least 75% (or equivalent) in Class 12',
    '- Postgraduate students in any year with statistics or mathematics in the curriculum',
    '- Research or Ph.D. students in statistics, mathematical statistics, operations research, economics, demography, or related applied statistics, with at least 70% (or equivalent) in graduation',
    '- Graduates who finished graduation or post-graduation within the last two years with at least 70% (or equivalent) marks',
    '- Current degree students (UG, PG, research, or Ph.D.) may only take 2–3 month internship slots',
    '',
    'Selection',
    '- Online shortlisting based on aggregate marks in 12th, graduation, or post-graduation (as applicable); mention qualifying subjects and CGPA conversion if used',
    '- Office allocation considers marks and the location preferences you submit',
    '- Group A results are published on the MoSPI website; Group B results are posted at the respective office notice boards',
    '',
    'During the internship',
    '- Each centre assigns a guide or nodal officer; monthly progress reports are required for stipend release',
    '- Submit a final report or paper (with soft copy) covering observations and suggestions at the end of the assignment',
    '- Field visits for NSO (FOD) zonal/regional offices may include ₹500 per day when undertaking approved field work',
    '- Field visits must not exceed 10 days across the entire internship period',
    '- No travelling allowance or daily allowance is paid for reporting to the allotted office or returning after completion',
    '- Selected interns submit bank account details through the portal after joining (stipend via electronic transfer / PFMS / Aadhaar-based payment rails)',
    '',
    'How to apply on the MoSPI portal',
    '1. Register — create an account on the official internship portal',
    '2. Complete profile — education and personal details',
    '3. Upload documents — certificates and government ID (each file under 5 MB)',
    '4. Select preferences — internship group, office/centre, and duration',
    '5. Submit application — review and submit before the phase deadline',
    '6. Selection — shortlisting; interview if required by the host office',
    '7. Confirmation — offer letter and joining instructions from the allotted office',
    '',
    'Practical notes',
    '- Enquiries are handled only by designated MoSPI offices and officers',
    '- Annex office lists are tentative and may change with competent authority approval',
    '- Internship award is not a job offer and does not guarantee future government employment',
    '',
    'Contact',
    'Training Unit, Ministry of Statistics and Programme Implementation, Khurshid Lal Bhawan, Janpath, New Delhi 110001',
    'Email: training-mospi@nic.in'
  );

  return parts.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

async function fetchMospiInternships() {
  console.log('\n── MoSPI NIOS (single posting) ──');
  const cyclesRes = await fetch('https://internship.mospi.gov.in/api/cycles', {
    headers: { Accept: 'application/json', 'User-Agent': 'CVin.Bio job importer' },
  });
  if (!cyclesRes.ok) {
    console.warn(`  cycles HTTP ${cyclesRes.status}`);
    return [];
  }
  const data = await cyclesRes.json();
  const cycles = data.cycles || [];

  let portalTexts = [];
  try {
    const js = await fetchMospiPortalJs();
    portalTexts = extractMospiPortalCopy(js);
    console.log(`  portal copy snippets: ${portalTexts.length}`);
  } catch (e) {
    console.warn(`  portal copy fetch failed: ${e.message}`);
  }

  const company = 'MoSPI';
  const companySlug = 'mospi';
  const title = 'National Internship in Official Statistics (NIOS)';
  const description = buildMospiDescription(portalTexts, cycles);
  const openCycles = filterOpenApplicationCycles(cycles);
  const latest = openCycles.sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  )[0];

  const job = {
    source: 'mospi-nios',
    external_id: `${companySlug}_nios`,
    dedup_hash: dedupHash(company, 'nios-internship'),
    title,
    company,
    company_key: toCompanyKey(company),
    company_logo: MOSPI_LOGO,
    location: 'India',
    job_type: 'internship',
    salary: '₹10,000/month',
    description: description.slice(0, 12000),
    tags: ['Statistics', 'Data Analytics', 'Economics', 'Research'],
    apply_url: MOSPI_APPLY_URL,
    category: 'Internship',
    published_at: latest?.createdAt || new Date().toISOString(),
  };

  console.log('  → 1 MoSPI page at /mospi/nios');
  return [job];
}

// ─── NITI Aayog Internship Scheme (single consolidated posting) ───
const NITI_APPLY_URL =
  'https://workforindia.niti.gov.in/intern/InternshipEntry/PCInternshipEntry.aspx';
const NITI_GUIDELINES_PDF =
  'https://workforindia.niti.gov.in/intern/PDF/NITI%20Internship%20Guidelines2019.pdf';
const NITI_LOGO = `${(process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio').replace(/\/$/, '')}/company-logos/niti-aayog.png`;

/** Domains listed on the official application form (Aug 2026 snapshot). */
const NITI_INTEREST_AREAS = [
  'Agriculture & agriculture policy',
  'Aspirational Districts Programme',
  'Data management and analysis',
  'Economics & economics intelligence',
  'Education',
  'Energy sector',
  'Foreign trade / commerce',
  'Frontier Tech Hub',
  'Governance',
  'Health, nutrition, women & child development',
  'Industry & MSME',
  'Infrastructure connectivity (transportation)',
  'Innovation & entrepreneurship (Atal Innovation Mission)',
  'IT / telecom',
  'Law',
  'Lifestyle for Environment (LiFE)',
  'Mass communications & social media',
  'Mining sector',
  'Natural resources, environment & forests',
  'Panchayati Raj',
  'Programme monitoring & evaluation',
  'Public finance / budget / PPP',
  'Rural development & SDGs',
  'Science & technology',
  'Skill development & employment',
  'Social justice & empowerment',
  'Sports & youth development',
  'State Support Mission',
  'Tourism & culture',
  'Urbanization / smart cities',
  'Viksit Bharat perspective planning',
  'Voluntary Action Cell',
  'Water resources',
];

async function fetchNitiDesiredMonths() {
  try {
    const res = await fetch(NITI_APPLY_URL, {
      headers: { 'User-Agent': 'CVin.Bio job importer', Accept: 'text/html' },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const months = [
      ...html.matchAll(
        />(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})</gi
      ),
    ].map((m) => `${m[1]} ${m[2]}`);
    return [...new Set(months)];
  } catch {
    return [];
  }
}

function buildNitiDescription(desiredMonths) {
  const parts = [
    "Government of India's premier policy think tank — short-term internships across verticals, divisions, and units in New Delhi.",
    '',
    'About the scheme',
    '- Exposure to how NITI Aayog supports analysis, developmental policy, and government functioning',
    '- Interns supplement in-house work through data collection, collation, briefing notes, and policy inputs',
    '- Unpaid internship; completion certificate issued by the Adviser of the host division on successful completion',
    '',
    'Key facts',
    'Location: NITI Aayog, Sansad Marg, New Delhi 110001, India',
    'Engagement type: Internship (on-site at NITI Aayog headquarters)',
    'Duration: Minimum 6 weeks, maximum 6 months',
    'Stipend: Unpaid (no stipend under the official scheme)',
    'Attendance: Minimum 75% required; below 75% — no extension and no experience certificate',
    'Logistics: Bring your own laptop; NITI provides workspace, internet, and other essentials as decided by the host division',
    'Capacity: Up to 3 interns per vertical/division at a time (may be relaxed with CEO approval)',
  ];

  parts.push(
    '',
    'Application window',
    '- Online applications only, 1st (00:00 hrs) to 10th (23:59 hrs) of every month',
    '- Apply at least 2 months and at most 6 months before your desired internship start month',
    '- One application per candidate per financial year',
    '- No printout or supporting documents sent by post — originals verified at joining'
  );

  if (desiredMonths.length) {
    parts.push('', 'Desired start months on the portal (select one when applying)');
    for (const m of desiredMonths.slice(0, 12)) {
      parts.push(`- ${m}`);
    }
    if (desiredMonths.length > 12) {
      parts.push(`- …and ${desiredMonths.length - 12} more months on the official form`);
    }
  }

  parts.push(
    '',
    'Areas of interest',
    'Choose one area on the application form (allocation is subject to availability and NITI Aayog discretion):',
    ...NITI_INTEREST_AREAS.slice(0, 18).map((a) => `- ${a}`),
    `- …plus ${NITI_INTEREST_AREAS.length - 18} more domains on the portal (e.g. space domain, cyber, library, NIC division)`
  );

  parts.push(
    '',
    'Who can apply',
    'Bonafide students of a recognized university or institution in India or abroad:',
    '- Undergraduates who have completed or appeared in 2nd-year / 4th-semester exams, with at least 85% (or equivalent) in Class 12',
    '- Postgraduate students who have completed or appeared in 1st-year / 2nd-semester PG exams, or research/PhD scholars, with at least 70% (or equivalent) in graduation',
    '- Recent graduates awaiting higher studies: at least 70% cumulative marks in graduation/PG, and final-result declaration within 6 months of the desired internship month',
    '',
    'Selection',
    '- Applications reviewed online by concerned verticals/divisions; Adviser decision is final',
    '- Selected candidates submit NOC from college/institution (HOD or Principal) and original mark sheets at joining',
    '- Shortlisted lists are published on the NITI Aayog website',
    '',
    'During the internship',
    '- Submit a brief report on your learning experience at the end of the assignment',
    '- Mark daily in/out attendance; host division supervises conduct and data access',
    '',
    'How to apply',
    '1. Open the official application form at workforindia.niti.gov.in',
    '2. Fill the application form (personal, education, desired month, one area of interest)',
    '3. Preview all details — corrections are not entertained after submission',
    '4. Submit during the monthly window and note your registration number',
    '',
    'Practical notes',
    '- Eligibility is checked automatically; ineligible applications are rejected by the system',
    '- Indicating a preferred sector does not guarantee placement in that area',
    '- Scheme guidelines and instructions are available from the official portal before you apply',
    '- For web/application issues: nic-niti@gov.in'
  );

  return parts.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

async function fetchNitiAayogInternships() {
  console.log('\n── NITI Aayog Internship Scheme ──');
  const desiredMonths = await fetchNitiDesiredMonths();
  console.log(`  portal desired months: ${desiredMonths.length ? desiredMonths.join(', ') : '(not scraped)'}`);

  const company = 'NITI Aayog';
  const companySlug = 'niti-aayog';
  const title = 'NITI Aayog Internship Scheme';
  const description = buildNitiDescription(desiredMonths);

  const job = {
    source: 'niti-aayog-internship',
    external_id: `${companySlug}_internship`,
    dedup_hash: dedupHash(company, 'internship-scheme'),
    title,
    company,
    company_key: companySlug,
    company_logo: NITI_LOGO,
    location: 'New Delhi, India',
    job_type: 'internship',
    salary: null,
    description: description.slice(0, 12000),
    tags: [
      'Public Policy',
      'Economics',
      'Data Analytics',
      'Governance',
      'Research',
    ],
    apply_url: NITI_APPLY_URL,
    category: 'Internship',
    published_at: new Date().toISOString(),
  };

  console.log('  → 1 NITI page at /niti-aayog/internship');
  return [job];
}

async function deleteOldIndiaJobs() {
  console.log('\n── Remove previous India internship rows ──');
  for (const source of ['aicte-indian-army', 'mospi-nios', 'niti-aayog-internship']) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/jobs?source=eq.${encodeURIComponent(source)}`,
      {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: 'return=minimal',
        },
      }
    );
    if (!res.ok) {
      console.warn(`  delete ${source}: ${(await res.text()).slice(0, 200)}`);
    } else {
      console.log(`  cleared source=${source}`);
    }
  }
}

async function upsertJobs(jobs) {
  console.log(`\n── Upsert ${jobs.length} jobs ──`);
  const batchSize = 40;
  let inserted = 0;
  let errors = 0;

  const normalized = jobs.map((j) => ({
    ...j,
    description: normalizeJobDescriptionForStorage(j.description),
  }));

  for (let i = 0; i < normalized.length; i += batchSize) {
    const batch = normalized.slice(i, i + batchSize);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/jobs?on_conflict=external_id`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(batch),
    });
    if (res.ok) {
      const rows = await res.json();
      inserted += Array.isArray(rows) ? rows.length : 0;
      console.log(`  batch ${Math.floor(i / batchSize) + 1}: ok (${rows?.length || 0})`);
    } else {
      const err = await res.text();
      console.error(`  batch error: ${err.slice(0, 300)}`);
      // fallback row-by-row
      for (const job of batch) {
        const r2 = await fetch(`${SUPABASE_URL}/rest/v1/jobs?on_conflict=external_id`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=minimal',
          },
          body: JSON.stringify([job]),
        });
        if (r2.ok) inserted += 1;
        else {
          errors += 1;
          console.error(`  row fail ${job.external_id}: ${(await r2.text()).slice(0, 120)}`);
        }
      }
    }
    await sleep(300);
  }

  console.log(`Done. upserted≈${inserted} errors=${errors}`);
  return { inserted, errors };
}

async function upsertIndiaCompanies(jobs) {
  const byKey = new Map();
  for (const j of jobs) {
    if (!j.company_key) continue;
    const prev = byKey.get(j.company_key);
    const loc = j.location?.split(',')[0]?.trim();
    byKey.set(j.company_key, {
      slug: j.company_key,
      name: j.company,
      logo: j.company_logo || prev?.logo || null,
      role_count: (prev?.role_count || 0) + 1,
      locations: [...new Set([...(prev?.locations || []), loc].filter(Boolean))].slice(0, 3),
      latest_job_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  if (!byKey.size) return;

  const rows = [...byKey.values()];
  console.log(`\n── Upsert ${rows.length} company pages ──`);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/companies?on_conflict=slug`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    console.warn(`  companies upsert failed: ${(await res.text()).slice(0, 200)}`);
  } else {
    console.log(`  ok: ${rows.map((r) => r.slug).join(', ')}`);
  }
}

async function main() {
  const army = await fetchIndianArmyInternships();
  const mospi = await fetchMospiInternships();
  const niti = await fetchNitiAayogInternships();
  const all = [...army, ...mospi, ...niti];
  console.log(`\nTotal to import: ${all.length}`);
  if (!all.length) process.exit(1);

  console.log('\nPretty paths:');
  for (const j of all) {
    const slug = j.external_id.replace(`${j.company_key}_`, '');
    console.log(`  /${j.company_key}/${slug} — ${j.title.slice(0, 55)}`);
  }

  await deleteOldIndiaJobs();
  await upsertJobs(all);
  await upsertIndiaCompanies(all);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
