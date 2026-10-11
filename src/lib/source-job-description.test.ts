import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { originalDescriptionText, sourceDescriptionHtml, sourcePublicationPatch, sourceDescriptionValid, SOURCE_DESCRIPTION_MAX_BYTES } from './source-job-description.mjs';
import { isPublicJobPage, shouldListJobOnBoard } from './job-apply-source';
import { isPublicJobPage as scriptPublicPage } from '../../.github/scripts/lib/job-apply-source.mjs';
import { jobQualifiesForSitemap } from './job-assemble';
import { publishSafeDescription, toJobDetail, buildJobJsonLd, type JobRow } from './job-detail-data';

const original = `About the role\n\nWe leverage our distributed systems experience to build dependable developer tools — with small teams and direct customer feedback. You will maintain our API, investigate production issues, review code, write automated tests, and explain technical decisions to your colleagues.\n\nRequirements\n\n- Experience with TypeScript and SQL.\n- Ability to document and debug software.\n\nSalary: $120,000–$150,000.\nWe are an equal opportunity employer.`;
const job: JobRow = {
  id: 'test-job', title: 'Software Engineer', company: 'Example Labs', company_logo: null,
  location: 'Remote, US', job_type: 'full_time', salary: null, tags: ['curated-jd', 'source-jd'],
  apply_url: 'https://jobs.lever.co/example/123', category: 'Engineering', source: 'lever',
  published_at: new Date().toISOString(), created_at: new Date().toISOString(),
  description: original, external_id: 'example-labs_swe', slug: 'example-labs_swe',
};

describe('original employer descriptions', () => {
  it('preserves wording, punctuation and paragraphs while removing executable HTML', () => {
    assert.equal(originalDescriptionText({ html: '<h2>Requirements</h2><p>We leverage C++ &amp; SQL — 5+ years.</p><ul><li>Build APIs.</li></ul><script>steal()</script><style>body{display:none}</style>' }),
      'Requirements\n\nWe leverage C++ & SQL — 5+ years.\n\n- Build APIs.');
    assert.equal(originalDescriptionText({ html: '&lt;p&gt;Hello &amp; welcome &#x1F680;&lt;/p&gt;' }), 'Hello & welcome 🚀');
    assert.equal(originalDescriptionText({ plain: original }), original);
  });
  it('escapes source text instead of applying the editorial rewrite formatter', async () => {
    const published = await publishSafeDescription(job, job.location!);
    assert.equal(published.kind, 'source');
    assert.equal(published.plain, original);
    assert.match(published.html, /We leverage/);
    assert.match(published.html, /—/);
    assert.match(published.html, /equal opportunity employer/);
    assert.equal(sourceDescriptionHtml('<img src=x onerror=alert(1)>'), '<p>&lt;img src=x onerror=alert(1)&gt;</p>');
  });
  it('publishes verified originals under 600 words consistently across consumers', () => {
    assert.equal(isPublicJobPage(job), true);
    assert.equal(scriptPublicPage(job), true);
    assert.equal(shouldListJobOnBoard(job), true);
    assert.equal(jobQualifiesForSitemap(job), true);
    for (const description of [null, '', 'Apply here']) {
      assert.equal(isPublicJobPage({ ...job, description }), false);
      assert.equal(scriptPublicPage({ ...job, description }), false);
      assert.equal(jobQualifiesForSitemap({ ...job, description }), false);
    }
    assert.equal(isPublicJobPage({ ...job, description: undefined }), true, 'slim list projection');
    assert.equal(isPublicJobPage({ ...job, tags: ['source-jd'] }), false, 'unverified marker alone');
    assert.equal(isPublicJobPage({ ...job, tags: ['curated-jd'] }), false, 'legacy rewrite floor retained');
    assert.equal(shouldListJobOnBoard({ ...job, created_at: '2020-01-01', published_at: '2020-01-01' }), false);
  });
  it('rejects oversized originals without truncating or adding a publication tag', () => {
    const oversized = original.repeat(100);
    assert.ok(Buffer.byteLength(oversized) > SOURCE_DESCRIPTION_MAX_BYTES);
    assert.equal(sourceDescriptionValid(oversized), false);
    assert.equal(sourcePublicationPatch(job, oversized), null);
    const patch = sourcePublicationPatch({ tags: ['TypeScript'] }, original)!;
    assert.equal(patch.description, original);
    assert.deepEqual(patch.tags, ['TypeScript', 'curated-jd', 'source-jd']);
  });
  it('uses the same complete description in the page, API and JobPosting schema', async () => {
    const long = `${original}\n\n${'Employer-supplied details. '.repeat(400)}\n\nFinal application instructions.`;
    const record = { ...job, description: long };
    const detail = await toJobDetail(record);
    assert.equal(detail.description_plain, long);
    assert.equal(detail.is_indexable, true);
    const schema = buildJobJsonLd(record, detail, 'https://cvin.bio');
    assert.ok(schema);
    assert.equal(schema.description, detail.description_html);
    assert.match(String(schema.description), /Final application instructions/);
  });
});
