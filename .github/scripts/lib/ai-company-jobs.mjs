import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { isBannedJobTitle } from '../../../src/lib/banned-jobs.mjs';
import { pageData, validBoard, workdaySource, GEM_LIST_QUERY, GEM_DETAIL_QUERY, gemRequest, gemData, gemDescription } from './public-ats-data.mjs';
import { originalDescriptionText } from '../../../src/lib/source-job-description.mjs';

export const AI_ROSTER = JSON.parse(readFileSync(new URL('../data/ai-companies-100.json', import.meta.url)));
export const AI_SOURCES = JSON.parse(readFileSync(new URL('../data/ai-company-sources.json', import.meta.url)));
export const AI_COMPANIES = AI_ROSTER.companies;
export const AI_COMPANY_IDS = new Set(AI_COMPANIES.map((company) => company.id));

export function aiCompanyId(job) {
  return (job.tags || []).find((tag) => typeof tag === 'string' && tag.startsWith('ai100:'))?.slice(6) || null;
}

/** Explicit workplace metadata wins over incidental words in a location.
 * Never infer remote eligibility from company culture or a missing location.
 */
export function isExplicitlyRemote({ location = '', workplaceType, isRemote }) {
  const mode = String(workplaceType || '').trim().toLowerCase();
  if (/^(?:hybrid|on[-_ ]?site|in[-_ ]?office|office)$/.test(mode)) return false;
  if (mode === 'remote') return true;
  if (isRemote === false) return false;
  if (isRemote === true) return true;
  const text = String(location);
  if (/\b(?:hybrid|on[- ]?site|not remote|non[- ]?remote|remote (?:not |un)available)\b/i.test(text)) return false;
  return /\bremote\b|work from home|\bwfh\b|\btelecommut/i.test(text);
}

