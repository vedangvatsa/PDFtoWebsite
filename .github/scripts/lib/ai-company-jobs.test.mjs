import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AI_COMPANIES, AI_SOURCES, collectAiCompanyJobs, createAiFeedReader, interleaveAiCompanies, isExplicitlyRemote, postedIso } from './ai-company-jobs.mjs';
import { completeJobCandidates } from './complete-job-intake.mjs';
import { pageData, validBoard, workdaySource } from './public-ats-data.mjs';

describe('AI employer roster and remote-only intake', () => {
  it('covers exactly 100 unique reviewed employers and does not ingest guessed boards', async () => {
    assert.equal(AI_COMPANIES.length, 100);
    assert.equal(new Set(AI_COMPANIES.map((company) => company.id)).size, 100);
    assert.deepEqual(Object.keys(AI_SOURCES.boards).sort(), AI_COMPANIES.map((company) => company.id).sort());
    const result = await collectAiCompanyJobs({ companies: [{ id: 'unmapped', candidateBoards: ['ashby:guessed'] }], sources: {}, readFeed: () => { throw new Error('Must not probe a guess'); }, log: () => {} });
    assert.equal(result.coverage[0].status, 'unmapped_source');
  });
  it('requires explicit remote evidence and rejects hybrid, negated and missing locations', () => {
    for (const location of ['', 'Worldwide', 'Global', 'Anywhere', 'Remote, hybrid', 'Non-remote', 'Remote not available', 'Onsite — remote occasionally', 'Not remote']) assert.equal(isExplicitlyRemote({ location }), false, location);
    for (const location of ['US, CA, Remote', 'Remote — EMEA', 'Work from home', 'WFH UK']) assert.equal(isExplicitlyRemote({ location }), true, location);
    assert.equal(isExplicitlyRemote({ location: 'Remote', workplaceType: 'Hybrid', isRemote: true }), false);
    assert.equal(isExplicitlyRemote({ location: 'Remote', workplaceType: 'IN_OFFICE' }), false);
    assert.equal(isExplicitlyRemote({ location: 'Remote', isRemote: false }), false);
    assert.equal(isExplicitlyRemote({ location: 'London', workplaceType: 'Remote' }), true);
  });
  it('never synthesizes dates from relative text or numeric strings', () => {
    for (const value of [null, 'Today', 'Posted 2 Days Ago', 'yesterday', '12', 'invalid']) assert.equal(postedIso(value), null);
    assert.equal(postedIso('2026-10-11'), '2026-10-11T00:00:00.000Z');
    assert.equal(postedIso(1791676800), '2026-10-11T00:00:00.000Z');
  });
  it('keeps source failures, no openings, stale dates and candidate jobs distinct', async () => {
    const ids = ['ready', 'empty', 'stale', 'failed'];
    const result = await collectAiCompanyJobs({ companies: ids.map((id) => ({ id, name: id })), sources: Object.fromEntries(ids.map((id) => [id, [id]])), now: Date.parse('2026-10-11T12:00:00Z'), log: () => {}, readFeed: async (id) => {
      if (id === 'failed') throw new Error('HTTP 429');
      if (id === 'empty') return { total: 0, jobs: [] };
      if (id === 'stale') return { total: 100, remoteExcluded: 10, excluded: { stale_display_date: 10 }, jobs: [] };
      return { total: 5, jobs: [
        { external_id: 'a', title: 'Engineer', location: 'Remote US', published_at: '2026-10-11', apply_url: 'https://example.com/a' },
        { external_id: 'b', title: 'Engineer', location: 'Remote US', published_at: null, apply_url: 'https://example.com/b' },
        { external_id: 'c', title: 'Engineer', location: 'Remote US', published_at: '2026-08-01', apply_url: 'https://example.com/c' },
        { external_id: 'd', title: 'Engineer', location: 'Remote US', published_at: '2026-12-01', apply_url: 'https://example.com/d' },
        { external_id: 'e', title: 'Engineer', location: 'London', published_at: '2026-10-11', apply_url: 'https://example.com/e' },
      ] };
    } });
    assert.deepEqual(result.coverage.map((row) => row.status), ['ready', 'no_remote_openings', 'no_recent_eligible_remote_jobs', 'source_failure']);
    assert.equal(result.jobs.length, 1);
    assert.deepEqual(result.coverage[0].excluded, { missing_date: 1, stale_date: 1, future_date: 1, not_remote: 1 });
    assert.equal(result.coverage[2].remote, 10);
  });
  it('interleaves smaller employers before a large feed fills a bounded admission', async () => {
    const input = ['a', 'a', 'a', 'b', 'c'].map((company, i) => ({ company, tags: [`ai100:${company}`], external_id: String(i), published_at: '2026-10-11' }));
    const jobs = interleaveAiCompanies(input);
    assert.deepEqual(jobs.map((job) => job.company), ['a', 'b', 'c', 'a', 'a']);
    const outcomes = [];
    const admitted = await completeJobCandidates(jobs, { limit: 3, fetchOriginal: async () => ({ ok: true, html: `<p>${'original employer wording '.repeat(20)}</p>` }), onOutcome: (job, outcome) => outcomes.push([job.company, outcome]) });
    assert.deepEqual(admitted.jobs.map((job) => job.company), ['a', 'b', 'c']);
    assert.equal(outcomes.filter(([, outcome]) => outcome === 'capacity_deferred').length, 2);
  });
});

