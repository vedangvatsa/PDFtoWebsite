/**
 * One rewrite on a free OpenRouter model. No paid tokens.
 *   JOB_ID=... SAVE=0 npx tsx .github/scripts/canary-one-jd.ts
 */
import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { cleanAtsHtml, parseGreenhouseExternalId, usableSourceText, sourceWordCount } from '../../src/lib/job-ats-text';
import { buildWriteUser, loadWriteSystemPrompt } from '../../src/lib/job-write-prompt';
import { finalizeCuratedJd } from '../../src/lib/job-finalize';
import { repairLoop } from '../../src/lib/job-repair';

config({ path: '.env.local' });
config();

const U = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const K = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const OR = (process.env.OPENROUTER_API_KEY || '').trim();
const MODEL = process.env.OPENROUTER_MODEL || 'inclusionai/ling-3.0-tiny:free';
const JOB_ID = process.env.JOB_ID || '';
const SAVE = process.env.SAVE === '1';
const headers = { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' };
const WRITE_SYSTEM = loadWriteSystemPrompt();

async function main() {
  if (!U || !K) throw new Error('Need Supabase env');
  if (!OR) throw new Error('Need OPENROUTER_API_KEY');
  if (!JOB_ID) throw new Error('Need JOB_ID');

  const job = await (
    await fetch(
      `${U}/rest/v1/jobs?select=id,title,company,location,job_type,salary,tags,external_id,apply_url,company_key,published_at,created_at&id=eq.${JOB_ID}`,
      { headers }
    )
  ).json();
  const row = Array.isArray(job) ? job[0] : null;
  if (!row) throw new Error('job not found');

  const gh = parseGreenhouseExternalId(row.external_id);
  if (!gh) throw new Error('not greenhouse');
  const ats = await fetch(
    `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(gh.slug)}/jobs/${gh.id}`
  );
  if (!ats.ok) throw new Error(`gh ${ats.status}`);
  const d = await ats.json();
  const source = cleanAtsHtml(d.content || '');
  const srcWords = sourceWordCount(source);
  if (!usableSourceText(source)) {
    console.log(JSON.stringify({ skip: 'source_empty', srcWords, api: 0 }));
    process.exit(2);
  }

  const user = buildWriteUser({
    title: row.title,
    company: row.company,
    location: row.location,
    jobType: row.job_type,
    salary: row.salary,
    sourceText: source,
  });
  const callModel = async (prompt: string, system: string) => {
    const ai = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OR}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://cvin.bio',
        'X-Title': 'cvin.bio jd free canary',
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        max_tokens: 2200,
        ...(MODEL.includes(':free') ? {} : { reasoning: { effort: 'none' } }),
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      }),
    });
    const body = await ai.json();
    if (!ai.ok) {
      throw new Error(`openrouter_${ai.status}:${JSON.stringify(body?.error || body).slice(0, 200)}`);
    }
    return String(body.choices?.[0]?.message?.content || '');
  };
  let rawDraft: string;
  let fin: ReturnType<typeof finalizeCuratedJd>;
  let attempts = 0;
  for (let fresh = 0; fresh < 2; fresh++) {
    try {
      rawDraft = await callModel(user, WRITE_SYSTEM);
    } catch (e) {
      console.error(JSON.stringify({ openrouter: String(e.message || e) }));
      process.exit(1);
    }
    const res = await repairLoop(
      {
        rawDraft,
        source,
        job: row,
        system: WRITE_SYSTEM,
        callModel,
      },
      (draft, src, job) => finalizeCuratedJd(draft, { sourceText: src, job })
    );
    fin = res.fin;
    attempts += res.attempts;
    if (fin.ok || !fin.reasons.includes('model_scratchpad')) break;
  }
  writeFileSync('/tmp/canary-raw.txt', rawDraft);
  writeFileSync('/tmp/canary-last.txt', fin.text);
  const report = {
    model: MODEL,
    srcWords,
    attempts,
    words: fin.wordCount,
    origin_ok: fin.origin_ok,
    origin_reasons: fin.origin_reasons,
    adequacy_ok: fin.adequacy_ok,
    adequacy_reasons: fin.adequacy_reasons,
    gates_ok: fin.gates_ok,
    gates_indexable: fin.gates_indexable,
    gates_reasons: fin.gates_reasons,
    dropped_copied_lines: fin.dropped_copied_lines,
    copy_span: fin.copy_span,
    jaccard5: fin.jaccard5,
    added: fin.added,
    saved: false,
  };

  // A page that fails ONLY length is an honest short page: save it as a
  // noindex stub (never a "failed job"). Anything else fails closed.
  const onlyShort = fin.reasons.length > 0 && fin.reasons.every((r) => r === 'short');

  if (!fin.ok && !onlyShort) {
    console.log(JSON.stringify({ ...report, result: fin.reasons.includes('model_scratchpad') ? 'FAIL_SCRATCHPAD' : 'FAIL_NOT_SAVED' }, null, 2));
    console.log('\n--- draft head ---\n' + fin.text.slice(0, 900));
    process.exit(2);
  }

  if (SAVE) {
    const tags = Array.isArray(row.tags) ? [...row.tags] : [];
    if (fin.ok && !tags.includes('curated-jd')) tags.push('curated-jd');
    const patch = await fetch(`${U}/rest/v1/jobs?id=eq.${row.id}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({ description: fin.text, tags }),
    });
    if (!patch.ok) throw new Error(`patch ${patch.status} ${await patch.text()}`);
    report.saved = true;
  }

  const slug = String(row.company_key || row.company || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const rest = String(row.external_id || '').includes('_')
    ? String(row.external_id).slice(String(row.external_id).indexOf('_') + 1)
    : row.id;
  const result = fin.ok ? 'PASS' : 'STUB_SAVED';
  console.log(JSON.stringify({ ...report, result, url: `https://cvin.bio/${slug}/${rest}` }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