export function postedIso(value) {
  if (!value || typeof value === 'string' && !/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value)) return null;
  const date = new Date(typeof value === 'number' && value < 100_000_000_000 ? value * 1000 : value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Keep small employers represented before large boards fill the batch. */
export function interleaveAiCompanies(jobs) {
  const groups = new Map();
  for (const job of jobs) {
    const id = aiCompanyId(job) || job.company;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(job);
  }
  for (const rows of groups.values()) rows.sort((a, b) => String(b.published_at).localeCompare(String(a.published_at)) || a.external_id.localeCompare(b.external_id));
  const result = [];
  for (let index = 0; ; index++) {
    let added = false;
    for (const rows of groups.values()) if (rows[index]) { result.push(rows[index]); added = true; }
    if (!added) return result;
  }
}

export function createAiFeedReader(fetcher = fetch) {
  async function request(url, options = {}, maxBytes = 64 * 1024 * 1024, text = false) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
      const response = await fetcher(url, { ...options, redirect: 'error', signal: controller.signal,
        headers: { Accept: 'application/json', 'User-Agent': 'CVinBioAICompanyJobs/1.0 (+https://cvin.bio)', ...options.headers } });
      if (!response.ok) { await response.body?.cancel(); throw new Error(`Feed HTTP ${response.status}`); }
      const reader = response.body.getReader();
      const chunks = []; let bytes = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > maxBytes) { await reader.cancel(); throw new Error('Feed response exceeds byte budget'); }
        chunks.push(value);
      }
      const body = Buffer.concat(chunks).toString('utf8');
      return text ? body : JSON.parse(body);
    } finally { clearTimeout(timeout); }
  }
  const post = (url, body) => request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const page = (url) => request(url, { headers: { Accept: 'text/html' } }, 5 * 1024 * 1024, true);
  return async (identity) => {
    const colon = identity.indexOf(':');
    const provider = identity.slice(0, colon), board = identity.slice(colon + 1);
    if (colon < 1 || provider !== 'workday' && !validBoard(board)) throw new Error('Invalid employer source');
    const slug = encodeURIComponent(board);
    if (provider === 'greenhouse' || provider === 'greenhouse-eu') {
      // The public API is global; EU applies to the hosted job-board URL only.
      const data = await request(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`);
      if (!Array.isArray(data.jobs)) throw new Error('Invalid Greenhouse feed');
      return { total: data.jobs.length, jobs: data.jobs.map((job) => ({
        source: 'greenhouse', external_id: `gh_${board.toLowerCase()}_${job.id}`, title: job.title,
        location: job.location?.name || '', published_at: postedIso(job.updated_at || job.first_published),
        apply_url: `https://job-boards${provider.endsWith('-eu') ? '.eu' : ''}.greenhouse.io/${slug}/jobs/${job.id}`, category: job.departments?.map((d) => d.name).join(', ') || null,
        workplaceType: job.metadata?.find((m) => /^(?:workplace type|workplace|remote status)$/i.test(m.name))?.value,
        description: job.content || '', job_type: null,
      })) };
    }
    if (provider === 'ashby') {
      const data = await request(`https://api.ashbyhq.com/posting-api/job-board/${slug}`);
      if (!Array.isArray(data.jobs)) throw new Error('Invalid Ashby feed');
      return { total: data.jobs.length, jobs: data.jobs.filter((job) => job.isListed !== false).map((job) => ({
        source: 'ashby', external_id: `ashby_${board.toLowerCase()}_${job.id}`, title: job.title,
        location: job.location || job.locationName || '', isRemote: job.isRemote, workplaceType: job.workplaceType,
        published_at: postedIso(job.publishedAt), apply_url: job.jobUrl || `https://jobs.ashbyhq.com/${slug}/${job.id}`,
        category: job.department || job.team || null, description: job.descriptionHtml || job.descriptionPlain || '',
        job_type: job.employmentType || null,
      })) };
    }
    if (provider === 'lever' || provider === 'lever-eu') {
      const data = await request(`https://api${provider.endsWith('-eu') ? '.eu' : ''}.lever.co/v0/postings/${slug}?mode=json`);
      if (!Array.isArray(data)) throw new Error('Invalid Lever feed');
      return { total: data.length, jobs: data.map((job) => ({
        source: 'lever', external_id: `lever_${board.toLowerCase()}_${job.id}`, title: job.text,
        location: job.categories?.location || '', workplaceType: job.workplaceType,
        published_at: postedIso(job.createdAt || job.created_at), apply_url: job.hostedUrl || job.applyUrl,
        category: job.categories?.department || job.categories?.team || null,
        description: job.descriptionPlain || job.description || '', job_type: job.categories?.commitment || null,
      })) };
    }
    if (provider === 'workable') {
      const data = await post(`https://apply.workable.com/api/v3/accounts/${slug}/jobs`, { query: '', location: [], department: [], worktype: [], remote: [] });
      if (!Array.isArray(data.results)) throw new Error('Invalid Workable feed');
      if (Number(data.total) > data.results.length) throw new Error('Incomplete Workable feed; pagination requires review');
      return { total: data.results.length, jobs: data.results.filter((job) => !job.isInternal && job.state === 'published').map((job) => ({
        source: 'workable', external_id: `wb_${board.toLowerCase()}_${job.shortcode}`, title: job.title,
        location: [job.location?.city, job.location?.country].filter(Boolean).join(', '), isRemote: job.remote, workplaceType: job.workplace,
        published_at: postedIso(job.published), apply_url: `https://apply.workable.com/${slug}/j/${job.shortcode}/`,
        category: job.department?.join(', ') || null, description: '', job_type: job.type === 'full' ? 'full_time' : job.type,
      })) };
    }
    if (provider === 'workday') {
      const { host, tenant, site, base } = workdaySource(board);
      const first = await post(`${base}/jobs`, { limit: 20, offset: 0, appliedFacets: {}, searchText: '' });
      const findRemoteFacet = (facets) => {
        for (const facet of facets || []) {
          const remote = facet.values?.filter((value) => /\bremote\b/i.test(value.descriptor || '') && value.id && !value.values);
          if (remote?.length && facet.facetParameter) return { [facet.facetParameter]: remote.map((value) => value.id) };
          const nested = findRemoteFacet(facet.values);
          if (nested) return nested;
        }
        return null;
      };
      const facets = findRemoteFacet(first.facets);
      if (!facets) throw new Error('Workday remote facet unavailable; no remote inference');
      const listings = []; let total = null;
      for (let offset = 0; offset < 1000; offset += 20) {
        const page = await post(`${base}/jobs`, { limit: 20, offset, appliedFacets: facets, searchText: '' });
        if (!Array.isArray(page.jobPostings) || !Number.isInteger(page.total)) throw new Error('Invalid Workday page');
        total ??= page.total;
        listings.push(...page.jobPostings);
        if (listings.length >= total) break;
        if (!page.jobPostings.length) throw new Error('Incomplete Workday pagination');
      }
      if (listings.length < total) throw new Error('Workday feed exceeds bounded page budget');
      const jobs = []; let oldDisplayDates = 0;
      for (const listing of listings) {
        // This is only a conservative exclusion, never a synthesized date.
        if (/30\+ days ago/i.test(listing.postedOn || '')) { oldDisplayDates++; continue; }
        if (!/^\/job\/[\w%./-]+$/.test(listing.externalPath || '') || listing.externalPath.includes('..')) throw new Error('Invalid Workday posting path');
        const detail = await request(base + listing.externalPath, {}, 2 * 1024 * 1024);
        const job = detail.jobPostingInfo;
        if (!job || job.canApply === false || !job.jobReqId) continue;
        const remoteLocations = [job.location, ...(job.additionalLocations || [])].filter((location) => /\bremote\b/i.test(String(location)));
        jobs.push({ source: 'workday', external_id: `wd_${tenant}_${job.jobReqId}`, title: job.title,
          location: remoteLocations.join('; '), isRemote: remoteLocations.length > 0,
          published_at: postedIso(job.startDate), apply_url: `https://${host}/${site}${listing.externalPath}`,
          category: null, description: job.jobDescription || '', job_type: job.timeType,
        });
      }
      return { total: Math.max(first.total, total), remoteExcluded: oldDisplayDates, excluded: { stale_display_date: oldDisplayDates }, jobs };
    }
    if (provider === 'gem') {
      const endpoint = 'https://jobs.gem.com/api/public/graphql/batch';
      const data = gemData(await request(endpoint, gemRequest(GEM_LIST_QUERY, { boardId: board })), 'oatsExternalJobPostings');
      if (!Array.isArray(data?.jobPostings) || data.jobPostings.length > 1000) throw new Error('Invalid or oversized Gem listing');
      const normalize = (job) => ({
        source: 'gem', external_id: `gem_${board}_${job.extId}`, title: job.title,
        location: (job.locations || []).map((location) => location.name).join('; '),
        workplaceType: job.job?.locationType, isRemote: job.locations?.some((location) => location.isRemote),
        published_at: postedIso(job.firstPublishedTsSec), apply_url: `https://jobs.gem.com/${slug}/${encodeURIComponent(job.extId)}`,
        description: gemDescription(job), job_type: job.job?.employmentType,
      });
      const jobs = [];
      for (const listing of data.jobPostings) {
        if (!isExplicitlyRemote(normalize(listing))) { jobs.push(normalize(listing)); continue; }
        const job = gemData(await request(endpoint, gemRequest(GEM_DETAIL_QUERY, { boardId: board, extId: listing.extId })), 'oatsExternalJobPosting');
        if (job && !job.isUnlistedExternally && job.extId === listing.extId) jobs.push(normalize(job));
      }
      return { total: data.jobPostings.length, jobs };
    }
    if (provider === 'jazzhr') {
      if (!/^[\w-]+$/.test(board)) throw new Error('Invalid JazzHR source');
      const origin = `https://${board}.applytojob.com`;
      const { links } = pageData(await page(`${origin}/apply/`));
      const urls = [...new Set(links.map((link) => new URL(link, origin)).filter((url) => url.origin === origin && /^\/apply\/[\w-]+\/[\w-]+\/?$/.test(url.pathname)).map((url) => url.origin + url.pathname))];
      if (urls.length > 200) throw new Error('JazzHR listing exceeds page budget');
      const jobs = [], errors = [];
      for (const url of urls) {
        try {
          const posting = pageData(await page(url)).postings[0];
          if (!posting) throw new Error('JobPosting data unavailable');
          const text = originalDescriptionText({ html: posting.description });
          const mode = /#LI-(Hybrid|Onsite)\b/i.test(text) ? 'hybrid' : posting.jobLocationType === 'TELECOMMUTE' || /#LI-Remote\b/i.test(text) ? 'remote' : undefined;
          const addresses = [posting.jobLocation].flat().filter(Boolean).map((location) => location.address || {});
          const location = addresses.map((address) => [address.addressLocality, address.addressRegion, typeof address.addressCountry === 'string' ? address.addressCountry : address.addressCountry?.name].filter(Boolean).join(', ')).join('; ');
          jobs.push({ source: 'jazzhr', external_id: `jazzhr_${board}_${new URL(url).pathname.split('/')[2]}`, title: posting.title,
            location, workplaceType: mode, published_at: postedIso(posting.datePosted), apply_url: url, description: posting.description, job_type: posting.employmentType });
        } catch (error) { errors.push({ source: url, error: error.message }); }
      }
      return { total: urls.length, jobs, errors };
    }
    if (provider === 'rippling') {
      const data = pageData(await page(`https://ats.rippling.com/${slug}/jobs`)).next?.props?.pageProps;
      if (data?.apiData?.jobBoard?.slug !== board) throw new Error('Rippling board identity mismatch');
      const query = data.dehydratedState?.queries?.find((query) => query.queryKey?.[0] === 'board' && query.queryKey?.[1] === board && query.queryKey?.[2] === 'job-posts');
      const result = query?.state?.data;
      if (result?.totalItems !== 0 || !Array.isArray(result.items) || result.items.length) throw new Error('Rippling has listings; detail/date adapter needs review');
      return { total: 0, jobs: [] };
    }
    if (provider === 'deepseek' && board === 'official') {
      const origin = 'https://talent.deepseek.com';
      const script = pageData(await page(`${origin}/`)).scripts.find((src) => /^\/static\/main\.[\da-f]+\.js$/.test(src));
      if (!script) throw new Error('DeepSeek careers data script unavailable');
      const text = await page(origin + script);
      const literal = text.match(/JSON\.parse\('(\{"crawledAt"(?:\\.|[^'\\])*)'\)/)?.[1];
      if (!literal) throw new Error('DeepSeek public snapshot unavailable');
      // Decode only the two escapes used by this JSON string literal. No eval.
      const data = JSON.parse(literal.replace(/\\'/g, "'").replace(/\\\\/g, '\\'));
      if (!Array.isArray(data.jobs) || data.total !== data.jobs.length || data.jobs.length > 200) throw new Error('Invalid DeepSeek snapshot');
      return { total: data.total, jobs: data.jobs.map((job) => ({ source: 'deepseek', external_id: `deepseek_${job.id}`, title: job.title,
        location: job.locations?.join('; ') || '', published_at: null, apply_url: job.detailUrl, description: job.descriptionHtml })) };
    }
    if (provider === 'google' && board === 'deepmind') {
      const origin = 'https://www.google.com';
      const url = `${origin}/about/careers/applications/jobs/results?company=DeepMind&has_remote=true`;
      const links = pageData(await page(url)).links;
      const urls = [...new Set(links.map((link) => new URL(link, `${origin}/about/careers/applications/`)).filter((link) => link.origin === origin && /^\/about\/careers\/applications\/jobs\/results\/\d+-/.test(link.pathname)).map((link) => link.origin + link.pathname))];
      if (!urls.length) throw new Error('Google careers result schema requires review; cannot confirm an empty feed');
      // Google currently exposes remote-eligible results but no verifiable
      // absolute posting dates. Keep this limitation visible; never date-stamp it.
      return { total: urls.length, remoteExcluded: urls.length, excluded: { missing_date: urls.length }, jobs: [] };
    }
    if (provider === 'careers' && board === 'tabnine') {
      await page('https://www.tabnine.com/careers/');
      throw new Error('Tabnine careers needs a verified structured source');
    }
    throw new Error(`Unsupported verified provider: ${provider}`);
  };
}