describe('verified public ATS feed adapters', () => {
  it('encodes dotted and spaced boards without allowing traversal or unknown providers', async () => {
    for (const board of ['../private', 'a/b', 'a?b', '..', 'a..b']) assert.equal(validBoard(board), false);
    const requests = [];
    const reader = createAiFeedReader(async (url) => { requests.push(url); return Response.json({ jobs: [] }); });
    await reader('ashby:Jasper AI');
    await reader('ashby:qdrant.tech');
    assert.match(requests[0], /Jasper%20AI$/);
    assert.match(requests[1], /qdrant\.tech$/);
    await assert.rejects(reader('ashby:../private'), /Invalid/);
    await assert.rejects(reader('unknown:example'), /Unsupported/);
    assert.throws(() => workdaySource('evil.example/tenant/site'), /Invalid/);
  });
  it('preserves EU Greenhouse authority in the apply URL for original verification', async () => {
    const read = createAiFeedReader(async (url) => {
      assert.match(url, /^https:\/\/boards-api\.greenhouse\.io\//);
      return Response.json({ jobs: [{ id: 123, title: 'Engineer', updated_at: '2026-10-10', location: { name: 'Remote UK' }, absolute_url: 'https://company.example/custom' }] });
    });
    assert.equal((await read('greenhouse-eu:example')).jobs[0].apply_url, 'https://job-boards.eu.greenhouse.io/example/jobs/123');
  });
  it('uses Workday remote facets and absolute detail dates, never relative list dates', async () => {
    const bodies = [];
    const reader = createAiFeedReader(async (url, options) => {
      if (url.endsWith('/jobs')) {
        const body = JSON.parse(options.body); bodies.push(body);
        if (!Object.keys(body.appliedFacets).length) return Response.json({ total: 900, facets: [{ values: [{ facetParameter: 'locations', values: [{ descriptor: 'US Remote', id: 'remote-id' }, { descriptor: 'Office', id: 'office-id' }] }] }] });
        return Response.json({ total: 2, jobPostings: [{ externalPath: '/job/US/Engineer_JR123', postedOn: 'Posted Today' }, { externalPath: '/job/US/Old_JR124', postedOn: 'Posted 30+ Days Ago' }] });
      }
      assert.match(url, /\/job\/US\/Engineer_JR123$/);
      return Response.json({ jobPostingInfo: { jobReqId: 'JR123', title: 'Engineer', location: 'US, Remote', additionalLocations: ['Office'], startDate: '2026-10-10', jobDescription: '<p>Original</p>' } });
    });
    const feed = await reader('workday:example.wd1.myworkdayjobs.com/example/Careers');
    assert.deepEqual(bodies[1].appliedFacets, { locations: ['remote-id'] });
    assert.equal(feed.jobs[0].published_at, '2026-10-10T00:00:00.000Z');
    assert.equal(feed.jobs[0].location, 'US, Remote');
    assert.equal(feed.remoteExcluded, 1);
  });
  it('fails visibly on incomplete Workable pages and invalid response shapes', async () => {
    await assert.rejects(createAiFeedReader(async () => Response.json({ results: [], total: 100 }))('workable:example'), /Incomplete/);
    await assert.rejects(createAiFeedReader(async () => Response.json({ error: 'no data' }))('ashby:example'), /Invalid/);
    await assert.rejects(createAiFeedReader(async () => new Response(null, { status: 429 }))('lever:example'), /429/);
  });
  it('requests Gem details only for remote roles and preserves original sections', async () => {
    let calls = 0;
    const reader = createAiFeedReader(async (url, options) => {
      assert.equal(url, 'https://jobs.gem.com/api/public/graphql/batch'); calls++;
      const operation = JSON.parse(options.body)[0];
      if (!operation.variables.extId) return Response.json([{ data: { oatsExternalJobPostings: { jobPostings: [
        { extId: 'remote', title: 'Engineer', locations: [{ name: 'US', isRemote: true }], job: { locationType: 'REMOTE' } },
        { extId: 'office', locations: [{ name: 'US', isRemote: false }], job: { locationType: 'IN_OFFICE' } },
      ] } } }]);
      assert.equal(operation.variables.extId, 'remote');
      return Response.json([{ data: { oatsExternalJobPosting: { extId: 'remote', title: 'Engineer', locations: [{ name: 'US', isRemote: true }], job: { locationType: 'REMOTE' }, firstPublishedTsSec: 1791676800, descriptionHtml: '<p>Body</p>', jobPostSectionHtml: { introHtml: '<p>Intro</p>', outroHtml: '<p>Outro</p>' } } } }]);
    });
    const feed = await reader('gem:example');
    assert.equal(calls, 2);
    assert.equal(feed.jobs[0].description, '<p>Intro</p>\n<p>Body</p>\n<p>Outro</p>');
  });
  it('parses linked-data graphs without executing script contents', () => {
    const data = pageData('<script>throw new Error("never evaluated")</script><script type="application/ld+json">{"@graph":[{"@type":"JobPosting","title":"Engineer"}]}</script>');
    assert.equal(data.postings[0].title, 'Engineer');
  });
});
