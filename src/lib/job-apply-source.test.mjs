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

  it('treats an unloaded description as not a word-floor fail', () => {
    const job = {
      title: 'Engineer',
      tags: ['curated-jd'],
      apply_url: 'https://boards.greenhouse.io/acme/jobs/1',
      published_at: new Date().toISOString(),
    };
    assert.equal('description' in job, false);
    assert.equal(isPublicJobPage(job), true);
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

  it('rejects listing-page titles even when curated', () => {
    const job = {
      title: 'Permanent Jobs',
      tags: ['curated-jd'],
      apply_url: 'https://remoteok.com/remote-jobs/x',
      published_at: new Date().toISOString(),
    };
    assert.equal(isPublicJobPage(job), false);
    assert.equal(shouldListJobOnBoard(job), false);
    assert.equal(shouldListJobOnCompanyHub(job), false);
  });

  it('rejects Guardian / newspaper apply URLs even when curated', () => {
    const job = {
      title: 'Software Engineer',
      tags: ['curated-jd'],
      apply_url:
        'https://jobs.theguardian.com/job/10171527/early-careers-software-development-engineer-sales-engineering/',
      published_at: new Date().toISOString(),
    };
    assert.equal(isPublicJobPage(job), false);
    assert.equal(shouldListJobOnBoard(job), false);
  });

  it('rejects curated-jd bodies under 600 words', () => {
    const job = {
      title: 'Software Engineer',
      tags: ['curated-jd'],
      apply_url: 'https://boards.greenhouse.io/acme/jobs/1',
      published_at: new Date().toISOString(),
      description: Array.from({ length: 200 }, () => 'word').join(' '),
    };
    assert.equal(isPublicJobPage(job), false);
    assert.equal(shouldListJobOnBoard(job), false);
  });

  it('allows curated-jd bodies at the 600-word floor', () => {
    const job = {
      title: 'Software Engineer',
      tags: ['curated-jd'],
      apply_url: 'https://boards.greenhouse.io/acme/jobs/1',
      published_at: new Date().toISOString(),
      description: Array.from({ length: 600 }, () => 'word').join(' '),
    };
    assert.equal(isPublicJobPage(job), true);
    assert.equal(shouldListJobOnBoard(job), true);
  });

  it('rejects closed fellowship cycles even when curated', () => {
    const job = {
      title: 'AI Fellowship 2024',
      tags: ['curated-jd', 'fellowship'],
      source: 'fellowship-discover',
      apply_url: 'https://example.org/news/fellows-2024',
      published_at: new Date().toISOString(),
      description: Array.from({ length: 600 }, () => 'word').join(' '),
    };
    assert.equal(isPublicJobPage(job), false);
  });

  it('rejects generic employer labels even when curated', () => {
    const job = {
      title: 'Staff Software Engineer, AI Reliability Engineering',
      company: 'Other',
      tags: ['curated-jd'],
      apply_url: 'https://boards.greenhouse.io/acme/jobs/1',
      published_at: new Date().toISOString(),
      description: Array.from({ length: 600 }, () => 'word').join(' '),
    };
    assert.equal(isPublicJobPage(job), false);
  });
});
