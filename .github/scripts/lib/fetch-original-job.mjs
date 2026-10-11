import { originalDescriptionText, sanitizeSourceDescription, sourceDescriptionHtml } from '../../../src/lib/source-job-description.mjs';
import { pageData, validBoard, workdaySource, GEM_DETAIL_QUERY, gemRequest, gemData, gemDescription } from './public-ats-data.mjs';

const MAX_RESPONSE_BYTES = 12 * 1024 * 1024;
const byteBudgetError = () => Object.assign(new Error('ATS response exceeds byte budget'), { code: 'SOURCE_BYTE_BUDGET' });
export const ORIGINAL_JOB_SOURCES = ['greenhouse', 'ashby', 'lever', 'workable', 'smartrecruiters', 'workday', 'gem', 'jazzhr'];

/** Fixed official ATS endpoints only. No generic page scraping, model calls,
 * navigation text, archived postings, or inference from a role's title.
 */
export function originalJobIdentity(job) {
  const external = String(job.external_id || '');
  let match, stored = null, linked = null;
  if (job.source === 'greenhouse' && (match = external.match(/^gh_([\w. -]+)_(\d+)$/))) stored = { kind: job.source, board: match[1], id: match[2] };
  if (job.source === 'ashby' && (match = external.match(/^ashby_([\w. -]+)_([\da-f-]{36})$/i))) stored = { kind: job.source, board: match[1], id: match[2] };
  if (job.source === 'lever' && (match = external.match(/^lever_([\w. -]+)_([\da-f-]{36})$/i))) stored = { kind: job.source, board: match[1], id: match[2] };
  if (stored && !validBoard(stored.board)) return null;
  try {
    const url = new URL(job.apply_url);
    if (url.protocol !== 'https:' || url.port || url.username || url.password) return null;
    const path = decodeURIComponent(url.pathname);
    if (['boards.greenhouse.io', 'job-boards.greenhouse.io', 'boards.eu.greenhouse.io', 'job-boards.eu.greenhouse.io'].includes(url.hostname) &&
        (match = path.match(/^\/([\w. -]+)\/jobs\/(\d+)\/?$/))) linked = { kind: 'greenhouse', board: match[1], id: match[2], eu: url.hostname.includes('.eu.') };
    if (url.hostname === 'jobs.ashbyhq.com' && (match = path.match(/^\/([\w. -]+)\/([\da-f-]{36})(?:\/application)?\/?$/i))) linked = { kind: 'ashby', board: match[1], id: match[2] };
    if (['jobs.lever.co', 'jobs.eu.lever.co'].includes(url.hostname) && (match = path.match(/^\/([\w. -]+)\/([\da-f-]{36})(?:\/apply)?\/?$/i))) linked = { kind: 'lever', board: match[1], id: match[2], eu: url.hostname.includes('.eu.') };
    if (url.hostname === 'apply.workable.com' && (match = path.match(/^\/([\w-]+)\/j\/([\w-]+)\/?$/))) linked = { kind: 'workable', board: match[1], id: match[2] };
    if (url.hostname === 'jobs.smartrecruiters.com' && (match = path.match(/^\/([\w-]+)\/(\d+)(?:-|\/|$)/))) linked = { kind: 'smartrecruiters', board: match[1], id: match[2] };
    if (url.hostname === 'jobs.gem.com' && (match = path.match(/^\/([\w-]+)\/([\w-]+)(?:\/application)?\/?$/))) {
      if (external && external !== `gem_${match[1]}_${match[2]}`) return null;
      linked = { kind: 'gem', board: match[1], id: match[2] };
    }
    if (/^[\w-]+\.applytojob\.com$/.test(url.hostname) && (match = path.match(/^\/apply\/([\w-]+)\/[\w-]+\/?$/))) {
      const board = url.hostname.split('.')[0];
      if (external && external !== `jazzhr_${board}_${match[1]}`) return null;
      linked = { kind: 'jazzhr', board, id: match[1], url: url.origin + url.pathname };
    }
    if (/^[\w-]+\.wd\d+\.myworkdayjobs\.com$/.test(url.hostname) &&
        (match = url.pathname.match(/^\/(?:[a-z]{2}-[A-Z]{2}\/)?([\w-]+)(\/job\/[\w%./-]+)$/)) && !decodeURIComponent(match[2]).includes('..')) {
      const tenant = url.hostname.split('.')[0];
      const req = external.match(new RegExp(`^wd_${tenant}_([\\w-]+)$`));
      if (!req || !decodeURIComponent(match[2]).split('/').at(-1).includes(`_${req[1]}`)) return null;
      return { kind: 'workday', board: `${url.hostname}/${tenant}/${match[1]}`, id: req[1], path: match[2] };
    }
  } catch { /* Unsupported source stays apply-out. */ }
  if (linked && !validBoard(linked.board)) return null;
  if (linked && stored && (linked.kind !== stored.kind || linked.board.toLowerCase() !== stored.board.toLowerCase() || linked.id !== stored.id)) return null;
  return linked || stored;
}

