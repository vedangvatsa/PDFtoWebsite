import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { exactJobRoute, legacyJobRoutes, type JobRouteRow } from './job-route-resolution';

function row(values: Partial<JobRouteRow>): JobRouteRow {
  return { id: 'job-1', company: 'OpenAI', company_key: 'openai', title: 'Software Engineer', external_id: null, slug: null, tags: [], created_at: '2026-10-01', ...values };
}

describe('bounded job URL resolution', () => {
  it('gives external IDs precedence over a colliding pretty slug', () => {
    const alias = row({ id: 'alias', slug: 'openai_swe' });
    const owner = row({ id: 'owner', external_id: 'openai_swe' });
    assert.equal(exactJobRoute([alias, owner], 'openai', 'swe')?.id, 'owner');
  });
  it('supports short identifiers and historical company prefixes', () => {
    const oxford = row({ company: 'University of Oxford', company_key: 'oxford', slug: 'university-of-oxford_ra' });
    assert.equal(exactJobRoute([oxford], 'oxford', 'ra')?.id, oxford.id);
    const aspen = row({ company: 'Aspen Institute', company_key: 'aspen', external_id: 'aspen' });
    assert.equal(exactJobRoute([aspen], 'aspen', 'aspen')?.id, aspen.id);
  });
  it('never resolves a short identifier belonging to another company', () => {
    const other = row({ company: 'Stripe', company_key: 'stripe', external_id: 'swe' });
    assert.equal(exactJobRoute([other], 'openai', 'swe'), null);
  });
  it('returns confirmed misses without prefix database queries', () => {
    assert.equal(exactJobRoute([row({ slug: 'openai_swe' })], 'openai', 'mkt'), null);
    assert.deepEqual(legacyJobRoutes([], 'openai', 'mkt'), []);
  });
  it('retains minted historical aliases only for potentially publishable rows', () => {
    const aspen = row({ company: 'Aspen Institute', company_key: 'aspen-institute', slug: 'aspen-institute_sci-e9', title: 'Science & Technology Policy Fellowship', tags: ['curated-jd'] });
    assert.equal(legacyJobRoutes([aspen], 'aspen', 'sci-tech').length, 1);
    assert.equal(legacyJobRoutes([{ ...aspen, tags: [] }], 'aspen', 'sci-tech').length, 0);
  });
});
