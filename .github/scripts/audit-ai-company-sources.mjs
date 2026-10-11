import { Parser } from 'htmlparser2';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function boardFromUrl(input) {
  try {
    const url = new URL(input);
    const parts = url.pathname.split('/').filter(Boolean);
    let provider, board;
    if (/^boards-api(?:\.eu)?\.greenhouse\.io$/.test(url.hostname) && parts[0] === 'v1' && parts[1] === 'boards') {
      provider = url.hostname.includes('.eu.') ? 'greenhouse-eu' : 'greenhouse'; board = parts[2];
    } else if (/^(?:boards|job-boards)(?:\.eu)?\.greenhouse\.io$/.test(url.hostname)) {
      provider = url.hostname.includes('.eu.') ? 'greenhouse-eu' : 'greenhouse'; board = parts[0] === 'embed' ? url.searchParams.get('for') : parts[0];
    } else if (url.hostname === 'jobs.ashbyhq.com') {
      provider = 'ashby'; board = decodeURIComponent(parts[0] || '');
    } else if (url.hostname === 'api.ashbyhq.com' && parts[0] === 'posting-api' && parts[1] === 'job-board') {
      provider = 'ashby'; board = decodeURIComponent(parts[2] || '');
    } else if (/^jobs(?:\.eu)?\.lever\.co$/.test(url.hostname)) {
      provider = url.hostname.includes('.eu.') ? 'lever-eu' : 'lever'; board = parts[0];
    } else if (url.hostname === 'apply.workable.com') {
      provider = 'workable'; board = parts[0];
    } else if (url.hostname === 'jobs.gem.com') {
      provider = 'gem'; board = parts[0];
    } else if (/^[\w-]+\.wd\d+\.myworkdayjobs\.com$/.test(url.hostname)) {
      provider = 'workday'; board = `${url.hostname}/${url.hostname.split('.')[0]}/${parts.find((part) => !/^[a-z]{2}-[A-Z]{2}$/.test(part))}`;
    }
    if (!provider || !board || (provider !== 'workday' && (!/^[\w. -]+$/.test(board) || ['.', '..', 'embed', 'jobs', 'j'].includes(board)))) return null;
    return `${provider}:${board}`;
  } catch { return null; }
}

