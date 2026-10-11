import { Parser } from 'htmlparser2';

/** Public employer metadata only. Parse data scripts; never evaluate page code. */
export function pageData(html) {
  const postings = [], links = [], scripts = [];
  let type = '', buffer = '', next = null;
  const visit = (node) => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== 'object') return;
    if ([node['@type']].flat().includes('JobPosting')) postings.push(node);
    if (node['@graph']) visit(node['@graph']);
  };
  new Parser({
    onopentag(name, attrs) {
      if (name === 'a' && attrs.href) links.push(attrs.href);
      if (name === 'script') {
        if (attrs.src) scripts.push(attrs.src);
        type = attrs.id === '__NEXT_DATA__' ? 'next' : attrs.type === 'application/ld+json' ? 'ld' : '';
        buffer = '';
      }
    },
    ontext(text) { if (type) buffer += text; },
    onclosetag(name) {
      if (name !== 'script' || !type) return;
      try { const data = JSON.parse(buffer); if (type === 'next') next = data; else visit(data); }
      catch { /* Missing structured data is not evidence that a posting closed. */ }
      type = '';
    },
  }).end(html);
  return { postings, links, scripts, next };
}

export function validBoard(board) {
  return typeof board === 'string' && /^[\w][\w. -]{0,99}$/.test(board) && !board.includes('..') && board.trim() === board;
}

export function workdaySource(board) {
  const [host, tenant, site, extra] = board.split('/');
  if (extra || !/^[\w-]+\.wd\d+\.myworkdayjobs\.com$/.test(host) || !/^[\w-]+$/.test(tenant) || !/^[\w-]+$/.test(site) || host.split('.')[0] !== tenant) throw new Error('Invalid Workday source');
  return { host, tenant, site, base: `https://${host}/wday/cxs/${tenant}/${site}` };
}

export const GEM_LIST_QUERY = `query JobBoardList($boardId: String!) {
  oatsExternalJobPostings(boardId: $boardId) { jobPostings {
    extId title locations { name isRemote } job { locationType employmentType }
  } }
}`;
export const GEM_DETAIL_QUERY = `query ExternalJobPosting($boardId: String!, $extId: String!) {
  oatsExternalJobPosting(boardId: $boardId, extId: $extId) {
    extId title descriptionHtml firstPublishedTsSec isUnlistedExternally
    locations { name isRemote } job { locationType employmentType }
    jobPostSectionHtml { introHtml outroHtml } compensationHtml
  }
}`;
export const gemRequest = (query, variables) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify([{ query, variables }]) });
export function gemData(response, field) {
  if (!Array.isArray(response) || response.length !== 1 || response[0].errors?.length || !response[0].data || !(field in response[0].data)) throw new Error('Invalid Gem public response');
  return response[0].data[field];
}
export function gemDescription(job) {
  return [job.jobPostSectionHtml?.introHtml, job.descriptionHtml, job.compensationHtml, job.jobPostSectionHtml?.outroHtml].filter(Boolean).join('\n');
}
