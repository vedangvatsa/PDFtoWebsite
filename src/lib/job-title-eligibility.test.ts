import { it } from 'node:test';
import assert from 'node:assert/strict';
import { isGarbageJobTitle } from './job-description';
import { shouldListLiveJobCard } from './job-apply-source';

it('keeps genuine community roles while rejecting navigation and talent-pool signups', () => {
  const job = { company: 'StackBlitz', location: 'Remote', apply_url: 'https://job-boards.greenhouse.io/stackblitz/jobs/123', published_at: new Date().toISOString(), tags: ['source-jd', 'source-html', 'curated-jd'] };
  for (const title of ['Community Manager', 'Community Lead', 'Community Engineer']) {
    assert.equal(isGarbageJobTitle(title), false, title);
    assert.equal(shouldListLiveJobCard({ ...job, title }), true, title);
  }
  for (const title of ['Community', 'Community news', 'Community Dec 3']) assert.equal(isGarbageJobTitle(title), true, title);
  for (const title of ['Talent Community', 'Join our Talent Pool', 'General Application']) assert.equal(shouldListLiveJobCard({ ...job, title }), false, title);
});