export async function discoverCareerBoards(url, fetcher = fetch) {
  const response = await fetcher(url, { redirect: 'follow', signal: AbortSignal.timeout(20_000), headers: { 'User-Agent': 'CVinBioSourceAudit/1.0 (+https://cvin.bio)' } });
  if (!response.ok) { await response.body?.cancel(); return { status: response.status, finalUrl: response.url, boards: [], links: [] }; }
  const reader = response.body.getReader();
  const chunks = [];
  let bytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 5 * 1024 * 1024) { await reader.cancel(); throw new Error('Career page exceeds audit byte budget'); }
    chunks.push(value);
  }
  const html = Buffer.concat(chunks).toString('utf8');
  const links = new Set([response.url || url]);
  const parser = new Parser({ onopentag(name, attrs) {
    for (const key of ['href', 'src', 'data-src']) {
      if (!attrs[key]) continue;
      try { const target = new URL(attrs[key], response.url || url); if (target.protocol === 'https:') links.add(target.href); } catch { /* malformed link */ }
    }
  } });
  parser.end(html);
  for (const match of html.replace(/\\\//g, '/').matchAll(/https?:\/\/[^\s"'<>\\]+/g)) links.add(match[0].replace(/&amp;/g, '&'));
  const boards = [...new Set([...links].map(boardFromUrl).filter(Boolean))];
  if (/greenhouse\.io/.test(html)) {
    for (const match of html.matchAll(/(?:ghSlug|greenhouseSlug|greenhouseBoard|boardToken)\s*[:=]\s*["']([\w-]+)["']/g)) boards.push(`greenhouse:${match[1]}`);
  }
  const usefulLinks = [...links].filter((link) => {
    try {
      const u = new URL(link);
      return /careers|\/jobs|join-us|join-our|recruit|ashby|greenhouse|lever|workable|myworkday|mokahr|feishu|teamtailor|jobs.gem/i.test(link) &&
        !/\.(?:png|jpg|jpeg|avif|svg|webp|woff2?|mp4|css)(?:$|\?)/i.test(u.pathname) && !/_next\/image|cdn_assets|\/api\/images|chatgpt|claude\.ai|perplexity\.ai\/search|google\.com\/search/.test(link);
    } catch { return false; }
  }).slice(0, 15);
  return { status: response.status, finalUrl: response.url, boards: [...new Set(boards)], links: usefulLinks };
}

export async function probeBoard(identity, fetcher = fetch) {
  const split = identity.indexOf(':');
  const provider = identity.slice(0, split), board = identity.slice(split + 1);
  const slug = encodeURIComponent(board);
  let url;
  if (provider.startsWith('greenhouse')) url = `https://boards-api.greenhouse.io/v1/boards/${slug}`;
  else if (provider === 'ashby') url = `https://jobs.ashbyhq.com/${slug}`;
  else if (provider === 'lever' || provider === 'lever-eu') url = `https://jobs${provider.endsWith('-eu') ? '.eu' : ''}.lever.co/${slug}`;
  else if (provider === 'workable') url = `https://apply.workable.com/${slug}/`;
  else return { identity, status: 'needs_provider_check' };
  const response = await fetcher(url, { signal: AbortSignal.timeout(15000), redirect: 'follow' });
  if (!response.ok) { await response.body?.cancel(); return { identity, status: response.status }; }
  const reader = response.body.getReader();
  const chunks = []; let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 5 * 1024 * 1024) { await reader.cancel(); throw new Error('Board identity page exceeds byte budget'); }
    chunks.push(value);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  if (provider.startsWith('greenhouse')) {
    const data = JSON.parse(text);
    return { identity, status: 200, name: data.name, url: data.absolute_url };
  }
  let app = null;
  const match = text.match(/window\.__appData\s*=\s*(\{[\s\S]*?\});/);
  if (match) { try { app = JSON.parse(match[1]); } catch { /* No evaluation of page scripts. */ } }
  const title = text.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
  return { identity, status: provider === 'ashby' && !app?.organization ? 404 : 200,
    name: app?.organization?.name || title, website: app?.organization?.websiteUrl,
    applicationHostname: app?.organization?.applicationHostname };
}

async function main() {
  const roster = JSON.parse(readFileSync(new URL('./data/ai-companies-100.json', import.meta.url)));
  let companies = process.env.AI_AUDIT_IDS ? roster.companies.filter((c) => process.env.AI_AUDIT_IDS.split(',').includes(c.id)) : roster.companies;
  if (process.env.AI_AUDIT_UNMAPPED === '1') {
    const sources = JSON.parse(readFileSync(new URL('./data/ai-company-sources.json', import.meta.url)));
    companies = companies.filter((company) => !sources.boards[company.id]?.length);
  }
  if (process.argv.includes('--probe')) {
    const results = [];
    let next = 0;
    await Promise.all(Array.from({ length: 5 }, async () => {
      while (next < companies.length) {
        const company = companies[next++];
        const probes = [];
        for (const identity of company.candidateBoards || []) {
          try { probes.push(await probeBoard(identity)); }
          catch (error) { probes.push({ identity, status: 'error', error: error.message }); }
        }
        const row = { id: company.id, name: company.name, probes };
        results.push(row); console.log(JSON.stringify(row));
      }
    }));
    if (process.env.AI_AUDIT_OUTPUT) writeFileSync(process.env.AI_AUDIT_OUTPUT, JSON.stringify(results, null, 2));
    return;
  }
  let index = 0;
  const rows = [];
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (index < companies.length) {
      const company = companies[index++];
      let result;
      try {
        result = await discoverCareerBoards(company.careersUrl);
        if (!result.boards.length && result.status === 200 && process.env.AI_AUDIT_FOLLOW === '1') {
          const origin = new URL(result.finalUrl || company.careersUrl);
          const secondary = [...new Set(result.links.filter((link) => {
            const u = new URL(link);
            return u.origin === origin.origin && u.pathname !== origin.pathname && /\/(?:open-roles|open-positions|job-openings|search|jobs)\/?$/.test(u.pathname);
          }).map((link) => { const u = new URL(link); u.hash = ''; u.search = ''; return u.href; }))].slice(0, 2);
          for (const url of secondary) {
            const more = await discoverCareerBoards(url);
            if (more.boards.length) { result = { ...more, evidenceUrl: url }; break; }
          }
        }
      }
      catch (error) { result = { error: error.message, boards: [], links: [] }; }
      const row = { id: company.id, name: company.name, careersUrl: company.careersUrl, ...result };
      rows.push(row);
      console.log(JSON.stringify({ id: row.id, status: row.status || row.error, boards: row.boards, evidence: row.evidenceUrl || row.finalUrl, links: row.boards.length ? undefined : row.links }));
    }
  }));
  if (process.env.AI_AUDIT_OUTPUT) writeFileSync(process.env.AI_AUDIT_OUTPUT, JSON.stringify({ checkedAt: new Date().toISOString(), companies: rows }, null, 2));
  console.log(JSON.stringify({ companies: rows.length, mapped: rows.filter((r) => r.boards.length).length }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
