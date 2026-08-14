import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isBannedJobTitle } from './banned-jobs.mjs';

describe('listing-page titles are banned', () => {
  for (const title of [
    'Permanent Jobs',
    'Wanted Jobs',
    'Jobs',
    'Job',
    'Open Vacancies',
    'Open Positions',
    'NOW HIRING',
    'Job Title',
    'Test Job 3',
    'Multiple Positions',
    'CURRENT JOBS OPENING',
    'Vacancies Australia',
    'Hiring Process',
    'Now Hiring in Canada – Roofers',
    'Commercial Roofers',
  ]) {
    it(`bans ${JSON.stringify(title)}`, () => {
      assert.equal(isBannedJobTitle(title), true, title);
    });
  }

  for (const title of [
    'Software Engineer',
    'Background job monitoring',
    'Staff Product Manager',
    'AI Fellowship',
    'Now Hiring Commercial and Industrial Electrical Project Manager for Data Centers',
  ]) {
    it(`keeps ${JSON.stringify(title)}`, () => {
      assert.equal(isBannedJobTitle(title), false, title);
    });
  }
});
