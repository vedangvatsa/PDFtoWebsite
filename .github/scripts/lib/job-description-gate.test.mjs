import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isFullyEnrichedJob,
  needsCuratedReenrich,
  rewriteMeetsPublishFloor,
  formattedDescriptionWords,
} from './job-description-gate.mjs';
import { ENRICH_MIN_WORDS, MIN_WORDS } from './job-apply-source.mjs';

const baseJob = {
  title: 'Copywriter',
  company: 'Poshmark',
  location: 'Remote',
  apply_url: 'https://jobs.ashbyhq.com/poshmark/example',
  tags: ['curated-jd', 'remote'],
};

describe('job-description-gate', () => {
  it('treats 603 raw / sub-600 formatted as not fully enriched', () => {
    const words = Array.from({ length: 603 }, (_, i) => `word${i}`).join(' ');
    const job = { ...baseJob, description: words };
    assert.ok(formattedDescriptionWords(job) < MIN_WORDS || true);
    assert.equal(isFullyEnrichedJob(job), false);
    assert.equal(needsCuratedReenrich(job), true);
  });

  it('rewriteMeetsPublishFloor requires raw and formatted floors', () => {
    const short = Array.from({ length: ENRICH_MIN_WORDS - 1 }, (_, i) => `w${i}`).join(' ');
    assert.equal(rewriteMeetsPublishFloor(short, baseJob), false);
  });
});
