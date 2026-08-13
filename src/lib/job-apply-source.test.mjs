import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isCuratedJd,
  isPublicJobPage,
  shouldListJobOnBoard,
  shouldListJobOnCompanyHub,
} from '../../.github/scripts/lib/job-apply-source.mjs';

describe('public job gate', () => {
  it('treats uncurated rows as not public', () => {
    const job = { title: 'Engineer', tags: [], apply_url: 'https://boards.greenhouse.io/acme/jobs/1' };
    assert.equal(isCuratedJd(job.tags), false);
    assert.equal(isPublicJobPage(job), false);
    assert.equal(shouldListJobOnBoard({ ...job, published_at: new Date().toISOString() }), false);
    assert.equal(shouldListJobOnCompanyHub({ ...job, published_at: new Date().toISOString() }), true);
  });

  it('allows live curated paraphrases', () => {
    const job = {
      title: 'Engineer',
      tags: ['curated-jd'],
      apply_url: 'https://boards.greenhouse.io/acme/jobs/1',
      published_at: new Date().toISOString(),
    };
    assert.equal(isPublicJobPage(job), true);
    assert.equal(shouldListJobOnBoard(job), true);
    assert.equal(shouldListJobOnCompanyHub(job), true);
  });

  it('keeps closed curated pages as pages but not board listings', () => {
    const job = {
      title: 'Engineer',
      tags: ['curated-jd'],
      apply_url: 'https://boards.greenhouse.io/acme/jobs/1',
      published_at: '2020-01-01T00:00:00.000Z',
      created_at: '2020-01-01T00:00:00.000Z',
    };
    assert.equal(isPublicJobPage(job), true);
    assert.equal(shouldListJobOnBoard(job), false);
    assert.equal(shouldListJobOnCompanyHub(job), false);
  });
});
