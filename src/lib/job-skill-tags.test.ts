import { it } from 'node:test';
import assert from 'node:assert/strict';
import { filterMeaningfulSkillTags } from './job-skill-tags';

it('does not expose employer-roster or publication metadata as job skills', () => {
  assert.deepEqual(filterMeaningfulSkillTags(['ai100:openai', 'source-jd', 'source-html', 'curated-jd', 'Python', 'python', 'SQL']), ['Python', 'SQL']);
});
