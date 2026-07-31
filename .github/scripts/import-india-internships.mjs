/**
 * Import India internship postings into jobs:
 *  - Indian Army via AICTE portal — list URLs, then each internship-details.php
 *  - MoSPI NIOS cycles via public API
 *
 * Usage: node .github/scripts/import-india-internships.mjs
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY)
 */
import crypto from 'crypto';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

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
  'indian', 'army', 'mospi', 'national', 'official', 'statistics', 'nios',
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

/** Pull discrete eligibility facts without copying portal prose. */
function eligibilityFacts(whoText) {
  const who = String(whoText || '');
  const facts = [];
  for (const m of who.matchAll(
    /are from\s+(.+?)(?:\s+with specialisation in\s+(.+?))?(?=\n|- are from|$)/gi
  )) {
    const degree = stripHtml(m[1]).replace(/\s+/g, ' ').trim();
    const spec = m[2] ? stripHtml(m[2]).replace(/\s+/g, ' ').trim() : '';
    if (degree) {
      facts.push(spec ? `${degree} (${spec})` : degree);
    }
  }
  if (/available for duration/i.test(who)) {
    const dm = who.match(/available for duration of\s+([^\n.]+)/i);
    facts.push(
      dm
        ? `Available for the full ${stripHtml(dm[1]).trim()} duration`
        : 'Available for the full stated internship duration'
    );
  }
  if (/relevant skills/i.test(who)) {
    facts.push('Relevant skills and interest in the role area');
  }
  return [...new Set(facts)].filter(Boolean);
}

/** Tool / skill tokens mentioned on the official page (not full sentences). */
function skillHintsFromProject(project) {
  const text = String(project || '');
  const catalog = [
    'Excel',
    'Google Sheets',
    'Power BI',
    'Python',
    'SQL',
    'Android',
    'SAP',
    'ERP',
    'Zoho',
    'Elastic',
    'DevSecOps',
    'CI/CD',
    'Machine Learning',
    'Deep Learning',
    'Computer Vision',
    'NLP',
    'LLM',
    'Drone',
    'UAV',
    'Robotics',
    'Cybersecurity',
    'Java',
    'JavaScript',
    'React',
    'Full Stack',
  ];
  return catalog.filter((k) => new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text));
}

function extractRoleLabel(project) {
  const m = String(project || '').match(/Role:\s*([^\n]+)/i);
  return m ? stripHtml(m[1]).replace(/\s+/g, ' ').trim() : null;
}