export function createOriginalJobFetcher(fetcher = fetch) {
  const boards = new Map();
  async function read(url, accept = 'application/json', maxBytes = MAX_RESPONSE_BYTES, removedRedirectPath = null, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetcher(url, { ...options, signal: controller.signal, redirect: 'manual', headers: { Accept: accept, 'User-Agent': 'CVinBioJobImport/1.0 (+https://cvin.bio)', ...options.headers } });
      if ([301, 302, 303, 307, 308].includes(response.status) && removedRedirectPath) {
        const location = new URL(response.headers.get('location') || '', url);
        await response.body?.cancel();
        if (location.origin === new URL(url).origin && location.pathname.replace(/\/$/, '') === removedRedirectPath &&
            (location.searchParams.get('error') === 'true' || location.searchParams.get('not_found') === 'true')) return null;
        throw new Error('Unverified ATS redirect');
      }
      if ([404, 410].includes(response.status)) { await response.body?.cancel(); return null; }
      if (!response.ok) { await response.body?.cancel(); throw new Error(`ATS HTTP ${response.status}`); }
      if (Number(response.headers.get('content-length')) > maxBytes) { await response.body?.cancel(); throw byteBudgetError(); }
      const reader = response.body.getReader();
      const chunks = [];
      let size = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) { await reader.cancel(); throw byteBudgetError(); }
        chunks.push(value);
      }
      return Buffer.concat(chunks).toString('utf8');
    } finally { clearTimeout(timer); }
  }
  async function json(url, maxBytes) {
    const body = await read(url, 'application/json', maxBytes);
    return body === null ? null : JSON.parse(body);
  }
  const result = (html, job) => {
    const clean = sanitizeSourceDescription(html, job.apply_url);
    return { ok: true, text: originalDescriptionText({ html: clean }), html: clean };
  };
  async function postingPage(meta, job) {
    const board = encodeURIComponent(meta.board), id = encodeURIComponent(meta.id);
    const host = meta.kind === 'workable' ? 'apply.workable.com' : meta.kind === 'ashby' ? 'jobs.ashbyhq.com' : meta.kind === 'lever'
      ? `jobs${meta.eu ? '.eu' : ''}.lever.co` : `job-boards${meta.eu ? '.eu' : ''}.greenhouse.io`;
    const path = meta.kind === 'workable' ? `${board}/j/${id}/` : meta.kind === 'greenhouse' ? `${board}/jobs/${id}` : `${board}/${id}`;
    const html = await read(meta.kind === 'jazzhr' ? meta.url : `https://${host}/${path}`, 'text/html', MAX_RESPONSE_BYTES, `/${board}`);
    if (html === null) return { ok: false, reason: 'source_closed', closed: true };
    const { postings } = pageData(html);
    const posting = postings.find((node) => !node.identifier?.value || String(node.identifier.value) === meta.id);
    if (posting?.description) return result(posting.description, job);
    if (/job (?:posting )?(?:is no longer available|has been closed|not found)|position is no longer available/i.test(html)) {
      return { ok: false, reason: 'source_closed', closed: true };
    }
    return { ok: false, reason: 'source_details_unavailable' };
  }
  return async (job) => {
    const meta = originalJobIdentity(job);
    if (!meta) return { ok: false, reason: 'unsupported_source' };
    const board = encodeURIComponent(meta.board);
    const id = encodeURIComponent(meta.id);
    let data, html;
    if (meta.kind === 'greenhouse') {
      data = await json(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${id}`);
      if (!data) return postingPage(meta, job);
      if (String(data.id) !== meta.id) return { ok: false, reason: 'source_identity_mismatch' };
      html = data.content;
    } else if (meta.kind === 'ashby') {
      // A single official page carries JobPosting JSON-LD, even when the
      // employer's all-jobs board exceeds the response budget (e.g. OpenAI).
      const page = await postingPage(meta, job);
      if (page.ok || page.closed) return page;
      if (!boards.has(board)) {
        if (boards.size >= 4) boards.delete(boards.keys().next().value);
        // Node-only fallback, not a Worker response. Bound whole-board reads
        // separately, and retain only ID + one description representation.
        boards.set(board, json(`https://api.ashbyhq.com/posting-api/job-board/${board}`, 64 * 1024 * 1024).then((data) => {
          if (!data || !Array.isArray(data.jobs)) throw new Error('Invalid Ashby board response');
          return new Map(data.jobs.filter((row) => row.isListed !== false).map((row) => [row.id,
            { descriptionHtml: row.descriptionHtml, descriptionPlain: row.descriptionHtml ? undefined : row.descriptionPlain }]));
        }));
      }
      data = (await boards.get(board)).get(meta.id);
      if (!data) return { ok: false, reason: 'source_closed', closed: true };
      html = data.descriptionHtml || sourceDescriptionHtml(data.descriptionPlain || '');
    } else if (meta.kind === 'lever') {
      data = await json(`https://api${meta.eu ? '.eu' : ''}.lever.co/v0/postings/${board}/${id}?mode=json`);
      if (!data) return postingPage(meta, job);
      if (data.id !== meta.id) return { ok: false, reason: 'source_identity_mismatch' };
      html = [data.description || data.descriptionHtml || sourceDescriptionHtml(data.descriptionPlain || ''),
        ...(data.lists || []).map((section) => `<h2>${originalDescriptionText({ plain: section.text }).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</h2>${section.content || ''}`),
        data.additional || sourceDescriptionHtml(data.additionalPlain || '')].filter(Boolean).join('\n');
    } else if (meta.kind === 'workable') {
      data = await json(`https://apply.workable.com/api/v2/accounts/${board}/jobs/${id}`);
      if (!data) return postingPage(meta, job);
      if (data.shortcode && data.shortcode !== meta.id) return { ok: false, reason: 'source_identity_mismatch' };
      html = [data.description, data.requirements && `<h2>Requirements</h2>${data.requirements}`, data.benefits && `<h2>Benefits</h2>${data.benefits}`].filter(Boolean).join('\n');
    } else if (meta.kind === 'workday') {
      data = await json(workdaySource(meta.board).base + meta.path);
      if (!data) return { ok: false, reason: 'source_closed', closed: true };
      if (data.jobPostingInfo?.jobReqId !== meta.id) return { ok: false, reason: 'source_identity_mismatch' };
      if (data.jobPostingInfo.canApply === false) return { ok: false, reason: 'source_closed', closed: true };
      html = data.jobPostingInfo.jobDescription;
    } else if (meta.kind === 'gem') {
      const body = await read('https://jobs.gem.com/api/public/graphql/batch', 'application/json', MAX_RESPONSE_BYTES, null,
        gemRequest(GEM_DETAIL_QUERY, { boardId: meta.board, extId: meta.id }));
      if (body === null) return { ok: false, reason: 'source_details_unavailable' };
      data = gemData(JSON.parse(body), 'oatsExternalJobPosting');
      if (!data || data.isUnlistedExternally) return { ok: false, reason: 'source_closed', closed: true };
      if (data.extId !== meta.id) return { ok: false, reason: 'source_identity_mismatch' };
      html = gemDescription(data);
    } else if (meta.kind === 'jazzhr') {
      return postingPage(meta, job);
    } else {
      data = await json(`https://api.smartrecruiters.com/v1/companies/${board}/postings/${id}`);
      if (!data || String(data.id) !== meta.id) return { ok: false, reason: 'source_not_found' };
      const sections = data.jobAd?.sections || {};
      html = ['companyDescription', 'jobDescription', 'qualifications', 'additionalInformation'].map((key) => {
        const section = sections[key];
        return section?.text ? `${section.title ? `<h2>${String(section.title).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</h2>` : ''}${section.text}` : '';
      }).filter(Boolean).join('\n');
    }
    return result(html, job);
  };
}