export async function collectAiCompanyJobs({ companies = AI_COMPANIES, sources = AI_SOURCES.boards, readFeed = createAiFeedReader(), decorate = (job) => job, now = Date.now(), log = console.log } = {}) {
  const coverage = new Map();
  const allJobs = [];
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(4, companies.length) }, async () => {
    while (next < companies.length) {
      const company = companies[next++];
      const row = { id: company.id, name: company.name, careersUrl: company.careersUrl, status: 'unmapped_source', boards: [], total: 0, remote: 0, candidates: 0, excluded: {}, errors: [] };
      coverage.set(company.id, row);
      const seen = new Set();
      for (const identity of sources[company.id] || []) {
        try {
          const feed = await readFeed(identity);
          row.boards.push(identity); row.total += feed.total;
          row.remote += feed.remoteExcluded || 0;
          for (const [reason, count] of Object.entries(feed.excluded || {})) row.excluded[reason] = (row.excluded[reason] || 0) + count;
          row.errors.push(...(feed.errors || []));
          for (const job of feed.jobs) {
            if (!isExplicitlyRemote(job)) { row.excluded.not_remote = (row.excluded.not_remote || 0) + 1; continue; }
            row.remote++;
            const stamp = postedIso(job.published_at);
            const age = stamp ? now - Date.parse(stamp) : Infinity;
            if (!stamp || age < 0 || age > 30 * 86400000) { const reason = !stamp ? 'missing_date' : age < 0 ? 'future_date' : 'stale_date'; row.excluded[reason] = (row.excluded[reason] || 0) + 1; continue; }
            if (!job.title || !job.apply_url || isBannedJobTitle(job.title)) { row.excluded.role_policy = (row.excluded.role_policy || 0) + 1; continue; }
            if (seen.has(job.external_id)) continue;
            seen.add(job.external_id);
            const location = /\bremote\b/i.test(job.location) ? job.location : `Remote${job.location ? ` — ${job.location}` : ''}`;
            const record = decorate({
              source: job.source, external_id: job.external_id, title: job.title.trim(), company: company.name,
              company_logo: null, location, job_type: job.job_type || null, salary: null,
              description: job.description || null, apply_url: job.apply_url, category: job.category || null,
              published_at: stamp, synced_at: new Date(now).toISOString(), tags: [`ai100:${company.id}`],
              dedup_hash: createHash('md5').update(`${company.name.toLowerCase().trim()}|${job.title.toLowerCase().trim()}`).digest('hex'),
            });
            allJobs.push(record); row.candidates++;
          }
        } catch (error) { row.errors.push({ source: identity, error: error.message }); }
      }
      if (row.boards.length) row.status = row.errors.length ? 'partial_source_failure' : row.candidates ? 'ready' : row.remote ? 'no_recent_eligible_remote_jobs' : 'no_remote_openings';
      else if (row.errors.length) row.status = 'source_failure';
      log(`AI100 ${JSON.stringify(row)}`);
    }
  }));
  const orderedCoverage = companies.map((company) => coverage.get(company.id));
  return { jobs: interleaveAiCompanies(allJobs), coverage: orderedCoverage };
}
