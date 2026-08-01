/**
 * Audit India internship postings in Supabase against official sources.
 *
 * Army (AICTE): re-fetches each internship-details.php and compares
 * "Who can apply?" degree bullets to stored descriptions.
 * All India jobs: formatting checks (comma spacing, inline dashes, merged degrees).
 *
 * Usage: node .github/scripts/audit-india-internships.mjs
 * Exit code 1 when any posting fails.
 */
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

// Keep in sync with import-india-internships.mjs eligibility helpers.
function splitCommaSpecs(raw) {
  return String(raw || '')
    .split(/,(?=[A-Za-z(])/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length > 1);
}

function formatCommaList(raw) {
  return splitCommaSpecs(raw).join(', ');
}

function parseWhoListItems(whoHtml) {
  if (!whoHtml) return [];
  return [...whoHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m) =>
      String(m[1] || '')
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(Boolean);
}

function splitDegreeClauses(from) {
  const text = String(from || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return [];
  const chunks = text
    .split(
      /(?=\bM\. ?Tech\.? \/ M\.E\b|\bM\. ?Tech\.?\/\s*M\.E\b|\bMCA\b|\bMBA\b|\bPh\.?D\.?\b)/i
    )
    .map((s) => s.trim())
    .filter(Boolean);
  return chunks.length ? chunks : [text];
}

function formatDegreeEligibilityLine(chunk) {
  const t = String(chunk || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!t) return '';

  const withSpec = t.match(/^(.+?)\s+with specialisation in\s+(.+)$/i);
  if (withSpec) {
    return `${withSpec[1].trim()} with specialisation in ${formatCommaList(withSpec[2])}`;
  }

  const dashSpec = t.match(/^(.+?)\s+[-—–]\s+(.+)$/);
  if (dashSpec) {
    return `${dashSpec[1].trim()}: ${formatCommaList(dashSpec[2])}`;
  }

  return formatCommaList(t) || t;
}

function expandEligibilityListItem(liText, duration) {
  const t = String(liText || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!t || /^only those candidates/i.test(t)) return [];

  if (/^are available for duration/i.test(t)) {
    const d = t.match(/duration of\s+([^\n.]+)/i)?.[1]?.trim() || duration;
    return [`Available for the full ${d || 'posted'} internship period`];
  }
  if (/^have relevant skills/i.test(t)) {
    return ['Relevant skills and interest in the project area'];
  }
  if (!/^are from\b/i.test(t)) return [];

  const body = t.replace(/^are from\s+/i, '').trim();
  const withSpec = body.match(/^(.+?)\s+with specialisation in\s+(.+)$/i);
  if (withSpec) {
    const degree = withSpec[1].trim();
    const specs = splitCommaSpecs(withSpec[2]);
    if (specs.length > 1) {
      return specs.map((s) => `${degree} with specialisation in ${s}`);
    }
    if (specs.length === 1) {
      return [`${degree} with specialisation in ${specs[0]}`];
    }
    return [`${degree} with specialisation in ${formatCommaList(withSpec[2])}`];
  }

  const out = [];
  for (const chunk of splitDegreeClauses(body)) {
    const line = formatDegreeEligibilityLine(chunk);
    if (!line) continue;
    const colon = line.match(/^(.+?):\s+(.+)$/);
    if (colon) {
      const specs = splitCommaSpecs(colon[2]);
      if (specs.length > 1) {
        out.push(...specs.map((s) => `${colon[1].trim()}: ${s}`));
        continue;
      }
    }
    out.push(line);
  }
  return out;
}

function eligibilityBullets(whoText, duration, whoHtml = '') {
  const out = [];
  const listItems = parseWhoListItems(whoHtml);
  if (listItems.length) {
    for (const li of listItems) {
      out.push(...expandEligibilityListItem(li, duration));
    }
  } else {
    const who = String(whoText || '')
      .replace(/\s+/g, ' ')
      .trim();
    const clauses = who
      .split(/(?=\bare from\b)|(?=\bare available\b)|(?=\bhave relevant\b)/i)
      .map((s) => s.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    for (const raw of clauses) {
      out.push(...expandEligibilityListItem(raw, duration));
    }
  }
  return [...new Set(out)].filter((s) => s.length > 4 && s.length < 900);
}

function sectionHtml(html, heading) {
  const re = new RegExp(
    `<h4[^>]*>\\s*${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<\\/h4>\\s*([\\s\\S]*?)(?=<h4[^>]*>|<!--\\s*<section|$)`,
    'i'
  );
  const m = html.match(re);
  return m ? m[1] : '';
}

function normElig(s) {
  return s.toLowerCase().replace(/\s+/g, ' ').replace(/\./g, '').trim();
}

function storedDegreeBullets(description) {
  const who = (description.split('Who can apply')[1] || '').split('Practical')[0] || '';
  return who
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('-'))
    .map((l) => l.slice(2).trim())
    .filter((l) => !/^Available for the full/i.test(l) && !/^Relevant skills/i.test(l));
}

function formattingIssues(description) {
  const problems = [];
  const duties = (description.split("What you'll do")[1] || '').split(/Skills|Who can apply/)[0] || '';
  for (const line of duties.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('-')) continue;
    const body = t.replace(/^-\s+/, '');
    if (/\s+-\s+(?=[A-Z])/.test(body)) {
      problems.push('inline_dash_bullets');
      break;
    }
    if (/\s+Desired\s*$/i.test(t)) problems.push('trailing_desired');
  }

  const who = (description.split('Who can apply')[1] || '').split('Practical')[0] || '';
  if (/,[A-Za-z(]/.test(who)) problems.push('comma_spacing');
  if (/\s[—–]\s/.test(who)) problems.push('em_dash_eligibility');
  if (!description.includes('Who can apply')) problems.push('missing_who_section');

  const degreeLines = who
    .split('\n')
    .filter((l) => l.trim().startsWith('-') && /B\.Tech|M\. ?Tech|BSc|Diploma|MCA|MBA/i.test(l));
  for (const l of degreeLines) {
    if (/\bB\.Tech[\s\S]+?\bM\. ?Tech\b/i.test(l)) problems.push('merged_degree_lines');
  }

  return [...new Set(problems)];
}

async function fetchOfficialEligibility(applyUrl) {
  const res = await fetch(applyUrl, {
    headers: { 'User-Agent': 'CVin.Bio audit' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const bodyM = html.match(
    /<div class="internship-detail-body">([\s\S]*?)(?:<div class="modal"|Back to Internship List)/i
  );
  const body = bodyM ? bodyM[1] : html;

  const attrs = [
    ...(body.matchAll(/<ul class="job-attributes">([\s\S]*?)<\/ul>/gi) || []),
  ];
  let duration = '';
  if (attrs[0]) {
    const lis = [...attrs[0][1].matchAll(/<li[^>]*>\s*<span>([\s\S]*?)<\/span>/gi)].map((m) =>
      m[1].replace(/<[^>]+>/g, '').trim()
    );
    duration = lis[1] || '';
  }

  const whoHtml = sectionHtml(body, 'Who can apply?');
  const expected = eligibilityBullets('', duration, whoHtml);
  const expectedDeg = expected.filter(
    (e) => !/^Available for the full/i.test(e) && !/^Relevant skills/i.test(e)
  );
  return expectedDeg;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function auditIndiaInternships({
  supabaseUrl = SUPABASE_URL,
  supabaseKey = SUPABASE_KEY,
  fetchDelayMs = 250,
} = {}) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/jobs?select=external_id,title,description,apply_url,company_key,source&or=(company_key.eq.indian-army,company_key.eq.mospi,company_key.eq.niti-aayog)&order=company_key.asc,external_id.asc&limit=100`,
    {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    }
  );
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const jobs = await res.json();

  const failures = [];
  const warnings = [];
  let armyChecked = 0;

  for (const job of jobs) {
    const slug = job.external_id.replace(/^[^_]+_/, '');
    const path = `${job.company_key}/${slug}`;
    const fmt = formattingIssues(job.description);
    if (fmt.length) {
      failures.push({ path, title: job.title, issues: fmt, type: 'format' });
    }

    if (job.source !== 'aicte-indian-army' || !job.apply_url?.includes('internship-details.php')) {
      continue;
    }

    armyChecked++;
    try {
      if (fetchDelayMs) await sleep(fetchDelayMs);
      const expectedDeg = await fetchOfficialEligibility(job.apply_url);
      const stored = storedDegreeBullets(job.description);
      const expNorm = new Set(expectedDeg.map(normElig));
      const stNorm = new Set(stored.map(normElig));
      const missing = expectedDeg.filter((e) => !stNorm.has(normElig(e)));
      const extra = stored.filter((s) => !expNorm.has(normElig(s)));

      if (missing.length || extra.length) {
        failures.push({
          path,
          title: job.title,
          type: 'eligibility',
          missing,
          extra,
          storedCount: stored.length,
          expectedCount: expectedDeg.length,
        });
      }
    } catch (e) {
      warnings.push({ path, err: e.message });
    }
  }

  return {
    total: jobs.length,
    armyChecked,
    failures,
    warnings,
    ok: failures.length === 0 && warnings.length === 0,
  };
}

async function main() {
  console.log('── Audit India internship postings ──');
  const result = await auditIndiaInternships();

  console.log(`  Total postings: ${result.total}`);
  console.log(`  Army detail pages checked: ${result.armyChecked}`);
  console.log(`  Failures: ${result.failures.length}`);
  console.log(`  Warnings: ${result.warnings.length}`);

  for (const f of result.failures) {
    console.log(`\n  FAIL ${f.path} — ${f.title?.slice(0, 60) || ''}`);
    if (f.issues?.length) console.log(`    format: ${f.issues.join(', ')}`);
    if (f.missing?.length) console.log(`    missing (${f.missing.length}): ${f.missing.slice(0, 3).join(' | ')}`);
    if (f.extra?.length) console.log(`    extra (${f.extra.length}): ${f.extra.slice(0, 3).join(' | ')}`);
    if (f.storedCount != null) {
      console.log(`    counts stored=${f.storedCount} expected=${f.expectedCount}`);
    }
  }
  for (const w of result.warnings) {
    console.log(`\n  WARN ${w.path}: ${w.err}`);
  }

  if (result.ok) {
    console.log('\n✅ All India postings pass audit.');
    return;
  }

  console.log('\n❌ Audit failed — fix importer and re-import.');
  process.exit(1);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