function buildArmyDescription(detail) {
  const roleLabel = extractRoleLabel(detail.project);
  const skills = skillHintsFromProject(detail.project);
  const eligibility = eligibilityFacts(detail.who);
  const hoursMatch = String(detail.terms || '').match(
    /Timings:\s*([^\n<(]+).*?Working Days:\s*([^\n<(]+)/is
  );
  const needsPolice = /Police verification is mandatory/i.test(detail.terms || '');
  const noAccom = /accommodation is not included/i.test(detail.terms || '');
  const stipendAttendance = /less than 75%\s*attendance/i.test(detail.terms || '');

  const parts = [
    `Indian Army Internship Program (IAIP) opening${
      roleLabel ? ` for ${roleLabel}` : detail.title ? ` for ${detail.title}` : ''
    }.`,
    '',
    'This CVin.Bio page is an original summary of facts published on the official role posting. It is not a full reproduction of that posting.',
    '',
    'Key facts',
  ];

  const meta = [
    detail.location ? `Location: ${detail.location}` : null,
    detail.duration ? `Duration: ${detail.duration}` : null,
    detail.start ? `Start date: ${detail.start}` : null,
    detail.deadline ? `Last date to apply: ${detail.deadline}` : null,
    detail.posted ? `Date of posting: ${detail.posted}` : null,
    detail.stipend ? `Stipend (as stated on the official posting): ${detail.stipend}` : null,
    detail.credits ? `Credits: ${detail.credits}` : null,
    detail.jobType ? `Engagement type: ${detail.jobType}` : null,
  ].filter(Boolean);
  parts.push(...meta);

  if (skills.length) {
    parts.push('', 'Tools and topics named on the official posting', skills.map((s) => `- ${s}`).join('\n'));
  }

  if (eligibility.length) {
    parts.push(
      '',
      'Who can apply',
      'Eligibility criteria published on the official posting include:',
      ...eligibility.map((f) => `- ${f}`)
    );
  }

  const notes = [];
  if (hoursMatch) {
    notes.push(
      `Working hours stated on the posting: ${stripHtml(hoursMatch[1]).trim()}, ${stripHtml(hoursMatch[2]).trim()}`
    );
  }
  if (detail.stipend) {
    notes.push(
      stipendAttendance
        ? `Stipend is paid after successful completion; the official posting ties the final amount to attendance (under 75% attendance is stated as ineligible).`
        : `Stipend details and payment conditions are defined on the official posting.`
    );
  }
  if (needsPolice) notes.push('Police verification is mandatory for this internship.');
  if (noAccom) notes.push('Accommodation is not provided; interns arrange their own stay.');
  if (notes.length) {
    parts.push('', 'Practical notes', ...notes.map((n) => `- ${n}`));
  }

  parts.push(
    '',
    'Full responsibilities, complete terms, and the application form are on the official Indian Army role page (listed through the AICTE National Internship Portal).'
  );

  return parts.join('\n').replace(/\n{3,}/g, '\n\n').trim();
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

    const title = detail.title;
    const company = 'Indian Army';
    const companySlug = 'indian-army';
    const location = detail.location
      ? detail.location.includes('India')
        ? detail.location
        : `${detail.location}, India`
      : 'India';
    const description = buildArmyDescription(detail);

    const tags = ['Internship', 'Indian Army', 'AICTE', 'Defence', 'India'];
    if (/ai|ml|machine learning/i.test(title + ' ' + detail.project)) {
      tags.push('AI', 'Machine Learning');
    }
    if (/data/i.test(title + ' ' + detail.project)) tags.push('Data');
    if (/robot|drone|uav|unmanned/i.test(title + ' ' + detail.project)) {
      tags.push('Robotics', 'Drones');
    }
    if (/cyber|security|hack/i.test(title + ' ' + detail.project)) {
      tags.push('Cybersecurity');
    }
    if (/software|app|web|erp|sap|excel|power bi/i.test(title + ' ' + detail.project)) {
      tags.push('Software');
    }

    all.push({
      source: 'aicte-indian-army',
      external_id: shortJobExternalId(companySlug, title, applyUrl, usedSlugs),
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
      tags: [...new Set(tags)],
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

// ─── MoSPI NIOS ───
async function fetchMospiInternships() {
  console.log('\n── MoSPI NIOS ──');
  const res = await fetch('https://internship.mospi.gov.in/api/cycles', {
    headers: { Accept: 'application/json', 'User-Agent': 'CVin.Bio job importer' },
  });
  if (!res.ok) {
    console.warn(`  cycles HTTP ${res.status}`);
    return [];
  }
  const data = await res.json();
  const cycles = data.cycles || [];
  const jobs = [];
  const usedSlugs = new Set();
  // Short company name → /mospi/{slug} URLs
  const company = 'MoSPI';
  const companySlug = 'mospi';

  for (const cycle of cycles) {
    if (!cycle?.is_Active) continue;
    const vacs = cycle.vacancies || [];
    const slots = vacs.reduce((s, v) => s + (Number(v.available_slots) || 0), 0);
    const title = (cycle.title || 'MoSPI National Internship').trim();
    const start = cycle.start_date || null;
    const end = cycle.end_date || null;

    const description = [
      title,
      ``,
      `National Internship in Official Statistics (NIOS) under the Ministry of Statistics and Programme Implementation (MoSPI), Government of India.`,
      ``,
      start && end ? `Cycle window: ${start} to ${end}` : null,
      `Open vacancy postings in this cycle: ${vacs.length}`,
      `Total available slots (listed): ${slots}`,
      ``,
      `Interns work with MoSPI offices on official statistics. Choose office placements on the official MoSPI internship portal.`,
    ]
      .filter(Boolean)
      .join('\n');

    // One page per active cycle (office-level vacancy names need auth; portal has detail).
    jobs.push({
      source: 'mospi-nios',
      external_id: shortJobExternalId(companySlug, title, cycle.id, usedSlugs),
      dedup_hash: dedupHash(company, String(cycle.id)),
      title: title.slice(0, 200),
      company,
      company_key: toCompanyKey(company),
      company_logo: null,
      location: 'India',
      job_type: 'internship',
      salary: null,
      description: description.slice(0, 5000),
      tags: ['Internship', 'MoSPI', 'Statistics', 'Government', 'India', 'NIOS'],
      apply_url: 'https://www.internship.mospi.gov.in',
      category: 'Internship',
      published_at: cycle.createdAt || new Date().toISOString(),
    });
  }

  console.log(`  → ${jobs.length} MoSPI cycle pages`);
  for (const j of jobs) {
    console.log(`     /mospi/${j.external_id.replace(/^mospi_/, '')}`);
  }
  return jobs;
}

async function deleteOldIndiaJobs() {
  console.log('\n── Remove previous India internship rows ──');
  for (const source of ['aicte-indian-army', 'mospi-nios']) {
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

  for (let i = 0; i < jobs.length; i += batchSize) {
    const batch = jobs.slice(i, i + batchSize);
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

async function main() {
  const army = await fetchIndianArmyInternships();
  const mospi = await fetchMospiInternships();
  const all = [...army, ...mospi];
  console.log(`\nTotal to import: ${all.length}`);
  if (!all.length) process.exit(1);

  console.log('\nPretty paths:');
  for (const j of all) {
    const slug = j.external_id.replace(`${j.company_key}_`, '');
    console.log(`  /${j.company_key}/${slug} — ${j.title.slice(0, 55)}`);
  }

  await deleteOldIndiaJobs();
  await upsertJobs(all);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
