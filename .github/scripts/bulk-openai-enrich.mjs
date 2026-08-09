/**
 * Bulk-enrich under-600-word job descriptions via the CHEAPEST OpenAI model.
 * Only touches jobs whose existing description has real source material (>= MIN_SOURCE words),
 * so rewrites are grounded in facts (no fabrication). Keeps existing external_id (URL unchanged),
 * adds curated-jd + remote tags.
 *
 * Env:
 *   MAX_JOBS        limit this run (default 0 = unlimited)
 *   CONCURRENCY     parallel requests (default 8)
 *   MODEL           default gpt-4.1-nano (cheapest); override to fall back
 *   MIN_SOURCE      min words in existing description to enrich (default 150)
 *   COMPANY_KEY     restrict to one company (optional)
 *   STATE           state file path (default /tmp/bulk-enrich-state.json)
 *
 * Usage: node .github/scripts/bulk-openai-enrich.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const env = {};
for (const line of readFileSync(
  '/Users/vedang/.gemini/antigravity/scratch/PDFtoWebsite/.env.local',
  'utf8'
).split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (m) env[m[1]] = m[2];
}
const U = (env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = env.SUPABASE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '';
const OPENAI_KEY = env.OPENAI_API_KEY || '';
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const REMOTE_RE = /remote|hybrid|work from home|wfh|worldwide|anywhere|virtual|global|telecommute/i;
function looksRemote(location, jobType, tags) {
  const s = [location, jobType, (tags || []).join(' ')].filter(Boolean).join(' ');
  return REMOTE_RE.test(s);
}

const REQUIRED_HEADERS = [
  'About the role',
  'Key facts',
  'What you\'ll do',
  'Requirements',
  'Nice to have',
  'Skills & tools',
  'Practical notes',
];
function hasFormat(text) {
  return REQUIRED_HEADERS.every((h) => text.includes(h));
}

const MODEL = process.env.MODEL || 'gpt-4.1-nano';
const MAX_JOBS = Number(process.env.MAX_JOBS || 0);
const CONCURRENCY = Math.max(1, Math.min(16, Number(process.env.CONCURRENCY || 8)));
const MIN_SOURCE = Math.max(1, Number(process.env.MIN_SOURCE || 150));
const COMPANY_KEY = process.env.COMPANY_KEY || '';
const STATE_FILE = process.env.STATE || '/tmp/bulk-enrich-state.json';

const wc = (d) => (d || '').split(/\s+/).filter(Boolean).length;

let state = { processed: {} };
if (existsSync(STATE_FILE)) {
  try {
    state = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  } catch {}
}

async function jfetch(url, opts = {}, timeout = 90000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function buildPrompt(job, sourceText) {
  const metaBits = [
    `Company: ${job.company}`,
    `Title: ${job.title}`,
    job.location ? `Listed location: ${job.location}` : null,
    job.job_type ? `Job type: ${job.job_type}` : null,
    job.salary ? `Listed salary: ${job.salary}` : null,
    (job.tags || []).filter((t) => t !== 'curated-jd' && t !== 'remote').length
      ? `Tags: ${(job.tags || []).filter((t) => t !== 'curated-jd' && t !== 'remote').join(', ')}`
      : null,
  ]
    .filter(Boolean)
    .join('\n');

  return `Expand this into a cvin.bio job page. Output ONLY plain text.

STRICT ACCURACY RULES — never violate these:
- Use the EXACT listed location and job type from SOURCE/META. Never change them.
- Do NOT describe the role as remote, hybrid, work-from-home, or office-based unless SOURCE explicitly says so. If SOURCE lists a specific city/office, state that office location and describe the role as on-site.
- Do NOT invent facts: no fabricated tech stacks, benefits, interview processes, visa details, or team size. Only facts present in SOURCE/META may be included.
- Keep every concrete fact from SOURCE (stack, years, location, salary, benefits, visa, ITAR).
- Paraphrase; do NOT copy sentences verbatim.

FORMATTING RULES:
- Must contain exactly these headings, each on its own line, in order: "About the role", "Key facts", "What you'll do", "Requirements", "Nice to have", "Skills & tools", "Practical notes".
- Blank line between sections. Bullets start with "- ". No markdown, no bold, no backticks.
- The first line must be: ${job.title} at ${job.company}.

Format:
${job.title} at ${job.company}.

About the role
(3-5 sentences)

Key facts
Location: <exact location from SOURCE>
Engagement: ...
(salary line only if present in SOURCE)

What you'll do
- (8-12 detailed bullets)

Requirements
- (6-10 bullets)

Nice to have
- (3-6 bullets)

Skills & tools
- ...

Practical notes
- ...

META
${metaBits}

SOURCE:
${sourceText.slice(0, 8000)}`;
}

async function rewriteOpenAI(job, sourceText) {
  const prompt = buildPrompt(job, sourceText);
  let lastErr = '';
  const call = async (messages) => {
    const r = await jfetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({ model: MODEL, messages, temperature: 0.3, max_tokens: 4096, top_p: 0.9 }),
    });
    const body = await r.text();
    if (r.ok) {
      const data = JSON.parse(body);
      return { text: (data.choices?.[0]?.message?.content || '').trim(), usage: data.usage || null };
    }
    return { error: `openai_${r.status}:${body.slice(0, 180)}`, status: r.status };
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const messages = [{ role: 'user', content: prompt }];
      const res = await call(messages);
      if (res.error) {
        lastErr = res.error;
        if (/model|not found/i.test(res.error)) throw new Error(`model_not_found:${MODEL}`);
        if (res.status === 429) { await sleep(2000); continue; }
        return { ok: false, error: res.error };
      }
      let text = res.text;
      let problem = '';
      if (wc(text) < 600) problem = `only ${wc(text)} words`;
      else if (!hasFormat(text)) problem = 'missing required headings';
      if (!problem) return { ok: true, text, usage: res.usage };

      lastErr = `openai_${problem.replace(/\s+/g, '_')}`;
      // One correction round: ask to fix the specific problem, output the FULL text again.
      const fix = await call([
        { role: 'user', content: prompt },
        { role: 'assistant', content: text },
        {
          role: 'user',
          content:
            `This output ${problem}. Fix it: keep every fact, do not add new facts, and output the COMPLETE revised plain-text page with ALL required headings (About the role / Key facts / What you'll do / Requirements / Nice to have / Skills & tools / Practical notes) and at least 600 words. Output ONLY the full text.`,
        },
      ]);
      if (fix.error) { lastErr = fix.error; continue; }
      text = fix.text;
      if (wc(text) >= 600 && hasFormat(text)) return { ok: true, text, usage: fix.usage || res.usage };
      lastErr = `openai_short_${wc(text)}`;
    } catch (e) {
      lastErr = `openai_err:${String(e.message || e).slice(0, 120)}`;
      if (/model_not_found/.test(lastErr)) return { ok: false, error: lastErr };
      await sleep(1500);
    }
  }
  return { ok: false, error: lastErr };
}

async function fetchCandidates() {
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const PAGE = 1000;
  let offset = 0;
  const out = [];
  while (true) {
    let url =
      `${U}/rest/v1/jobs?select=id,title,company,company_key,location,job_type,salary,tags,external_id,description,apply_url` +
      `&apply_url=not.is.null&created_at=gt.${encodeURIComponent(since)}&order=created_at.desc&limit=${PAGE}&offset=${offset}`;
    if (COMPANY_KEY) url += `&company_key=eq.${encodeURIComponent(COMPANY_KEY)}`;
    const r = await jfetch(url, { headers: H });
    if (!r.ok) throw new Error(`fetch ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const rows = await r.json();
    if (!Array.isArray(rows) || !rows.length) break;
    out.push(...rows);
    if (rows.length < PAGE) break;
    offset += PAGE;
    if (out.length > 60000) break; // safety cap
  }
  return out
    .filter((j) => !state.processed[j.id] && wc(j.description) < 600 && wc(j.description) >= MIN_SOURCE)
    .sort((a, b) => wc(b.description) - wc(a.description));
}

async function applyOne(id, desc) {
  const row = await jfetch(`${U}/rest/v1/jobs?select=id,tags,location,job_type&id=eq.${id}`, { headers: H }).then((r) => r.json());
  const job = Array.isArray(row) ? row[0] : null;
  if (!job) return false;
  const tags = Array.isArray(job.tags) ? [...job.tags] : [];
  if (looksRemote(job.location, job.job_type, job.tags)) {
    if (!tags.includes('remote')) tags.push('remote');
  } else {
    // Never tag on-site roles as remote — accuracy first.
    tags.splice(tags.indexOf('remote'), 1);
  }
  if (!tags.includes('curated-jd')) tags.push('curated-jd');
  const r = await jfetch(`${U}/rest/v1/jobs?id=eq.${id}`, {
    method: 'PATCH',
    headers: H,
    body: JSON.stringify({ description: desc, tags }),
  });
  return r.ok || r.status === 204;
}

let usageTotal = { prompt_tokens: 0, completion_tokens: 0 };

async function worker(queue, stats) {
  while (queue.length) {
    const job = queue.shift();
    const source = job.description || '';
    const res = await rewriteOpenAI(job, source);
    if (res.usage) {
      usageTotal.prompt_tokens += res.usage.prompt_tokens || 0;
      usageTotal.completion_tokens += res.usage.completion_tokens || 0;
    }
    if (res.ok) {
      const ok = await applyOne(job.id, res.text);
      if (ok) {
        stats.ok++;
        state.processed[job.id] = { status: 'ok', w: wc(res.text) };
        console.log(`OK ${job.id.slice(0, 8)} (${wc(res.text)}w) ${job.company}: ${job.title}`);
      } else {
        stats.fail++;
        state.processed[job.id] = { status: 'patch_fail' };
      }
    } else {
      stats.fail++;
      state.processed[job.id] = { status: 'fail', reason: res.error };
      console.log(`FAIL ${job.id.slice(0, 8)}: ${res.error}`);
    }
    if ((stats.ok + stats.fail) % 10 === 0) {
      writeFileSync(STATE_FILE, JSON.stringify(state));
      console.log(
        `  progress: ok=${stats.ok} fail=${stats.fail} tokens=(${usageTotal.prompt_tokens}in/${usageTotal.completion_tokens}out)`
      );
    }
  }
}

async function main() {
  if (!OPENAI_KEY) {
    console.error('Missing OPENAI_API_KEY');
    process.exit(1);
  }
  console.log(`model=${MODEL} min_source=${MIN_SOURCE} concurrency=${CONCURRENCY} max_jobs=${MAX_JOBS} company=${COMPANY_KEY || 'all'}`);
  const t0 = Date.now();
  const candidates = await fetchCandidates();
  console.log(`Loaded ${candidates.length} candidates under 600 words with >= ${MIN_SOURCE} source words`);
  const queue = MAX_JOBS ? candidates.slice(0, MAX_JOBS) : candidates;
  console.log(`Processing ${queue.length} jobs…`);

  const stats = { ok: 0, fail: 0 };
  const workers = Array.from({ length: CONCURRENCY }, () => worker(queue, stats));
  await Promise.all(workers);

  writeFileSync(STATE_FILE, JSON.stringify(state));
  const costIn = (usageTotal.prompt_tokens / 1e6) * 0.1; // gpt-4.1-nano input price
  const costOut = (usageTotal.completion_tokens / 1e6) * 0.4; // gpt-4.1-nano output price
  console.log(
    `\nDone: ok=${stats.ok} fail=${stats.fail} in ${((Date.now() - t0) / 1000).toFixed(0)}s`
  );
  console.log(
    `Tokens: ${usageTotal.prompt_tokens} in / ${usageTotal.completion_tokens} out — est cost $${(costIn + costOut).toFixed(2)} (at $0.10/$0.40 per M)`
  );
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
