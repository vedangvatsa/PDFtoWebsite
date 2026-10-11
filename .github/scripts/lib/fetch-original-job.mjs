import { originalDescriptionText } from '../../../src/lib/source-job-description.mjs';

const MAX_RESPONSE_BYTES = 12 * 1024 * 1024;
const byteBudgetError = () => Object.assign(new Error('ATS response exceeds byte budget'), { code: 'SOURCE_BYTE_BUDGET' });
export const ORIGINAL_JOB_SOURCES = ['greenhouse', 'ashby', 'lever', 'workable', 'smartrecruiters'];

/** Fixed official ATS endpoints only. No generic page scraping, model calls,
 * navigation text, archived postings, or inference from a role's title.
 */
export function originalJobIdentity(job) {
  const external = String(job.external_id || '');
  let match;
  if (job.source === 'greenhouse' && (match = external.match(/^gh_([\w-]+)_(\d+)$/))) return { kind: job.source, board: match[1], id: match[2] };
  if (job.source === 'ashby' && (match = external.match(/^ashby_([\w-]+)_([\da-f-]{36})$/i))) return { kind: job.source, board: match[1], id: match[2] };
  if (job.source === 'lever' && (match = external.match(/^lever_([\w-]+)_([\da-f-]{36})$/i))) return { kind: job.source, board: match[1], id: match[2] };
  try {
    const url = new URL(job.apply_url);
    if (url.protocol !== 'https:') return null;
    if (['boards.greenhouse.io', 'job-boards.greenhouse.io', 'boards.eu.greenhouse.io', 'job-boards.eu.greenhouse.io'].includes(url.hostname) &&
        (match = url.pathname.match(/^\/([\w-]+)\/jobs\/(\d+)\/?$/))) return { kind: 'greenhouse', board: match[1], id: match[2], eu: url.hostname.includes('.eu.') };
    if (url.hostname === 'jobs.ashbyhq.com' && (match = url.pathname.match(/^\/([\w-]+)\/([\da-f-]{36})(?:\/application)?\/?$/i))) return { kind: 'ashby', board: match[1], id: match[2] };
    if (['jobs.lever.co', 'jobs.eu.lever.co'].includes(url.hostname) && (match = url.pathname.match(/^\/([\w-]+)\/([\da-f-]{36})(?:\/apply)?\/?$/i))) return { kind: 'lever', board: match[1], id: match[2], eu: url.hostname.includes('.eu.') };
    if (url.hostname === 'apply.workable.com' && (match = url.pathname.match(/^\/([\w-]+)\/j\/([\w-]+)\/?$/))) return { kind: 'workable', board: match[1], id: match[2] };
    if (url.hostname === 'jobs.smartrecruiters.com' && (match = url.pathname.match(/^\/([\w-]+)\/(\d+)(?:-|\/|$)/))) return { kind: 'smartrecruiters', board: match[1], id: match[2] };
  } catch { /* Unsupported source stays apply-out. */ }
  return null;
}

export function createOriginalJobFetcher(fetcher = fetch) {
  const boards = new Map();
  async function json(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetcher(url, { signal: controller.signal, redirect: 'error', headers: { Accept: 'application/json', 'User-Agent': 'CVinBioJobImport/1.0 (+https://cvin.bio)' } });
      if ([404, 410].includes(response.status)) { await response.body?.cancel(); return null; }
      if (!response.ok) { await response.body?.cancel(); throw new Error(`ATS HTTP ${response.status}`); }
      if (Number(response.headers.get('content-length')) > MAX_RESPONSE_BYTES) { await response.body?.cancel(); throw byteBudgetError(); }
      const reader = response.body.getReader();
      const chunks = [];
      let size = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_RESPONSE_BYTES) { await reader.cancel(); throw byteBudgetError(); }
        chunks.push(value);
      }
      return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } finally { clearTimeout(timer); }
  }
  return async (job) => {
    const meta = originalJobIdentity(job);
    if (!meta) return { ok: false, reason: 'unsupported_source' };
    const board = encodeURIComponent(meta.board);
    const id = encodeURIComponent(meta.id);
    let data, text;
    if (meta.kind === 'greenhouse') {
      data = await json(`https://boards-api${meta.eu ? '.eu' : ''}.greenhouse.io/v1/boards/${board}/jobs/${id}`);
      if (!data || String(data.id) !== meta.id) return { ok: false, reason: 'source_not_found' };
      text = originalDescriptionText({ html: data.content });
    } else if (meta.kind === 'ashby') {
      if (!boards.has(board)) {
        if (boards.size >= 4) boards.delete(boards.keys().next().value);
        boards.set(board, json(`https://api.ashbyhq.com/posting-api/job-board/${board}`));
      }
      data = (await boards.get(board))?.jobs?.find((row) => row.id === meta.id && row.isListed !== false);
      if (!data) return { ok: false, reason: 'source_not_found' };
      text = originalDescriptionText({ html: data.descriptionHtml, plain: data.descriptionPlain });
    } else if (meta.kind === 'lever') {
      data = await json(`https://api${meta.eu ? '.eu' : ''}.lever.co/v0/postings/${board}/${id}?mode=json`);
      if (!data || data.id !== meta.id) return { ok: false, reason: 'source_not_found' };
      text = [originalDescriptionText({ html: data.description || data.descriptionHtml, plain: data.descriptionPlain }),
        ...(data.lists || []).map((section) => [section.text, originalDescriptionText({ html: section.content })].filter(Boolean).join('\n')),
        originalDescriptionText({ html: data.additional, plain: data.additionalPlain })].filter(Boolean).join('\n\n');
    } else if (meta.kind === 'workable') {
      data = await json(`https://apply.workable.com/api/v2/accounts/${board}/jobs/${id}`);
      if (!data || (data.shortcode && data.shortcode !== meta.id)) return { ok: false, reason: 'source_not_found' };
      text = [data.description, data.requirements, data.benefits].filter(Boolean).map((html) => originalDescriptionText({ html })).join('\n\n');
    } else {
      data = await json(`https://api.smartrecruiters.com/v1/companies/${board}/postings/${id}`);
      if (!data || String(data.id) !== meta.id) return { ok: false, reason: 'source_not_found' };
      const sections = data.jobAd?.sections || {};
      text = ['companyDescription', 'jobDescription', 'qualifications', 'additionalInformation'].map((key) => {
        const section = sections[key];
        return section?.text ? [section.title, originalDescriptionText({ html: section.text })].filter(Boolean).join('\n') : '';
      }).filter(Boolean).join('\n\n');
    }
    return { ok: true, text };
  };
}
